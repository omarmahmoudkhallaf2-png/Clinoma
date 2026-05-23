import fitz
import re

doc = fitz.open("clinical_nutrition.pdf")
print("Total pages:", len(doc))

for i in range(len(doc)):
    text = doc[i].get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # Find any line that contains "Chapter" or "chapter" or "Ch." or "Ch -"
    ch_lines = []
    for line in lines:
        if re.search(r'\b(chapter|chap|ch\.)\b', line, re.IGNORECASE):
            ch_lines.append(line)
            
    print(f"Page {i+1}: Num of lines = {len(lines)}. Chapters mentioned: {ch_lines}")
