import { db } from './firebase';
import { doc, writeBatch, setDoc } from 'firebase/firestore';

export const seedClinicalNutritionData = async (onProgress: (log: string) => void): Promise<string> => {
  try {
    onProgress('Fetching questions from clinical_nutrition_questions.json...');
    const response = await fetch('/data/clinical_nutrition_questions.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch questions JSON: ${response.statusText}`);
    }
    const questionsData = await response.json();
    onProgress(`Successfully loaded ${questionsData.length} questions from JSON.`);

    const courseId = 'clinical_nutrition_course';
    const subjectId = 'clinical_nutrition_subject';

    onProgress('Creating Clinical Nutrition Course in Firestore...');
    await setDoc(doc(db, 'courses', courseId), {
      name: 'Clinical Nutrition',
      price: 150,
      description: `Clinical Nutrition & Dietary Management (MCQ Bank 2026).
شامل 9 فصول متكاملة تغطي كافة جوانب التغذية العلاجية وإدارة النظام الغذائي للأمراض المختلفة.
- أسئلة تدريب ومراجعة شاملة لكل شابتر.
- شرح مفصل لكل سؤال لتثبيت الفهم.`,
      isPaid: true,
      hasFreeSection: true,
      level: 'Clinical Nutrition',
      createdAt: new Date()
    });
    onProgress('Clinical Nutrition Course created successfully.');

    onProgress('Creating Clinical Nutrition Subject in Firestore...');
    await setDoc(doc(db, 'subjects', subjectId), {
      id: subjectId,
      name: 'Clinical Nutrition',
      courseId: courseId,
      lectureCount: 9,
      totalLectures: 9,
      updatedAt: new Date()
    });
    onProgress('Clinical Nutrition Subject created successfully.');

    onProgress(`Initializing batch upload of ${questionsData.length} questions (Single transaction)...`);
    const batch = writeBatch(db);
    questionsData.forEach((q: any) => {
      const qRef = doc(db, 'questions', q.id);
      batch.set(qRef, {
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        courseId: courseId,
        subjectId: subjectId,
        lectureNumber: q.lectureNumber,
        questionType: q.questionType,
        accessType: q.accessType,
        createdAt: new Date()
      });
    });

    onProgress('Committing Firestore batch write...');
    await batch.commit();
    onProgress('Batch write committed successfully.');

    return 'Clinical Nutrition course, subject, and 172 questions seeded successfully!';
  } catch (err: any) {
    onProgress(`ERROR: ${err.message}`);
    throw new Error(`Seeding failed: ${err.message}`);
  }
};
