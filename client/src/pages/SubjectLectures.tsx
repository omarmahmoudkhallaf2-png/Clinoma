import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, ChevronRight, GraduationCap, Loader2, Highlighter, Sparkles, Bookmark, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBookmarks, getIncorrectQuestions } from '../lib/quizEngine';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function SubjectLectures() {
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subjectBookmarks, setSubjectBookmarks] = useState<any[]>([]);
  const [subjectIncorrect, setSubjectIncorrect] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;
      
      const fetchSubjectPromise = (async () => {
        if (subjectId === 'clinical_nutrition_subject') {
          return {
            name: 'Clinical Nutrition MCQ Bank',
            lectureCount: 9
          };
        }
        const snap = await getDoc(doc(db, 'subjects', subjectId));
        return snap.exists() ? snap.data() : null;
      })();

      const fetchQuizDataPromise = (async () => {
        if (!user) return { bookmarks: [], incorrect: [] };
        try {
          const [bookmarks, incorrect] = await Promise.all([
            getBookmarks(user.uid),
            getIncorrectQuestions(user.uid)
          ]);
          return { bookmarks, incorrect };
        } catch (e) {
          console.error("Failed to load user quiz data:", e);
          return { bookmarks: [], incorrect: [] };
        }
      })();

      const [subjectData, quizData] = await Promise.all([
        fetchSubjectPromise,
        fetchQuizDataPromise
      ]);

      if (subjectData) setSubject(subjectData);

      const filteredBookmarks = quizData.bookmarks.filter((q: any) => 
        q.subjectId === subjectId || 
        (subjectId === 'clinical_nutrition_subject' && q.id?.startsWith('CN_'))
      );
      const filteredIncorrect = quizData.incorrect.filter((q: any) => 
        q.subjectId === subjectId || 
        (subjectId === 'clinical_nutrition_subject' && q.id?.startsWith('CN_'))
      );

      setSubjectBookmarks(filteredBookmarks);
      setSubjectIncorrect(filteredIncorrect);
      setLoading(false);
    };

    fetchData();
  }, [subjectId, user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  const CLINICAL_NUTRITION_CHAPTERS = [
    { number: 1, title: 'Chapter 1' },
    { number: 2, title: 'Chapter 2' },
    { number: 3, title: 'Chapter 3' },
    { number: 4, title: 'Chapter 4' },
    { number: 5, title: 'Chapter 5' },
    { number: 6, title: 'Chapter 6' },
    { number: 7, title: 'Chapter 7 & 8' },
    { number: 9, title: 'Chapter 9' }
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 space-y-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <button onClick={() => navigate(-1)} className="p-4 bg-secondary/50 rounded-2xl hover:bg-secondary transition-all flex items-center gap-3 font-black text-sm uppercase tracking-widest">
          <ArrowLeft className="w-5 h-5" /> Back to Curriculum
        </button>

        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">{subject?.name}</h1>
          <p className="text-muted-foreground font-bold text-xl uppercase tracking-[0.2em] opacity-40">
            {subjectId === 'clinical_nutrition_subject' ? 'Select Chapter' : 'Select Lecture Node'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* الأسئلة المعلمة (Bookmarked/Flagged Questions) */}
          <button
            onClick={() => {
              if (subjectBookmarks.length === 0) {
                toast.error('لا توجد أسئلة معلمة في هذه المادة حالياً');
                return;
              }
              navigate('/quiz', {
                state: {
                  courseId,
                  subjectId,
                  questions: subjectBookmarks,
                  isTimed: false,
                  feedbackMode: 'instant',
                  retakeIncorrect: false,
                  isExam: false
                }
              });
            }}
            className={cn(
              "group p-8 border-2 rounded-[3rem] shadow-xl hover:scale-[1.02] transition-all text-left flex items-center justify-between overflow-hidden relative",
              subjectBookmarks.length > 0
                ? "bg-indigo-500/10 border-indigo-500/30 border-r-4 border-r-indigo-500 hover:border-indigo-500 hover:bg-indigo-500/15"
                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
            )}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center gap-6 relative z-10">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 shadow-lg",
                subjectBookmarks.length > 0
                  ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white shadow-indigo-500/10"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none"
              )}>
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="text-right" dir="rtl">
                <h3 className={cn("text-xl font-black", subjectBookmarks.length > 0 ? "text-indigo-700 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400")}>الأسئلة المعلمة</h3>
                <p className="text-muted-foreground font-bold text-sm">
                  {subjectBookmarks.length} سؤال معلم
                </p>
              </div>
            </div>
            <ChevronRight className={cn("w-8 h-8 transition-all flex-shrink-0 relative z-10", subjectBookmarks.length > 0 ? "text-indigo-600 group-hover:text-indigo-800" : "text-slate-400")} />
          </button>

          {/* الأسئلة الخاطئة (Incorrect Questions) */}
          <button
            onClick={() => {
              if (subjectIncorrect.length === 0) {
                toast.error('لا توجد أسئلة خاطئة في هذه المادة حالياً');
                return;
              }
              navigate('/quiz', {
                state: {
                  courseId,
                  subjectId,
                  questions: subjectIncorrect,
                  isTimed: false,
                  feedbackMode: 'instant',
                  retakeIncorrect: false,
                  isExam: false
                }
              });
            }}
            className={cn(
              "group p-8 border-2 rounded-[3rem] shadow-xl hover:scale-[1.02] transition-all text-left flex items-center justify-between overflow-hidden relative",
              subjectIncorrect.length > 0
                ? "bg-rose-500/10 border-rose-500/30 border-r-4 border-r-rose-500 hover:border-rose-500 hover:bg-rose-500/15"
                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
            )}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center gap-6 relative z-10">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 shadow-lg",
                subjectIncorrect.length > 0
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white shadow-rose-500/10"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none"
              )}>
                <XCircle className="w-8 h-8" />
              </div>
              <div className="text-right" dir="rtl">
                <h3 className={cn("text-xl font-black", subjectIncorrect.length > 0 ? "text-rose-700 dark:text-rose-400" : "text-slate-500 dark:text-slate-400")}>الأسئلة الخاطئة</h3>
                <p className="text-muted-foreground font-bold text-sm">
                  {subjectIncorrect.length} أخطاء
                </p>
              </div>
            </div>
            <ChevronRight className={cn("w-8 h-8 transition-all flex-shrink-0 relative z-10", subjectIncorrect.length > 0 ? "text-rose-600 group-hover:text-rose-800" : "text-slate-400")} />
          </button>

          {subjectId === 'clinical_nutrition_subject' ? (
            <>
              {/* Highlighted Questions Card - Gold/Amber styling */}
              <button
                onClick={() => navigate('/quiz', {
                  state: {
                    courseId,
                    subjectId,
                    count: 100,
                    isTimed: false,
                    questionType: 'highlighted',
                    feedbackMode: 'instant',
                    retakeIncorrect: false,
                    isExam: false
                  }
                })}
                className="group p-8 bg-amber-500/10 border-2 border-amber-500/30 hover:border-amber-500 rounded-[3rem] shadow-xl hover:scale-[1.02] hover:bg-amber-500/15 transition-all text-left flex items-center justify-between overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all flex-shrink-0 shadow-lg shadow-amber-500/10">
                    <Highlighter className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-amber-700 dark:text-amber-400">الأسئلة المظللة</h3>
                    <p className="text-amber-800/60 dark:text-amber-300/60 font-bold text-sm">Highlights (25 Questions)</p>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-amber-600 group-hover:text-amber-800 transition-all flex-shrink-0 relative z-10" />
              </button>

              {/* Chapters */}
              {CLINICAL_NUTRITION_CHAPTERS.map((ch) => (
                <button
                  key={ch.number}
                  onClick={() => navigate('/quiz', {
                    state: {
                      courseId,
                      subjectId,
                      lectureNumber: ch.number,
                      count: 100,
                      isTimed: false,
                      questionType: 'practice',
                      feedbackMode: 'instant',
                      retakeIncorrect: false,
                      isExam: false
                    }
                  })}
                  className="group p-8 bg-card border-2 border-border rounded-[3rem] shadow-xl hover:scale-[1.02] hover:border-primary transition-all text-left flex items-center justify-between overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all font-black text-2xl flex-shrink-0">
                      {ch.number === 7 ? "7&8" : ch.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-black">Chapter {ch.number === 7 ? "7 & 8" : ch.number}</h3>
                    </div>
                  </div>
                  <ChevronRight className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-all flex-shrink-0 relative z-10" />
                </button>
              ))}
            </>
          ) : (
            Array.from({ length: subject?.lectureCount || 12 }, (_, i) => i + 1).map((num) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
