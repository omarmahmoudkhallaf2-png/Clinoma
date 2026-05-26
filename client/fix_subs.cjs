const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetSub1 = `if (sys === 'Growth & development' || (selectedModule && isSpaceSubscribed(selectedModule))) {`;
const replaceSub1 = `if (sys === 'Growth & development' || (selectedModule && isSpaceSubscribed(selectedModule === 'تحديدات الاطفال' ? 'Pediatrics' : selectedModule))) {`;

if (content.includes(targetSub1)) {
    content = content.replace(targetSub1, replaceSub1);
}

const targetSub2 = `{(!selectedModule || !isSpaceSubscribed(selectedModule)) && sys !== 'Growth & development' && (`;
const replaceSub2 = `{(!selectedModule || !isSpaceSubscribed(selectedModule === 'تحديدات الاطفال' ? 'Pediatrics' : selectedModule)) && sys !== 'Growth & development' && (`;

if (content.includes(targetSub2)) {
    content = content.replace(targetSub2, replaceSub2);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Subscription logic updated successfully!');
