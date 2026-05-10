import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, ChevronRight, Folder, 
  Layers, Hash, Save, X, Sparkles, Database, 
  FileStack, ListTree, ChevronDown
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  collection, query, getDocs, addDoc, 
  deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc
} from 'firebase/firestore';
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
      divisions: {
        id: string;
        name: string;
      }[];
    }[];
  }[];
  createdAt: any;
}

export default function DataThemeManager() {
  const [themes, setThemes] = useState<DataTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  // Form states
  const [newThemeName, setNewThemeName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newChapName, setNewChapName] = useState('');
  const [newDivName, setNewDivName] = useState('');

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
      await fetchThemes();
      sendAdminNotification('تم إضافة التيمة بنجاح', 'zap');
    } catch (err) {
      sendAdminNotification('فشل إضافة التيمة', 'error');
    }
  };

  const handleAddCategory = async (themeId: string) => {
    if (!newCatName.trim()) return;
    try {
      const themeRef = doc(db, 'data_themes', themeId);
      const themeSnap = await getDoc(themeRef);
      if (!themeSnap.exists()) return;

      const currentCategories = themeSnap.data().categories || [];
      const newCat = {
        id: Math.random().toString(36).substring(2, 9),
        name: newCatName,
        chapters: []
      };

      await updateDoc(themeRef, {
        categories: [...currentCategories, newCat]
      });
      setNewCatName('');
      await fetchThemes();
      sendAdminNotification('تم إضافة التصنيف بنجاح', 'zap');
    } catch (err) {
      console.error(err);
      sendAdminNotification('فشل إضافة التصنيف', 'error');
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
            chapters: [...cat.chapters, { 
              id: Math.random().toString(36).substring(2, 9), 
              name: newChapName,
              divisions: [] 
            }]
          };
        }
        return cat;
      });

      await updateDoc(doc(db, 'data_themes', themeId), {
        categories: updatedCategories
      });
      setNewChapName('');
      await fetchThemes();
      sendAdminNotification('تم إضافة الشابتر بنجاح', 'zap');
    } catch (err) {
      sendAdminNotification('فشل إضافة الشابتر', 'error');
    }
  };

  const handleAddDivision = async (themeId: string, catId: string, chapId: string) => {
    if (!newDivName.trim()) return;
    try {
      const theme = themes.find(t => t.id === themeId);
      if (!theme) return;

      const updatedCategories = theme.categories.map(cat => {
        if (cat.id === catId) {
          const updatedChapters = cat.chapters.map(chap => {
            if (chap.id === chapId) {
              return {
                ...chap,
                divisions: [...(chap.divisions || []), {
                  id: Math.random().toString(36).substring(2, 9),
                  name: newDivName
                }]
              };
            }
            return chap;
          });
          return { ...cat, chapters: updatedChapters };
        }
        return cat;
      });

      await updateDoc(doc(db, 'data_themes', themeId), {
        categories: updatedCategories
      });
      setNewDivName('');
      await fetchThemes();
      sendAdminNotification('تم إضافة التقسيمة بنجاح', 'zap');
    } catch (err) {
      sendAdminNotification('فشل إضافة التقسيمة', 'error');
    }
  };

  const handleDeleteItem = async (themeId: string, catId?: string, chapId?: string, divId?: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      if (!catId) {
        await deleteDoc(doc(db, 'data_themes', themeId));
      } else {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;

        let updatedCategories = [...theme.categories];

        if (divId && chapId) {
          updatedCategories = updatedCategories.map(cat => {
            if (cat.id === catId) {
              const updatedChapters = cat.chapters.map(chap => {
                if (chap.id === chapId) {
                  return { ...chap, divisions: chap.divisions.filter(d => d.id !== divId) };
                }
                return chap;
              });
              return { ...cat, chapters: updatedChapters };
            }
            return cat;
          });
        } else if (chapId) {
          updatedCategories = updatedCategories.map(cat => {
            if (cat.id === catId) {
              return { ...cat, chapters: cat.chapters.filter(c => c.id !== chapId) };
            }
            return cat;
          });
        } else {
          updatedCategories = updatedCategories.filter(c => c.id !== catId);
        }

        await updateDoc(doc(db, 'data_themes', themeId), { categories: updatedCategories });
      }
      await fetchThemes();
      sendAdminNotification('تم الحذف بنجاح', 'zap');
    } catch (err) {
      sendAdminNotification('فشل الحذف', 'error');
    }
  };

  return (
    <div className="p-4 md:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-primary/5 p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] border-2 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 rounded-full" />
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">إدارة تيمات الداتا (Data Themes)</h2>
          <p className="text-muted-foreground font-bold opacity-60">قسم الداتا المجانية والتقسيمات المرنة - 4 مستويات</p>
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
        <div className="grid lg:grid-cols-[350px,1fr] gap-10">
          {/* Themes List (Level 1) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> التيمات المتاحة
            </h3>
            <div className="space-y-3">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => { setActiveTheme(theme.id); setActiveCategory(null); setActiveChapter(null); }}
                  className={cn(
                    "w-full p-5 rounded-[2rem] border-2 text-right transition-all flex items-center justify-between group",
                    activeTheme === theme.id 
                      ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                      : "bg-card border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(theme.id); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className={cn("w-5 h-5 transition-transform", activeTheme === theme.id ? "rotate-180" : "")} />
                  </div>
                  <span className="text-lg font-black truncate">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Management Panel */}
          <div className="bg-card/40 backdrop-blur-xl border-2 border-border rounded-[3rem] md:rounded-[4rem] p-6 md:p-10 min-h-[700px] overflow-hidden">
            {!activeTheme ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                <Sparkles className="w-20 h-20" />
                <p className="text-2xl font-black">اختر تيمة للبدء في تنظيم تقسيماتها</p>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                {/* Level 2: Categories */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
                    <div>
                      <h4 className="text-2xl font-black flex items-center gap-3">
                        <Folder className="w-6 h-6 text-primary" /> التصنيفات (Categories)
                      </h4>
                      <p className="text-xs font-bold text-muted-foreground mt-1">مثل: أسئلة السنين السابقة، كتاب القسم</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <input 
                        type="text" 
                        placeholder="إضافة تصنيف..." 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-secondary/50 border-2 border-border rounded-xl font-bold text-sm"
                      />
                      <button onClick={() => handleAddCategory(activeTheme)} className="p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Plus className="w-5 h-5" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {themes.find(t => t.id === activeTheme)?.categories.map(cat => (
                      <div 
                        key={cat.id}
                        className={cn(
                          "p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer relative group",
                          activeCategory === cat.id ? "bg-primary/5 border-primary shadow-md" : "bg-secondary/10 border-border hover:border-primary/20"
                        )}
                        onClick={() => { setActiveCategory(cat.id); setActiveChapter(null); }}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, cat.id); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-black">{cat.name}</span>
                            <div className="p-2 bg-white rounded-xl border border-border shadow-sm">
                              <Hash className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                        </div>

                        {/* Level 3: Chapters List within Category */}
                        {activeCategory === cat.id && (
                          <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                            <div className="pt-4 border-t border-primary/10 space-y-4">
                              <div className="flex items-center justify-between text-xs font-black uppercase text-primary tracking-widest">
                                <span>الشباتر (Chapters)</span>
                                <Plus className="w-3 h-3" />
                              </div>
                              
                              <div className="space-y-2">
                                {cat.chapters.map(chap => (
                                  <div 
                                    key={chap.id}
                                    onClick={(e) => { e.stopPropagation(); setActiveChapter(chap.id); }}
                                    className={cn(
                                      "p-4 rounded-2xl border flex flex-col gap-3 transition-all",
                                      activeChapter === chap.id ? "bg-white border-primary shadow-sm" : "bg-white/50 border-border"
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, cat.id, chap.id); }} className="p-1 hover:text-rose-500 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="font-bold text-sm">{chap.name}</span>
                                    </div>

                                    {/* Level 4: Divisions (Questions) within Chapter */}
                                    {activeChapter === chap.id && (
                                      <div className="pt-3 border-t border-dashed border-border space-y-3 animate-in zoom-in-95 duration-200">
                                        <div className="flex flex-wrap gap-2 flex-row-reverse">
                                          {chap.divisions?.map(div => (
                                            <span key={div.id} className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-500/20">
                                              {div.name}
                                              <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, cat.id, chap.id, div.id); }}>
                                                <X className="w-2.5 h-2.5" />
                                              </button>
                                            </span>
                                          ))}
                                        </div>
                                        <div className="flex gap-2">
                                           <input 
                                            type="text" 
                                            placeholder="تقسيمة أصغر (الأسئلة)..." 
                                            value={newDivName}
                                            onChange={(e) => setNewDivName(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-secondary/30 rounded-lg text-[10px] font-bold outline-none focus:ring-1 ring-primary"
                                          />
                                          <button onClick={(e) => { e.stopPropagation(); handleAddDivision(activeTheme, cat.id, chap.id); }} className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm"><Plus className="w-3.5 h-3.5" /></button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-2 pt-2">
                                <input 
                                  type="text" 
                                  placeholder="شابتر جديد..." 
                                  value={newChapName}
                                  onChange={(e) => setNewChapName(e.target.value)}
                                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-border text-xs font-bold outline-none focus:border-primary"
                                />
                                <button onClick={(e) => { e.stopPropagation(); handleAddChapter(activeTheme, cat.id); }} className="p-2 bg-primary text-white rounded-xl shadow-md"><Save className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        )}
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
