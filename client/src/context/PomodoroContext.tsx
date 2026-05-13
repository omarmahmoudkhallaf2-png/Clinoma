import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

interface PomodoroSettings {
  workTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundVolume: number;
  ambientMix: Record<string, number>;
}

interface PomodoroStats {
  totalStudyTime: number;
  sessionsCompleted: number;
  dailyStreak: number;
  lastActiveDate: string;
  history: { date: string, minutes: number }[];
}

interface PomodoroContextType {
  timeLeft: number;
  isActive: boolean;
  mode: 'work' | 'shortBreak';
  settings: PomodoroSettings;
  stats: PomodoroStats | null;
  sessionCount: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => Promise<void>;
  setMode: (mode: 'work' | 'shortBreak') => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundVolume: 0.5,
  ambientMix: {}
};

const AMBIENT_SOUNDS = [
  { id: 'rain', url: '/sounds/rain.mp3' },
  { id: 'wind', url: '/sounds/wind.mp3' },
  { id: 'fire', url: '/sounds/fire.mp3' },
  { id: 'waves', url: '/sounds/waves.mp3' },
];

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<'work' | 'shortBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const expectedEndTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const userId = auth.currentUser?.uid;

  // Initialize Global Audio
  useEffect(() => {
    AMBIENT_SOUNDS.forEach(sound => {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = 0;
      audioRefs.current[sound.id] = audio;
    });

    return () => {
      Object.values(audioRefs.current).forEach(a => {
        a.pause();
        a.src = "";
      });
    };
  }, []);

  // Sync Audio Volumes & Handle Exam Silence
  const location = useLocation();
  useEffect(() => {
    const isExamPage = location.pathname.startsWith('/exam/');
    
    Object.entries(settings.ambientMix || {}).forEach(([id, vol]) => {
      const audio = audioRefs.current[id];
      if (audio) {
        // Force volume to 0 if on exam page OR if audio hasn't been manually enabled
        const finalVol = (isExamPage || !audioEnabled) ? 0 : vol;
        audio.volume = finalVol;
        
        if (finalVol > 0 && audio.paused) {
          audio.play().catch(() => {});
        } else if ((finalVol === 0 || isExamPage) && !audio.paused) {
          audio.pause();
        }
      }
    });
  }, [settings.ambientMix, location.pathname, audioEnabled]);

  // Load Data
  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const data = snap.data();
        if (data.pomodoroSettings) {
          setSettings(data.pomodoroSettings);
          // Sync timer with loaded settings if not already active
          setTimeLeft(data.pomodoroSettings.workTime * 60);
        }
        if (data.pomodoroStats) {
          const s = data.pomodoroStats;
          // Ensure history is an array
          if (s.history && !Array.isArray(s.history)) {
            s.history = Object.entries(s.history).map(([date, minutes]) => ({ 
              date, 
              minutes: typeof minutes === 'number' ? minutes : 0 
            }));
          } else if (!s.history) {
            s.history = [];
          }
          setStats(s);
        }
      }
    };
    fetchData();
  }, [userId]);

  const handleSessionComplete = useCallback(async () => {
    if (!userId) return;
    setIsActive(false);
    
    if (mode === 'work') {
      setSessionCount(prev => prev + 1);
      const minutes = settings.workTime;
      const today = new Date().toISOString().split('T')[0];
      
      await setDoc(doc(db, 'users', userId), {
        pomodoroStats: {
          totalStudyTime: increment(minutes),
          sessionsCompleted: increment(1),
          lastActiveDate: today
        }
      }, { merge: true });

      setMode('shortBreak');
      setTimeLeft(settings.shortBreakTime * 60);
      if (settings.autoStartBreaks) setIsActive(true);
    } else {
      setMode('work');
      setTimeLeft(settings.workTime * 60);
      if (settings.autoStartWork) setIsActive(true);
    }

    try {
      const bell = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      bell.volume = settings.soundVolume;
      bell.play().catch(e => console.error("Audio play failed:", e));
      
      // Visual notification
      const message = mode === 'work' ? "Time for a break! ☕" : "Break's over! Let's get back to work 🚀";
      // We can't import toast here easily without adding it to the context or using a global event
      // But we can use a custom event or just rely on the audio if it works.
      // Actually, since this is a context, we can't easily use toast here unless we pass it or use window dispatch.
      window.dispatchEvent(new CustomEvent('pomodoro-complete', { detail: { message } }));
    } catch (e) {}
  }, [userId, mode, settings]);

  useEffect(() => {
    if (isActive) {
      if (!expectedEndTimeRef.current) {
        expectedEndTimeRef.current = Date.now() + timeLeft * 1000;
      }
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.floor((expectedEndTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          expectedEndTimeRef.current = null;
          handleSessionComplete();
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      expectedEndTimeRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, handleSessionComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    expectedEndTimeRef.current = null;
    setTimeLeft((mode === 'work' ? settings.workTime : settings.shortBreakTime) * 60);
  };

  const updateSettings = async (newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    // Sync current timer if it's not active to reflect new durations immediately
    if (!isActive) {
      const newTime = (mode === 'work' ? updated.workTime : updated.shortBreakTime) * 60;
      setTimeLeft(newTime);
    }

    // If the user is adjusting ambient sounds, enable audio for the session
    if (newSettings.ambientMix) {
      setAudioEnabled(true);
    }
    if (userId) {
      await updateDoc(doc(db, 'users', userId), { pomodoroSettings: updated });
    }
  };

  return (
    <PomodoroContext.Provider value={{
      timeLeft, isActive, mode, settings, stats, sessionCount,
      toggleTimer, resetTimer, skipSession: handleSessionComplete, updateSettings,
      setMode: (m) => {
        setMode(m);
        setTimeLeft((m === 'work' ? settings.workTime : settings.shortBreakTime) * 60);
        setIsActive(false);
      }
    }}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext() {
  const context = useContext(PomodoroContext);
  if (!context) throw new Error('usePomodoroContext must be used within PomodoroProvider');
  return context;
}
