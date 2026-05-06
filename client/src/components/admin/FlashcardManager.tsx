import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, where, writeBatch } from 'firebase/firestore';
import { Plus, Trash2, Brain, BookOpen, Loader2, Edit2, Sparkles, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function FlashcardManager() {
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'decks'), where('isPublic', '==', true));
      const snap = await getDocs(q);
      setDecks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch official decks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove this official deck for all students.')) return;
    const loadingToast = toast.loading('Deleting official deck...');
    try {
      const batch = writeBatch(db);
      const cardsSnap = await getDocs(query(collection(db, 'flashcards'), where('deckId', '==', id)));
      cardsSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'decks', id));
      await batch.commit();
      toast.success('Official deck deleted', { id: loadingToast });
      fetchDecks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete deck', { id: loadingToast });
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-indigo-600 to-violet-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-500/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-200">
            <Sparkles size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Global Content Manager</span>
          </div>
          <h2 className="text-5xl font-black tracking-tight">Official Flashcards</h2>
          <p className="text-indigo-100 font-bold opacity-80 max-w-xl">
            Manage high-yield flashcard decks available to all students. Use the enhanced AI generator for professional content creation.
          </p>
        </div>
        <Link 
          to="/flashcards/create"
          className="px-10 py-5 bg-white text-indigo-600 rounded-[2.5rem] font-black shadow-xl hover:scale-105 transition-all flex items-center gap-3 whitespace-nowrap"
        >
          <Plus className="w-6 h-6" /> Create Official Deck
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-60 bg-muted animate-pulse rounded-[3rem]" />
          ))
        ) : decks.length > 0 ? (
          decks.map(deck => (
            <div key={deck.id} className="p-8 bg-card border-2 border-border rounded-[3rem] hover:border-indigo-500/50 transition-all relative group flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <Link 
                  to={`/flashcards/edit/${deck.id}`}
                  className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                  title="Edit Official Deck"
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => handleDelete(deck.id)} 
                  className="p-3 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-lg"
                  title="Delete Official Deck"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Official Resource</span>
                    <span className="text-xs font-bold text-muted-foreground">{deck.subject}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black group-hover:text-indigo-600 transition-colors">{deck.title}</h3>
                  <p className="text-muted-foreground font-bold text-sm line-clamp-3 leading-relaxed">{deck.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
                <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>{deck.cardCount || 0} Cards</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                  <Layout size={10} /> Live
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4 bg-muted/30 rounded-[3rem] border-2 border-dashed border-border">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <BookOpen size={40} />
            </div>
            <div>
              <p className="text-xl font-black text-muted-foreground">No official decks yet</p>
              <p className="text-sm text-muted-foreground font-bold">Start by creating your first global medical resource.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
