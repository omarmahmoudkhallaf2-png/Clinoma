import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import type { Deck, Flashcard } from '../../types/flashcard';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { 
  Plus, 
  Upload, 
  Download,
  Brain, 
  Clock, 
  Flame, 
  Search,
  BookOpen,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  Filter,
  RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';

import { Link } from 'react-router-dom';

import STATIC_OFFICIAL_DECKS from '../../data/official_decks_meta.json';

const FlashcardsDashboard = () => {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [dueCount, setDueCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('Third Year');
  const [selectedModule, setSelectedModule] = useState<string>('Ophthalmology Practical');

  const handleResetProgress = async (deckId: string) => {
    if (!window.confirm('هل أنت متأكد من مسح كل التقدم في هذه المجموعة والبدء من جديد؟')) return;
    const loadingToast = toast.loading('جاري إعادة التعيين...');
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
      toast.success('تم إعادة تعيين التقدم بنجاح!', { id: loadingToast });
      window.location.reload();
    } catch (err) {
      toast.error('فشل إعادة التعيين', { id: loadingToast });
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchDecks = async () => {
      try {
        const decksRef = collection(db, 'decks');
        
        // Fetch personal decks
        const qPersonal = query(
          decksRef, 
          where('userId', '==', user.uid)
        );

        
        // Fetch public/official decks
        const qPublic = query(
          decksRef,
          where('isPublic', '==', true)
        );
        
        const [personalSnap, publicSnap] = await Promise.all([
          getDocs(qPersonal),
          getDocs(qPublic)
        ]);

        const personalDecks = personalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const publicDecks = publicSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Merge and remove duplicates if any, AND ADD STATIC DECKS
        const allDecksMap = new Map();
        [...STATIC_OFFICIAL_DECKS, ...publicDecks, ...personalDecks].forEach(d => allDecksMap.set(d.id, d));
        const fetchedDecks = (Array.from(allDecksMap.values()) as Deck[])
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));



        // Fetch due counts for each deck
        const cardsRef = collection(db, 'flashcards');
        const now = Date.now();
        let totalDue = 0;

        const decksWithCounts = await Promise.all(fetchedDecks.map(async (deck) => {
          // If it's a static deck, it doesn't have Firestore counts unless added to library
          if ((deck as any).isStatic && deck.userId !== user.uid) {
            return { ...deck, dueCount: 0 };
          }

          const cardsQuery = query(
            cardsRef,
            where('deckId', '==', deck.id)
          );
          const cardsSnap = await getDocs(cardsQuery);
          const count = cardsSnap.docs.filter(doc => (doc.data().nextReview || 0) <= now).length;
          totalDue += count;
          return { ...deck, dueCount: count };
        }));

        setDecks(decksWithCounts);
        setDueCount(totalDue);
      } catch (error: any) {
        console.error('Error fetching decks:', error);
        if (error.code === 'permission-denied') {
          toast.error('صلاحيات فيربيز مرفوضة. يرجى التأكد من نشر الـ Rules في الكونسول.');
        } else {
          toast.error('فشل في تحميل المكتبة.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, [user]);

  const filteredDecks = decks.filter(deck => 
    deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Flash Cards
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Master your medical knowledge with intelligent spaced repetition.</p>
        </div>
        
        <div className="flex gap-4">
          <Link to="/flashcards/import" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all font-medium border border-border/50">
            <Upload size={18} />
            Import
          </Link>
          <Link to="/flashcards/create" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20">
            <Plus size={18} />
            New Deck
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-5"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Due Today</p>
            <p className="text-2xl font-bold">{dueCount}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-5"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Brain size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Cards</p>
            <p className="text-2xl font-bold">{decks.reduce((acc, d) => acc + (d.cardCount || 0), 0)}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-5"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Daily Streak</p>
            <p className="text-2xl font-bold">{useAuth().userData?.streak || 0} Days</p>
          </div>
        </motion.div>

      </div>

      {/* Official Decks Section */}
      {decks.some(d => d.isPublic) && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Official Medical Decks</h2>
                <p className="text-sm text-muted-foreground">Expert-curated content for your exams.</p>
              </div>
            </div>

            {/* Ophthalmology Category Selection Tabs */}
            <div className="flex bg-muted p-1 rounded-2xl overflow-x-auto no-scrollbar">
              {['Ophthalmology Practical', 'Ophthalmology End'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedModule(cat);
                  }}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap",
                    selectedModule === cat ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat === 'Ophthalmology Practical' ? 'رمد عملي' : 'رمد اند'}
                </button>
              ))}
            </div>
          </div>

          {/* Module Filtering (Only shows if there are multiple modules in the selected category) */}
          {new Set(decks.filter(d => d.isPublic && d.module === selectedModule).map(d => d.subject)).size > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              <div className="flex items-center gap-2 text-muted-foreground px-2">
                <Filter size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks
              .filter(d => d.isPublic && 
                d.module === selectedModule
              )
              .map((deck, idx) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group p-6 rounded-3xl bg-indigo-500/[0.03] border-2 border-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer"
                >
                  <div className="flex flex-col h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                          {deck.subject}
                        </span>
                        {deck.module && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            {deck.module}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold line-clamp-1">{deck.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{deck.description}</p>
                    </div>
                    <Link 
                      to={`/flashcards/study/${deck.id}`}
                      className="w-full py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl bg-indigo-600 text-white shadow-indigo-600/20 hover:scale-[1.02]"
                    >
                      <ArrowRight size={16} /> Study Now
                    </Link>
                  </div>
                </motion.div>
              ))}
            {decks.filter(d => d.isPublic && d.year === selectedYear && (selectedModule === 'All' || d.module === selectedModule)).length === 0 && (
              <div className="col-span-full py-12 text-center bg-muted/20 rounded-[2rem] border-2 border-dashed border-border">
                <p className="text-muted-foreground font-bold">No decks available for this module yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content (Personal Decks) */}
      <div className="space-y-6 pt-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">My Study Library</h2>
              <p className="text-sm text-muted-foreground">Your personal and imported flashcard sets.</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 text-sm transition-all shadow-sm"
            />
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredDecks.filter(d => !d.isPublic || d.userId === user?.uid).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.filter(d => !d.isPublic || d.userId === user?.uid).map((deck, idx) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-7 rounded-[2rem] bg-card border-2 border-border/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity z-20">
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const cardsSnap = await getDocs(query(collection(db, 'flashcards'), where('deckId', '==', deck.id)));
                      const cards = cardsSnap.docs.map(doc => doc.data());
                      const exportData = {
                        deck: { ...deck, cards: undefined },
                        cards: cards
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${deck.title.replace(/\s+/g, '_')}_export.json`;
                      a.click();
                      toast.success('Deck exported successfully!');
                    }}
                    className="p-1 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                    title="Export Deck"
                  >
                    <Download size={18} />
                  </button>
                  <Link 
                    to={`/flashcards/edit/${deck.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                    title="Edit Deck"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleResetProgress(deck.id);
                    }}
                    className="p-1 hover:bg-orange-500/10 rounded-lg transition-colors text-orange-500"
                    title="Reset Progress"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return;
                      const loadingToast = toast.loading('جاري الحذف...');
                      try {
                        const batch = writeBatch(db);
                        const cardsSnap = await getDocs(query(collection(db, 'flashcards'), where('deckId', '==', deck.id)));
                        cardsSnap.docs.forEach(d => batch.delete(d.ref));
                        batch.delete(doc(db, 'decks', deck.id));
                        await batch.commit();
                        toast.success('تم حذف المجموعة بنجاح', { id: loadingToast });
                        window.location.reload();
                      } catch (err) {
                        toast.error('فشل الحذف', { id: loadingToast });
                      }
                    }}
                    className="p-1 hover:bg-rose-500/10 rounded-lg transition-colors text-rose-500"
                    title="Delete Deck"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>


                <div className="flex flex-col h-full space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {deck.subject}
                    </span>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{deck.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {deck.cardCount || 0} cards
                      </span>
                      {deck.dueCount! > 0 && (
                        <span className="flex items-center gap-1 text-orange-500 font-bold">
                          <Clock size={14} />
                          {deck.dueCount} due
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      to={`/flashcards/study/${deck.id}`}
                      className="p-2 rounded-full bg-primary text-primary-foreground translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all shadow-lg shadow-primary/20"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
              <Brain size={32} />
            </div>
            <div>
              <h3 className="text-lg font-medium">No personal decks found</h3>
              <p className="text-sm text-muted-foreground">Create your own or add an official deck above.</p>
            </div>
            <Link to="/flashcards/create" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium">
              Create New Deck
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsDashboard;


