import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, getDocs, collection, query } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import SupportModal from '../ui/SupportModal';
import {
  LayoutDashboard,
  HelpCircle,
  Crown,
  LogOut,
  Database,
  History,
  X,
  Moon,
  Sun,
  Brain,
  Settings as SettingsIcon,
  ClipboardList,
  ChevronRight,
  ChevronDown,
  Library,
  Search,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import NotificationCenter from './NotificationCenter';
import { useData } from '../../context/DataContext';

export default function Sidebar({ isOpen = false, setIsOpen = (_: boolean) => { } }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout, userRole, userPlan, isSubscribed, userData } = useAuth();
  const { courses } = useData();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isQBOpen, setIsQBOpen] = useState(false);
  const [config, setConfig] = useState({ telegramUser: 'Clinoma_Admins', whatsappNumber: '01039322938', preferredContact: 'telegram' });
  const [subscribedCourses, setSubscribedCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configSnap = await getDoc(doc(db, 'settings', 'general'));
        if (configSnap.exists()) setConfig(configSnap.data() as any);
      } catch (err) {
        console.error(err);
      }
    };
    if (userData) fetchData();
  }, [userData]);

  useEffect(() => {
    const myCourses = courses.filter(c => isSubscribed(c.id));
    setSubscribedCourses(myCourses);
  }, [courses, isSubscribed]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/dashboard' },
    { icon: Brain, label: 'المراجعة الذكية', path: '/review' },
    { icon: BookOpen, label: 'Flash', path: '/flashcards' },
    { icon: Crown, label: 'الكورسات المتاحة', path: '/available' },

    { icon: ClipboardList, label: 'الإختبارات', path: '/exams' },
  ];

  const adminItems = [
    { icon: Database, label: 'إدارة المنصة', path: '/admin' },
  ];

  const navTo = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed left-0 top-0 h-screen w-72 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 px-2 mb-10 group cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="relative">
                <div className="group-hover:scale-110 transition-transform duration-500">
                  <img src="/favicon.svg" alt="Clinoma Logo" className="w-10 h-10 object-contain" />
                </div>
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
              </div>
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-2xl font-black tracking-tighter text-foreground leading-none">CLINOMA</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1 opacity-60">Medical Hub</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Search Trigger */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-all text-muted-foreground group mb-6"
          >
            <Search className="w-4 h-4" />
            <span className="text-xs font-medium flex-1 text-left">Search commands...</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          {/* Main Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={item.path}>
                <button
                  onClick={() => navTo(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group",
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    location.pathname === item.path && "text-primary"
                  )} />
                  <span className="font-semibold text-sm flex-1 text-right" dir="rtl">{item.label}</span>
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                </button>

                 {/* بنوك الأسئلة - Hidden for now */}
              </div>
            ))}

            {/* My Courses Section */}
            <div className="pt-6 pb-2">
              <div className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 text-right" dir="rtl">
                كورساتي المشترك بها
              </div>
              <div className="space-y-1">
                {subscribedCourses.length > 0 ? (
                  subscribedCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => navTo(`/course/${course.id}`)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
                        location.pathname === `/course/${course.id}`
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-600"
                      )}
                    >
                      <BookOpen className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span className="font-medium text-xs flex-1 text-right line-clamp-1" dir="rtl">{course.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-[10px] text-muted-foreground italic text-right" dir="rtl">
                    لا توجد كورسات مشتركة بعد
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsSupportOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all group"
            >
              <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold text-sm flex-1 text-right" dir="rtl">الدعم الفني</span>
            </button>
          </nav>

          {/* Admin Section */}
          {userRole === 'admin' && (
            <div className="mt-8">
              <div className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 text-right" dir="rtl">
                إدارة النظام
              </div>
              {adminItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navTo(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                    location.pathname === item.path
                      ? "bg-amber-500/10 text-amber-600"
                      : "text-muted-foreground hover:bg-amber-500/5 hover:text-amber-600"
                  )}
                >
                  <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="font-semibold text-sm flex-1 text-right" dir="rtl">{item.label}</span>
                  {location.pathname === item.path && (
                    <div className="absolute left-0 w-1 h-6 bg-amber-500 rounded-r-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 space-y-4 border-t">
          {userPlan === 'free' && (
            <button
              onClick={() => setIsSupportOpen(true)}
              className="relative w-full overflow-hidden flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <Crown className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>ترقية الحساب</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <NotificationCenter />
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="flex-1 rounded-xl h-12"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <Button
              variant="outline"
              className="flex-[2] rounded-xl h-12 gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-bold">خروج</span>
            </Button>
          </div>
        </div>
      </div>

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        telegramUser={config.telegramUser}
        whatsappNumber={config.whatsappNumber}
      />
    </>
  );
}
