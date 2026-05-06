import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Upload, 
  ChevronRight, 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  X,
  Plus,
  Save,
  AlertTriangle
} from 'lucide-react';
import { generateAIExam } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { db } from '../lib/firebase';
import { collection, addDoc, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

interface AIQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function AIExamGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, type: string } | null>(null);

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

  const handleGenerate = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const loadingToast = toast.loading('AI is crafting your medical exam...');
    
    try {
      const result = await generateAIExam("Generate a high-yield medical exam from this file", {
        data: selectedFile.data,
        mimeType: selectedFile.type
      });
      
      if (Array.isArray(result)) {
        setQuestions(result);
        setExamTitle(selectedFile.name.split('.')[0] + " (AI Exam)");
        setStep(2);
        toast.success(`Generated ${result.length} professional MCQs!`, { id: loadingToast });
      }
    } catch (err) {
      toast.error('Generation failed. Please try again.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async () => {
    if (!user || questions.length === 0) return;
    setLoading(true);
    try {
      const examRef = await addDoc(collection(db, 'formal_exams'), {
        title: examTitle,
        subject,
        creatorId: user.uid,
        createdAt: Timestamp.now(), // Use Timestamp for startAt/endAt compatibility
        type: 'ai-generated',
        durationMinutes: Math.round(questions.length * 1.5),
        description: `امتحان تم توليده بالذكاء الاصطناعي يحتوي على ${questions.length} سؤال.`
      });

      const batch = writeBatch(db);
      questions.forEach((q) => {
        const qRef = doc(collection(db, 'questions'));
        batch.set(qRef, {
          formalExamId: examRef.id,
          text: q.question,
          options: q.options,
          correctAnswer: q.options[q.correctAnswer] || q.options[0],
          explanation: q.explanation || '',
          subject: subject || 'General',
          type: 'mcq',
          createdAt: Timestamp.now()
        });
      });
      
      await batch.commit();
      toast.success('Exam saved to your dashboard!');
      navigate('/admin');
    } catch (err) {
      toast.error('Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-lg ${step >= i ? 'bg-primary text-white scale-110 shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
              {step > i ? <CheckCircle2 size={24} /> : i}
            </div>
            {i === 1 && <div className={`w-20 h-1.5 rounded-full transition-all ${step > 1 ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-primary/10 text-primary rounded-[2rem] mb-4">
                <Sparkles size={40} className="animate-pulse" />
              </div>
              <h1 className="text-5xl font-black tracking-tight">AI Exam Generator</h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">
                Upload your lecture notes, medical papers, or images, and let our AI craft a high-yield professional MCQ exam for you.
              </p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-80 border-4 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center space-y-6 hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer overflow-hidden shadow-2xl shadow-primary/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner relative">
                {loading ? <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /> : <Upload size={48} />}
              </div>
              
              <div className="text-center relative">
                <p className="text-2xl font-black">{loading ? 'AI is working...' : (selectedFile ? selectedFile.name : 'Select your medical file')}</p>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2 opacity-60">PDF / JPG / PNG / TEXT</p>
              </div>

              {selectedFile && !loading && (
                <button 
                  onClick={handleGenerate}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 relative"
                >
                  <Sparkles size={24} />
                  Start AI Generation
                </button>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden" 
                accept=".pdf,image/*,.txt"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 pb-20"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border-2 border-border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16 blur-2xl" />
              <div className="space-y-2 relative">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:opacity-70 transition-all">
                  <ArrowLeft size={14} /> Back to upload
                </button>
                <h2 className="text-3xl font-black">Exam Preview</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/20">{questions.length} QUESTIONS</span>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-black rounded-full border border-amber-500/20 uppercase tracking-tighter">USMLE Style</span>
                </div>
              </div>
              <button 
                onClick={handleSaveExam}
                className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
              >
                <Save size={18} className="group-hover:rotate-12 transition-transform" /> Save Exam to Library
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Exam Title</label>
                <input 
                  type="text" 
                  value={examTitle}
                  onChange={e => setExamTitle(e.target.value)}
                  className="w-full bg-card border-2 border-border p-4 rounded-2xl outline-none focus:border-primary transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Subject Category</label>
                <select 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-card border-2 border-border p-4 rounded-2xl outline-none focus:border-primary transition-all font-bold appearance-none"
                >
                  <option value="">Select Subject</option>
                  <option value="Anatomy">Anatomy</option>
                  <option value="Physiology">Physiology</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="OB/GYN">OB/GYN</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => (
                <Card key={idx} className="p-8 rounded-[2.5rem] border-2 space-y-6 relative group hover:border-primary/30 transition-all shadow-sm">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {idx + 1}
                    </div>
                    <div className="space-y-6 flex-1">
                      <textarea
                        value={q.question}
                        onChange={(e) => {
                          const newQ = [...questions];
                          newQ[idx].question = e.target.value;
                          setQuestions(newQ);
                        }}
                        className="w-full text-xl font-bold leading-relaxed bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary outline-none transition-all resize-none min-h-[60px]"
                        dir="auto"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx}
                            className={cn(
                              "p-4 rounded-2xl border-2 text-sm font-bold transition-all flex items-center gap-3",
                              optIdx === q.correctAnswer 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" 
                                : "bg-muted/50 border-border text-muted-foreground"
                            )}
                          >
                            <input 
                              type="radio" 
                              name={`correct-${idx}`}
                              checked={optIdx === q.correctAnswer}
                              onChange={() => {
                                const newQ = [...questions];
                                newQ[idx].correctAnswer = optIdx;
                                setQuestions(newQ);
                              }}
                              className="w-4 h-4 accent-emerald-500 cursor-pointer"
                            />
                            <span className="opacity-40">{String.fromCharCode(65 + optIdx)}.</span> 
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newQ = [...questions];
                                newQ[idx].options[optIdx] = e.target.value;
                                setQuestions(newQ);
                              }}
                              className="w-full bg-transparent outline-none"
                              dir="auto"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                          <CheckCircle2 size={14} /> Explanation
                        </p>
                        <textarea
                          value={q.explanation}
                          onChange={(e) => {
                            const newQ = [...questions];
                            newQ[idx].explanation = e.target.value;
                            setQuestions(newQ);
                          }}
                          className="w-full text-sm font-medium leading-relaxed opacity-80 italic bg-transparent border-none outline-none resize-none min-h-[60px]"
                          dir="auto"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
