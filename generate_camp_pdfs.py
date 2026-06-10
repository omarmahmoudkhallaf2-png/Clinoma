import os
import re
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

# Register Comic Sans MS font for a beautiful, friendly student layout
COMIC_PATH = "C:/Windows/Fonts/comic.ttf"
COMIC_BOLD_PATH = "C:/Windows/Fonts/comicbd.ttf"

if not os.path.exists(COMIC_PATH):
    COMIC_PATH = "C:/Windows/Fonts/arial.ttf"
if not os.path.exists(COMIC_BOLD_PATH):
    COMIC_BOLD_PATH = "C:/Windows/Fonts/arialbd.ttf"

pdfmetrics.registerFont(TTFont('ComicFont', COMIC_PATH))
pdfmetrics.registerFont(TTFont('ComicFont-Bold', COMIC_BOLD_PATH))

def clean_and_translate_text(text):
    """Clean the text and translate small Arabic words like (أو:) to English (or:)."""
    if not text:
        return ""
    text_clean = text.strip()
    text_clean = re.sub(r'\(\s*أو\s*:', '(or:', text_clean)
    text_clean = re.sub(r'\(\s*أو\s+', '(or ', text_clean)
    return text_clean

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute total pages and draw templates recorded on the first pass."""
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
            # Cover Page Decorations (Drawn in first pass, nothing in second pass)
            pass
            
        elif page_type == 'chapter':
            # Chapter Cover Decorations (Drawn in first pass, nothing in second pass)
            pass
            
        elif page_type == 'content':
            # Content Page Decorations (Borders and watermark text)
            self.saveState()
            
            # Outer Border
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(1)
            self.rect(20, 30, PAGE_WIDTH - 40, PAGE_HEIGHT - 65)
            
            # Header Security Pill Boxes
            margin = 20
            header_y = PAGE_HEIGHT - margin - 22
            box_h = 14
            box_w = 170
            
            # Left Security Box (User)
            self.setFillColor(colors.HexColor("#F0F9FF"))
            self.setStrokeColor(colors.HexColor("#bae6fd"))
            self.setLineWidth(0.5)
            self.roundRect(margin + 5, header_y, box_w, box_h, 3, fill=True, stroke=True)
            
            # Right Security Box (Email)
            self.roundRect(PAGE_WIDTH - margin - box_w - 5, header_y, box_w, box_h, 3, fill=True, stroke=True)
            
            # Text inside boxes
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
            
            # Middle brand tag
            self.setFont("ComicFont-Bold", 6.5)
            self.setFillColor(colors.HexColor("#94A3B8"))
            self.drawCentredString(PAGE_WIDTH / 2, header_y + 3.5, "SECURED DIGITAL EDITION • CLINOMA PLATFORM")
            
            # Footer
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(20, 42, PAGE_WIDTH - 20, 42)
            
            footer_text_l = "CLINOMA PLATFORM • ALL RIGHTS RESERVED. UNAUTHORISED SHARING PROHIBITED."
            self.drawString(30, 28, footer_text_l)
            
            page_str = f"Page {page_num} of {total_pages}"
            self.drawRightString(PAGE_WIDTH - 30, 28, page_str)
            
            self.restoreState()

def parse_questions_file(file_path):
    """Parse the questions text file into structured chapters and sections, converting Arabic headers to English."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    chapters = []
    current_chapter = None
    current_section = None
    current_case = None
    current_question = None
    collecting_answer = False
    case_counter = 0

    for line in lines:
        line_str = line.strip()
        
        if not line_str:
            if collecting_answer and current_question:
                current_question["answer"].append("")
            continue

        # Check for Chapter header
        if line_str.startswith("Chapter "):
            current_chapter = {
                "title": line_str,
                "items": []
            }
            chapters.append(current_chapter)
            current_section = None
            current_case = None
            current_question = None
            collecting_answer = False
            case_counter = 0
            continue

        # Check for Section header
        if re.match(r"^\d+\.\s+", line_str):
            current_section = {
                "type": "section",
                "title": line_str
            }
            if current_chapter:
                current_chapter["items"].append(current_section)
            current_case = None
            current_question = None
            collecting_answer = False
            continue

        # Check for Case study header
        if line_str.startswith("الحالة الأولى") or line_str.startswith("الحالة الثانية") or line_str.startswith("الحالة"):
            case_counter += 1
            parts = line_str.split(":", 1)
            case_title = f"Case {case_counter}:"
            case_text = parts[1].strip() if len(parts) > 1 else ""
            
            current_case = {
                "type": "case",
                "title": case_title,
                "text": case_text,
                "questions": []
            }
            if current_chapter:
                current_chapter["items"].append(current_case)
            current_question = None
            collecting_answer = False
            continue

        # Check for Question
        q_match = re.match(r"^(س\d+)[:\s]+(.*)$", line_str)
        if q_match:
            q_num_ar = q_match.group(1)
            q_num_eng = q_num_ar.replace("س", "Q")
            q_text = q_match.group(2)
            current_question = {
                "type": "question",
                "num": q_num_eng,
                "text": q_text,
                "answer": []
            }
            if current_case:
                current_case["questions"].append(current_question)
            elif current_chapter:
                current_chapter["items"].append(current_question)
            collecting_answer = False
            continue

        # Check for Answer start
        if line_str.startswith("الإجابة") or line_str.startswith("الإابة"):
            parts = line_str.split(":", 1)
            ans_header_ar = parts[0]
            if "نموذجية" in ans_header_ar:
                ans_header_eng = "Model Answer:"
            else:
                ans_header_eng = "Answer:"
            
            ans_text = parts[1].strip() if len(parts) > 1 else ""
            collecting_answer = True
            if current_question:
                current_question["answer_header"] = ans_header_eng
                if ans_text:
                    current_question["answer"].append(ans_text)
            continue

        # Read contents
        if collecting_answer and current_question:
            current_question["answer"].append(line_str)
        elif current_case and not current_case["text"]:
            current_case["text"] = line_str
        elif current_case and current_case["text"]:
            current_case["text"] += " " + line_str

    # Clean empty values
    for ch in chapters:
        for item in ch["items"]:
            if item["type"] == "question":
                item["text"] = clean_and_translate_text(item["text"])
                item["answer"] = [clean_and_translate_text(line) for line in item["answer"] if line.strip()]
            elif item["type"] == "case":
                item["text"] = clean_and_translate_text(item["text"])
                for q in item["questions"]:
                    q["text"] = clean_and_translate_text(q["text"])
                    q["answer"] = [clean_and_translate_text(line) for line in q["answer"] if line.strip()]

    return chapters

