import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, RotateCcw, LayoutDashboard } from 'lucide-react';

interface ResultCardProps {
  score: number;
  total: number;
  category?: string;
  onRestart: () => void;
}

export default function ResultCard({ score, total, category, onRestart }: ResultCardProps) {
  const navigate = useNavigate();
  const percentage = Math.round((score / total) * 100) || 0;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-8 w-full max-w-2xl mx-auto text-center animate-in zoom-in-95 duration-500">
      <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
      {category && <p className="text-lg font-medium text-primary mb-1">{category}</p>}
      <p className="text-muted-foreground mb-8">Here's how you performed.</p>

      <div className="flex justify-center mb-8">
        <div className="relative w-48 h-48 rounded-full border-8 border-muted flex items-center justify-center">
          <svg 
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              className="text-primary stroke-current transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
              strokeDasharray={`${(percentage / 100) * 289} 289`}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-foreground">{percentage}%</span>
            <span className="text-sm font-medium text-muted-foreground mt-1">Score</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex flex-col items-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
          <span className="text-2xl font-bold text-green-700 dark:text-green-400">{score}</span>
          <span className="text-sm font-medium text-green-600 dark:text-green-500">Correct</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col items-center">
          <XCircle className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-2xl font-bold text-red-700 dark:text-red-400">{total - score}</span>
          <span className="text-sm font-medium text-red-600 dark:text-red-500">Incorrect</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
        >
          <RotateCcw className="w-5 h-5" />
          Restart Quiz
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <LayoutDashboard className="w-5 h-5" />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
