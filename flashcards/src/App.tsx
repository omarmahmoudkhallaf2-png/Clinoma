/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FLASHCARDS, CLINICAL_CARDS, FlashcardData } from './data';
import { 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Copy, 
  Check, 
  AlertCircle,
  X,
  LayoutDashboard,
  Timer as TimerIcon,
  Home,
  BookOpen,
  Stethoscope
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DeferredCard {
  id: string;
  readyAt: number;
}

interface AppState {
  queue: string[];
  deferred: DeferredCard[];
  finished: string[];
  currentIndex: number;
}

const STORAGE_KEY_ESSAY = 'cardio_flashcards_essay_progress';
const STORAGE_KEY_CLINICAL = 'cardio_flashcards_clinical_progress';

type ViewMode = 'home' | 'essay' | 'clinical';

export default function App() {
  const [view, setView] = useState<ViewMode>('home');

  // --- State for Essay Mode ---
  const [essayState, setEssayState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ESSAY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return { queue: FLASHCARDS.map(c => c.id), deferred: [], finished: [], currentIndex: 0 };
  });

  // --- State for Clinical Mode ---
  const [clinicalState, setClinicalState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLINICAL);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return { queue: CLINICAL_CARDS.map(c => c.id), deferred: [], finished: [], currentIndex: 0 };
  });

  const state = view === 'essay' ? essayState : clinicalState;
  const setState = view === 'essay' ? setEssayState : setClinicalState;
  const currentCards = view === 'essay' ? FLASHCARDS : CLINICAL_CARDS;
  const storageKey = view === 'essay' ? STORAGE_KEY_ESSAY : STORAGE_KEY_CLINICAL;

  const [isFlipped, setIsFlipped] = useState(false);
  const [cardTimer, setCardTimer] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [readyDeferredIds, setReadyDeferredIds] = useState<string[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundCheckRef = useRef<NodeJS.Timeout | null>(null);

  // --- Derived State ---
  const currentCardId = state.queue[state.currentIndex];
  const currentCard = currentCards.find(c => c.id === currentCardId);
  const totalCards = currentCards.length;
  const remainingCards = state.queue.length;
  const finishedCount = state.finished.length;

  // --- Persistence ---
  useEffect(() => {
    if (view !== 'home') {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, view, storageKey]);

  // --- Timer Logic ---
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCardTimer(0);
    if (view !== 'home') {
      timerRef.current = setInterval(() => {
        setCardTimer(prev => prev + 1);
      }, 1000);
    }
  }, [view]);

  useEffect(() => {
    if (view !== 'home') {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentCardId, startTimer, view]);

  // --- Background Check for Deferred Cards ---
  useEffect(() => {
    if (view === 'home') return;
    const checkDeferred = () => {
      const now = Date.now();
      const ready = state.deferred
        .filter(d => d.readyAt <= now)
        .map(d => d.id);
      setReadyDeferredIds(ready);
    };

    checkDeferred();
    backgroundCheckRef.current = setInterval(checkDeferred, 5000);
    return () => {
      if (backgroundCheckRef.current) clearInterval(backgroundCheckRef.current);
    };
  }, [state.deferred, view]);

  // --- Actions ---
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const moveToNext = useCallback((action: 'finish' | '10min' | '20min') => {
    setState(prev => {
      let newQueue = [...prev.queue];
      let newDeferred = [...prev.deferred];
      let newFinished = [...prev.finished];
      const cardId = newQueue[prev.currentIndex];

      if (!cardId) return prev;

      newQueue.splice(prev.currentIndex, 1);

      if (action === 'finish') {
        newFinished.push(cardId);
      } else {
        const delay = action === '10min' ? 10 * 60 * 1000 : 20 * 60 * 1000;
        newDeferred.push({ id: cardId, readyAt: Date.now() + delay });
      }

      const now = Date.now();
      const readyIndex = newDeferred.findIndex(d => d.readyAt <= now);
      
      if (readyIndex !== -1) {
        const readyCard = newDeferred.splice(readyIndex, 1)[0];
        newQueue.splice(prev.currentIndex, 0, readyCard.id);
      }

      const nextIndex = prev.currentIndex >= newQueue.length ? 0 : prev.currentIndex;

      return {
        ...prev,
        queue: newQueue,
        deferred: newDeferred,
        finished: newFinished,
        currentIndex: nextIndex
      };
    });
    setIsFlipped(false);
  }, [setState]);

  const handleSelectDeferred = (id: string) => {
    setState(prev => {
      const newDeferred = prev.deferred.filter(d => d.id !== id);
      const newQueue = [...prev.queue];
      newQueue.splice(prev.currentIndex, 0, id);
      return {
        ...prev,
        queue: newQueue,
        deferred: newDeferred
      };
    });
    setIsFlipped(false);
  };

  const handleReset = () => {
    const newState = {
      queue: currentCards.map(c => c.id),
      deferred: [],
      finished: [],
      currentIndex: 0
    };
    setState(newState);
    setIsFlipped(false);
    setShowResetModal(false);
  };

  const handleCopy = () => {
    if (!currentCard) return;
    const plainText = `Question: ${currentCard.question}\n\nAnswer: ${currentCard.answer.replace(/<[^>]*>/g, '')}`;
    navigator.clipboard.writeText(plainText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResetModal || view === 'home') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1') {
        if (currentCardId) moveToNext('finish');
      } else if (e.key === '2') {
        if (currentCardId) moveToNext('10min');
      } else if (e.key === '3') {
        if (currentCardId) moveToNext('20min');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, moveToNext, currentCardId, showResetModal, view]);

  // --- Formatting Helpers ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (view === 'home') {
    return (
      <div 
        className="h-screen w-full bg-cover bg-center bg-fixed flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-100 overflow-hidden"
        style={{ backgroundImage: 'url("https://picsum.photos/seed/pediatrics/1920/1080?blur=2")' }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 mb-4 drop-shadow-sm">
            Cardio Flashcards <span className="text-indigo-600">Pro</span>
          </h1>
          <p className="text-slate-600 text-xl font-medium">Choose your study mode to begin</p>
        </motion.div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('essay')}
            className="bg-white/90 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl border-4 border-white flex flex-col items-center gap-6 group transition-all"
          >
            <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <BookOpen size={48} />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-800 mb-2">Essay Questions</h2>
              <p className="text-slate-500 font-medium">Detailed questions and comprehensive answers for deep study.</p>
            </div>
            <div className="mt-4 bg-slate-100 px-6 py-2 rounded-full text-slate-500 font-bold text-sm">
              {FLASHCARDS.length} Cards
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('clinical')}
            className="bg-white/90 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl border-4 border-white flex flex-col items-center gap-6 group transition-all"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Stethoscope size={48} />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-800 mb-2">Clinical Points</h2>
              <p className="text-slate-500 font-medium">Quick disease identification and key clinical signs/points.</p>
            </div>
            <div className="mt-4 bg-slate-100 px-6 py-2 rounded-full text-slate-500 font-bold text-sm">
              {CLINICAL_CARDS.length} Cards
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-full bg-cover bg-center bg-fixed flex flex-col items-center p-2 md:p-4 font-sans selection:bg-indigo-100 overflow-hidden"
      style={{ backgroundImage: 'url("https://picsum.photos/seed/pediatrics/1920/1080?blur=2")' }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none" />

      {/* Header / Progress */}
      <div className="relative z-10 w-full max-w-[99vw] flex items-center justify-between mb-2 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('home')}
            className="bg-white/90 backdrop-blur hover:bg-indigo-50 text-indigo-600 p-2 rounded-xl shadow-sm border border-white/20 transition-all active:scale-95"
            title="Home"
          >
            <Home size={20} />
          </button>
          
          <div className="bg-white/90 backdrop-blur shadow-sm border border-white/20 px-4 py-2 rounded-xl flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Progress</span>
              <span className="text-lg font-black text-slate-800">
                {finishedCount} <span className="text-slate-400 font-normal">/ {totalCards}</span>
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Remaining</span>
              <span className="text-lg font-black text-slate-800">{remainingCards}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-white/20 text-slate-500 text-xs font-bold uppercase tracking-wider">
            {view === 'essay' ? 'Essay Mode' : 'Clinical Mode'}
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="bg-white/90 backdrop-blur hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl shadow-sm border border-white/20 flex items-center gap-2 transition-all active:scale-95 font-bold text-sm"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-[99vw] grid grid-cols-1 lg:grid-cols-6 gap-4 items-stretch flex-1 min-h-0">
        
        {/* Sidebar for Deferred Cards */}
        <aside className="lg:col-span-1 flex flex-col gap-4 order-2 lg:order-1 min-h-0">
          <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/20 h-full flex flex-col min-h-0">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
              <Clock size={12} />
              Review Queue
            </h2>
            
            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {readyDeferredIds.length === 0 && (
                <p className="text-slate-400 text-[10px] italic py-2 text-center">No cards ready</p>
              )}
              {readyDeferredIds.map(id => {
                const card = currentCards.find(c => c.id === id);
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectDeferred(id)}
                    className="text-left p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-medium transition-colors border border-indigo-100 flex items-center justify-between group"
                  >
                    <span className="truncate">{card?.question}</span>
                    <CheckCircle2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>

            {state.deferred.length > readyDeferredIds.length && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium text-center">
                  {state.deferred.length - readyDeferredIds.length} more waiting
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Flashcard Area */}
        <div className="lg:col-span-5 flex flex-col gap-3 order-1 lg:order-2 h-full min-h-0">
          {currentCard ? (
            <>
              {/* Flashcard Container */}
              <div className="relative perspective-1000 w-full flex-1 min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCardId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full h-full"
                  >
                    <motion.div
                      className="w-full h-full relative preserve-3d cursor-pointer"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      onClick={() => !isFlipped && handleFlip()}
                    >
                      {/* Front Side (Question) */}
                      <div className={cn(
                        "absolute inset-0 backface-hidden bg-white rounded-[2rem] shadow-2xl border-[8px] border-white flex flex-col p-8 md:p-12 overflow-hidden",
                        isFlipped && "pointer-events-none"
                      )}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
                            <LayoutDashboard size={24} />
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-xl text-slate-500 font-mono text-sm font-bold">
                            <TimerIcon size={18} />
                            {formatTime(cardTimer)}
                          </div>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center text-center px-4">
                          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-800 leading-tight">
                            {currentCard.question}
                          </h1>
                        </div>

                        <div className="mt-4 text-center">
                          <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg shadow-indigo-200">
                            Card {state.currentIndex + 1} of {remainingCards}
                          </span>
                        </div>
                      </div>

                      {/* Back Side (Answer) */}
                      <div className={cn(
                        "absolute inset-0 backface-hidden bg-white rounded-[2rem] shadow-2xl border-[8px] border-white flex flex-col p-8 md:p-12 overflow-hidden rotate-y-180",
                        !isFlipped && "pointer-events-none"
                      )}>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                            Answer
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                            className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-slate-600 transition-colors relative"
                          >
                            {copySuccess ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} />}
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar text-left">
                          <div 
                            className="text-xl md:text-3xl lg:text-4xl text-slate-700 leading-relaxed font-medium"
                            dangerouslySetInnerHTML={{ __html: currentCard.answer }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 h-20 md:h-24">
                <button
                  onClick={() => moveToNext('finish')}
                  className="group bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
                >
                  <CheckCircle2 size={20} />
                  <span className="font-black text-xs uppercase tracking-wider">Finish</span>
                  <span className="text-[8px] opacity-60 font-mono bg-white/20 px-1.5 rounded">1</span>
                </button>

                <button
                  onClick={() => moveToNext('10min')}
                  className="group bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
                >
                  <Clock size={20} />
                  <span className="font-black text-xs uppercase tracking-wider">10 Min</span>
                  <span className="text-[8px] opacity-60 font-mono bg-white/20 px-1.5 rounded">2</span>
                </button>

                <button
                  onClick={() => moveToNext('20min')}
                  className="group bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
                >
                  <Clock size={20} />
                  <span className="font-black text-xs uppercase tracking-wider">20 Min</span>
                  <span className="text-[8px] opacity-60 font-mono bg-white/20 px-1.5 rounded">3</span>
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white/90 backdrop-blur rounded-[2rem] shadow-2xl p-8 text-center flex flex-col items-center justify-center gap-4 h-full">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-3xl font-black text-slate-800">All Done!</h1>
              <p className="text-slate-500 text-sm max-w-xs">
                You've completed all the flashcards. Wait for deferred cards or reset.
              </p>
              <button
                onClick={handleReset}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center gap-4 text-red-600 mb-6">
                <div className="bg-red-100 p-3 rounded-2xl">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-black">Reset Progress?</h2>
              </div>
              
              <p className="text-slate-600 mb-8 leading-relaxed">
                This will clear all your finished cards and deferred schedules. You will start from the very first card again. This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold transition-colors shadow-lg shadow-red-200"
                >
                  Yes, Reset
                </button>
              </div>

              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global CSS for custom scrollbar and 3D effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        /* Answer styling overrides */
        .backface-hidden u {
          text-decoration: underline;
          text-underline-offset: 4px;
          color: black;
          font-weight: 800;
          display: block;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .backface-hidden u:first-child {
          margin-top: 0;
        }
      `}} />
    </div>
  );
}
