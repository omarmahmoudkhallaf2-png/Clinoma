import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, X, Clock, Brain, Coffee } from 'lucide-react';
import { usePomodoroContext } from '../../context/PomodoroContext';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FloatingTimer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { timeLeft, isActive, mode, toggleTimer, resetTimer } = usePomodoroContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Don't show on the main Pomodoro page or during formal exams to avoid duplication/distraction
  if (location.pathname === '/pomodoro' || location.pathname.startsWith('/exam/') || !isVisible) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3"
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div 
            key="expanded"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-card/80 backdrop-blur-2xl border-2 border-primary/30 p-6 rounded-[2.5rem] shadow-2xl w-64 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                {mode === 'work' ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                {mode}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(false)} 
                  className="p-1.5 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-all"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Hide timer? It will continue to count in the background.')) {
                      setIsVisible(false);
                    }
                  }} 
                  className="p-1.5 hover:bg-rose-500/10 rounded-lg text-muted-foreground hover:text-rose-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-black tabular-nums tracking-tighter text-foreground">
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button 
                onClick={toggleTimer}
                size="sm"
                className={cn(
                  "h-12 w-12 rounded-2xl shadow-lg",
                  isActive ? "bg-secondary" : "bg-primary text-white"
                )}
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </Button>
              <Button 
                onClick={resetTimer}
                size="sm"
                variant="outline"
                className="h-12 w-12 rounded-2xl border-border"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => navigate('/pomodoro')}
                size="sm"
                variant="outline"
                className="h-12 w-12 rounded-2xl border-border"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="relative group">
            <motion.button
              key="collapsed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setIsExpanded(true)}
              className={cn(
                "h-16 w-48 rounded-full flex items-center gap-3 px-6 shadow-2xl border-2 transition-all hover:scale-105 active:scale-95",
                mode === 'work' 
                  ? "bg-primary/90 text-white border-white/20" 
                  : "bg-emerald-500/90 text-white border-white/20"
              )}
            >
              <div className="flex items-center justify-center h-8 w-8 bg-white/20 rounded-full">
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{mode}</span>
                <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
              </div>
              <div className="ml-auto">
                <Maximize2 className="w-4 h-4" />
              </div>
            </motion.button>
            
            {/* Dismiss Button for Collapsed View */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="absolute -top-2 -left-2 h-6 w-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
