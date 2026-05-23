import fitz
import re
import json

doc = fitz.open("clinical_nutrition.pdf")
full_text_by_page = []
for page in doc:
    full_text_by_page.append(page.get_text())

# Helper to split page text into question blocks.
# A question block starts with a number at the beginning of a line or after a newline:
# e.g., "1. " or "15. " or "31- " or "1 ." or "38--"
def get_raw_question_blocks(page_text):
    # Regex to find positions of "\n <number> . " or "\n <number> - "
    # We also handle starting of page (no leading newline)
    pattern = r'(?:^|\n)\s*(\d+)\s*[\.\-]+\s*'
    matches = list(re.finditer(pattern, page_text))
    
    blocks = []
    for i in range(len(matches)):
        start = matches[i].start()
        end = matches[i+1].start() if i + 1 < len(matches) else len(page_text)
        block_text = page_text[start:end].strip()
        q_num = int(matches[i].group(1))
        blocks.append((q_num, block_text))
    return blocks

# Hardcoded answers for Q31-40 on page 28-30
review_answers = {
    31: ("d", "Fat"),
    32: ("c", "Liquid diet"),
    33: ("c", "High protein diet"),
    34: ("d", "All of the above"),
    35: ("c", "0.3 gm / kg body weight"),
    36: ("a", "Liver disease"),
    37: ("b", "Sodium"),
    38: ("b", "PUFA"),
    39: ("a", "A"),
    40: ("a", "Obese patients")
}

# Mapping of review questions (Q31-40) to their true chapters
review_chapter_mapping = {
    31: 2, # Hepatitis -> Chapter 2 (Liver)
    32: 9, # Post-operative/heart attack -> Chapter 9 (Post-op)
    33: 9, # Burns -> Chapter 9 (Post-op/general)
    34: 1, # Salt restriction -> Chapter 1 (Therapeutic)
    35: 2, # Hepatic coma -> Chapter 2 (Liver)
    36: 2, # Fat-soluble vitamins -> Chapter 2 (Liver)
    37: 2, # Liver cirrhosis -> Chapter 2 (Liver)
    38: 3, # Atherosclerosis -> Chapter 3 (CVD)
    39: 1, # Avoiding fats -> Chapter 1 (Therapeutic)
    40: 3  # Hypertension -> Chapter 3 (CVD)
}

chapter_names = {
    1: "Therapeutic Diets and Modified Diets",
    2: "Dietary Management of Liver Diseases",
    3: "Dietary Management of CVD Diseases",
    4: "Dietary Management of GIT Diseases",
    5: "Dietary Management for Diabetes Patients",
    6: "Dietary Management of Renal Diseases",
    7: "Dietary Management of Comatosed & Patients with System Failure",
    8: "Review / Mixed Questions", # We don't use 8 for comatosed if we map Ch 7 & 8 to 7, so we can make 8 a placeholder or general review.
    9: "Nutrition Therapy for Post-Operative Patients"
}

questions = []
lecture_counter = 0 # Will be incremented on seeing Q1