def build_pdf_version(chapters, output_filename, is_answered_version=False, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com"):
    """Build the PDF document using BaseDocTemplate and PageTemplates."""
    # Define primary printable frame
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

    # First-pass background drawing callbacks (Drawn behind the text flowables)
    def on_cover_page(canvas, doc):
        canvas._page_type = 'cover'
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#0F172A")) # Dark Navy
        canvas.setLineWidth(2)
        canvas.rect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40)
        
        canvas.setStrokeColor(colors.HexColor("#F59E0B")) # Gold
        canvas.setLineWidth(1)
        canvas.rect(25, 25, PAGE_WIDTH - 50, PAGE_HEIGHT - 50)
        canvas.restoreState()

    def on_chapter_page(canvas, doc):
        canvas._page_type = 'chapter'
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#0F172A"))
        canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=True, stroke=False)
        
        # Gold stripe
        canvas.setFillColor(colors.HexColor("#F59E0B"))
        canvas.rect(0, 0, 15, PAGE_HEIGHT, fill=True, stroke=False)
        canvas.restoreState()

    def on_content_page(canvas, doc):
        canvas._page_type = 'content'

    template_cover = PageTemplate(id='CoverPage', frames=printable_frame, onPage=on_cover_page)
    template_chapter = PageTemplate(id='ChapterPage', frames=printable_frame, onPage=on_chapter_page)
    template_content = PageTemplate(id='ContentPage', frames=printable_frame, onPage=on_content_page)

    doc = BaseDocTemplate(
        output_filename,
        pagesize=A4,
        pageTemplates=[template_cover, template_chapter, template_content]
    )

    NumberedCanvas.student_name = student_name
    NumberedCanvas.student_email = student_email

    styles = getSampleStyleSheet()

    # Styles
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
        fontSize=20,
        leading=26,
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

    ch_separator_num = ParagraphStyle(
        'ChSeparatorNum',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=22,
        leading=28,
        textColor=colors.HexColor("#F59E0B"),
        alignment=1
    )

    ch_separator_title = ParagraphStyle(
        'ChSeparatorTitle',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=24,
        leading=32,
        textColor=colors.white,
        alignment=1
    )

    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0369A1"),
        spaceBefore=18,
        spaceAfter=10,
        alignment=0,
        keepWithNext=True
    )

    case_title_style = ParagraphStyle(
        'CaseTitle',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#B45309"),
        spaceBefore=8,
        spaceAfter=4,
        alignment=0,
        keepWithNext=True
    )

    case_text_style = ParagraphStyle(
        'CaseText',
        parent=styles['Normal'],
        fontName='ComicFont',
        fontSize=10,
        leading=14.5,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=10,
        alignment=0
    )

    q_text_style = ParagraphStyle(
        'QuestionText',
        parent=styles['Normal'],
        fontName='ComicFont',
        fontSize=10.5,
        leading=14.5,
        textColor=colors.HexColor("#1E293B"),
        alignment=0
    )

    ans_text_style = ParagraphStyle(
        'AnswerText',
        parent=styles['Normal'],
        fontName='ComicFont',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#000000"),
        alignment=0
    )

    story = []

    # 1. COVER PAGE (CoverPage Template is active by default)
    story.append(Spacer(1, 120))
    story.append(Paragraph("CLINOMA PLATFORM", ParagraphStyle('ClinomaEng', parent=meta_style, fontName='ComicFont-Bold', fontSize=15, spaceAfter=40)))
    story.append(Paragraph("FIRST PAPER CAMP", title_style))
    subtitle_text = "Questions & Exercises Booklet" if not is_answered_version else "Questions & Model Answers Booklet"
    story.append(Paragraph(subtitle_text, subtitle_style))
    story.append(Spacer(1, 60))
    story.append(Paragraph("Day 1: Pediatrics", meta_style))
    story.append(Paragraph("Prepared by: Clinoma Platform Team", meta_style))
    
    d_line = Table([[""]], colWidths=[150], rowHeights=[2])
    d_line.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F59E0B"))]))
    story.append(Spacer(1, 10))
    story.append(d_line)

    # Switch to Chapter page layout for Chapter 1 cover
    story.append(NextPageTemplate('ChapterPage'))
    story.append(PageBreak())

    # Iterate through Chapters
    for ch_idx, ch in enumerate(chapters):
        # 2. CHAPTER COVER PAGE
        story.append(Spacer(1, 180)) 
        ch_num_text = f"CHAPTER 0{ch_idx+1}"
        story.append(Paragraph(ch_num_text, ch_separator_num))
        story.append(Spacer(1, 10))
        
        divider = Table([[""]], colWidths=[160], rowHeights=[1.5])
        divider.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F59E0B"))]))
        story.append(divider)
        story.append(Spacer(1, 15))
        
        # Clean Chapter Title
        ch_title_raw = ch["title"]
        if ":" in ch_title_raw:
            ch_title_text = ch_title_raw.split(":", 1)[1].strip()
        else:
            ch_title_text = ch_title_raw
            
        story.append(Paragraph(ch_title_text, ch_separator_title))
        
        story.append(Spacer(1, 20))
        guide_text = Paragraph("CLINOMA PLATFORM • PREMIUM STUDY CAMP", ParagraphStyle(
            'ChGuideText',
            parent=styles['Normal'],
            fontName='ComicFont-Bold',
            fontSize=9,
            textColor=colors.HexColor("#94A3B8"),
            alignment=1
        ))
        story.append(guide_text)
        
        # Switch layout template to ContentPage for content pages of this chapter
        story.append(NextPageTemplate('ContentPage'))
        story.append(PageBreak())

        # 3. CONTENT PAGES
        for item in ch["items"]:
            if item["type"] == "section":
                story.append(Paragraph(item["title"], section_style))
            
            elif item["type"] == "case":
                case_elements = []
                case_title = item["title"]
                case_text = item["text"]
                
                case_elements.append(Paragraph(f"<b>{case_title}</b>", case_title_style))
                case_elements.append(Paragraph(case_text, case_text_style))
                case_elements.append(Spacer(1, 6))
                
                for q in item["questions"]:
                    q_num_formatted = f"<b>{q['num']}:</b> {q['text']}"
                    case_elements.append(Paragraph(q_num_formatted, q_text_style))
                    case_elements.append(Spacer(1, 4))
                    
                    if is_answered_version:
                        ans_header = q.get("answer_header", "Answer:")
                        ans_lines_formatted = []
                        for line in q["answer"]:
                            if len(q["answer"]) > 1:
                                ans_lines_formatted.append(f"• {line}")
                            else:
                                ans_lines_formatted.append(line)
                        ans_full = "<br/>".join(ans_lines_formatted)
                        
                        ans_box_data = [[Paragraph(f"<b>{ans_header}</b><br/>{ans_full}", ans_text_style)]]
                        ans_table = Table(ans_box_data, colWidths=[PAGE_WIDTH - 120])
                        ans_table.setStyle(TableStyle([
                            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDFA")),
                            ('LEFTPADDING', (0,0), (-1,-1), 10),
                            ('RIGHTPADDING', (0,0), (-1,-1), 10),
                            ('TOPPADDING', (0,0), (-1,-1), 8),
                            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                            ('LINELEFT', (0,0), (-1,-1), 3, colors.HexColor("#0D9488")),
                        ]))
                        case_elements.append(ans_table)
                        case_elements.append(Spacer(1, 8))
                    else:
                        dotted_lines = Table([[""], [""], [""]], colWidths=[PAGE_WIDTH - 120], rowHeights=[18, 18, 18])
                        dotted_lines.setStyle(TableStyle([
                            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1"), 0, (2, 2)),
                            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                        ]))
                        case_elements.append(dotted_lines)
                        case_elements.append(Spacer(1, 10))
                
                case_container_table = Table([[case_elements]], colWidths=[PAGE_WIDTH - 90])
                case_container_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFFBEB")),
                    ('LEFTPADDING', (0,0), (-1,-1), 12),
                    ('RIGHTPADDING', (0,0), (-1,-1), 12),
                    ('TOPPADDING', (0,0), (-1,-1), 10),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                    ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#F59E0B")),
                ]))
                
                story.append(KeepTogether([case_container_table, Spacer(1, 15)]))
            
            elif item["type"] == "question":
                q_num_formatted = f"<b>{item['num']}:</b> {item['text']}"
                
                q_elements = []
                q_elements.append(Paragraph(q_num_formatted, q_text_style))
                q_elements.append(Spacer(1, 6))
                
                if is_answered_version:
                    ans_header = item.get("answer_header", "Model Answer:")
                    ans_lines_formatted = []
                    for line in item["answer"]:
                        if len(item["answer"]) > 1:
                            ans_lines_formatted.append(f"• {line}")
                        else:
                            ans_lines_formatted.append(line)
                    ans_full = "<br/>".join(ans_lines_formatted)
                    
                    ans_box_data = [[Paragraph(f"<b>{ans_header}</b><br/>{ans_full}", ans_text_style)]]
                    ans_table = Table(ans_box_data, colWidths=[PAGE_WIDTH - 90])
                    ans_table.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
                        ('LEFTPADDING', (0,0), (-1,-1), 10),
                        ('RIGHTPADDING', (0,0), (-1,-1), 10),
                        ('TOPPADDING', (0,0), (-1,-1), 8),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                        ('LINELEFT', (0,0), (-1,-1), 3, colors.HexColor("#0369A1")),
                    ]))
                    q_elements.append(ans_table)
                    q_elements.append(Spacer(1, 14))
                else:
                    dotted_lines = Table([[""], [""], [""], [""]], colWidths=[PAGE_WIDTH - 90], rowHeights=[20, 20, 20, 20])
                    dotted_lines.setStyle(TableStyle([
                        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#94A3B8"), 0, (2, 2)),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                    ]))
                    q_elements.append(dotted_lines)
                    q_elements.append(Spacer(1, 16))
                
                story.append(KeepTogether(q_elements))
        
        # If there are more chapters, switch back to ChapterPage template for the next chapter cover
        if ch_idx < len(chapters) - 1:
            story.append(NextPageTemplate('ChapterPage'))
            story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    import sys
    
    input_file = "d:/Med Prep/اسئلة معسكر اليوم الاول.txt"
    output_q = "d:/Med Prep/معسكر_الورقة_الأولى_اليوم_الأول_أسئلة.pdf"
    output_a = "d:/Med Prep/معسكر_الورقة_الأولى_اليوم_الأول_إجابات.pdf"
    
    # Default generic placeholders (will be overridden by CLI args from the platform)
    student_name = "Student Name"
    student_email = "student@email.com"
    
    # CLI Format: python generate_camp_pdfs.py [name] [email] [output_q_path] [output_a_path]
    if len(sys.argv) > 1:
        student_name = sys.argv[1]
    if len(sys.argv) > 2:
        student_email = sys.argv[2]
    if len(sys.argv) > 3:
        output_q = sys.argv[3]
    if len(sys.argv) > 4:
        output_a = sys.argv[4]
    
    print("Parsing questions file...")
    chapters = parse_questions_file(input_file)
    print(f"Successfully parsed {len(chapters)} chapters.")
    
    print("Generating Questions booklet (English Comic version)...")
    build_pdf_version(chapters, output_q, is_answered_version=False, student_name=student_name, student_email=student_email)
    print("Successfully generated Questions booklet.")
    
    print("Generating Answers booklet (English Comic version)...")
    build_pdf_version(chapters, output_a, is_answered_version=True, student_name=student_name, student_email=student_email)
    print("Successfully generated Answers booklet.")
    
    print("All tasks completed successfully!")
