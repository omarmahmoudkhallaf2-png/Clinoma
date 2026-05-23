import fitz

doc = fitz.open("clinical_nutrition.pdf")
pages_to_check = [6, 8, 11, 14, 18, 23] # 0-indexed corresponding to pages 7, 9, 12, 15, 19, 24

for p in pages_to_check:
    if p < len(doc):
        print(f"\n================ PAGE {p+1} ================")
        text = doc[p].get_text()
        lines = text.split('\n')
        for idx, line in enumerate(lines[:60]):
            print(f"{idx+1}: {line}")
