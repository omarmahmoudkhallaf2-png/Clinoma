import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
  collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { Loader2, Clock, ChevronLeft, ChevronRight, Send, CheckCircle2, AlertTriangle, Flag, Lock, XCircle, ZoomIn, ZoomOut, X } from 'lucide-react';

export default function FormalExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<'name' | 'checking' | 'blocked' | 'closed' | 'upcoming' | 'quiz' | 'result' | 'review'>('name');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [examData, setExamData] = useState<any>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Fetch exam & questions ─────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const examDoc = await getDoc(doc(db, 'formal_exams', examId!));
        if (!examDoc.exists()) { setStep('closed'); setLoading(false); return; }
        const data = { id: examDoc.id, ...examDoc.data() };
        setExamData(data);

        const qSnap = await getDocs(query(collection(db, 'questions'), where('formalExamId', '==', examId)));
        setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    init();
  }, [examId]);

  // ── Countdown ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'quiz' || timeLeft === null) return;
    if (timeLeft <= 0) { doSubmit(); return; }
    const t = setInterval(() => setTimeLeft(p => (p ?? 1) - 1), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  // ── Start: check schedule + one-attempt ─────────────────────────────────────
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    setStep('checking');

    const now = Date.now();

    // 1. Check schedule
    if (examData?.startAt) {
      const start = (examData.startAt as Timestamp).toDate().getTime();
      if (now < start) { setStep('upcoming'); return; }
    }
    if (examData?.endAt) {
      const end = (examData.endAt as Timestamp).toDate().getTime();
      if (now > end) { setStep('closed'); return; }
    }

    // 2. Check one-attempt by Firebase Auth userId
    if (!user) { navigate('/login'); return; }
    const prevSnap = await getDocs(query(
      collection(db, 'exam_attempts'),
      where('examId', '==', examId),
      where('userId', '==', user.uid)
    ));
    if (!prevSnap.empty) { setStep('blocked'); return; }

    // 3. Calculate effective timer
    const durationSecs = examData?.durationMinutes ? examData.durationMinutes * 60 : null;
    if (examData?.endAt) {
      const secsUntilClose = Math.floor(((examData.endAt as Timestamp).toDate().getTime() - now) / 1000);
      const effective = durationSecs ? Math.min(durationSecs, secsUntilClose) : secsUntilClose;
      setTimeLeft(effective);
    } else if (durationSecs) {
      setTimeLeft(durationSecs);
    }

    setStartTime(now);
    setStep('quiz');
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const endTime = Date.now();
    let score = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });
    try {
      await addDoc(collection(db, 'exam_attempts'), {
        examId, examTitle: examData?.title,
        studentName,
        userId: user?.uid ?? null,
        userEmail: user?.email ?? null,
        score, totalQuestions: questions.length,
        startTime: new Date(startTime!), endTime: new Date(endTime),
        timeSpentSeconds: Math.floor((endTime - (startTime ?? endTime)) / 1000),
        createdAt: serverTimestamp()
      });
      setFinalScore(score);
      setShowConfirm(false);
      setStep('result');
    } catch { alert('حدث خطأ، حاول مرة أخرى'); }
    finally { setSubmitting(false); }
  }, [submitting, startTime, answers, questions, examId, examData, studentName]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const timerWarning = timeLeft !== null && timeLeft < 120;
  const isCurrentFlagged = flagged[currentIndex];

  // ── Screens ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
      <p className="font-black text-xl text-muted-foreground animate-pulse">جاري تحميل الإختبار...</p>
    </div>
  );

  // Already submitted
  if (step === 'blocked') return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-card border-2 border-rose-400/30 rounded-[3rem] p-14 max-w-md text-center space-y-6 shadow-2xl">
        <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black">تم الإجابة مسبقاً</h2>
        <p className="text-muted-foreground font-bold text-lg">
          لقد قدّمت هذا الإختبار من قبل.<br />يُسمح بمحاولة واحدة فقط لكل طالب.
        </p>
        <button onClick={() => navigate('/exams')} className="px-10 py-4 bg-secondary rounded-2xl font-black hover:bg-border transition-all">العودة للإختبارات</button>
      </div>
    </div>
  );

  // Exam closed
  if (step === 'closed') return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-card border-2 border-border rounded-[3rem] p-14 max-w-md text-center space-y-6 shadow-2xl">
        <div className="w-24 h-24 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black">الإختبار منتهٍ</h2>
        <p className="text-muted-foreground font-bold text-lg">انتهى وقت هذا الإختبار ولم يعد متاحاً.</p>
        <button onClick={() => navigate('/exams')} className="px-10 py-4 bg-secondary rounded-2xl font-black hover:bg-border transition-all">العودة للإختبارات</button>
      </div>
    </div>
  );

  // Not started yet
  if (step === 'upcoming') {
    const startStr = examData?.startAt
      ? (examData.startAt as Timestamp).toDate().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })
      : '';
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-card border-2 border-amber-400/30 rounded-[3rem] p-14 max-w-md text-center space-y-6 shadow-2xl">
          <div className="w-24 h-24 bg-amber-400/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black">الإختبار لم يبدأ بعد</h2>
          <p className="text-muted-foreground font-bold text-lg">يبدأ الإختبار في:<br /><span className="text-foreground font-black">{startStr}</span></p>
          <button onClick={() => navigate('/exams')} className="px-10 py-4 bg-secondary rounded-2xl font-black hover:bg-border transition-all">العودة للإختبارات</button>
        </div>
      </div>
    );
  }

  // Checking spinner
  if (step === 'checking') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="font-black text-muted-foreground">جاري التحقق من بياناتك...</p>
      </div>
    </div>
  );

  // Name entry
  if (step === 'name') return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-6">
      <div className="bg-card w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-2 border-border space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black">{examData?.title || 'الإختبار الإلكتروني'}</h1>
          <div className="flex flex-wrap gap-3 justify-center">
            {questions.length > 0 && <span className="px-4 py-2 bg-secondary rounded-2xl text-sm font-black">{questions.length} سؤال</span>}
            {examData?.durationMinutes && <span className="px-4 py-2 bg-amber-500/10 text-amber-600 rounded-2xl text-sm font-black">{examData.durationMinutes} دقيقة</span>}
            {examData?.endAt && (
              <span className="px-4 py-2 bg-rose-500/10 text-rose-600 rounded-2xl text-sm font-black">
                ينتهي: {(examData.endAt as Timestamp).toDate().toLocaleTimeString('ar-EG', { timeStyle: 'short' })}
              </span>
            )}
          </div>
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-400/30">
            <p className="text-amber-700 font-black text-sm">⚠️ مسموح بمحاولة واحدة فقط لكل طالب</p>
          </div>
          {examData?.description && <p className="text-muted-foreground font-bold text-sm">{examData.description}</p>}
        </div>
        <form onSubmit={handleStart} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold px-2 text-right block">الاسم بالكامل</label>
            <input autoFocus type="text" required value={studentName} onChange={e => setStudentName(e.target.value)}
              className="w-full p-5 bg-secondary/50 border-2 border-border rounded-2xl font-black text-xl outline-none focus:border-primary transition-all text-right"
              dir="rtl" placeholder="أدخل اسمك هنا..." />
          </div>
          <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            🚀 بدء الإختبار الآن
          </button>
        </form>
      </div>
    </div>
  );

  // Result
  if (step === 'result') {
    const pct = questions.length ? Math.round(((finalScore ?? 0) / questions.length) * 100) : 0;
    const color = pct >= 70 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-rose-500';
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-6">
        <div className="bg-card w-full max-w-lg p-16 rounded-[4rem] shadow-2xl border-2 border-border space-y-10 text-center animate-in zoom-in-95 duration-500">
          <div className="text-7xl">{pct >= 70 ? '🎉' : pct >= 50 ? '📚' : '💪'}</div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black">تم تسليم الإجابات بنجاح</h2>
            <p className="text-muted-foreground font-bold text-xl">شكراً لك، {studentName}</p>
          </div>
          <div className="p-10 bg-card rounded-[3rem] border-4 border-border shadow-inner space-y-4">
            <div className="text-sm font-black text-muted-foreground uppercase tracking-widest">درجتك النهائية</div>
            <div className={`text-8xl font-black ${color}`}>{finalScore} / {questions.length}</div>
            <div className={`text-2xl font-black ${color}`}>{pct}%</div>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => setStep('review')} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" /> مراجعة إجاباتك
            </button>
            <button onClick={() => navigate('/exams')} className="w-full py-5 bg-secondary rounded-2xl font-black text-lg hover:bg-border transition-all">العودة للإختبارات</button>
          </div>
        </div>
      </div>
    );
  }

  // Review Mode
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-card border-b-2 border-border p-6 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setStep('result')} className="p-3 bg-secondary rounded-xl hover:bg-border transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black">مراجعة الإختبار: {examData?.title}</h2>
          </div>
          <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-sm">
            {finalScore} / {questions.length}
          </span>
        </div>

        <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-8 pb-20">
          {questions.map((q, i) => {
            const studentAns = answers[i];
            const isCorrect = studentAns === q.correctAnswer;
            
            return (
              <div key={i} className={`bg-card border-2 rounded-[2.5rem] p-8 md:p-12 space-y-6 shadow-sm transition-all ${isCorrect ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                <div className="flex items-center justify-between gap-4">
                  <span className={`px-4 py-2 rounded-xl font-black text-sm ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {isCorrect ? '✓ إجابة صحيحة' : '✗ إجابة خاطئة'}
                  </span>
                  <span className="text-muted-foreground font-black">السؤال {i + 1}</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black leading-relaxed text-right" dir="rtl">{q.text}</h3>

                {q.imageUrl && (
                  <div className="flex justify-center">
                    <img src={q.imageUrl} alt="Question" className="max-h-64 object-contain rounded-2xl border border-border" />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {(q.options as string[]).map(option => {
                    const isSelected = studentAns === option;
                    const isCorrectOption = q.correctAnswer === option;
                    
                    let style = "bg-secondary/30 border-border opacity-60";
                    if (isCorrectOption) style = "bg-emerald-500/10 border-emerald-500 text-emerald-700 shadow-sm";
                    if (isSelected && !isCorrectOption) style = "bg-rose-500/10 border-rose-500 text-rose-700 shadow-sm";

                    return (
                      <div key={option} className={`p-4 md:p-6 rounded-2xl border-2 text-right font-bold flex items-center justify-between transition-all ${style}`} dir="rtl">
                        <span>{option}</span>
                        <div className="flex items-center gap-2">
                          {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                          {isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-rose-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-8 p-6 bg-primary/5 rounded-3xl border-2 border-primary/10 space-y-3 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 text-primary font-black text-sm">
                      <Sparkles size={16} /> شرح الإجابة:
                    </div>
                    <p className="text-muted-foreground font-bold leading-relaxed text-right text-sm" dir="rtl">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md border-t border-border flex justify-center">
          <button onClick={() => navigate('/exams')} className="px-10 py-4 bg-secondary rounded-2xl font-black hover:bg-border transition-all">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  if (questions.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-8">
      <div className="text-8xl">📭</div>
      <h2 className="text-3xl font-black">لا توجد أسئلة لهذا الإختبار</h2>
      <button onClick={() => navigate('/exams')} className="px-8 py-4 bg-primary text-white rounded-2xl font-black">العودة</button>
    </div>
  );

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className={`bg-card border-b-2 p-4 md:p-5 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-colors ${isCurrentFlagged ? 'border-amber-400/60 bg-amber-500/5' : 'border-border'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${timerWarning ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-primary/10 text-primary'}`}>
            <Clock className="w-5 h-5" />
          </div>
          <span className="font-black hidden md:block">{studentName}</span>
          {timeLeft !== null && (
            <div className={`px-4 py-2 rounded-xl font-black text-lg tabular-nums ${timerWarning ? 'bg-rose-500 text-white animate-pulse' : 'bg-secondary'}`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-secondary/50 rounded-xl p-1 items-center border border-border">
            <button onClick={() => setZoomLevel(p => Math.max(0.7, p - 0.1))} className="p-2 hover:bg-white rounded-lg text-muted-foreground hover:text-primary transition-all" title="تصغير">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-black text-xs select-none min-w-[3rem] text-center">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(p => Math.min(1.5, p + 0.1))} className="p-2 hover:bg-white rounded-lg text-muted-foreground hover:text-primary transition-all" title="تكبير">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <span className="font-black text-primary text-sm hidden md:block">{answeredCount}/{questions.length}</span>
          {flaggedCount > 0 && (
            <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-xl font-black text-sm flex items-center gap-1.5">
              <Flag className="w-4 h-4 fill-amber-500" /> {flaggedCount}
            </span>
          )}
          <button onClick={() => setShowConfirm(true)}
            className="px-5 py-3 bg-rose-500 text-white rounded-xl font-black shadow-lg shadow-rose-500/20 hover:scale-105 transition-all flex items-center gap-2">
            <Send className="w-4 h-4" /><span className="hidden md:inline">تسليم</span>
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="bg-card border-b border-border px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 w-fit mx-auto">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={`w-9 h-9 rounded-full font-black text-xs transition-all flex-shrink-0 ${
                i === currentIndex
                  ? `scale-125 shadow-lg ring-2 ring-offset-2 ${flagged[i] ? 'bg-amber-400 text-white ring-amber-400' : 'bg-primary text-white ring-primary'}`
                  : flagged[i] ? 'bg-amber-400 text-white'
                  : answers[i] ? 'bg-emerald-500 text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-border'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question */}
      <div 
        className="flex-1 w-full mx-auto p-4 md:p-12 space-y-6 md:space-y-8 origin-top transition-transform duration-300" 
        style={{ maxWidth: `${56 * zoomLevel}rem`, zoom: zoomLevel >= 1 ? zoomLevel : undefined, transform: zoomLevel < 1 ? `scale(${zoomLevel})` : undefined }}
      >
        <div className={`bg-card border-2 p-5 md:p-14 rounded-3xl md:rounded-[3.5rem] shadow-sm space-y-6 md:space-y-8 transition-all ${isCurrentFlagged ? 'border-amber-400/60' : 'border-border'}`}>
          <div className="flex items-center justify-between gap-4">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-sm flex-shrink-0">سؤال {currentIndex + 1} / {questions.length}</span>
            <button onClick={() => setFlagged(p => ({ ...p, [currentIndex]: !p[currentIndex] }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all ${isCurrentFlagged ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30' : 'bg-secondary text-muted-foreground hover:bg-amber-400/20 hover:text-amber-600'}`}>
              <Flag className={`w-5 h-5 ${isCurrentFlagged ? 'fill-white' : ''}`} />
              {isCurrentFlagged ? 'محدد للمراجعة' : 'تعليم للمراجعة'}
            </button>
          </div>

          {isCurrentFlagged && (
            <div className="flex items-center gap-3 p-4 bg-amber-400/10 border-2 border-amber-400/30 rounded-2xl animate-in slide-in-from-top-2">
              <Flag className="w-5 h-5 text-amber-600 fill-amber-400 flex-shrink-0" />
              <p className="text-amber-700 font-black text-sm">هذا السؤال معلم للمراجعة — راجعه قبل التسليم</p>
            </div>
          )}

          <h2 className="text-2xl md:text-3xl font-black leading-relaxed text-right" dir="rtl">{currentQ.text}</h2>

          {currentQ.imageUrl && (
            <>
              <div 
                className="relative group rounded-3xl overflow-hidden border-2 border-border shadow-sm bg-white/5 p-4 flex justify-center cursor-pointer hover:border-primary transition-all"
                onClick={() => setIsImageOpen(true)}
              >
                <img 
                  src={currentQ.imageUrl} 
                  alt="Question Illustration" 
                  className="max-h-[250px] md:max-h-[300px] w-auto object-contain rounded-2xl"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-black/70 text-white px-6 py-3 rounded-2xl font-black text-lg flex items-center gap-3 backdrop-blur-md">
                    🔍 تكبير الصورة
                  </div>
                </div>
              </div>

              {isImageOpen && (
                <div 
                  className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-12 backdrop-blur-md animate-in fade-in duration-300"
                  onClick={() => setIsImageOpen(false)}
                >
                  <button 
                    onClick={() => setIsImageOpen(false)}
                    className="absolute top-6 right-6 md:top-10 md:right-10 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <img 
                    src={currentQ.imageUrl} 
                    alt="Expanded Illustration" 
                    className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {(currentQ.options as string[]).map(option => (
              <button key={option} onClick={() => setAnswers({ ...answers, [currentIndex]: option })}
                className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 text-right font-bold text-base md:text-lg transition-all flex items-center justify-between ${
                  answers[currentIndex] === option
                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'bg-secondary/30 border-border hover:border-primary/40 hover:bg-secondary/60'
                }`} dir="rtl">
                <span>{option}</span>
                <div className={`w-7 h-7 rounded-full border-3 flex-shrink-0 ${answers[currentIndex] === option ? 'border-white bg-white/30' : 'border-border'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center px-1 md:px-2 gap-2">
          <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(p => p - 1)}
            className="flex items-center justify-center gap-1 md:gap-3 px-4 md:px-8 py-3 md:py-4 bg-secondary rounded-xl md:rounded-2xl font-black disabled:opacity-30 hover:bg-border transition-all text-sm md:text-base flex-1 md:flex-none">
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /> السابق
          </button>
          <span className="text-muted-foreground font-black text-xs md:text-sm whitespace-nowrap">{currentIndex + 1} / {questions.length}</span>
          <button disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(p => p + 1)}
            className="flex items-center justify-center gap-1 md:gap-3 px-4 md:px-8 py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black disabled:opacity-30 hover:scale-105 transition-all shadow-lg shadow-primary/20 text-sm md:text-base flex-1 md:flex-none">
            التالي <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-[3rem] p-10 text-center space-y-6 border-2 shadow-2xl animate-in zoom-in-95"
            style={{ borderColor: flaggedCount > 0 ? 'rgb(251 191 36 / 0.4)' : undefined }}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${flaggedCount > 0 ? 'bg-amber-400/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {flaggedCount > 0 ? <Flag className="w-12 h-12 fill-amber-400" /> : <AlertTriangle className="w-12 h-12" />}
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black">{flaggedCount > 0 ? 'لديك أسئلة معلمة!' : 'تسليم الإختبار؟'}</h3>
              {flaggedCount > 0 && (
                <div className="p-4 bg-amber-400/10 border-2 border-amber-400/30 rounded-2xl">
                  <p className="text-amber-700 font-black">🚩 {flaggedCount} {flaggedCount === 1 ? 'سؤال معلم' : 'أسئلة معلمة'} لم تراجعها</p>
                </div>
              )}
              {(questions.length - answeredCount) > 0 && (
                <div className="p-4 bg-rose-500/10 rounded-2xl">
                  <p className="text-rose-600 font-black">⚠️ {questions.length - answeredCount} سؤال بدون إجابة</p>
                </div>
              )}
              <p className="text-muted-foreground font-bold">أجبت على {answeredCount} من {questions.length} سؤال</p>
            </div>
            <div className="flex flex-col gap-3">
              {flaggedCount > 0 && (
                <button onClick={() => {
                    setShowConfirm(false);
                    const first = Object.entries(flagged).find(([, v]) => v);
                    if (first) setCurrentIndex(Number(first[0]));
                  }}
                  className="w-full py-4 bg-amber-400 text-white rounded-2xl font-black hover:bg-amber-500 transition-all flex items-center justify-center gap-2">
                  <Flag className="w-5 h-5 fill-white" /> مراجعة الأسئلة المعلمة
                </button>
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 bg-secondary rounded-2xl font-black hover:bg-border transition-all">العودة</button>
                <button onClick={doSubmit} disabled={submitting}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تسليم نهائي'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
