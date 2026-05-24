const fs = require('fs');
let code = fs.readFileSync('d:/Med Prep/client/src/pages/flashcards/FlashSpace.tsx', 'utf8');

// The string contains literally {\n which is wrong, it should be { and an actual newline
code = code.replace(/\\{\\\\n/g, '{\n'); 
code = code.replace(/:\\s*\\\\`/g, ': `');
code = code.replace(/\\\\`,/g, '`,');
code = code.replace(/\\\\`\\n/g, '`\n');

// Also handle the start of the object if it was written as = {\n
code = code.replace(/=\\s*\\{\\\\n/g, '= {\n');

fs.writeFileSync('d:/Med Prep/client/src/pages/flashcards/FlashSpace.tsx', code);
console.log('Fixed syntax errors');
