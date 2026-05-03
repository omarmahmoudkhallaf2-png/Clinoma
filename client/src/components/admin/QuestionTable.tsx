import type { Question } from '../../types/quiz';
import { Edit, Trash2 } from 'lucide-react';

interface QuestionTableProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionTable({ questions, onEdit, onDelete }: QuestionTableProps) {
  return (
    <div className="overflow-x-auto bg-card border border-border rounded-xl shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs border-b border-border">
          <tr>
            <th className="px-6 py-4 font-medium">Question Preview</th>
            <th className="px-6 py-4 font-medium">Category</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {questions.map((question) => (
            <tr key={question.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4 font-medium text-card-foreground max-w-xs truncate">
                {question.text}
              </td>
              <td className="px-6 py-4 text-muted-foreground">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {question.category}
                </span>
              </td>
              <td className="px-6 py-4">
                {question.isPremium ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                    Free
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onEdit(question)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(question.id!)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {questions.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                No questions found. Add your first question to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
