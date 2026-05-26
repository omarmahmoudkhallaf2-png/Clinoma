const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

const targetIconLogic = `                    const lwSys = sys.toLowerCase();
                    let SysIcon = Stethoscope;
                    if (lwSys.includes('cardio')) SysIcon = Heart;`;

const replaceIconLogic = `                    const lwSys = sys.toLowerCase();
                    let SysIcon = Stethoscope;
                    if (sys === 'تحديدات الاطفال') SysIcon = Zap;
                    else if (lwSys.includes('cardio')) SysIcon = Heart;`;

if (content.includes(targetIconLogic)) {
    content = content.replace(targetIconLogic, replaceIconLogic);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Icon logic updated successfully!');
} else {
    console.error('Icon logic target not found!');
}
