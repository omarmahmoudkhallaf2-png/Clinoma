import os
import sys
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

# Register Comic Sans MS font for cartoon style
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
            self.setStrokeColor(colors.HexColor("#1E293B")) # Dark Slate
            self.setLineWidth(2)
            self.rect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40)
            
            self.setStrokeColor(colors.HexColor("#475569")) # Slate Gray
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
        
        self.setFillColor(colors.HexColor("#F8FAFC")) # Very light grey/blue
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.roundRect(margin + 5, header_y, box_w, box_h, 3, fill=True, stroke=True)
        self.roundRect(PAGE_WIDTH - margin - box_w - 5, header_y, box_w, box_h, 3, fill=True, stroke=True)
        
        self.setFont("ComicFont-Bold", 7.5)
        self.setFillColor(colors.HexColor("#334155"))
        self.drawString(margin + 10, header_y + 3.5, "USER:")
        self.setFont("ComicFont", 7.5)
        self.setFillColor(colors.HexColor("#0F172A"))
        self.drawString(margin + 42, header_y + 3.5, student_name)
        
        self.setFont("ComicFont-Bold", 7.5)
        self.setFillColor(colors.HexColor("#334155"))
        self.drawString(PAGE_WIDTH - margin - box_w + 10, header_y + 3.5, "EMAIL:")
        self.setFont("ComicFont", 7.5)
        self.setFillColor(colors.HexColor("#0F172A"))
        self.drawString(PAGE_WIDTH - margin - box_w + 45, header_y + 3.5, student_email)
        
        self.setFont("ComicFont-Bold", 6.5)
        self.setFillColor(colors.HexColor("#94A3B8"))
        self.drawCentredString(PAGE_WIDTH / 2, header_y + 3.5, "SECURED DIGITAL EDITION • CLINOMA SECOND PAPER CAMP")
        
        # Footer
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(20, 42, PAGE_WIDTH - 20, 42)
        
        footer_text = "CLINOMA PLATFORM • ALL RIGHTS RESERVED. UNAUTHORISED SHARING PROHIBITED."
        self.drawString(30, 28, footer_text)
        
        page_str = f"Page {page_num} of {total_pages}"
        self.drawRightString(PAGE_WIDTH - 30, 28, page_str)
        
        self.restoreState()

