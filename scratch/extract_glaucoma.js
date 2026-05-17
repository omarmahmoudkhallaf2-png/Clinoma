const fs = require('fs');
const path = require('path');

try {
  const filePath = 'd:/Med Prep/Glaucoma_export.json';
  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!rawData.cards || !Array.isArray(rawData.cards)) {
    throw new Error('No cards array found in the exported file.');
  }

  // Format cards to match the standard schema
  const formattedCards = rawData.cards.map((card, idx) => {
    return {
      id: `official_glaucoma_practical_${idx}`,
      deckId: 'official_glaucoma_practical_005',
      userId: 'PUBLIC',
      front: card.front || '',
      back: card.back || '',
      frontImage: card.frontImage || null,
      backImage: card.backImage || null,
      tags: card.tags && card.tags.length > 0 ? card.tags : ['glaucoma', 'practical'],
      subject: 'Ophthalmology',
      createdAt: Date.now(),
      nextReview: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      status: 'new'
    };
  });

  const outputDir = 'd:/Med Prep/client/public/data';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'glaucoma_practical.json');
  fs.writeFileSync(outputPath, JSON.stringify(formattedCards, null, 2), 'utf8');
  console.log(`Successfully extracted and formatted ${formattedCards.length} cards to ${outputPath}`);
} catch (error) {
  console.error('Error during extraction:', error.message);
  process.exit(1);
}
