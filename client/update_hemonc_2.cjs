const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Find all lines containing "تحديدات الاطفال/Hematology & Oncology/"
const lines = content.split('\n');
const newLines = lines.filter(line => !line.includes('تحديدات الاطفال/Hematology & Oncology/'));

const insertIndex = newLines.findIndex(line => line.includes('تحديدات الاطفال/Growth & Development/Key development warning signs & Delayed milestone causes.jpeg'));

if (insertIndex !== -1) {
    const replacement = [
        "    'تحديدات الاطفال/Hematology & Oncology/Acute lymphoplastic leukemia.jpeg',",
        "    'تحديدات الاطفال/Hematology & Oncology/Aplastic anemia.jpeg',",
        "    'تحديدات الاطفال/Hematology & Oncology/GP6D.jpeg',",
        "    'تحديدات الاطفال/Hematology & Oncology/HODGKIN lymphoma.jpeg',",
        "    'تحديدات الاطفال/Hematology & Oncology/Hemophilia.jpeg',",
        "    'تحديدات الاطفال/Hematology & Oncology/Hereditary spherocytosis.jpeg',",
        "    'تحديدات الاطفال/Hematology & Oncology/Immune thrombocytopenia (ITP).jpeg',",
        "    'تحديدات الاطفال/Hematology & Oncology/Iron defeciency anemia.jpeg',",
        "    'تحديدات الاطفال/Hematology & Oncology/Thalassemia.jpeg',"
    ];
    newLines.splice(insertIndex + 1, 0, ...replacement);
    fs.writeFileSync(targetFile, newLines.join('\n'), 'utf8');
    console.log("Replaced HemOnc successfully!");
} else {
    console.error("Could not find insert index for HemOnc!");
}
