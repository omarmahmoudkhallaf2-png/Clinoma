const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// Target modules rendering
const targetModuleRender = `                    <button key={mod} onClick={() => setSelectedModule(mod)}
                      className="group relative backdrop-blur-xl border border-white/5 active:border-indigo-500/50 hover:border-indigo-500/50 rounded-3xl text-left transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] overflow-hidden p-6 hover:shadow-2xl hover:shadow-indigo-500/10 bg-slate-900/50"
                    >`;

const replaceModuleRender = `                    <button key={mod} onClick={() => setSelectedModule(mod)}
                      className={\`group relative backdrop-blur-xl border \${
                        mod === 'تحديدات الاطفال' 
                          ? 'border-orange-500/50 hover:border-orange-500 shadow-xl shadow-orange-500/20 bg-gradient-to-br from-slate-900/80 to-orange-950/30 ring-1 ring-orange-500/30' 
                          : 'border-white/5 active:border-indigo-500/50 hover:border-indigo-500/50 bg-slate-900/50'
                      } rounded-3xl text-left transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] overflow-hidden p-6 hover:shadow-2xl hover:shadow-indigo-500/10\`}
                    >`;

if (content.includes(targetModuleRender)) {
    content = content.replace(targetModuleRender, replaceModuleRender);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Module UI updated successfully!');
} else {
    console.error('Module target not found!');
}
