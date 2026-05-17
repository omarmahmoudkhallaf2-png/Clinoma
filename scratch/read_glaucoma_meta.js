const fs = require('fs');

try {
  const file = 'd:/Med Prep/Glaucoma_export.json';
  const rawData = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`\nFile: ${file}`);
  console.log('Deck Metadata:', JSON.stringify(rawData.deck, null, 2));
  console.log('Actual Card Count in JSON:', rawData.cards ? rawData.cards.length : 0);
} catch (error) {
  console.error('Error reading Glaucoma_export.json:', error.message);
}
