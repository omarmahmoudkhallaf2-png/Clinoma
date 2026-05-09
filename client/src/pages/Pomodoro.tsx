import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Brain, Coffee, 
  Settings, Maximize2, Minimize2, ArrowLeft,
  Volume2, BarChart3, Clock, Zap, SkipForward,
  Info, Bell, Moon, Sun, Sparkles, Hourglass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePomodoro } from '../hooks/usePomodoro';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import AmbientMixer from '../components/pomodoro/AmbientMixer';
import PomodoroAnalytics from '../components/pomodoro/PomodoroAnalytics';

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Focus on being productive instead of busy.",
  "Your mind is for having ideas, not holding them.",
  "Don't stop when you're tired. Stop when you're done.",
  "Success is the sum of small efforts repeated daily.",
  "It always seems impossible until it's done.",
];

export default function Pomodoro() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { 
    timeLeft, isActive, mode, sessionCount, settings, stats,
    toggleTimer, resetTimer, skipSession, updateSettings, setMode 
  } = usePomodoro(user?.uid);

  const [activeTab, setActiveTab] = useState<'timer' | 'mixer' | 'stats'>('timer');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const { theme, toggleTheme } = useTheme();

  // Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-switch to dark mode in Focus Mode
  useEffect(() => {
    if (isFocusMode && theme === 'light') {
      toggleTheme();
    }
  }, [isFocusMode, theme, toggleTheme]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      }
      if (e.code === 'KeyF') setIsFocusMode(prev => !prev);
      if (e.code === 'KeyR') resetTimer();
      if (e.code === 'KeyL' && !isFocusMode) toggleTheme();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleTimer, resetTimer, toggleTheme, isFocusMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'work' ? settings.workTime : mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime) / 60) * 100;

  return (
    <div className={cn(
      "min-h-screen transition-all duration-1000 overflow-hidden relative",
      isFocusMode ? "bg-black" : "bg-background"
    )}>
      {/* Animated Background */}
      {!isFocusMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_50%)]"
        />
        </div>
      )}

      {/* Navigation */}
      <AnimatePresence>
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={cn(
              "fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between backdrop-blur-xl border-b border-border/10 transition-all duration-500",
              isFocusMode ? "opacity-0 hover:opacity-100 bg-black/80" : "opacity-100"
            )}
          >
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-2xl">
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl">
                  <motion.div
                    animate={{ rotate: [0, 180] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Hourglass className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter">POMODORO</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium Focus Studio</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-2xl border border-border/50">
              {[
                { id: 'timer', icon: Clock, label: 'Timer' },
                { id: 'mixer', icon: Volume2, label: 'Mixer' },
                { id: 'stats', icon: BarChart3, label: 'Analytics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all relative",
                    activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div layoutId="tab-bg" className="absolute inset-0 bg-primary rounded-xl" />
                  )}
                  <tab.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isFocusMode && (
                <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-2xl">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={() => setShowSettings(true)} className="rounded-2xl">
                <Settings className="w-5 h-5" />
              </Button>
               {!isFocusMode && (
                <Button variant="primary" onClick={() => setIsFocusMode(true)} className="rounded-2xl gap-2 font-black">
                  <Maximize2 className="w-4 h-4" /> Focus Mode
                </Button>
               )}
            </div>
          </motion.div>
      </AnimatePresence>

      {/* Focus Mode Exit Trigger */}
      {isFocusMode && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          whileHover={{ opacity: 1 }}
          onClick={() => setIsFocusMode(false)}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-full text-white/40 hover:text-white font-black text-sm gap-2 flex items-center transition-all"
        >
          <Minimize2 className="w-4 h-4" /> Press ESC or Click to Exit Focus
        </motion.button>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "relative z-10 flex flex-col items-center justify-center min-h-screen transition-all duration-1000",
        isFocusMode ? "p-0" : "pt-24 pb-12 px-6"
      )}>
        
        {activeTab === 'timer' && (
          <div className="flex flex-col items-center justify-center w-full max-w-4xl space-y-16">
            
            {/* Breathing / Status Ring */}
            <div className="relative flex items-center justify-center">
              {!isFocusMode && (
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={cn(
                    "absolute inset-0 rounded-full blur-[100px]",
                     mode === 'work' ? "bg-primary" : "bg-emerald-500"
                  )}
                />
              )}

              <div className="relative w-80 h-80 md:w-[500px] md:h-[500px] flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="2" className="text-border/10" />
                  <motion.circle 
                    cx="50%" cy="50%" r="48%" 
                    fill="none" strokeWidth="8" strokeLinecap="round"
                    className={cn(
                      "transition-all duration-1000 shadow-2xl",
                      mode === 'work' ? "text-primary" : "text-emerald-500"
                    )}
                    strokeDasharray="100 100"
                    animate={{ strokeDashoffset: 100 - progress }}
                  />
                </svg>

                <div className="text-center space-y-6">
                  <motion.div 
                    key={mode}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={cn(
                      "text-[10px] md:text-[14px] font-black uppercase tracking-[0.5em] opacity-60",
                      mode === 'work' ? "text-primary" : "text-emerald-500"
                    )}
                  >
                    {mode === 'work' ? 'Deep Study Session' : 'Peaceful Break'}
                  </motion.div>
                  <div className={cn(
                    "text-8xl md:text-[11rem] font-black tracking-tighter tabular-nums leading-none transition-colors duration-500",
                    isFocusMode ? "text-white" : "dark:text-white text-black"
                  )}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex items-center justify-center gap-6 pt-8">
                    <Button 
                      size="lg" 
                      onClick={toggleTimer}
                      className={cn(
                        "h-20 w-20 md:h-24 md:w-24 rounded-[2.5rem] shadow-2xl transition-all hover:scale-110",
                         isActive ? "bg-secondary text-foreground" : "bg-primary text-white"
                      )}
                    >
                      {isActive ? <Pause className="w-8 h-8 md:w-10 md:h-10" /> : <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />}
                    </Button>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="icon" onClick={resetTimer} className="h-10 w-10 md:h-12 md:w-12 rounded-2xl">
                        <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={skipSession} className="h-10 w-10 md:h-12 md:w-12 rounded-2xl">
                        <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Quote */}
            <motion.div 
              key={quoteIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-xl px-10"
            >
              <p className="text-lg md:text-2xl font-medium text-muted-foreground italic leading-relaxed">
                "{QUOTES[quoteIndex]}"
              </p>
            </motion.div>

            {/* Micro Stats */}
              <div className={cn(
                "flex items-center gap-12 bg-secondary/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/50 shadow-xl transition-all",
                isFocusMode && "opacity-40 hover:opacity-100"
              )}>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-black">{sessionCount}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sessions</div>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="text-center space-y-1">
                  <div className="text-3xl font-black">{sessionCount * settings.workTime}m</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Focus Time</div>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="text-center space-y-1">
                  <div className="text-3xl font-black flex items-center justify-center gap-2 text-amber-500">
                    <Zap className="w-6 h-6 fill-current" /> {userData?.streak || stats?.dailyStreak || 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Daily Streak</div>
                </div>
              </div>
          </div>
        )}

         <div className={cn("w-full max-w-5xl space-y-12", activeTab !== 'mixer' && "hidden")}>
           <div className="text-center space-y-2">
             <h2 className="text-4xl font-black tracking-tight">Ambient Audio Studio</h2>
             <p className="text-muted-foreground font-bold">Craft your perfect study atmosphere</p>
           </div>
           <AmbientMixer 
             mix={settings.ambientMix} 
             onUpdate={(id, vol) => updateSettings({ ambientMix: { ...settings.ambientMix, [id]: vol } })} 
           />
         </div>

          <div className={cn("w-full max-w-6xl", activeTab !== 'stats' && "hidden")}>
             <PomodoroAnalytics stats={stats} />
           </div>

      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-card border-2 border-border p-10 rounded-[3rem] shadow-2xl max-w-xl w-full space-y-10"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black">Preferences</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)} className="rounded-xl"><ArrowLeft className="w-5 h-5 rotate-180" /></Button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Work Duration</label>
                  <input 
                    type="number" value={settings.workTime} 
                    onChange={(e) => updateSettings({ workTime: parseInt(e.target.value) })}
                    className="w-full p-4 bg-secondary rounded-2xl font-black text-xl border-2 border-transparent focus:border-primary focus:outline-none" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Break Duration</label>
                  <input 
                    type="number" value={settings.shortBreakTime} 
                    onChange={(e) => updateSettings({ shortBreakTime: parseInt(e.target.value) })}
                    className="w-full p-4 bg-secondary rounded-2xl font-black text-xl border-2 border-transparent focus:border-primary focus:outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-secondary/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Sparkles className="w-5 h-5" /></div>
                    <div className="font-bold">Auto-Start Breaks</div>
                  </div>
                  <button 
                    onClick={() => updateSettings({ autoStartBreaks: !settings.autoStartBreaks })}
                    className={cn("w-12 h-6 rounded-full p-1 transition-all", settings.autoStartBreaks ? "bg-primary" : "bg-muted")}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full transition-all", settings.autoStartBreaks ? "translate-x-6" : "translate-x-0")} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-secondary/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Bell className="w-5 h-5" /></div>
                    <div className="font-bold">Timer Notification Sound</div>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" value={settings.soundVolume}
                    onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                    className="w-32 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <Button onClick={() => setShowSettings(false)} className="w-full h-16 rounded-3xl text-lg font-black shadow-xl shadow-primary/30">Save Preferences</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
