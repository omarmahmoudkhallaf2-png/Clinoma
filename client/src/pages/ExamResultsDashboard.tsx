import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Loader2, Search, ArrowUpDown, Clock, Trophy, User, ArrowRight, FileText, Users } from 'lucide-react';

export default function ExamResultsDashboard() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'score', direction: 'desc' });

  useEffect(() => {
    const q = query(collection(db, 'exam_attempts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttempts(data);
      setLoading(false);
    });

    const examsQ = query(collection(db, 'formal_exams'), orderBy('createdAt', 'desc'));
    const unsubscribeExams = onSnapshot(examsQ, (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      unsubscribeExams();
    };
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAttempts = [...attempts].sort((a, b) => {
    if (sortConfig.key === 'score') {
      if (a.score !== b.score) {
        return sortConfig.direction === 'asc' ? a.score - b.score : b.score - a.score;
      }
      // Secondary sort: lowest time first when scores are equal
      return a.timeSpentSeconds - b.timeSpentSeconds;
    }

    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }).filter(a => {
    const matchesSearch = a.studentName?.toLowerCase().includes(search.toLowerCase()) || a.userEmail?.toLowerCase().includes(search.toLowerCase());
    const matchesExam = a.examId === selectedExamId;
    return matchesSearch && matchesExam;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  if (!selectedExamId) {
    return (
      <div className="p-6 md:p-10 space-y-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight">نتائج الإختبارات</h1>
          <p className="text-muted-foreground font-bold text-lg">اختر إختباراً لعرض نتائج الطلاب</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => {
            const examAttempts = attempts.filter(a => a.examId === exam.id);
            return (
              <div 
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className="bg-card border-2 border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 p-8 rounded-[2rem] cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black mb-2 line-clamp-2">{exam.title}</h3>
                <div className="flex items-center gap-4 mt-6 text-muted-foreground font-bold">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{examAttempts.length} محاولة</span>
                  </div>
                  {exam.durationMinutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{exam.durationMinutes} دقيقة</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {exams.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border">
              <div className="text-6xl">📭</div>
              <p className="text-xl font-black text-muted-foreground">لا توجد إختبارات مضافة حالياً</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const selectedExam = exams.find(e => e.id === selectedExamId);

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-6">
        <button 
          onClick={() => setSelectedExamId(null)}
          className="flex items-center gap-2 w-fit px-6 py-3 bg-secondary text-foreground hover:bg-border rounded-2xl font-black transition-all"
        >
          <ArrowRight className="w-5 h-5" />
          العودة لقائمة الإختبارات
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{selectedExam?.title}</h1>
            <p className="text-muted-foreground font-bold text-lg">نتائج الطلاب والوقت المستغرق</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text"
              placeholder="بحث عن طالب بالاسم أو الإيميل..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-card border-2 border-border rounded-2xl font-bold outline-none focus:border-primary transition-all text-right"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-secondary/30 border-b-2 border-border">
                <th className="p-6 font-black text-sm uppercase tracking-widest text-muted-foreground">اسم الطالب</th>
                <th className="p-6 font-black text-sm uppercase tracking-widest text-muted-foreground">البريد الإلكتروني</th>
                <th 
                  className="p-6 font-black text-sm uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    <ArrowUpDown className="w-4 h-4" /> الدرجة
                  </div>
                </th>
                <th 
                  className="p-6 font-black text-sm uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('timeSpentSeconds')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    <ArrowUpDown className="w-4 h-4" /> الوقت المستغرق
                  </div>
                </th>
                <th className="p-6 font-black text-sm uppercase tracking-widest text-muted-foreground">تاريخ البدء</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-border">
              {sortedAttempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-secondary/10 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4 justify-end">
                      <div className="text-right">
                        <p className="font-black text-lg">{attempt.studentName}</p>
                        {attempt.userEmail && (
                          <p className="text-xs font-bold text-muted-foreground">{attempt.userEmail}</p>
                        )}
                      </div>
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-sm text-muted-foreground text-right">
                      {attempt.userEmail ?? '—'}
                    </p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4 justify-end">
                      <span className="font-black text-2xl text-primary">{attempt.score} / {attempt.totalQuestions}</span>
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4 justify-end">
                      <span className="font-bold text-lg">{formatTime(attempt.timeSpentSeconds)}</span>
                      <Clock className="w-5 h-5 text-indigo-500" />
                    </div>
                  </td>
                  <td className="p-6 text-muted-foreground font-bold">
                    {attempt.startTime?.toDate ? attempt.startTime.toDate().toLocaleString('ar-EG') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sortedAttempts.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="text-6xl text-muted-foreground/20">📉</div>
              <p className="text-xl font-black text-muted-foreground">لا توجد محاولات حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

