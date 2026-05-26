const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetSysBtn = `                    return (
                    <button key={sys} onClick={() => setSelectedSystem(sys)}
                      className="group relative bg-slate-900 border border-white/10 active:border-indigo-500/50 hover:border-indigo-500/50 rounded-[2rem] text-left transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] overflow-hidden p-6 hover:shadow-2xl hover:shadow-indigo-500/20"
                    >`;

const replaceSysBtn = `                    return (
                    <button key={sys} onClick={() => setSelectedSystem(sys)}
                      className={\`group relative bg-slate-900 border \${
                        sys === 'تحديدات الاطفال'
                          ? 'border-orange-500/50 hover:border-orange-500 shadow-xl shadow-orange-500/20 bg-gradient-to-br from-slate-900/80 to-orange-950/30 ring-1 ring-orange-500/30'
                          : 'border-white/10 active:border-indigo-500/50 hover:border-indigo-500/50'
                      } rounded-[2rem] text-left transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] overflow-hidden p-6 hover:shadow-2xl hover:shadow-indigo-500/20\`}
                    >`;

if (content.includes(targetSysBtn)) {
    content = content.replace(targetSysBtn, replaceSysBtn);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Sys UI updated successfully!');
} else {
    console.error('Sys target not found!');
}