MATCHING_SETS = [
    {
        "id": "set1",
        "title": "Group 1: Clinical Presentations & Definitions (Nephrology)",
        "options": [
            {"l": "A", "t": "Cystitis (UTI)"},
            {"l": "B", "t": "Stage 2 \"Injury\" (pRIFLE Criteria - AKI)"},
            {"l": "C", "t": "Nephrotic Syndrome (MCNS)"},
            {"l": "D", "t": "Chronic Kidney Disease (CKD)"},
            {"l": "E", "t": "Acute Post-Streptococcal Glomerulonephritis (APSGN)"}
        ],
        "questions": [
            "An 8-year-old child presenting with cola-colored urine, mild to moderate edema, and hypertension 1–2 weeks after an episode of pharyngitis.",
            "A pediatric patient presenting with frothy urine, massive generalized edema (anasarca), hypoalbuminemia (<2.5 g/dL), and severe hyperlipidemia (>250 mg/dL).",
            "Persistent abnormalities of kidney structure or function for >3 months, OR a persistent decrease in GFR <60 mL/min/1.73m² for >3 months.",
            "A rapid decline in GFR staged as Stage 2 \"Injury\" based on pRIFLE criteria, where GFR decreases by 50% or urine output is <0.5 mL/kg/h for 16 hours.",
            "A young girl presenting with dysuria, urgency, frequency, and malodorous urine, characterized strictly by \"NO FEVER and NO RENAL INJURY\"."
        ],
        "answers": ["E", "C", "D", "B", "A"]
    },
    {
        "id": "set2",
        "title": "Group 2: Diagnostics, Pathology & Imaging (Nephrology)",
        "options": [
            {"l": "A", "t": "Minimal Change Disease (MCNS)"},
            {"l": "B", "t": "DNase B Antibody Titer"},
            {"l": "C", "t": "Voiding Cystourethrogram (VCUG)"},
            {"l": "D", "t": "APSGN Histopathology"},
            {"l": "E", "t": "DMSA Renal Scanning"}
        ],
        "questions": [
            "Immunofluorescence pathology showing characteristic \"Lumpy bumpy deposits of immunoglobulin and complement on the GBM\".",
            "Electron microscopy demonstrating \"Effacement of epithelial cell foot processes\" in a child with suspected Minimal Change Disease (MCNS).",
            "The rising antibody titer that serves as the \"best tool for cutaneous (skin) streptococcal evidence\" evaluation.",
            "A nuclear imaging modality designated as \"useful if acute pyelonephritis is uncertain or to assess SCARRING\".",
            "A contrast imaging study indicated in \"ALL children <5 years old with a febrile UTI\" to screen for Vesicoureteral Reflux (VUR)."
        ],
        "answers": ["D", "A", "B", "E", "C"]
    },
    {
        "id": "set3",
        "title": "Group 3: Treatment, Management & Lab Differentiation (Nephrology)",
        "options": [
            {"l": "A", "t": "Intrinsic Renal AKI Differential Diagnostic Profile"},
            {"l": "B", "t": "Management of Proteinuria & Hypertension in CKD"},
            {"l": "C", "t": "Pre-Renal AKI Differential Diagnostic Profile"},
            {"l": "D", "t": "Supportive Treatment in Nephrotic Syndrome"},
            {"l": "E", "t": "Specific Measures in APSGN Management"}
        ],
        "questions": [
            "Administration of IV 25% Human Albumin (0.5 g/kg) with Furosemide, indicated for massive anasarca causing respiratory distress or hypovolemic shock.",
            "A 10-day course of oral penicillin to eradicate active streptococci, noting that it \"does not alter the GN natural history\".",
            "Long-term administration of ACE inhibitors (such as enalapril or lisinopril) specifically indicated for managing proteinuria and hypertension.",
            "A diagnostic lab profile showing: Urine Specific Gravity >1020, Osmolality >500, UNa <20 mEq/L, and FENa <1%.",
            "A diagnostic lab profile showing: Urine Specific Gravity <1010, Osmolality <350, UNa >40 mEq/L, and FENa >2%."
        ],
        "answers": ["D", "E", "B", "C", "A"]
    },
    {
        "id": "set4",
        "title": "Group 4: Neonatal Jaundice & Bilirubin Toxicity (Neonatology)",
        "options": [
            {"l": "A", "t": "Phase 2 of Acute Bilirubin Encephalopathy"},
            {"l": "B", "t": "Chronic Bilirubin Encephalopathy (Kernicterus)"},
            {"l": "C", "t": "Pathological Jaundice"},
            {"l": "D", "t": "Phase 1 of Acute Bilirubin Encephalopathy"},
            {"l": "E", "t": "Physiological Jaundice"}
        ],
        "questions": [
            "Jaundice appearing within the first 24 hours of life, with a Total Serum Bilirubin (TSB) rise > 5 mg/dL/day or conjugated bilirubin > 2 mg/dL.",
            "Jaundice appearing after 24 hours of life (typically day 2–3), peaking on day 4–5, and resolving spontaneously within 10–14 days.",
            "The initial phase of Acute Bilirubin Encephalopathy (ABE) characterized clinically by lethargy, hypotonia, and a poor suck reflex.",
            "The intermediate phase of ABE characterized by irritability, hypertonia, a high-pitched cry, retrocollis, and opisthotonos.",
            "Chronic permanent clinical sequelae of bilirubin toxicity presenting with athetoid cerebral palsy, sensorineural hearing loss, and dental enamel dysplasia."
        ],
        "answers": ["C", "E", "D", "A", "B"]
    },
    {
        "id": "set5",
        "title": "Group 5: Neonatal Sepsis & Complications of Prematurity (Neonatology)",
        "options": [
            {"l": "A", "t": "Late-Onset Sepsis (LOS)"},
            {"l": "B", "t": "Respiratory Distress Syndrome (RDS)"},
            {"l": "C", "t": "Patent Ductus Arteriosus (PDA)"},
            {"l": "D", "t": "Early-Onset Sepsis (EOS)"},
            {"l": "E", "t": "Necrotizing Enterocolitis (NEC)"}
        ],
        "questions": [
            "Infection manifesting within < 72 hours of birth, typically associated with maternal risk factors and vertical transmission of GBS or E. coli.",
            "Infection manifesting > 72 hours after birth, typically nosocomial (hospital-acquired) or community-acquired, commonly caused by CoNS or S. aureus.",
            "A prematurity complication due to surfactant deficiency, presenting with grunting, tachypnea, and a classic \"ground-glass\" opacity on chest X-ray.",
            "A severe gastrointestinal complication in preterm infants presenting with abdominal distension, bloody stools, and \"pneumatosis intestinalis\" on X-ray.",
            "A cardiovascular complication of prematurity where incomplete closure of the shunt causes a continuous machine-like murmur and bounding pulses."
        ],
        "answers": ["D", "A", "B", "E", "C"]
    },
    {
        "id": "set6",
        "title": "Group 6: Transient Cutaneous Lesions of the Newborn (Neonatology)",
        "options": [
            {"l": "A", "t": "Erythema Toxicum Neonatorum"},
            {"l": "B", "t": "Neonatal Acne (Cephalic Pustulosis)"},
            {"l": "C", "t": "Milia"},
            {"l": "D", "t": "Seborrheic Dermatitis"},
            {"l": "E", "t": "Mongolian Spots (Congenital Dermal Melanocytosis)"}
        ],
        "questions": [
            "Tiny, 1–2 mm pearly white or yellowish keratin-filled cysts commonly clustered over the nose, chin, and forehead, resolving within weeks.",
            "A benign rash appearing on day 2–3 of life as erythematous macules and papules containing central pustules filled predominantly with eosinophils.",
            "Flat, blue-gray melanocytic macules or patches typically located over the lumbosacral region, common in darker-skinned infants, and fade with time.",
            "Inflammatory comedones, papules, and pustules appearing around 2–3 weeks of life primarily on the face, induced by maternal androgens.",
            "Blotchy erythematous patches with fine scaling often found on the scalp, eyebrows, and behind ears, commonly called \"cradle cap\"."
        ],
        "answers": ["C", "A", "E", "B", "D"]
    }
]

