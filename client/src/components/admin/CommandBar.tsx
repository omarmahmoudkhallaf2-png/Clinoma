import { useState, useEffect } from 'react';
import { Command, ArrowRight, Zap, HelpCircle, Users, Settings, FileText, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const actions = [
    { icon: HelpCircle, label: 'Add New Question', path: '/admin', tab: 'questions', action: 'add' },
    { icon: Users, label: 'Manage Users', path: '/admin', tab: 'users' },
    { icon: Database, label: 'Course Structure', path: '/admin', tab: 'courses' },
    { icon: Settings, label: 'Platform Settings', path: '/admin', tab: 'settings' },
    { icon: Zap, label: 'View Analytics', path: '/admin', tab: 'analytics' },
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (item: any) => {
    navigate(item.path);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card border-2 border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden shadow-primary/10">
        <div className="p-6 border-b border-border flex items-center gap-4 bg-secondary/20">
          <Command className="w-6 h-6 text-primary animate-pulse" />
          <input 
            autoFocus
            placeholder="Type a command or search..."
            className="bg-transparent border-none outline-none w-full text-xl font-bold placeholder:text-muted-foreground"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="px-3 py-1 bg-background border border-border rounded-lg text-[10px] font-black text-muted-foreground">ESC</div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
          {actions.length > 0 ? actions.map((action, i) => (
            <button 
              key={i}
              onClick={() => handleSelect(action)}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary hover:text-white transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-xl group-hover:bg-white/20">
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-bold">{action.label}</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          )) : (
            <div className="p-10 text-center text-muted-foreground italic font-medium">No results found for "{query}"</div>
          )}
        </div>
        
        <div className="p-4 border-t border-border bg-secondary/10 flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <div className="flex gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Command Center v2.0</span>
        </div>
      </div>
    </div>
  );
}
