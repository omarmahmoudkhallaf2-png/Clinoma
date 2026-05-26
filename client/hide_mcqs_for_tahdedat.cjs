const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Wrap the grid button
const targetGridBtn = `<button
                      onClick={() => {
                        const chapterSlides = boards.filter(b => b.module === selectedModule && b.system === selectedSystem);`;
                        
const replaceGridBtn = `{selectedSystem !== 'تحديدات الاطفال' && (
                    <button
                      onClick={() => {
                        const chapterSlides = boards.filter(b => b.module === selectedModule && b.system === selectedSystem);`;

const targetGridBtnEnd = `<p className="text-emerald-400 font-bold text-[10px] md:text-xs tracking-wider uppercase">Quiz Mode</p>
                        </div>
                      </div>
                    </button>`;
const replaceGridBtnEnd = `<p className="text-emerald-400 font-bold text-[10px] md:text-xs tracking-wider uppercase">Quiz Mode</p>
                        </div>
                      </div>
                    </button>
                  )}`;

// 2. Wrap the sidebar button
const targetSidebarBtn = `<button
            onClick={() => {
              const chapterSlides = boards.filter(b => b.module === selectedBoard?.module && b.system === selectedBoard?.system);`;
              
const replaceSidebarBtn = `{selectedBoard?.system !== 'تحديدات الاطفال' && (
          <button
            onClick={() => {
              const chapterSlides = boards.filter(b => b.module === selectedBoard?.module && b.system === selectedBoard?.system);`;

const targetSidebarBtnEnd = `<span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Practice Chapter</span>
          </button>`;
const replaceSidebarBtnEnd = `<span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Practice Chapter</span>
          </button>
          )}`;

let modified = false;

if (content.includes(targetGridBtn) && content.includes(targetGridBtnEnd)) {
    content = content.replace(targetGridBtn, replaceGridBtn);
    content = content.replace(targetGridBtnEnd, replaceGridBtnEnd);
    modified = true;
    console.log("Grid button wrapped");
} else {
    console.log("Grid button targets not found");
}

if (content.includes(targetSidebarBtn) && content.includes(targetSidebarBtnEnd)) {
    content = content.replace(targetSidebarBtn, replaceSidebarBtn);
    content = content.replace(targetSidebarBtnEnd, replaceSidebarBtnEnd);
    modified = true;
    console.log("Sidebar button wrapped");
} else {
    console.log("Sidebar button targets not found");
}

if (modified) {
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Script completed');
}
