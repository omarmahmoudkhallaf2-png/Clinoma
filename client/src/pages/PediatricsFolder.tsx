import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, FileText, HelpCircle, X, CheckCircle2, AlertCircle, RotateCcw, Maximize2, Sparkles, BookOpen, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

// Static Mapping for Pediatrics Specialty Names
const SUBJECT_MAP: Record<string, { folderName: string; arabicName: string }> = {
  'cardiovascular_diseases': { folderName: 'Cardiovascular diseases', arabicName: 'أمراض القلب للأطفال' },
  'endocrinology': { folderName: 'Endocrinology', arabicName: 'الغدد الصماء' },
  'gastroenterology_hepatology': { folderName: 'Gastroenterology & hepatology', arabicName: 'الجهاز الهضمي والكبد' },
  'genetic_diseases': { folderName: 'Genetic diseases', arabicName: 'الأمراض الوراثية' },
  'growth_development': { folderName: 'Growth & development', arabicName: 'النمو والتطور' },
  'hematology_oncology': { folderName: 'Hematology & Oncology', arabicName: 'أمراض الدم والأورام' },
  'infections': { folderName: 'Infections', arabicName: 'الأمراض المعدية' },
  'neurology': { folderName: 'Neurology', arabicName: 'أمراض الأعصاب' },
  'nutrition': { folderName: 'Nutrition', arabicName: 'التغذية' },
  'renal_diseases': { folderName: 'Renal diseases', arabicName: 'أمراض الكلى للأطفال' }
};

// Explanations Dictionary (The high-yield medical content)
const PEDIATRICS_EXPLANATIONS: Record<string, string> = {
  'biological_age_maturation_bone_teeth': `**أولاً: النضج العظمي (Bone Age / Radiological Age)**

* يُعتبر الـ **Bone age** من أهم المؤشرات لتقييم النضج البيولوجي للطفل، ويتم تحديده عن طريق تقييم ظهور مراكز التعظم (**Centers of ossification**).
* **أهم النقاط الإكلينيكية:**
  * عند الولادة (**At birth**): يجب أن تكون مراكز التعظم موجودة في الـ **Lower end of femur** والـ **Upper end of tibia**.
  * الـ **Investigation** الأساسي لتقييم الـ **Bone age** في الأطفال هو طلب أشعة سينية (**X-ray**) على اليد اليسرى والمعصم (**Left hand and wrist**).

<br/>

**ثانياً: التسنين (Dentition)**
ينقسم التسنين إلى مرحلتين أساسيتين:

1. **الأسنان اللبنية (Deciduous / Milky teeth):**
   * إجمالي عددهم 20 سِنة.
   * يبدأ الـ **Eruption** عند عمر 6 أشهر تقريباً، وأول أسنان تظهر هي القواطع السفلية المركزية (**Lower central incisors**).
   * يكتمل خروج جميع الأسنان اللبنية عند عمر 2 إلى 2.5 سنة.

2. **الأسنان الدائمة (Permanent teeth):**
   * إجمالي عددهم 32 سِنة.
   * يبدأ الـ **Eruption** عند عمر 6 سنوات، وأول سِنة تظهر هي الضرس الأول (**First molar**).

<br/>

**ثالثاً: تأخر التسنين (Delayed Dentition)**

* يتم تشخيص الحالة كـ **Delayed dentition** إذا لم يظهر للطفل أي سِنة بحلول عمر 13 شهراً.

**Causes of Delayed Dentition (Enumerate):**

1. **Rickets** (أشهر وأهم سبب)
2. **Hypothyroidism**
3. **Hypopituitarism**
4. **Down syndrome**
5. **Malnutrition**
6. **Familial / Idiopathic**

---

💡 **Mnemonic لتسهيل التذكر في أسئلة الـ Enumerate:**
لربط أسباب الـ **Delayed dentition** وتذكرها بسهولة في الامتحانات، تذكر هذه الجملة:
**(عيلة داون عندها نقص تغذية وكساح في الغدة)**

* **عيلة:** **Familial / Idiopathic**
* **داون:** **Down syndrome**
* **نقص تغذية:** **Malnutrition**
* **كساح:** **Rickets**
* **الغدة:** **Hypothyroidism** & **Hypopituitarism**`
};

