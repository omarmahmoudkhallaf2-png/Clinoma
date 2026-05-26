const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Normalize line endings to \n for easier regex
content = content.replace(/\r\n/g, '\n');

let changesMade = 0;

// Chunk 1
const chunk1 = `  Eye,\n  Check\n} from 'lucide-react';`;
if (content.includes(chunk1)) {
    content = content.replace(chunk1, `  Eye,\n  Check,\n  Edit\n} from 'lucide-react';`);
    changesMade++;
} else {
    console.error("Chunk 1 not found");
}

// Chunk 2
const chunk2 = `  const [reviewFilter, setReviewFilter] = useState<'A'|'B'|'C'>('A');\n\n  useEffect(() => {`;
if (content.includes(chunk2)) {
    content = content.replace(chunk2, `  const [reviewFilter, setReviewFilter] = useState<'A'|'B'|'C'>('A');\n  const [isEditingNotes, setIsEditingNotes] = useState(false);\n  const [editedNoteText, setEditedNoteText] = useState("");\n\n  useEffect(() => {`);
    changesMade++;
} else {
    console.error("Chunk 2 not found");
}

// Chunk 3
const chunk3 = `                  <div>\n                    <h4 className="text-lg md:text-xl font-black text-slate-900">{selectedBoard.disease}</h4>\n                    <p className="text-slate-400 text-xs mt-0.5">{selectedBoard.system}</p>\n                  </div>\n                  <button onClick={() => setShowExplanation(false)} className="p-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">\n                    <X className="w-5 h-5" />\n                  </button>\n                </div>`;
if (content.includes(chunk3)) {
    content = content.replace(chunk3, `                  <div>\n                    <h4 className="text-lg md:text-xl font-black text-slate-900">{selectedBoard.disease}</h4>\n                    <p className="text-slate-400 text-xs mt-0.5">{selectedBoard.system}</p>\n                  </div>\n                  <div className="flex items-center gap-2">\n                    {userRole === 'admin' && activeNoteTab === 'notes' && (\n                      <button onClick={() => { setIsEditingNotes(true); setEditedNoteText(PEDIATRICS_EXPLANATIONS[selectedBoard.disease] || ''); }} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all font-bold text-xs flex items-center gap-2 shadow-sm">\n                        <Edit className="w-4 h-4" />\n                        تعديل النوتس\n                      </button>\n                    )}\n                    <button onClick={() => setShowExplanation(false)} className="p-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">\n                      <X className="w-5 h-5" />\n                    </button>\n                  </div>\n                </div>`);
    changesMade++;
} else {
    console.error("Chunk 3 not found");
}

// Chunk 4
const chunk4 = `      )}\n\n<style>{\``;
if (content.includes(chunk4)) {
    content = content.replace(chunk4, `      )}\n\n      {/* Edit Notes Modal for Admins */}\n      {isEditingNotes && (\n        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4" dir="rtl">\n          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsEditingNotes(false)} />\n          <div className="relative bg-white border border-slate-200 rounded-[2rem] p-6 max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">\n            <div className="flex justify-between items-center mb-4">\n              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">\n                <Edit className="w-6 h-6 text-indigo-500" />\n                تعديل النوتس لـ: <span className="text-indigo-600 font-bold ml-1">{selectedBoard?.disease}</span>\n              </h3>\n              <button onClick={() => setIsEditingNotes(false)} className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-xl transition-all">\n                <X className="w-5 h-5" />\n              </button>\n            </div>\n            <p className="text-slate-500 text-sm mb-4">هذه النوتس مكتوبة بتنسيق Markdown. يمكنك تعديلها ثم نسخها ولصقها في الكود (PEDIATRICS_EXPLANATIONS).</p>\n            \n            <div className="flex-1 min-h-0 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mb-4 relative">\n              <textarea\n                value={editedNoteText}\n                onChange={e => setEditedNoteText(e.target.value)}\n                className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"\n                dir="auto"\n              />\n            </div>\n            \n            <div className="flex justify-end gap-3 shrink-0">\n              <button onClick={() => setIsEditingNotes(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">\n                إلغاء\n              </button>\n              <button \n                onClick={() => {\n                  navigator.clipboard.writeText(editedNoteText);\n                  toast.success('تم نسخ النص بنجاح! يمكنك الآن لصقه في الكود.');\n                }} \n                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"\n              >\n                <Check className="w-5 h-5" />\n                نسخ النص (Copy)\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n\n<style>{\``);
    changesMade++;
} else {
    console.error("Chunk 4 not found");
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log(`File successfully updated! Changes made: ${changesMade}`);
