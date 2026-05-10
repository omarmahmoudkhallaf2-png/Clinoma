import { Timestamp } from 'firebase/firestore';

export type RoomMode = 'work' | 'shortBreak' | 'longBreak';

export interface RoomMember {
  uid: string;
  name: string;
  photoURL?: string;
  isReady: boolean;
  status: 'online' | 'afk' | 'studying' | 'break';
  lastActive: Timestamp | any;
  streak: number;
  sessionsToday: number;
  joinedAt: Timestamp | any;
}

export interface RoomReaction {
  uid: string;
  type: '👍' | '🔥' | '☕' | '💪' | 'Break?' | 'Ready';
  timestamp: number;
}

export interface RoomSettings {
  workTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  goalSessions: number;
  autoStart: boolean;
}

export interface TimerState {
  isActive: boolean;
  mode: RoomMode;
  startTime: Timestamp | null;
  duration: number; // in seconds
  timeRemaining: number; // in seconds
  sessionsCompleted: number;
  lastUpdated: Timestamp | any;
}

export interface StudyRoom {
  id: string;
  code: string;
  name: string;
  hostId: string;
  createdAt: Timestamp | any;
  settings: RoomSettings;
  timerState: TimerState;
  members: Record<string, RoomMember>;
  reactions: RoomReaction[];
  sharedAmbient: Record<string, number>;
  createdAt: any; // Timestamp
  totalWorkTime: number; // in seconds
}
