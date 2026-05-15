
import fitz
import os

pdf_path = "eyelid.pdf"
output_dir = "client/public/temp_eyelid"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
for page_index in range(len(doc)):
    page = doc[page_index]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # Higher resolution
    pix.save(os.path.join(output_dir, f"page_{page_index+1}.png"))

print(f"Successfully converted {len(doc)} pages to images in {output_dir}")
