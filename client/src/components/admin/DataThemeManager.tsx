import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, ChevronRight, Folder, 
  Layers, Hash, Save, X, Sparkles, Database 
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  collection, query, getDocs, addDoc, 
  deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, setDoc 
} from 'firebase/firestore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { sendAdminNotification } from './NotificationSystem';

export interface DataTheme {
  id: string;
  name: string;
  categories: {
    id: string;
    name: string;
    chapters: {
      id: string;
      name: string;
    }[];
  }[];
  createdAt: any;
}

export default function DataThemeManager() {
  const [themes, setThemes] = useState<DataTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Form states
  const [newThemeName, setNewThemeName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newChapName, setNewChapName] = useState('');

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'data_themes')));
      setThemes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DataTheme)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleAddTheme = async () => {
    if (!newThemeName.trim()) return;
    try {
      await addDoc(collection(db, 'data_themes'), {
        name: newThemeName,
        categories: [],
        createdAt: new Date()
      });
      setNewThemeName('');
      fetchThemes();
      sendAdminNotification('تم إضافة التيمة بنجاح', 'zap');
    } catch (err) {
      sendAdminNotification('فشل إضافة التيمة', 'error');
    }
  };

  const handleAddCategory = async (themeId: string) => {
    if (!newCatName.trim()) return;
    try {
      const theme = themes.find(t => t.id === themeId);
      if (!theme) return;

      const newCat = {
        id: Math.random().toString(36).substring(2, 9),
        name: newCatName,
        chapters: []
      };

      await updateDoc(doc(db, 'data_themes', themeId), {
        categories: arrayUnion(newCat)
      });
      setNewCatName('');
      fetchThemes();
      sendAdminNotification('تم إضافة القسم بنجاح', 'zap');
    } catch (err) {
      sendAdminNotification('فشل إضافة القسم', 'error');
    }
  };

  const handleAddChapter = async (themeId: string, catId: string) => {
    if (!newChapName.trim()) return;
    try {
      const theme = themes.find(t => t.id === themeId);
      if (!theme) return;

      const updatedCategories = theme.categories.map(cat => {
        if (cat.id === catId) {
          return {
            ...cat,
            chapters: [...cat.chapters, { id: Math.random().toString(36).substring(2, 9), name: newChapName }]
          };
        }
        return cat;
      });

      await updateDoc(doc(db, 'data_themes', themeId), {
        categories: updatedCategories
      });
      setNewChapName('');
      fetchThemes();
      sendAdminNotification('تم إضافة الشابتر بنجاح', 'zap');
    } catch (err) {
      sendAdminNotification('فشل إضافة الشابتر', 'error');
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه التيمة بالكامل؟')) return;
    try {
      await deleteDoc(doc(db, 'data_themes', id));
      fetchThemes();
      sendAdminNotification('تم حذف التيمة', 'zap');
    } catch (err) {
      sendAdminNotification('فشل الحذف', 'error');
    }
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-primary/5 p-10 rounded-[4rem] border-2 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 rounded-full" />
        <div className="relative">
          <h2 className="text-4xl font-black tracking-tight">إدارة تيمات الداتا (Data Themes)</h2>
          <p className="text-muted-foreground font-bold opacity-60">قسم الداتا المجانية والتقسيمات المرنة</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 relative w-full md:w-auto">
          <input 
            type="text" 
            placeholder="اسم التيمة الجديدة (مثلاً: Surgery)" 
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            className="px-6 py-4 bg-card border-2 border-border rounded-2xl outline-none focus:border-primary font-bold md:min-w-[300px]"
          />
          <button 
            onClick={handleAddTheme}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> إضافة تيمة
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <Database className="w-16 h-16 text-primary/20 animate-pulse" />
           <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">Loading Subsystems...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[400px,1fr] gap-10">
          {/* Themes List (Level 1) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> التيمات المتاحة
            </h3>
            <div className="space-y-3">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => { setActiveTheme(theme.id); setActiveCategory(null); }}
                  className={cn(
                    "w-full p-6 rounded-[2rem] border-2 text-right transition-all flex items-center justify-between group",
                    activeTheme === theme.id 
                      ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                      : "bg-card border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTheme(theme.id); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className={cn("w-5 h-5 transition-transform", activeTheme === theme.id ? "rotate-180" : "")} />
                  </div>
                  <span className="text-xl font-black">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Details (Level 2 & 3) */}
          <div className="bg-card/40 backdrop-blur-xl border-2 border-border rounded-[4rem] p-6 md:p-10 min-h-[600px] overflow-hidden">
            {!activeTheme ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                <Sparkles className="w-20 h-20" />
                <p className="text-2xl font-black">اختر تيمة للبدء في تنظيم تقسيماتها</p>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                {/* Level 2 Management */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h4 className="text-2xl font-black flex items-center gap-3">
                      <Folder className="w-6 h-6 text-primary" /> التصنيفات الأساسية (Categories)
                    </h4>
                    <div className="flex gap-2 w-full md:w-auto">
                      <input 
                        type="text" 
                        placeholder="تصنيف جديد..." 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-secondary/50 border-2 border-border rounded-xl font-bold text-sm"
                      />
                      <button onClick={() => handleAddCategory(activeTheme)} className="p-2 bg-primary text-white rounded-xl shadow-lg"><Plus className="w-5 h-5" /></button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {themes.find(t => t.id === activeTheme)?.categories.map(cat => (
                      <div 
                        key={cat.id}
                        className={cn(
                          "p-6 md:p-8 rounded-[3rem] border-2 transition-all cursor-pointer relative group overflow-hidden",
                          activeCategory === cat.id ? "bg-primary/5 border-primary shadow-lg" : "bg-secondary/20 border-border hover:border-primary/30"
                        )}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <div className="p-3 bg-white/50 rounded-2xl border border-border shadow-sm group-hover:scale-110 transition-transform">
                            <Hash className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-xl font-black">{cat.name}</span>
                        </div>

                        {/* Level 3: Chapters */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {cat.chapters.map(chap => (
                              <span key={chap.id} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold">
                                {chap.name}
                              </span>
                            ))}
                          </div>
                          
                          {activeCategory === cat.id && (
                            <div className="pt-4 mt-4 border-t border-primary/10 flex gap-2 animate-in zoom-in-95 duration-300">
                              <input 
                                type="text" 
                                placeholder="شابتر جديد..." 
                                value={newChapName}
                                onChange={(e) => setNewChapName(e.target.value)}
                                className="flex-1 px-3 py-2 bg-white rounded-lg border border-border text-xs font-bold"
                              />
                              <button onClick={() => handleAddChapter(activeTheme, cat.id)} className="p-2 bg-primary text-white rounded-lg"><Save className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
