const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

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
    'تحديدات الاطفال/Hematology & Oncology/Acute lymphoplastic leukemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Aplastic anemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/GP6D.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/HODGKIN lymphoma.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Hemophilia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Hereditary spherocytosis.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Immune thrombocytopenia (ITP).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Iron defeciency anemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Thalassemia.jpeg',
    'تحديدات الاطفال/Infection/Infections.jpeg',
    'تحديدات الاطفال/Neurology/Cerebral Palsy (CP).jpeg',
    'تحديدات الاطفال/Neurology/Duchenne muscle dystrophy.jpeg',
    'تحديدات الاطفال/Neurology/The Floppy Infant Syndrome.jpeg',
    'تحديدات الاطفال/Nutrition/advantages of breastfeeding & contraindication.jpeg',
    'تحديدات الاطفال/Nutrition/PEM.jpeg',
    'تحديدات الاطفال/Nutrition/Rickets.jpeg'
  ]`;

if (!content.includes("'تحديدات الاطفال': [")) {
    const hook = `    'URINARY TRACT INFECTIONS (UTIs) & RENAL IMAGING PROTOCOL.jpeg'\n  ]`;
    if (content.includes(hook)) {
        content = content.replace(hook, `${hook},\n${newChapter}`);
        fs.writeFileSync(targetFile, content, 'utf8');
        console.log("Tahdedat restored!");
    } else {
        console.error("Hook not found for Tahdedat!");
    }
} else {
    console.log("Tahdedat already exists!");
}
