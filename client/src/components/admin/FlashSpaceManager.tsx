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
  Settings,
  X,
  CheckCircle2,
  Brain,
  Zap,
  Upload,
  Loader2
} from 'lucide-react';

interface Board {
  id: string;
  module: string;
  system: string;
  disease: string;
  medicalImage: string;
  explanation: string;
  createdAt: number;
}

const FlashSpaceManager = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    module: '',
    system: '',
    disease: '',
    medicalImage: '',
    explanation: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));
      setBoards(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board)));
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingBoard) {
      setForm({
        module: editingBoard.module,
        system: editingBoard.system,
        disease: editingBoard.disease,
        medicalImage: editingBoard.medicalImage,
        explanation: editingBoard.explanation
      });
    } else {
      setForm({
        module: '',
        system: '',
        disease: '',
        medicalImage: '',
        explanation: ''
      });
    }
  }, [editingBoard]);

  // Cloudinary Cloud Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const t = toast.loading('Uploading to CLINOMA Cloud (via Cloudinary)...');
    
    try {
      const cloudName = 'dptxq4yaa';
      const uploadPreset = 'med_prep_preset';
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', uploadPreset);
      formDataUpload.append('folder', 'flashspace_boards');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }

      const data = await response.json();
      setForm(prev => ({ ...prev, medicalImage: data.secure_url }));
      toast.success('Image uploaded successfully!', { id: t });
    } catch (err: any) {
      console.error(err);
      toast.error(`Upload failed: ${err.message}`, { id: t });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicalImage) {
      toast.error('Please upload a clinical image');
      return;
    }

    const t = toast.loading('Saving to CLINOMA...');
    try {
      if (editingBoard) {
        await updateDoc(doc(db, 'flashspace_boards', editingBoard.id), {
          ...form,
          updatedAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'flashspace_boards'), {
          ...form,
          createdAt: Date.now()
        });
      }
      toast.success('Board saved successfully', { id: t });
      setIsModalOpen(false);
      setEditingBoard(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save', { id: t });
    }
  };

  const deleteBoard = async (id: string) => {
    if (!window.confirm('Delete this interactive board?')) return;
    try {
      await deleteDoc(doc(db, 'flashspace_boards', id));
      toast.success('Deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filtered = boards.filter(b => 
    b.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-12 space-y-12 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-indigo-500/10 p-10 rounded-[4rem] border-2 border-indigo-500/20 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl">
            <Layout className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight">Flash Space Hub</h2>
            <p className="text-indigo-700 font-bold opacity-60 text-lg">Manage interactive hierarchy: Module → System → Topic.</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingBoard(null); setIsModalOpen(true); }}
          className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" /> Create New Board
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by module, system or disease..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-20 pr-8 py-7 rounded-[3rem] border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold text-lg shadow-sm"
          />
        </div>
        <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-6 flex items-center justify-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          <div className="text-center">
            <p className="text-3xl font-black text-slate-800">{boards.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Content Units</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(board => (
          <div key={board.id} className="group bg-white rounded-[3.5rem] border-2 border-slate-100 hover:border-indigo-500/40 transition-all p-8 shadow-sm flex flex-col">
            <div className="aspect-video rounded-[2.5rem] overflow-hidden mb-6 border-2 border-slate-50 relative">
              <img src={board.medicalImage} alt={board.disease} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">{board.module}</span>
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">{board.system}</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black mb-2 group-hover:text-indigo-600 transition-colors">{board.disease}</h3>
            <p className="text-slate-400 font-bold text-sm line-clamp-2 leading-relaxed mb-8">{board.explanation}</p>
            
            <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400">
                <Brain className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Active unit</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingBoard(board); setIsModalOpen(true); }}
                  className="p-3 bg-slate-50 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => deleteBoard(board.id)}
                  className="p-3 bg-slate-50 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white border-4 border-slate-100 rounded-[5rem] shadow-2xl overflow-hidden relative">
            <div className="p-16 space-y-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-600 text-white rounded-[2rem]">
                    <Plus className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">{editingBoard ? 'Modify Unit' : 'New Content Unit'}</h2>
                    <p className="text-slate-400 font-bold">Build interactive clinical hierarchy.</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-5 bg-slate-50 rounded-[2rem] hover:bg-rose-500 hover:text-white transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Module Name</label>
                    <input 
                      type="text" required placeholder="e.g. Pediatrics"
                      value={form.module} onChange={e => setForm({...form, module: e.target.value})}
                      className="w-full bg-slate-50 px-10 py-6 rounded-[2.5rem] border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold text-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">System / Organ</label>
                    <input 
                      type="text" required placeholder="e.g. Nephrology"
                      value={form.system} onChange={e => setForm({...form, system: e.target.value})}
                      className="w-full bg-slate-50 px-10 py-6 rounded-[2.5rem] border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold text-lg"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Topic / Disease Name</label>
                    <input 
                      type="text" required placeholder="e.g. Nephritic Syndrome"
                      value={form.disease} onChange={e => setForm({...form, disease: e.target.value})}
                      className="w-full bg-slate-50 px-10 py-6 rounded-[2.5rem] border-2 border-slate-100 outline-none focus:border-indigo-500 font-bold text-lg"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Clinical Image (Back Side)</label>
                    <div className="relative">
                      <input 
                        type="file" accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden" id="file-upload"
                      />
                      <label 
                        htmlFor="file-upload"
                        className={cn(
                          "w-full flex flex-col items-center justify-center p-12 rounded-[3rem] border-4 border-dashed cursor-pointer transition-all",
                          form.medicalImage ? "border-emerald-500 bg-emerald-50/50" : "border-slate-100 hover:border-indigo-500/50 bg-slate-50"
                        )}
                      >
                        {uploading ? (
                          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        ) : form.medicalImage ? (
                          <div className="text-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                            <p className="text-emerald-700 font-black">Image Loaded Successfully</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">Click to upload medical board image</p>
                            <p className="text-[10px] text-slate-400 mt-2">JPG, PNG or WEBP (Max 2MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Medical Explanation</label>
                    <textarea 
                      required rows={4} placeholder="Enter clinical details..."
                      value={form.explanation} onChange={e => setForm({...form, explanation: e.target.value})}
                      className="w-full bg-slate-50 px-10 py-8 rounded-[3rem] border-2 border-slate-100 outline-none focus:border-indigo-500 font-medium text-lg leading-relaxed"
                    />
                  </div>
                </div>
                <button 
                  type="submit" disabled={uploading}
                  className="w-full py-8 bg-indigo-600 text-white rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  Deploy Content Unit
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
