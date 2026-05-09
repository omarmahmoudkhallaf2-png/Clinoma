import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Bell, Settings, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../lib/utils';

type Mode = 'work' | 'shortBreak' | 'longBreak';

const MODES: Record<Mode, { label: string; time: number; color: string; icon: any }> = {
  work: { label: 'وقت المذاكرة', time: 25 * 60, color: 'text-primary', icon: Brain },
  shortBreak: { label: 'استراحة قصيرة', time: 5 * 60, color: 'text-emerald-500', icon: Coffee },
  longBreak: { label: 'استراحة طويلة', time: 15 * 60, color: 'text-blue-500', icon: Coffee },
};

export default function Pomodoro() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.time);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
    setIsActive(false);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
      if (soundEnabled) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play();
      }
      if (mode === 'work') {
        setCompletedSessions(p => p + 1);
        switchMode('shortBreak');
      } else {
        switchMode('work');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, soundEnabled, switchMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / MODES[mode].time) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 lg:p-12">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')}
        className="absolute top-8 left-8 gap-2 font-bold hover:bg-secondary"
      >
        <ArrowLeft className="w-5 h-5" /> العودة للوحة التحكم
      </Button>

      <div className="max-w-4xl w-full space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div 
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("text-5xl lg:text-7xl font-black tracking-tight", MODES[mode].color)}
          >
            {MODES[mode].label}
          </motion.div>
          <div className="flex items-center justify-center gap-4 text-muted-foreground font-bold">
            <span className="flex items-center gap-2 px-4 py-1 bg-secondary rounded-full">
              <Brain className="w-4 h-4" /> الجلسة رقم {completedSessions + 1}
            </span>
          </div>
        </div>

        {/* Timer UI */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Progress Ring */}
          <div className="relative w-80 h-80 lg:w-[450px] lg:h-[450px] flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
              <circle
                cx="50%" cy="50%" r="48%"
                className="stroke-muted fill-none"
                strokeWidth="4"
              />
              <motion.circle
                cx="50%" cy="50%" r="48%"
                className={cn("fill-none transition-all duration-1000", 
                  mode === 'work' ? 'stroke-primary' : 
                  mode === 'shortBreak' ? 'stroke-emerald-500' : 'stroke-blue-500'
                )}
                strokeWidth="4"
                strokeDasharray="301.59"
                animate={{ strokeDashoffset: 301.59 - (301.59 * (100 - progress)) / 100 }}
                strokeLinecap="round"
              />
            </svg>

            {/* Time Display */}
            <div className="relative text-center space-y-2">
              <div className="text-8xl lg:text-[10rem] font-black tracking-tighter tabular-nums drop-shadow-xl">
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  size="lg"
                  onClick={() => setIsActive(!isActive)}
                  className={cn("h-20 w-20 rounded-full shadow-2xl transition-all hover:scale-110", 
                    isActive ? "bg-secondary text-foreground" : "bg-primary text-white"
                  )}
                >
                  {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => setTimeLeft(MODES[mode].time)}
                  className="h-14 w-14 rounded-full border-2"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Controls and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl bg-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><Settings className="w-4 h-4" /> الإعدادات</h3>
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 bg-secondary rounded-lg">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
              <div className="space-y-2">
                {(['work', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl font-bold transition-all",
                      mode === m ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    <span>{MODES[m].label}</span>
                    <span className="text-xs opacity-60">{MODES[m].time / 60}m</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-none shadow-xl bg-primary text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000">
              <Brain className="w-32 h-32" />
            </div>
            <CardContent className="p-10 space-y-6 relative z-10">
              <h3 className="text-2xl font-black">نصيحة CLINOMA اليومية 💡</h3>
              <p className="text-lg text-primary-foreground/90 font-medium leading-relaxed" dir="rtl">
                "تقنية البومودورو تساعدك على الحفاظ على تركيزك العالي عبر تقسيم المذاكرة لفترات زمنية مركزة تليها استراحات قصيرة. هذا يمنع إجهاد العقل ويحسن الذاكرة طويلة الأمد."
              </p>
              <div className="flex items-center gap-6 pt-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{completedSessions}</div>
                  <div className="text-[10px] uppercase font-bold opacity-60">جلسات مكتملة</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{completedSessions * 25}m</div>
                  <div className="text-[10px] uppercase font-bold opacity-60">إجمالي وقت المذاكرة</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
