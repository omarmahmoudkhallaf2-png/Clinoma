import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, Search, Bell, Settings as SettingsIcon, Play, Sun, Moon, Activity, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import NotificationCenter from './NotificationCenter';
import { cn } from '../../lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const { theme, toggleTheme } = useTheme();

  const handleBack = () => {
    navigate(-1);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const isRootPath = ['/dashboard', '/login', '/'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex relative">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Fixed Top Header */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-40 p-4 backdrop-blur-xl border-b border-border/10 flex items-center justify-between transition-all duration-300",
        isSidebarCollapsed ? "lg:left-0" : "lg:left-72"
      )}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                toggleSidebarCollapse();
              } else {
                setIsSidebarOpen(true);
              }
            }}
            className="p-2.5 bg-card border border-border rounded-xl hover:bg-secondary transition-all shadow-sm group"
            title="القائمة الجانبية"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          {!isRootPath && (
            <button 
              onClick={handleBack}
              className="p-2.5 bg-card border border-border rounded-xl hover:bg-secondary transition-all shadow-sm group"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          )}
          
          {/* Logo only shown when sidebar is collapsed on desktop, or always on mobile */}
          <div 
            onClick={() => navigate('/dashboard')}
            className={cn(
              "items-center gap-2.5 ml-2 cursor-pointer transition-all duration-300",
              isSidebarCollapsed ? "flex" : "flex lg:hidden"
            )}
          >
            <div className="relative">
              <img src="/favicon.svg" alt="Clinoma Logo" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter leading-none">CLINOMA</span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-60 mt-0.5">Medical Hub</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Compact Pomodoro Button */}
          <button
            onClick={() => navigate('/pomodoro')}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 active:scale-95 transition-all text-xs md:text-sm font-black ml-2 shadow-sm"
            title="ساعة التركيز Pomodoro"
          >
            <Clock className="w-4 h-4 animate-pulse text-rose-500" />
            <span className="hidden sm:inline">Pomodoro</span>
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-command-palette'))}
            className="p-2.5 bg-secondary/50 rounded-xl hover:bg-secondary transition-all text-muted-foreground hidden sm:block animate-pulse"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-secondary/50 rounded-xl hover:bg-secondary transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <NotificationCenter />
        </div>
      </div>

      <main className={cn(
        "flex-1 min-h-screen w-full pt-20 transition-all duration-300",
        isSidebarCollapsed ? "lg:ml-0" : "lg:ml-72"
      )}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </div>
      </main>

    </div>
  );
}
