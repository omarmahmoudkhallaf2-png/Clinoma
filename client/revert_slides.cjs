const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Revert PEDIATRICS_SLIDES
const targetSlidesStart = `'تحديدات الاطفال - CVS': [`;
const targetSlidesEnd = `    'تحديدات الاطفال/Nutrition/PEM.jpeg',
    'تحديدات الاطفال/Nutrition/Rickets.jpeg'
  ],`;

const regex = new RegExp(`'تحديدات الاطفال - CVS': \\[([\\s\\S]*?)'تحديدات الاطفال/Nutrition/Rickets\\.jpeg'\\n  \\],`);

const replaceSlides = `'تحديدات الاطفال': [
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

if (content.match(regex)) {
    content = content.replace(regex, replaceSlides);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('PEDIATRICS_SLIDES reverted successfully!');
