const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetMap = `.map(subSys => {
                    const color = '#6366f1';`;

const replaceMap = `.map(s => s as string).map(subSys => {
                    const color = '#6366f1';`;

if (content.includes(targetMap)) {
    content = content.replace(targetMap, replaceMap);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Fixed TS errors!');
} else {
    console.error('target not found');
}
