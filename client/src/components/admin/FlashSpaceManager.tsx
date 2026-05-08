import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
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
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

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

const FlashSpaceManager = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    disease: '',
    categoryId: '',
    medicalImage: '',
    explanation: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const catSnap = await getDocs(query(collection(db, 'flashspace_categories')));
      const fetchedCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(fetchedCats);

      const boardsSnap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));
      const fetchedBoards = boardsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
      setBoards(fetchedBoards);
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

  useEffect(() => {
    if (editingBoard) {
      setFormData({
        disease: editingBoard.disease,
        categoryId: editingBoard.categoryId,
        medicalImage: editingBoard.medicalImage,
        explanation: editingBoard.explanation
      });
    } else {
      setFormData({
        disease: '',
        categoryId: categories[0]?.id || '',
        medicalImage: '',
        explanation: ''
      });
    }
  }, [editingBoard, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving board...');
    try {
      if (editingBoard) {
        await updateDoc(doc(db, 'flashspace_boards', editingBoard.id), {
          ...formData,
          updatedAt: Date.now()
        });
        toast.success('Board updated successfully', { id: loadingToast });
      } else {
        await addDoc(collection(db, 'flashspace_boards'), {
          ...formData,
          createdAt: Date.now()
        });
        toast.success('Board created successfully', { id: loadingToast });
      }
      setIsModalOpen(false);
      setEditingBoard(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save board', { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this board?')) return;
    try {
      await deleteDoc(doc(db, 'flashspace_boards', id));
      toast.success('Board deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete board');
    }
  };

  const filteredBoards = boards.filter(b => 
    b.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-12 space-y-12 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-center bg-indigo-500/10 p-10 rounded-[4rem] border-2 border-indigo-500/20">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Flash Space Management</h2>
          <p className="text-indigo-700 font-bold opacity-60 text-lg">Create and manage interactive medical study boards.</p>
        </div>
        <button 
          onClick={() => { setEditingBoard(null); setIsModalOpen(true); }}
          className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" /> Create New Board
        </button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search boards by disease name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card pl-16 pr-6 py-6 rounded-[2.5rem] border-2 border-border outline-none focus:border-indigo-500 font-bold text-lg"
          />
        </div>
        <div className="flex items-center justify-center bg-card border-2 border-border rounded-[2.5rem] p-6">
          <div className="text-center">
            <p className="text-4xl font-black text-indigo-600">{boards.length}</p>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">Total Active Boards</p>
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
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                  {categories.find(c => c.id === board.categoryId)?.name || 'Category'}
                </span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black group-hover:text-indigo-600 transition-colors mb-2">{board.disease}</h3>
            <p className="text-muted-foreground font-bold text-sm mb-8 line-clamp-2 leading-relaxed">{board.explanation}</p>
            
            <div className="mt-auto flex justify-between items-center pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layout className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Active Board</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingBoard(board); setIsModalOpen(true); }}
                  className="p-3 bg-secondary/50 rounded-xl border border-border hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(board.id)}
                  className="p-3 bg-secondary/50 rounded-xl border border-border hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredBoards.length === 0 && !loading && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-secondary/10 rounded-[4rem] border-4 border-dashed border-border opacity-50">
            <Layout className="w-20 h-20 mb-4" />
            <p className="text-2xl font-black">No matching boards found</p>
            <p className="font-bold">Initialize your first interactive workspace above.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-card border-4 border-border rounded-[4rem] shadow-2xl overflow-hidden relative">
            <div className="p-12 space-y-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-600 text-white rounded-[2rem] shadow-xl">
                    <Layout className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">{editingBoard ? 'Edit Workspace' : 'Initialize Workspace'}</h2>
                    <p className="text-muted-foreground font-bold">Configure the core parameters for this interactive board.</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-secondary/50 rounded-[1.5rem] hover:bg-rose-500 hover:text-white transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2">Disease / Condition Name</label>
                    <div className="relative">
                      <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="text" 
                        required
                        value={formData.disease}
                        onChange={e => setFormData({...formData, disease: e.target.value})}
                        className="w-full bg-secondary/30 pl-14 pr-6 py-5 rounded-[2rem] border-2 border-border outline-none focus:border-indigo-500 font-bold text-lg"
                        placeholder="e.g. Tetralogy of Fallot"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2">Medical Category</label>
                    <select 
                      required
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full bg-secondary/30 px-8 py-5 rounded-[2rem] border-2 border-border outline-none focus:border-indigo-500 font-black text-lg appearance-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2">Medical Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="url" 
                        required
                        value={formData.medicalImage}
                        onChange={e => setFormData({...formData, medicalImage: e.target.value})}
                        className="w-full bg-secondary/30 pl-14 pr-6 py-5 rounded-[2rem] border-2 border-border outline-none focus:border-indigo-500 font-bold text-lg"
                        placeholder="https://..."
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground px-4 italic font-medium mt-2">Recommended: Direct link to high-res medical illustration or imaging.</p>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2">Clinical Explanation & Notes</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.explanation}
                      onChange={e => setFormData({...formData, explanation: e.target.value})}
                      className="w-full bg-secondary/30 px-8 py-6 rounded-[2.5rem] border-2 border-border outline-none focus:border-indigo-500 font-medium text-lg leading-relaxed"
                      placeholder="Enter detailed disease overview, symptoms, and diagnostic criteria..."
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    <CheckCircle2 className="w-8 h-8" /> {editingBoard ? 'Apply System Update' : 'Initialize Workspace Node'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSpaceManager;
