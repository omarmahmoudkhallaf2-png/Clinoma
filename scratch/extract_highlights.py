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
            # Yellow or light yellow fill: r > 0.8, g > 0.8, b < 0.8
            if r > 0.8 and g > 0.8 and b < 0.8:
                rect = draw["rect"]
                # Get text within the rect
                text = page.get_text("text", clip=rect).strip()
                if text:
                    highlights.append({
                        "page": page_num + 1,
                        "rect": [rect.x0, rect.y0, rect.x1, rect.y1],
                        "text": text
                    })

print(f"Found {len(highlights)} text highlights.")
# Print some of them
for h in highlights[:10]:
    print(f"Page {h['page']}: {repr(h['text'])}")

# Now let's try to match these with the parsed questions in our JSON file
with open("client/public/data/clinical_nutrition_questions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

# A question is highlighted if any of its text or options has a match with the highlight text.
# Let's do fuzzy or substring matching.
highlighted_q_ids = set()
for h in highlights:
    h_text = h["text"].strip().lower()
    if not h_text:
        continue
    # Clean up common PDF spaces
    h_text_clean = " ".join(h_text.split())
    
    # Try to find a question containing this text
    matched = False
    for q in questions:
        q_text = q["text"].lower()
        q_text_clean = " ".join(q_text.split())
        
        # Check if the highlight matches a substantial part of the question text or options
        if h_text_clean in q_text_clean or q_text_clean in h_text_clean or any(h_text_clean in " ".join(opt.split()).lower() for opt in q["options"]):
            highlighted_q_ids.add(q["id"])
            matched = True
            
    if not matched:
        # Try looser matching
        for q in questions:
            # Check if at least 15 chars match as a substring
            if len(h_text_clean) > 15 and h_text_clean[:15] in q_text_clean:
                highlighted_q_ids.add(q["id"])
                matched = True

print(f"Matched {len(highlighted_q_ids)} questions as highlighted out of {len(questions)} total questions.")
print("Highlighted Question IDs:", sorted(list(highlighted_q_ids)))
