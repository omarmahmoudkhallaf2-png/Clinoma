const fs = require('fs');

const lines = fs.readFileSync('D:\\Med Prep\\cardio.txt', 'utf8').split('\n');

function getLines(start, end) {
    return lines.slice(start - 1, end).join('\n').trim();
}

const parsedNotes = {
    'Acute Rheumatic Fever (ARF)': getLines(35, 44),
    'Acyanotic Obstructive Lesions (Aortic Stenosis)': getLines(99, 104),
    'Acyanotic Obstructive Lesions (Pulmonary Stenosis)': getLines(106, 111),
    'Atrial Septal Defect (ASD)': getLines(115, 129),
    'CHD Introduction & Etiological Classifications': getLines(153, 167),
    'Coarctation of the Aorta (CoA)': getLines(203, 236),
    'Complete Transposition of the Great Arteries (TGA)': getLines(238, 246),
    'Patent Ductus Arteriosus (PDA)': getLines(279, 292),
    'Pediatric Heart Failure (HF)': getLines(307, 338),
    'Tetralogy of Fallot (TOF) & Hypercyanotic Spells': getLines(351, 394),
    'Ventricular Septal Defect (VSD) -1': getLines(447, 478),
    'Ventricular Septal Defect (VSD) - 2': getLines(409, 433)
};

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
  console.log(`Successfully injected cardio notes into ${targetFile}`);
}
