import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, ChevronRight, Folder, Hash, 
  ArrowLeft, Search, Sparkles, Brain, FileStack, Box
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function DataThemes() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'themes' | 'modules' | 'categories' | 'chapters' | 'divisions'>('themes');
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
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
    if (step === 'themes') return themes.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (step === 'modules') return selectedTheme.modules?.filter((m: any) => m.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
    if (step === 'categories') return selectedModule.categories?.filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
    if (step === 'chapters') return selectedCategory.chapters?.filter((ch: any) => ch.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
    if (step === 'divisions') return selectedChapter.divisions?.filter((d: any) => d.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
    return [];
  };

  const handleBack = () => {
    if (step === 'divisions') setStep('chapters');
    else if (step === 'chapters') setStep('categories');
    else if (step === 'categories') setStep('modules');
    else if (step === 'modules') setStep('themes');
    else navigate('/dashboard');
  };

  const startQuiz = (divisionId: string) => {
    navigate(`/quiz?themeId=${selectedTheme.id}&moduleId=${selectedModule.id}&categoryId=${selectedCategory.id}&chapterId=${selectedChapter.id}&divisionId=${divisionId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-hidden relative">
      {/* Header Compact */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 md:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-xl h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> تيمات الداتا
              </h1>
              <div className="flex items-center gap-1.5 text-[7px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                <span className={cn(step === 'themes' ? "text-primary" : "")}>Themes</span>
                <ChevronRight className="w-2 h-2" />
                <span className={cn(step === 'modules' ? "text-primary" : "")}>Modules</span>
                <ChevronRight className="w-2 h-2" />
                <span className={cn(step === 'categories' ? "text-primary" : "")}>Categories</span>
                <ChevronRight className="w-2 h-2" />
                <span className={cn(step === 'chapters' ? "text-primary" : "")}>Chapters</span>
                <ChevronRight className="w-2 h-2" />
                <span className={cn(step === 'divisions' ? "text-primary" : "")}>Divisions</span>
              </div>
            </div>
          </div>
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 bg-secondary/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-primary" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-50"><Database className="w-12 h-12 text-primary animate-pulse" /></div>
        ) : (
          <div className="space-y-8">
            {/* Context Card Compact */}
            <AnimatePresence mode="wait">
              {step !== 'themes' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-primary/5 border border-primary/10 p-5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10"><Box className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-primary">Path</p>
                      <h2 className="text-xl md:text-2xl font-black tracking-tighter">
                        {selectedTheme?.name} 
                        {selectedModule && ` / ${selectedModule.name}`}
                        {selectedCategory && ` / ${selectedCategory.name}`}
                        {selectedChapter && ` / ${selectedChapter.name}`}
                      </h2>
                    </div>
                  </div>
                  <div className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-border text-xs font-black text-primary">Free Access</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredItems().map((item: any, i: number) => (
                <motion.button
                  key={item.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => {
                    if (step === 'themes') { setSelectedTheme(item); setStep('modules'); }
                    else if (step === 'modules') { setSelectedModule(item); setStep('categories'); }
                    else if (step === 'categories') { setSelectedCategory(item); setStep('chapters'); }
                    else if (step === 'chapters') { setSelectedChapter(item); setStep('divisions'); }
                    else { startQuiz(item.id); }
                    setSearchQuery('');
                  }}
                  className="group relative p-6 bg-card border border-border rounded-[2rem] text-right hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm",
                      step === 'themes' ? "bg-amber-500/10 text-amber-500" : 
                      step === 'modules' ? "bg-rose-500/10 text-rose-500" : 
                      step === 'categories' ? "bg-indigo-500/10 text-indigo-500" : 
                      step === 'chapters' ? "bg-primary/10 text-primary" :
                      "bg-emerald-500/10 text-emerald-600"
                    )}>
                      {step === 'themes' ? <Database className="w-7 h-7" /> : 
                       step === 'modules' ? <Box className="w-7 h-7" /> : 
                       step === 'categories' ? <Folder className="w-7 h-7" /> : 
                       step === 'chapters' ? <FileStack className="w-7 h-7" /> :
                       <Hash className="w-7 h-7" />}
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-black tracking-tight leading-tight">{item.name}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1 opacity-60">
                        {step === 'themes' ? `${item.modules?.length || 0} Modules` : 
                         step === 'modules' ? `${item.categories?.length || 0} Categories` : 
                         step === 'categories' ? `${item.chapters?.length || 0} Chapters` : 
                         step === 'chapters' ? `${item.divisions?.length || 0} Divisions` :
                         'ابدأ الاختبار'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
