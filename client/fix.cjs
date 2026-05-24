const fs = require('fs');
let code = fs.readFileSync('d:/Med Prep/client/src/pages/flashcards/FlashSpace.tsx', 'utf8');

// Replace literal {\n strings with real newlines
code = code.replace(/\\{\\\\n/g, '{\n'); 
// Fix escaped backticks
code = code.replace(/:\\s*\\\\`/g, ': `');
code = code.replace(/\\\\`,/g, '`,');
code = code.replace(/\\\\`\\n/g, '`\n');

// Also handle the start of the object if it was written as = {\n
code = code.replace(/=\\s*\\{\\\\n/g, '= {\n');

fs.writeFileSync('d:/Med Prep/client/src/pages/flashcards/FlashSpace.tsx', code);
console.log('Fixed syntax errors');
