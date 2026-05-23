import json

json_path = 'client/public/data/clinical_nutrition_questions.json'
with open(json_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

lectures = {}
for q in questions:
    ln = q['lectureNumber']
    lectures[ln] = lectures.get(ln, 0) + 1

print("Questions count per lectureNumber in JSON:")
for ln in sorted(lectures.keys()):
    print(f"  Lecture {ln}: {lectures[ln]} questions")
