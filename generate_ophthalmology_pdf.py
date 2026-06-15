import os
import sys
import json
import re
import urllib.request
import shutil
from collections import defaultdict

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4

# Use the same landscape slide dimensions as the second paper PDF
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
            
            # 1. Save the story flowables code
            saved_code = self._code
            
            # 2. Reset code to draw background first
            self._code = []
            self.draw_page_background(self._pageNumber)
            background_code = self._code
            
            # 3. Concatenate background code + flowables code
            self._code = background_code + saved_code
            
            # 4. Draw page elements (header, footer, security boxes) on top
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
            # COVER PAGE BACKGROUND
            cover_img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "غلاف رمد.png")
            if os.path.exists(cover_img_path):
                self.drawImage(cover_img_path, 0, 0, width, height)
            else:
                self.setFillColor(colors.HexColor("#FFFFFF"))
                self.rect(0, 0, width, height, fill=True, stroke=False)
                self.draw_dotted_grid(width, height, "#F1F5F9", spacing=24)
            
        elif p in [2, 3]:
            # INDEX PAGE BACKGROUND
            self.setFillColor(colors.HexColor("#FFFFFF"))
            self.rect(0, 0, width, height, fill=True, stroke=False)
            self.draw_dotted_grid(width, height, "#F8FAFC", spacing=24)
            
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.8)
            self.rect(20, 20, width - 40, height - 40)
            
        elif is_chapter_page:
            # CHAPTER COVER PAGE BACKGROUND
            self.setFillColor(colors.HexColor("#F3F7FC"))
            self.rect(0, 0, width, height, fill=True, stroke=False)
            self.draw_dotted_grid(width, height, "#DDE7F5", spacing=24)
            
            # Accent line
            self.setFillColor(colors.HexColor("#A3C4F3")) 
            self.rect(0, 0, 8, height, fill=True, stroke=False)
            
            # Geometric circles
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
        chapter_name = getattr(self, '_current_chapter', "تحديدات الرمد")
        slide_title = getattr(self, '_slide_title', "")
        p = self._pageNumber
        
        self.saveState()
        width, height = CUSTOM_PAGE_SIZE
        
        student_name = getattr(self, '_student_name', "Mohamed Ahmed")
        student_email = getattr(self, '_student_email', "mohamed.ahmed@gmail.com")
        
        if p == 1:
            pass
        elif p in [2, 3]:
            # INDEX PAGE HEADER
            self.setFont("Times-Bold", 11)
            self.setFillColor(colors.HexColor("#171717"))
            self.drawString(40, height - 42, f"CLINOMA • OPHTHALMOLOGY INDEX (PART {p-1})")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#737373"))
            self.drawRightString(width - 40, height - 42, "Flashspace Study Guide")
        elif is_chapter_page:
            pass
        else:
            # CONTENT PAGE DESIGN
            self.setFont("Times-BoldItalic", 9.5)
            self.setFillColor(colors.HexColor("#0F172A"))
            global_num = getattr(self, '_slide_global_number', 0)
            num_str = f"SLIDE {global_num} • " if global_num else ""
            self.drawString(30, height - 25, f"{chapter_name.upper()} • {num_str}{slide_title.upper()}")
            
            # Header Security Pill Boxes
            header_y = height - 31
            box_h = 13
            box_w = 170
            
            # Left Box
            self.setFillColor(colors.HexColor("#F8FAFC"))
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.roundRect(width - 30 - (2 * box_w) - 10, header_y, box_w, box_h, 3, fill=True, stroke=True)
            
            # Right Box
            self.roundRect(width - 30 - box_w, header_y, box_w, box_h, 3, fill=True, stroke=True)
            
            # Text inside
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
            
            # Header line
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.8)
            self.line(30, height - 37, width - 30, height - 37)
            
            # Footer
            self.setStrokeColor(colors.HexColor("#F1F5F9"))
            self.setLineWidth(0.6)
            self.line(30, 36, width - 30, 36)
            
            self.setFont("Helvetica-Bold", 6.5)
            self.setFillColor(colors.HexColor("#94A3B8"))
            self.drawString(30, 22, "SECURED DIGITAL EDITION • CLINOMA PLATFORM")
            
            page_str = f"Page {p} of {page_count}"
            self.drawRightString(width - 30, 22, page_str)
            
        self.restoreState()

