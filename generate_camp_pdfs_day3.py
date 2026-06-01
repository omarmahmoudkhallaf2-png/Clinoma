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

PAGE_WIDTH, PAGE_HEIGHT = A4

COMIC_PATH = "C:/Windows/Fonts/comic.ttf"
COMIC_BOLD_PATH = "C:/Windows/Fonts/comicbd.ttf"

if not os.path.exists(COMIC_PATH):
    COMIC_PATH = "C:/Windows/Fonts/arial.ttf"
if not os.path.exists(COMIC_BOLD_PATH):
    COMIC_BOLD_PATH = "C:/Windows/Fonts/arialbd.ttf"

pdfmetrics.registerFont(TTFont('ComicFont', COMIC_PATH))
pdfmetrics.registerFont(TTFont('ComicFont-Bold', COMIC_BOLD_PATH))

def clean_text(text):
    if not text:
        return ""
    return text.strip()

class NumberedCanvas(canvas.Canvas):
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
            pass
        elif page_type == 'chapter':
            pass
        elif page_type == 'content':
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
            
            self.setFillColor(colors.HexColor("#F0F9FF"))
            self.setStrokeColor(colors.HexColor("#bae6fd"))
            self.setLineWidth(0.5)
            self.roundRect(margin + 5, header_y, box_w, box_h, 3, fill=True, stroke=True)
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

