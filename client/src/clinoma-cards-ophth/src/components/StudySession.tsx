import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronDown, 
  HelpCircle,
  Eye, 
  CheckCircle2, 
  ListFilter,
  AlertTriangle,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import type { Question, Chapter } from '../types';
import { DifficultyLevel } from '../types';
import QuestionPrompt, { AnswerFormatter } from './QuestionFormatter';

interface StudySessionProps {
  chapter: Chapter;
  questions: Question[];
  onBack: () => void;
  addToReview: (id: string) => void;
  markAsMastered: (id: string) => void;
  masteredIds: string[];
}

const isQuestionCase = (q: Question): boolean => {
  const titleLower = q.title.toLowerCase();
  const idLower = q.id.toLowerCase();
  if (titleLower.includes('case') || idLower.includes('case') || titleLower.includes('scenario') || idLower.includes('scenario')) {
    return true;
  }
  
  const contentLower = q.content.toLowerCase();
  if (contentLower.includes('presents with') || 
      contentLower.includes('presents complaining') ||
      contentLower.includes('presents of') ||
      /year-old/i.test(contentLower) ||
      /\d+\s+year\s+old/i.test(contentLower) ||
      /child\s+presents/i.test(contentLower) ||
      /man\s+presents/i.test(contentLower) ||
      /woman\s+presents/i.test(contentLower) ||
      /boy\s+presents/i.test(contentLower) ||
      /girl\s+presents/i.test(contentLower)
  ) {
    return true;
  }

  return false;
};

