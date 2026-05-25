const fs = require('fs');

const notesContent = fs.readFileSync('D:\\Med Prep\\message.txt', 'utf8');

const diseases = [
  { title: '[ASCARIASIS (ROUNDWORMS)]', key: 'Ascariasis  Roundworms' },
  { title: '[UNDERSTANDING COMMON BACTERIAL INFECTIONS]', key: 'Bacterial Infections(table)' },
  { title: '[UNDERSTANDING BRUCELLOSIS (Undulant Fever / Malta Fever)]', key: 'Brucellosis' },
  { title: '[CHICKEN POX (VARICELLA)]', key: 'Chicken Pox (Varicella)' },
  { title: '[ENTEROBIASIS (PINWORM INFECTION)]', key: 'Enterobiasis  Pinworm' },
  { title: '[MEASLES: EDUCATIONAL MEDICAL OVERVIEW]', key: 'Measles' },
  { title: '[MUMPS (EPIDEMIC PAROTITIS)]', key: 'Mumps' },
  { title: '[UNDERSTANDING PERTUSSIS (WHOOPING Cough)]', key: 'Pertussis  Whooping Cough' },
  { title: '[UNDERSTANDING SCARLET FEVER: A COMPREHENSIVE GUIDE]', key: 'Scarlet Fever' },
  { title: '[UNDERSTANDING TYPHOID FEVER]', key: 'Typhoid Fever' }
];

// Re-read carefully because some titles might be slightly different in case.
const notesContentLower = notesContent.toLowerCase();

const parsedNotes = {};

for (let i = 0; i < diseases.length; i++) {
  const currentTitle = diseases[i].title;
  let nextTitle = i + 1 < diseases.length ? diseases[i+1].title : null;
  
  // Find start
  let startIndex = notesContentLower.indexOf(currentTitle.toLowerCase());
  if (startIndex === -1) {
    // try removing spaces or brackets
    const looseTitle = currentTitle.replace(/\s+/g, ' ').toLowerCase();
    startIndex = notesContentLower.indexOf(looseTitle);
    if(startIndex === -1) {
       console.warn(`Could not find title: ${currentTitle}`);
       continue;
    }
  }
  
  let endIndex = notesContent.length;
  if (nextTitle) {
    const nextIndex = notesContentLower.indexOf(nextTitle.toLowerCase(), startIndex + currentTitle.length);
    if (nextIndex !== -1) {
      endIndex = nextIndex;
    }
  }
  
  let content = notesContent.substring(startIndex + currentTitle.length, endIndex).trim();
  parsedNotes[diseases[i].key] = content;
}

const targetFile = 'D:\\Med Prep\\client\\src\\pages\\flashcards\\FlashSpace.tsx';
let targetContent = fs.readFileSync(targetFile, 'utf8');

let newExplanations = '';
for (const [key, value] of Object.entries(parsedNotes)) {
  const escapedValue = value.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  newExplanations += `  '${key}': \`\n${escapedValue}\n\`,\n`;
}

targetContent = targetContent.replace(
  /const PEDIATRICS_EXPLANATIONS: Record<string, string> = {/,
  `const PEDIATRICS_EXPLANATIONS: Record<string, string> = {\n${newExplanations}`
);

fs.writeFileSync(targetFile, targetContent);
console.log('Successfully injected notes into FlashSpace.tsx');
