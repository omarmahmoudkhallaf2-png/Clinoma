import fitz
import re
import json

doc = fitz.open("clinical_nutrition.pdf")
yellow_drawings_text = []

for page_num in range(len(doc)):
    page = doc[page_num]
    drawings = page.get_drawings()
    for draw in drawings:
        fill = draw.get("fill")
        if fill:
            r, g, b = fill
            if r > 0.8 and g > 0.8 and b < 0.8:
                rect = draw["rect"]
                text = page.get_text("text", clip=rect).strip()
                if text:
                    yellow_drawings_text.append({
                        "page_num": page_num + 1,
                        "text": text
                    })

print(f"Extracted {len(yellow_drawings_text)} yellow drawing highlights.")
for idx, yd in enumerate(yellow_drawings_text):
    print(f"  YD {idx+1}: Page {yd['page_num']}, text={repr(yd['text'][:100])}")
