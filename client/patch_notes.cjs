const fs = require('fs');
const path = 'd:\\Med Prep\\client\\src\\pages\\flashcards\\FlashSpace.tsx';
let content = fs.readFileSync(path, 'utf8');

// Chunk 1: Imports
content = content.replace(
  `import { cn } from '../../lib/utils';`,
  `import { cn } from '../../lib/utils';\nimport ReactQuill from 'react-quill';\nimport 'react-quill/dist/quill.snow.css';`
);

// Chunk 2: State
content = content.replace(
  `  const [editedNoteText, setEditedNoteText] = useState("");`,
  `  const [editedNoteText, setEditedNoteText] = useState("");\n  const [firebaseNotes, setFirebaseNotes] = useState<Record<string, string>>({});\n  const [isSavingNote, setIsSavingNote] = useState(false);`
);

// Chunk 3: Fetching notes
content = content.replace(
  `      try {\n        const snap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));`,
  `      try {\n        getDocs(collection(db, 'notes')).then(notesSnap => {\n          const notesData: Record<string, string> = {};\n          notesSnap.docs.forEach(doc => { notesData[doc.id] = doc.data().content; });\n          setFirebaseNotes(notesData);\n        }).catch(err => console.error("Error fetching notes:", err));\n\n        const snap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));`
);

// Chunk 4: Edit Button Click
content = content.replace(
  `<button onClick={() => { setIsEditingNotes(true); setEditedNoteText(PEDIATRICS_EXPLANATIONS[selectedBoard.disease] || ''); }} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all font-bold text-xs flex items-center gap-2 shadow-sm">`,
  `<button onClick={() => { setIsEditingNotes(true); setEditedNoteText(firebaseNotes[selectedBoard.disease] || PEDIATRICS_EXPLANATIONS[selectedBoard.disease] || ''); }} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all font-bold text-xs flex items-center gap-2 shadow-sm">`
);

// Chunk 5: Rendering Notes
content = content.replace(
  `                    <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 pb-20" dir="rtl">\n                      {PEDIATRICS_EXPLANATIONS[selectedBoard.disease] ? (`,
  `                    <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 pb-20" dir="rtl">\n                      {firebaseNotes[selectedBoard.disease] ? (\n                        <div dangerouslySetInnerHTML={{ __html: firebaseNotes[selectedBoard.disease] }} className="prose prose-slate max-w-none text-slate-800 leading-loose text-base text-right" dir="rtl" />\n                      ) : PEDIATRICS_EXPLANATIONS[selectedBoard.disease] ? (`
);

// Chunk 6: Modal content
const chunk6 = `<p className="text-slate-500 text-sm mb-4">هذه النوتس مكتوبة بتنسيق Markdown. يمكنك تعديلها ثم نسخها ولصقها في الكود (PEDIATRICS_EXPLANATIONS).</p>
            
            <div className="w-full bg-slate-100 p-2 rounded-t-2xl border border-b-0 border-slate-200 flex gap-2">
              <button onClick={() => setEditedNoteText(prev => prev + '\\n# عنوان رئيسي\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">H1</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n## عنوان فرعي 1\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">H2</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n### عنوان فرعي 2\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">H3</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n**نص عريض**')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">Bold</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n* نقطة جديدة')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">List</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n\\n---\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold hover:bg-slate-50">Line</button>
            </div>
            <div className="flex-1 min-h-0 bg-slate-50 rounded-b-2xl border border-slate-200 overflow-hidden mb-4 relative">
              <textarea
                value={editedNoteText}
                onChange={e => setEditedNoteText(e.target.value)}
                className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
                dir="auto"
              />
            </div>
            
            <div className="flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsEditingNotes(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                إلغاء
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(editedNoteText);
                  toast.success('تم نسخ النص بنجاح! يمكنك الآن لصقه في الكود.');
                }} 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Check className="w-5 h-5" />
                نسخ النص (Copy)
              </button>
            </div>`;

const chunk6Replacement = `<p className="text-slate-500 text-sm mb-4">يمكنك تعديل النوتس ولصق النصوص المنسقة هنا، سيتم حفظها تلقائياً لقاعدة البيانات وعرضها للطلاب.</p>
            
            <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4 relative flex flex-col [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-container]:border-none [&_.ql-editor]:text-slate-800 [&_.ql-editor]:text-base [&_.ql-editor]:leading-loose" dir="ltr">
              <ReactQuill 
                theme="snow"
                value={editedNoteText}
                onChange={setEditedNoteText}
                className="flex-1 flex flex-col h-full"
                style={{ height: 'calc(100% - 42px)' }}
              />
            </div>
            
            <div className="flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsEditingNotes(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all" disabled={isSavingNote}>
                إلغاء
              </button>
              <button 
                disabled={isSavingNote}
                onClick={async () => {
                  setIsSavingNote(true);
                  try {
                    const noteId = selectedBoard?.disease || '';
                    if (!noteId) return;
                    await setDoc(doc(db, 'notes', noteId), {
                      content: editedNoteText,
                      updatedAt: Date.now()
                    });
                    setFirebaseNotes(prev => ({ ...prev, [noteId]: editedNoteText }));
                    toast.success('تم حفظ النوتس بنجاح!');
                    setIsEditingNotes(false);
                  } catch (e: any) {
                    toast.error(e.message || 'حدث خطأ أثناء الحفظ');
                  } finally {
                    setIsSavingNote(false);
                  }
                }} 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSavingNote ? <span className="animate-spin text-xl block w-5 h-5">↻</span> : <Check className="w-5 h-5" />}
                حفظ النوتس (Save)
              </button>
            </div>`;

content = content.replace(chunk6, chunk6Replacement);

fs.writeFileSync(path, content);
console.log("Patched successfully!");
