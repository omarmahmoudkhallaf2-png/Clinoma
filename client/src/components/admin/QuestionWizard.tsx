import { useState, useEffect } from 'react';
import { Save, X, ChevronRight, ChevronLeft, Check, AlertCircle, Clock, Wand2, Zap, Shield, ImagePlus } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '../../lib/utils';
import type { Question } from '../../types/quiz';

interface QuestionWizardProps {
  initialData?: Question | null;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function QuestionWizard({ initialData, onSave, onCancel }: QuestionWizardProps) {
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataThemes, setDataThemes] = useState<any[]>([]);
  const [organizationMode, setOrganizationMode] = useState<'standard' | 'theme'>(initialData?.themeId ? 'theme' : 'standard');
  const [autoSaved, setAutoSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
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
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        if (compressedBase64.length > 950000) {
          alert('الصورة معقدة وكبيرة جداً حتى بعد الضغط. يرجى استخدام صورة أبسط.');
          setUploadingImage(false);
          return;
        }
        
        setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
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

  const [formData, setFormData] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    courseId: 'F1',
    subjectId: '',
    accessType: 'paid',
    lectureNumber: 1,
    questionType: 'practice',
    status: 'draft',
    version: 1,
    metadata: {
      tags: []
    },
    ...initialData,
    themeId: initialData?.themeId || '',
    moduleId: initialData?.moduleId || '',
    categoryId: initialData?.categoryId || '',
    chapterId: initialData?.chapterId || '',
    divisionId: initialData?.divisionId || '',
  });

  useEffect(() => {
    const fetchCoursesAndThemes = async () => {
      const [cSnap, tSnap] = await Promise.all([
        getDocs(query(collection(db, 'courses'))),
        getDocs(query(collection(db, 'data_themes')))
      ]);
      const cData = cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const tData = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      setCourses(cData);
      setDataThemes(tData);

      if (!initialData) {
        if (cData.length > 0) setFormData(prev => ({ ...prev, courseId: cData[0].id }));
      }
    };
    fetchCoursesAndThemes();
  }, [initialData]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!formData.courseId) return;
      const snap = await getDocs(query(collection(db, 'subjects'), where('courseId', '==', formData.courseId)));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setSubjects(data);
      if (!initialData && data.length > 0) {
        setFormData(prev => ({ ...prev, subjectId: data[0].id }));
      }
    };
    fetchSubjects();
  }, [formData.courseId, initialData]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOptionChange = (idx: number, val: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[idx] = val;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleFinalSave = async () => {
    setLoading(true);
    try {
      await onSave({
        ...formData,
        version: (formData.version || 0) + 1,
        history: initialData ? [...(initialData.history || []), { ...initialData, history: [] }] : []
      });
      localStorage.removeItem('question_draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="bg-primary/5 p-8 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-2xl">
            <Wand2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black">معالج الأسئلة الذكي</h2>
            <p className="text-muted-foreground font-bold">Smart Question Builder Wizard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {autoSaved && (
            <div className="flex items-center gap-2 text-emerald-500 font-bold animate-pulse">
              <Check className="w-4 h-4" /> تم الحفظ تلقائياً
            </div>
          )}
          <button onClick={onCancel} className="p-2 hover:bg-secondary rounded-xl transition-all">
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex p-4 bg-secondary/10 border-b border-border">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex-1 flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
              step >= s ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground'
            }`}>
              {step > s ? <Check className="w-6 h-6" /> : s}
            </div>
            {s < 4 && <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${step > s ? 'bg-primary' : 'bg-secondary'}`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="p-10 min-h-[500px]">
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black">الخطوة 1: التصنيف والربط</h3>
               <div className="flex p-1 bg-secondary rounded-2xl border border-border">
                  <button 
                    onClick={() => setOrganizationMode('standard')}
                    className={cn("px-6 py-2 rounded-xl font-black text-xs transition-all", organizationMode === 'standard' ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}
                  >
                    Standard Course
                  </button>
                  <button 
                    onClick={() => setOrganizationMode('theme')}
                    className={cn("px-6 py-2 rounded-xl font-black text-xs transition-all", organizationMode === 'theme' ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}
                  >
                    Data Theme (Free)
                  </button>
               </div>
            </div>

            {organizationMode === 'standard' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">الكورس (Course)</label>
                  <select name="courseId" value={formData.courseId} onChange={handleChange} className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">المادة (Subject)</label>
                  <select name="subjectId" value={formData.subjectId} onChange={handleChange} className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black">
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">نوع المحتوى (Source Type)</label>
                  <select name="questionType" value={formData.questionType} onChange={handleChange} className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black">
                    <option value="practice">تدريبية (Training)</option>
                    <option value="past_papers">سنين سابقة (Past Exams)</option>
                    <option value="lectures">محاضرات (Lecture Based)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">نوع الوصول (Access Type)</label>
                  <select name="accessType" value={formData.accessType} onChange={handleChange} className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black">
                    <option value="free">مجاني (Free Content)</option>
                    <option value="paid">مدفوع (Paid Content)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">المحاضرة / السنة</label>
                  <select 
                    name="lectureNumber" 
                    value={formData.lectureNumber} 
                    onChange={(e) => setFormData(prev => ({ ...prev, lectureNumber: parseInt(e.target.value) }))} 
                    className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black text-right"
                    dir="rtl"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>المحاضرة {n}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">تيمة الداتا (Theme)</label>
                  <select name="themeId" value={formData.themeId} onChange={handleChange} className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black">
                    <option value="">اختر تيمة...</option>
                    {dataThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">المديول (Module)</label>
                  <select name="moduleId" value={formData.moduleId} onChange={handleChange} className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black">
                    <option value="">اختر مديول...</option>
                    {dataThemes.find(t => t.id === formData.themeId)?.modules?.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">التصنيف (Category)</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black">
                    <option value="">اختر تصنيف...</option>
                    {dataThemes.find(t => t.id === formData.themeId)
                      ?.modules?.find((m: any) => m.id === formData.moduleId)
                      ?.categories?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">الشابتر (Chapter)</label>
                  <select name="chapterId" value={formData.chapterId} onChange={handleChange} className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black">
                    <option value="">اختر شابتر...</option>
                    {dataThemes.find(t => t.id === formData.themeId)
                      ?.modules?.find((m: any) => m.id === formData.moduleId)
                      ?.categories?.find((c: any) => c.id === formData.categoryId)
                      ?.chapters?.map((ch: any) => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">التقسيمة الأصغر (الأسئلة)</label>
                  <select name="divisionId" value={formData.divisionId} onChange={handleChange} className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-black">
                    <option value="">اختر التقسيمة...</option>
                    {dataThemes.find(t => t.id === formData.themeId)
                      ?.modules?.find((m: any) => m.id === formData.moduleId)
                      ?.categories?.find((c: any) => c.id === formData.categoryId)
                      ?.chapters?.find((ch: any) => ch.id === formData.chapterId)
                      ?.divisions?.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                   <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">نوع المحتوى</label>
                   <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl font-black text-center border border-emerald-500/20">
                     محتوى تيمات الداتا دائماً مجاني
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black">الخطوة 2: محتوى السؤال</h3>
            <div className="space-y-4">
              <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">نص السؤال</label>
              <textarea name="text" value={formData.text} onChange={handleChange} className="w-full h-40 p-5 bg-secondary/30 border-2 border-border rounded-3xl outline-none focus:border-primary font-bold text-lg text-right" dir="rtl" placeholder="اكتب السؤال الطبي هنا..." />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground ml-1 text-right">صورة السؤال (اختياري)</label>
              <div 
                className={`relative w-full min-h-[160px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 p-6 transition-all text-center group focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent outline-none
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
                ) : formData.imageUrl ? (
                  <div className="relative w-full flex items-center justify-center">
                    <img src={formData.imageUrl} alt="Preview" className="max-h-64 object-contain rounded-xl shadow-md" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, imageUrl: '' })); }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(formData.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${formData.correctAnswer === opt && opt !== '' ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input value={opt} onChange={e => handleOptionChange(i, e.target.value)} className="flex-1 p-4 bg-secondary/30 border-2 border-border rounded-2xl outline-none focus:border-primary font-bold" placeholder={`Option ${i+1}`} />
                  <button onClick={() => setFormData(prev => ({ ...prev, correctAnswer: opt }))} className={`p-3 rounded-xl transition-all ${formData.correctAnswer === opt && opt !== '' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-secondary text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500'}`}>
                    <Check />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">التفسير العلمي (Explanation)</label>
              <textarea name="explanation" value={formData.explanation} onChange={handleChange} className="w-full h-32 p-5 bg-secondary/30 border-2 border-border rounded-3xl outline-none focus:border-primary font-bold" placeholder="اشرح الإجابة الصحيحة..." />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black">الخطوة 3: خيارات متقدمة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 p-6 bg-secondary/20 rounded-3xl border-2 border-border">
                <h4 className="font-black flex items-center gap-2"><Clock className="w-5 h-5" /> الحالة والإصدار</h4>
                <div className="space-y-3">
                  <label className="text-xs font-black text-muted-foreground">حالة السؤال</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 bg-card border-2 border-border rounded-xl font-black">
                    <option value="draft">مسودة (Draft)</option>
                    <option value="review">يحتاج مراجعة (Review)</option>
                    <option value="published">منشور (Published)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4 p-6 bg-secondary/20 rounded-3xl border-2 border-border text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-2" />
                <h4 className="font-black">نموذج الوصول</h4>
                <div className={`p-4 rounded-2xl border-2 font-black ${formData.accessType === 'paid' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-emerald-500/10 border-emerald-500 text-emerald-600'}`}>
                  {formData.accessType === 'paid' ? 'محتوى مدفوع (Subscribers Only)' : 'محتوى مجاني (Everyone)'}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black text-emerald-500 flex items-center gap-2"><Check /> مراجعة نهائية</h3>
            <div className="bg-secondary/10 p-8 rounded-[3rem] border-2 border-border space-y-6">
              <div>
                <span className="text-xs font-black uppercase text-muted-foreground">نص السؤال</span>
                <p className="text-2xl font-black mt-2 leading-snug">{formData.text}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {formData.options?.map((opt, i) => (
                  <div key={i} className={`p-4 rounded-2xl border-2 font-bold ${formData.correctAnswer === opt ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'bg-card border-border'}`}>
                    {String.fromCharCode(65 + i)}) {opt}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-xs">COURSE: {courses.find(c => c.id === formData.courseId)?.name}</span>
                <span className="px-4 py-2 bg-indigo-500/10 text-indigo-600 rounded-xl font-black text-xs">SUBJECT: {subjects.find(s => s.id === formData.subjectId)?.name}</span>
                <span className="px-4 py-2 bg-amber-500/10 text-amber-600 rounded-xl font-black text-xs uppercase">ACCESS: {formData.accessType}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-8 bg-secondary/10 border-t border-border flex justify-between items-center">
        <button onClick={prevStep} disabled={step === 1} className="flex items-center gap-2 px-8 py-4 bg-card border-2 border-border rounded-2xl font-black hover:bg-secondary disabled:opacity-50 transition-all">
          <ChevronLeft /> سابق
        </button>
        {step < 4 ? (
          <button onClick={nextStep} className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            التالي <ChevronRight />
          </button>
        ) : (
          <button onClick={handleFinalSave} disabled={loading} className="flex items-center gap-2 px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all">
            {loading ? 'جاري الحفظ...' : 'حفظ ونشر السؤال'} <Save />
          </button>
        )}
      </div>
    </div>
  );
}
