import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';

export interface PomodoroSettings {
  workTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundVolume: number;
  ambientMix: Record<string, number>;
}

export interface PomodoroStats {
  totalStudyTime: number; // in minutes
  sessionsCompleted: number;
  dailyStreak: number;
  lastActiveDate: string;
  history: { date: string, minutes: number }[];
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

export function usePomodoro(userId: string | undefined) {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load User Settings & Stats
  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.pomodoroSettings) {
          setSettings(data.pomodoroSettings);
          // Only update timeLeft if not currently running
          if (!isActive) {
            const time = data.pomodoroSettings.workTime;
            setTimeLeft(time * 60);
          }
        }
        if (data.pomodoroStats) {
          const stats = data.pomodoroStats;
          // Ensure history is always an array to prevent crashes in Analytics
          if (stats && stats.history && !Array.isArray(stats.history)) {
            stats.history = Object.entries(stats.history).map(([date, minutes]) => ({ 
              date, 
              minutes: typeof minutes === 'number' ? minutes : 0 
            }));
          } else if (stats && !stats.history) {
            stats.history = [];
          }
          setStats(stats);
        } else {
           const initialStats = { 
             totalStudyTime: 0, 
             sessionsCompleted: 0, 
             dailyStreak: data.streak || 0, 
             lastActiveDate: new Date().toISOString().split('T')[0],
             history: [] 
           };
           setStats(initialStats);
        }
      }
    };
    fetchData();
  }, [userId]);

  // Sync settings changes to timeLeft
  useEffect(() => {
    if (!isActive) {
      const time = mode === 'work' ? settings.workTime : mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime;
      setTimeLeft(time * 60);
    }
  }, [settings.workTime, settings.shortBreakTime, settings.longBreakTime, mode, isActive]);

  // Sync settings to Firebase
  const updateSettings = async (newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (userId) {
      await setDoc(doc(db, 'users', userId), { pomodoroSettings: updated }, { merge: true });
    }
  };

  const handleSessionComplete = useCallback(async () => {
    if (!userId) return;

    if (mode === 'work') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      // Update Stats
      const minutes = settings.workTime;
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hour = now.getHours();
      
      const statsRef = doc(db, 'users', userId);
      
      // Update local and remote stats
      setStats(prev => {
        if (!prev) return prev;
        const newHistory = [...(prev.history || [])];
        const dayIdx = newHistory.findIndex(h => h.date === today);
        if (dayIdx > -1) newHistory[dayIdx].minutes += minutes;
        else newHistory.push({ date: today, minutes });

        return {
          ...prev,
          totalStudyTime: prev.totalStudyTime + minutes,
          sessionsCompleted: prev.sessionsCompleted + 1,
          history: newHistory.slice(-30) // Keep last 30 days
        };
      });

      await setDoc(statsRef, {
        pomodoroStats: {
          totalStudyTime: increment(minutes),
          sessionsCompleted: increment(1),
          hourlyIntensity: {
            [hour]: increment(1)
          },
          lastActiveDate: today
        }
      }, { merge: true });

      // Switch mode
      if (newSessionCount % settings.sessionsUntilLongBreak === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
      
      if (settings.autoStartBreaks) setIsActive(true);
      else setIsActive(false);

    } else {
      setMode('work');
      if (settings.autoStartWork) setIsActive(true);
      else setIsActive(false);
    }

    // Sound Notification
    try {
      const bell = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      bell.volume = settings.soundVolume || 0.5;
      bell.play().catch(e => console.log("Audio play blocked by browser:", e));
    } catch (e) { console.error("Audio initialization error", e); }
  }, [userId, mode, sessionCount, settings]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, handleSessionComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft((mode === 'work' ? settings.workTime : mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime) * 60);
  };
  const skipSession = () => handleSessionComplete();

  return {
    timeLeft,
    isActive,
    mode,
    sessionCount,
    settings,
    stats,
    toggleTimer,
    resetTimer,
    skipSession,
    updateSettings,
    setMode: (m: 'work' | 'shortBreak' | 'longBreak') => {
      setMode(m);
      setTimeLeft((m === 'work' ? settings.workTime : m === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime) * 60);
      setIsActive(false);
    }
  };
}
