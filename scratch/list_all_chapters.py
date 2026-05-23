import fitz

doc = fitz.open("clinical_nutrition.pdf")
print("Total pages:", len(doc))

print("\n--- Searching all pages for Chapter/Chapter headings ---")
for i in range(len(doc)):
    text = doc[i].get_text()
    for line in text.split('\n'):
        line_clean = line.strip()
        if any(kw in line_clean.lower() for kw in ["chapter", "chap"]):
            print(f"Page {i+1}: {line_clean}")
