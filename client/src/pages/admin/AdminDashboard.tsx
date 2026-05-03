import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Question } from '../../types/quiz';
import QuestionTable from '../../components/admin/QuestionTable';
import QuestionForm from '../../components/admin/QuestionForm';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch('/api/questions/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const data = await response.json();
      setQuestions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [user]);

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const token = await user!.getIdToken();
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete question');

      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete question');
    }
  };

  const handleSaveQuestion = async (data: Omit<Question, 'id'>) => {
    try {
      const token = await user!.getIdToken();
      const isEditing = !!editingQuestion;
      
      const url = isEditing 
        ? `/api/questions/${editingQuestion.id}` 
        : '/api/questions';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to save question');
      
      await fetchQuestions();
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save question');
      throw err;
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load data</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full py-8 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your question bank and content.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="max-w-3xl mx-auto">
          <QuestionForm 
            initialData={editingQuestion}
            onSave={handleSaveQuestion}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : (
        <QuestionTable 
          questions={questions}
          onEdit={handleEditQuestion}
          onDelete={handleDeleteQuestion}
        />
      )}
    </div>
  );
}
