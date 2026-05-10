import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, limit, doc, getDoc, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  Play, BookOpen, Brain, TrendingUp, 
  ChevronRight, Clock, Zap, CheckCircle, 
  XCircle, Bookmark, ArrowRight, Activity,
  Crown, Search, Settings as SettingsIcon, RotateCcw, Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getWeakAreas, resetBookmarks, resetIncorrect } from '../lib/quizEngine';
import WeakAreas from '../components/dashboard/WeakAreas';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export default function Dashboard() {
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ accuracy: 0, streak: 1, points: 0, totalSolved: 0 });
  const [weakAreas, setWeakAreas] = useState<any[]>([]);
  const [recentActions, setRecentActions] = useState<any[]>([]);

  const handleReset = async (type: 'flagged' | 'incorrect') => {
    if (!user) return;
    const confirm = window.confirm(type === 'flagged' ? 'هل أنت متأكد من مسح جميع الأسئلة المعلمة؟' : 'هل أنت متأكد من مسح قائمة الأسئلة الخاطئة؟');
    if (!confirm) return;

    try {
      if (type === 'flagged') await resetBookmarks(user.uid);
      else await resetIncorrect(user.uid);
      toast.success('تم المسح بنجاح');
      window.location.reload(); 
    } catch (err) {
      toast.error('حدث خطأ أثناء المسح');
    }
  };

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
          { action: 'Welcome to CLINOMA!', timestamp: { toDate: () => new Date() }, meta: 'Explore our courses' }
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-10">
        <Skeleton className="h-64 rounded-2xl w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 lg:p-8 space-y-10 pb-24"
    >
      {/* Premium Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-primary px-8 py-12 text-white shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              أهلاً بك، {user?.displayName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg text-primary-foreground/80 font-medium max-w-xl">
              تتبع تقدمك، راجع أخطائك، واستعد للامتحانات بأفضل الأدوات التعليمية.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6 justify-center md:justify-start">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/review')}
                className="text-white hover:bg-white/10"
              >
                المراجعة الذكية
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <Card isGlass className="border-white/20 p-6 text-center shadow-none hover:scale-105 transition-transform duration-500">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
              <div className="text-3xl font-bold">%{userStats.accuracy}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">نسبة الدقة</div>
            </Card>
            <Card isGlass className="border-white/20 p-6 text-center shadow-none hover:scale-105 transition-transform duration-500 delay-75">
              <Zap className="w-8 h-8 mx-auto mb-2 text-amber-300" />
              <div className="text-3xl font-bold">{userStats.streak}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">التفاعل اليومي</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pomodoro Premium Banner - Static Edition */}
      <div 
        onClick={() => navigate('/pomodoro')}
        className="relative group cursor-pointer"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-rose-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <Card className="relative bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 border-none overflow-hidden h-24 flex items-center px-8 shadow-2xl shadow-rose-500/20">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-black/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white tracking-tighter leading-none">POMODORO</span>
                <span className="text-xs font-bold text-white/60 uppercase tracking-[0.3em] mt-1">Focus Studio</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-white font-bold text-lg" dir="rtl">
              <span className="hidden md:block">نظام التركيز العالمي - متاح الآن مجاناً</span>
              <div className="p-2 bg-white/20 rounded-full">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Themes Card */}
      <div 
        onClick={() => navigate('/data-themes')}
        className="relative group cursor-pointer"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <Card className="relative bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 border-none overflow-hidden h-24 flex items-center px-8 shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-black/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white tracking-tighter leading-none">تيمات الداتا</span>
                <span className="text-xs font-bold text-white/60 uppercase tracking-[0.3em] mt-1">Data Themes Bank</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-white font-bold text-lg" dir="rtl">
              <span className="hidden md:block">تقسيمات الداتا المجانية - بنك أسئلة متكامل</span>
              <div className="p-2 bg-white/20 rounded-full">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Core Stats & Quick Revision Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accuracy */}
        <Card className="overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20 bg-emerald-500/10" />
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 rounded-lg transition-transform group-hover:scale-110 bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight">%{userStats.accuracy}</div>
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">نسبة الدقة</div>
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20 bg-orange-500/10" />
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 rounded-lg transition-transform group-hover:scale-110 bg-orange-500/10 text-orange-500">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight">{userStats.streak}</div>
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">التفاعل اليومي</div>
            </div>
          </CardContent>
        </Card>

        {/* Incorrect Questions */}
        <Card className="overflow-hidden group relative hover:border-destructive/30 transition-all">
          <CardContent className="p-6 relative">
            <div onClick={() => navigate('/incorrect')} className="cursor-pointer">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20 bg-destructive/10" />
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 rounded-lg transition-transform group-hover:scale-110 bg-destructive/10 text-destructive">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold tracking-tight">الأسئلة الخاطئة</div>
                <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">مراجعة الأخطاء</div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleReset('incorrect'); }}
              className="absolute top-4 left-4 p-2 bg-secondary/50 rounded-lg hover:bg-destructive hover:text-white transition-all opacity-0 group-hover:opacity-100"
              title="Reset List"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </CardContent>
        </Card>

        {/* Flagged Questions */}
        <Card className="overflow-hidden group relative hover:border-amber-500/30 transition-all">
          <CardContent className="p-6 relative">
            <div onClick={() => navigate('/flagged')} className="cursor-pointer">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20 bg-amber-500/10" />
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 rounded-lg transition-transform group-hover:scale-110 bg-amber-500/10 text-amber-600">
                  <Bookmark className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold tracking-tight">الأسئلة المعلمة</div>
                <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">الوصول السريع</div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleReset('flagged'); }}
              className="absolute top-4 left-4 p-2 bg-secondary/50 rounded-lg hover:bg-amber-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              title="Reset List"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          
          {/* My Courses Section */}
          {myCourses.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> كورسـاتي
                </h2>
                <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => navigate('/available')}>
                  عرض الكل <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {myCourses.map(course => (
                  <Card key={course.id} className="group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 bg-muted flex items-center justify-center p-8 group-hover:bg-primary/5 transition-colors">
                          <BookOpen className="w-12 h-12 text-primary/40 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 p-6 space-y-4">
                          <div className="space-y-1 text-right" dir="rtl">
                            <h3 className="text-xl font-bold tracking-tight">{course.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                          </div>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                              <Activity className="w-3 h-3" />
                              <span>Last active: Today</span>
                            </div>
                            <Button size="sm" onClick={() => navigate(`/course/${course.id}`)} className="gap-2">
                              استكمال المذاكرة
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Explore More */}
          {otherCourses.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 px-2">
                <Zap className="w-5 h-5 text-amber-500" /> استكشف المزيد
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherCourses.slice(0, 2).map(course => (
                  <Card key={course.id} className="hover:border-primary/30">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex justify-between items-start flex-row-reverse">
                        <div className="p-2 bg-secondary rounded-lg">
                          <Crown className="w-4 h-4 text-amber-500" />
                        </div>
                        <CardTitle className="text-lg font-bold">{course.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4 text-right" dir="rtl">
                      <div className="text-2xl font-bold text-primary">{course.price} EGP</div>
                      <Button variant="outline" className="w-full" onClick={() => navigate('/available')}>تفاصيل الكورس</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Context */}
        <aside className="space-y-8">
          <WeakAreas areas={weakAreas} />

          

        </aside>
      </div>


    </motion.div>
  );
}
