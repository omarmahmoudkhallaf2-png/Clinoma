const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetInt = `  system: string;
  disease: string;`;
const replaceInt = `  system: string;
  subSystem?: string;
  disease: string;`;

if (content.includes(targetInt)) {
    content = content.replace(targetInt, replaceInt);
}

// Fix selectionStart issue for input/textarea
const targetSel1 = `e.target.selectionStart`;
const replaceSel1 = `(e.target as HTMLInputElement | HTMLTextAreaElement).selectionStart`;

while (content.includes(targetSel1)) {
    content = content.replace(targetSel1, replaceSel1);
}

const targetSel2 = `e.target.selectionEnd`;
const replaceSel2 = `(e.target as HTMLInputElement | HTMLTextAreaElement).selectionEnd`;

while (content.includes(targetSel2)) {
    content = content.replace(targetSel2, replaceSel2);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('TS fixes applied!');
