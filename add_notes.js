const fs = require('fs');
let code = fs.readFileSync('client/src/pages/flashcards/FlashSpace.tsx', 'utf8');

const notes = {
  "THYROID GLAND DISORDERS": `**أولاً: قصور الغدة الدرقية الخلقي (Congenital Hypothyroidism)**

يُعتبر من أهم وأخطر أمراض الغدد في حديثي الولادة؛ لأن التأخر في اكتشافه وعلاجه يؤدي إلى تخلف عقلي دائم لا يمكن علاجه (Irreversible mental retardation / Cretinism).

**الأسباب (Causes):** أشهر سبب هو خلل أو غياب في تكوين الغدة (Thyroid dysgenesis بنسبة 85%)، يليه خلل وراثي في إنزيمات تصنيع هرمون الثايروكسين (Dyshormonogenesis).

**Enumerate the Clinical Picture of Congenital Hypothyroidism:**
غالباً يولد الطفل طبيعياً (لاعتماده على هرمونات الأم التي عبرت المشيمة أثناء الحمل)، ولكن تبدأ الأعراض في الظهور خلال الأسابيع الأولى:
* **Gastrointestinal:** طول فترة الصفراء الفسيولوجية (Prolonged physiological jaundice)، إمساك مزمن (Constipation)، وضعف في الرضاعة (Poor feeding).
* **Facies & Head:** كبر حجم اللسان وخروجه من الفم (Macroglossia)، ملامح وجه غليظة (Coarse facies)، وتأخر انغلاق اليافوخ وكبر حجمه (Large / Delayed closure of anterior fontanelle).
* **Abdomen:** فتق سري أو بروز في السرة (Umbilical hernia) مع انتفاخ البطن.
* **Neurological & General:** خمول شديد وكثرة النوم، بكاء بصوت أجش (Hoarse cry)، وبرودة وجفاف في الجلد (Cold mottled skin).

**Diagnosis & Treatment:**
* التشخيص الأساسي والمنقذ يعتمد على المسح الطبي الإجباري لحديثي الولادة (Neonatal screening) بقياس مستوى الـ TSH (يكون مرتفعاً جداً) والـ Free T4 (يكون منخفضاً).
* العلاج يتمثل في الاستعاضة الهرمونية بإعطاء Levothyroxine فوراً ومدى الحياة.

<br/>

**ثانياً: فرط نشاط الغدة الدرقية (Hyperthyroidism)**

أشهر سبب له في الأطفال والمراهقين هو مرض جريفز (Graves' disease)، وهو مرض مناعي ذاتي (Autoimmune) تُحفز فيه الأجسام المضادة الغدة لإفراز الهرمونات بكثرة.

**Enumerate the Clinical Picture of Hyperthyroidism:**
* **General:** فقدان ملحوظ في الوزن بالرغم من زيادة الشهية وكثرة الأكل (Weight loss despite increased appetite)، وعدم تحمل الحرارة وزيادة التعرق (Heat intolerance).
* **Local (Neck & Eyes):** تضخم في الغدة الدرقية في الرقبة (Goiter)، وجحوظ في العينين (Exophthalmos).
* **Cardiovascular:** سرعة في ضربات القلب (Tachycardia / Palpitations) وارتفاع في ضغط الدم.
* **Neurological:** عصبية زائدة، تقلب في المزاج، تراجع في المستوى الدراسي، ورعشة في اليدين (Nervousness & Tremors).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic لعلامات الـ Congenital Hypothyroidism:**
لربط شكل طفل قصور الغدة وتذكره بسهولة في الكلينيكال والنظري، تذكر هذه الجملة:
**(كسلان وممسك وصفراه مطولة.. لسانه كبير وسرته بارزة)**
* كسلان: Lethargy, Poor feeding & Hoarse cry
* ممسك: Constipation
* صفراه مطولة: Prolonged physiological jaundice
* لسانه كبير: Macroglossia & Coarse facies
* سرته بارزة: Umbilical hernia & distended abdomen

2. **Mnemonic لعلامات الـ Hyperthyroidism (Graves' disease):**
لربط أعراض فرط النشاط (الحرق العالي)، تذكر هذه الجملة:
**(رقبته وعينه منفوخين.. قلبه سريع وبياكل وبيخس)**
* رقبته وعينه منفوخين: Goiter & Exophthalmos
* قلبه سريع: Tachycardia (Nervousness & Tremors)
* بياكل وبيخس: Increased appetite with weight loss`,

  "SHORT STATURE & TALL STATURE": `**أولاً: قصر القامة (Short Stature)**

**التعريف:** يتم تشخيص الطفل بقصر القامة إذا كان طوله يقع أسفل الشريحة المئوية الثالثة (< 3rd percentile) أو أقل من الانحراف المعياري الثاني (-2 SD) على منحنيات النمو بالنسبة لعمره وجنسه.

**Enumerate the Causes of Short Stature:** تنقسم الأسباب إلى 3 مجموعات رئيسية:
1. **Normal Variants (أسباب فسيولوجية / طبيعية):** وهي الأشهر ولا تعتبر مرضاً.
   * **Familial short stature:** قصر القامة العائلي (الطفل قصير لأن والديه قصار، ونموه العظمي Bone age يكون مطابقاً لعمره الزمني).
   * **Constitutional delay of growth and puberty (CDGP):** تأخر النمو والبلوغ الفسيولوجي (الطفل يتأخر في الطول والبلوغ لكنه يصل لطول طبيعي في النهاية، والـ Bone age يكون متأخراً عن عمره الزمني).
2. **Endocrinal Causes (أسباب الغدد الصماء):**
   * **Growth Hormone (GH) deficiency:** نقص هرمون النمو.
   * **Hypothyroidism:** خمول الغدة الدرقية.
   * **Cushing syndrome:** متلازمة كوشينغ (زيادة الكورتيزون).
3. **Systemic & Genetic Causes (أسباب جهازية وجينية):**
   * **Malnutrition:** سوء التغذية (أشهر سبب مرضي في الدول النامية).
   * **Chronic illnesses:** الأمراض المزمنة (مثل الفشل الكلوي CKD، وأمراض القلب CHD، وحساسية القمح Celiac disease).
   * **Genetic syndromes:** المتلازمات الجينية (مثل Turner syndrome في الإناث، و Down syndrome).
   * **Skeletal dysplasias:** خلل نمو العظام (مثل التقزم Achondroplasia).

<br/>

**ثانياً: طول القامة (Tall Stature)**

**التعريف:** طول الطفل يقع أعلى من الشريحة المئوية الـ 97 (> 97th percentile) أو أعلى من الانحراف المعياري الثاني (+2 SD).

**Enumerate the Causes of Tall Stature:**
1. **Familial tall stature:** طول القامة العائلي (السبب الأشهر).
2. **Endocrinal causes:**
   * **Gigantism (العملقة):** زيادة إفراز هرمون النمو (GH excess) قبل انغلاق المشاشيات.
   * **Precocious puberty:** البلوغ المبكر (يسبب طفرة نمو مبكرة فتجعل الطفل أطول من أقرانه مؤقتاً، لكنه يؤدي إلى قصر القامة في البلوغ بسبب الالتحام المبكر للعظام).
3. **Genetic syndromes:**
   * **Marfan syndrome:** متلازمة مارفان (عيوب في الأنسجة الضامة تؤدي لطول مفرط ومشاكل بالقلب والعين).
   * **Klinefelter syndrome:** متلازمة كلاينفلتر (في الذكور 47,XXY).
   * **Sotos syndrome**.

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic لأسباب قصر القامة (Short Stature):**
لربط أهم الأسباب المرضية والفسيولوجية، تذكر هذه الجملة:
**(عيلة متأخرة.. وغدة ناقصة وكورتيزون عالي.. وبنت اسمها ترنر عندها سوء تغذية ومرض مزمن)**
* عيلة متأخرة: Familial & Constitutional delay (CDGP)
* غدة ناقصة وكورتيزون عالي: GH deficiency, Hypothyroidism, Cushing syndrome
* ترنر: Turner syndrome (Genetic)
* سوء تغذية: Malnutrition
* مرض مزمن: Chronic illnesses

2. **Mnemonic لأسباب طول القامة (Tall Stature):**
لربط أسباب الطول المفرط، تذكر هذه الجملة:
**(عيلة طويلة فيها عملاق.. ومعاهم مارفان وكلاينفلتر)**
* عيلة طويلة: Familial tall stature
* عملاق: Gigantism
* مارفان وكلاينفلتر: Marfan & Klinefelter syndromes (Genetic)`,

  "PUBERTY and DISORDERS": `**أولاً: التسلسل الطبيعي للبلوغ (Normal Sequence of Puberty)**
من المهم جداً معرفة الترتيب الطبيعي لظهور علامات البلوغ للتفرقة بين الطبيعي والمرضي:

* **في الإناث (Females):** يبدأ البلوغ عادة بين عمر 8 إلى 13 سنة.
  1. أول علامة تظهر هي نمو الثدي (Thelarche).
  2. يليها ظهور شعر العانة (Pubarche).
  3. ثم تحدث طفرة النمو في الطول (Peak height velocity).
  4. وأخيراً نزول الدورة الشهرية الأولى (Menarche).
* **في الذكور (Males):** يبدأ البلوغ عادة بين عمر 9 إلى 14 سنة.
  1. أول علامة على الإطلاق هي زيادة حجم الخصية (Testicular enlargement).
  2. يليها ظهور شعر العانة، ثم طفرة النمو.

<br/>

**ثانياً: البلوغ المبكر (Precocious Puberty)**

**التعريف:** هو ظهور علامات البلوغ (الثانوية) قبل عمر 8 سنوات في البنات، وقبل عمر 9 سنوات في الأولاد.

**Enumerate the causes of Precocious Puberty:**
ينقسم البلوغ المبكر إلى نوعين رئيسيين حسب مكان الخلل:
1. **Central (GnRH-dependent):** الخلل يأتي من المخ (تنشيط مبكر للمحور النخامي).
   * **Idiopathic:** غير معروف السبب (وهو الأشهر في البنات).
   * **CNS tumors / lesions:** أورام أو إصابات في المخ (وهو الأشهر كسبب عضوي في الأولاد).
   * **CNS infections:** مثل التهاب السحايا أو الدماغ.
2. **Peripheral (GnRH-independent):** الخلل في الغدد الطرفية (المبيض، الخصية، أو الكظرية) التي تفرز الهرمونات مباشرة.
   * **Ovarian cysts / tumors:** تكيسات أو أورام المبيض.
   * **Testicular tumors:** أورام الخصية.
   * **Congenital Adrenal Hyperplasia (CAH):** تضخم الغدة الكظرية الخلقي.
   * **McCune-Albright syndrome:** متلازمة وراثية يصاحبها تصبغات بالجلد.

<br/>

**ثالثاً: تأخر البلوغ (Delayed Puberty)**

**التعريف:** هو عدم ظهور أي علامات للبلوغ حتى عمر 13 سنة في البنات، أو 14 سنة في الأولاد.

**Enumerate the causes of Delayed Puberty:**
1. **Constitutional delay of growth and puberty:** تأخر فسيولوجي عائلي (الأطفال يبلغون متأخراً ولكن يصلون لطول وبلوغ طبيعي في النهاية، وهو أشهر سبب).
2. **Hypergonadotropic hypogonadism (Primary failure):** فشل الغدد التناسلية نفسها (المبيض أو الخصية لا يستجيبان للمخ).
   * **Turner syndrome:** متلازمة ترنر (في الإناث).
   * **Klinefelter syndrome:** متلازمة كلاينفلتر (في الذكور).
3. **Hypogonadotropic hypogonadism (Secondary failure):** الغدة النخامية لا تفرز الهرمونات المحفزة.
   * **Chronic illnesses & Malnutrition:** الأمراض المزمنة وسوء التغذية الشديد.
   * **Kallmann syndrome:** متلازمة كالمان (نقص هرمونات البلوغ مصحوباً بفقدان حاسة الشم Anosmia).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic لأسباب البلوغ المبكر (Precocious Puberty):**
لربط الأسباب المركزية والطرفية، تذكر هذه الجملة:
**(مخ مجهول وفيه ورم.. ومبيض وخصية وكظرية استعجلوا)**
* مخ مجهول: Idiopathic (Central)
* فيه ورم: CNS tumors (Central)
* مبيض وخصية: Ovarian & Testicular tumors (Peripheral)
* كظرية: CAH (Peripheral)

2. **Mnemonic لأسباب تأخر البلوغ (Delayed Puberty):**
لربط أشهر أسباب التأخر، تذكر هذه الجملة:
**(عيلة متأخرة، وكروموسومات بايظة زي ترنر وكلاينفلتر، وكالمان اللي مش بيشم مع سوء التغذية)**
* عيلة متأخرة: Constitutional delay
* كروموسومات بايظة: Turner & Klinefelter syndromes
* كالمان اللي مش بيشم: Kallmann syndrome (with Anosmia)
* سوء التغذية: Malnutrition & Chronic illnesses`,

  "PARATHYROID GLAND DISORDERS": `**أولاً: قصور الغدة الجار درقية (Hypoparathyroidism)**

**الوظيفة الأساسية:** تفرز الغدة هرمون الـ Parathyroid Hormone (PTH) الذي يعمل على رفع مستوى الكالسيوم (Calcium) وتقليل الفوسفور (Phosphorus) في الدم. وبالتالي، القصور يؤدي مباشرة إلى Hypocalcemia و Hyperphosphatemia.

**Enumerate the Causes of Hypoparathyroidism:**
1. **Congenital:** أشهر متلازمة هي DiGeorge syndrome (والتي تتميز بغياب الغدة الجار درقية والغدة الزعترية Thymus gland).
2. **Acquired:**
   * **جراحي:** الاستئصال الخطأ أو الإصابة أثناء عمليات الغدة الدرقية (Post-thyroidectomy).
   * **مناعي:** تدمير الغدة بسبب أجسام مضادة (Autoimmune).

**Clinical Picture & Treatment:**
* **Clinical picture:** الأعراض كلها تتمحور حول زيادة الاستثارة العصبية بسبب نقص الكالسيوم وتظهر في شكل Tetany:
  * **Latent tetany:** علامات Chvostek's sign و Trousseau's sign.
  * **Manifest tetany:** تشنجات الأطراف (Carpopedal spasm)، اختناق/تشنج الحنجرة (Laryngospasm)، أو تشنجات عامة (Convulsions).
* **Treatment:** تعويض النقص عن طريق إعطاء الكالسيوم (Calcium supplements) وفيتامين د النشط (Calcitriol).

<br/>

**ثانياً: فرط نشاط الغدة الجار درقية (Hyperparathyroidism)**
ينتج عن زيادة إفراز الـ PTH، مما يؤدي إلى سحب الكالسيوم من العظام وارتفاعه في الدم (Hypercalcemia).

**Enumerate the Types and Causes of Hyperparathyroidism:**
1. **Primary Hyperparathyroidism:** المشكلة في الغدة نفسها، وغالباً بسبب ورم حميد (Parathyroid adenoma).
2. **Secondary Hyperparathyroidism:** استجابة فسيولوجية من الغدة لنقص الكالسيوم المزمن في الجسم، وأشهر سبب لها في الأطفال هو الفشل الكلوي المزمن (Chronic Kidney Disease - CKD).

**Enumerate the Clinical Picture of Hypercalcemia (Primary Type):**
أعراض زيادة الكالسيوم في الدم تؤثر على عدة أجهزة:
* **Renal:** تكوّن حصوات الكلى (Renal stones) وكثرة التبول (Polyuria).
* **Musculoskeletal:** ألم في العظام، هشاشة (Osteoporosis)، وضعف في العضلات (Muscle weakness).
* **Gastrointestinal:** ألم في البطن، غثيان، وإمساك شديد (Constipation).
* **Neurological/Psychiatric:** اكتئاب، خمول، واضطرابات في المزاج (Depression & Lethargy).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic لأسباب الـ Hypoparathyroidism:**
لربط أسباب نقص إفراز الغدة، تذكر هذه الجملة:
**(دي جورج عمل عملية.. فالمناعة ضربت الغدة وجاله تيتاني)**
* دي جورج: DiGeorge syndrome (Congenital)
* عملية: Post-thyroidectomy (Acquired)
* المناعة ضربت الغدة: Autoimmune
* جاله تيتاني: العرض الأساسي وهو الـ Tetany

2. **Mnemonic لعلامات الـ Hypercalcemia (في الـ Hyperparathyroidism):**
لربط أعراض الكالسيوم العالي (Stones, bones, abdominal groans)، تذكر هذه الجملة:
**(حصوة في كليته، وهشاشة في عضمه، وبطنه ممسكة، ومزاجه مكتئب)**
* حصوة في كليته: Renal stones
* هشاشة في عضمه: Osteoporosis & Bone pain
* بطنه ممسكة: Abdominal pain & Constipation
* مزاجه مكتئب: Depression & Lethargy`,

  "INTRODUCTION TO ENDOCRINE SYSTEM": `**أولاً: المحور تحت المهادي - النخامي (Hypothalamic-Pituitary Axis)**
* يُعتبر الـ Hypothalamus هو المايسترو الحقيقي لجهاز الغدد الصماء، حيث يتحكم في الغدة النخامية (Pituitary gland) عن طريق إفراز هرمونات محفزة (Releasing hormones) أو هرمونات مثبطة (Inhibitory hormones).
* الغدة النخامية بدورها تتحكم في باقي الغدد الصماء في الجسم (Target glands) مثل الغدة الدرقية والكظرية.

<br/>

**ثانياً: هرمونات الغدة النخامية (Pituitary Hormones)**

**A. Enumerate the hormones of Anterior Pituitary (الفص الأمامي):**
يُفرز الفص الأمامي 6 هرمونات أساسية:
1. **Growth Hormone (GH):** مسؤول عن النمو الخطي للعظام والعضلات.
2. **Thyroid Stimulating Hormone (TSH):** يحفز الغدة الدرقية لإفراز هرموناتها.
3. **Adrenocorticotropic Hormone (ACTH):** يحفز قشرة الغدة الكظرية (Adrenal cortex) لإفراز الكورتيزول.
4. **Follicle Stimulating Hormone (FSH) & Luteinizing Hormone (LH):** يتحكمان في تطور البلوغ ووظائف الغدد التناسلية (Gonads).
5. **Prolactin:** هرمون الحليب.

**B. Hormones of Posterior Pituitary (الفص الخلفي):**
هذا الفص لا يُصنع الهرمونات، بل يُخزن هرمونين يتم تصنيعهما في الـ Hypothalamus:
1. **Antidiuretic Hormone (ADH / Vasopressin):** يتحكم في توازن الماء في الجسم ويمنع إدرار البول.
2. **Oxytocin:** مسؤول عن انقباض الرحم وإدرار الحليب.

<br/>

**ثالثاً: الأعراض الإكلينيكية لأمراض الغدد الصماء (Endocrine Presentations)**
أمراض الغدد الصماء في الأطفال لها علامات مميزة يجب الانتباه لها في العيادة.

**Enumerate the common clinical presentations of endocrine disorders in children:**
1. **Growth disorders:** وأشهرها قصر القامة (Short stature) أو نادراً العملقة (Gigantism).
2. **Weight abnormalities:** السمنة المفرطة والمرضية (Obesity) أو فقدان الوزن الشديد (كما في مرض السكري).
3. **Pubertal disorders:** إما البلوغ المبكر (Precocious puberty) أو تأخر البلوغ (Delayed puberty).
4. **Polyuria & Polydipsia:** كثرة التبول والعطش الشديد (علامة مميزة لمرض السكري Diabetes Mellitus أو السكري الكاذب Diabetes Insipidus).
5. **Ambiguous genitalia:** الأعضاء التناسلية المبهمة أو غير الواضحة عند الولادة (وأشهر سبب لها هو الـ Congenital Adrenal Hyperplasia - CAH).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic لهرمونات الفص الأمامي (Anterior Pituitary):**
لربط الهرمونات ووظائفها، تذكر هذه الجملة:
**(غدة بتكبّر، وتنشط الدرقية والكظرية.. وتبلّغ وتجيب لبن)**
* تكبّر: Growth Hormone (GH)
* الدرقية: TSH
* الكظرية: ACTH
* تبلّغ: FSH & LH (Gonadotropins)
* تجيب لبن: Prolactin

2. **Mnemonic لأشهر أعراض الغدد الصماء في الأطفال (Clinical Presentations):**
لتذكر كيف يأتيك طفل الغدد الصماء في العيادة، تذكر هذه الجملة:
**(قصير وتخين، بيعمل حمام كتير، وبلوغه متلخبط، ونوعه مبهم)**
* قصير: Short stature (Growth disorders)
* تخين: Obesity (Weight abnormalities)
* بيعمل حمام كتير: Polyuria & Polydipsia
* بلوغه متلخبط: Precocious / Delayed puberty
* نوعه مبهم: Ambiguous genitalia`,

  "DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA)": `**أولاً: مرض السكري النوع الأول (Type 1 Diabetes Mellitus)**

يُعد النوع الأول هو الأشهر في الأطفال، وينتج عن تدمير مناعي لخلايا بيتا في البنكرياس (Autoimmune destruction of Pancreatic Beta cells)، مما يؤدي إلى نقص مطلق في الأنسولين (Absolute Insulin deficiency).

**Enumerate the Clinical Picture of DM Type 1:**
عادة ما يظهر الطفل بالأعراض الكلاسيكية (Classic Tetrad):
1. **Polyuria:** كثرة التبول.
2. **Polydipsia:** كثرة العطش وشرب الماء.
3. **Polyphagia:** زيادة الشهية وكثرة الأكل.
4. **Weight loss:** فقدان ملحوظ في الوزن بالرغم من كثرة الأكل.

<br/>

**ثانياً: الحماض الكيتوني السكري (Diabetic Ketoacidosis - DKA)**

**التعريف:** هو من أخطر مضاعفات السكري الطارئة في الأطفال. يحدث نتيجة نقص شديد في الأنسولين مع وجود عامل محفز (Precipitating factor) مثل: العدوى (Infections) أو إيقاف/نسيان جرعة الأنسولين (Missed insulin dose).

**Enumerate the Clinical Picture of DKA:**
1. **Severe Dehydration:** جفاف شديد نتيجة كثرة التبول (الـ Polyuria) والقيء.
2. **Acidotic (Kussmaul) breathing:** تنفس عميق وسريع جداً كمحاولة من الجسم لطرد ثاني أكسيد الكربون وتقليل حموضة الدم.
3. **Fruity breath odor:** رائحة الفم تشبه الأسيتون أو التفاح الفاسد.
4. **Gastrointestinal symptoms:** ألم شديد في البطن (Severe abdominal pain) قد يشبه التهاب الزائدة الدودية، مع غثيان وقيء (Nausea & Vomiting).
5. **Neurological symptoms:** اضطراب في درجة الوعي قد يتطور إلى غيبوبة (Altered sensorium / Coma).

<br/>

**ثالثاً: الفحوصات والعلاج (Investigations & Treatment of DKA)**

**Investigations:**
* **Blood:** ارتفاع السكر (Hyperglycemia عادة > 200 mg/dl)، وحموضة في الدم (Metabolic acidosis حيث يكون الـ pH < 7.3 والـ HCO3 < 15).
* **Urine:** وجود سكر وكيتونات عالية (Glucosuria & Ketonuria).

**Enumerate the lines of Treatment in DKA:**
1. **Fluid therapy (IV Fluids):** هي أهم وأول خطوة لتعويض الجفاف الشديد وتحسين الدورة الدموية (نبدأ عادة بمحلول ملح Normal Saline 0.9%).
2. **Insulin therapy:** إعطاء أنسولين مائي بالوريد بشكل مستمر وبطيء (IV Regular Insulin infusion) لتقليل السكر والكيتونات. (يُمنع إعطاء جرعة كبيرة سريعة Bolus لتجنب هبوط السكر وتورم المخ).
3. **Potassium replacement:** إضافة البوتاسيوم للمحاليل لتجنب الهبوط الحاد في مستواه (Hypokalemia) الذي يحدث عند بدء إعطاء الأنسولين.
4. **Treatment of precipitating factor:** علاج السبب الأساسي (مثل إعطاء مضادات حيوية إذا كان السبب Infection).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic لعلامات الـ DKA (Clinical Picture):**
لربط شكل طفل الـ DKA في الاستقبال، تذكر هذه الجملة:
**(بطنه بتوجعه وبيرجع.. ريحته أسيتون ونَفَسه سريع.. جاله جفاف ودخل في غيبوبة)**
* بطنه بتوجعه وبيرجع: Abdominal pain, Nausea & Vomiting
* ريحته أسيتون ونَفَسه سريع: Fruity odor & Kussmaul breathing
* جاله جفاف: Severe Dehydration
* دخل في غيبوبة: Altered sensorium / Coma

2. **Mnemonic لخطوات علاج الـ DKA (Treatment):**
لترتيب خطوات العلاج الصحيحة، تذكر هذه الجملة:
**(محلول في الوريد.. وأنسولين بالتقسيط.. وبوتاسيوم عشان القلب.. ونعالج السبب)**
* محلول في الوريد: Fluid therapy (Normal Saline)
* أنسولين بالتقسيط: IV Insulin infusion (Continuous, NOT bolus)
* بوتاسيوم عشان القلب: Potassium replacement
* نعالج السبب: Treatment of precipitating factor`,

  "CHILDHOOD OBESITY": `**أولاً: التعريف (Definition)**
يتم تشخيص السمنة في الأطفال إذا كان مؤشر كتلة الجسم (Body Mass Index - BMI) يقع على أو أعلى من الشريحة المئوية الـ 95 (أكبر من أو يساوي 95th percentile) بالنسبة للعمر والجنس على منحنيات النمو.

**ثانياً: الأسباب (Causes of Childhood Obesity)**
تنقسم أسباب السمنة في الأطفال إلى نوعين أساسيين:
1. **Exogenous / Primary obesity (السمنة الأولية):**
   * هي النوع الأشهر على الإطلاق.
   * تنتج عن عدم التوازن بين السعرات الحرارية المكتسبة والمحروقة بسبب: العادات الغذائية الخاطئة (الإفراط في الأكل)، قلة النشاط البدني (Physical inactivity)، بالإضافة إلى الاستعداد الجيني والعائلي (Familial predisposition).
2. **Endogenous / Secondary obesity (السمنة الثانوية/المرضية):**
   * ناتجة عن أمراض عضوية، وتشمل:
   * **Endocrinal causes:** مثل نقص إفراز الغدة الدرقية (Hypothyroidism) أو متلازمة كوشينغ (Cushing syndrome).
   * **Genetic syndromes:** مثل متلازمة برادر-ويلي (Prader-Willi syndrome) ومتلازمة داون (Down syndrome).

<br/>

**ثالثاً: التفرقة الإكلينيكية (Exogenous vs. Endogenous)**
كيف تفرق بين النوعين في الكشف الإكلينيكي؟
* **في السمنة الأولية (Exogenous):** الطفل يكون طوله طبيعياً أو أطول من أقرانه (Tall or normal stature)، وتوزيع الدهون يكون متجانساً في الجسم كله (Generalized fat distribution)، ومعدل ذكائه طبيعي.
* **في السمنة المرضية (Endogenous):** الطفل يعاني غالباً من قصر القامة (Short stature)، وتأخر في النضج العظمي (Delayed bone age)، وتوزيع الدهون قد يكون متركزاً في الجذع (Truncal / Centripetal)، وقد يصاحبه تأخر عقلي في حالات المتلازمات الجينية.

<br/>

**رابعاً: المضاعفات (Complications)**
**Enumerate the complications of Childhood Obesity:**
1. **Endocrinal:** السكري من النوع الثاني (Type 2 Diabetes Mellitus) ومقاومة الأنسولين (Insulin resistance).
2. **Cardiovascular:** ارتفاع ضغط الدم (Hypertension) واختلال دهون الدم (Dyslipidemia).
3. **Respiratory:** انقطاع النفس الانسدادي أثناء النوم (Obstructive sleep apnea - OSA) والربو.
4. **Orthopedic:** انزلاق مشاشية رأس عظمة الفخذ (Slipped capital femoral epiphysis) وتقوس الساقين (Bowing of legs).
5. **Psychological:** الاكتئاب، العزلة، وضعف الثقة بالنفس نتيجة التنمر (Depression & Low self-esteem).
6. **Hepatic:** الكبد الدهني غير الكحولي (Non-alcoholic fatty liver disease - NAFLD).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic لأسباب السمنة المرضية (Endogenous Causes):**
لربط أشهر الأسباب العضوية، تذكر هذه الجملة:
**(غدة كسلانة وكورتيزون عالي.. ووراثة من برادر وداون)**
* غدة كسلانة: Hypothyroidism
* كورتيزون عالي: Cushing syndrome
* وراثة من برادر وداون: Genetic (Prader-Willi & Down syndromes)

2. **Mnemonic لمضاعفات السمنة (Complications):**
لربط المضاعفات التي قد تُسأل عنها في الامتحان، تذكر هذه الجملة:
**(سكر وضغط يخنقوا نفسه، وكبد مدهنن يتعب عضمه ونفسيته)**
* سكر: Type 2 DM / Insulin resistance (Endocrinal)
* ضغط: Hypertension (Cardiovascular)
* يخنقوا نفسه: Obstructive sleep apnea (Respiratory)
* كبد مدهنن: NAFLD (Hepatic)
* يتعب عضمه: Slipped epiphysis & Bowing (Orthopedic)
* نفسيته: Depression & Low self-esteem (Psychological)`,

  "ADRENAL GLAND DISORDERS & CUSHING SYNDROME": `**أولاً: متلازمة كوشينغ (Cushing Syndrome)**
**التعريف:** هي حالة إكلينيكية تنتج عن التعرض المزمن لمستويات عالية من هرمون الكورتيزول (Chronic exposure to excessive Glucocorticoids).

**ثانياً: الأسباب (Causes of Cushing Syndrome)**
ينقسم الكوشينغ إلى نوعين رئيسيين:
1. **Exogenous (Iatrogenic):** وهو أشهر سبب في الأطفال، وينتج عن استخدام أدوية الكورتيزون لفترات طويلة.
2. **Endogenous:** وينقسم بدوره حسب هرمون الـ ACTH إلى:
   * **ACTH-dependent:** مثل أورام الغدة النخامية (Pituitary adenoma) ويُسمى في هذه الحالة (Cushing disease)، أو إفراز خارجي (Ectopic ACTH).
   * **ACTH-independent:** مثل أورام الغدة الكظرية نفسها (Adrenal adenoma أو Adrenal carcinoma).

<br/>

**ثالثاً: الصورة الإكلينيكية (Clinical Picture)**
**Enumerate the Clinical Picture of Cushing Syndrome:**
1. **Growth failure (Short stature):** قصر القامة (وهي أهم علامة تفرق بين الكوشينغ في الأطفال وبين السمنة العادية التي عادة ما يصاحبها طول طبيعي أو زائد).
2. **Obesity:** سمنة مركزية في الجذع (Centripetal obesity)، وجه مستدير كالقمر (Moon face)، وتراكم الدهون خلف الرقبة أو الكتفين (Buffalo hump).
3. **Skin changes:** خطوط حمراء/بنفسجية عريضة على البطن والفخذين (Purple striae)، حب الشباب (Acne)، زيادة كثافة الشعر (Hirsutism)، وسهولة التكدم (Easy bruising).
4. **Cardiovascular:** ارتفاع ضغط الدم (Hypertension).
5. **Musculoskeletal:** ضعف في العضلات (Muscle weakness) وهشاشة العظام (Osteoporosis).
6. **Endocrinal:** تأخر البلوغ (Delayed puberty) أو انقطاع الطمث.

<br/>

**رابعاً: الفحوصات والعلاج (Investigations & Treatment)**

**Investigations:**
* **Screening tests (لإثبات زيادة الكورتيزول):**
  * 24-hour urinary free cortisol
  * Midnight salivary cortisol
  * Low-dose dexamethasone suppression test
* **Localizing tests (لتحديد مكان الخلل):**
  * قياس مستوى الـ Serum ACTH (مرتفع في مشاكل النخامية، ومنخفض في أورام الكظرية).
  * أشعة مقطعية أو رنين مغناطيسي (CT or MRI) على المخ أو البطن.

**Treatment:**
* إذا كان السبب **Iatrogenic**: سحب الكورتيزون بالتدريج (Gradual tapering).
* إذا كان السبب **Tumor**: الاستئصال الجراحي (Surgical resection).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic لعلامات الكوشينغ (Clinical Picture):**
لربط أشهر العلامات في الأطفال، تذكر هذه الجملة:
**(قصير وتخين ووشه قمر.. ضغطه عالي وجلده مشقق ومُشعر)**
* قصير: Short stature (Growth failure)
* تخين ووشه قمر: Centripetal obesity, Buffalo hump, Moon face
* ضغطه عالي: Hypertension
* جلده مشقق ومُشعر: Purple striae, Easy bruising, Acne, Hirsutism

2. **Mnemonic لأسباب الكوشينغ (Causes):**
**(دوا من بره.. أو ورم في النخامية أو الكظرية جوه)**
* دوا من بره: Exogenous / Iatrogenic steroids (أشهر سبب)
* ورم في النخامية: Pituitary adenoma (Cushing disease)
* ورم في الكظرية: Adrenal adenoma / carcinoma`,

  "Acute Rheumatic Fever (ARF)": `**أولاً: التعريف والسبب (Definition & Etiology)**

الحمى الروماتيزمية (Acute Rheumatic Fever - ARF) هي تفاعل مناعي متأخر (Delayed Autoimmune response) يحدث بعد فترة (من أسبوعين إلى 4 أسابيع) من الإصابة بالتهاب الحلق أو اللوزتين بنوع معين من البكتيريا يُسمى (Group A Beta-Hemolytic Streptococcus - GABHS).

**ثانياً: معايير التشخيص (Diagnosis - Jones Criteria)**
لتشخيص المرض بشكل مؤكد، يجب توافر: عرضين من المعايير الكبرى (2 Major criteria) أو (عرض Major + عرضين Minor) مع وجود دليل مؤكد على عدوى سابقة بالبكتيريا السببية (Evidence of preceding Strep infection مثل ارتفاع تحليل الـ ASO titer أو مسحة حلق إيجابية Positive throat swab).

**A. Enumerate the Major Criteria of ARF:**
1. **Carditis:** التهاب في القلب (وهو العرض الأخطر على الإطلاق لأنه قد يسبب تلفاً دائماً في صمامات القلب، خاصة الصمام الميترالي).
2. **Migratory Polyarthritis:** التهاب المفاصل المتنقل (يصيب المفاصل الكبيرة مثل الركبة والكاحل، وينتقل من مفصل لآخر ولا يترك تشوهاً دائماً).
3. **Sydenham Chorea:** حركات لاإرادية غير منتظمة وتغيرات في السلوك (تحدث بسبب تأثير الأجسام المضادة على المخ).
4. **Erythema Marginatum:** طفح جلدي مميز بحواف حمراء ومركز شاحب، ولا يسبب حكة، ويظهر غالباً على الجذع.
5. **Subcutaneous Nodules:** عقد صغيرة وصلبة تحت الجلد (تظهر عادة فوق المفاصل والأوتار).

**B. Enumerate the Minor Criteria of ARF:**
1. **Fever:** ارتفاع في درجة الحرارة.
2. **Arthralgia:** ألم بالمفاصل (بدون تورم أو احمرار، ولا يُحسب إذا كان المريض يعاني من Polyarthritis).
3. **Elevated acute phase reactants:** ارتفاع دلالات الالتهاب في الدم (ESR و CRP).
4. **Prolonged PR interval:** تغيرات في رسم القلب (ECG).

<br/>

**ثالثاً: العلاج والوقاية (Treatment & Prophylaxis)**
**Enumerate the lines of treatment in ARF:**
1. **Eradication of Strep:** إعطاء بنسلين (Penicillin) أو إريثروميسين للقضاء التام على البكتيريا في الحلق.
2. **Anti-inflammatory:** إعطاء أسبرين (Aspirin) بجرعات عالية لعلاج التهاب المفاصل والحرارة، أو كورتيزون (Corticosteroids) في حالة وجود التهاب شديد في القلب (Severe Carditis).
3. **Bed rest:** راحة تامة في السرير لتقليل المجهود على القلب.
4. **Secondary Prophylaxis:** الوقاية الثانوية لمنع تكرار المرض وحماية القلب، وذلك بإعطاء حقنة بنسلين طويل المفعول (Benzathine Penicillin G) كل 3 إلى 4 أسابيع لفترات طويلة.

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic للمعايير الكبرى (Major Criteria):**
لربط العلامات الخمسة الكبرى لتشخيص الحمى الروماتيزمية، تذكر هذه الجملة:
**(قلب ملتهب، ومفاصل بتتنقل.. وحركات غريبة، مع طفح وكلاكيع)**
* قلب ملتهب: Carditis
* مفاصل بتتنقل: Migratory Polyarthritis
* حركات غريبة: Sydenham Chorea
* طفح: Erythema Marginatum
* كلاكيع: Subcutaneous Nodules

2. **Mnemonic لخطوات العلاج (Treatment):**
لترتيب خطة العلاج بشكل منطقي، تذكر هذه الجملة:
**(نموّت البكتيريا ونهدّي الالتهاب.. نريّح المريض ونديله حقنة وقاية)**
* نموّت البكتيريا: Eradication of Strep (Penicillin)
* نهدّي الالتهاب: Anti-inflammatory (Aspirin or Steroids)
* نريّح المريض: Bed rest
* نديله حقنة وقاية: Secondary Prophylaxis (Benzathine Penicillin)`,

  "Acyanotic Obstructive Lesions (Aortic Stenosis)": `**أولاً: التعريف والباثوفسيولوجي (Definition & Pathophysiology)**

* **التعريف:** ضيق الصمام الأورطي (Aortic Stenosis - AS) هو انسداد يعيق تدفق الدم من البطين الأيسر (Left Ventricle) إلى الشريان الأورطى (Aorta).
* **الباثوفسيولوجي:** يؤدي هذا الضيق إلى زيادة الضغط داخل البطين الأيسر (Pressure overload)، مما يضطره للتضخم (Left Ventricular Hypertrophy - LVH) لضخ الدم بقوة أكبر. مع الوقت، يقل الدم الواصل للجسم (Decreased Cardiac Output)، وقد ينتهي الأمر بفشل في الجزء الأيسر من القلب (Left-sided heart failure).

<br/>

**ثانياً: الصورة الإكلينيكية (Clinical Picture)**
**Enumerate the Clinical Picture of Aortic Stenosis:**

* **Symptoms (الأعراض):**
  1. الحالات البسيطة غالباً لا تعاني من أي أعراض (Asymptomatic).
  2. ألم في الصدر يشبه الذبحة (Angina / Chest pain) بسبب زيادة احتياج العضلة المتضخمة للأكسجين.
  3. دوخة أو إغماء (Syncope / Dizziness)، وتحدث تحديداً مع المجهود بسبب قلة الدم الواصل للمخ.
  4. إرهاق وعدم تحمل المجهود (Fatigue & Exercise intolerance).

* **Signs (العلامات):**
  1. **Pulse:** النبض يكون ضعيفاً ومتأخراً (Pulsus parvus et tardus).
  2. **Blood Pressure:** فرق ضغط ضيق (Narrow pulse pressure).
  3. **Auscultation:** لغط انقباضي خشن (Harsh ejection systolic murmur) يُسمع بوضوح على منطقة الأورطى ويمتد ليُسمع في الرقبة (Radiating to the neck / carotids).

<br/>

**ثالثاً: الفحوصات والعلاج (Investigations & Treatment)**

**Investigations:**
* **ECG:** يُظهر تضخم البطين الأيسر (LVH).
* **Chest X-ray (CXR):** تمدد في الأورطى بعد مكان الصمام (Post-stenotic dilatation).
* **Echocardiography (Echo):** هو الفحص التشخيصي الأساسي لتحديد درجة الضيق وكفاءة العضلة.

**Enumerate the lines of Treatment in Aortic Stenosis:**
1. **Medical:** إعطاء وقاية ضد التهاب الشغاف البكتيري (Prophylaxis against Infective Endocarditis) ومنع المجهود البدني العنيف (Avoid strenuous exercise).
2. **Intervention:** توسيع الصمام بالقسطرة البالونية (Balloon valvuloplasty)، وهو العلاج الأمثل في الأطفال.
3. **Surgical:** التدخل الجراحي لتغيير الصمام (Surgical Valve replacement) في حال فشل البالون.

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic للـ Clinical Picture (الأعراض والعلامات):**
لربط شكوى الطفل وعلامات الفحص الإكلينيكي في الامتحان، تذكر هذه الجملة:
**(صدره بيوجعه وبيدوخ مع المجهود.. نبضه ضعيف وفي لغط بيسمّع في رقبته)**
* صدره بيوجعه: Angina / Chest pain
* بيدوخ مع المجهود: Syncope & Exercise intolerance
* نبضه ضعيف: Pulsus parvus et tardus & Narrow pulse pressure
* لغط بيسمّع في رقبته: Systolic murmur radiating to the neck

2. **Mnemonic لخطوات العلاج (Treatment):**
لترتيب العلاج من التحفظي للتدخل، تذكر هذه الجملة:
**(نمنع المجهود ونحميه من الميكروب.. ونوسّع ببالون أو نغيّر الصمام)**
* نمنع المجهود: Avoid strenuous exercise
* نحميه من الميكروب: Prophylaxis against Infective Endocarditis
* نوسّع ببالون: Balloon valvuloplasty
* نغيّر الصمام: Surgical Valve replacement`,

  "Acyanotic Obstructive Lesions (Pulmonary Stenosis)": `**أولاً: التعريف والباثوفسيولوجي (Definition & Pathophysiology)**

* **التعريف:** ضيق الصمام الرئوي (Pulmonary Stenosis - PS) هو انسداد يعيق تدفق الدم من البطين الأيمن (Right Ventricle) إلى الشريان الرئوي (Pulmonary Artery).
* **الباثوفسيولوجي:** يؤدي هذا الضيق إلى زيادة الضغط داخل البطين الأيمن، مما يضطره للتضخم (Right Ventricular Hypertrophy - RVH) لضخ الدم. مع مرور الوقت وفي الحالات الشديدة، قد ينتهي الأمر بفشل في الجزء الأيمن من القلب (Right-sided heart failure).

<br/>

**ثانياً: الصورة الإكلينيكية (Clinical Picture)**
**Enumerate the Clinical Picture of Pulmonary Stenosis:**

* **Symptoms (الأعراض):**
  1. الحالات البسيطة غالباً لا تعاني من أي أعراض (Asymptomatic).
  2. الحالات المتوسطة والشديدة تعاني من نهجان وإرهاق مع المجهود (Exertional dyspnea & fatigue).
  3. نادراً ما يحدث ألم بالصدر أو إغماء مقارنة بضيق الصمام الأورطي.

* **Signs (العلامات):**
  1. **JVP:** موجة (a) بارزة في أوردة الرقبة (Prominent 'a' wave in Jugular Venous Pressure) بسبب قوة انقباض الأذين الأيمن ضد البطين المتضخم.
  2. **Auscultation:** لغط انقباضي خشن (Harsh ejection systolic murmur) يُسمع بوضوح على منطقة الشريان الرئوي (أعلى يسار عظمة القص) ويمتد ليُسمع في الظهر أو الكتف الأيسر (Radiating to the back / left shoulder)، وغالباً ما يسبقه صوت نقرة قذفي (Ejection click).

<br/>

**ثالثاً: الفحوصات والعلاج (Investigations & Treatment)**

**Investigations:**
* **ECG:** يُظهر تضخم البطين الأيمن وانحراف المحور لليمين (RVH & Right Axis Deviation).
* **Chest X-ray (CXR):** تمدد في الشريان الرئوي الرئيسي بعد مكان الضيق (Post-stenotic dilatation)، بينما تكون الأوعية الدموية داخل الرئة طبيعية أو قليلة.
* **Echocardiography (Echo):** هو الفحص الأدق لتأكيد التشخيص وتحديد فرق الضغط وشدة الضيق.

**Enumerate the lines of Treatment in Pulmonary Stenosis:**
1. **Medical:** إعطاء وقاية ضد التهاب الشغاف البكتيري (Prophylaxis against Infective Endocarditis) قبل إجراء أي تدخلات جراحية أو تدريبات للأسنان.
2. **Intervention:** توسيع الصمام بالقسطرة البالونية (Balloon valvuloplasty)، وهو الخط العلاجي الأول والأمثل.
3. **Surgical:** التدخل الجراحي لتوسيع أو تغيير الصمام (Surgical valvotomy / replacement) يُلجأ إليه في حال فشل البالون أو إذا كان الصمام مشوهاً بشدة (Dysplastic valve).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

1. **Mnemonic للـ Clinical Picture (الأعراض والعلامات):**
لربط شكوى الطفل وعلامات الفحص الإكلينيكي في الامتحان، تذكر هذه الجملة:
**(بينهج ويتعب مع المجهود.. عرق رقبته بينبض، وفي لغط بيسمّع في ضهره)**
* بينهج ويتعب: Exertional dyspnea & fatigue
* عرق رقبته بينبض: Prominent 'a' wave in JVP
* لغط بيسمّع في ضهره: Systolic murmur radiating to the back / left shoulder

2. **Mnemonic لخطوات العلاج (Treatment):**
لترتيب العلاج بسهولة، تذكر هذه الجملة:
**(نحميه من الميكروب.. ونوسّع ببالون أو نفتح جراحة)**
* نحميه من الميكروب: Prophylaxis against Infective Endocarditis
* نوسّع ببالون: Balloon valvuloplasty (الأساس)
* نفتح جراحة: Surgical valvotomy (لو البالون فشل)`
};

Object.entries(notes).forEach(([key, val]) => {
  const safeVal = val.replace(/\\/g, '\\\\').replace(/\`/g, '\\`').replace(/\\$/g, '\\$');
  const regex = new RegExp("('" + key + "'|\\\"" + key + "\\\"):\\s*\\`[\\\\s\\\\S]*?\\`,", "g");
  if (regex.test(code)) {
    code = code.replace(regex, "'" + key + "': \\`" + safeVal + "\\`,");
  } else {
    code = code.replace(/const PEDIATRICS_EXPLANATIONS: Record<string, string> = \{/, "const PEDIATRICS_EXPLANATIONS: Record<string, string> = {\\n  '" + key + "': \\`" + safeVal + "\\`,");
  }
});

fs.writeFileSync('client/src/pages/flashcards/FlashSpace.tsx', code, 'utf8');
console.log('Notes injected successfully!');
