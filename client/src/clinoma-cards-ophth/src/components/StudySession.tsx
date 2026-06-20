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
import { DifficultyLevel } from '../types';;
import { sortChapterQuestions } from '../utils/sorting';
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
  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(chapter.id !== 0 && chapter.id !== 400);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(chapter.id === 0 || chapter.id === 400);
  
  // Choice states
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['all']);
  const [excludeMastered, setExcludeMastered] = useState<boolean>(true);
  
  // Custom Session configuration from user
  const [focusAlertEnabled, setFocusAlertEnabled] = useState<boolean>(true);
  const [focusAlertInterval, setFocusAlertInterval] = useState<number>(3); // 1 to 10 minutes
  const [sessionDuration, setSessionDuration] = useState<number>(30); // 10 minutes to 2 hours (120 minutes)
  const [displayMode, setDisplayMode] = useState<'cards' | 'list'>('cards');
  const [practiceCategory, setPracticeCategory] = useState<'study' | 'cases' | 'mixed'>('mixed');
  const [cardOrder, setCardOrder] = useState<'logical' | 'shuffled'>(chapter.id === 0 ? 'shuffled' : 'logical');

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
      filtered = filtered.filter(q => !masteredIds.includes(q.id));
    }
    return filtered;
  }, [questions, chapter.id, selectedTopics, excludeMastered, masteredIds]);

  const studyCount = useMemo(() => currentPoolOfSelectedTopicsAndMasteredType.filter(q => !isQuestionCase(q)).length, [currentPoolOfSelectedTopicsAndMasteredType]);
  const casesCount = useMemo(() => currentPoolOfSelectedTopicsAndMasteredType.filter(q => isQuestionCase(q)).length, [currentPoolOfSelectedTopicsAndMasteredType]);
  const totalCount = currentPoolOfSelectedTopicsAndMasteredType.length;

  const activeCategoryCount = useMemo(() => {
    if (practiceCategory === 'study') return studyCount;
    if (practiceCategory === 'cases') return casesCount;
    return totalCount;
  }, [practiceCategory, studyCount, casesCount, totalCount]);

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

  // Keyboard Shortcuts for Study Session Cards Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Safety check: Ignore shortcuts if user is typing in form fields
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' || 
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // 1. Exit/Dismiss mind-wandering prompt
      if (showDistracted) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || ['0', '1', '2', '3'].includes(e.key)) {
          e.preventDefault();
          setShowDistracted(false);
          if (!hasReturned) {
            setHasReturned(true);
          }
          setTimeSpent(0);
          return;
        }
      }

      // Check constraints to make sure shortcut keys are only active during a true card session
      if (
        sessionQuestions.length === 0 ||
        isFinished ||
        isTopicSelectorOpen ||
        isConfigModalOpen ||
        showContinuePrompt
      ) {
        return;
      }

      // --- List Mode Keyboard Interactions ---
      if (displayMode === 'list') {
        if (e.key === ' ') {
          e.preventDefault();
          const elements: (HTMLElement | null)[] = sessionQuestions.map((_, idx) => 
            document.getElementById(`list-question-${idx}`)
          );

          // Find current reading index (first element whose bottom is at least 120px down has not been scrolled past completely)
          const currIdx = elements.findIndex(el => {
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            return rect.bottom >= 120;
          });

          if (currIdx !== -1) {
            const nextIdx = currIdx + 1;
            if (nextIdx < elements.length) {
              const targetEl = elements[nextIdx];
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            } else {
              const footerEl = document.getElementById('list-footer');
              if (footerEl) {
                footerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }
        }
        return;
      }

      if (displayMode !== 'cards') {
        return;
      }

      // 2. Spacebar and Enter behavior
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!showAnswer) {
          setShowAnswer(true);
        } else {
          // If answer is already showing, space/enter rates as "Medium" (DifficultyLevel.MEDIUM)
          handleDifficulty(DifficultyLevel.MEDIUM);
        }
        return;
      }

      // 3. Digit Keys 0, 1, 2, 3
      // Key "0" -> Easy, Key "1" -> Medium, Key "2" -> Hard, Key "3" -> Very Hard
      if (showAnswer) {
        if (e.key === '0') {
          e.preventDefault();
          handleDifficulty(DifficultyLevel.EASY);
        } else if (e.key === '1') {
          e.preventDefault();
          handleDifficulty(DifficultyLevel.MEDIUM);
        } else if (e.key === '2') {
          e.preventDefault();
          handleDifficulty(DifficultyLevel.HARD);
        } else if (e.key === '3') {
          e.preventDefault();
          handleDifficulty(DifficultyLevel.VERY_HARD);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    showDistracted, 
    hasReturned, 
    displayMode, 
    showAnswer, 
    isFinished, 
    isTopicSelectorOpen, 
    isConfigModalOpen, 
    showContinuePrompt, 
    sessionQuestions, 
    currentIndex
  ]);

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
      filtered = filtered.filter(q => !masteredIds.includes(q.id));
    }

    if (practiceCategory === 'study') {
      filtered = filtered.filter(q => !isQuestionCase(q));
    } else if (practiceCategory === 'cases') {
      filtered = filtered.filter(q => isQuestionCase(q));
    }

    let sessionList = [...filtered];
    if (cardOrder === 'logical') {
      sessionList = sortChapterQuestions(chapter.id, sessionList);
    } else {
      sessionList.sort(() => Math.random() - 0.5);
    }
    
    setSessionQuestions(sessionList);
    setInitialUniqueCount(sessionList.length);
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
              dir="ltr"
            >
              {!hasReturned ? (
                <>
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mb-6 shadow-inner animate-bounce">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-yellow-500 mb-8 font-sans leading-none">
                    Stay Focused! ⏰
                  </h3>
                  <p className="text-slate-500 text-xs font-bold mb-6">It has been a while without interaction. Stay focused!</p>
                  <button
                    onClick={() => {
                      setShowDistracted(false);
                      setHasReturned(true);
                      setTimeSpent(0);
                    }}
                    className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-base rounded-2xl transition-all shadow-lg shadow-yellow-100 active:scale-95 cursor-pointer selection:bg-none"
                  >
                    Let's Go
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-inner animate-pulse">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-red-600 mb-8 font-sans leading-none">
                    Focus Time! 🎯
                  </h3>
                  <p className="text-slate-500 text-xs font-bold mb-6">Active learning requires complete alertness. Return to your session now.</p>
                  <button
                    onClick={() => {
                      setShowDistracted(false);
                      setTimeSpent(0);
                    }}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-base rounded-2xl transition-all shadow-lg shadow-red-200 active:scale-95 cursor-pointer"
                  >
                    Let's Go
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
                  Planned session time is up! ⏱️
                </h3>
                <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed font-sans">
                  You haven't completed all questions in this session yet. Would you like to continue studying the remaining questions?
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
                    Yes, continue studying 🚀
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsFinished(true);
                      setShowContinuePrompt(false);
                    }}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    No, finish session and show summary
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
              <div className="flex justify-between items-start mb-6 text-left" dir="ltr">
                <div className="text-left">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Configure Study Session</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Choose topics from {chapter.title} to study</p>
                </div>
                <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  <ArrowLeft className="w-5 h-5 transform rotate-180" />
                </button>
              </div>

              {/* Scrollable Topics Area */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-hide mb-6">
                <button
                  onClick={() => toggleTopic('all')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all border-2 ${selectedTopics.includes('all') ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100'}`}
                  dir="ltr"
                >
                  <div className="text-left">
                    <span className="font-bold text-sm block">📚 Study Entire Chapter (All Topics)</span>
                    <span className="text-[10px] opacity-75 block mt-0.5">
                      Contains {questions.length} questions • ({questions.length - questions.filter(q => masteredIds.includes(q.id)).length} remaining) • ({questions.filter(q => masteredIds.includes(q.id)).length} mastered)
                    </span>
                  </div>
                  {selectedTopics.includes('all') && <CheckCircle2 className="w-5 h-5" />}
                </button>
                
                {chapter.topics && chapter.topics.map((top, idx) => {
                  const isSelected = selectedTopics.includes(top);
                  const topicQuestions = questions.filter(q => q.topic === top);
                  const totalTopicCount = topicQuestions.length;
                  const masteredTopicCount = topicQuestions.filter(q => masteredIds.includes(q.id)).length;
                  const remainingTopicCount = totalTopicCount - masteredTopicCount;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTopic(top)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all border-2 ${isSelected ? 'bg-blue-50 border-blue-600 text-blue-800' : 'bg-white border-slate-100 text-slate-650 hover:border-slate-200'}`}
                      dir="ltr"
                    >
                      <div className="text-left">
                        <span className="font-bold text-sm block">{idx + 1}. {top}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Contains {totalTopicCount} questions • ({remainingTopicCount} remaining) • ({masteredTopicCount} mastered)
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Practice Filter Switch */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between mb-6" dir="ltr">
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block font-sans">Skip Mastered Questions (Exclude Mastered)</span>
                  <span className="text-[10px] text-slate-400 block font-normal">Show only unmastered questions to save time</span>
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
                  Cancel
                </button>
                <button
                  onClick={handleTopicsConfirmed}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95"
                >
                  Next: Configure Session ➔
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
              dir="ltr"
            >
              <div className="flex justify-between items-start mb-6 text-left">
                <div className="text-left">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Study Session Settings</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Adjust focus settings and question display</p>
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
                    <div className="text-left">
                      <span className="text-sm font-bold text-amber-900 block font-sans">Anti-Distraction Alert</span>
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
                        <span>Alert Interval:</span>
                        <span>Every {focusAlertInterval} {focusAlertInterval === 1 ? 'minute' : 'minutes'}</span>
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
                  <div className="text-left">
                    <span className="text-sm font-bold text-[#1E40AF] block font-sans">Study Session Duration</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-[#1E40AF]">
                      <span>Preferred Session Time:</span>
                      <span className="font-mono text-[#1D4ED8]">
                        {sessionDuration >= 60 
                          ? `${Math.floor(sessionDuration / 60)} hr ${sessionDuration % 60 > 0 ? `${sessionDuration % 60} mins` : ''}` 
                          : `${sessionDuration} mins`}
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
                      <span>10 minutes</span>
                      <span>1 hour (60 min)</span>
                      <span>2 hours (120 min)</span>
                    </div>
                  </div>
                </div>

                {/* C. Question displaying system chooser */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block text-left font-sans">Question Display Mode</span>
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
                      Cards Mode
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
                      List Mode
                    </button>
                  </div>
                </div>

                {/* D. Practice Category (Study / Cases / Mixed) Selector */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-500 block text-left font-sans">Session Question Type</span>
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
                      <span>Study Questions</span>
                      <span className="text-[9px] font-mono opacity-60">({studyCount} Q)</span>
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
                      <span>Clinical Cases</span>
                      <span className="text-[9px] font-mono opacity-60">({casesCount} C)</span>
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
                      <span>Mixed Practice</span>
                      <span className="text-[9px] font-mono opacity-60">({totalCount} M)</span>
                    </button>
                  </div>
                </div>

                {/* E. Card / List Question Ordering Choice (Logical vs Shuffled) */}
                <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
                  <span className="text-xs font-bold text-slate-500 block text-left font-sans">Question Sequence & Order</span>
                  <div className="grid grid-cols-2 gap-3" dir="ltr">
                    {/* Logical Sequence */}
                    <button
                      type="button"
                      onClick={() => setCardOrder('logical')}
                      className={`py-2 px-3 rounded-xl border-2 text-center transition-all font-semibold text-xs flex flex-col items-center justify-center gap-1.5 leading-snug h-[68px] cursor-pointer ${
                        cardOrder === 'logical'
                          ? 'bg-blue-50/60 border-blue-600 text-blue-900 shadow-sm'
                          : 'bg-white border-slate-205 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-extrabold flex items-center gap-1 text-[11px]"><span className="text-[13px]">🔄</span> Logical Sequence</span>
                      <span className="text-[9px] opacity-75 leading-tight text-center">Best for learning from foundations to treatment</span>
                    </button>

                    {/* Random Shuffled Sequence */}
                    <button
                      type="button"
                      onClick={() => setCardOrder('shuffled')}
                      className={`py-2 px-3 rounded-xl border-2 text-center transition-all font-semibold text-xs flex flex-col items-center justify-center gap-1.5 leading-snug h-[68px] cursor-pointer ${
                        cardOrder === 'shuffled'
                          ? 'bg-amber-50/60 border-amber-600 text-amber-900 shadow-sm'
                          : 'bg-white border-slate-205 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-extrabold flex items-center gap-1 text-[11px]"><span className="text-[13px]">🔀</span> Shuffled Random Order</span>
                      <span className="text-[9px] opacity-75 leading-tight text-center">Simulate exams and test active recall</span>
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
                    Edit Topics
                  </button>
                )}
                <button
                  onClick={startSession}
                  disabled={activeCategoryCount === 0}
                  className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg text-center flex items-center justify-center gap-2 ${
                    activeCategoryCount === 0 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {activeCategoryCount === 0 
                      ? 'No questions remaining (all mastered) 🏁' 
                      : 'Start Study Session Now 🚀'}
                  </span>
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
                ? `Card ${Math.min(currentIndex + 1, sessionQuestions.length)} • ${selectedTopics.includes('all') ? 'All Topics' : `${selectedTopics.length} topics selected`}`
                : `Full Study List • ${sessionQuestions.length} questions available`}
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
             <div className="hidden md:flex flex-col items-start bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded-xl">
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">No questions found for these topics</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed font-sans">
              The selected set (<strong>{selectedTopics.includes('all') ? 'All Chapters Topics' : `${selectedTopics.length} Custom Topics`}</strong>) does not have any questions available to study.
            </p>
            <button 
              id="back-btn-empty"
              onClick={onBack}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        ) : isFinished ? (
          /* Session finished screen view */
          <div id="session-finished-card" className="space-y-6 text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-950 font-sans">Study Session Finished! 🎉</h2>
            <p className="text-slate-500 text-base max-w-sm mx-auto font-sans leading-relaxed">
              Great job! You reviewed all cards or the session limit has been reached successfully. Keep up the good work!
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <button 
                id="finish-back-btn"
                onClick={onBack} 
                className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Back to Home
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
                  isSurgical={currentQuestion.isSurgical}
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
                        <span className="relative z-10 flex items-center justify-center gap-2.5">
                          <Eye className="w-4 h-4" />
                          <span>Show Model Answer</span>
                          <kbd className="mr-1.5 px-2 py-0.5 text-[11px] bg-slate-800 rounded-md text-slate-350 font-mono select-none border border-slate-700">Space / Enter</kbd>
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
                        <div className="text-[10px] font-black text-slate-450 text-slate-400 uppercase tracking-widest mb-4">KNOWLEDGE REFERENCE ANSWER</div>
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
                          <div className="text-rose-600 font-extrabold text-xs flex items-center justify-center gap-1.5">
                            <span>Very Hard</span>
                            <kbd className="px-1.5 py-0.2 bg-rose-50 text-[10px] rounded-md border border-rose-200 font-mono">3</kbd>
                          </div>
                          <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Repeated after 2 cards</div>
                        </button>
                        
                        <button 
                          id="difficulty-hard-btn"
                          onClick={() => handleDifficulty(DifficultyLevel.HARD)}
                          className="group flex flex-col items-center p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15 transition-all text-center cursor-pointer"
                        >
                          <div className="text-amber-700 font-extrabold text-xs flex items-center justify-center gap-1.5">
                            <span>Hard</span>
                            <kbd className="px-1.5 py-0.2 bg-amber-50 text-[10px] rounded-md border border-amber-200 font-mono">2</kbd>
                          </div>
                          <div className="text-[9px] text-amber-600 font-semibold uppercase tracking-wider mt-0.5 font-mono">Repeated after 5 cards</div>
                        </button>

                        <button 
                          id="difficulty-medium-btn"
                          onClick={() => handleDifficulty(DifficultyLevel.MEDIUM)}
                          className="group flex flex-col items-center p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/15 transition-all text-center cursor-pointer"
                        >
                          <div className="text-blue-700 font-extrabold text-xs flex items-center justify-center gap-1.5">
                            <span>Medium</span>
                            <kbd className="px-1.5 py-0.2 bg-blue-50 text-[10px] rounded-md border border-blue-200 font-mono">1</kbd>
                          </div>
                          <div className="text-[9px] text-blue-600 font-semibold uppercase tracking-wider mt-0.5">Repeated after 10 cards</div>
                        </button>

                        <button 
                          id="difficulty-easy-btn"
                          onClick={() => handleDifficulty(DifficultyLevel.EASY)}
                          className="group flex flex-col items-center p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15 transition-all text-center cursor-pointer"
                        >
                          <div className="text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-1.5">
                            <span>Easy (Mastered)</span>
                            <kbd className="px-1.5 py-0.2 bg-emerald-50 text-[10px] rounded-md border border-emerald-200 font-mono">0</kbd>
                          </div>
                          <div className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">Fully Mastered</div>
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
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Very Hard</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-75">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Hard</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-75">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Medium</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-75">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Easy</span>
              </div>
            </div>
          </>
        ) : (
          /* VERTICAL DETAILED LIST STACK DISPLAY VIEW */
          <div className="space-y-6">
            
            {/* List Controls Panel Header row */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto" dir="ltr">
                <span className="text-sm font-black text-slate-800 font-sans">List Preferences:</span>
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
                  <span>{showAllAnswersInList ? "Hide All Answers 🙈" : "Reveal All Answers 👁️"}</span>
                </button>
              </div>

              {/* Progress summary for List */}
              <div className="flex items-center gap-3 w-full md:w-auto text-left" dir="ltr">
                <span className="text-xs text-slate-400 font-bold font-sans">Chapter Mastery Rate:</span>
                <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl font-black text-xs font-mono">
                  {masteredIds.filter(id => sessionQuestions.some(q => q.id === id)).length} / {sessionQuestions.length} Mastered
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
                    id={`list-question-${idx}`}
                    className={`bg-white rounded-3xl border transition-all duration-300 p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden text-left leading-relaxed ${
                      isMastered ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200 shadow-sm'
                    }`}
                  >
                    {/* List item identifier row */}
                    <div className="flex items-center justify-between w-full pb-3 border-b border-slate-100" dir="ltr">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isMastered ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'}`} />
                        <span className="text-xs font-black text-slate-800 font-sans">Question {idx + 1} of {sessionQuestions.length}</span>
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
                          {isMastered ? '✓ Mastered' : 'Mark as Mastered'}
                        </button>

                        <button
                          onClick={() => addToReview(q.id)}
                          className="text-[10px] font-black px-3.5 py-2 rounded-full select-none uppercase tracking-wider border bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold shrink-0 cursor-pointer"
                        >
                          ⭐ Add to Review
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
                        isSurgical={q.isSurgical}
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
                        <span>{isRevealedObj ? "Hide Model Answer 🙈" : "Reveal Model Answer 👁️"}</span>
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
            <div id="list-footer" className="p-8 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-3xl text-center space-y-4 shadow-lg" dir="ltr">
              <span className="text-[10px] font-bold tracking-widest text-blue-300">You completed the list! 🎉</span>
              <h3 className="text-xl font-black font-sans">Great job covering the entire study list!</h3>
              <p className="text-xs text-blue-100 max-w-sm mx-auto leading-relaxed">
                You have successfully gone through all questions & active recall exercise. Keep practicing!
              </p>
              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-white text-blue-900 rounded-xl text-xs font-bold transition-all shadow-md hover:bg-slate-50 cursor-pointer"
              >
                Back to main chapters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
