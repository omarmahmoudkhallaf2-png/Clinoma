import os
import sys
import shutil
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

CUSTOM_WIDTH = 841.89
CUSTOM_HEIGHT = 497.28
CUSTOM_PAGE_SIZE = (CUSTOM_WIDTH, CUSTOM_HEIGHT)

class LuxurySecurityCanvas(canvas.Canvas):
    """
    A minimalist luxury security canvas.
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

    def draw_dotted_grid(self, width, height, dot_color, spacing=24):
        self.setFillColor(colors.HexColor(dot_color))
        for x in range(0, int(width), spacing):
            for y in range(0, int(height), spacing):
                self.circle(x, y, 0.6, fill=True, stroke=False)

    def draw_page_background(self, p):
        width, height = CUSTOM_PAGE_SIZE
        is_chapter_page = getattr(self, '_is_chapter_page', False)
        
        self.saveState()
        
        if p == 1:
            # COVER PAGE BACKGROUND (Luxury Apple-Style Minimalist Cover Image)
            cover_img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "client/public/assets/second_paper/cover.png")
            if os.path.exists(cover_img_path):
                self.drawImage(cover_img_path, 0, 0, width, height)
            else:
                self.setFillColor(colors.HexColor("#FFFFFF")) # Clean white fallback
                self.rect(0, 0, width, height, fill=True, stroke=False)
                self.draw_dotted_grid(width, height, "#F1F5F9", spacing=24)
            
        elif p == 2:
            # INDEX PAGE BACKGROUND
            self.setFillColor(colors.HexColor("#FFFFFF"))
            self.rect(0, 0, width, height, fill=True, stroke=False)
            self.draw_dotted_grid(width, height, "#F8FAFC", spacing=24)
            
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.8)
            self.rect(20, 20, width - 40, height - 40)
            
        elif is_chapter_page:
            # CHAPTER COVER PAGE BACKGROUND (Luxury Apple-Style Minimalist Matching Cover)
            self.setFillColor(colors.HexColor("#F3F7FC")) # Matching Pastel Light Blue-Gray
            self.rect(0, 0, width, height, fill=True, stroke=False)
            self.draw_dotted_grid(width, height, "#DDE7F5", spacing=24)
            
            # Light Pastel Blue Side Accent Line (Exact match of cover)
            self.setFillColor(colors.HexColor("#A3C4F3")) 
            self.rect(0, 0, 8, height, fill=True, stroke=False)
            
            # Double geometric circles in matching light blue
            self.setStrokeColor(colors.HexColor("#DDE7F5"))
            self.setLineWidth(0.75)
            self.circle(width / 2, height / 2 - 10, 140, stroke=True, fill=False)
            self.circle(width / 2, height / 2 - 10, 145, stroke=True, fill=False)
            
            self.setStrokeColor(colors.HexColor("#DDE7F5"))
            self.setLineWidth(1.0)
            self.rect(20, 20, width - 40, height - 40)
            
        self.restoreState()

    def draw_page_elements(self, page_count):
        is_chapter_page = getattr(self, '_is_chapter_page', False)
        chapter_name = getattr(self, '_current_chapter', "تحديدات الورقة الثانية")
        slide_title = getattr(self, '_slide_title', "")
        p = self._pageNumber
        
        self.saveState()
        width, height = CUSTOM_PAGE_SIZE
        
        student_name = getattr(self, '_student_name', "Mohamed Ahmed")
        student_email = getattr(self, '_student_email', "mohamed.ahmed@gmail.com")
        
        if p == 1:
            # Skip drawing text overlays because the generated Apple-style cover image
            # already contains the stylized typography and covers the entire page.
            pass
            
        elif p == 2:
            # INDEX PAGE FOREGROUND
            self.setFont("Times-Bold", 11)
            self.setFillColor(colors.HexColor("#171717"))
            self.drawString(40, height - 42, "CLINOMA • SECOND PAPER INDEX")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#737373"))
            self.drawRightString(width - 40, height - 42, "Flashspace Study Guide")
            
        elif is_chapter_page:
            pass
            
        else:
            # CONTENT PAGE DESIGN (Editorial clean slides)
            # 1. Slide Title Header
            self.setFont("Times-BoldItalic", 9.5)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.drawString(30, height - 25, f"{chapter_name.upper()} • {slide_title.upper()}")
            
            # 2. Header Security Pill Boxes
            header_y = height - 31
            box_h = 13
            box_w = 170
            
            # Left Security Box (User)
            self.setFillColor(colors.HexColor("#F8FAFC"))
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.roundRect(width - 30 - (2 * box_w) - 10, header_y, box_w, box_h, 3, fill=True, stroke=True)
            
            # Right Security Box (Email)
            self.roundRect(width - 30 - box_w, header_y, box_w, box_h, 3, fill=True, stroke=True)
            
            # Text inside boxes
            self.setFont("Helvetica-Bold", 6.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(width - 30 - (2 * box_w) - 5, header_y + 3.5, "USER:")
            self.setFont("Helvetica", 6.5)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.drawString(width - 30 - (2 * box_w) + 25, header_y + 3.5, student_name)
            
            self.setFont("Helvetica-Bold", 6.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(width - 30 - box_w + 5, header_y + 3.5, "EMAIL:")
            self.setFont("Helvetica", 6.5)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.drawString(width - 30 - box_w + 38, header_y + 3.5, student_email)
            
            # Header separator line
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.8)
            self.line(30, height - 37, width - 30, height - 37)
            
            # 3. Footer
            self.setStrokeColor(colors.HexColor("#F1F5F9"))
            self.setLineWidth(0.6)
            self.line(30, 36, width - 30, 36)
            
            self.setFont("Helvetica-Bold", 6.5)
            self.setFillColor(colors.HexColor("#94A3B8"))
            self.drawString(30, 22, "SECURED DIGITAL EDITION • CLINOMA PLATFORM")
            
            page_str = f"Page {p} of {page_count}"
            self.drawRightString(width - 30, 22, page_str)
            
        self.restoreState()

def process_slide_image(img_path, target_width=740, target_height=380, radius=12, compress=False, temp_dir=""):
    if not os.path.exists(img_path):
        return img_path
        
    quality_val = 74 if compress else 82
    base_name = os.path.basename(img_path)
    parent_dir = os.path.basename(os.path.dirname(img_path))
    temp_name = f"{'comp_' if compress else 'hq_'}{parent_dir}_{base_name}"
    temp_path = os.path.join(temp_dir, temp_name)
    
    if os.path.exists(temp_path):
        return temp_path
        
    try:
        from PIL import Image as PILImage, ImageDraw
        with PILImage.open(img_path) as im:
            # 1. Resize proportionally to fit target box
            im_ratio = im.width / im.height
            target_ratio = target_width / target_height
            
            if im_ratio > target_ratio:
                # Fit width
                new_w = target_width
                new_h = int(target_width / im_ratio)
            else:
                # Fit height
                new_h = target_height
                new_w = int(target_height * im_ratio)
                
            im_resized = im.resize((new_w, new_h), PILImage.Resampling.LANCZOS)
            
            # 2. Paste onto a solid white canvas to pad
            canvas_im = PILImage.new("RGB", (target_width, target_height), (255, 255, 255))
            paste_x = (target_width - new_w) // 2
            paste_y = (target_height - new_h) // 2
            canvas_im.paste(im_resized, (paste_x, paste_y))
            
            # 3. Create a rounded corner mask
            mask = PILImage.new('L', (target_width, target_height), 0)
            draw = ImageDraw.Draw(mask)
            draw.rounded_rectangle([0, 0, target_width - 1, target_height - 1], radius=radius, fill=255)
            
            # 4. Apply mask on the white canvas padded image
            output_im = PILImage.new("RGB", (target_width, target_height), (255, 255, 255))
            output_im.paste(canvas_im, mask=mask)
            
            # 5. Draw a thin luxury border outline
            draw_border = ImageDraw.Draw(output_im)
            draw_border.rounded_rectangle([0, 0, target_width - 1, target_height - 1], radius=radius, outline=(226, 232, 240), width=1)
            
            # Save the processed image
            output_im.save(temp_path, "JPEG", quality=quality_val, optimize=True)
            return temp_path
    except Exception as e:
        print(f"Error processing image {img_path}: {e}")
        return img_path

def build_pdf(filename="تحديدات_الورقة_الثانية.pdf", compress=False, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com", exclude_family=False):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_assets_dir = os.path.join(script_dir, "client/public/assets/second_paper")
    if not os.path.exists(base_assets_dir):
        base_assets_dir = os.path.join(script_dir, "client/dist/assets/second_paper")
        
    temp_compressed_dir = os.path.join(script_dir, "temp_compressed_hq")
    if not os.path.exists(temp_compressed_dir):
        os.makedirs(temp_compressed_dir)
        
    # Define Chapter Structure
    chapters = [
        {
            "title": "I. Chest Diseases",
            "section_name": "Chest Diseases",
            "slides": [
                {"num": "1", "title": "Viral Croup", "file": "Chest diseases/Viral Croup.jpeg"},
                {"num": "2", "title": "Epiglottitis", "file": "Chest diseases/Epiglottitis.jpeg"},
                {"num": "3", "title": "DD Croup & Pneumonia", "file": "Chest diseases/DD croup & pnuomonia.jpeg"},
                {"num": "4", "title": "Bronchiolitis", "file": "Chest diseases/Bronchiolitis.jpeg"},
                {"num": "5", "title": "Bronchial Asthma", "file": "Chest diseases/Bronchial Asthma.jpeg"},
                {"num": "6", "title": "Wheezing & Foreign Body", "file": "Chest diseases/Wheezing & Foreign Body.jpeg"},
                {"num": "7", "title": "Childhood Pneumonia: Classifications", "file": "Chest diseases/Childhood Pneumonia Part1 Classifications.jpeg"},
                {"num": "8", "title": "Childhood Pneumonia: Misleading Signs", "file": "Chest diseases/Childhood Pneumonia Part2 Misleading_Signs.jpeg"},
                {"num": "9", "title": "Childhood Pneumonia: Diagnostics & ICU", "file": "Chest diseases/Childhood Pneumonia Part3 Diagnostics ICU.jpeg"},
                {"num": "10", "title": "Childhood Pneumonia: Therapeutics", "file": "Chest diseases/Childhood Pneumonia Part4 Therapeutics Unresolved.jpeg"},
                {"num": "11", "title": "Pneumonia Summary", "file": "Chest diseases/Pneumonia كلها مختصرة.jpeg"}
            ]
        },
        {
            "title": "II. Neonatology",
            "section_name": "Neonatology",
            "slides": [
                {"num": "12", "title": "Physiological & Pathological Jaundice", "file": "Neonatology/Physiological Jaundice and its differentiation from Pathological Jaundice.jpeg"},
                {"num": "13", "title": "Pathological Jaundice Details", "file": "Neonatology/Pathological Jaundice.jpeg"},
                {"num": "14", "title": "Neonatal Jaundice Overview", "file": "Neonatology/Neonatal Jaundice.jpeg"},
                {"num": "15", "title": "Complications of Indirect Hyperbilirubinemia", "file": "Neonatology/Complications of Indirect Hyperbilirubinemia.jpeg"},
                {"num": "16", "title": "Neonatal Sepsis", "file": "Neonatology/Neonatal Sepsis.jpeg"},
                {"num": "17", "title": "Prematurity and its Complications", "file": "Neonatology/Prematurity and its Complications.jpeg"},
                {"num": "18", "title": "Transient Cutaneous Lesions", "file": "Neonatology/Transient Cutaneous Lesions.jpeg"}
            ]
        },
        {
            "title": "III. Renal Diseases",
            "section_name": "Renal Diseases",
            "slides": [
                {"num": "19", "title": "Pediatric Hematuria Evaluation", "file": "Renal diseases/Pediatric Hematuria Approach & Evaluation.jpeg"},
                {"num": "20", "title": "Acute Nephritic Syndrome & APSGN", "file": "Renal diseases/Acute Nephritic Syndrome & APSGN.jpeg"},
                {"num": "21", "title": "Nephrotic Syndrome", "file": "Renal diseases/Nephrotic Syndrome.jpeg"},
                {"num": "22", "title": "Acute Kidney Injury", "file": "Renal diseases/Acute kidney injury.jpeg"},
                {"num": "23", "title": "Chronic Kidney Disease", "file": "Renal diseases/Chronic kidney disease.jpeg"},
                {"num": "24", "title": "Urinary Tract Infections", "file": "Renal diseases/Urinary Tract Infections & Pyelonephritis.jpeg"}
            ]
        },
        {
            "title": "IV. Emergency Medicine",
            "section_name": "Emergency Medicine",
            "slides": [
                {"num": "25", "title": "Cardiopulmonary Resuscitation (CPR)", "file": "Emergency Medicine/Cardiopulmonary Resuscitation (CPR).jpeg"},
                {"num": "26", "title": "Shock Management", "file": "Emergency Medicine/Shock.jpeg"},
                {"num": "27", "title": "Glasgow Coma Scale", "file": "Emergency Medicine/Glascow coma scales.jpeg"},
                {"num": "28", "title": "Coma Approach", "file": "Emergency Medicine/Coma.jpeg"},
                {"num": "29", "title": "Hyperbilirubinemia Complications", "file": "Emergency Medicine/Complications of Indirect Hyperbilirubinemia.jpeg"}
            ]
        },
        {
            "title": "V. Family Medicine",
            "section_name": "Family Medicine",
            "slides": [
                {"num": "30", "title": "Principles of Family Medicine", "file": "Family Medicine/Principles of Family Medicine.jpeg"},
                {"num": "31", "title": "The Family Physician & RISE Framework", "file": "Family Medicine/The Family Physician & RISE Framework.jpeg"},
                {"num": "32", "title": "Family Dynamics & Human Life Cycle", "file": "Family Medicine/Family Dynamics & The Human Life Cycle.jpeg"},
                {"num": "33", "title": "Comparative Medical Models", "file": "Family Medicine/Comparative Medical Models.jpeg"},
                {"num": "34", "title": "Basic Benefit Package & Level of Care", "file": "Family Medicine/Basic Benefit Package & Level of Care.jpeg"},
                {"num": "35", "title": "Family Health Team & PHC Services", "file": "Family Medicine/Family Health Team & PHC Services.jpeg"},
                {"num": "36", "title": "Referral & Consultation Processes", "file": "Family Medicine/Referral & Consultation Processes.jpeg"},
                {"num": "37", "title": "Patient Education & Verbal Counseling", "file": "Family Medicine/Patient Education & Verbal Counseling.jpeg"},
                {"num": "38", "title": "Anticipatory Care & Immunization Guidelines", "file": "Family Medicine/Anticipatory Care & Immunization Guidelines.jpeg"},
                {"num": "39", "title": "Breastfeeding Management & Composition", "file": "Family Medicine/Breastfeeding Management & Composition.jpeg"},
                {"num": "40", "title": "Adolescent Health & HEADSSS Interview", "file": "Family Medicine/Adolescent Psychological Health & HEADSSS interview.jpeg"},
                {"num": "41", "title": "IMCI Overview & Case Steps", "file": "Family Medicine/IMCI Overview & Case Management Steps.jpeg"},
                {"num": "42", "title": "IMCI Young Infant Assessment (<=2M)", "file": "Family Medicine/IMCI_Young_Infant_Assessment_&_Classification_Age_Up_to_2_Months.jpeg"},
                {"num": "43", "title": "IMCI Young Infant Treatment (<=2M)", "file": "Family Medicine/IMCI_Treatment_&_Care_Guidelines_for_Young_Infants_Up_to_2_Months.jpeg"},
                {"num": "44", "title": "IMCI Assessment (2M to 5Y)", "file": "Family Medicine/IMCI_Assessment_&_Classification_Age_2_Months_to_5_Years_Danger.jpeg"},
                {"num": "45", "title": "IMCI Diarrhoea & Rehydration", "file": "Family Medicine/IMCI Diarrhoea Management & Rehydration Plans.jpeg"}
            ]
        }
    ]

    if exclude_family:
        chapters = [ch for ch in chapters if ch["section_name"] != "Family Medicine"]

    # Pre-calculate pages
    current_page = 3
    for ch in chapters:
        ch["start_page"] = current_page
        ch_pages = 1 + len(ch["slides"])
        ch["end_page"] = current_page + ch_pages - 1
        
        slide_page = current_page + 1
        for slide in ch["slides"]:
            slide["page"] = slide_page
            slide_page += 1
            
        current_page += ch_pages

    styles = getSampleStyleSheet()
    
    # Text Styles
    index_title_style = ParagraphStyle(
        'IndexTitle',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#171717"),
        spaceAfter=10
    )
    index_header_style = ParagraphStyle(
        'IndexHeader',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=8.5,
        leading=10,
        textColor=colors.HexColor("#737373")
    )
    index_chapter_header_style = ParagraphStyle(
        'IndexChHeader',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#171717")
    )
    index_chapter_page_style = ParagraphStyle(
        'IndexChPage',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#4F75A2"),
        alignment=2
    )
    index_slide_title_style = ParagraphStyle(
        'IndexSlideTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor("#404040")
    )
    index_slide_page_style = ParagraphStyle(
        'IndexSlidePage',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor("#737373"),
        alignment=2
    )
    chapter_title_style = ParagraphStyle(
        'ChapterTitle',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=34,
        leading=42,
        textColor=colors.HexColor("#0F172A"),
        alignment=1,
        spaceAfter=15
    )
    chapter_subtitle_style = ParagraphStyle(
        'ChapterSubtitle',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#4F75A2"),
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
    
    col_w = (770 - 40) / 3
    
    def make_column_table(group_chapters, col_width):
        table_data = [[
            Paragraph("CHAPTER / CLINICAL SLIDE", index_header_style), 
            Paragraph("PAGE", index_header_style)
        ]]
        
        for ch in group_chapters:
            ch_title_p = Paragraph(f"<b>{ch['title'].upper()}</b>", index_chapter_header_style)
            ch_page_p = Paragraph(f"<b>P. {ch['start_page']}</b>", index_chapter_page_style)
            table_data.append([ch_title_p, ch_page_p])
            
            for slide in ch["slides"]:
                slide_title_p = Paragraph(slide["title"], index_slide_title_style)
                slide_page_p = Paragraph(f"p. {slide['page']}", index_slide_page_style)
                table_data.append([slide_title_p, slide_page_p])
            
            table_data.append(["", ""])
            
        if table_data and table_data[-1] == ["", ""]:
            table_data.pop()
            
        t = Table(table_data, colWidths=[col_width - 30, 30])
        
        style_cmds = [
            ('LINEBELOW', (0, 0), (-1, 0), 1.0, colors.HexColor("#737373")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.0),
            ('TOPPADDING', (0, 0), (-1, -1), 1.0),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ]
        
        row_idx = 1
        for ch in group_chapters:
            style_cmds.append(('LINEBELOW', (0, row_idx), (-1, row_idx), 0.6, colors.HexColor("#A3C4F3")))
            style_cmds.append(('TOPPADDING', (0, row_idx), (-1, row_idx), 4.5))
            style_cmds.append(('BOTTOMPADDING', (0, row_idx), (-1, row_idx), 2.5))
            
            start_slide_row = row_idx + 1
            num_slides = len(ch["slides"])
            for s_idx in range(start_slide_row, start_slide_row + num_slides):
                style_cmds.append(('LINEBELOW', (0, s_idx), (-1, s_idx), 0.25, colors.HexColor("#E5E5E5")))
                
            row_idx += 1 + num_slides + 1
            
        t.setStyle(TableStyle(style_cmds))
        return t
        
    t_col1 = make_column_table(chapters[0:1], col_w)
    t_col2 = make_column_table(chapters[1:4], col_w)
    t_col3 = make_column_table(chapters[4:5], col_w)
    
    inner_table_data = [[t_col1, "", t_col2, "", t_col3]]
    inner_table = Table(inner_table_data, colWidths=[col_w, 20, col_w, 20, col_w])
    inner_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    outer_table_w = CUSTOM_WIDTH - 24
    padding_side = (outer_table_w - 770) / 2
    
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
        fontName='Times-Italic',
        fontSize=8,
        textColor=colors.HexColor("#737373"),
        alignment=1
    )
    story.append(Paragraph("Tip: Use the interactive landscape view on your tablet or laptop for optimal clinical visualization.", legend_style))
    story.append(PageBreak())
    
    # ---------------- CHAPTER SEPARATOR & IMAGE PAGES ----------------
    page_to_chapter_mapping = {}
    current_compiled_page = 3
    
    for i, ch in enumerate(chapters):
        # 1. Chapter Separator Page
        story.append(Spacer(1, 120))
        story.append(Paragraph(f"CHAPTER 0{i+1}", chapter_subtitle_style))
        story.append(Paragraph(ch["title"], chapter_title_style))
        story.append(Spacer(1, 10))
        story.append(Paragraph("•  •  •  •  •  •  •  •  •  •  •", ParagraphStyle('dots', parent=styles['Normal'], alignment=1, fontSize=16, textColor=colors.HexColor("#CBD5E1"))))
        story.append(Spacer(1, 10))
        
        topics = [slide['title'] for slide in ch["slides"]]
        topics_str = "  •  ".join(topics)
        topics_style = ParagraphStyle(
            'ChapterTopics',
            parent=styles['Normal'],
            fontName='Times-Bold',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#64748B"),
            alignment=1
        )
        story.append(Paragraph(topics_str.upper(), topics_style))
        
        page_to_chapter_mapping[current_compiled_page] = {
            "type": "cover",
            "chapter": ch["title"],
            "slide_title": ""
        }
        current_compiled_page += 1
        story.append(PageBreak())
        
        # 2. Image Pages
        for slide in ch["slides"]:
            img_path = os.path.join(base_assets_dir, slide["file"])
            
            # Slide image dimensions (nesting neatly into the page grid)
            img_w = 740
            img_h = 380
            
            story.append(Spacer(1, 22)) # Push image down to clear header rule
            
            if os.path.exists(img_path):
                # Apply rounded corners and a premium border dynamically via PIL
                processed_path = process_slide_image(img_path, target_width=img_w, target_height=img_h, radius=12, compress=compress, temp_dir=temp_compressed_dir)
                story.append(Image(processed_path, width=img_w, height=img_h))
            else:
                from reportlab.graphics.shapes import Drawing, Rect, String
                d = Drawing(img_w, img_h)
                d.add(Rect(0, 0, img_w, img_h, fillColor=colors.HexColor("#FAFAFA"), strokeColor=colors.HexColor("#E5E5E5"), strokeWidth=1))
                d.add(String(img_w / 2, img_h / 2, f"[ Image Missing: {os.path.basename(slide['file'])} ]", textAnchor="middle", fontName="Times-Bold", fontSize=12))
                story.append(d)
                
            page_to_chapter_mapping[current_compiled_page] = {
                "type": "content",
                "chapter": ch["title"],
                "slide_title": slide["title"]
            }
            current_compiled_page += 1
            story.append(PageBreak())

    # Build Template
    from reportlab.platypus import PageTemplate, BaseDocTemplate, Frame
    
    max_frame = Frame(
        30,
        35,
        CUSTOM_WIDTH - 60,
        CUSTOM_HEIGHT - 70,
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
            canvas._slide_title = ""
        else:
            mapping = page_to_chapter_mapping.get(p, {"type": "content", "chapter": "تحديدات الورقة الثانية", "slide_title": ""})
            canvas._slide_title = mapping["slide_title"]
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
    doc.build(story, canvasmaker=LuxurySecurityCanvas)
    print(f"SUCCESS! {filename} generated successfully.")

if __name__ == "__main__":
    import sys
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_filename = os.path.join(script_dir, "تحديدات_الورقة_الثانية.pdf")
    student_name = "Mohamed Ahmed"
    student_email = "mohamed.ahmed@gmail.com"
    compress_flag = False
    
    if len(sys.argv) > 1:
        student_name = sys.argv[1]
    if len(sys.argv) > 2:
        student_email = sys.argv[2]
    if len(sys.argv) > 3:
        compress_flag = sys.argv[3].lower() in ['true', '1', 'yes', 'y', 'compress']
    if len(sys.argv) > 4:
        output_filename = sys.argv[4]
        
    if len(sys.argv) > 1:
        exclude_family_flag = sys.argv[4].lower() in ['true', '1', 'yes', 'y', 'exclude'] if len(sys.argv) > 4 else False
        build_pdf(output_filename, compress=compress_flag, student_name=student_name, student_email=student_email, exclude_family=exclude_family_flag)
    else:
        pdf_path = os.path.join(script_dir, "تحديدات_الورقة_الثانية.pdf")
        pdf_path_comp = os.path.join(script_dir, "تحديدات_الورقة_الثانية_مضغوط.pdf")
        
        pdf_path_ped = os.path.join(script_dir, "تحديدات_الورقة_الثانية_أطفال.pdf")
        pdf_path_ped_comp = os.path.join(script_dir, "تحديدات_الورقة_الثانية_أطفال_مضغوط.pdf")
        
        # Build standard and compressed full PDFs
        build_pdf(pdf_path, compress=False, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com", exclude_family=False)
        build_pdf(pdf_path_comp, compress=True, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com", exclude_family=False)
        
        # Build standard and compressed pediatric-only PDFs
        build_pdf(pdf_path_ped, compress=False, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com", exclude_family=True)
        build_pdf(pdf_path_ped_comp, compress=True, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com", exclude_family=True)
        
        print("Copying generated PDFs to client/public static assets...")
        try:
            shutil.copy2(pdf_path, os.path.join(script_dir, "client/public/tahdedat_second_paper.pdf"))
            shutil.copy2(pdf_path_comp, os.path.join(script_dir, "client/public/tahdedat_second_paper_compressed.pdf"))
            shutil.copy2(pdf_path_ped, os.path.join(script_dir, "client/public/tahdedat_second_paper_pediatric.pdf"))
            shutil.copy2(pdf_path_ped_comp, os.path.join(script_dir, "client/public/tahdedat_second_paper_pediatric_compressed.pdf"))
            print("SUCCESS! Copied all four PDFs to client/public/ static assets.")
        except Exception as e:
            print(f"Error copying PDFs: {e}")
