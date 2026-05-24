const fs = require('fs');
let code = fs.readFileSync('client/src/pages/flashcards/FlashSpace.tsx', 'utf8');

const ids = [
  'tgd8', 'tgd9', 'tgd10', 'tgd11', 'tgd12', 'tgd13', 'tgd14', 'tgd15',
  'ssts3', 'ssts4', 'ssts5', 'ssts6', 'ssts7', 'ssts8', 'ssts9',
  'puberty1', 'puberty2', 'puberty3', 'puberty4', 'puberty5', 'puberty6', 'puberty7', 'puberty8',
  'para1', 'para2', 'para3', 'para4', 'para5', 'para6', 'para7',
  'ies2', 'ies3', 'ies4', 'ies5', 'ies6', 'ies7',
  'dm7', 'dm8', 'dm9', 'dm10', 'dm11', 'dm12', 'dm13', 'dm14',
  'co2', 'co3', 'co4', 'co5', 'co6', 'co7',
  'cushing1', 'cushing2', 'cushing3', 'cushing4', 'cushing5', 'cushing6', 'cushing7',
  'arf3', 'arf4', 'arf5', 'arf6', 'arf7', 'arf8',
  'as2', 'as3', 'as4', 'as5', 'as6', 'as7', 'as8',
  'ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'ps6'
];

ids.forEach(id => {
  // Pattern 1: preceded by comma (not the first item)
  let regex = new RegExp(`\\s*,\\s*\\{\\s*"id":\\s*"${id}"[\\s\\S]*?\\}(?=\\s*(,|]))`, 'g');
  let before = code.length;
  code = code.replace(regex, '');
  if (code.length === before) {
    // Pattern 2: first item, may or may not be followed by comma
    regex = new RegExp(`\\s*\\{\\s*"id":\\s*"${id}"[\\s\\S]*?\\}\\s*,?`, 'g');
    code = code.replace(regex, '');
  }
});

fs.writeFileSync('client/src/pages/flashcards/FlashSpace.tsx', code, 'utf8');
console.log('Done cleaning up flashcards.');
