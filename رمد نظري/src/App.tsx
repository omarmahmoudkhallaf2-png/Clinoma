import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Clock, 
  Star, 
  Copy, 
  X,
  ChevronLeft,
  LayoutGrid,
  Zap
} from 'lucide-react';
import { Flashcard, flashcardCategories, ophthalmologyData } from './data/flashcards';
import { alternativeExplanations } from './data/alternative_explanations';
import Markdown from 'react-markdown';

const STORAGE_KEY = 'ophtho_cards_progress_geometric_v2';

// Shared types and constants
interface AppState {
  currentIndex: number;
  finishedIds: string[];
  deferredCards: Array<{ id: string; readyAt: number }>;
  difficultIds: string[];
}


export default function App() {
  const normalizedData = useMemo(() => {
    return ophthalmologyData.map(card => {
      if (typeof card.explanation === 'string') {
        return {
          ...card,
          explanation: {
            primary: card.explanation,
            alternative: alternativeExplanations[card.id] || card.explanation,
          }
        };
      }
      return card;
    });
  }, []);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      currentIndex: 0,
      finishedIds: [],
      deferredCards: [],
      difficultIds: []
    };
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const [timer, setTimer] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [explanationType, setExplanationType] = useState<'primary' | 'alternative'>('primary');

  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Tick for deferred cards
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const availableCards = useMemo(() => {
    const deferredIds = state.deferredCards.map(d => d.id);
    const normalCards = normalizedData.filter(c => 
      c.category === selectedCategoryId &&
      !state.finishedIds.includes(c.id) && 
      !deferredIds.includes(c.id)
    );

    let readyDeferredCards = state.deferredCards
      .filter(d => d.readyAt <= now && !state.finishedIds.includes(d.id))
      .map(d => normalizedData.find(c => c.id === d.id))
      .filter((c): c is Flashcard => !!c && c.category === selectedCategoryId);

    if (normalCards.length === 0 && readyDeferredCards.length === 0) {
      // Bring in pending deferred immediately if nothing else is left
      readyDeferredCards = state.deferredCards
        .filter(d => !state.finishedIds.includes(d.id))
        .sort((a,b) => a.readyAt - b.readyAt)
        .map(d => normalizedData.find(c => c.id === d.id))
        .filter((c): c is Flashcard => !!c && c.category === selectedCategoryId);
    }

    // Combine normal cards FIRST, then ready deferred cards
    return [...normalCards, ...readyDeferredCards];
  }, [state.finishedIds, state.deferredCards, selectedCategoryId, now, normalizedData]);

  useEffect(() => {
    if (availableCards.length > 0) {
      if (!activeCardId || !availableCards.find(c => c.id === activeCardId)) {
        setActiveCardId(availableCards[0].id);
      }
    } else {
      setActiveCardId(null);
    }
  }, [availableCards, activeCardId]);

  const currentCard = availableCards.find(c => c.id === activeCardId) || null;

  useEffect(() => {
    setExplanationType('primary');
  }, [currentCard?.id]);

  const readyDeferred = useMemo(() => 
    state.deferredCards.filter(d => d.readyAt <= now),
    [state.deferredCards, now]
  );

  const pendingDeferred = useMemo(() => 
    state.deferredCards.filter(d => d.readyAt > now).sort((a,b) => a.readyAt - b.readyAt),
    [state.deferredCards, now]
  );

  const handleFinish = useCallback(() => {
    if (!currentCard) return;
    setState(prev => ({
      ...prev,
      finishedIds: [...prev.finishedIds, currentCard.id],
      deferredCards: prev.deferredCards.filter(d => d.id !== currentCard.id)
    }));
    setIsFlipped(false);
    setTimer(0);
  }, [currentCard]);

  const handleDefer = useCallback((minutes: number) => {
    if (!currentCard) return;
    const readyAt = Date.now() + minutes * 60 * 1000;
    setState(prev => ({
      ...prev,
      deferredCards: [
        ...prev.deferredCards.filter(d => d.id !== currentCard.id),
        { id: currentCard.id, readyAt }
      ]
    }));
    setIsFlipped(false);
    setTimer(0);
  }, [currentCard]);

  const handleSelectDeferred = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      deferredCards: prev.deferredCards.filter(d => d.id !== id),
    }));
    setActiveCardId(id);
    setIsFlipped(false);
    setTimer(0);
  }, []);

  const handleToggleDifficult = useCallback(() => {
    if (!currentCard) return;
    setState(prev => ({
      ...prev,
      difficultIds: prev.difficultIds.includes(currentCard.id)
        ? prev.difficultIds.filter(id => id !== currentCard.id)
        : [...prev.difficultIds, currentCard.id]
    }));
  }, [currentCard]);

  const handleCopy = useCallback(() => {
    if (!currentCard) return;
    const text = `${currentCard.question}\n\n${currentCard.answer.title}\n${currentCard.answer.content.map(c => `- ${c.text}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  }, [currentCard]);

  const handleResetProgress = useCallback(() => {
    setState({
      currentIndex: 0,
      finishedIds: [],
      deferredCards: [],
      difficultIds: []
    });
    setShowResetModal(false);
    setIsFlipped(false);
    setTimer(0);
    setExplanation(null);
  }, []);

  const handleExplain = useCallback(() => {
    if (!currentCard) return;
    
    setExplanation(null);
    setExplanationError(null);
    
    // Always start with primary explanation
    const initialSource = 'primary';
    setExplanationType(initialSource);

    const chosenExplanation = (currentCard.explanation as {primary: string, alternative: string}).primary;

    setExplanation(chosenExplanation);
  }, [currentCard]);

  const handleToggleExplanation = useCallback(() => {
    if (!currentCard) return;
    
    const newType = explanationType === 'primary' ? 'alternative' : 'primary';
    setExplanationType(newType);
    setExplanation(newType === 'primary' ? (currentCard.explanation as {primary: string, alternative: string}).primary : (currentCard.explanation as {primary: string, alternative: string}).alternative);
  }, [currentCard, explanationType]);

