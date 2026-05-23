import fitz

doc = fitz.open("clinical_nutrition.pdf")
print("Total pages:", len(doc))

# Print the first 5 pages' text to understand the layout
for i in range(min(5, len(doc))):
    print(f"--- PAGE {i+1} ---")
    print(doc[i].get_text())

# Also search for chapter titles or division pages
print("\n--- Searching for possible Chapter headings in the first 20 pages ---")
for i in range(min(20, len(doc))):
    text = doc[i].get_text()
    for line in text.split('\n'):
        if any(keyword in line.lower() for keyword in ["chapter", "chap", "quiz", "unit"]):
            print(f"Page {i+1}: {line.strip()}")
