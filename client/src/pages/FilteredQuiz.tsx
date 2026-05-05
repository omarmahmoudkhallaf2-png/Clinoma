import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, PlayCircle } from 'lucide-react';
import type { Question } from '../types/quiz';

interface FilteredQuizProps {
  type: 'unsolved' | 'incorrect' | 'flagged';
}

export default function FilteredQuiz({ type }: FilteredQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userPlan } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        if (!user) return;
        
        // 1. Fetch all questions
        const qSnap = await getDocs(collection(db, 'questions'));
        const allQuestions = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
        
        // 2. Fetch all attempts for this user
        const attSnap = await getDocs(query(collection(db, 'attempts'), where('userId', '==', user.uid)));
        const attempts = attSnap.docs.map(doc => doc.data());
        
        let filtered: Question[] = [];

        if (type === 'unsolved') {
          const solvedIds = new Set(attempts.flatMap((a: any) => a.answers.map((ans: any) => ans.questionId)));
          filtered = allQuestions.filter(q => !solvedIds.has(q.id));
        } else if (type === 'incorrect') {
          const incorrectIds = new Set(attempts.flatMap((a: any) => a.answers.filter((ans: any) => !ans.isCorrect).map((ans: any) => ans.questionId)));
          filtered = allQuestions.filter(q => incorrectIds.has(q.id));
        } else if (type === 'flagged') {
          // Note: Flagging logic would need a 'flaggedQuestions' array in user doc
          // For now, let's assume we fetch from a 'flags' collection
          const flagSnap = await getDocs(query(collection(db, 'flags'), where('userId', '==', user.uid)));
          const flaggedIds = new Set(flagSnap.docs.map(doc => doc.data().questionId));
          filtered = allQuestions.filter(q => flaggedIds.has(q.id));
        }

        // Apply plan filter
        if (userPlan === 'free') {
          filtered = filtered.filter(q => !q.isPremium);
        }

        setQuestions(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [user, userPlan, type]);

  const startQuiz = () => {
    if (questions.length === 0) return;
    navigate('/quiz', { state: { questions, count: questions.length } });
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  const titles = {
    unsolved: 'Unsolved Questions',
    incorrect: 'My Mistakes',
    flagged: 'Flagged Questions'
  };

  return (
    <div className="max-w-4xl mx-auto text-center space-y-8 py-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold capitalize">{titles[type]}</h1>
        <p className="text-muted-foreground text-lg">
          You have {questions.length} {type} questions available to practice.
        </p>
      </div>

      {questions.length > 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 shadow-xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <PlayCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Ready to start?</h2>
          <p className="text-muted-foreground mb-8">This session will focus exclusively on your {type} questions.</p>
          <button
            onClick={startQuiz}
            className="px-12 py-4 bg-primary text-primary-foreground font-bold text-xl rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            Start Practice Session
          </button>
        </div>
      ) : (
        <div className="p-12 border-2 border-dashed border-border rounded-3xl">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold">No questions found</h2>
          <p className="text-muted-foreground">You don't have any {type} questions at the moment.</p>
        </div>
      )}
    </div>
  );
}