// ...
  // In the JSX, add the loading screen:
  // if (isAskingAi) return <LoadingScreen />;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResetModal) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(v => !v);
      }
      if (e.key === '0') handleFinish();
      if (e.key === '1') handleDefer(5);
      if (e.key === '2') handleDefer(10);
      if (e.key === '3') handleDefer(15);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinish, handleDefer, showResetModal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedCategoryId) {
    return (
      <div className="h-screen w-full bg-[#FEF9E7] font-sans text-slate-800 overflow-y-auto select-none relative flex flex-col items-center py-6 md:py-12" style={{ backgroundImage: 'radial-gradient(#F7DC6F 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        {/* Brand Watermark */}
        <a 
          href="https://clinoma.pages.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-4 left-6 z-[100] hover:scale-105 transition-transform"
        >
          <span className="text-2xl md:text-3xl font-black text-blue-600 tracking-tighter italic drop-shadow-sm">Clinoma</span>
        </a>
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 md:mb-16 px-4"
        >
          <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-[24px] md:rounded-3xl border-4 border-amber-300 shadow-xl flex items-center justify-center text-3xl md:text-5xl mx-auto mb-4 md:mb-6">
            🎓
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-1 md:mb-2 font-serif">OphthalmoCards</h1>
          <p className="text-amber-700 font-bold tracking-widest uppercase text-[10px] md:text-xs">Interactive Medical Learning • فلاش كاردز العيون</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl px-4 md:px-6 w-full">
          {flashcardCategories.map((cat, idx) => {
            const count = normalizedData.filter(c => c.category === cat.id).length;
            const completed = state.finishedIds.filter(id => 
              normalizedData.find(c => c.id === id)?.category === cat.id
            ).length;
            const progress = count > 0 ? (completed / count) * 100 : 0;

            return (
              <motion.button
                key={cat.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedCategoryId(cat.id)}
                className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-[4px] md:border-[6px] border-amber-300 shadow-[0_15px_30px_-10px_rgba(251,191,36,0.2)] hover:shadow-[0_30px_60px_-12px_rgba(251,191,36,0.4)] transition-all group relative overflow-hidden text-left"
              >
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-amber-50 rounded-bl-[80px] md:rounded-bl-[100px] -mr-6 md:-mr-8 -mt-6 md:-mt-8 transition-transform group-hover:scale-110" />
                
                <div className="relative">
                  <span className="text-4xl md:text-6xl mb-4 md:mb-6 block drop-shadow-lg">{cat.icon}</span>
                  <h2 className="text-xl md:text-3xl font-black text-slate-800 mb-1 md:mb-2 leading-tight pr-12">{cat.name}</h2>
                  <div className="mt-4 md:mt-6 flex flex-col gap-1.5 md:gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] md:text-xs font-black text-amber-600 uppercase">{completed} / {count} CARDS</span>
                      <span className="text-[10px] md:text-xs font-black text-slate-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 md:h-4 w-full bg-slate-100 rounded-full overflow-hidden border-2 border-slate-50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <button 
            onClick={() => setShowResetModal(true)}
            className="px-8 py-3 bg-red-50 text-red-500 rounded-full text-xs font-black tracking-widest uppercase hover:bg-red-100 transition-all border-2 border-red-100 flex items-center gap-2"
          >
            <RotateCcw size={14} /> Clear All Progress
          </button>
        </motion.div>
        
        {/* Reset Confirmation Modal (Shared) */}
        <AnimatePresence>
          {showResetModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-[40px] p-10 border-[6px] border-red-200 shadow-[0_40px_100px_-20px_rgba(220,38,38,0.3)] text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-3 bg-red-500" />
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">⚠️</div>
                <h3 className="text-3xl font-black mb-3 text-slate-800">هل أنت متأكد؟</h3>
                <p className="text-slate-500 text-lg mb-10 font-medium">سيتم تصفير جميع تقدمك والبدء من جديد.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-slate-600 uppercase tracking-widest text-xs">إلغاء</button>
                  <button onClick={handleResetProgress} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] uppercase tracking-widest text-xs">نعم، تصفير</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const activeCategory = flashcardCategories.find(c => c.id === selectedCategoryId);
  const totalInCategory = normalizedData.filter(c => c.category === selectedCategoryId).length;
  const completedInCategory = state.finishedIds.filter(id => normalizedData.find(c => c.id === id)?.category === selectedCategoryId).length;

  return (
    <div className="h-screen w-full bg-[#FEF9E7] font-sans text-slate-800 overflow-hidden select-none relative flex" style={{ backgroundImage: 'radial-gradient(#F7DC6F 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      {/* Brand Watermark */}
      <a 
        href="https://clinoma.pages.dev" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute top-4 right-6 z-[100] hover:scale-105 transition-transform"
      >
        <span className="text-2xl md:text-3xl font-black text-blue-600 tracking-tighter italic drop-shadow-sm">Clinoma</span>
      </a>
      {/* Sidebar: Deferred Queue */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:relative inset-y-0 left-0 w-80 bg-white/95 backdrop-blur-md border-r-2 border-amber-200 flex flex-col shadow-2xl lg:shadow-none z-50 transition-all"
            >
              <div className="p-6 border-b border-amber-100 bg-amber-50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-amber-700 font-serif">
                    <span className="text-2xl">📚</span>
                    قائمة الانتظار
                  </h2>
                  <p className="text-[10px] text-amber-600/70 mt-1 uppercase tracking-widest font-semibold">Deferred Cards Queue</p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-amber-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-amber-700" />
                </button>
              </div>
      
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex flex-col gap-2 mb-4">
                   <div className="flex justify-between items-center bg-white border-2 border-amber-200 p-3 rounded-xl shadow-sm">
                     <span className="text-sm font-bold text-amber-600">{completedInCategory} / {totalInCategory}</span>
                     <span className="text-[10px] text-slate-400 uppercase font-black">Category Progress</span>
                   </div>
                   <button 
                     onClick={() => {
                        setSelectedCategoryId(null);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                     }}
                     className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-2"
                   >
                     <LayoutGrid size={12} /> View All Categories
                   </button>
                </div>
      
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Clock size={12} /> Ready Soon ({readyDeferred.length})
                </p>
                
                <div className="space-y-3">
                  {readyDeferred.map(d => {
                    const card = ophthalmologyData.find(c => c.id === d.id);
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          handleSelectDeferred(d.id);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className="w-full bg-white border-2 border-amber-100 rounded-xl p-3 shadow-sm hover:border-amber-400 transition-all cursor-pointer text-left group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-bold">READY</span>
                          <span className="text-[10px] text-slate-400">#{card?.id}</span>
                        </div>
                        <p className="text-sm font-medium line-clamp-2 text-slate-700 group-hover:text-amber-600 transition-colors">{card?.question}</p>
                      </button>
                    );
                  })}
                  {readyDeferred.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No cards ready yet.</p>
                  )}
                </div>
      
                {pendingDeferred.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pending ({pendingDeferred.length})</p>
                    <div className="space-y-2">
                      {pendingDeferred.map(d => {
                        const card = normalizedData.find(c => c.id === d.id);
                        const timeLeft = Math.ceil((d.readyAt - now) / 60000);
                        return (
                          <div key={d.id} className="bg-white/50 border border-slate-200 rounded-lg p-2 flex justify-between items-center">
                            <span className="text-[10px] font-medium text-slate-500 truncate max-w-[140px]">{card?.question}</span>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">{timeLeft}m</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
      
              <div className="p-4 border-t border-amber-100">
                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full py-3 bg-red-50 text-red-500 border-2 border-red-100 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 group"
                >
                  <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                  Reset Progress • تصفير التقدم
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 relative min-w-0">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 bg-white border-2 border-amber-200 rounded-2xl text-amber-500 hover:bg-amber-50 transition-all shadow-sm relative shrink-0"
              >
                <Clock size={24} />
                {readyDeferred.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm animate-bounce">
                    {readyDeferred.length}
                  </span>
                )}
              </button>
            )}
            <button 
              onClick={() => setSelectedCategoryId(null)}
              className="p-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-amber-500 transition-all shadow-sm group shrink-0"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="bg-white px-5 py-2 rounded-full border-2 border-amber-200 shadow-sm flex items-center gap-4 shrink-0">
              <span className="text-2xl">{activeCategory?.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-800 leading-none truncate max-w-[150px] md:max-w-none">{activeCategory?.name}</span>
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">{availableCards.length} Remaining</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-5 py-2 rounded-full border-2 border-slate-100 shadow-sm shrink-0">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <span className="font-mono font-black text-xl text-slate-700">{formatTime(timer)}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleToggleDifficult}
              className={`p-3 rounded-2xl border-2 shadow-sm transition-all ${
                state.difficultIds.includes(currentCard?.id || '') 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-500 scale-110' 
                : 'bg-white border-slate-200 text-slate-300 hover:text-yellow-500'
              }`}
            >
              <Star size={24} fill={state.difficultIds.includes(currentCard?.id || '') ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={handleCopy}
              className="bg-white px-5 py-2 rounded-2xl border-2 border-slate-200 shadow-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600 text-sm font-bold transition-all relative"
            >
              <Copy size={18} />
              Copy • نسخ
              <AnimatePresence>
                {copyFeedback && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl font-bold"
                  >
                    COPIED!
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button 
              disabled={!currentCard}
              onClick={handleExplain}
              className="bg-amber-400 px-5 py-2 rounded-2xl border-2 border-amber-500 shadow-sm hover:bg-amber-500 text-white text-sm font-black transition-all relative flex items-center gap-2"
            >
              <Zap size={18} />
              Explain • اشرح
            </button>
          </div>
        </div>

        {/* Flashcard Container */}
        <div className="flex-1 relative perspective-2000">
          <AnimatePresence mode="wait">
            {currentCard ? (
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full relative"
              >
                <motion.div
                  className="w-full h-full cursor-pointer relative"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setIsFlipped(v => !v)}
                >
                  {/* Front Side: Question */}
                  <div 
                    className="absolute inset-0 bg-white rounded-[30px] md:rounded-[40px] border-[4px] md:border-[6px] border-amber-300 shadow-[0_20px_40px_-10px_rgba(251,191,36,0.3)] p-8 md:p-16 flex flex-col justify-center items-center text-center backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Decoration dots */}
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 flex gap-2 md:gap-3">
                      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-blue-300 shadow-inner"></div>
                      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-pink-300 shadow-inner"></div>
                      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-green-300 shadow-inner"></div>
                    </div>

                    <h1 className="text-2xl md:text-5xl font-black text-slate-800 leading-tight max-w-3xl">
                      {currentCard.question}
                    </h1>

                    <div className="absolute bottom-6 md:bottom-10 text-slate-300 flex items-center gap-3">
                      <span className="text-[10px] md:text-xs font-black tracking-widest uppercase">Tap to flip • انقر للقلب</span>
                      <kbd className="hidden md:inline-block bg-slate-50 px-4 py-2 rounded-xl border-2 border-slate-100 text-slate-400 shadow-inner font-mono font-bold">SPACE</kbd>
                    </div>
                  </div>

                  {/* Back Side: Answer */}
                  <div 
                    className="absolute inset-0 bg-white rounded-[30px] md:rounded-[40px] border-[4px] md:border-[6px] border-amber-300 shadow-[0_20px_40px_-10px_rgba(251,191,36,0.3)] p-6 md:p-12 overflow-y-auto backface-hidden"
                    style={{ 
                      backfaceVisibility: 'hidden', 
                      transform: 'rotateY(180deg)' 
                    }}
                  >
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 flex gap-2 md:gap-3">
                      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-blue-300 shadow-inner"></div>
                      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-pink-300 shadow-inner"></div>
                      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-green-300 shadow-inner"></div>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 pt-4 md:pt-6">
                      <div className="flex justify-between items-center border-b-4 md:border-b-6 border-black pb-1 md:pb-2">
                        <h2 className="text-xl md:text-4xl font-black text-black uppercase tracking-tight">
                          {currentCard.answer.title}
                        </h2>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExplain();
                          }}
                          className="bg-amber-400 p-2 md:px-4 md:py-2 rounded-xl border-2 border-amber-600 shadow-sm hover:bg-amber-500 text-white text-[10px] md:text-sm font-black transition-all flex items-center gap-1 md:gap-2"
                        >
                          <Zap size={14} />
                          Explanation • الشرح
                        </button>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        {currentCard.answer.content.map((item, idx) => (
                          <div key={idx}>
                            {item.type === 'example' ? (
                              <div className="bg-red-50 p-4 md:p-8 rounded-[20px] md:rounded-[30px] border-l-[6px] md:border-l-[10px] border-red-400 shadow-sm mt-3 md:mt-4">
                                <p className="text-sm md:text-2xl text-red-700 font-serif italic leading-relaxed">
                                  <span className="font-black uppercase not-italic block mb-2 text-[8px] md:text-xs opacity-50 tracking-widest">Example • مثال:</span>
                                  {item.text}
                                </p>
                              </div>
                            ) : (
                              <p className={`leading-relaxed ${
                                item.type === 'main' 
                                ? 'text-blue-700 text-base md:text-3xl font-black mb-1 md:mb-2' 
                                : 'text-sm md:text-2xl text-blue-500 font-bold ml-2 md:ml-4'
                              }`}>
                                {item.text}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="w-full h-full bg-white/60 backdrop-blur-md rounded-[30px] md:rounded-[40px] border-4 border-dashed border-amber-200 flex flex-col items-center justify-center p-8 md:p-12 text-center">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl md:text-6xl mb-6 md:mb-8 shadow-inner animate-bounce text-6xl">
                  🏆
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-800 mb-3 md:mb-4">All Fixed! • انتهينا</h2>
                <p className="text-sm md:text-xl text-slate-500 max-w-md">You've cleared all available cards. New ones will appear once their deferral time ends.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Controls: Buttons with 3D feel */}
        <div className="mt-6 md:mt-10 flex flex-wrap justify-center items-center gap-3 md:gap-6">
          <div className="flex flex-col items-center gap-1 md:gap-2 group">
            <button
              disabled={!currentCard}
              onClick={handleFinish}
              className="w-20 h-16 md:w-28 md:h-20 bg-green-500 text-white rounded-[20px] md:rounded-[24px] shadow-[0_8px_16px_-4px_rgba(34,197,94,0.6)] border-b-4 md:border-b-6 border-green-700 flex flex-col items-center justify-center transition-all active:translate-y-1 active:border-b-0 disabled:opacity-30 disabled:grayscale"
            >
              <span className="text-[8px] md:text-[10px] opacity-80 uppercase font-black tracking-widest mb-0.5 md:mb-1">Finish</span>
              <span className="text-2xl md:text-3xl">🏁</span>
            </button>
            <span className="hidden md:block text-[10px] font-black text-slate-400 group-hover:text-green-600 transition-colors">Press [0]</span>
          </div>

          <div className="flex flex-col items-center gap-1 md:gap-2 group">
            <button
              disabled={!currentCard}
              onClick={() => handleDefer(5)}
              className="w-20 h-16 md:w-28 md:h-20 bg-sky-400 text-white rounded-[20px] md:rounded-[24px] shadow-[0_8px_16px_-4px_rgba(56,189,248,0.6)] border-b-4 md:border-b-6 border-sky-600 flex flex-col items-center justify-center transition-all active:translate-y-1 active:border-b-0 disabled:opacity-30 disabled:grayscale"
            >
              <span className="text-[8px] md:text-[10px] opacity-80 uppercase font-black tracking-widest mb-0.5 md:mb-1">5 Min</span>
              <span className="text-2xl md:text-3xl">🕙</span>
            </button>
            <span className="hidden md:block text-[10px] font-black text-slate-400 group-hover:text-sky-500 transition-colors">Press [1]</span>
          </div>

          <div className="flex flex-col items-center gap-1 md:gap-2 group">
            <button
              disabled={!currentCard}
              onClick={() => handleDefer(10)}
              className="w-20 h-16 md:w-28 md:h-20 bg-indigo-400 text-white rounded-[20px] md:rounded-[24px] shadow-[0_8px_16px_-4px_rgba(129,140,248,0.6)] border-b-4 md:border-b-6 border-indigo-600 flex flex-col items-center justify-center transition-all active:translate-y-1 active:border-b-0 disabled:opacity-30 disabled:grayscale"
            >
              <span className="text-[8px] md:text-[10px] opacity-80 uppercase font-black tracking-widest mb-0.5 md:mb-1">10 Min</span>
              <span className="text-2xl md:text-3xl">⏰</span>
            </button>
            <span className="hidden md:block text-[10px] font-black text-slate-400 group-hover:text-indigo-500 transition-colors">Press [2]</span>
          </div>

          <div className="flex flex-col items-center gap-1 md:gap-2 group">
            <button
              disabled={!currentCard}
              onClick={() => handleDefer(15)}
              className="w-20 h-16 md:w-28 md:h-20 bg-violet-400 text-white rounded-[20px] md:rounded-[24px] shadow-[0_8px_16px_-4px_rgba(167,139,250,0.6)] border-b-4 md:border-b-6 border-violet-600 flex flex-col items-center justify-center transition-all active:translate-y-1 active:border-b-0 disabled:opacity-30 disabled:grayscale"
            >
              <span className="text-[8px] md:text-[10px] opacity-80 uppercase font-black tracking-widest mb-0.5 md:mb-1">15 Min</span>
              <span className="text-2xl md:text-3xl">⌛</span>
            </button>
            <span className="hidden md:block text-[10px] font-black text-slate-400 group-hover:text-violet-500 transition-colors">Press [3]</span>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 border-[6px] border-red-200 shadow-[0_40px_100px_-20px_rgba(220,38,38,0.3)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-red-500" />
              
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                ⚠️
              </div>
              <h3 className="text-3xl font-black mb-3 text-slate-800">هل أنت متأكد؟</h3>
              <p className="text-slate-500 text-lg mb-10 font-medium">سيتم تصفير جميع تقدمك في الفلاش كاردز والبدء من جديد. هذا الإجراء لا يمكن التراجع عنه.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-slate-600 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                >
                  إلغاء • Cancel
                </button>
                <button 
                  onClick={handleResetProgress}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] uppercase tracking-widest text-xs"
                >
                  نعم، تصفير • Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Explanation Modal */}
      <AnimatePresence>
        {(explanation || explanationError) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-[30px] md:rounded-[50px] border-[6px] border-amber-300 shadow-2xl flex flex-col overflow-hidden relative"
            >
              <div className="p-6 md:p-8 bg-amber-50 border-b-4 border-amber-200 flex justify-between items-center sm:sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-none">Smart Explanation</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentCard && (
                    <button 
                      onClick={handleToggleExplanation}
                      className="text-xs font-black bg-white px-4 py-2 rounded-xl border-2 border-amber-300 text-amber-700 uppercase tracking-widest hover:bg-amber-100 transition-colors"
                    >
                      شرح آخر
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setExplanation(null);
                      setExplanationError(null);
                    }}
                    className="p-3 hover:bg-amber-200 rounded-2xl transition-colors text-amber-700"
                  >
                    <X size={28} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-12">
                {explanationError ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-6">😕</div>
                    <h4 className="text-2xl font-black text-slate-800 mb-2">Oops! something went wrong</h4>
                    <p className="text-slate-500 max-w-md">{explanationError}</p>
                    <button 
                      onClick={handleExplain}
                      className="mt-8 px-8 py-3 bg-amber-400 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all"
                    >
                      Retry • إعادة المحاولة
                    </button>
                  </div>
                ) : (
                  <div className="prose prose-slate prose-amber max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-amber-600 prose-strong:font-black markdown-content text-right" dir="rtl">
                    <Markdown>{explanation || ''}</Markdown>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                  Explanations are based on clinical textbooks.<br/>
                  جميع الشروحات مبنية على الكتب الدراسية المعتمدة.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .perspective-2000 { perspective: 2000px; }
        .backface-hidden { backface-visibility: hidden; }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&display=swap');
        
        .markdown-content * {
          text-align: right;
        }
        
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          color: #1e293b;
          border-bottom: 3px solid #fcd34d;
          display: inline-block;
          margin-bottom: 1rem;
          margin-top: 2rem;
          padding-bottom: 0.25rem;
        }

        .markdown-content p {
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
        }

        .markdown-content ul {
          margin-bottom: 1.5rem;
          padding-right: 1.5rem;
        }

        .markdown-content li {
          margin-bottom: 0.5rem;
          list-style-type: disc;
        }
      `}</style>
    </div>
  );
}
