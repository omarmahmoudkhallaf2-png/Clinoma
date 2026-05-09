import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: any;
  userId: string;
}

export const sendNotification = async (userId: string, notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'userId'>) => {
  try {
    await addDoc(collection(db, `users/${userId}/notifications`), {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error sending notification:', err);
  }
};

export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const q = query(
    collection(db, `users/${userId}/notifications`),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    callback(notifications);
  });
};

export const markAsRead = async (userId: string, notificationId: string) => {
  try {
    const ref = doc(db, `users/${userId}/notifications`, notificationId);
    await updateDoc(ref, { isRead: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
};

export const markAllAsRead = async (userId: string) => {
  try {
    const q = query(collection(db, `users/${userId}/notifications`), where('isRead', '==', false));
    const snap = await getDocs(q);
    const promises = snap.docs.map(d => updateDoc(doc(db, `users/${userId}/notifications`, d.id), { isRead: true }));
    await Promise.all(promises);
  } catch (err) {
    console.error('Error marking all as read:', err);
  }
};
