import fitz

doc = fitz.open("clinical_nutrition.pdf")
print("Total pages:", len(doc))

for i in range(len(doc)):
    text = doc[i].get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    print(f"\n--- PAGE {i+1} ---")
    print("First 5 lines:")
    for line in lines[:5]:
        print("  ", line)
    print("Last 5 lines:")
    for line in lines[-5:]:
        print("  ", line)
