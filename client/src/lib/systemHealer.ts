import { db } from './firebase';
import { collection, getDocs, doc, writeBatch, query, where, getDoc, setDoc } from 'firebase/firestore';

export const runSystemAudit = async () => {
  const reports: string[] = [];
  const batch = writeBatch(db);
  let fixesCount = 0;

  try {
    // 1. Audit Questions
    const questionsSnap = await getDocs(collection(db, 'questions'));
    const coursesSnap = await getDocs(collection(db, 'courses'));
    const subjectsSnap = await getDocs(collection(db, 'subjects'));

    const courseIds = coursesSnap.docs.map(d => d.id);
    const subjectIds = subjectsSnap.docs.map(d => d.id);

    for (const qDoc of questionsSnap.docs) {
      const q = qDoc.data();
      let needsFix = false;
      const update: any = {};

      // Fix legacy folder -> courseId
      if (q.folder && !q.courseId) {
        update.courseId = q.folder.toUpperCase();
        needsFix = true;
      }

      // Ensure valid courseId
      if (q.courseId && !courseIds.includes(q.courseId)) {
        reports.push(`Question ${qDoc.id} has invalid courseId: ${q.courseId}`);
      }

      // Ensure accessType exists
      if (!q.accessType) {
        update.accessType = q.isPremium === false ? 'free' : 'paid';
        needsFix = true;
      }

      if (needsFix) {
        batch.update(qDoc.ref, update);
        fixesCount++;
      }
    }

    // 2. Audit Subjects
    for (const sDoc of subjectsSnap.docs) {
      const s = sDoc.data();
      if (!s.courseId) {
        reports.push(`Subject ${sDoc.id} (${s.name}) is missing courseId`);
      }
    }

    if (fixesCount > 0) {
      await batch.commit();
      reports.push(`Applied ${fixesCount} automatic fixes to core collections.`);
    }

    return { success: true, reports, fixesCount };
  } catch (err: any) {
    console.error('Audit failed:', err);
    return { success: false, error: err.message };
  }
};

export const autoRepairUserEnrollments = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  if (!userData.enrolledCourses) {
    // Logic: If user was subscribed in legacy system, enroll them in F1
    if (userData.plan === 'premium' || userData.isSubscribed) {
      await setDoc(userRef, { enrolledCourses: ['F1'] }, { merge: true });
      return true;
    }
  }
  return false;
};
