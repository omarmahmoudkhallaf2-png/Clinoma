
import os
import json
from PIL import Image

# Load extraction data
extraction_data = {
  "pages": [
    {
      "number": 1,
      "panels": [
        {"pos": "top-left", "text": "Visual acuity chart"},
        {"pos": "top-right", "text": "Ishihara Chart for color testing"},
        {"pos": "bottom-left", "text": "Goldmann applanation tonometery used for IOP measurement"},
        {"pos": "bottom-right", "text": "Confrontation method for Visual field Ex."}
      ]
    },
    {
      "number": 2,
      "panels": [
        {"pos": "top-left", "text": "fundus examination by direct ophthalmoscope"},
        {"pos": "top-right", "text": "fundus examination by indirect ophthalmoscope"},
        {"pos": "middle", "text": "Goldman 3 mirror contact lens used for fundus examination and gonioscopy"},
        {"pos": "bottom-left", "text": "Schoitz indentation Tonometry for IOP measurement"},
        {"pos": "bottom-right", "text": "Schoitz disadvantage - False low readings when scleral rigidity is low as in: high myopia and previous ocular surgery."}
      ]
    },
    {
      "number": 3,
      "panels": [
        {"pos": "top", "text": "Preseptal cellulitis: Interpret the attached CT findings? opacification at anterior orbital septum, Thickening of eye lid soft tissues, Inflammation confined anterior to the orbital septum (the orbit is normal), Intact ocular motility, No proptosis, No orbital fat stranding + No subperiosteal abscess. Sources of infection? Endogenous: extension from neighboring structures as the paranasal sinuses. Exogenous: as in penetrating trauma or septic orbital surgery. Blood born: metastatic infection as in pyemia. Treatment? (same as orbital cellulitis) Hospitalization: is necessary in orbital cellulitis only for close follow-up: 1) Topical and systemic parenteral broad spectrum antibiotics. 2) Hot foments. N.B: If abscess is formed, it should be drained"},
        {"pos": "bottom", "text": "Acute orbital cellulitis"}
      ]
    },
    {
      "number": 4,
      "panels": [
        {"pos": "top-left", "text": "Herpes simplex - C.O: Herpes simplex type 1"},
        {"pos": "top-right", "text": "Herpes zoster ophthalmicus - C.O: herpes zoster virus. Hutchinson sign: Vesicular lesions on the tip of the nose, indicating nasociliary nerve involvement. Treatment: acyclovir (Zovirax)"},
        {"pos": "middle-left", "text": "Ulcerative blepharitis - C.O: Staph. aureus"},
        {"pos": "bottom-left", "text": "Parasitic blepharitis - C.O: Infestation by Pubic crab louse and its ova"},
        {"pos": "bottom-right", "text": "Scaly blepharitis - Treatment: Lid hygiene (warm compresses, massage, removal of scales using baby shampoo), local antibiotic ointment."}
      ]
    },
    {
      "number": 5,
      "panels": [
        {"pos": "top-left", "text": "Stye: Zeiss glands"},
        {"pos": "middle-left", "text": "Infected chalazion"},
        {"pos": "bottom-left", "text": "Chalazion: meibomian gland"},
        {"pos": "right", "text": "Treatment of Stye: 1) Frequent hot foments. 2) Epilation of the lash. 3) Local & systemic antibiotic. 4) Treatment of predisposing factor. Treatment of Chalazion: 1) Conservative (hot foments, antibiotic steroid). 2) Surgical (incision and curettage through conjunctival surface)."}
      ]
    },
    {
      "number": 6,
      "panels": [
        {"pos": "top-left", "text": "Trichiasis - Def: Acquired condition with >4 lashes directed posteriorly rubbing against cornea or bulbar conjunctiva"},
        {"pos": "top-right", "text": "Distichiasis - Def: Abnormality (usually congenital) with extra row of lashes from lid margin behind grey line"},
        {"pos": "middle-left", "text": "Trichiasis complication: Chronic conjunctivitis, corneal recurrent ulceration, opacification, superficial vascularization."},
        {"pos": "middle-right", "text": "Madarosis"},
        {"pos": "bottom-right", "text": "Poliosis"}
      ]
    },
    {
      "number": 7,
      "panels": [
        {"pos": "top", "text": "Involutional entropion and Corneal ulcer stained with Fluorescein"},
        {"pos": "bottom", "text": "Cicatracial entropion - Causes: 1) Trachoma. 2) Ulcerative blepharitis. 3) Trauma/Chemical burns. 4) Cicatrizing diseases (pemphigoid, Stevens Johnson)."}
      ]
    },
    {
      "number": 8,
      "panels": [
        {"pos": "top", "text": "Involutional ectropion - Mechanism: Age-related degeneration of elastic tissue leading to horizontal laxity."},
        {"pos": "middle", "text": "Cicatracial ectropion - Treatment: Protect cornea (V-Y operation for small scar, grafting for large scar)."},
        {"pos": "bottom-middle", "text": "Mechanical ectropion - Treatment: Remove cause"},
        {"pos": "bottom", "text": "Grades of Ectropion: Mild (punctum visible), Moderate (tarsal conjunctiva exposed), Severe (completely everted lid)."}
      ]
    },
    {
      "number": 9,
      "panels": [
        {"pos": "top", "text": "Paralytic ectropion & lagophthalmos & epiphora - Nerve: Facial, Muscle: Orbicularis oculi"},
        {"pos": "bottom-left", "text": "Paralytic ectropion & lagophthalmos"},
        {"pos": "bottom-right", "text": "Paralytic ectropion & lagophthalmos"},
        {"pos": "bottom-section", "text": "Complication of lagophthalmos: Exposure keratitis, corneal ulceration, perforation, xerosis."}
      ]
    },
    {
      "number": 10,
      "panels": [
        {"pos": "top", "text": "Assessment of facial nerve signs: Loss of forehead wrinkles, inability to close eyes, wide palpebral fissure, epiphora, loss of naso-labial fold, drooping angle of mouth."},
        {"pos": "middle-left-1", "text": "Xanthelasma"},
        {"pos": "middle-left-2", "text": "Capillary hemangioma"},
        {"pos": "middle-right", "text": "Sturge Weber syndrome (Naevus flammeus) - Ocular associations: Congenital Glaucoma, Choroidal hemangioma."},
        {"pos": "bottom-left", "text": "Periocular hemangioma"},
        {"pos": "bottom-middle", "text": "Naevus"},
        {"pos": "bottom-right", "text": "Melanoma"}
      ]
    },
    {
      "number": 11,
      "panels": [
        {"pos": "top-left", "text": "Basal cell carcinoma (Rodent ulcer)"},
        {"pos": "top-middle", "text": "SCC"},
        {"pos": "top-right", "text": "Basal cell carcinoma + Pterygium"},
        {"pos": "middle-left", "text": "Lt. Ptosis"},
        {"pos": "middle-right", "text": "Lid retraction"},
        {"pos": "bottom-left", "text": "Lt. Ptosis Management: Resection (if fair/good levator action) or Frontalis suspension (if poor)."},
        {"pos": "bottom-right", "text": "Unilateral severe ptosis - Manage as early as possible to avoid amblyopia."}
      ]
    },
    {
      "number": 12,
      "panels": [
        {"pos": "top", "text": "pseudoptosis due to:"},
        {"pos": "top-left", "text": "Lack of lid support"},
        {"pos": "top-right", "text": "Contralateral lid retraction"},
        {"pos": "middle-left", "text": "Ipsilateral hypotropia"},
        {"pos": "middle-center", "text": "Brow ptosis excessive eyebrow skin"},
        {"pos": "middle-right", "text": "Dermatochalasis excessive eyelid skin"},
        {"pos": "bottom", "text": "Marcus Gunn jaw-winking syndrome: Misinnervation between CN V and CN III; eyelid elevation with jaw movement."}
      ]
    },
    {
      "number": 13,
      "panels": [
        {"pos": "top", "text": "Bilateral congenital upper & lower lid ectropion (blepharophimosis syndrome): Ptosis, short aperture, telecanthus, epicanthus inversus."},
        {"pos": "middle", "text": "Left third nerve palsy"},
        {"pos": "bottom-left", "text": "Procedure: Frontalis suspension for poor levator function."},
        {"pos": "bottom-right", "text": "Horner syndrome (Rt. eye): Mild ptosis, miosis, anhidrosis, enophthalmos."}
      ]
    },
    {
      "number": 14,
      "panels": [
        {"pos": "top", "text": "Bilateral involutional Ptosis: Dehiscence in levator aponeurosis. High crease due to skin attachments remains while aponeurosis stretches."},
        {"pos": "middle-left", "text": "Epicanthus"},
        {"pos": "middle-right", "text": "Rt. Upper lid coloboma: Complications: Exposure keratopathy, corneal ulcer."},
        {"pos": "bottom", "text": "MARGIN CREASE DISTANCE - Normal: 7-10 mm. High in aponeurotic ptosis, absent in congenital ptosis."}
      ]
    },
    {
      "number": 15,
      "panels": [
        {"pos": "top", "text": "EYE LID TESTS - MRD TEST: Normal MRD1 (4-5 mm), MRD2 (>5 mm). Interpretation: Mild (1mm drop), Moderate (2-3mm), Severe (>4mm)."},
        {"pos": "bottom", "text": "LEVATOR FUNCTION TEST: Normal fissure (9-10 mm). Interpretation: Excellent (≥12mm), Good (8-11mm), Fair (5-7mm), Poor (0-4mm)."}
      ]
    }
  ]
}