// 3 High-Yield Questions for Bone & Teeth maturation
const PEDIATRICS_QUESTIONS: Record<string, any[]> = {
  'biological_age_maturation_bone_teeth': [
    {
      question: "ما هو الفحص الإشعاعي (Investigation) الأساسي لتقييم النضج العظمي (Bone Age) لدى الأطفال؟",
      options: [
        "أشعة X-ray على القدم اليسرى والكاحل",
        "أشعة X-ray على اليد اليسرى والمعصم (Left hand and wrist)",
        "أشعة مقطعية (CT scan) على الجمجمة",
        "أشعة رنين مغناطيسي (MRI) على الفخذين"
      ],
      correctAnswer: 1,
      explanation: "الـ Investigation الأساسي والمعتمد دولياً لتقييم الـ Bone age هو أشعة X-ray على اليد اليسرى والمعصم (Left hand and wrist)."
    },
    {
      question: "ما هي أول أسنان لبنية (Deciduous teeth) تبدأ في الخروج (Eruption) عند الرضيع الطبيعي، وفي أي سن تقريباً؟",
      options: [
        "القواطع العلوية المركزية عند عمر 12 شهر",
        "القواطع السفلية المركزية (Lower central incisors) عند عمر 6 أشهر",
        "الضرس الأول اللبني عند عمر 10 أشهر",
        "الأنياب السفلية عند عمر 8 أشهر"
      ],
      correctAnswer: 1,
      explanation: "يبدأ بزوغ الأسنان اللبنية عند عمر 6 أشهر تقريباً، وأول أسنان تظهر هي القواطع السفلية المركزية (Lower central incisors)."
    },
    {
      question: "طفل يبلغ من العمر 14 شهراً ولم يظهر له أي سن بعد. كيف يتم تشخيص هذه الحالة وأشهر سبب لها؟",
      options: [
        "حالة طبيعية تماماً ويجب الانتظار لعمر سنتين",
        "تأخر تسنين عائلي طبيعي ولا يتطلب التفكير في الأمراض",
        "تأخر تسنين (Delayed dentition) وأشهر وأهم سبب له هو الكساح (Rickets)",
        "فشل نمو الأسنان الدائمة بسبب نقص هرمون الكالسيتونين"
      ],
      correctAnswer: 2,
      explanation: "يتم تشخيص الحالة كـ Delayed dentition إذا لم يظهر للطفل أي سن بحلول عمر 13 شهراً. ويُعتبر الكساح (Rickets) هو أشهر وأهم سبب لذلك."
    }
  ]
};