def process_slide_image(img_path, target_width=740, target_height=380, radius=12, temp_dir="", compress=False):
    """Pad and round image corners using PIL to fit cleanly in ReportLab with high DPI."""
    if not os.path.exists(img_path):
        return img_path
        
    scale_factor = 1.5 if compress else 3
    quality_val = 80 if compress else 95
    base_name = os.path.basename(img_path)
    temp_path = os.path.join(temp_dir, f"proc_{'comp' if compress else 'hq'}_{scale_factor}_{base_name}")
    
    if os.path.exists(temp_path):
        return temp_path
        
    try:
        from PIL import Image as PILImage, ImageDraw
        with PILImage.open(img_path) as im:
            im = im.convert("RGB")
            
            # Apply scale factor to targets for high resolution
            hr_w = int(target_width * scale_factor)
            hr_h = int(target_height * scale_factor)
            hr_radius = int(radius * scale_factor)
            
            im_ratio = im.width / im.height
            target_ratio = hr_w / hr_h
            
            if im_ratio > target_ratio:
                new_w = hr_w
                new_h = int(hr_w / im_ratio)
            else:
                new_h = hr_h
                new_w = int(hr_h * im_ratio)
                
            im_resized = im.resize((new_w, new_h), PILImage.Resampling.LANCZOS)
            
            canvas_im = PILImage.new("RGB", (hr_w, hr_h), (255, 255, 255))
            paste_x = (hr_w - new_w) // 2
            paste_y = (hr_h - new_h) // 2
            canvas_im.paste(im_resized, (paste_x, paste_y))
            
            mask = PILImage.new('L', (hr_w, hr_h), 0)
            draw = ImageDraw.Draw(mask)
            draw.rounded_rectangle([0, 0, hr_w - 1, hr_h - 1], radius=hr_radius, fill=255)
            
            output_im = PILImage.new("RGB", (hr_w, hr_h), (255, 255, 255))
            output_im.paste(canvas_im, mask=mask)
            
            draw_border = ImageDraw.Draw(output_im)
            draw_border.rounded_rectangle([0, 0, hr_w - 1, hr_h - 1], radius=hr_radius, outline=(226, 232, 240), width=max(1, int(scale_factor)))
            
            output_im.save(temp_path, "JPEG", quality=quality_val, optimize=True)
            return temp_path
    except Exception as e:
        print(f"Error processing image {img_path}: {e}")
        return img_path

def generate_placeholder_image(topic_name, target_width=740, target_height=380, temp_dir=""):
    """Generate a clean placeholder image if no image was found for a topic."""
    safe_name = "".join(c for c in topic_name if c.isalnum() or c in (" ", "_")).strip()
    temp_path = os.path.join(temp_dir, f"placeholder_{safe_name}.jpg")
    
    if os.path.exists(temp_path):
        return temp_path
        
    try:
        from PIL import Image as PILImage, ImageDraw
        canvas_im = PILImage.new("RGB", (target_width, target_height), (250, 250, 250))
        draw = ImageDraw.Draw(canvas_im)
        
        # Draw dotted grid
        for x in range(0, target_width, 20):
            for y in range(0, target_height, 20):
                draw.ellipse([x-1, y-1, x+1, y+1], fill=(230, 230, 230))
                
        # Draw border
        draw.rounded_rectangle([0, 0, target_width-1, target_height-1], radius=12, outline=(226, 232, 240), width=2)
        
        # Draw placeholder text
        text = f"Slide Image Coming Soon\n\nTopic: {topic_name}"
        draw.text((target_width/2, target_height/2), text, fill=(115, 115, 115), anchor="mm", align="center")
        
        canvas_im.save(temp_path, "JPEG", quality=85)
        return temp_path
    except Exception as e:
        print(f"Error generating placeholder for {topic_name}: {e}")
        return None

