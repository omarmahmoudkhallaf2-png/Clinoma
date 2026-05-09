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
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
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
        if (data.pomodoroSettings) setSettings(data.pomodoroSettings);
        if (data.pomodoroStats) setStats(data.pomodoroStats);
        else {
           const initialStats = { 
             totalStudyTime: 0, 
             sessionsCompleted: 0, 
             dailyStreak: 0, 
             lastActiveDate: new Date().toISOString().split('T')[0],
             history: [] 
           };
           setStats(initialStats);
        }
      }
    };
    fetchData();
  }, [userId]);

  // Sync settings to Firebase
  const updateSettings = async (newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (userId) {
      await updateDoc(doc(db, 'users', userId), { pomodoroSettings: updated });
    }
  };

  const handleSessionComplete = useCallback(async () => {
    if (!userId) return;

    if (mode === 'work') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      // Update Stats
      const minutes = settings.workTime;
      const today = new Date().toISOString().split('T')[0];
      
      const statsRef = doc(db, 'users', userId);
      await updateDoc(statsRef, {
        'pomodoroStats.totalStudyTime': increment(minutes),
        'pomodoroStats.sessionsCompleted': increment(1),
        'pomodoroStats.lastActiveDate': today,
        // Logic for history and streak can be more complex, simplified for now
      });

      // Switch mode
      if (newSessionCount % settings.sessionsUntilLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakTime * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakTime * 60);
      }
      
      if (settings.autoStartBreaks) setIsActive(true);
      else setIsActive(false);

    } else {
      setMode('work');
      setTimeLeft(settings.workTime * 60);
      if (settings.autoStartWork) setIsActive(true);
      else setIsActive(false);
    }

    // Sound Notification
    const bell = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    bell.volume = settings.soundVolume;
    bell.play();
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
