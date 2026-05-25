import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, FileText, HelpCircle, X, CheckCircle2, AlertCircle, RotateCcw, Maximize2, Sparkles, BookOpen, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

// Static Mapping for Pediatrics Specialty Names
const SUBJECT_MAP: Record<string, { folderName: string; arabicName: string }> = {
  'cardiovascular_diseases': { folderName: 'Cardiovascular diseases', arabicName: 'أمراض القلب للأطفال' },
  'endocrinology': { folderName: 'Endocrinology', arabicName: 'الغدد الصماء' },
  'gastroenterology_hepatology': { folderName: 'Gastroenterology & hepatology', arabicName: 'الجهاز الهضمي والكبد' },
  'genetic_diseases': { folderName: 'Genetic diseases', arabicName: 'الأمراض الوراثية' },
  'growth_development': { folderName: 'Growth & development', arabicName: 'النمو والتطور' },
  'hematology_oncology': { folderName: 'Hematology & Oncology', arabicName: 'أمراض الدم والأورام' },
  'infections': { folderName: 'Infections', arabicName: 'الأمراض المعدية' },
  'neurology': { folderName: 'Neurology', arabicName: 'أمراض الأعصاب' },
  'nutrition': { folderName: 'Nutrition', arabicName: 'التغذية' },
  'renal_diseases': { folderName: 'Renal diseases', arabicName: 'أمراض الكلى للأطفال' }
};

// Explanations Dictionary (The high-yield medical content)
const PEDIATRICS_EXPLANATIONS: Record<string, string> = {
  'biological_age_maturation_bone_teeth': `**أولاً: النضج العظمي (Bone Age / Radiological Age)**

* يُعتبر الـ **Bone age** من أهم المؤشرات لتقييم النضج البيولوجي للطفل، ويتم تحديده عن طريق تقييم ظهور مراكز التعظم (**Centers of ossification**).
* **أهم النقاط الإكلينيكية:**
  * عند الولادة (**At birth**): يجب أن تكون مراكز التعظم موجودة في الـ **Lower end of femur** والـ **Upper end of tibia**.
  * الـ **Investigation** الأساسي لتقييم الـ **Bone age** في الأطفال هو طلب أشعة سينية (**X-ray**) على اليد اليسرى والمعصم (**Left hand and wrist**).

<br/>

**ثانياً: التسنين (Dentition)**
ينقسم التسنين إلى مرحلتين أساسيتين:

1. **الأسنان اللبنية (Deciduous / Milky teeth):**
   * إجمالي عددهم 20 سِنة.
   * يبدأ الـ **Eruption** عند عمر 6 أشهر تقريباً، وأول أسنان تظهر هي القواطع السفلية المركزية (**Lower central incisors**).
   * يكتمل خروج جميع الأسنان اللبنية عند عمر 2 إلى 2.5 سنة.

2. **الأسنان الدائمة (Permanent teeth):**
   * إجمالي عددهم 32 سِنة.
   * يبدأ الـ **Eruption** عند عمر 6 سنوات، وأول سِنة تظهر هي الضرس الأول (**First molar**).

<br/>

**ثالثاً: تأخر التسنين (Delayed Dentition)**

* يتم تشخيص الحالة كـ **Delayed dentition** إذا لم يظهر للطفل أي سِنة بحلول عمر 13 شهراً.

**Causes of Delayed Dentition (Enumerate):**

1. **Rickets** (أشهر وأهم سبب)
2. **Hypothyroidism**
3. **Hypopituitarism**
4. **Down syndrome**
5. **Malnutrition**
6. **Familial / Idiopathic**

---

💡 **Mnemonic لتسهيل التذكر في أسئلة الـ Enumerate:**
لربط أسباب الـ **Delayed dentition** وتذكرها بسهولة في الامتحانات، تذكر هذه الجملة:
**(عيلة داون عندها نقص تغذية وكساح في الغدة)**

* **عيلة:** **Familial / Idiopathic**
* **داون:** **Down syndrome**
* **نقص تغذية:** **Malnutrition**
* **كساح:** **Rickets**
* **الغدة:** **Hypothyroidism** & **Hypopituitarism**`
};

