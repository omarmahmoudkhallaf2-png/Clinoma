import os
import re
import random
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import PageTemplate, BaseDocTemplate, Frame, NextPageTemplate

# Define Page Size (A4 Portrait)
PAGE_WIDTH, PAGE_HEIGHT = A4

# Register Comic Sans MS font
COMIC_PATH = "C:/Windows/Fonts/comic.ttf"
COMIC_BOLD_PATH = "C:/Windows/Fonts/comicbd.ttf"

if not os.path.exists(COMIC_PATH):
    COMIC_PATH = "C:/Windows/Fonts/arial.ttf"
if not os.path.exists(COMIC_BOLD_PATH):
    COMIC_BOLD_PATH = "C:/Windows/Fonts/arialbd.ttf"

pdfmetrics.registerFont(TTFont('ComicFont', COMIC_PATH))
pdfmetrics.registerFont(TTFont('ComicFont-Bold', COMIC_BOLD_PATH))

class QuizCanvas(canvas.Canvas):
    """Two-pass canvas for borders, headers, footers and page numbering on the Quiz PDF."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append({
            'dict': dict(self.__dict__),
            'page_type': getattr(self, '_page_type', 'content')
        })
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state_info in self._saved_page_states:
            self.__dict__.update(state_info['dict'])
            self._page_type = state_info['page_type']
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        page_num = self._pageNumber
        page_type = getattr(self, '_page_type', 'content')
        student_name = getattr(self, 'student_name', "Omar Mahmoud")
        student_email = getattr(self, 'student_email', "omar.mahmoud@gmail.com")
        
        if page_type == 'cover':
            # Border for Cover
            self.saveState()
            self.setStrokeColor(colors.HexColor("#0F172A"))
            self.setLineWidth(2)
            self.rect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40)
            
            self.setStrokeColor(colors.HexColor("#F59E0B"))
            self.setLineWidth(1)
            self.rect(25, 25, PAGE_WIDTH - 50, PAGE_HEIGHT - 50)
            self.restoreState()
            return

        # Content Page Borders & Header/Footer
        self.saveState()
        
        # Border
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(1)
        self.rect(20, 30, PAGE_WIDTH - 40, PAGE_HEIGHT - 65)
        
        # Header Watermark
        margin = 20
        header_y = PAGE_HEIGHT - margin - 22
        box_h = 14
        box_w = 170
        
        self.setFillColor(colors.HexColor("#F0F9FF"))
        self.setStrokeColor(colors.HexColor("#bae6fd"))
        self.setLineWidth(0.5)
        self.roundRect(margin + 5, header_y, box_w, box_h, 3, fill=True, stroke=True)
        self.roundRect(PAGE_WIDTH - margin - box_w - 5, header_y, box_w, box_h, 3, fill=True, stroke=True)
        
        self.setFont("ComicFont-Bold", 7.5)
        self.setFillColor(colors.HexColor("#0369A1"))
        self.drawString(margin + 10, header_y + 3.5, "USER:")
        self.setFont("ComicFont", 7.5)
        self.setFillColor(colors.HexColor("#0F172A"))
        self.drawString(margin + 42, header_y + 3.5, student_name)
        
        self.setFont("ComicFont-Bold", 7.5)
        self.setFillColor(colors.HexColor("#0369A1"))
        self.drawString(PAGE_WIDTH - margin - box_w + 10, header_y + 3.5, "EMAIL:")
        self.setFont("ComicFont", 7.5)
        self.setFillColor(colors.HexColor("#0F172A"))
        self.drawString(PAGE_WIDTH - margin - box_w + 45, header_y + 3.5, student_email)
        
        self.setFont("ComicFont-Bold", 6.5)
        self.setFillColor(colors.HexColor("#94A3B8"))
        self.drawCentredString(PAGE_WIDTH / 2, header_y + 3.5, "SECURED DIGITAL EDITION • CLINOMA MATCHING QUIZ")
        
        # Footer
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(20, 42, PAGE_WIDTH - 20, 42)
        
        footer_text = "CLINOMA PLATFORM • ALL RIGHTS RESERVED. UNAUTHORISED SHARING PROHIBITED."
        self.drawString(30, 28, footer_text)
        
        page_str = f"Page {page_num} of {total_pages}"
        self.drawRightString(PAGE_WIDTH - 30, 28, page_str)
        
        self.restoreState()

def parse_matching_sets_day2():
    """Returns the structured matching sets for Day 2 matching quiz."""
    return [
        {
            "id": "1",
            "title": "Set 1: Childhood Obesity (Differential Diagnosis)",
            "pairs": [
                {"q": "Nutritional Obesity", "a": "Consistent/accelerated growth, early puberty, advanced bone age (> 2 SD)."},
                {"q": "Endocrine Obesity", "a": "Decreased/decelerated linear growth. Test for thyroid hormones."},
                {"q": "Genetic Syndrome Obesity", "a": "Severe obesity < 5 years. Developmental delay, short stature, dysmorphic facies, hyperphagia."}
            ]
        },
        {
            "id": "2",
            "title": "Set 2: Congenital Hypothyroidism (Causes & Radiographic Features)",
            "pairs": [
                {"q": "Defect of fetal thyroid development (DYSGENESIS)", "a": "Aplasia, Hypoplasia, Ectopia."},
                {"q": "Defect in thyroid hormone synthesis (DYSHORMONOGENESIS)", "a": "Defect in thyroid hormone synthesis."},
                {"q": "Thyroid scan", "a": "Missing or too small gland."},
                {"q": "Bone age (Greulich & Pyle method)", "a": "Absent/small epiphyses, stippled appearance, cortical thickening."}
            ]
        },
        {
            "id": "3",
            "title": "Set 3: Diabetes Mellitus (Insulin Therapy Management)",
            "pairs": [
                {"q": "Rapid/Short-acting (Lispro, Aspart)", "a": "15 mins before meals."},
                {"q": "Regular", "a": "30–60 mins before meals."},
                {"q": "Intermediate (NPH, Lente)", "a": "10–16 hours."},
                {"q": "Long-acting (Glargine, Detemir)", "a": "20–24 hours."}
            ]
        },
        {
            "id": "4",
            "title": "Set 4: Short Stature (Normal Variants of Growth)",
            "pairs": [
                {"q": "Familial Short Stature", "a": "Bone Age = Chronologic Age (Crucial differential point)."},
                {"q": "Constitutional Delay of Growth and Puberty (CDGP)", "a": "Normal birth size → downward shift at 3–6 months → grows parallel to but below the 3rd percentile by 3–4 years."},
                {"q": "Idiopathic Short Stature (ISS)", "a": "Height ≤ 2 SD below the mean with no endocrine, metabolic, or systemic diagnosis."},
                {"q": "Small for Gestational Age (SGA) Infants", "a": "Most achieve catch-up growth by 2 years of age to enter the normal range."}
            ]
        },
        {
            "id": "5",
            "title": "Set 5: Hematological Hallmarks & Pathognomonic Features",
            "pairs": [
                {"q": "G6PD-deficient individuals", "a": "Denatured hemoglobin aggregates are VISUALIZED as HEINZ BODIES in peripheral blood smears."},
                {"q": "Hereditary Spherocytosis (HS)", "a": "Eosin-5-maleimide (EMA) is the diagnostic test of choice."},
                {"q": "Hodgkin lymphoma (HL)", "a": "The Reed-Sternberg (RS) cell is the hallmark diagnostic feature, characterized as a large cell (15-45 μm in diameter) containing multiple or multilobulated nuclei (\"owl-eye\" appearance)."},
                {"q": "Beta-Thalassemia Major", "a": "Peripheral smear: TARGET CELLS, ANISOCYTOSIS, POIKILOCYTOSIS."},
                {"q": "SEVERE APLASTIC ANEMIA CRITERIA", "a": "Hypocellular BM for age plus two of the following three criteria: Platelet count < 20,000/mm³, Absolute reticulocyte count < 40,000/mm³, or Absolute neutrophil count (ANC) < 500/mm³."},
                {"q": "Acute Lymphoblastic Leukemia (ALL)", "a": "Bone marrow aspiration and biopsy are confirmative and diagnostic if more than 25% of the bone marrow cells are lymphoblasts."}
            ]
        },
        {
            "id": "6",
            "title": "Set 6: Genetics & Inheritance Patterns",
            "pairs": [
                {"q": "Hemophilia A (Classic)", "a": "Factor VIII deficiency. (X-linked recessive, affects males)"},
                {"q": "Hemophilia C", "a": "Factor XI deficiency. (Autosomal recessive, rarest)"},
                {"q": "HYDROPS FETALIS", "a": "SEVERE HEMOLYSIS in utero, leading to DEATH (4 genes deleted)."},
                {"q": "Hereditary Spherocytosis (HS)", "a": "Mode of inheritance: Autosomal Dominant (AD) in 75% of cases."},
                {"q": "G6PD DEFICIENCY", "a": "MOST COMMON ENZYMATIC DISORDER of RBCs, inherited via SEX-LINKED RECESSIVE MODE on the X CHROMOSOME."},
                {"q": "CONGENITAL (Mostly Inherited) Etiology of Aplastic Anemia", "a": "Fanconi anemia and Diamond Blackfan syndrome."}
            ]
        },
        {
            "id": "7",
            "title": "Set 7: Clinical Manifestations & Unique Signs",
            "pairs": [
                {"q": "Iron deficiency anemia (IDA)", "a": "pica, which is the intense craving for nonfood items like clay, dirt, rocks, starch, chalk, soap, paper, or cardboard."},
                {"q": "IMMUNE THROMBOCYTOPENIA (ITP)", "a": "SUDDEN APPEARANCE of PETECHIAL RASH, PURPURA, & ECCHYMOSES (BRUISING) in an otherwise healthy child."},
                {"q": "BETA-THALASSEMIA MAJOR (COOLEY ANEMIA)", "a": "\"THALASSEMIC FACIES\" (frontal bossing, flat nasal bridge, maxilla hyperplasia)"},
                {"q": "Childhood Acute Lymphoblastic Leukemia (ALL) Initial presentation", "a": "Nonspecific signs including anorexia, fatigue, malaise, irritability, and intermittent low-grade fever."},
                {"q": "Hemophilia in Mobile Children & Adolescents", "a": "Hemarthrosis (Joint Bleeding): Most common site (up to 80% of hemorrhages). Affects ankles, knees, elbows."}
            ]
        },
        {
            "id": "8",
            "title": "Set 8: Laboratory Profiles & Investigations",
            "pairs": [
                {"q": "Iron profile in IDA", "a": "shows low serum iron, low serum ferritin, increased Total iron binding capacity (TIBC), and decreased transferrin saturation (TS)."},
                {"q": "Diagnosis in ITP", "a": "CBC shows ISOLATED THROMBOCYTOPENIA"},
                {"q": "Blood chemistry in ALL", "a": "shows markedly elevated lactate dehydrogenase (LDH) and uric acid."},
                {"q": "Biochemistry in Beta-Thalassemia Major", "a": "INCREASED indirect bilirubin, high serum ferritin, high serum iron, high transferrin saturation."},
                {"q": "Investigations in Hemophilia", "a": "Coagulation time & Activated partial thromboplastin time (aPTT): Prolonged"}
            ]
        },
        {
            "id": "9",
            "title": "Set 9: Severe Complications, Crises & Emergencies",
            "pairs": [
                {"q": "APLASTIC CRISIS", "a": "MOST DANGEROUS! Almost universally triggered by Parvovirus B19. Completely halts marrow erythropoiesis."},
                {"q": "MEGALOBLASTIC CRISIS", "a": "Due to rapid, severe depletion of nutritional folate stores driven by chronic, highly accelerated bone marrow erythropoiesis."},
                {"q": "HEMOLYTIC CRISIS", "a": "Sudden, temporary acceleration of RBC destruction, precipitated by acute bacterial or viral infections."},
                {"q": "Tumor Lysis Syndrome (TLS)", "a": "A life-threatening complication managed with aggressive IV hydration before chemotherapy, uric acid reduction via allopurinol, and close electrolyte monitoring."},
                {"q": "Inhibitors (Major Complication)", "a": "IgG antibodies that neutralize clotting factor concentrates. Occurs in 30% of severe Hemophilia A."}
            ]
        }
    ]

def build_quiz_pdf(output_filename, is_answered_version=False, student_name="Student Name", student_email="student@email.com"):
    """Generate the matching sets quiz PDF."""
    printable_frame = Frame(
        36,
        45,
        PAGE_WIDTH - 72,
        PAGE_HEIGHT - 100,
        id='printable_frame',
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0
    )

    def on_cover_page(canvas, doc):
        canvas._page_type = 'cover'
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#0F172A"))
        canvas.setLineWidth(2)
        canvas.rect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40)
        canvas.setStrokeColor(colors.HexColor("#F59E0B"))
        canvas.setLineWidth(1)
        canvas.rect(25, 25, PAGE_WIDTH - 50, PAGE_HEIGHT - 50)
        canvas.restoreState()

    def on_content_page(canvas, doc):
        canvas._page_type = 'content'

    template_cover = PageTemplate(id='CoverPage', frames=printable_frame, onPage=on_cover_page)
    template_content = PageTemplate(id='ContentPage', frames=printable_frame, onPage=on_content_page)

    doc = BaseDocTemplate(
        output_filename,
        pagesize=A4,
        pageTemplates=[template_cover, template_content]
    )

    QuizCanvas.student_name = student_name
    QuizCanvas.student_email = student_email

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=32,
        leading=40,
        textColor=colors.HexColor("#0F172A"),
        alignment=1,
        spaceAfter=15
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=18,
        leading=24,
        textColor=colors.HexColor("#F59E0B"),
        alignment=1,
        spaceAfter=30
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='ComicFont',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#475569"),
        alignment=1,
        spaceAfter=8
    )

    set_title_style = ParagraphStyle(
        'SetTitle',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor("#B45309"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    cell_style = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='ComicFont',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#1E293B")
    )

    cell_bold_style = ParagraphStyle(
        'CellBoldText',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0F172A")
    )

    cell_center_style = ParagraphStyle(
        'CellCenterText',
        parent=styles['Normal'],
        fontName='ComicFont',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#475569"),
        alignment=1
    )

    story = []

    # 1. COVER PAGE
    story.append(Spacer(1, 120))
    story.append(Paragraph("CLINOMA PLATFORM", ParagraphStyle('ClinomaEng', parent=meta_style, fontName='ComicFont-Bold', fontSize=15, spaceAfter=40)))
    story.append(Paragraph("MATCHING ASSESSMENT", title_style))
    
    sub_text = "Day 2 Pediatrics Quiz Booklet" if not is_answered_version else "Day 2 Pediatrics Quiz Answers Key"
    story.append(Paragraph(sub_text, subtitle_style))
    story.append(Spacer(1, 60))
    story.append(Paragraph("Interactive Diagnosis & Classification", meta_style))
    story.append(Paragraph("Prepared by: Clinoma Platform Team", meta_style))
    
    d_line = Table([[""]], colWidths=[150], rowHeights=[2])
    d_line.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F59E0B"))]))
    story.append(Spacer(1, 10))
    story.append(d_line)

    story.append(NextPageTemplate('ContentPage'))
    story.append(PageBreak())

    matching_sets = parse_matching_sets_day2()
    answer_keys = []

    # 2. MATCHING SETS CONTENT
    for s_idx, m_set in enumerate(matching_sets):
        elements = []
        elements.append(Paragraph(m_set["title"], set_title_style))
        
        # Prepare matching items
        qs = [p["q"] for p in m_set["pairs"]]
        ans = [p["a"] for p in m_set["pairs"]]
        
        # Shuffle answers
        ans_shuffled = ans.copy()
        random.seed(s_idx + 42) # Keep shuffling reproducible
        random.shuffle(ans_shuffled)
        
        # Map original answer indices to choices A, B, C...
        ans_map = {}
        for idx, a_val in enumerate(ans_shuffled):
            choice_letter = chr(65 + idx) # A, B, C, D...
            ans_map[a_val] = choice_letter
            
        # Determine correct answers for this set
        set_answers = []
        for q_idx, p in enumerate(m_set["pairs"]):
            correct_letter = ans_map[p["a"]]
            set_answers.append(f"{q_idx+1} ➔ {correct_letter}")
        answer_keys.append(f"<b>{m_set['title'].split(':')[0]}</b>: " + ", ".join(set_answers))

        # Build Side-by-Side Matching Table
        table_data = []
        
        # Table Header
        table_data.append([
            Paragraph("<b>Column I (Questions)</b>", cell_bold_style),
            Paragraph("<b>[ Match ]</b>", cell_bold_style),
            Paragraph("<b>Column II (Answers)</b>", cell_bold_style)
        ])
        
        max_rows = max(len(qs), len(ans_shuffled))
        for idx in range(max_rows):
            q_paragraph = Paragraph(f"<b>{idx+1}.</b> {qs[idx]}" if idx < len(qs) else "", cell_style)
            
            # Answer Box content
            if idx < len(qs):
                if is_answered_version:
                    # Write correct letter in bold color
                    correct_val = m_set["pairs"][idx]["a"]
                    correct_choice = ans_map[correct_val]
                    box_content = f"[ &nbsp;<b><font color='#0D9488'>{correct_choice}</font></b>&nbsp; ]"
                else:
                    box_content = "[ &nbsp; &nbsp; &nbsp; ]"
            else:
                box_content = ""
                
            box_paragraph = Paragraph(box_content, cell_center_style)
            
            choice_letter = chr(65 + idx)
            a_paragraph = Paragraph(f"<b>{choice_letter}.</b> {ans_shuffled[idx]}" if idx < len(ans_shuffled) else "", cell_style)
            
            table_data.append([q_paragraph, box_paragraph, a_paragraph])
            
        col_w1 = 170
        col_w2 = 60
        col_w3 = PAGE_WIDTH - 72 - col_w1 - col_w2
        
        t = Table(table_data, colWidths=[col_w1, col_w2, col_w3])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F8FAFC")),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        
        elements.append(t)
        elements.append(Spacer(1, 10))
        
        story.append(KeepTogether(elements))
        
        if (s_idx + 1) % 2 == 0 and s_idx < len(matching_sets) - 1:
            story.append(PageBreak())

    # 3. ANSWER KEY PAGE (Only for answered version)
    if is_answered_version:
        story.append(PageBreak())
        story.append(Spacer(1, 10))
        story.append(Paragraph("QUIZ ANSWER KEY (إجابات اختبار التوصيل)", ParagraphStyle('AnsKeyTitle', parent=set_title_style, fontSize=16, leading=20, textColor=colors.HexColor("#0D9488"))))
        story.append(Spacer(1, 15))
        
        ans_elements = []
        for key_str in answer_keys:
            ans_elements.append(Paragraph(key_str, ParagraphStyle('KeyLine', parent=cell_style, fontSize=9.5, leading=14, spaceAfter=8)))
            
        ans_container = Table([[ans_elements]], colWidths=[PAGE_WIDTH - 90])
        ans_container.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDFA")),
            ('LEFTPADDING', (0,0), (-1,-1), 15),
            ('RIGHTPADDING', (0,0), (-1,-1), 15),
            ('TOPPADDING', (0,0), (-1,-1), 15),
            ('BOTTOMPADDING', (0,0), (-1,-1), 15),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#0D9488")),
        ]))
        story.append(ans_container)

    doc.build(story, canvasmaker=QuizCanvas)

if __name__ == "__main__":
    import sys
    output_q = "d:/Med Prep/معسكر_الورقة_الأولى_اليوم_الثاني_كويز.pdf"
    output_a = "d:/Med Prep/معسكر_الورقة_الأولى_اليوم_الثاني_كويز_إجابات.pdf"
    
    student_name = "Student Name"
    student_email = "student@email.com"
    
    if len(sys.argv) > 1:
        student_name = sys.argv[1]
    if len(sys.argv) > 2:
        student_email = sys.argv[2]
    if len(sys.argv) > 3:
        output_q = sys.argv[3]
    if len(sys.argv) > 4:
        output_a = sys.argv[4]
        
    print("Generating Matching Quiz Day 2 (Questions)...")
    build_quiz_pdf(output_q, is_answered_version=False, student_name=student_name, student_email=student_email)
    print("Generating Matching Quiz Day 2 (Answers)...")
    build_quiz_pdf(output_a, is_answered_version=True, student_name=student_name, student_email=student_email)
    print("Matching Quiz Day 2 booklets generated successfully.")
