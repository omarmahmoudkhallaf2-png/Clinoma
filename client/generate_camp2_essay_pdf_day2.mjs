import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== PARSE ESSAY TEXT FILE =====
function getEssayQuestions() {
  const filePath = join(__dirname, "..", "نصوص للقراءة", "الورقة الثانية", "المعسكر", "اسئلة المقالي اليوم الثاني المعسكر .txt");
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const items = [];
  let currentChapter = "";
  let currentSection = "";
  let currentCase = "";
  let currentQuestion = null;
  let mode = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Ignore horizontal rules
    if (trimmed === "---") continue;

    // Detect Chapter
    if (trimmed.startsWith("أسئلة شابتر") || trimmed.startsWith("أسئلة family medicine")) {
      if (trimmed.toLowerCase().includes("renal")) {
        currentChapter = "Renal Diseases";
      } else if (trimmed.toLowerCase().includes("neonatology")) {
        currentChapter = "Neonatology";
      } else if (trimmed.toLowerCase().includes("family medicine")) {
        currentChapter = "Family Medicine";
      } else {
        currentChapter = trimmed;
      }
      currentSection = "";
      currentCase = "";
      if (currentQuestion) {
        items.push(currentQuestion);
        currentQuestion = null;
      }
      mode = "chapter";
      continue;
    }

    // Detect Section
    if (trimmed.startsWith("##") || trimmed.startsWith("###")) {
      let secTitle = trimmed.replace(/^#+\s*/, "").trim();
      currentSection = secTitle;
      currentCase = "";
      if (currentQuestion) {
        items.push(currentQuestion);
        currentQuestion = null;
      }
      mode = "section";
      continue;
    }

    // Detect Case scenario
    if (trimmed.startsWith("Case ") || trimmed.startsWith("*Case ") || (trimmed.startsWith("*") && trimmed.includes("Case "))) {
      currentCase = trimmed.replace(/^\*\s*/, "").replace(/\*\s*$/, "").trim();
      mode = "case";
      continue;
    }

    // Detect Question
    const qMatch = trimmed.match(/^\*\*?(Q\d+|Question\s+\d+)[:.]?\s*:?\s*\*\*?\s*(.*)$/i) || 
                   trimmed.match(/^\*\*?(Q\d+|Question\s+\d+)\.\s*(.*)$/i);
    
    if (qMatch && !trimmed.toLowerCase().startsWith("* **answer")) {
      if (currentQuestion) {
        items.push(currentQuestion);
      }
      let qText = qMatch[2].trim();
      if (qText.endsWith("**")) {
        qText = qText.slice(0, -2).trim();
      }
      if (qText.endsWith(".")) {
        qText = qText.slice(0, -1).trim();
      }
      currentQuestion = {
        chapter: currentChapter,
        section: currentSection,
        caseText: currentCase,
        questionNum: qMatch[1].replace(/Question\s+/i, "Q"),
        questionText: qText,
        answerText: ""
      };
      currentCase = "";
      mode = "answer";
      continue;
    }

    // Detect Answer line
    const aMatch = trimmed.match(/^(\*\s+)?\*\*Answer(?:\s+\d+)?:?\*\*?\s*:?\s*(.*)$/i);
    if (aMatch) {
      if (currentQuestion) {
        if (currentQuestion.answerText) {
          currentQuestion.answerText += "\n" + aMatch[2].trim();
        } else {
          currentQuestion.answerText = aMatch[2].trim();
        }
      }
      mode = "answer";
      continue;
    }

    // Read remaining content based on mode
    if (mode === "answer" && currentQuestion) {
      if (currentQuestion.answerText) {
        currentQuestion.answerText += "\n" + trimmed;
      } else {
        currentQuestion.answerText = trimmed;
      }
    } else if (mode === "question" && currentQuestion) {
      if (currentQuestion.questionText) {
        currentQuestion.questionText += "\n" + trimmed;
      } else {
        currentQuestion.questionText = trimmed;
      }
    } else if (mode === "case") {
      if (currentCase) {
        currentCase += "\n" + trimmed;
      } else {
        currentCase = trimmed;
      }
    }
  }

  if (currentQuestion) {
    items.push(currentQuestion);
  }

  // Clean values
  const cleanedItems = [];
  for (let item of items) {
    item.questionText = item.questionText.trim();
    item.answerText = item.answerText.trim();
    item.answerText = item.answerText.replace(/^[\*\-]\r?\n/, "").trim();
    item.questionText = item.questionText.replace(/^[\*\-]\r?\n/, "").trim();
    cleanedItems.push(item);
  }

  return cleanedItems;
}

