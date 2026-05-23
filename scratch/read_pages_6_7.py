import fitz

doc = fitz.open("clinical_nutrition.pdf")
print("PAGE 6:")
print(doc[5].get_text())

print("\nPAGE 7:")
print(doc[6].get_text())
