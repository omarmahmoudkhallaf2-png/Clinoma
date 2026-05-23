import fitz

doc = fitz.open("clinical nutrition highlighted amswers.pdf")
print("Total pages:", len(doc))

for page_num in range(len(doc)):
    page = doc[page_num]
    annots = page.annots()
    if annots:
        print(f"=== PAGE {page_num+1} ===")
        for idx, annot in enumerate(annots):
            if annot.type[0] == 8: # Highlight
                text = page.get_text("text", clip=annot.rect).strip()
                print(f"  Highlight {idx+1}: rect={annot.rect} text={repr(text)}")