def parse_questions_file_day3(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Filter out duplicate lines[73:139] (which is lines 74 to 139 in 1-based indexing)
    # Let's do this by ignoring index 73 to 138 (inclusive)
    cleaned_lines = []
    for i, line in enumerate(lines):
        if 73 <= i <= 138:
            continue
        cleaned_lines.append(line.strip())

    chapters = []
    current_chapter = None
    current_section = None
    current_case = None
    current_question = None
    current_emg = None
    collecting_answer = False

    # Helper to clean up string structures
    chapter1 = {"title": "Pediatric Neurology", "items": []}
    chapter2 = {"title": "Pediatric Cardiology (CVS)", "items": []}
    
    current_chapter = chapter1
    chapters.append(chapter1)

    i = 0
    while i < len(cleaned_lines):
        line = cleaned_lines[i]
        if not line:
            i += 1
            continue

        # Check for CVS chapter break
        if "CHAPTER  CVS" in line:
            current_chapter = chapter2
            chapters.append(chapter2)
            current_section = None
            current_case = None
            current_question = None
            current_emg = None
            collecting_answer = False
            i += 1
            continue

        # Section headers
        if re.match(r"^\d+\.\s+Short\s+Essay", line) or \
           re.match(r"^\d+\.\s+Short\s+Answer", line) or \
           re.match(r"^\d+\.\s+Extended\s+Matching", line) or \
           re.match(r"^\d+\.\s+Problem\s+Solving", line) or \
           re.match(r"^\d+\.\s+Definitions", line):
            
            current_section = {
                "type": "section",
                "title": line
            }
            current_chapter["items"].append(current_section)
            current_case = None
            current_question = None
            current_emg = None
            collecting_answer = False
            i += 1
            continue

        # Case studies
        if line.startswith("Case "):
            current_case = {
                "type": "case",
                "title": line,
                "text": "",
                "questions": []
            }
            current_chapter["items"].append(current_case)
            current_question = None
            current_emg = None
            collecting_answer = False
            
            # Read case text
            i += 1
            text_lines = []
            while i < len(cleaned_lines) and not cleaned_lines[i].startswith("Questions & Answers:"):
                text_lines.append(cleaned_lines[i])
                i += 1
            current_case["text"] = " ".join(text_lines).strip()
            i += 1 # skip "Questions & Answers:"
            continue

        # Inside Cases, read Question and Answer pairs
        if current_case is not None:
            # We expect a question line, followed by an answer line
            q_text = line
            i += 1
            ans_text = ""
            if i < len(cleaned_lines):
                ans_text = cleaned_lines[i]
            
            current_case["questions"].append({
                "question": q_text,
                "answer": ans_text
            })
            i += 1
            continue

        # EMG options / scenarios
        if line.startswith("Options:"):
            current_emg = {
                "type": "emg",
                "options": line.replace("Options:", "").strip(),
                "instruction": "",
                "pairs": []
            }
            current_chapter["items"].append(current_emg)
            i += 1
            if i < len(cleaned_lines) and "Match the following" in cleaned_lines[i]:
                current_emg["instruction"] = cleaned_lines[i]
                i += 1
            continue

        if current_emg is not None:
            # A pair of scenario text and answer
            scenario = line
            i += 1
            ans_line = ""
            if i < len(cleaned_lines) and cleaned_lines[i].startswith("Answer:"):
                ans_line = cleaned_lines[i].replace("Answer:", "").strip()
            current_emg["pairs"].append({
                "scenario": scenario,
                "answer": ans_line
            })
            i += 1
            continue

        # Standard Questions & Definitions
        q_match = re.match(r"^(Q\d+|Define)\.?\s+(.*)$", line)
        if q_match:
            q_num = q_match.group(1)
            q_text = q_match.group(2)
            current_question = {
                "type": "question",
                "num": q_num,
                "text": q_text,
                "answer": []
            }
            current_chapter["items"].append(current_question)
            collecting_answer = False
            i += 1
            continue

        if line.startswith("Answer:"):
            collecting_answer = True
            ans_text = line.replace("Answer:", "").strip()
            if current_question and ans_text:
                current_question["answer"].append(ans_text)
            i += 1
            continue

        if collecting_answer and current_question:
            current_question["answer"].append(line)
            i += 1
        else:
            i += 1

    # Cleanup empty/invalid chapters
    chapters = [ch for ch in chapters if ch["items"]]
    return chapters

def build_pdf_version(chapters, output_filename, is_answered_version=False, student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com"):
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

    def on_chapter_page(canvas, doc):
        canvas._page_type = 'chapter'
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#0F172A"))
        canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=True, stroke=False)
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
        textColor=colors.HexColor("#115E59"),
        alignment=0
    )

    emg_options_style = ParagraphStyle(
        'EMGOptions',
        parent=styles['Normal'],
        fontName='ComicFont-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=6
    )

    story = []

    # 1. COVER PAGE
    story.append(Spacer(1, 120))
    story.append(Paragraph("CLINOMA PLATFORM", ParagraphStyle('ClinomaEng', parent=meta_style, fontName='ComicFont-Bold', fontSize=15, spaceAfter=40)))
    story.append(Paragraph("FIRST PAPER CAMP", title_style))
    subtitle_text = "Questions & Exercises Booklet" if not is_answered_version else "Questions & Model Answers Booklet"
    story.append(Paragraph(subtitle_text, subtitle_style))
    story.append(Spacer(1, 60))
    story.append(Paragraph("Day 3: Neurology & Cardiology (CVS)", meta_style))
    story.append(Paragraph("Prepared by: Clinoma Platform Team", meta_style))
    
    d_line = Table([[""]], colWidths=[150], rowHeights=[2])
    d_line.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F59E0B"))]))
    story.append(Spacer(1, 10))
    story.append(d_line)

    # Switch to Chapter cover template
    story.append(NextPageTemplate('ChapterPage'))
    story.append(PageBreak())

    # Iterate through Chapters
    for ch_idx, ch in enumerate(chapters):
        story.append(Spacer(1, 180)) 
        ch_num_text = f"CHAPTER 0{ch_idx+1}"
        story.append(Paragraph(ch_num_text, ch_separator_num))
        story.append(Spacer(1, 10))
        
        divider = Table([[""]], colWidths=[160], rowHeights=[1.5])
        divider.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F59E0B"))]))
        story.append(divider)
        story.append(Spacer(1, 15))
        
        story.append(Paragraph(ch["title"], ch_separator_title))
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
        
        story.append(NextPageTemplate('ContentPage'))
        story.append(PageBreak())

        # Content items
        for item in ch["items"]:
            if item["type"] == "section":
                if "Extended Matching Questions" in item["title"] or "EMG" in item["title"]:
                    continue
                story.append(Paragraph(item["title"], section_style))
            
            elif item["type"] == "case":
                case_elements = []
                case_title = item["title"]
                case_text = item["text"]
                
                case_elements.append(Paragraph(f"<b>{case_title}</b>", case_title_style))
                case_elements.append(Paragraph(case_text, case_text_style))
                case_elements.append(Spacer(1, 6))
                
                for q_idx, q in enumerate(item["questions"]):
                    q_num_formatted = f"<b>Q{q_idx+1}:</b> {q['question']}"
                    case_elements.append(Paragraph(q_num_formatted, q_text_style))
                    case_elements.append(Spacer(1, 4))
                    
                    if is_answered_version:
                        ans_full = q["answer"]
                        ans_box_data = [[Paragraph(f"<b>Answer:</b><br/>{ans_full}", ans_text_style)]]
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
                        dotted_lines = Table([[""], [""]], colWidths=[PAGE_WIDTH - 120], rowHeights=[18, 18])
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

            elif item["type"] == "emg":
                continue
            
            elif item["type"] == "question":
                q_num_formatted = f"<b>{item['num']}:</b> {item['text']}"
                q_elements = [Paragraph(q_num_formatted, q_text_style), Spacer(1, 6)]
                
                if is_answered_version:
                    ans_lines_formatted = []
                    for line in item["answer"]:
                        if len(item["answer"]) > 1:
                            ans_lines_formatted.append(f"• {line}")
                        else:
                            ans_lines_formatted.append(line)
                    ans_full = "<br/>".join(ans_lines_formatted)
                    
                    ans_box_data = [[Paragraph(f"<b>Answer:</b><br/>{ans_full}", ans_text_style)]]
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
        
        if ch_idx < len(chapters) - 1:
            story.append(NextPageTemplate('ChapterPage'))
            story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    import sys
    
    input_file = "d:/Med Prep/اسئلة المعسكر اليوم الثالت.txt"
    output_q = "d:/Med Prep/معسكر_الورقة_الأولى_اليوم_الثالث_أسئلة.pdf"
    output_a = "d:/Med Prep/معسكر_الورقة_الأولى_اليوم_الثالث_إجابات.pdf"
    
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
        
    print("Parsing Day 3 questions file...")
    chapters = parse_questions_file_day3(input_file)
    print(f"Successfully parsed {len(chapters)} chapters.")
    
    print("Generating Questions booklet...")
    build_pdf_version(chapters, output_q, is_answered_version=False, student_name=student_name, student_email=student_email)
    print("Successfully generated Questions booklet.")
    
    print("Generating Answers booklet...")
    build_pdf_version(chapters, output_a, is_answered_version=True, student_name=student_name, student_email=student_email)
    print("Successfully generated Answers booklet.")
    print("Done!")
