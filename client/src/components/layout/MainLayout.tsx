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


    </div>
  );
}
