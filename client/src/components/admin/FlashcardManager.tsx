import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { Plus, Trash2, Brain, BookOpen, Loader2, Save, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateFlashcards } from '../../lib/gemini';

export default function FlashcardManager() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Anatomy',
    content: '' // For AI generation
  });

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'decks'), where('isPublic', '==', true));
      const snap = await getDocs(q);
      setDecks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let cards: any[] = [];
      if (formData.content.trim()) {
        setAiGenerating(true);
        cards = await generateFlashcards(formData.content);
        setAiGenerating(false);
      }

      const deckRef = await addDoc(collection(db, 'decks'), {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        userId: user.uid,
        isPublic: true,
        cardCount: cards.length,
        createdAt: Date.now()
      });

      if (cards.length > 0) {
        const batch = writeBatch(db);
        cards.forEach(card => {
          const cardRef = doc(collection(db, 'flashcards'));
          batch.set(cardRef, {
            ...card,
            deckId: deckRef.id,
            userId: 'PUBLIC', // Special marker for global cards
            createdAt: Date.now(),
            nextReview: Date.now(),
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            status: 'new'
          });
        });
        await batch.commit();
      }

      setIsModalOpen(false);
      setFormData({ title: '', description: '', subject: 'Anatomy', content: '' });
      fetchDecks();
    } catch (err) {
      console.error(err);
      alert('Failed to save official deck');
    } finally {
      setSaving(false);
      setAiGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove this official deck for all students.')) return;
    try {
      await deleteDoc(doc(db, 'decks', id));
      fetchDecks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-indigo-500/10 p-10 rounded-[4rem] border-2 border-indigo-500/20">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Official Flashcards</h2>
          <p className="text-indigo-700 font-bold opacity-60">Create curated flashcard decks that appear to all students.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-10 py-5 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-6 h-6" /> Create Official Deck
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {decks.map(deck => (
            <div key={deck.id} className="p-8 bg-card border-2 border-border rounded-[3rem] hover:border-indigo-500/50 transition-all relative group">
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(deck.id)} className="p-3 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
                    <Brain className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-500/10 px-3 py-1 rounded-lg">Official</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black">{deck.title}</h3>
                  <p className="text-muted-foreground font-bold text-sm line-clamp-2">{deck.description}</p>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-border text-xs font-black text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {deck.cardCount || 0} Cards</span>
                  <span>{deck.subject}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-background/90 backdrop-blur-3xl animate-in zoom-in-95">
          <div className="bg-card w-full max-w-2xl rounded-[3rem] shadow-2xl border-2 border-border overflow-hidden">
            <div className="p-8 border-b border-border flex justify-between items-center bg-secondary/30">
              <h3 className="text-2xl font-black">Create Official Deck</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl"><X /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Deck Title</label>
                  <input 
                    required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl font-black outline-none focus:border-indigo-500"
                    placeholder="e.g., Medical Biochemistry"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Subject</label>
                  <input 
                    required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl font-black outline-none focus:border-indigo-500"
                    placeholder="Anatomy, etc."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</label>
                <textarea 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl font-bold outline-none focus:border-indigo-500"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">AI Generator Content (Optional)</label>
                  <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">
                    <Sparkles size={10} /> Powered by Gemini
                  </div>
                </div>
                <textarea 
                  value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl font-bold outline-none focus:border-indigo-500 h-40"
                  placeholder="Paste medical text here to auto-generate cards..."
                />
              </div>
              <button 
                type="submit" 
                disabled={saving || aiGenerating}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {aiGenerating ? 'AI Generating Cards...' : saving ? 'Saving Deck...' : 'Publish Official Deck'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
