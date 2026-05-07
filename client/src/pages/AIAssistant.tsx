import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, User, Bot, Loader2, List, FileText, X, 
  ChevronRight, Settings, MessageSquare, Download, Share2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { generateAIResponse, extractTopics } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [workflowStep, setWorkflowStep] = useState<'initial' | 'topics' | 'chat'>('initial');
  const [extractedTopics, setExtractedTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, type: string } | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState({ depth: 'medium', language: 'ar-en' });
  const [fontSize, setFontSize] = useState(16);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (user && showHistory) {
      const fetchHistory = async () => {
        const q = query(
          collection(db, 'assistant_chats'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const snap = await getDocs(q);
        setChatHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchHistory();
    }
  }, [user, showHistory]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (readerEvent) => {
        const fileData = {
          name: file.name,
          data: readerEvent.target?.result as string,
          type: file.type
        };
        setSelectedFile(fileData);
        setLoading(true);
        setLoadingStatus('جاري استخراج المواضيع من الملف...');
        try {
          const topicsRaw = await extractTopics({ data: fileData.data, mimeType: fileData.type });
          const topics = topicsRaw.split('\n').filter((t: string) => t.trim().length > 0);
          setExtractedTopics(topics);
          
          // NEW: Auto-start general explanation
          setWorkflowStep('chat');
          setPendingMessage(`قم بتحليل هذا الملف بالكامل واشرح محتواه بشكل عام وشامل، مع ذكر أهم النقاط التي يتناولها.`);
          setConfigOpen(true);
        } catch (error) {
          toast.error('فشل استخراج المواضيع من الملف');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendRequest = () => {
    console.log("handleSendRequest called. Input:", input, "Topic:", selectedTopic);
    if (!input.trim() && !selectedTopic) return;
    setPendingMessage(input.trim() || `اشرح لي موضوع: ${selectedTopic}`);
    setConfigOpen(true);
  };

  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const executeSend = async () => {
    console.log("executeSend starting. PendingMessage:", pendingMessage);
    if (!pendingMessage) return;
    const msg = pendingMessage;
    
    setConfigOpen(false);
    setWorkflowStep('chat');
    setLoading(true);
    setLoadingStatus('Med-X يستعد للإجابة...');
    setInput('');

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // Dynamic loading messages
    const statusInterval = setInterval(() => {
      const statuses = [
        'جاري تحليل السؤال طبيًا...',
        'البحث عن أفضل المراجع العلمية...',
        'جاري صياغة الشرح المناسب...',
        'تنسيق الجداول والكلمات المفتاحية...',
        'جاري تجربة محرك ذكاء اصطناعي احتياطي...'
      ];
      setLoadingStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 4000);

    try {
      const response = await generateAIResponse(
        msg, 
        selectedFile ? { data: selectedFile.data, mimeType: selectedFile.type } : undefined, 
        config
      );
      console.log("AI Response successfully received. Content preview:", response.substring(0, 100));
      const aiMsg: Message = { role: 'ai', content: response, timestamp: new Date() };
      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);

      // Save to history (Non-blocking)
      try {
        if (user) {
          if (!currentSessionId) {
            const docRef = await addDoc(collection(db, 'assistant_chats'), {
              userId: user.uid,
              title: msg.substring(0, 30),
              lastMessage: response.substring(0, 100),
              messages: updatedMessages,
              timestamp: serverTimestamp()
            });
            setCurrentSessionId(docRef.id);
          } else {
            await updateDoc(doc(db, 'assistant_chats', currentSessionId), {
              messages: updatedMessages,
              lastMessage: response.substring(0, 100),
              timestamp: serverTimestamp()
            });
          }
        }
      } catch (dbError) {
        console.warn("Failed to save chat history to Firestore:", dbError);
      }
    } catch (error) {
      console.error("AI Assistant Critical Error:", error);
      toast.error('حدث خطأ أثناء معالجة طلبك');
    } finally {
      clearInterval(statusInterval);
      setLoading(false);
      setPendingMessage(null);
      setSelectedFile(null);
      setSelectedTopic(null);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)] mt-4">
      {/* Sidebar History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="h-full bg-card border-2 border-border rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 border-b-2 border-border flex items-center justify-between">
              <h2 className="font-black text-xl flex items-center gap-2"><MessageSquare className="text-primary" /> التاريخ</h2>
              <Button size="icon" variant="ghost" onClick={() => setShowHistory(false)}><X size={20} /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.map((chat) => (
                <button key={chat.id} onClick={() => { setMessages(chat.messages); setCurrentSessionId(chat.id); setWorkflowStep('chat'); }} className={cn("w-full p-4 rounded-2xl text-right transition-all border-2", currentSessionId === chat.id ? "bg-primary/10 border-primary" : "bg-secondary/20 border-transparent hover:border-border")}>
                  <div className="font-black text-sm mb-1 truncate">{chat.title}</div>
                  <div className="text-[10px] opacity-60 font-bold">{chat.timestamp?.toDate().toLocaleDateString('ar-EG')}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card hoverable={false} className="flex-1 overflow-hidden flex flex-col border-2 rounded-[2.5rem] relative shadow-xl bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b-2 border-border bg-card sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" onClick={() => setShowHistory(!showHistory)} className={cn("rounded-2xl transition-all", showHistory && "bg-primary text-white")}>
              <MessageSquare size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20"><Sparkles size={20} /></div>
              <div>
                <h1 className="text-xl font-black tracking-tight">Med-X Guide</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase opacity-60">Smart Medical Intelligence</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-border">
            {[12, 14, 16, 18, 20].map(size => (
              <button key={size} onClick={() => setFontSize(size)} className={cn("w-8 h-8 rounded-xl text-[10px] font-black", fontSize === size ? "bg-primary text-white shadow-md" : "hover:bg-secondary")}>{size}</button>
            ))}
          </div>
        </div>

        {/* Topics Quick Access (Only if file is uploaded) */}
        <AnimatePresence>
          {extractedTopics.length > 0 && workflowStep === 'chat' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-primary/5 border-b border-primary/20 p-3 overflow-hidden">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-4 py-1">
                <span className="text-[10px] font-black uppercase text-primary whitespace-nowrap bg-primary/10 px-3 py-1.5 rounded-lg">تعمق في موضوع:</span>
                {extractedTopics.map((topic, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setPendingMessage(`تعمق في شرح هذا الموضوع من الملف: ${topic}`);
                      setConfigOpen(true);
                    }}
                    className="whitespace-nowrap px-4 py-1.5 bg-card border border-border rounded-xl text-xs font-bold hover:border-primary hover:text-primary transition-all shadow-sm"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background relative" id="chat-container">
          {workflowStep === 'chat' ? (
            <div className="space-y-8" style={{ fontSize: `${fontSize}px` }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex w-full", msg.role === 'ai' ? "justify-start" : "justify-end")}>
                  <div className={cn("flex max-w-[85%] items-start gap-4", msg.role === 'ai' ? "flex-row" : "flex-row")}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md", msg.role === 'ai' ? "bg-primary text-white" : "bg-secondary text-foreground")}>
                      {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                    </div>
                    <div className={cn("p-6 rounded-2xl border-2 shadow-sm", msg.role === 'ai' ? "bg-card text-card-foreground border-border rounded-tl-none" : "bg-primary text-primary-foreground border-primary rounded-tr-none")} dir="rtl">
                      {msg.role === 'ai' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            components={{ 
                              strong: ({...props}) => <span className="text-primary font-black px-1" {...props} />,
                              p: ({...props}) => <p className="leading-relaxed mb-4 text-inherit" {...props} />,
                              h1: ({...props}) => <h1 className="font-black text-2xl mb-4 border-b pb-2 text-primary" {...props} />,
                              h2: ({...props}) => <h2 className="font-black text-xl mb-3 text-primary" {...props} />,
                              h3: ({...props}) => <h3 className="font-bold text-lg mb-2 text-primary" {...props} />,
                              table: ({...props}) => <div className="overflow-x-auto my-4 border-2 rounded-xl"><table className="w-full border-collapse" {...props} /></div>,
                              td: ({...props}) => <td className="p-3 border-2 text-right" {...props} />,
                              th: ({...props}) => <th className="p-3 border-2 bg-muted font-bold text-right" {...props} />
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : <div className="whitespace-pre-wrap font-bold text-inherit">{msg.content}</div>}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start items-start gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={20} />
                  </div>
                  <div className="bg-secondary/30 p-5 rounded-2xl border-2 border-border border-dashed">
                    <span className="text-primary font-black text-sm">{loadingStatus}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : workflowStep === 'topics' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-6 py-10 text-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><List size={40} /></div>
              <h2 className="text-3xl font-black">المواضيع المكتشفة</h2>
              <div className="grid grid-cols-1 gap-3 mt-8">
                {extractedTopics.map((topic, i) => (
                  <button key={i} onClick={() => { setSelectedTopic(topic); setPendingMessage(`اشرح لي موضوع: ${topic}`); setConfigOpen(true); }} className="p-5 bg-card border-2 border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-right flex items-center justify-between group font-black text-lg">{topic} <ChevronRight size={20} className="text-primary opacity-0 group-hover:opacity-100 transition-all" /></button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setWorkflowStep('chat')} className="font-bold opacity-60">إلغاء</Button>
            </motion.div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-8">
               <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                 <div className="relative w-32 h-32 bg-primary text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/40"><Sparkles size={60} className="animate-pulse" /></div>
               </div>
               <div className="space-y-4 max-w-xl">
                 <h2 className="text-4xl font-black">مرحباً بك في Med-X</h2>
                 <p className="text-lg font-bold opacity-60 leading-relaxed">أنا مساعدك الطبي الذكي. يمكنني شرح أي موضوع، تحليل ملفات الـ PDF، أو الإجابة على استفساراتك الطبية المعقدة.</p>
               </div>
               <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                 <button onClick={() => fileInputRef.current?.click()} className="p-6 bg-card border-2 border-border rounded-[2rem] hover:border-primary transition-all group flex flex-col items-center gap-3">
                   <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all"><FileText size={24} /></div>
                   <span className="font-black">تحليل ملف</span>
                 </button>
                 <button onClick={() => setWorkflowStep('chat')} className="p-6 bg-card border-2 border-border rounded-[2rem] hover:border-primary transition-all group flex flex-col items-center gap-3">
                   <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all"><MessageSquare size={24} /></div>
                   <span className="font-black">محادثة مباشرة</span>
                 </button>
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-card border-t-2 border-border">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence>
              {selectedFile && workflowStep === 'chat' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center justify-between p-4 bg-primary/5 border-2 border-primary/20 rounded-2xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary text-white rounded-xl"><FileText size={20} /></div>
                    <div><span className="text-xs font-black block">{selectedFile.name}</span><span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Ready for analysis</span></div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"><X size={20} /></button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative flex items-center gap-4">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,image/*" />
              <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="p-5 bg-secondary/30 border-2 border-border rounded-[2rem] hover:border-primary/40 transition-all disabled:opacity-50"><FileUp size={24} className="text-muted-foreground" /></button>
              <div className="relative flex-1 group">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendRequest())} placeholder="اسأل Med-X عن أي شيء في الطب..." className="w-full bg-secondary/30 border-2 border-border p-5 pr-14 rounded-[2rem] outline-none focus:border-primary focus:bg-card transition-all resize-none font-bold text-base h-[64px] flex items-center scrollbar-hide shadow-inner" dir="rtl" />
                <button onClick={handleSendRequest} disabled={loading || (!input.trim() && !selectedTopic)} className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"><Send size={20} className="rotate-180" /></button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Configuration Modal */}
      <AnimatePresence>
        {configOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfigOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-card border-2 border-border rounded-[2.5rem] shadow-2xl overflow-hidden p-10">
              <div className="text-center space-y-4 mb-10">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"><Settings size={40} className="animate-spin-slow" /></div>
                <h2 className="text-3xl font-black">تخصيص الشرح</h2>
                <p className="text-muted-foreground font-bold">حدد كيف تريد من Med-X أن يشرح لك المحتوى</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <label className="text-sm font-black uppercase opacity-60 tracking-widest block text-right">عمق الشرح</label>
                  <div className="grid gap-2">
                    {[
                      { id: 'simple', label: 'مختصر وجوهري', icon: '🎯' },
                      { id: 'medium', label: 'متوسط (شامل)', icon: '📚' },
                      { id: 'detailed', label: 'تفصيلي ممل', icon: '🧠' }
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setConfig({ ...config, depth: opt.id })} className={cn("p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between font-bold", config.depth === opt.id ? "border-primary bg-primary/5 text-primary shadow-inner" : "border-border hover:border-border/80")}>
                        <span>{opt.label}</span>
                        <span>{opt.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black uppercase opacity-60 tracking-widest block text-right">لغة الشرح</label>
                  <div className="grid gap-2">
                    {[
                      { id: 'ar-en', label: 'عربي + مصطلحات EN', icon: '🇸🇦' },
                      { id: 'en', label: 'English Only', icon: '🇺🇸' }
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setConfig({ ...config, language: opt.id })} className={cn("p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between font-bold", config.language === opt.id ? "border-primary bg-primary/5 text-primary shadow-inner" : "border-border hover:border-border/80")}>
                        <span>{opt.label}</span>
                        <span>{opt.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={executeSend} className="flex-1 h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/20">ابدأ الشرح الآن</Button>
                <Button variant="ghost" onClick={() => setConfigOpen(false)} className="h-16 px-8 rounded-2xl font-bold opacity-60">إلغاء</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FileUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M12 18v-6" />
      <path d="m9 15 3-3 3 3" />
    </svg>
  );
}
