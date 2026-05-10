import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, ChevronRight, Folder, Hash, 
  ArrowLeft, Search, Sparkles, Brain, Zap, Clock, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

export default function DataThemes() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'themes' | 'categories' | 'chapters'>('themes');
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchThemes = async () => {
      const snap = await getDocs(query(collection(db, 'data_themes'), orderBy('name')));
      setThemes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchThemes();
  }, []);

  const filteredItems = () => {
    if (step === 'themes') {
      return themes.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (step === 'categories') {
      return selectedTheme.categories.filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (step === 'chapters') {
      return selectedCategory.chapters.filter((ch: any) => ch.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return [];
  };

  const handleBack = () => {
    if (step === 'chapters') setStep('categories');
    else if (step === 'categories') setStep('themes');
    else navigate('/dashboard');
  };

  const startQuiz = (chapterId: string) => {
    navigate(`/quiz?themeId=${selectedTheme.id}&categoryId=${selectedCategory.id}&chapterId=${chapterId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-2xl">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Database className="w-6 h-6 text-primary" /> تيمات الداتا (Data Themes)
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                <span className={cn(step === 'themes' ? "text-primary" : "")}>Themes</span>
                <ChevronRight className="w-3 h-3" />
                <span className={cn(step === 'categories' ? "text-primary" : "")}>Categories</span>
                <ChevronRight className="w-3 h-3" />
                <span className={cn(step === 'chapters' ? "text-primary" : "")}>Chapters</span>
              </div>
            </div>
          </div>
          <div className="relative hidden md:block w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl font-bold text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <Database className="w-20 h-20 text-primary animate-pulse opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
            <p className="font-black text-xl animate-pulse">Initializing Data Stream...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Context Card */}
            <AnimatePresence mode="wait">
              {step !== 'themes' && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-primary/5 border border-primary/20 p-8 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/20">
                      <Folder className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Current selection</p>
                      <h2 className="text-4xl font-black tracking-tighter">
                        {selectedTheme?.name} {selectedCategory && `/ ${selectedCategory.name}`}
                      </h2>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-border text-center">
                       <p className="text-xl font-black text-primary">Free</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">Access</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems().map((item: any, i: number) => (
                <motion.button
                  key={item.id || i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    if (step === 'themes') {
                      setSelectedTheme(item);
                      setStep('categories');
                    } else if (step === 'categories') {
                      setSelectedCategory(item);
                      setStep('chapters');
                    } else {
                      startQuiz(item.id);
                    }
                    setSearchQuery('');
                  }}
                  className="group relative p-8 bg-card border-2 border-border rounded-[3rem] text-right hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all"
                >
                  <div className="absolute top-4 left-4 p-2 rounded-xl bg-secondary opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <ChevronRight className="w-5 h-5 text-primary rotate-180" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-6">
                    <div className={cn(
                      "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                      step === 'themes' ? "bg-amber-500/10 text-amber-500" : 
                      step === 'categories' ? "bg-indigo-500/10 text-indigo-500" : 
                      "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {step === 'themes' ? <Database className="w-10 h-10" /> : 
                       step === 'categories' ? <Folder className="w-10 h-10" /> : 
                       <Hash className="w-10 h-10" />}
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-black tracking-tight">{item.name}</h3>
                      <p className="text-sm font-bold text-muted-foreground mt-1 opacity-60">
                        {step === 'themes' ? `${item.categories?.length || 0} Categories` : 
                         step === 'categories' ? `${item.chapters?.length || 0} Chapters` : 
                         'Open Question Bank'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredItems().length === 0 && (
              <div className="text-center py-20 space-y-4 opacity-40">
                <Search className="w-16 h-16 mx-auto" />
                <p className="text-2xl font-black">No items found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Info */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-3">
         <div className="p-4 bg-primary text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-500">
            <Brain className="w-6 h-6" />
            <div className="text-xs">
              <p className="font-black">Deep Learning System</p>
              <p className="opacity-80">Tracked & Synced</p>
            </div>
         </div>
      </div>
    </div>
  );
}
