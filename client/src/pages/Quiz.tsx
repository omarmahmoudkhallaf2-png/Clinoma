import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Question, QuizAttempt } from '../types/quiz';
import QuestionCard from '../components/quiz/QuestionCard';
import ResultCard from '../components/quiz/ResultCard';
import { Loader2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';

export default function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Setup parameters from QuizSetup
  const setupParams = location.state as { category: string; count: number; isTimed: boolean } | null;
  const isTimed = setupParams?.isTimed ?? false;
  const SECONDS_PER_QUESTION = 60;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [isCheating, setIsCheating] = useState(false);

  // Anti-Cheat Mechanism
  useEffect(() => {
    if (isFinished) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert("Right-click is disabled during the exam.");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsCheating(true);
      } else {
        setIsCheating(false);
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Copying is disabled during the exam.");
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
    };
  }, [isFinished]);

  // Timer logic
  useEffect(() => {
    if (!isTimed || isFinished || showExplanation || questions.length === 0) return;

    if (timeLeft <= 0) {
      handleSubmitAnswer(true); // auto submit
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimed, isFinished, showExplanation, questions.length]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch('/api/questions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch questions');
        
        let data: Question[] = await response.json();
        
        // Filter by category if specified
        if (setupParams?.category && setupParams.category !== 'all') {
          data = data.filter(q => q.category === setupParams.category);
        }

        // Shuffle questions
        data = data.sort(() => 0.5 - Math.random());

        // Limit by count
        if (setupParams?.count) {
          data = data.slice(0, setupParams.count);
        }

        setQuestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user, setupParams]);

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmitAnswer = useCallback((_autoSubmit = false) => {
    // If auto submitting due to timeout and nothing selected, mark as incorrect
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setAttempts((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: selectedOption || 'TIMEOUT',
        isCorrect,
      },
    ]);

    setShowExplanation(true);
  }, [selectedOption, currentIndex, questions]);

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setTimeLeft(SECONDS_PER_QUESTION);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    setIsFinished(true);
    try {
      if (!user) return;
      const token = await user.getIdToken();
      await fetch('/api/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          score,
          total: questions.length,
          answers: attempts
        })
      });
    } catch (err) {
      console.error('Failed to save attempt', err);
    }
  };

  const handleRestart = () => {
    navigate('/quiz-setup');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Preparing your exam...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-semibold mb-2">No questions found</h2>
        <p className="text-muted-foreground mb-6">Could not find enough questions for this category.</p>
        <button onClick={() => navigate('/quiz-setup')} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Change Settings
        </button>
      </div>
    );
  }

  if (isFinished) {
    return <ResultCard score={score} total={questions.length} onRestart={handleRestart} />;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 animate-in fade-in">
      {/* Anti-cheat overlay */}
      {isCheating && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center">
          <ShieldAlert className="w-24 h-24 text-destructive mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Exam Paused</h2>
          <p className="text-xl text-muted-foreground max-w-lg text-center mb-8">
            You navigated away from the exam window. This action is recorded in strict exam mode. Please return to the window to continue.
          </p>
          <button 
            onClick={() => setIsCheating(false)}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl"
          >
            Resume Exam
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold">Exam Mode</h1>
          <span className="text-sm text-muted-foreground capitalize">{setupParams?.category || 'All'}</span>
        </div>
        
        <div className="flex items-center gap-6">
          {isTimed && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${
              timeLeft <= 10 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-secondary/20 text-secondary-foreground'
            }`}>
              <Clock className="w-5 h-5" />
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
          )}
          
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground font-medium text-sm mb-1">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="w-32 h-2 bg-secondary/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <QuestionCard 
        question={currentQuestion}
        selectedOption={selectedOption}
        onSelectOption={handleSelectOption}
        showExplanation={showExplanation}
      />

      <div className="mt-8 flex justify-end max-w-3xl mx-auto">
        {!showExplanation ? (
          <button
            onClick={() => handleSubmitAnswer(false)}
            disabled={!selectedOption}
            className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
