import json

highlighted_ids = [
    'CN_L1_Q13', 'CN_L1_Q15', 'CN_L1_Q2', 'CN_L1_Q3', 'CN_L1_Q9', 
    'CN_L2_Q1', 'CN_L2_Q14', 'CN_L2_Q15', 'CN_L2_Q16', 'CN_L2_Q18', 
    'CN_L2_Q2', 'CN_L2_Q3', 'CN_L2_Q4', 'CN_L2_Q7', 'CN_L3_Q13', 
    'CN_L4_Q1', 'CN_L4_Q12', 'CN_L4_Q3', 'CN_L6_Q14', 'CN_L6_Q17', 
    'CN_L6_Q8', 'CN_L6_Q9', 'CN_L7_Q14', 'CN_L7_Q16', 'CN_L7_Q17', 
    'CN_L7_Q18', 'CN_L7_Q6', 'CN_L7_Q8', 'CN_L7_Q9', 'CN_L9_Q15', 
    'CN_L9_Q16', 'CN_L9_Q24', 'CN_L9_Q3', 'CN_L9_Q5'
]

json_path = 'client/public/data/clinical_nutrition_questions.json'
with open(json_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions:
    if q['id'] in highlighted_ids:
        q['isHighlighted'] = True
    else:
        q['isHighlighted'] = False

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"Updated {len(questions)} questions in {json_path}. Marked {len(highlighted_ids)} questions as isHighlighted: true.")
