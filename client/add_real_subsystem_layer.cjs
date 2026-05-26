const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetViewer = `          ) : (
            // BOARD/SLIDE SELECTION - premium glassmorphism layout`;

const replaceViewer = `          ) : selectedSystem === 'تحديدات الاطفال' && !selectedSubSystem ? (
            // --- SUB-SYSTEM SELECTION FOR TAHDEDAT ---
            <div className="h-full flex flex-col p-4 md:p-8 gap-6 md:gap-8 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-4 shrink-0 mt-2">
                <button onClick={() => {
                  setSelectedSystem(null);
                }} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 border border-white/5">
                    {selectedModule} <ChevronRight className="w-3 h-3 mx-1" /> تحديدات الاطفال
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Choose a Chapter</h2>
                  <p className="text-slate-500 text-sm mt-0.5 tracking-wide uppercase font-bold">Select a Chapter</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {Array.from(new Set(boards.filter(b => b.system === 'تحديدات الاطفال').map(b => b.subSystem))).filter(Boolean).sort().map(subSys => {
                    const color = '#6366f1';
                    
                    const SYSTEM_BGS: Record<string, string> = {
                      'CVS': '/assets/chapters/cardio_bg_1779636563389.png',
                      'Endocrinology': '/assets/chapters/endo_bg_1779636576095.png',
                      'GIT': '/assets/chapters/gastro_bg_1779636588519.png',
                      'Genetics': '/assets/chapters/genetic_bg_1779636605335.png',
                      'Growth & Development': '/assets/chapters/growth_bg_1779636618747.png',
                      'Hematology & Oncology': '/assets/chapters/hemato_bg_1779636647999.png',
                      'Infection': '/assets/chapters/infect_bg_1779636662158.png',
                      'Neurology': '/assets/chapters/neuro_bg_1779636673967.png',
                      'Nutrition': '/assets/chapters/nutrition_bg_1779636686441.png',
                    };

                    const lwSys = subSys.toLowerCase();
                    let SysIcon = Stethoscope;
                    if (lwSys.includes('cvs')) SysIcon = Heart;
                    else if (lwSys.includes('neuro')) SysIcon = Brain;
                    else if (lwSys.includes('git')) SysIcon = Apple;
                    
                    return (
                      <button
                        key={subSys}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubSystem(subSys);
                        }}
                        className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 active:border-white/20 hover:border-white/20 rounded-3xl text-left transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] overflow-hidden p-6 flex flex-col justify-between min-h-[160px] hover:shadow-2xl"
                      >
                        {SYSTEM_BGS[subSys] && (
                          <div className="absolute inset-0 z-0">
                            <img src={SYSTEM_BGS[subSys]} alt={subSys} className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all duration-500 mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                          </div>
                        )}

                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-3xl rounded-full z-0" style={{background: color, transform: 'translate(30%, -30%)'}} />
                        
                        <div className="relative z-10 flex justify-between items-start w-full">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/90 border border-white/20 shadow-inner group-hover:-translate-y-1 transition-transform duration-300">
                            <SysIcon className="w-6 h-6 drop-shadow-md" />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-indigo-500 group-hover:border-indigo-400 group-hover:text-white transition-all duration-300">
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                          </div>
                        </div>

                        <div className="relative z-10 mt-6">
                          <h3 className="text-xl font-black text-white/90 leading-tight group-hover:text-white transition-colors">{subSys}</h3>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // BOARD/SLIDE SELECTION - premium glassmorphism layout`;

if (content.includes(targetViewer)) {
    content = content.replace(targetViewer, replaceViewer);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Subsystem architecture added successfully!');
} else {
    console.error('Target not found!');
}
