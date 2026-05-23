import fitz

doc = fitz.open("clinical_nutrition.pdf")
print("Total pages:", len(doc))

for page_idx in range(27, len(doc)):
    print(f"\n================ PAGE {page_idx+1} ================")
    text = doc[page_idx].get_text()
    print(text)
