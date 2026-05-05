import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';

export const resetAndSeed = async () => {
  try {
    console.log('Starting Reset & Seed Process...');

    // 1. Delete existing courses
    const courseSnap = await getDocs(collection(db, 'courses'));
    for (const d of courseSnap.docs) {
      await deleteDoc(doc(db, 'courses', d.id));
    }

    // 2. Delete existing subjects
    const subjectSnap = await getDocs(collection(db, 'subjects'));
    for (const d of subjectSnap.docs) {
      await deleteDoc(doc(db, 'subjects', d.id));
    }

    // 3. Create F1 Course
    const f1CourseRef = await addDoc(collection(db, 'courses'), {
      name: 'F1',
      price: 50,
      description: 'كورس F1 يشمل:\n- Anatomy\n- Physiology\n- Histology\n- Biochemistry\nويحتوي على:\n- Notes للمحاضرات\n- أسئلة شاملة للتدريب والمراجعة',
      isPaid: true,
      hasFreeSection: true,
      createdAt: new Date()
    });
    const f1Id = f1CourseRef.id;

    // 4. Create Subjects for F1
    const subjects = ['Anatomy', 'Physiology', 'Histology', 'Biochemistry'];
    const subjectRefs: Record<string, string> = {};

    for (const sName of subjects) {
      const sRef = await addDoc(collection(db, 'subjects'), {
        name: sName,
        courseId: f1Id,
        createdAt: new Date()
      });
      subjectRefs[sName] = sRef.id;
    }

    // 5. Seed initial questions with accessType
    const sampleQuestions = [
      {
        text: 'What is the primary function of the mitochondria?',
        options: ['Energy production', 'Protein synthesis', 'Waste disposal', 'Cell division'],
        correctAnswer: 0,
        explanation: 'Mitochondria are known as the powerhouse of the cell because they produce ATP.',
        courseId: f1Id,
        subjectId: subjectRefs['Physiology'],
        accessType: 'free',
        createdAt: new Date()
      },
      {
        text: 'Which bone is the longest in the human body?',
        options: ['Humerus', 'Tibia', 'Femur', 'Fibula'],
        correctAnswer: 2,
        explanation: 'The femur is the thigh bone and is the longest and strongest bone in the body.',
        courseId: f1Id,
        subjectId: subjectRefs['Anatomy'],
        accessType: 'paid',
        createdAt: new Date()
      }
    ];

    for (const q of sampleQuestions) {
      await addDoc(collection(db, 'questions'), q);
    }

    console.log('Reset & Seed Completed Successfully!');
    return true;
  } catch (err) {
    console.error('Reset & Seed failed:', err);
    return false;
  }
};

export const seedDatabase = resetAndSeed;
