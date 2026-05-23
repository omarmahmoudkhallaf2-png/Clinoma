import fitz

def check_pdf(path):
    print(f"=== Checking {path} ===")
    try:
        doc = fitz.open(path)
        print(f"Total pages: {len(doc)}")
        # Look for occurrences of "Chapter"
        chapters = []
        for page_idx in range(len(doc)):
            text = doc[page_idx].get_text()
            lines = text.split('\n')
            for line in lines:
                if "chapter" in line.lower() or "شابتر" in line:
                    print(f"Page {page_idx+1}: {line.strip()}")
    except Exception as e:
        print(f"Error: {e}")

check_pdf("clinical_nutrition.pdf")
check_pdf("MCQ Bank  in clinical nutrition - 2026.pdf")
check_pdf("clinical nutrition highlighted amswers.pdf")
