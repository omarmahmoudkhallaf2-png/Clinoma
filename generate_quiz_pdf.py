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
        student_name = getattr(self, 'student_name', "Mohamed Ahmed")
        student_email = getattr(self, 'student_email', "mohamed.ahmed@gmail.com")
        
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

def parse_matching_sets():
    """Returns the structured matching sets for Day 1 matching quiz."""
    return [
        {
            "id": "1",
            "title": "Set 1: Growth Curves Types (منحنيات النمو)",
            "pairs": [
                {"q": "Percentile Curves", "a": 'Consists of: "Length-for-age," "Weight-for-age," "Stature-for-age," BMI-for-age, Head circumference-for-age, and Weight-for-length'},
                {"q": "Standard Deviation Curves", "a": "Shows how much variation or 'dispersion' there is from the average (mean)"},
                {"q": "Velocity Curves", "a": "Considers the change (increment) in growth over time from year to year"},
                {"q": "Conditional Centiles", "a": "Centiles in which reference data are conditional on or adjusted for some specific factor over or above age and sex"}
            ]
        },
        {
            "id": "2",
            "title": "Set 2: Neurodevelopmental Milestones (عمر التطور العصبي)",
            "pairs": [
                {"q": "Walks alone or with one hand", "a": "12 months"},
                {"q": "Moro reflexes disappear", "a": "4 months"},
                {"q": "Jumps", "a": "3 years"},
                {"q": "Smile socially", "a": "2 months"},
                {"q": "Coos", "a": "3 months"},
                {"q": "Sit without support", "a": "7 months"},
                {"q": "Walks up stairs, feeds self", "a": "18 months"},
                {"q": "Head support", "a": "3 months"}
            ]
        },
        {
            "id": "3",
            "title": "Set 3: Developmental Warning Signs (علامات الخطورة في النمو)",
            "pairs": [
                {"q": "No Clear Spoken Words", "a": "by 18 months"},
                {"q": "Problems with Social Interaction", "a": "at 3 years"},
                {"q": "Persistence of Primitive Reflexes", "a": "> 6 months"},
                {"q": "No Two-Word Sentences", "a": "by 2 years"},
                {"q": "Not Walking", "a": "by 18 months"},
                {"q": "No Response to Environment or Parent", "a": "by 12 months"}
            ]
        },
        {
            "id": "4",
            "title": "Set 4: Breastfeeding & Contraindications (الرضاعة الطبيعية)",
            "pairs": [
                {"q": "Lactoferrin", "a": "An iron-binding protein that prevents iron uptake by organisms, causing a bacteriostatic effect."},
                {"q": "Bifidus factor", "a": "Stimulates lactic acid production, changing intestinal pH to become unsuitable for pathogenic organisms."},
                {"q": "Galactosemia", "a": "An absolute infant contraindication for breastfeeding."},
                {"q": "Acute mastitis", "a": "A relative maternal contraindication that requires regular breast evacuation until recovery."}
            ]
        },
        {
            "id": "5",
            "title": "Set 5: Malnutrition Symptoms & Causes (أعراض وأسباب سوء التغذية)",
            "pairs": [
                {"q": "Pitting oedema", "a": "Causes: decreased plasma proteins, increased plasma aldosterone/ADH, oxidative stress."},
                {"q": "Mental changes", "a": "Caused by deficient amino acids and trace elements Cu, Mg, Zn."},
                {"q": "Skin changes", "a": "Deficiency of essential fatty acids, amino acids, Vit A, Zn."},
                {"q": "Abdominal distension", "a": "hypokalemia/toxic ileus."},
                {"q": "Loss of subcutaneous fat", "a": "First abdomen, then limbs, finally buccal pad of fat (→ senile face)."}
            ]
        },
        {
            "id": "6",
            "title": "Set 6: Refractory Rickets & Genetics (الكساح المقاوم للفيتامينات)",
            "pairs": [
                {"q": "Primary Hypophosphatemic Rickets", "a": "X-linked dominant, defect in phosphate reabsorption & Vit D conversion."},
                {"q": "Vitamin D Dependent Rickets Type I", "a": "Autosomal recessive, renal 1α hydroxylase defect."},
                {"q": "Vitamin D Dependent Rickets Type II", "a": "Autosomal recessive, target organ resistance."},
                {"q": "Lowe Syndrome (Oculo-Cerebrorenal)", "a": "X-linked recessive."},
                {"q": "Hypophosphatasia", "a": "Autosomal recessive, marked deficiency of alkaline phosphatase."}
            ]
        },
        {
            "id": "7",
            "title": "Set 7: Cow's Milk Allergy - CMA (حساسية ألبان الأبقار)",
            "pairs": [
                {"q": "IgE-mediated CMA", "a": "Immediate reactions (minutes to 2 hours), mediated by IgE antibodies."},
                {"q": "Non-IgE-mediated CMA", "a": "Delayed reactions (hours to days), driven by cell-mediated response."},
                {"q": "Skin Prick Test (SPT)", "a": "Identifies IgE-mediated CMA; positive points to allergy."},
                {"q": "Elimination Diet", "a": "Complete removal for 2-4 weeks; clinical improvement supports diagnosis."},
                {"q": "Oral Food Challenge", "a": "Strict medical supervision; contraindicated in severe anaphylaxis."}
            ]
        },
        {
            "id": "8",
            "title": "Set 8: Vomiting & Regurgitation Definitions (مصطلحات القيء)",
            "pairs": [
                {"q": "Nausea", "a": "An unpleasant sensation of the imminent need to vomit, usually referred to the throat or epigastrium."},
                {"q": "Vomiting", "a": "Forceful oral expulsion of gastric contents associated with the contraction of the abdominal/chest wall musculature."},
                {"q": "Regurgitation", "a": "The act by which food is brought back into the mouth without abdominal/diaphragmatic muscular activity."}
            ]
        },
        {
            "id": "9",
            "title": "Set 9: Down vs. Turner Syndromes (متلازمات الكروموسومات)",
            "pairs": [
                {"q": "Turner Syndrome: Intrauterine", "a": "May be presented with polyhydramnios and lung hypoplasia."},
                {"q": "Turner Syndrome: Neonatal", "a": "May be presented with lymphedema of hands/feet, low posterior hair line & cystic hygroma."},
                {"q": "Down Syndrome: Dysmorphic Features", "a": "Upward slanting palpebral fissures, Epicanthus and Burchfield spots of iris."},
                {"q": "Turner Syndrome: Childhood", "a": "Intelligence usually normal, short stature, short webbed neck, wide carrying angle at elbows."},
                {"q": "Down Syndrome: Orthopedics Affection", "a": "Short fingers, curved 5th finger, transverse palmar crease, wide gap between 1st/2nd toes."}
            ]
        },
        {
            "id": "10",
            "title": "Set 10: Prenatal screening Results (الفحص قبل الولادة)",
            "pairs": [
                {"q": "Open neural tube defect", "a": "AFP Increased, HCG Not applicable"},
                {"q": "Down syndrome", "a": "AFP Decreased, HCG Increased"},
                {"q": "Turner syndrome", "a": "AFP Normal/Decreased, HCG Increased"},
                {"q": "Edward syndrome", "a": "AFP Decreased, HCG Decreased"}
            ]
        },
        {
            "id": "11",
            "title": "Set 11: Invasive Screening Tests timing & mechanism (الفحوصات التداخلية)",
            "pairs": [
                {"q": "Chorionic villus sampling", "a": "Can be done at about 10-11 weeks, either transvaginal or transabdominally."},
                {"q": "Amniocentesis", "a": "Can be done at 16-18/20 weeks, transabdominally."},
                {"q": "Fetal blood sampling", "a": "Blood is taken from the umbilical vein at the placental insertion."},
                {"q": "Fetoscopy", "a": "Direct access to fetus via percutaneous introduction of fiberoptic telescope in amniotic cavity."}
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
    
    sub_text = "Day 1 Pediatrics Quiz Booklet" if not is_answered_version else "Day 1 Pediatrics Quiz Answers Key"
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

    matching_sets = parse_matching_sets()
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
    output_q = "d:/Med Prep/معسكر_الورقة_الأولى_اليوم_الأول_كويز.pdf"
    output_a = "d:/Med Prep/معسكر_الورقة_الأولى_اليوم_الأول_كويز_إجابات.pdf"
    
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
        
    print("Generating Matching Quiz (Questions)...")
    build_quiz_pdf(output_q, is_answered_version=False, student_name=student_name, student_email=student_email)
    print("Generating Matching Quiz (Answers)...")
    build_quiz_pdf(output_a, is_answered_version=True, student_name=student_name, student_email=student_email)
    print("Matching Quiz booklets generated successfully.")
