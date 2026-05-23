import json

with open('client/public/data/clinical_nutrition_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions:
    if not q.get('text'):
        continue
    all_text = q['text'].lower() + " " + " ".join(opt.lower() for opt in q['options'])
    if 'gluten' in all_text or 'celiac' in all_text:
        print(f"ID: {q['id']}, Ch: {q['lectureNumber']}, Text: {q['text']}, Options: {q['options']}, Answer: {q['correctAnswer']}")
