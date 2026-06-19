import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== READ DATA =====
const dataPath = join(__dirname, 'src', 'pages', 'flashcards', 'ophth_written_data.json');
const rawData = readFileSync(dataPath, 'utf-8');
const DATA = JSON.parse(rawData);

function parseMarkdownToHTML(text) {
  const lines = text.split('\n');
  let html = '';
  let inTable = false;
  let tableRows = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if it's a table row
    if (trimmed.includes('|')) {
      // Check if it's a separator line (like ---|---|--- or :---)
      if (trimmed.replace(/[\s\-:|]/g, '') === '') {
        // It is a separator line, skip it
        continue;
      }
      
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      
      // Parse cells
      let cells = line.split('|').map(c => c.trim());
      // Handle leading/trailing empty cells if the line started/ended with |
      if (line.trim().startsWith('|')) cells.shift();
      if (line.trim().endsWith('|')) cells.pop();
      
      tableRows.push(cells);
    } else {
      // Not a table row. If we were in a table, close it first
      if (inTable) {
        html += renderTableHTML(tableRows);
        inTable = false;
        tableRows = [];
      }
      // Add normal paragraph
      if (trimmed) {
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          html += `<li class="bullet-item">${trimmed.substring(2)}</li>`;
        } else {
          html += `<p class="paragraph-content">${trimmed}</p>`;
        }
      } else {
        html += '<div class="space-divider"></div>';
      }
    }
  }
  
  if (inTable) {
    html += renderTableHTML(tableRows);
  }
  
  return html;
}

