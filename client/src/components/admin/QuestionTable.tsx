import { Trash2, Edit2, AlertTriangle, ShieldCheck, Tag, HelpCircle, Lock, Unlock } from 'lucide-react';
import type { Question } from '../../types/quiz';

interface QuestionTableProps {
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionTable({ questions, onEdit, onDelete }: QuestionTableProps) {
  
  const calculateHealth = (q: Question) => {
    let score = 0;
    if (q.text) score += 20;
    if (q.options?.length === 4) score += 20;
    if (q.correctAnswer) score += 20;
    if (q.explanation) score += 20;
    if (q.subjectId && q.courseId) score += 20;
    return score;
  };

  return (
    <div className="overflow-x-auto rounded-[3rem] border-2 border-border bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-secondary/30 border-b-2 border-border">
          <tr>
            <th className="px-8 py-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Question Content</th>
            <th className="px-8 py-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Course & Subject</th>
            <th className="px-8 py-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Access</th>
            <th className="px-8 py-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Health</th>
            <th className="px-8 py-6 font-black text-xs uppercase tracking-widest text-muted-foreground">Status</th>
            <th className="px-8 py-6 font-black text-xs uppercase tracking-widest text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => {
            const health = calculateHealth(q);
            return (
              <tr key={q.id} className="border-b border-border/50 hover:bg-secondary/5 transition-colors group">
                <td className="px-8 py-6 max-w-md">
                  <div className="space-y-2">
                    <p className="font-black text-lg line-clamp-2 leading-snug group-hover:text-primary transition-colors">{q.text}</p>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-black text-muted-foreground bg-secondary px-2 py-0.5 rounded-md uppercase">
                        <Tag className="w-3 h-3" /> {q.questionType || 'PRACTICE'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <p className="font-black text-sm uppercase text-primary">{q.courseId}</p>
                    <p className="font-bold text-xs text-muted-foreground truncate max-w-[150px]">{q.subjectId}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                    q.accessType === 'free' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {q.accessType === 'free' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {q.accessType || 'paid'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          health >= 80 ? 'bg-emerald-500' : health >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${health}%` }}
                      />
                    </div>
                    <span className="text-xs font-black">{health}%</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase ${
                    q.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' :
                    q.status === 'review' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-indigo-500/10 text-indigo-600'
                  }`}>
                    {q.status === 'published' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {q.status || 'draft'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => onEdit(q)}
                      className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDelete(q.id)}
                      className="p-3 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {questions.length === 0 && (
        <div className="p-20 text-center space-y-4">
          <HelpCircle className="w-20 h-20 text-muted-foreground mx-auto opacity-20" />
          <p className="text-2xl font-black text-muted-foreground italic">No content found matching filters.</p>
        </div>
      )}
    </div>
  );
}
