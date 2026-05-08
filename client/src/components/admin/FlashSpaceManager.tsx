import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layout, 
  Image as ImageIcon, 
  Type, 
  Baby, 
  Eye,
  Settings,
  MoreVertical,
  X,
  CheckCircle2,
  Heart,
  Brain,
  Zap,
  Activity,
  Shield
} from 'lucide-react';

interface Board {
  id: string;
  categoryId: string;
  disease: string;
  medicalImage: string;
  explanation: string;
  createdAt: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Baby': return Baby;
    case 'Eye': return Eye;
    case 'Heart': return Heart;
    case 'Brain': return Brain;
    case 'Zap': return Zap;
    case 'Activity': return Activity;
    case 'Shield': return Shield;
    case 'Settings': return Settings;
    default: return Layout;
  }
};

const FlashSpaceManager = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'boards' | 'categories'>('boards');
  
  // Modals
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  
  // Editing states
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Board Form State
  const [boardForm, setBoardForm] = useState({
    disease: '',
    categoryId: '',
    medicalImage: '',
    explanation: ''
  });

  // Category Form State
  const [catForm, setCatForm] = useState({
    name: '',
    icon: 'Layout',
    color: 'text-primary bg-primary/10'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catSnap, boardsSnap] = await Promise.all([
        getDocs(query(collection(db, 'flashspace_categories'), orderBy('name', 'asc'))),
        getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')))
      ]);
      
      const fetchedCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(fetchedCats);

      const fetchedBoards = boardsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
      setBoards(fetchedBoards);
      
      if (!boardForm.categoryId && fetchedCats.length > 0) {
        setBoardForm(prev => ({ ...prev, categoryId: fetchedCats[0].id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch Flash Space data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync board form when editing
  useEffect(() => {
    if (editingBoard) {
      setBoardForm({
        disease: editingBoard.disease,
        categoryId: editingBoard.categoryId,
        medicalImage: editingBoard.medicalImage,
        explanation: editingBoard.explanation
      });
    } else {
      setBoardForm({
        disease: '',
        categoryId: categories[0]?.id || '',
        medicalImage: '',
        explanation: ''
      });
    }
  }, [editingBoard, categories]);

  // Sync category form when editing
  useEffect(() => {
    if (editingCat) {
      setCatForm({
        name: editingCat.name,
        icon: editingCat.icon,
        color: editingCat.color
      });
    } else {
      setCatForm({
        name: '',
        icon: 'Layout',
        color: 'text-primary bg-primary/10'
      });
    }
  }, [editingCat]);

  const handleBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving board...');
    try {
      if (editingBoard) {
        await updateDoc(doc(db, 'flashspace_boards', editingBoard.id), {
          ...boardForm,
          updatedAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'flashspace_boards'), {
          ...boardForm,
          createdAt: Date.now()
        });
      }
      toast.success('Board saved successfully', { id: loadingToast });
      setIsBoardModalOpen(false);
      setEditingBoard(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save board', { id: loadingToast });
    }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving category...');
    try {
      if (editingCat) {
        await updateDoc(doc(db, 'flashspace_categories', editingCat.id), catForm);
      } else {
        await addDoc(collection(db, 'flashspace_categories'), catForm);
      }
      toast.success('Category saved successfully', { id: loadingToast });
      setIsCatModalOpen(false);
      setEditingCat(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save category', { id: loadingToast });
    }
  };

  const handleDeleteBoard = async (id: string) => {
    if (!window.confirm('Delete this study board?')) return;
    try {
      await deleteDoc(doc(db, 'flashspace_boards', id));
      toast.success('Board deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleDeleteCat = async (id: string) => {
    const boardCount = boards.filter(b => b.categoryId === id).length;
    if (boardCount > 0) {
      if (!window.confirm(`Warning: This category has ${boardCount} boards. Deleting the category will NOT delete the boards but they will become unassigned. Continue?`)) return;
    } else {
      if (!window.confirm('Delete this category?')) return;
    }
    
    try {
      await deleteDoc(doc(db, 'flashspace_categories', id));
      toast.success('Category deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredBoards = boards.filter(b => 
    b.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const iconsList = ['Baby', 'Eye', 'Heart', 'Brain', 'Zap', 'Activity', 'Shield', 'Layout', 'Settings'];
  const colorsList = [
    { label: 'Blue', value: 'text-blue-500 bg-blue-500/10' },
    { label: 'Emerald', value: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Indigo', value: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Rose', value: 'text-rose-500 bg-rose-500/10' },
    { label: 'Amber', value: 'text-amber-500 bg-amber-500/10' },
    { label: 'Purple', value: 'text-purple-500 bg-purple-500/10' }
  ];


  return (
    <div className="p-12 space-y-12 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-indigo-500/10 p-10 rounded-[4rem] border-2 border-indigo-500/20 gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Flash Space Management</h2>
          <p className="text-indigo-700 font-bold opacity-60 text-lg">Create and manage interactive medical study boards and categories.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setEditingCat(null); setIsCatModalOpen(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all text-sm"
          >
            <Plus className="w-5 h-5" /> New Category
          </button>
          <button 
            onClick={() => { setEditingBoard(null); setIsBoardModalOpen(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all text-sm"
          >
            <Plus className="w-5 h-5" /> New Board
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-muted p-2 rounded-[2rem] w-fit border-2 border-border">
        <button 
          onClick={() => setActiveView('boards')}
          className={cn(
            "px-10 py-3 rounded-2xl font-black text-sm transition-all",
            activeView === 'boards' ? "bg-card text-primary shadow-lg" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Study Boards ({boards.length})
        </button>
        <button 
          onClick={() => setActiveView('categories')}
          className={cn(
            "px-10 py-3 rounded-2xl font-black text-sm transition-all",
            activeView === 'categories' ? "bg-card text-primary shadow-lg" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Categories ({categories.length})
        </button>
      </div>

      {activeView === 'boards' ? (
        <div className="space-y-12">
          {/* Stats & Search */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search boards by disease name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card pl-16 pr-6 py-6 rounded-[2.5rem] border-2 border-border outline-none focus:border-indigo-500 font-bold text-lg shadow-sm"
              />
            </div>
            <div className="flex items-center justify-center bg-card border-2 border-border rounded-[2.5rem] p-6 shadow-sm">
              <div className="text-center">
                <p className="text-4xl font-black text-indigo-600">{boards.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Total Active Boards</p>
              </div>
            </div>
          </div>

          {/* Boards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBoards.map(board => (
              <div key={board.id} className="group p-8 bg-card rounded-[3rem] border-2 border-border hover:border-indigo-500/40 transition-all shadow-sm flex flex-col relative overflow-hidden">
                <div className="aspect-video rounded-2xl overflow-hidden mb-6 border-2 border-border/50 relative">
                  <img src={board.medicalImage} alt={board.disease} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                      {categories.find(c => c.id === board.categoryId)?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black group-hover:text-indigo-600 transition-colors mb-2">{board.disease}</h3>
                <p className="text-muted-foreground font-bold text-sm mb-8 line-clamp-2 leading-relaxed">{board.explanation}</p>
                
                <div className="mt-auto flex justify-between items-center pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Layout className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Workspace</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingBoard(board); setIsBoardModalOpen(true); }}
                      className="p-3 bg-secondary/50 rounded-xl border border-border hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBoard(board.id)}
                      className="p-3 bg-secondary/50 rounded-xl border border-border hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => {
            const Icon = getIcon(cat.icon);
            return (
              <div key={cat.id} className="p-8 bg-card border-2 border-border rounded-[3rem] hover:border-emerald-500/40 transition-all group flex flex-col items-center text-center">
                <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4 transition-transform group-hover:scale-110", cat.color)}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-1">{cat.name}</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
                  {boards.filter(b => b.categoryId === cat.id).length} Boards
                </p>
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => { setEditingCat(cat); setIsCatModalOpen(true); }}
                    className="p-3 bg-secondary/50 rounded-xl border border-border hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCat(cat.id)}
                    className="p-3 bg-secondary/50 rounded-xl border border-border hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Board Modal */}
      {isBoardModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-card border-4 border-border rounded-[4rem] shadow-2xl overflow-hidden relative">
            <div className="p-12 space-y-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-600 text-white rounded-[2rem] shadow-xl">
                    <Layout className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">{editingBoard ? 'Edit Board' : 'New Board'}</h2>
                    <p className="text-muted-foreground font-bold">Configure study board details.</p>
                  </div>
                </div>
                <button onClick={() => setIsBoardModalOpen(false)} className="p-4 bg-secondary/50 rounded-[1.5rem] hover:bg-rose-500 hover:text-white transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleBoardSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Disease Name</label>
                    <input 
                      type="text" required
                      value={boardForm.disease}
                      onChange={e => setBoardForm({...boardForm, disease: e.target.value})}
                      className="w-full bg-secondary/30 px-8 py-5 rounded-[2rem] border-2 border-border outline-none focus:border-indigo-500 font-bold text-lg"
                      placeholder="Condition name..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Category</label>
                    <select 
                      required
                      value={boardForm.categoryId}
                      onChange={e => setBoardForm({...boardForm, categoryId: e.target.value})}
                      className="w-full bg-secondary/30 px-8 py-5 rounded-[2rem] border-2 border-border outline-none focus:border-indigo-500 font-black text-lg cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Medical Image URL</label>
                    <input 
                      type="url" required
                      value={boardForm.medicalImage}
                      onChange={e => setBoardForm({...boardForm, medicalImage: e.target.value})}
                      className="w-full bg-secondary/30 px-8 py-5 rounded-[2rem] border-2 border-border outline-none focus:border-indigo-500 font-bold text-lg"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Explanation</label>
                    <textarea 
                      required rows={4}
                      value={boardForm.explanation}
                      onChange={e => setBoardForm({...boardForm, explanation: e.target.value})}
                      className="w-full bg-secondary/30 px-8 py-6 rounded-[2.5rem] border-2 border-border outline-none focus:border-indigo-500 font-medium text-lg leading-relaxed"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  Save Board
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-card border-4 border-border rounded-[4rem] shadow-2xl overflow-hidden relative">
            <div className="p-12 space-y-10">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black tracking-tight">{editingCat ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={() => setIsCatModalOpen(false)} className="p-4 bg-secondary/50 rounded-[1.5rem] hover:bg-rose-500 hover:text-white transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleCatSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Category Name</label>
                  <input 
                    type="text" required
                    value={catForm.name}
                    onChange={e => setCatForm({...catForm, name: e.target.value})}
                    className="w-full bg-secondary/30 px-8 py-5 rounded-[2rem] border-2 border-border outline-none focus:border-emerald-500 font-bold text-lg"
                    placeholder="e.g. Pediatrics"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Icon</label>
                    <select 
                      value={catForm.icon}
                      onChange={e => setCatForm({...catForm, icon: e.target.value})}
                      className="w-full bg-secondary/30 px-8 py-5 rounded-[2rem] border-2 border-border font-black text-lg cursor-pointer"
                    >
                      {iconsList.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Style Color</label>
                    <select 
                      value={catForm.color}
                      onChange={e => setCatForm({...catForm, color: e.target.value})}
                      className="w-full bg-secondary/30 px-8 py-5 rounded-[2rem] border-2 border-border font-black text-lg cursor-pointer"
                    >
                      {colorsList.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  Save Category
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSpaceManager;
