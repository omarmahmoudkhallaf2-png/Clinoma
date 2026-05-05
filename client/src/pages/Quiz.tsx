import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, where } from 'firebase/firestore';
import { updateUserProgress, logUserActivity, toggleBookmark } from '../lib/quizEngine';
import type { Question } from '../types/quiz';
import QuestionCard from '../components/quiz/QuestionCard';
import { Loader2, AlertCircle, Clock, Flag, ArrowRight, ZoomIn, ZoomOut } from 'lucide-react';

export default function Quiz() {
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const setupParams = location.state as { 
    courseId: string;
    subjectId: string; 
    count: number; 
    isTimed: boolean; 
    questions?: Question[]; 
    lectureNumber?: number;
    questionType?: string;
    feedbackMode?: 'instant' | 'deferred';
    retakeIncorrect?: boolean;
    mode?: 'adaptive' | 'random' | 'review' | 'srs' | 'wrong' | 'flagged';
    courseName?: string;
  } | null;

  const isTimed = setupParams?.isTimed ?? false;
  const isStudyMode = setupParams?.feedbackMode === 'instant';
  const retakeIncorrectEnabled = setupParams?.retakeIncorrect ?? false;
  const SECONDS_PER_QUESTION = 60;
  const courseId = setupParams?.courseId || 'F1';
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

        let q = query(collection(db, 'questions'), where('courseId', '==', courseId));
        
        if (setupParams?.subjectId && setupParams.subjectId !== 'all') {
          q = query(q, where('subjectId', '==', setupParams.subjectId));
        }

        const snap = await getDocs(q);
        let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        
        // Access Control
        if (!subscribed) {
          data = data.filter(item => item.accessType === 'free');
        }

        // Mode Filtering
        const questionType = setupParams?.questionType;
        if (questionType && questionType !== 'all' && questionType !== 'practice') {
          data = data.filter(item => item.questionType === questionType);
        }

        // Lecture Filtering
        const lectureNum = setupParams?.lectureNumber;
        if (lectureNum) {
          data = data.filter(item => item.lectureNumber === lectureNum);
        }

        // Shuffle and limit
        data = data.sort(() => Math.random() - 0.5).slice(0, setupParams?.count || 10);
        
        if (data.length === 0) {
          const lectureMsg = questionType === 'lectures' && lectureNum ? ` للمحاضرة ${lectureNum}` : '';
          setError(`لم يتم العثور على أسئلة ${questionType === 'lectures' ? 'للمحاضرات' : questionType === 'past_papers' ? 'للسنين السابقة' : ''}${lectureMsg} في هذا القسم حالياً.`);
        } else {
          setQuestions(data);
          setTimeLeft(data.length * SECONDS_PER_QUESTION);
          
          if (user) {
            logUserActivity(user.uid, {
              action: 'Started Quiz',
              meta: `${data.length} questions in ${courseId}`,
              courseName: setupParams?.courseName || courseId,
              folder: courseId
            });
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user, courseId, subscribed]);

  useEffect(() => {
    if (!isTimed || isFinished || questions.length === 0) return;
    if (timeLeft <= 0) {
      handleFinishQuiz();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimed, isFinished, questions.length]);

  const handleStrikeOut = (option: string) => {
    setStruckOut(prev => {
      const current = prev[currentIndex] || [];
      const updated = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
      return { ...prev, [currentIndex]: updated };
    });
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered && isStudyMode) return;
    setSelectedOption(option);
    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    setAnswers(prev => ({ ...prev, [currentIndex]: option }));

    // Record progress in real-time
    if (user) {
      updateUserProgress(user.uid, currentQuestion.id, isCorrect, isCorrect ? 3 : 0);
    }

    if (isStudyMode) {
      setIsAnswered(true);
      if (isCorrect) setScore(prev => prev + 1);
      else if (retakeIncorrectEnabled) {
        const nextQuestions = [...questions];
        const insertIndex = Math.min(currentIndex + 3, nextQuestions.length);
        nextQuestions.splice(insertIndex, 0, currentQuestion);
        setQuestions(nextQuestions);
      }
    }
  };

  const handleFlag = async () => {
    if (!user) return;
    const isBookmarked = await toggleBookmark(user.uid, currentQuestion.id);
    setFlagged(prev => ({ ...prev, [currentIndex]: isBookmarked }));
  };

  const handleNextQuestion = () => {
    if (!isStudyMode) {
      const currentQuestion = questions[currentIndex];
      if (selectedOption === currentQuestion.correctAnswer) {
        setScore(prev => prev + 1);
      }
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(answers[currentIndex + 1] || null);
      setIsAnswered(false);
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedOption(answers[currentIndex - 1] || null);
      setIsAnswered(false);
    }
  };

  const handleFinishQuiz = async () => {
    setIsFinished(true);
    if (user) {
      try {
        await addDoc(collection(db, 'results'), {
          userId: user.uid,
          score,
          total: questions.length,
          category: setupParams?.subjectId || 'General',
          createdAt: new Date()
        });

        // Log completion
        logUserActivity(user.uid, {
          action: 'Finished Quiz',
          meta: `Score: ${score}/${questions.length}`,
          courseName: setupParams?.courseName,
          subjectId: setupParams?.subjectId,
          folder: setupParams?.courseId
        });

      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <Loader2 className="w-12 h-12 animate-spin text-primary" />
    <p className="font-bold text-xl animate-pulse">Loading Question Bank...</p>
  </div>;

  if (error) return <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
    <AlertCircle className="w-20 h-20 text-destructive" />
    <h2 className="text-3xl font-black">{error}</h2>
    <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-primary text-white rounded-2xl font-bold">Back to Dashboard</button>
  </div>;

  if (isFinished) return <div className="max-w-3xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-500">
    <div className="bg-card border-2 border-border rounded-[3rem] p-12 text-center shadow-2xl space-y-8">
      <div className="text-8xl">🎉</div>
      <h1 className="text-5xl font-black">Quiz Completed!</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="p-8 bg-secondary/50 rounded-[2rem] border border-border">
          <div className="text-sm font-bold text-muted-foreground uppercase">Your Score</div>
          <div className="text-5xl font-black text-primary">{score} / {questions.length}</div>
        </div>
        <div className="p-8 bg-secondary/50 rounded-[2rem] border border-border">
          <div className="text-sm font-bold text-muted-foreground uppercase">Accuracy</div>
          <div className="text-5xl font-black text-emerald-500">{Math.round((score/questions.length)*100)}%</div>
        </div>
      </div>
      <button onClick={() => navigate('/dashboard')} className="w-full py-6 bg-primary text-white rounded-3xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
        Back to Dashboard
      </button>
    </div>
  </div>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="mx-auto py-8 px-4 space-y-8 origin-top transition-transform duration-300" style={{ maxWidth: `${64 * zoomLevel}rem`, zoom: zoomLevel >= 1 ? zoomLevel : undefined, transform: zoomLevel < 1 ? `scale(${zoomLevel})` : undefined }}>
      <div className="flex justify-between items-center bg-card border-2 border-border p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Time Remaining</div>
            <div className="text-2xl font-black font-mono">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
        <div className="hidden md:flex bg-secondary/50 rounded-xl p-1 items-center border border-border">
          <button onClick={() => setZoomLevel(p => Math.max(0.7, p - 0.1))} className="p-2 hover:bg-white rounded-lg text-muted-foreground hover:text-primary transition-all" title="تصغير">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="px-4 font-black text-sm select-none min-w-[4rem] text-center">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={() => setZoomLevel(p => Math.min(1.5, p + 0.1))} className="p-2 hover:bg-white rounded-lg text-muted-foreground hover:text-primary transition-all" title="تكبير">
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-muted-foreground uppercase">Question</div>
          <div className="text-2xl font-black">{currentIndex + 1} <span className="text-muted-foreground text-sm">/ {questions.length}</span></div>
        </div>
      </div>

      <QuestionCard 
        question={currentQuestion}
        selectedAnswer={selectedOption}
        onSelect={handleSelectOption}
        isAnswered={isAnswered && isStudyMode}
        correctAnswer={currentQuestion.correctAnswer}
        isStudyMode={isStudyMode}
        struckOutOptions={struckOut[currentIndex] || []}
        onStrikeOut={handleStrikeOut}
      />

      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <button 
          onClick={handlePrevQuestion}
          disabled={currentIndex === 0}
          className="flex-1 py-4 md:py-5 bg-card border-2 border-border rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl hover:bg-secondary transition-all disabled:opacity-50"
        >
          Previous
        </button>
        
        <div className="flex gap-3 md:gap-4 flex-none md:flex-none">
          <button 
            onClick={handleFlag}
            className={`flex-1 md:flex-none flex items-center justify-center p-4 md:p-5 bg-card border-2 border-border rounded-2xl md:rounded-[2.5rem] transition-all ${flagged[currentIndex] ? 'bg-amber-500/10 border-amber-500' : 'hover:bg-secondary'}`}
          >
            <Flag className={`w-6 h-6 md:w-8 md:h-8 ${flagged[currentIndex] ? 'text-amber-500 fill-current' : 'text-muted-foreground'}`} />
          </button>

          <button 
            onClick={handleNextQuestion}
            className="flex-[2] md:flex-1 py-4 md:py-5 bg-primary text-white rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3"
          >
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
