import { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp,
  query, orderBy, getDoc, where, Timestamp, updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Plus, Trash2, Copy, ExternalLink, Loader2, X,
  BookOpen, ChevronDown, ChevronUp, Check, Calendar, Clock, Lock, Unlock, Edit2, ImagePlus,
  Sparkles, Upload
} from 'lucide-react';
import { generateAIExam } from '../../lib/gemini';
import toast from 'react-hot-toast';

// Convert Firestore Timestamp → datetime-local string (local time, not UTC)
const tsToInput = (ts: Timestamp | null | undefined): string => {
  if (!ts) return '';
  const d = ts.toDate();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const toLocalInput = (ts: Timestamp | null | undefined): string => {
  if (!ts) return '';
  const d = ts.toDate();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const examStatus = (exam: any): 'upcoming' | 'open' | 'closed' | 'no-date' => {
  if (!exam.startAt && !exam.endAt) return 'no-date';
  const now = Date.now();
  const start = exam.startAt?.toDate?.().getTime() ?? 0;
  const end = exam.endAt?.toDate?.().getTime() ?? Infinity;
  if (now < start) return 'upcoming';
  if (now > end) return 'closed';
  return 'open';
};

const STATUS_BADGE: Record<string, string> = {
  'upcoming': 'bg-amber-500/10 text-amber-600 border-amber-400/30',
  'open': 'bg-emerald-500/10 text-emerald-600 border-emerald-400/30',
  'closed': 'bg-rose-500/10 text-rose-600 border-rose-400/30',
  'no-date': 'bg-secondary text-muted-foreground border-border',
};
const STATUS_LABEL: Record<string, string> = {
  'upcoming': '⏳ لم يبدأ بعد',
  'open': '🟢 جارٍ الآن',
  'closed': '🔴 انتهى',
  'no-date': '⚪ بدون جدول',
};

// ── Question Builder ──────────────────────────────────────────────────────────
function ExamQuestionBuilder({ examId, fetchExams }: { examId: string, fetchExams: () => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', imageUrl: '', explanation: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Resize if too large
        const MAX_DIM = 1000;
        if (width > height && width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Add white background in case of transparent PNG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Compress as JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        if (compressedBase64.length > 950000) {
          alert('الصورة معقدة وكبيرة جداً حتى بعد الضغط. يرجى استخدام صورة أبسط.');
          setUploadingImage(false);
          return;
        }
        
        setForm(prev => ({ ...prev, imageUrl: compressedBase64 }));
        setUploadingImage(false);
      };
      img.onerror = () => {
        alert('حدث خطأ أثناء معالجة الصورة');
        setUploadingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'questions'), where('formalExamId', '==', examId)));
    setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, [examId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const options = [form.optionA, form.optionB, form.optionC, form.optionD];
      const correctAnswer = options[['A', 'B', 'C', 'D'].indexOf(form.correctAnswer)];
      const questionData = {
        text: form.text, options, correctAnswer,
        imageUrl: form.imageUrl,
        explanation: form.explanation,
        formalExamId: examId, accessType: 'free', 
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'questions', editingId), questionData);
        toast.success('تم تحديث السؤال!');
      } else {
        await addDoc(collection(db, 'questions'), {
          ...questionData,
          createdAt: serverTimestamp()
        });
        toast.success('تم إضافة السؤال!');
      }

      setForm({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', imageUrl: '', explanation: '' });
      setEditingId(null);
      await fetchQuestions();
      fetchExams();
    } catch (err) {
      toast.error('فشل حفظ السؤال');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (q: any) => {
    const letters = ['A', 'B', 'C', 'D'];
    const correctIdx = q.options.indexOf(q.correctAnswer);
    setEditingId(q.id);
    setForm({
      text: q.text,
      optionA: q.options[0] || '',
      optionB: q.options[1] || '',
      optionC: q.options[2] || '',
      optionD: q.options[3] || '',
      correctAnswer: correctIdx !== -1 ? letters[correctIdx] : 'A',
      imageUrl: q.imageUrl || '',
      explanation: q.explanation || ''
    });
    // Scroll to form
    document.getElementById(`form-${examId}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAIUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    const loadingToast = toast.loading('جاري استخراج الأسئلة بالذكاء الاصطناعي...');

    try {
      const reader = new FileReader();
      const fileData = await new Promise<{data: string, type: string}>((resolve) => {
        reader.onload = (re) => resolve({ data: re.target?.result as string, type: file.type });
        reader.readAsDataURL(file);
      });

      const result = await generateAIExam("Extract medical MCQs from this file", [{ 
        data: fileData.data, 
        mimeType: fileData.type 
      }]);
      
      if (Array.isArray(result)) {
        setAiQuestions(result);
        setAiModalOpen(true);
        toast.success(`تم استخراج ${result.length} سؤال بنجاح!`, { id: loadingToast });
      }
    } catch (err) {
      toast.error('فشل استخراج الأسئلة. حاول مرة أخرى.', { id: loadingToast });
    } finally {
      setAiLoading(false);
    }
  };

  const importAIQuestions = async () => {
    setSaving(true);
    const loadingToast = toast.loading('جاري إضافة الأسئلة للاختبار...');
    try {
      const writeBatch = (await import('firebase/firestore')).writeBatch;
      const batch = writeBatch(db);
      
      aiQuestions.forEach((q) => {
        const qRef = doc(collection(db, 'questions'));
        batch.set(qRef, {
          text: q.question,
          options: q.options,
          correctAnswer: q.options[q.correctAnswer] || q.options[0],
          formalExamId: examId,
          explanation: q.explanation || '',
          accessType: 'free',
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
      setAiModalOpen(false);
      setAiQuestions([]);
      await fetchQuestions();
      fetchExams(); // Update the count in the main list
      toast.success(`تمت إضافة ${aiQuestions.length} سؤال بنجاح!`, { id: loadingToast });
    } catch (err) {
      toast.error('فشل حفظ الأسئلة', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const letters = ['A', 'B', 'C', 'D'];
  const optionKeys = ['optionA', 'optionB', 'optionC', 'optionD'] as const;

  return (
    <div className="space-y-6 pt-4 border-t-2 border-border mt-4">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> أسئلة الإختبار ({questions.length})
        </h4>
        
        <div className="flex gap-2">
          <input type="file" id={`ai-upload-${examId}`} className="hidden" accept=".pdf,image/*,.txt" onChange={handleAIUpload} />
          <button 
            type="button"
            onClick={() => document.getElementById(`ai-upload-${examId}`)?.click()}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={16} />}
            استخراج بالذكاء
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-3 p-4 bg-secondary/30 rounded-2xl border border-border group">
              <span className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-relaxed text-right line-clamp-2" dir="rtl">{q.text}</p>
                {q.imageUrl && <img src={q.imageUrl} alt="Question" className="h-16 w-auto mt-2 rounded-lg border border-border object-cover" />}
                <p className="text-xs text-emerald-600 font-bold mt-1">✓ {q.correctAnswer}</p>
                {q.explanation && <p className="text-[10px] text-muted-foreground mt-1 italic" dir="rtl line-clamp-1">{q.explanation}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleEditClick(q)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-xl" title="تعديل">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={async () => { if(confirm('هل أنت متأكد من الحذف؟')) { await deleteDoc(doc(db, 'questions', q.id)); fetchQuestions(); fetchExams(); } }}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form id={`form-${examId}`} onSubmit={handleAdd} className="space-y-4 bg-secondary/20 p-6 rounded-3xl border-2 border-dashed border-border relative">
        {editingId && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black animate-pulse">
            <Edit2 size={12} /> جاري التعديل حالياً
          </div>
        )}
        <p className="font-black text-sm text-muted-foreground uppercase tracking-widest">{editingId ? 'تحديث السؤال' : 'إضافة سؤال جديد'}</p>
        <textarea required value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
          placeholder="نص السؤال..." rows={2}
          className="w-full p-4 bg-card border-2 border-border rounded-2xl font-bold text-sm outline-none focus:border-primary text-right resize-none" dir="rtl" />
        
        <div className="space-y-2">
          <label className="block text-sm font-bold text-right">شرح الإجابة (اختياري)</label>
          <textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })}
            placeholder="اكتب شرحاً مبسطاً للطالب يظهر له بعد الانتهاء..." rows={2}
            className="w-full p-4 bg-card border-2 border-border rounded-2xl font-bold text-xs outline-none focus:border-primary text-right resize-none" dir="rtl" />
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-2 text-right">صورة السؤال (اختياري)</label>
          <div 
            className={`relative w-full min-h-[160px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 p-6 transition-all text-center group focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent outline-none
              ${uploadingImage ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary hover:bg-secondary/30'}
            `}
            tabIndex={0}
            onPaste={(e) => {
              const item = e.clipboardData.items[0];
              if (item?.type.includes('image')) {
                e.preventDefault();
                const blob = item.getAsFile();
                if (blob) handleImageUpload(blob);
              }
            }}
          >
            {uploadingImage ? (
              <>
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="font-black text-primary animate-pulse text-lg">جاري رفع الصورة...</p>
                <p className="text-muted-foreground font-bold text-sm">برجاء الانتظار ثواني معدودة</p>
              </>
            ) : form.imageUrl ? (
              <div className="relative w-full flex items-center justify-center">
                <img src={form.imageUrl} alt="Preview" className="max-h-64 object-contain rounded-xl shadow-md" />
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setForm(prev => ({ ...prev, imageUrl: '' })); }}
                  className="absolute -top-3 -right-3 p-2 bg-destructive text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                  title="حذف الصورة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <ImagePlus className="w-8 h-8" />
                </div>
                <p className="font-black text-lg">اضغط هنا أو قم بلصق الصورة <kbd className="font-mono bg-background px-2 py-1 rounded-lg border border-border text-sm mx-1 shadow-sm">Ctrl+V</kbd></p>
                <p className="text-muted-foreground font-bold text-sm">أو اضغط لاختيار ملف من جهازك</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = '';
                  }}
                />
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {optionKeys.map((key, i) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${form.correctAnswer === letters[i] ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'}`}>{letters[i]}</span>
              <input required value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={`الإختيار ${letters[i]}`}
                className="flex-1 p-3 bg-card border-2 border-border rounded-xl font-bold text-sm outline-none focus:border-primary text-right" dir="rtl" />
              <button type="button" onClick={() => setForm({ ...form, correctAnswer: letters[i] })}
                className={`p-2 rounded-xl transition-all ${form.correctAnswer === letters[i] ? 'bg-emerald-500 text-white' : 'bg-secondary hover:bg-emerald-500/20'}`}>
                <Check className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="text-sm font-bold text-muted-foreground">
          الإجابة الصحيحة: <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg font-black ml-2">
            {letters[['A', 'B', 'C', 'D'].indexOf(form.correctAnswer)]} — {form[optionKeys[['A', 'B', 'C', 'D'].indexOf(form.correctAnswer)]] || '...'}
          </span>
        </div>
        <div className="flex gap-3">
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', imageUrl: '', explanation: '' }); }}
              className="flex-1 py-3 bg-secondary text-foreground rounded-2xl font-black hover:bg-border transition-all">
              إلغاء التعديل
            </button>
          )}
          <button type="submit" disabled={saving}
            className={`flex-[2] py-3 text-white rounded-2xl font-black hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${editingId ? 'bg-indigo-600' : 'bg-primary'}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? <><Edit2 className="w-4 h-4" /> تحديث السؤال</> : <><Plus className="w-4 h-4" /> إضافة السؤال يدوياً</>}
          </button>
        </div>
      </form>

      {/* AI Preview Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl border-2 border-border overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-8 border-b border-border bg-secondary/30 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-2">
                  <Sparkles className="text-primary" /> مراجعة الأسئلة المستخرجة
                </h3>
                <p className="text-muted-foreground font-bold text-sm">راجع الأسئلة قبل إضافتها للاختبار</p>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="p-2 hover:bg-border rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {aiQuestions.map((q, idx) => (
                <div key={idx} className="p-6 bg-secondary/20 rounded-3xl border border-border space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black">{idx + 1}</span>
                    <input 
                      type="text" 
                      value={q.question} 
                      onChange={(e) => {
                        const newQs = [...aiQuestions];
                        newQs[idx].question = e.target.value;
                        setAiQuestions(newQs);
                      }}
                      className="flex-1 bg-transparent border-none font-bold text-lg focus:ring-0 text-right" dir="rtl"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div key={optIdx} className={`p-3 rounded-xl border flex items-center gap-2 ${optIdx === q.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700' : 'bg-card border-border'}`}>
                        <span className="text-xs font-black opacity-40">{String.fromCharCode(65 + optIdx)}.</span>
                        <input 
                          type="text" 
                          value={opt} 
                          onChange={(e) => {
                            const newQs = [...aiQuestions];
                            newQs[idx].options[optIdx] = e.target.value;
                            setAiQuestions(newQs);
                          }}
                          className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 text-right" dir="rtl"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-border bg-secondary/30 flex gap-4">
              <button onClick={() => setAiModalOpen(false)} className="flex-1 py-4 bg-secondary rounded-2xl font-black hover:bg-border transition-all">إلغاء</button>
              <button onClick={importAIQuestions} disabled={saving} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                إضافة الكل للاختبار ({aiQuestions.length} سؤال)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ExamManager ──────────────────────────────────────────────────────────
export default function ExamManager() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null); // null = create, object = edit
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { title: '', durationMinutes: '', description: '', startAt: '', endAt: '', status: 'draft' as 'draft' | 'published' };
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const examsSnap = await getDocs(query(collection(db, 'formal_exams'), orderBy('createdAt', 'desc')));
      const examsData = examsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Fetch counts for all exams
      const questionsSnap = await getDocs(collection(db, 'questions'));
      const counts: Record<string, number> = {};
      questionsSnap.docs.forEach(doc => {
        const eid = doc.data().formalExamId;
        if (eid) counts[eid] = (counts[eid] || 0) + 1;
      });

      setExams(examsData.map(e => ({ ...e, questionCount: counts[e.id] || 0 })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, 'formal_exams'), {
        title: form.title,
        description: form.description,
        durationMinutes: Number(form.durationMinutes) || null,
        startAt: form.startAt ? Timestamp.fromDate(new Date(form.startAt)) : null,
        endAt: form.endAt ? Timestamp.fromDate(new Date(form.endAt)) : null,
        status: 'draft', // Default to draft for safety
        createdAt: serverTimestamp()
      });
      setForm(emptyForm);
      setIsModalOpen(false);
      fetchExams();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'formal_exams', editingExam.id), {
        title: form.title,
        description: form.description,
        durationMinutes: Number(form.durationMinutes) || null,
        startAt: form.startAt ? Timestamp.fromDate(new Date(form.startAt)) : null,
        endAt: form.endAt ? Timestamp.fromDate(new Date(form.endAt)) : null,
        status: form.status
      });
      setEditingExam(null);
      setIsModalOpen(false);
      setForm(emptyForm);
      fetchExams();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const openCreate = () => {
    setEditingExam(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (exam: any) => {
    setEditingExam(exam);
    setForm({
      title: exam.title ?? '',
      durationMinutes: exam.durationMinutes ? String(exam.durationMinutes) : '',
      description: exam.description ?? '',
      startAt: tsToInput(exam.startAt),
      endAt: tsToInput(exam.endAt),
      status: exam.status || 'draft'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      // Delete all associated questions first
      const qSnap = await getDocs(query(collection(db, 'questions'), where('formalExamId', '==', id)));
      const deletePromises = qSnap.docs.map(d => deleteDoc(doc(db, 'questions', d.id)));
      await Promise.all(deletePromises);
      // Delete the exam itself
      await deleteDoc(doc(db, 'formal_exams', id));
      setConfirmDeleteId(null);
      fetchExams();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await updateDoc(doc(db, 'formal_exams', id), { status: newStatus });
      toast.success(newStatus === 'published' ? 'تم نشر الإختبار للجميع!' : 'تم تحويل الإختبار لمسودة');
      fetchExams();
    } catch (err) {
      toast.error('فشل تحديث حالة النشر');
    }
  };

  const getExamLink = (id: string) => `${window.location.origin}/exam/${id}`;
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(getExamLink(id));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const fmt = (ts: Timestamp | null | undefined) => {
    if (!ts) return '—';
    return ts.toDate().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black">إدارة الإختبارات الرسمية</h2>
          <p className="text-muted-foreground font-bold">حدد موعد الامتحان وأسئلته وأرسل الرابط للطلاب</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="w-5 h-5" /> إنشاء إختبار
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => {
            const status = examStatus(exam);
            return (
              <div key={exam.id} className={`bg-card border-2 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-lg ${status === 'open' ? 'border-emerald-400/40' : status === 'closed' ? 'border-rose-400/20' : 'border-border'}`}>
                <div className="p-6 flex items-center gap-4">
                  <button onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
                    className="flex items-center gap-4 flex-1 text-right min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${status === 'open' ? 'bg-emerald-500/10 text-emerald-600' : status === 'closed' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                      {status === 'closed' ? <Lock className="w-6 h-6" /> : status === 'open' ? <Unlock className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-black">{exam.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded-lg font-black border ${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        {exam.durationMinutes && (
                          <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} دقيقة
                          </span>
                        )}
                        {exam.startAt && (
                          <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" /> {fmt(exam.startAt)} — {fmt(exam.endAt)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                          <BookOpen className="w-3.5 h-3.5" /> {exam.questionCount || 0} أسئلة
                        </span>
                      </div>
                    </div>
                    <div className="text-muted-foreground flex-shrink-0">
                      {expandedExam === exam.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleTogglePublish(exam.id, exam.status)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all ${exam.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'}`} title={exam.status === 'published' ? 'إلغاء النشر' : 'نشر الإختبار'}>
                      {exam.status === 'published' ? <><Check className="w-4 h-4" /> منشور</> : <><Sparkles className="w-4 h-4" /> نشر</>}
                    </button>
                    <button onClick={() => openEdit(exam)}
                      className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all" title="تعديل الإختبار">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleCopy(exam.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all ${copied === exam.id ? 'bg-emerald-500 text-white' : 'bg-secondary hover:bg-border'}`}>
                      <Copy className="w-4 h-4" />
                      {copied === exam.id ? 'تم!' : 'نسخ'}
                    </button>
                    <button onClick={() => window.open(getExamLink(exam.id), '_blank')}
                      className="p-2 bg-secondary text-muted-foreground rounded-xl hover:bg-border transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDeleteId(exam.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="حذف الإختبار">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedExam === exam.id && (
                  <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
                    <ExamQuestionBuilder examId={exam.id} fetchExams={fetchExams} />
                  </div>
                )}
              </div>
            );
          })}

          {exams.length === 0 && (
            <div className="py-24 text-center space-y-4 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border">
              <div className="text-7xl">📝</div>
              <p className="text-xl font-black text-muted-foreground">لا توجد إختبارات بعد</p>
              <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-primary text-white rounded-2xl font-black">إنشاء أول إختبار</button>
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-[3rem] shadow-2xl border-2 border-border overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                {editingExam && <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Edit2 className="w-4 h-4" /></div>}
                <h2 className="text-xl font-black">{editingExam ? `تعديل: ${editingExam.title}` : 'إنشاء إختبار جديد'}</h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingExam(null); setForm(emptyForm); }} className="p-2 hover:bg-border rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={editingExam ? handleUpdate : handleCreate} className="p-8 space-y-6 overflow-y-auto flex-1">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-black text-muted-foreground block text-right">عنوان الإختبار *</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl font-bold outline-none focus:border-primary text-right" dir="rtl"
                  placeholder="مثال: إختبار منتصف الفصل - F1" />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-black text-muted-foreground block text-right">مدة الإختبار (دقائق)</label>
                <input type="number" min="1" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
                  className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl font-bold outline-none focus:border-primary text-right"
                  placeholder="30" />
              </div>

              {/* Date Range */}
              <div className="p-5 bg-secondary/20 rounded-3xl border-2 border-border space-y-4">
                <div className="flex items-center gap-2 text-sm font-black">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>الجدول الزمني للإختبار</span>
                </div>

                <div className="space-y-4">
                  {/* Start */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground block text-right">📅 تاريخ ووقت البدء</label>
                    <input
                      type="datetime-local"
                      value={form.startAt}
                      onChange={e => setForm({ ...form, startAt: e.target.value })}
                      className="w-full p-4 bg-card border-2 border-border rounded-2xl font-bold outline-none focus:border-emerald-500 transition-colors"
                    />
                    {form.startAt && (
                      <p className="text-xs font-bold text-emerald-600 text-right">
                        ✓ {new Date(form.startAt).toLocaleString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  {/* End */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted-foreground block text-right">🔒 تاريخ ووقت الإغلاق</label>
                    <input
                      type="datetime-local"
                      value={form.endAt}
                      onChange={e => setForm({ ...form, endAt: e.target.value })}
                      className="w-full p-4 bg-card border-2 border-border rounded-2xl font-bold outline-none focus:border-rose-500 transition-colors"
                    />
                    {form.endAt && (
                      <p className="text-xs font-bold text-rose-600 text-right">
                        ✓ {new Date(form.endAt).toLocaleString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground font-bold text-right bg-card p-3 rounded-xl border border-border">
                  💡 الطالب الداخل قبل وقت الإغلاق بفترة أقل من المدة سيُحسب له الوقت المتبقي فقط
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-black text-muted-foreground block text-right">وصف / تعليمات (اختياري)</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl font-bold outline-none focus:border-primary text-right" dir="rtl"
                  placeholder="تعليمات أو وصف للإختبار..." />
              </div>

              <button type="submit" disabled={saving}
                className={`w-full py-4 text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  editingExam ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-primary shadow-lg shadow-primary/20'
                }`}>
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingExam ? '💾 حفظ التعديلات' : '✨ إنشاء الإختبار'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDeleteId && (() => {
        const exam = exams.find(e => e.id === confirmDeleteId);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-sm rounded-[3rem] p-10 text-center space-y-6 border-2 border-rose-400/30 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black">حذف الإختبار؟</h3>
                <div className="p-4 bg-secondary rounded-2xl">
                  <p className="font-black text-lg">{exam?.title}</p>
                </div>
                <p className="text-muted-foreground font-bold text-sm">
                  سيتم حذف الإختبار وجميع أسئلته بشكل نهائي.<br />هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-black hover:bg-border transition-all disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={deleting}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : '🗑️ حذف نهائي'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
