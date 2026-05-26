const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// Update Trending Now badge position to right-4
const targetBadge = `<div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white border border-rose-400/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-lg shadow-rose-500/20">
                            <Zap className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
                            <span className="text-xs font-black tracking-wider">رائج الآن</span>
                          </div>`;

const replaceBadge = `<div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white border border-rose-400/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-lg shadow-rose-500/20">
                            <Zap className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200" />
                            <span className="text-xs font-black tracking-wider">رائج الآن</span>
                          </div>`;

// Move lock icon to left-4 IF sys === 'تحديدات الاطفال' to prevent overlap
// Actually, it's easier to just change the lock class conditionally:
// \`absolute top-4 \${sys === 'تحديدات الاطفال' ? 'left-4' : 'right-4'} z-10...\`
const targetLock = `<div className="absolute top-4 right-4 z-10 bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm shadow-lg">`;
const replaceLock = `<div className={\`absolute top-4 \${sys === 'تحديدات الاطفال' ? 'left-4' : 'right-4'} z-10 bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm shadow-lg\`}>`;

let success = false;
if (content.includes(targetBadge)) {
    content = content.replace(targetBadge, replaceBadge);
    
    if (content.includes(targetLock)) {
        content = content.replace(targetLock, replaceLock);
    }
    
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Fixed badge position successfully!');
} else {
    console.error('Target badge not found!');
}
