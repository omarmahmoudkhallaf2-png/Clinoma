const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// Import turndown at the top
const importTurndown = `import TurndownService from 'turndown';\nimport { cn } from '../../lib/utils';`;
if (content.includes(`import { cn } from '../../lib/utils';`)) {
    content = content.replace(`import { cn } from '../../lib/utils';`, importTurndown);
}

// Add onPaste handler inside the textarea
// Target the textarea tag
const targetTextarea = `<textarea\n                value={editedNoteText}\n                onChange={e => setEditedNoteText(e.target.value)}\n                className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-slate-900"\n                dir="auto"\n              />`;

const replaceTextarea = `<textarea\n                value={editedNoteText}\n                onChange={e => setEditedNoteText(e.target.value)}\n                onPaste={(e) => {\n                  const html = e.clipboardData.getData('text/html');\n                  if (html) {\n                    e.preventDefault();\n                    const turndownService = new TurndownService();\n                    const markdown = turndownService.turndown(html);\n                    \n                    // Insert at cursor position or replace\n                    const target = e.target;\n                    const start = target.selectionStart;\n                    const end = target.selectionEnd;\n                    const newValue = editedNoteText.substring(0, start) + markdown + editedNoteText.substring(end);\n                    setEditedNoteText(newValue);\n                    \n                    // Restore cursor position slightly after render\n                    setTimeout(() => {\n                      target.selectionStart = target.selectionEnd = start + markdown.length;\n                    }, 0);\n                  }\n                }}\n                className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-slate-900"\n                dir="auto"\n              />`;

if (content.includes(targetTextarea)) {
    content = content.replace(targetTextarea, replaceTextarea);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('onPaste handler added successfully!');
} else {
    console.error('Textarea target not found');
}
