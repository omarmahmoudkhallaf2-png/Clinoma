import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

const StudyMode = () => {
  const { deckId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!user || !deckId) return;

    const fetchData = async () => {
      try {
        // Fetch deck details
        const deckDoc = await getDoc(doc(db, 'decks', deckId));
        if (deckDoc.exists()) {
          setDeck({ id: deckDoc.id, ...deckDoc.data() } as Deck);
        }

        // Fetch due cards
        const now = Date.now();
        const cardsRef = collection(db, 'flashcards');
        const q = query(
          cardsRef,
          where('deckId', '==', deckId)
        );
        
        const querySnapshot = await getDocs(q);
        const allCards = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Flashcard[];

        // Filter for due cards in memory to avoid Index requirement
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
      await updateDoc(doc(db, 'flashcards', card.id), {
        ...srsUpdate,
        lastReviewed: Date.now()
      });
    } catch (error) {
      console.error('Error updating card:', error);
    }

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 150);
    } else {
      setFinished(true);
      updateUserStreak();
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
          // if diffDays === 0, streak stays same
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
          <button 
            onClick={() => navigate('/flashcards')}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"
          >
            Back to Dashboard
          </button>
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

          <div className="pt-6 flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Study Again
            </button>
            <button 
              onClick={() => navigate('/flashcards')}
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
          <button onClick={() => navigate('/flashcards')} className="p-2 hover:bg-muted rounded-full transition-colors">
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
            <X size={24} onClick={() => navigate('/flashcards')} />
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

      {/* Main Study Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="w-full max-w-[95vw] lg:max-w-[85vw] perspective-1000 flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full h-full max-h-[75vh]"
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full relative preserve-3d cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-card border-2 border-border p-10 md:p-16 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center">
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-muted text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Question
                  </div>
                  
                  <div className="w-full h-full flex flex-col gap-10 items-center justify-center overflow-hidden mt-6">
                    {currentCard.frontImage && (
                      <div 
                        className="relative inline-block mx-auto max-h-[80%] rounded-2xl border border-border overflow-hidden bg-muted/50"
                        style={{ transform: `scale(${currentCard.frontImage.scale || 1})` }}
                      >
                        <img src={currentCard.frontImage.url} alt="Front" className="max-h-full w-auto object-contain" />
                        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                          {currentCard.frontImage.masks.map(mask => (
                            <g key={mask.id}>
                              {mask.type === 'rect' ? (
                                <rect
                                  x={mask.x}
                                  y={mask.y}
                                  width={mask.width}
                                  height={mask.height}
                                  fill={mask.color}
                                  className="transition-opacity duration-300"
                                />
                              ) : (
                                <ellipse
                                  cx={mask.x + mask.width / 2}
                                  cy={mask.y + mask.height / 2}
                                  rx={mask.width / 2}
                                  ry={mask.height / 2}
                                  fill={mask.color}
                                  className="transition-opacity duration-300"
                                />
                              )}
                            </g>
                          ))}
                        </svg>
                      </div>
                    )}
                    <div 
                      className="prose prose-2xl font-bold dark:prose-invert max-w-none text-center flex-1 overflow-y-auto w-full"
                      dangerouslySetInnerHTML={{ __html: currentCard.front }}
                    />
                  </div>

                  <div className="absolute bottom-6 text-sm text-muted-foreground flex items-center gap-2 animate-bounce">
                    <Eye size={20} />
                    Click to reveal answer
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-card border-4 border-primary/20 p-10 md:p-16 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center rotate-y-180">
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Answer
                  </div>
                  
                  <div className="w-full h-full flex flex-col gap-10 items-center justify-center overflow-hidden mt-6">
                    {currentCard.backImage ? (
                      <div 
                        className="relative inline-block mx-auto max-h-[70%] rounded-2xl border border-border overflow-hidden bg-muted/50"
                        style={{ transform: `scale(${currentCard.backImage.scale || 1})` }}
                      >
                        <img src={currentCard.backImage.url} alt="Back" className="max-h-full w-auto object-contain" />
                        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                          {currentCard.backImage.masks.map(mask => (
                            <g key={mask.id}>
                              {mask.type === 'rect' ? (
                                <rect
                                  x={mask.x}
                                  y={mask.y}
                                  width={mask.width}
                                  height={mask.height}
                                  fill={mask.color}
                                  fillOpacity={0.3}
                                  stroke={mask.color}
                                  strokeWidth={2}
                                />
                              ) : (
                                <ellipse
                                  cx={mask.x + mask.width / 2}
                                  cy={mask.y + mask.height / 2}
                                  rx={mask.width / 2}
                                  ry={mask.height / 2}
                                  fill={mask.color}
                                  fillOpacity={0.3}
                                  stroke={mask.color}
                                  strokeWidth={2}
                                />
                              )}
                            </g>
                          ))}
                        </svg>
                      </div>
                    ) : currentCard.frontImage && (
                       <div 
                        className="relative inline-block mx-auto max-h-[60%] opacity-80"
                        style={{ transform: `scale(${currentCard.frontImage.scale || 1})` }}
                       >
                        <img src={currentCard.frontImage.url} alt="Front Revealed" className="max-h-full w-auto object-contain rounded-2xl" />
                        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                          {currentCard.frontImage.masks.map(mask => (
                            <g key={mask.id}>
                              {mask.type === 'rect' ? (
                                <rect x={mask.x} y={mask.y} width={mask.width} height={mask.height} fill="none" stroke={mask.color} strokeWidth={2} />
                              ) : (
                                <ellipse cx={mask.x + mask.width / 2} cy={mask.y + mask.height / 2} rx={mask.width / 2} ry={mask.height / 2} fill="none" stroke={mask.color} strokeWidth={2} />
                              )}
                            </g>
                          ))}
                        </svg>
                      </div>
                    )}
                    <div 
                      className="prose prose-2xl font-bold dark:prose-invert max-w-none text-center flex-1 overflow-y-auto w-full"
                      dangerouslySetInnerHTML={{ __html: currentCard.back }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-16 w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.button
                key="show-btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => setIsFlipped(true)}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
              >
                <Zap size={20} className="group-hover:scale-125 transition-transform" />
                Show Answer
              </motion.button>
            ) : (
              <motion.div
                key="rate-btns"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-4 gap-3"
              >
                <button 
                  onClick={() => handleRate(0)}
                  className="flex flex-col items-center justify-center py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
                >
                  <span className="text-xl font-bold">Again</span>
                  <span className="text-[10px] font-medium opacity-60 group-hover:opacity-100">&lt; 1m</span>
                </button>
                <button 
                  onClick={() => handleRate(1)}
                  className="flex flex-col items-center justify-center py-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white transition-all group"
                >
                  <span className="text-xl font-bold">Hard</span>
                  <span className="text-[10px] font-medium opacity-60 group-hover:opacity-100">2d</span>
                </button>
                <button 
                  onClick={() => handleRate(2)}
                  className="flex flex-col items-center justify-center py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-all group"
                >
                  <span className="text-xl font-bold">Good</span>
                  <span className="text-[10px] font-medium opacity-60 group-hover:opacity-100">4d</span>
                </button>
                <button 
                  onClick={() => handleRate(3)}
                  className="flex flex-col items-center justify-center py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all group"
                >
                  <span className="text-xl font-bold">Easy</span>
                  <span className="text-[10px] font-medium opacity-60 group-hover:opacity-100">7d</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default StudyMode;

