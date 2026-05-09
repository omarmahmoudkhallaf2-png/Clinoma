import { db } from '../lib/firebase';
import { 
  collection, query, where, getDocs, doc, setDoc, 
  serverTimestamp, increment, getDoc, limit, addDoc, deleteDoc 
} from 'firebase/firestore';

// SRS SM-2 Algorithm Simplified
export const calculateSRS = (quality: number, previousSRS: any) => {
  let { interval, repetition, efactor } = previousSRS || { interval: 0, repetition: 0, efactor: 2.5 };

  if (quality >= 3) { // Correct
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * efactor);
    repetition++;
  } else { // Incorrect
    repetition = 0;
    interval = 1;
  }

  efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { interval, repetition, efactor, nextReview };
};

export const updateUserProgress = async (userId: string, questionId: string, isCorrect: boolean, quality: number = 3, isExam: boolean = false) => {
  const qSnap = await getDoc(doc(db, 'questions', questionId));
  const qData = qSnap.exists() ? qSnap.data() : null;
  
  const progressRef = doc(db, `users/${userId}/progress/${questionId}`);
  const progressSnap = await getDoc(progressRef);
  const currentData = progressSnap.exists() ? progressSnap.data() : null;

  const srs = calculateSRS(isCorrect ? quality : 0, currentData?.srsData);

  await setDoc(progressRef, {
    status: isCorrect ? 'solved' : 'wrong',
    subjectId: qData?.subjectId || 'general',
    courseId: qData?.courseId || 'F1',
    lastAttemptAt: serverTimestamp(),
    attemptCount: increment(1),
    srsData: srs
  }, { merge: true });

  // Update global question analytics
  const qRef = doc(db, 'questions', questionId);
  await setDoc(qRef, {
    analytics: {
      totalAttempts: increment(1),
      correctAttempts: increment(isCorrect ? 1 : 0)
    }
  }, { merge: true });

  // Update User Cumulative Stats
  await updateUserStats(userId, isCorrect, isExam);
};

export const updateUserStats = async (userId: string, lastAttemptCorrect: boolean, isExam: boolean = false) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  
  // If it's an exam, we don't update global accuracy/totalSolved
  if (isExam) {
    await setDoc(userRef, {
      lastActiveAt: serverTimestamp()
    }, { merge: true });
    return;
  }

  const totalSolved = (data.totalSolved || 0) + 1;
  const totalCorrect = (data.totalCorrect || 0) + (lastAttemptCorrect ? 1 : 0);
  const accuracy = Math.round((totalCorrect / totalSolved) * 100);

  await setDoc(userRef, {
    totalSolved,
    totalCorrect,
    accuracy,
    points: increment(lastAttemptCorrect ? 10 : 2),
    lastActiveAt: serverTimestamp()
  }, { merge: true });
};

export const getWeakAreas = async (userId: string) => {
  const progressRef = collection(db, `users/${userId}/progress`);
  const snap = await getDocs(query(progressRef, where('status', '==', 'wrong')));
  
  const subjects: Record<string, number> = {};
  snap.forEach(doc => {
    const data = doc.data();
    if (data.subjectId) {
      subjects[data.subjectId] = (subjects[data.subjectId] || 0) + 1;
    }
  });

  return Object.entries(subjects)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
};

export const logUserActivity = async (userId: string, data: {
  action: string,
  meta: string,
  courseId?: string,
  courseName?: string,
  subjectId?: string,
  folder?: string
}) => {
  const userRef = doc(db, 'users', userId);
  const activityRef = collection(db, `users/${userId}/activity`);
  const timestamp = serverTimestamp();

  await addDoc(activityRef, {
    action: data.action,
    meta: data.meta,
    timestamp: timestamp
  });

  if (data.courseName || data.subjectId) {
    await setDoc(userRef, {
      lastActivity: {
        courseName: data.courseName || 'Medical Prep',
        subjectId: data.subjectId || 'general',
        courseId: data.courseId || 'F1',
        timestamp: timestamp
      },
      lastActiveAt: timestamp
    }, { merge: true });
  }
};


export const generateSmartExam = async (config: {
  userId: string;
  courseId: string;
  count: number;
  mode: 'adaptive' | 'random' | 'review' | 'wrong';
}) => {
  const qRef = collection(db, 'questions');
  let questions: any[] = [];

  if (config.mode === 'adaptive' || config.mode === 'wrong') {
    const progressRef = collection(db, `users/${config.userId}/progress`);
    const status = config.mode === 'wrong' ? 'wrong' : 'wrong'; // Simplified for now
    const progressSnap = await getDocs(query(progressRef, where('status', '==', status), limit(config.count)));
    const ids = progressSnap.docs.map(d => d.id);

    if (ids.length > 0) {
      // Note: Firestore 'in' query has 10 item limit per chunk
      const qSnap = await getDocs(query(qRef, where('__name__', 'in', ids.slice(0, 10))));
      questions.push(...qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
  }

  if (questions.length < config.count) {
    const remainingSnap = await getDocs(query(qRef, 
      where('courseId', '==', config.courseId), 
      limit(config.count - questions.length)
    ));
    questions.push(...remainingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  return questions.sort(() => Math.random() - 0.5);
};

export const toggleBookmark = async (userId: string, questionId: string, isExam: boolean = false) => {
  if (isExam) return false;
  const bookmarkRef = doc(db, `users/${userId}/bookmarks/${questionId}`);
  const snap = await getDoc(bookmarkRef);

  if (snap.exists()) {
    await deleteDoc(bookmarkRef);
    return false;
  } else {
    const qSnap = await getDoc(doc(db, 'questions', questionId));
    await setDoc(bookmarkRef, {
      ...(qSnap.exists() ? qSnap.data() : {}),
      bookmarkedAt: serverTimestamp()
    });
    return true;
  }
};

export const getBookmarks = async (userId: string) => {
  const snap = await getDocs(collection(db, `users/${userId}/bookmarks`));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getIncorrectQuestions = async (userId: string) => {
  const progressRef = collection(db, `users/${userId}/progress`);
  const progressSnap = await getDocs(query(progressRef, where('status', '==', 'wrong')));
  const ids = progressSnap.docs.map(d => d.id);

  if (ids.length === 0) return [];

  // Fetch actual question data
  const qRef = collection(db, 'questions');
  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const qSnap = await getDocs(query(qRef, where('__name__', 'in', chunk)));
    chunks.push(...qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  return chunks;
};

export const getSolvedToday = async (userId: string) => {
  const progressRef = collection(db, `users/${userId}/progress`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const snap = await getDocs(query(progressRef, where('lastAttemptAt', '>=', today)));
  const ids = snap.docs.map(d => d.id);
  if (ids.length === 0) return [];

  const qRef = collection(db, 'questions');
  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const qSnap = await getDocs(query(qRef, where('__name__', 'in', chunk)));
    chunks.push(...qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  return chunks;
};

export const resetBookmarks = async (userId: string) => {
  const snap = await getDocs(collection(db, `users/${userId}/bookmarks`));
  const promises = snap.docs.map(d => deleteDoc(doc(db, `users/${userId}/bookmarks`, d.id)));
  await Promise.all(promises);
};

export const resetIncorrect = async (userId: string) => {
  const snap = await getDocs(query(collection(db, `users/${userId}/progress`), where('status', '==', 'wrong')));
  const promises = snap.docs.map(d => deleteDoc(doc(db, `users/${userId}/progress`, d.id)));
  await Promise.all(promises);
};