def normalize(s):
    s = s.lower()
    s = re.sub(r'[^a-z0-9]', '', s)
    return s

def get_words(s):
    return set(re.findall(r'[a-z0-9]+', s.lower()))

def build_pdf(student_name="Mohamed Ahmed", student_email="mohamed.ahmed@gmail.com", compress=False):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    temp_img_dir = os.path.join(script_dir, "temp_romod_imgs")
    if not os.path.exists(temp_img_dir):
        os.makedirs(temp_img_dir)
        
    # Load boards data
    boards_path = r"C:\Users\droma\Desktop\ophthalmology_boards.json"
    with open(boards_path, "r", encoding="utf-8") as f:
        boards = json.load(f)
        
    # Parse ترتيب الرمد.txt
    tartib_path = os.path.join(script_dir, "ترتيب الرمد.txt")
    with open(tartib_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    chapters = []
    current_chapter = None
    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue
        if line_str.startswith("Chapter "):
            current_chapter = {
                "title": line_str,
                "slides": []
            }
            chapters.append(current_chapter)
        else:
            m = re.match(r"^\s*(\d+)\.\s*(.*)$", line_str)
            if m:
                topic_name = m.group(2).strip()
                if current_chapter:
                    current_chapter["slides"].append(topic_name)

    print(f"Parsed {len(chapters)} chapters from ترتيب الرمد.txt")
    
    # Specifically find Optic Atrophy to replace the duplicated Optic Neuritis
    optic_atrophy_board = None
    for b in boards:
        if "optic atrophy" in b.get("disease", "").lower():
            optic_atrophy_board = b
            break
            
    # Resolve slides
    resolved_chapters = []
    total_slides = 0
    
    for ch_idx, ch in enumerate(chapters):
        res_ch = {
            "title": ch["title"],
            "slides": []
        }
        
        for slide_idx, topic in enumerate(ch["slides"]):
            # Special case for duplicated Optic Neuritis in Chapter 12
            if ch_idx == 11 and slide_idx == 4 and "optic neuritis" in topic.lower():
                board = optic_atrophy_board
                topic = "Optic Atrophy (Primary and Secondary)"
            else:
                # 3-step matching logic
                nt = normalize(topic)
                words_t = get_words(topic)
                
                # 1. Exact normalized match
                board = None
                for b in boards:
                    nb = normalize(b.get("disease", ""))
                    if nt == nb:
                        board = b
                        break
                        
                # 2. Substring match
                if not board:
                    for b in boards:
                        nb = normalize(b.get("disease", ""))
                        if nt in nb or nb in nt:
                            board = b
                            break
                            
                # 3. Word overlap match (if at least 60% of the shorter word set matches)
                if not board:
                    best_overlap = 0
                    best_board = None
                    for b in boards:
                        words_b = get_words(b.get("disease", ""))
                        intersection = words_t.intersection(words_b)
                        if intersection:
                            overlap = len(intersection) / min(len(words_t), len(words_b))
                            if overlap > 0.6 and overlap > best_overlap:
                                best_overlap = overlap
                                best_board = b
                    if best_board:
                        board = best_board
                
            img_local_path = None
            if board and board.get("medicalImage"):
                img_url = board["medicalImage"]
                # Create a safe file name
                safe_id = board["id"]
                file_ext = ".jpg"
                if ".png" in img_url.lower():
                    file_ext = ".png"
                elif ".webp" in img_url.lower():
                    file_ext = ".webp"
                
                img_local_path = os.path.join(temp_img_dir, f"{safe_id}{file_ext}")
                
                # Download if not cached
                if not os.path.exists(img_local_path):
                    print(f"Downloading image for {topic}...")
                    try:
                        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                        req = urllib.request.Request(img_url, headers=headers)
                        with urllib.request.urlopen(req, timeout=15) as response:
                            with open(img_local_path, 'wb') as out_f:
                                out_f.write(response.read())
                    except Exception as e:
                        print(f"Error downloading {img_url}: {e}")
                        img_local_path = None
            
            # Generate placeholder if no image could be downloaded or matched
            if not img_local_path or not os.path.exists(img_local_path):
                img_local_path = generate_placeholder_image(topic, temp_dir=temp_img_dir)
                
            res_ch["slides"].append({
                "title": topic,
                "image_path": img_local_path
            })
            total_slides += 1
            
        resolved_chapters.append(res_ch)
        
    print(f"Resolved {total_slides} slides across {len(resolved_chapters)} chapters.")
    
    # Pre-calculate pages
    # Page 1: Cover, Page 2: Index Part 1, Page 3: Index Part 2
    current_page = 4
    slide_global_counter = 1
    for ch in resolved_chapters:
        ch["start_page"] = current_page
        ch_pages = 1 + len(ch["slides"]) # 1 separator page + N slides
        ch["end_page"] = current_page + ch_pages - 1
        
        slide_page = current_page + 1
        for slide in ch["slides"]:
            slide["page"] = slide_page
            slide["global_number"] = slide_global_counter
            slide_global_counter += 1
            slide_page += 1
            
        current_page += ch_pages
        
    # Build Story
    styles = getSampleStyleSheet()
    
    index_title_style = ParagraphStyle(
        'IndexTitle',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#171717"),
        spaceAfter=4
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
        fontSize=8.5,
        leading=10,
        textColor=colors.HexColor("#171717")
    )
    index_chapter_page_style = ParagraphStyle(
        'IndexChPage',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=8.0,
        leading=10,
        textColor=colors.HexColor("#4F75A2"),
        alignment=2
    )
    index_slide_title_style = ParagraphStyle(
        'IndexSlideTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8.0,
        textColor=colors.HexColor("#404040")
    )
    index_slide_page_style = ParagraphStyle(
        'IndexSlidePage',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8.0,
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
    
    # ---------------- PAGE 2: TABLE OF CONTENTS (INDEX PART 1) ----------------
    story.append(Spacer(1, 15))
    story.append(Paragraph("TABLE OF CONTENTS (PART 1)", index_title_style))
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
                slide_title_p = Paragraph(f"<font color='#94A3B8'>#{slide['global_number']}</font> {slide['title']}", index_slide_title_style)
                slide_page_p = Paragraph(f"p. {slide['page']}", index_slide_page_style)
                table_data.append([slide_title_p, slide_page_p])
            
            table_data.append(["", ""])
            
        if table_data and table_data[-1] == ["", ""]:
            table_data.pop()
            
        t = Table(table_data, colWidths=[col_width - 30, 30])
        
        style_cmds = [
            ('LINEBELOW', (0, 0), (-1, 0), 1.0, colors.HexColor("#737373")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0.3),
            ('TOPPADDING', (0, 0), (-1, -1), 0.3),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ]
        
        row_idx = 1
        for ch in group_chapters:
            style_cmds.append(('LINEBELOW', (0, row_idx), (-1, row_idx), 0.6, colors.HexColor("#A3C4F3")))
            style_cmds.append(('TOPPADDING', (0, row_idx), (-1, row_idx), 3.0))
            style_cmds.append(('BOTTOMPADDING', (0, row_idx), (-1, row_idx), 1.5))
            
            start_slide_row = row_idx + 1
            num_slides = len(ch["slides"])
            for s_idx in range(start_slide_row, start_slide_row + num_slides):
                style_cmds.append(('LINEBELOW', (0, s_idx), (-1, s_idx), 0.25, colors.HexColor("#E5E5E5")))
                
            row_idx += 1 + num_slides + 1
            
        t.setStyle(TableStyle(style_cmds))
        return t
        
    # Page 2: Chapters 1 to 7
    # Column 1: Ch 1-2, Column 2: Ch 3-4, Column 3: Ch 5-7
    t_col1_p1 = make_column_table(resolved_chapters[0:2], col_w)
    t_col2_p1 = make_column_table(resolved_chapters[2:4], col_w)
    t_col3_p1 = make_column_table(resolved_chapters[4:7], col_w)
    
    inner_table_data = [[t_col1_p1, "", t_col2_p1, "", t_col3_p1]]
    inner_table = Table(inner_table_data, colWidths=[col_w, 20, col_w, 20, col_w])
    inner_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
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
    story.append(PageBreak())
    
    # ---------------- PAGE 3: TABLE OF CONTENTS (INDEX PART 2) ----------------
    story.append(Spacer(1, 15))
    story.append(Paragraph("TABLE OF CONTENTS (PART 2)", index_title_style))
    story.append(Spacer(1, 4))
    
    # Page 3: Chapters 8 to 13
    # Column 1: Ch 8-9, Column 2: Ch 10-11, Column 3: Ch 12-13
    t_col1_p2 = make_column_table(resolved_chapters[7:9], col_w)
    t_col2_p2 = make_column_table(resolved_chapters[9:11], col_w)
    t_col3_p2 = make_column_table(resolved_chapters[11:13], col_w)
    
    inner_table_data_p2 = [[t_col1_p2, "", t_col2_p2, "", t_col3_p2]]
    inner_table_p2 = Table(inner_table_data_p2, colWidths=[col_w, 20, col_w, 20, col_w])
    inner_table_p2.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    master_table_p2 = Table([[inner_table_p2]], colWidths=[outer_table_w])
    master_table_p2.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), padding_side),
        ('RIGHTPADDING', (0, 0), (-1, -1), padding_side),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    
    story.append(master_table_p2)
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
    current_compiled_page = 4
    
    for i, ch in enumerate(resolved_chapters):
        # 1. Chapter Separator Page
        story.append(Spacer(1, 120))
        story.append(Paragraph(f"CHAPTER 0{i+1}" if i < 9 else f"CHAPTER {i+1}", chapter_subtitle_style))
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
            img_path = slide["image_path"]
            img_w = 740
            img_h = 380
            
            story.append(Spacer(1, 22))
            
            # Apply padding & rounded corners via PIL
            processed_path = process_slide_image(img_path, target_width=img_w, target_height=img_h, radius=12, temp_dir=temp_img_dir, compress=compress)
            story.append(Image(processed_path, width=img_w, height=img_h))
            
            page_to_chapter_mapping[current_compiled_page] = {
                "type": "content",
                "chapter": ch["title"],
                "slide_title": slide["title"],
                "global_number": slide["global_number"]
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
        if p in [1, 2, 3]:
            canvas._is_chapter_page = False
            canvas._slide_title = ""
            canvas._slide_global_number = 0
        else:
            mapping = page_to_chapter_mapping.get(p, {"type": "content", "chapter": "تحديدات الرمد", "slide_title": "", "global_number": 0})
            canvas._slide_title = mapping["slide_title"]
            canvas._slide_global_number = mapping.get("global_number", 0)
            if mapping["type"] == "cover":
                canvas._is_chapter_page = True
                canvas._current_chapter = mapping["chapter"]
            else:
                canvas._is_chapter_page = False
                canvas._current_chapter = mapping["chapter"]
            
    template = PageTemplate(id='all_pages', frames=max_frame, onPage=onPage)
    
    filename_base = "تحديدات_الرمد_مضغوط.pdf" if compress else "تحديدات_الرمد.pdf"
    output_filename = os.path.join(script_dir, filename_base)
    doc = BaseDocTemplate(output_filename, pagesize=CUSTOM_PAGE_SIZE, pageTemplates=[template])
    doc._student_name = student_name
    doc._student_email = student_email
    doc.build(story, canvasmaker=LuxurySecurityCanvas)
    
    print(f"SUCCESS! {output_filename} generated successfully.")

if __name__ == "__main__":
    name = "Mohamed Ahmed"
    email = "mohamed.ahmed@gmail.com"
    if len(sys.argv) > 1:
        name = sys.argv[1]
    if len(sys.argv) > 2:
        email = sys.argv[2]
        
    print("Building standard high-resolution PDF...")
    build_pdf(name, email, compress=False)
    
    print("Building compressed high-resolution PDF...")
    build_pdf(name, email, compress=True)
