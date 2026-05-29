import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, FileText, Download, Play, Clock, ArrowRight, Sparkles, 
  CheckCircle, AlertTriangle, ShieldAlert, Award, RefreshCw, Settings, HelpCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mocking audio feedback for premium interaction
const playSound = (type: 'click' | 'correct' | 'wrong' | 'success') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'click') {
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'correct') {
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(250, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'success') {
      // Play a little victory fanfare
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const oscNode = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscNode.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime + idx * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + idx * 0.1 + 0.2);
        oscNode.start(audioCtx.currentTime + idx * 0.1);
        oscNode.stop(audioCtx.currentTime + idx * 0.1 + 0.25);
      });
    }
  } catch (e) {
    // Audio Context might be blocked by browser autoplay policy
  }
};

interface Chapter {
  title: string;
  subjectId: string;
  slideName: string;
}

const DAY_CHAPTERS: Record<number, Chapter[]> = {
  1: [
    { title: 'Tetralogy of Fallot (TOF) & Hypercyanotic Spells', subjectId: 'cardiovascular_diseases', slideName: 'Tetralogy of Fallot (TOF) & Hypercyanotic Spells.jpeg' },
    { title: 'Ventricular Septal Defect (VSD) - 2', subjectId: 'cardiovascular_diseases', slideName: 'Ventricular Septal Defect (VSD) - 2.jpeg' },
    { title: 'Patent Ductus Arteriosus (PDA)', subjectId: 'cardiovascular_diseases', slideName: 'Patent Ductus Arteriosus (PDA).jpeg' },
    { title: 'DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA)', subjectId: 'endocrinology', slideName: 'DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA).jpeg' },
    { title: 'CHILDHOOD OBESITY', subjectId: 'endocrinology', slideName: 'CHILDHOOD OBESITY.jpeg' },
  ],
  2: [
    { title: 'CHROMOSOMAL ABERRATIONS & DISORDERS', subjectId: 'genetic_diseases', slideName: 'CHROMOSOMAL ABERRATIONS & DISORDERS.jpeg' },
    { title: 'CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE', subjectId: 'genetic_diseases', slideName: 'CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE.jpeg' },
    { title: 'PEDIATRIC GROWTH', subjectId: 'growth_development', slideName: 'PEDIATRIC GROWTH.jpeg' },
    { title: 'Cerebral Palsy (CP)', subjectId: 'neurology', slideName: 'Cerebral Palsy (CP).jpeg' },
    { title: 'The Floppy Infant Syndrome', subjectId: 'neurology', slideName: 'The Floppy Infant Syndrome.jpeg' }
  ],
  3: [
    { title: 'The Thalassemia Syndromes (Alpha & Beta)', subjectId: 'hematology_oncology', slideName: 'The Thalassemia Syndromes (Alpha & Beta).jpeg' },
    { title: 'Iron Deficiency Anemia (IDA)', subjectId: 'hematology_oncology', slideName: 'Iron Deficiency Anemia (IDA).jpeg' },
    { title: 'Platelet Disorders ITP & Thrombocytopenias', subjectId: 'hematology_oncology', slideName: 'Platelet Disorders ITP & Thrombocytopenias.jpeg' },
    { title: 'PROTEIN ENERGY MALNUTRITION (PEM)', subjectId: 'nutrition', slideName: 'PROTEIN ENERGY MALNUTRITION (PEM).jpeg' },
    { title: 'RICKETS & TETANY', subjectId: 'nutrition', slideName: 'RICKETS & TETANY.jpeg' },
    { title: 'Chicken Pox (Varicella)', subjectId: 'infections', slideName: 'Chicken Pox (Varicella).jpeg' }
  ]
};

const PDF_RESOURCES = [
  { id: 'questions', title: 'أسئلة بنك معسكر الورقة الأولى PDF', size: '2.4 MB', type: 'أسئلة تفصيلية' },
  { id: 'summary', title: 'مذكرة المراجعة السريعة للمعسكر PDF', size: '1.8 MB', type: 'ملخص الذهبي' }
];

interface MatchingPair {
  id: string;
  question: string;
  answer: string;
}

