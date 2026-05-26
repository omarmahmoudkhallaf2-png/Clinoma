const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Remove the custom glowing class
const targetClass = `className={\`group relative backdrop-blur-xl border \${
                          sys === 'تحديدات الاطفال'
                            ? 'bg-gradient-to-br from-slate-900/90 to-orange-950/40 border-orange-500/50 shadow-2xl shadow-orange-500/20 ring-1 ring-orange-500/30 hover:border-orange-400 animate-pulse'
                            : 'bg-slate-900/50 border-white/5 active:border-white/20 hover:border-white/20 hover:shadow-2xl'
                        } rounded-3xl text-left transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] overflow-hidden p-6 flex flex-col justify-between min-h-[160px]\`}`;

const replaceClass = `className="group relative backdrop-blur-xl border bg-slate-900/50 border-white/5 active:border-white/20 hover:border-white/20 hover:shadow-2xl rounded-3xl text-left transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] overflow-hidden p-6 flex flex-col justify-between min-h-[160px]"`;

if (content.includes(targetClass)) {
    content = content.replace(targetClass, replaceClass);
} else {
    console.error('Target class not found');
}

// 2. Add Trending Now badge
const targetBadge = `{/* Admin Views Counter */}`;
const replaceBadge = `{sys === 'تحديدات الاطفال' && (
                          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white border border-rose-400/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-lg shadow-rose-500/20">
                            <Zap className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
                            <span className="text-xs font-black tracking-wider">رائج الآن</span>
                          </div>
                        )}
                        {/* Admin Views Counter */}`;

if (content.includes(targetBadge)) {
    content = content.replace(targetBadge, replaceBadge);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Fixed glow and added badge!');
} else {
    console.error('Target badge not found');
}
