import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, orderBy } from 'firebase/firestore';
import { 
  Play, BookOpen, Brain, TrendingUp, 
  ChevronRight, Sparkles, Clock,
  Search, Bell, Plus, Zap, Settings as SettingsIcon,
  X, Loader2, Crown, CheckCircle, XCircle, Bookmark
} from 'lucide-react';

// Components
import UserStatsGrid from '../components/dashboard/UserStatsGrid';
import DailyGoals from '../components/dashboard/DailyGoals';
import { getWeakAreas } from '../lib/quizEngine';
import WeakAreas from '../components/dashboard/WeakAreas';

export default function Dashboard() {
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ accuracy: 0, streak: 1, points: 0, totalSolved: 0 });
  const [weakAreas, setWeakAreas] = useState<any[]>([]);
  const [lastActivity, setLastActivity] = useState<any>(null);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQueryText, setSearchQueryText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const [uSnap, cSnap, weak] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(collection(db, 'courses')),
          getWeakAreas(user.uid)
        ]);
        
        if (uSnap.exists()) {
          const data = uSnap.data();
          setUserStats({
            accuracy: data.accuracy || 0,
            streak: data.streak || 1,
            points: data.points || 0,
            totalSolved: data.totalSolved || 0
          });
          setLastActivity(data.lastActivity || null);
        }

        setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setWeakAreas(weak);

        const activitySnap = await getDocs(query(
          collection(db, `users/${user.uid}/activity`), 
          orderBy('timestamp', 'desc'), 
          limit(5)
        ));
        const activities = activitySnap.docs.map(doc => doc.data());
        setRecentActions(activities.length > 0 ? activities : [
          { action: 'Welcome to Med Prep!', timestamp: { toDate: () => new Date() }, meta: 'Explore our F1 course' }
        ]);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const myCourses = courses.filter(c => isSubscribed(c.id));
  const otherCourses = courses.filter(c => !isSubscribed(c.id));

  const handleSearch = async (val: string) => {
    setSearchQueryText(val);
    if (val.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const q = query(collection(db, 'questions'), limit(10));
      const snap = await getDocs(q);
      const results = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((q: any) => q.text?.toLowerCase().includes(val.toLowerCase()));
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 space-y-10 animate-pulse">
        <div className="h-64 bg-secondary/20 rounded-[4rem]" />
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-secondary/20 rounded-[2.5rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-700 pb-24">
      {/* Smart Welcome Banner */}
      <div className="relative bg-primary text-white p-12 md:p-16 rounded-[4rem] shadow-2xl shadow-primary/20 overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-6 text-center md:text-right">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              أهلاً بك، {user?.displayName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-xl md:text-2xl font-bold opacity-80 max-w-2xl">
              استكمل رحلتك التعليمية في F1 الآن.
            </p>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="w-64 h-64 bg-white/10 rounded-[3rem] border-2 border-white/20 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-bounce duration-[3000ms]">
              <TrendingUp className="w-16 h-16 mb-4 text-emerald-400" />
              <div className="text-4xl font-black">%{userStats.accuracy}</div>
              <div className="text-xs font-black uppercase tracking-widest opacity-60">Accuracy Rating</div>
            </div>
          </div>
        </div>
      </div>

      <UserStatsGrid stats={userStats} />

      {/* Smart Revision Quick Hub */}
      <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 delay-200">
        <h2 className="text-3xl font-black tracking-tight px-4 flex items-center gap-3">
          <Brain className="w-8 h-8 text-indigo-500" /> المراجعة الذكية (Smart Revision)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            onClick={() => navigate('/review')}
            className="bg-card border-2 border-border p-10 rounded-[4rem] shadow-sm hover:shadow-2xl hover:border-rose-500/30 transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-10 relative">
              <div className="w-24 h-24 bg-rose-500/10 text-rose-600 rounded-[2rem] flex items-center justify-center group-hover:rotate-12 transition-transform">
                <XCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black">الأسئلة الخاطئة</h3>
                <p className="text-muted-foreground font-bold text-lg">راجع أخطائك وصحح مفاهيمك العلمية</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/review')}
            className="bg-card border-2 border-border p-10 rounded-[4rem] shadow-sm hover:shadow-2xl hover:border-amber-500/30 transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-10 relative">
              <div className="w-24 h-24 bg-amber-500/10 text-amber-600 rounded-[2rem] flex items-center justify-center group-hover:-rotate-12 transition-transform">
                <Bookmark className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black">الأسئلة المعلمة</h3>
                <p className="text-muted-foreground font-bold text-lg">الوصول السريع للأسئلة الهامة والمحفوظة</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* My Courses */}
          {myCourses.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black tracking-tight px-4 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-500" /> كورسـاتي
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {myCourses.map(course => (
                  <div 
                    key={course.id} 
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="bg-card border-2 border-border p-10 rounded-[4rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="flex flex-col md:flex-row gap-10 items-center relative">
                      <div className="w-40 h-40 bg-secondary/30 rounded-[3rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <BookOpen className="w-20 h-20" />
                      </div>
                      <div className="flex-1 space-y-4 text-center md:text-right">
                        <h3 className="text-4xl font-black tracking-tight">{course.name}</h3>
                        <p className="text-muted-foreground font-bold text-lg leading-relaxed whitespace-pre-line line-clamp-2">{course.description}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/course/${course.id}`); }}
                          className="px-10 py-4 bg-primary text-white rounded-[2rem] font-black text-xl shadow-xl hover:scale-105 transition-all"
                        >
                          استكمال المذاكرة
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Courses */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight px-4 flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-500" /> الكورسات المتاحة
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {otherCourses.map(course => (
                <div 
                  key={course.id} 
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="bg-card border-2 border-border p-10 rounded-[4rem] shadow-sm hover:border-primary/30 transition-all group cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-32 h-32 bg-secondary/30 rounded-[2.5rem] flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Zap className="w-16 h-16" />
                      </div>
                      <div className="text-center md:text-right space-y-2">
                        <h3 className="text-3xl font-black">{course.name}</h3>
                        <div className="text-3xl font-black text-primary">{course.price} EGP</div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/available'); }}
                      className="px-12 py-5 bg-card border-2 border-primary text-primary rounded-[2.5rem] font-black text-xl hover:bg-primary hover:text-white transition-all shadow-lg"
                    >
                      تفاصيل الكورس
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          <WeakAreas areas={weakAreas} />
          <DailyGoals completed={userStats.totalSolved % 10} target={10} />
          
          <div className="bg-card border-2 border-border p-8 rounded-[3rem] shadow-sm space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-500" /> النشاط الأخير
            </h3>
            <div className="space-y-6">
              {recentActions.map((act, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-1 bg-secondary rounded-full group-hover:bg-primary transition-colors" />
                  <div>
                    <p className="font-black text-sm">{act.action}</p>
                    <p className="text-xs font-bold text-muted-foreground">
                      {act.timestamp?.toDate ? act.timestamp.toDate().toLocaleTimeString() : 'Just now'} • {act.meta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-background/80 backdrop-blur-2xl border-2 border-border rounded-[2.5rem] shadow-2xl z-50">
        <button onClick={() => navigate('/quiz-setup')} className="p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-110 transition-all">
          <Play className="w-6 h-6 fill-white" />
        </button>
        <button onClick={() => setIsSearchOpen(true)} className="p-4 bg-secondary text-foreground rounded-2xl hover:bg-primary hover:text-white transition-all">
          <Search className="w-6 h-6" />
        </button>
        <div className="w-px h-8 bg-border mx-2" />
        <button onClick={() => navigate('/settings')} className="p-4 bg-secondary text-foreground rounded-2xl hover:bg-primary hover:text-white transition-all">
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[1200] bg-background/95 backdrop-blur-xl flex items-start justify-center pt-20 p-6">
          <div className="w-full max-w-3xl space-y-6">
            <div className="flex items-center gap-4 bg-card border-2 border-border p-6 rounded-3xl shadow-2xl">
              <Search className="w-8 h-8 text-primary" />
              <input 
                autoFocus
                placeholder="بحث في الأسئلة..."
                className="flex-1 bg-transparent border-none outline-none text-2xl font-bold"
                value={searchQueryText}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
              />
              <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-secondary rounded-xl"><X /></button>
            </div>
            <div className="bg-card border-2 border-border p-8 rounded-[3rem] min-h-[400px]">
              {isSearching ? <Loader2 className="animate-spin mx-auto w-10 h-10" /> : searchResults.map(res => (
                <div key={res.id} className="p-6 border-b border-border hover:bg-secondary/20 cursor-pointer" onClick={() => navigate('/quiz', { state: { questions: [res] } })}>
                  <p className="font-bold">{res.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
