import json

json_path = 'client/public/data/clinical_nutrition_questions.json'
with open(json_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Total questions in JSON: {len(questions)}")

empty_text = [q for q in questions if not q.get('text')]
print(f"Questions with empty text: {len(empty_text)}")
for q in empty_text[:10]:
    print(f"  ID: {q['id']}, Options: {q['options']}, Answer: {q['correctAnswer']}")

print("\nChecking ID duplicates:")
id_counts = {}
for q in questions:
    qid = q['id']
    id_counts[qid] = id_counts.get(qid, 0) + 1

duplicates = {k: v for k, v in id_counts.items() if v > 1}
print(f"Duplicate IDs: {len(duplicates)}")
for k, v in duplicates.items():
    print(f"  ID {k} occurs {v} times")
