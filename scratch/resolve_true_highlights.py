import json

# List of highlights
raw_highlights = [
    "The DASH diet is primarily designed to help with",
    "When modifying a diet for GERD, individuals are advised to avoid",
    "What is the primary component of a low-FODMAP diet",
    "Which nutrient is essential for liver health but should be consumed in moderation in liver",
    "What type of carbohydrates should be prioritized for liver disease management",
    "Which dietary pattern is associated with a lower risk of heart disease",
    "What type of diet could benefit a patient with Crohn's disease during a flare-up",
    "A dietitian recommends a gluten-free diet for a patient with which condition",
    "For patients with IBS, a dietitian might recommend",
    "Which type of diet is recommended for a patient on dialysis",
    "Which of the following is not a recommended beverage for patients with CKD",
    "Which of the following is an essential mineral that may need supplementation in patients",
    "What kind of foods should be avoided by renal patients to reduce phosphorus intake",
    "In patients with multiple organ failure, what is a critical nutritional concern",
    "What is the goal of nutrition support in patients recovering from comatose states",
    "For patients with heart failure, which dietary modification is typically advised",
    "Which method of feeding is most common for patients who cannot swallow due to",
    "In caring for a patient with renal failure, which dietary modification is necessary",
    "For a patient in septic shock, which dietary component is crucial for recovery",
    "What is the primary goal of dietary management in comatosed patients",
    "Which dietary approach is commonly utilized for patients with hepatic failure",
    "What should be the main focus of a post-operative diet in the first 24-48 hours",
    "What type of diet is most appropriate for a patient recovering from abdominal surgery",
    "What type of meal may be particularly beneficial immediately after surgery",
    "What is the role of fiber in the diet of post-operative patients",
    "Which type of post-operative surgery patients are often put on a low sodium diet"
]

json_path = 'client/public/data/clinical_nutrition_questions.json'
with open(json_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions.")

matched_questions = []
matched_ids = set()

for idx, hl in enumerate(raw_highlights):
    hl_clean = hl.lower().strip()
    found = False
    for q in questions:
        # Avoid the empty-text question we found earlier
        if not q.get('text'):
            continue
        q_text = q['text'].lower()
        if hl_clean in q_text:
            matched_questions.append(q)
            matched_ids.add(q['id'])
            print(f"Highlight {idx+1} -> Found exact match: [{q['id']}] {q['text'][:70]}... (Ch {q['lectureNumber']})")
            found = True
            break
    if not found:
        # Loose search
        for q in questions:
            if not q.get('text'):
                continue
            # Try matching some words
            words = hl_clean.split()
            matches_count = sum(1 for w in words if w in q['text'].lower())
            if matches_count >= len(words) - 2 and len(words) > 4:
                matched_questions.append(q)
                matched_ids.add(q['id'])
                print(f"Highlight {idx+1} -> Loose match: [{q['id']}] {q['text'][:70]}... (Ch {q['lectureNumber']})")
                found = True
                break
        if not found:
            print(f"Highlight {idx+1} -> NOT FOUND: {hl}")

print(f"\nTotal matched unique questions: {len(matched_ids)}")
print("Matched IDs:", sorted(list(matched_ids)))
