import os
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

CUSTOM_WIDTH = 841.89
CUSTOM_HEIGHT = 497.28
CUSTOM_PAGE_SIZE = (CUSTOM_WIDTH, CUSTOM_HEIGHT)

class UltraSleekSecurityCanvas(canvas.Canvas):
    """
    An ultra-premium, highly space-optimized security canvas.
    Handles cover pages, separator pages, index pages, and applies security borders/pill-boxes on content pages.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_elements(num_pages)
            super().showPage()
        super().save()

    def draw_dotted_grid(self, width, height, dot_color, spacing=20):
        self.setFillColor(colors.HexColor(dot_color))
        for x in range(0, int(width), spacing):
            for y in range(0, int(height), spacing):
                self.circle(x, y, 0.75, fill=True, stroke=False)

    def draw_page_background(self, p):
        width, height = CUSTOM_PAGE_SIZE
        is_chapter_page = getattr(self, '_is_chapter_page', False)
        
        self.saveState()
        
        if p == 1:
            # COVER PAGE BACKGROUND
            self.setFillColor(colors.HexColor("#F1F5F9"))
            self.rect(0, 0, width, height, fill=True, stroke=False)
            self.draw_dotted_grid(width, height, "#CBD5E1", spacing=20)
            
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(30, 30, 30, height - 30)
            self.line(30, 30, width - 30, 30)
            self.line(width - 30, 30, width - 30, height - 30)
            self.line(30, height - 30, width - 30, height - 30)
            
            self.setStrokeColor(colors.HexColor("#94A3B8"))
            self.setLineWidth(1.0)
            self.rect(15, 15, width - 30, height - 30)
            
            # Corner Accent Blocks
            self.setFillColor(colors.HexColor("#0F172A"))
            self.rect(15, height - 30, 40, 15, fill=True, stroke=False)
            self.setFillColor(colors.HexColor("#F59E0B"))
            self.rect(55, height - 30, 15, 15, fill=True, stroke=False)
            
            self.setFillColor(colors.HexColor("#0F172A"))
            self.rect(width - 55, 15, 40, 15, fill=True, stroke=False)
            self.setFillColor(colors.HexColor("#F59E0B"))
            self.rect(width - 70, 15, 15, 15, fill=True, stroke=False)
            
        elif p == 2:
            # INDEX PAGE BACKGROUND
            self.setFillColor(colors.HexColor("#F8FAFC"))
            self.rect(0, 0, width, height, fill=True, stroke=False)
            self.draw_dotted_grid(width, height, "#E2E8F0", spacing=20)
            
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.8)
            self.rect(15, 15, width - 30, height - 30)
            
            self.setStrokeColor(colors.HexColor("#94A3B8"))
            self.setLineWidth(1.2)
            self.rect(18, 18, width - 36, height - 36)
            
            self.setFillColor(colors.HexColor("#0F172A"))
            self.rect(18, height - 30, 45, 12, fill=True, stroke=False)
            self.setFillColor(colors.HexColor("#F59E0B"))
            self.rect(63, height - 30, 10, 12, fill=True, stroke=False)
            
        elif is_chapter_page:
            # CHAPTER COVER PAGE BACKGROUND
            self.setFillColor(colors.HexColor("#0F172A"))
            self.rect(0, 0, width, height, fill=True, stroke=False)
            self.draw_dotted_grid(width, height, "#334155", spacing=24)
            
            self.setFillColor(colors.HexColor("#F59E0B"))
            self.rect(0, 0, 10, height, fill=True, stroke=False)
            
            self.setStrokeColor(colors.HexColor("#1E293B"))
            self.setLineWidth(1.0)
            self.rect(20, 20, width - 40, height - 40)
            
            # Decorative scientific circles and elements behind text
            self.setStrokeColor(colors.HexColor("#1E293B"))
            self.setLineWidth(0.75)
            self.circle(width / 2, height / 2 - 10, 140, stroke=True, fill=False)
            self.circle(width / 2, height / 2 - 10, 145, stroke=True, fill=False)
            
            # Subtly draw some corner crosshairs/accents inside the main border
            self.setStrokeColor(colors.HexColor("#475569"))
            self.setLineWidth(0.8)
            # Top-left corner crosshairs
            self.line(30, height - 30, 45, height - 30)
            self.line(30, height - 30, 30, height - 45)
            # Top-right
            self.line(width - 30, height - 30, width - 45, height - 30)
            self.line(width - 30, height - 30, width - 30, height - 45)
            # Bottom-left
            self.line(30, 30, 45, 30)
            self.line(30, 30, 30, 45)
            # Bottom-right
            self.line(width - 30, 30, width - 45, 30)
            self.line(width - 30, 30, width - 30, 45)
            
        self.restoreState()

    def draw_page_elements(self, page_count):
        is_chapter_page = getattr(self, '_is_chapter_page', False)
        chapter_name = getattr(self, '_current_chapter', "تحديدات الأطفال")
        p = self._pageNumber
        
        self.saveState()
        width, height = CUSTOM_PAGE_SIZE
        
        student_name = getattr(self, '_student_name', "Mohamed Ahmed")
        student_email = getattr(self, '_student_email', "mohamed.ahmed@gmail.com")
        
        if p == 1:
            # COVER PAGE FOREGROUND (Text on Cover)
            self.setFont("Helvetica-Bold", 10)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawCentredString(width / 2, height - 75, "C  L  I  N  O  M  A     P  L  A  T  F  O  R  M")
            
            self.setFont("Helvetica-Bold", 44)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.drawCentredString(width / 2, height / 2 + 25, "PEDIATRICS")
            
            self.setStrokeColor(colors.HexColor("#F59E0B"))
            self.setLineWidth(2.0)
            self.line(width / 2 - 120, height / 2 + 10, width / 2 + 120, height / 2 + 10)
            
            self.setFont("Helvetica", 14)
            self.setFillColor(colors.HexColor("#475569"))
            self.drawCentredString(width / 2, height / 2 - 20, "F L A S H S P A C E   E D I T I O N")
            
            self.setFont("Helvetica-Oblique", 9)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawCentredString(width / 2, height / 2 - 40, "Interactive High-Yield Visual Highlights & Explanations")
            
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(colors.HexColor("#475569"))
            self.drawCentredString(width / 2, 70, "EXCLUSIVE DIGITAL STUDY GUIDE")
            
            self.setFont("Helvetica", 7)
            self.setFillColor(colors.HexColor("#94A3B8"))
            self.drawCentredString(width / 2, 55, "This document is digitally watermarked and registered for personal academic use only.")
            
        elif p == 2:
            # INDEX PAGE FOREGROUND (Header info)
            self.setFont("Helvetica-Bold", 10)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(80, height - 28, "CLINOMA • PEDIATRICS INDEX")
            self.drawRightString(width - 25, height - 28, "FLAShspace Study Guide")
            
        elif is_chapter_page:
            # CHAPTER COVER FOREGROUND - nothing needed in 2nd pass as text is drawn from story flowables
            pass
            
        else:
            # CONTENT PAGE WITH SLIDE AND SECURITY PILL-BOXES
            margin = 12
            self.setStrokeColor(colors.HexColor("#94A3B8"))
            self.setLineWidth(1.0)
            
            content_x = margin
            content_y = margin + 14
            content_w = width - (2 * margin)
            content_h = height - (2 * margin) - 23
            
            self.rect(content_x, content_y, content_w, content_h)
            
            # Header Security Pill Boxes
            header_y = height - margin - 17
            box_h = 13
            box_w = 200
            
            # Left Security Box
            self.setFillColor(colors.HexColor("#F0F9FF"))
            self.setStrokeColor(colors.HexColor("#bae6fd"))
            self.setLineWidth(0.5)
            self.roundRect(margin + 5, header_y, box_w, box_h, 3, fill=True, stroke=True)
            
            # Right Security Box
            self.roundRect(width - margin - box_w - 5, header_y, box_w, box_h, 3, fill=True, stroke=True)
            
            # Text inside boxes
            self.setFont("Helvetica-Bold", 7)
            self.setFillColor(colors.HexColor("#0369A1"))
            self.drawString(margin + 10, header_y + 3.5, "USER:")
            self.setFont("Helvetica", 7)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.drawString(margin + 42, header_y + 3.5, student_name)
            
            self.setFont("Helvetica-Bold", 7)
            self.setFillColor(colors.HexColor("#0369A1"))
            self.drawString(width - margin - box_w + 10, header_y + 3.5, "EMAIL:")
            self.setFont("Helvetica", 7)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.drawString(width - margin - box_w + 45, header_y + 3.5, student_email)
            
            self.setFont("Helvetica-Bold", 6)
            self.setFillColor(colors.HexColor("#94A3B8"))
            self.drawCentredString(width / 2, header_y + 3.5, "SECURED DIGITAL EDITION • CLINOMA PLATFORM")
            
            # Footer
            footer_y = margin + 4
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(margin + 8, footer_y, f"SECTION: {chapter_name.upper()}")
            
            page_str = f"Page {p} of {page_count}"
            self.drawRightString(width - margin - 8, footer_y, page_str)
            
        self.restoreState()


def build_pdf(filename="تحديدات_الأطفال_تجميعي.pdf", compress=False, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com"):
    # Primary look in public source folder, fallback to dist compiled assets
    arabic_dir = u"d:/Med Prep/client/public/assets/TIP-Peditrics/\u062a\u062d\u062f\u064a\u062f\u0627\u062a \u0627\u0644\u0627\u0637\u0641\u0627\u0644"
    english_dir = "d:/Med Prep/client/public/assets/TIP-Peditrics"
    
    if not os.path.exists(arabic_dir):
        arabic_dir = u"d:/Med Prep/client/dist/assets/TIP-Peditrics/\u062a\u062d\u062f\u064a\u062f\u0627\u062a \u0627\u0644\u0627\u0637\u0641\u0627\u0644"
        english_dir = "d:/Med Prep/client/dist/assets/TIP-Peditrics"
    
    temp_compressed_dir = "d:/Med Prep/temp_compressed_hq"
    if not os.path.exists(temp_compressed_dir):
        os.makedirs(temp_compressed_dir)
        
    def get_maybe_compressed_image(img_path):
        if not os.path.exists(img_path):
            return img_path
        
        # Optimize to stay under Cloudflare Pages' strict 25MB file size limit!
        # If compress=True, use quality=74 and max_width=1920 (~16MB PDF).
        # Otherwise, use quality=82 and max_width=2048 (~23.5MB PDF).
        quality_val = 74 if compress else 82
        max_width = 1920 if compress else 2048
        
        base_name = os.path.basename(img_path)
        # Prefix with parent directory name to prevent collisions
        parent_dir = os.path.basename(os.path.dirname(img_path))
        temp_name = f"{'comp_' if compress else 'hq_'}{parent_dir}_{base_name}"
        temp_path = os.path.join(temp_compressed_dir, temp_name)
        
        if os.path.exists(temp_path):
            return temp_path
            
        try:
            from PIL import Image as PILImage
            with PILImage.open(img_path) as im:
                if im.width > max_width:
                    w_percent = (max_width / float(im.width))
                    h_size = int((float(im.height) * float(w_percent)))
                    im = im.resize((max_width, h_size), PILImage.Resampling.LANCZOS)
                im.convert("RGB").save(temp_path, "JPEG", quality=quality_val, optimize=True)
            return temp_path
        except Exception as e:
            print(f"Error optimizing image {img_path}: {e}")
            return img_path
    
    # 1. Structure the exact layout requested by the user
    # Each item has a key name and fallback paths to locate it correctly
    chapters = [
        {
            "title": "I. Growth and development",
            "section_name": "Growth & Development",
            "slides": [
                {"num": "1", "title": "Growth charts", "file": "Growth & Development/Growth charts.jpeg"},
                {"num": "2", "title": "Development milestones during 1st 4 years", "file": "Growth & Development/Developmental milestones.jpeg"},
                {"num": "3", "title": "Key warning signs & delayed milestones", "file": "Growth & Development/Key development warning signs & Delayed milestone causes.jpeg"}
            ]
        },
        {
            "title": "II. Nutrition",
            "section_name": "Nutrition & Disorders",
            "slides": [
                {"num": "4", "title": "Advantages of breast feeding & contraindication", "file": "Nutrition/advantages of breastfeeding & contraindication.jpeg"},
                {"num": "5", "title": "Nutritional disorders: Kwashiorkor & Marasmus", "file": "Nutrition/PEM.jpeg"},
                {"num": "6", "title": "Nutritional disorders: Rickets", "file": "Nutrition/Rickets.jpeg"}
            ]
        },
        {
            "title": "III. GIT",
            "section_name": "Gastroenterology",
            "slides": [
                {"num": "7", "title": "Cow's milk allergy in Pediatrics", "file": "GIT/Cow milk allergy.jpeg"},
                {"num": "8a", "title": "GERD & Hypertrophic Pyloric Stenosis", "file": "GIT/GERD & HPS.jpeg"},
                {"num": "8b", "title": "Vomiting in pediatrics", "file": "GIT/Vomiting.jpeg"},
                {"num": "9", "title": "Abdominal pain in pediatrics", "file": "GIT/Pediatrics abdominal pain.jpeg"}
            ]
        },
        {
            "title": "IV. Genetic Diseases",
            "section_name": "Genetics & Disorders",
            "slides": [
                {"num": "10", "title": "Chromosomal disorders: Down Syndrome", "file": "Genetics/Down syndrome.jpeg"},
                {"num": "11", "title": "Chromosomal disorders: Turner syndrome", "file": "Genetics/Turner syndrome.jpeg"},
                {"num": "12", "title": "Prenatal diagnosis (importance, indications & types)", "file": "Genetics/Prenatal diagnosis.jpeg"}
            ]
        },
        {
            "title": "V. Endocrinology",
            "section_name": "Endocrinology",
            "slides": [
                {"num": "13", "title": "Short stature", "file": "Endocrinology/Short stature.jpeg"},
                {"num": "14", "title": "Hypothyroidism", "file": "Endocrinology/Congenital hypothyrodism.jpeg"},
                {"num": "15", "title": "Diabetes Mellitus Type 1 & DKA", "file": "Endocrinology/DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA).jpeg"},
                {"num": "16", "title": "Childhood obesity", "file": "Endocrinology/CHILDHOOD OBESITY.jpeg"}
            ]
        },
        {
            "title": "VI. Hematology and oncology",
            "section_name": "Hematology & Oncology",
            "slides": [
                {"num": "17", "title": "Iron deficiency anaemia", "file": "Hematology & Oncology/Iron defeciency anemia.jpeg"},
                {"num": "18", "title": "Aplastic anaemia", "file": "Hematology & Oncology/Aplastic anemia.jpeg"},
                {"num": "19", "title": "Chronic hemolytic anaemia", "file": "Hematology & Oncology/Chronic Hemolytic Anemia & Hereditary Spherocytosis.jpeg", "fallback": "Hematology & Oncology/Hereditary spherocytosis.jpeg"},
                {"num": "20", "title": "RBC abnormalities: Spherocytosis", "file": "Hematology & Oncology/Hereditary spherocytosis.jpeg"},
                {"num": "21", "title": "RBC abnormalities: Thalassemias", "file": "Hematology & Oncology/Thalassemia.jpeg"},
                {"num": "22", "title": "RBC abnormalities: G6PD deficiency", "file": "Hematology & Oncology/GP6D.jpeg"},
                {"num": "23", "title": "Hemophilia", "file": "Hematology & Oncology/Hemophilia.jpeg"},
                {"num": "24", "title": "ITP (Immune Thrombocytopenic Purpura)", "file": "Hematology & Oncology/Immune thrombocytopenia (ITP).jpeg"},
                {"num": "25", "title": "ALL & Prognostic factors", "file": "Hematology & Oncology/Acute lymphoplastic leukemia.jpeg"},
                {"num": "26", "title": "Hodgkin lymphoma", "file": "Hematology & Oncology/HODGKIN lymphoma.jpeg"}
            ]
        },
        {
            "title": "VII. CVS",
            "section_name": "Cardiovascular (CVS)",
            "slides": [
                {"num": "27-28", "title": "Acyanotic Heart: VSD (Part 1)", "file": "CVS/Ventricular Septal Defect (VSD) -1.jpeg", "fallback": "Cardiovascular diseases/Ventricular Septal Defect (VSD) -1.jpeg"},
                {"num": "27-28", "title": "Acyanotic Heart: VSD (Part 2)", "file": "CVS/Ventricular Septal Defect (VSD) - 2.jpeg", "fallback": "Cardiovascular diseases/Ventricular Septal Defect (VSD) - 2.jpeg"},
                {"num": "29", "title": "Acyanotic Heart: ASD", "file": "CVS/Atrial Septal Defect (ASD).jpeg", "fallback": "Cardiovascular diseases/Atrial Septal Defect (ASD).jpeg"},
                {"num": "30", "title": "Acyanotic Heart: PDA", "file": "CVS/Patent Ductus Arteriosus (PDA).jpeg", "fallback": "Cardiovascular diseases/Patent Ductus Arteriosus (PDA).jpeg"},
                {"num": "31", "title": "Cyanotic Heart: TGA", "file": "CVS/Complete Transposition of the Great Arteries (TGA).jpeg", "fallback": "Cardiovascular diseases/Complete Transposition of the Great Arteries (TGA).jpeg"},
                {"num": "32", "title": "Cyanotic Heart: Fallot / TOF", "file": "CVS/Tetralogy of Fallot (TOF) & Hypercyanotic Spells.jpeg", "fallback": "Cardiovascular diseases/Tetralogy of Fallot (TOF) & Hypercyanotic Spells.jpeg"},
                {"num": "33", "title": "Heart Failure", "file": "CVS/Pediatric Heart Failure (HF).jpeg", "fallback": "Cardiovascular diseases/Pediatric Heart Failure (HF).jpeg"}
            ]
        },
        {
            "title": "VIII. CNS",
            "section_name": "Neurology (CNS)",
            "slides": [
                {"num": "34", "title": "Cerebral Palsy", "file": "Neurology/Cerebral Palsy (CP).jpeg"},
                {"num": "35", "title": "Floppy infant", "file": "Neurology/The Floppy Infant Syndrome.jpeg"},
                {"num": "36", "title": "Duchenne muscle dystrophy", "file": "Neurology/Duchenne muscle dystrophy.jpeg"},
                {"num": "37", "title": "Infection", "file": "Infection/Infections.jpeg"}
            ]
        }
    ]

    # Pre-calculate page numbers for the Table of Contents dynamically!
    # Page 1: Cover
    # Page 2: Index (TOC)
    # Then for each chapter:
    #   - Chapter Cover (1 page)
    #   - Each slide (1 page)
    current_page = 3
    for ch in chapters:
        ch["start_page"] = current_page
        ch_pages = 1 + len(ch["slides"]) # 1 cover page + N image pages
        ch["end_page"] = current_page + ch_pages - 1
        
        # Calculate the page number for each slide
        slide_page = current_page + 1
        for slide in ch["slides"]:
            slide["page"] = slide_page
            slide_page += 1
            
        current_page += ch_pages

    # Set up ReportLab Document
    doc = SimpleDocTemplate(
        filename,
        pagesize=CUSTOM_PAGE_SIZE,
        leftMargin=12,
        rightMargin=12,
        topMargin=26,
        bottomMargin=23
    )
    
    styles = getSampleStyleSheet()
    
    # Text Styles
    index_title_style = ParagraphStyle(
        'IndexTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=10
    )
    index_header_style = ParagraphStyle(
        'IndexHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=10,
        textColor=colors.HexColor("#0369A1")
    )
    index_chapter_header_style = ParagraphStyle(
        'IndexChHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#0F172A")
    )
    index_chapter_page_style = ParagraphStyle(
        'IndexChPage',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#F59E0B"),
        alignment=2
    )
    index_slide_title_style = ParagraphStyle(
        'IndexSlideTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor("#334155")
    )
    index_slide_page_style = ParagraphStyle(
        'IndexSlidePage',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor("#64748B"),
        alignment=2
    )
    chapter_title_style = ParagraphStyle(
        'ChapterTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=34,
        leading=42,
        textColor=colors.HexColor("#FAFAFA"),
        alignment=1,
        spaceAfter=15
    )
    chapter_subtitle_style = ParagraphStyle(
        'ChapterSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#F59E0B"),
        alignment=1,
        spaceAfter=15
    )

    story = []
    
    # ---------------- PAGE 1: COVER PAGE ----------------
    story.append(Spacer(1, 100))
    story.append(PageBreak())
    
    # ---------------- PAGE 2: TABLE OF CONTENTS (INDEX) ----------------
    story.append(Spacer(1, 15))
    story.append(Paragraph("TABLE OF CONTENTS", index_title_style))
    story.append(Spacer(1, 4))
    
    # Center and offset the columns inside the index borders perfectly
    # inner border is at 18pt from both sides, so available inner width = CUSTOM_WIDTH - 36 = 805.89
    # We will center a 770pt wide table inside the 817.89pt printable width, leaving 23.9pt margin on both sides!
    # This places the columns comfortably at 12 + 23.9 = 35.9pt, leaving 17.9pt clear margin inside the border!
    col_w = (770 - 40) / 3 # ~243.33 pt each
    
    def make_column_table(group_chapters, col_width):
        table_data = [[
            Paragraph("CHAPTER / CLINICAL SLIDE", index_header_style), 
            Paragraph("PAGE", index_header_style)
        ]]
        
        for ch in group_chapters:
            # Chapter header row
            ch_title_p = Paragraph(f"<b>{ch['title'].upper()}</b>", index_chapter_header_style)
            ch_page_p = Paragraph(f"<b>P. {ch['start_page']}</b>", index_chapter_page_style)
            table_data.append([ch_title_p, ch_page_p])
            
            # Slide rows
            for slide in ch["slides"]:
                slide_title_p = Paragraph(slide["title"], index_slide_title_style)
                slide_page_p = Paragraph(f"p. {slide['page']}", index_slide_page_style)
                table_data.append([slide_title_p, slide_page_p])
            
            # Spacer row between chapters
            table_data.append(["", ""])
            
        # Pop last empty row if present
        if table_data and table_data[-1] == ["", ""]:
            table_data.pop()
            
        # 30pt is enough for page numbers, col_width - 30pt is for titles
        t = Table(table_data, colWidths=[col_width - 30, 30])
        
        # Style commands
        style_cmds = [
            ('LINEBELOW', (0, 0), (-1, 0), 1.0, colors.HexColor("#0369A1")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.0),
            ('TOPPADDING', (0, 0), (-1, -1), 1.0),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2), # 2pt safety padding on the right edge
        ]
        
        row_idx = 1
        for ch in group_chapters:
            # Underline Chapter Header
            style_cmds.append(('LINEBELOW', (0, row_idx), (-1, row_idx), 0.6, colors.HexColor("#F59E0B")))
            style_cmds.append(('TOPPADDING', (0, row_idx), (-1, row_idx), 4.5))
            style_cmds.append(('BOTTOMPADDING', (0, row_idx), (-1, row_idx), 2.5))
            
            # Slide underlines
            start_slide_row = row_idx + 1
            num_slides = len(ch["slides"])
            for s_idx in range(start_slide_row, start_slide_row + num_slides):
                style_cmds.append(('LINEBELOW', (0, s_idx), (-1, s_idx), 0.25, colors.HexColor("#E2E8F0")))
                
            row_idx += 1 + num_slides + 1 # header + slides + empty row
            
        t.setStyle(TableStyle(style_cmds))
        return t
        
    # Split chapters beautifully across 3 columns:
    # Col 1: Chapters I, II, III, IV
    # Col 2: Chapters V, VI
    # Col 3: Chapters VII, VIII
    t_col1 = make_column_table(chapters[0:4], col_w)
    t_col2 = make_column_table(chapters[4:6], col_w)
    t_col3 = make_column_table(chapters[6:8], col_w)
    
    inner_table_data = [[t_col1, "", t_col2, "", t_col3]]
    inner_table = Table(inner_table_data, colWidths=[col_w, 20, col_w, 20, col_w])
    inner_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    # Centered Master Table inside margins
    outer_table_w = CUSTOM_WIDTH - 24 # 817.89 pt
    padding_side = (outer_table_w - 770) / 2 # 23.94 pt on each side
    
    master_table = Table([[inner_table]], colWidths=[outer_table_w])
    master_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), padding_side),
        ('RIGHTPADDING', (0, 0), (-1, -1), padding_side),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    story.append(master_table)
    story.append(Spacer(1, 10))
    
    legend_style = ParagraphStyle(
        'Legend',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        textColor=colors.HexColor("#94A3B8"),
        alignment=1
    )
    story.append(Paragraph("Tip: Use the interactive landscape view on your tablet or laptop for optimal clinical visualization.", legend_style))
    story.append(PageBreak())
    
    # ---------------- CHAPTER SHABATER & IMAGE PAGES ----------------
    page_to_chapter_mapping = {}
    current_compiled_page = 3
    
    for i, ch in enumerate(chapters):
        # 1. Chapter Separator Page
        story.append(Spacer(1, 120))
        story.append(Paragraph(f"CHAPTER 0{i+1}", chapter_subtitle_style))
        story.append(Paragraph(ch["title"], chapter_title_style))
        story.append(Spacer(1, 10))
        story.append(Paragraph("•  •  •  •  •  •  •  •  •  •  •", ParagraphStyle('dots', parent=styles['Normal'], alignment=1, fontSize=16, textColor=colors.HexColor("#475569"))))
        story.append(Spacer(1, 10))
        
        # Display slide list / key topics for a stunning layout
        topics = [slide['title'] for slide in ch["slides"]]
        topics_str = "  •  ".join(topics)
        topics_style = ParagraphStyle(
            'ChapterTopics',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#64748B"),
            alignment=1
        )
        story.append(Paragraph(topics_str.upper(), topics_style))
        
        page_to_chapter_mapping[current_compiled_page] = {
            "type": "cover",
            "chapter": ch["title"]
        }
        current_compiled_page += 1
        story.append(PageBreak())
        
        # 2. Image Pages
        for slide in ch["slides"]:
            # Try to resolve full image path
            img_path = os.path.join(arabic_dir, slide["file"])
            
            # Double check fallbacks if not found in main Arabic folder
            if not os.path.exists(img_path):
                img_path = os.path.join(english_dir, slide["file"])
                
            if not os.path.exists(img_path) and "fallback" in slide:
                img_path = os.path.join(arabic_dir, slide["fallback"])
                if not os.path.exists(img_path):
                    img_path = os.path.join(english_dir, slide["fallback"])
            
            # Image Dimensions (Maximized to zero horizontal gap)
            img_w = 817.89
            img_h = 448.28
            
            story.append(Spacer(1, 3))
            
            if os.path.exists(img_path):
                compressed_path = get_maybe_compressed_image(img_path)
                story.append(Image(compressed_path, width=img_w, height=img_h))
            else:
                # Absolute fallback box
                from reportlab.graphics.shapes import Drawing, Rect, String
                d = Drawing(img_w, img_h)
                d.add(Rect(0, 0, img_w, img_h, fillColor=colors.HexColor("#F8FAFC"), strokeColor=colors.HexColor("#0F172A"), strokeWidth=1.2))
                d.add(String(img_w / 2, img_h / 2, f"[ Image Missing: {os.path.basename(slide['file'])} ]", textAnchor="middle", fontName="Helvetica-Bold", fontSize=12))
                story.append(d)
                
            page_to_chapter_mapping[current_compiled_page] = {
                "type": "content",
                "chapter": ch["title"]
            }
            current_compiled_page += 1
            story.append(PageBreak())

    # Build Template
    from reportlab.platypus import PageTemplate, BaseDocTemplate, Frame
    
    max_frame = Frame(
        12,
        14,
        CUSTOM_WIDTH - 24,
        CUSTOM_HEIGHT - 37,
        id='custom_max_frame',
        topPadding=0,
        bottomPadding=0,
        leftPadding=0,
        rightPadding=0
    )
    
    def onPage(canvas, doc):
        canvas._student_name = getattr(doc, '_student_name', "Mohamed Ahmed")
        canvas._student_email = getattr(doc, '_student_email', "mohamed.ahmed@gmail.com")
        p = canvas._pageNumber
        if p in [1, 2]:
            canvas._is_chapter_page = False
        else:
            mapping = page_to_chapter_mapping.get(p, {"type": "content", "chapter": "تحديدات الأطفال"})
            if mapping["type"] == "cover":
                canvas._is_chapter_page = True
                canvas._current_chapter = mapping["chapter"]
            else:
                canvas._is_chapter_page = False
                canvas._current_chapter = mapping["chapter"]
        canvas.draw_page_background(p)
            
    template = PageTemplate(id='all_pages', frames=max_frame, onPage=onPage)
    
    doc = BaseDocTemplate(filename, pagesize=CUSTOM_PAGE_SIZE, pageTemplates=[template])
    doc._student_name = student_name
    doc._student_email = student_email
    doc.build(story, canvasmaker=UltraSleekSecurityCanvas)
    print("SUCCESS! Final PDF generated successfully.")

if __name__ == "__main__":
    import sys
    
    # Platform dynamic generation defaults
    output_filename = "d:/Med Prep/تحديدات_الأطفال.pdf"
    student_name = "Mohamed Ahmed"
    student_email = "mohamed.ahmed@gmail.com"
    compress_flag = False
    
    # Parse CLI arguments if executed from platform server backend
    # CLI Format: python generate_final_pediatrics_pdf.py [name] [email] [compress_yes_or_no] [output_path]
    if len(sys.argv) > 1:
        student_name = sys.argv[1]
    if len(sys.argv) > 2:
        student_email = sys.argv[2]
    if len(sys.argv) > 3:
        compress_flag = sys.argv[3].lower() in ['true', '1', 'yes', 'y', 'compress']
    if len(sys.argv) > 4:
        output_filename = sys.argv[4]
        
    if len(sys.argv) > 1:
        # Dynamic build called by the platform
        build_pdf(output_filename, compress=compress_flag, student_name=student_name, student_email=student_email)
    else:
        # Local compile of both PDFs for testing
        build_pdf("d:/Med Prep/تحديدات_الأطفال.pdf", compress=False, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com")
        build_pdf("d:/Med Prep/تحديدات_الأطفال_مضغوط.pdf", compress=True, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com")
        
        # Automatically copy to client/public static folder for release
        import shutil
        print("Copying generated PDFs to client/public static assets...")
        try:
            shutil.copy2("d:/Med Prep/تحديدات_الأطفال.pdf", "d:/Med Prep/client/public/tahdedat_pediatrics.pdf")
            shutil.copy2("d:/Med Prep/تحديدات_الأطفال_مضغوط.pdf", "d:/Med Prep/client/public/tahdedat_pediatrics_compressed.pdf")
            print("SUCCESS! Copied to client/public/tahdedat_pediatrics.pdf")
        except Exception as e:
            print(f"Error copying PDFs: {e}")
