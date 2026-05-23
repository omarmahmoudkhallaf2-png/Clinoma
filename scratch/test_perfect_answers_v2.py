import fitz
import re
import json

def get_questions_with_pages():
    doc = fitz.open("clinical_nutrition.pdf")
    pages_text = [page.get_text() for page in doc]
    
    questions = []
    lecture_counter = 0
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
            
            if i + 1 < len(matches):
                block = page_text[start:matches[i+1].start()].strip()
            else:
                block = page_text[start:].strip()
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
                
            # Clean up running headers/footers/page numbers
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
            
            # Parse text and options
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
            
            # Check for explicit answer in the raw block
            explicit_answer = None
            ans_match = re.search(r'(?i)(?:answer|ans)\s*:\s*\*?\s*([a-d|A-D])\b', cleaned_block)
            if ans_match:
                explicit_answer = ans_match.group(1).upper()
            
            questions.append({
                "page_num": page_num,
                "q_num": q_num,
                "lectureNumber": current_lecture,
                "text": q_text,
                "options": options_list,
                "explicit_answer": explicit_answer,
                "raw_block": cleaned_block
            })
            
    return questions

questions = get_questions_with_pages()
print(f"Parsed {len(questions)} questions page-by-page.")

# Now extract highlights from solved PDF
solved_doc = fitz.open("clinical nutrition highlighted amswers.pdf")
highlights = []
for p_idx in range(len(solved_doc)):
    page = solved_doc[p_idx]
    annots = page.annots()
    if annots:
        for annot in annots:
            if annot.type[0] == 8:
                text = page.get_text("text", clip=annot.rect).strip()
                highlights.append({
                    "page_num": p_idx + 1,
                    "text": text,
                    "rect": annot.rect
                })
print(f"Extracted {len(highlights)} highlight annotations.")

def normalize_text(text):
    return re.sub(r'[^a-z0-9]', '', text.lower().strip())

resolved_count = 0
unresolved_qs = []

for q in questions:
    correct_option = None
    
    # 1. Use explicit answer from text if available
    if q["explicit_answer"]:
        letter_idx = ['A', 'B', 'C', 'D'].index(q["explicit_answer"])
        correct_option = q["options"][letter_idx]
    
    # 2. Otherwise (or as fallback), look for a highlight annotation matching options strictly
    if not correct_option:
        page_hl = [h for h in highlights if h["page_num"] in [q["page_num"], q["page_num"] + 1]]
        
        # Clean options for exact matching
        norm_opts = [normalize_text(opt) for opt in q["options"]]
        
        for hl in page_hl:
            hl_text = hl["text"].strip().lower()
            if not hl_text:
                continue
            
            # Strip option prefix like a), a -, a.
            hl_clean = re.sub(r'^[a-d|A-D]\s*[\)\-\.]+\s*', '', hl_text).strip()
            norm_hl_clean = normalize_text(hl_clean)
            
            # Try to match exactly with options
            if norm_hl_clean and norm_hl_clean in norm_opts:
                correct_option = q["options"][norm_opts.index(norm_hl_clean)]
                break
            
            # Try to match prefix of option (handles split highlights)
            matched_prefix = False
            for idx, opt_norm in enumerate(norm_opts):
                if norm_hl_clean and len(norm_hl_clean) >= 4 and opt_norm.startswith(norm_hl_clean):
                    correct_option = q["options"][idx]
                    matched_prefix = True
                    break
            if matched_prefix:
                break
            
            # Try matching with prefix check only if highlight text explicitly matches option prefix
            # E.g. if hl_text is exactly "b) pufa", let's extract 'b' and see if it corresponds to option B of the question
            prefix_match = re.match(r'^\s*([a-d|A-D])\s*[\)\-\.]+\s*(.*)', hl["text"].strip())
            if prefix_match:
                letter = prefix_match.group(1).upper()
                content = prefix_match.group(2).strip().lower()
                norm_content = normalize_text(content)
                # Check if content matches the option content, to ensure it is the right question!
                letter_idx = ['A', 'B', 'C', 'D'].index(letter)
                expected_opt_norm = norm_opts[letter_idx]
                if norm_content and (expected_opt_norm == norm_content or (len(norm_content) >= 4 and expected_opt_norm.startswith(norm_content))):
                    correct_option = q["options"][letter_idx]
                    break

    q["correctAnswer"] = correct_option
    if correct_option:
        resolved_count += 1
    else:
        unresolved_qs.append(q)

print(f"\nResolved: {resolved_count} / {len(questions)}")
print(f"Unresolved: {len(unresolved_qs)}")
for u in unresolved_qs:
    print(f"Unresolved: Ch {u['lectureNumber']}, Q{u['q_num']} on Page {u['page_num']}")
    print("Options:", u["options"])
    print("-" * 30)

# Let's print Q38, Q39, Q40 to verify
print("\n--- CHAPTER 9 LAST QUESTIONS ---")
for q in questions:
    if q["lectureNumber"] == 9 and q["q_num"] >= 35:
        print(f"Q{q['q_num']}: {q['text'][:50]}...")
        print(f"  Options: {q['options']}")
        print(f"  Correct: {q['correctAnswer']}")
