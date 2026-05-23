import fitz
import json

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
                        "text": text
                    })

with open("client/public/data/clinical_nutrition_questions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

print(f"Total Highlights Extracted: {len(highlights)}")
matched_info = []

for h in highlights:
    h_text = " ".join(h["text"].split()).lower()
    matches = []
    for q in questions:
        q_text = " ".join(q["text"].split()).lower()
        # Substring matching
        if h_text in q_text or q_text in h_text:
            matches.append(q)
        else:
            # Check options
            for opt in q["options"]:
                if h_text in " ".join(opt.split()).lower():
                    matches.append(q)
                    break
    
    print(f"Highlight on Page {h['page']}: {repr(h['text'])}")
    print(f"Matched {len(matches)} questions:")
    for m in matches:
        print(f"  - [{m['id']}] {m['text'][:60]}...")
    print("-" * 50)
