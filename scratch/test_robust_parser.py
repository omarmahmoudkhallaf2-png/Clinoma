import re

with open("scratch/pdf_text.txt", "r", encoding="utf-8") as f:
    pdf_text = f.read()

# Split by pages
pages = pdf_text.split("=== PAGE ")
parsed_pages = []
for p in pages:
    if not p.strip():
        continue
    # Extract page number
    lines = p.split("\n")
    header = lines[0].strip()
    page_num = int(header.split(" ===")[0])
    page_text = "\n".join(lines[1:])
    parsed_pages.append((page_num, page_text))

print(f"Loaded {len(parsed_pages)} pages from pdf_text.txt")

# Define a robust pattern
# A number at start of line or after newline, followed by optional dots/dashes/stars, and space, then either '*' or a letter
pattern = r'(?:^|\n)\s*(\d{1,2})\s*[\.\-\*]*\s+(?=[A-Za-z\*])'

all_found = []
for p_num, p_text in parsed_pages:
    matches = list(re.finditer(pattern, p_text))
    q_nums = [int(m.group(1)) for m in matches]
    all_found.append((p_num, q_nums))
    print(f"Page {p_num}: {q_nums}")

total_qs = sum(len(qs) for p_num, qs in all_found)
print(f"Total questions found with this pattern: {total_qs}")
