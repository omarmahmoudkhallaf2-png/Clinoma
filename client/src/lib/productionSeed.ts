import { db } from './firebase';
import { collection, doc, writeBatch, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';

const SUBJECTS_DATA = [
  { id: 'ANAT_01', name: 'Anatomy', courseId: 'F1' },
  { id: 'PHYS_01', name: 'Physiology', courseId: 'F1' },
  { id: 'HIST_01', name: 'Histology', courseId: 'F1' },
  { id: 'BIOC_01', name: 'Biochemistry', courseId: 'F1' },
];

const GENERATED_QUESTIONS = [
  {
    text: "Which of the following muscles is responsible for the abduction of the arm at the glenohumeral joint (first 15 degrees)?",
    options: ["Deltoid", "Supraspinatus", "Infraspinatus", "Subscapularis"],
    correctAnswer: "Supraspinatus",
    explanation: "The supraspinatus muscle initiates abduction of the arm (0-15 degrees), while the deltoid takes over for the remainder of the range.",
    subjectId: "ANAT_01",
    courseId: "F1",
    accessType: "free"
  },
  {
    text: "The brachial artery is a continuation of which artery?",
    options: ["Axillary artery", "Subclavian artery", "Radial artery", "Ulnar artery"],
    correctAnswer: "Axillary artery",
    explanation: "The axillary artery becomes the brachial artery at the lower border of the teres major muscle.",
    subjectId: "ANAT_01",
    courseId: "F1",
    accessType: "paid"
  },
  {
    text: "What is the primary function of Erythropoietin (EPO)?",
    options: ["Increase WBC production", "Stimulate RBC production", "Promote platelet aggregation", "Decrease iron absorption"],
    correctAnswer: "Stimulate RBC production",
    explanation: "EPO is a hormone produced by the kidneys that stimulates the bone marrow to produce red blood cells in response to low oxygen levels.",
    subjectId: "PHYS_01",
    courseId: "F1",
    accessType: "free"
  },
  {
    text: "Which phase of the cardiac cycle is characterized by all valves being closed and the ventricles contracting?",
    options: ["Isovolumetric relaxation", "Ventricular filling", "Isovolumetric contraction", "Ventricular ejection"],
    correctAnswer: "Isovolumetric contraction",
    explanation: "During isovolumetric contraction, the ventricles contract with both AV and semilunar valves closed, leading to a rapid rise in pressure without volume change.",
    subjectId: "PHYS_01",
    courseId: "F1",
    accessType: "paid"
  }
];

const generateBulk = (count: number) => {
  const bulk: any[] = [];
  for (let i = 0; i < count; i++) {
    const sub = SUBJECTS_DATA[i % SUBJECTS_DATA.length];
    bulk.push({
      text: `Clinical Question #${i + 1}: Detailed scenario for ${sub.name} curriculum.`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: `Comprehensive medical explanation for question ${i + 1} regarding ${sub.name}.`,
      subjectId: sub.id,
      courseId: "F1",
      accessType: i % 5 === 0 ? "free" : "paid",
      difficulty: (i % 3) + 1,
      status: 'published',
      version: 1
    });
  }
  return bulk;
};

export const seedProductionData = async () => {
  try {
    const courseId = 'F1';
    
    // 0. Cleanup Duplicates
    await deleteDoc(doc(db, 'subjects', 'BIO_01'));
    
    // 1. Create Course
    await setDoc(doc(db, 'courses', courseId), {
      name: 'F1',
      price: 50,
      description: `كورس F1 يشمل:
- Anatomy
- Physiology
- Histology
- Biochemistry
ويحتوي على:
- Notes للمحاضرات
- أسئلة شاملة للتدريب والمراجعة`,
      isPaid: true,
      hasFreeSection: true,
      level: 'F1',
      createdAt: new Date()
    });

    const subjects = [
      { id: 'ANAT_01', name: 'Anatomy', courseId: 'F1' },
      { id: 'PHYS_01', name: 'Physiology', courseId: 'F1' },
      { id: 'HIST_01', name: 'Histology', courseId: 'F1' },
      { id: 'BIOC_01', name: 'Biochemistry', courseId: 'F1' }
    ];

    for (const sub of subjects) {
      await setDoc(doc(db, 'subjects', sub.id), {
        ...sub,
        totalLectures: 12,
        updatedAt: new Date()
      });

      // Seed 1 sample free question per subject for "Lecture 1"
      const qId = `Q_FREE_${sub.id}`;
      await setDoc(doc(db, 'questions', qId), {
        text: `Sample Free Question for ${sub.name} - Lecture 1`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: 'This is a free sample explanation.',
        courseId: 'F1',
        subjectId: sub.id,
        accessType: 'free',
        lectureNumber: 1,
        questionType: 'practice',
        createdAt: new Date()
      });
      
      // Seed questions for 12 lectures (3 types each)
      for (let i = 1; i <= 12; i++) {
        // 1. Lecture Specific Question
        await setDoc(doc(db, 'questions', `Q_${sub.id}_L${i}_LEC`), {
          text: `Question about ${sub.name} - Lecture ${i} Content`,
          options: ['Correct Fact', 'Wrong Fact 1', 'Wrong Fact 2', 'Wrong Fact 3'],
          correctAnswer: 'Correct Fact',
          explanation: `Explaining specific points from lecture ${i}.`,
          courseId: 'F1',
          subjectId: sub.id,
          accessType: 'paid',
          lectureNumber: i,
          questionType: 'lectures',
          createdAt: new Date()
        });

        // 2. Past Exam Question for this lecture
        await setDoc(doc(db, 'questions', `Q_${sub.id}_L${i}_PAST`), {
          text: `[Past Exam 2023] Clinical Case on ${sub.name} - Node ${i}`,
          options: ['Diagnosis A', 'Diagnosis B', 'Diagnosis C', 'Diagnosis D'],
          correctAnswer: 'Diagnosis A',
          explanation: `How to solve this clinical case from lecture ${i}.`,
          courseId: 'F1',
          subjectId: sub.id,
          accessType: 'paid',
          lectureNumber: i,
          questionType: 'past_papers',
          createdAt: new Date()
        });

        // 3. Training/Practice Question for this lecture
        await setDoc(doc(db, 'questions', `Q_${sub.id}_L${i}_PRAC`), {
          text: `Practice Training: ${sub.name} Concept ${i}`,
          options: ['Correct Application', 'Wrong App 1', 'Wrong App 2', 'Wrong App 3'],
          correctAnswer: 'Correct Application',
          explanation: `Practice makes perfect for lecture ${i}.`,
          courseId: 'F1',
          subjectId: sub.id,
          accessType: 'paid',
          lectureNumber: i,
          questionType: 'practice',
          createdAt: new Date()
        });
      }
    }

    return "F1 Course and 4 Subjects (12 Lectures each) seeded successfully!";
  } catch (err: any) {
    throw new Error(`Seeding failed: ${err.message}`);
  }
};
