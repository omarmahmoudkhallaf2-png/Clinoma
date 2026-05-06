import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileUp, Sparkles, Bot, User, Loader2, X, FileText } from 'lucide-react';
import { generateAIResponse } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'أهلاً بك! أنا مساعدك الطبي الذكي. ارفع ملف المحاضرة (PDF أو صورة) وسأقوم بشرحها لك بدقة.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, type: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setSelectedFile({
          name: file.name,
          data: readerEvent.target?.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const prompt = selectedFile 
        ? `بناءً على الملف المرفق (${selectedFile.name})، أجب على الآتي: ${input || 'اشرح لي محتوى هذا الملف بالتفصيل'}`
        : input;

      const response = await generateAIResponse(prompt, selectedFile ? { data: selectedFile.data, mimeType: selectedFile.type } : undefined);
      
      const aiMsg: Message = { role: 'ai', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setSelectedFile(null);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border-2 border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex items-center gap-4 relative">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">المساعد الطبي الذكي</h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-60">AI Study Assistant v3.0.9</p>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black border border-emerald-500/20 uppercase">Online</div>
          <div className="px-4 py-2 bg-indigo-500/10 text-indigo-600 rounded-xl text-[10px] font-black border border-indigo-500/20 uppercase">Gemini 3 Flash</div>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 overflow-hidden flex flex-col border-2 rounded-[3rem] relative shadow-2xl">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
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
                  "max-w-[80%] p-5 rounded-[2rem] text-sm leading-relaxed font-medium shadow-sm relative group/msg",
                  msg.role === 'ai' 
                    ? "bg-secondary/40 text-foreground rounded-tr-none border border-border" 
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
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black prose-headings:text-primary prose-li:list-disc">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-secondary/40 p-5 rounded-[2rem] rounded-tr-none border border-border flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs font-black animate-pulse uppercase tracking-widest opacity-60">جاري التحليل...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-secondary/10 border-t-2 border-border backdrop-blur-xl">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* File Preview */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 bg-card border-2 border-primary/20 rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex items-center gap-3">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,image/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-card border-2 border-border rounded-2xl hover:bg-primary/5 hover:border-primary/40 transition-all shadow-sm"
              >
                <FileUp className="w-6 h-6 text-muted-foreground" />
              </button>
              
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="اسأل المساعد الذكي عن أي شيء..."
                  className="w-full bg-card border-2 border-border p-4 pr-14 rounded-3xl outline-none focus:border-primary transition-all resize-none font-bold text-sm h-[56px] flex items-center scrollbar-hide"
                  dir="rtl"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || (!input.trim() && !selectedFile)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-[1.25rem] shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
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
