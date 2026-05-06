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

  useEffect(() => {
    const fetchNotes = async () => {
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
      } catch (error) {
        console.error(error);
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
                onClick={() => setSelectedNote(note)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedNote?.id === note.id 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-card border-border hover:bg-secondary'
                }`}
              >
                <div className="font-bold line-clamp-1">{note.title}</div>
                <div className={`text-xs mt-1 ${selectedNote?.id === note.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                  Lecture {note.lectureNumber} • {new Date(note.createdAt?.seconds * 1000).toLocaleDateString()}
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
                {selectedNote.fileType === 'pdf' && (
                  <div className="w-full h-[800px] bg-secondary/10 relative group flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                      <p className="absolute mt-16 text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Document...</p>
                    </div>
                    <iframe 
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedNote.fileUrl)}&embedded=true`}
                      className="w-full h-full border-none relative z-10"
                      title={selectedNote.title}
                      loading="lazy"
                    />

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <a 
                        href={selectedNote.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg text-sm"
                       >
                         Open PDF Directly
                       </a>
                    </div>
                  </div>
                )}
                
                {selectedNote.fileType === 'video' && (
                  <div className="w-full aspect-video bg-black flex items-center justify-center">
                    <video 
                      controls
                      controlsList="nodownload"
                      playsInline
                      preload="auto"
                      className="w-full h-full"
                    >
                      <source src={selectedNote.fileUrl} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {selectedNote.fileType === 'image' && (
                  <div className="w-full flex items-center justify-center p-4 bg-secondary/10">
                    <img 
                      src={selectedNote.fileUrl} 
                      alt={selectedNote.title} 
                      className="max-w-full h-auto rounded-xl shadow-lg"
                    />
                  </div>
                )}
              </div>
            )}


            <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
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
