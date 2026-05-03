import clsx from 'clsx';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Question } from '../../types/quiz';

interface QuestionCardProps {
  question: Question;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  showExplanation: boolean;
}

export default function QuestionCard({ question, selectedOption, onSelectOption, showExplanation }: QuestionCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full mb-4">
          {question.category}
        </span>
        <h2 className="text-xl font-semibold text-card-foreground leading-relaxed">
          {question.text}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === question.correctAnswer;
          
          let optionClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 flex justify-between items-center ";
          
          if (!showExplanation) {
            optionClass += isSelected 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-secondary/50";
          } else {
            if (isCorrect) {
              optionClass += "border-green-500 bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-300";
            } else if (isSelected && !isCorrect) {
              optionClass += "border-red-500 bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-300";
            } else {
              optionClass += "border-border opacity-50";
            }
          }

          return (
            <button
              key={index}
              disabled={showExplanation}
              onClick={() => onSelectOption(option)}
              className={clsx(optionClass, "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background")}
            >
              <span className="font-medium">{option}</span>
              {showExplanation && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="mt-8 p-5 bg-muted rounded-lg border border-border animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            Explanation
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
