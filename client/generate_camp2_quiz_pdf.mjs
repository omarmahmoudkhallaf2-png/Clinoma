import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== QUIZ CONTENT =====
const THEME1 = {
  title: 'Hematological Disorders',
  marks: 5,
  options: [
    { letter: 'A', text: 'Aplastic anaemia' },
    { letter: 'B', text: 'Thalassaemia Intermedia' },
    { letter: 'C', text: 'Spherocytosis' },
    { letter: 'D', text: 'Glucose 6 Phosphate dehydrogenase deficiency' },
    { letter: 'E', text: 'Hemosiderosis' },
  ],
  questions: [
    { num: 1, text: 'Acute hemolysis may be exacerbated by anti-malarial therapy.' },
    { num: 2, text: 'Characterized by the overgrowth of bones of the face.' },
    { num: 3, text: 'May be a consequence of cytomegalovirus infection.' },
    { num: 4, text: 'May present with characteristic skin pigmentation and is secondary to multiple transfusions.' },
    { num: 5, text: 'Occurs as a result of a congenital defect of the red cell membrane.' },
  ],
  answers: ['D', 'B', 'A', 'E', 'C'],
};

// ===== HTML GENERATOR =====
function buildHTML(withAnswers) {
  const answersTable = withAnswers ? `
    <div class="answers-section">
      <h3 class="answers-title">✅ Answers</h3>
      <table class="answers-table">
        <thead>
          <tr>
            ${THEME1.answers.map((_, i) => `<th>No. ${i + 1}<br/><span class="mark-label">(1 mark)</span></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            ${THEME1.answers.map(a => `<td class="answer-cell">${a}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Camp 2 - Day 1 Quiz</title>
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
      font-size: 13pt;
      line-height: 1.6;
    }

    /* ─── HEADER ─────────────────────── */
    .header {
      text-align: center;
      border-bottom: 4px solid #e63946;
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
      color: #e63946;
      letter-spacing: 1px;
    }
    .header-sub {
      font-size: 10pt;
      color: #666;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .quiz-title-box {
      background: linear-gradient(135deg, #e63946, #c1121f);
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
      font-size: 17pt;
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
      border: 2px solid #e63946;
      border-radius: 10px;
      padding: 8px 12px;
      text-align: center;
    }
    .info-label {
      font-size: 8pt;
      font-weight: 900;
      color: #e63946;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-value {
      font-family: 'Fredoka One', cursive;
      font-size: 13pt;
      color: #1a1a2e;
    }

    /* ─── SECTION HEADER ─────────────────── */
    .section-header {
      background: #1a1a2e;
      color: white;
      border-radius: 10px;
      padding: 10px 18px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .section-title {
      font-family: 'Fredoka One', cursive;
      font-size: 14pt;
    }
    .section-marks {
      background: #e63946;
      color: white;
      font-weight: 900;
      font-size: 10pt;
      padding: 3px 10px;
      border-radius: 20px;
    }

    /* ─── THEME ─────────────────────────── */
    .theme-box {
      border: 2px solid #e0e0e0;
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 22px;
    }
    .theme-title {
      font-family: 'Fredoka One', cursive;
      font-size: 13.5pt;
      color: #e63946;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .theme-num-badge {
      background: #e63946;
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11pt;
      font-weight: 900;
      flex-shrink: 0;
    }

    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 18px;
      margin-bottom: 14px;
      padding: 12px 14px;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid #e63946;
    }
    .option-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-size: 11.5pt;
    }
    .option-letter {
      font-family: 'Fredoka One', cursive;
      color: #e63946;
      font-size: 12pt;
      min-width: 18px;
    }

    .instruction {
      font-size: 10pt;
      font-weight: 800;
      color: #c1121f;
      margin-bottom: 10px;
      font-style: italic;
    }

    .questions-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .question-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 11.5pt;
    }
    .q-num {
      font-family: 'Fredoka One', cursive;
      color: #1a1a2e;
      min-width: 28px;
      background: #eee;
      border-radius: 6px;
      text-align: center;
      padding: 1px 5px;
      font-size: 11pt;
    }
    .q-text {
      flex: 1;
      line-height: 1.5;
    }
    .answer-blank {
      display: inline-block;
      min-width: 36px;
      height: 20px;
      border-bottom: 2px solid #1a1a2e;
      margin-right: 6px;
      vertical-align: bottom;
    }

    /* ─── ANSWERS TABLE ─────────────────── */
    .answers-section {
      margin-top: 28px;
      page-break-before: ${withAnswers ? 'avoid' : 'always'};
    }
    .answers-title {
      font-family: 'Fredoka One', cursive;
      font-size: 15pt;
      color: #1a1a2e;
      margin-bottom: 12px;
      border-bottom: 3px solid #e63946;
      padding-bottom: 6px;
    }
    .answers-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 12px;
      overflow: hidden;
    }
    .answers-table thead tr {
      background: #e63946;
      color: white;
    }
    .answers-table th {
      font-family: 'Fredoka One', cursive;
      font-size: 11pt;
      padding: 10px 8px;
      text-align: center;
      border-right: 1px solid rgba(255,255,255,0.3);
    }
    .mark-label {
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 8.5pt;
      opacity: 0.9;
    }
    .answers-table tbody tr {
      background: #fff9f9;
    }
    .answer-cell {
      font-family: 'Fredoka One', cursive;
      font-size: 18pt;
      color: #e63946;
      text-align: center;
      padding: 14px 8px;
      border-right: 1px solid #f0caca;
      border-bottom: 1px solid #f0caca;
    }

    /* ─── FOOTER ─────────────────────── */
    .footer {
      margin-top: 30px;
      text-align: center;
      border-top: 2px dashed #e0e0e0;
      padding-top: 12px;
    }
    .footer-text {
      font-family: 'Fredoka One', cursive;
      font-size: 11pt;
      color: #999;
    }
    .footer-brand {
      color: #e63946;
    }

    /* ─── ANSWER BOX (no-answer version) ─────── */
    .answer-row-blank {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-top: 14px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 10px;
    }
    .blank-cell {
      border: 2px solid #e63946;
      border-radius: 8px;
      padding: 10px 6px;
      text-align: center;
    }
    .blank-label {
      font-size: 9pt;
      font-weight: 900;
      color: #e63946;
      display: block;
    }
    .blank-write {
      display: block;
      height: 28px;
      border-bottom: 2px solid #1a1a2e;
      margin: 4px 6px 0;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      <span class="header-logo">⚡ Med Prep</span>
    </div>
    <div class="header-sub">معسكر الورقة الثانية للأطفال — اليوم الأول</div>
  </div>

  <!-- QUIZ TITLE BOX -->
  <div class="quiz-title-box">
    <div class="quiz-title-main">📝 Day 1 Quiz — Second Paper Camp</div>
    <div class="quiz-meta">
      ${withAnswers ? '✅ Answer Key Edition' : '🖊️ Student Copy'}<br/>
      Total Marks: 16 &nbsp;|&nbsp; Time: 30 min
    </div>
  </div>

  <!-- INFO BAR -->
  <div class="info-bar">
    <div class="info-cell">
      <div class="info-label">Quiz Type</div>
      <div class="info-value">Ill-Extended Matching</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Total Marks</div>
      <div class="info-value">16 Marks</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Duration</div>
      <div class="info-value">30 Minutes</div>
    </div>
  </div>

  <!-- SECTION HEADER -->
  <div class="section-header">
    <span class="section-title">Ill-Extended Matching Questions (EMQ)</span>
    <span class="section-marks">Total: 16 marks</span>
  </div>

  <!-- THEME 1 -->
  <div class="theme-box">
    <div class="theme-title">
      <span class="theme-num-badge">1</span>
      Theme: ${THEME1.title}
      <span style="font-family:'Nunito',sans-serif; font-size:10pt; color:#666; font-weight:800;">(${THEME1.marks} marks)</span>
    </div>

    <div class="options-grid">
      ${THEME1.options.map(o => `
        <div class="option-row">
          <span class="option-letter">${o.letter}.</span>
          <span>${o.text}</span>
        </div>
      `).join('')}
    </div>

    <p class="instruction">From the list above, select one choice that is most suitable for the following options:</p>

    <ul class="questions-list">
      ${THEME1.questions.map(q => `
        <li class="question-item">
          <span class="q-num">${q.num}</span>
          <span class="q-text">${q.text}</span>
        </li>
      `).join('')}
    </ul>

    ${withAnswers ? answersTable : `
      <div class="answer-row-blank">
        ${THEME1.questions.map(q => `
          <div class="blank-cell">
            <span class="blank-label">No. ${q.num} (1 mark)</span>
            <span class="blank-write"></span>
          </div>
        `).join('')}
      </div>
    `}
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-text">
      Prepared exclusively for <span class="footer-brand">Med Prep — معسكر الورقة الثانية</span> ⚡
    </div>
  </div>

</body>
</html>`;
}

// ===== GENERATE PDFs =====
async function generatePDFs() {
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const files = [
    { name: 'معسكر_الورقة_الثانية_اليوم_الأول_كويز.pdf',          withAnswers: false },
    { name: 'معسكر_الورقة_الثانية_اليوم_الأول_كويز_إجابات.pdf',   withAnswers: true  },
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
  console.log('🎉 All PDFs generated successfully!');
}

generatePDFs().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
