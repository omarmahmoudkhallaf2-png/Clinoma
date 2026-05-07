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
  const [saving, setSaving] = useState(false);
  const [imageEditor, setImageEditor] = useState<{ idx: number, side: 'front' | 'back' } | null>(null);
  const [focusedEditor, setFocusedEditor] = useState<{ idx: number, side: 'front' | 'back' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardImageInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadCard, setActiveUploadCard] = useState<{ idx: number, side: 'front' | 'back' } | null>(null);

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
    setCards([{ front: '', back: '', tags: [] }, ...cards]);
  };

  const removeCard = (index: number) => {
    if (cards.length === 1) return;
    setCards(cards.filter((_, i) => i !== index));
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
      navigate('/flashcards');
    } catch (error) {
      toast.error('فشل في الحفظ');
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
      setCards([...generatedCards, ...cards.filter(c => c.front !== '' || c.back !== '')]);
      setStep('manual');
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Shared Toolbar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('choice')} className="p-2 hover:bg-muted rounded-full">
            <ChevronLeft size={24} />
          </button>
          <RichTextToolbar onCommand={handleToolbarCommand} />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('settings')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted font-black hover:bg-muted/80 transition-all"
          >
            <Settings size={20} />
            <span className="hidden md:inline">Deck Info</span>
          </button>
          <button
            onClick={() => setStep('settings')}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Save size={20} />
            <span>Finish & Save</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-black tracking-tight flex items-center gap-4">
            Editor
            <span className="text-2xl font-medium text-muted-foreground bg-muted px-4 py-1 rounded-full">{cards.length} Cards</span>
          </h1>
          <button
            onClick={addCard}
            className="p-4 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-all font-black flex items-center gap-2"
          >
            <Plus size={24} />
            New Card
          </button>
        </div>

        <div className="space-y-12">
          <AnimatePresence initial={false}>
            {cards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -50 }}
                className="group relative p-10 rounded-[3.5rem] bg-card border-2 border-border shadow-2xl shadow-primary/5 space-y-10"
              >
                <button
                  onClick={() => removeCard(idx)}
                  className="absolute top-8 right-8 p-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={24} />
                </button>

                <div className="flex flex-col gap-10">
                  {/* Front Side - Full Width */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-primary">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
                        Question Side
                      </div>
                      <button
                        onClick={() => { setActiveUploadCard({ idx, side: 'front' }); cardImageInputRef.current?.click(); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold transition-all"
                      >
                        <ImageIcon size={14} />
                        {card.frontImage ? 'Change Image' : 'Add Image'}
                      </button>
                    </div>
                    
                    {card.frontImage && (
                      <div className="relative group/img max-h-[400px] rounded-3xl overflow-hidden bg-muted border-2 border-border">
                        <img src={card.frontImage.url} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-4">
                          <button onClick={() => setImageEditor({ idx, side: 'front' })} className="p-4 bg-white text-primary rounded-full hover:scale-110 transition-all"><Edit2 /></button>
                          <button onClick={() => updateCard(idx, 'frontImage', undefined)} className="p-4 bg-white text-rose-500 rounded-full hover:scale-110 transition-all"><Trash2 /></button>
                        </div>
                      </div>
                    )}

                    <RichTextEditor
                      value={card.front}
                      onChange={val => updateCard(idx, 'front', val)}
                      onFocus={() => setFocusedEditor({ idx, side: 'front' })}
                      placeholder="Start writing the question..."
                      minHeight="250px"
                    />
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-full" />

                  {/* Back Side - Full Width */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</div>
                        Answer Side
                      </div>
                      <button
                        onClick={() => { setActiveUploadCard({ idx, side: 'back' }); cardImageInputRef.current?.click(); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold transition-all"
                      >
                        <ImageIcon size={14} />
                        {card.backImage ? 'Change Image' : 'Add Image'}
                      </button>
                    </div>

                    {card.backImage && (
                      <div className="relative group/img max-h-[400px] rounded-3xl overflow-hidden bg-muted border-2 border-border">
                        <img src={card.backImage.url} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-4">
                          <button onClick={() => setImageEditor({ idx, side: 'back' })} className="p-4 bg-white text-primary rounded-full hover:scale-110 transition-all"><Edit2 /></button>
                          <button onClick={() => updateCard(idx, 'backImage', undefined)} className="p-4 bg-white text-rose-500 rounded-full hover:scale-110 transition-all"><Trash2 /></button>
                        </div>
                      </div>
                    )}

                    <RichTextEditor
                      value={card.back}
                      onChange={val => updateCard(idx, 'back', val)}
                      onFocus={() => setFocusedEditor({ idx, side: 'back' })}
                      placeholder="Start writing the answer..."
                      minHeight="250px"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-4 bg-muted/30 rounded-3xl border border-border/50 focus-within:border-primary/30 transition-all">
                  <TagIcon size={20} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Add tags (separated by commas)..."
                    value={card.tags.join(', ')}
                    onChange={e => updateCard(idx, 'tags', e.target.value)}
                    className="bg-transparent border-none p-0 text-lg font-medium focus:ring-0 w-full placeholder:text-muted-foreground/30"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={addCard}
            className="w-full py-16 rounded-[4rem] border-4 border-dashed border-border hover:border-primary/30 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-6 group"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
              <Plus size={40} />
            </div>
            <div className="text-center">
              <span className="text-3xl font-black text-muted-foreground group-hover:text-primary transition-colors">Add Another Card</span>
              <p className="text-muted-foreground/50 font-bold mt-2">Continue building your collection</p>
            </div>
          </motion.button>
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
