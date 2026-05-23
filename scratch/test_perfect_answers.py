import fitz
import re
import json

def get_questions():
    doc = fitz.open("clinical_nutrition.pdf")
    pages_text = [page.get_text() for page in doc]
    
    # Pattern to find question numbers
    pattern = r'(?:^|\n)[^\n\S]*(\d{1,2})[^\n\S]*[\.\-\*]*[^\n\S]*(?=.+[A-Za-z])'
    
    questions = []
    lecture_counter = 0
    
    for idx, page_text in enumerate(pages_text):
        page_num = idx + 1
        
        # Split page into question blocks using finditer
        matches = list(re.finditer(pattern, page_text))
        if not matches:
            continue
            
        for i in range(len(matches)):
            start = matches[i].start()
            end = matches[i+1].start() if i + 1 < len(matches) else len(page_text)
            block = page_text[start:end].strip()
            q_num = int(matches[i].group(1))
            
            # Reset chapter counter on seeing Q1
            if q_num == 1:
                lecture_counter += 1
                
            current_lecture = lecture_counter
            if current_lecture == 8:
                current_lecture = 9 # Chapter 9 is lecture 9
                
            questions.append({
                "page_num": page_num,
                "q_num": q_num,
                "lectureNumber": current_lecture,
                "raw_block": block
            })
            
    return questions

questions = get_questions()
print(f"Parsed {len(questions)} raw question blocks.")

# Let's inspect a few
for q in questions[:3]:
    print(f"Page {q['page_num']}, Ch {q['lectureNumber']}, Q{q['q_num']}:")
    print(repr(q['raw_block'][:150]))
    print("-" * 30)
