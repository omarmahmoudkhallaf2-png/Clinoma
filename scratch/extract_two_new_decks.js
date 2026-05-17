const fs = require('fs');
const path = require('path');

const outputDir = 'd:/Med Prep/client/public/data';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Process Uvea & Lens
try {
  const uveaPath = 'd:/Med Prep/Uvea_&_Lens_export.json';
  const rawData = JSON.parse(fs.readFileSync(uveaPath, 'utf8'));
  const formattedCards = rawData.cards.map((card, idx) => {
    return {
      id: `official_uvea_lens_${idx}`,
      deckId: 'official_uvea_lens_003',
      userId: 'PUBLIC',
      front: card.front || '',
      back: card.back || '',
      frontImage: card.frontImage || null,
      backImage: card.backImage || null,
      tags: card.tags && card.tags.length > 0 ? card.tags : ['uvea', 'lens', 'practical'],
      subject: 'Ophthalmology',
      createdAt: Date.now(),
      nextReview: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      status: 'new'
    };
  });
  const outputPath = path.join(outputDir, 'uvea_lens.json');
  fs.writeFileSync(outputPath, JSON.stringify(formattedCards, null, 2), 'utf8');
  console.log(`Successfully extracted and formatted ${formattedCards.length} cards to ${outputPath}`);
} catch (error) {
  console.error('Error processing Uvea & Lens:', error.message);
}

// 2. Process Cornea Practical
try {
  const corneaPath = 'd:/Med Prep/cornea_export (1).json';
  const rawData = JSON.parse(fs.readFileSync(corneaPath, 'utf8'));
  const formattedCards = rawData.cards.map((card, idx) => {
    return {
      id: `official_cornea_practical_${idx}`,
      deckId: 'official_cornea_practical_004',
      userId: 'PUBLIC',
      front: card.front || '',
      back: card.back || '',
      frontImage: card.frontImage || null,
      backImage: card.backImage || null,
      tags: card.tags && card.tags.length > 0 ? card.tags : ['cornea', 'practical'],
      subject: 'Ophthalmology',
      createdAt: Date.now(),
      nextReview: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      status: 'new'
    };
  });
  const outputPath = path.join(outputDir, 'cornea_practical.json');
  fs.writeFileSync(outputPath, JSON.stringify(formattedCards, null, 2), 'utf8');
  console.log(`Successfully extracted and formatted ${formattedCards.length} cards to ${outputPath}`);
} catch (error) {
  console.error('Error processing Cornea Practical:', error.message);
}
