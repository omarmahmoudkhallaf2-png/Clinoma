const fs = require('fs');
const content = fs.readFileSync('flashcards/src/data.ts', 'utf8');

const cardBlocks = content.split('  {').slice(1);
const cards = cardBlocks.map(block => {
  const qMatch = block.match(/question:\s*"(.*?)"/);
  const aMatch = block.match(/answer:\s*`(.*?)`/s);
  
  if (qMatch && aMatch) {
    return {
      front: qMatch[1],
      back: aMatch[1],
      tags: ['AI-Studio', 'Cardiology']
    };
  }
  return null;
}).filter(Boolean);

const output = {
  deck: {
    title: 'Cardiology - AI Studio Export',
    subject: 'Cardiology'
  },
  cards: cards
};

fs.writeFileSync('client/public/ai_flashcards_export.json', JSON.stringify(output, null, 2));
console.log('Exported ' + cards.length + ' cards to client/public/ai_flashcards_export.json');
