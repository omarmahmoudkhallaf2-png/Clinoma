import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred_path = r"D:\fire base key\med-prep-9d808-firebase-adminsdk-fbsvc-a21d2f91e1.json"
cred = credentials.Certificate(cred_path)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Query flashspace_boards where module == 'Opthalmology' (note: spelling in db is 'Opthalmology' with one 'h'!)
boards_ref = db.collection("flashspace_boards").where("module", "==", "Opthalmology")
docs = boards_ref.stream()

boards_data = []
for doc in docs:
    d = doc.to_dict()
    d["id"] = doc.id
    boards_data.append(d)

print(f"Total Ophthalmology boards found: {len(boards_data)}")

# Save to a local json file
out_path = r"C:\Users\droma\Desktop\ophthalmology_boards.json"
with open(out_path, "w", encoding="utf-8") as out_f:
    json.dump(boards_data, out_f, indent=2, ensure_ascii=False)
print(f"Saved to: {out_path}")
