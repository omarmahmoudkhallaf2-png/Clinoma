import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ChevronRight, Folder, 
  Layers, Hash, Save, X, Sparkles, Database, 
  FileStack, Box
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  collection, query, getDocs, addDoc, 
  deleteDoc, doc, updateDoc, getDoc
} from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { sendAdminNotification } from './NotificationSystem';

export interface DataTheme {
  id: string;
  name: string;
  modules: {
    id: string;
    name: string;
    categories: {
      id: string;
      name: string;
      chapters: {
        id: string;
        name: string;
        divisions: { id: string; name: string; }[];
      }[];
    }[];
  }[];
  createdAt: any;
}

export default function DataThemeManager() {
  const [themes, setThemes] = useState<DataTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  const [newThemeName, setNewThemeName] = useState('');
  const [newModName, setNewModName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newChapName, setNewChapName] = useState('');
  const [newDivName, setNewDivName] = useState('');

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'data_themes')));
      setThemes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DataTheme)));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchThemes(); }, []);

  const handleUpdate = async (themeId: string, updatedModules: any) => {
    try {
      await updateDoc(doc(db, 'data_themes', themeId), { modules: updatedModules });
      await fetchThemes();
      sendAdminNotification('تم التحديث بنجاح', 'zap');
    } catch (err) { sendAdminNotification('فشل التحديث', 'error'); }
  };

  const handleAddTheme = async () => {
    if (!newThemeName.trim()) return;
    try {
      await addDoc(collection(db, 'data_themes'), { name: newThemeName, modules: [], createdAt: new Date() });
      setNewThemeName('');
      await fetchThemes();
      sendAdminNotification('تم إضافة التيمة', 'zap');
    } catch (err) { sendAdminNotification('فشل الإضافة', 'error'); }
  };

  const handleAddModule = async (themeId: string) => {
    if (!newModName.trim()) return;
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;
    const newMod = { id: Math.random().toString(36).substring(2, 9), name: newModName, categories: [] };
    await handleUpdate(themeId, [...(theme.modules || []), newMod]);
    setNewModName('');
  };

  const handleAddCategory = async (themeId: string, modId: string) => {
    if (!newCatName.trim()) return;
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;
    const updatedModules = theme.modules.map(mod => {
      if (mod.id === modId) {
        return { ...mod, categories: [...(mod.categories || []), { id: Math.random().toString(36).substring(2, 9), name: newCatName, chapters: [] }] };
      }
      return mod;
    });
    await handleUpdate(themeId, updatedModules);
    setNewCatName('');
  };

  const handleAddChapter = async (themeId: string, modId: string, catId: string) => {
    if (!newChapName.trim()) return;
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;
    const updatedModules = theme.modules.map(mod => {
      if (mod.id === modId) {
        const updatedCats = mod.categories.map(cat => {
          if (cat.id === catId) {
            return { ...cat, chapters: [...(cat.chapters || []), { id: Math.random().toString(36).substring(2, 9), name: newChapName, divisions: [] }] };
          }
          return cat;
        });
        return { ...mod, categories: updatedCats };
      }
      return mod;
    });
    await handleUpdate(themeId, updatedModules);
    setNewChapName('');
  };

  const handleAddDivision = async (themeId: string, modId: string, catId: string, chapId: string) => {
    if (!newDivName.trim()) return;
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;
    const updatedModules = theme.modules.map(mod => {
      if (mod.id === modId) {
        const updatedCats = mod.categories.map(cat => {
          if (cat.id === catId) {
            const updatedChaps = cat.chapters.map(chap => {
              if (chap.id === chapId) {
                return { ...chap, divisions: [...(chap.divisions || []), { id: Math.random().toString(36).substring(2, 9), name: newDivName }] };
              }
              return chap;
            });
            return { ...cat, chapters: updatedChaps };
          }
          return cat;
        });
        return { ...mod, categories: updatedCats };
      }
      return mod;
    });
    await handleUpdate(themeId, updatedModules);
    setNewDivName('');
  };

  const handleDeleteItem = async (themeId: string, modId?: string, catId?: string, chapId?: string, divId?: string) => {
    if (!confirm('هل أنت متأكد؟')) return;
    if (!modId) { await deleteDoc(doc(db, 'data_themes', themeId)); await fetchThemes(); return; }
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    let updatedModules = [...theme.modules];
    if (divId) {
      updatedModules = updatedModules.map(m => m.id === modId ? { ...m, categories: m.categories.map(c => c.id === catId ? { ...c, chapters: c.chapters.map(ch => ch.id === chapId ? { ...ch, divisions: ch.divisions.filter(d => d.id !== divId) } : ch) } : c) } : m);
    } else if (chapId) {
      updatedModules = updatedModules.map(m => m.id === modId ? { ...m, categories: m.categories.map(c => c.id === catId ? { ...c, chapters: c.chapters.filter(ch => ch.id !== chapId) } : c) } : m);
    } else if (catId) {
      updatedModules = updatedModules.map(m => m.id === modId ? { ...m, categories: m.categories.filter(c => c.id !== catId) } : m);
    } else {
      updatedModules = updatedModules.filter(m => m.id !== modId);
    }
    await handleUpdate(themeId, updatedModules);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-primary/5 p-6 rounded-[2rem] border border-primary/20 relative">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> إدارة تيمات الداتا</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">5-Level Hierarchy (Theme {'>'} Module {'>'} Cat {'>'} Chap {'>'} Div)</p>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <input type="text" placeholder="تيمة جديدة..." value={newThemeName} onChange={(e) => setNewThemeName(e.target.value)} className="flex-1 lg:w-64 px-4 py-2 bg-card border border-border rounded-xl outline-none focus:border-primary text-sm font-bold" />
          <button onClick={handleAddTheme} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/10 hover:scale-105 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> إضافة تيمة
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 opacity-50"><Database className="w-10 h-10 animate-pulse text-primary" /></div>
      ) : (
        <div className="grid lg:grid-cols-[250px,1fr] gap-6">
          {/* Level 1: Themes */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">التيمات</h3>
            <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-2">
              {themes.map(t => (
                <button key={t.id} onClick={() => { setActiveTheme(t.id); setActiveModule(null); setActiveCategory(null); setActiveChapter(null); }} className={cn("w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between group", activeTheme === t.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" : "bg-card border-border hover:border-primary/30")}>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(t.id); }} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-rose-500 rounded-lg"><Trash2 className="w-3 h-3" /></button>
                  <span className="text-sm font-black truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed View */}
          <div className="bg-card border border-border rounded-[2.5rem] p-6 min-h-[600px]">
            {!activeTheme ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-3"><Sparkles className="w-12 h-12" /><p className="text-lg font-black italic">اختر تيمة للبدء</p></div>
            ) : (
              <div className="space-y-8">
                {/* Level 2: Modules */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <h4 className="text-lg font-black flex items-center gap-2 text-primary"><Box className="w-5 h-5" /> المديولات (Modules)</h4>
                    <div className="flex gap-2">
                      <input type="text" placeholder="مديول جديد..." value={newModName} onChange={(e) => setNewModName(e.target.value)} className="px-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-xs font-bold w-40" />
                      <button onClick={() => handleAddModule(activeTheme)} className="p-1.5 bg-primary text-white rounded-lg hover:scale-105 active:scale-95 transition-all"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.find(t => t.id === activeTheme)?.modules?.map(mod => (
                      <div key={mod.id} onClick={() => { setActiveModule(mod.id); setActiveCategory(null); setActiveChapter(null); }} className={cn("p-4 rounded-3xl border transition-all cursor-pointer group relative", activeModule === mod.id ? "bg-primary/5 border-primary" : "bg-secondary/5 border-border hover:border-primary/20")}>
                        <div className="flex justify-between items-center mb-4">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, mod.id); }} className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          <span className="font-black text-sm">{mod.name}</span>
                        </div>

                        {/* Level 3: Categories within Module */}
                        {activeModule === mod.id && (
                          <div className="pt-4 border-t border-primary/10 space-y-4 animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">التصنيفات (Categories)</span>
                              <div className="flex gap-1.5">
                                <input type="text" placeholder="تصنيف..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-24 px-2 py-1 bg-white border border-border rounded-lg text-[10px] font-bold" />
                                <button onClick={(e) => { e.stopPropagation(); handleAddCategory(activeTheme, mod.id); }} className="p-1 bg-primary text-white rounded-lg"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {mod.categories?.map(cat => (
                                <div key={cat.id} onClick={(e) => { e.stopPropagation(); setActiveCategory(cat.id); setActiveChapter(null); }} className={cn("p-3 rounded-2xl border transition-all", activeCategory === cat.id ? "bg-white border-primary shadow-sm" : "bg-white/40 border-border")}>
                                  <div className="flex justify-between items-center">
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, mod.id, cat.id); }} className="p-1 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
                                    <span className="font-bold text-xs">{cat.name}</span>
                                  </div>

                                  {/* Level 4: Chapters within Category */}
                                  {activeCategory === cat.id && (
                                    <div className="mt-3 pt-3 border-t border-dashed border-border space-y-3 animate-in slide-in-from-top-1">
                                      <div className="flex justify-between items-center text-[9px] font-bold opacity-40"><span>الشباتر (Chapters)</span></div>
                                      {cat.chapters?.map(chap => (
                                        <div key={chap.id} onClick={(e) => { e.stopPropagation(); setActiveChapter(chap.id); }} className={cn("p-2 rounded-xl border flex flex-col gap-2", activeChapter === chap.id ? "bg-secondary/50 border-primary/40 shadow-sm" : "bg-secondary/20 border-border")}>
                                          <div className="flex justify-between items-center">
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, mod.id, cat.id, chap.id); }} className="p-1 hover:text-rose-500"><X className="w-2.5 h-2.5" /></button>
                                            <span className="font-bold text-[10px]">{chap.name}</span>
                                          </div>
                                          
                                          {/* Level 5: Divisions (Questions) */}
                                          {activeChapter === chap.id && (
                                            <div className="pt-2 border-t border-white/50 space-y-2">
                                              <div className="flex flex-wrap gap-1.5 flex-row-reverse">
                                                {chap.divisions?.map(div => (
                                                  <span key={div.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md text-[8px] font-black border border-emerald-500/10">
                                                    {div.name}
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, mod.id, cat.id, chap.id, div.id); }}><X className="w-2 h-2" /></button>
                                                  </span>
                                                ))}
                                              </div>
                                              <div className="flex gap-1.5">
                                                <input type="text" placeholder="الأسئلة..." value={newDivName} onChange={(e) => setNewDivName(e.target.value)} className="flex-1 px-2 py-1 bg-white/80 rounded-md text-[8px] font-bold" />
                                                <button onClick={(e) => { e.stopPropagation(); handleAddDivision(activeTheme, mod.id, cat.id, chap.id); }} className="p-1 bg-emerald-500 text-white rounded-md"><Plus className="w-3 h-3" /></button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      <div className="flex gap-1.5">
                                        <input type="text" placeholder="شابتر..." value={newChapName} onChange={(e) => setNewChapName(e.target.value)} className="flex-1 px-2 py-1 bg-white border border-border rounded-md text-[9px] font-bold" />
                                        <button onClick={(e) => { e.stopPropagation(); handleAddChapter(activeTheme, mod.id, cat.id); }} className="p-1 bg-primary text-white rounded-md"><Plus className="w-3 h-3" /></button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
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
