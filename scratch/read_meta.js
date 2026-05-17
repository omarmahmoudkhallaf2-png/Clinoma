const fs = require('fs');

const files = [
  'd:/Med Prep/Uvea_&_Lens_export.json',
  'd:/Med Prep/cornea_export (1).json'
];

files.forEach(file => {
  try {
    const rawData = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`\nFile: ${file}`);
    console.log('Deck Metadata:', JSON.stringify(rawData.deck, null, 2));
    console.log('Actual Card Count in JSON:', rawData.cards ? rawData.cards.length : 0);
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
  }
});
