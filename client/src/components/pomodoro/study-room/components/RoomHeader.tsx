import { motion } from 'framer-motion';
import { Copy, LogOut, Settings, Users, Share2, Sparkles } from 'lucide-react';
import { Button } from '../../../ui/Button';
import type { StudyRoom } from '../../../../types/studyRoom';
import { toast } from 'react-hot-toast';

interface RoomHeaderProps {
  room: StudyRoom;
  onLeave: () => void;
  isHost: boolean;
  onOpenSettings: () => void;
}

export default function RoomHeader({ room, onLeave, isHost, onOpenSettings }: RoomHeaderProps) {
  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast.success('Room code copied!');
  };

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full"
    >
      <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-4 md:p-6 shadow-xl relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-black tracking-tight truncate pr-4">{room.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/80 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50">
                   <Users className="w-3 h-3" /> {Object.keys(room.members).length} Active
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                   {room.code}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={copyCode}
              className="flex-1 md:flex-none h-11 md:h-12 rounded-xl md:rounded-2xl gap-2 font-bold px-4"
            >
              <Copy className="w-4 h-4" />
              <span className="md:inline">Copy</span>
            </Button>
            
            {isHost && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onOpenSettings}
                className="h-11 w-11 md:h-12 md:w-12 rounded-xl md:rounded-2xl border-border/50"
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}

            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onLeave}
              className="flex-1 md:flex-none h-11 md:h-12 rounded-xl md:rounded-2xl gap-2 font-bold px-4 shadow-lg shadow-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="md:inline">Leave</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar (Subtle) */}
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
            <span>Room Progress</span>
            <span className="text-primary">{room.timerState.sessionsCompleted} / {room.settings.goalSessions} Sessions</span>
          </div>
          <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((room.timerState.sessionsCompleted / room.settings.goalSessions) * 100, 100)}%` }}
              className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
