import fitz

doc = fitz.open("clinical_nutrition.pdf")
print("Total pages:", len(doc))

print("\n--- Searching for Highlight Annotations ---")
has_annots = False
for page_num in range(len(doc)):
    page = doc[page_num]
    annots = page.annots()
    if annots:
        for annot in annots:
            # Type 8 is highlight in PDF spec
            if annot.type[0] == 8:
                has_annots = True
                print(f"Page {page_num+1} has highlight: rect={annot.rect}")
                # Try to extract the highlighted text
                text = page.get_text("text", clip=annot.rect)
                print(f"Highlighted text: {text.strip()}")
                print("-" * 30)

if not has_annots:
    print("No highlight annotations found using standard PDF type 8.")
