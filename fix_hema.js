const fs = require('fs');
let code = fs.readFileSync('client/src/pages/flashcards/FlashSpace.tsx', 'utf8');

const replacements = {
  'HEMOSTASIS & BLEEDING DISORDERS': 'Hemostasis & Bleeding Disorders',
  'IRON DEFICIENCY ANEMIA (IDA)': 'Iron Deficiency Anemia (IDA)',
  'INHERITED COAGULATION: HEMOPHILIA & VWD': 'Inherited Coagulation Hemophilia & VWD',
  'LYMPHOMAS & SOLID TUMORS': 'Lymphomas & Solid Tumors',
  'MEGALOBLASTIC ANEMIAS (B12 & FOLATE DEFICIENCY)': 'Megaloblastic Anemias (B12 & Folate Deficiency)',
  'NON-THROMBOCYTOPENIC PURPURA (VASCULAR & HSP)': 'Non-Thrombocytopenic Purpura (Vascular & HSP)',
  'PEDIATRICS ONCOLOGY: THE LEUKEMIAS (ALL & AML)': 'Pediatric Oncology The Leukemias (ALL & AML)',
  'PEDIATRIC ONCOLOGY: THE LEUKEMIAS (ALL & AML)': 'Pediatric Oncology The Leukemias (ALL & AML)',
  'PLATELET DISORDERS: ITP & THROMBOCYTOPENIAS': 'Platelet Disorders ITP & Thrombocytopenias',
  'RBC PHYSIOLOGY, INDICES & MORPHOLOGY': 'RBC Physiology, Indices & Morphology',
  'SAFE BLOOD TRANSFUSION & COMPLICATIONS': 'Safe Blood Transfusion & Complications',
  'SICKLE CELL DISEASE (SCD)': 'Sickle Cell Disease (SCD)',
  'THE THALASSEMIA SYNDROMES (ALPHA & BETA)': 'The Thalassemia Syndromes (Alpha & Beta)'
};

for (const [oldKey, newKey] of Object.entries(replacements)) {
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  const regex = new RegExp("'" + escapeRegExp(oldKey) + "'\\s*:", 'g');
  code = code.replace(regex, "'" + newKey + "':");
}

fs.writeFileSync('client/src/pages/flashcards/FlashSpace.tsx', code);
console.log('Done');
