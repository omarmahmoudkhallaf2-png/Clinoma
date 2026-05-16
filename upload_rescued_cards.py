import firebase_admin
from firebase_admin import credentials, firestore
import json
import time

# 1. إعداد الاتصال (بياناتك موجودة في المشروع)
# ملحوظة: لو عندك ملف service-account.json حطه هنا، لو لا هنستخدم الطريقة العادية
try:
    # محاولة قراءة ملف البيانات المنقذة
    with open('emergency_backup.json', 'r', encoding='utf-8') as f:
        cards = json.load(f)
    
    print(f"✅ تم تحميل {len(cards)} كارت من الملف.")

    # إعداد الـ Firebase (لازم تكون مسجل دخول في Firebase CLI أو معاك ملف مفاتيح)
    # لو مش معاك الملف، السكربت ده هيطلب منك تسجيل الدخول
    if not firebase_admin._apps:
        # هنا إنت محتاج تحط مسار ملف الـ Service Account بتاعك
        # لو مش عارف تجيبه، قولي وأنا هخليك ترفعه من المتصفح بطريقة مقسمة
        cred = credentials.Certificate('service-account.json') 
        firebase_admin.initialize_app(cred)

    db = firestore.client()

    # 2. إنشاء مجموعة جديدة (Deck)
    deck_data = {
        "title": "Eyelid - Rescued Deck",
        "subject": "Ophthalmology",
        "createdAt": int(time.time() * 1000),
        "cardCount": len(cards),
        "userId": "RESCUED_USER" # هنغيره لـ ID بتاعك
    }
    
    _, deck_ref = db.collection('decks').add(deck_data)
    print(f"✅ تم إنشاء المجموعة بـ ID: {deck_ref.id}")

    # 3. رفع الكروت على دفعات (Chunks)
    CHUNK_SIZE = 10
    for i in range(0, len(cards), CHUNK_SIZE):
        chunk = cards[i:i + CHUNK_SIZE]
        batch = db.batch()
        
        for card in chunk:
            card_ref = db.collection('flashcards').document()
            card_to_save = {
                **card,
                "deckId": deck_ref.id,
                "createdAt": int(time.time() * 1000),
                "nextReview": int(time.time() * 1000),
                "status": "new"
            }
            batch.set(card_ref, card_to_save)
        
        batch.commit()
        print(f"🚀 تم رفع {min(i + CHUNK_SIZE, len(cards))} من {len(cards)}...")

    print("\n🎉 مبروك! كل الكروت بقت على السيرفر دلوقتي.")

except Exception as e:
    print(f"❌ خطأ: {e}")
    print("\nيبدو إنك محتاج ملف service-account.json عشان أقدر أرفعلك البيانات من هنا.")
