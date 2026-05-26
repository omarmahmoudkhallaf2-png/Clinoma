const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetCast = `const target = e.target;`;
const replaceCast = `const target = e.target as HTMLTextAreaElement;`;

if (content.includes(targetCast)) {
    content = content.replace(targetCast, replaceCast);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Fixed target cast');
}
