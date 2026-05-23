import fitz
import re
import json

doc = fitz.open("clinical_nutrition.pdf")
pages_text = [page.get_text() for page in doc]

# Pattern to find question numbers
pattern = r'(?:^|\n)[^\n\S]*(\d{1,2})[^\n\S]*[\.\-\*]*[^\n\S]*(?=.+[A-Za-z])'

questions = []
lecture_counter = 0

for idx, page_text in enumerate(pages_text):
    page_num = idx + 1
    
    matches = list(re.finditer(pattern, page_text))
    if not matches:
        continue
        
    for i in range(len(matches)):
        start = matches[i].start()
        end = matches[i+1].start() if i + 1 < len(matches) else len(page_text)
        block = page_text[start:end].strip()
        q_num = int(matches[i].group(1))
        
        if q_num == 1:
            lecture_counter += 1
            
        current_lecture = lecture_counter
        if current_lecture == 8:
            current_lecture = 9
            
        # Parse block into lines
        lines = block.split('\n')
        q_text_lines = []
        options_dict = {}
        in_options = False
        last_option_letter = None
        
        opt_pattern = r'^\s*(?:-\s*)?([a-d|A-D])\s*[\)\-\.]+\s*(.*)'
        
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
                
            # Skip page headers/footers in block
            if line_stripped.isdigit() or any(kw in line_stripped.lower() for kw in ["chapter", "question bank"]):
                continue
                
            opt_match = re.match(opt_pattern, line_stripped)
            
            if opt_match:
                option_letter = opt_match.group(1).upper()
                option_content = opt_match.group(2).strip()
                options_dict[option_letter] = option_content
                in_options = True
                last_option_letter = option_letter
            elif in_options:
                # If it's an answer line, skip it
                if any(line_stripped.lower().startswith(x) for x in ["answer", "*answer", "ans"]):
                    continue
                # Append to last option
                if last_option_letter and last_option_letter in options_dict:
                    options_dict[last_option_letter] = options_dict[last_option_letter] + " " + line_stripped
            else:
                # Question text
                # Remove question number from first line
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

print(f"Parsed {len(questions)} questions.")

# Check for questions with empty options
empty_options_qs = [q for q in questions if any(not opt for opt in q["options"])]
print(f"Questions with empty options: {len(empty_options_qs)}")
for q in empty_options_qs[:10]:
    print(f"Page {q['page_num']}, Lecture {q['lectureNumber']}, Q{q['q_num']}: options={q['options']}")
    print("Raw block:")
    print(q['raw_block'])
    print("-" * 50)