const ITEMS = getEssayQuestions();

// ===== HTML GENERATOR =====
function buildHTML(withAnswers) {
  // Group items by chapter
  const chaptersMap = {};
  ITEMS.forEach(item => {
    if (!chaptersMap[item.chapter]) {
      chaptersMap[item.chapter] = {};
    }
    if (!chaptersMap[item.chapter][item.section]) {
      chaptersMap[item.chapter][item.section] = [];
    }
    chaptersMap[item.chapter][item.section].push(item);
  });

  const chaptersHTML = Object.entries(chaptersMap).map(([chapterTitle, sections], chIdx) => {
    const sectionsHTML = Object.entries(sections).map(([sectionTitle, sectionItems]) => {
      const itemsHTML = sectionItems.map(item => {
        const caseHTML = item.caseText 
          ? `<div class="case-box">📖 <strong>Case Scenario:</strong><br/>${item.caseText.replace(/\n/g, '<br/>')}</div>` 
          : '';

        const answerHTML = withAnswers 
          ? `
            <div class="answer-box">
              <span class="answer-badge">Model Answer</span>
              <p class="answer-content">${item.answerText.replace(/\n/g, '<br/>')}</p>
            </div>
          ` 
          : `
            <div class="blank-lines">
              ${Array.from({ length: Math.max(3, Math.min(10, Math.ceil(item.answerText.length / 125))) })
                .map(() => '<div class="blank-line"></div>').join('')}
            </div>
          `;

        return `
          <div class="question-container" style="page-break-inside: avoid; break-inside: avoid;">
            <div class="question-header">
              <span class="q-badge">${item.questionNum}</span>
              <span class="q-title">${item.questionText.replace(/\n/g, '<br/>')}</span>
            </div>
            ${caseHTML}
            ${answerHTML}
          </div>
        `;
      }).join('');

      return `
        <div class="section-container" style="page-break-inside: avoid; break-inside: avoid;">
          <div class="section-header">
            <span class="section-title">📂 ${sectionTitle}</span>
          </div>
          ${itemsHTML}
        </div>
      `;
    }).join('');

    return `
      <div class="chapter-container" style="page-break-before: always; break-before: page;">
        <div class="chapter-header">
          <span class="chapter-num">CHAPTER 0${chIdx + 1}</span>
          <h2 class="chapter-title">${chapterTitle}</h2>
        </div>
        ${sectionsHTML}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Camp 2 - Day 2 Essay Booklet</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }

    body {
      font-family: 'Nunito', sans-serif;
      background: #fff;
      color: #1a1a2e;
      font-size: 11pt;
      line-height: 1.5;
    }

    /* ─── HEADER ─────────────────────── */
    .header {
      text-align: center;
      border-bottom: 4px solid #8b5cf6;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    .header-top {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 4px;
    }
    .header-logo {
      font-family: 'Fredoka One', cursive;
      font-size: 26pt;
      color: #8b5cf6;
      letter-spacing: 1px;
    }
    .header-sub {
      font-size: 10.5pt;
      color: #555;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .quiz-title-box {
      background: linear-gradient(135deg, #8b5cf6, #5b21b6);
      color: white;
      border-radius: 14px;
      padding: 12px 24px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .quiz-title-main {
      font-family: 'Fredoka One', cursive;
      font-size: 15pt;
      letter-spacing: 0.5px;
    }
    .quiz-meta {
      text-align: right;
      font-size: 9.5pt;
      font-weight: 800;
      opacity: 0.92;
      line-height: 1.5;
    }

    /* ─── INFO BAR ─────────────────────── */
    .info-bar {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 24px;
    }
    .info-cell {
      border: 2px solid #8b5cf6;
      border-radius: 10px;
      padding: 8px 12px;
      text-align: center;
    }
    .info-label {
      font-size: 8pt;
      font-weight: 900;
      color: #8b5cf6;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-value {
      font-family: 'Fredoka One', cursive;
      font-size: 11pt;
      color: #1a1a2e;
    }

    /* ─── CHAPTER HEADER ────────────────── */
    .chapter-header {
      background: linear-gradient(135deg, #8b5cf6, #5b21b6);
      color: white;
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 24px;
      margin-top: 10px;
      text-align: center;
    }
    .chapter-num {
      font-family: 'Fredoka One', cursive;
      font-size: 12pt;
      color: #f59e0b;
      text-transform: uppercase;
      letter-spacing: 2px;
      display: block;
      margin-bottom: 4px;
    }
    .chapter-title {
      font-family: 'Fredoka One', cursive;
      font-size: 20pt;
      letter-spacing: 0.5px;
    }

    /* ─── SECTION HEADER ─────────────────── */
    .section-header {
      background: #1a1a2e;
      color: white;
      border-radius: 10px;
      padding: 10px 18px;
      margin-bottom: 16px;
      margin-top: 20px;
      display: flex;
      align-items: center;
    }
    .section-title {
      font-family: 'Fredoka One', cursive;
      font-size: 11.5pt;
    }

    /* ─── QUESTION CONTAINER ──────────────── */
    .question-container {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 15px;
      background: #fafafc;
    }
    .question-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
    }
    .q-badge {
      background: #8b5cf6;
      color: white;
      font-family: 'Fredoka One', cursive;
      font-size: 8.5pt;
      padding: 2px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .q-title {
      font-weight: 800;
      font-size: 10.5pt;
      color: #1e1b4b;
      line-height: 1.4;
    }

    .case-box {
      background: #fef08a40;
      border-left: 4px solid #eab308;
      padding: 10px 12px;
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 9.5pt;
      color: #451a03;
      line-height: 1.4;
    }

    /* ─── BLANK LINES (For Student Copy) ─── */
    .blank-lines {
      margin-top: 12px;
      margin-bottom: 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .blank-line {
      border-bottom: 1px dashed #cbd5e1;
      height: 12px;
    }

    /* ─── ANSWER BOX (For Answer Key) ────── */
    .answer-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #22c55e;
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 10px;
      page-break-inside: avoid;
    }
    .answer-badge {
      background: #22c55e;
      color: white;
      font-family: 'Fredoka One', cursive;
      font-size: 7.5pt;
      padding: 1px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 6px;
    }
    .answer-content {
      font-size: 9.5pt;
      font-weight: 700;
      color: #000000;
      line-height: 1.4;
    }

    /* ─── FOOTER ─────────────────────── */
    .footer {
      margin-top: 30px;
      text-align: center;
      border-top: 2px dashed #e2e8f0;
      padding-top: 12px;
    }
    .footer-text {
      font-family: 'Fredoka One', cursive;
      font-size: 11pt;
      color: #94a3b8;
    }
    .footer-brand {
      color: #8b5cf6;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      <span class="header-logo">⚡ Clinoma</span>
    </div>
    <div class="header-sub">معسكر الورقة الثانية للأطفال — الأسئلة المقالية</div>
  </div>

  <!-- QUIZ TITLE BOX -->
  <div class="quiz-title-box">
    <div class="quiz-title-main">✍️ Essay Booklet — Day 2 (مقالي اليوم الثاني)</div>
    <div class="quiz-meta">
      ${withAnswers ? '✅ Answer Key Edition' : '🖊️ Student Copy'}<br/>
      Total Questions: 87 &nbsp;|&nbsp; Second Paper Camp
    </div>
  </div>

  <!-- INFO BAR -->
  <div class="info-bar">
    <div class="info-cell">
      <div class="info-label">Booklet Type</div>
      <div class="info-value">Essay Questions (مقالي)</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Total Questions</div>
      <div class="info-value">87 Questions</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Active Camp</div>
      <div class="info-value">Second Paper (الورقة الثانية)</div>
    </div>
  </div>

  <!-- CHAPTERS AND QUESTIONS -->
  ${chaptersHTML}

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-text">
      Prepared exclusively for <span class="footer-brand">Clinoma — معسكر الورقة الثانية</span> ⚡
    </div>
  </div>

</body>
</html>`;
}

// ===== GENERATE PDFs =====
async function generatePDFs() {
  console.log('🚀 Launching browser for Day 2 Essay PDFs...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const files = [
    { name: 'معسكر_الورقة_الثانية_اليوم_الثاني_مقالي.pdf',          withAnswers: false },
    { name: 'معسكر_الورقة_الثانية_اليوم_الثاني_مقالي_إجابات.pdf',   withAnswers: true  },
  ];

  for (const file of files) {
    console.log(`📄 Generating: ${file.name}`);
    const page = await context.newPage();
    await page.setContent(buildHTML(file.withAnswers), { waitUntil: 'networkidle' });
    const pdfPath = join(__dirname, 'public', file.name);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    await page.close();
    console.log(`✅ Saved: ${pdfPath}`);
  }

  await browser.close();
  console.log('🎉 All Day 2 Essay PDFs generated successfully!');
}

generatePDFs().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
