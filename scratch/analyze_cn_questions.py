import json

with open("client/public/data/clinical_nutrition_questions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

print(f"Total questions: {len(questions)}")
chapters = {}
for q in questions:
    ch = q.get("lectureNumber", "Unknown")
    chapters[ch] = chapters.get(ch, 0) + 1

for ch, count in sorted(chapters.items()):
    print(f"Chapter {ch}: {count} questions")
