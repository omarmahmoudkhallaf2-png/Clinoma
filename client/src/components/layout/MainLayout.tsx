import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, Search, Bell, Settings as SettingsIcon, Play } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      <main className="flex-1 lg:ml-64 min-h-screen w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
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
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            )}
          </div>
          {children}
        </div>
      </main>

      {/* Global Quick Actions FAB */}
      {location.pathname !== '/ai-assistant' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-10 lg:translate-x-0 flex items-center gap-4 p-4 bg-background/80 backdrop-blur-2xl border-2 border-border rounded-[2.5rem] shadow-2xl z-50 animate-in slide-in-from-bottom-10">
          <button onClick={() => navigate('/quiz-setup')} className="p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-110 transition-all" title="Quick Start">
            <Play className="w-6 h-6 fill-white" />
          </button>
          <button className="p-4 bg-secondary text-foreground rounded-2xl hover:bg-primary hover:text-white transition-all" title="Search">
            <Search className="w-6 h-6" />
          </button>
          <div className="w-px h-8 bg-border mx-2" />
          <button onClick={() => navigate('/settings')} className="p-4 bg-secondary text-foreground rounded-2xl hover:bg-primary hover:text-white transition-all" title="Settings">
            <SettingsIcon className="w-6 h-6" />
          </button>
          <button className="p-4 bg-secondary text-foreground rounded-2xl relative hover:bg-primary hover:text-white transition-all" title="Notifications">
            <Bell className="w-6 h-6" />
            <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-background rounded-full" />
          </button>
        </div>
      )}
    </div>
  );
}
