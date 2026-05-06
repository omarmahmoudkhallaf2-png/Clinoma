import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileJson, 
  FileText, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  X,
  ChevronRight,
  Database,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportedCard {
  front: string;
  back: string;
  tags: string[];
}

const ImportCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportedCard[]>([]);
  const [step, setStep] = useState(1);
  const [deckTitle, setDeckTitle] = useState('');
  const [subject, setSubject] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (selectedFile.name.endsWith('.json')) {
          const data = JSON.parse(content);
          // Expecting format: [{ front: '', back: '', tags: [] }]
          setPreviewData(data);
        } else if (selectedFile.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const data = lines.filter(l => l.trim()).map(line => {
            const [front, back, tags] = line.split(',');
            return {
              front: front?.trim(),
              back: back?.trim(),
              tags: tags ? tags.split('|').map(t => t.trim()) : []
            };
          });
          setPreviewData(data);
        } else {
          toast.error('Unsupported file format');
          return;
        }
        setStep(2);
      } catch (err) {
        toast.error('Failed to parse file');
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!user || !deckTitle || !subject) {
      toast.error('Please provide deck title and subject');
      return;
    }

    setImporting(true);
    try {
      const deckRef = await addDoc(collection(db, 'decks'), {
        userId: user.uid,
        title: deckTitle,
        subject,
        createdAt: Date.now(),
        cardCount: previewData.length
      });

      const batch = writeBatch(db);
      previewData.forEach(card => {
        const cardRef = doc(collection(db, 'flashcards'));
        batch.set(cardRef, {
          deckId: deckRef.id,
          userId: user.uid,
          front: card.front,
          back: card.back,
          tags: card.tags,
          subject,
          createdAt: Date.now(),
          nextReview: Date.now(),
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          status: 'new'
        });
      });

      await batch.commit();
      toast.success(`Successfully imported ${previewData.length} cards!`);
      navigate('/flashcards');
    } catch (err) {
      console.error('Import error:', err);
      toast.error('Failed to import cards');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        {[1, 2].map(i => (
          <React.Fragment key={i}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > i ? <CheckCircle2 size={20} /> : i}
            </div>
            {i < 2 && <div className={`w-20 h-1 transition-all ${step > i ? 'bg-primary' : 'bg-muted'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold">Import Flashcards</h1>
              <p className="text-muted-foreground">Upload your existing decks from other platforms.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'JSON', icon: FileJson, color: 'text-blue-500', desc: 'Custom JSON format' },
                { name: 'CSV', icon: FileText, color: 'text-green-500', desc: 'Excel / Spreadsheet' },
                { name: 'APKG', icon: Package, color: 'text-purple-500', desc: 'Anki Package' },
              ].map(type => (
                <div key={type.name} className="p-6 rounded-3xl bg-card border border-border flex flex-col items-center text-center space-y-3">
                  <div className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center ${type.color}`}>
                    <type.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">{type.name}</h3>
                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group py-20 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">Drop your file here</p>
                <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden" 
                accept=".json,.csv"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium">
                <ArrowLeft size={18} />
                Back
              </button>
              <h2 className="text-2xl font-bold">Import Preview</h2>
              <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {previewData.length} Cards Found
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-6 rounded-3xl">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deck Title</label>
                <input 
                  type="text" 
                  value={deckTitle}
                  onChange={e => setDeckTitle(e.target.value)}
                  placeholder="e.g. Imported Cardiology Deck"
                  className="w-full px-4 py-3 rounded-xl bg-muted border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <select 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted border-none appearance-none"
                >
                  <option value="">Select Subject</option>
                  <option value="Anatomy">Anatomy</option>
                  <option value="Physiology">Physiology</option>
                  <option value="Pathology">Pathology</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Database size={18} />
                Previewing Cards
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {previewData.map((card, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-muted/50 border border-border flex flex-col gap-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Front</span>
                        <p className="text-sm font-medium">{card.front}</p>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Back</span>
                        <p className="text-sm font-medium">{card.back}</p>
                      </div>
                    </div>
                    {card.tags.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {card.tags.map(t => (
                          <span key={t} className="text-[10px] bg-card px-2 py-0.5 rounded-full border border-border">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleImport}
              disabled={importing || !deckTitle || !subject}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {importing ? "Importing..." : "Finalize Import"}
              {!importing && <ChevronRight size={20} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 p-6 rounded-3xl bg-orange-500/5 border border-orange-500/10 flex gap-4">
        <AlertCircle className="text-orange-500 shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-orange-600">CSV Formatting Tip</h4>
          <p className="text-sm text-orange-600/80">For CSV files, use the format: <code className="bg-orange-500/10 px-1 rounded">Question,Answer,tag1|tag2</code>. Make sure to use a comma as a separator.</p>
        </div>
      </div>
    </div>
  );
};

export default ImportCards;
