import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import type { Flashcard, Deck, CardImage } from '../../types/flashcard';
import { calculateSRS } from '../../lib/srs';
import { cn } from '../../lib/utils';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  RotateCcw, 
  ChevronLeft, 
  Trophy,
  Brain,
  Zap,
  Eye,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

import officialDecksMeta from '../../data/official_decks_meta.json';

const StudyMode = () => {
  const { deckId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  
  const [deck, setDeck] = useState<any | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [finished, setFinished] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});

  useEffect(() => {
    // Force Light Mode for study sessions
    setTheme('light');
  }, []);

  useEffect(() => {
    setZoom(1); // Reset zoom when card changes
  }, [currentIndex]);

  useEffect(() => {
    if (!user || !deckId) return;

    const fetchData = async () => {
      try {
        let deckData: any = null;

        if (deckId.startsWith('official_')) {
          // LOAD OFFICIAL DECK META FROM JSON
          deckData = officialDecksMeta.find(d => d.id === deckId);
          if (!deckData) throw new Error('Official deck not found');
          deckData = { ...deckData, isOfficial: true, officialId: deckId };
        } else {
          // Fetch personal deck from Firestore
          const deckDoc = await getDoc(doc(db, 'decks', deckId));
          if (!deckDoc.exists()) throw new Error('Deck not found');
          deckData = { id: deckDoc.id, ...deckDoc.data() };
        }

        setDeck(deckData);
        let allCards: Flashcard[] = [];

        if (deckData.isOfficial) {
          // DYNAMIC LOAD FROM JSON (ONLY WHEN NEEDED)
          const data = await import('../../data/eyelid_data.json');
          const officialEyelidCards = data.default;
          
          allCards = officialEyelidCards.map((card: any, idx: number) => {
            const cardId = `official_${deckData.officialId}_${idx}`;
            const cacheKey = `fc_progress_${cardId}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              return { ...card, id: cardId, ...JSON.parse(cached) };
            }
            return { ...card, id: cardId };
          }) as any;
        } else {
          // Fetch from Firestore
          const q = query(collection(db, 'flashcards'), where('deckId', '==', deckId));
          const querySnapshot = await getDocs(q);
          allCards = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const cacheKey = `fc_progress_${doc.id}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              return { id: doc.id, ...data, ...JSON.parse(cached) };
            }
            return { id: doc.id, ...data };
          }) as Flashcard[];
        }

        // Filter for due cards in memory
        const now = Date.now();
        const fetchedCards = allCards.filter(card => (card.nextReview || 0) <= now);

        // Shuffle cards
        setCards(fetchedCards.sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error('Error fetching study data:', error);
        toast.error('Failed to load cards');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, deckId]);

  const handleRate = async (rating: 0 | 1 | 2 | 3) => {
    const card = cards[currentIndex];
    const srsUpdate = calculateSRS(
      rating,
      card.repetitions || 0,
      card.interval || 0,
      card.easeFactor || 2.5
    );

    // Update locally for stats
    const ratingKey = (['again', 'hard', 'good', 'easy'] as const)[rating];
    setResults(prev => ({ ...prev, [ratingKey]: prev[ratingKey] + 1 }));

    try {
      // 1. Update Cache (Immediate)
      const cacheKey = `fc_progress_${card.id}`;
      const update = { ...srsUpdate, lastReviewed: Date.now() };
      localStorage.setItem(cacheKey, JSON.stringify(update));

      // 2. Add to Pending Updates (To be synced later)
      const allUpdates = { ...pendingUpdates, [card.id]: update };
      setPendingUpdates(allUpdates);

      if (currentIndex < cards.length - 1) {
        setIsFlipped(false);
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, 150);
      } else {
        setFinished(true);
        updateUserStreak();
        syncUpdatesToFirebase(allUpdates);
      }
    } catch (error) {
      console.error('Error updating cache:', error);
    }
  };

  const syncUpdatesToFirebase = async (updatesToSync = pendingUpdates) => {
    if (Object.keys(updatesToSync).length === 0) return;
    
    try {
      const batch = writeBatch(db);
      Object.entries(updatesToSync).forEach(([cardId, update]) => {
        batch.update(doc(db, 'flashcards', cardId), update);
      });
      await batch.commit();
      setPendingUpdates({});
      toast.success('تم مزامنة التقدم مع السحابة ☁️');
    } catch (error) {
      console.error('Error syncing updates:', error);
    }
  };

  const resetProgress = async () => {
    if (!deckId || !user) return;
    const confirmReset = window.confirm('هل أنت متأكد من مسح كل التقدم في هذه المجموعة والبدء من جديد؟');
    if (!confirmReset) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, 'flashcards'), where('deckId', '==', deckId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          nextReview: Date.now(),
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          status: 'new',
          lastReviewed: null
        });
      });
      await batch.commit();
      toast.success('تم إعادة تعيين التقدم بنجاح!');
      window.location.reload();
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('فشل إعادة التعيين');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStreak = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const lastStudy = data.lastStudyDate ? new Date(data.lastStudyDate) : null;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        let newStreak = data.streak || 0;
        
        if (lastStudy) {
          const lastDate = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate()).getTime();
          const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        await updateDoc(userRef, {
          streak: newStreak,
          lastStudyDate: Date.now()
        });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground animate-pulse">Preparing your session...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0 && !finished) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">All caught up!</h2>
            <p className="text-muted-foreground">You've reviewed all cards due for today in this deck. Great job!</p>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/flashcards/decks')}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={resetProgress}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold border border-border hover:bg-secondary/80 transition-all"
            >
              Force Study All Cards Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-card border border-border p-8 rounded-3xl shadow-2xl space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} />
            </div>
            <h2 className="text-3xl font-bold">Session Complete!</h2>
            <p className="text-muted-foreground">You reviewed {cards.length} cards. Here's how you did:</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Again', count: results.again, color: 'text-red-500', bg: 'bg-red-500/10' },
              { label: 'Hard', count: results.hard, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Good', count: results.good, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Easy', count: results.easy, color: 'text-green-500', bg: 'bg-green-500/10' },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} p-4 rounded-2xl text-center border border-border/50`}>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Study Again
            </button>
            <button 
              onClick={resetProgress}
              className="flex-1 py-3 rounded-xl bg-orange-500/10 text-orange-500 font-semibold flex items-center justify-center gap-2 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all"
            >
              <Zap size={18} />
              Reset & Restart
            </button>
            <button 
              onClick={() => navigate('/flashcards/decks')}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/flashcards/decks')} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-bold">{deck?.title}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{deck?.subject}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <Brain size={16} className="text-primary" />
            <span>{currentIndex + 1} / {cards.length}</span>
          </div>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={24} onClick={() => navigate('/flashcards/decks')} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-muted">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
        />
      </div>

      {/* Main Study Area - Using Grid to enforce heights */}
      <main className="flex-1 grid grid-rows-[1fr_auto] overflow-hidden bg-background/50 relative">
        {/* Background Decorations */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Workspace Area (Scrollable/Flexible) */}
        <div className="relative w-full h-full flex items-center justify-center p-2 md:p-6 overflow-hidden">
          <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="w-full h-full max-w-3xl mx-auto"
              >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0 }} // Instant flip
                className="w-full h-full relative preserve-3d cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-card border border-border p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-xl flex flex-col items-center justify-start text-center overflow-hidden">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    <div className="px-4 py-1.5 rounded-full bg-muted/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground shadow-sm border border-border/50">
                      Question
                    </div>
                    {currentCard.frontImage && (
                      <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full border border-border shadow-sm" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground"><RotateCcw size={14} className="-scale-x-100" /></button>
                        <span className="text-[10px] font-black w-10 text-center">{Math.round(zoom * (currentCard.frontImage.scale || 1) * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground"><Zap size={14} /></button>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full h-full flex flex-col gap-8 items-center justify-start overflow-y-auto pt-16 pb-12 px-2 md:px-8 custom-scrollbar scroll-smooth">
                    {currentCard.frontImage && (
                      <div 
                        className="relative shrink-0 mx-auto rounded-xl md:rounded-2xl border border-border bg-muted/50 transition-all duration-200 shadow-xl"
                        style={{ 
                          width: `${Math.min(100, zoom * (currentCard.frontImage.scale || 1) * 80)}%`,
                          minWidth: '220px'
                        }}
                      >
                        <img src={currentCard.frontImage.url} alt="Front" className="w-full h-auto object-contain rounded-xl md:rounded-2xl" />
                        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                          {currentCard.frontImage.masks.map(mask => (
                            <g key={mask.id}>
                              {mask.type === 'rect' ? (
                                <rect x={mask.x} y={mask.y} width={mask.width} height={mask.height} fill={mask.color} />
                              ) : (
                                <ellipse cx={mask.x + mask.width/2} cy={mask.y + mask.height/2} rx={mask.width/2} ry={mask.height/2} fill={mask.color} />
                              )}
                            </g>
                          ))}
                        </svg>
                      </div>
                    )}
                    <div 
                      className="prose prose-sm md:prose-xl prose-slate dark:prose-invert font-bold text-black dark:text-white max-w-4xl text-center pb-12 w-full flashcard-text"
                      dangerouslySetInnerHTML={{ __html: currentCard.front }}
                    />
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                    <Eye size={12} />
                    Tap to flip
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden bg-card border-2 border-primary/30 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-xl flex flex-col items-center justify-start text-center rotate-y-180 overflow-hidden">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    <div className="px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm border border-primary/20">
                      Answer
                    </div>
                    {(currentCard.backImage || currentCard.frontImage) && (
                      <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full border border-border shadow-sm" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground"><RotateCcw size={14} className="-scale-x-100" /></button>
                        <span className="text-[10px] font-black w-10 text-center">{Math.round(zoom * (currentCard.backImage?.scale || currentCard.frontImage?.scale || 1) * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground"><Zap size={14} /></button>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full h-full flex flex-col gap-8 items-center justify-start overflow-y-auto pt-16 pb-12 px-2 md:px-8 custom-scrollbar scroll-smooth">
                    {currentCard.backImage ? (
                      <div 
                        className="relative shrink-0 mx-auto rounded-xl md:rounded-2xl border border-border bg-muted/50 transition-all duration-200 shadow-xl"
                        style={{ 
                          width: `${Math.min(100, zoom * (currentCard.backImage.scale || 1) * 80)}%`,
                          minWidth: '220px'
                        }}
                      >
                        <img src={currentCard.backImage.url} alt="Back" className="w-full h-auto object-contain rounded-xl md:rounded-2xl" />
                        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                          {currentCard.backImage.masks.map(mask => (
                            <g key={mask.id}>
                              {mask.type === 'rect' ? (
                                <rect x={mask.x} y={mask.y} width={mask.width} height={mask.height} fill={mask.color} fillOpacity={0.2} stroke={mask.color} strokeWidth={2} />
                              ) : (
                                <ellipse cx={mask.x + mask.width/2} cy={mask.y + mask.height/2} rx={mask.width/2} ry={mask.height/2} fill={mask.color} fillOpacity={0.2} stroke={mask.color} strokeWidth={2} />
                              )}
                            </g>
                          ))}
                        </svg>
                      </div>
                    ) : currentCard.frontImage && (
                       <div 
                        className="relative shrink-0 mx-auto opacity-80 transition-all duration-200"
                        style={{ 
                          width: `${Math.min(100, zoom * (currentCard.frontImage.scale || 1) * 70)}%`,
                          minWidth: '180px'
                        }}
                       >
                        <img src={currentCard.frontImage.url} alt="Front Revealed" className="w-full h-auto object-contain rounded-xl md:rounded-2xl" />
                        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                          {currentCard.frontImage.masks.map(mask => (
                            <g key={mask.id}>
                              {mask.type === 'rect' ? (
                                <rect x={mask.x} y={mask.y} width={mask.width} height={mask.height} fill="none" stroke={mask.color} strokeWidth={2} />
                              ) : (
                                <ellipse cx={mask.x + mask.width/2} cy={mask.y + mask.height/2} rx={mask.width/2} ry={mask.height/2} fill="none" stroke={mask.color} strokeWidth={2} />
                              )}
                            </g>
                          ))}
                        </svg>
                      </div>
                    )}
                    <div 
                      className="prose prose-sm md:prose-xl prose-slate dark:prose-invert font-bold text-black dark:text-white max-w-4xl text-center pb-12 w-full flashcard-text"
                      dangerouslySetInnerHTML={{ __html: currentCard.back }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 2. Fixed Controls Area */}
        <footer className="w-full bg-background/95 backdrop-blur-2xl border-t border-border p-4 md:p-6 shadow-[0_-15px_50px_rgba(0,0,0,0.4)] z-30">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.button
                  key="show-btn"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-5 rounded-[2.5rem] bg-primary text-primary-foreground font-black text-2xl shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 group active:scale-95 transition-all"
                >
                  <Zap size={28} className="fill-current group-hover:animate-pulse" />
                  Show Answer
                </motion.button>
              ) : (
                <motion.div
                  key="rate-btns"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-4 gap-2 md:gap-4"
                >
                  {[
                    { r: 0, l: 'Again', t: '1m', c: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500' },
                    { r: 1, l: 'Hard', t: '10m', c: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500' },
                    { r: 2, l: 'Good', t: '30m', c: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500' },
                    { r: 3, l: 'Easy', t: '2h', c: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500' },
                  ].map(btn => (
                    <button 
                      key={btn.l}
                      onClick={() => handleRate(btn.r as 0|1|2|3)}
                      className={cn(
                        "flex flex-col items-center justify-center py-4 md:py-6 rounded-2xl md:rounded-[2rem] border transition-all group",
                        btn.c,
                        "hover:text-white hover:shadow-xl hover:-translate-y-1"
                      )}
                    >
                      <span className="text-xs md:text-xl font-black">{btn.l}</span>
                      <span className="text-[9px] md:text-xs font-bold opacity-60 group-hover:opacity-100">{btn.t}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default StudyMode;

