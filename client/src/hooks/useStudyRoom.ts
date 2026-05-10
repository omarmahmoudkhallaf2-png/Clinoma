import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  db, auth 
} from '../lib/firebase';
import { 
  doc, onSnapshot, updateDoc, setDoc, getDoc, 
  collection, query, where, getDocs, 
  serverTimestamp, increment, arrayUnion, Timestamp,
  deleteField, writeBatch, deleteDoc
} from 'firebase/firestore';
import type { StudyRoom, RoomMember, RoomReaction, RoomMode } from '../types/studyRoom';

const ROOMS_COLLECTION = 'study_rooms';

export function useStudyRoom(roomId: string | null) {
  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = auth.currentUser?.uid;
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getSyncedNow = () => Date.now();

  const calculateTimeLeft = (roomData: StudyRoom) => {
    if (!roomData.timerState.isActive || !roomData.timerState.startTime) {
      return roomData.timerState.timeRemaining;
    }
    const elapsed = Math.floor((getSyncedNow() - roomData.timerState.startTime.toMillis()) / 1000);
    return Math.max(0, roomData.timerState.duration - elapsed);
  };

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, ROOMS_COLLECTION, roomId), (snapshot) => {
      if (snapshot.exists()) {
        const roomData = { id: snapshot.id, ...snapshot.data() } as StudyRoom;
        setRoom(roomData);
        setTimeLeft(calculateTimeLeft(roomData));
        setLoading(false);
        checkTimer(roomData);
      } else {
        setError('Room not found');
        setLoading(false);
      }
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const checkTimer = (roomData: StudyRoom) => {
    if (roomData.hostId === userId && roomData.timerState.isActive) {
      const timeLeft = calculateTimeLeft(roomData);
      if (timeLeft <= 0) {
        completeSession(roomData);
      }
    }
  };

  const completeSession = async (roomData: StudyRoom) => {
    const isWork = roomData.timerState.mode === 'work';
    const nextMode: RoomMode = isWork ? 'shortBreak' : 'work';
    const nextDuration = (nextMode === 'work' ? roomData.settings.workTime : roomData.settings.shortBreakTime) * 60;

    const batch = writeBatch(db);
    const roomRef = doc(db, ROOMS_COLLECTION, roomData.id);

    batch.update(roomRef, {
      'timerState.isActive': roomData.settings.autoStart,
      'timerState.mode': nextMode,
      'timerState.startTime': roomData.settings.autoStart ? serverTimestamp() : null,
      'timerState.timeRemaining': nextDuration,
      'timerState.duration': nextDuration,
      'timerState.sessionsCompleted': increment(isWork ? 1 : 0),
      'totalWorkTime': increment(isWork ? roomData.timerState.duration : 0),
      'timerState.lastUpdated': serverTimestamp()
    });

    if (isWork) {
      Object.keys(roomData.members).forEach(uid => {
        const member = roomData.members[uid];
        if (member.lastActive && (getSyncedNow() - member.lastActive.toMillis() < 300000)) {
          batch.update(roomRef, {
            [`members.${uid}.sessionsToday`]: increment(1)
          });
        }
      });
    }

    await batch.commit();
  };

  const [lastSyncSession, setLastSyncSession] = useState<number>(0);

  useEffect(() => {
    if (!room || !userId || loading) return;
    if (room.timerState.sessionsCompleted > lastSyncSession && room.timerState.mode !== 'work') {
      const syncStats = async () => {
        try {
          const userRef = doc(db, 'users', userId);
          const workDurationMinutes = Math.floor(room.settings.workTime);
          const today = new Date().toISOString().split('T')[0];
          await updateDoc(userRef, {
            'pomodoroStats.totalStudyTime': increment(workDurationMinutes),
            'pomodoroStats.sessionsCompleted': increment(1),
            'pomodoroStats.lastUpdated': serverTimestamp(),
            [`pomodoroStats.history.${today}`]: increment(workDurationMinutes)
          });
          setLastSyncSession(room.timerState.sessionsCompleted);
        } catch (e) {
          console.error("Global Stats Sync Failed:", e);
        }
      };
      syncStats();
    } else if (room.timerState.sessionsCompleted !== lastSyncSession) {
      setLastSyncSession(room.timerState.sessionsCompleted);
    }
  }, [room?.timerState.sessionsCompleted, room?.timerState.mode, userId, loading]);

  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (room?.timerState.isActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(calculateTimeLeft(room));
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [room?.timerState.isActive, room?.timerState.startTime]);

  const createRoom = async (name: string, userId: string, customName?: string, avatarUrl?: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomRef = doc(collection(db, ROOMS_COLLECTION));
    
    const newRoom: StudyRoom = {
      id: roomRef.id,
      name,
      code,
      hostId: userId,
      createdAt: Timestamp.now(),
      settings: {
        workTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        goalSessions: 4,
        autoStart: false
      },
      timerState: {
        mode: 'work',
        isActive: false,
        startTime: null,
        timeRemaining: 25 * 60,
        duration: 25 * 60,
        sessionsCompleted: 0,
        lastUpdated: serverTimestamp()
      },
      members: {
        [userId]: {
          uid: userId,
          name: customName || auth.currentUser?.displayName || 'Anonymous',
          photoURL: avatarUrl || auth.currentUser?.photoURL || '',
          status: 'online',
          lastActive: serverTimestamp(),
          isReady: false,
          streak: 0,
          sessionsToday: 0,
          joinedAt: serverTimestamp()
        }
      },
      reactions: [],
      totalWorkTime: 0
    };

    await setDoc(roomRef, newRoom);
    return roomRef.id;
  };

  const joinRoomByCode = async (code: string, userId: string, customName?: string, avatarUrl?: string) => {
    const q = query(collection(db, ROOMS_COLLECTION), where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error('Room not found');
    const roomDoc = snapshot.docs[0];
    const roomId = roomDoc.id;
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      [`members.${userId}`]: {
        uid: userId,
        name: customName || auth.currentUser?.displayName || 'Anonymous',
        photoURL: avatarUrl || auth.currentUser?.photoURL || '',
        status: 'online',
        lastActive: serverTimestamp(),
        isReady: false,
        streak: 0,
        sessionsToday: 0,
        joinedAt: serverTimestamp()
      }
    });
    return roomId;
  };

  const toggleTimer = async () => {
    if (!room || !roomId || room.hostId !== userId) return;
    const isActive = !room.timerState.isActive;
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      'timerState.isActive': isActive,
      'timerState.startTime': isActive ? serverTimestamp() : null,
      'timerState.timeRemaining': timeLeft,
      'timerState.lastUpdated': serverTimestamp()
    });
  };

  const resetTimer = async () => {
    if (!room || !roomId || room.hostId !== userId) return;
    const duration = room.settings.workTime * 60;
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      'timerState.isActive': false,
      'timerState.startTime': null,
      'timerState.timeRemaining': duration,
      'timerState.duration': duration,
      'timerState.mode': 'work',
      'timerState.lastUpdated': serverTimestamp()
    });
  };

  const updateStatus = async (status: RoomMember['status']) => {
    if (!room || !roomId || !userId) return;
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      [`members.${userId}.status`]: status,
      [`members.${userId}.lastActive`]: serverTimestamp()
    });
  };

  const setReady = async (ready: boolean) => {
    if (!room || !roomId || !userId) return;
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      [`members.${userId}.isReady`]: ready
    });
  };

  const sendReaction = async (type: RoomReaction['type']) => {
    if (!room || !roomId || !userId) return;
    const reaction: RoomReaction = {
      uid: userId,
      type,
      timestamp: Date.now()
    };
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      reactions: arrayUnion(reaction)
    });
  };

  const kickMember = async (targetUid: string) => {
    if (!room || !roomId || room.hostId !== userId) return;
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      [`members.${targetUid}`]: deleteField()
    });
  };

  const deleteRoom = async () => {
    if (!room || !roomId || room.hostId !== userId) return;
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
  };

  const leaveRoom = async () => {
    if (!room || !roomId || !userId) return;
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      [`members.${userId}.status`]: 'offline'
    });
  };

  return {
    room, timeLeft, loading, error,
    createRoom, joinRoomByCode, toggleTimer, resetTimer,
    updateStatus, setReady, sendReaction, kickMember, deleteRoom, leaveRoom
  };
}
