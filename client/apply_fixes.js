const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix CaseStudyUI Priority Button Overlap
const caseStudyUIOriginal = `        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

          {onSetPriority && (
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mx-2">Priority:</span>
              {(['A', 'B', 'C'] as const).map(p => (
                <button
                  key={p}
                  onClick={(e) => { e.stopPropagation(); onSetPriority(currentPriority === p ? null : p); }}
                  className={\`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-all \${currentPriority === p ? (p === 'A' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110' : p === 'B' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-110' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110') : 'bg-white dark:bg-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}\`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-indigo-600 dark:text-indigo-300 font-black">C</span>
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-base md:text-lg whitespace-pre-wrap leading-relaxed" dir="auto">{question.caseBody}</h3>
          </div>
        </div>`;

const caseStudyUIFixed = `        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

        <div className="flex flex-col md:flex-row items-start justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center shrink-0 mt-1">
              <span className="text-indigo-600 dark:text-indigo-300 font-black">C</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-base md:text-lg whitespace-pre-wrap leading-relaxed pt-1" dir="auto">{question.caseBody}</h3>
            </div>
          </div>
          
          {onSetPriority && (
            <div className="shrink-0 flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm self-end md:self-start">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mx-2">Priority:</span>
              {(['A', 'B', 'C'] as const).map(p => (
                <button
                  key={p}
                  onClick={(e) => { e.stopPropagation(); onSetPriority(currentPriority === p ? null : p); }}
                  className={\`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-all \${currentPriority === p ? (p === 'A' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110' : p === 'B' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-110' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110') : 'bg-white dark:bg-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}\`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>`;

content = content.replace(caseStudyUIOriginal, caseStudyUIFixed);
console.log('CaseStudyUI Priority replaced:', content.includes(caseStudyUIFixed));

// 2. Insert Notes State Variables
const stateOriginal = `  const [showSummary, setShowSummary] = useState(false);
  const [activeNoteTab, setActiveNoteTab] = useState<'notes' | 'questions'>('notes');

  // --- Question Session State ---`;

const stateFixed = `  const [showSummary, setShowSummary] = useState(false);
  const [activeNoteTab, setActiveNoteTab] = useState<'notes' | 'questions'>('notes');

  // --- Editable Notes State ---
  const [currentNote, setCurrentNote] = useState<string>('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (selectedBoard) {
      const fetchNote = async () => {
        try {
          const docRef = doc(db, 'space_notes', selectedBoard.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCurrentNote(docSnap.data().content || '');
          } else {
            setCurrentNote(PEDIATRICS_EXPLANATIONS[selectedBoard.disease] || '');
          }
        } catch (err) {
          console.error('Failed to fetch note:', err);
        }
      };
      fetchNote();
    }
  }, [selectedBoard]);

  const handleSaveNote = async () => {
    if (!selectedBoard) return;
    setIsSavingNote(true);
    try {
      const docRef = doc(db, 'space_notes', selectedBoard.id);
      await setDoc(docRef, { content: currentNote }, { merge: true });
      toast.success('Note saved successfully');
      setIsEditingNote(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save note');
    } finally {
      setIsSavingNote(false);
    }
  };

  // --- Question Session State ---`;

content = content.replace(stateOriginal, stateFixed);
console.log('States added:', content.includes('isEditingNote'));

// 3. Update the UI rendering of the note
const renderOriginal = `                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  {activeNoteTab === 'notes' ? (
                    <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 pb-20" dir="rtl">
                      {PEDIATRICS_EXPLANATIONS[selectedBoard.disease] ? (
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-black text-black mt-8 mb-4 border-b pb-3 border-slate-200 text-right" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-black text-black mt-6 mb-3 border-r-4 border-black pr-3 text-right" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-extrabold text-black mt-5 mb-2 text-right" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-black leading-loose text-base text-right" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mr-4 mb-4 space-y-2 text-black text-right" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mr-4 mb-4 space-y-2 text-black text-right" {...props} />,
                            li: ({node, ...props}) => <li className="marker:text-black" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-black font-black bg-slate-100 px-2 py-0.5 rounded-lg mx-0.5" {...props} />,
                            hr: ({node, ...props}) => <hr className="my-8 border-slate-200" {...props} />,
                          }}
                        >
                          {PEDIATRICS_EXPLANATIONS[selectedBoard.disease]}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center" dir="ltr">
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="font-black text-slate-400 text-lg">Notes Coming Soon</p>
                          <p className="text-slate-300 text-sm mt-2">Notes for this slide are being prepared</p>
                        </div>
                      )}
                    </div>`;

const renderFixed = `                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  {activeNoteTab === 'notes' ? (
                    <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 pb-20" dir="rtl">
                      {userRole === 'admin' && (
                        <div className="mb-6 flex justify-end gap-3" dir="ltr">
                          {isEditingNote ? (
                            <>
                              <button onClick={() => { setIsEditingNote(false); setCurrentNote(currentNote); }} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all">Cancel</button>
                              <button onClick={handleSaveNote} disabled={isSavingNote} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md">{isSavingNote ? 'Saving...' : 'Save Note'}</button>
                            </>
                          ) : (
                            <button onClick={() => setIsEditingNote(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2"><Pencil className="w-4 h-4" /> Edit Note</button>
                          )}
                        </div>
                      )}

                      {isEditingNote ? (
                        <textarea
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          className="w-full h-[60vh] p-6 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white text-slate-800 font-sans text-base leading-loose resize-none transition-all custom-scrollbar"
                          dir="rtl"
                          placeholder="Type notes in Markdown format..."
                        />
                      ) : currentNote ? (
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-black text-black mt-8 mb-4 border-b pb-3 border-slate-200 text-right" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-black text-black mt-6 mb-3 border-r-4 border-black pr-3 text-right" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-extrabold text-black mt-5 mb-2 text-right" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-black leading-loose text-base text-right" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mr-4 mb-4 space-y-2 text-black text-right" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mr-4 mb-4 space-y-2 text-black text-right" {...props} />,
                            li: ({node, ...props}) => <li className="marker:text-black" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-black font-black bg-slate-100 px-2 py-0.5 rounded-lg mx-0.5" {...props} />,
                            hr: ({node, ...props}) => <hr className="my-8 border-slate-200" {...props} />,
                          }}
                        >
                          {currentNote}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center" dir="ltr">
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="font-black text-slate-400 text-lg">Notes Coming Soon</p>
                          <p className="text-slate-300 text-sm mt-2">Notes for this slide are being prepared</p>
                        </div>
                      )}
                    </div>`;

content = content.replace(renderOriginal, renderFixed);
console.log('UI Replace successful:', content.includes('Edit Note'));

fs.writeFileSync(filePath, content, 'utf8');
console.log('FlashSpace.tsx updated successfully');