output_dir = "client/public/flashcards/eyelid"
os.makedirs(output_dir, exist_ok=True)

# Image size was (1224, 1584)
W, H = 1224, 1584

def get_crop_box(pos, panel_index, total_panels):
    if pos == "top-left": return (0, 0, W//2, H//2)
    if pos == "top-right": return (W//2, 0, W, H//2)
    if pos == "bottom-left": return (0, H//2, W//2, H)
    if pos == "bottom-right": return (W//2, H//2, W, H)
    if pos == "top": return (0, 0, W, H//2)
    if pos == "bottom": return (0, H//2, W, H)
    if pos == "middle": return (0, H//4, W, 3*H//4)
    if pos == "right": return (W//2, 0, W, H)
    if pos == "left": return (0, 0, W//2, H)
    if "middle-left" in pos: return (0, H//4, W//2, 3*H//4)
    if "middle-right" in pos: return (W//2, H//4, W, 3*H//4)
    if "bottom-section" in pos: return (0, 3*H//4, W, H)
    
    # Fallback/Custom
    return (0, (panel_index * H // total_panels), W, ((panel_index+1) * H // total_panels))

flashcards = []

for page in extraction_data["pages"]:
    page_num = page["number"]
    # Adjust file name: page_2.png in subagent corresponds to page_1 in labeling
    # But in my files, page_2.png is page 2.
    # The subagent said "Page 1 is cover, extraction starts from Page 2"
    file_path = f"client/public/temp_eyelid/page_{page_num + 1}.png"
    
    if not os.path.exists(file_path):
        print(f"Skipping {file_path} - not found")
        continue
        
    img = Image.open(file_path)
    
    for idx, panel in enumerate(page["panels"]):
        box = get_crop_box(panel["pos"], idx, len(page["panels"]))
        cropped = img.crop(box)
        
        image_name = f"eyelid_{page_num}_{idx}.png"
        cropped.save(os.path.join(output_dir, image_name))
        
        flashcards.append({
            "id": f"eyelid_{page_num}_{idx}",
            "front": "",
            "back": panel["text"],
            "tags": [],
            "frontImage": {
                "url": f"/flashcards/eyelid/{image_name}",
                "masks": [],
                "scale": 1
            }
        })

import_data = {
    "deck": {
        "title": "Eyelid Study Material",
        "description": "Generated from eyelid.pdf",
        "subject": "Ophthalmology",
        "module": "Eyelid",
        "year": "Third Year",
        "isPublic": False
    },
    "cards": flashcards
}

with open("eyelid_flashcards.json", "w", encoding="utf-8") as f:
    json.dump(import_data, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(flashcards)} flashcards and cropped images.")