def build_quiz_pdf(output_filename, is_answered_version=False, student_name="Student Name", student_email="student@email.com"):
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
        canvas.setStrokeColor(colors.HexColor("#1E293B"))
        canvas.setLineWidth(2)
        canvas.rect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40)
        canvas.setStrokeColor(colors.HexColor("#475569"))
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
        fontSize=26,
        leading=34,
        textColor=colors.HexColor("#0F172A"),
        alignment=1,
        spaceAfter=15
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=15,
        leading=21,
        textColor=colors.HexColor("#475569"),
        alignment=1,
        spaceAfter=30
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='ComicFont',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#475569"),
        alignment=1,
        spaceAfter=8
    )

    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=12,
        spaceAfter=8,
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
    story.append(Spacer(1, 100))
    story.append(Paragraph("CLINOMA PLATFORM", ParagraphStyle('ClinomaEng', parent=meta_style, fontName='ComicFont-Bold', fontSize=14, spaceAfter=40)))
    story.append(Paragraph("Second Paper Camp — Day 2", title_style))
    
    sub_text = "Pediatrics Matching Quiz (Student Copy)" if not is_answered_version else "Pediatrics Matching Quiz (Answer Key Edition)"
    story.append(Paragraph(sub_text, subtitle_style))
    story.append(Spacer(1, 40))
    story.append(Paragraph("Topics: Nephrology • Neonatology", meta_style))
    story.append(Paragraph("Duration: 30 Minutes • Total Questions: 30 (6 Matching Sets)", meta_style))
    story.append(Paragraph("Prepared by: Clinoma Platform Team", meta_style))
    
    d_line = Table([[""]], colWidths=[150], rowHeights=[2])
    d_line.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#475569"))]))
    story.append(Spacer(1, 15))
    story.append(d_line)

    story.append(NextPageTemplate('ContentPage'))
    story.append(PageBreak())

    # 2. MATCHING SETS
    story.append(Paragraph("Interactive Matching Sets Examination", section_title_style))
    story.append(Spacer(1, 5))

    for set_idx, mset in enumerate(MATCHING_SETS):
        set_elements = []
        set_title = f"<b>{mset['title']}</b>"
        set_elements.append(Paragraph(set_title, cell_bold_style))
        set_elements.append(Spacer(1, 4))

        # Options grid
        opts_data = []
        opts = mset["options"]
        for i in range(0, len(opts), 2):
            col1_opt = opts[i]
            col1_text = f"<b>{col1_opt['l']}.</b> {col1_opt['t']}"
            col2_text = ""
            if i + 1 < len(opts):
                col2_opt = opts[i+1]
                col2_text = f"<b>{col2_opt['l']}.</b> {col2_opt['t']}"
            opts_data.append([Paragraph(col1_text, cell_style), Paragraph(col2_text, cell_style)])

        opts_table = Table(opts_data, colWidths=[240, 240])
        opts_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        set_elements.append(opts_table)
        set_elements.append(Spacer(1, 5))

        # Questions Table
        table_data = []
        table_data.append([
            Paragraph("<b>Clinical Description / Scenario</b>", cell_bold_style),
            Paragraph("<b>[ Match ]</b>", cell_bold_style)
        ])

        for q_idx, q_text in enumerate(mset["questions"]):
            desc_para = Paragraph(f"<b>{q_idx+1}.</b> {q_text}", cell_style)
            
            if is_answered_version:
                correct_choice = mset["answers"][q_idx]
                box_content = f"[ &nbsp;<b><font color='#0F766E'>{correct_choice}</font></b>&nbsp; ]"
            else:
                box_content = "[ &nbsp; &nbsp; &nbsp; ]"
                
            box_para = Paragraph(box_content, cell_center_style)
            table_data.append([desc_para, box_para])

        set_table = Table(table_data, colWidths=[400, 80])
        set_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        set_elements.append(set_table)
        set_elements.append(Spacer(1, 12))
        
        story.append(KeepTogether(set_elements))

    doc.build(story, canvasmaker=QuizCanvas)

if __name__ == "__main__":
    output_dir = "F:/Med Prep/client/public"
    os.makedirs(output_dir, exist_ok=True)
    
    output_q = os.path.join(output_dir, "معسكر_الورقة_الثانية_اليوم_الثاني_كويز.pdf")
    output_a = os.path.join(output_dir, "معسكر_الورقة_الثانية_اليوم_الثاني_كويز_إجابات.pdf")
    
    print("Generating Student Copy for Day 2...")
    build_quiz_pdf(output_q, is_answered_version=False)
    
    print("Generating Answer Key Edition for Day 2...")
    build_quiz_pdf(output_a, is_answered_version=True)
    
    print("PDF generation completed successfully.")
