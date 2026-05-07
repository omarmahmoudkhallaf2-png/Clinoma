import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, FileUp, Sparkles, Bot, User, Loader2, X, 
  FileText, History, Settings, Type, Languages, 
  ChevronRight, Trash2, Plus, MessageSquare, List,
  BookOpen, Info, CheckCircle2
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
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, type: string } | null>(null);
  const [fontSize, setFontSize] = useState(Number(localStorage.getItem('assistant-font-size')) || 16);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Workflow states
  const [workflowStep, setWorkflowStep] = useState<'chat' | 'topics' | 'config'>('chat');
  const [extractedTopics, setExtractedTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [config, setConfig] = useState<{ depth: string, language: string }>({
    depth: 'medium',
    language: 'ar-en'
  });

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
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      setHistory(chats);
    });

    return () => unsubscribe();
  }, [user]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, workflowStep]);

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

  const startExplaining = async () => {
    if (!selectedTopic) return;
    setWorkflowStep('chat');
    setLoading(true);

    const prompt = `اشرح لي موضوع: ${selectedTopic} من الملف المرفق.`;
    const userMsg: Message = { role: 'user', content: prompt, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      const response = await generateAIResponse(
        prompt, 
        selectedFile ? { data: selectedFile.data, mimeType: selectedFile.type } : undefined, 
        config
      );
      const aiMsg: Message = { role: 'ai', content: response, timestamp: new Date() };
      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);
      
      // Save to History
      if (user) {
        if (!currentSessionId) {
          const docRef = await addDoc(collection(db, 'assistant_chats'), {
            userId: user.uid,
            title: selectedTopic.replace(/^\d+\.\s*/, ''),
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
    } catch (error) {
      toast.error('حدث خطأ أثناء توليد الشرح');
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await generateAIResponse(input, undefined, config);
      const aiMsg: Message = { role: 'ai', content: response, timestamp: new Date() };
      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);

      if (user) {
        if (!currentSessionId) {
          const docRef = await addDoc(collection(db, 'assistant_chats'), {
            userId: user.uid,
            title: input.substring(0, 30),
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
    } catch (error) {
      toast.error('حدث خطأ أثناء معالجة طلبك');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setShowHistory(false);
    setWorkflowStep('chat');
  };

  const createNewChat = () => {
    setMessages([{ role: 'ai', content: 'أهلاً بك! أنا **Med-X**، دليلك الطبي الذكي. ارفع ملف المحاضرة وسأقوم بتحليله وشرحه لك بأفضل طريقة ممكنة.', timestamp: new Date() }]);
    setCurrentSessionId(null);
    setWorkflowStep('chat');
    setSelectedFile(null);
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
      await deleteDoc(doc(db, 'assistant_chats', id));
      if (currentSessionId === id) createNewChat();
    }
  };

  return (
    <div className="w-full max-w-[98%] mx-auto h-[calc(100vh-120px)] flex gap-4 animate-in fade-in duration-500 overflow-hidden pb-4">
      
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
              <Button 
                onClick={createNewChat}
                className="w-full justify-start gap-3 rounded-2xl h-14 bg-primary/10 hover:bg-primary/20 text-primary border-none shadow-none font-bold"
              >
                <Plus size={20} />
                محادثة جديدة
              </Button>
              
              {history.map(session => (
                <div 
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className={cn(
                    "group p-4 rounded-2xl cursor-pointer transition-all border-2",
                    currentSessionId === session.id 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-secondary/20 border-transparent hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs opacity-60 font-bold">
                      {new Date(session.timestamp?.seconds * 1000).toLocaleDateString('ar-EG')}
                    </span>
                    <button 
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/20 rounded-lg transition-all"
                    >
                      <Trash2 size={14} className={currentSessionId === session.id ? "text-white" : "text-rose-500"} />
                    </button>
                  </div>
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
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setShowHistory(!showHistory)}
              className={cn("rounded-2xl transition-all", showHistory && "bg-primary text-white hover:bg-primary")}
            >
              <MessageSquare size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                  Med-X <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Guide</span>
                </h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase opacity-60">Smart Medical Intelligence</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-border">
              <Type size={16} className="text-muted-foreground ml-2" />
              {[12, 14, 16, 18, 20].map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={cn(
                    "w-8 h-8 rounded-xl text-[10px] font-black transition-all",
                    fontSize === size ? "bg-primary text-white shadow-md" : "hover:bg-secondary"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide bg-dot-pattern"
          style={{ fontSize: `${fontSize}px` }}
        >
          {workflowStep === 'chat' && (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex items-start gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg",
                    msg.role === 'ai' ? "bg-primary text-white" : "bg-secondary text-foreground"
                  )}>
                    {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-6 rounded-[2rem] leading-relaxed font-medium shadow-sm relative group/msg",
                    msg.role === 'ai' 
                      ? "bg-secondary/30 text-foreground rounded-tr-none border border-border" 
                      : "bg-primary text-white rounded-tl-none shadow-primary/20"
                  )} dir="rtl">
                    {msg.role === 'ai' && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          toast.success('تم النسخ إلى الحافظة');
                        }}
                        className="absolute -left-12 top-2 p-2 bg-card border border-border rounded-xl opacity-0 group-hover/msg:opacity-100 transition-all hover:bg-primary hover:text-white"
                        title="نسخ النص"
                      >
                        <FileText size={16} />
                      </button>
                    )}
                    {msg.role === 'ai' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black prose-headings:text-primary prose-li:list-disc prose-table:border-2 prose-table:border-border prose-th:bg-primary/5 prose-td:p-3">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong: ({node, ...props}) => <span className="text-primary font-black px-1 rounded-sm bg-primary/5" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-bold">{msg.content}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Workflow Steps */}
          {workflowStep === 'topics' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto space-y-6 py-10 text-center"
            >
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <List size={40} />
              </div>
              <h2 className="text-3xl font-black">المواضيع العلمية المكتشفة</h2>
              <p className="text-muted-foreground font-bold">تم تحليل الملف بنجاح. اختر الموضوع الذي تريد البدء بشرحه:</p>
              <div className="grid grid-cols-1 gap-3 mt-8">
                {extractedTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedTopic(topic);
                      setWorkflowStep('config');
                    }}
                    className="p-5 bg-card border-2 border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-right flex items-center justify-between group"
                  >
                    <span className="font-black text-lg">{topic}</span>
                    <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setWorkflowStep('chat')} className="font-bold opacity-60">
                إلغاء والعودة للدردشة
              </Button>
            </motion.div>
          )}

          {workflowStep === 'config' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto space-y-10 py-10"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-500/10 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Settings size={40} className="animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-black">تخصيص الشرح</h2>
                <p className="text-muted-foreground font-bold">الموضوع: <span className="text-primary">{selectedTopic}</span></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 font-black text-sm uppercase tracking-widest opacity-60">
                    <BookOpen size={16} /> عمق الاستفاضة
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'detailed', label: 'استفاضة كبيرة', desc: 'يعرض كل شيء بالتفصيل' },
                      { id: 'medium', label: 'شرح متوسط', desc: 'يركز على النقاط المهمة' },
                      { id: 'short', label: 'ملخص سريع', desc: 'أهم المعلومات فقط' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setConfig({ ...config, depth: opt.id })}
                        className={cn(
                          "w-full p-4 rounded-2xl border-2 text-right transition-all flex items-start gap-4",
                          config.depth === opt.id ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border hover:bg-secondary/20"
                        )}
                      >
                        <div className={cn("w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center", config.depth === opt.id ? "border-primary bg-primary" : "border-muted-foreground")}>
                          {config.depth === opt.id && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <div>
                          <p className="font-black text-sm">{opt.label}</p>
                          <p className="text-[10px] opacity-60 font-bold">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 font-black text-sm uppercase tracking-widest opacity-60">
                    <Languages size={16} /> لغة الشرح
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'ar-en', label: 'عربي + إنجليزي', desc: 'شرح عربي مع مصطلحات علمية' },
                      { id: 'en', label: 'English Only', desc: 'Full English explanation' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setConfig({ ...config, language: opt.id })}
                        className={cn(
                          "w-full p-4 rounded-2xl border-2 text-right transition-all flex items-start gap-4",
                          config.language === opt.id ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border hover:bg-secondary/20"
                        )}
                      >
                        <div className={cn("w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center", config.language === opt.id ? "border-primary bg-primary" : "border-white")}>
                          {config.language === opt.id && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <div>
                          <p className="font-black text-sm">{opt.label}</p>
                          <p className="text-[10px] opacity-60 font-bold">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button onClick={startExplaining} className="flex-1 h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20">
                  ابدأ الشرح الآن
                </Button>
                <Button variant="outline" onClick={() => setWorkflowStep('topics')} className="h-16 px-8 rounded-2xl font-bold border-2">
                  تغيير الموضوع
                </Button>
              </div>
            </motion.div>
          )}

          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-secondary/30 p-5 rounded-[2rem] rounded-tr-none border border-border flex items-center gap-3 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs font-black animate-pulse uppercase tracking-widest opacity-60">
                  {workflowStep === 'topics' ? 'جاري استخراج المواضيع...' : 'Med-X يقوم بالتحليل...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-card/50 border-t-2 border-border backdrop-blur-xl">
          <div className="max-w-5xl mx-auto">
            {/* File Preview */}
            <AnimatePresence>
              {selectedFile && workflowStep === 'chat' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 bg-primary/5 border-2 border-primary/20 rounded-2xl shadow-lg mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary text-white rounded-xl shadow-md">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black block">{selectedFile.name}</span>
                      <span className="text-[10px] opacity-60 font-bold uppercase">Ready for analysis</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex items-center gap-4">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,image/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-5 bg-secondary/20 border-2 border-border rounded-3xl hover:bg-primary/10 hover:border-primary/40 transition-all shadow-sm group"
                title="ارفع ملف المحاضرة"
              >
                <FileUp className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              
              <div className="relative flex-1 group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="اسأل Med-X عن أي شيء في الطب..."
                  className="w-full bg-secondary/20 border-2 border-border p-5 pr-14 rounded-[2rem] outline-none focus:border-primary focus:bg-card transition-all resize-none font-bold text-base h-[64px] flex items-center scrollbar-hide shadow-inner"
                  dir="rtl"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
