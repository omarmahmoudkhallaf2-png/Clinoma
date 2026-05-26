const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const targetUIRendering = `{chapters.map(chapter => (
                    <button
                      key={chapter}
                      onClick={() => setSelectedChapter(chapter)}
                      className={\`w-full text-right p-4 rounded-2xl font-black text-sm transition-all flex items-center justify-between group \${
                        selectedChapter === chapter 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                          : 'hover:bg-slate-50 text-slate-600 hover:text-indigo-600'
                      }\`}
                    >
                      <span className="flex-1 truncate">{chapter}</span>
                      <ChevronRight className={\`w-4 h-4 transition-transform duration-300 \${
                        selectedChapter === chapter ? 'rotate-90 opacity-100' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'
                      }\`} />
                    </button>
                  ))}`;

const replacementUIRendering = `{chapters.map(chapter => (
                    <button
                      key={chapter}
                      onClick={() => setSelectedChapter(chapter)}
                      className={\`w-full text-right p-4 rounded-2xl font-black text-sm transition-all flex items-center justify-between group \${
                        chapter === 'تحديدات الاطفال' ? (
                          selectedChapter === chapter
                            ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xl shadow-rose-500/30 ring-2 ring-rose-500/50 scale-[1.02]'
                            : 'bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 hover:scale-[1.02] border-2 border-rose-200 shadow-md shadow-rose-500/10 hover:shadow-lg animate-pulse'
                        ) : (
                          selectedChapter === chapter 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'hover:bg-slate-50 text-slate-600 hover:text-indigo-600'
                        )
                      }\`}
                    >
                      <span className="flex-1 truncate">{chapter} {chapter === 'تحديدات الاطفال' && '🔥'}</span>
                      <ChevronRight className={\`w-4 h-4 transition-transform duration-300 \${
                        selectedChapter === chapter ? 'rotate-90 opacity-100' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'
                      }\`} />
                    </button>
                  ))}`;

if (content.includes(targetUIRendering)) {
    content = content.replace(targetUIRendering, replacementUIRendering);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log("Restored Tahdedat UI styling successfully!");
} else {
    console.error("Could not find the target UI rendering block!");
}
