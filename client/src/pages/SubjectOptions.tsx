import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FileText, HelpCircle, ArrowLeft, Crown, Sparkles, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SubjectOptions() {
  const { courseId, subjectId, lectureNumber } = useParams();
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const subscribed = courseId ? isSubscribed(courseId) : false;

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
      <div className="max-w-4xl mx-auto space-y-12">
        <button onClick={() => navigate(-1)} className="p-4 bg-secondary/50 rounded-2xl hover:bg-secondary transition-all flex items-center gap-3 font-black text-sm uppercase tracking-widest">
          <ArrowLeft className="w-5 h-5" /> Back to Lectures
        </button>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 text-primary rounded-full font-black text-sm uppercase tracking-widest">
            <GraduationCap className="w-5 h-5" /> Lecture {lectureNumber}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">{subject?.name}</h1>
          <p className="text-muted-foreground font-bold text-xl uppercase tracking-[0.2em] opacity-40">Choose Study Mode</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notes Option */}
          <button
            onClick={() => navigate(`/notes/${subjectId}?lecture=${lectureNumber}`)}
            className="group p-10 bg-card border-2 border-border rounded-[4rem] shadow-xl hover:border-indigo-500 transition-all text-left space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-600 rounded-[2rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
              <FileText className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-4xl font-black mb-2">Lecture Notes</h3>
              <p className="text-muted-foreground font-bold leading-relaxed">Access theoretical lectures, summarized clinical points and visual mnemonics for Lecture {lectureNumber}.</p>
            </div>
          </button>

          {/* Questions Option */}
          <button
            onClick={() => navigate(`/quiz-setup`, { state: { courseId, subjectId, lectureNumber: Number(lectureNumber), questionType: 'lectures' } })}
            className="group p-10 bg-card border-2 border-border rounded-[4rem] shadow-xl hover:border-emerald-500 transition-all text-left space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-[2rem] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-lg">
              <HelpCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-4xl font-black mb-2">Question Bank</h3>
              <p className="text-muted-foreground font-bold leading-relaxed">Practice high-yield questions with detailed explanations and performance tracking.</p>
            </div>
            {!subscribed && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-500/20">
                <Crown className="w-4 h-4" /> Limited Free Access
              </div>
            )}
          </button>
        </div>

        {!subscribed && (
          <div className="p-10 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/20 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-amber-600 font-black uppercase tracking-widest text-sm">
                <Sparkles className="w-5 h-5" /> Premium Recommendation
              </div>
              <h4 className="text-3xl font-black">Unlock Full Curriculum Access</h4>
              <p className="text-amber-800/60 font-bold max-w-md">Get unlimited access to all 5,000+ questions, past exams, and premium study materials for {subject?.name}.</p>
            </div>
            <button 
              onClick={() => navigate('/available')}
              className="px-12 py-5 bg-amber-500 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
