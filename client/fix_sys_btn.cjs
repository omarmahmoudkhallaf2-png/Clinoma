const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetClass = `className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 active:border-white/20 hover:border-white/20 rounded-3xl text-left transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] overflow-hidden p-6 flex flex-col justify-between min-h-[160px] hover:shadow-2xl"`;

const replaceClass = `className={\`group relative backdrop-blur-xl border \${
                          sys === 'تحديدات الاطفال'
                            ? 'bg-gradient-to-br from-slate-900/90 to-orange-950/40 border-orange-500/50 shadow-2xl shadow-orange-500/20 ring-1 ring-orange-500/30 hover:border-orange-400 animate-pulse'
                            : 'bg-slate-900/50 border-white/5 active:border-white/20 hover:border-white/20 hover:shadow-2xl'
                        } rounded-3xl text-left transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] overflow-hidden p-6 flex flex-col justify-between min-h-[160px]\`}`;

if (content.includes(targetClass)) {
    content = content.replace(targetClass, replaceClass);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('System UI updated successfully!');
} else {
    console.error('System target class not found!');
}
