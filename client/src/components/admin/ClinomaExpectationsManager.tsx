import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, doc, setDoc, addDoc, deleteDoc, writeBatch, increment } from 'firebase/firestore';
import { 
  Plus, Trash2, Brain, Loader2, Edit2, Sparkles, X, Search, 
  HelpCircle, ChevronRight, RefreshCw, AlertCircle, CheckCircle2, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CHAPTERS } from '../../clinoma-cards/src/data/chapters';
import { INITIAL_QUESTIONS } from '../../clinoma-cards/src/data/questions';
import type { Question } from '../../clinoma-cards/src/types';

export default function ClinomaExpectationsManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChapter, setFilterChapter] = useState<number | 'all'>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formChapterId, setFormChapterId] = useState<number>(1);
  const [formType, setFormType] = useState<Question['type']>('problem-solving');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formQuestionLink, setFormQuestionLink] = useState('');
  const [formAnswerLink, setFormAnswerLink] = useState('');

  // Reset progress form states
  const [resetChapterId, setResetChapterId] = useState<number>(1);
  const [resetTopic, setResetTopic] = useState<string>('all');
  const [isResetting, setIsResetting] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'clinoma_expectations'));
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
        // Sort by ID naturally
        list.sort((a, b) => {
          const numA = parseInt(a.id.replace('remix_q', '')) || 0;
          const numB = parseInt(b.id.replace('remix_q', '')) || 0;
          return numA - numB;
        });
        setQuestions(list);
      } else {
        // Auto-seed
        toast.loading('Initializing database with default expectations questions...', { id: 'seed' });
        const batch = writeBatch(db);
        const localRemix = INITIAL_QUESTIONS.filter(q => q.id.startsWith('remix_'));
        localRemix.forEach(q => {
          const docRef = doc(db, 'clinoma_expectations', q.id);
          batch.set(docRef, q);
        });
        await batch.commit();
        toast.success('Successfully seeded database expectations questions!', { id: 'seed' });
        setQuestions(localRemix);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch expectations questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter topics based on active filter chapter
  const availableTopicsForFilter = useMemo(() => {
    if (filterChapter === 'all') return [];
    const ch = CHAPTERS.find(c => c.id === filterChapter);
    return ch ? ch.topics : [];
  }, [filterChapter]);

  // Reset topic filter when chapter filter changes
  useEffect(() => {
    setFilterTopic('all');
  }, [filterChapter]);

  // Filter topics for the form dialog
  const availableTopicsForForm = useMemo(() => {
    const ch = CHAPTERS.find(c => c.id === formChapterId);
    return ch ? ch.topics : [];
  }, [formChapterId]);

  // Filter topics for student reset center
  const availableTopicsForReset = useMemo(() => {
    const ch = CHAPTERS.find(c => c.id === resetChapterId);
    return ch ? ch.topics : [];
  }, [resetChapterId]);

  // Reset student reset topic when reset chapter changes
  useEffect(() => {
    setResetTopic('all');
  }, [resetChapterId]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = !searchQuery || 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchChapter = filterChapter === 'all' || q.chapterId === filterChapter;
      const matchTopic = filterTopic === 'all' || q.topic === filterTopic;

      return matchSearch && matchChapter && matchTopic;
    });
  }, [questions, searchQuery, filterChapter, filterTopic]);

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormId(`remix_q${Date.now()}`);
    setFormChapterId(1);
    setFormType('problem-solving');
    setFormTitle('');
    setFormContent('');
    setFormAnswer('');
    setFormTopic('');
    setFormExplanation('');
    setFormQuestionLink('');
    setFormAnswerLink('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormId(q.id);
    setFormChapterId(q.chapterId);
    setFormType(q.type);
    setFormTitle(q.title);
    setFormContent(q.content);
    setFormAnswer(q.answer);
    setFormTopic(q.topic || '');
    setFormExplanation(q.explanation || '');
    setFormQuestionLink(q.questionLink || '');
    setFormAnswerLink(q.answerLink || '');
    setIsModalOpen(true);
  };

  const updateExpectationsMetaVersion = async () => {
    try {
      const metaRef = doc(db, 'settings', 'clinoma_expectations_meta');
      await setDoc(metaRef, { 
        version: increment(1), 
        updatedAt: new Date() 
      }, { merge: true });
    } catch (err) {
      console.error("Failed to increment expectations meta version:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || !formAnswer.trim()) {
      toast.error('الرجاء تعبئة الحقول الأساسية: العنوان، السؤال، والإجابة');
      return;
    }

    const payload: Question = {
      id: formId,
      chapterId: formChapterId,
      type: formType,
      title: formTitle.trim(),
      content: formContent.trim(),
      answer: formAnswer.trim(),
      isClinical: false,
      topic: formTopic.trim() || undefined,
      explanation: formExplanation.trim() || undefined,
      questionLink: formQuestionLink.trim() || undefined,
      answerLink: formAnswerLink.trim() || undefined
    };

    const loadToast = toast.loading('جاري حفظ السؤال...');
    try {
      await setDoc(doc(db, 'clinoma_expectations', formId), payload);
      await updateExpectationsMetaVersion();
      toast.success(editingQuestion ? 'تم تعديل السؤال بنجاح' : 'تم إضافة السؤال بنجاح', { id: loadToast });
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      console.error(err);
      toast.error(`فشل الحفظ: ${err.message}`, { id: loadToast });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال نهائياً من بنك توقعات كلينوما؟')) return;
    const loadToast = toast.loading('جاري الحذف...');
    try {
      await deleteDoc(doc(db, 'clinoma_expectations', id));
      await updateExpectationsMetaVersion();
      toast.success('تم حذف السؤال بنجاح', { id: loadToast });
      fetchQuestions();
    } catch (err: any) {
      console.error(err);
      toast.error(`فشل الحذف: ${err.message}`, { id: loadToast });
    }
  };

  const handleStudentReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const ch = CHAPTERS.find(c => c.id === resetChapterId);
    const chapterName = ch ? ch.title : `Chapter ${resetChapterId}`;
    const topicLabel = resetTopic === 'all' ? 'جميع المواضيع' : resetTopic;
    
    if (!confirm(`تحذير! سيتم تصفير تقدم جميع الطلاب في الفصل "${chapterName}" والموضوع "${topicLabel}". هل أنت متأكد؟`)) {
      return;
    }

    setIsResetting(true);
    const loadToast = toast.loading('جاري جدولة تصفير التقدم عند الطلاب...');
    try {
      await addDoc(collection(db, 'clinoma_resets'), {
        chapterId: resetChapterId,
        topic: resetTopic,
        resetAt: new Date()
      });
      toast.success('تم إرسال أمر التصفير بنجاح! سيتم تطبيقه تلقائياً عند فتح الطلاب للتطبيق.', { id: loadToast, duration: 5000 });
    } catch (err: any) {
      console.error(err);
      toast.error(`فشل التصفير: ${err.message}`, { id: loadToast });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-8 md:p-12 space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-br from-indigo-700 via-violet-750 to-purple-800 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-24 -mt-24 blur-[80px]" />
        
        <div className="space-y-3 relative z-10 text-left">
          <div className="flex items-center gap-2 text-indigo-200">
            <Sparkles size={20} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Clinoma Engine</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Clinoma Expectations</h2>
          <p className="text-indigo-150 font-medium opacity-90 max-w-2xl leading-relaxed">
            تعديل وإضافة وحذف أسئلة فلاش كاردز "توقعات كلينوما" للورقة الثانية للأطفال. كما يمكنك إجبار جميع الطلاب على تصفير تقدمهم في شابتر أو موضوع معين.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-8 py-4 bg-white text-indigo-700 rounded-[2rem] font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap relative z-10 shrink-0 self-start lg:self-center"
        >
          <Plus className="w-5 h-5" /> إضافة سؤال جديد
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Filter and Cards Table (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Bar */}
          <div className="bg-card border-2 border-border p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-xl text-foreground">تصفية وبحث الأسئلة</h3>
              <span className="text-xs font-bold text-muted-foreground bg-secondary/50 px-3 py-1 rounded-lg">
                إجمالي المعروض: {filteredQuestions.length} سؤال
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="ابحث بالعنوان، السؤال، الموضوع..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="w-full bg-secondary/20 pl-11 pr-4 py-3 rounded-2xl border-2 border-transparent outline-none focus:border-indigo-500 font-bold text-sm text-right"
                  dir="rtl"
                />
              </div>

              {/* Chapter Filter */}
              <select 
                value={filterChapter} 
                onChange={e => setFilterChapter(e.target.value === 'all' ? 'all' : Number(e.target.value))} 
                className="bg-secondary/20 px-4 py-3 rounded-2xl border-2 border-transparent font-bold text-sm outline-none focus:border-indigo-500 text-right"
                dir="rtl"
              >
                <option value="all">كل الفصول</option>
                {CHAPTERS.map(ch => (
                  <option key={ch.id} value={ch.id}>الفصل {ch.id}: {ch.title.substring(3)}</option>
                ))}
              </select>

              {/* Topic Filter */}
              <select 
                value={filterTopic} 
                onChange={e => setFilterTopic(e.target.value)} 
                disabled={filterChapter === 'all'}
                className="bg-secondary/20 px-4 py-3 rounded-2xl border-2 border-transparent font-bold text-sm outline-none focus:border-indigo-500 disabled:opacity-50 text-right"
                dir="rtl"
              >
                <option value="all">كل المواضيع</option>
                {availableTopicsForFilter.map((topic, idx) => (
                  <option key={idx} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4 bg-card border-2 border-border rounded-3xl">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-muted-foreground font-bold text-sm">جاري تحميل الأسئلة...</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map(q => (
                <div key={q.id} className="p-6 bg-card border-2 border-border hover:border-indigo-500/30 rounded-3xl transition-all shadow-sm flex flex-col justify-between text-right" dir="rtl">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-700 px-2 py-0.5 rounded uppercase font-mono">
                          {q.id}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          الفصل {q.chapterId}
                        </span>
                        {q.topic && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                            {q.topic}
                          </span>
                        )}
                        {(q.questionLink || q.answerLink) && (
                          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1">
                            <LinkIcon size={10} /> روابط مرفقة
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-foreground pt-1">{q.title}</h4>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEdit(q)}
                        className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="تعديل السؤال"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        title="حذف السؤال"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-3 mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold">
                    <div className="bg-secondary/10 p-3 rounded-xl">
                      <div className="text-[10px] text-muted-foreground font-black mb-1">نص السؤال ❓</div>
                      <p className="text-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap">{q.content}</p>
                    </div>
                    <div className="bg-secondary/15 p-3 rounded-xl">
                      <div className="text-[10px] text-muted-foreground font-black mb-1">نص الإجابة 📝</div>
                      <p className="text-foreground line-clamp-3 leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center space-y-4 bg-card border-2 border-dashed border-border rounded-3xl">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-black text-muted-foreground">لم يتم العثور على أي أسئلة</p>
                  <p className="text-xs text-muted-foreground font-bold">جرب تغيير معايير البحث أو التصفية.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Student Reset Center (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-card border-2 border-border p-8 rounded-3xl shadow-sm text-right space-y-6" dir="rtl">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                <RefreshCw size={20} className="animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-black text-xl text-foreground">مركز تصفير تقدم الطلاب 🔄</h3>
                <p className="text-xs text-muted-foreground font-semibold mt-1">تصفير إنجاز الطلاب لشابتر وموضوع محدد</p>
              </div>
            </div>

            <form onSubmit={handleStudentReset} className="space-y-4">
              {/* Select Chapter */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground">اختر الفصل:</label>
                <select 
                  value={resetChapterId} 
                  onChange={e => setResetChapterId(Number(e.target.value))} 
                  className="w-full bg-secondary/20 px-4 py-3 rounded-2xl border-2 border-transparent font-bold text-sm outline-none focus:border-amber-500 text-right"
                >
                  {CHAPTERS.map(ch => (
                    <option key={ch.id} value={ch.id}>الفصل {ch.id}: {ch.title.substring(3)}</option>
                  ))}
                </select>
              </div>

              {/* Select Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground">اختر الموضوع:</label>
                <select 
                  value={resetTopic} 
                  onChange={e => setResetTopic(e.target.value)} 
                  className="w-full bg-secondary/20 px-4 py-3 rounded-2xl border-2 border-transparent font-bold text-sm outline-none focus:border-amber-500 text-right"
                >
                  <option value="all">جميع مواضيع الشابتر</option>
                  {availableTopicsForReset.map((topic, idx) => (
                    <option key={idx} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-800 font-bold leading-relaxed">
                <AlertCircle className="w-5 h-5 text-amber-650 shrink-0 mt-0.5" />
                <p>
                  عند الضغط على تصفير، سيقوم النظام بمسح كافّة الأسئلة المتقنة (Mastered) والمحفوظة للمراجعة (Review) التابعة للفصل والموضوع المختارين لدى <b>جميع الطلاب</b> تلقائياً عند قيامهم بفتح التطبيق في المرة القادمة.
                </p>
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full py-4 bg-amber-500 text-neutral-900 rounded-2xl font-black text-sm shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isResetting ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                <span>تصفير التقدم لجميع الطلاب</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-card border-2 border-border rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden text-right flex flex-col my-10" dir="rtl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/10">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-secondary/40 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Brain className="text-indigo-600" />
                {editingQuestion ? 'تعديل سؤال التوقعات' : 'إضافة سؤال توقعات جديد'}
              </h3>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Question metadata (Chapter, Topic, type) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-foreground">الفصل الشابتر:</label>
                  <select 
                    value={formChapterId} 
                    onChange={e => setFormChapterId(Number(e.target.value))}
                    className="w-full bg-secondary/20 px-4 py-3 rounded-xl border-2 border-transparent font-bold text-xs outline-none focus:border-indigo-500 text-right"
                  >
                    {CHAPTERS.map(ch => (
                      <option key={ch.id} value={ch.id}>Ch0{ch.id}: {ch.title.substring(3)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-foreground">الموضوع الرئيسي:</label>
                  <select 
                    value={formTopic} 
                    onChange={e => setFormTopic(e.target.value)}
                    className="w-full bg-secondary/20 px-4 py-3 rounded-xl border-2 border-transparent font-bold text-xs outline-none focus:border-indigo-500 text-right"
                  >
                    <option value="">اختر موضوعاً...</option>
                    {availableTopicsForForm.map((topic, idx) => (
                      <option key={idx} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-foreground">نوع السؤال:</label>
                  <select 
                    value={formType} 
                    onChange={e => setFormType(e.target.value as Question['type'])}
                    className="w-full bg-secondary/20 px-4 py-3 rounded-xl border-2 border-transparent font-bold text-xs outline-none focus:border-indigo-500 text-right"
                  >
                    <option value="problem-solving">Case Problem Solving</option>
                    <option value="short-essay">Short Essay</option>
                    <option value="define">Definition</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="matching">Matching</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground">عنوان السؤال / المفهوم المرجعي:</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="مثال: Nephritic syndrome clinical findings"
                  className="w-full bg-secondary/20 px-4 py-3 rounded-xl border-2 border-transparent outline-none focus:border-indigo-500 font-bold text-sm text-right"
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground">نص السؤال ❓:</label>
                <textarea 
                  rows={4}
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="اكتب نص السؤال هنا..."
                  className="w-full bg-secondary/20 px-4 py-3 rounded-xl border-2 border-transparent outline-none focus:border-indigo-500 font-bold text-sm text-right leading-relaxed"
                />
              </div>

              {/* Answer */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground">الإجابة النموذجية 📝:</label>
                <textarea 
                  rows={4}
                  value={formAnswer}
                  onChange={e => setFormAnswer(e.target.value)}
                  placeholder="اكتب النقاط الرئيسية للإجابة النموذجية (افصل بين الأسطر بمفتاح Enter)..."
                  className="w-full bg-secondary/20 px-4 py-3 rounded-xl border-2 border-transparent outline-none focus:border-indigo-500 font-bold text-sm text-right leading-relaxed"
                />
              </div>

              {/* Explanation (optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground">شرح مبسط للسؤال (اختياري):</label>
                <textarea 
                  rows={3}
                  value={formExplanation}
                  onChange={e => setFormExplanation(e.target.value)}
                  placeholder="اكتب شرحاً إضافياً يوضح آلية الإجابة للطلاب..."
                  className="w-full bg-secondary/20 px-4 py-3 rounded-xl border-2 border-transparent outline-none focus:border-indigo-500 font-bold text-sm text-right leading-relaxed"
                />
              </div>

              {/* Link fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                {/* Question Link */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-black text-foreground">رابط مرفق بالسؤال (صفحة ويب أو عنوان صورة):</label>
                  <input 
                    type="text" 
                    value={formQuestionLink}
                    onChange={e => setFormQuestionLink(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="w-full bg-secondary/20 px-4 py-3 rounded-xl border-2 border-transparent outline-none focus:border-indigo-500 font-bold text-xs text-left"
                    dir="ltr"
                  />
                  {formQuestionLink.trim() && (
                    <div className="text-[10px] text-indigo-500 font-bold mt-1">
                      {/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(formQuestionLink.split('?')[0]) ? '✨ سيتم عرض هذا الرابط كصورة داخل السؤال' : '🔗 سيتم عرض هذا كزر رابط خارجي'}
                    </div>
                  )}
                </div>

                {/* Answer Link */}
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-black text-foreground">رابط مرفق بالإجابة (صفحة ويب أو عنوان صورة):</label>
                  <input 
                    type="text" 
                    value={formAnswerLink}
                    onChange={e => setFormAnswerLink(e.target.value)}
                    placeholder="https://example.com/chart.png"
                    className="w-full bg-secondary/20 px-4 py-3 rounded-xl border-2 border-transparent outline-none focus:border-indigo-500 font-bold text-xs text-left"
                    dir="ltr"
                  />
                  {formAnswerLink.trim() && (
                    <div className="text-[10px] text-indigo-500 font-bold mt-1">
                      {/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(formAnswerLink.split('?')[0]) ? '✨ سيتم عرض هذا الرابط كصورة داخل الإجابة' : '🔗 سيتم عرض هذا كزر رابط خارجي'}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-secondary/40 hover:bg-secondary/70 text-foreground rounded-xl font-bold text-xs transition-all active:scale-95"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-650/20 transition-all active:scale-95"
                >
                  {editingQuestion ? 'حفظ التعديلات' : 'إضافة السؤال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
