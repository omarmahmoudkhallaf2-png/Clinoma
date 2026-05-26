const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetHem = `'تحديدات الاطفال/Hematology & Oncology/Aplastic Anemia & BM Failure Syndromes.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Chronic Hemolytic Anemia & Hereditary Spherocytosis.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/G6PD Deficiency & Immune Hemolytic Anemias.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Iron Deficiency Anemia (IDA).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Lymphomas & Solid Tumors.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Pediatric Oncology The Leukemias (ALL & AML).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Platelet Disorders ITP & Thrombocytopenias.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/The Thalassemia Syndromes (Alpha & Beta).jpeg',`;

const replaceHem = `'تحديدات الاطفال/Hematology & Oncology/Acute lymphoplastic leukemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Aplastic anemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/GP6D.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/HODGKIN lymphoma.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Hemophilia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Hereditary spherocytosis.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Immune thrombocytopenia (ITP).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Iron defeciency anemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Thalassemia.jpeg',`;

if (content.includes(targetHem)) {
    content = content.replace(targetHem, replaceHem);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log("Replaced HemOnc successfully!");
} else {
    console.error("Target HemOnc not found!");
}
