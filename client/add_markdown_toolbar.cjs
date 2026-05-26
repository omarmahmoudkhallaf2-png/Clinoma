const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// Target the start of the textarea container
const targetContainer = `<div className="flex-1 min-h-0 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mb-4 relative">
              <textarea`;

const replacementContainer = `<div className="w-full bg-slate-100 p-2 rounded-t-2xl border border-b-0 border-slate-200 flex gap-2">
              <button onClick={() => setEditedNoteText(prev => prev + '\\n# عنوان رئيسي\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">H1</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n## عنوان فرعي 1\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">H2</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n### عنوان فرعي 2\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">H3</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n**نص عريض**')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">Bold</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n* نقطة جديدة')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">List</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n\\n---\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">Line</button>
            </div>
            <div className="flex-1 min-h-0 bg-slate-50 rounded-b-2xl border border-slate-200 overflow-hidden mb-4 relative">
              <textarea`;

if (content.includes(targetContainer)) {
    content = content.replace(targetContainer, replacementContainer);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Toolbar added successfully!');
} else {
    console.error('Target container not found in FlashSpace.tsx');
}
