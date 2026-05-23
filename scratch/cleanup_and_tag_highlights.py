import json

json_path = 'client/public/data/clinical_nutrition_questions.json'
with open(json_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Clean up empty or duplicate question with ID CN_L1_Q3 and empty text
cleaned_questions = []
seen_ids = set()
removed_count = 0

for q in questions:
    qid = q.get('id')
    # Skip if text is empty
    if not q.get('text'):
        print(f"Removing empty/invalid question: ID={qid}")
        removed_count += 1
        continue
    
    cleaned_questions.append(q)

print(f"Removed {removed_count} empty questions. Total remaining: {len(cleaned_questions)}")

# The verified 25 highlighted question IDs
verified_highlight_ids = {
    'CN_L1_Q9', 'CN_L1_Q13', 'CN_L1_Q15',
    'CN_L2_Q3', 'CN_L2_Q18',
    'CN_L3_Q13',
    'CN_L4_Q1', 'CN_L4_Q3', 'CN_L4_Q12',
    'CN_L6_Q8', 'CN_L6_Q14', 'CN_L6_Q17',
    'CN_L7_Q6', 'CN_L7_Q8', 'CN_L7_Q9', 'CN_L7_Q12', 'CN_L7_Q14', 'CN_L7_Q16', 'CN_L7_Q17', 'CN_L7_Q18',
    'CN_L9_Q3', 'CN_L9_Q5', 'CN_L9_Q15', 'CN_L9_Q16', 'CN_L9_Q24'
}

for q in cleaned_questions:
    if q['id'] in verified_highlight_ids:
        q['isHighlighted'] = True
    else:
        q['isHighlighted'] = False

# Count how many are tagged
tagged_count = sum(1 for q in cleaned_questions if q.get('isHighlighted'))
print(f"Tagged {tagged_count} questions as highlighted.")

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(cleaned_questions, f, indent=2, ensure_ascii=False)

print("Saved updated clinical_nutrition_questions.json successfully.")
