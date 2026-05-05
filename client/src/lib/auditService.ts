import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

export type AuditAction = 'CREATE_QUESTION' | 'UPDATE_QUESTION' | 'DELETE_QUESTION' | 'UPDATE_CONFIG' | 'BULK_IMPORT' | 'DELETE_COURSE';

export const logAudit = async (userId: string, action: AuditAction, details: any) => {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      userId,
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error('Audit Log failed:', err);
  }
};

export const fetchAuditLogs = async (count = 50) => {
  const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
