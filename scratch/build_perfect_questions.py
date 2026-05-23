import fitz
import re
import json
import os

def build_perfect_questions():
    # 1. Parse questions continuously with lookahead page-by-page
    doc = fitz.open("clinical_nutrition.pdf")
    pages_text = [page.get_text() for page in doc]
    
    pattern = r'(?:^|\n)[^\n\S]*(\d{1,2})[^\n\S]*[\.\-\*]*[^\n\S]*(?=.+[A-Za-z])'
    
    questions = []
    lecture_counter = 0
    
    for idx in range(len(pages_text)):
        page_num = idx + 1
        page_text = pages_text[idx]
        
        matches = list(re.finditer(pattern, page_text))
        if not matches:
            continue
            
        for i in range(len(matches)):
            q_num = int(matches[i].group(1))
            start = matches[i].start()
            
            # Lookahead to get the full block for questions split across pages
            if i + 1 < len(matches):
                block = page_text[start:matches[i+1].start()].strip()
            else:
                # Last match on this page: get rest of this page and the start of the next page
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
                
            # Clean block lines from headers, footers, page numbers
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
                "id": f"CN_L{current_lecture}_Q{q_num}",
                "page_num": page_num,
                "q_num": q_num,
                "lectureNumber": current_lecture,
                "text": q_text,
                "options": options_list,
                "explicit_answer": explicit_answer,
                "correctAnswer": "",
                "explanation": f"Chapter {current_lecture} Study Card - Clinical Nutrition & Dietary Management",
                "courseId": "clinical_nutrition_course",
                "subjectId": "clinical_nutrition_subject",
                "questionType": "practice",
                "accessType": "paid" if q_num > 2 else "free",
                "isHighlighted": False
            })
            
    print(f"Initially parsed {len(questions)} questions from PDF.")
    
    # 2. Extract standard highlights from solved PDF for answers
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
    print(f"Extracted {len(highlights)} highlight annotations for correct answers.")
    def normalize_text(text):
        return re.sub(r'[^a-z0-9]', '', text.lower().strip())

    # Map correct answers
    resolved_answers = 0
    for q in questions:
        correct_option = None
        
        # 1. Use explicit answer from text if available
        if q["explicit_answer"]:
            letter_idx = ['A', 'B', 'C', 'D'].index(q["explicit_answer"])
            correct_option = q["options"][letter_idx]
            
        # 2. Otherwise, match using highlight annotations strictly
        if not correct_option:
            page_hl = [h for h in highlights if h["page_num"] in [q["page_num"], q["page_num"] + 1]]
            norm_opts = [normalize_text(opt) for opt in q["options"]]
            
            for hl in page_hl:
                hl_text = hl["text"].strip().lower()
                if not hl_text:
                    continue
                
                # Strip prefix
                hl_clean = re.sub(r'^[a-d|A-D]\s*[\)\-\.]+\s*', '', hl_text).strip()
                norm_hl_clean = normalize_text(hl_clean)
                
                # Exact match
                if norm_hl_clean and norm_hl_clean in norm_opts:
                    correct_option = q["options"][norm_opts.index(norm_hl_clean)]
                    break
                
                # Prefix match (handles split highlights)
                matched_prefix = False
                for idx, opt_norm in enumerate(norm_opts):
                    if norm_hl_clean and len(norm_hl_clean) >= 4 and opt_norm.startswith(norm_hl_clean):
                        correct_option = q["options"][idx]
                        matched_prefix = True
                        break
                if matched_prefix:
                    break
                
                # Prefix option letter match if content is exact
                prefix_match = re.match(r'^\s*([a-d|A-D])\s*[\)\-\.]+\s*(.*)', hl["text"].strip())
                if prefix_match:
                    letter = prefix_match.group(1).upper()
                    content = prefix_match.group(2).strip().lower()
                    norm_content = normalize_text(content)
                    letter_idx = ['A', 'B', 'C', 'D'].index(letter)
                    expected_opt_norm = norm_opts[letter_idx]
                    if norm_content and (expected_opt_norm == norm_content or (len(norm_content) >= 4 and expected_opt_norm.startswith(norm_content))):
                        correct_option = q["options"][letter_idx]
                        break

        q["correctAnswer"] = correct_option
        if correct_option:
            resolved_answers += 1
            
    print(f"Correct answers mapped: {resolved_answers} / {len(questions)}")
    
    # 3. Extract yellow drawings from plain PDF for isHighlighted tagging
    yellow_drawings_text = []
    plain_doc = fitz.open("clinical_nutrition.pdf")
    for p_idx in range(len(plain_doc)):
        page = plain_doc[p_idx]
        drawings = page.get_drawings()
        for draw in drawings:
            fill = draw.get("fill")
            if fill:
                r, g, b = fill
                if r > 0.8 and g > 0.8 and b < 0.8:
                    rect = draw["rect"]
                    text = page.get_text("text", clip=rect).strip()
                    if text:
                        yellow_drawings_text.append(text.lower())
                        
    # Tag isHighlighted
    highlighted_count = 0
    for q in questions:
        q_text_clean = q["text"].lower()
        is_hl = False
        for yd in yellow_drawings_text:
            yd_clean = yd.replace('*', '').strip()
            # If yd is long enough and matches, tag it
            if len(yd_clean) > 10 and (yd_clean in q_text_clean or q_text_clean in yd_clean):
                is_hl = True
                break
            # Also handle short identifiers like GERD diet Q13
            elif "gerd" in yd_clean and "gerd" in q_text_clean and q["q_num"] == 13:
                is_hl = True
                break
        if is_hl:
            q["isHighlighted"] = True
            highlighted_count += 1
            
    print(f"Tagged {highlighted_count} questions as isHighlighted: true")
    
    # 4. Final verification and clean up page_num / q_num fields
    final_questions = []
    for q in questions:
        # Create a clean item for frontend
        final_questions.append({
            "id": q["id"],
            "text": q["text"],
            "options": q["options"],
            "correctAnswer": q["correctAnswer"],
            "explanation": q["explanation"],
            "courseId": q["courseId"],
            "subjectId": q["subjectId"],
            "lectureNumber": q["lectureNumber"],
            "questionType": q["questionType"],
            "accessType": q["accessType"],
            "isHighlighted": q["isHighlighted"]
        })
        
    # Write to target JSON
    target_path = "client/public/data/clinical_nutrition_questions.json"
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(final_questions, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully saved {len(final_questions)} perfect questions to {target_path}!")
    
    # Output counts per chapter to double check the division
    chapter_counts = {}
    for q in final_questions:
        ln = q["lectureNumber"]
        chapter_counts[ln] = chapter_counts.get(ln, 0) + 1
        
    print("\n--- FINAL DIVISION VERIFICATION ---")
    for ln in sorted(chapter_counts.keys()):
        print(f"Chapter {ln}: {chapter_counts[ln]} questions")

build_perfect_questions()