const MATCHING_POOL: MatchingPair[] = [
  { id: '1', question: 'Widely split & fixed S2', answer: 'Atrial Septal Defect (ASD)' },
  { id: '2', question: 'Continuous machinery murmur', answer: 'Patent Ductus Arteriosus (PDA)' },
  { id: '3', question: 'Boot-shaped heart on X-ray', answer: 'Tetralogy of Fallot (TOF)' },
  { id: '4', question: 'Egg-on-a-string heart shape', answer: 'Transposition of Great Arteries (TGA)' },
  { id: '5', question: 'Rib notching on Chest X-ray', answer: 'Coarctation of the Aorta (CoA)' },
  { id: '6', question: 'Knee-Chest position therapy', answer: 'Hypercyanotic Tet Spell' },
  { id: '7', question: 'Webbed neck & short female stature', answer: 'Turner Syndrome' },
  { id: '8', question: '47, XXY karyotype & long limbs', answer: 'Klinefelter Syndrome' },
  { id: '9', question: 'Overlapping fingers & rocker-bottom feet', answer: 'Edward Syndrome (Trisomy 18)' },
  { id: '10', question: 'Cleft lip/palate & microphthalmia', answer: 'Patau Syndrome (Trisomy 13)' }
];

export default function FirstPaperCamp() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);

  // Time & Date scheduling configuration
  const [startTimeStr, setStartTimeStr] = useState<string>(() => {
    return localStorage.getItem('camp_start_time') || new Date(Date.now() - 5 * 60 * 1000).toISOString().slice(0, 16); // Defaults to 5 mins ago (active)
  });
  const [durationMins, setDurationMins] = useState<number>(() => {
    return Number(localStorage.getItem('camp_duration') || '15');
  });

  const [timeRemainingToStart, setTimeRemainingToStart] = useState<number>(0);
  const [examState, setExamState] = useState<'locked' | 'ready' | 'active' | 'finished'>('ready');

  // Matching Test Gameplay State
  const [gameQuestions, setGameQuestions] = useState<{ id: string; text: string }[]>([]);
  const [gameAnswers, setGameAnswers] = useState<{ id: string; text: string }[]>([]);
  const [selectedQ, setSelectedQ] = useState<string | null>(null);
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // Maps Q id to A id
  const [wrongMatches, setWrongMatches] = useState<string[]>([]); // Q ids that were wrongly paired
  const [testTimeLeft, setTestTimeLeft] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // Timer interval for scheduling countdown
  useEffect(() => {
    const checkSchedule = () => {
      const startMs = new Date(startTimeStr).getTime();
      const nowMs = Date.now();
      const diff = startMs - nowMs;
      
      if (diff > 0) {
        setTimeRemainingToStart(Math.ceil(diff / 1000));
        setExamState('locked');
      } else {
        setTimeRemainingToStart(0);
        if (examState === 'locked') {
          setExamState('ready');
        }
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 1000);
    return () => clearInterval(interval);
  }, [startTimeStr, examState]);

  // Timer interval for the actual active test
  useEffect(() => {
    if (examState !== 'active') return;

    if (testTimeLeft <= 0) {
      finishTest();
      return;
    }

    const interval = setInterval(() => {
      setTestTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [testTimeLeft, examState]);

  const saveSettings = () => {
    localStorage.setItem('camp_start_time', startTimeStr);
    localStorage.setItem('camp_duration', durationMins.toString());
    setShowSettings(false);
    playSound('click');
  };

  const startMatchingTest = () => {
    playSound('success');
    // Prepare test contents (Shuffle 6 items from the pool for a dynamic experience)
    const shuffledPool = [...MATCHING_POOL].sort(() => Math.random() - 0.5).slice(0, 6);
    const qs = shuffledPool.map(item => ({ id: item.id, text: item.question })).sort(() => Math.random() - 0.5);
    const ans = shuffledPool.map(item => ({ id: item.id, text: item.answer })).sort(() => Math.random() - 0.5);
    
    setGameQuestions(qs);
    setGameAnswers(ans);
    setMatches({});
    setWrongMatches([]);
    setSelectedQ(null);
    setSelectedA(null);
    setTestTimeLeft(durationMins * 60);
    setExamState('active');
  };

  const handleQSelect = (qId: string) => {
    if (matches[qId]) return; // Already matched
    playSound('click');
    setSelectedQ(qId);
    if (selectedA) {
      processPair(qId, selectedA);
    }
  };

  const handleASelect = (aId: string) => {
    if (Object.values(matches).includes(aId)) return; // Already matched
    playSound('click');
    setSelectedA(aId);
    if (selectedQ) {
      processPair(selectedQ, aId);
    }
  };

  const processPair = (qId: string, aId: string) => {
    // Check if correct match
    if (qId === aId) {
      playSound('correct');
      setMatches(prev => ({ ...prev, [qId]: aId }));
      // Clear wrong tag if any
      setWrongMatches(prev => prev.filter(id => id !== qId));
    } else {
      playSound('wrong');
      // Highlight wrong flash feedback
      setWrongMatches(prev => [...prev, qId]);
      setTimeout(() => {
        setWrongMatches(prev => prev.filter(id => id !== qId));
      }, 800);
    }
    setSelectedQ(null);
    setSelectedA(null);
  };

  // Check if all matched
  useEffect(() => {
    if (examState === 'active' && gameQuestions.length > 0 && Object.keys(matches).length === gameQuestions.length) {
      finishTest();
    }
  }, [matches, gameQuestions, examState]);

  const finishTest = () => {
    playSound('success');
    // Calculate Score
    const correctCount = Object.keys(matches).length;
    const finalScore = Math.round((correctCount / gameQuestions.length) * 100);
    setScore(finalScore);
    setExamState('finished');
  };

  const handleChapterClick = (chap: Chapter) => {
    playSound('click');
    const folderId = chap.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    navigate(`/course/pediatrics_course/subject/${chap.subjectId}/folder/${folderId}`, {
      state: { slideName: chap.slideName }
    });
  };

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#090a0f] p-4 md:p-10 space-y-12 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button 
            onClick={() => navigate(`/course/pediatrics_course`)} 
            className="group self-start p-3 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-all flex items-center gap-3 font-black text-xs shadow-sm text-slate-700 dark:text-slate-200"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> 
            <span>العودة لمنهج الأطفال الرئيسي</span>
          </button>

          <button 
            onClick={() => { playSound('click'); setShowSettings(true); }}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:text-amber-500 transition-all flex items-center gap-2 font-black text-xs text-slate-700 dark:text-slate-200 shadow-sm"
          >
            <Settings className="w-4 h-4" />
            <span>لوحة التحكم بالمواعيد والاختبار</span>
          </button>
        </div>

        {/* Camp Header Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full font-black text-xs shadow-md animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>معسكر المراجعة المكثف</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-amber-600 to-rose-600 dark:from-slate-100 dark:via-amber-400 dark:to-rose-400 tracking-tight leading-tight">
            معسكر الورقة الأولى للأطفال
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg max-w-2xl mx-auto">
            مرحباً بك في المعسكر الشامل! قمنا بتقسيم أهم تفريدات وتحديدات الأطفال لثلاثة أيام منسقة لتضمن أعلى درجات التميز في الورقة الأولى.
          </p>
        </div>

        {/* 3 Days Interactive Chapters Section */}
        <div className="space-y-6">
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((day) => (
              <button
                key={day}
                onClick={() => { playSound('click'); setActiveDay(day); }}
                className={`relative px-8 py-4 rounded-2xl font-black text-sm md:text-base transition-all duration-300 shadow-md ${
                  activeDay === day 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white scale-[1.04]'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-amber-500/10'
                }`}
              >
                اليوم {day === 1 ? 'الأول' : day === 2 ? 'الثاني' : 'الثالث'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {DAY_CHAPTERS[activeDay].map((chap, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleChapterClick(chap)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-md hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div className="space-y-3">
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                      {chap.subjectId.replace('_', ' ')}
                    </span>
                    <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-3">
                      {chap.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 text-xs font-black text-amber-600 dark:text-amber-400">
                    <span>افتح المجلد التفاعلي</span>
                    <span className="transform group-hover:-translate-x-1.5 transition-transform">←</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mid-Camp Interactive Grid: PDFs and Testing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          
          {/* PDF Download Center */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 space-y-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">مركز تحميل الـ PDF</h2>
                <p className="text-sm font-bold text-slate-455">حمل مذكرات الأسئلة والشروحات الخاصة بالمعسكر.</p>
              </div>
            </div>

            <div className="space-y-4">
              {PDF_RESOURCES.map((pdf) => (
                <div 
                  key={pdf.id}
                  className="bg-white dark:bg-slate-955 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-xl flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-200">{pdf.title}</h4>
                      <p className="text-[11px] text-slate-450 font-bold flex items-center gap-2">
                        <span>الحجم: {pdf.size}</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400">{pdf.type}</span>
                      </p>
                    </div>
                  </div>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); playSound('click'); alert(`جاري تحضير ملف ${pdf.title} للتحميل المباشر...`); }}
                    className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Timed & Scheduled Matching Test Box */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 space-y-6 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                  <Award className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white">اختبار التوصيل التفاعلي</h2>
                  <p className="text-sm font-bold text-slate-450">اختبر معلوماتك في تشخيص حالات الأطفال بوقت وموعد محدد.</p>
                </div>
              </div>

              {/* Status banner */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/80 rounded-2xl p-4 flex items-center gap-4">
                <Clock className="w-5 h-5 text-amber-500" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400">مدة الاختبار المحددة</p>
                  <p className="text-sm font-black text-slate-850 dark:text-slate-200">{durationMins} دقيقة كاملة</p>
                </div>
              </div>
            </div>

            {/* Test Action Box */}
            <div className="pt-6">
              {examState === 'locked' ? (
                <div className="space-y-4 text-center p-6 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-[2rem]">
                  <ShieldAlert className="w-12 h-12 mx-auto text-amber-500 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-slate-800 dark:text-slate-200">هذا الاختبار مغلق حالياً</h4>
                    <p className="text-xs font-bold text-slate-400">سيفتح الاختبار تلقائياً بعد انتهاء الوقت التالي:</p>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-wider">
                    {formatCountdown(timeRemainingToStart)}
                  </div>
                </div>
              ) : examState === 'ready' ? (
                <button
                  onClick={startMatchingTest}
                  className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-lg transition-all shadow-lg hover:shadow-rose-500/20 hover:scale-[1.01] flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>دخول اختبار التوصيل الآن</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-black text-rose-500 bg-rose-500/10 p-3 rounded-xl animate-pulse">
                    <span>الاختبار قيد التشغيل حالياً!</span>
                    <button 
                      onClick={() => { playSound('click'); setExamState('ready'); }}
                      className="text-xs underline"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                  <button
                    onClick={() => { playSound('click'); setExamState('active'); }}
                    className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black transition-all hover:scale-[1.01]"
                  >
                    عرض نافذة الاختبار
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Popups & Overlays */}
      
      {/* 1. Scheduler Control Settings Popup */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] w-full max-w-md p-8 space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => { playSound('click'); setShowSettings(false); }}
                className="absolute top-6 left-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <span>تعديل إعدادات وجدولة الاختبار</span>
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  لوحة تحكم مرنة تتيح لك برمجة الموعد والوقت لتجربة الطلاب.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">تاريخ ووقت بدء الاختبار</label>
                  <input 
                    type="datetime-local" 
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-600 font-bold mt-1">تلميح: اختر تاريخاً مستقبلياً لاختبار شاشة العد التنازلي.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">مدة الاختبار (بالدقائق)</label>
                  <input 
                    type="number" 
                    value={durationMins}
                    onChange={(e) => setDurationMins(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={saveSettings}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl font-black text-sm hover:opacity-90 transition-opacity"
                >
                  حفظ التعديلات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Active Matching Gameplay Overlay */}
      <AnimatePresence>
        {examState === 'active' && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-[3rem] p-6 md:p-8 flex flex-col justify-between text-white relative shadow-2xl overflow-hidden"
            >
              {/* Decorative accents */}
              <div className="absolute top-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Game Top Info */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">اختبار التوصيل الفوري</h3>
                    <p className="text-xs text-slate-400 font-bold">قم بتوصيل العلامة التشخيصية السريرية بالمرض المطابق لها.</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-slate-950 border border-slate-800 px-5 py-2.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="font-mono text-lg font-bold text-rose-500">
                      {Math.floor(testTimeLeft / 60)}:{(testTimeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-slate-800" />
                  <div className="text-xs font-black text-slate-400">
                    التقدم: <span className="text-amber-500">{Object.keys(matches).length}</span> / {gameQuestions.length}
                  </div>
                </div>
              </div>

              {/* Matching Board Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 overflow-y-auto flex-1 px-2">
                {/* Column 1: Questions (Clinical Signs) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-right mb-2">العمود الأول: العلامة التشخيصية (Clinical Sign)</h4>
                  {gameQuestions.map((q) => {
                    const isMatched = !!matches[q.id];
                    const isSelected = selectedQ === q.id;
                    const isWrong = wrongMatches.includes(q.id);

                    return (
                      <button
                        key={q.id}
                        onClick={() => handleQSelect(q.id)}
                        disabled={isMatched}
                        className={`w-full p-5 rounded-2xl text-right font-black text-sm transition-all border ${
                          isMatched 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-60 cursor-default'
                            : isWrong 
                              ? 'bg-rose-600 border-rose-500 text-white animate-shake'
                              : isSelected
                                ? 'bg-amber-500 border-amber-500 text-slate-950 scale-[1.02] shadow-lg shadow-amber-500/20'
                                : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isMatched ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {isMatched ? '✓' : '?'}
                          </span>
                          <span className="flex-1 text-right">{q.text}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Column 2: Answers (Diagnosis) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-right mb-2">العمود الثاني: التشخيص النهائي (Final Diagnosis)</h4>
                  {gameAnswers.map((a) => {
                    const isMatched = Object.values(matches).includes(a.id);
                    const isSelected = selectedA === a.id;

                    return (
                      <button
                        key={a.id}
                        onClick={() => handleASelect(a.id)}
                        disabled={isMatched}
                        className={`w-full p-5 rounded-2xl text-right font-black text-sm transition-all border ${
                          isMatched 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-60 cursor-default'
                            : isSelected
                              ? 'bg-amber-500 border-amber-500 text-slate-950 scale-[1.02] shadow-lg shadow-amber-500/20'
                              : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex-1 text-right">{a.text}</span>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isMatched ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {isMatched ? '✓' : '•'}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Game Bottom Actions */}
              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <button
                  onClick={() => { playSound('click'); setExamState('ready'); }}
                  className="px-6 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs transition-colors"
                >
                  انسحاب وإغلاق النافذة
                </button>
                <div className="text-xs font-bold text-slate-500">
                  انقر على السؤال أولاً ثم إجابته الصحيحة لربطهما.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. finished Test Score overlay */}
      <AnimatePresence>
        {examState === 'finished' && (
          <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-55 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-lg p-10 text-center text-white space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px]" />

              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                  <Award className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black">أحسنت يا بطل! اكتمل الاختبار</h2>
                <p className="text-sm font-bold text-slate-400">نتيجتك النهائية في معسكر الورقة الأولى هي:</p>
              </div>

              {/* Score circular badge */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center bg-slate-950 border-4 border-slate-800 rounded-full">
                <div className="space-y-1">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
                    {score}%
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">التقييم العام</p>
                </div>
              </div>

              {/* feedback message */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-sm font-bold text-slate-300">
                {score >= 80 
                  ? 'رائع جداً! مستواك متميز ومستعد تماماً لاجتياز الورقة الأولى بتفوق باهر.' 
                  : score >= 50 
                    ? 'جيد جداً! لديك أساس قوي ولكن مراجعة بعض شباتر المعسكر ستضمن لك الدرجة الكاملة.'
                    : 'فرصة رائعة للمذاكرة! أعد تصفح مجلدات الأيام الثلاثة وأعد الاختبار لتحقق درجة أفضل.'}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { playSound('click'); setExamState('ready'); }}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-2xl font-black text-sm hover:scale-[1.01] transition-transform"
                >
                  العودة للمعسكر
                </button>
                <button
                  onClick={() => { playSound('click'); startMatchingTest(); }}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-black text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
