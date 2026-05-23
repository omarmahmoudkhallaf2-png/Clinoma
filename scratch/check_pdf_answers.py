import fitz

def check_pdf(filename):
    print(f"=== CHECKING {filename} ===")
    doc = fitz.open(filename)
    print("Total pages:", len(doc))
    
    # 1. Check annotations
    annot_count = 0
    highlight_annots = 0
    for page_num in range(len(doc)):
        annots = doc[page_num].annots()
        if annots:
            for annot in annots:
                annot_count += 1
                if annot.type[0] == 8:
                    highlight_annots += 1
    print(f"Total annotations: {annot_count}")
    print(f"Highlight annotations (type 8): {highlight_annots}")
    
    # 2. Check drawings (filled rectangles)
    drawing_count = 0
    yellow_drawings = 0
    for page_num in range(len(doc)):
        drawings = doc[page_num].get_drawings()
        for draw in drawings:
            drawing_count += 1
            fill = draw.get("fill")
            if fill:
                r, g, b = fill
                # Yellow or light yellow fill: r > 0.8, g > 0.8, b < 0.8
                if r > 0.8 and g > 0.8 and b < 0.8:
                    yellow_drawings += 1
    print(f"Total drawings: {drawing_count}")
    print(f"Yellow drawings (highlights): {yellow_drawings}")
    print()

check_pdf("clinical_nutrition.pdf")
check_pdf("clinical nutrition highlighted amswers.pdf")
