const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/pages/flashcards/FlashSpace.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Add custom image to SYSTEM_BGS for sys === 'تحديدات الاطفال'
const targetSysBgs = `                    const SYSTEM_BGS: Record<string, string> = {
                      'Cardiovascular diseases': '/assets/chapters/cardio_bg_1779636563389.png',`;

const replaceSysBgs = `                    const SYSTEM_BGS: Record<string, string> = {
                      'تحديدات الاطفال': '/assets/chapters/418309698_0f732299-96c6-4f6d-8f13-82ad46c35262.jpg',
                      'Cardiovascular diseases': '/assets/chapters/cardio_bg_1779636563389.png',`;

if (content.includes(targetSysBgs)) {
    content = content.replace(targetSysBgs, replaceSysBgs);
}

// 2. Remove the module card special background, since they don't even see the module card properly
const targetModImage = `{/* Image for Tahdedat Module */}
                      {mod === 'تحديدات الاطفال' && (
                        <div className="absolute inset-0 z-0">
                          <img src="/assets/chapters/418309698_0f732299-96c6-4f6d-8f13-82ad46c35262.jpg" alt={mod} className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:opacity-70 transition-opacity duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                        </div>
                      )}`;
const replaceModImage = ``;

if (content.includes(targetModImage)) {
    content = content.replace(targetModImage, replaceModImage);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixed background image location!');
