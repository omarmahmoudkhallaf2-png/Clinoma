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

const MIXED_CHAPTER: Chapter = {
  id: 0,
  title: 'Mixed Practice Session',
  topics: []
};

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
    setSessionQuestions(chapterQuestions);
    setView('study');
    setSidebarOpen(false);
  };

  const startMixedSession = () => {
    setActiveChapter(MIXED_CHAPTER);
    const unmastered = INITIAL_QUESTIONS.filter(q => !masteredIds.includes(q.id));
    const pool = unmastered.length > 0 ? unmastered : INITIAL_QUESTIONS;
    setSessionQuestions(pool);
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

  const confirmResetProgress = () => {
    setMasteredIds([]);
    setReviewList([]);
    localStorage.removeItem('clinoma_review_list');
    localStorage.removeItem('clinoma_mastered_ids');
    setShowResetConfirm(false);
  };

  const resetChapterProgress = (chapterId: number) => {
    const chapterQuestionIds = INITIAL_QUESTIONS.filter(q => q.chapterId === chapterId).map(q => q.id);
    setMasteredIds(prev => prev.filter(id => !chapterQuestionIds.includes(id)));
    setReviewList(prev => prev.filter(id => !chapterQuestionIds.includes(id)));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Sleek Persistent Top Global Header Bar */}
      <header className="sticky top-0 z-40 w-full flex items-center justify-between px-6 py-4 bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm animate-slide-down">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-all border border-slate-200/50 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <a href="#" className="flex items-center gap-3.5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 flex items-center justify-center overflow-hidden rounded-xl shadow-md shadow-blue-500/20">
              <img src="https://i.ibb.co/qMgGdD03/202605081225.jpg" alt="Logo" className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-slate-900 leading-none block">CLINOMA CARDS</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-none mt-1 block">Pediatric Board Preparation</span>
            </div>
          </a>
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
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 rotate-90" />
              <span>Exit</span>
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
                  <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-3 pb-2 flex items-center justify-between">
                    <span>Written Chapters</span>
                    <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-black tracking-widest border border-amber-500/20">WRITTEN</span>
                  </div>
                  <div className="space-y-1">
                    {CHAPTERS.filter(ch => [1, 3, 4, 6, 7, 11].includes(ch.id)).map((ch) => {
                      const chapterQuestions = INITIAL_QUESTIONS.filter(q => q.chapterId === ch.id);
                      const totalCount = chapterQuestions.length;
                      const masteredCount = chapterQuestions.filter(q => masteredIds.includes(q.id)).length;
                      const actualIdx = CHAPTERS.findIndex(c => c.id === ch.id);
                      return (
                        <button 
                          key={ch.id}
                          onClick={() => { startChapter(ch); }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all border ${
                            activeChapter?.id === ch.id && view === 'study'
                              ? 'text-white bg-amber-500/20 border-amber-500'
                              : 'text-amber-400 bg-slate-950 border-slate-900/50 hover:bg-slate-900 hover:text-amber-300'
                          }`}
                        >
                          <span className="flex items-center gap-2 overflow-hidden mr-1">
                            <span className="text-[10px] font-mono opacity-50 text-amber-500/60">{(actualIdx + 1) < 10 ? `0${actualIdx + 1}` : actualIdx + 1}</span>
                            <span className="truncate">{ch.title}</span>
                          </span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[8px] bg-amber-500/10 text-amber-402 border border-amber-400/20 px-1.5 py-0.2 rounded font-black uppercase text-center scale-90">Written</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              activeChapter?.id === ch.id && view === 'study' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-amber-500/70 font-bold'
                            }`}>
                              {masteredCount}/{totalCount}
                            </span>
                            {masteredCount > 0 && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`هل أنت متأكد من تصفير تقدم ${ch.title}؟`)) {
                                    resetChapterProgress(ch.id);
                                  }
                                }}
                                className="p-1 hover:bg-rose-500/25 rounded text-rose-455 hover:text-rose-300 transition-all cursor-pointer flex items-center justify-center text-rose-400"
                                title="تصفير تقدم الشابتر"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Elegant Divider Line in the Sidebar */}
                  <div className="my-5 border-t border-slate-800/80 relative">
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-950 px-2 text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-800/60 rounded">
                      ⏳ Pending Drafts
                    </span>
                  </div>

                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 pb-2 mt-2">Draft Chapters</div>
                  <div className="space-y-1">
                    {CHAPTERS.filter(ch => ![1, 3, 4, 6, 7, 11].includes(ch.id)).map((ch) => {
                      const chapterQuestions = INITIAL_QUESTIONS.filter(q => q.chapterId === ch.id);
                      const totalCount = chapterQuestions.length;
                      const masteredCount = chapterQuestions.filter(q => masteredIds.includes(q.id)).length;
                      const actualIdx = CHAPTERS.findIndex(c => c.id === ch.id);
                      return (
                        <button 
                          key={ch.id}
                          onClick={() => { startChapter(ch); }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeChapter?.id === ch.id && view === 'study'
                              ? 'text-white bg-blue-600'
                              : 'text-slate-500 hover:bg-slate-900 hover:text-slate-350'
                          }`}
                        >
                          <span className="flex items-center gap-2 overflow-hidden mr-1">
                            <span className="text-[10px] font-mono opacity-50 text-slate-500">{(actualIdx + 1) < 10 ? `0${actualIdx + 1}` : actualIdx + 1}</span>
                            <span className="truncate">{ch.title}</span>
                          </span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              activeChapter?.id === ch.id && view === 'study' ? 'bg-blue-700 text-white font-bold' : 'bg-slate-900 text-slate-650 font-bold'
                            }`}>
                              {masteredCount}/{totalCount}
                            </span>
                            {masteredCount > 0 && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`هل أنت متأكد من تصفير تقدم ${ch.title}؟`)) {
                                    resetChapterProgress(ch.id);
                                  }
                                }}
                                className="p-1 hover:bg-rose-500/20 rounded text-rose-500 hover:text-rose-450 transition-all cursor-pointer flex items-center justify-center"
                                title="تصفير تقدم الشابتر"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Progress & Reset at bottom */}
              <div className="pt-6 border-t border-slate-909 mt-auto space-y-4">
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
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 md:p-8">
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

                {/* Grid of all chapters rendered sequentially */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {CHAPTERS.map((chapter) => {
                      const chapterQuestions = INITIAL_QUESTIONS.filter(q => q.chapterId === chapter.id);
                      const totalCount = chapterQuestions.length;
                      const masteredCount = chapterQuestions.filter(q => masteredIds.includes(q.id)).length;
                      const reviewCount = chapterQuestions.filter(q => reviewList.includes(q.id)).length;
                      const originalIdx = CHAPTERS.findIndex(c => c.id === chapter.id);

                      return (
                        <ChapterCard 
                          key={chapter.id} 
                          chapter={chapter} 
                          index={originalIdx}
                          masteredCount={masteredCount}
                          totalCount={totalCount}
                          reviewCount={reviewCount}
                          onClick={() => startChapter(chapter)}
                          onReset={() => resetChapterProgress(chapter.id)}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* No overall status block under chapters */}
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
                  masteredIds={masteredIds}
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

      {/* Reset Confirmation Modal */}
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
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative z-10 border border-slate-100 text-center"
              dir="rtl"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-5 shadow-inner">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Reset All Progress?</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Are you sure you want to clear all progress, including saved review questions and mastered status, and start completely over? This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetProgress}
                  className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all"
                >
                  Yes, Reset and Start Over
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
      return "https://drkopelman.com/wp-content/uploads/2025/03/Eyelid-Diagram-1024x634.png"; // Eyelid
    case 2:
      return "https://media.allaboutvision.com/cms/caas/v1/media/406366/data/b678ee5fb622afd52c488be2ba50f46d/bannerimage.jpg"; // Lacrimal System
    case 3:
      return "https://d2o51ft7emegr.cloudfront.net/pub/media/wysiwyg/image-folder/glasses/eye/anatomy/conjunctiva/01-Structure-of-Conjunctiva-900x600.jpg"; // Conjunctiva
    case 4:
      return "https://gene.vision/wp-content/uploads/2020/03/anterior-segment-cropped-1024x486.jpg"; // Cornea & Sclera
    case 5:
      return "https://webvision.pitt.edu/wp-content/uploads/2017/08/Fig-1a.jpg"; // Lens
    case 6:
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx496cnEDbAlKzIyQZOOHxw-cDEDdaP9I1VA&s"; // Orbit
    case 7:
      return "https://www.vrmny.com/wp-content/uploads/2022/03/vision-disorders.jpg"; // Errors of Refraction
    case 8:
      return "https://drswatisinkar.com.au/wp-content/uploads/2021/09/Glaucoma-shutterstock_716954665-590x365.jpg"; // Glaucoma
    case 9:
      return "https://media.post.rvohealth.io/wp-content/uploads/2020/08/4067-Uveitis-642x361-anterior_uveitis_slide1.jpg"; // Uveitis
    case 10:
      return "https://i.ytimg.com/vi/jYjgqChOnWc/sddefault.jpg"; // Strabismus
    case 11:
      return "https://www.verywellhealth.com/thmb/urvJI_6CanHUX6Ig5LNuruQbM4M=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-308783-003-56acdcd85f9b58b7d00ac8e8.jpg"; // Retina
    case 12:
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmqJkUougfs-ZDt0S6QlnFElDCnkYBAJBwEQ&s"; // Neuro-ophthalmology
    case 13:
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAy_okQjRCUlmgcSbV1KPpVRBbdW8ubEEOfw&s"; // Ocular Trauma
    default:
      return "https://i.ibb.co/qMgGdD03/202605081225.jpg";
  }
};

function ChapterCard({ 
  chapter, 
  index,
  onClick, 
  masteredCount, 
  totalCount, 
  reviewCount,
  onReset
}: { 
  key?: any;
  chapter: Chapter; 
  index: number;
  onClick: () => void; 
  masteredCount: number;
  totalCount: number;
  reviewCount: number;
  onReset: () => void;
}) {
  const percentage = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
  const isWritten = [1, 3, 4, 6, 7, 11].includes(chapter.id);

  if (isWritten) {
    return (
      <motion.button
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full h-full min-h-[240px] bg-gradient-to-b from-slate-900 via-slate-950 to-neutral-950 p-6 md:p-8 rounded-3xl border border-amber-500/25 shadow-md hover:shadow-amber-500/10 text-left group transition-all flex flex-col justify-between relative overflow-hidden"
      >
        {/* Subtle decorative vector circles on the background */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-550/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="w-full relative z-10">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-amber-500/30 group-hover:ring-amber-400 transition-all duration-300">
              <img src={getChapterImageUrl(chapter.id)} alt={`${chapter.title} Icon`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 select-none animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                written
              </span>
              {reviewCount > 0 && (
                <span className="bg-amber-600/25 text-amber-200 border border-amber-500/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {reviewCount} review
                </span>
              )}
              <span className="text-amber-500/60 font-mono text-[9px] font-black tracking-widest uppercase ml-1">CH{(index + 1) < 10 ? '0' : ''}{index + 1}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white capitalize leading-tight group-hover:text-amber-300 transition-colors">
              {chapter.title}
            </h3>
          </div>
        </div>
        
        <div className="w-full mt-6 space-y-2 relative z-10">
          {/* Progress stat */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wide">
            <span>Accuracy Progress</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-amber-400 font-extrabold">{masteredCount} / {totalCount} Mastered</span>
              {masteredCount > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`هل أنت متأكد من تصفير تقدم ${chapter.title}؟`)) {
                      onReset();
                    }
                  }}
                  className="p-1 bg-slate-900 border border-slate-800 hover:bg-rose-950 hover:border-rose-900 rounded-lg text-rose-455 hover:text-rose-300 transition-all flex items-center justify-center cursor-pointer text-rose-400"
                  title="تصفير تقدم الشابتر"
                >
                  <RotateCcw className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              style={{ width: `${percentage}%` }}
              className="h-full bg-gradient-to-r from-amber-500 via-amber-450 to-yellow-350 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
            />
          </div>

          <div className="pt-2 flex items-center gap-1 text-amber-400 font-bold text-xs group-hover:translate-x-1.5 transition-transform duration-200">
            <span>Explore Flashcards</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.button>
    );
  }

  // Fallback for draft/other chapters
  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full h-full min-h-[240px] bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-550/10 text-left group transition-all flex flex-col justify-between opacity-100"
    >
      <div className="w-full">
        <div className="flex items-center justify-between w-full mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 flex items-center justify-center overflow-hidden ring-1 ring-slate-100 group-hover:ring-2 group-hover:ring-indigo-550 transition-all duration-300">
            <img src={getChapterImageUrl(chapter.id)} alt={`${chapter.title} Icon`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex items-center gap-1.5">
            {reviewCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {reviewCount} review
              </span>
            )}
            <span className="text-slate-400 font-mono text-[9px] font-black tracking-widest uppercase ml-1">CH{(index + 1) < 10 ? '0' : ''}{index + 1}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
            {chapter.title}
          </h3>
        </div>
      </div>
      
      <div className="w-full mt-6 space-y-2">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wide">
          <span>Accuracy Progress</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-indigo-600 font-extrabold">{masteredCount} / {totalCount} Mastered</span>
            {masteredCount > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`هل أنت متأكد من تصفير تقدم ${chapter.title}؟`)) {
                    onReset();
                  }
                }}
                className="p-1 bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 rounded-lg text-rose-500 hover:text-rose-600 transition-all flex items-center justify-center cursor-pointer"
                title="تصفير تقدم الشابتر"
              >
                <RotateCcw className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
        
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div 
            style={{ width: `${percentage}%` }}
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(99,102,241,0.35)]" 
          />
        </div>

        <div className="pt-2 flex items-center gap-1 text-indigo-550 font-bold text-xs group-hover:translate-x-1.5 transition-transform duration-200">
          <span>Explore Flashcards</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.button>
  );
}
