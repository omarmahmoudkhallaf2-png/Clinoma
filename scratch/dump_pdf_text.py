import fitz

doc = fitz.open("clinical_nutrition.pdf")
with open("scratch/pdf_text.txt", "w", encoding="utf-8") as f:
    for idx, page in enumerate(doc):
        f.write(f"=== PAGE {idx + 1} ===\n")
        f.write(page.get_text())
        f.write("\n\n")
print("PDF text dumped to scratch/pdf_text.txt")