// 3 High-Yield Questions for Bone & Teeth maturation
const PEDIATRICS_QUESTIONS: Record<string, any[]> = {
  'all_infections_chapter': [
    // ─── SAQ Q1 – Definitions ───────────────────────────────────────────────
    {
      question: "Which of the following is the CORRECT definition of Fever of Unknown Origin (FUO) in children?",
      options: [
        "Fever >37.5°C for >7 days with no identifiable source after basic blood tests",
        "Fever >38°C for >14 days with no cause found by clinical history, physical examination, and routine laboratory tests",
        "Fever >39°C for >3 days that does not respond to antipyretics",
        "Any unexplained fever in a child under 5 years old lasting more than 48 hours"
      ],
      correctAnswer: 1,
      explanation: "FUO is defined as fever >38°C for >14 days with no cause found by clinical history, physical examination, and routine laboratory tests. The duration of at least 14 days and the thorough workup requirement are key distinguishing criteria."
    },
    {
      question: "What is the precise medical definition of Dysentery?",
      options: [
        "Diarrhea with more than 10 watery stools per day",
        "Any diarrhea accompanied by fever and abdominal cramps",
        "Diarrhea with visible blood in the stool",
        "Diarrhea caused exclusively by bacterial pathogens"
      ],
      correctAnswer: 2,
      explanation: "Dysentery is defined as diarrhea with visible blood in the stool. The presence of visible blood distinguishes dysentery from ordinary diarrhea, regardless of the causative organism."
    },
    {
      question: "Pertussis (Whooping Cough) is caused by which specific organism, and how is it correctly classified?",
      options: [
        "Streptococcus pyogenes – a Gram-positive coccus",
        "Bordetella pertussis – a Gram-negative bacillus",
        "Haemophilus influenzae type-b – a Gram-negative coccobacillus",
        "Mycoplasma pneumoniae – an atypical intracellular pathogen"
      ],
      correctAnswer: 1,
      explanation: "Pertussis is an acute respiratory infection caused by Bordetella pertussis, which is correctly classified as a Gram-negative bacillus. This distinction is frequently tested in examinations."
    },
    {
      question: "Acute Bacterial Meningitis ('Septic Meningitis') is best defined as:",
      options: [
        "A viral inflammation of the brain parenchyma causing altered consciousness and seizures",
        "Chronic granulomatous inflammation of the meninges caused by Mycobacterium tuberculosis",
        "Acute inflammation of the meninges covering the brain and spinal cord, with the production of a purulent exudate",
        "Aseptic inflammation of the subarachnoid space with a lymphocytic CSF pleocytosis"
      ],
      correctAnswer: 2,
      explanation: "Acute Bacterial (Septic) Meningitis is defined as acute inflammation of the meninges covering the brain and spinal cord, with production of a purulent (pus-like) exudate in the CSF. This purulent nature differentiates it from viral/aseptic meningitis."
    },
    // ─── SAQ Q2 – Measles Complications ─────────────────────────────────────
    {
      question: "Which of the following is a recognized nervous or respiratory complication associated with Measles?",
      options: [
        "Glomerulonephritis and nephrotic syndrome",
        "Rheumatic fever and carditis",
        "Subacute Sclerosing Pan-Encephalitis (SSPE)",
        "Osteomyelitis and septic arthritis"
      ],
      correctAnswer: 2,
      explanation: "Measles complications include pneumonia, otitis media, post-infectious encephalitis, Subacute Sclerosing Pan-Encephalitis (SSPE), and laryngo-tracheo-bronchitis. SSPE is a rare but devastating late neurological complication caused by persistent measles virus in the CNS."
    },
    {
      question: "A child presents 7 years after a measles infection with progressive intellectual deterioration, myoclonic jerks, and seizures. Which late measles complication does this describe?",
      options: [
        "Post-infectious encephalitis occurring days after the rash",
        "Subacute Sclerosing Pan-Encephalitis (SSPE)",
        "Measles-associated pneumonia",
        "Laryngo-tracheo-bronchitis (Croup)"
      ],
      correctAnswer: 1,
      explanation: "SSPE (Subacute Sclerosing Pan-Encephalitis) is a fatal late complication of measles that presents years after the initial infection. It is caused by persistent defective measles virus in brain cells and leads to progressive neurological deterioration, myoclonus, and death."
    },
    // ─── SAQ Q3 – Scarlet Fever Clinical Features ────────────────────────────
    {
      question: "Which of the following clinical findings is MOST characteristic of the eruptive stage of Scarlet Fever?",
      options: [
        "A vesicular rash that begins on the face and spreads centrifugally",
        "A diffuse, finely papular, erythematous eruption that blanches on pressure",
        "A maculopapular rash that starts behind the ears and spreads downwards",
        "A petechial non-blanching rash over the lower limbs"
      ],
      correctAnswer: 1,
      explanation: "The hallmark rash of Scarlet Fever is a diffuse, finely papular (sandpaper-like), bright red erythematous eruption that characteristically BLANCHES on pressure. This is caused by the erythrogenic toxin produced by Group A beta-hemolytic streptococci."
    },
    {
      question: "Which unique tongue finding in Scarlet Fever changes its appearance characteristically over a few days?",
      options: [
        "Koplik spots appearing on the tongue dorsum",
        "A heavily coated 'white strawberry tongue' which evolves into a 'red strawberry tongue'",
        "Geographic tongue with central depapillation",
        "Candidal plaques on the tongue that are easily scraped off"
      ],
      correctAnswer: 1,
      explanation: "In Scarlet Fever, the tongue initially appears as a 'White Strawberry Tongue' (coated with prominent red papillae). After a few days, the coating peels off to reveal the 'Red Strawberry Tongue' – a pathognomonic finding in Scarlet Fever."
    },
    // ─── SAQ Q4 – Pertussis Stages ───────────────────────────────────────────
    {
      question: "What are the three distinct clinical stages of Pertussis infection and what is the correct order and duration?",
      options: [
        "Incubation (1 wk) → Paroxysmal (2–4 wks) → Catarrhal (1–2 wks)",
        "Catarrhal (1–2 wks) → Paroxysmal (2–4 wks) → Convalescent (1–2 wks)",
        "Prodromal (3 days) → Eruptive (2 wks) → Desquamation (1 wk)",
        "Catarrhal (2–4 wks) → Spasmodic (1–2 wks) → Recovery (3–4 wks)"
      ],
      correctAnswer: 1,
      explanation: "Pertussis has 3 stages: (1) Catarrhal stage – lasts 1–2 weeks, resembles a common cold, most contagious phase; (2) Paroxysmal stage – lasts 2–4 weeks, characteristic whooping cough paroxysms; (3) Convalescent stage – lasts 1–2 weeks, gradual recovery."
    },
    {
      question: "During which stage of Pertussis is the child most contagious, and which stage is the LONGEST?",
      options: [
        "Most contagious: Paroxysmal; Longest: Convalescent",
        "Most contagious: Catarrhal; Longest: Paroxysmal",
        "Most contagious: Convalescent; Longest: Catarrhal",
        "Most contagious: Paroxysmal; Longest: Catarrhal"
      ],
      correctAnswer: 1,
      explanation: "The Catarrhal stage is the most contagious phase (the child appears to have a cold and spreads droplets widely). The Paroxysmal stage is the longest, lasting 2–4 weeks, during which the characteristic repetitive cough paroxysms and 'whoop' occur."
    },
    // ─── SAQ Q5 – Meningitis Organisms ──────────────────────────────────────
    {
      question: "Which set of organisms is responsible for Acute Bacterial Meningitis specifically during the NEONATAL PERIOD?",
      options: [
        "Meningococci, Pneumococci, and H. influenzae type-b",
        "E. coli, Group-B Streptococci, and Listeria monocytogenes",
        "Staphylococcus aureus, Klebsiella, and Pseudomonas",
        "Streptococcus pyogenes, Salmonella, and Enterococcus"
      ],
      correctAnswer: 1,
      explanation: "Neonatal meningitis is caused by organisms acquired from the maternal birth canal: E. coli (most common Gram-negative), Group-B Streptococci (most common Gram-positive), and Listeria monocytogenes. These differ completely from the childhood organisms."
    },
    {
      question: "A 3-year-old child develops bacterial meningitis. Which organism is MOST common in this age group and is also associated with a petechial rash?",
      options: [
        "E. coli – Gram-negative rod from maternal flora",
        "Listeria monocytogenes – motile Gram-positive rod",
        "Meningococci (Neisseria meningitidis) – associated with petechial/purpuric rash",
        "H. influenzae type-b – common only up to 5 years, causes epiglottitis"
      ],
      correctAnswer: 2,
      explanation: "In childhood meningitis (beyond the neonatal period), Meningococci (Neisseria meningitidis) is the most feared organism and is associated with a characteristic petechial/purpuric non-blanching rash due to septicemia with DIC. Pneumococci and H. influenzae type-b (up to 5 years) are also important childhood causes."
    },
    // ─── SAQ Q6 – Non-infectious FUO Causes ──────────────────────────────────
    {
      question: "A child has fever >38°C for 3 weeks. An extensive infectious workup is negative. Which of the following is a non-infectious cause that should be considered in the differential diagnosis of FUO?",
      options: [
        "Respiratory Syncytial Virus (RSV) bronchiolitis",
        "Juvenile Rheumatoid Arthritis (JRA)",
        "Acute Gastroenteritis due to Rotavirus",
        "Whooping cough in the Catarrhal stage"
      ],
      correctAnswer: 1,
      explanation: "Non-infectious causes of FUO include: Juvenile Rheumatoid Arthritis (JRA), SLE, Leukemia, Lymphoma, Neuroblastoma, and Drug fever. JRA (systemic type) is one of the most important non-infectious causes of prolonged fever in children."
    },
    {
      question: "Which of the following malignancies can present as a Fever of Unknown Origin (FUO) in children?",
      options: [
        "Rhabdomyosarcoma and Wilms tumor only",
        "Leukemia and Lymphoma",
        "Retinoblastoma and Hepatoblastoma only",
        "Osteosarcoma and Ewing's sarcoma only"
      ],
      correctAnswer: 1,
      explanation: "Both Leukemia and Lymphoma are well-recognized malignant causes of FUO in children, along with Neuroblastoma. These present with prolonged fever because malignant cells release pyrogenic cytokines. SLE and JRA are autoimmune non-infectious causes."
    },
    // ─── SAQ Q7 – Hookworm Manifestations ────────────────────────────────────
    {
      question: "A child who walked barefoot on soil presents with itchy papules on the feet, a dry cough, wheezing, eosinophilia, and later develops severe pallor with fatigue. Which infestation best explains this clinical picture?",
      options: [
        "Ascariasis (Roundworm infestation)",
        "Enterobiasis (Pinworm infestation)",
        "Ancylostomiasis (Hookworm infestation)",
        "Strongyloidiasis"
      ],
      correctAnswer: 2,
      explanation: "Ancylostomiasis (Hookworm) follows a classic path: (1) 'Ground itch' from skin penetration by larvae; (2) 'Loeffler-like syndrome' during lung migration (cough, wheeze, eosinophilia); (3) GI symptoms; (4) Severe hypochromic microcytic iron deficiency anemia from blood sucking by adult worms in the intestine."
    },
    {
      question: "What type of anemia is the classic systemic manifestation of chronic Ancylostomiasis (Hookworm infestation), and why?",
      options: [
        "Normocytic normochromic anemia due to chronic disease",
        "Macrocytic megaloblastic anemia due to B12 malabsorption",
        "Hypochromic microcytic iron deficiency anemia due to chronic intestinal blood loss",
        "Hemolytic anemia due to parasite-induced RBC destruction"
      ],
      correctAnswer: 2,
      explanation: "Adult hookworms attach to the intestinal wall and suck blood chronically. This leads to progressive iron loss and a Hypochromic Microcytic Iron Deficiency Anemia. Clinically, patients present with pica, fatigue, shortness of breath, and palpitations – all features of severe iron deficiency."
    },
    // ─── Matching – Koplik Spots ─────────────────────────────────────────────
    {
      question: "Koplik spots are a pathognomonic sign used to diagnose which disease, and where exactly are they found?",
      options: [
        "Typhoid fever – appearing as rose-colored spots on the lower chest and abdomen",
        "Measles – small white spots erupting on the buccal mucosa opposite the second molar teeth",
        "Scarlet Fever – white plaques on the tongue that transform into a red strawberry pattern",
        "Chickenpox – vesicular lesions on the hard palate during the prodromal stage"
      ],
      correctAnswer: 1,
      explanation: "Koplik spots are pathognomonic (exclusively diagnostic) for Measles. They appear as small bluish-white spots on a red background on the buccal mucosa (inner cheek) opposite the second molar teeth, 1–2 days BEFORE the measles rash appears. No other disease produces Koplik spots."
    },
    // ─── Matching – Widal Test ───────────────────────────────────────────────
    {
      question: "The Widal test is the classic serological test used to diagnose Typhoid fever. What does this test specifically detect?",
      options: [
        "IgM antibodies against the Typhoid Vi capsular antigen only",
        "Bacteremia by directly culturing Salmonella typhi from blood",
        "Antibodies against somatic 'O' and flagellar 'H' antigens of Salmonella typhi",
        "Agglutination of platelets caused by endotoxin-mediated DIC in Typhoid"
      ],
      correctAnswer: 2,
      explanation: "The Widal test is an agglutination test that detects antibodies (agglutinins) against two antigens of Salmonella typhi: the somatic 'O' antigen (which rises first and indicates active infection) and the flagellar 'H' antigen. It typically becomes positive in the 2nd week of illness."
    },
    // ─── Matching – Rose Spots ───────────────────────────────────────────────
    {
      question: "Rose spots are a clinical sign associated with Typhoid fever. Which of the following best describes their characteristics?",
      options: [
        "Bright red petechiae on the lower limbs, non-blanching, appearing in the 1st week",
        "Vesicular lesions on the trunk appearing in crops over 3–5 days",
        "A transient skin rash of rose-colored macules appearing on the lower chest and abdomen at the end of the 1st week of Typhoid fever",
        "Confluent erythematous patches on the face with circumoral pallor"
      ],
      correctAnswer: 2,
      explanation: "Rose spots in Typhoid fever are faint, rose-colored, blanching macular lesions that appear on the lower chest and abdomen at the end of the 1st week of illness. They result from embolization of Salmonella typhi into the skin capillaries and are visible mainly in fair-skinned patients."
    },
    // ─── Matching – Brudzinski's Sign ────────────────────────────────────────
    {
      question: "Brudzinski's sign is a clinical test for meningeal irritation. Which of the following correctly describes how it is elicited and what constitutes a positive response?",
      options: [
        "The patient is asked to touch their chin to their chest; a positive sign is inability to do so due to neck stiffness",
        "Rapid passive flexion of the neck causes brisk reflex flexion of both knees and hips",
        "Extending the knee when the thigh is flexed at the hip produces pain and resistance (Kernig's sign)",
        "Percussion of the skull produces a cracked-pot sound (Macewen's sign)"
      ],
      correctAnswer: 1,
      explanation: "Brudzinski's sign: with the patient supine, rapid passive flexion of the head/neck causes involuntary brisk flexion of both knees and hips. This occurs because meningeal irritation makes neck flexion painful, triggering a reflexive drawing-up of the legs. It is distinct from Kernig's sign which tests knee extension with hip flexed."
    },
    // ─── Case 1 – Scarlet Fever ──────────────────────────────────────────────
    {
      question: "CASE 1: A 5-year-old presents with abrupt onset high fever (40°C), severe sore throat, and a diffuse sandpaper-like red rash that blanches on pressure. He has flushed cheeks with circumoral pallor and a 'red strawberry' tongue. What is the most likely diagnosis?",
      options: [
        "Measles – caused by a paramyxovirus with Koplik spots",
        "Kawasaki Disease – with coronary artery involvement",
        "Scarlet Fever – caused by Group A beta-hemolytic streptococci producing erythrogenic toxin",
        "Roseola Infantum (Exanthem Subitum) – caused by HHV-6"
      ],
      correctAnswer: 2,
      explanation: "This is classic Scarlet Fever. The triad of: (1) acute pharyngotonsillitis with high fever, (2) diffuse blanching papular erythematous rash, and (3) strawberry tongue with circumoral pallor is pathognomonic. It is caused by Group A beta-hemolytic streptococci (Streptococcus pyogenes) that produce erythrogenic (pyrogenic) exotoxin."
    },
    {
      question: "CASE 1 (continued): In Scarlet Fever, what is the drug of choice for eradication of the causative organism, and what are two important late non-suppurative complications to monitor for?",
      options: [
        "Erythromycin; late complications: SSPE and bronchiectasis",
        "Penicillin (or Erythromycin if allergic); late complications: Rheumatic fever and Acute Post-streptococcal glomerulonephritis",
        "Amoxicillin-Clavulanate; late complications: Toxic shock syndrome and endocarditis",
        "Ceftriaxone; late complications: Hemolytic anemia and thrombocytopenia"
      ],
      correctAnswer: 1,
      explanation: "Penicillin is the drug of choice for Scarlet Fever (Erythromycin is used if penicillin-allergic). The two critical non-suppurative (immune-mediated) late complications are: (1) Acute Rheumatic Fever (ARF) – affecting heart, joints, and CNS; (2) Acute Post-streptococcal Glomerulonephritis (APSGN) – presenting with hematuria and hypertension."
    },
    // ─── Case 2 – Pertussis ──────────────────────────────────────────────────
    {
      question: "CASE 2: An 11-month-old infant has severe exhausting bouts of coughing for 2 weeks. The mother describes repetitive coughs (5–10 per expiration) followed by a loud inspiratory 'whoop', with post-tussive vomiting. There is no vaccination history. What is the diagnosis and current clinical stage?",
      options: [
        "Bronchiolitis (RSV) – in the acute phase",
        "Croup (Laryngo-tracheo-bronchitis) – in the obstructive phase",
        "Pertussis (Whooping Cough) – currently in the Paroxysmal stage",
        "Foreign body aspiration – presenting with a sudden onset stridorous cough"
      ],
      correctAnswer: 2,
      explanation: "The characteristic paroxysmal cough (5–10 rapid coughs on a single expiration), followed by the massive inspiratory 'whoop', and post-tussive vomiting are the hallmarks of the PAROXYSMAL STAGE of Pertussis. The absence of vaccination confirms susceptibility to Bordetella pertussis."
    },
    {
      question: "CASE 2 (continued): What would a Complete Blood Count (CBC) characteristically reveal to support the diagnosis of Pertussis?",
      options: [
        "Marked leukopenia with relative lymphocytosis and eosinopenia",
        "Neutrophilia with elevated CRP and thrombocytopenia",
        "Marked leukocytosis with absolute lymphocytosis",
        "Normocytic normochromic anemia with a normal white cell count"
      ],
      correctAnswer: 2,
      explanation: "Pertussis is uniquely associated with a marked LEUKOCYTOSIS (WBC can reach 20,000–100,000/μL) with ABSOLUTE LYMPHOCYTOSIS. This extraordinary lymphocytosis is caused by Pertussis toxin blocking lymphocyte re-entry into lymph nodes. This CBC pattern strongly supports the clinical diagnosis."
    },
    {
      question: "CASE 2 (continued): What is the standard antimicrobial treatment for this infant with Pertussis, including the correct drug, dose, and duration?",
      options: [
        "Azithromycin 10 mg/kg/day once daily for 5 days",
        "Amoxicillin 40 mg/kg/day in 3 divided doses for 10 days",
        "Erythromycin 50 mg/kg/day in 4 divided doses for 14 days",
        "Ceftriaxone 50 mg/kg/day IV as a single daily dose for 7 days"
      ],
      correctAnswer: 2,
      explanation: "The standard treatment for Pertussis in infants is Erythromycin at 50 mg/kg/day divided into 4 doses (every 6 hours) for 14 days (2 weeks). Erythromycin eradicates Bordetella pertussis from the nasopharynx, shortens the infectious period, and if given in the catarrhal stage, can attenuate disease severity."
    },
    // ─── Case 3 – Bacterial Meningitis ──────────────────────────────────────
    {
      question: "CASE 3: A 3-year-old rushes to the ER with sudden high fever, severe headache, repeated vomiting, altered sensorium, a petechial rash, positive Kernig's sign, and positive Brudzinski's sign. What is the most likely diagnosis and causative organism given the petechial rash?",
      options: [
        "Viral encephalitis caused by HSV-1; management with IV Acyclovir",
        "Acute Bacterial (Septic) Meningitis most likely caused by Meningococci (Neisseria meningitidis) due to the characteristic petechial rash",
        "Tuberculous meningitis caused by Mycobacterium tuberculosis; insidious onset",
        "Brain abscess caused by anaerobic streptococci; requires neurosurgical drainage"
      ],
      correctAnswer: 1,
      explanation: "The acute onset of high fever + signs of meningeal irritation (neck stiffness, Kernig's, Brudzinski's) + altered consciousness = Acute Bacterial Meningitis. The petechial/purpuric non-blanching rash is the hallmark of Meningococcal septicemia (Neisseria meningitidis), which can cause fulminant DIC and is a medical emergency."
    },
    {
      question: "CASE 3 (continued): What is the URGENT diagnostic investigation that must be performed immediately to confirm Acute Bacterial Meningitis and guide treatment?",
      options: [
        "CT scan of the head to exclude a space-occupying lesion",
        "Blood cultures and empirical antibiotics without CSF examination",
        "Lumbar puncture for Cerebrospinal Fluid (CSF) examination, culture, and antibiotic sensitivity testing",
        "MRI of the spine with contrast enhancement"
      ],
      correctAnswer: 2,
      explanation: "Lumbar puncture (LP) for CSF examination is the DEFINITIVE diagnostic procedure for bacterial meningitis. CSF analysis reveals: turbid appearance, markedly elevated WBC (neutrophilic pleocytosis), elevated protein, markedly reduced glucose. CSF culture with antibiotic sensitivity testing guides specific antibiotic therapy."
    },
    // ─── Case 4 – Typhoid Fever ──────────────────────────────────────────────
    {
      question: "CASE 4: A 7-year-old presents with 9 days of continuous high fever, headache, anorexia, myalgia, toxic appearance, coated tongue, abdominal distension, and a soft palpable spleen. CBC shows leukopenia with relative lymphocytosis and disappearance of eosinophils. What is the most likely diagnosis?",
      options: [
        "Brucellosis – associated with undulant fever and hepatosplenomegaly after animal contact",
        "Malaria – with cyclical fever pattern and hemolytic anemia",
        "Typhoid Fever (Enteric Fever) – caused by Salmonella typhi",
        "Infectious Mononucleosis – caused by EBV with splenomegaly and lymphadenopathy"
      ],
      correctAnswer: 2,
      explanation: "This is classic Typhoid Fever. Key diagnostic features: (1) Prolonged continuous fever with 'step-ladder' pattern; (2) Toxic 'pea soup' appearance; (3) Relative bradycardia; (4) Hepatosplenomegaly; (5) Leukopenia with RELATIVE LYMPHOCYTOSIS and complete EOSINOPENIA – a virtually pathognomonic CBC finding in Typhoid."
    },
    {
      question: "CASE 4 (continued): In the 2nd week of Typhoid Fever illness, which investigation is MOST likely to be positive for detecting specific antibodies?",
      options: [
        "Blood culture – most sensitive in the 1st week when bacteremia peaks",
        "Widal test – detects antibodies against somatic 'O' and flagellar 'H' antigens",
        "Stool culture – most sensitive in the 3rd week",
        "Bone marrow culture – the gold standard at any stage but rarely performed"
      ],
      correctAnswer: 1,
      explanation: "The Widal test detects agglutinating antibodies against S. typhi antigens. Antibodies begin rising by day 5–7 but reach diagnostic titers (≥1:160 for 'O' and ≥1:80 for 'H') in the 2nd WEEK of illness. Blood culture (1st week) and stool/urine culture (3rd week) are positive at different time points."
    },
    {
      question: "CASE 4 (continued): What is the specific preferred IV antibiotic treatment for Typhoid Fever in children, including the correct dosage?",
      options: [
        "Ampicillin 100 mg/kg/day IV in 4 divided doses",
        "Chloramphenicol 50 mg/kg/day IV in 4 divided doses",
        "Ceftriaxone 50–80 mg/kg/day IV as a single daily dose",
        "Ciprofloxacin 20 mg/kg/day IV in 2 divided doses"
      ],
      correctAnswer: 2,
      explanation: "Ceftriaxone (a 3rd-generation cephalosporin) at 50–80 mg/kg/day IV as a SINGLE daily dose is the current preferred treatment for severe or complicated Typhoid in children. It has excellent efficacy, convenient once-daily dosing, and low resistance rates compared to older agents like Chloramphenicol or Ampicillin."
    },
    // ─── Case 5 – Enterobiasis ───────────────────────────────────────────────
    {
      question: "CASE 5: A 4-year-old presents with intense nocturnal perianal itching, restless sleep, irritability, and teeth grinding (bruxism) at night. Two siblings have similar symptoms. What is the most likely parasitic infestation?",
      options: [
        "Ascariasis – with rectal prolapse and malnutrition",
        "Hookworm infestation – with iron deficiency anemia and 'ground itch'",
        "Enterobiasis (Oxyuriasis / Pinworm infestation) caused by Enterobius vermicularis",
        "Trichuriasis (Whipworm) – with bloody diarrhea and rectal prolapse"
      ],
      correctAnswer: 2,
      explanation: "Enterobiasis (Pinworm) caused by Enterobius vermicularis is the diagnosis. The classic triad is: (1) Intense NOCTURNAL perianal pruritus (female worms migrate to the perianal area at night to deposit eggs); (2) Sleep disturbance, irritability, and bruxism; (3) Family clustering (highly contagious via fecal-oral and autoinfection routes)."
    },
    {
      question: "CASE 5 (continued): How is Enterobiasis definitively diagnosed in the laboratory?",
      options: [
        "Stool microscopy looking for adult worms in fresh stool samples",
        "Serology (ELISA) detecting IgE antibodies against Enterobius vermicularis",
        "Microscopic examination of material from the peri-anal skin using the Cellophane Tape (Scotch test) method to find characteristic eggs",
        "Peripheral blood eosinophilia with elevated total IgE on CBC"
      ],
      correctAnswer: 2,
      explanation: "The CELLOPHANE TAPE METHOD (Scotch test) is the standard diagnostic technique for Enterobiasis. A piece of transparent tape is applied to the perianal skin EARLY IN THE MORNING (before bathing/defecation), then examined microscopically. It detects the characteristic asymmetric, flattened-on-one-side eggs laid by the female worm nocturnally."
    },
    {
      question: "CASE 5 (continued): What is the correct treatment protocol for Enterobiasis, and what crucial epidemiological rule must be followed?",
      options: [
        "Mebendazole 100 mg single oral dose, repeated after 2–3 weeks; treat the child ONLY",
        "Metronidazole 250 mg three times daily for 5 days; treat the child and mother only",
        "Mebendazole or Flubendazole 100 mg single oral dose, repeated after 2–3 weeks; ALL household members must be treated simultaneously",
        "Albendazole 400 mg single dose, not to be repeated; no family treatment needed"
      ],
      correctAnswer: 2,
      explanation: "Treatment: A single oral dose of Mebendazole or Flubendazole 100 mg, REPEATED after 2–3 weeks (to kill newly hatched worms from any residual eggs). The critical epidemiological rule: ALL infected individuals AND ALL family/household members must be treated SIMULTANEOUSLY to break the cycle of reinfection, regardless of whether they have symptoms."
    }
  ],
  'biological_age_maturation_bone_teeth': [
    {
      question: "ما هو الفحص الإشعاعي (Investigation) الأساسي لتقييم النضج العظمي (Bone Age) لدى الأطفال؟",
      options: [
        "أشعة X-ray على القدم اليسرى والكاحل",
        "أشعة X-ray على اليد اليسرى والمعصم (Left hand and wrist)",
        "أشعة مقطعية (CT scan) على الجمجمة",
        "أشعة رنين مغناطيسي (MRI) على الفخذين"
      ],
      correctAnswer: 1,
      explanation: "الـ Investigation الأساسي والمعتمد دولياً لتقييم الـ Bone age هو أشعة X-ray على اليد اليسرى والمعصم (Left hand and wrist)."
    },
    {
      question: "ما هي أول أسنان لبنية (Deciduous teeth) تبدأ في الخروج (Eruption) عند الرضيع الطبيعي، وفي أي سن تقريباً؟",
      options: [
        "القواطع العلوية المركزية عند عمر 12 شهر",
        "القواطع السفلية المركزية (Lower central incisors) عند عمر 6 أشهر",
        "الضرس الأول اللبني عند عمر 10 أشهر",
        "الأنياب السفلية عند عمر 8 أشهر"
      ],
      correctAnswer: 1,
      explanation: "يبدأ بزوغ الأسنان اللبنية عند عمر 6 أشهر تقريباً، وأول أسنان تظهر هي القواطع السفلية المركزية (Lower central incisors)."
    },
    {
      question: "طفل يبلغ من العمر 14 شهراً ولم يظهر له أي سن بعد. كيف يتم تشخيص هذه الحالة وأشهر سبب لها؟",
      options: [
        "حالة طبيعية تماماً ويجب الانتظار لعمر سنتين",
        "تأخر تسنين عائلي طبيعي ولا يتطلب التفكير في الأمراض",
        "تأخر تسنين (Delayed dentition) وأشهر وأهم سبب له هو الكساح (Rickets)",
        "فشل نمو الأسنان الدائمة بسبب نقص هرمون الكالسيتونين"
      ],
      correctAnswer: 2,
      explanation: "يتم تشخيص الحالة كـ Delayed dentition إذا لم يظهر للطفل أي سن بحلول عمر 13 شهراً. ويُعتبر الكساح (Rickets) هو أشهر وأهم سبب لذلك."
    }
  ]
};

