const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'flashcards', 'FlashSpace.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Also remove from front
content = content.replace(/"front": "\d+\)\s/g, '"front": "');
content = content.replace(/"front": "Q\d+:\s?/g, '"front": "');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Numbers removed from front!');
