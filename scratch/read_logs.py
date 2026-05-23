import json
import traceback

log_path = r"C:\Users\droma\.gemini\antigravity\brain\773f5459-4025-4368-8585-351ffd606f13\.system_generated\logs\transcript.jsonl"
out_path = r"d:\Med Prep\scratch\user_messages.txt"

with open(log_path, 'r', encoding='utf-8') as f, open(out_path, 'w', encoding='utf-8') as out:
    for line in f:
        try:
            d = json.loads(line)
            if d.get('source') == 'USER_EXPLICIT':
                out.write(f"=== STEP {d.get('step_index')} ===\n")
                out.write(str(d.get('content')) + "\n")
                out.write("-" * 40 + "\n")
        except Exception as e:
            out.write(f"ERROR: {str(e)}\n{traceback.format_exc()}\n")
