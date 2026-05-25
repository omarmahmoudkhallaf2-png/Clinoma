const fs = require('fs');

const notesContent = fs.readFileSync('D:\\Med Prep\\genetics.txt', 'utf8');

const diseases = [
  { title: '[CHROMOSOMAL ABERRATIONS & DISORDERS]', key: 'CHROMOSOMAL ABERRATIONS & DISORDERS' },
  { title: '[CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE]', key: 'CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE' },
  { title: '[INTRODUCTION TO GENETICS & BASIC CONCEPTS]', key: 'INTRODUCTION TO GENETICS & BASIC CONCEPTS' },
  { title: '[PATTERNS OF SINGLE GENE INHERITANCE]', key: 'PATTERNS OF SINGLE GENE INHERITANCE' },
  { title: '[PREVENTIVE GENETICS: LEVELS OF INTERVENTION & SUPPORTIVE SERVICES]', key: 'PREVENTIVE GENETICS' }
];

const notesContentLower = notesContent.toLowerCase();
const parsedNotes = {};

for (let i = 0; i < diseases.length; i++) {
  const currentTitle = diseases[i].title;
  let nextTitle = i + 1 < diseases.length ? diseases[i+1].title : null;
  
  let startIndex = notesContentLower.indexOf(currentTitle.toLowerCase());
  if (startIndex === -1) {
    const looseTitle = currentTitle.replace(/\s+/g, ' ').toLowerCase();
    startIndex = notesContentLower.indexOf(looseTitle);
    if(startIndex === -1) {
       console.warn(`Could not find title: ${currentTitle}`);
       continue;
    }
  }
  
  let endIndex = notesContent.length;
  if (nextTitle) {
    let nextIndex = notesContentLower.indexOf(nextTitle.toLowerCase(), startIndex + currentTitle.length);
    if (nextIndex === -1) {
        nextIndex = notesContentLower.indexOf(nextTitle.replace(/\s+/g, ' ').toLowerCase(), startIndex + currentTitle.length);
    }
    if (nextIndex !== -1) {
      endIndex = nextIndex;
    }
  }
  
  let content = notesContent.substring(startIndex + currentTitle.length, endIndex).trim();
  parsedNotes[diseases[i].key] = content;
}

const targetFiles = [
  'D:\\Med Prep\\client\\src\\pages\\flashcards\\FlashSpace.tsx',
  'D:\\Med Prep\\client\\src\\pages\\PediatricsFolder.tsx'
];

for (const targetFile of targetFiles) {
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
  console.log(`Successfully injected genetics notes into ${targetFile}`);
}
