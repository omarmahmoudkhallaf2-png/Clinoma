import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Hourglass, ShieldCheck } from 'lucide-react';
import type { StudyRoom } from '../../../../types/studyRoom';
import { Button } from '../../../ui/Button';
import { cn } from '../../../../lib/utils';

interface SyncedTimerProps {
  timeLeft: number;
  room: StudyRoom;
  isHost: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export default function SyncedTimer({ timeLeft, room, isHost, onToggle, onReset }: SyncedTimerProps) {
  const { timerState } = room;
  const isActive = timerState.isActive;
  const isWork = timerState.mode === 'work';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-lg mx-auto">
      {/* Dynamic Background Glow - Optimized for performance/mobile */}
      <motion.div 
        animate={{ 
          scale: isActive ? [1, 1.05, 1] : 1,
          opacity: isActive ? [0.2, 0.3, 0.2] : 0.1
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute inset-0 rounded-full blur-[60px] md:blur-[100px] transition-colors duration-1000",
          isWork ? "bg-primary" : "bg-emerald-500"
        )}
      />

      <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="1" className="text-border/10" />
          <motion.circle 
            cx="50%" cy="50%" r="48%" 
            fill="none" strokeWidth="6" strokeLinecap="round"
            className={cn(
              "transition-all duration-1000",
              isWork ? "text-primary" : "text-emerald-500"
            )}
            strokeDasharray="100 100"
            animate={{ strokeDashoffset: 100 - (timeLeft / timerState.duration) * 100 }}
          />
        </svg>

        <div className="text-center space-y-4 md:space-y-6 relative z-10">
          <motion.div 
            key={timerState.mode}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              "text-[8px] md:text-xs font-black uppercase tracking-[0.4em] mb-2 md:mb-4",
              isWork ? "text-primary" : "text-emerald-500"
            )}
          >
            {isWork ? 'Deep Focus Session' : 'Short Break'}
          </motion.div>

          <div className="text-6xl md:text-[9rem] font-black tracking-tighter tabular-nums leading-none">
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-6 pt-4 md:pt-6">
            {isHost ? (
              <>
                <Button 
                  size="lg" 
                  onClick={onToggle}
                  className={cn(
                    "h-16 w-16 md:h-24 md:w-24 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl transition-all hover:scale-110 active:scale-95 relative group",
                    isActive ? "bg-secondary text-foreground" : "bg-primary text-white"
                  )}
                >
                  {isActive ? <Pause className="w-6 h-6 md:w-10 md:h-10" /> : <Play className="w-6 h-6 md:w-10 md:h-10 fill-current ml-1" />}
                </Button>
                <Button variant="outline" size="icon" onClick={onReset} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-card/50">
                  <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </>
            ) : (
              <div className="px-6 py-3 md:px-8 md:py-4 bg-secondary/50 backdrop-blur-xl border border-border/50 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-3">
                <Hourglass className={cn("w-4 h-4 md:w-5 md:h-5 text-primary", isActive && "animate-spin")} />
                <span className="text-[10px] md:text-sm font-black uppercase tracking-widest opacity-80">
                  {isActive ? 'In Progress' : 'Waiting...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
