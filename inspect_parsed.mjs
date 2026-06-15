import { readFileSync, writeFileSync } from 'fs';

const questions = JSON.parse(readFileSync('F:/Med Prep/parsed_questions.json', 'utf8'));

console.log("Total questions loaded:", questions.length);

const day1Topics = [
  // Chest (Chapter 2) - all
  // Emergency (Chapter 4) - all
  // Family Medicine (Chapter 5) - first 8 topics:
  'Principles of Family Medicine',
  'The Family Physician & RISE Framework',
  'Comparative Medical Models',
  'Family Health Team & PHC Services',
  'Family Dynamics & The Human Life Cycle',
  'Basic Benefit Package & Level of Care',
  'Patient Education & Verbal Counseling',
  'Referral & Consultation Processes'
];

const day1Questions = questions.filter(q => {
  if (q.chapterId === 2 || q.chapterId === 4) return true;
  if (q.chapterId === 5 && day1Topics.includes(q.topic)) return true;
  return false;
});

console.log("Day 1 Questions count:", day1Questions.length);

// Group by chapter
const grouped = {};
for (const q of day1Questions) {
  if (!grouped[q.chapterId]) grouped[q.chapterId] = {};
  if (!grouped[q.chapterId][q.topic]) grouped[q.chapterId][q.topic] = [];
  grouped[q.chapterId][q.topic].push(q);
}

for (const chId of Object.keys(grouped)) {
  console.log(`Chapter ${chId}:`);
  for (const topic of Object.keys(grouped[chId])) {
    console.log(`  Topic "${topic}": ${grouped[chId][topic].length} questions`);
  }
}

writeFileSync('F:/Med Prep/day1_questions.json', JSON.stringify(day1Questions, null, 2));
