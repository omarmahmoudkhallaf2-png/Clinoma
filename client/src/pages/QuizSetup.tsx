import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Clock, Settings, Play, Loader2 } from 'lucide-react';

export default function QuizSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timerMode, setTimerMode] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch('/api/questions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const questions = await response.json();
          const uniqueCategories = Array.from(new Set(questions.map((q: any) => q.category)));
          setCategories(uniqueCategories as string[]);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  const handleStartQuiz = () => {
    // Navigate to quiz with setup parameters via state
    navigate('/quiz', { 
      state: { 
        category: selectedCategory, 
        count: questionCount, 
        isTimed: timerMode 
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading setup...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Test Configuration</h1>
          </div>
          <p className="text-primary-foreground/80">Customize your practice session</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Select Subject/System
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedCategory === 'all' 
                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                    : 'bg-background border-border hover:border-primary/50 hover:bg-secondary/10'
                }`}
              >
                All Subjects
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all capitalize ${
                    selectedCategory === cat 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'bg-background border-border hover:border-primary/50 hover:bg-secondary/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Number of Questions
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="5" 
                max="40" 
                step="5"
                value={questionCount} 
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="w-12 text-center font-bold text-xl bg-secondary/20 py-1 rounded-lg">
                {questionCount}
              </span>
            </div>
          </div>

          {/* Timer Mode */}
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Exam Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTimerMode(true)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  timerMode 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <div className="font-bold mb-1">Timed Mode</div>
                <div className="text-xs text-muted-foreground">Strict 60s per question. Simulates real exam stress.</div>
              </button>
              <button
                onClick={() => setTimerMode(false)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  !timerMode 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <div className="font-bold mb-1">Tutor Mode</div>
                <div className="text-xs text-muted-foreground">No timer. Learn at your own pace with instant explanations.</div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-card border-t border-border flex justify-end">
          <button
            onClick={handleStartQuiz}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}
