import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Loader2, FileText, BookOpen, ChevronLeft } from 'lucide-react';
import type { Note } from '../types/quiz';

export default function NoteViewer() {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const folder = location.state?.folder || 'f1_free';
  const lectureNumber = location.state?.lectureNumber || 1;
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setViewError(null);
      try {
        const q = query(
          collection(db, 'notes'),
          where('category', '==', category),
          where('folder', '==', folder),
          where('lectureNumber', '==', lectureNumber),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[];
        setNotes(data);
        if (data.length > 0) setSelectedNote(data[0]);
      } catch (error: any) {
        console.error(error);
        setViewError("Failed to load notes list. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [category, folder]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in">
      {/* Sidebar List */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-secondary hover:bg-primary hover:text-white rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold capitalize">{category} • L{lectureNumber}</h1>
        </div>
        
        <div className="space-y-2">
          {notes.length > 0 ? (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setViewError(null);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedNote?.id === note.id 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-card border-border hover:bg-secondary'
                }`}
              >
                <div className="font-bold line-clamp-1">{note.title}</div>
                <div className={`text-xs mt-1 ${selectedNote?.id === note.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                  Lecture {note.lectureNumber} • {note.createdAt?.seconds ? new Date(note.createdAt.seconds * 1000).toLocaleDateString() : 'New'}
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-border rounded-3xl text-muted-foreground">
              No notes available for Lecture {lectureNumber}.
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-card border border-border rounded-3xl shadow-sm min-h-[600px] overflow-hidden">
        {selectedNote ? (
          <div className="p-8 lg:p-12 space-y-8 animate-in slide-in-from-bottom-4">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg uppercase tracking-wider">
                {selectedNote.category} • Lecture {selectedNote.lectureNumber} • {selectedNote.folder.replace('_', ' ')}
              </div>
              <h2 className="text-4xl font-bold text-foreground">{selectedNote.title}</h2>
            </div>
            
            {selectedNote.fileUrl && (
              <div key={selectedNote.id + selectedNote.fileUrl} className="w-full bg-secondary/20 border-2 border-border rounded-[2.5rem] overflow-hidden shadow-inner">
                {(() => {
                  const url = selectedNote.fileUrl;
                  const isCloudinary = url.includes('cloudinary.com');
                  const type = selectedNote.fileType || (
                    url.toLowerCase().includes('.pdf') || url.includes('raw/upload') ? 'pdf' :
                    url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.mov') || url.includes('video/upload') ? 'video' :
                    'image'
                  );

                  // THE NUCLEAR OPTION: Render PDF as High-Quality Images via Cloudinary
                  if (type === 'pdf' && isCloudinary) {
                    const baseUrl = url.replace('/raw/upload/', '/image/upload/').replace('.pdf', '.jpg');
                    // We'll show first 50 pages as a scrollable document
                    return (
                      <div className="w-full bg-secondary/10 p-4 lg:p-10 space-y-4 max-h-[1000px] overflow-y-auto custom-scrollbar bg-neutral-900">
                        <div className="flex justify-between items-center mb-8 px-4">
                           <span className="text-white font-black text-xs uppercase tracking-widest bg-primary px-3 py-1 rounded-full">Secure Reader Mode</span>
                           <span className="text-white/40 text-[10px] font-bold">Cloudinary HD Rendering</span>
                        </div>
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className="relative group">
                            <img 
                              src={baseUrl.replace('/image/upload/', `/image/upload/f_auto,q_auto,pg_${i + 1}/`)} 
                              alt={`Page ${i + 1}`}
                              className="w-full h-auto shadow-2xl rounded-sm mb-4"
                              loading="lazy"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                            <div className="absolute bottom-6 right-6 bg-black/50 text-white px-3 py-1 rounded-full text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                              PAGE {i + 1}
                            </div>
                          </div>
                        ))}
                        <div className="py-20 text-center border-t border-white/10">
                          <p className="text-white/40 font-bold text-sm">End of Document Preview</p>
                        </div>
                      </div>
                    );
                  }

                  // Fallback for non-Cloudinary PDFs
                  if (type === 'pdf') {
                    return (
                      <div className="w-full h-[800px] bg-secondary/10 relative group flex items-center justify-center">
                        <iframe 
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedNote.fileUrl)}&embedded=true`}
                          className="w-full h-full border-none relative z-10"
                          title={selectedNote.title}
                        />
                      </div>
                    );
                  }

                  if (type === 'video') {
                    return (
                      <div className="w-full aspect-video bg-black flex items-center justify-center">
                        <video 
                          controls
                          controlsList="nodownload"
                          playsInline
                          preload="auto"
                          className="w-full h-full"
                          onError={() => setViewError("فشل تشغيل الفيديو.")}
                        >
                          <source src={selectedNote.fileUrl} />
                        </video>
                      </div>
                    );
                  }

                  return (
                    <div className="w-full flex items-center justify-center p-4 bg-secondary/10">
                      <img 
                        src={selectedNote.fileUrl} 
                        alt={selectedNote.title} 
                        className="max-w-full h-auto rounded-xl shadow-lg"
                      />
                    </div>
                  );
                })()}
              </div>
            )}


            {viewError && (
              <div className="p-6 bg-rose-500/10 border-2 border-rose-500/20 rounded-3xl text-rose-600 font-bold flex items-center gap-3">
                <FileText /> {viewError}
              </div>
            )}

            <div 
              className="prose prose-lg max-w-none !text-black leading-relaxed whitespace-pre-wrap text-right"
              dir="auto"
            >
              {selectedNote.content}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12 text-center">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold">Select a note to start reading</h3>
            <p>Your learning journey starts here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

