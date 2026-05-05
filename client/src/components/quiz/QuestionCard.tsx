import { useState } from 'react';
import { X } from 'lucide-react';
import type { Question } from '../../types/quiz';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onSelect: (option: string) => void;
  onStrikeOut?: (option: string) => void;
  struckOutOptions?: string[];
  isAnswered: boolean;
  correctAnswer: string;
  isStudyMode?: boolean;
  showExplanation?: boolean;
}

export default function QuestionCard({ 
  question, 
  selectedAnswer, 
  onSelect, 
  onStrikeOut,
  struckOutOptions = [],
  isAnswered, 
  correctAnswer,
  isStudyMode = false,
  showExplanation = false
}: QuestionCardProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-border p-5 md:p-8 lg:p-10 rounded-3xl md:rounded-[2.5rem] shadow-sm space-y-6 md:space-y-8">
        <div className="space-y-4 md:space-y-6">
          <div className="flex justify-between items-start">
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">
              {question.category}
            </span>
            {isAnswered && isStudyMode && (
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedAnswer === correctAnswer ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                {selectedAnswer === correctAnswer ? 'Correct Answer' : 'Incorrect Answer'}
              </span>
            )}
          </div>
          
          <h2 className="text-xl md:text-2xl lg:text-4xl font-black text-foreground leading-tight tracking-tight">
            {question.text}
          </h2>

          {question.imageUrl && (
            <>
              <div 
                className="relative group rounded-3xl overflow-hidden border-2 border-border shadow-sm bg-white/5 p-4 flex justify-center cursor-pointer hover:border-primary transition-all"
                onClick={() => setIsImageOpen(true)}
              >
                <img 
                  src={question.imageUrl} 
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
                    src={question.imageUrl} 
                    alt="Expanded Illustration" 
                    className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {question.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index);
            const isSelected = selectedAnswer === option;
            const isActuallyCorrect = option === correctAnswer;
            const isStruck = struckOutOptions.includes(option);
            
            let variantClass = "bg-secondary/30 border-border hover:border-primary/50";
            if (isSelected) {
              if (isStudyMode && isAnswered) {
                variantClass = isActuallyCorrect ? "bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20 scale-[1.02]" : "bg-red-500 text-white border-red-500 shadow-xl shadow-red-500/20 scale-[1.02]";
              } else {
                variantClass = "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]";
              }
            } else if (isStudyMode && isAnswered && isActuallyCorrect) {
              variantClass = "bg-emerald-500/10 border-emerald-500 text-emerald-600";
            }

            return (
              <div key={index} className="relative group">
                <button
                  disabled={isAnswered && isStudyMode}
                  onClick={() => onSelect(option)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!(isAnswered && isStudyMode)) onStrikeOut?.(option);
                  }}
                  className={`relative w-full flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] border-2 text-left transition-all duration-300 ${variantClass} ${isStruck ? 'opacity-40 grayscale-[0.5]' : ''}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl transition-all flex-shrink-0 ${
                    isSelected ? 'bg-white/20' : 'bg-white text-primary group-hover:bg-primary group-hover:text-white shadow-sm'
                  }`}>
                    {letter}
                  </div>
                  <span className={`flex-1 font-black text-base md:text-xl leading-snug ${isStruck ? 'line-through decoration-destructive/50 decoration-4' : ''}`}>
                    {option}
                  </span>
                  
                  {!isAnswered && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onStrikeOut?.(option);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-all"
                      title="Strike out (Right click)"
                    >
                      <span className="text-xs font-black">X</span>
                    </button>
                  )}
                </button>
                {isStruck && !isSelected && (
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-0.5 bg-destructive/30 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {(showExplanation || (isStudyMode && isAnswered)) && question.explanation && (
          <div className="p-5 md:p-8 bg-primary/5 border border-primary/10 rounded-3xl md:rounded-[2.5rem] animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-sm italic">i</div>
              <h4 className="font-black text-primary uppercase tracking-widest text-sm">التفسير العلمي</h4>
            </div>
            <p className="text-muted-foreground leading-relaxed font-bold text-lg" dir="rtl">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
