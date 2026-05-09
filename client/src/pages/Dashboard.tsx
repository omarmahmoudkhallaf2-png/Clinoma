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
  Crown, Search, Settings as SettingsIcon
} from 'lucide-react';

// Components
import UserStatsGrid from '../components/dashboard/UserStatsGrid';
import DailyGoals from '../components/dashboard/DailyGoals';
import { getWeakAreas } from '../lib/quizEngine';
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
                variant="glass" 
                onClick={() => navigate('/quiz-setup')}
                className="gap-2 bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                <Play className="w-4 h-4 fill-current" />
                ابدأ تدريب سريع
              </Button>
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
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Accuracy</div>
            </Card>
            <Card isGlass className="border-white/20 p-6 text-center shadow-none hover:scale-105 transition-transform duration-500 delay-75">
              <Zap className="w-8 h-8 mx-auto mb-2 text-amber-300" />
              <div className="text-3xl font-bold">{userStats.streak}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Streak</div>
            </Card>
          </div>
        </div>
      </section>

      <UserStatsGrid stats={userStats} />

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

          {/* Smart Revision Hub */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 px-2">
              <Brain className="w-5 h-5 text-primary" /> المراجعة الذكية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card onClick={() => navigate('/incorrect')} className="cursor-pointer border-destructive/20 hover:border-destructive/50 hover:bg-destructive/5">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div className="text-right flex-1" dir="rtl">
                    <h3 className="font-bold">الأسئلة الخاطئة</h3>
                    <p className="text-xs text-muted-foreground">راجع أخطائك وصحح مفاهيمك</p>
                  </div>
                </CardContent>
              </Card>

              <Card onClick={() => navigate('/flagged')} className="cursor-pointer border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <div className="text-right flex-1" dir="rtl">
                    <h3 className="font-bold">الأسئلة المعلمة</h3>
                    <p className="text-xs text-muted-foreground">الوصول السريع للأسئلة الهامة</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

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
          <DailyGoals completed={userStats.totalSolved % 10} target={10} />
          
          <Card>
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2 flex-row-reverse" dir="rtl">
                <Clock className="w-4 h-4 text-primary" /> النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-6">
              {recentActions.map((act, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-1 bg-muted group-hover:bg-primary transition-colors rounded-full" />
                  <div className="text-right flex-1" dir="rtl">
                    <p className="font-bold text-sm">{act.action}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                      {act.timestamp?.toDate ? act.timestamp.toDate().toLocaleTimeString() : 'Just now'} • {act.meta}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>


    </motion.div>
  );
}
