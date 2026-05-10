import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, writeBatch, doc, getDoc, getDocs, where, query, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Plus,
  Trash2,
  Sparkles,
  ChevronLeft,
  Layout,
  Type,
  Tag as TagIcon,
  Upload,
  X,
  Loader2,
  ChevronRight,
  MousePointer2,
  FileText,
  Image as ImageIcon,
  Edit2,
  Settings,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateFlashcards } from '../../lib/gemini';
import { cn } from '../../lib/utils';
import RichTextEditor from '../../components/flashcards/RichTextEditor';
import RichTextToolbar from '../../components/flashcards/RichTextToolbar';
import ImageOcclusionEditor from '../../components/flashcards/ImageOcclusionEditor';
import type { CardImage, Mask } from '../../types/flashcard';

interface CardInput {
  front: string;
  back: string;
  tags: string[];
  frontImage?: CardImage;
  backImage?: CardImage;
}

type Step = 'choice' | 'manual' | 'ai' | 'settings';

const CreateCard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const [step, setStep] = useState<Step>(deckId ? 'manual' : 'choice');
  const [deckInfo, setDeckInfo] = useState({
    title: '',
    description: '',
    subject: '',
    isPublic: false,
    year: '',
    module: ''
  });

  const [cards, setCards] = useState<CardInput[]>([
    { front: '', back: '', tags: [] }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ name: string, data: string, type: string }[]>([]);
  const [aiUsage, setAiUsage] = useState({ count: 0, lastReset: Date.now() });
  const [saving, setSaving] = useState(false);
  const [imageEditor, setImageEditor] = useState<{ idx: number, side: 'front' | 'back' } | null>(null);
  const [focusedEditor, setFocusedEditor] = useState<{ idx: number, side: 'front' | 'back' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardImageInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadCard, setActiveUploadCard] = useState<{ idx: number, side: 'front' | 'back' } | null>(null);

  const [currentCardIdx, setCurrentCardIdx] = useState(0);

  useEffect(() => {
    const fetchUsage = async () => {
      if (user && userRole !== 'admin') {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.aiUsage) {
            setAiUsage(data.aiUsage);
          }
        }
      }
    };
    fetchUsage();
  }, [user, userRole]);

  // Load deck if editing
  React.useEffect(() => {
    if (deckId) {
      const loadDeck = async () => {
        try {
          const dRef = doc(db, 'decks', deckId);
          const dSnap = await getDoc(dRef);
          if (dSnap.exists()) {
            const data = dSnap.data();
            setDeckInfo({
              title: data.title || '',
              description: data.description || '',
              subject: data.subject || '',
              isPublic: data.isPublic || false,
              year: data.year || '',
              module: data.module || ''
            });
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

  const handleToolbarCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

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

  const handleCardImageUpload = async (file: File, idx: number, side: 'front' | 'back') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_DIM = 1200;
        if (width > height && width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        const newCards = [...cards];
        const field = side === 'front' ? 'frontImage' : 'backImage';
        newCards[idx][field] = { url: compressedBase64, masks: [] };
        setCards(newCards);
        toast.success('تم رفع الصورة بنجاح');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addCard = () => {
    const newCard = { front: '', back: '', tags: [] };
    setCards([...cards, newCard]);
    setCurrentCardIdx(cards.length);
  };

  const removeCard = (index: number) => {
    if (cards.length === 1) {
      setCards([{ front: '', back: '', tags: [] }]);
      return;
    }
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
    if (currentCardIdx >= newCards.length) {
      setCurrentCardIdx(newCards.length - 1);
    }
  };

  const updateCard = (index: number, field: keyof CardInput, value: any) => {
    const newCards = [...cards];
    if (field === 'tags' && typeof value === 'string') {
      newCards[index].tags = value.split(',').map(t => t.trim());
    } else {
      (newCards[index] as any)[field] = value;
    }
    setCards(newCards);
  };

  const updateMasks = (idx: number, side: 'front' | 'back', masks: Mask[]) => {
    const newCards = [...cards];
    const field = side === 'front' ? 'frontImage' : 'backImage';
    const img = newCards[idx][field];
    if (img) {
      newCards[idx][field] = { ...img, masks };
      setCards(newCards);
    }
  };

  const handleSaveFinal = async () => {
    if (!user || !deckInfo.title) {
      toast.error('يرجى إدخال عنوان للمجموعة');
      return;
    }
    setSaving(true);
    try {
      let dId = deckId;
      if (deckId) {
        await updateDoc(doc(db, 'decks', deckId), {
          ...deckInfo,
          cardCount: cards.length,
          updatedAt: serverTimestamp()
        });
        const oldCards = await getDocs(query(collection(db, 'flashcards'), where('deckId', '==', deckId)));
        const batch = writeBatch(db);
        oldCards.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } else {
        const deckRef = await addDoc(collection(db, 'decks'), {
          userId: user.uid,
          ...deckInfo,
          createdAt: Date.now(),
          cardCount: cards.length
        });
        dId = deckRef.id;
      }

      const batch = writeBatch(db);
      cards.forEach(card => {
        const cardRef = doc(collection(db, 'flashcards'));
        batch.set(cardRef, {
          deckId: dId,
          userId: deckInfo.isPublic ? 'PUBLIC' : user.uid,
          front: card.front,
          back: card.back,
          frontImage: card.frontImage || null,
          backImage: card.backImage || null,
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
      toast.success('تم الحفظ بنجاح!');
      navigate('/flashcards/decks');
    } catch (error) {
      toast.error('فشل في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt && selectedFiles.length === 0) return;
    
    // Check usage
    if (userRole !== 'admin') {
      const today = new Date().toDateString();
      const lastReset = new Date(aiUsage.lastReset).toDateString();
      if (today === lastReset && aiUsage.count >= 5) {
        toast.error('لقد استنفدت حدك اليومي (5 محاولات). انتظر حتى الغد!');
        return;
      }
    }

    setIsGenerating(true);
    try {
      const generatedCards = await generateFlashcards(
        aiPrompt || "Generate flashcards from provided files",
        selectedFiles.length > 0 ? selectedFiles.map(f => ({ data: f.data, mimeType: f.type })) : undefined
      );
      setCards([...cards.filter(c => c.front !== '' || c.back !== ''), ...generatedCards]);
      setStep('manual');
      setCurrentCardIdx(cards.length);
      
      // Update usage in Firestore
      if (user && userRole !== 'admin') {
        const newUsage = {
          count: (new Date().toDateString() === new Date(aiUsage.lastReset).toDateString()) ? aiUsage.count + 1 : 1,
          lastReset: Date.now()
        };
        await updateDoc(doc(db, 'users', user.uid), { aiUsage: newUsage });
        setAiUsage(newUsage);
      }
      
      toast.success(`تم توليد ${generatedCards.length} كارت بنجاح!`);
    } catch (error) {
      toast.error('فشل الذكاء الاصطناعي');
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('manual')}
            className="p-10 rounded-[3rem] bg-card border-2 border-border hover:border-primary/50 transition-all flex flex-col items-center text-center gap-6 group shadow-2xl shadow-primary/5"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <MousePointer2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black">Manual Creation</h2>
              <p className="text-muted-foreground font-medium">Create cards manually with our rich text editor</p>
            </div>
            <ArrowRight className="mt-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('ai')}
            className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none flex flex-col items-center text-center gap-6 group shadow-2xl shadow-indigo-500/20"
          >
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black">AI Generator</h2>
              <p className="text-indigo-100 font-medium">Upload files or paste notes and let AI do the work</p>
            </div>
            <ArrowRight className="mt-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>
      </div>
    );
  }

  if (step === 'ai') {
    return (
      <div className="min-h-screen bg-background p-6 md:p-12 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setStep('choice')} className="p-3 hover:bg-muted rounded-full">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-4xl font-black">AI Generator</h1>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-card border-2 border-border space-y-6">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm font-bold text-muted-foreground">AI Power Grid</span>
              {userRole !== 'admin' && (
                <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase text-primary border border-primary/20">
                  Remaining: {Math.max(0, 5 - (new Date().toDateString() === new Date(aiUsage.lastReset).toDateString() ? aiUsage.count : 0))}/5
                </div>
              )}
            </div>
            <textarea
              placeholder="Paste your notes here or describe what you want..."
              rows={6}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              className="w-full px-6 py-4 rounded-3xl bg-muted border-none text-lg font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />

            <div className="flex flex-col gap-4">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,image/*,.txt" multiple />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 rounded-3xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground font-bold flex flex-col items-center gap-2 transition-all"
              >
                <Upload size={32} />
                <span>Upload PDF or Images</span>
              </button>

              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold">
                      <FileText size={14} />
                      {file.name}
                      <button onClick={() => setSelectedFiles(f => f.filter((_, i) => i !== idx))}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={generateWithAI}
              disabled={isGenerating || (!aiPrompt && selectedFiles.length === 0)}
              className="w-full py-5 rounded-[2rem] bg-primary text-primary-foreground font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {isGenerating ? 'Generating...' : 'Start Generating'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'settings') {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="max-w-xl w-full space-y-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setStep('manual')} className="p-3 hover:bg-muted rounded-full">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-4xl font-black">Deck Settings</h1>
          </div>

          <div className="p-10 rounded-[3rem] bg-card border-2 border-border space-y-8 shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiovascular System"
                  value={deckInfo.title}
                  onChange={e => setDeckInfo({ ...deckInfo, title: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-muted border-none text-xl font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Anatomy"
                  value={deckInfo.subject}
                  onChange={e => setDeckInfo({ ...deckInfo, subject: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-muted border-none text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {userRole === 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Year</label>
                    <select
                      value={deckInfo.year}
                      onChange={e => setDeckInfo({ ...deckInfo, year: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted border-none font-bold"
                    >
                      <option value="">Select Year</option>
                      {['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'].map(y => (
                        <option key={y} value={`${y} Year`}>{y} Year</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module</label>
                    <input
                      type="text"
                      placeholder="Specialty"
                      value={deckInfo.module}
                      onChange={e => setDeckInfo({ ...deckInfo, module: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted border-none font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Description</label>
                <textarea
                  placeholder="About this deck..."
                  rows={3}
                  value={deckInfo.description}
                  onChange={e => setDeckInfo({ ...deckInfo, description: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-muted border-none font-medium resize-none"
                />
              </div>

              {userRole === 'admin' && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <span className="font-bold text-primary">Official Public Deck</span>
                  <button
                    onClick={() => setDeckInfo({ ...deckInfo, isPublic: !deckInfo.isPublic })}
                    className={cn("w-12 h-6 rounded-full relative p-1 transition-all", deckInfo.isPublic ? "bg-primary" : "bg-muted")}
                  >
                    <div className={cn("w-4 h-4 rounded-full bg-white transition-all", deckInfo.isPublic ? "translate-x-6" : "translate-x-0")} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveFinal}
              disabled={saving}
              className="w-full py-5 rounded-[2rem] bg-emerald-600 text-white font-black text-xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              {deckId ? 'Update Everything' : 'Create Deck Now'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIdx];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Shared Toolbar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('choice')} className="p-2 hover:bg-muted rounded-full">
            <ChevronLeft size={24} />
          </button>
          <RichTextToolbar onCommand={handleToolbarCommand} />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('settings')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted font-bold text-xs hover:bg-muted/80 transition-all border border-border"
          >
            <Settings size={14} />
            <span className="hidden sm:inline">Deck Info</span>
          </button>
          <button
            onClick={() => setStep('settings')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Save size={14} />
            <span>Finish</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Cards List */}
        <div className="w-80 border-r border-border bg-muted/20 overflow-y-auto hidden lg:flex flex-col p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Cards ({cards.length})</h2>
            <button onClick={addCard} className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {cards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentCardIdx(idx)}
                className={cn(
                  "w-full p-4 rounded-2xl text-left transition-all border-2 flex items-center justify-between group",
                  currentCardIdx === idx ? "bg-card border-primary shadow-lg" : "bg-transparent border-transparent hover:bg-card/50"
                )}
              >
                <div className="min-w-0">
                  <p className="text-xs font-black text-muted-foreground mb-1 uppercase tracking-widest">Card {idx + 1}</p>
                  <p className="font-bold truncate text-sm" dangerouslySetInnerHTML={{ __html: card.front || "Empty Question" }} />
                </div>
                {cards.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCard(idx); }}
                    className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20">
                  {currentCardIdx + 1}
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight">Editing Card</h1>
                  <p className="text-muted-foreground font-bold">Refine your question and answer</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={currentCardIdx === 0}
                  onClick={() => setCurrentCardIdx(i => i - 1)}
                  className="p-3 rounded-2xl bg-card border-2 border-border hover:border-primary/50 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => {
                    if (currentCardIdx === cards.length - 1) {
                      addCard();
                    } else {
                      setCurrentCardIdx(i => i + 1);
                    }
                  }}
                  className="px-6 py-3 rounded-2xl bg-card border-2 border-primary/50 text-primary font-black hover:bg-primary/5 transition-all flex items-center gap-2"
                >
                  {currentCardIdx === cards.length - 1 ? "Add Next" : "Next Card"}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <motion.div
              key={currentCardIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-10 rounded-[4rem] bg-card border-2 border-border shadow-2xl shadow-primary/5 space-y-12"
            >
              {/* Question Side */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-primary">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">Q</div>
                    The Question
                  </div>
                  <div className="flex items-center gap-2">
                    {currentCard.frontImage && (
                      <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-lg border border-border">
                        <span className="text-[10px] font-black uppercase text-muted-foreground mr-2">Size</span>
                        <button 
                          onClick={() => updateCard(currentCardIdx, 'frontImage', { ...currentCard.frontImage, scale: Math.max(0.5, (currentCard.frontImage?.scale || 1) - 0.1) })}
                          className="p-1 hover:bg-background rounded"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-bold w-12 text-center">{Math.round((currentCard.frontImage.scale || 1) * 100)}%</span>
                        <button 
                          onClick={() => updateCard(currentCardIdx, 'frontImage', { ...currentCard.frontImage, scale: Math.min(2, (currentCard.frontImage?.scale || 1) + 0.1) })}
                          className="p-1 hover:bg-background rounded"
                        >
                          +
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => { setActiveUploadCard({ idx: currentCardIdx, side: 'front' }); cardImageInputRef.current?.click(); }}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold transition-all border border-border"
                    >
                      <ImageIcon size={16} />
                      {currentCard.frontImage ? 'Change Image' : 'Add Image'}
                    </button>
                  </div>
                </div>
                
                {currentCard.frontImage && (
                  <div className="relative group/img max-h-[600px] rounded-[2.5rem] overflow-hidden bg-muted/30 border-2 border-border flex items-center justify-center">
                    <div style={{ transform: `scale(${currentCard.frontImage.scale || 1})` }} className="transition-transform duration-200">
                      <img src={currentCard.frontImage.url} className="max-h-[600px] w-auto object-contain" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-4">
                      <button onClick={() => setImageEditor({ idx: currentCardIdx, side: 'front' })} className="p-5 bg-white text-primary rounded-full hover:scale-110 transition-all shadow-xl"><Edit2 /></button>
                      <button onClick={() => updateCard(currentCardIdx, 'frontImage', undefined)} className="p-5 bg-white text-rose-500 rounded-full hover:scale-110 transition-all shadow-xl"><Trash2 /></button>
                    </div>
                  </div>
                )}

                <RichTextEditor
                  value={currentCard.front}
                  onChange={val => updateCard(currentCardIdx, 'front', val)}
                  placeholder="Write the question here..."
                  minHeight="350px"
                />
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-full opacity-50" />

              {/* Answer Side */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">A</div>
                    The Answer
                  </div>
                  <div className="flex items-center gap-2">
                    {currentCard.backImage && (
                      <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-lg border border-border">
                        <span className="text-[10px] font-black uppercase text-muted-foreground mr-2">Size</span>
                        <button 
                          onClick={() => updateCard(currentCardIdx, 'backImage', { ...currentCard.backImage, scale: Math.max(0.5, (currentCard.backImage?.scale || 1) - 0.1) })}
                          className="p-1 hover:bg-background rounded"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-bold w-12 text-center">{Math.round((currentCard.backImage.scale || 1) * 100)}%</span>
                        <button 
                          onClick={() => updateCard(currentCardIdx, 'backImage', { ...currentCard.backImage, scale: Math.min(2, (currentCard.backImage?.scale || 1) + 0.1) })}
                          className="p-1 hover:bg-background rounded"
                        >
                          +
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => { setActiveUploadCard({ idx: currentCardIdx, side: 'back' }); cardImageInputRef.current?.click(); }}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-bold transition-all border border-border"
                    >
                      <ImageIcon size={18} />
                      {currentCard.backImage ? 'Change Image' : 'Add Image'}
                    </button>
                  </div>
                </div>

                {currentCard.backImage && (
                  <div className="relative group/img max-h-[600px] rounded-[2.5rem] overflow-hidden bg-muted/30 border-2 border-border flex items-center justify-center">
                    <div style={{ transform: `scale(${currentCard.backImage.scale || 1})` }} className="transition-transform duration-200">
                      <img src={currentCard.backImage.url} className="max-h-[600px] w-auto object-contain" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-4">
                      <button onClick={() => setImageEditor({ idx: currentCardIdx, side: 'back' })} className="p-5 bg-white text-primary rounded-full hover:scale-110 transition-all shadow-xl"><Edit2 /></button>
                      <button onClick={() => updateCard(currentCardIdx, 'backImage', undefined)} className="p-5 bg-white text-rose-500 rounded-full hover:scale-110 transition-all shadow-xl"><Trash2 /></button>
                    </div>
                  </div>
                )}

                <RichTextEditor
                  value={currentCard.back}
                  onChange={val => updateCard(currentCardIdx, 'back', val)}
                  onFocus={() => { /* Focus sync */ }}
                  placeholder="Write the answer here..."
                  minHeight="350px"
                />
              </div>

              <div className="flex items-center gap-4 px-8 py-5 bg-muted/20 rounded-[2rem] border border-border/50 focus-within:border-primary/30 transition-all">
                <TagIcon size={24} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tags (separated by commas)..."
                  value={currentCard.tags.join(', ')}
                  onChange={e => updateCard(currentCardIdx, 'tags', e.target.value)}
                  className="bg-transparent border-none p-0 text-xl font-bold focus:ring-0 w-full placeholder:text-muted-foreground/30"
                />
              </div>
            </motion.div>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-3">
              {cards.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    currentCardIdx === i ? "bg-primary w-10" : "bg-muted hover:bg-muted-foreground/30 cursor-pointer"
                  )}
                  onClick={() => setCurrentCardIdx(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Inputs & Editors */}
      <input
        type="file"
        ref={cardImageInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activeUploadCard) handleCardImageUpload(file, activeUploadCard.idx, activeUploadCard.side);
          e.target.value = '';
        }}
      />

      {imageEditor && (
        <ImageOcclusionEditor
          imageUrl={imageEditor.side === 'front' ? cards[imageEditor.idx].frontImage!.url : cards[imageEditor.idx].backImage!.url}
          masks={imageEditor.side === 'front' ? cards[imageEditor.idx].frontImage!.masks : cards[imageEditor.idx].backImage!.masks}
          onChange={(masks) => updateMasks(imageEditor.idx, imageEditor.side, masks)}
          onClose={() => setImageEditor(null)}
        />
      )}
    </div>
  );
};

export default CreateCard;
