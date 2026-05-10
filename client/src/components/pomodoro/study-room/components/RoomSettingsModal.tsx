import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Settings, Sparkles, Bell, Target, Volume2, Coffee } from 'lucide-react';
import type { StudyRoom } from '../../../../types/studyRoom';
import { Button } from '../../../ui/Button';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { cn } from '../../../../lib/utils';

interface RoomSettingsModalProps {
  room: StudyRoom;
  onClose: () => void;
}

export default function RoomSettingsModal({ room, onClose }: RoomSettingsModalProps) {
  const [settings, setSettings] = useState(room.settings);
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updates: any = {
        settings: settings
      };

      // If timer is NOT active, update the displayed time immediately to match new settings
      if (!room.timerState.isActive) {
        const newDuration = (room.timerState.mode === 'work' ? settings.workTime : settings.shortBreakTime) * 60;
        updates['timerState.duration'] = newDuration;
        updates['timerState.timeRemaining'] = newDuration;
      }

      await updateDoc(doc(db, 'study_rooms', room.id), updates);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-card border-2 border-border p-8 md:p-10 rounded-[3rem] shadow-2xl max-w-2xl w-full space-y-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -mr-32 -mt-32 rounded-full" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Room Controls</h2>
              <p className="text-sm text-muted-foreground font-bold">Manage your study environment</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl h-12 w-12 bg-secondary/50">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          {/* Durations */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Focus Duration
              </label>
              <div className="relative">
                <input 
                  type="number" value={settings.workTime} 
                  onChange={(e) => setSettings({ ...settings, workTime: parseInt(e.target.value) })}
                  className="w-full p-5 bg-secondary/50 rounded-2xl font-black text-2xl border-2 border-transparent focus:border-primary focus:outline-none transition-all" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground uppercase">min</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Coffee className="w-4 h-4" /> Break Duration
              </label>
              <div className="relative">
                <input 
                  type="number" value={settings.shortBreakTime} 
                  onChange={(e) => setSettings({ ...settings, shortBreakTime: parseInt(e.target.value) })}
                  className="w-full p-5 bg-secondary/50 rounded-2xl font-black text-2xl border-2 border-transparent focus:border-primary focus:outline-none transition-all" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground uppercase">min</span>
              </div>
            </div>
          </div>

          {/* Goal & Automation */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Session Goal
              </label>
              <div className="relative">
                <input 
                  type="number" value={settings.goalSessions} 
                  onChange={(e) => setSettings({ ...settings, goalSessions: parseInt(e.target.value) })}
                  className="w-full p-5 bg-secondary/50 rounded-2xl font-black text-2xl border-2 border-transparent focus:border-primary focus:outline-none transition-all" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground uppercase">sessions</span>
              </div>
            </div>

            <div className="p-6 bg-secondary/50 rounded-3xl border border-border/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg"><Sparkles className="w-4 h-4" /></div>
                  <div className="text-sm font-black uppercase tracking-tight">Auto-Transition</div>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, autoStart: !settings.autoStart })}
                  className={cn("w-12 h-6 rounded-full p-1 transition-all", settings.autoStart ? "bg-primary" : "bg-muted")}
                >
                  <div className={cn("w-4 h-4 bg-white rounded-full transition-all", settings.autoStart ? "translate-x-6" : "translate-x-0")} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                Start the next session automatically when the current one ends.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="w-full h-18 rounded-3xl text-xl font-black shadow-xl shadow-primary/20 gap-3"
        >
          {saving ? 'Updating...' : <><Sparkles className="w-5 h-5" /> Apply Changes</>}
        </Button>
      </motion.div>
    </div>
  );
}
