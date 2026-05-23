import fitz
import re
import json

# 1. Parse questions continuously
doc = fitz.open("clinical_nutrition.pdf")
pages_text = [page.get_text() for page in doc]

# We need to track page numbers for each line or each question.
# Instead of combining blindly, let's parse questions by page first,
# but if a question has empty options, we can merge it with the next page's starting text!
# Wait, actually, let's associate each parsed question with its starting page number.
# We can do this by running re.finditer on each page, and keeping track of the page number.
# But to avoid split issues, if a question's block goes to the end of the page,
# we can append the beginning of the next page (until the first question match on the next page) to this block!
# Let's write a robust page-by-page parser that looks ahead to the next page!

def get_questions_with_pages():
    questions = []
    lecture_counter = 0
    
    # We first parse each page's raw text
    pattern = r'(?:^|\n)[^\n\S]*(\d{1,2})[^\n\S]*[\.\-\*]*[^\n\S]*(?=.+[A-Za-z])'
    
    for idx in range(len(pages_text)):
        page_num = idx + 1
        page_text = pages_text[idx]
        
        matches = list(re.finditer(pattern, page_text))
        if not matches:
            continue
            
        for i in range(len(matches)):
            q_num = int(matches[i].group(1))
            start = matches[i].start()
            
            # If it's the last match on this page, we look ahead to the next page!
            if i + 1 < len(matches):
                block = page_text[start:matches[i+1].start()].strip()
            else:
                # Last match on this page: get the rest of this page, and the start of the next page!
                block = page_text[start:].strip()
                # If there is a next page, append its text up to its first question match!
                if idx + 1 < len(pages_text):
                    next_page_text = pages_text[idx + 1]
                    next_matches = list(re.finditer(pattern, next_page_text))
                    if next_matches:
                        next_start = next_matches[0].start()
                        block += "\n" + next_page_text[:next_start].strip()
                    else:
                        block += "\n" + next_page_text.strip()
                        
            if q_num == 1:
                lecture_counter += 1
                
            current_lecture = lecture_counter
            if current_lecture == 8:
                current_lecture = 9
                
            # Clean up running headers/footers/page numbers from the block
            block_lines = block.split('\n')
            cleaned_lines = []
            for line in block_lines:
                line_stripped = line.strip()
                if not line_stripped:
                    continue
                if line_stripped.isdigit():
                    continue
                if any(kw in line_stripped.lower() for kw in ["question bank", "chapter"]):
                    continue
                cleaned_lines.append(line)
            cleaned_block = "\n".join(cleaned_lines)
            
            # Parse cleaned block into text and options
            lines = cleaned_block.split('\n')
            q_text_lines = []
            options_dict = {}
            in_options = False
            last_option_letter = None
            
            opt_pattern = r'^\s*(?:-\s*)?([a-d|A-D])\s*[\)\-\.]+\s*(.*)'
            
            for line in lines:
                line_stripped = line.strip()
                if not line_stripped:
                    continue
                    
                opt_match = re.match(opt_pattern, line_stripped)
                
                if opt_match:
                    option_letter = opt_match.group(1).upper()
                    option_content = opt_match.group(2).strip()
                    options_dict[option_letter] = option_content
                    in_options = True
                    last_option_letter = option_letter
                elif in_options:
                    if any(line_stripped.lower().startswith(x) for x in ["answer", "*answer", "ans"]):
                        continue
                    if last_option_letter and last_option_letter in options_dict:
                        options_dict[last_option_letter] = options_dict[last_option_letter] + " " + line_stripped
                else:
                    cleaned_line = re.sub(r'^[^\n\S]*\d+[^\n\S]*[\.\-\*]*[^\n\S]*', '', line_stripped)
                    cleaned_line = cleaned_line.replace('*', '').strip()
                    if cleaned_line:
                        q_text_lines.append(cleaned_line)
                        
            q_text = " ".join(q_text_lines)
            options_list = [options_dict.get(letter, "").replace('*', '').strip() for letter in ['A', 'B', 'C', 'D']]
            
            questions.append({
                "page_num": page_num,
                "q_num": q_num,
                "lectureNumber": current_lecture,
                "text": q_text,
                "options": options_list,
                "raw_block": block
            })
            
    return questions

questions = get_questions_with_pages()
print(f"Parsed {len(questions)} questions page-by-page (with lookahead).")
empty_options_qs = [q for q in questions if any(not opt for opt in q["options"])]
print(f"Questions with empty options: {len(empty_options_qs)}")

# Now let's extract highlights from the solved PDF
solved_doc = fitz.open("clinical nutrition highlighted amswers.pdf")
highlights = []
for p_idx in range(len(solved_doc)):
    page = solved_doc[p_idx]
    annots = page.annots()
    if annots:
        for annot in annots:
            if annot.type[0] == 8: # Highlight
                text = page.get_text("text", clip=annot.rect).strip()
                highlights.append({
                    "page_num": p_idx + 1,
                    "text": text,
                    "rect": annot.rect
                })
print(f"Extracted {len(highlights)} highlight annotations.")

# Let's map answers!
resolved_count = 0
for q in questions:
    # Find highlights on the question's page or the next page (since question can be split)
    page_hl = [h for h in highlights if h["page_num"] in [q["page_num"], q["page_num"] + 1]]
    
    correct_option = None
    
    # Try 1: Clean the highlight text and match with options
    for hl in page_hl:
        hl_text = hl["text"].strip().lower()
        if not hl_text:
            continue
        
        # Clean prefix (e.g. "a)", "A -", "A) ")
        hl_clean = re.sub(r'^[a-d|A-D]\s*[\)\-\.]+\s*', '', hl_text).strip()
        
        # Match with our options
        for idx, opt in enumerate(q["options"]):
            opt_clean = opt.strip().lower()
            # Try exact match or substring
            if opt_clean and (hl_clean in opt_clean or opt_clean in hl_clean or hl_text.startswith(f"{['a','b','c','d'][idx]})") or hl_text.startswith(f"{['a','b','c','d'][idx]} -")):
                correct_option = opt
                break
        if correct_option:
            break
            
    # Try 2: If correct_option is still None, parse option letter from highlight text directly!
    if not correct_option:
        for hl in page_hl:
            hl_text = hl["text"].strip()
            # Match a letter at the start: e.g. "C) Enteral feeding" or "b) Protein"
            letter_match = re.match(r'^\s*([a-d|A-D])\s*[\)\-\.]+', hl_text)
            if letter_match:
                letter = letter_match.group(1).upper()
                letter_idx = ['A', 'B', 'C', 'D'].index(letter)
                correct_option = q["options"][letter_idx]
                break
                
    q["correctAnswer"] = correct_option
    if correct_option:
        resolved_count += 1

print(f"Successfully resolved correct answers for {resolved_count} out of {len(questions)} questions.")

unresolved = [q for q in questions if not q["correctAnswer"]]
print(f"Unresolved count: {len(unresolved)}")
for u in unresolved:
    print(f"Unresolved Q: Page {u['page_num']}, Ch {u['lectureNumber']}, Q{u['q_num']}")
    print(f"Text: {u['text']}")
    print(f"Options: {u['options']}")
    print("-" * 40)
