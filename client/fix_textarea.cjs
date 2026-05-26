const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// The original textarea class was:
// className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
const targetClass = `className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"`;
const replacementClass = `className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-slate-900"`;

if (content.includes(targetClass)) {
    content = content.replace(targetClass, replacementClass);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Textarea class updated successfully!');
} else {
    console.error('Target class not found in FlashSpace.tsx');
}
