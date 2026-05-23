import fitz
import re
import json

doc = fitz.open("clinical_nutrition.pdf")
full_text_by_page = []
for page in doc:
    full_text_by_page.append(page.get_text())

# We will define ranges of pages or use a state machine that detects chapter boundaries and question indices.
# Let's inspect the pages to assign the correct chapter (lectureNumber) to each page.
# Page indices are 0-based.
# Page 1 (index 0) - Page 3 (index 2) Q16: Chapter 1
# Page 3 (index 2) Q1 - Page 6 (index 5) Q20: Chapter 2
# Page 7 (index 6) Q1 - Page 9 (index 8) Q14: Chapter 3
# Page 9 (index 8) Q1 - Page 11 (index 10) Q12: Chapter 4 (Wait, let's verify how many questions in Chapter 4)
# Page 12 (index 11) Q1 - Page 14 (index 13) Q15: Chapter 5
# Page 15 (index 14) Q1 - Page 18 (index 17) Q21: Chapter 6 (Wait, let's check Page 18)
# Page 19 (index 18) Q1 - Page 23 (index 22) Q25: Chapter 7 & 8
# Page 24 (index 23) Q1 - Page 28 (index 27) Q30: Chapter 9
# Page 28 (index 27) Q31 - Page 30 (index 29) Q40: Review / Mixed Questions (we can assign these to Chapter 9 or a separate Review chapter)

# Let's write a robust line-by-line parser for each page.
questions = []
current_chapter = "Chapter 1"
lecture_number = 1

# Let's check page boundaries and page content.
# We will parse questions page by page.
# For each page, we split it into lines.
# We look for a line starting with a number like "1.", "2.", "31-" and ending with "?" or similar, or just being the question.
# But sometimes questions span multiple lines!
# So we should group lines.
# Let's write a parser that processes a page's text as a single string and splits it by questions.
# Question pattern:
# A question starts with a number at the start of a line (or with asterisks like `1. *...*` or just `1. ...` or `31- ...`).
# Followed by options: A/B/C/D or a/b/c/d.
# Followed by Answer: ...
# Let's write a python parser using regex to extract questions from each page.

def parse_page_questions(page_text, page_num):
    # Regex to find questions on the page.
    # A question starts with a number: e.g. "1." or "12." or "31-" or "1 ." or "38--"
    # Let's split the text by question numbers.
    # We want to match:
    # 1. Any number at the beginning of a line (with optional spaces, dots, dashes, or asterisks)
    # Let's find all occurrences of question start patterns:
    # e.g., \n\s*(\d+)\s*[\.\-]+\s*
    # Let's do a findall or split.
    
    # We can split the page text using a regex that matches question headers, but we must keep the header info.
    # Let's find the positions of all question starts on the page.
    pattern = r'(?:^|\n)\s*(\d+)\s*[\.\-]+\s*'
    matches = list(re.finditer(pattern, page_text))
    
    page_questions = []
    
    for i in range(len(matches)):
        start_idx = matches[i].start()
        end_idx = matches[i+1].start() if i + 1 < len(matches) else len(page_text)
        
        q_text_block = page_text[start_idx:end_idx].strip()
        page_questions.append(q_text_block)
        
    return page_questions

print("Parsing pages...")
all_extracted = []
for idx, page_text in enumerate(full_text_by_page):
    page_num = idx + 1
    page_qs = parse_page_questions(page_text, page_num)
    print(f"Page {page_num}: Found {len(page_qs)} raw question blocks.")
    for q_block in page_qs:
        all_extracted.append((page_num, q_block))

print(f"Total raw blocks: {len(all_extracted)}")
