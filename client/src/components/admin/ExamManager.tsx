import { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp,
  query, orderBy, getDoc, where, Timestamp, updateDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  Plus, Trash2, Copy, ExternalLink, Loader2, X,
  BookOpen, ChevronDown, ChevronUp, Check, Calendar, Clock, Lock, Unlock, Edit2, ImagePlus
} from 'lucide-react';

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
function ExamQuestionBuilder({ examId }: { examId: string }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const fileRef = ref(storage, `questions/${Date.now()}_${file.name || 'image.png'}`);
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on('state_changed', 
        () => {}, 
        (error) => {
          console.error("Upload failed", error);
          setUploadingImage(false);
          alert("فشل رفع الصورة");
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setForm(prev => ({ ...prev, imageUrl: downloadURL }));
          setUploadingImage(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingImage(false);
    }
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
    const options = [form.optionA, form.optionB, form.optionC, form.optionD];
    const correctAnswer = options[['A', 'B', 'C', 'D'].indexOf(form.correctAnswer)];
    await addDoc(collection(db, 'questions'), {
      text: form.text, options, correctAnswer,
      imageUrl: form.imageUrl,
      formalExamId: examId, accessType: 'free', createdAt: serverTimestamp()
    });
    setForm({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', imageUrl: '' });
    setSaving(false);
    fetchQuestions();
  };

  const letters = ['A', 'B', 'C', 'D'];
  const optionKeys = ['optionA', 'optionB', 'optionC', 'optionD'] as const;

  return (
    <div className="space-y-6 pt-4 border-t-2 border-border mt-4">
      <h4 className="font-black text-lg flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" /> أسئلة الإختبار ({questions.length})
      </h4>
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
              </div>
              <button onClick={async () => { await deleteDoc(doc(db, 'questions', q.id)); fetchQuestions(); }}
                className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 rounded-xl transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="space-y-4 bg-secondary/20 p-6 rounded-3xl border-2 border-dashed border-border">
        <p className="font-black text-sm text-muted-foreground uppercase tracking-widest">إضافة سؤال جديد</p>
        <textarea required value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
          placeholder="نص السؤال..." rows={2}
          className="w-full p-4 bg-card border-2 border-border rounded-2xl font-bold text-sm outline-none focus:border-primary text-right resize-none" dir="rtl" />
        
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
        <button type="submit" disabled={saving}
          className="w-full py-3 bg-primary text-white rounded-2xl font-black hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> إضافة السؤال</>}
        </button>
      </form>
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

  const emptyForm = { title: '', durationMinutes: '', description: '', startAt: '', endAt: '' };
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'formal_exams'), orderBy('createdAt', 'desc')));
      setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
                      </div>
                    </div>
                    <div className="text-muted-foreground flex-shrink-0">
                      {expandedExam === exam.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 flex-shrink-0">
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
                    <ExamQuestionBuilder examId={exam.id} />
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