export default function PediatricsFolder() {
  const { subjectId, folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve filenames/title passed in state, or calculate from ID
  const slideName = location.state?.slideName || '';
  
  const currentSubject = subjectId ? SUBJECT_MAP[subjectId] : null;
  const cleanTitle = slideName ? slideName.replace(/\.[^/.]+$/, "") : (folderId ? folderId.replace(/_/g, ' ').toUpperCase() : '');
  const actualFileName = slideName || `${cleanTitle}.jpeg`; // fallback
  const imagePath = currentSubject ? `/assets/TIP-Peditrics/${currentSubject.folderName}/${actualFileName}` : '';

  // Tab State - default to 'explanation' for instant usability!
  const [activeView, setActiveView] = useState<'explanation' | 'quiz'>('explanation');
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Quiz Player State
  const quizQuestions = folderId ? PEDIATRICS_QUESTIONS[folderId] || [] : [];
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!currentSubject || !folderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200">المجلد غير موجود</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-3 bg-primary text-white rounded-2xl">
          العودة للخلف
        </button>
      </div>
    );
  }

  const customExplanation = PEDIATRICS_EXPLANATIONS[folderId];
  const explanationText = customExplanation || `### 📚 ${cleanTitle}\n\n**الشرح الطبي والملخص الإكلينيكي قيد التحضير حالياً!**\n\nبمجرد تجميع محتوى الشرح والأسئلة الخاصة بهذه اللوحة البصرية، سنقوم بدمجه فوراً لتظهر هنا بشكل منسق وجذاب. \n\n* يمكنك مشاركة الشروحات الطبية والأسئلة لرفعها مباشرة على المنصة 🚀`;

  // Quiz Handling
  const handleOptionClick = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOptionIdx(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIdx === null || isSubmitted) return;
    setIsSubmitted(true);
    if (selectedOptionIdx === quizQuestions[currentQuestionIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOptionIdx(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0c0d12] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0c0d12]/75 backdrop-blur-md border-b border-amber-100/40 dark:border-slate-800/40 p-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back Button (RTL-optimized matching browser standard) */}
          <button 
            onClick={() => navigate(`/course/pediatrics_course/subject/${subjectId}/lectures`)} 
            className="group px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-all flex items-center gap-2 font-black text-xs shadow-sm text-slate-700 dark:text-slate-200"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            <span>العودة للوحة التخصص</span>
          </button>
          
          {/* Section Titles */}
          <div className="text-right" dir="rtl">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest mb-1">
              <Sparkles className="w-3 h-3" />
              {currentSubject.arabicName}
            </span>
            <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-150 tracking-tight">
              {cleanTitle}
            </h1>
          </div>
        </div>
      </header>

      {/* 2. Main Page Grid Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Visual Slide Container (Sticky on desktop) */}
          <section className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[2.5rem] p-4 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
              
              {/* Top left hover zoom icon */}
              <button 
                onClick={() => setIsImageZoomed(true)}
                className="absolute top-6 left-6 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-full hover:bg-amber-500 hover:text-white transition-all shadow-md z-20 opacity-0 group-hover:opacity-100 duration-300"
                title="تكبير الصورة بملء الشاشة"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Slide image wrapper */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-inner">
                <img 
                  src={imagePath} 
                  alt={cleanTitle} 
                  className="w-full h-full object-contain cursor-zoom-in group-hover:scale-[1.02] transition-transform duration-500 select-none"
                  onClick={() => setIsImageZoomed(true)}
                />
              </div>

              {/* Instructions */}
              <div className="w-full text-center mt-3 text-[11px] text-slate-400 font-bold tracking-wide flex items-center justify-center gap-1.5">
                <span>🔍 انقر فوق اللوحة البصرية لعرضها بملء الشاشة وتكبير التفاصيل</span>
              </div>
            </div>

            {/* Quick Stats info card */}
            <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-[2rem] p-6 text-right space-y-1" dir="rtl">
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">لوحة مخصصة للتعلم البصري</span>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">الذاكرة البصرية التفاعلية</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                تساعدك اللوحات الملخصة على تثبيت المعلومات الإكلينيكية وربطها بالمفاهيم الأساسية، مما يضمن أداء متميزاً في الامتحانات السريرية.
              </p>
            </div>
          </section>

          {/* RIGHT COLUMN: Tabs, Interactive Explanations & Quizzes */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Elegant Tab Buttons */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[2rem] p-2 flex gap-2 shadow-md relative z-10" dir="rtl">
              <button
                onClick={() => setActiveView('explanation')}
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl font-black text-base md:text-lg transition-all flex items-center justify-center gap-2.5",
                  activeView === 'explanation' 
                    ? "bg-[#faf6f0] text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/30 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <FileText className={cn("w-5 h-5", activeView === 'explanation' ? "text-amber-600 dark:text-amber-400 animate-pulse" : "text-slate-400")} />
                <span>الشرح والتلخيص الطبي</span>
              </button>

              <button
                onClick={() => setActiveView('quiz')}
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl font-black text-base md:text-lg transition-all flex items-center justify-center gap-2.5",
                  activeView === 'quiz' 
                    ? "bg-[#f0f9f4] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/30 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <HelpCircle className={cn("w-5 h-5", activeView === 'quiz' ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : "text-slate-400")} />
                <span>الاختبار التفاعلي الذاتي</span>
                {quizQuestions.length > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                    {quizQuestions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content Display Card */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {activeView === 'explanation' ? (
                  <motion.div
                    key="explanation"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#fcfbf9] dark:bg-slate-900 border border-amber-100/50 dark:border-slate-800/80 rounded-[2.5rem] p-6 md:p-10 shadow-lg text-right"
                    dir="rtl"
                  >
                    <div className="flex items-center gap-3 border-b border-amber-100/70 dark:border-slate-800/80 pb-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-slate-200">الشرح والتفسير السريري</h2>
                        <p className="text-[10px] font-bold text-slate-400">ملاحظات ووسائل حفظ وتثبيت المعلومة</p>
                      </div>
                    </div>

                    {/* Rich Arabic Sepia Markdown Viewer */}
                    <div className="text-slate-700 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-8 mb-4 border-b border-amber-100/50 pb-2 leading-tight" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-black text-slate-850 dark:text-slate-150 mt-6 mb-3 border-r-4 border-amber-500 pr-3 leading-snug" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-5 mb-2 leading-snug" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 text-slate-650 dark:text-slate-350 leading-loose" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mr-6 mb-4 space-y-2.5 text-slate-650 dark:text-slate-350" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mr-6 mb-4 space-y-2.5 text-slate-650 dark:text-slate-350" {...props} />,
                          li: ({node, ...props}) => <li className="marker:text-amber-500 pr-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="text-amber-700 dark:text-amber-300 font-black bg-amber-500/5 dark:bg-amber-500/10 px-2 py-0.5 rounded mx-1" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="bg-amber-500/5 dark:bg-amber-500/10 border-r-4 border-amber-500 rounded-xl p-4 my-4 font-bold italic text-amber-900 dark:text-amber-300" {...props} />,
                          hr: ({node, ...props}) => <hr className="my-8 border-slate-200 dark:border-slate-800/80" {...props} />,
                        }}
                      >
                        {explanationText}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#fcfbf9] dark:bg-slate-900 border border-emerald-100/50 dark:border-slate-800/80 rounded-[2.5rem] p-6 md:p-10 shadow-lg text-right"
                    dir="rtl"
                  >
                    <div className="flex items-center gap-3 border-b border-emerald-100/70 dark:border-slate-800/80 pb-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-slate-200">تدريبات اللوحة التفاعلية</h2>
                        <p className="text-[10px] font-bold text-slate-400">تطبيق تفاعلي لقياس مدى فهمك للوحة</p>
                      </div>
                    </div>

                    {quizQuestions.length > 0 ? (
                      !quizFinished ? (
                        <div className="space-y-6">
                          
                          {/* Progress indicators */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              السؤال {currentQuestionIdx + 1} من {quizQuestions.length}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              الدرجة الحالية: {score} صحيحة
                            </span>
                          </div>
                          
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 dark:bg-emerald-600 transition-all duration-300"
                              style={{ width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%` }}
                            />
                          </div>

                          {/* Question Content */}
                          <div className="space-y-6 pt-2">
                            <h3 className="text-lg md:text-xl font-black text-slate-850 dark:text-slate-100 leading-snug">
                              {quizQuestions[currentQuestionIdx].question}
                            </h3>

                            {/* Answer choices */}
                            <div className="grid grid-cols-1 gap-3.5">
                              {quizQuestions[currentQuestionIdx].options.map((option: string, idx: number) => {
                                const isSelected = selectedOptionIdx === idx;
                                const isCorrect = idx === quizQuestions[currentQuestionIdx].correctAnswer;
                                
                                let btnStyle = "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:border-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-800/30";
                                if (isSubmitted) {
                                  if (isCorrect) {
                                    btnStyle = "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-extrabold";
                                  } else if (isSelected) {
                                    btnStyle = "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-350 font-extrabold";
                                  } else {
                                    btnStyle = "bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-400 opacity-60";
                                  }
                                } else if (isSelected) {
                                  btnStyle = "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-extrabold";
                                }

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleOptionClick(idx)}
                                    disabled={isSubmitted}
                                    className={cn(
                                      "w-full text-right p-4.5 rounded-2xl transition-all flex items-center justify-between text-base font-bold shadow-sm",
                                      btnStyle
                                    )}
                                  >
                                    <span className="pl-4">{option}</span>
                                    {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                                    {isSubmitted && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Medical explanation box for review */}
                            {isSubmitted && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-emerald-500/5 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 shadow-inner"
                              >
                                <h4 className="text-emerald-700 dark:text-emerald-400 font-black text-sm mb-1.5 flex items-center gap-1.5">
                                  💡 التفسير والشرح السريري:
                                </h4>
                                <p className="text-sm text-slate-650 dark:text-slate-300 font-bold leading-relaxed">
                                  {quizQuestions[currentQuestionIdx].explanation}
                                </p>
                              </motion.div>
                            )}

                            {/* Control button (Confirm / Next) */}
                            <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-800/80">
                              {!isSubmitted ? (
                                <button
                                  onClick={handleSubmitAnswer}
                                  disabled={selectedOptionIdx === null}
                                  className="px-8 py-3.5 bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800/60 dark:disabled:text-slate-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base transition-all shadow-md"
                                >
                                  تأكيد الإجابة
                                </button>
                              ) : (
                                <button
                                  onClick={handleNextQuestion}
                                  className="px-8 py-3.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl font-black text-base transition-all shadow-md"
                                >
                                  {currentQuestionIdx + 1 === quizQuestions.length ? "عرض النتيجة النهائية" : "السؤال التالي"}
                                </button>
                              )}
                            </div>

                          </div>

                        </div>
                      ) : (
                        <div className="text-center py-10 max-w-sm mx-auto space-y-6">
                          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto text-4xl shadow-md">
                            🏆
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">تم إنجاز الاختبار!</h3>
                            <p className="text-xs text-slate-400 font-bold">رائع! لقد أتممت جميع أسئلة هذه اللوحة بنجاح</p>
                          </div>
                          <div className="p-6 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/80 shadow-inner">
                            <span className="text-[10px] font-black text-slate-400 block mb-1">النتيجة النهائية</span>
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{score} / {quizQuestions.length}</span>
                          </div>
                          <button
                            onClick={resetQuiz}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            <RotateCcw className="w-4 h-4" /> 
                            <span>إعادة محاولة الاختبار</span>
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-16 max-w-md mx-auto space-y-4">
                        <span className="text-5xl">🧠</span>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">أسئلة التدريب قيد التحضير</h3>
                        <p className="text-sm text-slate-400 font-bold leading-relaxed">
                          أهلاً بك! الأسئلة التفاعلية المخصصة لهذه اللوحة البصرية قيد الإعداد الطبي والتنسيق الفني، وسنقوم بدمجها فور توفرها لتتمكن من تقييم مستواك بنفسك!
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </section>

        </div>
      </main>

      {/* 3. Full-Screen Zoomable Image Modal */}
      <AnimatePresence>
        {isImageZoomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/98 backdrop-blur-md p-4"
          >
            {/* Close button top left */}
            <button 
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-6 left-6 p-4 bg-white/10 text-white hover:bg-rose-600 hover:scale-105 rounded-full transition-all border border-white/20 z-[3010]"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-full max-h-full flex items-center justify-center p-2"
            >
              <img 
                src={imagePath} 
                alt={cleanTitle} 
                className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl select-none shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
