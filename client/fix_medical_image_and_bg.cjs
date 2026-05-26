const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Fix medicalImage path
const targetMedicalImage = `medicalImage: \`/assets/TIP-Peditrics/\${chapter}/\${file}\`,`;
const replaceMedicalImage = `medicalImage: file.includes('/') ? \`/assets/TIP-Peditrics/\${file}\` : \`/assets/TIP-Peditrics/\${chapter}/\${file}\`,`;

if (content.includes(targetMedicalImage)) {
    content = content.replace(targetMedicalImage, replaceMedicalImage);
}

// 2. Add background image
const targetBgLogic = `                    const SYSTEM_BGS: Record<string, string> = {`;
const replaceBgLogic = `                    const SYSTEM_BGS: Record<string, string> = {`;

const targetImgSrc = `{SYSTEM_BGS[sys] && (`;
const replaceImgSrc = `{(SYSTEM_BGS[sys] || (sys.startsWith('تحديدات الاطفال') ? '/assets/chapters/418309698_0f732299-96c6-4f6d-8f13-82ad46c35262.jpg' : null)) && (`;

if (content.includes(targetImgSrc)) {
    content = content.replace(targetImgSrc, replaceImgSrc);
}

const targetImgTag = `<img src={SYSTEM_BGS[sys]} alt={sys}`;
const replaceImgTag = `<img src={SYSTEM_BGS[sys] || (sys.startsWith('تحديدات الاطفال') ? '/assets/chapters/418309698_0f732299-96c6-4f6d-8f13-82ad46c35262.jpg' : '')} alt={sys}`;

if (content.includes(targetImgTag)) {
    content = content.replace(targetImgTag, replaceImgTag);
}


fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixes applied successfully!');
