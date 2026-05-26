const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const oldSidebarMap = `{boards
            .filter(b => b.module === selectedBoard?.module && b.system === selectedBoard?.system)
            .map((board, idx) => (
              <button
                key={board.id}
                onClick={() => { setSelectedBoard(board); setIsSidebarOpen(false); setPaths([]); setRedoPaths([]); setShowExplanation(false); setShowQuestions(false); }}
                className={cn(
                  "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all border-b border-slate-50",
                  selectedBoard?.id === board.id
                    ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                    : "hover:bg-slate-50"
                )}
              >
                <span className={cn("text-[10px] font-black w-5 shrink-0", selectedBoard?.id === board.id ? "text-indigo-500" : "text-slate-300")}>{idx + 1}</span>
                <span className={cn("text-[11px] font-bold leading-snug line-clamp-2", selectedBoard?.id === board.id ? "text-indigo-700" : "text-slate-500")}>{board.disease}</span>
              </button>
            ))}`;

const newSidebarMap = `{(() => {
            const filteredBoards = boards.filter(b => b.module === selectedBoard?.module && b.system === selectedBoard?.system);
            
            if (selectedBoard?.system === 'تحديدات الاطفال') {
              const grouped = filteredBoards.reduce((acc, b) => {
                const sub = b.subSystem || 'Other';
                if (!acc[sub]) acc[sub] = [];
                acc[sub].push(b);
                return acc;
              }, {});
              
              let globalIdx = 0;
              return Object.entries(grouped).map(([subSys, sysBoards]) => (
                <div key={subSys}>
                  <div className="bg-slate-100/80 px-4 py-2 sticky top-0 backdrop-blur-md border-y border-slate-200 z-10 flex items-center gap-2 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{subSys}</span>
                  </div>
                  {sysBoards.map((board) => {
                    globalIdx++;
                    return (
                      <button
                        key={board.id}
                        onClick={() => { setSelectedBoard(board); setIsSidebarOpen(false); setPaths([]); setRedoPaths([]); setShowExplanation(false); setShowQuestions(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all border-b border-slate-50",
                          selectedBoard?.id === board.id
                            ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <span className={cn("text-[10px] font-black w-5 shrink-0", selectedBoard?.id === board.id ? "text-indigo-500" : "text-slate-300")}>{globalIdx}</span>
                        <span className={cn("text-[11px] font-bold leading-snug line-clamp-2", selectedBoard?.id === board.id ? "text-indigo-700" : "text-slate-500")}>{board.disease}</span>
                      </button>
                    )
                  })}
                </div>
              ));
            }

            return filteredBoards.map((board, idx) => (
              <button
                key={board.id}
                onClick={() => { setSelectedBoard(board); setIsSidebarOpen(false); setPaths([]); setRedoPaths([]); setShowExplanation(false); setShowQuestions(false); }}
                className={cn(
                  "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all border-b border-slate-50",
                  selectedBoard?.id === board.id
                    ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                    : "hover:bg-slate-50"
                )}
              >
                <span className={cn("text-[10px] font-black w-5 shrink-0", selectedBoard?.id === board.id ? "text-indigo-500" : "text-slate-300")}>{idx + 1}</span>
                <span className={cn("text-[11px] font-bold leading-snug line-clamp-2", selectedBoard?.id === board.id ? "text-indigo-700" : "text-slate-500")}>{board.disease}</span>
              </button>
            ));
          })()}`;

if (content.includes(oldSidebarMap)) {
    content = content.replace(oldSidebarMap, newSidebarMap);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log("Successfully patched sidebar map");
} else {
    console.error("Could not find the sidebar map!");
}
