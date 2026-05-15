
import admin
from firebase_admin import credentials, firestore

# Try to find service account or local config
try:
    cred = credentials.Certificate('service-account.json')
    admin.initialize_app(cred)
except:
    # If no service account, we might need another way or prompt user
    print("Error: service-account.json not found. Please provide credentials.")
    exit(1)

db = firestore.client()

# Search for user by name or recent activity
users_ref = db.collection('users')
docs = users_ref.stream()

for doc in docs:
    data = doc.to_dict()
    print(f"ID: {doc.id}, Name: {data.get('displayName')}, Email: {data.get('email')}")
