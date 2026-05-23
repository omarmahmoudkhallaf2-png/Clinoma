const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'flashcards', 'FlashSpace.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/\\n\d+\.\s/g, '\\n');
content = content.replace(/"back": "\d+\.\s/g, '"back": "');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Numbers removed!');
