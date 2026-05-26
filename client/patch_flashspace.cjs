const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Normalize line endings to \n
content = content.replace(/\r\n/g, '\n');

let changesMade = 0;

// Chunk 1: Add setDoc and doc to firebase imports
const chunk1 = `import { collection, query, getDocs, orderBy, doc, getDoc, updateDoc, increment } from 'firebase/firestore';`;
if (content.includes(chunk1)) {
    content = content.replace(chunk1, `import { collection, query, getDocs, orderBy, doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';`);
    changesMade++;
} else {
    console.error("Chunk 1 not found");
}

// Chunk 2: Add firebaseNotes state
const chunk2 = `  const [isEditingNotes, setIsEditingNotes] = useState(false);\n  const [editedNoteText, setEditedNoteText] = useState("");`;
if (content.includes(chunk2)) {
    content = content.replace(chunk2, `  const [isEditingNotes, setIsEditingNotes] = useState(false);\n  const [editedNoteText, setEditedNoteText] = useState("");\n  const [firebaseNotes, setFirebaseNotes] = useState<Record<string, string>>({});`);
    changesMade++;
} else {
    console.error("Chunk 2 not found");
}

// Chunk 3: Update fetchData
const chunk3Target = `      try {\n        const snap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));\n        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));\n        \n        // Add the Pediatrics boards dynamically\n        const generatedPediatricsBoards: Board[] = [];\n        Object.entries(PEDIATRICS_SLIDES).forEach(([chapter, files]) => {\n          files.forEach(file => {\n            const title = file.replace(/\\.[^/.]+$/, "");\n            const customExp = PEDIATRICS_EXPLANATIONS[title];`;

const chunk3Replace = `      try {\n        // Fetch custom notes\n        const notesSnap = await getDocs(collection(db, 'flashspace_notes'));\n        const notesMap: Record<string, string> = {};\n        notesSnap.forEach(d => { notesMap[d.id] = d.data().content; });\n        setFirebaseNotes(notesMap);\n\n        const snap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));\n        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));\n        \n        // Add the Pediatrics boards dynamically\n        const generatedPediatricsBoards: Board[] = [];\n        Object.entries(PEDIATRICS_SLIDES).forEach(([chapter, files]) => {\n          files.forEach(file => {\n            const title = file.replace(/\\.[^/.]+$/, "");\n            const customExp = notesMap[title] || PEDIATRICS_EXPLANATIONS[title];`;

if (content.includes(chunk3Target)) {
    content = content.replace(chunk3Target, chunk3Replace);
    changesMade++;
} else {
    console.error("Chunk 3 not found");
}

// Chunk 4: Edit Button (load existing note from Firebase first)
const chunk4Target = `<button onClick={() => { setIsEditingNotes(true); setEditedNoteText(PEDIATRICS_EXPLANATIONS[selectedBoard.disease] || ''); }} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all font-bold text-xs flex items-center gap-2 shadow-sm">\n                        <Edit className="w-4 h-4" />\n                        تعديل النوتس\n                      </button>`;
const chunk4Replace = `<button onClick={() => { setIsEditingNotes(true); setEditedNoteText(firebaseNotes[selectedBoard.disease] || PEDIATRICS_EXPLANATIONS[selectedBoard.disease] || ''); }} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all font-bold text-xs flex items-center gap-2 shadow-sm">\n                        <Edit className="w-4 h-4" />\n                        تعديل النوتس\n                      </button>`;
if (content.includes(chunk4Target)) {
    content = content.replace(chunk4Target, chunk4Replace);
    changesMade++;
} else {
    console.error("Chunk 4 not found");
}

// Chunk 5: Notes display condition
const chunk5Target = `{PEDIATRICS_EXPLANATIONS[selectedBoard.disease] ? (\n                        <ReactMarkdown`;
const chunk5Replace = `{(firebaseNotes[selectedBoard.disease] || PEDIATRICS_EXPLANATIONS[selectedBoard.disease]) ? (\n                        <ReactMarkdown`;
if (content.includes(chunk5Target)) {
    content = content.replace(chunk5Target, chunk5Replace);
    changesMade++;
} else {
    console.error("Chunk 5 not found");
}

// Chunk 6: Notes rendering content
const chunk6Target = `>
                          {PEDIATRICS_EXPLANATIONS[selectedBoard.disease]}
                        </ReactMarkdown>`;
const chunk6Replace = `>
                          {firebaseNotes[selectedBoard.disease] || PEDIATRICS_EXPLANATIONS[selectedBoard.disease]}
                        </ReactMarkdown>`;
if (content.includes(chunk6Target)) {
    content = content.replace(chunk6Target, chunk6Replace);
    changesMade++;
} else {
    console.error("Chunk 6 not found");
}

// Chunk 7: Modal button and instruction
const chunk7Target = `              <button onClick={() => setIsEditingNotes(false)} className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-xl transition-all">\n                <X className="w-5 h-5" />\n              </button>\n            </div>\n            <p className="text-slate-500 text-sm mb-4">هذه النوتس مكتوبة بتنسيق Markdown. يمكنك تعديلها ثم نسخها ولصقها في الكود (PEDIATRICS_EXPLANATIONS).</p>`;
const chunk7Replace = `              <button onClick={() => setIsEditingNotes(false)} className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-xl transition-all">\n                <X className="w-5 h-5" />\n              </button>\n            </div>\n            <p className="text-slate-500 text-sm mb-4">هذه النوتس مكتوبة بتنسيق Markdown. سيتم حفظ التعديلات مباشرة في قاعدة البيانات.</p>`;
if (content.includes(chunk7Target)) {
    content = content.replace(chunk7Target, chunk7Replace);
    changesMade++;
} else {
    console.error("Chunk 7 not found");
}

// Chunk 8: Save button instead of copy
const chunk8Target = `              <button \n                onClick={() => {\n                  navigator.clipboard.writeText(editedNoteText);\n                  toast.success('تم نسخ النص بنجاح! يمكنك الآن لصقه في الكود.');\n                }} \n                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"\n              >\n                <Check className="w-5 h-5" />\n                نسخ النص (Copy)\n              </button>`;
const chunk8Replace = `              <button \n                onClick={async () => {\n                  try {\n                    await setDoc(doc(db, 'flashspace_notes', selectedBoard.disease), { content: editedNoteText, updatedAt: Date.now() }, { merge: true });\n                    setFirebaseNotes(prev => ({...prev, [selectedBoard.disease]: editedNoteText}));\n                    toast.success('تم حفظ النوتس بنجاح في الموقع!');\n                    setIsEditingNotes(false);\n                  } catch(e) {\n                    console.error(e);\n                    toast.error('حدث خطأ أثناء الحفظ.');\n                  }\n                }} \n                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"\n              >\n                <Check className="w-5 h-5" />\n                حفظ التعديلات\n              </button>`;
if (content.includes(chunk8Target)) {
    content = content.replace(chunk8Target, chunk8Replace);
    changesMade++;
} else {
    console.error("Chunk 8 not found");
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log(`File successfully updated! Changes made: ${changesMade}`);
