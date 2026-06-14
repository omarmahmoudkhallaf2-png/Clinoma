import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, limit, doc, getDoc, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, BookOpen, Brain, TrendingUp, 
  ChevronRight, Clock, Zap, CheckCircle, 
  XCircle, Bookmark, ArrowRight, Activity,
  Crown, Search, Settings as SettingsIcon, RotateCcw, Database,
  Video, Folder, ChevronLeft, Home, Sparkles, Flame
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useData } from '../context/DataContext';

export default function Dashboard() {
  const { user, isSubscribed, isSpaceSubscribed } = useAuth();
  const navigate = useNavigate();
  const { courses, videoFolders, videos: allVideos, loading: dataLoading } = useData();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ accuracy: 0, streak: 1, points: 0, totalSolved: 0 });
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const uSnap = await getDoc(doc(db, 'users', user.uid));
        
        if (uSnap.exists()) {
          const data = uSnap.data();
          setUserStats({
            accuracy: data.accuracy || 0,
            streak: data.streak || 1,
            points: data.points || 0,
            totalSolved: data.totalSolved || 0
          });
        }

        const activitySnap = await getDocs(query(
          collection(db, `users/${user.uid}/activity`), 
          orderBy('timestamp', 'desc'), 
          limit(5)
        ));
        const activities = activitySnap.docs.map(doc => doc.data());
        setRecentActions(activities.length > 0 ? activities : [
          { action: 'Welcome to CLINOMA!', timestamp: { toDate: () => new Date() }, meta: 'Explore our courses' }
        ]);

        setCurrentFolderId(null);

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

  const [activeTab, setActiveTab] = useState<'home' | 'videos'>('home');

  if (loading || dataLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-10">
        <Skeleton className="h-64 rounded-2xl w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
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
      {/* Premium Tab Switcher */}
      <div className="flex items-center justify-center p-1.5 bg-slate-100/50 backdrop-blur-md rounded-[2rem] w-fit mx-auto border border-slate-200">
        <button 
          onClick={() => setActiveTab('home')}
          className={cn(
            "px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all",
            activeTab === 'home' ? "bg-white text-primary shadow-xl" : "text-slate-400 hover:text-slate-600"
          )}
        >
          الرئيسية
        </button>
        <button 
          onClick={() => setActiveTab('videos')}
          className={cn(
            "px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all flex items-center gap-2",
            activeTab === 'videos' ? "bg-white text-rose-500 shadow-xl" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Video className={cn("w-4 h-4", activeTab === 'videos' ? "fill-rose-500" : "")} />
          المكتبة المرئية
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'home' ? (
          <motion.div 
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-10"
          >
      {/* Premium Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-primary px-8 py-12 text-white shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-right">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              أهلاً بك، {user?.displayName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm md:text-base text-primary-foreground/70 font-medium max-w-xl">
              تتبع تقدمك، راجع أخطائك، واستعد للامتحانات بأفضل الأدوات التعليمية.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4 justify-center md:justify-start">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/review')}
                className="text-white hover:bg-white/10 text-xs font-bold px-6"
              >
                المراجعة الذكية
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Card isGlass className="border-white/20 p-4 md:p-6 text-center shadow-none hover:scale-105 transition-transform duration-500">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-emerald-300" />
              <div className="text-2xl md:text-3xl font-bold">%{userStats.accuracy}</div>
              <div className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold opacity-60">نسبة الدقة</div>
            </Card>
            <Card isGlass className="border-white/20 p-4 md:p-6 text-center shadow-none hover:scale-105 transition-transform duration-500 delay-75">
              <Crown className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-amber-300" />
              <div className="text-2xl md:text-3xl font-bold">{userStats.points}</div>
              <div className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold opacity-60">إجمالي النقاط</div>
            </Card>
            <Card isGlass className="border-white/20 p-4 md:p-6 text-center shadow-none hover:scale-105 transition-transform duration-500 delay-150">
              <Zap className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-amber-300" />
              <div className="text-2xl md:text-3xl font-bold">{userStats.streak}</div>
              <div className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold opacity-60">التفاعل اليومي</div>
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
        <Card className="relative bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 border-none overflow-hidden h-20 md:h-24 flex items-center px-6 md:px-8 shadow-xl">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20">
                <Clock className="w-5 h-5 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-3xl font-black text-white tracking-tighter leading-none">POMODORO</span>
                <span className="text-[8px] md:text-xs font-bold text-white/60 uppercase tracking-[0.2em] mt-1">Focus Studio</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white font-bold text-xs md:text-base" dir="rtl">
              <span className="hidden sm:block">نظام التركيز العالمي</span>
              <div className="p-1.5 md:p-2 bg-white/20 rounded-full">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Card>
      </div>



      <div className="space-y-10">
          
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCourses.map(course => {
                  const isOphth = course.id === 'ophthalmology_flash_space';
                  const isSubscribedToOphth = isSpaceSubscribed('Ophthalmology') || isSpaceSubscribed('الورقة الثانية');
                  const hasAccess = isOphth ? isSubscribedToOphth : true;

                  return (
                    <Card 
                      key={course.id} 
                      className={cn(
                        "group overflow-hidden rounded-[2.5rem] shadow-xl hover:scale-[1.02] transition-all duration-500 relative flex flex-col justify-between h-full",
                        isOphth 
                          ? "border-2 border-orange-500/40 dark:border-orange-500/20 hover:border-orange-500 bg-gradient-to-br from-amber-50/50 via-orange-50/20 to-red-50/10 dark:from-slate-900 dark:via-orange-950/10 dark:to-red-950/10" 
                          : "border border-slate-100 dark:border-slate-800/50 hover:border-primary/20 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/30 dark:from-slate-900 dark:to-slate-800/30"
                      )}
                    >
                      {isOphth ? (
                        <div className="absolute top-0 right-10 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl shadow-lg flex items-center gap-1.5 z-10 animate-bounce">
                          <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-yellow-300" />
                          مميز جداً 🔥
                        </div>
                      ) : course.trending ? (
                        <div className="absolute top-0 right-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl shadow-lg flex items-center gap-1.5 z-10 animate-pulse">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          رائج الآن
                        </div>
                      ) : null}
                      <CardContent className="p-8 flex flex-col justify-between h-full gap-8">
                        <div className="flex flex-col items-end gap-6 text-right w-full" dir="rtl">
                          <div className={cn(
                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center group-hover:text-white transition-all duration-500 shadow-md flex-shrink-0",
                            isOphth
                              ? "bg-orange-50 text-orange-600 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-rose-500 shadow-orange-500/10"
                              : course.isFlashSpace 
                                ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 shadow-indigo-500/10' 
                                : 'bg-primary/5 text-primary group-hover:bg-primary shadow-primary/5'
                          )}>
                            {isOphth ? <Flame className="w-7 h-7" /> : course.isFlashSpace ? <Sparkles className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                          </div>
                          <div className="space-y-3 w-full">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{course.name}</h3>
                            {course.isFlashSpace && (
                              <span className={cn(
                                "px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] w-fit font-black",
                                isOphth ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"
                              )}>
                                {isOphth ? <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> : <Sparkles className="w-3 h-3" />}
                                FLASH SPACE
                              </span>
                            )}
                            <p className="text-sm text-slate-400 dark:text-slate-400 font-semibold leading-relaxed min-h-[48px] line-clamp-2">{course.description}</p>
                            
                            {isOphth && !hasAccess && (
                              <div className="flex items-center gap-2 mt-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-1.5 rounded-2xl text-sm font-black w-fit">
                                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse animate-bounce" />
                                <span>السعر: 60 جنيه فقط 🔥</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end w-full">
                          <Button 
                            onClick={() => {
                              if (course.isFlashSpace) {
                                const modParam = course.flashSpaceModule ? `?module=${encodeURIComponent(course.flashSpaceModule)}` : '';
                                navigate(`/flashcards/space${modParam}`);
                              } else {
                                navigate(`/course/${course.id}`);
                              }
                            }}
                            className={cn(
                              "w-full md:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3",
                              isOphth
                                ? "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-orange-500/20"
                                : course.isFlashSpace 
                                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 text-white' 
                                  : 'shadow-primary/10 hover:shadow-xl'
                            )}
                          >
                            <span>{isOphth && !hasAccess ? "اشترك الآن للبدء" : "استكمال المذاكرة"}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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


          </motion.div>
        ) : (
          <motion.div 
            key="videos"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12"
          >
            {/* Library Header & Breadcrumbs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 text-center md:text-right" dir="rtl">
                <h2 className="text-4xl font-black tracking-tight">المكتبة التعليمية المرئية</h2>
                <div className="flex items-center gap-2 text-muted-foreground font-black text-xs uppercase tracking-widest">
                  <button onClick={() => setCurrentFolderId(null)} className="hover:text-primary transition-colors flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" /> الرئيسية
                  </button>
                  {videoFolders.find(f => f.id === currentFolderId) && (
                    <>
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="text-primary">{videoFolders.find(f => f.id === currentFolderId)?.name}</span>
                    </>
                  )}
                </div>
              </div>
              
              {currentFolderId && (
                <Button 
                  onClick={() => {
                    const parentId = videoFolders.find(f => f.id === currentFolderId)?.parentId;
                    setCurrentFolderId(parentId || null);
                  }}
                  variant="outline"
                  className="rounded-2xl font-black text-xs px-8 border-2"
                >
                  <ChevronRight className="w-4 h-4 mr-2" /> العودة للخلف
                </Button>
              )}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" dir="rtl">
              {/* Show Subfolders */}
              {videoFolders.filter(f => f.parentId === currentFolderId).map(folder => (
                <Card 
                  key={folder.id} 
                  className="group cursor-pointer rounded-[2.5rem] border-2 border-slate-100 hover:border-primary/20 hover:shadow-2xl transition-all overflow-hidden"
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Folder className="w-10 h-10 fill-current" />
                    </div>
                    <h4 className="text-xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{folder.name}</h4>
                    <p className="text-xs text-muted-foreground font-bold line-clamp-1">{folder.description || 'تصفح الفيديوهات'}</p>
                    
                    <div className="mt-6 flex gap-3">
                      <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-lg">
                        {videoFolders.filter(f => f.parentId === folder.id).length} أقسام
                      </span>
                      <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-lg">
                        {allVideos.filter(v => v.folderId === folder.id).length} فيديو
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Show Videos */}
            <div className="grid grid-cols-1 gap-12" dir="rtl">
              {allVideos.filter(v => v.folderId === currentFolderId).map(video => (
                <div key={video.id} className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="relative group max-w-5xl mx-auto w-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 via-primary to-indigo-600 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-30 transition duration-1000" />
                    <div className="relative bg-white p-4 rounded-[3.5rem] shadow-3xl border border-slate-100 overflow-hidden">
                      <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-900 relative shadow-inner">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={`https://www.youtube.com/embed/${video.youtubeUrl.split('v=')[1]?.split('&')[0] || video.youtubeUrl.split('/').pop()?.split('?')[0]}?rel=0&modestbranding=1`} 
                          title={video.title}
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          className="absolute inset-0"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-w-4xl mx-auto space-y-4 text-center md:text-right">
                    <h3 className="text-3xl font-black tracking-tight text-slate-900">{video.title}</h3>
                    <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <p className="text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-wrap italic">
                        {video.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {allVideos.filter(v => v.folderId === currentFolderId).length === 0 && videoFolders.filter(f => f.parentId === currentFolderId).length === 0 && (
                <div className="h-[400px] flex flex-col items-center justify-center space-y-4 text-slate-300">
                  <Video className="w-20 h-20 opacity-20" />
                  <p className="font-black uppercase tracking-[0.3em] text-sm">هذا القسم فارغ حالياً</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
