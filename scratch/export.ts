import * as fs from 'fs';
import * as path from 'path';

// Import raw data from the user's files
import { ophthalmologyData } from '../رمد نظري/src/data/flashcards';
import { alternativeExplanations } from '../رمد نظري/src/data/alternative_explanations';

interface AnswerContent {
  text: string;
  type: 'main' | 'sub' | 'example' | 'note';
}

// Simple Markdown to HTML parser
function mdToHtml(text: string): string {
  if (!text) return "";
  let html = text;
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Blockquotes (RTL oriented with border-right)
  html = html.replace(/^>\s*(.*)$/gm, '<div class="border-r-4 border-amber-500 bg-amber-500/5 p-3 rounded-lg my-2 text-sm italic">$1</div>');
  // Newlines to br
  html = html.replace(/\n/g, '<br />');
  return html;
}

// Formatter for front side (Question)
function formatFront(question: string): string {
  return `
<div class="space-y-4">
  <p class="text-xl md:text-2xl font-black leading-relaxed text-slate-800">${question}</p>
</div>
  `;
}

// Formatter for structured answers
function formatAnswer(title: string, content: AnswerContent[]): string {
  let listItems = "";
  content.forEach(item => {
    if (item.type === 'main') {
      listItems += `<li class="font-bold text-slate-800">• ${item.text}</li>`;
    } else if (item.type === 'sub') {
      listItems += `<li class="pl-4 text-sm text-slate-600 font-semibold">• ${item.text}</li>`;
    } else if (item.type === 'example') {
      listItems += `<li class="pl-4 text-xs italic text-slate-500 font-semibold">• ${item.text}</li>`;
    } else if (item.type === 'note') {
      listItems += `<li class="bg-amber-100/30 p-2.5 rounded-xl text-xs text-amber-800 border border-amber-200/30 mt-1 font-semibold">${item.text}</li>`;
    }
  });

  return `
<div class="w-full text-left space-y-4 mb-4" style="direction: ltr; text-align: left;">
  <div class="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
    <h4 class="text-xs font-black uppercase tracking-widest text-primary mb-1">${title}</h4>
    <ul class="space-y-2 text-sm md:text-base list-none pl-0">
      ${listItems}
    </ul>
  </div>
</div>
  `;
}

// Formatter for the back side combining answer and explanations
function formatBack(answerHtml: string, explanation: any, alternative: string | null): string {
  let primaryText = "";
  let alternativeText = "";

  if (typeof explanation === 'string') {
    primaryText = explanation;
  } else if (explanation && typeof explanation === 'object') {
    primaryText = explanation.primary || "";
    alternativeText = explanation.alternative || "";
  }

  // Overlay alternative mnemonic if present in record
  if (alternative) {
    alternativeText = alternative;
  }

  const primaryHtml = mdToHtml(primaryText);
  const alternativeHtml = mdToHtml(alternativeText);

  let explanationSection = "";
  if (primaryHtml) {
    explanationSection = `
    <!-- Explanation Divider -->
    <div class="relative flex py-2 items-center">
      <div class="flex-grow border-t border-dashed border-border/80"></div>
      <span class="flex-shrink mx-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-background px-2">الشرح والتوضيح</span>
      <div class="flex-grow border-t border-dashed border-border/80"></div>
    </div>

    <!-- Explanation Box -->
    <div class="bg-amber-50/40 border border-amber-200/40 rounded-2xl p-5 text-right space-y-3 font-semibold text-slate-700 leading-relaxed" style="direction: rtl; text-align: right;">
      ${primaryHtml}
    </div>
    `;
  }

  let alternativeSection = "";
  if (alternativeHtml) {
    alternativeSection = `
    <!-- Mnemonic Box -->
    <div class="bg-blue-50/40 border border-blue-200/40 rounded-2xl p-5 text-right space-y-2 font-semibold text-slate-700 leading-relaxed mt-4" style="direction: rtl; text-align: right;">
      <h5 class="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">💡 طريقة للحفظ (Mnemonic)</h5>
      ${alternativeHtml}
    </div>
    `;
  }

  return `
<div class="w-full space-y-4">
  ${answerHtml}
  ${explanationSection}
  ${alternativeSection}
</div>
  `;
}

// Categories mapping to files
const filesMap: Record<string, string> = {
  eyelid_lacrimal: 'ophthalmology_written_eyelid.json',
  cornea_sclera: 'ophthalmology_written_cornea.json',
  lens: 'ophthalmology_written_lens.json',
  glaucoma: 'ophthalmology_written_glaucoma.json',
  retina: 'ophthalmology_written_retina.json'
};

const categoryCounts: Record<string, number> = {
  eyelid_lacrimal: 0,
  cornea_sclera: 0,
  lens: 0,
  glaucoma: 0,
  retina: 0
};

// Organize cards by category
const organizedCards: Record<string, any[]> = {
  eyelid_lacrimal: [],
  cornea_sclera: [],
  lens: [],
  glaucoma: [],
  retina: []
};

// Process each card
ophthalmologyData.forEach((card: any) => {
  const category = card.category;
  if (!organizedCards[category]) return;

  const altMnemonic = alternativeExplanations[card.id] || null;
  const answerHtml = formatAnswer(card.answer.title, card.answer.content);
  const frontHtml = formatFront(card.question);
  const backHtml = formatBack(answerHtml, card.explanation, altMnemonic);

  // Formatted flashcard for Clinoma site
  const ClinomaCard = {
    id: `official_written_${category}_${card.id}`,
    front: frontHtml.trim(),
    back: backHtml.trim(),
    tags: [category, 'Written', 'Theory'],
    subject: 'Ophthalmology',
    createdAt: Date.now(),
    nextReview: Date.now(),
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    status: 'new'
  };

  organizedCards[category].push(ClinomaCard);
  categoryCounts[category]++;
});

// Output formatted JSON files
const outputDir = path.join(__dirname, '../client/public/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

Object.entries(organizedCards).forEach(([cat, cards]) => {
  const filename = filesMap[cat];
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(cards, null, 2), 'utf-8');
  console.log(`Successfully exported ${cards.length} cards to ${filename}`);
});

console.log('Category Counts:', categoryCounts);