export default function StudySession({ 
  chapter, 
  questions, 
  onBack, 
  addToReview, 
  markAsMastered,
  masteredIds
}: StudySessionProps) {
  // Navigation & Step states
  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(chapter.id !== 0);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(chapter.id === 0);
  
  // Choice states
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['all']);
  const [excludeMastered, setExcludeMastered] = useState<boolean>(true);
  
  // Custom Session configuration from user
  const [focusAlertEnabled, setFocusAlertEnabled] = useState<boolean>(true);
  const [focusAlertInterval, setFocusAlertInterval] = useState<number>(3); // 1 to 10 minutes
  const [sessionDuration, setSessionDuration] = useState<number>(30); // 10 minutes to 2 hours (120 minutes)
  const [displayMode, setDisplayMode] = useState<'cards' | 'list'>('cards');
  const [practiceCategory, setPracticeCategory] = useState<'study' | 'cases' | 'mixed'>('mixed');

  // Compute question pool counts in real-time based on selected topics
  const currentPoolOfSelectedTopicsAndMasteredType = useMemo(() => {
    let filtered;
    if (chapter.id === 0) {
      filtered = questions;
    } else {
      if (selectedTopics.includes('all') || selectedTopics.length === 0) {
        filtered = questions.filter(q => q.chapterId === chapter.id);
      } else {
        filtered = questions.filter(q => q.chapterId === chapter.id && q.topic && selectedTopics.includes(q.topic));
      }
    }
    
    if (excludeMastered) {
      const unmastered = filtered.filter(q => !masteredIds.includes(q.id));
      if (unmastered.length > 0) {
        filtered = unmastered;
      }
    }
    return filtered;
  }, [questions, chapter.id, selectedTopics, excludeMastered, masteredIds]);

  const studyCount = useMemo(() => currentPoolOfSelectedTopicsAndMasteredType.filter(q => !isQuestionCase(q)).length, [currentPoolOfSelectedTopicsAndMasteredType]);
  const casesCount = useMemo(() => currentPoolOfSelectedTopicsAndMasteredType.filter(q => isQuestionCase(q)).length, [currentPoolOfSelectedTopicsAndMasteredType]);
  const totalCount = currentPoolOfSelectedTopicsAndMasteredType.length;

  // Auto fallback if count for selected category is 0
  useEffect(() => {
    if (practiceCategory === 'cases' && casesCount === 0) {
      if (studyCount > 0) {
        setPracticeCategory('study');
      } else {
        setPracticeCategory('mixed');
      }
    } else if (practiceCategory === 'study' && studyCount === 0) {
      if (casesCount > 0) {
        setPracticeCategory('cases');
      } else {
        setPracticeCategory('mixed');
      }
    }
  }, [studyCount, casesCount, practiceCategory]);

  // Runtime states
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [initialUniqueCount, setInitialUniqueCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [masteredThisSession, setMasteredThisSession] = useState<Set<string>>(new Set());

  // Countdown timer states
  const [timeLeft, setTimeLeft] = useState<number>(1800); // countdown in seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimerCountingUp, setIsTimerCountingUp] = useState<boolean>(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState<boolean>(false);

  // List view state
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [showAllAnswersInList, setShowAllAnswersInList] = useState<boolean>(false);

  // Distraction tracking states
  const [timeSpent, setTimeSpent] = useState(0);
  const [showDistracted, setShowDistracted] = useState<boolean>(false);
  const [hasReturned, setHasReturned] = useState(false);

  const currentQuestion = sessionQuestions[currentIndex] || null;

  // Synthesis sound function using browser Web Audio API
  const playNotificationSound = (isCompletion: boolean = false) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      if (!isCompletion) {
        // High fidelity anti-mind-wandering chime
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
        gain2.gain.setValueAtTime(0.12, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.5);
      } else {
        // Joyful modular success chord for session completion
        const pitches = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        pitches.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + index * 0.1);
          gain.gain.setValueAtTime(0.12, now + index * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + index * 0.1);
          osc.stop(now + index * 0.1 + 0.55);
        });
      }
    } catch (error) {
      console.warn("Audio Context audio block due to policy restriction", error);
    }
  };

  // Play chime sound immediately whenever distracted warning shows up
  useEffect(() => {
    if (showDistracted) {
      playNotificationSound(false);
    }
  }, [showDistracted]);

  // Reset distraction state when changing card questions
  useEffect(() => {
    setTimeSpent(0);
    setShowDistracted(false);
    setHasReturned(false);
  }, [currentIndex, currentQuestion?.id]);

  // Interval timer for anti-mind-wandering alert detection
  useEffect(() => {
    if (!focusAlertEnabled || showDistracted || isFinished || isTopicSelectorOpen || isConfigModalOpen) {
      return;
    }

    const interval = setInterval(() => {
      setTimeSpent(prev => {
        const nextTime = prev + 1;
        const targetSeconds = focusAlertInterval * 60;
        if (nextTime >= targetSeconds) {
          setShowDistracted(true);
          return 0; // reset counter after triggering
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion?.id, currentIndex, showDistracted, isFinished, isTopicSelectorOpen, isConfigModalOpen, focusAlertEnabled, focusAlertInterval]);

  // Reset mind-wandering alert time spent whenever user scrolls, keys down, clicks, or moves mouse
  useEffect(() => {
    if (!focusAlertEnabled || isFinished || isTopicSelectorOpen || isConfigModalOpen) {
      return;
    }
    
    const resetIdle = () => {
      setTimeSpent(0);
    };
    
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('scroll', resetIdle, { passive: true });
    window.addEventListener('click', resetIdle);
    
    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('scroll', resetIdle);
      window.removeEventListener('click', resetIdle);
    };
  }, [focusAlertEnabled, isFinished, isTopicSelectorOpen, isConfigModalOpen]);

  // Countdown clock effect for session duration
  useEffect(() => {
    if (!isTimerRunning || isFinished || isTopicSelectorOpen || isConfigModalOpen) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (isTimerCountingUp) {
          return prev + 1;
        }

        if (prev <= 1) {
          clearInterval(timer);
          // Check if there are still questions left in this session
          const hasLeft = currentIndex < sessionQuestions.length - 1;
          if (hasLeft) {
            setIsTimerRunning(false);
            setShowContinuePrompt(true);
            playNotificationSound(true); // play completion sound chime
            return 0;
          } else {
            setIsFinished(true);
            playNotificationSound(true); // play completion sound chime
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, isFinished, isTopicSelectorOpen, isConfigModalOpen, isTimerCountingUp, currentIndex, sessionQuestions.length]);

  // Initializing the session with filtered questions and starting timer
  const startSession = () => {
    let filtered;
    if (chapter.id === 0) {
      filtered = questions;
    } else {
      if (selectedTopics.includes('all') || selectedTopics.length === 0) {
        filtered = questions.filter(q => q.chapterId === chapter.id);
      } else {
        filtered = questions.filter(q => q.chapterId === chapter.id && q.topic && selectedTopics.includes(q.topic));
      }
    }
    
    if (excludeMastered) {
      const unmastered = filtered.filter(q => !masteredIds.includes(q.id));
      if (unmastered.length > 0) {
        filtered = unmastered;
      }
    }

    if (practiceCategory === 'study') {
      filtered = filtered.filter(q => !isQuestionCase(q));
    } else if (practiceCategory === 'cases') {
      filtered = filtered.filter(q => isQuestionCase(q));
    }

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    setSessionQuestions(shuffled);
    setInitialUniqueCount(shuffled.length);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsFinished(false);
    setMasteredThisSession(new Set());
    
    // Set timer values
    setTimeLeft(sessionDuration * 60);
    setIsTimerRunning(true);
    setIsTimerCountingUp(false);
    setShowContinuePrompt(false);

    setIsTopicSelectorOpen(false);
    setIsConfigModalOpen(false);

    // Initial setup for list views
    setRevealedAnswers({});
    setShowAllAnswersInList(false);
  };

  const handleTopicsConfirmed = () => {
    setIsTopicSelectorOpen(false);
    setIsConfigModalOpen(true);
  };

  const toggleTopic = (topic: string) => {
    if (topic === 'all') {
      setSelectedTopics(['all']);
      return;
    }

    setSelectedTopics(prev => {
      const filtered = prev.filter(t => t !== 'all');
      if (filtered.includes(topic)) {
        const next = filtered.filter(t => t !== topic);
        return next.length === 0 ? ['all'] : next;
      } else {
        return [...filtered, topic];
      }
    });
  };

  const remainingCount = useMemo(() => {
    const uniqueIds = new Set(sessionQuestions.map(q => q.id));
    const masteredInThisSession = Array.from(uniqueIds).filter(id => masteredThisSession.has(id)).length;
    return Math.max(0, uniqueIds.size - masteredInThisSession);
  }, [sessionQuestions, masteredThisSession]);

  const handleDifficulty = (difficulty: DifficultyLevel) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    if (difficulty === DifficultyLevel.EASY) {
      markAsMastered(qId);
      setMasteredThisSession(prev => new Set(prev).add(qId));
      moveToNext();
    } else {
      addToReview(qId);
      
      // Handle recurrence
      let jump = 2;
      if (difficulty === DifficultyLevel.HARD) jump = 5;
      if (difficulty === DifficultyLevel.MEDIUM) jump = 10;
      
      const targetIndex = currentIndex + jump + 1;
      
      const updatedQueue = [...sessionQuestions];
      if (targetIndex < updatedQueue.length) {
        updatedQueue.splice(targetIndex, 0, currentQuestion);
      } else {
        updatedQueue.push(currentQuestion);
      }
      
      setSessionQuestions(updatedQueue);
      moveToNext();
    }
  };

  const moveToNext = () => {
    setShowAnswer(false);
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div id="study-session-container" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Distraction Alerts */}
      <AnimatePresence>
        {showDistracted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center"
              dir="rtl"
            >
              {!hasReturned ? (
                <>
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mb-6 shadow-inner animate-bounce">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-yellow-500 mb-8 font-sans leading-none">
                    متسرحش! ⏰
                  </h3>
                  <p className="text-slate-500 text-xs font-bold mb-6">لقد مرت فترة من الوقت بدون تفاعل، حافظ على تركيزك!</p>
                  <button
                    onClick={() => {
                      setShowDistracted(false);
                      setHasReturned(true);
                      setTimeSpent(0);
                    }}
                    className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-base rounded-2xl transition-all shadow-lg shadow-yellow-100 active:scale-95 cursor-pointer selection:bg-none"
                  >
                    يلا بينا
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-inner animate-pulse">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-red-600 mb-8 font-sans leading-none">
                    كفاية سرحان! 🎯
                  </h3>
                  <p className="text-slate-500 text-xs font-bold mb-6">المذاكرة الفعالة تتطلب يقظة تامة، عد لإنهاء جلستك الآن.</p>
                  <button
                    onClick={() => {
                      setShowDistracted(false);
                      setTimeSpent(0);
                    }}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-base rounded-2xl transition-all shadow-lg shadow-red-200 active:scale-95 cursor-pointer"
                  >
                    يلا بينا
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Continue Session Modal */}
      <AnimatePresence>
        {showContinuePrompt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative z-10 border border-slate-100 flex flex-col"
              style={{ direction: 'rtl' }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-tight">
                  انتهى وقت الجلسة المقررة! ⏱️
                </h3>
                <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed font-sans">
                  لم تنتهِ من جميع أسئلة هذه الجلسة بعد. هل تود استكمال الجلسة ومتابعة المذاكرة والأسئلة المتبقية؟
                </p>
                
                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsTimerCountingUp(true);
                      setTimeLeft(0); // starts counting up from 0
                      setIsTimerRunning(true);
                      setShowContinuePrompt(false);
                    }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    نعم، استكمال الجلسة ومواصلة المذاكرة 🚀
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsFinished(true);
                      setShowContinuePrompt(false);
                    }}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    لا، إنهاء الجلسة وعرض الملخص
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Topic Selection Modal */}
      <AnimatePresence>
        {isTopicSelectorOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-xl shadow-2xl border border-slate-150 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6" dir="rtl">
                <div className="text-right">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">تهيئة جلسة المذاكرة</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">اختر المواضيع الخاصة بـ {chapter.title} للمذاكرة</p>
                </div>
                <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  <ArrowLeft className="w-5 h-5 transform rotate-180" />
                </button>
              </div>

              {/* Scrollable Topics Area */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-hide mb-6">
                <button
                  onClick={() => toggleTopic('all')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-right transition-all border-2 ${selectedTopics.includes('all') ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100'}`}
                  dir="rtl"
                >
                  <div className="text-right">
                    <span className="font-bold text-sm block">📚 دراسة الفصل بالكامل (All Topics)</span>
                    <span className="text-[10px] opacity-75 block mt-0.5">
                      يحتوي على {questions.length} سؤال • ({questions.filter(q => masteredIds.includes(q.id)).length} متقن)
                    </span>
                  </div>
                  {selectedTopics.includes('all') && <CheckCircle2 className="w-5 h-5" />}
                </button>
                
                {chapter.topics && chapter.topics.map((top, idx) => {
                  const isSelected = selectedTopics.includes(top);
                  const topicQuestions = questions.filter(q => q.topic === top);
                  const totalTopicCount = topicQuestions.length;
                  const masteredTopicCount = topicQuestions.filter(q => masteredIds.includes(q.id)).length;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTopic(top)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl text-right transition-all border-2 ${isSelected ? 'bg-blue-50 border-blue-600 text-blue-800' : 'bg-white border-slate-100 text-slate-650 hover:border-slate-200'}`}
                      dir="rtl"
                    >
                      <div className="text-right">
                        <span className="font-bold text-sm block">{idx + 1}. {top}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          يحتوي على {totalTopicCount} سؤال • ({masteredTopicCount} متقن)
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Practice Filter Switch */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between mb-6" dir="rtl">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block font-sans">تخطي الأسئلة المتقنة (Exclude Mastered)</span>
                  <span className="text-[10px] text-slate-400 block font-normal">عرض الأسئلة غير المتقنة فقط لتوفير الوقت</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExcludeMastered(!excludeMastered)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none flex items-center ${excludeMastered ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={onBack}
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-extrabold transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleTopicsConfirmed}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95"
                >
                  التالي: ضبط تفضيلات الجلسة ➔
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Session Configuration Options Selector Modal */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-xl shadow-2xl border border-slate-150 flex flex-col max-h-[90vh]"
              dir="rtl"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="text-right">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">تفضيلات جلسة المذاكرة</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">اضبط إعدادات التركيز وعرض الأسئلة المناسبة لك</p>
                </div>
                {chapter.id !== 0 ? (
                  <button 
                    onClick={() => {
                      setIsConfigModalOpen(false);
                      setIsTopicSelectorOpen(true);
                    }} 
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={onBack} 
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Options Form container */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1 pl-1 mb-6">
                
                {/* A. Focus alerts anti mind wandering settings */}
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <span className="text-sm font-bold text-amber-900 block font-sans">تنبيه عدم السرحان</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFocusAlertEnabled(!focusAlertEnabled)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${focusAlertEnabled ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-180 flex items-center justify-center ${focusAlertEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  
                  {focusAlertEnabled && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <div className="flex justify-between text-xs font-semibold text-amber-800">
                        <span>المدة بين كل تنبيه:</span>
                        <span>كل {focusAlertInterval} {focusAlertInterval === 1 ? 'دقيقة' : focusAlertInterval === 2 ? 'دقيقتين' : 'دقائق'}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={focusAlertInterval}
                        onChange={(e) => setFocusAlertInterval(Number(e.target.value))}
                        className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600 block"
                      />
                    </div>
                  )}
                </div>

                {/* B. Session duration timer settings */}
                <div className="p-4 bg-blue-50/30 border border-blue-200 rounded-xl space-y-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#1E40AF] block font-sans">مدة جلسة المذاكرة</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-[#1E40AF]">
                      <span>زمن الجلسة المفضل:</span>
                      <span className="font-mono text-[#1D4ED8]">
                        {sessionDuration >= 60 
                          ? `${Math.floor(sessionDuration / 60)} ساعة ${sessionDuration % 60 > 0 ? `و ${sessionDuration % 60} دقيقة` : ''}` 
                          : `${sessionDuration} دقيقة`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(Number(e.target.value))}
                      className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 block"
                    />
                    <div className="flex justify-between text-[9px] text-blue-500 font-bold px-1 select-none font-sans">
                      <span>١٠ دقائق</span>
                      <span>ساعة واحدة (٦٠ د.)</span>
                      <span>ساعتان (١٢٠ د.)</span>
                    </div>
                  </div>
                </div>

                {/* C. Question displaying system chooser */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block text-right font-sans">نظام عرض الأسئلة</span>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Cards Mode */}
                    <button
                      type="button"
                      onClick={() => setDisplayMode('cards')}
                      className={`py-2.5 px-4 rounded-xl border-2 text-center transition-all font-extrabold text-xs leading-normal ${
                        displayMode === 'cards' 
                          ? 'bg-blue-50/60 border-blue-600 text-blue-900 shadow-sm' 
                          : 'bg-white border-slate-205 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      نظام الكروت
                    </button>

                    {/* Scrollable list Mode */}
                    <button
                      type="button"
                      onClick={() => setDisplayMode('list')}
                      className={`py-2.5 px-4 rounded-xl border-2 text-center transition-all font-extrabold text-xs leading-normal ${
                        displayMode === 'list' 
                          ? 'bg-indigo-50/60 border-indigo-600 text-indigo-900 shadow-sm' 
                          : 'bg-white border-slate-205 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      نظام القائمة
                    </button>
                  </div>
                </div>

                {/* D. Practice Category (Study / Cases / Mixed) Selector */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-500 block text-right font-sans">تخصيص نمط الأسئلة للجلسة</span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Normal Study Type */}
                    <button
                      type="button"
                      disabled={studyCount === 0}
                      onClick={() => setPracticeCategory('study')}
                      className={`py-2.5 px-2 rounded-xl border-2 text-center transition-all font-extrabold text-xs flex flex-col items-center justify-center gap-0.5 leading-tight ${
                        studyCount === 0
                          ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : practiceCategory === 'study'
                            ? 'bg-blue-50/60 border-blue-600 text-blue-900 shadow-sm'
                            : 'bg-white border-slate-205 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>أسئلة دراسة</span>
                      <span className="text-[9px] font-mono opacity-60">({studyCount} س)</span>
                    </button>

                    {/* Clinical Cases Only Type */}
                    <button
                      type="button"
                      disabled={casesCount === 0}
                      onClick={() => setPracticeCategory('cases')}
                      className={`py-2.5 px-2 rounded-xl border-2 text-center transition-all font-extrabold text-xs flex flex-col items-center justify-center gap-0.5 leading-tight ${
                        casesCount === 0
                          ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : practiceCategory === 'cases'
                            ? 'bg-emerald-50/60 border-emerald-600 text-emerald-900 shadow-sm'
                            : 'bg-white border-slate-205 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>إكلينيكي (Cases)</span>
                      <span className="text-[9px] font-mono opacity-60">({casesCount} ح)</span>
                    </button>

                    {/* Mixed Type */}
                    <button
                      type="button"
                      disabled={totalCount === 0}
                      onClick={() => setPracticeCategory('mixed')}
                      className={`py-2.5 px-2 rounded-xl border-2 text-center transition-all font-extrabold text-xs flex flex-col items-center justify-center gap-0.5 leading-tight ${
                        totalCount === 0
                          ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : practiceCategory === 'mixed'
                            ? 'bg-indigo-50/60 border-indigo-600 text-indigo-900 shadow-sm'
                            : 'bg-white border-slate-205 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>مزيج شامل</span>
                      <span className="text-[9px] font-mono opacity-60">({totalCount} م)</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Footer configuration triggers */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                {chapter.id !== 0 && (
                  <button
                    onClick={() => {
                      setIsConfigModalOpen(false);
                      setIsTopicSelectorOpen(true);
                    }}
                    className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-extrabold transition-all"
                  >
                    تعديل المواضيع
                  </button>
                )}
                <button
                  onClick={startSession}
                  className="flex-1 py-3.5 bg-blue-605 bg-blue-600 hover:bg-blue-750 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>بدء جلسة المذاكرة الآن 🚀</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner (Header) */}
      <header className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest text-left">
              {chapter.title}
            </h1>
            <p className="text-[10px] text-slate-405 text-left font-bold mt-0.5 text-slate-400">
              {displayMode === 'cards' 
                ? `كرت ${Math.min(currentIndex + 1, sessionQuestions.length)} • ${selectedTopics.includes('all') ? 'جميع المواضيع' : `${selectedTopics.length} مواضيع محددة`}`
                : `قائمة المذاكرة الكاملة • ${sessionQuestions.length} سؤال متاح`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {isTimerRunning && !isFinished && (
             <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded-xl">
               <Clock className="w-3.5 h-3.5 text-blue-600" />
               <span className="font-mono text-xs font-black text-blue-600">{formatTime(timeLeft)}</span>
             </div>
           )}

           {!isFinished && displayMode === 'cards' && (
             <div className="hidden md:flex flex-col items-end bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded-xl">
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Session Progress</span>
                <span className="text-xs text-blue-600 font-black leading-none">
                  {remainingCount} Remaining
                </span>
             </div>
           )}
           
           <button
             onClick={() => setIsTopicSelectorOpen(true)}
             className="p-2 text-slate-405 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
             title="Change Topics"
           >
             <ListFilter className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main Section Screen Render (Cards vs List render options) */}
      <div id="study-question-card-wrapper" className="w-full flex flex-col">
        {sessionQuestions.length === 0 ? (
          /* Empty List fallback */
          <div id="no-questions-placeholder" className="bg-white rounded-3xl border border-slate-200 p-12 py-16 text-center shadow-sm">
            <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد أسئلة لهذه المواضيع</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed font-sans">
              المجموعة المحددة (<strong>{selectedTopics.includes('all') ? 'جميع مواضيع الفصل' : `${selectedTopics.length} مواضيع مخصصة`}</strong>) لا تحتوي على أسئلة متاحة حالياً للتجربة.
            </p>
            <button 
              id="back-btn-empty"
              onClick={onBack}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              العودة للرئيسية
            </button>
          </div>
        ) : isFinished ? (
          /* Session finished screen view */
          <div id="session-finished-card" className="space-y-6 text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-950 font-sans">انتهت جلسة المذاكرة! 🎉</h2>
            <p className="text-slate-500 text-base max-w-sm mx-auto font-sans leading-relaxed">
              عمل رائع! لقد راجعت المجموعة أو انتهت مدة الجلسة المقررة بنجاح. استمر في هذا الزخم وعاود التجربة باستمرار.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <button 
                id="finish-back-btn"
                onClick={onBack} 
                className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        ) : displayMode === 'cards' ? (
          /* MAIN QUESTION FLASHCARDS VIEW (No changes to interactive cards layout) */
          <>
            <motion.div 
              layout
              id="active-question-card"
              className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-250/20 overflow-hidden min-h-[460px] flex flex-col"
            >
              {/* Question details formatting block */}
              <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/20 to-white">
                <QuestionPrompt 
                  content={currentQuestion.content} 
                  topic={currentQuestion.topic} 
                  chapterTitle={chapter.title}
                  type={currentQuestion.type}
                  title={currentQuestion.title}
                  answer={currentQuestion.answer}
                  isPastYear={currentQuestion.isPastYear}
                />
              </div>

              {/* Active response overlay / Reveal answer block */}
              <div className="flex-1 flex flex-col min-h-[220px]">
                <AnimatePresence mode="wait">
                  {!showAnswer ? (
                    <motion.div 
                      key="show-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/15"
                    >
                      <button 
                        id="show-answer-trigger-btn"
                        onClick={() => setShowAnswer(true)}
                        className="group relative px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm overflow-hidden transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-slate-200 cursor-pointer"
                      >
                        <span className="relative z-10 flex items-center gap-2.5">
                          <Eye className="w-4 h-4" />
                          <span>إظهار الإجابة النموذجية</span>
                        </span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="answer-display"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-1 flex flex-col"
                    >
                      <div className="flex-1 bg-slate-50/30 p-8 text-left border-b border-slate-50 overflow-y-auto max-h-[500px]">
                        <div className="text-[10px] font-black text-slate-450 text-slate-400 uppercase tracking-widest mb-4">الدليل المعرفي للإجابة</div>
                        <div className="max-w-4xl">
                          <AnswerFormatter 
                            answer={currentQuestion.answer} 
                            topic={currentQuestion.topic} 
                            title={currentQuestion.title} 
                            content={currentQuestion.content}
                          />
                        </div>
                      </div>

                      {/* Recall rating controls */}
                      <div className="bg-slate-50/40 p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-105 border-slate-200">
                        <button 
                          id="difficulty-very-hard-btn"
                          onClick={() => handleDifficulty(DifficultyLevel.VERY_HARD)}
                          className="group flex flex-col items-center p-2.5 bg-white rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50/30 transition-all text-center cursor-pointer"
                        >
                          <div className="text-rose-600 font-extrabold text-xs">صعب جداً</div>
                          <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">سيعاد بعد كرتين</div>
                        </button>
                        
                        <button 
                          id="difficulty-hard-btn"
                          onClick={() => handleDifficulty(DifficultyLevel.HARD)}
                          className="group flex flex-col items-center p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15 transition-all text-center cursor-pointer"
                        >
                          <div className="text-amber-700 font-extrabold text-xs">صعب</div>
                          <div className="text-[9px] text-amber-600 font-semibold uppercase tracking-wider mt-0.5 font-mono">سيعاد بعد ٥ كروت</div>
                        </button>

                        <button 
                          id="difficulty-medium-btn"
                          onClick={() => handleDifficulty(DifficultyLevel.MEDIUM)}
                          className="group flex flex-col items-center p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/15 transition-all text-center cursor-pointer"
                        >
                          <div className="text-blue-700 font-extrabold text-xs">متوسط</div>
                          <div className="text-[9px] text-blue-600 font-semibold uppercase tracking-wider mt-0.5">سيعاد بعد ١٠ كروت</div>
                        </button>

                        <button 
                          id="difficulty-easy-btn"
                          onClick={() => handleDifficulty(DifficultyLevel.EASY)}
                          className="group flex flex-col items-center p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15 transition-all text-center cursor-pointer"
                        >
                          <div className="text-emerald-700 font-extrabold text-xs">سهل (تم الإتقان)</div>
                          <div className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">جاهز ومتقن تماماً</div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Standard feedback legend display */}
            <div className="mt-6 flex flex-wrap justify-center items-center gap-6">
              <div className="flex items-center gap-1.5 grayscale opacity-75">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">صعب جداً</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-75">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">صعب</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-75">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">متوسط</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-75">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">سهل</span>
              </div>
            </div>
          </>
        ) : (
          /* VERTICAL DETAILED LIST STACK DISPLAY VIEW */
          <div className="space-y-6">
            
            {/* List Controls Panel Header row */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto" dir="rtl">
                <span className="text-sm font-black text-slate-800 font-sans">تفضيلات القائمة:</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !showAllAnswersInList;
                    setShowAllAnswersInList(nextVal);
                    const updated: Record<string, boolean> = {};
                    sessionQuestions.forEach(q => {
                      updated[q.id] = nextVal;
                    });
                    setRevealedAnswers(updated);
                  }}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-extrabold transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>{showAllAnswersInList ? "إخفاء جميع الإجابات 🙈" : "إظهار جميع الإجابات 👁️"}</span>
                </button>
              </div>

              {/* Progress summary for List */}
              <div className="flex items-center gap-3 w-full md:w-auto text-right" dir="rtl">
                <span className="text-xs text-slate-400 font-bold font-sans">معدل الإتقان بالفصل:</span>
                <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl font-black text-xs font-mono">
                  {masteredIds.filter(id => sessionQuestions.some(q => q.id === id)).length} \ {sessionQuestions.length} متقن
                </div>
              </div>
            </div>

            {/* List Stack elements */}
            <div className="space-y-4">
              {sessionQuestions.map((q, idx) => {
                const isRevealedObj = revealedAnswers[q.id] || false;
                const isMastered = masteredIds.includes(q.id);
                
                return (
                  <div 
                    key={q.id} 
                    className={`bg-white rounded-3xl border transition-all duration-300 p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden text-right leading-relaxed ${
                      isMastered ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200 shadow-sm'
                    }`}
                  >
                    {/* List item identifier row */}
                    <div className="flex items-center justify-between w-full pb-3 border-b border-slate-100" dir="rtl">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isMastered ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'}`} />
                        <span className="text-xs font-black text-slate-800 font-sans">سؤال {idx + 1} من {sessionQuestions.length}</span>
                      </div>

                      {/* Recall rating controller shortcut tags in list stack */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!isMastered) {
                              markAsMastered(q.id);
                              setMasteredThisSession(prev => new Set(prev).add(q.id));
                            }
                          }}
                          disabled={isMastered}
                          className={`text-[10px] font-black px-3.5 py-2 rounded-full select-none uppercase tracking-wider transition-all border shrink-0 ${
                            isMastered 
                              ? 'bg-emerald-100 border-transparent text-emerald-800 font-bold' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold cursor-pointer'
                          }`}
                        >
                          {isMastered ? '✓ تم الإتقان' : 'تحديد كمتقن'}
                        </button>

                        <button
                          onClick={() => addToReview(q.id)}
                          className="text-[10px] font-black px-3.5 py-2 rounded-full select-none uppercase tracking-wider border bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold shrink-0 cursor-pointer"
                        >
                          ⭐ أضف للمراجعة
                        </button>
                      </div>
                    </div>

                    {/* Question representation render content */}
                    <div className="text-left">
                      <QuestionPrompt 
                        content={q.content} 
                        topic={q.topic} 
                        chapterTitle={chapter.title}
                        type={q.type}
                        title={q.title}
                        answer={q.answer}
                        isPastYear={q.isPastYear}
                      />
                    </div>

                    {/* Answer section collapse card */}
                    <div className="w-full flex flex-col gap-4">
                      <button
                        onClick={() => {
                          setRevealedAnswers(prev => ({
                            ...prev,
                            [q.id]: !prev[q.id]
                          }));
                        }}
                        className="flex items-center gap-2 self-start py-2.5 px-5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-extrabold rounded-2xl border border-slate-200 transition-all active:scale-95 cursor-pointer select-none"
                      >
                        <span>{isRevealedObj ? "إخفاء الإجابة النموذجية 🙈" : "عرض الإجابة النموذجية 👁️"}</span>
                      </button>

                      <AnimatePresence>
                        {isRevealedObj && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-slate-50/50 p-6 rounded-2xl text-left border border-slate-100 transition-all">
                              <AnswerFormatter 
                                answer={q.answer} 
                                topic={q.topic} 
                                title={q.title} 
                                content={q.content}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* List footer banner */}
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-3xl text-center space-y-4 shadow-lg" dir="rtl">
              <span className="text-[10px] font-bold tracking-widest text-blue-300">لقد وصلت للنهاية 🎉</span>
              <h3 className="text-xl font-black font-sans">عمل رائع في مراجعة القائمة بالكامل!</h3>
              <p className="text-xs text-blue-100 max-w-sm mx-auto leading-relaxed">
                لقد انتهيت من مراجعة الأسئلة وتجربة الاستدعاء الذكي. حافظ على المتابعة الدائمة لتقوية روابط الذاكرة.
              </p>
              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-white text-blue-900 rounded-xl text-xs font-bold transition-all shadow-md hover:bg-slate-50 cursor-pointer"
              >
                العودة لصفحة الفصول الرئيسية
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
