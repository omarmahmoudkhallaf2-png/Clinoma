import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ChevronRight, Folder, 
  Layers, Hash, Save, X, Sparkles, Database, 
  FileStack, ChevronDown
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

  const [newThemeName, setNewThemeName] = useState('');
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

  const handleAddTheme = async () => {
    if (!newThemeName.trim()) return;
    try {
      await addDoc(collection(db, 'data_themes'), { name: newThemeName, categories: [], createdAt: new Date() });
      setNewThemeName('');
      await fetchThemes();
      sendAdminNotification('تم إضافة التيمة', 'zap');
    } catch (err) { sendAdminNotification('فشل الإضافة', 'error'); }
  };

  const handleAddCategory = async (themeId: string) => {
    if (!newCatName.trim()) return;
    try {
      const themeRef = doc(db, 'data_themes', themeId);
      const themeSnap = await getDoc(themeRef);
      if (!themeSnap.exists()) return;
      const currentCategories = themeSnap.data().categories || [];
      const newCat = { id: Math.random().toString(36).substring(2, 9), name: newCatName, chapters: [] };
      await updateDoc(themeRef, { categories: [...currentCategories, newCat] });
      setNewCatName('');
      await fetchThemes();
      sendAdminNotification('تم إضافة التصنيف', 'zap');
    } catch (err) { sendAdminNotification('فشل الإضافة', 'error'); }
  };

  const handleAddChapter = async (themeId: string, catId: string) => {
    if (!newChapName.trim()) return;
    try {
      const theme = themes.find(t => t.id === themeId);
      if (!theme) return;
      const updatedCategories = theme.categories.map(cat => {
        if (cat.id === catId) {
          return { ...cat, chapters: [...cat.chapters, { id: Math.random().toString(36).substring(2, 9), name: newChapName, divisions: [] }] };
        }
        return cat;
      });
      await updateDoc(doc(db, 'data_themes', themeId), { categories: updatedCategories });
      setNewChapName('');
      await fetchThemes();
      sendAdminNotification('تم إضافة الشابتر', 'zap');
    } catch (err) { sendAdminNotification('فشل الإضافة', 'error'); }
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
              return { ...chap, divisions: [...(chap.divisions || []), { id: Math.random().toString(36).substring(2, 9), name: newDivName }] };
            }
            return chap;
          });
          return { ...cat, chapters: updatedChapters };
        }
        return cat;
      });
      await updateDoc(doc(db, 'data_themes', themeId), { categories: updatedCategories });
      setNewDivName('');
      await fetchThemes();
      sendAdminNotification('تم إضافة التقسيمة', 'zap');
    } catch (err) { sendAdminNotification('فشل الإضافة', 'error'); }
  };

  const handleDeleteItem = async (themeId: string, catId?: string, chapId?: string, divId?: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      if (!catId) { await deleteDoc(doc(db, 'data_themes', themeId)); }
      else {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;
        let updatedCategories = [...theme.categories];
        if (divId && chapId) {
          updatedCategories = updatedCategories.map(cat => {
            if (cat.id === catId) {
              const updatedChapters = cat.chapters.map(chap => {
                if (chap.id === chapId) { return { ...chap, divisions: chap.divisions.filter(d => d.id !== divId) }; }
                return chap;
              });
              return { ...cat, chapters: updatedChapters };
            }
            return cat;
          });
        } else if (chapId) {
          updatedCategories = updatedCategories.map(cat => {
            if (cat.id === catId) { return { ...cat, chapters: cat.chapters.filter(c => c.id !== chapId) }; }
            return cat;
          });
        } else { updatedCategories = updatedCategories.filter(c => c.id !== catId); }
        await updateDoc(doc(db, 'data_themes', themeId), { categories: updatedCategories });
      }
      await fetchThemes();
      sendAdminNotification('تم الحذف', 'zap');
    } catch (err) { sendAdminNotification('فشل الحذف', 'error'); }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full overflow-hidden animate-in fade-in duration-500">
      {/* Header Compact */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-primary/5 p-6 rounded-[2rem] border border-primary/20 relative">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> إدارة تيمات الداتا</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Hierarchical Content System (4 Levels)</p>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <input 
            type="text" 
            placeholder="تيمة جديدة..." 
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            className="flex-1 lg:w-64 px-4 py-2 bg-card border border-border rounded-xl outline-none focus:border-primary text-sm font-bold"
          />
          <button onClick={handleAddTheme} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/10 hover:scale-105 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> إضافة
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-50">
           <Database className="w-10 h-10 animate-pulse text-primary" />
           <p className="font-black text-[10px] uppercase tracking-widest">Loading...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
          {/* Themes List - Level 1 */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2 flex items-center gap-2">
              <Layers className="w-3 h-3" /> التيمات
            </h3>
            <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-2">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => { setActiveTheme(theme.id); setActiveCategory(null); setActiveChapter(null); }}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between group",
                    activeTheme === theme.id 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                      : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(theme.id); }} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500 rounded-lg transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <ChevronRight className={cn("w-4 h-4 transition-transform", activeTheme === theme.id ? "rotate-180" : "")} />
                  </div>
                  <span className="text-sm font-black truncate">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="bg-card border border-border rounded-[2.5rem] p-6 min-h-[500px]">
            {!activeTheme ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-3">
                <Sparkles className="w-12 h-12" />
                <p className="text-lg font-black italic">اختر تيمة للبدء</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Level 2: Categories */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <h4 className="text-lg font-black flex items-center gap-2"><Folder className="w-5 h-5 text-primary" /> التصنيفات (Categories)</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="تصنيف جديد..." 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="px-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-xs font-bold w-40"
                      />
                      <button onClick={() => handleAddCategory(activeTheme)} className="p-1.5 bg-primary text-white rounded-lg"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themes.find(t => t.id === activeTheme)?.categories.map(cat => (
                      <div 
                        key={cat.id}
                        className={cn(
                          "p-4 rounded-3xl border transition-all cursor-pointer relative group",
                          activeCategory === cat.id ? "bg-primary/5 border-primary" : "bg-secondary/5 border-border hover:border-primary/20"
                        )}
                        onClick={() => { setActiveCategory(cat.id); setActiveChapter(null); }}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, cat.id); }} className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-black text-sm">{cat.name}</span>
                        </div>

                        {/* Level 3: Chapters */}
                        {activeCategory === cat.id && (
                          <div className="space-y-3 pt-3 border-t border-primary/10 animate-in slide-in-from-top-2">
                            <div className="space-y-2">
                              {cat.chapters.map(chap => (
                                <div 
                                  key={chap.id}
                                  onClick={(e) => { e.stopPropagation(); setActiveChapter(chap.id); }}
                                  className={cn(
                                    "p-3 rounded-xl border transition-all",
                                    activeChapter === chap.id ? "bg-white border-primary shadow-sm" : "bg-white/40 border-border"
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, cat.id, chap.id); }} className="p-1 hover:text-rose-500"><X className="w-3 h-3" /></button>
                                    <span className="font-bold text-[11px]">{chap.name}</span>
                                  </div>

                                  {/* Level 4: Divisions */}
                                  {activeChapter === chap.id && (
                                    <div className="mt-3 pt-2 border-t border-dashed border-border space-y-2 animate-in zoom-in-95">
                                      <div className="flex flex-wrap gap-1.5 flex-row-reverse">
                                        {chap.divisions?.map(div => (
                                          <span key={div.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md text-[9px] font-black border border-emerald-500/10">
                                            {div.name}
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(activeTheme, cat.id, chap.id, div.id); }}><X className="w-2 h-2" /></button>
                                          </span>
                                        ))}
                                      </div>
                                      <div className="flex gap-1.5">
                                         <input 
                                          type="text" 
                                          placeholder="الأسئلة..." 
                                          value={newDivName}
                                          onChange={(e) => setNewDivName(e.target.value)}
                                          className="flex-1 px-2 py-1 bg-secondary/30 rounded-md text-[9px] font-bold outline-none"
                                        />
                                        <button onClick={(e) => { e.stopPropagation(); handleAddDivision(activeTheme, cat.id, chap.id); }} className="p-1 bg-emerald-500 text-white rounded-md"><Plus className="w-3 h-3" /></button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-1.5 pt-1">
                              <input 
                                type="text" 
                                placeholder="شابتر جديد..." 
                                value={newChapName}
                                onChange={(e) => setNewChapName(e.target.value)}
                                className="flex-1 px-2 py-1 bg-white rounded-md border border-border text-[10px] font-bold"
                              />
                              <button onClick={(e) => { e.stopPropagation(); handleAddChapter(activeTheme, cat.id); }} className="p-1 bg-primary text-white rounded-md"><Save className="w-3 h-3" /></button>
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
