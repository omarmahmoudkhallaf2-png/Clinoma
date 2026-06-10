import { useState, useEffect } from 'react';
import { dbExam as db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  Loader2, Search, ArrowUpDown, Clock, Trophy, User, ArrowRight, FileText, Users, Download, 
  FileSpreadsheet, ShieldCheck, GraduationCap, Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';

export default function ExamResultsDashboard() {
  const getNormalizedScore = (attempt: any) => {
    let rawScore = attempt.score || 0;
    let rawTotal = attempt.totalQuestions || 45;
    
    if (attempt.examId === 'first_paper_camp_matching' && !attempt.totalQuestions && rawScore > 45) {
      const percentage = rawScore;
      const correct = Math.round((percentage / 100) * 45);
      return { score: correct, totalQuestions: 45, percentage };
    }
    
    const percentage = Math.round((rawScore / rawTotal) * 100);
    return { score: rawScore, totalQuestions: rawTotal, percentage };
  };

  const [attempts, setAttempts] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'score', direction: 'desc' });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'exam_attempts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttempts(data);
      setLoading(false);
    });

    const examsQ = query(collection(db, 'formal_exams'), orderBy('createdAt', 'desc'));
    const unsubscribeExams = onSnapshot(examsQ, (snapshot) => {
      const dbExams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const campExam = {
        id: 'first_paper_camp_matching',
        title: '🔥 معسكر الورقة الأولى - اختبار التوصيل التفاعلي',
        durationMinutes: 15,
        createdAt: new Date()
      };
      const camp2Exam = {
        id: 'second_paper_camp_matching_day1',
        title: '🔥 معسكر الورقة الثانية - اختبار التوصيل التفاعلي - اليوم الأول',
        durationMinutes: 30,
        createdAt: new Date()
      };
      setExams([campExam, camp2Exam, ...dbExams]);
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
    const normA = getNormalizedScore(a);
    const normB = getNormalizedScore(b);
    
    if (sortConfig.key === 'score') {
      if (normA.percentage !== normB.percentage) {
        return sortConfig.direction === 'asc' ? normA.percentage - normB.percentage : normB.percentage - normA.percentage;
      }
      return (a.timeSpentSeconds || 0) - (b.timeSpentSeconds || 0);
    }
    
    if (sortConfig.key === 'timeSpentSeconds') {
      const tA = a.timeSpentSeconds || 0;
      const tB = b.timeSpentSeconds || 0;
      return sortConfig.direction === 'asc' ? tA - tB : tB - tA;
    }

    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }).filter(a => {
    const studentName = a.studentName || a.userName || '';
    const matchesSearch = studentName.toLowerCase().includes(search.toLowerCase()) || a.userEmail?.toLowerCase().includes(search.toLowerCase());
    const matchesExam = a.examId === selectedExamId;
    return matchesSearch && matchesExam;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleExportPDF = async () => {
    const table = document.getElementById('premium-report');
    if (!table) return;

    setIsExporting(true);
    const toastId = toast.loading('جاري تجهيز تقرير PDF بريميوم...');

    // Temporarily show the template for capture
    table.style.display = 'block';

    try {
      const canvas = await html2canvas(table, {
        scale: 3, // Higher scale for premium quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`${selectedExam?.title || 'CLINOMA_Report'}.pdf`);
      toast.success('تم تحميل التقرير البريميوم بنجاح', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل الملف', { id: toastId });
    } finally {
      table.style.display = 'none';
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    const data = sortedAttempts.map(a => ({
      'اسم الطالب': a.studentName || a.userName || 'طالب معسكر',
      'البريد الإلكتروني': a.userEmail,
      'الدرجة': `${a.score} / ${a.totalQuestions || 45}`,
      'النسبة المئوية': `${Math.round((a.score / (a.totalQuestions || 45)) * 100)}%`,
      'الوقت المستغرق': formatTime(a.timeSpentSeconds || 0),
      'التاريخ': a.startTime?.toDate ? a.startTime.toDate().toLocaleString('ar-EG') : (a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString('ar-EG') : 'N/A')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `${selectedExam?.title || 'results'}.xlsx`);
    toast.success('تم تصدير ملف Excel بنجاح');
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
          
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting || sortedAttempts.length === 0}
                className="w-full md:w-auto h-14 px-8 rounded-2xl font-black gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-xl"
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 text-amber-400" />}
                تقرير PDF بريميوم
              </Button>

              <Button 
                onClick={handleExportExcel}
                disabled={isExporting || sortedAttempts.length === 0}
                variant="outline"
                className="w-full md:w-auto h-14 px-8 rounded-2xl font-black gap-2 border-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 shadow-lg shadow-emerald-500/5"
              >
                <FileSpreadsheet className="w-5 h-5" />
                تصدير Excel
              </Button>

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
      </div>

      <div id="results-table" className="bg-card border-2 border-border rounded-[3rem] overflow-hidden shadow-sm p-4">
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
              {sortedAttempts.map((attempt) => {
                const norm = getNormalizedScore(attempt);
                return (
                  <tr key={attempt.id} className="hover:bg-secondary/10 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4 justify-end">
                        <div className="text-right">
                          <p className="font-black text-lg">{attempt.studentName || attempt.userName || 'طالب معسكر'}</p>
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
                        <span className="font-black text-2xl text-primary">{norm.score} / {norm.totalQuestions}</span>
                        <Trophy className="w-5 h-5 text-amber-500" />
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4 justify-end">
                        <span className="font-bold text-lg">{formatTime(attempt.timeSpentSeconds || 0)}</span>
                        <Clock className="w-5 h-5 text-indigo-500" />
                      </div>
                    </td>
                    <td className="p-6 text-muted-foreground font-bold">
                      {attempt.startTime?.toDate ? attempt.startTime.toDate().toLocaleString('ar-EG') : (attempt.createdAt?.toDate ? attempt.createdAt.toDate().toLocaleString('ar-EG') : 'N/A')}
                    </td>
                  </tr>
                );
              })}
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
      {/* Hidden Premium PDF Template */}
      <div 
        id="premium-report" 
        style={{ display: 'none', position: 'absolute', left: '-9999px', width: '800px' }} 
        className="bg-white p-16 font-sans"
        dir="rtl"
      >
        {/* Header Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50" />
        
        <div className="relative border-b-4 border-slate-900 pb-10 mb-12 flex justify-between items-end">
          {/* Verified Status on the Right in RTL (Visually Right) */}
          <div className="text-right bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 justify-end">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified Report
            </div>
            <p className="text-xs font-bold text-slate-600">ID: {selectedExamId?.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Logo Block on the Left in RTL (Visually Left) */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 justify-end">
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">CLINOMA</h1>
                <p className="text-xs font-black tracking-[0.3em] text-slate-400 text-right">OFFICIAL ACADEMIC REPORT</p>
              </div>
              <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
                <img src="/favicon.svg" alt="Clinoma" className="w-10 h-10 brightness-0 invert" />
              </div>
            </div>
            <div className="space-y-1 text-right">
              <h2 className="text-2xl font-black text-slate-800">{selectedExam?.title}</h2>
              <div className="flex items-center gap-4 text-slate-500 font-bold text-sm justify-end">
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('ar-EG')}</div>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {sortedAttempts.length} محاولة</div>
              </div>
            </div>
          </div>
        </div>

        <table className="w-full text-right mb-12 border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-4 rounded-r-2xl font-black text-xs first:rounded-r-2xl last:rounded-l-2xl">اسم الطالب</th>
              <th className="p-4 font-black text-xs text-center">الدرجة</th>
              <th className="p-4 font-black text-xs text-center">النسبة</th>
              <th className="p-4 font-black text-xs text-center">الوقت</th>
              <th className="p-4 rounded-l-2xl font-black text-xs text-left">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {sortedAttempts.map((a, i) => {
              const norm = getNormalizedScore(a);
              return (
                <tr key={a.id} className={cn("text-slate-700", i % 2 === 0 ? "bg-slate-50" : "bg-white")}>
                  <td className="p-4 rounded-r-xl font-black text-sm">{a.studentName || a.userName || 'طالب معسكر'}</td>
                  <td className="p-4 font-black text-sm text-center text-slate-900">{norm.score} / {norm.totalQuestions}</td>
                  <td className="p-4 font-black text-sm text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs",
                      (norm.score / norm.totalQuestions) >= 0.5 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {norm.percentage}%
                    </span>
                  </td>
                  <td className="p-4 font-bold text-sm text-center text-slate-500">{formatTime(a.timeSpentSeconds || 0)}</td>
                  <td className="p-4 rounded-l-xl font-bold text-xs text-left text-slate-400">
                    {a.startTime?.toDate ? a.startTime.toDate().toLocaleDateString('ar-EG') : (a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString('ar-EG') : 'N/A')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center text-slate-300">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Clinoma Medical Academy</span>
          </div>
          <span className="text-[10px] font-medium italic">Confidential - For Academic Use Only</span>
        </div>
      </div>
    </div>
  );
}

