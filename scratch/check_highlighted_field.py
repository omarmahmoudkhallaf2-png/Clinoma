import json

json_path = 'client/public/data/clinical_nutrition_questions.json'
with open(json_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

highlighted_qs = [q for q in questions if q.get('isHighlighted')]
print(f"Total questions: {len(questions)}")
print(f"Highlighted questions (isHighlighted == True): {len(highlighted_qs)}")
if highlighted_qs:
    print("Sample highlighted question:")
    print(json.dumps(highlighted_qs[0], indent=2, ensure_ascii=False))
