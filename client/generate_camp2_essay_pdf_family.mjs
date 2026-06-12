import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== 1. PARSE ESSAY TEXT FILE =====
function getEssayQuestions() {
  const filePath = join(__dirname, "..", "نصوص للقراءة", "الورقة الثانية", "المعسكر", "مقالي السنين الاسرة.txt");
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).map(l => l.trim());

  const chapters = [];
  let currentChapter = { title: "📂 الأسئلة المقالية لسنوات سابقة (Past Years Essay Cases)", items: [] };
  chapters.push(currentChapter);

  let currentCase = null;
  let currentQuestion = null;
  let mode = ""; // "case", "question", "answer"

  function isBulletPlaceholder(line) {
    const trimmed = line.trim();
    return trimmed === "*" || trimmed === "-" || trimmed === "•";
  }

  const answerRegex = /^[\*\-\s\•]*(?:\*\*?)?Answer(?:\s+\d+)?(?:\*\*?|:|\s)*\s*(.*)$/i;

  function isAnswerLine(line) {
    return answerRegex.test(line);
  }

  function getAnswerHeaderAndText(line) {
    const match = line.match(answerRegex);
    if (match) {
      const matchedLength = line.length - match[1].length;
      const header = line.substring(0, matchedLength).trim();
      return {
        header: header || "Answer:",
        text: match[1].trim()
      };
    }
    return { header: "Answer:", text: "" };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (isBulletPlaceholder(line)) {
      continue;
    }

    if (line === "---") {
      currentQuestion = null;
      currentCase = null;
      mode = "";
      continue;
    }

    // Detect Chapter / Title
    if (line.startsWith("Title ") || line.startsWith("### Title") || line.startsWith("#### Topic")) {
      const titleText = line.replace(/^(###|####|#)\s*/, "").trim();
      currentChapter = { title: titleText, items: [] };
      chapters.push(currentChapter);
      currentCase = null;
      currentQuestion = null;
      mode = "";
      continue;
    }

    // Detect Case
    const caseRegex = /^(?:\*\*|\*|)?Case\s+(\d+)\s*(?:\:|\*\*|\*)*\s*(.*)$/i;
    const caseMatch = line.match(caseRegex);
    if (caseMatch) {
      const caseNum = caseMatch[1];
      const rest = caseMatch[2].replace(/[\*\s\:]+$/, "").trim();
      currentCase = {
        type: "case",
        title: `Case ${caseNum}`,
        text: rest,
        questions: []
      };
      currentChapter.items.push(currentCase);
      currentQuestion = null;
      mode = "case";
      continue;
    }

    // Detect Answer
    if (isAnswerLine(line)) {
      const { header, text } = getAnswerHeaderAndText(line);
      if (currentQuestion) {
        currentQuestion.answerHeader = header;
        currentQuestion.answerText = text;
      }
      mode = "answer";
      continue;
    }

    // Detect Question (using Look-ahead)
    let isQuestion = false;
    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j].trim();
      if (nextLine) {
        if (isBulletPlaceholder(nextLine)) {
          continue;
        }
        if (isAnswerLine(nextLine)) {
          isQuestion = true;
        }
        break;
      }
    }

    if (isQuestion) {
      let qText = line;
      let qNum = "Q";
      
      // Extract question number if present
      const qNumMatch = qText.match(/^([a-zA-Z]\)|\d+[\.\-]\s+|\*\*Question\s+\d+\*\*:\s*|\*\*Question\s+\d+:\*\*|Question\s+\d+:|Q\d+:)\s*(.*)$/is);
      if (qNumMatch) {
        qNum = qNumMatch[1].replace(/[\*\:]/g, "").trim();
        qText = qNumMatch[2].trim();
      }

      currentQuestion = {
        type: "question",
        questionNum: qNum,
        questionText: qText,
        answerText: ""
      };

      if (currentCase) {
        currentCase.questions.push(currentQuestion);
      } else {
        currentChapter.items.push(currentQuestion);
      }
      mode = "question";
      continue;
    }

    // Append remaining text based on mode
    if (mode === "case" && currentCase) {
      if (currentCase.text) {
        currentCase.text += "\n" + line;
      } else {
        currentCase.text = line;
      }
    } else if (mode === "question" && currentQuestion) {
      if (currentQuestion.questionText) {
        currentQuestion.questionText += "\n" + line;
      } else {
        currentQuestion.questionText = line;
      }
    } else if (mode === "answer" && currentQuestion) {
      if (currentQuestion.answerText) {
        currentQuestion.answerText += "\n" + line;
      } else {
        currentQuestion.answerText = line;
      }
    } else {
      if (currentCase) {
        if (currentCase.text) {
          currentCase.text += "\n" + line;
        } else {
          currentCase.text = line;
        }
      } else {
        currentQuestion = {
          type: "question",
          questionNum: "Q",
          questionText: line,
          answerText: ""
        };
        currentChapter.items.push(currentQuestion);
        mode = "question";
      }
    }
  }

  const finalChapters = chapters.filter(ch => ch.items.length > 0);

  // Clean strings
  for (let ch of finalChapters) {
    for (let item of ch.items) {
      if (item.type === "case") {
        item.text = item.text.trim();
        for (let q of item.questions) {
          q.questionText = q.questionText.trim();
          q.answerText = q.answerText.trim();
        }
      } else if (item.type === "question") {
        item.questionText = item.questionText.trim();
        item.answerText = item.answerText.trim();
      }
    }
  }

  return finalChapters;
}

