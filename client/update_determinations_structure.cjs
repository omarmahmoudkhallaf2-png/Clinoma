const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Replace 'تحديدات الاطفال': [...] with the divided versions
const targetSlides = `  'تحديدات الاطفال': [
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
  ],`;

const replaceSlides = `  'تحديدات الاطفال - CVS': [
    'تحديدات الاطفال/CVS/Complete Transposition of the Great Arteries (TGA).jpeg',
    'تحديدات الاطفال/CVS/Patent Ductus Arteriosus (PDA).jpeg',
    'تحديدات الاطفال/CVS/Pediatric Heart Failure (HF).jpeg',
    'تحديدات الاطفال/CVS/Tetralogy of Fallot (TOF) & Hypercyanotic Spells.jpeg',
    'تحديدات الاطفال/CVS/Ventricular Septal Defect (VSD) - 2.jpeg',
    'تحديدات الاطفال/CVS/Ventricular Septal Defect (VSD) -1.jpeg',
  ],
  'تحديدات الاطفال - Endocrinology': [
    'تحديدات الاطفال/Endocrinology/CHILDHOOD OBESITY.jpeg',
    'تحديدات الاطفال/Endocrinology/Congenital hypothyrodism.jpeg',
    'تحديدات الاطفال/Endocrinology/DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA).jpeg',
    'تحديدات الاطفال/Endocrinology/Short stature.jpeg',
  ],
  'تحديدات الاطفال - Genetics': [
    'تحديدات الاطفال/Genetics/Down syndrome.jpeg',
    'تحديدات الاطفال/Genetics/Prenatal diagnosis.jpeg',
    'تحديدات الاطفال/Genetics/Turner syndrome.jpeg',
  ],
  'تحديدات الاطفال - GIT': [
    'تحديدات الاطفال/GIT/Cow milk allergy.jpeg',
    'تحديدات الاطفال/GIT/Pediatrics abdominal pain.jpeg',
    'تحديدات الاطفال/GIT/Vomiting.jpeg',
  ],
  'تحديدات الاطفال - Growth & Development': [
    'تحديدات الاطفال/Growth & Development/Developmental milestones.jpeg',
    'تحديدات الاطفال/Growth & Development/Growth charts.jpeg',
    'تحديدات الاطفال/Growth & Development/Key development warning signs & Delayed milestone causes.jpeg',
  ],
  'تحديدات الاطفال - Hematology & Oncology': [
    'تحديدات الاطفال/Hematology & Oncology/Aplastic Anemia & BM Failure Syndromes.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Chronic Hemolytic Anemia & Hereditary Spherocytosis.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/G6PD Deficiency & Immune Hemolytic Anemias.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Iron Deficiency Anemia (IDA).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Lymphomas & Solid Tumors.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Pediatric Oncology The Leukemias (ALL & AML).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Platelet Disorders ITP & Thrombocytopenias.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/The Thalassemia Syndromes (Alpha & Beta).jpeg',
  ],
  'تحديدات الاطفال - Infection': [
    'تحديدات الاطفال/Infection/Infections.jpeg',
  ],
  'تحديدات الاطفال - Neurology': [
    'تحديدات الاطفال/Neurology/Cerebral Palsy (CP).jpeg',
    'تحديدات الاطفال/Neurology/Duchenne muscle dystrophy.jpeg',
    'تحديدات الاطفال/Neurology/The Floppy Infant Syndrome.jpeg',
  ],
  'تحديدات الاطفال - Nutrition': [
    'تحديدات الاطفال/Nutrition/advantages of breastfeeding & contraindication.jpeg',
    'تحديدات الاطفال/Nutrition/PEM.jpeg',
    'تحديدات الاطفال/Nutrition/Rickets.jpeg'
  ],`;

if (content.includes(targetSlides)) {
    content = content.replace(targetSlides, replaceSlides);
}

// 2. Update the sort logic
const targetSort = `                  {[...(systems[selectedModule] || [])].sort((a, b) => {
                    if (a === 'Growth & development') return -1;
                    if (b === 'Growth & development') return 1;
                    return a.localeCompare(b);
                  }).map(sys => {`;

const replaceSort = `                  {[...(systems[selectedModule] || [])].sort((a, b) => {
                    const aIsTahdedat = a.startsWith('تحديدات الاطفال');
                    const bIsTahdedat = b.startsWith('تحديدات الاطفال');
                    if (aIsTahdedat && !bIsTahdedat) return -1;
                    if (!aIsTahdedat && bIsTahdedat) return 1;
                    if (a === 'Growth & development') return -1;
                    if (b === 'Growth & development') return 1;
                    return a.localeCompare(b);
                  }).map(sys => {`;

if (content.includes(targetSort)) {
    content = content.replace(targetSort, replaceSort);
}

// 3. Update the UI highlighting to check startsWith
const targetSysBtnUI = `                      className={\`group relative bg-slate-900 border \${
                        sys === 'تحديدات الاطفال'
                          ? 'border-orange-500/50 hover:border-orange-500 shadow-xl shadow-orange-500/20 bg-gradient-to-br from-slate-900/80 to-orange-950/30 ring-1 ring-orange-500/30'
                          : 'border-white/10 active:border-indigo-500/50 hover:border-indigo-500/50'`;

const replaceSysBtnUI = `                      className={\`group relative bg-slate-900 border \${
                        sys.startsWith('تحديدات الاطفال')
                          ? 'border-orange-500/50 hover:border-orange-500 shadow-xl shadow-orange-500/20 bg-gradient-to-br from-slate-900/80 to-orange-950/30 ring-1 ring-orange-500/30'
                          : 'border-white/10 active:border-indigo-500/50 hover:border-indigo-500/50'`;

if (content.includes(targetSysBtnUI)) {
    content = content.replace(targetSysBtnUI, replaceSysBtnUI);
}

const targetSysIconUI = `                    if (sys === 'تحديدات الاطفال') SysIcon = Zap;`;
const replaceSysIconUI = `                    if (sys.startsWith('تحديدات الاطفال')) SysIcon = Zap;`;

if (content.includes(targetSysIconUI)) {
    content = content.replace(targetSysIconUI, replaceSysIconUI);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Update completed successfully!');