function renderTableHTML(rows) {
  if (rows.length === 0) return '';
  let tableHtml = '<table class="comparison-table">';
  
  // First row is header
  const header = rows[0];
  tableHtml += '<thead><tr>';
  header.forEach(cell => {
    tableHtml += `<th>${cell}</th>`;
  });
  tableHtml += '</tr></thead>';
  
  // Remaining rows are body
  tableHtml += '<tbody>';
  for (let i = 1; i < rows.length; i++) {
    tableHtml += '<tr>';
    rows[i].forEach(cell => {
      tableHtml += `<td>${cell}</td>`;
    });
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody></table>';
  
  return tableHtml;
}

// ===== HTML GENERATOR =====
function buildHTML(withAnswers) {
  const chaptersHTML = DATA.chapters.map(ch => {
    const questionsHTML = ch.questions.map((q, idx) => {
      let answerContent = parseMarkdownToHTML(q.answer);

      const answerHTML = withAnswers
        ? `
          <div class="answer-box">
            <span class="answer-badge">Model Answer</span>
            <div class="answer-content">${answerContent}</div>
          </div>
        `
        : `
          <div class="blank-lines">
            ${Array.from({ length: Math.max(3, Math.min(10, Math.ceil(q.answer.length / 120))) })
              .map(() => '<div class="blank-line"></div>').join('')}
          </div>
        `;

      return `
        <div class="question-container" style="page-break-inside: avoid; break-inside: avoid;">
          <div class="question-header">
            <span class="q-badge">Q ${idx + 1}</span>
            <span class="q-type-badge">${q.type.replace('_', ' ')}</span>
            <span class="q-title">${q.question}</span>
          </div>
          ${answerHTML}
        </div>
      `;
    }).join('');

    return `
      <div class="chapter-container">
        <div class="chapter-header">
          <span class="chapter-title">📂 Chapter ${ch.id}: ${ch.titleAr || ch.title} (${ch.title})</span>
        </div>
        ${questionsHTML}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ophthalmology Written Booklet</title>
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
      font-size: 10.5pt;
      line-height: 1.5;
    }

    /* ─── HEADER ─────────────────────── */
    .header {
      text-align: center;
      border-bottom: 4px solid #10b981;
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
      color: #10b981;
      letter-spacing: 1px;
    }
    .header-sub {
      font-size: 11pt;
      color: #4b5563;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    .quiz-title-box {
      background: linear-gradient(135deg, #10b981, #047857);
      color: white;
      border-radius: 14px;
      padding: 14px 24px;
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
      border: 2px solid #10b981;
      border-radius: 10px;
      padding: 8px 12px;
      text-align: center;
    }
    .info-label {
      font-size: 8pt;
      font-weight: 900;
      color: #10b981;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-value {
      font-family: 'Fredoka One', cursive;
      font-size: 11pt;
      color: #1a1a2e;
    }

    /* ─── CHAPTER HEADER ─────────────────── */
    .chapter-container {
      margin-bottom: 30px;
    }
    .chapter-header {
      background: #1e293b;
      color: white;
      border-radius: 10px;
      padding: 12px 18px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }
    .chapter-title {
      font-weight: 900;
      font-size: 12pt;
      letter-spacing: 0.5px;
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
      gap: 8px;
      margin-bottom: 8px;
    }
    .q-badge {
      background: #10b981;
      color: white;
      font-family: 'Fredoka One', cursive;
      font-size: 8.5pt;
      padding: 2px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .q-type-badge {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
      font-size: 7.5pt;
      font-weight: 900;
      padding: 1px 6px;
      border-radius: 5px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .q-title {
      font-weight: 800;
      font-size: 10.5pt;
      color: #1e1b4b;
      line-height: 1.4;
      margin-left: 4px;
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
      border-left: 4px solid #10b981;
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 10px;
    }
    .answer-badge {
      background: #10b981;
      color: white;
      font-family: 'Fredoka One', cursive;
      font-size: 7.5pt;
      padding: 1px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .answer-content {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.5;
    }
    .paragraph-content {
      margin-bottom: 6px;
    }
    .bullet-item {
      margin-left: 16px;
      margin-bottom: 4px;
      list-style-type: disc;
      display: list-item;
    }
    .space-divider {
      height: 8px;
    }

    /* ─── TABLES ────────────────────────── */
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 9pt;
    }
    .comparison-table th, .comparison-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }
    .comparison-table th {
      background-color: #f1f5f9;
      font-weight: 800;
      color: #0f172a;
    }
    .comparison-table td {
      font-weight: 600;
    }

    /* ─── FOOTER ─────────────────────── */
    .footer {
      margin-top: 35px;
      text-align: center;
      border-top: 2px dashed #cbd5e1;
      padding-top: 12px;
      page-break-inside: avoid;
    }
    .footer-text {
      font-family: 'Fredoka One', cursive;
      font-size: 11pt;
      color: #94a3b8;
    }
    .footer-brand {
      color: #10b981;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      <span class="header-logo">⚡ Clinoma</span>
    </div>
    <div class="header-sub">Ophthalmology Written Booklet — Clinoma Written</div>
  </div>

  <!-- QUIZ TITLE BOX -->
  <div class="quiz-title-box">
    <div class="quiz-title-main">✍️ Essay Booklet — Written Questions (أسئلة مقالية)</div>
    <div class="quiz-meta">
      ${withAnswers ? '✅ Answer Key Edition (ملحق الإجابات)' : '🖊️ Student Practice Copy (نسخة الطالب)'}<br/>
      Total Chapters: 6 &nbsp;|&nbsp; Clinoma written
    </div>
  </div>

  <!-- INFO BAR -->
  <div class="info-bar">
    <div class="info-cell">
      <div class="info-label">Curriculum</div>
      <div class="info-value">Ophthalmology Written</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Total Chapters</div>
      <div class="info-value">6 Chapters</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Active Course</div>
      <div class="info-value">رمد نظري (Written)</div>
    </div>
  </div>

  <!-- SECTIONS AND QUESTIONS -->
  ${chaptersHTML}

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-text">
      Prepared exclusively for <span class="footer-brand">Clinoma — رمد نظري</span> ⚡
    </div>
  </div>

</body>
</html>`;
}

// ===== GENERATE PDFs =====
async function generatePDFs() {
  console.log('🚀 Launching browser for Ophthalmology Written PDFs...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const files = [
    { name: 'clinoma_written_ophthalmology_student.pdf', withAnswers: false },
    { name: 'clinoma_written_ophthalmology.pdf',        withAnswers: true  },
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
  console.log('🎉 All Ophthalmology Written PDFs generated successfully!');
}

generatePDFs().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
