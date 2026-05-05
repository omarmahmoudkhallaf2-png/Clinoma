import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import SupportModal from '../ui/SupportModal';
import { 
  LayoutDashboard,
  HelpCircle, 
  Bookmark, 
  Crown, 
  LogOut, 
  Database,
  History,
  X,
  Moon,
  Sun,
  Brain,
  Settings as SettingsIcon,
  ClipboardList
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ isOpen = false, setIsOpen = (_: boolean) => {} }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout, userRole, userPlan } = useAuth();
  const [isTelegramOpen, setIsTelegramOpen] = useState(false);
  const [config, setConfig] = useState({ telegramUser: 'omarrkhallaf', whatsappNumber: '', preferredContact: 'telegram' });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'general'));
        if (docSnap.exists()) setConfig(docSnap.data() as any);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConfig();
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/dashboard' },
    { icon: Brain, label: 'المراجعة الذكية', path: '/review' },
    { icon: Crown, label: 'الكورسات المتاحة', path: '/available' },
    { icon: ClipboardList, label: 'الإختبارات', path: '/exams' },
    { icon: History, label: 'سجل المحاولات', path: '/history' },
    { icon: SettingsIcon, label: 'الإعدادات', path: '/settings' },
  ];

  const adminItems = [
    { icon: Database, label: 'إدارة المنصة', path: '/admin' },
  ];

  const handleSupportClick = () => {
    setIsTelegramOpen(true);
  };

  const navTo = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className={`fixed left-0 top-0 h-screen w-72 bg-card border-r border-border flex flex-col z-50 transition-all duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => navTo('/dashboard')}
            className="flex items-center gap-4 hover:scale-105 transition-transform"
          >
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20 italic">
              M
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground">MEDPREP</span>
          </button>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-secondary rounded-xl">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navTo(item.path)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${
                location.pathname === item.path
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-2'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? 'animate-pulse' : ''}`} />
              <span className="font-black text-sm">{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleSupportClick}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all group"
          >
            <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-black text-sm">الدعم الفني</span>
          </button>
        </nav>

        {userRole === 'admin' && (
          <div className="mt-10 animate-in slide-in-from-left duration-500">
            <div className="px-5 mb-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
              إدارة النظام
            </div>
            {adminItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navTo(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${
                  location.pathname === item.path
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20 translate-x-2'
                    : 'text-muted-foreground hover:bg-amber-500/5 hover:text-amber-600'
                }`}
              >
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-black text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-8 border-t border-border space-y-4 bg-secondary/10">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-xl font-black text-xs hover:bg-destructive hover:text-white transition-all shadow-sm shadow-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>

        {userPlan === 'free' && (
          <button 
            onClick={handleSupportClick}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <Crown className="w-4 h-4" />
            ترقية الحساب
          </button>
        )}
      </div>

      <SupportModal 
        isOpen={isTelegramOpen}
        onClose={() => setIsTelegramOpen(false)}
        telegramUser={config.telegramUser}
        whatsappNumber={config.whatsappNumber}
      />
    </div>
  );
}
