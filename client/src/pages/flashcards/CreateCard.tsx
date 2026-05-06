import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, writeBatch, doc, getDoc, getDocs, where, query, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Plus,
  Trash2,
  Brain,
  Sparkles,
  ChevronLeft,
  Layout,
  Type,
  Tag as TagIcon,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateFlashcards } from '../../lib/gemini';

interface CardInput {

  front: string;
  back: string;
  tags: string[];
}

const CreateCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const [deckInfo, setDeckInfo] = useState({
    title: '',
    description: '',
    subject: ''
  });

  const [cards, setCards] = useState<CardInput[]>([
    { front: '', back: '', tags: [] }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ name: string, data: string, type: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load deck if editing
  React.useEffect(() => {
    if (deckId) {
      const loadDeck = async () => {
        try {
          const dRef = doc(db, 'decks', deckId);
          const dSnap = await getDoc(dRef);
          if (dSnap.exists()) {
            setDeckInfo(dSnap.data() as any);
            const cSnap = await getDocs(query(collection(db, 'flashcards'), where('deckId', '==', deckId)));
            setCards(cSnap.docs.map(d => d.data() as CardInput));
          }
        } catch (err) {
          toast.error('فشل تحميل المجموعة');
        }
      };
      loadDeck();
    }
  }, [deckId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = await Promise.all(files.map(async (file) => {
        return new Promise<{ name: string, data: string, type: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (re) => resolve({
            name: file.name,
            data: re.target?.result as string,
            type: file.type
          });
          reader.readAsDataURL(file);
        });
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addCard = () => {
    setCards([...cards, { front: '', back: '', tags: [] }]);
  };

  const removeCard = (index: number) => {
    if (cards.length === 1) return;
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, field: keyof CardInput, value: string) => {
    const newCards = [...cards];
    if (field === 'tags') {
      newCards[index].tags = value.split(',').map(t => t.trim());
    } else {
      newCards[index][field] = value as string;
    }
    setCards(newCards);
  };

  const handleSave = async () => {
    if (!user || !deckInfo.title) return;
    setSaving(true);

    try {
      let dId = deckId;
      if (deckId) {
        // Update existing deck
        await updateDoc(doc(db, 'decks', deckId), {
          ...deckInfo,
          cardCount: cards.length,
          updatedAt: serverTimestamp()
        });
        
        // Clear old cards and add new ones
        const oldCards = await getDocs(query(collection(db, 'flashcards'), where('deckId', '==', deckId)));
        const batch = writeBatch(db);
        oldCards.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } else {
        // Create new deck
        const deckRef = await addDoc(collection(db, 'decks'), {
          userId: user.uid,
          title: deckInfo.title,
          description: deckInfo.description,
          subject: deckInfo.subject,
          createdAt: Date.now(),
          cardCount: cards.length
        });
        dId = deckRef.id;
      }

      // 2. Create Cards in batch
      const batch = writeBatch(db);
      cards.forEach(card => {
        const cardRef = doc(collection(db, 'flashcards'));
        batch.set(cardRef, {
          deckId: dId,
          userId: user.uid,
          front: card.front,
          back: card.back,
          tags: card.tags,
          subject: deckInfo.subject,
          createdAt: Date.now(),
          nextReview: Date.now(),
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          status: 'new'
        });
      });

      await batch.commit();
      toast.success(deckId ? 'تم تحديث المجموعة!' : 'تم إنشاء المجموعة بنجاح!');
      navigate('/flashcards');
    } catch (error) {
      console.error('Error saving deck:', error);
      toast.error('فشل في حفظ المجموعة');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deckId || !confirm('هل أنت متأكد من حذف هذه المجموعة بالكامل؟')) return;
    setSaving(true);
    try {
      const oldCards = await getDocs(query(collection(db, 'flashcards'), where('deckId', '==', deckId)));
      const batch = writeBatch(db);
      oldCards.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'decks', deckId));
      await batch.commit();
      toast.success('تم حذف المجموعة');
      navigate('/flashcards');
    } catch (err) {
      toast.error('فشل الحذف');
    } finally {
      setSaving(false);
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt && selectedFiles.length === 0) return;
    setIsGenerating(true);

    try {
      const generatedCards = await generateFlashcards(
        aiPrompt || "Generate flashcards from provided files",
        selectedFiles.length > 0 ? selectedFiles.map(f => ({ data: f.data, mimeType: f.type })) : undefined
      );

      const filteredExisting = cards.filter(c => c.front !== '' || c.back !== '');
      setCards([...filteredExisting, ...generatedCards]);

      setAiPrompt('');
      setSelectedFiles([]);
      toast.success(`تم توليد ${generatedCards.length} كارت بنجاح!`);
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('فشل الذكاء الاصطناعي في التوليد. حاول مرة أخرى.');
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/flashcards')} className="p-2 hover:bg-muted rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">{deckId ? 'Edit Deck' : 'Create New Deck'}</h1>
        </div>
        <div className="flex gap-2">
          {deckId && (
            <button onClick={handleDeleteDeck} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="حذف المجموعة">
              <Trash2 size={24} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
            {deckId ? 'Update Deck' : 'Save Deck'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Deck Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Layout size={20} />
              <h2 className="font-bold">Deck Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiovascular System"
                  value={deckInfo.title}
                  onChange={e => setDeckInfo({ ...deckInfo, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted border-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <select
                  value={deckInfo.subject}
                  onChange={e => setDeckInfo({ ...deckInfo, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted border-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                >
                  <option value="">Select Subject</option>
                  <option value="Anatomy">Anatomy</option>
                  <option value="Physiology">Physiology</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Biochemistry">Biochemistry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <textarea
                  placeholder="What's this deck about?"
                  rows={3}
                  value={deckInfo.description}
                  onChange={e => setDeckInfo({ ...deckInfo, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted border-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* AI Generator Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white space-y-4 shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <h2 className="font-bold">AI Flashcard Generator</h2>
            </div>
            <p className="text-sm text-indigo-100 font-bold">Paste your notes AND/OR upload multiple files (PDF/Image) to generate cards.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Additional Instructions / Notes</label>
                <textarea
                  placeholder="e.g. Focus on pharmacology, use Arabic for explanations..."
                  rows={4}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder:text-indigo-200 text-white focus:ring-2 focus:ring-white/30 transition-all resize-none"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-indigo-600 px-2 text-indigo-200 font-bold">OR UPLOAD FILES</span></div>
              </div>

              <div className="flex flex-col gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden" 
                  accept=".pdf,image/*,.txt"
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 rounded-xl bg-white/10 border-2 border-dashed border-white/30 text-white font-bold hover:bg-white/20 hover:border-white/50 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Upload size={24} className="mb-1" />
                  <span className="text-xs">Upload PDFs, Images or Text</span>
                </button>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-white flex items-center justify-between animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Upload size={12} className="flex-shrink-0" />
                          <span className="text-[10px] font-medium truncate">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(idx)} className="p-1 hover:bg-white/20 rounded-md transition-colors flex-shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={generateWithAI}
              disabled={isGenerating || (!aiPrompt && selectedFiles.length === 0)}
              className="w-full py-4 rounded-2xl bg-white text-indigo-600 font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles size={18} />}
              Generate Flashcards
            </button>
          </div>
        </div>

        {/* Right: Cards List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Cards <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cards.length}</span>
            </h2>
            <button
              onClick={addCard}
              className="text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-all font-bold flex items-center gap-2"
            >
              <Plus size={18} />
              Add Card
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {cards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 rounded-3xl bg-card border border-border space-y-6 relative group"
                >
                  <button
                    onClick={() => removeCard(idx)}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <Type size={12} />
                        Front Side
                      </div>
                      <textarea
                        placeholder="Enter question..."
                        rows={3}
                        value={card.front}
                        onChange={e => updateCard(idx, 'front', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <Type size={12} />
                        Back Side
                      </div>
                      <textarea
                        placeholder="Enter answer..."
                        rows={3}
                        value={card.back}
                        onChange={e => updateCard(idx, 'back', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TagIcon size={14} className="text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={card.tags.join(', ')}
                      onChange={e => updateCard(idx, 'tags', e.target.value)}
                      className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full placeholder:text-muted-foreground/50"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={addCard}
              className="w-full py-8 rounded-3xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus size={24} />
              </div>
              <span className="font-bold">Add Another Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCard;
