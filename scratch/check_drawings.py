import fitz

doc = fitz.open("clinical_nutrition.pdf")

print("\n--- Searching for drawings/shapes that might act as highlights ---")
for page_num in range(len(doc)):
    page = doc[page_num]
    drawings = page.get_drawings()
    if drawings:
        yellow_drawings = 0
        for draw in drawings:
            # Check if fill color is yellow-ish (RGB close to [1, 1, 0]) or some light color
            fill = draw.get("fill")
            if fill:
                r, g, b = fill
                # Yellow is (1, 1, 0), light yellow is like (1, 1, 0.8), etc.
                # Light green, light pink, light gray are also used for highlights
                if r > 0.8 and g > 0.8 and b < 0.8:
                    yellow_drawings += 1
        if yellow_drawings > 0:
            print(f"Page {page_num+1} has {yellow_drawings} yellow drawings.")
