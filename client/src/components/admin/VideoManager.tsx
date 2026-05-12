import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, deleteDoc, doc, setDoc, orderBy, where, writeBatch } from 'firebase/firestore';
import { 
  Plus, Trash2, Edit2, ChevronRight, Video, Folder, 
  GripVertical, Save, X, ExternalLink, Play, ChevronLeft, Home, MoreVertical
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface VideoFolder {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  order: number;
}

interface VideoItem {
  id: string;
  folderId: string;
  title: string;
  youtubeUrl: string;
  description: string;
  order: number;
}

export default function VideoManager() {
  const [allFolders, setAllFolders] = useState<VideoFolder[]>([]);
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Form States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<VideoFolder | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);

  const [folderForm, setFolderForm] = useState({ name: '', description: '', order: 0, parentId: null as string | null });
  const [videoForm, setVideoForm] = useState({ title: '', youtubeUrl: '', description: '', order: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fSnap, vSnap] = await Promise.all([
        getDocs(query(collection(db, 'video_folders'), orderBy('order', 'asc'))),
        getDocs(query(collection(db, 'videos'), orderBy('order', 'asc')))
      ]);
      setAllFolders(fSnap.docs.map(d => ({ id: d.id, ...d.data() } as VideoFolder)));
      setAllVideos(vSnap.docs.map(d => ({ id: d.id, ...d.data() } as VideoItem)));
    } catch (err) {
      toast.error('Failed to fetch video data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFolder = async () => {
    try {
      const data = { ...folderForm, parentId: currentFolderId };
      if (editingFolder) {
        await setDoc(doc(db, 'video_folders', editingFolder.id), data);
        toast.success('Folder updated');
      } else {
        await addDoc(collection(db, 'video_folders'), { ...data, createdAt: new Date() });
        toast.success('Folder created');
      }
      setIsFolderModalOpen(false);
      setEditingFolder(null);
      setFolderForm({ name: '', description: '', order: 0, parentId: null });
      fetchData();
    } catch (err) {
      toast.error('Error saving folder');
    }
  };

  const handleSaveVideo = async () => {
    if (!currentFolderId) return;
    try {
      if (editingVideo) {
        await setDoc(doc(db, 'videos', editingVideo.id), { ...videoForm, folderId: currentFolderId });
        toast.success('Video updated');
      } else {
        await addDoc(collection(db, 'videos'), { ...videoForm, folderId: currentFolderId, createdAt: new Date() });
        toast.success('Video added');
      }
      setIsVideoModalOpen(false);
      setEditingVideo(null);
      setVideoForm({ title: '', youtubeUrl: '', description: '', order: 0 });
      fetchData();
    } catch (err) {
      toast.error('Error saving video');
    }
  };

  const handleDeleteFolder = async (folder: VideoFolder) => {
    if (!window.confirm(`Delete "${folder.name}" and all its contents? This will delete all subfolders and videos.`)) return;
    
    const deleteRecursive = async (fid: string) => {
      // Find subfolders
      const subs = allFolders.filter(f => f.parentId === fid);
      for (const s of subs) {
        await deleteRecursive(s.id);
      }
      // Delete videos
      const folderVideos = allVideos.filter(v => v.folderId === fid);
      const batch = writeBatch(db);
      folderVideos.forEach(v => batch.delete(doc(db, 'videos', v.id)));
      await batch.commit();
      // Delete folder
      await deleteDoc(doc(db, 'video_folders', fid));
    };

    try {
      await deleteRecursive(folder.id);
      toast.success('Folder and all contents deleted');
      fetchData();
    } catch (err) {
      toast.error('Error deleting folder');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await deleteDoc(doc(db, 'videos', id));
      toast.success('Video deleted');
      fetchData();
    } catch (err) {
      toast.error('Error deleting video');
    }
  };

  const currentFolders = allFolders.filter(f => f.parentId === currentFolderId);
  const currentVideos = allVideos.filter(v => v.folderId === currentFolderId);
  const currentFolder = allFolders.find(f => f.id === currentFolderId);

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    const crumbs = [];
    let curr = currentFolder;
    while (curr) {
      crumbs.unshift(curr);
      curr = allFolders.find(f => f.id === curr?.parentId);
    }
    return crumbs;
  };

  return (
    <div className="p-12 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center bg-primary/5 p-10 rounded-[4rem] border-2 border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="flex items-center gap-6 relative">
          <div className="w-16 h-16 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-xl">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter">Nested Video Library</h2>
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-1 opacity-60">Infinite depth folder structure</p>
          </div>
        </div>
        <div className="flex gap-4 relative">
          <Button 
            onClick={() => { setEditingFolder(null); setFolderForm({ name: '', description: '', order: currentFolders.length, parentId: currentFolderId }); setIsFolderModalOpen(true); }}
            variant="outline"
            className="px-8 py-5 rounded-3xl font-black border-2"
          >
            <Plus className="w-5 h-5 mr-2" /> New Subfolder
          </Button>
          {currentFolderId && (
            <Button 
              onClick={() => { setEditingVideo(null); setVideoForm({ title: '', youtubeUrl: '', description: '', order: currentVideos.length }); setIsVideoModalOpen(true); }}
              className="px-8 py-5 rounded-3xl font-black shadow-lg shadow-primary/20"
            >
              <Video className="w-5 h-5 mr-2" /> Add Video Here
            </Button>
          )}
        </div>
      </div>

      {/* Explorer Style Breadcrumbs */}
      <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-[2rem] border border-slate-200">
        <button 
          onClick={() => setCurrentFolderId(null)} 
          className={cn("p-3 rounded-xl transition-all", !currentFolderId ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600")}
        >
          <Home className="w-5 h-5" />
        </button>
        {getBreadcrumbs().map((crumb, i) => (
          <div key={crumb.id} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <button 
              onClick={() => setCurrentFolderId(crumb.id)}
              className={cn(
                "px-4 py-2 rounded-xl font-black text-sm transition-all",
                currentFolderId === crumb.id ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Render Subfolders */}
        {currentFolders.map(folder => (
          <Card 
            key={folder.id} 
            className="group cursor-pointer rounded-[2.5rem] border-2 border-transparent hover:border-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden relative"
            onClick={() => setCurrentFolderId(folder.id)}
          >
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Folder className="w-7 h-7 fill-current" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setFolderForm(folder); setIsFolderModalOpen(true); }} className="p-2 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h4 className="text-xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{folder.name}</h4>
              <p className="text-sm text-muted-foreground font-medium line-clamp-1">{folder.description || 'No description'}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  {allFolders.filter(f => f.parentId === folder.id).length} Subfolders
                </span>
                <span className="text-[10px] font-black uppercase text-slate-400">
                  {allVideos.filter(v => v.folderId === folder.id).length} Videos
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Render Videos */}
        {currentVideos.map(video => (
          <Card key={video.id} className="rounded-[2.5rem] border-2 border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
            <div className="aspect-video bg-slate-900 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
              <img 
                src={`https://img.youtube.com/vi/${video.youtubeUrl.split('v=')[1]?.split('&')[0] || video.youtubeUrl.split('/').pop()?.split('?')[0]}/maxresdefault.jpg`} 
                alt="" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-black leading-tight text-lg">{video.title}</h4>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingVideo(video); setVideoForm(video); setIsVideoModalOpen(true); }} className="p-2 bg-slate-50 rounded-xl hover:text-primary transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteVideo(video.id)} className="p-2 bg-slate-50 rounded-xl hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium line-clamp-2">{video.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!currentFolders.length && !currentVideos.length) && (
        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200">
          <Folder className="w-20 h-20 text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm text-center">
            This folder is empty.<br/>Add subfolders or videos to get started.
          </p>
        </div>
      )}

      {/* Modals remain same but updated for context */}
      {/* Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <div className="w-full max-w-lg bg-white rounded-[4rem] p-12 shadow-3xl space-y-8">
            <h3 className="text-3xl font-black tracking-tight">{editingFolder ? 'Edit Folder' : 'Create Subfolder'}</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
                <input 
                  value={folderForm.name} 
                  onChange={e => setFolderForm({...folderForm, name: e.target.value})}
                  className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-primary outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea 
                  value={folderForm.description} 
                  onChange={e => setFolderForm({...folderForm, description: e.target.value})}
                  className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-primary outline-none font-bold h-32"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setIsFolderModalOpen(false)} className="flex-1 rounded-2xl">Cancel</Button>
              <Button onClick={handleSaveFolder} className="flex-1 rounded-2xl">Save Folder</Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <div className="w-full max-w-2xl bg-white rounded-[4rem] p-12 shadow-3xl space-y-8">
            <h3 className="text-3xl font-black tracking-tight">{editingVideo ? 'Edit Video' : 'Add Video'}</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                  <input 
                    value={videoForm.title} 
                    onChange={e => setVideoForm({...videoForm, title: e.target.value})}
                    className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-primary outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Order</label>
                  <input 
                    type="number"
                    value={videoForm.order} 
                    onChange={e => setVideoForm({...videoForm, order: parseInt(e.target.value)})}
                    className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-primary outline-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">YouTube URL</label>
                <input 
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoForm.youtubeUrl} 
                  onChange={e => setVideoForm({...videoForm, youtubeUrl: e.target.value})}
                  className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-primary outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea 
                  value={videoForm.description} 
                  onChange={e => setVideoForm({...videoForm, description: e.target.value})}
                  className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-primary outline-none font-bold h-32"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setIsVideoModalOpen(false)} className="flex-1 rounded-2xl">Cancel</Button>
              <Button onClick={handleSaveVideo} className="flex-1 rounded-2xl">Save Video</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
