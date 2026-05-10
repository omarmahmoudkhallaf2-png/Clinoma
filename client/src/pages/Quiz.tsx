import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { collection, query, getDocs, addDoc, where } from 'firebase/firestore';
import { updateUserProgress, logUserActivity, toggleBookmark } from '../lib/quizEngine';
import type { Question } from '../types/quiz';
import QuestionCard from '../components/quiz/QuestionCard';
import { Loader2, AlertCircle, Clock, Flag, ArrowRight, ArrowLeft, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function Quiz() {
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const setupParams = location.state as any;
  const searchParams = new URLSearchParams(location.search);
  
  const themeId = searchParams.get('themeId');
  const moduleId = searchParams.get('moduleId');
  const categoryId = searchParams.get('categoryId');
  const chapterId = searchParams.get('chapterId');
  const divisionId = searchParams.get('divisionId');

  const isTimed = setupParams?.isTimed ?? false;
  const isStudyMode = setupParams?.feedbackMode === 'instant';
  const retakeIncorrectEnabled = setupParams?.retakeIncorrect ?? false;
  const SECONDS_PER_QUESTION = 60;
  const courseId = setupParams?.courseId || 'F1';
  const isExam = setupParams?.isExam || false;
  const subscribed = isSubscribed(courseId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [struckOut, setStruckOut] = useState<Record<number, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (setupParams?.questions) {
          setQuestions(setupParams.questions);
          setTimeLeft(setupParams.questions.length * SECONDS_PER_QUESTION);
          setLoading(false);
          return;
        }

        let q;
        if (themeId && categoryId && chapterId) {
          // Data Themes Mode
          if (divisionId) {
            q = query(
              collection(db, 'questions'), 
              where('themeId', '==', themeId),
              where('moduleId', '==', moduleId),
              where('categoryId', '==', categoryId),
              where('chapterId', '==', chapterId),
              where('divisionId', '==', divisionId)
            );
          } else {
            q = query(
              collection(db, 'questions'), 
              where('themeId', '==', themeId),
              where('moduleId', '==', moduleId),
              where('categoryId', '==', categoryId),
              where('chapterId', '==', chapterId)
            );
          }
        } else {
          // Standard Course Mode
          q = query(collection(db, 'questions'), where('courseId', '==', courseId));
        }

        const snap = await getDocs(q);
        let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        
        if (!subscribed && !themeId) data = data.filter(item => item.accessType === 'free');
        
        // Only apply standard filters if NOT in theme mode
        if (!themeId) {
          if (setupParams?.subjectId && setupParams.subjectId !== 'all') {
            data = data.filter(item => item.subjectId === setupParams.subjectId);
          }
          if (setupParams?.questionType && setupParams.questionType !== 'all') data = data.filter(item => item.questionType === setupParams.questionType);
          if (setupParams?.lectureNumber) data = data.filter(item => item.lectureNumber === setupParams.lectureNumber);
        }

        data = data.sort(() => Math.random() - 0.5).slice(0, setupParams?.count || 100);
        
        if (data.length === 0) {
          setError(`لم يتم العثور على أسئلة في هذا القسم حالياً.`);
        } else {
          setQuestions(data);
          setTimeLeft(data.length * SECONDS_PER_QUESTION);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [user, courseId, subscribed, themeId, moduleId, categoryId, chapterId, divisionId]);

  useEffect(() => {
    if (!isTimed || isFinished || questions.length === 0) return;
    if (timeLeft <= 0) {
      handleFinishQuiz();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimed, isFinished, questions.length]);

  const handleSelectOption = (option: string) => {
    if (isAnswered && isStudyMode) return;
    setSelectedOption(option);
    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    setAnswers(prev => ({ ...prev, [currentIndex]: option }));

    if (user) updateUserProgress(user.uid, currentQuestion.id, isCorrect, isCorrect ? 3 : 0, isExam);

    if (isStudyMode) {
      setIsAnswered(true);
      if (isCorrect) setScore(prev => prev + 1);
      else if (retakeIncorrectEnabled) {
        const nextQuestions = [...questions];
        nextQuestions.splice(Math.min(currentIndex + 3, nextQuestions.length), 0, currentQuestion);
        setQuestions(nextQuestions);
      }
    }
  };

  const handleFlag = async () => {
    if (!user || isExam) return;
    const isBookmarked = await toggleBookmark(user.uid, questions[currentIndex].id, isExam);
    setFlagged(prev => ({ ...prev, [currentIndex]: isBookmarked }));
  };

  const handleNextQuestion = () => {
    if (!isStudyMode && selectedOption === questions[currentIndex].correctAnswer) setScore(p => p + 1);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(p => p + 1);
      setSelectedOption(answers[currentIndex + 1] || null);
      setIsAnswered(false);
    } else handleFinishQuiz();
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(p => p - 1);
      setSelectedOption(answers[currentIndex - 1] || null);
      setIsAnswered(false);
    }
  };

  const handleFinishQuiz = async () => {
    setIsFinished(true);
    if (user) {
      addDoc(collection(db, 'results'), {
        userId: user.uid,
        score,
        total: questions.length,
        category: setupParams?.subjectId || 'General',
        createdAt: new Date()
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <Loader2 className="w-12 h-12 text-primary" />
      </motion.div>
      <p className="text-lg font-bold animate-pulse">جاري تحميل بنك الأسئلة...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-6">
      <AlertCircle className="w-20 h-20 text-destructive opacity-20" />
      <h2 className="text-2xl font-bold">{error}</h2>
      <Button onClick={() => navigate('/dashboard')}>العودة للرئيسية</Button>
    </div>
  );

  if (isFinished) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-xl w-full border-none shadow-2xl overflow-hidden">
        <CardContent className="p-12 text-center space-y-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl">🎉</motion.div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">اكتمل الاختبار!</h1>
            <p className="text-muted-foreground">لقد قمت بعمل رائع اليوم.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-muted rounded-2xl">
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">النتيجة</div>
              <div className="text-3xl font-bold text-primary">{score} / {questions.length}</div>
            </div>
            <div className="p-6 bg-muted rounded-2xl">
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">الدقة</div>
              <div className="text-3xl font-bold text-emerald-500">{Math.round((score/questions.length)*100)}%</div>
            </div>
          </div>
          <Button className="w-full h-14 text-lg" onClick={() => navigate('/dashboard')}>العودة للوحة التحكم</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Zen Top Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-lg">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(p => Math.max(0.7, p-0.1))}><ZoomOut className="w-3.5 h-3.5" /></Button>
              <span className="text-[10px] font-bold min-w-[40px] text-center">{Math.round(zoomLevel*100)}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(p => Math.min(1.5, p+0.1))}><ZoomIn className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question</span>
            <span className="text-sm font-bold">{currentIndex + 1} of {questions.length}</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-muted">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <main 
        className="max-w-4xl mx-auto p-6 mt-8 space-y-8"
        style={{ zoom: zoomLevel }}
      >
        <AnimatePresence mode="wait">
          <QuestionCard 
            key={currentIndex}
            question={questions[currentIndex]}
            selectedAnswer={selectedOption}
            onSelect={handleSelectOption}
            isAnswered={isAnswered && isStudyMode}
            correctAnswer={questions[currentIndex].correctAnswer}
            isStudyMode={isStudyMode}
            struckOutOptions={struckOut[currentIndex] || []}
            onStrikeOut={(opt) => setStruckOut(p => ({ ...p, [currentIndex]: p[currentIndex]?.includes(opt) ? p[currentIndex].filter(o => o !== opt) : [...(p[currentIndex] || []), opt] }))}
          />
        </AnimatePresence>

        <div className="flex items-center gap-4 flex-row-reverse">
          <Button 
            className="flex-1 h-14 text-lg gap-2"
            onClick={handleNextQuestion}
          >
            {currentIndex === questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي'}
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={handleFlag}
            className={cn("h-14 w-14", flagged[currentIndex] && "text-amber-500 border-amber-500 bg-amber-500/5")}
          >
            <Flag className={cn("w-6 h-6", flagged[currentIndex] && "fill-current")} />
          </Button>

          <Button 
            variant="ghost"
            disabled={currentIndex === 0}
            onClick={handlePrevQuestion}
            className="h-14 px-8 font-bold gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            السابق
          </Button>
        </div>
      </main>
    </div>
  );
}