for idx, page_text in enumerate(full_text_by_page):
    page_num = idx + 1
    blocks = get_raw_question_blocks(page_text)
    
    for q_num, block in blocks:
        # Check for chapter start reset
        if q_num == 1:
            lecture_counter += 1
            # Special adjustment: Chapter 7 & 8 is lecture 7.
            # So after lecture 7, the next chapter is Chapter 9, which is lecture 8 or 9.
            # Let's map chapters:
            # 1: Ch 1 (lecture 1)
            # 2: Ch 2 (lecture 2)
            # 3: Ch 3 (lecture 3)
            # 4: Ch 4 (lecture 4)
            # 5: Ch 5 (lecture 5)
            # 6: Ch 6 (lecture 6)
            # 7: Ch 7 & 8 (lecture 7)
            # 8: Ch 9 (lecture 9) -> Wait, if we increment lecture_counter, when we hit Ch 9 Q1, lecture_counter will be 8.
            # So let's map lecture_counter 8 directly to lecture 9!
            
        current_lecture = lecture_counter
        if current_lecture == 8:
            current_lecture = 9 # Map Chapter 9 to lecture 9, leaving lecture 8 empty or we can put review questions there.
            
        # Parse question text, options, and answer
        # Question text: everything before the first option.
        # Options: we find all option strings.
        # Options can start with:
        # a) or A) or - A) or - a) or a - or A -
        # Let's use a regex to identify option lines.
        option_lines = []
        ans_line = None
        
        lines = block.split('\n')
        q_text_lines = []
        in_options = False
        
        # Regex for options: e.g. "a) Option text" or "- A) Option text" or "a - Option text"
        opt_pattern = r'^\s*(?:-\s*)?([a-d|A-D])\s*[\)\-]\s*(.*)'
        ans_pattern = r'(?:Answer|Answer:|\*Answer:\*|\*Answer:)\s*(.*)'
        
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
                
            # Skip page numbers or chapter headers in the question block
            if line_stripped.isdigit() or any(kw in line_stripped.lower() for kw in ["chapter", "question bank"]):
                continue
                
            opt_match = re.match(opt_pattern, line_stripped)
            ans_match = re.search(ans_pattern, line_stripped, re.IGNORECASE)
            
            if ans_match:
                ans_line = ans_match.group(1).strip()
                in_options = False
            elif opt_match:
                option_letter = opt_match.group(1).strip().upper()
                option_content = opt_match.group(2).strip()
                option_lines.append((option_letter, option_content))
                in_options = True
            elif in_options:
                # This line is a continuation of the last option!
                if option_lines:
                    last_letter, last_content = option_lines[-1]
                    option_lines[-1] = (last_letter, last_content + " " + line_stripped)
            else:
                # Question text
                # Remove question number if it is on this line
                cleaned_line = re.sub(r'^\s*\d+\s*[\.\-]+\s*', '', line_stripped)
                # Remove asterisks if any
                cleaned_line = cleaned_line.replace('*', '').strip()
                if cleaned_line:
                    q_text_lines.append(cleaned_line)
                    
        q_text = " ".join(q_text_lines)
        
        # Check if we have review answers (Q31-40 on page 28-30)
        is_review = False
        if page_num >= 28 and q_num in review_answers:
            is_review = True
            ans_letter, ans_text = review_answers[q_num]
            # Override lecture number and chapter mapping
            current_lecture = review_chapter_mapping[q_num]
            ans_line = ans_letter
            
        # Reconstruct options array
        options_dict = {}
        for letter, content in option_lines:
            options_dict[letter] = content
            
        # Standardize options to A, B, C, D
        options_list = []
        for l in ['A', 'B', 'C', 'D']:
            if l in options_dict:
                options_list.append(options_dict[l])
            else:
                # If option is missing, check lowercase
                if l.lower() in options_dict:
                    options_list.append(options_dict[l.lower()])
                else:
                    options_list.append("")
                    
        # Find correct answer string
        correct_ans_str = ""
        if ans_line:
            # Extract option letter from ans_line
            # e.g., "B", "b) Liver function support", "b)", "B) Low-residue"
            letter_match = re.search(r'\b([a-d|A-D])\b', ans_line)
            if letter_match:
                ans_letter = letter_match.group(1).upper()
                # If we have the option text in the answer line itself (like "b) Liver function support")
                # and our options list has that option, let's use it.
                if ans_letter == 'A' and len(options_list) > 0:
                    correct_ans_str = options_list[0]
                elif ans_letter == 'B' and len(options_list) > 1:
                    correct_ans_str = options_list[1]
                elif ans_letter == 'C' and len(options_list) > 2:
                    correct_ans_str = options_list[2]
                elif ans_letter == 'D' and len(options_list) > 3:
                    correct_ans_str = options_list[3]
            else:
                # Fallback if answer letter is not isolated
                correct_ans_str = ans_line
        else:
            # Fallback if no answer line (shouldn't happen except for Q31-40, which are handled)
            correct_ans_str = ""
            
        # Double check if correct_ans_str is empty, try to match by option letter if we can find one in the raw block
        if not correct_ans_str and ans_line:
            # Just use ans_line as is
            correct_ans_str = ans_line
            
        # Strip any formatting/asterisks from correct answer
        correct_ans_str = correct_ans_str.replace('*', '').strip()
        # If correct_ans_str contains parentheses, clean it: e.g. "b) Liver function support" -> "Liver function support"
        correct_ans_str = re.sub(r'^[a-d|A-D]\s*[\)\-]\s*', '', correct_ans_str).strip()
        
        # Clean question text from trailing/leading punctuation
        q_text = q_text.strip()
        
        questions.append({
            "id": f"CN_L{current_lecture}_Q{q_num}",
            "text": q_text,
            "options": options_list,
            "correctAnswer": correct_ans_str,
            "explanation": f"Chapter {current_lecture} Study Card - Clinical Nutrition & Dietary Management",
            "courseId": "clinical_nutrition_course", # We will create a Course for Clinical Nutrition
            "subjectId": "clinical_nutrition_subject", # We will create a Subject for Clinical Nutrition
            "lectureNumber": current_lecture,
            "questionType": "practice",
            "accessType": "paid" if q_num > 2 else "free", # Seed first 2 questions of each lecture as free
            "createdAt": "2026-05-21T08:00:00Z"
        })

print(f"Successfully parsed {len(questions)} questions.")

# Let's inspect some parsed questions to ensure they are correct
print("\n--- SAMPLE PARSED QUESTIONS ---")
for q in questions[:5]:
    print(f"ID: {q['id']}, Lecture: {q['lectureNumber']}")
    print(f"Text: {q['text']}")
    print(f"Options: {q['options']}")
    print(f"Correct Answer: {q['correctAnswer']}")
    print("-" * 40)

# Also check review questions
print("\n--- REVIEW QUESTIONS (Q31-40) ---")
for q in questions:
    if "Q31" in q["id"] or "Q32" in q["id"] or "Q35" in q["id"]:
        print(f"ID: {q['id']}, Lecture: {q['lectureNumber']}")
        print(f"Text: {q['text']}")
        print(f"Options: {q['options']}")
        print(f"Correct Answer: {q['correctAnswer']}")
        print("-" * 40)

# Write to json file
with open("client/public/data/clinical_nutrition_questions.json", "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print("Saved to client/public/data/clinical_nutrition_questions.json")
