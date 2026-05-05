import { useState } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '../../types/quiz';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';

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
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 md:space-y-8"
    >
      <Card className="border-none shadow-xl shadow-foreground/5 overflow-hidden">
        <CardContent className="p-6 md:p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-row-reverse" dir="rtl">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {question.category}
              </span>
              <AnimatePresence>
                {isAnswered && isStudyMode && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      selectedAnswer === correctAnswer ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {selectedAnswer === correctAnswer ? (
                      <><Check className="w-3 h-3" /> إجابة صحيحة</>
                    ) : (
                      <><AlertCircle className="w-3 h-3" /> إجابة خاطئة</>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <h2 className="text-xl md:text-3xl font-bold text-foreground leading-tight tracking-tight text-right" dir="rtl">
              {question.text}
            </h2>

            {question.imageUrl && (
              <>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="relative group rounded-xl overflow-hidden border bg-muted/30 p-2 flex justify-center cursor-pointer"
                  onClick={() => setIsImageOpen(true)}
                >
                  <img 
                    src={question.imageUrl} 
                    alt="Question Illustration" 
                    className="max-h-[300px] w-auto object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 text-black px-4 py-2 rounded-lg font-bold text-sm backdrop-blur-sm shadow-xl">
                      🔍 تكبير الصورة
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isImageOpen && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
                      onClick={() => setIsImageOpen(false)}
                    >
                      <button className="absolute top-6 right-6 p-2 bg-muted rounded-full hover:bg-muted/80 transition-all">
                        <X className="w-6 h-6" />
                      </button>
                      <motion.img 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        src={question.imageUrl} 
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        onClick={e => e.stopPropagation()}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === option;
              const isActuallyCorrect = option === correctAnswer;
              const isStruck = struckOutOptions.includes(option);
              
              let variantStyle = "border-border hover:border-primary/50 hover:bg-accent/50";
              if (isSelected) {
                if (isStudyMode && isAnswered) {
                  variantStyle = isActuallyCorrect 
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-destructive border-destructive text-white shadow-lg shadow-destructive/20";
                } else {
                  variantStyle = "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20";
                }
              } else if (isStudyMode && isAnswered && isActuallyCorrect) {
                variantStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-600";
              }

              return (
                <button
                  key={index}
                  disabled={isAnswered && isStudyMode}
                  onClick={() => onSelect(option)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!(isAnswered && isStudyMode)) onStrikeOut?.(option);
                  }}
                  className={cn(
                    "group relative w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                    variantStyle,
                    isStruck && !isSelected && "opacity-40 grayscale-[0.5]"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all flex-shrink-0",
                    isSelected ? "bg-white/20" : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                  )}>
                    {letter}
                  </div>
                  <span className={cn(
                    "flex-1 font-bold text-base text-right",
                    isStruck && "line-through decoration-destructive/50 decoration-2"
                  )} dir="rtl">
                    {option}
                  </span>
                  
                  {!isAnswered && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onStrikeOut?.(option);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 rounded-md text-destructive transition-all"
                    >
                      <X className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {(showExplanation || (isStudyMode && isAnswered)) && question.explanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-primary/5 border border-primary/10 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-3 flex-row-reverse" dir="rtl">
                  <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white">
                    <Info className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-primary text-sm uppercase tracking-wide">التفسير العلمي</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed font-medium text-sm text-right" dir="rtl">
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
