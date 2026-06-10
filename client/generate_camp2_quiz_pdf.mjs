import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== QUIZ CONTENT =====
const THEMES = [
  {
    num: 1,
    title: 'Acute Upper Airway Infections & Obstruction',
    marks: 5,
    options: [
      { letter: 'A', text: 'Viral Croup' },
      { letter: 'B', text: 'Acute Epiglottitis' },
      { letter: 'C', text: 'Acute Bronchiolitis' },
      { letter: 'D', text: 'Foreign Body Aspiration' },
      { letter: 'E', text: 'Spasmodic Croup' }
    ],
    questions: [
      { num: 1, text: 'A 6-month-old infant presents during winter with a first episode of expiratory wheezing, tachypnea, and chest retractions, following a 3-day history of coryza and low-grade fever.' },
      { num: 2, text: 'Anteroposterior neck radiography of a 2-year-old child presenting with a barking cough and inspiratory stridor demonstrates subglottic narrowing known as the "steeple sign".' },
      { num: 3, text: 'A 3-year-old child presents with a sudden onset of barking cough at night without a preceding viral prodrome or fever, which completely resolves within a few hours.' },
      { num: 4, text: 'A 4-year-old unimmunized child presents with a toxic appearance, high fever, severe respiratory distress, drooling of saliva, and insistence on sitting forward in a tripod position.' },
      { num: 5, text: 'A 14-month-old healthy toddler experiences a sudden episode of choking and coughing while playing, followed by a fixed localized wheeze and decreased breath sounds on one side.' }
    ],
    answers: ['C', 'A', 'E', 'B', 'D']
  },
  {
    num: 2,
    title: 'Diagnostic & Management Safety Maneuvers',
    marks: 5,
    options: [
      { letter: 'A', text: 'Expiratory chest radiograph' },
      { letter: 'B', text: 'Direct oral examination with a tongue depressor' },
      { letter: 'C', text: 'Spirometry showing reversibility of airway obstruction' },
      { letter: 'D', text: 'Nebulized Epinephrine followed by a 2-hour observation period' },
      { letter: 'E', text: 'Routine administration of sedatives' }
    ],
    questions: [
      { num: 1, text: 'A diagnostic evaluation modality used to confirm the diagnosis of Bronchial Asthma by documenting the reversible nature of the airway obstruction.' },
      { num: 2, text: 'A strictly prohibited procedure in a child suspected of acute epiglottitis due to the critical risk of precipitating fatal laryngospasm before securing the airway.' },
      { num: 3, text: 'The preferred radiological technique used to visualize obstructive emphysema or localized air trapping caused by a radiolucent foreign body.' },
      { num: 4, text: 'A fast-acting therapeutic intervention used to decrease subglottic edema in severe croup, requiring monitoring due to the risk of rebound symptom recurrence.' },
      { num: 5, text: 'A management intervention that is strictly avoided and contraindicated in the standard supportive care of acute bronchiolitis.' }
    ],
    answers: ['C', 'B', 'A', 'D', 'E']
  },
  {
    num: 3,
    title: 'Differential Diagnosis & Pneumonia Mimics',
    marks: 5,
    options: [
      { letter: 'A', text: 'Diabetic Ketoacidosis (DKA)' },
      { letter: 'B', text: 'Congenital Lung Anomalies (e.g., CCAM/Sequestration)' },
      { letter: 'C', text: 'Bronchial Asthma' },
      { letter: 'D', text: 'Heart Failure' },
      { letter: 'E', text: 'Loffler Syndrome' }
    ],
    questions: [
      { num: 1, text: 'A metabolic condition that mimics respiratory distress by causing deep, rapid respiration (Kussmaul breathing), while the chest examination remains entirely clear.' },
      { num: 2, text: 'An underlying structural etiology that must be highly suspected in a child presenting with recurrent episodes of pneumonia restricted to the exact same lung site.' },
      { num: 3, text: 'Characterized by chronic airway inflammation, bronchial hyperresponsiveness, and recurrent acute episodes triggered by exposure to allergens.' },
      { num: 4, text: 'A non-respiratory systemic condition presenting with tachypnea, cardiomegaly, a gallop rhythm, and a tender enlarged liver, which can be mistaken for childhood pneumonia.' },
      { num: 5, text: 'Characterized by transient pulmonary eosinophilic infiltrates accompanied by mild respiratory symptoms, often secondary to parasites or drugs.' }
    ],
    answers: ['A', 'B', 'C', 'D', 'E']
  },
  {
    num: 4,
    title: 'Pediatric Pneumonia Pathogens',
    marks: 5,
    options: [
      { letter: 'A', text: 'Staphylococcus aureus' },
      { letter: 'B', text: 'Mycoplasma pneumoniae' },
      { letter: 'C', text: 'Chlamydia trachomatis' },
      { letter: 'D', text: 'Viral Pneumonia (e.g., RSV/Adenovirus)' },
      { letter: 'E', text: 'Streptococcus pneumoniae' }
    ],
    questions: [
      { num: 1, text: 'A school-aged child presenting with an insidious onset of atypical pneumonia, where treatment with Macrolides is the preferred therapeutic choice.' },
      { num: 2, text: 'A chest radiograph of a severely ill infant reveals pathogen-specific lung complications such as pneumatoceles, empyema, or pyopneumothorax.' },
      { num: 3, text: 'Characterized by a laboratory profile showing a normal to mildly elevated white blood cell count with a distinct lymphocyte predominance.' },
      { num: 4, text: 'The most common cause of bacterial pneumonia, characterized by a high white blood cell count with polymorphonuclear (PMN) predominance and markedly elevated ESR and CRP.' },
      { num: 5, text: 'An infant presenting with subacute pneumonia, a characteristic staccato cough, and no fever, typically acquired during delivery through an infected birth canal.' }
    ],
    answers: ['B', 'A', 'D', 'E', 'C']
  },
  {
    num: 5,
    title: 'Pneumonia Classifications & Hospitalization',
    marks: 5,
    options: [
      { letter: 'A', text: 'Community-Acquired Pneumonia (CAP)' },
      { letter: 'B', text: 'Hospital-Acquired Pneumonia (HAP)' },
      { letter: 'C', text: 'Ventilator-Associated Pneumonia (VAP)' },
      { letter: 'D', text: 'Age < 6 months' },
      { letter: 'E', text: 'Fast breathing (Tachypnea)' }
    ],
    questions: [
      { num: 1, text: 'A type of lower respiratory infection that presents clinically in a child more than 48 hours after hospital admission.' },
      { num: 2, text: 'A specific category of nosocomial pneumonia that characteristically develops more than 48 hours following endotracheal intubation.' },
      { num: 3, text: 'An absolute age-based indication for hospitalizing a child diagnosed with pneumonia, regardless of the initial mild clinical scoring.' },
      { num: 4, text: 'Defined as signs and symptoms of pneumonia developing in a previously healthy child due to an infection acquired outside a hospital facility.' },
      { num: 5, text: 'The primary clinical sign used by the WHO classification to identify pneumonia in a child presenting with a cough or difficult breathing.' }
    ],
    answers: ['B', 'C', 'D', 'A', 'E']
  },
  {
    num: 6,
    title: 'Bronchial Asthma Triggers & Clinical Indicators',
    marks: 5,
    options: [
      { letter: 'A', text: 'Insidious onset of acute asthma episodes' },
      { letter: 'B', text: 'Sudden onset of acute asthma episodes' },
      { letter: 'C', text: 'Pulsus paradoxus' },
      { letter: 'D', text: 'Palpable liver and spleen margins' },
      { letter: 'E', text: 'Day-to-day and/or morning-to-evening variation of PEF or FEV1 >= 20%' }
    ],
    questions: [
      { num: 1, text: 'The typical clinical onset pattern observed when an acute asthma episode is triggered following viral infections.' },
      { num: 2, text: 'The typical clinical onset pattern observed when an acute asthma episode is caused by exposure to irritants like cold air or noxious fumes.' },
      { num: 3, text: 'A cardiovascular clinical sign characterized by an exaggerated drop in systolic blood pressure during inspiration, accompanying severe asthma attacks.' },
      { num: 4, text: 'A physical examination finding in severe asthma that occurs entirely as a result of chest hyperinflation displacing the diaphragm downward.' },
      { num: 5, text: 'A diagnostic parameter obtained on lung function tests that indicates significant diurnal variation and airway reversibility in a child with asthma.' }
    ],
    answers: ['A', 'B', 'C', 'D', 'E']
  },
  {
    num: 7,
    title: 'Bronchial Asthma Lab Profiles & Comorbidities',
    marks: 5,
    options: [
      { letter: 'A', text: 'Early-stage acute asthma exacerbation' },
      { letter: 'B', text: 'Late-stage impending respiratory failure' },
      { letter: 'C', text: 'Gastroesophageal Reflux Disease (GERD)' },
      { letter: 'D', text: 'Eosinophilia' },
      { letter: 'E', text: 'Silent chest' }
    ],
    questions: [
      { num: 1, text: 'A chronic comorbid condition commonly associated with bronchial asthma that induces recurrent micro-aspiration, making the airway disease difficult to control.' },
      { num: 2, text: 'A blood laboratory finding that serves as a useful indicator of the underlying allergic or atopic profile in a child with bronchial asthma.' },
      { num: 3, text: 'An arterial blood gas (ABG) profile during an initial asthma attack showing hypoxia, low PCO2, and respiratory alkalosis due to hyperventilation.' },
      { num: 4, text: 'An arterial blood gas (ABG) profile showing a rising or normal PCO2 accompanied by respiratory acidosis, indicating severe respiratory muscle fatigue.' },
      { num: 5, text: 'A critical auscultatory finding during a severe asthma attack where air entry is so poor that wheezing disappears, indicating imminent respiratory arrest.' }
    ],
    answers: ['C', 'D', 'A', 'B', 'E']
  },
  {
    num: 8,
    title: 'Acute Bronchiolitis Pathophysiology & Complications',
    marks: 5,
    options: [
      { letter: 'A', text: 'Apneic spells' },
      { letter: 'B', text: 'Complete plugging of airways by mucus and sloughed cells' },
      { letter: 'C', text: 'Humidified oxygen' },
      { letter: 'D', text: 'Ribavirin' },
      { letter: 'E', text: 'Respiratory Syncytial Virus (RSV)' }
    ],
    questions: [
      { num: 1, text: 'A critical life-threatening complication that must be closely anticipated in young infants below 2 months of age presenting with acute bronchiolitis.' },
      { num: 2, text: 'The primary supportive therapeutic agent routinely administered in acute bronchiolitis to manage documented hypoxemia.' },
      { num: 3, text: 'A specific antiviral agent that may be considered for the treatment of acute bronchiolitis in highly selected high-risk or congenital cases.' },
      { num: 4, text: 'The pathological mechanism in the bronchioles that directly results in hyperinflation, air trapping, and ventilation-perfusion mismatch.' },
      { num: 5, text: 'The most common underlying viral etiology responsible for the vast majority of cases of acute bronchiolitis in infants.' }
    ],
    answers: ['A', 'C', 'D', 'B', 'E']
  },
  {
    num: 9,
    title: 'WHO Tachypnea Definitions & Critical Airway Rules',
    marks: 5,
    options: [
      { letter: 'A', text: 'Respiratory rate >= 50 breaths/minute' },
      { letter: 'B', text: 'Respiratory rate >= 40 breaths/minute' },
      { letter: 'C', text: 'Avoid placing the child in a supine position' },
      { letter: 'D', text: 'Avoid phlebotomy or IV line placement before airway control' },
      { letter: 'E', text: 'Respiratory rate >= 60 breaths/minute' }
    ],
    questions: [
      { num: 1, text: 'The strict WHO threshold value used to define fast breathing (tachypnea) in an infant aged 2 months up to 12 months.' },
      { num: 2, text: 'The strict WHO threshold value used to define fast breathing (tachypnea) in a child aged 12 months up to 5 years.' },
      { num: 3, text: 'An immediate positioning safety protocol in epiglottitis required because gravity can cause the swollen epiglottis to occlude the airway completely.' },
      { num: 4, text: 'A critical medical safety restriction in epiglottitis aimed at preventing any painful or stressful interventions that could trigger fatal laryngospasm.' },
      { num: 5, text: 'The strict WHO threshold value used to define fast breathing (tachypnea) in a young infant less than 2 months of age.' }
    ],
    answers: ['A', 'B', 'C', 'D', 'E']
  }
];

