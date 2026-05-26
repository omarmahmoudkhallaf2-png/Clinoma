const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');
let changesMade = 0;

// 1. Add "تحديدات الاطفال" to PEDIATRICS_SLIDES
const newChapter = `  'تحديدات الاطفال': [
    'تحديدات الاطفال/CVS/Complete Transposition of the Great Arteries (TGA).jpeg',
    'تحديدات الاطفال/CVS/Patent Ductus Arteriosus (PDA).jpeg',
    'تحديدات الاطفال/CVS/Pediatric Heart Failure (HF).jpeg',
    'تحديدات الاطفال/CVS/Tetralogy of Fallot (TOF) & Hypercyanotic Spells.jpeg',
    'تحديدات الاطفال/CVS/Ventricular Septal Defect (VSD) - 2.jpeg',
    'تحديدات الاطفال/CVS/Ventricular Septal Defect (VSD) -1.jpeg',
    'تحديدات الاطفال/Endocrinology/CHILDHOOD OBESITY.jpeg',
    'تحديدات الاطفال/Endocrinology/Congenital hypothyrodism.jpeg',
    'تحديدات الاطفال/Endocrinology/DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA).jpeg',
    'تحديدات الاطفال/Endocrinology/Short stature.jpeg',
    'تحديدات الاطفال/Genetics/Down syndrome.jpeg',
    'تحديدات الاطفال/Genetics/Prenatal diagnosis.jpeg',
    'تحديدات الاطفال/Genetics/Turner syndrome.jpeg',
    'تحديدات الاطفال/GIT/Cow milk allergy.jpeg',
    'تحديدات الاطفال/GIT/Pediatrics abdominal pain.jpeg',
    'تحديدات الاطفال/GIT/Vomiting.jpeg',
    'تحديدات الاطفال/Growth & Development/Developmental milestones.jpeg',
    'تحديدات الاطفال/Growth & Development/Growth charts.jpeg',
    'تحديدات الاطفال/Growth & Development/Key development warning signs & Delayed milestone causes.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Aplastic Anemia & BM Failure Syndromes.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Chronic Hemolytic Anemia & Hereditary Spherocytosis.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/G6PD Deficiency & Immune Hemolytic Anemias.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Iron Deficiency Anemia (IDA).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Lymphomas & Solid Tumors.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Pediatric Oncology The Leukemias (ALL & AML).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Platelet Disorders ITP & Thrombocytopenias.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/The Thalassemia Syndromes (Alpha & Beta).jpeg',
    'تحديدات الاطفال/Infection/Infections.jpeg',
    'تحديدات الاطفال/Neurology/Cerebral Palsy (CP).jpeg',
    'تحديدات الاطفال/Neurology/Duchenne muscle dystrophy.jpeg',
    'تحديدات الاطفال/Neurology/The Floppy Infant Syndrome.jpeg',
    'تحديدات الاطفال/Nutrition/advantages of breastfeeding & contraindication.jpeg',
    'تحديدات الاطفال/Nutrition/PEM.jpeg',
    'تحديدات الاطفال/Nutrition/Rickets.jpeg'
  ],
};`;

if (content.includes(`  ]\n};`)) {
    content = content.replace(`  ]\n};`, `  ],\n${newChapter}`);
    changesMade++;
} else if (content.includes(`  ]\n};\n`)) {
    content = content.replace(`  ]\n};\n`, `  ],\n${newChapter}\n`);
    changesMade++;
} else if (content.includes(`    'URINARY TRACT INFECTIONS (UTIs) & RENAL IMAGING PROTOCOL.jpeg'\n  ]\n};`)) {
    content = content.replace(`    'URINARY TRACT INFECTIONS (UTIs) & RENAL IMAGING PROTOCOL.jpeg'\n  ]\n};`, `    'URINARY TRACT INFECTIONS (UTIs) & RENAL IMAGING PROTOCOL.jpeg'\n  ],\n${newChapter}`);
    changesMade++;
}

// 2. Fix the title extraction logic
const targetTitleLogic = `const title = file.replace(/\\.[^/.]+$/, "");`;
const replacementTitleLogic = `const title = (file.split('/').pop() || file).replace(/\\.[^/.]+$/, "");`;

if (content.includes(targetTitleLogic)) {
    content = content.replace(targetTitleLogic, replacementTitleLogic);
    changesMade++;
}

// 3. Highlight the specific chapter in the UI
// In FlashSpace.tsx, look for:
const targetUIRendering = `{chapters.map(chapter => (\n                    <button\n                      key={chapter}\n                      onClick={() => setSelectedChapter(chapter)}\n                      className={\`w-full text-right p-4 rounded-2xl font-black text-sm transition-all flex items-center justify-between group \${`;

const replacementUIRendering = `{chapters.map(chapter => (\n                    <button\n                      key={chapter}\n                      onClick={() => setSelectedChapter(chapter)}\n                      className={\`w-full text-right p-4 rounded-2xl font-black text-sm transition-all flex items-center justify-between group \${\n                        chapter === 'تحديدات الاطفال' ? (\n                          selectedChapter === chapter\n                            ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xl shadow-rose-500/30 ring-2 ring-rose-500/50 scale-[1.02]'\n                            : 'bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 hover:scale-[1.02] border-2 border-rose-200 shadow-md shadow-rose-500/10 hover:shadow-lg animate-pulse'\n                        ) : (\n`;

const targetUIClosing = `                      }\`}\n                    >\n                      <span className="flex-1 truncate">{chapter}</span>\n                      <ChevronRight className={\`w-4 h-4 transition-transform duration-300 \${\n                        selectedChapter === chapter ? 'rotate-90 opacity-100' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'\n                      }\`} />\n                    </button>\n                  ))}`;

const replacementUIClosing = `                      )}\`}\n                    >\n                      <span className="flex-1 truncate">{chapter} {chapter === 'تحديدات الاطفال' && '🔥'}</span>\n                      <ChevronRight className={\`w-4 h-4 transition-transform duration-300 \${\n                        selectedChapter === chapter ? 'rotate-90 opacity-100' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'\n                      }\`} />\n                    </button>\n                  ))}`;

if (content.includes(targetUIRendering)) {
    // We need to replace the old conditional class
    // The old conditional is:
    /*
                        selectedChapter === chapter 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                          : 'hover:bg-slate-50 text-slate-600 hover:text-indigo-600'
    */
    const oldCondition = `selectedChapter === chapter \n                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' \n                          : 'hover:bg-slate-50 text-slate-600 hover:text-indigo-600'`;
    
    if (content.includes(oldCondition)) {
        content = content.replace(targetUIRendering + oldCondition, replacementUIRendering + oldCondition);
        changesMade++;
    }
}

if (content.includes(targetUIClosing)) {
    content = content.replace(targetUIClosing, replacementUIClosing);
    changesMade++;
}


fs.writeFileSync(targetFile, content, 'utf8');
console.log(`Script finished! Changes made: ${changesMade}`);
