import fitz

doc = fitz.open("clinical_nutrition.pdf")
highlights = []

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
                    highlights.append({
                        "page": page_num + 1,
                        "text": text,
                        "rect": [rect.x0, rect.y0, rect.x1, rect.y1]
                    })

print(f"Total highlights extracted: {len(highlights)}")
for idx, h in enumerate(highlights):
    print(f"{idx+1}. Page {h['page']}: {repr(h['text'])}")
