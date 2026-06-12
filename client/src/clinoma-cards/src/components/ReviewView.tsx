import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import type { Question, Chapter } from '../types';
import { CHAPTERS } from '../data/chapters';
import { ExplanationDrawer } from './ExplanationDrawer';
import { renderCardContent } from '../utils/cardUtils';

interface ReviewViewProps {
  reviewIds: string[];
  allQuestions: Question[];
  onBack: () => void;
  onMarkMastered: (id: string) => void;
  onRemoveReview: (id: string) => void;
  startMixedSession: () => void;
}

export default function ReviewView({ 
  reviewIds, 
  allQuestions, 
  onBack, 
  onMarkMastered, 
  onRemoveReview,
  startMixedSession 
}: ReviewViewProps) {
  const reviewQuestions = allQuestions.filter(q => reviewIds.includes(q.id));

  // Group review questions by Chapter
  const reviewByChapter = CHAPTERS.map(ch => {
    const questionsInCh = reviewQuestions.filter(q => q.chapterId === ch.id);
    return {
      chapter: ch,
      questions: questionsInCh
    };
  }).filter(group => group.questions.length > 0);

  return (
    <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-1 font-display">Smart Review Hub</h2>
          <p className="text-slate-500 text-sm">Organized by chapter. Practice and reinforce items marked Hard or Very Hard.</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm px-4 py-2 border border-slate-205 rounded-xl bg-white shadow-sm shrink-0">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Index</span>
        </button>
      </div>

      {reviewQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 shadow-sm text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Review List is Empty</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Excellent! You have zero questions flagging for review. Once you mark flashcards as "Hard" or "Very Hard" during study, they will aggregate here.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button 
              onClick={onBack}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
            >
              Start Studying Chapters
            </button>
            <button 
              onClick={startMixedSession}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Brain className="w-4 h-4 text-blue-400" />
              <span>Full Mixed Session</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick Action: Start Mixed Session */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-105 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg leading-tight">Combined Quiz & Review Mixed Challenge</h4>
                <p className="text-slate-500 text-sm mt-0.5">Mixes and shuffles questions from your active review cards and standard banks into one active session.</p>
              </div>
            </div>
            <button
              onClick={startMixedSession}
              className="w-full md:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 text-sm shrink-0 whitespace-nowrap"
            >
              <Brain className="w-4 h-4" />
              <span>Launch Combined Mix</span>
            </button>
          </div>

          {/* Review items grouped by Chapter */}
          <div className="space-y-10">
            {reviewByChapter.map(({ chapter, questions }) => (
              <div key={chapter.id} className="space-y-4">
                {/* Chapter Title Badge */}
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                  <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">CH0{chapter.id}</span>
                  <h3 className="text-lg font-extrabold text-slate-800">{chapter.title}</h3>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {questions.length} card{questions.length === 1 ? '' : 's'} in review
                  </span>
                </div>

                {/* Question cards under this chapter */}
                <div className="grid grid-cols-1 gap-6">
                  {questions.map((q) => (
                    <ReviewCard 
                      key={q.id} 
                      q={q} 
                      onMarkMastered={onMarkMastered}
                      onRemoveReview={onRemoveReview}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ 
  q, 
  onMarkMastered, 
  onRemoveReview 
}: { 
  key?: any;
  q: Question; 
  onMarkMastered: (id: string) => void; 
  onRemoveReview: (id: string) => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <motion.div 
      layout
      className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded uppercase tracking-wider">
            {q.type.replace('-', ' ')}
          </span>
          {q.isClinical && (
            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded uppercase tracking-wider">
              Clinical Case
            </span>
          )}
          {q.explanation && (
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className={`text-[9px] font-black px-2.5 py-1 rounded transition-all flex items-center gap-1 active:scale-95 border cursor-pointer ${
                showExplanation
                  ? "bg-amber-500 hover:bg-amber-600 text-neutral-900 border-amber-500 shadow-sm"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
              }`}
              dir="rtl"
            >
              <span>💡 شرح</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onMarkMastered(q.id)}
            className="text-[10px] text-emerald-600 hover:text-white hover:bg-emerald-600 px-3 py-1.5 border border-emerald-200 hover:border-emerald-600 rounded-xl transition-all font-bold"
            title="Mark as Mastered (removes from review list)"
          >
            Mark Mastered
          </button>
          <button 
            onClick={() => onRemoveReview(q.id)}
            className="text-[10px] text-slate-500 hover:text-white hover:bg-slate-600 px-3 py-1.5 border border-slate-200 rounded-xl transition-all font-bold"
            title="Remove from review list"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="w-full mt-1">
        {renderCardContent(q.content)}
      </div>

      {/* Explanation Panel if toggled */}
      <ExplanationDrawer
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={q.explanation || ""}
        questionTitle={q.content}
        topic={q.topic}
      />

      {/* Answer Reveal Panel */}
      <div className="mt-2 border-t border-slate-100 pt-4">
        <button 
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showAnswer ? (
            <>
              <span>Hide Answer</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Reveal Solution</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <AnimatePresence>
          {showAnswer && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 overflow-hidden"
            >
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Model Answer details</div>
              <div className="space-y-3">
                {q.answer.split('\n').map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    </div>
                    <p className="text-slate-700 text-sm md:text-base leading-relaxed font-semibold">
                      {line.replace('• ', '').replace('- ', '')}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

