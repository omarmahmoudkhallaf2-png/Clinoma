import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';

export default function SubjectLectures() {
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubject = async () => {
      if (!subjectId) return;
      const snap = await getDoc(doc(db, 'subjects', subjectId));
      if (snap.exists()) setSubject(snap.data());
      setLoading(false);
    };
    fetchSubject();
  }, [subjectId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 space-y-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <button onClick={() => navigate(-1)} className="p-4 bg-secondary/50 rounded-2xl hover:bg-secondary transition-all flex items-center gap-3 font-black text-sm uppercase tracking-widest">
          <ArrowLeft className="w-5 h-5" /> Back to Curriculum
        </button>

        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">{subject?.name}</h1>
          <p className="text-muted-foreground font-bold text-xl uppercase tracking-[0.2em] opacity-40">Select Lecture Node</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: subject?.lectureCount || 12 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => navigate(`/course/${courseId}/subject/${subjectId}/lecture/${num}`)}
              className="group p-8 bg-card border-2 border-border rounded-[3rem] shadow-xl hover:border-primary transition-all text-left flex items-center justify-between overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all font-black text-2xl">
                  {num}
                </div>
                <div>
                  <h3 className="text-2xl font-black">Lecture {num}</h3>
                  <p className="text-muted-foreground font-bold text-sm">Notes & Questions</p>
                </div>
              </div>
              <ChevronRight className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-all relative z-10" />
            </button>
          ))}
        </div>

        <div className="p-10 bg-secondary/30 border-2 border-dashed border-border rounded-[4rem] text-center space-y-4">
          <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
          <p className="text-muted-foreground font-bold max-w-md mx-auto">
            Each lecture node contains synchronized notes and question banks to ensure a comprehensive learning experience.
          </p>
        </div>
      </div>
    </div>
  );
}