const CHAPTERS = getEssayQuestions();

// Count total questions for header meta
let totalQuestionsCount = 0;
CHAPTERS.forEach(ch => {
  ch.items.forEach(item => {
    if (item.type === "case") {
      totalQuestionsCount += item.questions.length;
    } else if (item.type === "question") {
      totalQuestionsCount += 1;
    }
  });
});

// ===== 2. FORMAT TEXT HELPER =====
function formatAnswerHTML(rawText) {
  if (!rawText) return "";
  return rawText.split('\n').map(line => {
    let trimmed = line.trim();
    if (!trimmed) return '';
    // Check if line starts with a list bullet/number (e.g. 1. 1/ a. a) - etc)
    const listMatch = trimmed.match(/^([a-zA-Z\d]+[\.\/\)\-]\s*)(.*)$/);
    if (listMatch) {
      return `<div class="answer-list-item"><span class="list-num">${listMatch[1]}</span><span class="list-text">${listMatch[2]}</span></div>`;
    }
    return `<div class="answer-para">${trimmed}</div>`;
  }).join('');
}

// ===== 3. HTML GENERATOR =====
function buildHTML() {
  const chaptersHTML = CHAPTERS.map((ch, chIdx) => {
    const itemsHTML = ch.items.map(item => {
      if (item.type === "case") {
        const caseTextHTML = item.text 
          ? `<div class="case-box">📖 <strong>Case Scenario:</strong><br/>${item.text.replace(/\n/g, '<br/>')}</div>` 
          : '';

        const questionsHTML = item.questions.map(q => {
          return `
            <div class="question-block">
              <div class="question-header">
                <span class="q-badge">${q.questionNum}</span>
                <span class="q-title">${q.questionText.replace(/\n/g, '<br/>')}</span>
              </div>
              <div class="answer-box">
                <span class="answer-badge">Model Answer</span>
                <div class="answer-content">${formatAnswerHTML(q.answerText)}</div>
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="case-container" style="page-break-inside: avoid; break-inside: avoid;">
            <div class="case-header-title">📂 ${item.title}</div>
            ${caseTextHTML}
            ${questionsHTML}
          </div>
        `;
      } else {
        // Standalone question
        return `
          <div class="question-container" style="page-break-inside: avoid; break-inside: avoid;">
            <div class="question-header">
              <span class="q-badge">${item.questionNum}</span>
              <span class="q-title">${item.questionText.replace(/\n/g, '<br/>')}</span>
            </div>
            <div class="answer-box">
              <span class="answer-badge">Model Answer</span>
              <div class="answer-content">${formatAnswerHTML(item.answerText)}</div>
            </div>
          </div>
        `;
      }
    }).join('');

    const displayTitle = ch.title.replace(/^📂\s*/, "");

    return `
      <div class="chapter-container" style="page-break-before: always; break-before: page;">
        <div class="chapter-header">
          <span class="chapter-num">CHAPTER 0${chIdx + 1}</span>
          <h2 class="chapter-title">${displayTitle}</h2>
        </div>
        ${itemsHTML}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CDLINOMA FAMILY</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }

    @page :first {
      margin: 0;
    }

    body {
      font-family: 'Nunito', sans-serif;
      background: #fff;
      color: #1a1a2e;
      font-size: 11pt;
      line-height: 1.5;
    }

    /* ─── COVER PAGE ─────────────────── */
    .cover-page {
      page-break-after: always;
      height: 297mm;
      width: 210mm;
      background: linear-gradient(135deg, #1e1b4b, #3b0764);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 45mm 25mm 25mm 25mm;
      box-sizing: border-box;
    }
    .cover-content {
      width: 100%;
      text-align: center;
    }
    .cover-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 30px;
      padding: 6px 18px;
      font-family: 'Fredoka One', cursive;
      font-size: 10pt;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #fbbf24;
      margin-bottom: 25px;
    }
    .cover-title {
      font-family: 'Fredoka One', cursive;
      font-size: 40pt;
      letter-spacing: 0.5px;
      line-height: 1.1;
      margin-bottom: 12px;
      color: #ffffff;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .cover-subtitle {
      font-size: 20pt;
      font-weight: 800;
      color: #e9d5ff;
      margin-bottom: 40px;
      letter-spacing: 1px;
    }
    .cover-divider {
      width: 80px;
      height: 5px;
      background: #fbbf24;
      margin: 0 auto 40px auto;
      border-radius: 10px;
    }
    .cover-desc {
      font-size: 11pt;
      color: #cbd5e1;
      line-height: 1.6;
      max-width: 90%;
      margin: 0 auto 50px auto;
    }
    .cover-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      text-align: left;
      margin-top: 20px;
    }
    .cover-grid-cell {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 14px 18px;
    }
    .cell-label {
      font-size: 8.5pt;
      font-weight: 900;
      color: #a78bfa;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: block;
      margin-bottom: 4px;
    }
    .cell-val {
      font-family: 'Fredoka One', cursive;
      font-size: 11.5pt;
      color: #ffffff;
    }
    .cover-footer {
      font-family: 'Fredoka One', cursive;
      font-size: 12pt;
      color: #fbbf24;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    /* ─── CHAPTER HEADER ────────────────── */
    .chapter-container {
      margin-top: 10px;
    }
    .chapter-header {
      background: linear-gradient(135deg, #1e1b4b, #3b0764);
      color: white;
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 24px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(59, 7, 100, 0.15);
    }
    .chapter-num {
      font-family: 'Fredoka One', cursive;
      font-size: 12pt;
      color: #fbbf24;
      text-transform: uppercase;
      letter-spacing: 2.5px;
      display: block;
      margin-bottom: 6px;
    }
    .chapter-title {
      font-family: 'Fredoka One', cursive;
      font-size: 18pt;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }

    /* ─── CASE CONTAINER ─────────────────── */
    .case-container {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 22px;
      background: #fafafc;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .case-header-title {
      font-family: 'Fredoka One', cursive;
      font-size: 13pt;
      color: #1e1b4b;
      margin-bottom: 12px;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 6px;
    }
    .case-box {
      background: #fef8eb;
      border-left: 5px solid #fbbf24;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 18px;
      font-size: 10pt;
      color: #451a03;
      line-height: 1.5;
    }

    /* ─── QUESTION CONTAINER ──────────────── */
    .question-container {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 22px;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .question-block {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px dashed #e2e8f0;
    }
    .question-block:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .question-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 10px;
    }
    .q-badge {
      background: #6d28d9;
      color: white;
      font-family: 'Fredoka One', cursive;
      font-size: 8.5pt;
      padding: 3px 9px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .q-title {
      font-weight: 800;
      font-size: 10.5pt;
      color: #1e1b4b;
      line-height: 1.45;
    }

    /* ─── ANSWER BOX ─────────────────────── */
    .answer-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #16a34a;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 8px;
      page-break-inside: avoid;
    }
    .answer-badge {
      background: #16a34a;
      color: white;
      font-family: 'Fredoka One', cursive;
      font-size: 7.5pt;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .answer-content {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.5;
    }
    .answer-list-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin-top: 4px;
    }
    .list-num {
      font-weight: 900;
      color: #16a34a;
      flex-shrink: 0;
    }
    .list-text {
      flex: 1;
    }
    .answer-para {
      margin-top: 4px;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-content">
      <div class="cover-badge">✨ Clinoma Premium Booklet</div>
      <h1 class="cover-title">CDLINOMA FAMILY</h1>
      <h2 class="cover-subtitle">الأسئلة المقالية لطب الأسرة</h2>
      <div class="cover-divider"></div>
      <div class="cover-desc">
        A premium compilation of Family Medicine essay cases, previous years' exam questions, and detailed model answers, structured and formatted for the second paper camp.
      </div>
      <div class="cover-grid">
        <div class="cover-grid-cell">
          <span class="cell-label">Subject</span>
          <span class="cell-val">Family Medicine (طب الأسرة)</span>
        </div>
        <div class="cover-grid-cell">
          <span class="cell-label">Booklet Type</span>
          <span class="cell-val">Essay Q&A Booklet</span>
        </div>
        <div class="cover-grid-cell">
          <span class="cell-label">Target Exam</span>
          <span class="cell-val">Second Paper (الورقة الثانية)</span>
        </div>
        <div class="cover-grid-cell">
          <span class="cell-label">Total Questions</span>
          <span class="cell-val">${totalQuestionsCount} Questions</span>
        </div>
      </div>
    </div>
    <div class="cover-footer">
      Prepared exclusively for Clinoma Candidates ⚡
    </div>
  </div>

  <!-- CHAPTERS AND QUESTIONS -->
  ${chaptersHTML}

</body>
</html>`;
}

// ===== 4. GENERATE PDF =====
async function generatePDF() {
  console.log('🚀 Launching browser for Family Medicine Essay PDF...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const pdfPath = join(__dirname, "..", "نصوص للقراءة", "الورقة الثانية", "المعسكر", "CDLINOMA FAMILY.pdf");

  console.log(`📄 Generating: CDLINOMA FAMILY.pdf`);
  const page = await context.newPage();
  await page.setContent(buildHTML(), { waitUntil: 'networkidle' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size: 8px; font-family: 'Nunito', 'Segoe UI', Arial, sans-serif; color: #94a3b8; width: 100%; text-align: right; padding-right: 25px;">CDLINOMA FAMILY — Essay Booklet</div>`,
    footerTemplate: `<div style="font-size: 8px; font-family: 'Nunito', 'Segoe UI', Arial, sans-serif; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 25px;">
      <span>Clinoma Second Paper Camp ⚡</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>`,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await page.close();
  console.log(`✅ Saved: ${pdfPath}`);

  await browser.close();
  console.log('🎉 Family Medicine Essay PDF generated successfully!');
}

generatePDF().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
