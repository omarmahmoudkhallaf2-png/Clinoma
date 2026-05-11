import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, documentId, doc, getDoc } from 'firebase/firestore';
import { getBookmarks, getIncorrectQuestions, getSolvedToday } from '../lib/quizEngine';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  BookOpen, Brain, Flag, 
  ChevronRight, TrendingDown,
  Play, CheckCircle2, History
} from 'lucide-react';

export default function ReviewDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [showModeSelection, setShowModeSelection] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchReviewData = async () => {
      try {
        const progressRef = collection(db, `users/${user.uid}/progress`);
        
        // 1. Wrong Questions
        const wrongData = await getIncorrectQuestions(user.uid);
        setWrongQuestions(wrongData.slice(0, 5));

        // 3. Flagged (Bookmarks)
        const bookmarks = await getBookmarks(user.uid);
        setFlaggedCount(bookmarks.length);

      } catch (err) {
        console.error(err);
      }
    };

    fetchReviewData();
  }, [user]);

  const startReview = (mode: 'srs' | 'wrong' | 'flagged') => {
    if (mode === 'srs') {
      setShowModeSelection(true);
      return;
    }
    navigate('/quiz', { state: { mode, isTimed: false, count: 20 } });
  };

  const handleSessionType = async (type: 'today' | 'needs_review') => {
    try {
      setShowModeSelection(false);
      let questions: any[] = [];
      
      if (type === 'today') {
        questions = await getSolvedToday(user!.uid);
      } else {
        const [wrong, flagged] = await Promise.all([
          getIncorrectQuestions(user!.uid),
          getBookmarks(user!.uid)
        ]);
        // Combine and remove duplicates
        const combined = [...wrong];
        flagged.forEach(f => {
          if (!combined.find(c => c.id === f.id)) combined.push(f);
        });
        questions = combined;
      }

      if (questions.length === 0) {
        toast.error('لم يتم العثور على أسئلة لمراجعتها في هذا القسم حالياً.');
        return;
      }

      navigate('/quiz', { state: { questions, isStudyMode: true } });
    } catch (err) {
      toast.error('حدث خطأ أثناء تحميل الأسئلة');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card border-2 border-border p-8 rounded-[3rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="flex items-center gap-6 relative">
          <div className="p-5 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-600/30">
            <Brain className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black">المراجعة الذكية</h1>
            <p className="text-muted-foreground font-bold text-lg opacity-60">Intelligent Review & Spaced Repetition</p>
          </div>
        </div>
        <button 
          onClick={() => startReview('srs')}
          className="relative px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all flex items-center gap-3"
        >
          <Play className="w-6 h-6" /> ابدأ مراجعة اليوم
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Errors Analysis */}
        <div className="bg-card border-2 border-border rounded-[4rem] p-10 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-rose-500/10 text-rose-600 rounded-2xl">
                <TrendingDown className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black">أبرز التحديات (أخطاء متكررة)</h3>
            </div>
            <button onClick={() => startReview('wrong')} className="text-primary font-black hover:underline flex items-center gap-2">
              عرض الكل <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {wrongQuestions.length > 0 ? wrongQuestions.map((q, i) => (
              <div key={q.id} className="group p-6 bg-secondary/20 rounded-[2rem] border-2 border-border hover:border-primary/30 transition-all flex justify-between items-center">
                <div className="flex gap-6 items-center">
                  <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center font-black text-muted-foreground shadow-sm group-hover:text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-black text-lg line-clamp-1">{q.text}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg">{q.category}</span>
                      <span className="text-[10px] font-black uppercase text-muted-foreground">Attempts: {q.analytics?.totalAttempts || 0}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate('/quiz', { state: { questions: [q], isStudyMode: true } })} className="p-3 bg-primary/10 text-primary rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                  <Play className="w-5 h-5" />
                </button>
              </div>
            )) : (
              <div className="py-20 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto opacity-20" />
                <p className="text-muted-foreground font-bold">لا توجد أخطاء حالياً، عمل رائع!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flagged and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card border-2 border-border p-8 rounded-[3rem] flex items-center justify-between group hover:bg-amber-500/5 transition-all cursor-pointer" onClick={() => startReview('flagged')}>
          <div className="flex items-center gap-6">
            <div className="p-5 bg-amber-500/10 text-amber-600 rounded-[2rem]">
              <Flag className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-2xl font-black">الأسئلة المحفوظة</h4>
              <p className="text-muted-foreground font-bold">{flaggedCount} سؤال بانتظار مراجعتك</p>
            </div>
          </div>
          <ChevronRight className="w-8 h-8 text-muted-foreground group-hover:translate-x-2 transition-all" />
        </div>
      </div>

      {/* Review Mode Modal/Overlay */}
      <AnimatePresence>
        {showModeSelection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border-2 border-border p-10 rounded-[4rem] shadow-2xl max-w-2xl w-full space-y-10"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black">اختر نمط مراجعة اليوم</h2>
                <p className="text-muted-foreground font-bold">حدد نوع الأسئلة التي تود مراجعتها الآن</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => handleSessionType('today')}
                  className="p-8 bg-primary/5 border-2 border-primary/20 rounded-[3rem] hover:bg-primary hover:text-white transition-all group text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-[2rem] mx-auto flex items-center justify-center group-hover:bg-white/20 group-hover:text-white">
                    <History className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="font-black text-xl">أسئلة اليوم</div>
                    <div className="text-xs opacity-60 font-bold">كل ما قمت بحله اليوم</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleSessionType('needs_review')}
                  className="p-8 bg-rose-500/5 border-2 border-rose-500/20 rounded-[3rem] hover:bg-rose-500 hover:text-white transition-all group text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-[2rem] mx-auto flex items-center justify-center group-hover:bg-white/20 group-hover:text-white">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="font-black text-xl">تحتاج تركيز</div>
                    <div className="text-xs opacity-60 font-bold">الأخطاء + الأسئلة المعلمة</div>
                  </div>
                </button>
              </div>

              <button 
                onClick={() => setShowModeSelection(false)}
                className="w-full py-4 text-muted-foreground font-black hover:text-foreground transition-colors"
              >
                إلغاء
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
