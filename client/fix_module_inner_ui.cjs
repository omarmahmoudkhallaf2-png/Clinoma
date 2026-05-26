const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetInner = `                      {/* Gradient Glow */}
                      <div className="absolute top-0 right-0 w-40 h-40 opacity-10 group-hover:opacity-30 transition-opacity duration-500 blur-3xl rounded-full" style={{background: '#6366f1', transform: 'translate(40%, -40%)'}} />
                      
                      <div className="relative z-10 flex flex-col h-full gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:-translate-y-1 transition-transform duration-300">
                          <BookOpen className="w-7 h-7 drop-shadow-md" />
                        </div>
                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <h3 className="text-xl font-black text-white leading-tight">{mod}</h3>`;

const replaceInner = `                      {/* Gradient Glow */}
                      <div className="absolute top-0 right-0 w-40 h-40 opacity-10 group-hover:opacity-30 transition-opacity duration-500 blur-3xl rounded-full" style={{background: mod === 'تحديدات الاطفال' ? '#f97316' : '#6366f1', transform: 'translate(40%, -40%)'}} />
                      
                      <div className="relative z-10 flex flex-col h-full gap-4">
                        <div className={\`w-14 h-14 bg-gradient-to-br border rounded-2xl flex items-center justify-center shadow-inner group-hover:-translate-y-1 transition-transform duration-300 \${
                          mod === 'تحديدات الاطفال' 
                            ? 'from-orange-500/20 to-rose-500/10 border-orange-500/30 text-orange-400' 
                            : 'from-indigo-500/20 to-violet-500/10 border-indigo-500/20 text-indigo-400'
                        }\`}>
                          {mod === 'تحديدات الاطفال' ? <Zap className="w-7 h-7 drop-shadow-md animate-pulse" /> : <BookOpen className="w-7 h-7 drop-shadow-md" />}
                        </div>
                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <h3 className={\`text-xl font-black leading-tight \${mod === 'تحديدات الاطفال' ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400' : 'text-white'}\`}>{mod} {mod === 'تحديدات الاطفال' && '🔥'}</h3>`;

if (content.includes(targetInner)) {
    content = content.replace(targetInner, replaceInner);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Inner UI updated successfully!');
} else {
    console.error('Inner target not found!');
}