// ===== HTML GENERATOR =====
function buildHTML(withAnswers) {
  const answersSection = withAnswers ? `
    <div class="answers-section" style="page-break-before: always;">
      <h3 class="answers-title">✅ Model Answers</h3>
      ${THEMES.map(theme => `
        <div class="theme-answers-box" style="margin-bottom: 25px; page-break-inside: avoid; break-inside: avoid;">
          <h4 style="font-family:'Fredoka One',cursive; font-size:12pt; color:#e63946; margin-bottom: 8px;">
            Theme ${theme.num}: ${theme.title}
          </h4>
          <table class="answers-table">
            <thead>
              <tr>
                ${theme.answers.map((_, i) => `<th>No. ${i + 1}<br/><span class="mark-label">(1 mark)</span></th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                ${theme.answers.map(a => `<td class="answer-cell">${a}</td>`).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>
  ` : '';

  const themesHTML = THEMES.map(theme => `
    <div class="theme-box" style="page-break-inside: avoid; break-inside: avoid;">
      <div class="theme-title">
        <span class="theme-num-badge">${theme.num}</span>
        Theme: ${theme.title}
        <span style="font-family:'Nunito',sans-serif; font-size:10pt; color:#666; font-weight:800;">(${theme.marks} marks)</span>
      </div>

      <div class="options-grid">
        ${theme.options.map(o => `
          <div class="option-row">
            <span class="option-letter">${o.letter}.</span>
            <span>${o.text}</span>
          </div>
        `).join('')}
      </div>

      <p class="instruction">From the list above, select one choice that is most suitable for the following options:</p>

      <ul class="questions-list">
        ${theme.questions.map(q => `
          <li class="question-item">
            <span class="q-num">${q.num}</span>
            <span class="q-text">${q.text}</span>
          </li>
        `).join('')}
      </ul>

      ${withAnswers ? '' : `
        <div class="answer-row-blank">
          ${theme.questions.map(q => `
            <div class="blank-cell">
              <span class="blank-label">No. ${q.num} (1 mark)</span>
              <span class="blank-write"></span>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `).join('');

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
      font-size: 11.5pt;
      line-height: 1.5;
    }

    /* ─── HEADER ─────────────────────── */
    .header {
      text-align: center;
      border-bottom: 4px solid #3a86ff;
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
      color: #3a86ff;
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
      background: linear-gradient(135deg, #3a86ff, #023e8a);
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
      font-size: 16pt;
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
      border: 2px solid #3a86ff;
      border-radius: 10px;
      padding: 8px 12px;
      text-align: center;
    }
    .info-label {
      font-size: 8pt;
      font-weight: 900;
      color: #3a86ff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-value {
      font-family: 'Fredoka One', cursive;
      font-size: 12pt;
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
      font-size: 13pt;
    }
    .section-marks {
      background: #3a86ff;
      color: white;
      font-weight: 900;
      font-size: 10pt;
      padding: 3px 10px;
      border-radius: 20px;
    }

    /* ─── THEME ─────────────────────────── */
    .theme-box {
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 20px;
    }
    .theme-title {
      font-family: 'Fredoka One', cursive;
      font-size: 12pt;
      color: #3a86ff;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .theme-num-badge {
      background: #3a86ff;
      color: white;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10.5pt;
      font-weight: 900;
      flex-shrink: 0;
    }

    .options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 4px;
      margin-bottom: 12px;
      padding: 10px 12px;
      background: #f8fafc;
      border-radius: 10px;
      border-left: 4px solid #3a86ff;
    }
    .option-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-size: 11pt;
    }
    .option-letter {
      font-family: 'Fredoka One', cursive;
      color: #3a86ff;
      font-size: 11pt;
      min-width: 18px;
    }

    .instruction {
      font-size: 9.5pt;
      font-weight: 800;
      color: #023e8a;
      margin-bottom: 8px;
      font-style: italic;
    }

    .questions-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .question-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 11pt;
    }
    .q-num {
      font-family: 'Fredoka One', cursive;
      color: #1a1a2e;
      min-width: 24px;
      background: #f1f5f9;
      border-radius: 6px;
      text-align: center;
      padding: 1px 4px;
      font-size: 10.5pt;
    }
    .q-text {
      flex: 1;
      line-height: 1.4;
    }

    /* ─── ANSWERS TABLE ─────────────────── */
    .answers-section {
      margin-top: 28px;
    }
    .answers-title {
      font-family: 'Fredoka One', cursive;
      font-size: 15pt;
      color: #1a1a2e;
      margin-bottom: 12px;
      border-bottom: 3px solid #3a86ff;
      padding-bottom: 6px;
    }
    .answers-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 12px;
      overflow: hidden;
    }
    .answers-table thead tr {
      background: #3a86ff;
      color: white;
    }
    .answers-table th {
      font-family: 'Fredoka One', cursive;
      font-size: 10pt;
      padding: 8px 6px;
      text-align: center;
      border-right: 1px solid rgba(255,255,255,0.3);
    }
    .mark-label {
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 8pt;
      opacity: 0.9;
    }
    .answers-table tbody tr {
      background: #f0f7ff;
    }
    .answer-cell {
      font-family: 'Fredoka One', cursive;
      font-size: 16pt;
      color: #3a86ff;
      text-align: center;
      padding: 10px 6px;
      border-right: 1px solid #c2dfff;
      border-bottom: 1px solid #c2dfff;
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
      color: #3a86ff;
    }

    /* ─── ANSWER BOX (no-answer version) ─────── */
    .answer-row-blank {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-top: 10px;
      padding: 8px;
      background: #f8fafc;
      border-radius: 10px;
    }
    .blank-cell {
      border: 2px solid #3a86ff;
      border-radius: 8px;
      padding: 8px 4px;
      text-align: center;
    }
    .blank-label {
      font-size: 8.5pt;
      font-weight: 900;
      color: #3a86ff;
      display: block;
    }
    .blank-write {
      display: block;
      height: 24px;
      border-bottom: 2px solid #1a1a2e;
      margin: 4px 6px 0;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      <span class="header-logo">⚡ Clinoma</span>
    </div>
    <div class="header-sub">معسكر الورقة الثانية للأطفال — اليوم الأول</div>
  </div>

  <!-- QUIZ TITLE BOX -->
  <div class="quiz-title-box">
    <div class="quiz-title-main">📝 Day 1 Quiz — Second Paper Camp</div>
    <div class="quiz-meta">
      ${withAnswers ? '✅ Answer Key Edition' : '🖊️ Student Copy'}<br/>
      Total Marks: 45 &nbsp;|&nbsp; Time: 30 min
    </div>
  </div>

  <!-- INFO BAR -->
  <div class="info-bar">
    <div class="info-cell">
      <div class="info-label">Quiz Type</div>
      <div class="info-value">Interactive Matching</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Total Marks</div>
      <div class="info-value">45 Marks</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Duration</div>
      <div class="info-value">30 Minutes</div>
    </div>
  </div>

  <!-- SECTION HEADER -->
  <div class="section-header">
    <span class="section-title">Matching Questions sets</span>
    <span class="section-marks">Total: 45 marks</span>
  </div>

  <!-- THEMES LIST -->
  ${themesHTML}

  <!-- MODEL ANSWERS -->
  ${answersSection}

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
