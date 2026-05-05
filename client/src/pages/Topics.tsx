import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';

const FIXED_SUBJECTS = ['Anatomy', 'Physiology', 'Histology', 'Biochemistry'];

export default function Topics() {
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userPlan } = useAuth();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questions = querySnapshot.docs.map(doc => doc.data());
        
        const filtered = questions.filter(q => userPlan === 'premium' || !q.isPremium);
        
        const counts: Record<string, number> = {
          'Anatomy': 0,
          'Physiology': 0,
          'Histology': 0,
          'Biochemistry': 0
        };

        filtered.forEach(q => {
          if (FIXED_SUBJECTS.includes(q.category)) {
            counts[q.category]++;
          } else {
            // Default to Physiology as requested
            counts['Physiology']++;
          }
        });

        const topicsArray = FIXED_SUBJECTS.map(name => ({ name, count: counts[name] }));
        setCategories(topicsArray);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [userPlan]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Topics & Systems</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((topic) => (
          <button
            key={topic.name}
            onClick={() => navigate('/quiz-setup', { state: { category: topic.name } })}
            className="flex items-center justify-between p-6 bg-card border border-border rounded-2xl hover:border-primary transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg capitalize">{topic.name}</div>
                <div className="text-sm text-muted-foreground">{topic.count} Questions</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
