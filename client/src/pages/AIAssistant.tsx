import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, FileUp, Sparkles, Bot, User, Loader2, X, 
  FileText, History, Settings, Type, Languages, 
  ChevronRight, Trash2, Plus, MessageSquare, List,
  BookOpen, Info, CheckCircle2, Sliders, Check, RefreshCw
} from 'lucide-react';
import { generateAIResponse, extractTopics } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  collection, addDoc, query, where, orderBy, 
  onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: any;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: any;
  messages: Message[];
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'أهلاً بك! أنا **Med-X**، دليلك الطبي الذكي. ارفع ملف المحاضرة وسأقوم بتحليله وشرحه لك بأفضل طريقة ممكنة.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('جاري المعالجة...');
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, type: string } | null>(null);
  const [fontSize, setFontSize] = useState(Number(localStorage.getItem('assistant-font-size')) || 16);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Workflow states
  const [workflowStep, setWorkflowStep] = useState<'chat' | 'topics'>('chat');
  const [extractedTopics, setExtractedTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<{ depth: string, language: string }>({
    depth: 'medium',
    language: 'ar-en'
  });

  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync font size
  useEffect(() => {
    localStorage.setItem('assistant-font-size', fontSize.toString());
  }, [fontSize]);

  // Load History
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'assistant_chats'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      
      chats.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });

      setHistory(chats);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, workflowStep, loading]);

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
          setWorkflowStep('topics');
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
        // We don't toast error here to avoid interrupting the user's AI experience
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
    <div className="w-full max-w-[98%] mx-auto h-[calc(100vh-120px)] flex gap-4 animate-in fade-in duration-500 overflow-hidden pb-4 relative">
      
      {/* Sidebar - History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 bg-card border-2 border-border rounded-[2rem] flex flex-col overflow-hidden shadow-2xl z-20"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="font-black text-lg">سجل المحادثات</h2>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowHistory(false)} className="rounded-full">
                <X size={20} />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Button onClick={() => { setMessages([]); setCurrentSessionId(null); setWorkflowStep('chat'); }} className="w-full justify-start gap-3 rounded-2xl h-14 bg-primary/10 hover:bg-primary/20 text-primary border-none font-bold">
                <Plus size={20} /> محادثة جديدة
              </Button>
              {history.map(session => (
                <div key={session.id} onClick={() => { setMessages(session.messages); setCurrentSessionId(session.id); setShowHistory(false); setWorkflowStep('chat'); }} className={cn("group p-4 rounded-2xl cursor-pointer border-2 transition-all", currentSessionId === session.id ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/20 border-transparent hover:border-primary/30")}>
                  <h3 className="font-black text-sm truncate">{session.title}</h3>
                  <p className="text-[10px] opacity-70 truncate mt-1">{session.lastMessage}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <Card hoverable={false} className="flex-1 overflow-hidden flex flex-col border-2 rounded-[2.5rem] relative shadow-xl bg-background/50 backdrop-blur-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b-2 border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
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

        {/* Chat Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide bg-dot-pattern" style={{ fontSize: `${fontSize}px` }}>
          {workflowStep === 'chat' ? (
            <div className="space-y-8">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex items-start gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg", msg.role === 'ai' ? "bg-primary text-white" : "bg-secondary text-foreground")}>
                    {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className={cn("max-w-[85%] p-6 rounded-[2rem] leading-relaxed font-medium shadow-sm relative", msg.role === 'ai' ? "bg-[#1e293b]/80 rounded-tr-none border border-slate-700" : "bg-primary text-white rounded-tl-none")} dir="rtl" style={{ color: '#FFFFFF' }}>
                    {msg.role === 'ai' ? (
                      <div className="max-w-none text-white" style={{ color: '#FFFFFF' }}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]} 
                          components={{ 
                            strong: ({...props}) => <span style={{ color: '#3b82f6', fontWeight: 'bold' }} {...props} />,
                            p: ({...props}) => <p style={{ color: '#FFFFFF', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.8' }} {...props} />,
                            h1: ({...props}) => <h1 style={{ color: '#FFFFFF', fontWeight: '900', fontSize: '1.8rem', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }} {...props} />,
                            h2: ({...props}) => <h2 style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '1.5rem', marginBottom: '0.8rem' }} {...props} />,
                            h3: ({...props}) => <h3 style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '1.3rem', marginBottom: '0.6rem' }} {...props} />,
                            li: ({...props}) => <li style={{ color: '#FFFFFF', marginBottom: '0.5rem', listStyleType: 'disc', marginRight: '1.5rem' }} {...props} />,
                            table: ({...props}) => <div className="overflow-x-auto my-4"><table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #475569' }} {...props} /></div>,
                            td: ({...props}) => <td style={{ color: '#FFFFFF', padding: '12px', border: '1px solid #475569', textAlign: 'right' }} {...props} />,
                            th: ({...props}) => <th style={{ color: '#FFFFFF', padding: '12px', border: '1px solid #475569', backgroundColor: '#334155', fontWeight: 'bold', textAlign: 'right' }} {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : <div className="whitespace-pre-wrap font-bold" style={{ color: '#FFFFFF' }}>{msg.content}</div>}
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="bg-secondary/30 p-6 rounded-[2rem] rounded-tr-none border border-border flex flex-col gap-3 shadow-sm min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                      </div>
                      <span className="text-xs font-black text-primary uppercase tracking-widest">{loadingStatus}</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-1/2 h-full bg-primary"
                      />
                    </div>
                    <p className="text-[10px] opacity-60 font-bold">بانتظار استجابة محرك Med-X الذكي...</p>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
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
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-card/50 border-t-2 border-border backdrop-blur-xl">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence>
              {selectedFile && workflowStep === 'chat' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center justify-between p-4 bg-primary/5 border-2 border-primary/20 rounded-2xl shadow-lg mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary text-white rounded-xl shadow-md"><FileText size={20} /></div>
                    <div><span className="text-xs font-black block">{selectedFile.name}</span><span className="text-[10px] opacity-60 font-bold uppercase">Ready for analysis</span></div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"><X size={20} /></button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative flex items-center gap-4">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,image/*" />
              <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="p-5 bg-secondary/20 border-2 border-border rounded-3xl hover:bg-primary/10 hover:border-primary/40 transition-all disabled:opacity-50"><FileUp size={24} className="text-muted-foreground" /></button>
              <div className="relative flex-1 group">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendRequest())} placeholder="اسأل Med-X عن أي شيء في الطب..." className="w-full bg-secondary/20 border-2 border-border p-5 pr-14 rounded-[2rem] outline-none focus:border-primary focus:bg-card transition-all resize-none font-bold text-base h-[64px] flex items-center scrollbar-hide shadow-inner" dir="rtl" />
                <button onClick={handleSendRequest} disabled={loading || (!input.trim() && !selectedTopic)} className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"><Send size={20} className="rotate-180" /></button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Configuration Modal (Overlaid) */}
      <AnimatePresence>
        {configOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfigOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-card border-2 border-border rounded-[2.5rem] shadow-2xl overflow-hidden p-10">
              <div className="text-center space-y-4 mb-10">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"><Settings size={40} className="animate-spin-slow" /></div>
                <h2 className="text-3xl font-black">تخصيص الشرح</h2>
                <p className="text-muted-foreground font-bold truncate max-w-md mx-auto">{pendingMessage}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 font-black text-xs uppercase tracking-widest opacity-60"><BookOpen size={16} /> عمق الاستفاضة</label>
                  <div className="space-y-2">
                    {[{id:'detailed',l:'استفاضة كبيرة'},{id:'medium',l:'شرح متوسط'},{id:'short',l:'ملخص سريع'}].map(o=>(
                      <button key={o.id} onClick={()=>setConfig({...config,depth:o.id})} className={cn("w-full p-4 rounded-2xl border-2 text-right transition-all flex items-center gap-3", config.depth===o.id?"border-primary bg-primary/5":"border-border hover:bg-secondary/20")}>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", config.depth===o.id?"border-primary bg-primary":"border-muted-foreground")}>{config.depth===o.id && <Check size={14} className="text-white"/>}</div>
                        <span className="font-black text-sm">{o.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 font-black text-xs uppercase tracking-widest opacity-60"><Languages size={16} /> لغة الشرح</label>
                  <div className="space-y-2">
                    {[{id:'ar-en',l:'عربي + إنجليزي'},{id:'en',l:'English Only'}].map(o=>(
                      <button key={o.id} onClick={()=>setConfig({...config,language:o.id})} className={cn("w-full p-4 rounded-2xl border-2 text-right transition-all flex items-center gap-3", config.language===o.id?"border-primary bg-primary/5":"border-border hover:bg-secondary/20")}>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", config.language===o.id?"border-primary bg-primary":"border-muted-foreground")}>{config.language===o.id && <Check size={14} className="text-white"/>}</div>
                        <span className="font-black text-sm">{o.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <Button onClick={executeSend} className="flex-1 h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/20">ابدأ الشرح الآن</Button>
                <Button variant="ghost" onClick={()=>setConfigOpen(false)} className="h-16 px-8 rounded-2xl font-bold">إلغاء</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