export default function PediatricsFolder() {
  const { subjectId, folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve filenames/title passed in state, or calculate from ID
  const slideName = location.state?.slideName || '';
  
  const currentSubject = subjectId ? SUBJECT_MAP[subjectId] : null;
  const cleanTitle = slideName ? slideName.replace(/\.[^/.]+$/, "") : (folderId ? folderId.replace(/_/g, ' ').toUpperCase() : '');
  const actualFileName = slideName || `${cleanTitle}.jpeg`; // fallback
  const imagePath = currentSubject ? `/assets/TIP-Peditrics/${currentSubject.folderName}/${actualFileName}` : '';

  // Tab State - default to 'explanation' for instant usability!
  const [activeView, setActiveView] = useState<'explanation' | 'quiz'>('explanation');
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Quiz Player State
  const quizQuestions = folderId ? PEDIATRICS_QUESTIONS[folderId] || [] : [];
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!currentSubject || !folderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200">المجلد غير موجود</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-3 bg-primary text-white rounded-2xl">
          العودة للخلف
        </button>
      </div>
    );
  }

  const customExplanation = PEDIATRICS_EXPLANATIONS[folderId];
  const explanationText = customExplanation || `### 📚 ${cleanTitle}\n\n**الشرح الطبي والملخص الإكلينيكي قيد التحضير حالياً!**\n\nبمجرد تجميع محتوى الشرح والأسئلة الخاصة بهذه اللوحة البصرية، سنقوم بدمجه فوراً لتظهر هنا بشكل منسق وجذاب. \n\n* يمكنك مشاركة الشروحات الطبية والأسئلة لرفعها مباشرة على المنصة 🚀`;

  // Quiz Handling
  const handleOptionClick = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOptionIdx(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIdx === null || isSubmitted) return;
    setIsSubmitted(true);
    if (selectedOptionIdx === quizQuestions[currentQuestionIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOptionIdx(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0c0d12] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0c0d12]/75 backdrop-blur-md border-b border-amber-100/40 dark:border-slate-800/40 p-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back Button (RTL-optimized matching browser standard) */}
          <button 
            onClick={() => navigate(`/course/pediatrics_course/subject/${subjectId}/lectures`)} 
            className="group px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-all flex items-center gap-2 font-black text-xs shadow-sm text-slate-700 dark:text-slate-200"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            <span>العودة للوحة التخصص</span>
          </button>
          
          {/* Section Titles */}
          <div className="text-right" dir="rtl">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest mb-1">
              <Sparkles className="w-3 h-3" />
              {currentSubject.arabicName}
            </span>
            <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-150 tracking-tight">
              {cleanTitle}
            </h1>
          </div>
        </div>
      </header>

      {/* 2. Main Page Grid Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Visual Slide Container (Sticky on desktop) */}
          <section className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[2.5rem] p-4 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
              
              {/* Top left hover zoom icon */}
              <button 
                onClick={() => setIsImageZoomed(true)}
                className="absolute top-6 left-6 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-full hover:bg-amber-500 hover:text-white transition-all shadow-md z-20 opacity-0 group-hover:opacity-100 duration-300"
                title="تكبير الصورة بملء الشاشة"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Slide image wrapper */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-inner">
                <img 
                  src={imagePath} 
                  alt={cleanTitle} 
                  className="w-full h-full object-contain cursor-zoom-in group-hover:scale-[1.02] transition-transform duration-500 select-none"
                  onClick={() => setIsImageZoomed(true)}
                />
              </div>

              {/* Instructions */}
              <div className="w-full text-center mt-3 text-[11px] text-slate-400 font-bold tracking-wide flex items-center justify-center gap-1.5">
                <span>🔍 انقر فوق اللوحة البصرية لعرضها بملء الشاشة وتكبير التفاصيل</span>
              </div>
            </div>

            {/* Quick Stats info card */}
            <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-[2rem] p-6 text-right space-y-1" dir="rtl">
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">لوحة مخصصة للتعلم البصري</span>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">الذاكرة البصرية التفاعلية</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                تساعدك اللوحات الملخصة على تثبيت المعلومات الإكلينيكية وربطها بالمفاهيم الأساسية، مما يضمن أداء متميزاً في الامتحانات السريرية.
              </p>
            </div>
          </section>

          {/* RIGHT COLUMN: Tabs, Interactive Explanations & Quizzes */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Elegant Tab Buttons */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[2rem] p-2 flex gap-2 shadow-md relative z-10" dir="rtl">
              <button
                onClick={() => setActiveView('explanation')}
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl font-black text-base md:text-lg transition-all flex items-center justify-center gap-2.5",
                  activeView === 'explanation' 
                    ? "bg-[#faf6f0] text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/30 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <FileText className={cn("w-5 h-5", activeView === 'explanation' ? "text-amber-600 dark:text-amber-400 animate-pulse" : "text-slate-400")} />
                <span>الشرح والتلخيص الطبي</span>
              </button>

              <button
                onClick={() => setActiveView('quiz')}
                className={cn(
                  "flex-1 py-4 px-6 rounded-2xl font-black text-base md:text-lg transition-all flex items-center justify-center gap-2.5",
                  activeView === 'quiz' 
                    ? "bg-[#f0f9f4] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/30 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <HelpCircle className={cn("w-5 h-5", activeView === 'quiz' ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : "text-slate-400")} />
                <span>الاختبار التفاعلي الذاتي</span>
                {quizQuestions.length > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                    {quizQuestions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content Display Card */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {activeView === 'explanation' ? (
                  <motion.div
                    key="explanation"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#fcfbf9] dark:bg-slate-900 border border-amber-100/50 dark:border-slate-800/80 rounded-[2.5rem] p-6 md:p-10 shadow-lg text-right"
                    dir="rtl"
                  >
                    <div className="flex items-center gap-3 border-b border-amber-100/70 dark:border-slate-800/80 pb-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-slate-200">الشرح والتفسير السريري</h2>
                        <p className="text-[10px] font-bold text-slate-400">ملاحظات ووسائل حفظ وتثبيت المعلومة</p>
                      </div>
                    </div>

                    {/* Rich Arabic Sepia Markdown Viewer */}
                    <div className="text-slate-700 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-8 mb-4 border-b border-amber-100/50 pb-2 leading-tight" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-black text-slate-850 dark:text-slate-150 mt-6 mb-3 border-r-4 border-amber-500 pr-3 leading-snug" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-5 mb-2 leading-snug" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 text-slate-650 dark:text-slate-350 leading-loose" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mr-6 mb-4 space-y-2.5 text-slate-650 dark:text-slate-350" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mr-6 mb-4 space-y-2.5 text-slate-650 dark:text-slate-350" {...props} />,
                          li: ({node, ...props}) => <li className="marker:text-amber-500 pr-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="text-amber-700 dark:text-amber-300 font-black bg-amber-500/5 dark:bg-amber-500/10 px-2 py-0.5 rounded mx-1" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="bg-amber-500/5 dark:bg-amber-500/10 border-r-4 border-amber-500 rounded-xl p-4 my-4 font-bold italic text-amber-900 dark:text-amber-300" {...props} />,
                          hr: ({node, ...props}) => <hr className="my-8 border-slate-200 dark:border-slate-800/80" {...props} />,
                        }}
                      >
                        {explanationText}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#fcfbf9] dark:bg-slate-900 border border-emerald-100/50 dark:border-slate-800/80 rounded-[2.5rem] p-6 md:p-10 shadow-lg text-right"
                    dir="rtl"
                  >
                    <div className="flex items-center gap-3 border-b border-emerald-100/70 dark:border-slate-800/80 pb-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-slate-200">تدريبات اللوحة التفاعلية</h2>
                        <p className="text-[10px] font-bold text-slate-400">تطبيق تفاعلي لقياس مدى فهمك للوحة</p>
                      </div>
                    </div>

                    {quizQuestions.length > 0 ? (
                      !quizFinished ? (
                        <div className="space-y-6">
                          
                          {/* Progress indicators */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              السؤال {currentQuestionIdx + 1} من {quizQuestions.length}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              الدرجة الحالية: {score} صحيحة
                            </span>
                          </div>
                          
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 dark:bg-emerald-600 transition-all duration-300"
                              style={{ width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%` }}
                            />
                          </div>

                          {/* Question Content */}
                          <div className="space-y-6 pt-2">
                            <h3 className="text-lg md:text-xl font-black text-slate-850 dark:text-slate-100 leading-snug">
                              {quizQuestions[currentQuestionIdx].question}
                            </h3>

                            {/* Answer choices */}
                            <div className="grid grid-cols-1 gap-3.5">
                              {quizQuestions[currentQuestionIdx].options.map((option: string, idx: number) => {
                                const isSelected = selectedOptionIdx === idx;
                                const isCorrect = idx === quizQuestions[currentQuestionIdx].correctAnswer;
                                
                                let btnStyle = "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:border-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-800/30";
                                if (isSubmitted) {
                                  if (isCorrect) {
                                    btnStyle = "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-extrabold";
                                  } else if (isSelected) {
                                    btnStyle = "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-350 font-extrabold";
                                  } else {
                                    btnStyle = "bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-400 opacity-60";
                                  }
                                } else if (isSelected) {
                                  btnStyle = "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-extrabold";
                                }

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleOptionClick(idx)}
                                    disabled={isSubmitted}
                                    className={cn(
                                      "w-full text-right p-4.5 rounded-2xl transition-all flex items-center justify-between text-base font-bold shadow-sm",
                                      btnStyle
                                    )}
                                  >
                                    <span className="pl-4">{option}</span>
                                    {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                                    {isSubmitted && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Medical explanation box for review */}
                            {isSubmitted && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-emerald-500/5 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 shadow-inner"
                              >
                                <h4 className="text-emerald-700 dark:text-emerald-400 font-black text-sm mb-1.5 flex items-center gap-1.5">
                                  💡 التفسير والشرح السريري:
                                </h4>
                                <p className="text-sm text-slate-650 dark:text-slate-300 font-bold leading-relaxed">
                                  {quizQuestions[currentQuestionIdx].explanation}
                                </p>
                              </motion.div>
                            )}

                            {/* Control button (Confirm / Next) */}
                            <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-800/80">
                              {!isSubmitted ? (
                                <button
                                  onClick={handleSubmitAnswer}
                                  disabled={selectedOptionIdx === null}
                                  className="px-8 py-3.5 bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800/60 dark:disabled:text-slate-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base transition-all shadow-md"
                                >
                                  تأكيد الإجابة
                                </button>
                              ) : (
                                <button
                                  onClick={handleNextQuestion}
                                  className="px-8 py-3.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl font-black text-base transition-all shadow-md"
                                >
                                  {currentQuestionIdx + 1 === quizQuestions.length ? "عرض النتيجة النهائية" : "السؤال التالي"}
                                </button>
                              )}
                            </div>

                          </div>

                        </div>
                      ) : (
                        <div className="text-center py-10 max-w-sm mx-auto space-y-6">
                          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto text-4xl shadow-md">
                            🏆
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">تم إنجاز الاختبار!</h3>
                            <p className="text-xs text-slate-400 font-bold">رائع! لقد أتممت جميع أسئلة هذه اللوحة بنجاح</p>
                          </div>
                          <div className="p-6 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/80 shadow-inner">
                            <span className="text-[10px] font-black text-slate-400 block mb-1">النتيجة النهائية</span>
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{score} / {quizQuestions.length}</span>
                          </div>
                          <button
                            onClick={resetQuiz}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            <RotateCcw className="w-4 h-4" /> 
                            <span>إعادة محاولة الاختبار</span>
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-16 max-w-md mx-auto space-y-4">
                        <span className="text-5xl">🧠</span>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">أسئلة التدريب قيد التحضير</h3>
                        <p className="text-sm text-slate-400 font-bold leading-relaxed">
                          أهلاً بك! الأسئلة التفاعلية المخصصة لهذه اللوحة البصرية قيد الإعداد الطبي والتنسيق الفني، وسنقوم بدمجها فور توفرها لتتمكن من تقييم مستواك بنفسك!
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </section>

        </div>
      </main>

      {/* 3. Full-Screen Zoomable Image Modal */}
      <AnimatePresence>
        {isImageZoomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/98 backdrop-blur-md p-4"
          >
            {/* Close button top left */}
            <button 
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-6 left-6 p-4 bg-white/10 text-white hover:bg-rose-600 hover:scale-105 rounded-full transition-all border border-white/20 z-[3010]"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-full max-h-full flex items-center justify-center p-2"
            >
              <img 
                src={imagePath} 
                alt={cleanTitle} 
                className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl select-none shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
