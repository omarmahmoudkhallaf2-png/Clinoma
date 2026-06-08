import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  LayoutDashboard, 
  GraduationCap, 
  History, 
  Menu, 
  X, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Brain,
  RotateCcw
} from 'lucide-react';
import { CHAPTERS } from './data/chapters';
import { INITIAL_QUESTIONS } from './data/questions';
import type { Question, Chapter } from './types';
import StudySession from './components/StudySession';
import ReviewView from './components/ReviewView';
import CountdownTimer from './components/CountdownTimer';

const MIXED_CHAPTER: Chapter = {
  id: 0,
  title: 'Mixed Practice Session',
  topics: []
};

export default function App({ onExit }: { onExit?: () => void }) {
  const [view, setView] = useState<'home' | 'study' | 'review'>('home');
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [reviewList, setReviewList] = useState<string[]>(() => {
    const saved = localStorage.getItem('clinoma_review_list');
    return saved ? JSON.parse(saved) : [];
  });
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('clinoma_mastered_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);

  useEffect(() => {
    localStorage.setItem('clinoma_review_list', JSON.stringify(reviewList));
  }, [reviewList]);

  useEffect(() => {
    localStorage.setItem('clinoma_mastered_ids', JSON.stringify(masteredIds));
  }, [masteredIds]);

  const startChapter = (chapter: Chapter) => {
    setActiveChapter(chapter);
    const chapterQuestions = INITIAL_QUESTIONS.filter(q => q.chapterId === chapter.id);
    // Filter out mastered questions to avoid repetition
    const unmastered = chapterQuestions.filter(q => !masteredIds.includes(q.id));
    setSessionQuestions(unmastered);
    setView('study');
    setSidebarOpen(false);
  };

  const startMixedSession = () => {
    setActiveChapter(MIXED_CHAPTER);
    // Shuffle unmastered questions across all chapters
    const unmastered = INITIAL_QUESTIONS.filter(q => !masteredIds.includes(q.id));
    
    // Perform standard random sort
    const shuffled = [...unmastered].sort(() => Math.random() - 0.5);
    setSessionQuestions(shuffled);
    setView('study');
    setSidebarOpen(false);
  };

  const addToReview = (id: string) => {
    if (!reviewList.includes(id)) {
      setReviewList(prev => [...prev, id]);
    }
  };

  const markAsMastered = (id: string) => {
    setMasteredIds(prev => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
    });
    setReviewList(prev => prev.filter(rid => rid !== id));
  };

  const removeFromReview = (id: string) => {
    setReviewList(prev => prev.filter(rid => rid !== id));
  };

  const resetAllProgress = () => {
    setShowResetConfirm(true);
  };

  const resetChapterProgress = (chapterId: number) => {
    if (chapterId === 0) {
      // General reset/all
      setMasteredIds([]);
      setReviewList([]);
      localStorage.removeItem('clinoma_review_list');
      localStorage.removeItem('clinoma_mastered_ids');
      if (activeChapter?.id === 0) {
        setSessionQuestions(INITIAL_QUESTIONS);
      }
    } else {
      // Specific chapter questions
      const chapterQuestions = INITIAL_QUESTIONS.filter(q => q.chapterId === chapterId);
      const chapterQuestionIds = chapterQuestions.map(q => q.id);
      setMasteredIds(prev => prev.filter(id => !chapterQuestionIds.includes(id)));
      setReviewList(prev => prev.filter(id => !chapterQuestionIds.includes(id)));
      if (activeChapter?.id === chapterId) {
        setSessionQuestions(chapterQuestions);
      }
    }
  };

  const confirmResetProgress = () => {
    resetChapterProgress(0);
    setShowResetConfirm(false);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Sleek Persistent Top Global Header Bar */}
      <header className="flex items-center justify-between p-4 px-6 md:px-8 bg-white border-b sticky top-0 z-[50] shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 focus:outline-none"
            aria-label="Toggle Sidebar Menu"
          >
            <Menu className="w-6 h-6 text-slate-705 hover:text-blue-600" />
          </button>
          
          <a href="https://clinoma.pages.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 flex items-center justify-center overflow-hidden rounded-xl shadow-md shadow-blue-500/20">
              <img src="https://i.ibb.co/qMgGdD03/202605081225.jpg" alt="Logo" className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-slate-900 leading-none block">CLINOMA CARDS</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-none mt-1 block">Pediatric Board Preparation</span>
            </div>
          </a>
        </div>

        {/* Top Middle Countdown */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <CountdownTimer />
        </div>

        {/* Global Top Stats */}
        <div className="flex items-center gap-3">
          {view === 'home' && (
            <button
              onClick={startMixedSession}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Brain className="w-4 h-4 text-blue-400" />
              <span>Mixed Practice Challenge</span>
            </button>
          )}

          <div className="px-3 py-1.5 bg-slate-50 border border-slate-205 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-650 font-extrabold uppercase tracking-wider">
              {masteredIds.length} / {INITIAL_QUESTIONS.length} Mastered
            </span>
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 rotate-90" />
              <span>العودة للرئيسية</span>
            </button>
          )}
        </div>
      </header>

      {/* Responsive Slide Drawer Navigation Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-slate-950 text-slate-100 shadow-2xl z-[70] flex flex-col p-6 text-left border-r border-slate-800"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-900">
                <a href="https://clinoma.pages.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-9 h-9 flex items-center justify-center overflow-hidden rounded-xl">
                    <img src="https://i.ibb.co/qMgGdD03/202605081225.jpg" alt="Logo" className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white leading-none">CLINOMA CARDS</span>
                </a>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-900 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                {/* Main section */}
                <div>
                  <div className="text-[10px] font-bold text-slate-505 uppercase tracking-widest px-3 pb-2">Main Menu</div>
                  <div className="space-y-1">
                    <SidebarItem 
                      icon={<LayoutDashboard className="w-4 h-4"/>} 
                      label="Home Index" 
                      active={view === 'home'} 
                      onClick={() => { setView('home'); setSidebarOpen(false); }}
                    />
                    <button 
                      onClick={() => { setView('review'); setSidebarOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                        view === 'review' 
                          ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <History className="w-4 h-4" />
                        <span>Smart Review Hub</span>
                      </span>
                      {reviewList.length > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-905 font-bold">{reviewList.length}</span>
                      )}
                    </button>
                    <SidebarItem 
                      icon={<Brain className="w-4 h-4"/>} 
                      label="Mixed Shuffle Session" 
                      active={activeChapter?.id === 0 && view === 'study'} 
                      onClick={() => { startMixedSession(); setSidebarOpen(false); }}
                    />
                  </div>
                </div>

                {/* Chapters list with stats in Sidebar */}
                <div>
                  <div className="text-[10px] font-bold text-slate-505 uppercase tracking-widest px-3 pb-2">Chapters</div>
                  <div className="space-y-1">
                    {CHAPTERS.map(ch => {
                      const chapterQuestions = INITIAL_QUESTIONS.filter(q => q.chapterId === ch.id);
                      const totalCount = chapterQuestions.length;
                      const masteredCount = chapterQuestions.filter(q => masteredIds.includes(q.id)).length;
                      
                      return (
                        <button 
                          key={ch.id}
                          onClick={() => { startChapter(ch); }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeChapter?.id === ch.id && view === 'study'
                              ? 'text-white bg-blue-600'
                              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          <span className="flex items-center gap-2 overflow-hidden mr-1">
                            <span className="text-[10px] font-mono opacity-50">0{ch.id}</span>
                            <span className="truncate">{ch.title}</span>
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                            activeChapter?.id === ch.id && view === 'study' ? 'bg-blue-700 text-white font-bold' : 'bg-slate-900 text-slate-500 font-bold'
                          }`}>
                            {masteredCount}/{totalCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Progress & Reset at bottom */}
              <div className="pt-6 border-t border-slate-909 mt-auto space-y-4">
                <div className="px-4 py-3.5 bg-slate-900 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Progress</p>
                    <p className="text-[10px] text-blue-400 font-mono font-bold">
                      {masteredIds.length}/{INITIAL_QUESTIONS.length}
                    </p>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${INITIAL_QUESTIONS.length > 0 ? (masteredIds.length / INITIAL_QUESTIONS.length) * 100 : 0}%` }}
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
                
                <button
                  onClick={resetAllProgress}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-rose-500/20 hover:border-rose-500/40"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Progress</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <div className="flex min-h-[calc(100vh-73px)]">
        <main className="flex-1 overflow-y-auto bg-slate-50 p-2 sm:p-6 md:p-8">
          <div className={`${view === 'study' ? 'max-w-4xl' : 'max-w-5xl'} mx-auto transition-all duration-500`}>
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <a href="https://clinoma.pages.dev" target="_blank" rel="noopener noreferrer" className="block group">
                      <h2 className="text-3xl font-extrabold text-slate-900 font-display group-hover:text-blue-600 transition-colors">CLINOMA CARDS</h2>
                    </a>
                  </div>
                  <button
                    onClick={startMixedSession}
                    className="md:hidden w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-905 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-md"
                  >
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span>Mixed Practice Challenge</span>
                  </button>
                </div>

                {/* Grid listing Chapters with Individual Question stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {CHAPTERS.map((chapter) => {
                    const chapterQuestions = INITIAL_QUESTIONS.filter(q => q.chapterId === chapter.id);
                    const totalCount = chapterQuestions.length;
                    const masteredCount = chapterQuestions.filter(q => masteredIds.includes(q.id)).length;
                    const reviewCount = chapterQuestions.filter(q => reviewList.includes(q.id)).length;

                    return (
                      <ChapterCard 
                        key={chapter.id} 
                        chapter={chapter} 
                        masteredCount={masteredCount}
                        totalCount={totalCount}
                        reviewCount={reviewCount}
                        onClick={() => startChapter(chapter)}
                      />
                    );
                  })}
                </div>

                {/* BOTTOM PERSISTENT DETAILED REPORT & PROGRESS BAR CARD */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-slate-905 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex-1 w-full space-y-4 text-left">
                      <div>
                        <span className="text-[10px] font-black tracking-widest uppercase text-blue-400 font-mono">APP PROGRESS STATUS</span>
                        <h3 className="text-xl md:text-2xl font-black text-white leading-tight mt-1">Overall Diagnostic Progress</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs md:text-sm font-bold text-slate-305">
                          <span>Progress Bar (Overall Success Metrics)</span>
                          <span className="font-mono text-blue-400">
                            {masteredIds.length} of {INITIAL_QUESTIONS.length} Questions ({INITIAL_QUESTIONS.length > 0 ? Math.round((masteredIds.length / INITIAL_QUESTIONS.length) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="h-3.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/30">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${INITIAL_QUESTIONS.length > 0 ? (masteredIds.length / INITIAL_QUESTIONS.length) * 100 : 0}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-blue-505 to-indigo-500 rounded-full" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Fast Stats Blocks & Double Mix Button */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                      <div className="flex gap-4 w-full sm:w-auto">
                        <div className="flex-1 sm:flex-none px-4 py-3 bg-slate-850/65 border border-slate-800 rounded-2xl text-center min-w-[100px]">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">IN REVIEW</p>
                          <p className="text-xl font-black text-amber-400">{reviewList.length}</p>
                        </div>
                        <div className="flex-1 sm:flex-none px-4 py-3 bg-slate-850/65 border border-slate-800 rounded-2xl text-center min-w-[100px]">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TOTAL BANK</p>
                          <p className="text-xl font-black text-white">{INITIAL_QUESTIONS.length}</p>
                        </div>
                      </div>

                      <button
                        onClick={startMixedSession}
                        className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
                      >
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span>Mixed Practice Challenge</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {view === 'study' && activeChapter && (
              <motion.div
                key="study"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StudySession 
                  chapter={activeChapter} 
                  questions={sessionQuestions}
                  onBack={() => setView('home')}
                  addToReview={addToReview}
                  markAsMastered={markAsMastered}
                  onResetChapterProgress={resetChapterProgress}
                />
              </motion.div>
            )}

            {view === 'review' && (
               <motion.div
                key="review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ReviewView 
                  reviewIds={reviewList} 
                  allQuestions={INITIAL_QUESTIONS}
                  onBack={() => setView('home')}
                  onMarkMastered={markAsMastered}
                  onRemoveReview={removeFromReview}
                  startMixedSession={startMixedSession}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Reset Confirmation Modal / Interactive Tab Reset Dashboard */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-6 md:p-8 max-w-lg w-full shadow-2xl relative z-10 border border-slate-100 flex flex-col max-h-[85vh]"
              dir="rtl"
            >
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-xl font-black text-slate-900 leading-tight">تصفير وإعادة تعيين التقدم 🔄</h3>
                   <p className="text-xs text-slate-450 font-semibold mt-1">اختر التبويب أو الفصل الذي ترغب ببدء المذاكرة فيه من الصفر:</p>
                 </div>
                 <button onClick={() => setShowResetConfirm(false)} className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Scrollable list of resetable progress categories */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[50vh] custom-scrollbar mb-6">
                
                {/* 1. Global Complete Wipeout */}
                <div className="p-4 bg-rose-500/[0.04] border border-rose-500/10 rounded-2.5xl text-right space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <span className="text-sm font-black text-rose-800 block">تصفير شامل (جميع الفصول والمراجعات) 🚨</span>
                      <span className="text-[11px] text-rose-600 block leading-normal font-medium">سيتم مسح كافّة الأسئلة المتقنة والمحفوظة للمراجعة والبدء تماماً من جديد.</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        resetChapterProgress(0);
                        setShowResetConfirm(false);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-650/20 active:scale-95 transition-all text-center"
                    >
                      تصفير كافّة البيانات 🔄
                    </button>
                  </div>
                </div>

                {/* 2. Individual Chapters */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider block text-right pr-1 uppercase">تصفير تبويب مخصص لبعض الفصول</span>
                  
                  {CHAPTERS.map(ch => {
                    const chapterQuestions = INITIAL_QUESTIONS.filter(q => q.chapterId === ch.id);
                    const totalCount = chapterQuestions.length;
                    const masteredCount = chapterQuestions.filter(q => masteredIds.includes(q.id)).length;
                    const percent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
                    
                    return (
                      <div 
                        key={ch.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-100 text-right gap-3 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 pr-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-205 text-slate-650 px-1.5 py-0.5 rounded leading-none">Ch0{ch.id}</span>
                            <span className="text-xs font-extrabold text-slate-800 block leading-tight">{ch.title}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 block font-semibold leading-none">
                              تم إتقان: <span className="font-mono text-blue-600 font-bold">{masteredCount} / {totalCount}</span>
                            </span>
                            <div className="w-16 h-1.5 bg-slate-200/80 rounded-full overflow-hidden p-0">
                              <div style={{ width: `${percent}%` }} className="h-full bg-blue-500 rounded-full" />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            resetChapterProgress(ch.id);
                          }}
                          disabled={masteredCount === 0}
                          className={`px-4 py-2 text-[11px] font-black rounded-xl transition-all border ${
                            masteredCount === 0 
                              ? 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed' 
                              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/80'
                          }`}
                        >
                          تصفير التبويب
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all"
                >
                  إغلاق النافذة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all duration-200 group text-xs font-semibold ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'}>
        {icon}
      </span>
      <span className="text-left select-none">{label}</span>
    </button>
  );
}

const getChapterImageUrl = (id: number): string => {
  switch (id) {
    case 1:
      return "https://www.kenhub.com/thumbor/Fh_wZf1zLEFt0zQd8fBtNmK7hdA=/fit-in/413x413/filters:fill(FFFFFF,true):watermark(/images/watermark_only_413.png,0,0,0):watermark(/logos/logo_url_sm.png,-10,-10,0):format(jpeg)/images/learnable/pelvis-renalis-2/XD504yncEcrqG6tG1lGlw_Pelvis_renalis_01.png";
    case 2:
      return "https://anatomy.app/Media/slides/thorax-overview-3-9785_medium.jpg";
    case 3:
      return "https://www.frontiersin.org/_rtmag/_next/image?url=https%3A%2F%2Fwww.frontiersin.org%2Fimage%2Fresearchtopic%2F60207&w=3840&q=90";
    case 4:
      return "https://play-lh.googleusercontent.com/P672xJ5oytm7jhBP59o4hMQfqErBhXsLD7n_PJG3qcGAaPqxpTHzHYOhPNYMlOaUwAV-";
    case 5:
      return "https://mybethanymedical.com/wp-content/uploads/2021/04/familycare.png";
    default:
      return "https://i.ibb.co/qMgGdD03/202605081225.jpg";
  }
};

function ChapterCard({ 
  chapter, 
  onClick, 
  masteredCount, 
  totalCount, 
  reviewCount 
}: { 
  key?: any;
  chapter: Chapter; 
  onClick: () => void; 
  masteredCount: number;
  totalCount: number;
  reviewCount: number;
}) {
  const percentage = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full h-full min-h-[230px] bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 text-left group transition-all flex flex-col justify-between"
    >
      <div className="w-full">
        <div className="flex items-center justify-between w-full mb-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-blue-600 transition-all duration-300 shadow-sm shadow-blue-50">
            <img src={getChapterImageUrl(chapter.id)} alt={`${chapter.title} Icon`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex items-center gap-1.5">
            {reviewCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {reviewCount} review
              </span>
            )}
            <span className="text-slate-400 font-mono text-[9px] font-black tracking-widest uppercase">CH0{chapter.id}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
            {chapter.title}
          </h3>
        </div>
      </div>
      
      <div className="w-full mt-6 space-y-2">
        {/* Progress stat */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wide">
          <span>Success Progress</span>
          <span className="font-mono text-slate-800 font-extrabold">{masteredCount} / {totalCount} Mastered</span>
        </div>
        
        {/* Small progress bar */}
        <div className="h-2.5 bg-slate-100/80 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
          <div 
            style={{ width: `${percentage}%` }}
            className="h-full bg-gradient-to-r from-blue-505 to-indigo-500 rounded-full transition-all duration-300" 
          />
        </div>

        <div className="pt-2 flex items-center gap-1 text-blue-600 font-bold text-xs group-hover:translate-x-1.5 transition-transform duration-200">
          <span>Explore Flashcards</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.button>
  );
}
