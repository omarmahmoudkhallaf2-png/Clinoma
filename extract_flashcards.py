
import fitz
import os
import json

pdf_path = "eyelid.pdf"
image_dir = "client/public/flashcards/eyelid"
os.makedirs(image_dir, exist_ok=True)

doc = fitz.open(pdf_path)
flashcards = []

for page_index in range(len(doc)):
    page = doc[page_index]
    image_list = page.get_images(full=True)
    
    # Get all text blocks on the page
    text_blocks = page.get_text("blocks")
    
    for img_index, img_info in enumerate(image_list):
        xref = img_info[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        ext = base_image["ext"]
        
        # Get image location on page
        # This is tricky because get_images doesn't give location. 
        # We need to find the image object's position.
        img_rects = page.get_image_rects(xref)
        if not img_rects: continue
        
        img_rect = img_rects[0] # Take first occurrence
        
        # Save image
        image_name = f"eyelid_{page_index+1}_{img_index+1}.{ext}"
        image_path = os.path.join(image_dir, image_name)
        with open(image_path, "wb") as f:
            f.write(image_bytes)
            
        # Find text below the image
        # We look for a text block that is below the image rect and close to it
        caption = ""
        min_dist = float('inf')
        
        for block in text_blocks:
            # block = (x0, y0, x1, y1, "text", block_no, block_type)
            bx0, by0, bx1, by1, btext, bno, btype = block
            
            # Check if block is below the image
            if by0 >= img_rect.y1 - 5: # Small buffer
                dist = by0 - img_rect.y1
                if dist < 50: # Caption should be close
                    # Check if horizontal alignment is roughly similar
                    if bx0 < img_rect.x1 and bx1 > img_rect.x0:
                        if dist < min_dist:
                            min_dist = dist
                            caption = btext.strip()
                            
        if caption:
            flashcards.append({
                "front": "", # Empty front as per "Image in Front"
                "back": caption,
                "frontImage": {
                    "url": f"/flashcards/eyelid/{image_name}",
                    "caption": ""
                }
            })

# Save JSON for import
import_data = {
    "deck": {
        "title": "Eyelid Pathology",
        "description": "Medical flashcards from eyelid material",
        "subject": "Ophthalmology",
        "module": "Eyelid",
        "year": "Third Year",
        "isPublic": False
    },
    "cards": flashcards
}

with open("eyelid_flashcards.json", "w", encoding="utf-8") as f:
    json.dump(import_data, f, indent=2, ensure_ascii=False)

print(f"Extracted {len(flashcards)} flashcards to eyelid_flashcards.json")
