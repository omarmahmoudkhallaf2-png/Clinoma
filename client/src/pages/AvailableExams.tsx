import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbExam as db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, onSnapshot, where } from 'firebase/firestore';
import { Loader2, Clock, BookOpen, ChevronRight, ClipboardList, Lock, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const examStatus = (exam: any): 'upcoming' | 'open' | 'closed' | 'no-date' => {
  if (!exam.startAt && !exam.endAt) return 'no-date';
  const now = Date.now();
  const start = exam.startAt?.toDate?.().getTime() ?? 0;
  const end = exam.endAt?.toDate?.().getTime() ?? Infinity;
  if (now < start) return 'upcoming';
  if (now > end) return 'closed';
  return 'open';
};

export default function AvailableExams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log("Setting up real-time exams listener...");
    // Use a simple query first to ensure we get ALL exams, then sort in memory
    const q = collection(db, 'formal_exams');
    
    const unsubscribe = onSnapshot(q, (snap) => {
      let examsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Filter out drafts (unpublished exams) for students
      examsData = examsData.filter((e: any) => e.status === 'published');

      // Sort manually to avoid Firebase index requirements that might hide new docs
      examsData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
        const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
        return timeB - timeA;
      });
      console.log("Exams found:", examsData.length);
      setExams(examsData);
      setLoading(false);
    }, (err) => {
      console.error("Exams error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'exam_attempts'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const attemptsData: Record<string, any> = {};
      snap.docs.forEach(d => {
        attemptsData[d.data().examId] = d.data();
      });
      setAttempts(attemptsData);
    });
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-card border-2 border-border rounded-[3rem] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative flex items-center gap-6">
          <div className="p-5 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/30">
            <ClipboardList className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black">الإختبارات المتاحة</h1>
            <p className="text-muted-foreground font-bold text-lg">اختر إختباراً لتبدأ</p>
          </div>
        </div>
      </div>

      {/* Exam List */}
      {exams.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border">
          <div className="text-7xl">📭</div>
          <p className="text-2xl font-black text-muted-foreground">لا توجد إختبارات متاحة حالياً</p>
          <p className="text-muted-foreground font-bold">تواصل مع المشرف لإضافة إختبارات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam, i) => {
            const status = examStatus(exam);
            const isClickable = status === 'open' || status === 'no-date';
            const statusBadge: Record<string, string> = {
              open: 'bg-emerald-500/10 text-emerald-600 border border-emerald-400/30',
              upcoming: 'bg-amber-500/10 text-amber-600 border border-amber-400/30',
              closed: 'bg-rose-500/10 text-rose-600 border border-rose-400/30',
              'no-date': 'bg-secondary text-muted-foreground border border-border',
            };
            const statusLabel: Record<string, string> = {
              open: '🟢 جارٍ الآن',
              upcoming: '⏳ لم يبدأ بعد',
              closed: '🔴 انتهى',
              'no-date': 'متاح',
            };
            return (
              <div
                key={exam.id}
                onClick={() => isClickable && navigate(`/exam/${exam.id}`)}
                className={`bg-card border-2 p-8 rounded-[2.5rem] transition-all relative overflow-hidden ${
                  isClickable
                    ? 'hover:border-primary/40 hover:shadow-xl cursor-pointer group'
                    : 'opacity-70 cursor-not-allowed'
                } ${status === 'open' ? 'border-emerald-400/40' : 'border-border'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-6 relative">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl flex-shrink-0 transition-all ${
                    isClickable ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-secondary/50 text-muted-foreground'
                  }`}>
                    {status === 'closed' ? <Lock className="w-7 h-7" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className={`text-2xl font-black ${isClickable ? 'group-hover:text-primary transition-colors' : ''}`}>{exam.title}</h3>
                      <span className={`text-xs px-3 py-1 rounded-lg font-black ${statusBadge[status]}`}>{statusLabel[status]}</span>
                      {attempts[exam.id] && (
                        <span className="text-xs px-3 py-1 rounded-lg font-black bg-primary/10 text-primary border border-primary/20">
                          ✓ تم الحل: {attempts[exam.id].score} / {attempts[exam.id].totalQuestions}
                        </span>
                      )}
                    </div>
                    {exam.description && <p className="text-muted-foreground font-bold text-sm mt-1 line-clamp-1">{exam.description}</p>}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {exam.durationMinutes && (
                        <span className="flex items-center gap-1.5 text-xs font-black text-muted-foreground">
                          <Clock className="w-4 h-4" /> {exam.durationMinutes} دقيقة
                        </span>
                      )}
                      {exam.endAt && (
                        <span className="flex items-center gap-1.5 text-xs font-black text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          ينتهي: {(exam.endAt as Timestamp).toDate().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                  {isClickable && (
                    <div className="flex-shrink-0 w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
