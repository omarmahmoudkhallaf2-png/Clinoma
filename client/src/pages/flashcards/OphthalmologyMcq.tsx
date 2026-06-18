import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, XCircle, BookOpen, Award, AlertCircle, ChevronRight, 
  Sparkles, RotateCcw, Flag, Trash2, HelpCircle, Copy, Moon, Sun, Timer, ShieldAlert, BookMarked, Bookmark
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

interface MCQChapter {
  id: number;
  title: string;
  titleAr?: string;
  questions: MCQQuestion[];
}

import mcqData from './ophth_mcq_data.json';

interface MCQData {
  chapters: MCQChapter[];
  exam43Group1: MCQQuestion[];
  exam43Group2: MCQQuestion[];
  exam41: MCQQuestion[];
}

const MCQ_DATA = mcqData as MCQData;

const getAllQuestions = (): MCQQuestion[] => {
  const chapterQ = MCQ_DATA.chapters.flatMap(ch => ch.questions);
  return [...chapterQ, ...MCQ_DATA.exam43Group1, ...MCQ_DATA.exam43Group2, ...MCQ_DATA.exam41];
};

type ScreenState = 'menu' | 'chapters-list' | 'exam43-groups-list' | 'quiz' | 'summary';

export default function OphthalmologyMcq({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<ScreenState>('menu');
  const theme = 'dark';

  const [selectedCategory, setSelectedCategory] = useState<'chapters' | 'exam43' | 'exam41' | 'incorrect' | 'flagged' | null>(null);
  const [activeChapter, setActiveChapter] = useState<MCQChapter | null>(null);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);

  // Firestore & Cache lists
  const [incorrectIds, setIncorrectIds] = useState<string[]>([]);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [originalIncorrectIds, setOriginalIncorrectIds] = useState<string[]>([]);
  const [originalFlaggedIds, setOriginalFlaggedIds] = useState<string[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Timer states
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [showTimeAlert, setShowTimeAlert] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      const user = auth.currentUser;
      let cachedIncorrect = localStorage.getItem('ophth_mcq_incorrect_ids');
      let cachedFlagged = localStorage.getItem('ophth_mcq_flagged_ids');

      let initialIncorrect: string[] = cachedIncorrect ? JSON.parse(cachedIncorrect) : [];
      let initialFlagged: string[] = cachedFlagged ? JSON.parse(cachedFlagged) : [];

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'mcq_progress', 'ophthalmology');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.incorrectQuestionIds) initialIncorrect = data.incorrectQuestionIds;
            if (data.flaggedQuestionIds) initialFlagged = data.flaggedQuestionIds;
          }
        } catch (error) {
          console.error("Error loading progress from Firestore:", error);
        }
      }

      setIncorrectIds(initialIncorrect);
      setFlaggedIds(initialFlagged);
      setOriginalIncorrectIds([...initialIncorrect]);
      setOriginalFlaggedIds([...initialFlagged]);
      
      localStorage.setItem('ophth_mcq_incorrect_ids', JSON.stringify(initialIncorrect));
      localStorage.setItem('ophth_mcq_flagged_ids', JSON.stringify(initialFlagged));
      setIsLoading(false);
    };

    loadProgress();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (screen === 'quiz') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        setQuestionTime(prev => {
          const nextVal = prev + 1;
          if (nextVal >= 120 && !isAnswerChecked) {
            setShowTimeAlert(true);
          }
          return nextVal;
        });
      }, 1000);
    } else {
      setElapsedTime(0);
      setQuestionTime(0);
      setShowTimeAlert(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [screen, currentIdx, isAnswerChecked]);

  // Reset alert on answer check
  useEffect(() => {
    if (isAnswerChecked) {
      setShowTimeAlert(false);
    }
  }, [isAnswerChecked]);

  // Reset question timer on index change
  useEffect(() => {
    setQuestionTime(0);
    setShowTimeAlert(false);
  }, [currentIdx]);

  const updateCache = (newIncorrect: string[], newFlagged: string[]) => {
    localStorage.setItem('ophth_mcq_incorrect_ids', JSON.stringify(newIncorrect));
    localStorage.setItem('ophth_mcq_flagged_ids', JSON.stringify(newFlagged));
  };

  const startQuiz = (categoryQuestions: MCQQuestion[]) => {
    setQuestions(categoryQuestions);
    setCurrentIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswerChecked(false);
    setScore(0);
    setScreen('quiz');
  };

  const selectCategory = (category: 'chapters' | 'exam43' | 'exam41' | 'incorrect' | 'flagged') => {
    setSelectedCategory(category);
    if (category === 'chapters') {
      setScreen('chapters-list');
    } else if (category === 'exam43') {
      setScreen('exam43-groups-list');
    } else if (category === 'exam41') {
      startQuiz(MCQ_DATA.exam41);
    } else if (category === 'incorrect') {
      const allQ = getAllQuestions();
      const filtered = allQ.filter(q => incorrectIds.includes(q.id));
      startQuiz(filtered);
    } else if (category === 'flagged') {
      const allQ = getAllQuestions();
      const filtered = allQ.filter(q => flaggedIds.includes(q.id));
      startQuiz(filtered);
    }
  };

  const handleOptionClick = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOptionIdx(idx);

    const currentQuestion = questions[currentIdx];
    const isCorrect = idx === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
      if (incorrectIds.includes(currentQuestion.id)) {
        const updated = incorrectIds.filter(id => id !== currentQuestion.id);
        setIncorrectIds(updated);
        updateCache(updated, flaggedIds);
      }
    } else {
      if (!incorrectIds.includes(currentQuestion.id)) {
        const updated = [...incorrectIds, currentQuestion.id];
        setIncorrectIds(updated);
        updateCache(updated, flaggedIds);
      }
    }
    setIsAnswerChecked(true);
  };

  const toggleFlag = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    let updated: string[];
    if (flaggedIds.includes(questionId)) {
      updated = flaggedIds.filter(id => id !== questionId);
    } else {
      updated = [...flaggedIds, questionId];
    }
    setFlaggedIds(updated);
    updateCache(incorrectIds, updated);
  };

  const copyQuestion = (e: React.MouseEvent, questionObj: any) => {
    e.stopPropagation();
    if (!questionObj) return;
    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const optionsText = questionObj.options && questionObj.options.length > 0
      ? questionObj.options.map((opt: string, idx: number) => `${optionLetters[idx] || (idx + 1)}. ${opt}`).join('\n')
      : '';
    const textToCopy = `${questionObj.question}\n\n${optionsText}`.trim();
    navigator.clipboard.writeText(textToCopy);
    toast.success("تم نسخ السؤال والاختيارات بنجاح! 📋");
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswerChecked(false);
    } else {
      setScreen('summary');
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswerChecked(false);
    setScore(0);
    setScreen('quiz');
  };

  const goBackToMenu = () => {
    setScreen('menu');
    setSelectedCategory(null);
    setActiveChapter(null);
  };

  const handleSaveAndExit = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'mcq_progress', 'ophthalmology');
        await setDoc(docRef, {
          incorrectQuestionIds: incorrectIds,
          flaggedQuestionIds: flaggedIds,
          lastSaved: new Date()
        }, { merge: true });
      } catch (error) {
        console.error("Error saving progress to Firestore:", error);
      }
    }
    setShowExitModal(false);
    onExit();
  };

  const handleDiscardAndExit = () => {
    updateCache(originalIncorrectIds, originalFlaggedIds);
    setShowExitModal(false);
    onExit();
  };

  const handleRequestExit = () => {
    const hasChanges = 
      JSON.stringify(incorrectIds) !== JSON.stringify(originalIncorrectIds) ||
      JSON.stringify(flaggedIds) !== JSON.stringify(originalFlaggedIds);

    if (hasChanges) {
      setShowExitModal(true);
    } else {
      onExit();
    }
  };

  const handleBack = () => {
    if (screen === 'menu') {
      handleRequestExit();
    } else if (screen === 'chapters-list' || screen === 'exam43-groups-list') {
      goBackToMenu();
    } else if (screen === 'quiz' || screen === 'summary') {
      if (selectedCategory === 'chapters') {
        setScreen('chapters-list');
      } else if (selectedCategory === 'exam43') {
        setScreen('exam43-groups-list');
      } else {
        goBackToMenu();
      }
    }
  };

  const currentQuestion = questions[currentIdx];

  // Theme Class Maps
  const isDark = theme === 'dark';
  const pageBg = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const headerTitleColor = isDark ? 'text-white' : 'text-slate-900';

  if (isLoading) {
    return (
      <div className={`min-h-screen ${pageBg} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-sm">جاري تحميل بياناتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageBg} font-sans p-4 sm:p-6 md:p-12 overflow-x-hidden transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4" dir="rtl">
          <div>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${headerTitleColor} mb-1 font-display`}>بنك الأسئلة MCQ 🎯</h2>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base">بنك أسئلة الرمد المتكامل مقسم بكتاب القسم والامتحانات</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-bold text-xs sm:text-sm md:text-base px-3.5 py-2 sm:px-5 sm:py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm shrink-0 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 transform rotate-180" />
              <span>{screen === 'menu' ? 'مغادرة البنك' : 'رجوع'}</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Main Categories Menu */}
          {screen === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 sm:space-y-8"
              dir="rtl"
            >
              {/* Top Quick Stats for Flagged and Incorrect */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Incorrect Questions Card */}
                <motion.button
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => selectCategory('incorrect')}
                  disabled={incorrectIds.length === 0}
                  className={`p-6 sm:p-8 rounded-[2rem] border text-right transition-all flex items-center justify-between cursor-pointer ${
                    incorrectIds.length > 0 
                      ? 'bg-rose-500/5 dark:bg-rose-950/10 border-rose-300 hover:border-rose-450 hover:shadow-xl hover:shadow-rose-500/5' 
                      : `${cardBg} opacity-60 cursor-not-allowed`
                  }`}
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${
                      incorrectIds.length > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg sm:text-xl">الأسئلة الخاطئة</h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">الأسئلة التي أجبت عليها بشكل خاطئ</p>
                    </div>
                  </div>
                  <span className={`text-lg sm:text-xl font-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl ${
                    incorrectIds.length > 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {incorrectIds.length}
                  </span>
                </motion.button>

                {/* Flagged Questions Card */}
                <motion.button
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => selectCategory('flagged')}
                  disabled={flaggedIds.length === 0}
                  className={`p-6 sm:p-8 rounded-[2rem] border text-right transition-all flex items-center justify-between cursor-pointer ${
                    flaggedIds.length > 0 
                      ? 'bg-amber-500/5 dark:bg-amber-950/10 border-amber-300 hover:border-amber-400/80 hover:shadow-xl hover:shadow-amber-500/5' 
                      : `${cardBg} opacity-60 cursor-not-allowed`
                  }`}
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${
                      flaggedIds.length > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg sm:text-xl">الأسئلة المعلّمة</h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">الأسئلة التي وضعت عليها علامة للمراجعة</p>
                    </div>
                  </div>
                  <span className={`text-lg sm:text-xl font-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl ${
                    flaggedIds.length > 0 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {flaggedIds.length}
                  </span>
                </motion.button>
              </div>

              {/* Main Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Chapters card */}
                <motion.button
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => selectCategory('chapters')}
                  className={`${cardBg} p-6 sm:p-8 md:p-10 rounded-[2rem] border shadow-sm hover:shadow-xl hover:shadow-blue-500/5 text-right group transition-all flex flex-col justify-between min-h-[220px] sm:min-h-[260px] cursor-pointer`}
                >
                  <div className="space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-sm border border-blue-500/20">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black group-hover:text-blue-500 transition-colors">أسئلة كتاب القسم</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-base mt-2 leading-relaxed">تصفح أسئلة كتاب القسم مقسمة لكل شابتر في منهج الرمد للمذاكرة والتركيز.</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-blue-500 font-bold text-sm sm:text-base">
                    <span>تصفح كتاب القسم</span>
                    <ChevronRight className="w-4 h-4 transform rotate-180" />
                  </div>
                </motion.button>

                {/* Exam 43 card */}
                <motion.button
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => selectCategory('exam43')}
                  className={`${cardBg} p-6 sm:p-8 md:p-10 rounded-[2rem] border shadow-sm hover:shadow-xl hover:shadow-purple-500/5 text-right group transition-all flex flex-col justify-between min-h-[220px] sm:min-h-[260px] cursor-pointer`}
                >
                  <div className="space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shadow-sm border border-purple-500/20">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black group-hover:text-purple-500 transition-colors">امتحان 43 (Exam 43)</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-base mt-2 leading-relaxed">حل أسئلة امتحان الرمد دور 43 بالكامل لتقييم مستواك الفعلي.</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-purple-500 font-bold text-sm sm:text-base">
                    <span>تصفح المجموعات</span>
                    <ChevronRight className="w-4 h-4 transform rotate-180" />
                  </div>
                </motion.button>

                {/* Exam 41 card */}
                <motion.button
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => selectCategory('exam41')}
                  className={`${cardBg} p-6 sm:p-8 md:p-10 rounded-[2rem] border shadow-sm hover:shadow-xl hover:shadow-amber-500/5 text-right group transition-all flex flex-col justify-between min-h-[220px] sm:min-h-[260px] cursor-pointer`}
                >
                  <div className="space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-sm border border-amber-500/20">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black group-hover:text-amber-500 transition-colors">امتحان 41 (Exam 41)</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-base mt-2 leading-relaxed">تدرب على أسئلة امتحان الرمد دور 41 واكتشف نقاط القوة والضعف.</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-amber-500 font-bold text-sm sm:text-base">
                    <span>ابدأ الامتحان</span>
                    <ChevronRight className="w-4 h-4 transform rotate-180" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Chapters List Menu */}
          {screen === 'chapters-list' && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
              dir="rtl"
            >
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-6">اختر شابتر كتاب القسم لبدء الأسئلة:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MCQ_DATA.chapters.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChapter(ch);
                      startQuiz(ch.questions);
                    }}
                    className={`flex items-center justify-between p-5 sm:p-6 ${cardBg} border rounded-[1.5rem] hover:border-blue-500 hover:shadow-md transition-all text-right group cursor-pointer active:scale-[0.99]`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-mono font-black text-sm sm:text-base shrink-0 border border-blue-500/20">
                        {ch.id}
                      </span>
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors block text-base sm:text-lg">
                          {ch.titleAr || ch.title}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                          {ch.questions.length} سؤال
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-400 transform rotate-180 group-hover:translate-x-[-4px] transition-transform" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Exam 43 Groups List Menu */}
          {screen === 'exam43-groups-list' && (
            <motion.div
              key="exam43-groups"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
              dir="rtl"
            >
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-6">اختر المجموعة لبدء أسئلة امتحان 43:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Group 1 Card */}
                <button
                  onClick={() => startQuiz(MCQ_DATA.exam43Group1)}
                  className={`flex items-center justify-between p-6 sm:p-8 ${cardBg} border rounded-[2rem] hover:border-purple-500 hover:shadow-md transition-all text-right group cursor-pointer active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-mono font-black text-lg shrink-0 border border-purple-500/20">
                      ١
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-purple-500 transition-colors block text-lg sm:text-xl">
                        المجموعة الأولى
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                        {MCQ_DATA.exam43Group1.length} أسئلة
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-400 transform rotate-180 group-hover:translate-x-[-4px] transition-transform" />
                </button>

                {/* Group 2 Card */}
                <button
                  onClick={() => startQuiz(MCQ_DATA.exam43Group2)}
                  className={`flex items-center justify-between p-6 sm:p-8 ${cardBg} border rounded-[2rem] hover:border-purple-500 hover:shadow-md transition-all text-right group cursor-pointer active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-mono font-black text-lg shrink-0 border border-purple-500/20">
                      ٢
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-purple-500 transition-colors block text-lg sm:text-xl">
                        المجموعة الثانية
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                        {MCQ_DATA.exam43Group2.length} أسئلة
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-400 transform rotate-180 group-hover:translate-x-[-4px] transition-transform" />
                </button>

              </div>
            </motion.div>
          )}

          {/* Quiz screen */}
          {screen === 'quiz' && currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-6"
              dir="rtl"
            >
              {/* Question progress and timer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 px-1">
                <span>السؤال {currentIdx + 1} من {questions.length}</span>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <Timer className="w-4 h-4 text-blue-500" />
                    <span className="font-mono text-slate-700 dark:text-slate-300">{formatTime(elapsedTime)}</span>
                  </div>
                  <span>النتيجة الحالية: {score} / {currentIdx}</span>
                </div>
              </div>

              <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300/50 dark:border-slate-800/80 shadow-inner">
                <div 
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                />
              </div>

              {/* 2 Minute warning alert */}
              {showTimeAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-500/10 border-2 border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-sm font-bold">
                    تنبيه: لقد تجاوزت دقيقتين في هذا السؤال! حاول اختيار الإجابة والتحقق منها.
                  </p>
                </motion.div>
              )}

              {/* Question Card */}
              <div className={`${cardBg} rounded-[2rem] sm:rounded-[2.5rem] border p-6 sm:p-10 md:p-12 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-8 relative overflow-hidden`}>
                
                {/* Flag, Copy and question indicator */}
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full uppercase tracking-wider">
                    سؤال MCQ
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Copy Question Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => copyQuestion(e, currentQuestion)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="نسخ السؤال إلى الحافظة"
                    >
                      <Copy className="w-5 h-5" />
                    </motion.button>
                    {/* Flag button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleFlag(e, currentQuestion.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        flaggedIds.includes(currentQuestion.id)
                          ? 'bg-amber-500/10 border-amber-300 text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/10'
                          : isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-650 hover:bg-slate-100'
                      }`}
                      title={flaggedIds.includes(currentQuestion.id) ? 'إزالة العلامة' : 'علم على السؤال'}
                    >
                      <Flag className={`w-5 h-5 ${flaggedIds.includes(currentQuestion.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </motion.button>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black leading-relaxed text-left pl-1" dir="ltr">
                  {currentQuestion.question}
                </h3>

                {/* Options list */}
                <div className="grid grid-cols-1 gap-4" dir="ltr">
                  {currentQuestion.options.map((option, idx) => {
                    let optionStyle = isDark
                      ? "border-slate-800 bg-slate-950/40 text-slate-350 hover:bg-slate-900 hover:border-slate-700 border-2"
                      : "border-slate-200 border-2 hover:border-slate-300 bg-slate-50/50 text-slate-700 hover:bg-slate-100/30";
                    
                    if (selectedOptionIdx === idx && !isAnswerChecked) {
                      optionStyle = isDark
                        ? "border-blue-500 border-2 bg-blue-950/40 text-blue-300 font-black shadow-md shadow-blue-500/10"
                        : "border-blue-600 border-2 bg-blue-50/70 text-blue-900 font-black shadow-md shadow-blue-500/10";
                    } else if (isAnswerChecked) {
                      if (idx === currentQuestion.correctAnswerIndex) {
                        optionStyle = isDark
                          ? "border-emerald-500 border-2 bg-emerald-950/30 text-emerald-300 font-black shadow-md shadow-emerald-500/10"
                          : "border-emerald-600 border-2 bg-emerald-50 text-emerald-800 font-black shadow-md shadow-emerald-500/10";
                      } else if (selectedOptionIdx === idx && idx !== currentQuestion.correctAnswerIndex) {
                        optionStyle = isDark
                          ? "border-rose-500 border-2 bg-rose-950/30 text-rose-300 font-black shadow-md shadow-rose-500/10"
                          : "border-rose-600 border-2 bg-rose-50 text-rose-800 font-black shadow-md shadow-rose-500/10";
                      } else {
                        optionStyle = isDark
                          ? "border-slate-800 opacity-40 text-slate-600"
                          : "border-slate-200/60 border-2 bg-slate-50/10 text-slate-400 opacity-65";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        disabled={isAnswerChecked}
                        className={`w-full p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-left text-base sm:text-lg font-bold transition-all flex items-center justify-between cursor-pointer active:scale-[0.995] ${optionStyle}`}
                      >
                        <span>{option}</span>
                        {isAnswerChecked && idx === currentQuestion.correctAnswerIndex && (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 ml-2" />
                        )}
                        {isAnswerChecked && selectedOptionIdx === idx && idx !== currentQuestion.correctAnswerIndex && (
                          <XCircle className="w-6 h-6 text-rose-500 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="pt-4 flex justify-between gap-4">
                  {isAnswerChecked ? (
                    <button
                      onClick={nextQuestion}
                      className="px-8 py-4.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black text-base sm:text-lg shadow-md transition-all w-full text-center cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {currentIdx < questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة'}
                    </button>
                  ) : (
                    <div className="w-full text-center py-4 text-slate-500 dark:text-slate-400 font-bold text-sm">
                      اختر إجابة من الخيارات أعلاه ليتم التحقق منها تلقائياً
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Summary Screen */}
          {screen === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto text-center space-y-6"
              dir="rtl"
            >
              <div className={`rounded-[2rem] border p-8 shadow-xl space-y-6 ${cardBg}`}>
                <Award className="w-16 h-16 text-indigo-500 mx-auto" />
                <div>
                  <h3 className="text-2xl font-black">أحسنت يا بطل! 🎉</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">لقد أكملت مجموعة الأسئلة الحالية بنجاح.</p>
                </div>

                <div className={`py-6 rounded-2.5xl flex justify-around ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">الأسئلة الصحيحة</span>
                    <span className="text-3xl font-black text-emerald-500">{score}</span>
                  </div>
                  <div className="w-px bg-slate-200 dark:bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">نسبة النجاح</span>
                    <span className="text-3xl font-black text-blue-500">{questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={resetQuiz}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-blue-200 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة المحاولة 🔄</span>
                  </button>
                  <button
                    onClick={goBackToMenu}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 text-sm font-bold rounded-2xl transition-all cursor-pointer active:scale-95"
                  >
                    العودة لقائمة بنك الأسئلة
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Save & Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl relative z-10 border text-center ${cardBg}`}
              dir="rtl"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-5 shadow-inner border border-blue-500/20">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-2">حفظ التقدم؟ 💾</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                هل ترغب في حفظ قائمة الأسئلة الخاطئة والمعلّمة الجديدة وإرسالها إلى حسابك على السحابة قبل مغادرة بنك الأسئلة؟
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSaveAndExit}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-200 cursor-pointer active:scale-95"
                >
                  نعم، حفظ وخروج
                </button>
                <button
                  onClick={handleDiscardAndExit}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  خروج بدون حفظ
                </button>
              </div>
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full mt-3 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:text-slate-400 text-slate-400 text-xs font-bold rounded-xl transition-all border border-slate-200/50 dark:border-slate-800 cursor-pointer active:scale-95"
              >
                إلغاء والعودة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
