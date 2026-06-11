import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, Search, Bell, Settings as SettingsIcon, Play, Sun, Moon, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import NotificationCenter from './NotificationCenter';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleBack = () => {
    navigate(-1);
  };

  const isRootPath = ['/dashboard', '/login', '/'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Fixed Top Header */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-40 p-4 backdrop-blur-xl border-b border-border/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2.5 bg-card border border-border rounded-xl hover:bg-secondary transition-all shadow-sm"
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
          <div className="flex items-center gap-3 ml-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Activity className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter">CLINOMA</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-60">Medical Hub</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="p-2.5 bg-secondary/50 rounded-xl hover:bg-secondary transition-all text-muted-foreground hidden sm:block"
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

      <main className="flex-1 lg:ml-64 min-h-screen w-full pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </div>
      </main>


    </div>
  );
}
