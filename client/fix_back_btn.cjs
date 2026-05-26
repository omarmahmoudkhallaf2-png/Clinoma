const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// The back button in the BOARD/SLIDE SELECTION screen is around line 6872.
// It looks like:
// <button onClick={() => setSelectedSystem(null)} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">

const targetBackBtn = `<button onClick={() => setSelectedSystem(null)} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">`;
const replaceBackBtn = `<button onClick={() => {
                    if (selectedSystem === 'تحديدات الاطفال' && selectedSubSystem) {
                      setSelectedSubSystem(null);
                    } else {
                      setSelectedSystem(null);
                    }
                  }} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">`;

if (content.includes(targetBackBtn)) {
    content = content.replace(targetBackBtn, replaceBackBtn);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Fixed back button successfully!');
} else {
    console.error('Target not found!');
}
