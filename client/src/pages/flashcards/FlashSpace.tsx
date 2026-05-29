import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  Pencil, 
  Highlighter, 
  Eraser, 
  Zap, 
  Type, 
  Undo2, 
  Redo2, 
  Maximize2, 
  Clock,
  Layout,
  Plus,
  Minus,
  FileText,
  X,
  Brain,
  CheckCircle2,
  ChevronRight,
  Play,
  Pause,
  LogOut,
  Trophy,
  Search,
  BookOpen,
  ArrowRight,
  Hand,
  Trash2,
  Menu,
  Heart,
  Activity,
  Dna,
  Apple,
  Droplets,
  ShieldAlert,
  Stethoscope,
  Target,
  Lock,
  Eye,
  Check,
  Edit,
  Download,
  Loader2,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc, increment, arrayUnion, deleteField, getDoc, setDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { CampNotebookToDo } from '../../components/CampNotebookToDo';

// --- Vector Types ---
type Tool = 'pen' | 'highlighter' | 'eraser' | 'laser' | 'text' | 'pan';

interface Point {
  x: number;
  y: number;
}

interface Path {
  id: string;
  points: Point[];
  tool: Tool;
  color: string;
  size: number;
  opacity: number;
  isFading?: boolean;
  fadeStart?: number;
}

interface Board {
  id: string;
  module: string;
  system: string;
  subSystem?: string;
  disease: string;
  medicalImage: string;
  explanation: string;
  createdAt: number;
}

const PEDIATRICS_SLIDES: Record<string, string[]> = {
  'Cardiovascular diseases': [
    'Acute Rheumatic Fever (ARF).jpeg',
    'Acyanotic Obstructive Lesions (Aortic Stenosis).jpeg',
    'Acyanotic Obstructive Lesions (Pulmonary Stenosis).jpeg',
    'Atrial Septal Defect (ASD).jpeg',
    'CHD Introduction & Etiological Classifications.jpeg',
    'Coarctation of the Aorta (CoA).jpeg',
    'Complete Transposition of the Great Arteries (TGA).jpeg',
    'Patent Ductus Arteriosus (PDA).jpeg',
    'Pediatric Heart Failure (HF).jpeg',
    'Tetralogy of Fallot (TOF) & Hypercyanotic Spells.jpeg',
    'Ventricular Septal Defect (VSD) -1.jpeg',
    'Ventricular Septal Defect (VSD) - 2.jpeg'
  ],
  'Endocrinology': [
    'ADRENAL GLAND DISORDERS & CUSHING SYNDROME.jpeg',
    'CHILDHOOD OBESITY.jpeg',
    'DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA).jpeg',
    'INTRODUCTION TO ENDOCRINE SYSTEM.jpeg',
    'PARATHYROID GLAND DISORDERS.jpeg',
    'PUBERTY and DISORDERS.jpeg',
    'SHORT STATURE & TALL STATURE.jpeg',
    'THYROID GLAND DISORDERS.jpeg'
  ],
  'Gastroenterology & hepatology': [
    'Acute & Recurrent Abdominal Pain (RAP).jpeg',
    'Acute Diarrhea & Dehydration Assessment.jpeg',
    'Acute Viral & Autoimmune Hepatitis.jpeg',
    'COW MILK ALLERGY & LACTOSE INTOLERANCE.jpeg',
    'Diarrhea Management & Rehydration Protocols.jpeg',
    'Gastrointestinal Bleeding (UGIB & LGIB).jpeg',
    'GERD & Hypertrophic Pyloric Stenosis (CHIPS).jpeg',
    'Hepatomegaly & Hepatosplenomegaly (HSM).jpeg',
    'Hirschsprung Disease vs. Functional Constipation.jpeg',
    'Inborn Errors of Metabolism & Phenylketonuria (PKU).jpeg',
    'Pediatric Inflammatory Bowel Disease (IBD).jpeg'
  ],
  'Genetic diseases': [
    'CHROMOSOMAL ABERRATIONS & DISORDERS.jpeg',
    'CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE.jpeg',
    'INTRODUCTION TO GENETICS & BASIC CONCEPTS.jpeg',
    'PATTERNS OF SINGLE GENE INHERITANCE.jpeg',
    'PREVENTIVE GENETICS.jpeg'
  ],
  'Growth & development': [
    'BIOLOGICAL AGE & MATURATION (BONE & TEETH).jpeg',
    'DEVELOPMENTAL MILESTONES & NEURODEVELOPMENT.jpeg',
    'PEDIATRIC GROWTH.jpeg'
  ],
  'Hematology & Oncology': [
    'تحديدات الاطفال/Hematology & Oncology/Acute lymphoplastic leukemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Aplastic anemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/GP6D.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/HODGKIN lymphoma.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Hemophilia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Hereditary spherocytosis.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Immune thrombocytopenia (ITP).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Iron defeciency anemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Thalassemia.jpeg',
    'Safe Blood Transfusion & Complications.jpeg',
    'Sickle Cell Disease (SCD).jpeg',
    'The Thalassemia Syndromes (Alpha & Beta).jpeg'
  ],
  'Infections': [
    'Acute Bacterial Meningitis  Septic Meningitis.png',
    'Ancylostomiasis  Hookworms.png',
    'Ascariasis  Roundworms.png',
    'Bacterial Infections(table).png',
    'Brucellosis.jpeg',
    'Chicken Pox (Varicella).jpeg',
    'Enterobiasis  Pinworm.png',
    'Measles.jpeg',
    'Mumps.jpeg',
    'Pertussis  Whooping Cough.png',
    'Scarlet Fever.png',
    'Typhoid Fever.png',
    'all infections chapter.png'
  ],
  'Neurology': [
    'Abnormal Cranial Volume (Macrocephaly & Microcephaly).jpeg',
    'Anterior Horn Cell Diseases & Neuropathies.jpeg',
    'Anti-Epileptic Drugs (AEDs).jpeg',
    'Cerebral Palsy (CP).jpeg',
    'Craniostenosis (Craniosynostosis).jpeg',
    'Early Detection of CP & Motor Development.jpeg',
    'Febrile Convulsions & Epilepsy Mimickers.jpeg',
    'Muscular Dystrophies (DMD & BMD).jpeg',
    'Pediatric Seizures & Epilepsy Classification.jpeg',
    'Status Epilepticus Emergency.jpeg',
    'The Floppy Infant Syndrome.jpeg'
  ],
  'Nutrition': [
    'ARTIFICIAL & COMPLEMENTARY FEEDING (WEANING).jpeg',
    'BREASTFEEDING MANAGEMENT & CHALLENGES.jpeg',
    'HUMAN MILK STAGES, COMPOSITION & ADVANTAGES.jpeg',
    'PROTEIN ENERGY MALNUTRITION (PEM).jpeg',
    'RICKETS & TETANY.jpeg',
    'THE FOUNDATIONS OF INFANT FEEDING.jpeg'
  ],
  'Renal diseases': [
    'Acute Kidney Injury (AKI) & pRIFLE Criteria.jpeg',
    'Acute Nephritic Syndrome & APSGN (1).jpeg',
    'Acute Nephritic Syndrome & APSGN (2).jpeg',
    'Chronic Kidney Disease (CKD) & Growth Retardation.jpeg',
    'Nephrotic Syndrome (NS).jpeg',
    'Pediatric Hematuria Approach & Evaluation.jpeg',
    'Proteinuria Detection & Etiological Sorting.jpeg',
    'Renal Anatomy, Functions & Urine Color Changes.jpeg',
    'URINARY TRACT INFECTIONS (UTIs) & RENAL IMAGING PROTOCOL.jpeg'
  ],
  'تحديدات الاطفال': [
    'تحديدات الاطفال/CVS/Atrial Septal Defect (ASD).jpeg',
    'تحديدات الاطفال/CVS/Complete Transposition of the Great Arteries (TGA).jpeg',
    'تحديدات الاطفال/CVS/Patent Ductus Arteriosus (PDA).jpeg',
    'تحديدات الاطفال/CVS/Pediatric Heart Failure (HF).jpeg',
    'تحديدات الاطفال/CVS/Tetralogy of Fallot (TOF) & Hypercyanotic Spells.jpeg',
    'تحديدات الاطفال/CVS/Ventricular Septal Defect (VSD) - 2.jpeg',
    'تحديدات الاطفال/CVS/Ventricular Septal Defect (VSD) -1.jpeg',
    'تحديدات الاطفال/Endocrinology/CHILDHOOD OBESITY.jpeg',
    'تحديدات الاطفال/Endocrinology/Congenital hypothyrodism.jpeg',
    'تحديدات الاطفال/Endocrinology/DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA).jpeg',
    'تحديدات الاطفال/Endocrinology/Short stature.jpeg',
    'تحديدات الاطفال/Genetics/Down syndrome.jpeg',
    'تحديدات الاطفال/Genetics/Prenatal diagnosis.jpeg',
    'تحديدات الاطفال/Genetics/Turner syndrome.jpeg',
    'تحديدات الاطفال/GIT/Cow milk allergy.jpeg',
    'تحديدات الاطفال/GIT/Pediatrics abdominal pain.jpeg',
    'تحديدات الاطفال/GIT/Vomiting.jpeg',
    'تحديدات الاطفال/Growth & Development/Developmental milestones.jpeg',
    'تحديدات الاطفال/Growth & Development/Growth charts.jpeg',
    'تحديدات الاطفال/Growth & Development/Key development warning signs & Delayed milestone causes.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Acute lymphoplastic leukemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Aplastic anemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Chronic Hemolytic Anemia & Hereditary Spherocytosis.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/GP6D.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/HODGKIN lymphoma.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Hemophilia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Hereditary spherocytosis.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Immune thrombocytopenia (ITP).jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Iron defeciency anemia.jpeg',
    'تحديدات الاطفال/Hematology & Oncology/Thalassemia.jpeg',
    'تحديدات الاطفال/Infection/Infections.jpeg',
    'تحديدات الاطفال/Neurology/Cerebral Palsy (CP).jpeg',
    'تحديدات الاطفال/Neurology/Duchenne muscle dystrophy.jpeg',
    'تحديدات الاطفال/Neurology/The Floppy Infant Syndrome.jpeg',
    'تحديدات الاطفال/Nutrition/advantages of breastfeeding & contraindication.jpeg',
    'تحديدات الاطفال/Nutrition/PEM.jpeg',
    'تحديدات الاطفال/Nutrition/Rickets.jpeg'
  ],
  'معسكر الورقة الأولى': [
    'معسكر الورقة الأولى.jpeg'
  ]
};

const PEDIATRICS_EXPLANATIONS: Record<string, string> = {
  'Acute Rheumatic Fever (ARF)': `
### 3. الحمى الروماتيزمية الحادة (Acute Rheumatic Fever - ARF)

استجابة مناعية متأخرة لعدوى الحلق بالبكتيريا السبحية (Group A Strep).

* **تشخيص (معايير جونز المعدلة 2015):** (2 معايير كبرى) أو (1 كبيرة + 2 صغيرة) + دليل على عدوى سابقة بالسبحية.
* **كبرى (Major):** التهاب المفاصل المهاجر، التهاب القلب (Pancarditis)، رقص سيدنهام (Sydenham's Chorea)، طفح Erythema Marginatum، عقيدات تحت الجلد.


* **العلاج:** إزالة العدوى بالبنسلين (Benzathine Penicillin G)، واستخدام الأسبرين/بريدنيزون للالتهاب (فقط بعد تأكيد التشخيص).
* **الوقاية الثانوية:** ضرورية جداً بالبنسلين طويل المفعول كل 28 يوماً لمنع الانتكاسات.
`,
  'Acyanotic Obstructive Lesions (Aortic Stenosis)': `
**أ) ضيق الصمام الأورطي (Aortic Stenosis - AS):**

* **تشريح:** عيب خلقي (نسبة الذكور 4:1).
* **إكلينيكياً:** ألم صدر، إرهاق، أو إغماء في الحالات الشديدة.
* **الفحص:** حفيف انقباضي (Systolic ejection murmur) في أعلى يمين القص، مع "نقر" انقباضي (Systolic click).
* **العلاج:** "رأب الصمام بالبالون" هو الخيار التدخلي الأول، وقد يلزم تدخل جراحي.
`,
  'Acyanotic Obstructive Lesions (Pulmonary Stenosis)': `
**ب) ضيق الصمام الرئوي (Pulmonary Stenosis - PS):**

* **تشريح:** عيب شائع في الأطفال (4-8% من العيوب القلبية)، يحدث غالباً في الصمام (90%).
* **إكلينيكياً:** تنفس نهجي عند المجهود (Exertional dyspnea).
* **الفحص:** حفيف انقباضي في أعلى يسار القص، مع انقسام واسع في الصوت الثاني (Wide split S2).
* **العلاج:** "رأب الصمام بالبالون" هو الإجراء المفضل، والجراحة في حالات فشل البالون أو الضيق غير الصمامي.
`,
  'Atrial Septal Defect (ASD)': `
### 1. عيوب القلب: عيب الحاجز الأذيني (Atrial Septal Defect - ASD)

* **المفهوم:** خلل هيكلي في الحاجز بين الأذينين يؤدي لمرور الدم من الأذين الأيسر للأيمن.
* **الأنواع التشريحية:** * **Ostium Secundum (الأكثر شيوعاً):** في مركز الحاجز.
* **Ostium Primum:** في الجزء السفلي.
* **Sinus Venosus:** قرب مداخل الأوردة الرئوية.


* **الديناميكا الدموية:** عبور الدم من اليسار لليمين يسبب تحميل حجمي (Volume Overload) على الأذين والبطين الأيمن والشريان الرئوي.
* **العلامات الإكلينيكية:** * **صوت القلب الثاني (S2):** انقسام واسع وثابت (**Widely split & fixed S2**) - وهي العلامة المميزة (Pathognomonic).
* **الحفيف (Murmur):** حفيف انقباضي فوق المنطقة الرئوية (بسبب زيادة تدفق الدم).


* **التشخيص:** تخطيط القلب (ECG) يظهر انحراف المحور لليمين (RAD) مع انسداد حزمة أيمن (RBBB).
* **الإدارة:** الإغلاق (بالقسطرة أو الجراحة) يُفضل بين سن 2-4 سنوات، إلا إذا ظهر فشل قلب أو تحميل حجمي شديد قبل سن سنتين.
`,
  'CHD Introduction & Etiological Classifications': `
### 1. مقدمة في أمراض القلب الخلقية (CHD)

* **الانتشار:** العيب الخلقي الأكثر شيوعاً (8-10 لكل 1000 ولادة).
* **الأسباب:**
* **عوامل جينية:** متلازمات (Trisomy 21, 18, 13).
* **عوامل بيئية (Teratogens):** إصابات فيروسية أثناء الحمل (الحصبة الألمانية)، أدوية (Warfarin)، سكري الأم، التعرض للإشعاع.


* **التصنيف:**
* **غير مزرقة (Acyanotic):**
1. مع تحويلة يسار-يمين (Left-to-Right Shunt): مثل VSD, PDA, ASD.
2. بدون تحويلة (Obstructive/Non-obstructive): مثل Aortic/Pulmonary Stenosis.


* **مزرقة (Cyanotic):** (سيتم تفصيلها لاحقاً).
`,
  'Coarctation of the Aorta (CoA)': `
### ضيق الشريان الأورطي (Coarctation of the Aorta - CoA)

**1. المفهوم (Definition):**
هو ضيق خلقي في شريان الأورطي، يحدث غالباً في المنطقة المقابلة لمكان اتصال القناة الشريانية (**Ductus Arteriosus**).

**2. التصنيف التشريحي:**

* **Pre-ductal:** الضيق قبل القناة الشريانية (يظهر غالباً في الأطفال حديثي الولادة).
* **Post-ductal:** الضيق بعد القناة الشريانية (يظهر غالباً في الأطفال الأكبر سناً والبالغين).

**3. العلامات السريرية (Clinical Presentation):**

* **العلامة الأهم (Classic Sign):** **اختلاف النبض وضغط الدم** بين الأطراف العلوية والسفلية.
* ضغط الدم والنبض في اليدين يكون أقوى وأعلى.
* ضغط الدم والنبض في القدمين يكون أضعف وأقل (Delayed and weak femoral pulses).


* **أعراض إضافية:** برودة في الأطراف السفلية، صداع، نزيف أنفي، وأحياناً فشل قلب في الحالات الشديدة.

**4. الفحص السريري (Examination):**

* **الحفيف (Murmur):** حفيف انقباضي يُسمع بوضوح في منطقة ما بين لوحي الكتف (**Interscapular region**).
* **الأوعية الجانبية:** مع الوقت، تتكون أوعية دموية جانبية (Collateral circulation) لتوصيل الدم للجزء السفلي من الجسم.

**5. التشخيص (Diagnosis):**

* **X-ray:** علامة تآكل الأضلاع (**Rib notching**) بسبب الأوعية الدموية الجانبية المتضخمة.
* **Echocardiography:** هو الاختبار الأساسي لتأكيد التشخيص وتحديد مكان وشدة الضيق.

**6. الإدارة والعلاج:**

* **في حديثي الولادة:** الحفاظ على القناة الشريانية مفتوحة باستخدام حقن **Prostaglandin E1** حتى يتم التدخل.
* **التدخل الجراحي:** هو العلاج الأساسي، ويتم عن طريق إزالة الجزء الضيق ووصل الطرفين (End-to-end anastomosis) أو استخدام رقعة (Patch aortoplasty).
* **القسطرة:** يمكن استخدام "البالون" لتوسيع الضيق (أحياناً مع تركيب دعامة) في حالات معينة.                               هذه ملخصات مركزة للمواضيع التي رفعتها، مصممة لتكون مرجعاً سريعاً للمذاكرة أو النسخ:
`,
  'Complete Transposition of the Great Arteries (TGA)': `
### 1. عيوب القلب الخلقية: تبديل الشرايين الكبرى (Complete TGA)

* **المفهوم:** انقلاب تشريحي؛ الأورطي يخرج من البطين الأيمن (دم غير مؤكسج للجسم)، والشريان الرئوي يخرج من البطين الأيسر (دم مؤكسج للرئة).
* **الديناميكا:** دورتان منفصلتان تعملان بالتوازي وليس بالتوالي، مما يجعل الحياة مستحيلة بدون وجود وصلة (ASD, VSD, or PDA).
* **الإكلينيكي:** زرقان شديد منذ الولادة (**Cyanosis**) لا يتحسن بالأكسجين 100%.
* **التشخيص:** أشعة الصدر تظهر شكل القلب "بيضة معلقة بخيط" (**Egg on a string**).
* **الإدارة:**
* **طوارئ:** إعطاء **PGE1** للحفاظ على القناة الشريانية مفتوحة، وإجراء **Rashkind** (توسيع الفتحة الأذينية).
* **جراحي:** **Arterial Switch Operation (ASO)** هو الإجراء المفضل ويجب إجراؤه مبكراً (3-8 أسابيع).
`,
  'Patent Ductus Arteriosus (PDA)': `
### القناة الشريانية السالكة (Patent Ductus Arteriosus - PDA)

* **المفهوم:** بقاء القناة الشريانية مفتوحة بعد الولادة، وهي الوصلة الطبيعية بين الشريان الرئوي (PA) وقوس الأورطي (Ao) أثناء الحياة الجنينية.
* **الديناميكا الدموية (Hemodynamics):** الضغط في الأورطي أعلى منه في الشريان الرئوي، مما يؤدي لتدفق الدم المستمر من الأورطي إلى الشريان الرئوي (Left-to-right shunt). هذا يسبب زيادة تدفق الدم للرئتين، وتضخم الأذين والبطين الأيسر.
* **العلامات الإكلينيكية:**
* **نبضات مميزة:** نبض "المطرقة المائية" (**Water hammer pulse**) بسبب اتساع فرق ضغط الدم (ارتفاع الانقباضي وانخفاض الانبساطي).
* **الحفيف (Murmur):** الحفيف المميز جداً هو **"حفيف الماكينة المستمر" (Continuous machinery murmur)**، يُسمع في أعلى يسار القص وينتقل للظهر.


* **المضاعفات:** خطر الإصابة بزرقان تفاضلي (**Differential cyanosis**) إذا تطور ارتفاع ضغط الرئة ليصبح التحويل من اليمين لليسار.
* **الإدارة والعلاج:**
* **للأطفال الخدج:** إغلاق دوائي باستخدام مضادات البروستاجلاندين (Indomethacin أو Ibuprofen) أو الباراسيتامول.
* **للأطفال (Term infants):** التشخيص بحد ذاته مؤشر للإغلاق.
* **طريقة الإغلاق:** الإغلاق غير الجراحي بالقسطرة هو المعيار الذهبي (Standard of care)، والجراحة (ربط القناة) تُستخدم فقط إذا كانت القسطرة غير ممكنة.
`,
  'Pediatric Heart Failure (HF)': `
### فشل القلب في الأطفال (Pediatric Heart Failure)

**1. المفهوم والآلية (Pathophysiology & Etiology):**
فشل القلب هو عدم قدرة القلب على ضخ كمية كافية لتلبية احتياجات الجسم.

* **الأسباب الرئيسية:**
* **زيادة الحمل اللاحق (Afterload):** كما في ضيق الأورطي (AS) وارتفاع ضغط الدم.
* **زيادة الحمل السابق (Preload):** كما في عيوب القلب مع تحويلة يسار-يمين (VSD, PDA, ASD).
* **نقص الانقباض:** كما في اعتلال العضلة القلبية (Cardiomyopathy).
* **اضطرابات النظم (Tachyarrhythmias):** تقصر فترة الانبساط (Diastolic filling).



**2. الصورة الإكلينيكية (Clinical Picture):**

* **في الرضع (The Diagnostic Triad):** (تسرع تنفس + تسرع ضربات قلب + تضخم وألم في الكبد).
* **في الأطفال الأكبر سناً:** تظهر أعراض فشل القلب الأيسر (احتقان رئوي، إرهاق) أو الأيمن (احتقان جهازي، استسقاء، تورم أطراف).

**3. التصنيف الوظيفي (Ross Classification):**

* **Class I:** لا يوجد أعراض.
* **Class II:** تسرع تنفس/تعرق خفيف مع الرضاعة؛ لا يوجد فشل في النمو.
* **Class III:** تسرع تنفس/تعرق ملحوظ مع الرضاعة أو المجهود؛ فشل في النمو.
* **Class IV:** أعراض في حالة الراحة (تسرع تنفس، انكماشات تنفسية).

**4. الإدارة والعلاج الدوائي (Management & Pharmacology):**

* **مدرات البول (Diuretics):** (Furosemide) لتقليل الاحتقان (Preload reduction).
* **موسعات الأوعية (Afterload-Reducing Agents):** (ACE Inhibitors مثل Captopril) لعلاج حالات التحويلة (Shunts).
* **مقويات العضلة (Inotropic Agents):** مثل الدوبامين والدوبوتامين للحالات الحرجة.
* **الديجيتال (Digoxin):** لتحسين الانقباض. 🚨 **تحذير:** يُمنع في حالات انسداد تدفق الدم (مثل TOF، Hypertrophic Cardiomyopathy) أو سمية الديجيتال.
* **حاصرات بيتا (Beta-blockers):** مثل Carvedilol، تُستخدم في المراحل المزمنة من اعتلال العضلة القلبية (DCM) ولا تُستخدم أبداً في المراحل الحادة.
`,
  'Tetralogy of Fallot (TOF) & Hypercyanotic Spells': `
### رباعية فالو (Tetralogy of Fallot - TOF)

**1. المكونات الأربعة الأساسية:**

1. **VSD** (عيب الحاجز البطيني).
2. **Overriding Aorta** (أورطي راكب فوق العيب).
3. **Pulmonary Stenosis** (ضيق الشريان الرئوي، وهو العامل المحدد لشدة المرض).
4. **RVH** (تضخم البطين الأيمن).

**2. الصورة الإكلينيكية:**

* **الزرقان (Cyanosis):** يظهر مبكراً ويزداد سوءاً بعد انغلاق القناة الشريانية، ولا يستجيب للأكسجين.
* **وضعية القرفصاء (Squatting):** يلجأ إليها الأطفال لزيادة المقاومة الوعائية الجهازية، مما يقلل من التحويلة (Shunt) من اليمين لليسار ويحسن تدفق الدم للرئة.
* **الحفيف (Murmur):** حفيف انقباضي في الجهة اليسرى من القص (ناتج عن ضيق الشريان الرئوي). 🚨 **ملاحظة:** يختفي الحفيف أو يضعف جداً أثناء نوبات الزرقان (Tet spells).

---

### نوبات الزرقان (Hypercyanotic / Tet Spells)

**1. عوامل محفزة:** البكاء، التبرز، الحرارة، الرضاعة، أو الاستيقاظ من النوم. (نقص الحديد محفز هام).
**2. بروتوكول الطوارئ (الترتيب ضروري):**

1. **وضع القرفصاء (Knee-Chest position).**
2. تهدئة الطفل (تجنب الهياج).
3. إعطاء أكسجين.
4. **Morphine Sulfate** (تحت الجلد أو وريد ببطء).
5. **Sodium Bicarbonate IV** (لعلاج الحماض Metabolic acidosis).
6. **Warmed Fluid Bolus** (10 ml/kg).
7. **Beta-Blockers** (مثل Esmolol) لتقليل تشنج عضلة المخرج (Infundibular spasm).
8. **Ketamine IV أو Phenylephrine IV** (لزيادة المقاومة الوعائية).
9. التنبيب (Intubation) / تخدير عام.
10. وصلة جراحية طارئة (Urgent Surgical Shunt).

🚨 **موانع مطلقة (Critical Absolute Contraindications):**
**يمنع منعاً باتاً إعطاء Inotropes أو Diuretics أثناء النوبة.**

---

### التشخيص والعلاج الجراحي

* **التشخيص:** أشعة الصدر تظهر قلباً بشكل "الحذاء" (**Boot-shaped heart**)، وتخطيط القلب يظهر تضخم البطين الأيمن (RVH).
* **الجراحة:**
* **Palliative:** وصلة (Modified Blalock-Taussig shunt).
* **Definitive:** الإصلاح الجراحي الكامل (يفضل في عمر 6-9 أشهر).
`,
  'Ventricular Septal Defect (VSD) -1': `
عيب الحاجز البطيني (Ventricular Septal Defect - VSD): التشريح والديناميكا الدموية
1. المفهوم والانتشار:

المفهوم: خلل هيكلي في الحاجز الفاصل بين البطينين (Interventricular septum).

الانتشار: هو العيب الخلقي القلبي الأكثر شيوعاً، ويمثل حوالي 30% من إجمالي عيوب القلب الخلقية.

2. التصنيف التشريحي:

Membranous VSD (الأكثر شيوعاً): يحدث في الجزء الغشائي من الحاجز، وغالباً ما يمتد ليشمل جزءاً من النسيج العضلي المجاور (ويسمى Perimembranous).

Muscular VSD (أقل شيوعاً): يحدث في الجزء العضلي من الحاجز، وقد يكون ثقباً واحداً أو ثقوباً متعددة في أجزاء مختلفة (Inlet, trabecular, or infundibular).

3. التصنيف حسب الحجم:

Small (Roger's Disease): غالباً بدون أعراض، يُكتشف بالصدفة، وفرصته في الإغلاق التلقائي عالية.

Moderate: أعراض متوسطة بين الصغير والكبير.

Large: يسبب تغييرات ديناميكية حرجة، والطفل يعاني من أعراض واضحة.

4. الديناميكا الدموية (Complex Hemodynamics):

آلية التحويلة (Shunt): يمر الدم من البطين الأيسر (LV) إلى البطين الأيمن (RV). كمية الدم المارة تعتمد على حجم الثقب والمقاومة الوعائية الرئوية.

النتائج:

Pulmonary Plethora: كمية كبيرة من الدم تمر عبر الشريان الرئوي (RV output + shunt output)، مما يؤدي لاحتقان رئوي.

تضخم الحجرات: يرجع الدم الزائد إلى الأذين الأيسر (LA) ثم البطين الأيسر (LV)، مما يسبب تضخم الحجرات اليسرى.

متلازمة آيزنمنجر (Eisenmenger Syndrome): نتيجة لزيادة ضغط الرئة المستمر، يرتفع ضغط البطين الأيمن ليعادل أو يتجاوز الأيسر، فتنعكس التحويلة من اليمين لليسار، مما يؤدي إلى زرقان دائم (Persistent cyanosis) وانخفاض في النتاج القلبي.
`,
  'Ventricular Septal Defect (VSD) - 2': `
### عيب الحاجز البطيني (Ventricular Septal Defect - VSD)

**1. الصورة الإكلينيكية (Clinical Manifestations):**

* **VSD صغير:** لا توجد أعراض، نمو طبيعي.
* **VSD متوسط إلى كبير:** فشل في النمو، تعرق زائد أثناء الرضاعة، تكرار التهابات الجهاز التنفسي، وفشل قلب احتقاني (CHF).
* **مرحلة آيزنمنجر (Eisenmenger's Phase):** حالة متأخرة يحدث فيها عكس للتحويلة (من اليمين لليسار) بسبب ارتفاع ضغط الشريان الرئوي، مما يؤدي لظهور زرقان (Cyanosis) وتغيرات أصابع (Clubbing).
* **الفحص:** حفيف انقباضي شامل (**Harsh pansystolic murmur**) يُسمع بوضوح عند أسفل يسار القص.

**2. التشخيص (Investigations):**

* **ECG:** يتغير حسب حجم التحويلة؛ طبيعي (في الصغير)، تضخم أذين وبطين أيسر (في المتوسط)، تضخم بطين أيمن (في حالات ارتفاع ضغط الرئة).
* **CXR:** تضخم في القلب وزيادة في العلامات الوعائية الرئوية (تتناسب مع حجم التحويلة).
* **Echocardiography:** الأداة التشخيصية الأساسية (تحديد حجم ومكان العيب وحساب ضغط الشريان الرئوي).

**3. التاريخ الطبيعي للمرض (Natural History):**

* **الإغلاق التلقائي:** شائع جداً في العيوب العضلية (حوالي 60% بمرور 8 سنوات) والعيوب المحيطة بالغشاء (حوالي 35% بمرور 5 سنوات).
* **المضاعفات:** فشل القلب الاحتقاني (خلال 6-8 أسابيع في العيوب الكبيرة)، وتطور مرض الأوعية الرئوية الانسدادي.

**4. الإدارة والعلاج (Management):**

* **علاجي (Medical):** مدرات البول ومثبطات ACE لعلاج فشل القلب، تغذية عالية السعرات.
* **الإغلاق الجراحي (Surgical):** يُنصح به في حالات: فشل النمو، ضغط الرئة > 50% من الضغط الجهازي (قبل سن سنة)، تضخم الحجرات اليسرى، أو فشل القلب المستعصي.
* **الإجراءات:** الإغلاق الجراحي (patch closure) هو الأساس، أو الإغلاق بالقسطرة (لحالات مختارة).
`,
  'CHROMOSOMAL ABERRATIONS & DISORDERS': `
**أولاً: الخلل الكروموسومي - الأسباب والأنواع (Etiology & Types)**

* **الأسباب (Etiology):** قد تحدث الطفرات تلقائياً (**Spontaneously**) أو نتيجة التعرض لعوامل بيئية مثل المواد الكيميائية، الإشعاع، والأشعة فوق البنفسجية (**UV light**).

**A. Numerical Aberrations (الخلل في العدد):**

1. **Euploidy:** أن تحتوي الخلية على مضاعفات الرقم 23 الطبيعي.
2. **Polyploidy:** وجود 3 نسخ أو أكثر من كل الكروموسومات (حالة مميتة ولا تتوافق مع الحياة - **Incompatible with life**).
3. **Aneuploidy:** تغير في عدد الكروموسومات لا يشمل المجموعة كاملة، مثل التثلث الصبغي (**Trisomy 2n+1**) كمتلازمة داون، أو أحادي الصبغي (**Monosomy 2n-1**) كمتلازمة تيرنر.
4. **Mosaicism (الفسيفسائية):** وجود مجموعتين أو أكثر من الخلايا بتركيب جيني مختلف في نفس الشخص.

**B. Structural Aberrations (الخلل في الهيكل):**

1. **Translocation (الانتقال):** انفصال جزء من كروموسوم والتصاقه بكروموسوم آخر.
2. **Deletion (الحذف):** فقدان جزء من المادة الجينية نتيجة كسر في الكروموسوم.
3. **Duplication (التضاعف):** استنساخ جزء من الكروموسوم لمرات زائدة.
4. **Inversion (الانقلاب):** انعكاس قطعة من الـ DNA وإعادة التحامها بالمقلوب.
5. **Isochromosome:** كروموسوم يمتلك ذراعين متطابقين تماماً.

---

**ثانياً: متلازمة داون - التثلث الصبغي 21 (Down Syndrome / Trisomy 21)**
**1. الأنواع الجينية (Cytogenetic Types):**

* **Nondisjunction (عدم الانفصال - 94%):** فشل زوج الكروموسوم 21 في الانفصال أثناء الانقسام. 🚨 يزداد خطر حدوثه مع تقدم عمر الأم.
* **Translocation (الانتقال - 3-4%):** التصاق مادة إضافية من الكروموسوم 21 بكروموسوم آخر. هذا هو النوع **العائلي (Familial)** وله احتمالية تكرار عالية في الحمل القادم بغض النظر عن عمر الأم.
* **Mosaic Type (الفسيفسائي - 1-2%):** بعض الخلايا فقط تحتوي على الكروموسوم الزائد، وتكون الأعراض الإكلينيكية أخف.

**2. الصورة الإكلينيكية (Clinical Phenotype):**

* **ملامح الوجه (Dysmorphic Features):** ميلان شق العين للأعلى (**Upward slanting palpebral fissures**)، طية علاية الموق (**Epicanthus**)، بقع براشفيلد في القزحية (**Brushfield spots**)، وبروز اللسان.
* **تأثر الأجهزة (System Affection):** عيوب خلقية في القلب (أشهرها ثقب الحاجز البطيني **VSD** بنسبة 50%)، تخلف عقلي، ارتخاء عضلي عام (**Hypotonia**)، وانسداد خلقي في الإثنى عشر (**Duodenal atresia**).

---

**ثالثاً: متلازمة تيرنر (Turner Syndrome)**

* **التركيب الجيني (Genotype):** هي طفرة أحادية الصبغي (**45,X**) وهي الأشهر، أو من النوع الفسيفسائي (45,X/46,XX). وتصيب الإناث فقط.

**Enumerate the Clinical Phenotype of Turner Syndrome:**

1. **في حديثي الولادة (Neonatal):** تورم ليمفاوي في اليدين والقدمين (**Lymphedema**)، خط شعر خلفي منخفض، وكيس ليمفاوي رطب في الرقبة (**Cystic hygroma**).
2. **في الطفولة والمراهقة:** قصر القامة (**Short stature**)، رقبة مجنحة عريضة (**Webbed neck**)، صدر عريض، وضيق خلقي في الشريان الأورطي (**Coarctation of the aorta**).
3. **الغدد التناسلية (Glandular):** خلل وتليف في تكون المبايض (**Gonadal dysgenesis**) يؤدي إلى انقطاع طمث أولي وعقم (**Primary amenorrhea and infertility**).

* **خطة العلاج:** حقن هرمون النمو لعلاج قصر القامة، وبدائل الإستروجين عند الوصول لسن البلوغ.

---

**رابعاً: متلازمة كلاينفلتر (Klinefelter Syndrome)**

* **التركيب الجيني:** يمتلك المريض كروموسوم X زائد (**47,XXY**)، وتصيب الذكور بمعدل 1 لكل 1000 ولادة.
* **الصورة الإكلينيكية:**
* طول ملحوظ في القامة مع بنية مخصية (**Tall and eunuchoid build**) وشعر وجه خفيف جداً.
* خصيتين صغيرتين ضامرتين (**Small dysgenetic testes**)، صغر حجم العضو الذكري (**Micropenis**)، ونقص في علامات البلوغ الثانوية الذكورية.


* 🚨 **ملاحظة إكلينيكية:** نادراً ما يتم تشخيص هذه الحالة قبل الوصول لسن البلوغ.

---

**خامساً: تثلثات صبغية أخرى مميتة (Other Trisomies)**

1. **Edward Syndrome - Trisomy 18 (متلازمة إدوارد):** يتميز الطفل بتأخر شديد في النمو، يد مقبوضة مع تداخل الأصابع فوق بعضها (**Clenched hand with overlapping fingers**)، وقدم تشبه الكرسي الهزاز (**Rocker-bottom feet**). يعيش 10% فقط منهم لعمر السنة.
2. **Patau Syndrome - Trisomy 13 (متلازمة باتاو):** يتميز بخلل اندماج الدماغ الأمامي (**Holoprosencephaly**)، صغر الرأس والعينين (**Microcephaly & Microphthalmia**)، وشق في الشفة والحنك (**Cleft lip/palate**). يتوفى معظمهم في الأشهر الأولى من الحياة.

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic لربط اسم المتلازمة برقم الكروموسوم:**

* **E**dward = **E**ighteen (حرف الـ E مع الـ E ⬅️ كروموسوم 18).
* **P**atau = **P**uberty (كروموسوم 13، وتذكر حرف الـ P مع الـ **P**alate cleft و الـ **P**rosencephaly).
* **D**own = **D**rinking age (كروموسوم 21).

**2. Mnemonic لعلامات متلازمة تيرنر (Turner Syndrome):**
عشان تفتكر البنت في العيادة شكلها إيه:
**(قصيرة ورقبتها عريضة.. ومبايضها ضامرة ومش بتخلف.. وعندها ضيق في الأورطي)**

* **قصيرة ورقبتها عريضة:** Short stature & Webbed neck.
* **مبايضها ضامرة:** Gonadal dysgenesis & Infertility.
* **ضيق في الأورطي:** Coarctation of the aorta.

**3. Mnemonic لأنواع متلازمة داون الجينية:**
في أسئلة الـ MCQs الخاصة بالوراثة وتكرار الحمل:
**(اللي بيزيد مع السن هو الـ Nondisjunction.. واللي بيورّث في العيلة هو الـ Translocation)**.
`,
  'CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE': `
**أولاً: التحليل الكروموسومي (Karyotyping for Chromosomal Aberrations)**

* **التعريف (Definition):** هو عملية تحضير خريطة كروموسومية (Karyotype) من صور للكروموسومات في الطور الاستوائي (**Metaphase**) مرتبة في شكل وتنسيق قياسي.
* **الأهمية (Importance):** يُستخدم لاكتشاف التشوهات الكروموسومية العددية، أو العيوب الهيكلية الواضحة.

**Enumerate the Main Laboratory Steps (خطوات المعمل الأساسية):**

1. **Cell Growth (نمو الخلايا):** زراعة الخلايا (غالباً من عينة دم) لتتكاثر وتنقسم.
2. **Cell Arrest (إيقاف انقسام الخلية):** يتم إيقاف انقسام الخلايا تحديداً في الطور الاستوائي (**Metaphase**) عن طريق إضافة مادة الكولشيسين (**Colchicine**)، والتي تعمل على إيقاف خيوط المغزل الانقسامي.
3. **Nuclei Swelling (تورم الأنوية):** تتم إضافة محلول منخفض التركيز (**Hypotonic solution**) مما يتسبب في تورم الأنوية وانفجار الخلايا للحصول على الكروموسومات.
4. **Fixation & Staining (التثبيت والصبغ):** تُثبت الخلايا وتُصبغ لإظهار أنماط التخطيط المميزة للكروموسوم (مثل الـ **G-banding** باستخدام إنزيم الـ **Trypsin** وصبغة الـ **Giemsa**).
5. **Karyogram (الخريطة الكروموسومية):** ترتيب الكروموسومات الفردية في شكل قياسي لفحصها تحت ميكروسكوب عالي الدقة.

---

**ثانياً: دواعي الفحص الإكلينيكية (Clinical Indications for Chromosomal Analysis)**
متى يطلب الطبيب تحليل كروموسومات للمريض؟

1. التخلف العقلي، تأخر النمو، والتأخر التطوري (**Mental retardation & developmental delay**).
2. وجود ملامح شكلية غير طبيعية مصحوبة بعيوب خلقية متعددة (**Dysmorphic features and multiple congenital anomalies**).
3. الإناث اللاتي يعانين من قصر قامة غير مبرر (**Females with unexplained short stature** - للبحث عن متلازمة تيرنر).
4. الأعضاء التناسلية المبهمة واضطرابات تحديد الجنس (**Ambiguous genitalia and intersex disorders**).
5. الإجهاض المتكرر ومشاكل الخصوبة (**Recurrent abortions and fertility problems**).
6. وجود تاريخ عائلي لأمراض أو انتقالات كروموسومية (**Family history**).

---

**ثالثاً: شجرة العائلة والرموز الجينية (Family Pedigree: Relationships & Symbols)**

**A. درجات القرابة (Degrees of Relationship):**

* تقسم إلى درجة أولى (First Degree)، درجة ثانية (Second Degree)، ودرجة ثالثة (Third Degree).

**B. الرموز القياسية لشجرة العائلة (Standard Pedigree Symbols):**

1. **المربع (Square):** يمثل الذكر (**Male**).
2. **الدائرة (Circle):** تمثل الأنثى (**Female**).
3. **الرمز المظلل بالكامل (Shaded Symbol):** يمثل الشخص المصاب بالمرض (**Affected individual**).
4. **الرمز نصف المظلل أو المنقط (Half-Shaded/Dot):** يمثل الشخص الحامل للمرض وليس مصاباً به (**Carrier** - للصفات المتنحية أو المرتبطة بالكروموسوم X).
5. **المعين (Diamond):** يمثل شخصاً جنسه غير محدد (**Gender unspecified**).
6. **السهم (Arrow / Proband):** يُشير إلى أول شخص مصاب في العائلة لفت انتباه الأطباء وتم تشخيصه (**Proband**).
7. **الخط المزدوج (Double Line):** يمثل زواج الأقارب (**Consanguinity / Mating between relatives**).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic لخطوات التحليل الكروموسومي (Lab Steps):**
لحفظ ترتيب الخطوات والمواد المستخدمة:
**(زرعناها.. وقفناها بالكولشيسين.. فجرناها بمحلول.. وصبغناها بالجيمسا)**

* **زرعناها:** **Cell Culture**.
* **وقفناها بالكولشيسين:** Cell arrest in Metaphase using **Colchicine**.
* **فجرناها بمحلول:** Nuclei swelling using **Hypotonic solution**.
* **صبغناها بالجيمسا:** Staining using **Giemsa** & Trypsin.

**2. Mnemonic للرموز الجينية (Pedigree Symbols):**
لحل أسئلة الوراثة المرسومة بسرعة:
**(المربع واد، والدائرة بنت، والمظلل عيان، والخطين قرايب)**

* **المربع:** ذكر.
* **الدائرة:** أنثى.
* **المظلل بالكامل:** مريض (Affected).
* **الخطين (Double line):** زواج أقارب (Consanguinity).
`,
  'INTRODUCTION TO GENETICS & BASIC CONCEPTS': `
**أولاً: التعريفات الأساسية في علم الوراثة (Core Definitions)**
لتأسيس فهم صحيح لعلم الوراثة، يجب التفرقة الدقيقة بين هذه المصطلحات:

1. **Genetics (علم الوراثة):** هو العلم الذي يدرس الوراثة والجينات.
2. **Hereditary (التوريث):** عملية انتقال الخصائص والصفات من جيل إلى الجيل الذي يليه.
3. **Genotype (النمط الجيني):** هو التركيب الجيني الخفي للفرد، أو المعلومات المكتوبة والمشفرة داخل الـ DNA.
4. **Phenotype (النمط الظاهري):** هو الانعكاس المادي للجينات؛ أي الخصائص الجسدية أو البيوكيميائية التي يمكن ملاحظتها على الفرد (مثل لون العين أو فصيلة الدم).

---

**ثانياً: هيكل الحمض النووي والجينات (DNA & Gene Structure)**

* **DNA (الحمض النووي الريبوزي منقوص الأكسجين):** هو المادة الوراثية في البشر. يتكون من وحدات بناء تُسمى النيوكليوتيدات (**Nucleotides**)، والتي تتكون بدورها من (قاعدة نيتروجينية، سكر، وفوسفات).
* **Genes (الجينات):** هي الوحدة الأساسية للوراثة. الجين هو مقطع محدد من الـ DNA يقع في مكان ثابت يُسمى (**Locus**) على الكروموسوم.
* **Gene Components (مكونات الجين):**
1. **Exons (الإكسونات):** هي التسلسلات التي تُترجم إلى بروتين (**Protein-coding sequences**).
2. **Introns (الإنترونات):** هي تسلسلات متداخلة لا تُشفر أي بروتين (**Non-coding sequences**).


* **Alleles (الأليلات):** هي النسخ أو المتغيرات المختلفة لنفس الجين (مثلاً: جين لون العين له أليل للون الأزرق وأليل للون البني).

---

**ثالثاً: التعبير الجيني (Gene Expression - From Gene to Protein)**
كيف يتحول الـ DNA المكتوب إلى بروتين يعمل في الجسم؟ يمر بـ 3 مراحل:

1. **DNA Replication (تضاعف الـ DNA):** إنتاج نسختين متطابقتين تماماً من شريط الـ DNA الأصلي.
2. **Transcription (النسخ):** يقوم الـ **mRNA** بنسخ وحمل المعلومات الجينية من الـ DNA الموجود داخل النواة ليخرج بها إلى السيتوبلازم.
3. **Translation (الترجمة):** تقوم الريبوسومات بقراءة تسلسل الـ mRNA، ويقوم الـ **tRNA** بتجميع الأحماض الأمينية المحددة لبناء البروتين.

* **The Genetic Code (الشفرة الجينية):**
* **Codon (الكودون):** هو تسلسل من **3 قواعد نيتروجينية** يُشفر حمضاً أمينياً واحداً محدداً (مثل كودون AUG الذي يُشفر حمض الميثيونين).
* **Stop Codon (كودون التوقف):** تسلسل من 3 قواعد لا يُشفر أي حمض أميني، ولكنه يعطي إشارة بانتهاء عملية الترجمة (مثل UAA).



---

**رابعاً: الكروموسومات وانقسام الخلية (Chromosomes & Cell Division)**

* **Chromosomes:** هي عبارة عن حزم مكثفة من الـ DNA تلتف حول بروتينات تُسمى الهيستونات (**Histones**).
* **أنواع الخلايا في الإنسان:**
* **Somatic cells (الخلايا الجسدية):** تحتوي على 46 كروموسوماً (ثنائية الصيغة الصبغية / **Diploid, 2n**).
* **Germ cells (الخلايا الجنسية/الأمشاج):** تحتوي على 23 كروموسوماً فقط (أحادية الصيغة / **Haploid, n**).


* **Cell Division (انقسام الخلية):**   1. **Mitosis (الانقسام الميتوزي):** انقسام الخلايا الجسدية. يُنتج خليتين ابنتين متطابقتين تماماً، وتحتوي كل منهما على نفس العدد الأصلي من الكروموسومات (46).
2. **Meiosis (الانقسام المايوزي):** لتكوين الأمشاج. خلية واحدة (2n) تنقسم لتُنتج 4 خلايا (n) تحتوي كل منها على نصف عدد الكروموسومات (23).
* **Crossing Over (العبور الجيني):** عملية حيوية تحدث أثناء الانقسام المايوزي، يتم فيها تبادل أجزاء بين الكروماتيدات المتماثلة لضمان التنوع الجيني (**Genetic redistribution**).

---

**خامساً: المصطلحات الإكلينيكية (Clinical Terminology)**
هذه المصطلحات هامة جداً لوصف الأطفال في العيادة:

1. **Dysmorphism (التشوه الشكلي):** ملامح جسدية غير معتادة أو لا تتناسب مع عمر الطفل أو خلفيته العرقية.
2. **Syndrome (المتلازمة):** مجموعة من العيوب أو التشوهات المتعددة التي تظهر معاً، ويُعتقد أنها مرتبطة ببعضها مرضياً بسبب سبب أساسي واحد (آلية باثولوجية واحدة).
3. **Congenital Anomalies (العيوب الخلقية):** أي تشوهات أو عيوب تكون موجودة منذ لحظة الولادة. وتنقسم لدرجتين:
* **Minor Anomaly (عيب ثانوي):** لا يسبب مشاكل صحية أو اجتماعية كبيرة (مثل: وجود خط عرضي واحد في باطن اليد Single palmar crease).
* **Major Anomaly (عيب رئيسي):** عيب له أهمية طبية، أو جراحية، أو تجميلية واضحة، ويزيد من معدلات المراضة أو الوفاة (**Increases morbidity/mortality**).



---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ MCQs:**

**1. Mnemonic للتفرقة بين الـ Exons والـ Introns:**

* **Ex**ons = **Ex**pressed (هي التي تُعبر عن نفسها وتُترجم لبروتين).
* **In**trons = **In** the trash (أجزاء لا تُشفر وتُرمى خارجاً قبل الترجمة).

**2. Mnemonic للتفرقة بين الـ Genotype والـ Phenotype:**

* **G**enotype = **G**enetics (الجينات المكتوبة جوه الخلية).
* **Ph**enotype = **Ph**ysical (الشكل الخارجي اللي بتشوفه بعينك).

**3. Mnemonic للتفرقة بين أنواع الانقسام:**

* **Mi-toes-is:** (Toes = أصابع القدم، يعني خلايا جسدية Somatic). وتنتج خلية زي الأصلية بالظبط (2n).
* **Me-iosis:** (Me = أنا، يعني تكوين الأمشاج لتكوين إنسان جديد Germ cells). وتنتج النص (n).
`,
  'PATTERNS OF SINGLE GENE INHERITANCE': `
**أولاً: الوراثة الجسدية (Autosomal Inheritance)**
هي الأمراض التي تنتقل عبر الكروموسومات الجسدية (من 1 إلى 22)، وبالتالي **يتأثر بها الذكور والإناث بنسب متساوية تماماً**.

**1. الوراثة الجسدية السائدة (Autosomal Dominant):**

* **الميكانيكية:** يكفي وجود **نسخة واحدة فقط** من الجين المعتل (أليل سائد) لظهور المرض.
* **الخصائص الإكلينيكية:**
* يظهر المرض في كل الأجيال ولا يتخطى جيلاً (**Vertical Pattern** / نمط رأسي).
* كل طفل لأب/أم مصابة لديه فرصة **50%** لوراثة المرض.


* **أمثلة:** التقزم النضروفي (**Achondroplasia**)، مرض هنتنغتون (**Huntington disease**)، والورم الليفي العصبي (**Neurofibromatosis type 1**).

**2. الوراثة الجسدية المتنحية (Autosomal Recessive):**

* **الميكانيكية:** يجب وجود **نسختين** من الجين المعتل لظهور المرض (نسخة من الأب ونسخة من الأم).
* **الخصائص الإكلينيكية:**
* الآباء غالباً أصحاء ظاهرياً ولكنهم حاملون للمرض (**Carriers**).
* قد يختفي المرض في جيل ويظهر في الجيل الذي يليه (**Horizontal Pattern** / نمط أفقي).
* نسبة احتمال تكرار المرض في الحمل القادم لنفس الأبوين الحاملين للجين هي **25%**.


* **أمثلة:** التليف الكيسي (**Cystic Fibrosis**)، الفينيل كيتون يوريا (**PKU**)، وأنيميا الخلايا المنجلية (**Sickle-cell anemia**).

---

**ثانياً: الوراثة المرتبطة بالكروموسوم الجنسي (X-Linked Inheritance)**
هنا يقع الجين المعتل على الكروموسوم الجنسي X، مما يغير نسب الإصابة بين الذكور (XY) والإناث (XX).

**1. مرتبطة بالـ X المتنحية (X-Linked Recessive):**

* **الخصائص:** الذكور أكثر عُرضة للإصابة بكثير من الإناث (لأن الذكر يمتلك X واحدة، فإذا كانت معتلة ظهر المرض، بينما الأنثى تحتاج لنسختين أو تحمل المرض دون أعراض).
* 🚨 **قاعدة التوريث:** الأب المصاب ينقل الجين **لكل بناته** (يصبحن حاملات للمرض Carriers) ولا ينقله **أبداً لأي من أبنائه الذكور** (لأنه يعطيهم الـ Y).
* **أمثلة:** الهيموفيليا (**Hemophilia**)، أنيميا الفول (**G6PD deficiency**)، وحثل دوشين العضلي (**DMD**).

**2. مرتبطة بالـ X السائدة (X-Linked Dominant):**

* **الخصائص:** تظهر الأعراض في الإناث حتى مع وجود كروموسوم X واحد سليم.
* 🚨 **قاعدة التوريث:** الأب المصاب يورث المرض **لجميع بناته (100% affected daughters)** ولا يورثه لأي من أبنائه الذكور. بينما الأم المصابة (Heterozygous) تورثه لـ 50% من أبنائها (ذكوراً وإناثاً).
* **أمثلة:** الكساح المقاوم لفيتامين د (**Hypophosphatemic rickets**)، ومتلازمة كروموسوم X الهش (**Fragile X Syndrome**).

---

**ثالثاً: أنماط وراثة أخرى هامة (Other Modes of Inheritance)**

1. **الوراثة المرتبطة بالـ Y (Y-Linked Inheritance):**
* تصيب **الذكور فقط**. الأب المصاب يورث الصفة لـ **جميع أبنائه الذكور** ولا ينقلها لبناته (مثل: فرط إشعار صيوان الأذن Hypertrichosis Pinnae).


2. **الوراثة الميتوكوندريا / الأمومية (Maternal / Mitochondrial):**
* الطفرة في الـ DNA الخاص بالميتوكوندريا.
* 🚨 **قاعدة التوريث:** تنتقل العدوى **من الأم فقط** إلى **جميع أبنائها** (ذكوراً وإناثاً). الأب المصاب لا يورث المرض لأحد.


3. **السيادة المشتركة (Co-Dominant Inheritance):**
* يعبر الأليلان المختلفان عن نفسيهما بالتساوي (مثل: فصيلة الدم ABO).


4. **الوراثة متعددة العوامل (Multifactorial):**
* تفاعل بين جينات متعددة وعوامل بيئية (مثل: الشفة المشقوقة Cleft lip، السكري، وعيوب الأنبوب العصبي).


5. **التأثر وتحديد الجنس (Sex-Limited & Sex-Influenced):**
* **Sex-Limited (محدودة بالجنس):** تظهر في جنس واحد فقط بسبب اختلافات تشريحية (مثل عيوب الخصية).
* **Sex-Influenced (متأثرة بالجنس):** تظهر في كلا الجنسين ولكن يختلف التعبير عنها بسبب الهرمونات (مثل الصلع المبكر، يكون سائداً في الذكور ومتنحياً في الإناث).



---

💡 **Mnemonics لتسهيل التذكر في أسئلة شجرة العائلة (Pedigree MCQs):**

**1. Mnemonic للتفرقة بين الـ Dominant والـ Recessive:**

* **Dominant (السائد):** بالطول دايماً موجود (**Vertical Pattern** / لا يتخطى أجيالاً).
* **Recessive (المتنحي):** بالعرض ومستخبي (**Horizontal Pattern** / بيظهر فجأة من أبوين Carriers).

**2. Mnemonic للوراثة المرتبطة بالـ X (قاعدة الأب المصاب):**
لحفظ انتقال المرض من الأب في الـ X-Linked (بنوعيه السائد والمتنحي):
**(الأب بيدي للولد Y.. وبيدي للبنت X)**

* إذن، الأب المصاب بمرض على الـ X **مستحيل** ينقله لابنه الذكر.
* وكل بناته هياخدوا منه الـ X المعتلة (لو المرض Recessive هيبقوا Carriers، ولو المرض Dominant هيبقوا مرضى 100%).

**3. Mnemonic للوراثة الميتوكوندريا (Mitochondrial):**
**(الميتوكوندريا بتاعت الأم بس.. بتديها لكل عيالها)**
الأم تورث المرض لـ 100% من الأطفال، والأب لا يورثه لأحد.
`,
  'PREVENTIVE GENETICS': `
**أولاً: مستويات التدخل الوراثي الوقائي (Levels of Genetic Intervention)**

1. **Primary Intervention (تدخل أولي):** يحدث **قبل** وقوع المرض (**BEFORE** the condition occurs). يشمل: الاستشارة الوراثية والتشخيص قبل الولادة لمنع حدوث المشكلة من الأساس.
2. **Secondary Intervention (تدخل ثانوي):** يحدث **مباشرة بعد الولادة** (**SOON AFTER BIRTH**). يهدف للتشخيص والعلاج المبكر لمنع تطور المرض، مثل: المسح الشامل لحديثي الولادة (Neonatal Screening).
3. **Tertiary Intervention (تدخل من الدرجة الثالثة):** يهدف لتقليل الآثار طويلة المدى للمرض (**LONG-TERM EFFECT REDUCTION**). يشمل: الاكتشاف المبكر للمضاعفات، وإعادة التأهيل.

---

**ثانياً: الاستشارة الوراثية (Genetic Counseling)**

* **التعريف:** خدمة صحية تقدم المعلومات والدعم للأشخاص المعرضين لخطر الإصابة بأمراض وراثية.
* **دواعي الاستشارة (Indications):**
1. وجود تاريخ شخصي أو عائلي لعيوب خلقية أو أمراض كروموسومية.
2. تقدم عمر الأم (\$\ge\$ 35 عاماً) أو وجود تاريخ للإجهاض المتكرر.
3. زواج الأقارب (**Consanguinity**).


* **الأخلاقيات (Ethics):** يجب أن يتبع الطبيب نهجاً غير توجيهي (**Nondirective approach**)، بحيث يعطي المعلومات بموضوعية ويترك القرار للأسرة، مع احترام معتقداتهم والحفاظ التام على خصوصيتهم.

---

**ثالثاً: التشخيص قبل الولادة (Prenatal Diagnosis)**

* **الأهمية:** اكتشاف التغيرات الجينية في الجنين قبل الولادة للتخطيط السليم للتعامل الطبي.
* **الفحوصات غير التداخلية الآمنة (Non-Invasive Screening):**
1. **العلامات البيوكيميائية:** مثل الاختبار الثلاثي (hCG, AFP, uE3) والاختبار الرباعي في دم الأم.
2. **الموجات فوق الصوتية (Ultrasound):** لاكتشاف التغيرات الهيكلية مثل سمك طية الرقبة (**Nuchal fold thickness**) وعيوب الأطراف.
3. **خلايا الجنين في دورة الأم:** فحص دم الأم للكشف عن أمراض الجين الواحد في الجنين مثل أنيميا الخلايا المنجلية.


* **الفحوصات التداخلية (Invasive Screening):**
1. **فحص الزغابات المشيمية (CVS):** يُجرى مبكراً بين الأسبوع 10-11 من الحمل.
2. **بزل السائل الأمنيوسي (Amniocentesis):** يُجرى لاحقاً بين الأسبوع 16-20 (يحمل خطراً بسيطاً للإجهاض).
3. **تنظير الجنين وأخذ عينة دم (Fetoscopy & Fetal Blood Sampling):** للوصول المباشر لوريد الحبل السري للتقييم السريع.



---

**رابعاً: المسح الشامل لحديثي الولادة (Newborn Screening - NS)**

* **الهدف:** برنامج صحة عامة إجباري لاكتشاف الأمراض الوراثية فوراً بعد الولادة **قبل** ظهور الأعراض لتجنب التخلف العقلي أو الوفاة.
* **الأمراض الأساسية التي يتم فحصها (Screened Disorders):**
1. **الغدد الصماء (Endocrine):** قصور الغدة الدرقية الخلقي والتضخم الخلقي للغدة الكظرية.
2. **أمراض التمثيل الغذائي (IEM):** الفينيل كيتون يوريا (**PKU**)، الجالاكتوزيميا، والتيروزينيميا.
3. **أمراض الدم (Blood Disorders):** أنيميا الخلايا المنجلية وثلاسيميا بيتا.


* **طريقة جمع العينة (Sample Collection):**
* تُؤخذ عن طريق وخز كعب قدم الطفل (**Heel Puncture**) من السطح الجانبي أو الوسطي، وذلك في الفترة من **24 ساعة إلى 7 أيام** من الولادة.
* يُجمع الدم على ورق ترشيح خاص (**Filter Paper**) لأنه يحافظ على استقرار العينة ويسهل نقله للمعمل.



---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic لمستويات التدخل الوقائي (Intervention Levels):**
**(الأول بيمنع.. والتاني بيلحق.. والتالت بيأهل)**

* **الأول بيمنع:** Primary (قبل الولادة).
* **التاني بيلحق:** Secondary (تشخيص مبكر بعد الولادة فوراً).
* **التالت بيأهل:** Tertiary (تقليل مضاعفات وإعادة تأهيل).

**2. Mnemonic لترتيب الفحوصات التداخلية حسب وقت إجرائها (Invasive timing):**
حرف الـ **C** يأتي قبل حرف الـ **A** في الأبجدية:

* **C**VS ⬅️ يُجرى مبكراً (10-11 أسبوع).
* **A**mniocentesis ⬅️ يُجرى متأخراً (16-20 أسبوع).

**3. Mnemonic لأمراض المسح الشامل لحديثي الولادة (Newborn Screening):**
تذكر هذه الجملة لربط فئات الأمراض:
**(غدد وميتابوليزم ودم.. عشان نحمي المخ والجسم)**

* **غدد:** Hypothyroidism & Adrenal Hyperplasia.
* **ميتابوليزم:** PKU & Galactosemia.
* **دم:** Sickle cell & Thalassemia.
`,
  'Ascariasis  Roundworms': `
**أولاً: التعريف وطرق الانتقال (Introduction & Transmission)**

* **التعريف:** الإسكارس (**Ascaris lumbricoides**) هي أشهر الديدان المعوية الطفيلية التي تصيب الإنسان على مستوى العالم، وتتبع فصيلة الديدان الأسطوانية (**Nematodes/Roundworms**).
* **الطور المُعدي (Infective Stage):** البويضة الناضجة التي تحتوي على اليرقة (**Infective Egg in soil**).
* **طرق الانتقال:** تنتقل عن طريق الفم (**Hand-to-Mouth Route**) نتيجة تناول أطعمة أو خضروات طازجة ملوثة بالتربة أو الأسمدة العضوية التي تحتوي على البويضات، أو عن طريق الذباب.

**ثانياً: الصورة الإكلينيكية والمضاعفات (Clinical Manifestations)**
تنقسم الأعراض إلى أعراض ناتجة عن هجرة الدودة، وأعراض ناتجة عن استقرارها في الأمعاء:

**A. Migration Symptoms (أعراض الهجرة - Hallmark):**

1. **Larval Migration (هجرة اليرقات):** تمر اليرقات عبر الرئتين وتسبب التهاباً رئوياً يُعرف بمتلازمة تشبه لوفلر (**Loeffler-like syndrome**)، وتتميز بكحة، تزييق في الصدر، وارتفاع في خلايا الإيزينوفيل.
2. **Adult Worm Migration (هجرة الدودة البالغة):** قد تهاجر الدودة البالغة من مكانها الطبيعي لتسد قنوات أخرى، مسببة انسداداً في القناة المرارية (**Biliary obstruction**) أو التهاباً في الزائدة الدودية (**Appendicitis**).

**B. Gastrointestinal Symptoms (الأعراض المعوية):**

1. **Abdominal Pain:** مغص وانتفاخ وشعور عام بعدم الارتياح.
2. **Malabsorption (سوء الامتصاص):** الديدان تستهلك غذاء الطفل وتمنع امتصاص العناصر الهامة، مما يسبب إسهالاً دهنياً (**Steatorrhea**) ونقصاً شديداً في فيتامين أ (**Diminished Vitamin A**)، مما يؤثر سلباً على طول ونمو الطفل.
3. 🚨 **Intestinal Obstruction (الانسداد المعوي):** تتشابك الديدان البالغة وتتكتل معاً لتسد تجويف الأمعاء بالكامل، وهي حالة جراحية طارئة.

**ثالثاً: التشخيص والعلاج (Diagnosis & Treatment)**

* **Diagnosis (التشخيص):** يتم عن طريق الفحص الميكروسكوبي المباشر لعينة البراز للبحث عن بويضات الطفيل المميزة (**Identify parasite's OVA**).
* **Treatment Protocol (خطة العلاج):**
* **الأدوية:** ميبيندازول (**Mebendazole / Vermox**) أو فلوبيندازول بجرعة 100 مجم يومياً.
* **المدة:** يجب أن يستمر العلاج ككورس قياسي لمدة **3 أيام متصلة** (**Standard 3-day course**).
* *ملاحظة:* هذا العلاج يصلح للمرضى من جميع الأعمار.



**رابعاً: الوقاية (Prevention)**
تعتمد الوقاية بشكل كامل على الممارسات الصحية الصارمة (**Robust Sanitary Practices**):

1. التخلص الصحي من مياه الصرف الصحي.
2. معالجة الفضلات البشرية جيداً في منشآت التسميد قبل استخدامها كسماد زراعي.
3. الغسيل الجيد جداً للخضروات الطازجة (**Thorough Vegetable Washing**).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic لأعراض الإسكارس ومضاعفاتها:**
لربط ما تفعله الدودة في جسم الطفل:
**(يرقة بتكح في الرئة.. ودودة بتسد الأمعاء والزايدة، وتسرق الفيتامين والدهون)**

* **يرقة بتكح:** **Loeffler-like syndrome** (Larval migration).
* **دودة بتسد:** **Intestinal Obstruction, Biliary obstruction, Appendicitis**.
* **تسرق الفيتامين والدهون:** **Malabsorption (Steatorrhea & Low Vit A)**.

**2. Mnemonic للتشخيص والعلاج:**
**(شخصها بالبويضة.. وموتها في 3 أيام واغسل الخضار)**

* **شخصها بالبويضة:** **Direct smear for OVA**.
* **موتها في 3 أيام:** **Mebendazole for 3 days**.
* **اغسل الخضار:** **Thorough vegetable washing** (أهم خطوة وقائية).
`,
  'Bacterial Infections(table)': `
**أولاً: حمى التيفود (Typhoid Fever / Enterica)**

* **السبب والعدوى:** تحدث بسبب بكتيريا السالمونيلا تيفي (**Salmonella typhi**)، وتنتقل عن طريق الطريق الفموي-البرازي (**Feco-oral route**) بتناول طعام أو ماء ملوث.
* **الأعراض (Symptoms):**
* **في الأسبوع الأول:** بداية تدريجية خبيثة (**Insidious onset**)، حمى عالية، صداع، فقدان للشهية، وطفح جلدي مميز على البطن والصدر يُسمى بقع الورد (**"Rose Spots"**). كما يظهر اللسان مغطى بطبقة بيضاء (**Coated tongue**)، ويحدث تضخم بسيط ومطاطي في الطحال (**Soft splenomegaly**).
* **فيما بعد:** استمرار الحرارة لفترات طويلة مع إعياء عام.


* **الفحوصات بترتيب الأسابيع (Investigations):**
1. **الأسبوع الأول:** مزرعة الدم هي الأدق (**Positive Blood cultures**).
2. **بعد الأسبوع الأول:** اختبار فيدال (**Widal test**).
3. **بعد الأسبوع الثاني:** مزارع البراز والبول (**Stool/Urine cultures**).


* **العلاج:** المضاد الحيوي المفضل والنوعي هو السيفترياكسون (**Ceftriaxone**).

---

**ثانياً: الحمى المتموجة / حمى مالطا (Brucellosis)**

* **السبب والمصدر:** بكتيريا البروسيلا (**Brucella species**)، وتنتقل غالباً عبر شرب الحليب غير المبستر من الأبقار أو الماعز المصابة.
* **الأعراض:** حرارة متقطعة ومتموجة تستمر لفترات طويلة (أسبوعين حرارة وأسبوعين بدون)، يصاحبها تعرق، نزيف من الأنف (**Nosebleeds**)، فقدان وزن، والتهاب في المفاصل. بالفحص نجد تضخماً في الغدد الليمفاوية والكبد والطحال.
* **العلاج (Dual-antimicrobial approach):** يتطلب العلاج دوائين معاً لمنع الانتكاس:
* **أقل من 9 سنوات:** Streptomycin + **Co-trimoxazole**.
* **أكبر من 9 سنوات:** Streptomycin + **Tetracycline**.



---

**ثالثاً: الحمى القرمزية (Scarlet Fever)** * **السبب:** بكتيريا السبحية من المجموعة أ (**Group A Beta-hemolytic Streptococci**) والتي تفرز سماً يحمر الجلد (**Erythrogenic toxin**).

* **الأعراض والعلامات المميزة (High-Yield Clinical Signs):**
1. **التهاب الحلق:** بداية حادة بحمى عالية والتهاب صديدي شديد في اللوزتين.
2. **الطفح الجلدي:** طفح أحمر فاتح دقيق يختفي عند الضغط عليه (**Blanches on pressure**).
3. **علامات الوجه:** احمرار شديد في الوجنتين مع شحوب واضح ومميز حول الفم (**Distinct circum-oral pallor**).
4. **اللسان:** يبدأ كلسان الفراولة البيضاء، ثم يتقشر ليصبح لسان الفراولة الحمراء (**"White" then "Red Strawberry" tongue**).
5. **التقشر:** تقشر الجلد في اليدين والقدمين في نهاية المرض (**Skin desquamation**).


* **المضاعفات:** خطورتها تكمن في مضاعفاتها المناعية المتأخرة مثل الحمى الروماتيزمية على القلب (**Rheumatic fever**) والتهاب كبيبات الكلى الحاد (**Acute glomerulonephritis**).
* **العلاج:** البنسلين (**Penicillin**).

---

**رابعاً: السعال الديكي (Pertussis / Whooping Cough)**

* **السبب:** بكتيريا البورديتيلا (**Bordetella pertussis**)، وهي شديدة العدوى وتنتقل بالرذاذ.
* **مراحل المرض الإكلينيكية (Clinical Stages):**
1. **Catarrhal Stage (المرحلة النزلية 1-2 أسبوع):** تشبه نزلة البرد العادية، وهي **المرحلة الأكثر قدرة على نقل العدوى** (**Highly infectious**).
2. **Paroxysmal Stage (المرحلة الانتيابية 2-4 أسابيع):** نوبات كحة عنيفة ومتتالية تنتهي بشهقة عالية الصوت ومميزة (**Classic "Whoop"**)، وغالباً ما يتبعها قيء.
3. **Convalescent Stage (مرحلة التعافي 1-2 أسبوع):** تقل الأعراض تدريجياً.


* **العلاج والوقاية:** الإريثرومايسين لمدة 14 يوماً (**Erythromycin 14 days**)، والوقاية بالتطعيم الإجباري (**DPT vaccine**).

---

**خامساً: الالتهاب السحائي البكتيري (Acute Bacterial Meningitis)**

* **الأعراض:** حمى مفاجئة، علامات ارتفاع ضغط الدماغ (قيء مندفع، بروز اليافوخ)، وعلامات تهيج الأغشية السحائية (تصلب الرقبة، إيجابية علامات كيرنيج وبرودزينسكي).
* **العلاج (طوارئ طبية):**
* الرضع < 6 شهور: **Ampicillin + Gentamicin IV**
* الأطفال > 6 شهور: **Ampicillin + Chloramphenicol IV**



---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic لترتيب تحاليل التيفود (Typhoid Investigations):**
تذكر حروف **B-W-S** بالترتيب الزمني:

* الأسبوع الأول: **B**lood culture
* الأسبوع الثاني: **W**idal test
* الأسبوع الثالث: **S**tool/Urine cultures

**2. Mnemonic لعلامات الحمى القرمزية (Scarlet Fever Signs):**
لربط صورة الطفل في العيادة:
**(لوز بصديد.. ولسان فراولة، ووشه أحمر بس شاحب حوالين بقه.. وإيده بتقشر)**

* **لوز بصديد:** Purulent tonsillitis.
* **لسان فراولة:** White/Red Strawberry tongue.
* **وشه أحمر بس شاحب حوالين بقه:** Flushed cheeks & Circum-oral pallor.
* **إيده بتقشر:** Skin desquamation.

**3. Mnemonic لمراحل السعال الديكي (Pertussis Stages):**
**(رشح بيعدي.. كحة وشهقة بترجّع.. وبعدين بيخف)**

* **رشح بيعدي:** Catarrhal stage (URI-like & highly infectious).
* **كحة وشهقة بترجّع:** Paroxysmal stage (Forceful coughing, Whoop, Vomiting).
* **وبعدين بيخف:** Convalescent stage.
`,
  'Brucellosis': `
**أولاً: التعريف وطرق الانتقال (Definition & Transmission)**

* **التعريف:** مرض بكتيري تسببه بكتيريا البروسيلا (**Brucella species**)، وهي بكتيريا عضوية صغيرة سالبة الجرام (**Gram-negative bacilli**).
* **العوائل الأساسية (Primary Hosts):** الأبقار والماعز.
* **طرق الانتقال للإنسان (Transmission):** عن طريق تناول أو شرب الحليب الملوث غير المبستر أو منتجاته:
* حليب الأبقار ينقل نوع (**B. abortus**).
* حليب الماعز ينقل نوع (**B. melitensis**).


* **فترة الحضانة (Incubation):** من أسبوع إلى 4 أسابيع، وقد تمتد لتصل إلى 6 أشهر.

**ثانياً: الصورة الإكلينيكية (Clinical Manifestations)**

* **الأعراض (Symptoms):**
1. **بداية خبيثة ومتدرجة (Insidious onset):** حمى، فقدان شهية (**Anorexia**)، صداع، وألم في العضلات (**Myalgia**).
2. **الحمى المتموجة (Undulant Fever):** نمط مميز جداً من الحرارة المتقطعة؛ ترتفع لعدة أسابيع ثم تنخفض وتختفي، ثم تعود للارتفاع مجدداً.
3. **أعراض مصاحبة:** تعرق ليلي، نزيف من الأنف (**Epistaxis**)، كحة، وفقدان ملحوظ في الوزن.


* **الفحص الموضعي (Physical Exam):**
1. تضخم في الغدد الليمفاوية بالرقبة والإبط (**Cervical/axillary lymphadenopathy**).
2. تضخم في الكبد والطحال (**Hepato-splenomegaly**).
3. التهاب في المفاصل (**Arthritis**).



**ثالثاً: الفحوصات والمضاعفات (Investigations & Complications)**

* **الفحوصات (Investigations):**
1. **صورة الدم (CBC):** تُظهر أنيميا، نقصاً في كرات الدم البيضاء (**Leukopenia**)، وزيادة في الخلايا الليمفاوية (**Lymphocytosis**).
2. **مزرعة الدم (Blood Culture):** تكون إيجابية ومؤكدة في الأسبوع الأول من المرض.
3. **اختبار التلزن / التلازن (Agglutination test):** يصبح إيجابياً بعد الأسبوع الثاني.


* **المضاعفات (Complications):**
1. **مضاعفات شديدة:** التهاب العظام والنقي (**Osteomyelitis**)، التهاب المفاصل الصديدي (**Septic arthritis**)، التهاب عضلة القلب (**Myocarditis**)، والتهابات المخ والأعصاب (**Encephalitis/Myelitis**).
2. **خراجات موضعية (Localized abscesses):** تتكون في الأعضاء مثل العظام، الكبد، الطحال، أو الرئتين.



**رابعاً: خطة العلاج والوقاية (Treatment Protocol & Prevention)**

* **القاعدة العلاجية (Dual-antibiotic approach):** يتطلب المرض علاجاً مزدوجاً بمضادين حيويين لفترة طويلة لضمان القضاء على البكتيريا ومنع الانتكاس، ويتحدد الدواء حسب العمر:
1. **الأطفال أقل من 9 سنوات:** حقن ستربتومايسين عضل + كو-ترايموكسازول بالفم (**Streptomycin IM + Co-Trimoxazole Oral**) لمدة 3 أسابيع.
2. **الأطفال أكبر من 9 سنوات:** حقن ستربتومايسين عضل + تتراسيكلين بالفم (**Streptomycin IM + Tetracycline Oral**) لمدة 4 إلى 6 أسابيع.


* **العلاج الجراحي والداعم:**
* تصريف جراحي للخراجات إن وُجدت (**Surgical drainage of abscesses**).
* راحة تامة في السرير أثناء فترة الحرارة، ومسكنات للألم.


* **الوقاية (Prevention):** البسترة الإجبارية للحليب (**Mandatory milk pasteurization**)، تطعيم الحيوانات، والفحص الدوري للماشية.

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic لانتقال وأعراض المرض:**
لربط قصة مريض البروسيلا في ورقة الأسئلة:
**(شرب لبن مش مبستر.. جاتله حمى بتعلى وتوطى بالأسابيع.. ومفصلة واجعه وطحاله كبير)**

* **لبن مش مبستر:** Ingestion of contaminated raw milk.
* **حمى بتعلى وتوطى:** Intermittent **Undulant fever**.
* **مفصلة وطحاله:** Arthritis & **Hepato-splenomegaly**.

**2. Mnemonic لترتيب التحاليل زمنياً:**
تذكر الحرفين **B** ثم **A**:

* الأسبوع الأول: **B**lood culture is positive.
* الأسبوع الثاني: **A**gglutination test is positive.

**3. Mnemonic لخطة العلاج حسب العمر:**
القاعدة الثابتة هي حقن الـ (Streptomycin)، ويتغير الدواء الفموي لتجنب تدمير أسنان الأطفال بالتتراسيكلين:
**(تحت 9 إدي سبترين.. وفوق 9 إدي تتراسيكلين)**

* **تحت 9 سنين:** **Co-trimoxazole** (Septin).
* **فوق 9 سنين:** **Tetracycline**.
`,
  'Chicken Pox (Varicella)': `
**أولاً: المسبب وطرق العدوى (Causative Organism & Transmission)**

* **المسبب (Causative Organism):** فيروس الحماق النطاقي (**Varicella-Zoster Virus - VZV**)، وهو نوع من عائلة فيروسات الهربس يسبب العدوى الأولية (الجديري المائي).
* **طرق الانتقال (Mode of Infection):** المرض شديد العدوى (**Highly Contagious**)، وينتقل عبر:
1. الرذاذ المحمول بالهواء (**Airborne droplets**) الناتج عن السعال أو العطس.
2. التلامس المباشر (**Direct contact**) مع السائل الموجود داخل البثور.



**ثانياً: فترة العدوى (Infectivity Period)**

* تبدأ خطورة المرض في أنه يكون مُعدياً من **يوم إلى يومين قبل ظهور الطفح الجلدي** (-2 days before rash).
* تستمر فترة العدوى حتى تجف **جميع** الحويصلات وتتحول إلى قشور (**All lesions crust over**).
* 🚨 **ملاحظة هامة:** القشور الجافة في حد ذاتها غير معدية (**Crusts are NOT infectious**).

**ثالثاً: الصورة الإكلينيكية (Clinical Picture)**

* **الأعراض الأولية:** حمى، إعياء عام، صداع، وحكة شديدة (**Severe itching**).
* **خصائص الطفح الجلدي (Pleomorphic Rash):** العلامة المميزة والأهم للجديري المائي هي أن الطفح "متعدد الأشكال" (**Pleomorphic**)، بمعنى أنك تجد جميع مراحل الطفح الجلدي موجودة في نفس الوقت على جسم الطفل. يتطور الطفح بالترتيب التالي:
1. بقع حمراء مسطحة (**Macules**).
2. حبيبات حمراء بارزة (**Papules**).
3. حويصلات ممتلئة بسائل شفاف (**Vesicles**).
4. قشور جافة (**Crusts**).



**رابعاً: الوقاية وخطة العلاج (Prevention & Treatment)**

* **الوقاية (Vaccination):** يتم إعطاء لقاح الجديري المائي (**Varicella Vaccine**) على جرعتين، وهو فعال جداً للأطفال والبالغين.
* **العلاج والتعامل مع الأعراض (Relief & Management):** العلاج تحفظي يعتمد على تخفيف الأعراض ومنع المضاعفات:
1. إعطاء خافض للحرارة 🚨 (**يُمنع منعاً باتاً إعطاء الأسبرين NO ASPIRIN** لتجنب متلازمة راي القاتلة).
2. استخدام لوشن الكالامين (**Calamine lotion**)، والكمادات الباردة، ومضادات الهيستامين لتخفيف الحكة المزعجة.
3. قص أظافر الطفل وتقصيرها (**Keep nails short**) لمنعه من حك الجلد، وتجنب حدوث عدوى بكتيرية ثانوية في البثور.



---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic لشكل الطفح الجلدي (Pleomorphic Rash):**
تذكر أن الجديري بيعمل "كوكتيل" على الجلد:
**(ماكيول وبابيول وفيزيكل وقشرة.. كله موجود في نفس الفترة)**
هذا التنوع في نفس الوقت هو ما يميز الـ Pleomorphic rash.

**2. Mnemonic لفترة العدوى (Infectivity):**
متى يُعزل الطفل ومتى يرجع المدرسة؟
**(بيعدي من قبل ما يظهر.. وبيبطل يعدي لما كله يقشر)**

* **من قبل ما يظهر:** معدي قبل ظهور الطفح بـ 1-2 يوم.
* **لما كله يقشر:** تنتهي العدوى تماماً عندما تتحول كل البثور إلى Crusts.

**3. Mnemonic لتعليمات العلاج (Management):**
لإعطاء نصائح سريعة للأم في العيادة:
**(قص ضوافره وادهنه كالامين.. وإياك تقرب للأسبرين)**

* **قص ضوافره:** Keep nails short (to prevent secondary infection).
* **اِدهنه كالامين:** Calamine lotion (for itching).
* **إياك تقرب للأسبرين:** NO ASPIRIN.
`,
  'Enterobiasis  Pinworm': `
**أولاً: المسبب والتعريف (Cause & Definition)**

* **المسبب:** عدوى طفيلية معوية تتبع فصيلة الديدان الأسطوانية، وتحدث بسبب دودة تُسمى (**Enterobius vermicularis**)، والمعروفة إكلينيكياً بالدودة الدبوسية.

**ثانياً: الصورة الإكلينيكية (Clinical Manifestations)**
**Enumerate the clinical signs of Enterobiasis:**

1. **Nocturnal Anal Pruritus (حكة الشرج الليلية):** العرض الأساسي والأشهر؛ حكة شديدة حول منطقة الشرج تزداد ليلاً عندما تخرج الدودة لوضع بويضاتها. ينتج عن هذه الحكة أعراض ثانوية تشمل: الأرق (**Sleeplessness**)، العصبية الملحوظة (**Irritability**)، والجز على الأسنان أثناء النوم (**Teeth Grinding**).
2. **Nocturnal Enuresis (التبول اللاإرادي الليلي):** قد يظهر بشكل مفاجئ في الأطفال المصابين.
3. **Vulvo-vaginitis (التهاب المهبل والفرج):** الإناث عرضة بشكل خاص لهذه المضاعفة بسبب انتقال الديدان للمنطقة التناسلية.
4. **Rare but Serious - Ectopic Migration (الهجرة غير الطبيعية):** نادراً ما تهاجر الدودة خارج الأمعاء لتسد قنوات أخرى، مما قد يسبب التهاب الزائدة الدودية الحاد (**Acute Appendicitis**)، أو التهاب المثانة وقنوات فالوب.

**ثالثاً: الفحوصات والتشخيص (Diagnosis)**

* **التشخيص المؤكد (Definitive Diagnosis):** يعتمد حصرياً على إيجاد بويضات الطفيل.
* **طريقة الفحص:** يتم التشخيص عن طريق الفحص الميكروسكوبي المباشر لعينة تُؤخذ من الجلد المحيط بفتحة الشرج (**Peri-anal skin**)، وغالباً ما تُستخدم طريقة الشريط اللاصق الشفاف (Tape test) لالتقاط البويضات في الصباح الباكر.

**رابعاً: خطة العلاج والوقاية (Treatment & Prevention)**

* **العلاج الدوائي (Pharmacological Therapy):**
* إعطاء جرعة واحدة (100 مجم) من الأدوية المضادة للديدان مثل الميبيندازول (**Mebendazole / Vermox**) أو الفلوبيندازول.
* *ملاحظة إكلينيكية:* هذه الجرعة موحدة وتُعطى للمرضى من جميع الأعمار.
* 🚨 **Repetition (التكرار الحتمي):** لضمان القضاء التام على الديدان التي ستفقس من البويضات المتبقية، يجب **إعادة الجرعة بعد أسبوعين إلى 3 أسابيع**.


* **العلاج الموضعي (Topical Treatment):** دهان مرهم راسب أبيض (**White precipitate ointment**) حول الشرج مباشرة قبل النوم لقتل الديدان المهاجرة وتخفيف الحكة.
* **السيطرة على العدوى والوقاية (Family & Infection Control):**
1. 🚨 **علاج العائلة بالكامل:** يجب علاج كل الأفراد المصابين في العائلة في **نفس الوقت بالضبط** لمنع انتقال العدوى بينهم مراراً وتكراراً.
2. **النظافة الشخصية (Strict Hygienic Measures):** الخطوة الوقائية الأهم هي قص الأظافر وتقصيرها باستمرار (**Keep fingernails cut short**) لمنع تجمع البويضات تحتها أثناء الحكة، وبالتالي منع ابتلاعها مرة أخرى (العدوى الذاتية).



---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic لأعراض الدودة الدبوسية (Clinical Signs):**
لربط شكوى الأم في العيادة بمرض الدبوسية:
**(بيهرش بالليل وبيجز على سنانه.. وبيعمل حمام على نفسه)**

* **بيهرش بالليل:** **Nocturnal Anal Pruritus**.
* **بيجز على سنانه:** **Teeth Grinding** (secondary to itching).
* **بيعمل حمام على نفسه:** **Nocturnal Enuresis**.

**2. Mnemonic لقواعد العلاج (Treatment Rules):**
لضمان عدم رجوع العدوى للطفل، تذكر قاعدة الـ 3 (ع):
**(عالج العيلة كلها.. وعيد الجرعة بعد أسبوعين.. وعقّم وقص الضوافر)**

* **عالج العيلة كلها:** Treat **ALL family members** simultaneously.
* **عيد الجرعة:** **REPEAT medication** after 2-3 weeks.
* **عقّم وقص الضوافر:** Strict hygiene & **keep fingernails short**.
`,
  'Measles': `
**أولاً: طرق انتقال العدوى (Mode of Infection)**

* **الانتقال:** ينتقل الفيروس عن طريق الرذاذ التنفسي (**Respiratory droplets**) الناتج عن السعال والعطس، أو عبر التلامس المباشر مع إفرازات الأنف والحلق.
* **العدوى:** المرض شديد العدوى (**Highly contagious**)، حيث يمكن للفيروس البقاء حياً وعالقاً في الهواء أو على الأسطح لفترة.

**ثانياً: المرحلة البادرية والأعراض الأولية (Prodromal Stage)**
تسبق هذه المرحلة ظهور الطفح الجلدي، وتتميز بـ:

1. حمى شديدة (**High fever**) تستمر من 3 إلى 5 أيام.
2. الثلاثية الكلاسيكية الشهيرة (**The 3 Cs**):
* **C**ough (سعال).
* **C**oryza (زكام وسيلان بالأنف).
* **C**onjunctivitis (التهاب الملتحمة، وتظهر كعين حمراء ومدمعة).



**ثالثاً: الصورة الإكلينيكية والطفح الجلدي (Clinical Picture)**

1. **العلامة التشخيصية المؤكدة (Pathognomonic Sign):** ظهور بقع كوبليك (**Koplik Spots**)، وهي بقع بيضاء صغيرة تظهر على الغشاء المخاطي المبطن للفم من الداخل.
2. **تطور الطفح الجلدي (Rash Progression):** * يظهر كطفح بقعي حطاطي أحمر اللون (**Erythematous maculopapular rash**).
* **التسلسل الزمني:** يبدأ أولاً في الوجه، ثم يزحف وينتشر نزولاً إلى الرقبة، الجذع، وأخيراً الأطراف.



**رابعاً: الفحوصات الطبية (Investigations)**

* التأكيد المعملي يتم عبر الفحوصات المصلية (**Serology**) للكشف عن الأجسام المضادة الخاصة بالفيروس (IgM & IgG).
* اختبار تفاعل البوليميراز المتسلسل (**PCR testing**) باستخدام مسحات تنفسية.

**خامساً: المضاعفات (Complications)**

1. **مضاعفات الجهاز التنفسي (Respiratory Issues):** الالتهاب الرئوي (**Pneumonia**) وهو المسبب الأشهر للوفاة في حالات الحصبة، والتهاب الأذن الوسطى (**Otitis media**).
2. **مضاعفات الجهاز الهضمي (GI Issues):** إسهال وقيء متكرر.
3. **مضاعفات الجهاز العصبي (Nervous System Issues):** * التهاب الدماغ (**Encephalitis**).
* مضاعفة عصبية متأخرة وقاتلة تُعرف بالتهاب الدماغ الشامل المصلب دون الحاد (**SSPE - Subacute Sclerosing Panencephalitis**).



**سادساً: العلاج والوقاية (Treatment & Prevention)**

* **الوقاية (Prevention):** * التطعيم بلقاح الـ **MMR** أو **MMRV** (فعال جداً ويُعطى على جرعتين).
* التطعيم الشامل يساعد في تحقيق مناعة القطيع (**Herd immunity**) لحماية الفئات الضعيفة.


* **الخطة العلاجية (Treatment):**
* علاج داعم وتخفيف للأعراض (سوائل، راحة تامة، وخافض للحرارة).
* 🚨 **عنصر حرج:** إعطاء مكملات **فيتامين أ (Vitamin A)** يقلل بشكل ملحوظ من حدة المرض ويحد من نسبة حدوث المضاعفات.



---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic للأعراض الأولية (Prodromal Stage):**
تذكر دائماً قاعدة حرف الـ C (The 3 Cs):
**(Cough, Coryza, Conjunctivitis)**
بالعربي: (كحة، ورشح، وعينه حمرا).

**2. Mnemonic لترتيب الطفح الجلدي وعلامات الفم:**
لربط تطور الحصبة الإكلينيكي:
**(كوبليك في بقه.. والطفح يبدأ في وشه وينزل على جسمه)**

* **كوبليك في بقه:** **Koplik spots** (تظهر أولاً في الفم وتؤكد التشخيص).
* **يبدأ في وشه وينزل:** ينتشر الطفح من الوجه للرقبة ثم الأطراف.

**3. Mnemonic لأهم معلومة علاجية ومضاعفات:**
**(علاجه فيتامين أ.. وبيموت من الالتهاب الرئوي أو الـ SSPE)**

* **علاجه فيتامين أ:** **Vitamin A** هو الأهم في خطة العلاج.
* **الالتهاب الرئوي / SSPE:** أشهر أسباب الوفاة والمضاعفات القاتلة للحصبة.
`,
  'Mumps': `
**أولاً: المسبب وطرق العدوى (Causative Organism & Transmission)**

* **المسبب (Causative Organism):** فيروس النكاف (**Mumps Virus - MuV**)، وهو فيروس من نوع **RNA** ينتمي لعائلة (**Paramyxoviridae**).
* **طرق الانتقال (Transmission):** ينتقل الفيروس عن طريق الرذاذ التنفسي (**Respiratory droplets**) أو عبر التلامس المباشر مع اللعاب.

**ثانياً: الصورة الإكلينيكية (Clinical Picture)**
العلامة المميزة للمرض هي التهاب وتضخم الغدة اللعابية النكافية، ويصاحبها:

1. **تضخم الغدة النكافية (Swollen Parotid Gland):** التضخم يملأ المسافة خلف الفك، مما يؤدي إلى بروز ورفع شحمة الأذن للأعلى (**Raised Ear Lobule**).
2. **ألم عند المضغ (Pain with Chewing):** يزداد الألم بشدة مع حركة الفك.
3. **أعراض عامة:** حمى (**Fever**)، صداع، وآلام في العضلات (**Muscle Aches**).

**ثالثاً: المضاعفات (Complications)**
تكمن خطورة النكاف في مضاعفاته التي قد تصيب غدداً وأعضاءً أخرى في الجسم:

1. **التهاب الخصية (Orchitis):** يحدث غالباً في الذكور بعد مرحلة البلوغ (**Post-pubertal**)، وقد يحمل دلالات وتأثيرات سلبية محتملة على الخصوبة.
2. **التهاب السحايا والدماغ (Meningo-encephalitis):** يظهر في صورة صداع شديد، غثيان، وتصلب في الرقبة (**Stiff Neck**).
3. **التهاب البنكرياس (Pancreatitis).**
4. **التهاب المبيض (Oophoritis).**
5. **الصمم / فقدان السمع (Deafness).**

**رابعاً: الوقاية والعلاج (Prevention & Treatment)**

* **الوقاية الأساسية (Prevention):** التطعيم هو المفتاح. يُعطى لقاح الـ **MMR** على جرعتين للحماية من المرض.
* **العلاج الداعم (Supportive Care):** يعتمد العلاج على الراحة التامة، الترطيب الجيد (**Hydration**)، وإعطاء مسكنات للألم وخافض للحرارة.
* 🚨 **تحذير غذائي هام:** يجب تجنب السوائل اللاذعة والأطعمة الحمضية تماماً (**Avoid Sour Fluids & Acidic Foods**)، لأنها تحفز تدفق اللعاب بقوة، مما يسبب عصراً للغدة الملتهبة وألماً شديداً للطفل.

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic للعلامة الإكلينيكية المميزة:**
للتفرقة بين تضخم الغدد الليمفاوية وتضخم الغدة النكافية:
**(النكاف بيرفع ودنه لفوق.. وبيوجعه مع المضغ)**

* **يرفع ودنه:** **Raised Ear Lobule** (تضخم الغدة يرفع شحمة الأذن).
* **يوجعه مع المضغ:** **Pain with Chewing**.

**2. Mnemonic لمضاعفات النكاف (Complications):**
تذكر أن الفيروس يحب الغدد والأعصاب:
**(بيضرب غدد تحت في الخصية والمبيض.. وغدة في النص بنكرياس.. وبيضرب السمع والمخ)**

* **تحت:** **Orchitis & Oophoritis**.
* **في النص:** **Pancreatitis**.
* **السمع والمخ:** **Deafness & Meningo-encephalitis**.

**3. Mnemonic لنصيحة الأكل (Dietary Management):**
**(امنع الليمون والبرتقال.. عشان اللعاب ميعصرش الغدة)**

* **امنع الليمون:** **Avoid Sour Fluids** (Stimulates saliva flow, which causes pain).
`,
  'Pertussis  Whooping Cough': `
**أولاً: نظرة عامة وطرق العدوى (General Overview & Transmission)**

* **المسبب (Causative Organism):** بكتيريا البورديتيلا السعال الديكي (**Bordetella pertussis**)، وهي بكتيريا سالبة الجرام (**Gram-negative bacillus**).
* **طرق الانتقال:** شديدة العدوى، تنتقل عبر الرذاذ (**Droplet infection**) أو التلامس المباشر.
* **فترة الحضانة والعدوى:** تتراوح فترة الحضانة من أسبوع إلى أسبوعين. وتكون القدرة على نقل العدوى في ذروتها خلال الأسابيع الأربعة الأولى من بداية المرض.
* 🚨 **ملاحظة مناعية هامة:** لا تنتقل المناعة عبر المشيمة من الأم للطفل (**No trans-placental immunity**)، مما يجعل حديثي الولادة عُرضة للإصابة فور ولادتهم مباشرة.

**ثانياً: المراحل الإكلينيكية (Clinical Manifestations - Three Distinct Stages)**
ينقسم المرض بوضوح إلى 3 مراحل زمنية:

**1. المرحلة النزلية (Catarrhal Stage):**

* **المدة:** أسبوع إلى أسبوعين.
* **الأعراض:** تشبه نزلة البرد العادية (رشح، التهاب ملتحمة، تدميع، كحة خفيفة، وحرارة منخفضة).
* 🚨 **الأهمية الإكلينيكية:** هذه المرحلة هي **الأخطر والأعلى في نقل العدوى** للآخرين (**Highest chance of transmitting the disease**).

**2. المرحلة الانتيابية (Paroxysmal Stage):**

* **المدة:** 2 إلى 4 أسابيع.
* **الأعراض:** تزداد نوبات السعال في العدد والشدة.
* **النوبة الكلاسيكية:** سلسلة متتالية من 5 إلى 10 سعلات عنيفة في زفير واحد، يتبعها فجأة شهيق عميق وقوي يصدر صوتاً مميزاً يُشبه الديك (**Classic "WHOOP" sound**).
* **علامة مميزة:** السعال المصحوب بقيء (**Coughing associated with vomiting**) يُعد مؤشراً قوياً جداً لتشخيص السعال الديكي.

**3. مرحلة التعافي (Convalescent Stage):**

* **المدة:** أسبوع إلى أسبوعين.
* **الأعراض:** تقل نوبات السعال والقيء تدريجياً، ولكن قد تستمر كحة خفيفة لعدة أشهر.

**ثالثاً: الفحوصات والتشخيص (Diagnosis)**

1. **صورة الدم (Laboratory findings):** الفحص المميز جداً هو وجود ارتفاع في كرات الدم البيضاء مصحوباً بارتفاع ملحوظ في الخلايا الليمفاوية (**Leukocytosis accompanied by lymphocytosis**).
2. **التشخيص البكتيري المؤكد (Definitive Diagnosis):** يتم عن طريق زراعة مسحة من الحلق أو السعال على مزرعة أو وسط زراعي مخصص يُسمى مزرعة بورديه-جينجو (**Bordet-Gengou medium**).
3. **أشعة الصدر (Chest X-ray):** تُستخدم لاكتشاف المضاعفات التنفسية مثل الارتشاحات، انخماص الرئة (**Atelectasis**)، أو تمدد الحويصلات الهوائية (**Emphysema**).

**رابعاً: خطة العلاج والوقاية (Treatment & Prevention)**

* **العلاج الدوائي (Treatment):** * الكورس القياسي هو مضاد **Erythromycin** لمدة **14 يوماً** (يُقسم على 4 جرعات يومياً).
* يمكن إعطاء الجلوبيولين المناعي (**Pertussis immune globulin**) إذا تم اكتشاف الحالة مبكراً، خاصة للأطفال أقل من سنتين.


* **الوقاية (Prevention):**
1. **التطعيم النشط (Active Immunization):** عبر لقاح الـ **DPT** الإجباري للرضع.
2. **للمخالطين (Contact Prophylaxis):** يجب إعطاء كورس وقائي من الإريثرومايسين لمدة 7 أيام للأشخاص المخالطين للمريض.



---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic لمراحل المرض (Clinical Stages):**
لربط تطور الأعراض ببعضها:
**(رشح بيعدي.. كحة وشهقة بترجّع.. وبعدين بيخف)**

* **رشح بيعدي:** **Catarrhal Stage** (URI symptoms & *Highest Infectivity*).
* **كحة وشهقة بترجّع:** **Paroxysmal Stage** (Forceful coughs, WHOOP, and *Post-tussive Vomiting*).
* **وبعدين بيخف:** **Convalescent Stage**.

**2. Mnemonic للتحاليل والتشخيص (Investigations):**
هذه الأسئلة تتكرر كثيراً في الـ MCQs:
**(بيضاء وليمفاوية عالية.. وازرعها على بورديه)**

* **بيضاء وليمفاوية:** **Leukocytosis + Lymphocytosis** (وهذا عكس المعتاد في البكتيريا التي ترفع النيوتروفيل).
* **ازرعها على بورديه:** **Bordet-Gengou medium** (المزرعة المخصصة).

**3. Mnemonic للعلاج (Management):**
**(إريثرومايسين 14 يوم للمريض.. و7 أيام للي خالطه)**

* **14 يوم للمريض:** Standard treatment course.
* **7 أيام للمخالط:** Contact prophylaxis.
`,
  'Scarlet Fever': `
**أولاً: المسبب وطرق العدوى (Overview & Transmission)**

* **المسبب (Bacterial Infection):** تحدث الإصابة بسبب بكتيريا المكورات السبحية من المجموعة أ (**Group A, Beta-hemolytic Streptococci**).
* **آلية المرض (Toxin Production):** تفرز هذه البكتيريا سماً يُعرف بالـ (**Erythrogenic Toxin**) والذي يسبب الطفح الجلدي المميز في المرضى الذين لا يمتلكون أجساماً مضادة ضده.
* **مكان العدوى الأساسي (Primary Site):** غالباً ما تبدأ في الحلق، ولكن يمكن أن تحدث في الجلد، الجروح، أو الحروق.
* **الانتقال وفترة الحضانة:** تنتقل عبر الرذاذ (**Droplet Infection**)، وتتراوح فترة الحضانة من يوم إلى 7 أيام.

**ثانياً: الصورة الإكلينيكية (Clinical Manifestations)**
تنقسم الأعراض إلى مرحلة بادرية (أولية) ثم مرحلة الطفح الجلدي:

**1. المرحلة البادرية / البداية الحادة (Prodromal Stage):**

* ارتفاع حاد في درجة الحرارة قد يصل إلى 40°C.
* أعراض عامة: قيء، صداع، وقشعريرة.
* **التهاب الحلق (Pharyngitis):** التهاب شديد مع احتقان وتورم في اللوزتين ووجود إفرازات صديدية (**Purulent exudate**).

**2. الطفح الجلدي المميز (Characteristic Rash):**
يظهر الطفح خلال 24 ساعة من بداية الحرارة، ويتميز بالآتي:

* **شكل الطفح (Diffuse Rash):** طفح دقيق، بارز قليلاً (Papular)، ولونه أحمر زاهي، ويختفي لونه عند الضغط عليه (**Blanches under pressure**).
* **علامات الوجه:** احمرار شديد في الوجنتين مع شحوب واضح ومميز حول الفم (**Flushed Cheeks & Circum-oral Pallor**).
* **تغيرات اللسان (Tongue Phases):** يبدأ مغطى بطبقة بيضاء مع بروز الحلمات (White Strawberry)، وبعد عدة أيام تتقشر الطبقة البيضاء ليصبح أحمر لامعاً (Red Strawberry).
* **التقشر (Desquamation):** بنهاية الأسبوع الأول، يبدأ الجلد في التقشر، خاصة في اليدين والقدمين (وهي علامة هامة جداً للتشخيص التفريقي لاحقاً).

**ثالثاً: الفحوصات والمضاعفات (Investigations & Complications)**

* **الفحوصات المعملية (Laboratory Investigations):**
1. **صورة الدم (CBC):** ارتفاع في كرات الدم البيضاء مع زيادة في الخلايا المتعادلة (**PMNL predominance**).
2. **مسحة الحلق (Throat Swab):** الزراعة على (Blood agar) تؤكد وجود الـ Beta-hemolysis.
3. **اختبارات الدم (Streptococcal Toxins Antibodies):** ارتفاع ملحوظ في الأجسام المضادة مثل الـ **ASO Titer** (أكثر من 250 وحدة)، و **Anti-DNase B**.


* **المضاعفات (Complications):**
* أخطرها هي المضاعفات المناعية المتأخرة غير الصديدية (**Late Non-suppurative Complications**):
1. الحمى الروماتيزمية (**Rheumatic Fever**).
2. التهاب كبيبات الكلى الحاد (**Acute Post-Streptococcal Glomerulonephritis**).





**رابعاً: خطة العلاج (Management)**

* **العلاج بالمضادات الحيوية (Antibiotic Therapy):** الهدف الأساسي هو القضاء التام على بكتيريا السبحية لمنع المضاعفات المناعية.
* الدواء الأساسي والخيار الأول: **البنسلين (Penicillin)**.
* البديل في حالة حساسية البنسلين: **الإريثرومايسين (Erythromycin)**.


* **العلاج الداعم (Supportive Care):** راحة في السرير، خافض للحرارة، وسوائل وتغذية كافية.

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic للعلامات الإكلينيكية المميزة (The 4 S's of Scarlet Fever):**

* **S**ore throat (التهاب وصديد اللوزتين).
* **S**trawberry tongue (لسان الفراولة الأبيض ثم الأحمر).
* **S**andpaper rash (طفح خشن يختفي بالضغط).
* **S**kin peeling (تقشر الجلد في اليدين والقدمين).

**2. Mnemonic للتفرقة في شكل الوجه:**
**(وشه مولّع.. بس حوالين بقه باهت ومفيش طفح)**
تذكر دائماً التناقض الصارخ في الوجه: **Flushed Cheeks** مع **Circum-oral Pallor**، وهي علامة كلاسيكية في أسئلة الـ MCQs.

**3. Mnemonic لخطة العلاج والمضاعفات:**
**(عالج بالبنسلين بسرعة.. عشان تحمي القلب والكلى)**

* **البنسلين:** هو حجر الأساس في العلاج (**Primary drug of choice**).
* **حماية القلب والكلى:** لمنع الـ **Rheumatic Fever** والـ **Glomerulonephritis**.
`,
  'Typhoid Fever': `
**أولاً: نظرة عامة والأسباب (Overview & Causes)**

* **التعريف:** حمى التيفود هي عدوى بكتيرية خطيرة تندرج تحت الفئة الطبية الأوسع (**Enterica**)، والتي تشمل حمى التيفود والباراتيفود.
* **المسبب الأساسي (Causative Organism):** بكتيريا السالمونيلا تيفي (**Salmonella typhi**). وهناك سلالات مشابهة تسبب شكلاً أخف من المرض يُسمى الباراتيفود (Salmonella paratyphi A, B, C).
* **طريقة الانتقال وفترة الحضانة:** تنتقل العدوى بشكل أساسي عن طريق الطريق الفموي-البرازي (**Feco-oral route**) بتناول طعام أو ماء ملوث. تتراوح فترة الحضانة بين **10 إلى 15 يوماً**.

**ثانياً: الصورة الإكلينيكية (Clinical Manifestations)**
تجمع الأعراض بين علامات جهازية عامة وأعراض في الجهاز الهضمي:

1. **البداية (Onset):** بداية خبيثة وتدريجية (**Insidious onset**) تتميز بحمى، صداع، فقدان للشهية (**Anorexia**)، وآلام في العضلات (**Myalgia**).
2. **الحرارة والنبض (Fever & Pulse):** في البالغين، توجد علامة كلاسيكية وهي التناقض بين الحرارة العالية والنبض البطيء نسبياً (**Relative bradycardia**)، ولكن 🚨 **هذه العلامة ليست شائعة في الأطفال المصابين**.
3. **الطفح الجلدي (Rash):** بنهاية الأسبوع الأول، قد يظهر طفح جلدي مميز يُعرف بـ "بقع الورد" (**Rose spots**)، يتركز أساساً على أسفل الصدر والبطن (يُرى بوضوح في ذوي البشرة الفاتحة).
4. **الأعراض المعوية (Abdominal Symptoms):** ألم وانتفاخ في البطن. تتغير عادات التبرز بحيث يعاني **50% من الأطفال من الإمساك**، بينما يعاني الـ **50% الآخرون من الإسهال**.
5. **الفحص الموضعي (Physical Exam):** * لسان مغطى بطبقة بيضاء (**Coated tongue**).
* تضخم مطاطي في الطحال (**Soft Splenomegaly**) يظهر بنهاية الأسبوع الأول.
* 🚨 **قاعدة إكلينيكية:** يجب وضع التيفود في الاعتبار لأي مريض يعاني من حرارة مستمرة (**Prolonged pyrexia**) مصحوبة بتضخم في الطحال.



**ثالثاً: التشخيص المعملي (Laboratory Diagnosis)**
التشخيص يتطلب تسلسلاً دقيقاً للتحاليل حسب وقت الإصابة:

1. **صورة الدم (CBC):** * أنيميا طبيعية الحجم والصبغة (**Normocytic normochromic anemia**) بسبب التثبيط السمي لنخاع العظم.
* نقص في كرات الدم البيضاء (**Leukopenia**) مع غياب تام لخلايا الإيزينوفيل، وزيادة نسبية في الخلايا الليمفاوية (**Relative lymphocytosis**).


2. **مزرعة الدم (Blood Culture):** هي الأدق وتكون إيجابية وموثوقة خلال **الأسبوع الأول** من المرض.
3. **اختبار فيدال (Widal Test):** اختبار التلازن لاكتشاف الأجسام المضادة (O & H). يصبح إيجابياً **بعد الأسبوع الأول**.
4. **مزارع البراز والبول (Stool & Urine Cultures):** تصبح إيجابية **بعد مرور الأسبوع الثاني** من العدوى.

**رابعاً: خطة العلاج (Medical Management)**

* **المضادات الحيوية (Antibiotic Therapy):** * الدواء الأول المفضل (Drug of choice) هو السيفترياكسون (**Ceftriaxone**) بجرعة 50-80 mg/kg/day كجرعة واحدة.
* البدائل (في حالة وجود مقاومة أو تحسس): أمبيسيلين، أموكسيسيلين، أو كو-ترايموكسازول.


* **العلاج الداعم (Supportive Care):**
* راحة تامة في السرير للحفاظ على الطاقة.
* نظام غذائي خفيف وسوائل بكثرة لمنع الجفاف.
* إعطاء خافض للحرارة مثل الباراسيتامول (**Paracetamol**) بجرعة 10-15 mg/kg.



---

💡 **Mnemonics لتسهيل التذكر في أسئلة الامتحان والكلينيكال:**

**1. Mnemonic للعلامات الإكلينيكية في الأسبوع الأول:**
لربط صورة المريض في سؤال الـ MCQ:
**(حرارة وطحاله طري.. ولسانه أبيض وبطنه مبطعة بورد)**

* **حرارة وطحاله طري:** Prolonged fever + **Soft splenomegaly**.
* **لسانه أبيض:** **Coated tongue**.
* **بطنه مبطعة بورد:** **Rose spots** on abdomen.

**2. Mnemonic للتسلسل الزمني للتحاليل (B-W-S):**
**(الدم في الأول.. وفيدال بيلحقه.. والبراز والبول في الآخر)**

* الأسبوع الأول ⬅️ **B**lood culture.
* بعد الأسبوع الأول ⬅️ **W**idal test.
* الأسبوع الثاني وما بعده ⬅️ **S**tool & Urine cultures.

**3. Mnemonic لصورة الدم (CBC findings):**
تذكر أن التيفود بيعمل "هبوط" في كل حاجة في الدم ما عدا الليمفاويات:
**(الأنيميا Normo.. والبيضاء قليلة.. ومفيش إيزينوفيل خالص)**

* **البيضاء قليلة:** **Leukopenia** (عكس معظم البكتيريا اللي بتعمل Leukocytosis).
* **مفيش إيزينوفيل:** Complete disappearance of Eosinophils.
`,
  'Classification & Evaluation of Anemia': `**أولاً: التعريف وتقييم الأنيميا (Definition & Evaluation)**

**التعريف:** الأنيميا هي نقص في تركيز الهيموجلوبين (Hemoglobin) أو الكتلة الكلية لكرات الدم الحمراء عن المعدل الطبيعي المسموح به بالنسبة لعمر وجنس الطفل.

**التقييم:** لتشخيص سبب الأنيميا بشكل دقيق، نعتمد على محورين أساسيين:
1. **التصنيف الشكلي لحجم الخلية** عن طريق الـ MCV (Mean Corpuscular Volume).
2. **التصنيف الفسيولوجي لنشاط النخاع** عن طريق الـ Reticulocytic count.

---

**ثانياً: التصنيف الشكلي (Morphological Classification)**
يعتمد هذا التصنيف على تحليل صورة الدم الكاملة (CBC) وينقسم إلى 3 أنواع رئيسية:

**A. Enumerate the causes of Microcytic Hypochromic Anemia (Low MCV):**
الخلايا هنا صغيرة الحجم وباهتة اللون، وتشمل:
1. **Iron Deficiency Anemia (IDA):** أنيميا نقص الحديد (وهي الأشهر والأكثر شيوعاً).
2. **Thalassemia:** أنيميا البحر المتوسط (خلل جيني في تخليق الهيموجلوبين).
3. **Lead poisoning:** التسمم بالرصاص.
4. **Sideroblastic anemia:** أنيميا أرومات الدم الحديدية (خلل في استخدام الحديد داخل النخاع).

**B. Enumerate the causes of Normocytic Normochromic Anemia (Normal MCV):**
حجم ولون الخلايا طبيعي، ولكن العدد الإجمالي قليل، وتشمل:
1. **Acute blood loss:** النزيف الحاد.
2. **Hemolytic anemias:** الأنيميا التكسيرية ( بمختلف أنواعها).
3. **Aplastic anemia:** فشل النخاع العظمي.
4. **Chronic systemic diseases:** الأمراض المزمنة (مثل الفشل الكلوي المزمن CKD).

**C. Enumerate the causes of Macrocytic Anemia (High MCV):**
الخلايا هنا حجمها أكبر من الطبيعي، وتشمل:
1. **Megaloblastic anemia:** وتحدث بسبب نقص فيتامين ب12 (Vitamin B12 deficiency) أو نقص حمض الفوليك (Folate deficiency).
2. **Hypothyroidism:** خمول الغدة الدرقية.
3. **Liver diseases:** أمراض الكبد المزمنة.

---

**ثالثاً: التصنيف الفسيولوجي (Physiological Classification)**
يعتمد على قياس نسبة الخلايا الشبكية (Reticulocytes) لمعرفة رد فعل نخاع العظم:

*   **Low Reticulocytic count (Decreased production):** النخاع كسلان ولا ينتج خلايا جديدة (ويحدث في حالات نقص التغذية كالحديد والفيتامينات، أو فشل النخاع، أو الأمراض المزمنة).
*   **High Reticulocytic count (Increased destruction / loss):** النخاع نشط جداً وينتج خلايا بكثرة لتعويض فاقد سريع (ويحدث في حالات التكسير Hemolysis أو النزيف الحاد).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

**1. Mnemonic لأسباب الـ Microcytic Anemia:**
لربط أسباب الخلايا الصغيرة، تذكر هذه الجملة:
**(حديد ورصاص، وثلاسيميا سيدهم)**
*   **حديد:** Iron Deficiency Anemia
*   **رصاص:** Lead poisoning
*   **ثلاسيميا:** Thalassemia
*   **سيدهم:** Sideroblastic anemia

**2. Mnemonic لأسباب الـ Macrocytic Anemia:**
لربط أسباب الخلايا الكبيرة، تذكر هذه الجملة:
**(كبد وغدة كسلانة.. ونقص ب12 والفوليك بيكبّر الخلية)**
*   **كبد:** Liver diseases
*   **غدة كسلانة:** Hypothyroidism
*   **نقص ب12 والفوليك:** Megaloblastic anemia

**3. Mnemonic لأسباب الـ Normocytic Anemia:**
**(نخاع فاشل أو مرض مزمن.. ودم بيتكسر أو بينزف)**
*   **نخاع فاشل:** Aplastic anemia
*   **مرض مزمن:** Chronic systemic diseases
*   **دم بيتكسر:** Hemolytic anemias
*   **دم بينزف:** Acute blood loss`,
  'BIOLOGICAL AGE & MATURATION (BONE & TEETH)': `**أولاً: النضج العظمي (Bone Age / Radiological Age)**

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
* **الغدة:** **Hypothyroidism** & **Hypopituitarism**`,
  'DEVELOPMENTAL MILESTONES & NEURODEVELOPMENT': `**أولاً: محاور التطور العصبي (Domains of Development)**
يتم تقييم التطور العصبي الحركي للطفل (Neurodevelopment) من خلال 4 محاور أساسية لا غنى عنها في التقييم الإكلينيكي:

* **Gross motor** (التطور الحركي الكلي / الكبير).
* **Fine motor and Vision** (التطور الحركي الدقيق والبصر).
* **Hearing, Speech, and Language** (السمع والنطق واللغة).
* **Social, Emotional, and Behavioral** (التطور الاجتماعي والسلوكي).

<br/>

**ثانياً: أهم المحطات التطورية (Key Milestones)**
هذه النقاط هي الأشهر في الأسئلة الإكلينيكية والـ MCQs لمعرفة هل الطفل ينمو بمعدل طبيعي أم لا:

* **عند عمر 3 أشهر (3 Months):**
  * **Gross motor:** الطفل يستطيع صلب رأسه جيداً (Good head control / Head support).
  * **Social:** يبدأ في الابتسام للأشخاص (Social smile).

* **عند عمر 6 أشهر (6 Months):**
  * **Gross motor:** يجلس بمساعدة أو مسند (Sits with support).
  * **Fine motor:** يمسك الأشياء بكف يده بالكامل (Palmar grasp) وينقل الأشياء من يد لأخرى.
  * **Language:** يبدأ في المناغاة (Babbling).

* **عند عمر 9 أشهر (9 Months):**
  * **Gross motor:** يجلس بمفرده بدون مساعدة (Sits without support) ويبدأ في الزحف (Crawling).
  * **Fine motor:** يمسك الأشياء الصغيرة بإصبعين (Pincer grasp).
  * **Social:** يلوح بيده مودعاً (Waves Bye-bye).

* **عند عمر 12 شهراً / سنة (12 Months):**
  * **Gross motor:** يقف ويمشي مستنداً على الأثاث (Cruising / Walks with support).
  * **Language:** ينطق أول كلمات واضحة لها معنى (مثل بابا، ماما).

* **عند عمر 18 شهراً (18 Months):**
  * **Gross motor:** يمشي بمفرده بثبات (Walks alone / well).

* **عند عمر 24 شهراً / سنتين (24 Months):**
  * **Gross motor:** يصعد وينزل السلم (Goes up and down stairs).
  * **Language:** يكوّن جملة من كلمتين (2-word sentence).

<br/>

**ثالثاً: تأخر التطور الشامل (Global Developmental Delay)**
يُشخص الطفل بهذه الحالة إذا كان يعاني من تأخر ملحوظ في محورين أو أكثر من محاور التطور المذكورة.

**Enumerate the causes of Global Developmental Delay:**

1. **Cerebral Palsy (CP)**
2. **Genetic syndromes** (e.g., Down syndrome)
3. **Endocrinal disorders** (e.g., Hypothyroidism)
4. **Metabolic disorders** (e.g., Phenylketonuria - PKU)
5. **Malnutrition & Severe chronic illnesses**.
6. **Psychosocial deprivation** (الحرمان البيئي والاجتماعي).

---

💡 **Mnemonic لتسهيل التذكر في أسئلة الـ Enumerate:**
لربط أسباب الـ **Global Developmental Delay** بشكل مبسط، تذكر هذه الجملة:
**(داون جاله شلل ونقص تغذية بسبب الغدة والوراثة)**

* **داون:** **Down syndrome**
* **شلل:** **Cerebral Palsy (CP)**
* **نقص تغذية:** **Malnutrition** (ويمكن ربطها أيضاً بالـ Psychosocial deprivation)
* **الغدة:** **Hypothyroidism** (Endocrinal causes)
* **الوراثة:** **Genetic / Metabolic disorders** (مثل الـ PKU)`,
  'PEDIATRIC GROWTH': `**أولاً: محاور النمو الجسدي (Parameters of Physical Growth)**
تقييم الـ Physical Growth في الأطفال يعتمد بشكل أساسي على ثلاثة قياسات مهمة، وكل قياس له معدل زيادة طبيعي يجب متابعته:

**1. الوزن (Weight):**
* وزن الولادة الطبيعي (Birth weight) يتراوح بين 3 إلى 3.5 kg.
* فسيولوجياً، يفقد الطفل حوالي 5% إلى 10% من وزنه في الأيام الأولى، ثم يستعيد وزن الولادة عند عمر 10 إلى 14 يوماً.
* يتضاعف الوزن (Doubles) عند عمر 4 إلى 5 أشهر.
* يصبح 3 أضعاف (Triples) عند عمر سنة (1 year).
* يصبح 4 أضعاف (Quadruples) عند عمر سنتين (2 years).
* **معادلات حساب الوزن التقريبي (Formulas for expected weight):**
  * للأطفال من 1 إلى 6 سنوات: Age (years) × 2 + 8
  * للأطفال من 7 إلى 12 سنة: (Age (years) × 7 - 5) / 2

<br/>

**2. الطول (Length / Height):**
* يُقاس كـ Length (والطفل مستلقٍ) للأطفال أقل من سنتين، وكـ Height (والطفل واقف) للأطفال الأكبر سناً.
* متوسط الطول عند الولادة هو 50 cm.
* عند عمر سنة يصل إلى 75 cm.
* يتضاعف الطول عند الولادة (Doubles) ليصبح حوالي 100 cm عند عمر 4 سنوات.
* **معادلة حساب الطول التقريبي للأطفال من 2 إلى 12 سنة:** Age (years) × 5 + 80

<br/>

**3. محيط الرأس (Head Circumference - HC):**
* يعتبر من أهم القياسات لأنه يعكس نمو المخ (Brain growth).
* متوسط الـ HC عند الولادة هو 35 cm.
* عند عمر 6 أشهر يصل إلى 43 cm.
* عند عمر سنة يصل إلى 47 cm.

<br/>

**ثانياً: التطبيق الإكلينيكي على محيط الرأس (Abnormalities of Head Circumference)**

**A. Enumerate the causes of Microcephaly (صغر حجم الرأس):**
1. **Congenital infections (TORCH)**
2. **Chromosomal abnormalities** (e.g., Down syndrome)
3. **Familial / Genetic**
4. **Fetal alcohol syndrome**
5. **Craniosynostosis** (الالتحام المبكر لعظام الجمجمة)

**B. Enumerate the causes of Macrocephaly (كبر حجم الرأس):**
1. **Hydrocephalus**
2. **Rickets**
3. **Achondroplasia**
4. **Familial**
5. **Subdural hematoma**

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

**1. لربط أسباب الـ Microcephaly، تذكر هذه الجملة:**
**(عيلة داون شربت كحول، وجالها تورش قفل الجمجمة بدري)**
* **عيلة:** Familial / Genetic
* **داون:** Chromosomal (Down syndrome)
* **كحول:** Fetal alcohol syndrome
* **تورش:** TORCH infections
* **قفل الجمجمة بدري:** Craniosynostosis

**2. لربط أسباب الـ Macrocephaly، تذكر هذه الجملة:**
**(عيلة جالها كساح، فجمعت ميه ودم في المخ)**
* **عيلة:** Familial (وتشمل أيضاً الـ Achondroplasia كمرض وراثي عائلي)
* **كساح:** Rickets
* **ميه:** Hydrocephalus
* **دم:** Subdural hematoma`,
  'Acquired Bleeding & DIC': `**أولاً: التخثر المنتشر داخل الأوعية (Disseminated Intravascular Coagulation - DIC)**

**التعريف والباثوفسيولوجي:**
هي حالة مرضية خطيرة يحدث فيها تنشيط مفرط وعشوائي لعملية التجلط في الأوعية الدموية الصغيرة في الجسم كله. هذا التنشيط يؤدي إلى استهلاك كبير وسريع لعوامل التجلط والصفائح الدموية (Consumptive coagulopathy)، مما يجعل المريض عرضة لحدوث نزيف حاد وجلطات في نفس الوقت.

**ثانياً: الأسباب (Causes of DIC)**
**Enumerate the Causes of DIC:**
1. **Sepsis / Severe infections:** تسمم الدم أو العدوى الشديدة (وهو أشهر وأهم سبب على الإطلاق في الأطفال).
2. **Severe trauma / Burns:** الإصابات الشديدة، الحوادث، والحروق العميقة.
3. **Malignancy:** الأورام السرطانية (خاصة بعض أنواع سرطان الدم مثل Acute Promyelocytic Leukemia - APML).
4. **Shock & Hypoxia:** الصدمة ونقص الأكسجين الشديد.
5. **Severe liver disease:** الفشل الكبدي الحاد.

**ثالثاً: الصورة الإكلينيكية (Clinical Picture)**
تتميز صورة الـ DIC بوجود تناقض ظاهري، حيث يجمع المريض بين النزيف والتجلط:
* **Bleeding manifestations (أعراض النزيف):** نزيف من أماكن سحب العينات والحقن (Oozing from venipuncture sites)، نزيف جلدي (Petechiae, Purpura, Ecchymosis)، أو نزيف من الأغشية المخاطية والجهاز الهضمي.
* **Thrombotic manifestations (أعراض الجلطات):** جلطات في الأوعية الدموية الدقيقة تؤدي إلى نقص الدم الواصل للأعضاء (Microvascular ischemia / Infarction)، مما قد يسبب فشل كلوي (Renal failure)، أو غرغرينا في الأطراف الأصابع (Digital gangrene).

**رابعاً: الفحوصات والعلاج (Investigations & Treatment)**

**Enumerate the Investigations of DIC:**
1. **Platelet count:** نقص شديد في الصفائح الدموية (Thrombocytopenia).
2. **Coagulation profile:** استطالة في كل أوقات التجلط (Prolonged PT, PTT, and Thrombin Time).
3. **Fibrinogen level:** نقص ملحوظ في مستوى الفايبرينوجين (Hypofibrinogenemia) نتيجة استهلاكه.
4. **Fibrin Degradation Products (FDPs) & D-dimer:** ارتفاع ملحوظ جداً في نواتج تكسير الفايبرين والـ D-dimer (وهو أهم وأدق مؤشر لتأكيد الـ DIC).

**Enumerate the lines of Treatment in DIC:**
1. **Treatment of the underlying cause:** علاج السبب الأساسي (مثل إعطاء مضادات حيوية قوية في حالات الـ Sepsis أو علاج الصدمة)، وهو حجر الزاوية في العلاج.
2. **Replacement therapy:** نقل مشتقات الدم لتعويض النزيف، مثل البلازما الطازجة المجمدة (FFP) لتعويض عوامل التجلط، ونقل صفائح دموية (Platelet transfusion)، ونقل Cryoprecipitate لتعويض الفايبرينوجين.
3. **Heparin:** يُستخدم بحذر شديد جداً وفقط في الحالات التي يغلب عليها تكون الجلطات وتوقف الدم عن الأعضاء (Predominant thrombosis).

**خامساً: أسباب أخرى للنزيف المكتسب (Other Acquired Bleeding Disorders)**
* **Liver Disease:** الكبد هو المصنع الأساسي لمعظم عوامل التجلط، لذلك الفشل الكبدي يؤدي إلى سيولة ونزيف.
* **Vitamin K Deficiency:** يؤدي إلى نزيف بسبب نقص عوامل التجلط المعتمدة على فيتامين ك (Factors II, VII, IX, X).

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

**1. Mnemonic لأسباب الـ DIC:**
لربط أشهر مسببات الـ DIC، تذكر هذه الجملة:
**(عدوى وحرق وورم.. وصدمة دمرت الكبد)**
* **عدوى:** Sepsis (أهم سبب)
* **حرق:** Severe burns & trauma
* **ورم:** Malignancy (Leukemia)
* **صدمة:** Shock & Hypoxia
* **دمرت الكبد:** Severe liver disease

**2. Mnemonic لفحوصات الـ DIC (Investigations):**
لربط شكل التحاليل المميزة للـ DIC، تذكر هذه الجملة:
**(صفائح وفايبرينوجين واقعين.. والوقت والدايمر عاليين)**
* **صفائح وفايبرينوجين واقعين:** Low Platelets (Thrombocytopenia) & Low Fibrinogen
* **الوقت عالي:** Prolonged PT & PTT
* **الدايمر عالي:** Elevated D-dimer & FDPs`,
  'Aplastic Anemia & BM Failure Syndromes': `**أولاً: التعريف والباثوفسيولوجي (Definition & Pathophysiology)**

**التعريف:**
هي حالة فشل في النخاع العظمي (Bone Marrow Failure) تؤدي إلى توقفه عن إنتاج خلايا الدم، مما ينتج عنه نقص شامل في جميع أنواع الخلايا في الدم المحيطي (Pancytopenia).

**ثانياً: الأسباب (Causes of Aplastic Anemia)**
تنقسم الأسباب إلى مكتسبة ووراثية:

**Enumerate the causes of Aplastic Anemia:**

* **Acquired (المكتسبة):**
  * **Idiopathic:** غير معروفة السبب أو ناتجة عن خلل مناعي (وهي الأشهر).
  * **Drugs:** أدوية مثل بعض المضادات الحيوية (Chloramphenicol) وأدوية العلاج الكيماوي (Chemotherapy).
  * **Toxins & Chemicals:** التعرض للسموم مثل البنزين (Benzene).
  * **Infections:** العدوى الفيروسية، وأشهرها الالتهاب الكبدي الفيروسي (Viral Hepatitis) وفيروس إبشتاين بار (EBV).
  * **Radiation:** التعرض للإشعاع.

* **Inherited (الوراثية / Congenital):**
  * أشهرها **متلازمة فانكوني (Fanconi Anemia)**، والتي تنتج عن خلل جيني يؤثر على إصلاح الـ DNA.

**ثالثاً: الصورة الإكلينيكية (Clinical Picture)**

**A. Clinical Picture of Acquired Aplastic Anemia:**
الأعراض تنتج مباشرة عن نقص الخلايا:
* **نقص كرات الدم الحمراء (Anemia):** شحوب في اللون (Pallor)، إرهاق، وضعف عام.
* **نقص الصفائح الدموية (Thrombocytopenia):** نزيف من الأنف أو اللثة، وظهور بقع دموية تحت الجلد (Petechiae & Purpura).
* **نقص كرات الدم البيضاء (Neutropenia / Leukopenia):** التعرض لعدوى متكررة وشديدة مصحوبة بارتفاع في درجة الحرارة (Recurrent infections & Fever).

⚠️ **ملاحظة إكلينيكية هامة جداً (Negative finding):** المريض لا يعاني من تضخم في الكبد أو الطحال أو الغدد الليمفاوية (No Hepatomegaly, No Splenomegaly, No Lymphadenopathy). إذا وجدت هذه العلامات، يجب التفكير في تشخيص آخر مثل سرطان الدم (Leukemia).

**B. Clinical Picture of Fanconi Anemia:**
يصاحب الـ Pancytopenia عيوب خلقية مميزة تشمل:
* قصر القامة (Short stature).
* تشوهات في الهيكل العظمي، أشهرها غياب إصبع الإبهام أو عظمة الكعبرة (Absent thumb / Radial anomalies).
* صغر حجم الرأس (Microcephaly).
* تصبغات بنية على الجلد (Café-au-lait spots).

**رابعاً: الفحوصات والعلاج (Investigations & Treatment)**

**Investigations:**
* **CBC & Reticulocytic count:** يُظهر نقص شامل في الخلايا (Pancytopenia) مع نقص ملحوظ في الخلايا الشبكية (Low Reticulocytes).
* **Bone Marrow Aspiration & Biopsy:** هو الفحص التشخيصي الأساسي والمؤكد. يُظهر نخاعاً فارغاً من الخلايا ومستبدلاً بالدهون (Hypocellular / Aplastic marrow with fatty replacement).

**Enumerate the lines of Treatment in Aplastic Anemia:**
1. **Supportive care:** نقل دم وصفائح دموية عند اللزوم (Blood & Platelet transfusions)، وعلاج العدوى فوراً بمضادات حيوية قوية (Broad-spectrum antibiotics).
2. **Definitive treatment:** زراعة نخاع العظم / الخلايا الجذعية (Bone Marrow Transplantation - BMT / HSCT) من متبرع متطابق، وهو العلاج الشافي والمفضل.
3. **Immunosuppressive Therapy (IST):** يُستخدم في حال عدم وجود متبرع متطابق للنخاع، ويشمل استخدام أدوية لتثبيط المناعة التي تهاجم النخاع مثل الـ Antithymocyte globulin (ATG) مع الـ Cyclosporine.

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

**1. Mnemonic للـ Clinical Picture of Aplastic Anemia:**
لربط أعراض المرض وعدم وجود تضخم في الأعضاء، تذكر هذه الجملة:
**(شاحب وبينزف وبيسخن.. بس من غير كبد ولا طحال)**
* **شاحب:** Anemia (Pallor)
* **بينزف:** Thrombocytopenia (Bleeding & Petechiae)
* **بيسخن:** Neutropenia (Infections & Fever)
* **من غير كبد ولا طحال:** No Hepatomegaly / No Splenomegaly

**2. Mnemonic لعلامات متلازمة فانكوني (Fanconi Anemia):**
لتذكر العيوب الخلقية المصاحبة، تذكر هذه الجملة:
**(فانكوني قصير وراسه صغيرة.. مبقّع ومن غير صباع)**
* **قصير وراسه صغيرة:** Short stature & Microcephaly
* **مبقّع:** Café-au-lait spots
* **من غير صباع:** Absent thumb / Radial anomalies

**3. Mnemonic لخطوات العلاج (Treatment):**
**(انقل دم وعالج العدوى.. وادي مناعة أو ازرع نخاع)**
* **انقل دم وعالج العدوى:** Supportive (Transfusions & Antibiotics)
* **ادي مناعة:** Immunosuppressive Therapy (ATG & Cyclosporine)
* **ازرع نخاع:** Bone Marrow Transplantation (BMT)`,
  'Chronic Hemolytic Anemia & Hereditary Spherocytosis': `**أولاً: التعريف والباثوفسيولوجي (Definition & Pathophysiology)**

**تكور الدم الوراثي (Hereditary Spherocytosis - HS):** هو أشهر أسباب الأنيميا التكسيرية المزمنة (Chronic Hemolytic Anemia) الوراثية.
ينتج عن خلل جيني (غالباً Autosomal Dominant) في بروتينات جدار خلية الدم الحمراء (مثل الـ Spectrin و Ankyrin).
هذا الخلل يفقد الخلية شكلها المقعر وتصبح كروية (Spherocytes)، مما يجعلها صلبة وسهلة التكسر وتُحجز داخل الطحال ليتم تدميرها (Extravascular hemolysis).

**ثانياً: الصورة الإكلينيكية (Clinical Picture)**
**Enumerate the Clinical Picture of Hereditary Spherocytosis:**

**The Classic Triad (الثالوث الكلاسيكي):**
1. **Anemia:** أنيميا تسبب شحوباً في اللون (Pallor) وإرهاقاً.
2. **Jaundice:** يرقان (صفراء) نتيجة تكسير الدم وزيادة نسبة البيليروبين غير المباشر (Indirect Hyperbilirubinemia).
3. **Splenomegaly:** تضخم ملحوظ في الطحال (لأنه مكان تكسير الخلايا الكروية).

**Complications (المضاعفات):**
* **Pigment gallstones:** تكوّن حصوات مرارية صبغية (تحدث في سن مبكر).
* **Crises (النوبات الحادة):** المريض عرضة لنوبات تكسير حادة (Hemolytic crisis) أو توقف مفاجئ في النخاع (Aplastic crisis)، وتحدث غالباً بعد الإصابة بعدوى فيروسية مثل (Parvovirus B19).

**ثالثاً: الفحوصات والعلاج (Investigations & Treatment)**

**Enumerate the Investigations of Hereditary Spherocytosis:**
1. **CBC:** يُظهر أنيميا مع ارتفاع مميز جداً في تركيز الهيموجلوبين داخل الخلية (High MCHC) لأن الخلية كروية ومكدسة.
2. **Reticulocytic count:** ارتفاع ملحوظ في الخلايا الشبكية (Reticulocytosis) كمحاولة من النخاع لتعويض التكسير.
3. **Peripheral blood smear:** مسحة الدم تُظهر الخلايا الكروية المميزة (Spherocytes) التي تفتقد للمركز الباهت.
4. **Osmotic Fragility Test:** اختبار هشاشة الخلايا يُظهر زيادة في تكسر الخلايا في المحاليل الملحية المخففة (Increased osmotic fragility)، وهو الفحص التأكيدي للتشخيص.

**Enumerate the lines of Treatment in Hereditary Spherocytosis:**
1. **Medical Treatment:** إعطاء حمض الفوليك (Folic acid supplementation) مدى الحياة لدعم النخاع في إنتاج خلايا جديدة، مع نقل دم (Blood transfusion) في حالات النوبات الحادة والأنيميا الشديدة.
2. **Surgical Treatment:** استئصال الطحال (Splenectomy) هو العلاج الشافي الذي يوقف التكسير، ولكن:
   * يجب تأجيله حتى يبلغ الطفل 5 إلى 6 سنوات لتقليل خطر الإصابة بعدوى بكتيرية قاتلة.
   * يجب إعطاء الطفل تطعيمات وقائية قبل العملية بأسابيع (Pneumococcal, Meningococcal, and Hib vaccines).
   * استئصال المرارة (Cholecystectomy) إذا كانت تحتوي على حصوات.

---

💡 **Mnemonics لتسهيل التذكر في أسئلة الـ Enumerate:**

**1. Mnemonic لعلامات المرض (Clinical Picture):**
لربط الثالوث الكلاسيكي لتكسير الدم المزمن، تذكر هذه الجملة:
**(شاحب ومصفر.. وطحاله كبير بيعمل حصوات)**
* **شاحب:** Anemia (Pallor)
* **مصفر:** Jaundice
* **طحاله كبير:** Splenomegaly
* **بيعمل حصوات:** Pigment gallstones

**2. Mnemonic للتحاليل (Investigations):**
لتذكر شكل التحاليل في ورقة الإجابة، تذكر هذه الجملة:
**(خلية مدورة ومركزة.. وشبكية عالية وهشة في المحلول)**
* **خلية مدورة ومركزة:** Spherocytes & High MCHC
* **شبكية عالية:** High Reticulocytic count
* **هشة في المحلول:** Increased Osmotic Fragility

**3. Mnemonic لخطوات العلاج (Treatment):**
**(فوليك يبني ودم يعوض.. وشيل الطحال بعد التطعيم)**
* **فوليك يبني:** Folic acid supplementation
* **دم يعوض:** Blood transfusion (in crises)
* **شيل الطحال بعد التطعيم:** Splenectomy (after Vaccines at age 5-6)`,
  'G6PD Deficiency & Immune Hemolytic Anemias': `**أولاً: نقص إنزيم (G6PD Deficiency / Favism - أنيميا الفول)**

**التعريف والوراثة:** هو مرض وراثي مرتبط بالكروموسوم الجنسي X (X-linked recessive)، لذا يصيب الذكور في الأغلب. نقص هذا الإنزيم يجعل جدار خلية الدم الحمراء ضعيفاً جداً وعرضة للتكسير عند التعرض لأي إجهاد تأكسدي.

**Enumerate the Triggers of Hemolysis (محفزات نوبة التكسير):**
- **Fava beans / Legumes:** تناول الفول أو بعض البقوليات.
- **Drugs:** Antimalarials, Sulfa drugs, Aspirin.
- **Infections:** الإصابة بعدوى فيروسية أو بكتيرية.

**Enumerate the Clinical Picture of G6PD Crisis:**
- **Sudden severe pallor**
- **Jaundice**
- **Dark / Tea-colored urine**

**Investigations:**
- **CBC & Reticulocytosis**
- **Blood film:** Bite cells / Blister cells, Heinz bodies.
- **G6PD Enzyme Assay:** بعد 3‑4 أسابيع من النوبة.

**Treatment:**
- **Avoid triggers**
- **Blood transfusion** عند الحاجة
- **Good hydration** لحماية الكلى.

**ثانياً: الأنيميا التكسيرية المناعية (Autoimmune Hemolytic Anemia - AIHA)**

**التعريف:** أجسام مضادة تهاجم كرات الدم الحمراء.

**Clinical picture:** Pallor, Jaundice, Splenomegaly.

**Investigations:** Positive Direct Coombs Test (DAT).

**Enumerate the lines of Treatment in AIHA:**
- **Corticosteroids**
- **IVIG**
- **Immunosuppressants (Rituximab)**
- **Blood transfusion** بحذر
- **Splenectomy** في الحالات المزمنة.

**Mnemonics:**
1. **(أكل فول وخد دوا.. فجأة شحب واصفر وبوله بقى زي الشاي)**
2. **(كورتيزون ومناعة في الأول.. ونقل دم بحذر شديد.. ولو فشلوا شيل الطحال)**
`,
  'Hemostasis & Bleeding Disorders': `**أولاً: خطوات وقف النزيف (Core Components of Hemostasis)**

**Vascular Response:** انقباض فوري للأوعية الدموية لتقليل تدفق الدم (Vasoconstriction).

**Primary Hemostasis:** تكوين السدادة المبدئية عن طريق تنشيط وتجمع الصفائح الدموية في مكان الجرح (Platelet plug).

**Secondary Hemostasis:** تنشيط عوامل التجلط (Coagulation cascade) لتكوين شبكة الفايبرين القوية التي تثبت الجلطة (Insoluble Fibrin mesh).

**Fibrinolysis:** تذويب الجلطة بعد التئام الجرح عن طريق إنزيم البلازمين (Plasmin).

**ثانياً: التفرقة الإكلينيكية لأنماط النزيف (Clinical Bleeding Patterns)**

**Primary Hemostatic Pattern (Platelet / Vascular defects):**
- Site: نزيف سطحي في الجلد والأغشية المخاطية (Mucocutaneous bleeding).
- Skin signs: بقع دموية صغيرة تحت الجلد وكدمات سطحية (Petechiae & Superficial ecchymoses).
- Trauma response: النزيف يحدث فوراً وبشكل مستمر بعد الإصابة أو الجروح الطفيفة (Immediate bleeding).

**Secondary Hemostatic Pattern (Coagulation factor defects):**
- Site: نزيف عميق في الأنسجة والمفاصل والعضلات (Deep tissue & Hemarthrosis).
- Skin signs: كدمات كبيرة وعميقة، ولا توجد بقع دموية صغيرة (Petechiae UNCOMMON).
- Trauma response: النزيف يكون متأخراً بعد الإصابة أو العمليات الجراحية (Delayed bleeding).

**ثالثاً: مسارات التجلط وتفسير التحاليل (Coagulation Cascade & Interpretation)**

**Intrinsic Pathway (المسار الداخلي):** يُقاس بـ aPTT، يشمل عوامل XII, XI, IX, VIII.
**Extrinsic Pathway (المسار الخارجي):** يُقاس بـ PT، يشمل العامل VII.
**Common Pathway (المسار المشترك):** يُقاس بـ TT، يبدأ بتنشيط العامل X الذي يحول البروثرومبين إلى ثرومبين، والذي يكوّن الفايبرين.

**Enumerate the interpretation of Coagulation Profile:**
- Prolonged aPTT + Normal PT → مشكلة داخلية (Hemophilia أو VWD).
- Normal aPTT + Prolonged PT → مشكلة خارجية (Factor VII deficiency).
- Prolonged aPTT + Prolonged PT → مشكلة مشتركة أو جهازية (DIC, Liver disease, anticoagulant toxicity).
- Normal aPTT + Normal PT مع نزيف → مشكلة صفائح أو Factor XIII deficiency.

**Mnemonics:**
1. **Primary vs Secondary Bleeding:**
   - Primary: (سطحي وفوري ومبقع).
   - Secondary: (عميق ومتأخر ومفيش بقع).
2. **Factors mnemonics:**
   - PT (extrinsic) → Factor 7.
   - aPTT (intrinsic) → 12,11,9,8.
   - Common → 10,5,2,1.
`,
  'Iron Deficiency Anemia (IDA)': `**أولاً: نظرة عامة والأسباب (Overview & Causes)**

**المقدمة:** أنيميا نقص الحديد هي أشهر أمراض الدم الناتجة عن سوء التغذية لدى الأطفال.

**الأسباب (Primary Causes):**
- نقص تناول الحديد في الطعام (Inadequate intake).
- مشاكل في الامتصاص (Impaired absorption).
- فقدان الدم المزمن (Chronic blood loss).

**ثانياً: الصورة الإكلينيكية (Clinical Manifestations)**
**Enumerate the Clinical Features of IDA:**
- **Systemic Features:** شحوب تدريجي (Progressive pallor)، إرهاق مستمر (Fatigue)، تسارع نبضات القلب (Tachycardia).
- **Koilonychia (Spoon nails):** تقعر الأظافر لتصبح كالمعلقة.
- **Atrophic Glossitis:** التهاب اللسان مع فقدان الحلمات اللسانية.
- **Pica Behavior (الوحم):** اشتهاء بطين أو تراب أو ثلج.

**ثالثاً: الفحوصات المعملية (Laboratory Diagnostic Panel)**
**CBC & Indices:** أنيميا ميكرو سيتية هيبوكروماتية (Low Hb, MCV < 80 fL, MCH < 27 pg).
**RDW:** مرتفع (Anisocytosis) قد يسبق فقر الدم.
**Iron Profile:**
- Serum Ferritin: منخفض جداً.
- TIBC: مرتفع.
- Serum Iron & Transferrin Saturation: منخفضان.

**رابعاً: التشخيص التفريقي (TAILS Differential Diagnosis)**
**T - Thalassemia Trait:** RDW طبيعي، RBCs طبيعي أو مرتفع، وجود Target cells.
**A - Anemia of Chronic Disease:** TIBC منخفض، Ferritin طبيعي أو مرتفع.
**I - Iron Deficiency Anemia:** RDW مرتفع، Ferritin منخفض، TIBC مرتفع.
**L - Lead Poisoning:** وجود Basophilic stippling.
**S - Sideroblastic Anemia:** وجود Ringed sideroblasts.

**خامساً: خطة العلاج (Therapeutic Management Protocol)**
**قواعد العلاج الفموية للحديد:**
- الجرعة: 3‑6 mg/kg/day مقسمة على 2‑3 جرعات.
- الامتصاص: يُفضل على الريق أو مع فيتامين C.
- الممنوعات: تجنّب الحليب، الشاي، أو الأدوية القلوية.
- المدة: 2‑3 أشهر بعد استقرار Hb لملء المخازن.
- المتابعة: ارتفاع Reticulocyte خلال 5‑10 أيام يدل على استجابة.

**Mnemonics:**
1. **Clinical Picture:** (شاحب وبياكل طين.. ولسانه بيوجعه وضوافره مقوسة).
2. **Iron Profile:** (الحديد ومخزونه واقعين.. والوعاء فاضي فمساحته بتزيد).
3. **Treatment Rules:** (اديه على الريق مع برتقال.. وابعد عن اللبن والشاي.. وكمل 3 شهور عشان تملى المخازن).
`,
  'Inherited Coagulation Hemophilia & VWD': `**أولاً: مرض الهيموفيليا (The Hemophilias)**

**التعريف:** مجموعة من الأمراض الوراثية التي تسبب نقصاً في عوامل التجلط (المسار الداخلي)، وتتميز بنمط النزيف العميق في الأنسجة.

**الأنواع والوراثة:**
- **Hemophilia A:** نقص العامل الثامن (Factor VIII). ينتقل كصفة متنحية مرتبطة بالكروموسوم X (X‑linked recessive).
- **Hemophilia B (Christmas Disease):** نقص العامل التاسع (Factor IX). ينتقل بنفس النمط الوراثي.
- **Hemophilia C:** نقص العامل الحادي عشر (Factor XI). وراثة أتو‑سومية (autosomal recessive).

**الصورة الإكلينيكية:** نزيف داخل المفاصل الكبيرة (Hemarthrosis) بعد إصابة بسيطة أو تلقائي، ونزيف عميق في العضلات.

**ثانياً: مرض فون ويلبراند (Von Willebrand Disease – VWD)**

**التعريف:** أكثر اضطراب نزيف وراثي شائع. ينتقل غالباً كصفة سائدة (autosomal dominant).

**الآلية المزدوجة:**
- فشل الالتصاق الصفائحي بالجرح (Defective platelet adhesion).
- فقدان حماية العامل الثامن مما يؤدي لتكسيره بسرعة (Factor VIII degradation).

**الصورة الإكلينيكية:** نزيف سطحي/مخاطي مثل نزيف الأنف المتكرر، نزيف اللثة، وغزارة الطمث (Menorrhagia).

**ثالثاً: الفحوصات والتحاليل**

**Hemophilia Panel:**
- aPTT: طويل جداً (المسار الداخلي).
- PT & Bleeding Time: طبيعيان.
- قياس مستوى العامل VIII أو IX لتحديد النوع.

**VWD Panel:**
- Bleeding Time: طويل (فشل الالتصاق الصفائحي).
- aPTT: قد يكون طبيعي أو طويل (اعتماداً على نقص العامل VIII).
- PT: طبيعي.
- اختبار نشاط رستوستيتين (Ristocetin Cofactor Activity) لتأكيد التشخيص.

**رابعاً: العلاج والإسعافات**

- **استبدال العوامل:** تركيزات العامل VIII أو IX للهموفيليا؛ تركيزات VWF مع Factor VIII للـ VWD.
- **العناية بالنزيف المفصلي الحاد (PRICE):** Protection, Rest, Ice, Compression, Elevation.
- **قواعد صارمة:** يمنع منعاً باتاً إعطاء الأسبرين أو NSAIDs لأنها تعيق عمل الصفائح وتزيد خطر النزيف.

**Mnemonics:**
1. **أنواع الهيموفيليا وأرقامها:** (A مع 8، B مع 9… والاتنين بيحبوا الصبيان).
2. **تمييز النزيف:** (الهيموفيليا نزيف جوه… والفون ويلبراند نزيف برّه).
3. **تحاليل الـ VWD (الخلل المزدوج):** (وقت النزيف طويل عشان الصفائح مش بتلزق… والـ aPTT طويل عشان العامل الثامن بيقع).
`,
  'Lymphomas & Solid Tumors': `**أولاً: الأورام الليمفاوية (Lymphomas)**

**التصنيف:**  
- Hodgkin Lymphoma (HL)  
- Non‑Hodgkin Lymphoma (NHL)

**Hodgkin Lymphoma (HL) - هودجكين**  
*Pathognomonic Hallmark:* وجود خلايا Reed‑Sternberg (عين البومة).  
*Clinical Presentation:* تضخم غير مؤلم، صلب، ومطاطي في الغدد الليمفاوية (Cervical/ Supraclavicular).  
*Mass Infiltration:* قد يحدث انضغاط للهواء في mediastinum → كحة جافة وصعوبة تنفس.  
*Diagnostic Protocol:* excisional lymph node biopsy هو الإجراء المفضل. لا يُستعمل الإبرة البسيطة.  

**B‑Symptoms (Prognostic):**  
- حمى مستمرة (> 38 °C)  
- تعرق ليلي غزير  
- فقدان وزن غير مبرّر (> 10 % خلال 6 شهور)

**Non‑Hodgkin Lymphoma (NHL) - لاهودجكين**  
*Epidemiology:* أكثر شيوعاً في الأطفال (≈ 60 %). يرتبط بنقص المناعة والعدوى الفيروسية (EBV, HIV).  
*Therapeutic Risks:* مضاعفات حادة عند بدء العلاج مثل متلازمة تحلل الورم (TLS) ونقص خلايا الدم.

**ثانياً: الأورام الصلبة (Solid Tumors)**  

**Neuroblastoma (ورم الأرومة العصبية)**  
*Origin & Site:* خلايا النورال كريست من الغدة الكظرية أو العقد القريبة للعمود الفقري.  
*Clinical Presentation:* كتلة بطنية، ألم عظمي، جحوظ العينين مع Raccoon eyes.  
*Paraneoplastic:* إفراز catecholamines → ضغط دم مرتفع وتعرّق مستمر.  
*Diagnosis:* قياس VMA & HVA في البول، مسح MIBG.

**Wilms Tumor / Nephroblastoma (ورم ويلمز)**  
*Origin & Site:* ورم كلوية أولي، ذروة الإصابة 2‑3 سنوات.  
*Clinical Presentation:* كتلة صلبة بطنية لا تعبر الخط الأوسط.  
*⚠️ تحذير سريري:* يُمنع الضغط القوي على البطن لتجنّب تمزق كبسولة الكلى.  
*Associated Findings:* ارتفاع ضغط الدم، دم بولي غير مؤلم.  
*Genetic association:* Beckwith‑Wiedemann.  
*Treatment:* استئصال جذري للكلية + كيمياء.

**Mnemonics**  
1. **B‑Symptoms:** (سخن وبيعرق وبيخس من غير سبب).  
2. **Neuroblastoma:** (ورم في الكظرية طلّع أدرينالين… عمل ضغط وعرق وهالات سودة زي الراكون).  
3. **Wilms Tumor:** (كتلة في الكلية مابتعديش النص وممنوع تلمسها.. بتجيب دم في البول ويرفع الضغط).
`,
  'Megaloblastic Anemias (B12 & Folate Deficiency)': `**أولاً: التعريف والباثوفسيولوجي (Definition & Pathophysiology)**

**التعريف:** هي نوع من الأنيميا ذات الخلايا الكبيرة (Macrocytic anemias).

**الباثوفسيولوجي:** تحدث بسبب خلل أساسي في تصنيع الـ DNA بينما يستمر تصنيع الـ RNA والبروتين. ينتج ماكروسيتي مع خلايا متعادلة متقسمة النواة (Hypersegmented neutrophils).

**الأسباب الأساسية:** نقص فيتامين ب12 أو نقص حمض الفوليك.

**ثانياً: نقص حمض الفوليك (Folate Deficiency)**

**Causes (الأسباب):**
- الرضاعة الحصرية بلبن الماعز (Exclusive goat's milk feeding) – فقير بالفوليك.
- نقص تناول الخضروات الورقية.
- أمراض سوء الامتصاص مثل حساسية القمح (Celiac disease).
- زيادة الحرق والطلب (Chronic hemolytic anemias).

**Clinical Picture (الصورة الإكلينيكية):**
- شحوب الجلد والأغشية المخاطية.
- التهاب وضمور اللسان.
- إسهال مزمن وضعف نمو.

⚠️ **Key Diagnostic Exclusion:** لا يسبب نقص الفوليك أعراضاً عصبية.

**ثالثاً: نقص فيتامين ب12 (Vitamin B12 Deficiency)**

**Causes & Absorption (الأسباب والامتصاص):**
- نظام غذائي نباتي صارم (Strict vegan diet).
- نقص العامل الداخلي (Intrinsic Factor) مثل الأنيميا الخبيثة.

**Clinical Signature (العلامة الإكلينيكية المميزة):**
- تلف عصبي غير قابل للعودة (Progressive irreversible neurological damage) مع فقدان الإحساس، ضعف العضلات، ارتباك التوازن.

**رابعاً: الفحوصات والعلاج (Laboratory Panel & Treatment Protocol)**

**Investigations:**
- CBC مع ارتفاع MCV >100 fL، قد يصاحبها Pancytopenia.
- مسحة دم تُظهر Macro-ovalocytes وHypersegmented neutrophils.

**Treatment:**
- Folate Deficiency: حمض الفوليك فمياً أو بالوريد.
- B12 Deficiency: حقن عضلية بانتظام.

🚨 **Golden Clinical Rule:** لا تعطي الفوليك قبل استبعاد نقص ب12.

💡 **Mnemonics:**
1. **Folate Causes:** (لبن ماعز ومفيش خضار.. أو بطنه مريضة ودمه بيتكسر)
2. **B12 vs Folate:** (الفوليك آخره لسان بيوجعه وبطن بتسهل.. لكن ب12 بيضرب الأعصاب ويشل)
3. **Peripheral Smear:** (خلية كبيرة وبيضاوية.. ونيوتروفيل متفصصة لستة)
`,
  'Non-Thrombocytopenic Purpura (Vascular & HSP)': `**أولاً: فرفرية الأوعية الدموية (Vascular Purpura Framework)**

**التعريف:** أمراض نزفية ناتجة عن تلف هيكلي أو التهاب في جدار الأوعية الدموية، مما يرفع نفاذيتها ويسبب نزيفًا تحت الجلد أو الأغشية المخاطية.

🚨 **القاعدة الذهبية للتفرقة:** عدد الصفائح الدموية وتحاليل التخثر طبيعية (Normal Platelets & Normal Coagulation profile) – يميزها عن الفرفرية الناقلة للصفائح.

**ثانياً: فرفرية هينوك-شونلاين (Henoch‑Schönlein Purpura - HSP)**

*نظرة عامة:* أكثر التهاب وعائي شائع لدى الأطفال (3‑10 سنوات).
*الميكانيزم:* بعد URTI يتحفز IgA لتكوين معقدات مناعة تُرسّخ في جدران الأوعية الصغيرة (IgA immune complex deposition).

**ثالثاً: الصورة الإكلينيكية (Classical Tetrad)**

- **Skin Rash (Palpable Purpura):** بقع حمراء غير قابلة للانضمار في الساقين والأرداف (gravity‑dependent).
- **Arthritis/Arthralgia:** ألم وتورم مؤقت في المفاصل الكبيرة (الركبة، الكاحل) يزول دون تشوه دائم.
- **Gastrointestinal Involvement:** مغص بطني شديد، قيء، إمّا دم في البراز (Melena) مع خطر الانغلاف المعوي.
- **Renal Involvement:** دم وزلال في البول، قد يرافقه ارتفاع ضغط الدم؛ شدة الإصابة تحدد التنبؤ طويل الأمد.

**رابعاً: الفحوصات والعلاج (Laboratory Findings & Management)**

*Investigations:* 
- CBC & Coagulation: عدد الصفائح طبيعي، PT/aPTT طبيعي.
- ESR & CRP مرتفعة.
- **Serial Urinalysis** لمراقبة التهاب الكلى (أهم خطوة).

*Therapeutic Management:* 
- رعاية داعمة (ترطيب، راحة).
- NSAIDs لتخفيف الألم المفصلي.
- كورتيكوستيرويدات (Prednisone) في حالات مغص شديد أو التهاب كلوي ملحوظ.

**💡 Mnemonics**
1. **Classical Tetrad:** (بقع بارزة في الرجل والأرداف.. مفاصل بتوجعه من غير تشوه.. مغص شديد في بطنه.. وزلال ودم في كليته).
2. **Laboratory Rule:** (صفايحه وسوائلته تمام.. لكن تحليل البول هو الأهم).
`,
  'Pediatric Oncology The Leukemias (ALL & AML)': `**أولاً: التعريف والعلامات التحذيرية (Definition & Red Flags)**

**التعريف:** اللوكيميا (سرطان الدم) هي أشهر الأورام الخبيثة في الأطفال، ناتجة عن تكاثر غير مسيطر عليه لخلايا الدم غير الناضجة (Blasts) داخل النخاع العظمي.

**الأنواع الرئيسية:**
- Acute Lymphoblastic Leukemia (ALL) – ~80٪، غالباً بين 2‑5 سنوات.
- Acute Myeloid Leukemia (AML) – ~20٪.

**علامات التحذير (Red Flags):**
- حمى مستمرة غير مبررة.
- ألم عظمي يوقظ الطفل ليلاً.
- شحوب تدريجي، إرهاق وخمول.
- بقع دمّية، كدمات، نزيف.
- تضخم كبدي/طحالي أو عقد ليمفاوية ملحوظة.

**ثانياً: المقارنة الإكلينيكية (ALL vs AML)**

**ALL:**
- تضخم عام للغدد الليمفاوية.
- كتلة صدرية (Mediastinal Mass) قد تسبب متلازمة SVC.
- انتشار مبكر للجهاز العصبي المركزي.

**AML:**
- Chloromas (ورم أخضر صلب).
- تضخم لثوي شديد.
- Blueberry Muffin lesions على الجلد.
- DIC (خاصة في APML M3).

**ثالثاً: متلازمة تحلل الورم (TLS)**

**التعريف:** تحلل سريع للخلايا السرطانية يؤدي إلى اضطرابات أيضية حادة.
**السلسلة الأيضية:**
- Hyperuricemia
- Hyperkalemia (أخطر اضطراب قلبي)
- Hyperphosphatemia
- Hypocalcemia (ثانوي)
**الإدارة:** الترطيب الوريدي المكثف، تعديل حموضة البول، Allopurinol أو Rasburicase.

**رابعاً: الفحوصات التشخيصية النهائية**
- خزعة ونخاع عظم (Gold Standard) ≥20% خلايا شراعية.
- فحص السيتومتري لتحديد النوع.
- بزل قطني (LP) لتقييم الغزو CNS.

**💡 Mnemonics:**
1. **Red Flags:** (سخن وشاحب وبينزف.. وعضمه بيوجعه بالليل وطحاله كبير).
2. **AML:** (لثة وارمة وورم أخضر.. وتوت أزرق على الجلد مع نزيف).
3. **TLS:** (يوريك وبوتاسيوم وفوسفور عاليين.. والكالسيوم بس هو اللي واطئ).
`,
  'Platelet Disorders ITP & Thrombocytopenias': `**أولاً: فرفرية نقص الصفائح المناعية (Immune Thrombocytopenic Purpura - ITP)**

**التعريف والسبب:** هي أشهر سبب لنقص الصفائح الدموية الحاد في الأطفال الأصحاء. يحدث غالباً بعد عدوى فيروسية أو تطعيم. ينتج أجسام مضادة (Anti‑Platelet IgG) تهاجم الصفائح وتُدمرها الخلايا البلعمية في الطحال.

**Clinical Features of ITP:**
- **Dry Bleeding:** بقع دموية دقيقة، كدمات، لا توجد نزيف موضعي (Petechiae, Purpura, Ecchymosis).
- **Wet Bleeding:** نزيف من الأغشية المخاطية (أنف، لثة، جهاز هضمي/بولي). علامة خطر لحدوث نزيف داخل الجمجمة.

**Diagnostic Profile:**
- **Isolated Thrombocytopenia:** صفيحات < 20,000 مع Hb وWBC طبيعيين.
- **Bone Marrow:** فرط تكاثر الخلايا الأم للصفائح (Megakaryocytic Hyperplasia) كاستجابة تعويضية.

**ثانياً: متلازمات نقص الصفائح الخلقية (Congenital Thrombocytopenia Syndromes)**

**Enumerate:**
- **TAR Syndrome:** نقص صفيحات مع غياب عظمة الكعبرة (Absent Radius) مع إبقاء الإبهام موجوداً.
- **Wiskott‑Aldrich Syndrome (WAS):** X‑linked؛ صفيحات صغيرة جداً (Tiny platelets) + إكزيما + نقص مناعة متكرر.
- **Bernard‑Soulier Syndrome:** صفيحات عملاقة (Giant Platelets) بسبب خلل في الالتصاق الصفائحي.

**ثالثاً: متلازمة انحلال الدم اليوريمية (HUS)**

**التعريف:** طوارئ طبية شائعة السبب للأكِيد الكلوي الحاد في الأطفال.
**السبب:** عدوى بكتيرية (E. coli O157:H7) تُفرز شِجَّة الشيجا (Shiga‑toxin) مع إسهال دموي.
**Classic Triad:**
- **MAHA:** فقر دم انحلالي ميكروانيجيوستيك.
- **Consumption Thrombocytopenia:** نقص صفيحات نتيجة استهلاكها.
- **Acute Kidney Injury (AKI):** قُلة بول، دم في البول، ارتفاع ضغط الدم.

**💡 Mnemonics**
1. **ITP Severity:** (الناشف في الجلد ومقلق.. والمبلول في المناخير وبيخوّف من المخ).
2. **Wiskott‑Aldrich:** (ولد اسمه ويسكوت.. بيهرش في الإكزيما، ومناعته ضعيفة وصفايحه صغيرة).
3. **HUS Triad:** (إسهال بدم جابله أنيميا تكسيرية.. واستهلك صفيحاته.. وقفل كليته).
`,
  'RBC Physiology, Indices & Morphology': `**أولاً: فسيولوجيا تكوين الدم وتطور الهيموجلوبين (Erythropoiescence & Hemoglobin Ontogeny)**

**Erythropoiesis (تكوين كرات الدم):** يُنتَج تحت تأثير الهرمون الإريثروبين (EPO) الذي تفرزه الكلى عند نقص الأكسجة، محفزًا نخاع العظم لإنتاج كرات دم حمراء جديدة.

**أنواع الهيموجلوبين حسب مراحل التطور:**
- **Embryonic Hemoglobin:** موجود في مرحلة الكيس (Hb Gower‑1، Hb Gower‑2، Hb Portland).
- **Fetal Hemoglobin (HbF):** α₂γ₂، عالي الارتباط بالأكسجين، يُستبدل خلال أول 6 أشهر.
- **Adult Hemoglobin (HbA):** α₂β₂، السائد بعد 6 أشهر.
- **Minor Adult Hemoglobin (HbA2):** α₂δ₂، ≤3.5٪ من الكلية.

**ثانياً: مؤشرات كرات الدم الحمراء (RBC Indices)**
- **MCV (Mean Corpuscular Volume):** حجم متوسط للخلية (80‑100 fL). يحدد ما إذا كانت الأنيميا ميكرو سيتية، نورمو سيتية أو ماكرو سيتية.
- **MCH (Mean Corpuscular Hemoglobin):** وزن متوسط للهموغلوبين داخل الخلية (27‑32 pg).
- **MCHC (Mean Corpuscular Hemoglobin Concentration):** تركيز متوسط للهموغلوبين داخل الخلية (32‑36 g/dL). ينخفض في الأنيميا ناقصة الصبغة ويرتفع في تكور الدم.
- **RDW (Red Cell Distribution Width):** تباين أحجام الخلايا (11.5‑15%). يرفع في نقص الحديد، يظل طبيعيًا في ثلاسيميا ترايت.

**ثالثاً: الأشكال غير الطبيعية للخلايا (Abnormal RBC Morphology) وربطها بالأمراض**
- **Spherocytes (الخلايا الكروية):** خلايا صلبة، صغيرة، مكثفة، تُفقد مركزها الفاتح. تظهر في تكور الدم الوراثي وAIHA.
- **Sickle Cells / Drepanocytes (الخلايا المنجلية):** شكل هلالي أو منجلي، ناتج عن هيموجلوبين S. تتواجد في مرض الخلايا المنجلية.
- **Schistocytes (الخلايا المكسرة):** أجزاء مقطعة تشبه الخوذة، تنشأ من تمزق ميكانيكي للخلية في الأوعية المسدودة (DIC, HUS, TTP).
- **Target Cells / Codocytes (الخلايا الهدفية):** شكل “bullseye” نتيجة زيادة مساحة الغشاء مقارنة بمحتوى الهيموغلوبين. توجد في الثلاسيميا، HbC، أمراض الكبد المتقدمة.
- **Bite & Blister Cells / Degmacytes (الخلايا المقضومة):** نصف دائرة مقطوعة يُنتج عن قطع البروتينات المتضررة (Heinz bodies) في الطحال. تظهر في نقص الفوليك (G6PD Deficiency).

**💡 Mnemonics لتسهيل التذكر:**
1. **تركيب الهيموجلوبين:** (الجنين ياخذ "جاما".. البالغ ياخذ "بيتا".. النسبة الضئيلة "دلتا").
2. **Morphology‑Disease关联:** (مُكورة في المناعة.. منجلية هلالية.. مكسرة في التجلط.. هدفية في الثلاسيميا.. ومقضومة في الفول).
`,
  'Safe Blood Transfusion & Complications': `**أولاً: دواعي استخدام مكونات الدم (Clinical Indications for Blood Components)**

**Packed RBCs (كرات الدم الحمراء المكدسة):** تعويض قدرة الدم على حمل الأكسجين في الأنيميا المزمنة (مثل الثلاسيميا والأنيميا المنجلية)، فشل النخاع، أو النزيف الحاد بعد الحوادث والعمليات.

**Platelet Concentrates (الصفائح الدموية):** إعطاء في النزيف النشط أو كإجراء وقائي قبل الجراحات إذا كان العدد < 10,000 /µL.

**Fresh Frozen Plasma – FFP:** علاج النزيف الناتج عن نقص متعدد في عوامل التجلط (كما في DIC والفشل الكبدي الشديد).

**Cryoprecipitate (الراسب القري):** غني بـ Factor VIII, XIII, vWF, Fibrinogen؛ يستخدم في نقص الفايبرينوجين، الهيموفيليا، ومرض فون ويلبراند.

**ثانياً: متطلبات نقل الدم الآمن (Proactive Requirements)**
- **Rigorous Patient Identification:** أهم خطوة لمنع نقل فصيلة خاطئة.
- **Washed RBCs:** غسل لإزالة بروتينات البلازما وتقليل خطر تفاعلات الحساسية الشديدة (Anaphylaxis).
- **Leucoreduction & Irradiation:** إزالة كريات الدم البيضاء وتدمير الخلايا T‑leukocytes لمنع TA‑GVHD.

**ثالثاً: المضاعفات الحادة لنقل الدم (Acute Complications – أول 6 ساعات)**
- **Acute Hemolytic Reaction:** رد مناعي سريع بسبب عدم توافق ABO؛ صدمة، حمى، رعشة، بول أحمر داكن.
- **Febrile Non‑Hemolytic Reaction:** حرارة بسبب سيتوكينات من كريات الدم البيضاء.
- **Allergic & Anaphylactic Reactions:** طفح، حكة، ضيق تنفس؛ يُعالج بمضادات الهيستامين.
- **TRALI:** إصابة رئوية حادة غير قلبية؛ نزيف رئوي، انخفاض ضغط الدم، يحتاج إيقاف النقل وأكسجين.
- **TACO:** زيادة حجم الدم؛ فشل قلبي احتقاني مؤقت، ارتفاع ضغط الدم، يُعالج بالمدرات.

**رابعاً: المضاعفات المتأخرة والأيضية (Delayed & Metabolic Complications)**
- **Delayed Hemolytic Transfusion Reaction:** بعد 2‑10 أيام بسبب أجسام مضادة خفية؛ يسبب يرقان وانخفاض Hb.
- **Metabolic Toxicities:**
  - **Hypocalcemia:** بسبب ارتباط الكالسيوم بالسترات في كيس الدم.
  - **Hyperkalemia:** تسرب بوتاسيوم من كرات الدم الحمراء المخزنة.
  - **Systemic Iron Overload / Hemosiderosis:** تراكم الحديد مع نقل متكرر (ثلاسيميا)، يُعالج بـ Iron chelation therapy.

**💡 Mnemonics لتسهيل التذكر**
1. **TRALI vs TACO:** (TRALI يهبط الضغط، TACO يرفع الضغط).
2. **Metabolic:** (كيس الدم القديم بياكل الكالسيوم ويرمي بوتاسيوم).
3. **Proactive Prep:** (اغسل الدم للـ Allergic، واشععه للـ TA‑GVHD).
`,
  'Sickle Cell Disease (SCD)': `**أولاً: الخلل الجيني والباثوفسيولوجي (Genetics & Pathophysiology)**

**الخلل الجيني:** أنيميا وراثية متنحية (Autosomal recessive) بسبب نقطة طفرة (Point mutation) في موقع β‑Globin رقم 6 حيث يتحول الجلوتاميك إلى فالين (Valine replaces Glutamic acid). النتيجة هي تكون هيموجلوبين غير طبيعي (HbS).

**آلية التمنجل (The Sickling Mechanism):** عند نقص الأكسجين (Hypoxia)، الجفاف (Dehydration)، أو الحمضية (Acidosis) يتجمع HbS في ألياف صلبة، فيتحول شكل الكرة من قرص مرن إلى خلية منجلية صلبة (Rigid, crescent‑shaped sickle cells).

**العواقب المرضية:** تمزق الخلايا السلكلية يسبب أنيميا تكسيرية مزمنة (Chronic hemolysis) وتلتصق الخلايا بالجدران الوعائية مسببة انسداداً (Vascular occlusion) يؤدي إلى نقص التروية وألم شديد.

**ثانياً: الأزمات الحادة (Acute Crises & Manifestations)**
- **Vaso‑Occlusive Crises (VOC):** ألم شدّاد في العظام والعضلات.
  - **Dactylitis (Hand‑Foot Syndrome):** تورم وألم متساوي في اليدين/القدمين عند الأطفال < 2 سنة، أول علامة سريرية.
  - **Acute Chest Syndrome (ACS):** حمى، ألم صدري، صعوبة تنفس، انخفاض O₂، وإظهار شفافيات جديدة على أشعة الصدر.
  - **Stroke / CNS Infarction:** انسداد مفاجئ لشرايين المخ، طوارئ عصبية.
  - **Priapism:** انتصاب مؤلم ومطول للذكور.
  - **Splenic Sequestration:** احتباس دم كبير داخل الطحال يسبب هبوط حاد في Hb وتضخم طحال، قد يؤدي إلى صدمة نقص حجم الدم.

**ثالثاً: المضاعفات المزمنة والتشخيص (Chronic Complications & Diagnosis)**
- **Functional Asplenia:** فقدان وظيفة الطحال نتيجة الانسدادات المتكررة، ما يزيد خطر عدوى بكتيرية مغلفة (Encapsulated organisms).
- **تشخيص مختبري:**
  - **CBC & PBS:** أنيميا نورموسيتية مع ارتفاع خلايا شبكية (>2%) ومظهر خلايا منجلية في مسحة الدم، مع وجود أجسام Howell‑Jolly.
  - **Hemoglobin Electrophoresis:** لتحديد نسب HbS (>80‑90% في SS) وإظهار HbA في الحامل للصفة (Trait AS).

**رابعاً: الوقاية والعلاج (Prophylaxis & Management)**
- **الوقاية من العدوى:** بنسلين فموي (Penicillin V) من 2 شهر حتى 5 سنوات، وتطعيمات مكثفة ضد Pneumococcal & Hib.
- **العلاج المزمن:** Hydroxyurea يحفز إنتاج HbF (الهبوجلوبين الجنيني) لتقليل التمنجل وتقليل عدد الأزمات.
- **العناية بالأزمات الحادة (Acute Crisis Care):**
  - **Hydration (سوائل)**
  - **Oxygen (أكسجين)**
  - **Pain relief (مسكنات ألم متعددة الشكل)**

**💡 Mnemonics لتسهيل التذكر**
1. **Genetic Mutation:** "الـ Valine قعد مكان الـ Glutamic على الكرسي رقم 6".
2. **Triggers of Sickling:** "عطشان ومكتوم ودمه حامضي" (Dehydration, Hypoxia, Acidosis).
3. **Acute Care (HOP):** Hydration, Oxygen, Pain relief.
4. **Hydroxyurea:** ي‑F‑رح الطفل لأنه يزيد HbF.
`,
  'The Thalassemia Syndromes (Alpha & Beta)': `**أولاً: التعريف والباثوفسيولوجي (Definition & Pathophysiology)**

**التعريف:** الثلاسيميا (أنيميا البحر المتوسط) هي مجموعة أمراض وراثية تسبب أنيميا تكسيرية صغرى (Inherited Microcytic Hemolytic Anemias) نتيجة نقص أو غياب سلاسل الجلوبين α أو β.

**Beta‑Thalassemia (أنيميا كولي):** متنحية، نقص سلاسل β ينتج سلاسل α غير مرتبطة تتراكم وتدمر كرات الدم داخل النخاع (Ineffective erythropoiesis) وفي الدورة الدموية.

**Alpha‑Thalassemia:** حذف جيني (Deletion) لأحد أو أكثر من جينات α. يتراوح من حامل صامت إلى استسقاء جنيني مميت (Hydrops Fetalis).

**ثانياً: الصورة الإكلينيكية للثلاسيميا الكبرى (Beta‑Thalassemia Major)**
- **Onset:** بعد 6 شهور من الولادة، عندما يتحول HbF إلى HbA المريض.
- **Severe anemia + Profound Hepatosplenomegaly** نتيجة تكسير الدم وزيادة نشاط الطحال.
- **Thalassemic facies & Crew‑cut skull:** تضخم نخاع العظم مع تشوهات عظمية.
- **Growth failure:** تأخر ملحوظ في النمو.

**ثالثاً: الفحوصات التشخيصية (Diagnostic Evaluation Panel)**
- **CBC:** ميكروسيتية شديدة مع انخفاض MCV و MCH.
- **Peripheral Blood Smear:** خلايا هدفية, anisocytosis, nucleated RBCs.
- **Hemoglobin Electrophoresis:**
  - **Beta‑Thal Major:** غياب HbA، ارتفاع HbF حتى 90%.
  - **Beta‑Thal Trait:** ارتفاع HbA2 > 3.5%.

**رابعاً: خطة العلاج (Therapeutic Management Protocol)**
- **Chronic Blood Transfusion:** الحفاظ على Hb > 9.5 g/dL للحد من نشاط النخاع ومنع تشوهات العظام.
- **Iron Chelation Therapy:** Deferasirox أو Deferoxamine بعد 10‑20 نقل أو عند Ferritin > 1000 ng/mL.
- **Definitive Cure:** زرع الخلايا الجذعية (HSCT) في سن مبكرة من متبرع متطابق.

**💡 Mnemonics**
1. **Clinical Picture:** "بعد 6 شهور.. شحب وطحاله كبر، وعضمه كبر وشكله اتغير".
2. **Diagnostic Panel:** "خلايا صغيرة وهدفية.. والكهربا مليانة جنيني".
3. **Treatment Protocol:** "انقل دم واطرد الحديد.. وزرع نخاع عشان يخف أكيد".
`,
  'Abnormal Cranial Volume (Macrocephaly & Microcephaly)': `**أولاً: القياس الإكلينيكي لحجم الرأس (Clinical Measurement)**

يتم قياس محيط الرأس باستخدام أكبر محيط قذالي جبهي (Greatest Occipitofrontal Circumference).

يتم أخذ القياس 3 مرات، ويُسجل الرقم الأكبر لضمان الدقة.

**ثانياً: كبر حجم الرأس (Macrocephaly)**

**التعريف:** محيط الرأس يقع أعلى من الانحراف المعياري الثاني (> +2 SD) بالنسبة للعمر والجنس.

**أسباب Macrocephaly:**
- **Cranial Causes (أسباب في الجمجمة / سمك العظام):**
  - الكساح (Rickets).
  - الأنيميا التكسيرية المزمنة (Chronic hemolytic anemia) لأن النخاع يتمدد داخل العظام.
  - أمراض العظام الجينية مثل (Osteopetrosis, Osteogenesis imperfecta, Bone dysplasia).
- **Intracranial Causes (أسباب داخل الجمجمة):**
  - الاستسقاء الدماغي (Hydrocephalus).
  - انعدام تلافيف المخ المائي (Hydranencephaly) — يُشخص باختبار تسليط الضوء (Transillumination).
  - الأورام والآفات التي تشغل حيزاً (Space occupying lesions / tumors).
  - النزيف أو الارتشاح تحت الجافية المزمن (Chronic subdural effusion/hematoma).
  - كبر حجم المخ الفعلي (Megalencephaly).

**ثالثاً: صغر حجم الرأس (Microcephaly)**

**التعريف:** محيط الرأس يقع أقل من الانحراف المعياري الثاني (< -2 SD).

**أسباب Microcephaly:**
- **A. Primary (Genetic) Microcephaly:**
  - Microcephaly Vera (Autosomal Recessive) – مخ صغير، جبهة مائلة، أذن وأنف بارزين، تخلف عقلي، تشنجات، شلل تشنجي مزدوج (Spastic diplegia). MRI طبيعي.
  - اضطرابات صبغية (Chromosomal Disorders): متلازمة داون (Down Syndrome)، متلازمة إدوارد (Edward Syndrome).
- **B. Structural Brain & Developmental Defects:**
  - Defective Neurulation: انعدام الدماغ (Anencephaly)، القيلة الدماغية (Encephalocele) – يتطلب تدخل جراحي فوري.
  - Defective Prosencephalization: غياب الجسم الثفني (Agenesis of Corpus Callosum)، اندماج الدماغ الأمامي (Holoprosencephaly).
  - Defective Cellular Migration: انعدام تلافيف المخ (Lissencephaly / Smooth brain) – غياب التلافيف، تشنجات وتأخر.
- **C. Secondary Microcephaly:**
  - Intrauterine Disorders: عدوى TORCH (CMV, الحصبة الألمانية, التوكسوبلازما) أو تعرض الأم للأدوية والكحول.
  - Perinatal Injuries: نقص الأكسجين المسبب للاعتلال الدماغي (Hypoxic‑ischemic encephalopathy)، النزيف داخل الجمجمة، التهاب السحايا.
  - Postnatal Systemic Disease: فشل كلوي مزمن أو سوء تغذية حاد.

💡 **Mnemonic لتذكر أسباب Macrocephaly:** (عضمه تخين من الكساح وتكسير الدم.. أو مخه مليان مية وورم ونزيف)

💡 **Mnemonic لتذكر أسباب الـ Secondary Microcephaly:** (عدوى في الرحم.. نقص أكسجين وقت الولادة.. سوء تغذية بعدها)

`,
  'Anterior Horn Cell Diseases & Neuropathies': `**أولاً: مرض ويردنيج‑هوفمان (Werdnig‑Hoffman Disease / SMA)**

**الباثوفسيولوجي والوراثة:** مرض وراثي متنحي (Autosomal Recessive) يحدث بسبب تحلل وضمور في خلايا القَرَن الأمامي للحبل الشوكي (Anterior Horn Cells - AHC) والأنوية الحركية في جذع المخ، مما يؤدي إلى ضعف في الأعصاب الحركية السفلية (LMN weakness).

**الصورة الإكلينيكية (Clinical Features):**
- ارتخاء عضلي شديد (Marked hypotonia).
- حركات الجنين بطيئة وضعيفة (Sluggish fetal movements).
- العلامة المميزة: ارتعاش في اللسان (Fasciculation of the tongue).
- الطفل واعٍ تماماً (Completely alert) ولكن بكاءه ورضاعته ضعيفة.
- غياب تام لردود الفعل العصبية العميقة (Deep tendon reflexes are completely absent).
- عينة العضلات تُظهر ضموراً من النوع العصبي (Neurogenic type of atrophy).

**المآل (Prognosis):** الوفاة غالباً بين عمر سنتين إلى 4 سنوات، والعلاج فقط تحفظي.

**ثانياً: شلل الأطفال (Poliomyelitis)**
**السبب (Etiology):** فيروس شلل الأطفال يهاجم ويدمر مباشرة خلايا الـ AHC في الحبل الشوكي.
**خصائص الشلل (Criteria of Weakness):**
- بداية حادة ومفاجئة (Acute onset).
- شلل غير متماثل ومتباعد (Asymmetrical and spotty distribution) يصيب غالباً العضلات الكبيرة.
- 🚨 لا يوجد أي فقدان للإحساس على الإطلاق (Absolutely NO sensory loss).
- المسار: يصل الشلل لأقصى درجاته خلال الأيام الأولى ثم قد يحدث تراجع طفيف.

**ثالثاً: متلازمة جيان‑باريه (Guillain‑Barré Syndrome - GBS)**
**التعريف:** اعتلال عصبي متعدد يحدث بعد عدوى (Post‑infectious polyneuropathy) يسبب إزالة واسعة النطاق لغلاف المايلين (demyelination) في الأعصاب الحركية وقد يمتد للأعصاب الحسية واللاإرادية.

**رابعاً: الوهن العضلي الوبيل في حديثي الولادة (Neonatal Myasthenia Gravis)**
**المقدمة:** يصيب ~12% من الأطفال المولودين لأمهات مصابات بالمرض نفسه (نقل الأجسام المضادة عبر المشيمة).
**الصورة الإكلينيكية:** تظهر الأعراض خلال 2‑3 أيام من الولادة؛ ارتخاء شديد، تجمع إفرازات في الفم (Pooling), ضعف عام. الطفل واعٍ، لكن الوجه ضعيف يفتح فمه باستمرار بنظرة محدقة.
**الفحص:** ردود الفعل العصبية العميقة طبيعية تماماً (DTRs normal)؛ نادراً ما يحدث سقوط في الجفن (Ptosis).
**التشخيص:** ضعف متذبذب يزداد مع المجهود ويُحسن بالراحة؛ تحسين فوري بعد حقن Edrophonium أو Neostigmine.
**العلاج:** حقن Neostigmine قبل الرضاعة ثم جرعات فموية.

💡 **Mnemonics (مفاتيح للتفرقة السريعة):**
1. مرض SMA: (مدرك وواعي.. بس مرتخي ولسانه بيرعش، ومفيش ريفلكسات)
2. شلل الأطفال: (شلل حاد مش متماثل.. ومفيش أي فقد للإحساس)
3. الوهن العضلي: (بيتعب مع الرضاعة ويتحسن بالراحة والحقنة.. وريفلكساته سليمة)
`,
  'Anti-Epileptic Drugs (AEDs)': `**أولاً: أشهر الأدوية المضادة للصرع واستخداماتها (Pharmacological Dosing & Side Effects)**

**Valproic Acid (Depakine):** الاستخدام: واسع المجال (Broad‑spectrum) يُستخدم في الصرع الكبرى (Grand mal)، الصغرى (Petit mal) والرمعي العضلي (Myoclonic).
الأعراض الجانبية: تسمم كبدي (Hepatotoxicity) وتساقط الشعر (Alopecia).
⚠️ ملاحظة إكلينيكية: يجب إجراء تحاليل وظائف الكبد (LFTs) كل 3 أشهر.

**Carbamazepine (Tegretol):** الاستخدام: الصرع الكبرى (Grand mal) والصرع الجزئي (Partial epilepsy).

**Ethosuximide (Zarotin & Ethoxa):** الاستخدام: مخصص للصرع الصغرى / نوبات الغياب (Petit mal / Absence epilepsy).
الأعراض الجانبية: غثيان وصداع.

**Clonazepam (Rivotril):** الاستخدام: فعال جداً في الصرع الرمعي العضلي (Myoclonic epilepsy).

**Phenytoin (Epanutin):** الأعراض الجانبية: تضخم اللثة (Gum hypertrophy) وزيادة نمو الشعر (Hirsutism).

**Phenobarbital (Sominaletta):** الأعراض الجانبية: تراجع في الوظائف الإدراكية والمعرفية (Decreased cognitive functions).

**Diazepam (Valium):** الاستخدام: يُستخدم في كل أنواع التشنجات كعلاج طوارئ، خاصة في حالة الـ Status epilepticus. (يُعطى وريدياً أو كحقن شرجية).

**ثانياً: القواعد العامة لاستخدام أدوية الصرع (General Rules of AED Use)**
*Monotherapy Initiation (البدء بدواء واحد):* يجب دائماً البدء بدواء واحد فقط.
*Dose Escalation (رفع الجرعة):* إذا لم يتم التحكم في التشنجات، ارفع الجرعة تدريجياً حتى تصل للتحكم التام، أو تصل للجرعة القصوى، أو تظهر أعراض جانبية.
*Compliance Check (التأكد من الالتزام):* إذا وصلت للجرعة القصوى بدون تحسن، تأكد أولاً أن المريض يتناول الدواء بانتظام.
  - إذا غير ملتزم: طمئن العائلة وقم بتثقيفهم بأهمية الدواء.
  - إذا ملتزم: قس مستوى الدواء في الدم (Measure serum drug levels).
    - إذا كان أقل من المستوى العلاجي ⬅️ اسمح بزيادة الجرعة.
    - إذا وصل للمستوى العلاجي وتحسن تحسناً ملحوظاً (ولكن ليس تاماً) ⬅️ أضف دواءً ثانياً للخطة.
    - إذا وصل للمستوى العلاجي بتحسن طفيف جداً ⬅️ اسحب الدواء الحالي تدريجياً واستبدله كلياً بدواء آخر.
*Side Effects Management:* إذا ظهرت أعراض جانبية مزعجة، اسحب الدواء تدريجياً واستبدله بآخر.

**ثالثاً: قواعد إيقاف العلاج (Weaning & Prolonged Therapy Rules)**
*Weaning Protocol (بروتوكول السحب):* يجب الاستمرار على العلاج لمدة سنتين إلى 3 سنوات بعد آخر نوبة تشنج مسجلة، ثم يتم سحب الدواء تدريجياً على مدار 3 إلى 6 أشهر.
🚨 *Abrupt Cessation Warning (تحذير الإيقاف المفاجئ):* إياك أن توقف أي دواء صرع فجأة؛ لأن ذلك قد يدخل المريض في حالة صرع مستمرة وقاتلة (Fatal Status Epilepticus).
*Lifelong Antiepileptics (علاج مدى الحياة):* يُستعمل في حالات الصرع العضوي (مثل الشلل الدماغي Cerebral Palsy) والحالات التي يصعب التحكم فيها.
⚠️ *First Attack Rule (قاعدة النوبة الأولى):* الطفل السليم الذي يأتي بأول نوبة تشنج في حياته، لا يجب أن يُعطى أدوية صرع (خاصة لو كان الفحص العصبي ورسم المخ EEG طبيعياً)، لأن 50% من هؤلاء الأطفال لن تتكرر لديهم النوبة أبداً.

💡 **Mnemonics لتسهيل التذكر:**
1. Mnemonic لأعراض الأدوية الجانبية (Side Effects):
(ديباكين بيوقع الشعر ويتعب الكبد.. إيبانوتين بيكبر اللثة ويطلّع شعر.. وباربيتال بينيّم المخ)
2. Mnemonic لترتيب الأدوية حسب نوع الصرع:
(جراند مال خدله ديباكين وتيجريتول.. وبيتي مال خدله زاروتين.. والمايوكلونيك ريفوتريل)
3. Mnemonic لقواعد إيقاف الدواء (Weaning Protocol):
(عدّ 3 سنين من غير تشنج.. واسحب بالتدريج على 6 شهور.. وإياك توقف فجأة)
`,
  'Cerebral Palsy (CP)': `**أولاً: التعريف والخصائص الأساسية (Definition & Core Characteristics)**

**التعريف:** الشلل الدماغي (Cerebral Palsy - CP) هو اعتلال دماغي ناتج عن خلل في الوحدة الحركية للمخ النامي، ويحدث بسبب إصابة الدماغ في فترات ما قبل، أو أثناء، أو بعد الولادة.

🚨 **Core Deficit (الخصائص الثلاثة الذهبية للتشخيص):**
Non‑progressive: غير تقدمي (المرض لا يزداد سوءاً بمرور الوقت، الإصابة ثابتة).
Non‑familial: غير عائلي.
Non‑hereditary: غير وراثي.

**Associated Deficits (المشاكل المصاحبة):** قد يصاحبه تخلف عقلي (Mental retardation)، صرع (Epilepsy)، ومشاكل في الرؤية، السمع، أو النطق.

**ثانياً: الأسباب وتوقيت الإصابة (Etiology & Timing of Insult)**
Prenatal Factors (80%): عدوى TORCH، التعرض للمواد المضرّة (Teratogens)، نقص الأكسجين داخل الرحم.
Perinatal Factors (10%): الاختناق ونقص الأكسجين أثناء الولادة (Birth asphyxia)، إصابات الولادة (Birth trauma)، النزيف داخل الجمجمة.
Postnatal Factors (10%): الصفراء الشديدة (Kernicterus)، التهاب السحايا أو المخ (Meningitis / Encephalitis).

**ثالثاً: التصنيف الإكلينيكي (Clinical Classifications)**

**A. Topographic Classification:**
- **Hemiplegia:** شلل نصفي طولي (ذراع وساق على نفس الجانب).
- **Diplegia:** إصابة الأطراف الأربعة، مع تأثر الساقين أكثر من الذراعين.
- **Quadriplegia / Tetraplegia:** إصابة الأطراف الأربعة بالتساوي أو إبرام الذراعين أكثر من الساقين.
- **Paraplegia:** إصابة الساقين فقط.
- **Monoplegia / Triplegia:** إصابة طرف واحد أو ثلاثة أطراف.

**B. Physiological Classification:**
- **Spastic CP (70‑80%):** Hypertonia، Hyperreflexia، Persistent primitive reflexes، علامة بابينسكي إيجابية.
- **Dyskinetic CP (10‑20%):** حركات غير طبيعية تشمل Chorea، Athetosis، Dystonia.
- **Ataxic CP (5‑10%):** خلل في التوازن، غياب التناسق، نستاجم.
- **Atonic / Hypotonic CP:** طفح عضلي شديد (Floppy infant) مع Hyperreflexia وتخلف عقلي شديد.

**C. Functional Classification:** تتدرج من Class 1 (بلا قيود) إلى Class 4 (لا نشاط مفيد).

**رابعاً: خطة العلاج (Multidisciplinary Management)**
فريق شامل: طبيب أطفال، أخصائي علاج طبيعي، أخصائي تخاطب، أخصائي اجتماعي.
دور طبيب الأطفال: إدارة الصرع وسوء التغذية، وصف مرخيات العضلات، الإحالة للجراحة العظمية، دعم الأسرة وتثقيفها.

💡 **Mnemonics:**
1. **Core Deficit:** (لا بيزيد، ولا بيورّث، ولا بيجري في العيلة).
2. **Diplegia vs Quadriplegia:** (الداي رجليه بايظة أكتر… والكوادري إيديه بايظة أكتر أو كلهم زي بعض).
3. **Physiological Types:** (سباستيك متخشب… ديسكينيتيك بيتحرك غصب عنه… وأتاكسيك بيطوّح ويقع).
`,
  'Early Detection of CP & Motor Development': `**أولاً: التاريخ المرضي وعوامل الخطر (Suspected History & Risk Factors)**

**Maternal Infections:** إصابة الأم بعدوى في الثلث الأول من الحمل (1st Trimester)، أشهرها الحصبة الألمانية (Rubella) والتوكسوبلازما (Toxoplasmosis).

**Neonatal Complications:** مضاعفات ما بعد الولادة مباشرة، مثل الصفراء الشديدة (Neonatal Jaundice) أو حدوث تشنجات لحديثي الولادة (Convulsions).

**ثانياً: العلامات المبكرة والملاحظة الإكلينيكية (Early Signs & Observations)**
- **تأخر عام في التطور الحركي:** (Delayed Motor Milestones).
- **مشاكل الرضاعة والنوم:** صعوبة في البلع، سيلان اللعاب المستمر (Drooling)، واضطراب النوم.
- **عدم التماثل (Asymmetrical Activity):** الطفل يحرك طرفاً أقل من الآخر (يستخدم جانباً واحداً فقط من جسمه).
- **Ventral Suspension Sign:** عند حمل الطفل ووجهه لأسفل، يرتخي تماماً ويأخذ جسمه شكل حرف U (Floppy Infant).
- **Persistent Clenched Hand:** بقاء قبضة اليد مغلقة بإحكام حتى بعد مرور 3 أشهر من العمر.
- **علامات التشنج المبكر (Early Spasticity):** صعوبة في إبعاد الفخذين عن بعضهما (Difficulty with thigh abduction)، أو تصلب غير طبيعي في الرقبة يظهر كأنه تحكم مبكر في الرأس ولكنه في الحقيقة تيبس.

**ثالثاً: استمرار ردود الفعل البدائية (Persistence of Neonatal Reflexes)**
- **ATNR (Asymmetric Tonic Neck Reflex):** استمراره بعد 3 شهور يمنع الطفل من التدحرج والتقلب (Prevents rolling).
- **Grasp Reflex:** استمراره بعد 4 شهور يمنع الطفل من الإمساك الإرادي بالأشياء.
- **Moro Reflex:** استمراره بعد 6 شهور يعيق توازن الطفل عند الجلوس.

**رابعاً: التطور الحركي غير الطبيعي (Abnormal Motor Milestones)**
- **من 1.5 إلى 3 شهور:** الطفل لا يستطيع رفع رأسه، وتكون أطرافه متيبسة ومفرودة، ويده مقبوضة.
- **من 3 إلى 6 شهور:** جذع الطفل مرتخي جداً (Floppy trunk)، وظهره مقوس بشكل غير طبيعي.
- **من 6 إلى 9 شهور:** الذراعان منثنيان للخلف، والساقان متصلبتان ومتقاطعتان مثل المقص (Stiff crossed legs)، مع ضعف التحكم في الرأس.
- **من 9 إلى 18 شهراً:** صعوبة في الوقوف، المشي على أطراف الأصابع (Tiptoe gait)، تقوس الظهر للخلف، أو استخدام جانب واحد من الجسم لجر الجانب الآخر.

**خامساً: الملخص الإكلينيكي والتشخيص (Clinical Summary & Diagnosis)**
**Cerebral Palsy** هو السبب الأشهر لمشاكل التطور الحركي في الأطفال. التشخيص المتكامل يتضمن 5 عناصر: السبب، التوزيع التشريحي، النوع الفسيولوجي، درجة القدرة الوظيفية، والمشكلات المصاحبة مثل الصرع أو التخلف العقلي.

💡 **Mnemonics لتسهيل التذكر:**
1. **Mnemonic لمواعيد اختفاء الردود العصبية (Reflexes):** رقبته تلاتة → ATNR بعد 3 شهور، إيده أربعة → Grasp بعد 4 شهور، خضته ستة → Moro بعد 6 شهور.
2. **Mnemonic للعلامات المبكرة الخطيرة للشلل الدماغي:** مرتخي ومريّل → Floppy & Drooling, إيده مقفولة → Persistent clenched hand, مبيتقلبش عشان رقبته → ATNR prevents rolling, رجله مقص → Stiff crossed legs.
`,
  'Febrile Convulsions & Epilepsy Mimickers': `**أولاً: التشنجات الحرارية (Febrile Convulsions)**

**التعريف:** هي تشنجات عامة (Generalized tonic-clonic) تصاحب الارتفاع السريع في درجة الحرارة في الرضع والأطفال، بشرط عدم وجود التهاب في الجهاز العصبي المركزي (مثل الالتهاب السحائي) أو خلل أيضي أو عصبي.

**A. المقارنة بين التشنج الحراري النمطي وغير النمطي (Typical vs. Atypical):**

**Typical Febrile Convulsion (النمطي):**
- **العمر:** من 9 شهور إلى 5 سنوات.
- **الشكل:** تشنج عام يشمل الجسم كله (Strictly generalized).
- **المدة:** قصيرة، أقل من 15 دقيقة (Brief < 15 min).
- **التكرار:** تحدث مرة واحدة فقط خلال 24 ساعة (Exactly ONE fit in 24h).
- **المآل:** نسبة تحولها لصرع حقيقي ضعيفة جداً (1% إلى 2%).

**Atypical Febrile Convulsion (غير النمطي):**
- يكفي وجود شرط واحد من الثلاثة لتشخيصها: تشنج بؤري/جزئي (Focal)، أو مدتها أطول من 15 دقيقة (Prolonged)، أو تكررت أكثر من مرة في نفس دور التعب (Repeated).
- **المآل:** نسبة تحولها لصرع حقيقي ترتفع إلى 10%.

**B. عوامل الخطر للتحول إلى صرع حقيقي (Risk Factors for Epilepsy):**
- إذا كانت التشنجات من النوع غير النمطي (Atypical features).
- وجود تاريخ عائلي إيجابي للصرع (Positive family history).
- حدوث أول تشنج حراري في عمر مبكر جداً (أقل من 9 شهور).
- تأخر في التطور الحركي والعقلي للطفل أو وجود مرض عصبي مسبق.

**C. خطة العلاج والوقاية (Treatment Protocol):**
- **أثناء النوبة (First Aid):** تأمين مجرى التنفس وإعطاء أكسجين، مع إعطاء حقنة ديازيبام شرجية (Rectal Diazepam).
- **علاج السبب:** كمادات، خافض حرارة، ومضاد حيوي إذا كان هناك التهاب (مثل التهاب اللوزتين).
- 🚨 **الوقاية (Prophylaxis Rule):** الوقاية تكون بإعطاء شراب الديازيبام بشكل متقطع (Intermittent) فقط أثناء أيام السخونة (2-3 أيام). ويُمنع منعاً باتاً إعطاء أدوية الصرع بشكل مستمر لفترات طويلة كوقاية (Prolonged continuous prophylaxis strictly NOT recommended).

**ثانياً: الحالات التي تشبه الصرع (Conditions Mimicking Epilepsy)**
- **نوبات حبس الأنفاس (Breath-Holding Spells):**
  - *Cyanotic Spells*: يحدث عندما يغضب الطفل أو يبكي بشدة ⬅️ يكتم نفسه ⬅️ يزرق ويفقد الوعي. العلاج الأساسي طمأنة الأهل، وإعطاء حديد (Oral Iron) يقلل من حدوثها.
  - *Pallid Spells*: يحدث بعد خبطة بسيطة في الرأس ⬅️ تباطؤ في ضربات القلب ⬅️ شحوب وفقدان للوعي. تُعالج بأدوية مثل الأتروبين (Atropine sulphate) في الحالات المتكررة.
- **العادة السرية في الرضع (Masturbation):** من 2 إلى 3 سنوات، الطفل يتخشب ولكن العلامة الفاصلة أنه في كامل وعيه ورسم المخ طبيعي تماماً (Consciousness completely unimpaired & Normal EEG).
- **Pseudoseizures (التشنجات الهيستيرية):** تشنجات نفسية، رسم المخ يكون طبيعياً.
- **Cough Syncope (إغماء السعال):** إغماء مؤقت بعد نوبة كحة شديدة (مثل حساسية الصدر أو السعال الديكي).
- **Simple Syncope (الإغماء البسيط):** نادراً ما يحدث قبل 10 سنوات، ويكون بسبب نشاط العصب الحائر (Vasovagal) نتيجة ألم أو خوف.

**💡 Mnemonics لتسهيل التذكر:**
1. **Mnemonic لخصائص التشنج النمطي (Typical Febrile):**
   (قصيرة، يتيمة، وعامة) – قصيرة <15 دقيقة، يتيمة مرة واحدة في 24h، عامة Generalized.
2. **Mnemonic لعوامل خطر الصرع (Risk for true epilepsy):**
   (طوّلت أو اتكررت.. الطفل متأخر أو أصغر من 9 شهور.. وعيلته فيها صرع).
3. **Mnemonic لنوبات حبس الأنفاس (Breath-holding spells):**
   (عيط وازرق نديله حديد.. اتخبط وشحب نديله أتروبين).
`,
  'Muscular Dystrophies (DMD & BMD)': `**أولاً: الشروط الأساسية لتشخيص الحثل العضلي (Obligatory Criteria for Diagnosis)**

- **Primary Myopathy:** مرض عضلي أولي (الخلل ينشأ من داخل نسيج العضلة نفسها وليس من الأعصاب).
- **Progressive Course:** مسار تقدمي (ضعف العضلات يزداد سوءاً بشكل مستمر).
- **Genetic Basis:** أساس جيني وراثي (ناتج عن طفرة جينية واضحة).
- **Histological Hallmarks:** تحلل وموت مستمر للألياف العضلية تحت الميكروسكوب (Muscle fiber degeneration).

**ثانياً: حثل دوشين العضلي (Duchenne Muscular Dystrophy - DMD)**

_الباثوفسيولوجي والوراثة:_ مرض وراثي متنحي مرتبط بالكروموسوم إكس (X‑linked recessive)، يصيب الذكور تقريباً بشكل حصري. يظهر بين عمر 3 إلى 5 سنوات. يحدث بسبب غياب كامل لبروتين الديستروفين (Complete defect in dystrophin).

**العرض السريري (Clinical Presentation):**
- **Muscle Weakness:** ضعف ثنائي ومتماثل، يتركز في العضلات القريبة (الكتف والحوض) قبل العضلات البعيدة (Proximal > distal). لا يوجد أي خلل حسّي.
- **Pelvic Girdle Signs:** مشية تشبه مشية البطة مع تقوس في الظهر (Waddling lordotic gait) وصعوبة شديدة في صعود السلالم. علامة جاور (Positive Gower sign) مميزة.
- **Shoulder Girdle Signs:** عدم القدرة على رفع الذراعين، بروز لوح الكتف للخلف (Winging of scapula).
- **Pseudohypertrophy:** تضخم ملحوظ في عضلات السمانة والكتف نتيجة ترسب الدهون والألياف بدل العضلة.
- **Preserved Muscles:** عضلات اليد، العين، صمامات الإخراج (الشرج والبول)، والحجاب الحاجز تبقى سليمة.

**المشكلات المصاحبة والمآل:**
- اعتلال عضلة القلب (Cardiomyopathy) شائع.
- تأخر عقلي صريح في ~25 % من الحالات.
- فقدان القدرة على المشي بحلول عمر 12 سنة.
- الوفاة عادةً في أواخر العقد الثاني (قبل العشرين) نتيجة فشل تنفسي أو قلبي.

**التشخيص (Diagnostic Workup):**
- **CK/CPK:** مستويات مرتفعة جداً في الدم.
- **EMG:** نمط ميوپاثي واضح.
- **Muscle Biopsy:** استبدال الألياف بالدهون والأنسجة الضامة.

**ثالثاً: حثل بيكر العضلي (Becker Muscular Dystrophy - BMD)**

_الفرق الأساسي_: بروتين الديستروفين موجود ولكنه غير كافٍ أو ضعيف الأداء (Malfunctioning/insufficient) وليس غائباً كلياً.

**العرض السريري:**
- ظهور لاحق (Late onset) في أواخر الطفولة.
- تقدم بطيء ومسار أطول بقاء على قيد الحياة.
- علامة جاور موجودة لكن أقل شدة.

**💡 Mnemonics لتسهيل التذكر:**
1. **DMD Clinical Picture:** سمانته كبيرة كدب → Pseudohypertrophy of calves؛ بيمشي زي البطة → Waddling gait؛ يبند على ركبته → Positive Gower.
2. **DMD vs BMD:** Duchenne is Deadly & Deficient (غائب تماماً)، Becker is Better & Belated (أخف وأLater).
3. **Investigations:** إنزيمات في السما → Markedly elevated CK/CPK؛ عينة مليانة دهون → Biopsy confirms fat/fibrosis replacement.
`,
  'Pediatric Seizures & Epilepsy Classification': `**أولاً: المصطلحات الأساسية للتشخيص (Core Terminology & Definitions)**

- **Seizure (النوبة / الصرعة):** نوبة مفاجئة من اضطراب النشاط الكهربائي في المخ (Paroxysmal bouts of electrical activities). قد تظهر في صورة خلل في الوعي، أو حركات غير طبيعية، أو تغيرات حسية، أو لا إرادية.
- **Convulsion (التشنج):** نوبة صرعية تظهر تحديداً في صورة أعراض حركية (Specifically a motor seizure).
- **Epilepsy (الصرع):** مرض مزمن يتميز بحدوث نوبات متكررة غير مبررة (Recurrent chronic unprovoked seizures).

🚨 **شرط التشخيص:** حدوث نوبتين أو أكثر، يفصل بينهما 24 ساعة على الأقل (> 24 hours apart)، وتكون النوبات غير مرتبطة بحرارة أو إصابة حادة في المخ.

**ثانياً: التصنيف حسب الأسباب الإكلينيكية (Clinical Etiology Classification)**

**A. Acute Convulsions (تشنجات حادة غير متكررة):**
- **Febrile Convulsions (تشنجات حرارية):** محفزة بارتفاع الحرارة بدون وجود عدوى في المخ.
- **CNS Infections (عدوى الجهاز العصبي):** مثل الالتهاب السحائي، التهاب المخ، أو خراج المخ.
- **Metabolic Disorders (اضطرابات الأيض):** نقص الكالسيوم (Hypocalcemia)، نقص السكر (Hypoglycemia)، أو اضطراب الصوديوم.
- **Encephalopathies (الاعتلال الدماغي):** مثل ارتفاع ضغط الدم الخبيث أو الفشل الكلوي (Uremic).
- **Trauma & Vascular:** خبطات الرأس أو النزيف الحاد داخل الجمجمة.
- **Space Occupying Lesions:** أورام المخ.
- **Epilepsy Onset:** أن تكون هذه النوبة هي النوبة الأولى لمرض الصرع.

**B. Recurrent Convulsions (تشنجات متكررة / الصرع):**
- **Primary / Idiopathic (أولي / غير معروف السبب):** يمثل الأغلبية العظمى (80%) من الحالات.
- **Secondary / Organic (ثانوي / عضوي):** يمثل 20% من الحالات، وله سبب ملموس مثل:
  - أمراض التمثيل الغذائي الوراثية (Inborn errors of metabolism مثل الجالاكتوزيميا).
  - أورام المخ.
  - تندب أنسجة المخ بعد الحوادث أو بعد التهاب سحائي سابق (Post‑traumatic or post‑meningitic cerebral scarring).

**ثالثاً: التصنيف الدولي للصرع (International Classification of Epilepsy)**
يُقسم الصرع حسب مصدر النشاط الكهربائي إلى بؤري (جزئي) وعام:

**A. Partial / Focal Seizures (النوبات البؤرية / الجزئية):**
- **Without Impairment of Consciousness:** بدون فقدان الوعي / المريض منتبه؛ تظهر كأعراض حركية أو حسية أو لاإرادية معزولة.
- **With Impairment of Consciousness:** مع فقدان الوعي أثناء النوبة البؤرية.
- **Focal to Bilateral Tonic‑Clonic:** تبدأ كنوبة بؤرية موضعية، ثم تنتشر لتشمل نصف المخ وتتحول إلى نوبة عامة.

**B. Generalized Seizures (النوبات العامة):**
- **Absence Seizures (نوبات الغياب):** سرحان مفاجئ (نمطي أو غير نمطي).
- **Myoclonic Seizures (النوبات الرمعية العضلية):** انقباضات مفاجئة تشبه الصدمة الكهربائية.
- **Clonic Seizures (الرمعية):** نفضات إيقاعية متكررة للطرف.
- **Tonic Seizures (التوترية):** تخشب وانقباض عضلي مستمر وعام.
- **Tonic‑Clonic Seizures (التوترية الرمعية / الصرع الأكبر):** التشنج الكلاسيكي (Grand mal) الذي يجمع بين مرحلة التخشب تليها مرحلة النفضات.
- **Atonic Seizures (فقدان التوتر العضلي):** فقدان مفاجئ وكامل لقوة العضلات مما يؤدي لسقوط الطفل.
- **Infant Spasm (التشنج الطفلي):** نوبات تشنجية قصيرة في الرضع.

**💡 Mnemonics لتسهيل التذكر في أسئلة الـ MCQs والكلينيكال:**

1. **Mnemonic لتعريف الصرع (Epilepsy Rule):** لتشخيص الصرع تذكر قاعدة الـ (2 - 24): (نوبتين على الأقل، بينهم 24 ساعة، ومن غير سبب حرارة أو خبطة).
2. **Mnemonic للتفرقة بين أنواع الـ Generalized Seizures:**
   - **Tonic = تخشب:** (T for Tough/Tense → Sustained contraction).
   - **Clonic = نفضات:** (C for Clicking/Jerking → Rhythmic jerking).
   - **Myoclonic = كهربا:** (Shock‑like).
   - **Atonic = بيقع من طوله:** (A negates tone → Complete loss of muscle tone).
3. **Mnemonic لأسباب التشنجات الحادة (Acute Convulsions):** (حرارة وعدوى.. أملاح وسكر.. خبطة وورم في المخ)

`,
  'The Floppy Infant Syndrome': `**أولاً: التعريف وعلامات الفحص الإكلينيكي (Definition & Clinical Signs)**

- **التعريف:** متلازمة الطفل المرتخي (Floppy Infant Syndrome) تعبر عن حالة من الارتخاء العضلي الشديد والمستمر (Severe persistent hypotonia) تظهر عند الولادة أو في مرحلة الرضاعة المبكرة.

- **كيفية تقييم الارتخاء إكلينيكياً:**
  - **Frog Leg Position (وضع الضفدع):** النوم مع فرد الساقين للخارج، يدل على ارتخاء شديد في الأطراف السفلية.
  - **Head Lag (سقوط الرأس للخلف):** عند سحب الطفل من يديه وهو مستلقٍ على ظهره لتوجيهه، تسقط رأسه للخلف بسبب ضعف عضلات الرقبة.
  - **Curved Trunk / Ventral Suspension (التعليق البطني):** عند حمل الطفل بوجهه لأسفل بحيث يستند بطنه على يد الفاحص، يرتخي جذعه وأطرافه ليأخذ الشكل حرف U.
  - **Slippage / Vertical Suspension (التعليق العمودي):** عند حمل الطفل من تحت إبطيه، ينزلق من بين يدي الفاحص بسبب ضعف حزام الكتف.

**ثانياً: الأسباب التشريحية (Anatomical & Etiological Causes)**

- **Cerebral Causes (أسباب دماغية/مركزية):** نقص الأكسجين حول الولادة (Perinatal Asphyxia)، اعتلال الدماغ بسبب الصفراء (Kernicterus)، الشلل الدماغي المرتخي (Atonic CP)، ومتلازمات كروموسومية مثل متلازمة داون.
- **Spinal Cord Lesions (إصابات الحبل الشوكي):** أمراض الخلايا الأمامية مثل مرض ويردنيج‑هوفمان (Werdnig‑Hoffman SMA) وشلل الأطفال (Poliomyelitis).
- **Peripheral Nerves (الأعصاب الطرفية):** متلازمة جيان‑باريه (GBS) والاعتلال العصبي الحسي الخلقي.
- **Neuromuscular Junction (الوصلة العصبية العضلية):** الوهن العضلي لحديثي الولادة (Neonatal Myasthenia Gravis)، والتسمم المُمباري للرضع (Infantile Botulism).
- **Myopathies (أمراض العضلات):** الحثل العضلي (Muscular Dystrophies) والتهابات أو أمراض العضلات الخلقية.

**ثالثاً: التفرقة التشخيصية (Central vs. Peripheral)**

- **A. Cerebral Hypotonia (الارتخاء المركزي):**
  - **المخ والوعي:** اضطراب في وظائف الدماغ، قد يصاحبها تشنجات (Seizures) أو اضطراب الوعي.
  - **الإدراك:** قد يصاحبه تخلف عقلي (Mental retardation).
  - **الشكل:** ملامح وجه غير طبيعية أو متلازمات جينية (مثل ملامح داون).
  - **🚨 العلامة العصبية الأهم:** ردود الفعل العصبية العميقة تكون موجودة وزائدة (Hyperreflexia).

- **B. Lower Motor Unit Disorders (الارتخاء الطرفي):**
  - **العضلات:** ضمور واضح في حجم العضلات مع ارتعاشات (Muscle atrophy & fasciculations).
  - **🚨 العلامة العصبية الأهم:** ردود الفعل العصبية العميقة تكون ضعيفة أو غائبة تماماً (Hyporeflexia or Areflexia).

- **التأكيد التشخيصي:** اختبار سرعة توصيل العصب (NCV) ورسم العضلات (EMG) لتحديد موقع الإصابة.

**💡 Mnemonics لتسهيل التذكر**

1. **علامات الفحص الإكلينيكي:**
   - (رأسه بتقع لورا .. جسمه بيتني زي حرف U .. رجله ضفدعة .. بيزحلق من إيدك)
2. **التفرقة بين المركزي والطرفي:**
   - (المركزي مخه تعبان بس ريفلكساته عالية .. الطرفي مخه سليم بس عضلاته ضامرة وريفلكساته واقعة)
`,
  'Status Epilepticus Emergency': `**أولاً: التعريف وخطورة الحالة (Core Definition & Crisis Risk)**

**التعريف:** نوبة تشنج تستمر أكثر من 5 دقائق متواصلة، أو حدوث أكثر من نوبة خلال 5 دقائق بدون استعادة الوعي بين النوبات.

🚨 **الخطورة:** طوارئ طبية قصوى مهددة للحياة. يؤدي الإطلاق المستمر للنواقل العصبية المحفزة (Excitatory neurotransmitters) إلى دمار دائم في خلايا المخ، مما قد ينتهي بتخلف عقلي أو صرع ثانوي أو الوفاة.

**ثانياً: الأسباب والأنواع (Etiology & Clinical Types)**

- **Prolonged Febrile Convulsion:** تشنج حراري ممتد بسبب السخونة.
- **Idiopathic Status Epilepticus:** غالباً يُحفز بالإيقاف المفاجئ لأدوية الصرع (Sudden withdrawal of anticonvulsants) أو بعدوى جهازية شديدة.
- **Symptomatic Status Epilepticus:** ناتج عن سبب عضوي مثل:
  - التهابات الجهاز العصبي المركزي (CNS Infections).
  - اضطرابات الأيض (Metabolic / IEM): Hypoglycemia، Hypocalcemia، Phenylketonuria.

**ثالثاً: المضاعفات الباثولوجية (Pathological Complications)**

- **Acute Changes:** نزيف حبري، ارتشاح في المخ، ارتفاع شديد في ضغط الدماغ (Petechial hemorrhage, cerebral edema & increased ICP).
- **Permanent Damage:** موت وتيبس الخلايا العصبية (Neuronal necrosis) → تخلف عقلي، صرع ثانوي، وأعراض خارج هرمية (Extrapyramidal manifestations).

**رابعاً: بروتوكول العلاج خطوة بخطوة (Step-by-Step Management Protocol)**

- **Step 1 – First Aid:** تأمين مجرى التنفس، شفط الإفرازات، وتوفير الأكسجين فوراً.
- **Step 2 – Immediate Anticonvulsant:**
  - بدون خط وريدي: **Rectal Diazepam** 0.3–0.5 mg/kg (max 10mg).
  - بخط وريدي: **IV Diazepam** 0.3 mg/kg بمعدل 1mg/دقيقة (max 10mg).
- **Step 3 – Non-Response:** تكرار جرعة الديازيبام بعد 10 دقائق إذا استمرت التشنجات → Continuous IV Infusion.
- **Step 4 – Sequential AED Protocol:**
  - **IV Phenytoin:** 15 mg/kg على 30 دقيقة.
  - **IV Phenobarbital:** 20 mg/kg على 30 دقيقة.
  - ⚠️ **تحذير تنفسي:** خطر تثبيط تنفسي شديد (Severe respiratory depression) إذا أُعطي الفينوباربيتال مباشرة بعد الديازيبام.
- **Step 5 – Refractory Cases:** نقل للرعاية المركزة → General Anesthesia بـ Thiopental IV مع جهاز تنفس صناعي + مراقبة بـ Continuous EEG + علاج السبب الأساسي.

**💡 Mnemonics:**

1. **ترتيب الأدوية:** (أكسجين وديازيبام.. ما نفعش فينيتوين.. ما نفعش باربيتال.. ما نفعش خدره ونيّمه).
2. **الأسباب:** (سخونة طوّلت.. دواء وقّفه فجأة.. سكر وكالسيوم وقعوا).
`,
  'Craniostenosis (Craniosynostosis)': `**أولاً: التعريف والتصنيف (Definition & Classification)**

**التعريف:** هو الانغلاق المبكر لدرز أو أكثر من دروز الجمجمة (Premature closure of cranial sutures) أثناء فترة النمو المبكرة للطفل.

**التصنيف للأسباب (Etiology):**
- **Primary (أولي):** غير معروف السبب (Idiopathic)، يحدث بسبب خلل مباشر في الخلايا البانية أو الهادمة للعظام.
- **Secondary (ثانوي):** يحدث نتيجة فشل نمو المخ الطبيعي (Failure of normal brain growth)، فتنغلق الدروز لعدم وجود ضغط يوسعها من الداخل.

**ثانياً: تشوهات الجمجمة الإكلينيكية (Skull Deformities)**

شكل الرأس يتحدد بناءً على الدرز المغلق — الرأس ينمو في الاتجاه المقابل للدرز المغلق:

- **Sagittal Suture (الدرز السهمي):** أشيع الأنواع → رأس طويل وضيق (Scaphocephaly / Dolichocephaly).
- **Coronal Suture (الدرز الإكليلي الثنائي):** رأس مسطح من الأمام ومرتفع من الأعلى (Brachycephaly).
- **Lambdoid Suture (الدرز اللامي):** رأس مسطح من الخلف (Plagiocephaly).
- **All Sutures (كل الدروز):** جمجمة برج مرتفعة (Oxycephaly / Turricephaly) → خطر ارتفاع الضغط داخل الجمجمة.

**ثالثاً: المضاعفات والعلاج (Complications & Management)**

- **الضغط داخل الجمجمة (ICP):** ارتفاع شديد يؤدي إلى ضمور بصري وتأخر عقلي.
- **الوجه:** تشوهات في الحجاج (Orbital deformities) وصعوبة في إغلاق العيون.
- **العلاج:** جراحي في السنة الأولى من العمر لفتح الدروز وإتاحة نمو طبيعي للمخ.

**💡 Mnemonics:**

1. **أنواع الجمجمة:** (السهمي → سيف طويل وضيق = Scaphocephaly.. الإكليلي → مسطح من الأمام = Brachycephaly.. كل الدروز → برج = Oxycephaly).
2. **قاعدة النمو:** (الجمجمة بتكبر في الاتجاه العكسي للدرز المغلق).
`,
  'Functional classification of cerebral palsy': `**Q1. Functional classification of cerebral palsy**\nClass 1: No limitation of activity.\nClass 2: Slight to moderate limitation.\nClass 3: Moderate to great limitation.\nClass 4: No useful physical activity.`,
  'Investigations for Duchenne Muscular Dystrophy': `**Q2. Four investigations for Duchenne Muscle Dystrophy**\n- Creatine kinase (CK) / CPK: markedly elevated.\n- Electromyography (EMG): myopathic pattern.\n- Muscle biopsy: diagnostic, showing muscle fiber degeneration with replacement with fat and fibrosis.\n- Prenatal diagnosis: amniocentesis or chorionic villous sampling (genetic). (Female carrier detection via high serum CPK can also be included).`,
  'Causes of inability to walk in children': `**Q3. Two main causes for inability to walk in children**\n- Primary inability to walk (no walk till age 18 months): paralytic factors like Cerebral palsy or non‑paralytic factors like Rickets.\n- Secondary inability to walk: paralytic factors like Muscle dystrophies or non‑paralytic factors like severe debilitating diseases.`,
  'Spastic Cerebral Palsy clinical types': `**Q4. Clinical types/topographical distribution of Spastic Cerebral Palsy**\n- Hemiplegia: arm & leg on same side.\n- Diplegia: arms and legs but legs more involved.\n- Quadriplegia / Tetraplegia: arms and legs equally involved OR arms more involved than legs.\n- Monoplegia: one limb.\n- Triplegia: three limbs.\n- Paraplegia: only legs involved.`,
  'Duchenne Muscular Dystrophy clinical features': `**Q5. Clinical features and physical findings of DMD**\n- Sex & Age: usually male, presenting at 3‑5 years.\n- Muscle Weakness: bilateral symmetrical, proximal > distal, no sensory manifestation.\n- Shoulder Girdle Weakness: unable to raise arm above the head, winging of scapula.\n- Pelvic Girdle Weakness: waddling lordotic gait, difficulty climbing stairs, positive Gower sign.\n- Pseudohypertrophy: calves, deltoid, forearm.\n- Preserved Muscles: hand, extra‑ocular, sphincters, diaphragm.\n- Associated Features: cardiomyopathy, mental subnormality (~25 %), frequent respiratory infections and UTI.\n- Progression: most patients unable to walk by 12 y; death by end of second decade (respiratory/heart failure).`,
  'Causes of microcephaly in children': `**Q6. Causes of microcephaly in children**\n*Primary (genetic)*:\n- Embryonic exposure to toxic agents early.\n- Microcephaly vera (AR).\n- Chromosomal disorders (Down, Edward).\n- Defective neurulation (anencephaly, encephalocele).\n- Defective prosencephalization (agenesis corpus callosum, holoprosencephaly).\n- Defective cellular migration (lissencephaly).\n*Secondary*:\n- Intrauterine: congenital infections (CMV, rubella, toxoplasmosis), drugs, fetal alcohol.\n- Perinatal brain injury (HIE, intracranial hemorrhage, meningitis/encephalitis).\n- Postnatal systemic disease (chronic renal disease, malnutrition).`,
  'Clinical signs of increased intracranial pressure in infant': `**Q7. Clinical signs of increased intracranial pressure (ICP) in an infant**\n- Seizures & altered consciousness.\n- Hyperreflexia.\n- Abnormal cranial expansion or frontal bowing due to ventricular enlargement.\n- Slippage on vertical suspension (severe central hypotonia).`,
  'Autism Spectrum Disorder diagnostic criteria': `**Q8. Clinical diagnostic criteria for Autism Spectrum Disorder (ASD)**\n- Persistent deficits in social communication and interaction across contexts.\n- Restricted, repetitive patterns of behavior, interests, or activities.\n- Symptoms present in early developmental period.\n- Clinically significant impairment in social, occupational, or other functional areas.`,
  'West Syndrome clinical features': `**Q9. Clinical features/diagnostic hallmarks of West Syndrome (Infantile Spasms)**\n- Onset 4‑8 months.\n- Spasms in clusters (flexor, extensor, mixed).\n- EEG hallmark: hypsarrhythmia (chaotic high‑voltage slow waves).\n- Mental retardation / developmental delay, especially in secondary/organic forms (~80 %).`,
  'Acute Bacterial Meningitis  Septic Meningitis': `**أولاً: التعريف والمسببات**

* **التعريف:** التهاب حاد في الأغشية السحائية (Meninges) مع تكوين إفرازات صديدية (Purulent exudate).
* **الانتقال:** عن طريق الرذاذ (Droplet Infection) - فترة الحضانة 3-4 أيام.

**Causative organisms according to age:**

1. **Neonatal Period:** E. coli - Group-B streptococci - Listeria monocytogenes
2. **Childhood:** Meningococci - Pneumococci - H. influenzae type-b (حتى عمر 5 سنوات)

---

**ثانياً: الصورة الإكلينيكية**

**A. علامات ارتفاع ضغط الدماغ (Signs of Increased ICP):**
1. صداع شديد (Severe headaches)
2. قيء مندفع (Projectile vomiting)
3. بروز اليافوخ في الرضع أقل من سنة (Bulging anterior fontanel)
4. تغيرات في مستوى الوعي (Changes in sensorium)
5. تشنجات عامة (Generalized convulsions)
6. علامات عصبية بؤرية (Focal neurological signs)

**B. علامات تهيج السحايا (Signs of Meningeal Irritation):**
1. **Stiffness:** تصلب في الرقبة والظهر
2. **Positive Kernig's Sign:** مقاومة عند فرد الركبة مع ثني الفخذ
3. **Positive Brudzinski's Sign:** ثني تلقائي للركبتين عند ثني الرأس للأمام
4. **Skin Rash:** طفح جلدي حبري نزفي (Generalized petechial rash)

---

**ثالثاً: الفحوصات (Investigations)**
1. **CSF Examination** عبر البزل القطني (Lumbar Puncture) - الفحص الحتمي الأساسي
2. **Blood Culture** للكشف عن الميكروبات في الدم
3. **WBC Count:** ارتفاع في الـ Neutrophils

---

**رابعاً: العلاج**
طوارئ طبية قصوى

**Antibiotic Therapy based on age:**
* **الرضع أقل من 6 شهور:** Ampicillin + Gentamicin IV
* **الرضع الأكبر والأطفال:** Ampicillin + Chloramphenicol IV

**الوقاية:** Chemoprophylaxis للمخالطين + Active Vaccination

---

Mnemonics:
* (EGL) للنيونيتال: E.coli - Group-B Strep - Listeria
* لعلامات السحايا: رقبته وظهره متخشبين، كيرنيج مابيفردش الركبة، برودزينسكي بيتنيها مع الرأس
* للمضاد الحيوي: تحت 6 شهور أمبي وجينتا.. وفوق 6 شهور أمبي وكلورو`,
  'Ancylostomiasis  Hookworms': `**أولاً: التعريف ودورة الحياة (Pathogenesis)**

* **التعريف:** عدوى طفيلية تصيب الأمعاء الدقيقة من فصيلة الديدان الأسطوانية (Nematodes)

**مسار الدودة في الجسم:**
1. **Ground Itch:** اختراق اليرقات للجلد مباشرة مسبباً حكة جلدية موضعية
2. **Loeffler-like Syndrome:** هجرة اليرقات عبر الدم للرئتين: كحة جافة، أزيز، ارتشاحات رئوية، Eosinophilia

---

**ثانياً: المضاعفات (Complications)**

1. **Malabsorption:** إسهال دهني (Steatorrhea) وتأخر في النمو
2. **Severe Iron Deficiency Anemia (الأخطر):** الديدان تتغذى على دم المريض مسببة نزيفاً مستمراً وأنيميا حادة: Fatigue - Dyspnea - Palpitations - Pica (اشتهاء الطين)

---

**ثالثاً: التشخيص (Investigations)**

1. **Stool Analysis:** Hookworm Ova + Occult blood
2. **CBC:** Hypochromic Microcytic Anemia + Eosinophilia

---

**رابعاً: العلاج (Management)**

1. **Anti-helminthic:** Mebendazole أو Flubendazole 100mg/day لمدة **3 أيام متصلة**
2. **Iron Replacement:** علاج تعويضي للحديد حتمي

---

Mnemonics:
* لدورة الحياة: (بتهرش في رجله.. وتكح في صدره.. وتشفط دمه من بطنه)
  Ground Itch --> Loeffler-like Syndrome --> Severe Iron Deficiency Anemia
* للتحاليل: (بويضات في البراز.. ودمه ناقص حديد ومليان إيزينوفيل)
* للعلاج: (موت الدودة في 3 أيام.. وعوض الدم بحديد)`,
};

  type Connection = {
  leftId: string;
  rightId: string;
  isCorrect?: boolean;
};

const MatchingGameUI = ({ question, onComplete }: { question: any, onComplete: () => void }) => {
  const [shuffledRight, setShuffledRight] = useState<{ id: string, text: string }[]>([]);
  const [leftItems, setLeftItems] = useState<{ id: string, text: string }[]>([]);
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeSelection, setActiveSelection] = useState<{ id: string, side: 'left'|'right' } | null>(null);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Force re-render lines to sync coordinates
  const [renderTick, setRenderTick] = useState(0);

  useEffect(() => {
    const handleResize = () => setRenderTick(t => t + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;
    const handleScroll = () => setRenderTick(t => t + 1);
    scrollEl.addEventListener('scroll', handleScroll);
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!question.matchingPairs) return;
    const pairs = question.matchingPairs.map((p: any, i: number) => ({ id: `pair_${i}`, ...p }));
    setLeftItems(pairs.map((p: any) => ({ id: p.id, text: p.left })));
    
    const rightList = pairs.map((p: any) => ({ id: p.id, text: p.right }));
    setShuffledRight([...rightList].sort(() => Math.random() - 0.5));
    
    setConnections([]);
    setActiveSelection(null);
    setIsSubmitted(false);
    
    // Initial sync for line coordinates after render
    setTimeout(() => setRenderTick(t => t + 1), 50);
  }, [question]);

  const getDotCoordinates = (id: string, side: 'left' | 'right') => {
    const element = itemRefs.current[`${side}_${id}`];
    if (!element || !containerRef.current) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    
    const isRightEdge = side === 'left'; 
    
    return {
      x: rect.left - containerRect.left + (isRightEdge ? rect.width + 12 : -12), // Added 12px offset for the dot perfectly
      y: rect.top - containerRect.top + (rect.height / 2)
    };
  };

  const handleItemClick = (e: React.MouseEvent, id: string, side: 'left' | 'right') => {
    e.stopPropagation();
    if (isSubmitted) return; 

    if (!activeSelection) {
      setActiveSelection({ id, side });
    } else {
      if (activeSelection.side === side) {
        if (activeSelection.id === id) {
          setActiveSelection(null); 
        } else {
          setActiveSelection({ id, side }); 
        }
      } else {
        const leftId = side === 'left' ? id : activeSelection.id;
        const rightId = side === 'right' ? id : activeSelection.id;
        
        setConnections(prev => {
          const filtered = prev.filter(c => c.leftId !== leftId && c.rightId !== rightId);
          return [...filtered, { leftId, rightId }];
        });
        
        setActiveSelection(null);
      }
    }
    setRenderTick(t => t + 1);
  };

  const handleDisconnect = (e: React.MouseEvent, connToRemove: Connection) => {
    e.stopPropagation();
    if (isSubmitted) return;
    setConnections(prev => prev.filter(c => c.leftId !== connToRemove.leftId));
    setRenderTick(t => t + 1);
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const evaluated = connections.map(conn => ({
      ...conn,
      isCorrect: conn.leftId === conn.rightId
    }));
    
    setConnections(evaluated);
    setIsSubmitted(true);
    setRenderTick(t => t + 1);
    
    const allCorrect = evaluated.length === question.matchingPairs.length && evaluated.every(c => c.isCorrect);
    if (allCorrect) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConnections(prev => prev.filter(c => c.isCorrect));
    setIsSubmitted(false);
    setRenderTick(t => t + 1);
  };

  const renderLines = () => {
    const lines: React.ReactNode[] = [];

    // Draw confirmed connections
    connections.forEach((conn, idx) => {
      const p1 = getDotCoordinates(conn.leftId, 'left');
      const p2 = getDotCoordinates(conn.rightId, 'right');
      if (!p1 || !p2) return;

      let stroke = '#94a3b8';
      let strokeWidth = 3;
      let dashArray = 'none';
      
      if (isSubmitted) {
        strokeWidth = 4;
        if (conn.isCorrect) {
          stroke = '#10b981';
        } else {
          stroke = '#f43f5e';
          dashArray = '5,5';
        }
      }

      lines.push(
        <line 
          key={`conn_${idx}`}
          x1={p1.x} y1={p1.y} 
          x2={p2.x} y2={p2.y} 
          stroke={stroke} 
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          className="transition-all duration-300"
        />
      );
    });

    // Draw active selection line (follows the currently selected point to the cursor/center)
    // Wait, we don't have cursor tracking here. Just highlighting the selected dot is enough!
    
    return lines;
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden select-none" style={{backfaceVisibility: 'hidden', touchAction: 'none'}} onClick={(e) => e.stopPropagation()}>
      <div className="w-full h-full flex flex-col p-4 md:p-6 relative" ref={containerRef}>
        
        {/* SVG Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
          {renderTick > -1 && renderLines()}
        </svg>

        <div className="mb-4 shrink-0 flex items-center justify-center gap-3 z-20">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-indigo-500 dark:text-indigo-400 font-black text-xs md:text-sm">Q</span>
          </div>
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm md:text-lg leading-snug">{question.front}</h3>
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row gap-8 md:gap-16 overflow-y-auto custom-scrollbar px-2 md:px-4 pb-24 z-20" ref={scrollContainerRef}>
          <div className="flex-1 flex flex-col gap-3 md:gap-4 relative">
            <h4 className="font-bold text-slate-400 dark:text-slate-500 text-[10px] md:text-xs uppercase tracking-widest mb-1 text-center">Terms</h4>
            {leftItems.map(item => {
              const conn = connections.find(c => c.leftId === item.id);
              const isActive = activeSelection?.id === item.id && activeSelection?.side === 'left';
              
              let borderClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600';
              if (isActive) borderClass = 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 shadow-md scale-[1.02] ring-2 ring-indigo-400/50';
              else if (conn) {
                if (isSubmitted || conn.isCorrect !== undefined) {
                  borderClass = conn.isCorrect ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'border-rose-400 bg-rose-50 dark:bg-rose-900/30';
                } else {
                  borderClass = 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20';
                }
              }

              return (
                <div
                  key={`left_${item.id}`}
                  ref={el => { itemRefs.current[`left_${item.id}`] = el; }}
                  onClick={(e) => {
                    if (conn && !isSubmitted) handleDisconnect(e, conn);
                    else handleItemClick(e, item.id, 'left');
                  }}
                  className={`
                    relative text-left p-3 md:p-4 rounded-xl border-2 transition-all font-bold text-sm md:text-base leading-snug cursor-pointer z-20 text-slate-700 dark:text-slate-200
                    ${borderClass}
                  `}
                  dir="auto"
                >
                  {item.text}
                  <div className={`absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-800 transition-colors ${isActive || conn ? 'border-indigo-500 dark:border-indigo-400 scale-125' : 'border-slate-300 dark:border-slate-600'}`} />
                </div>
              )
            })}
          </div>
          
          <div className="flex-1 flex flex-col gap-3 md:gap-4 relative">
            <h4 className="font-bold text-slate-400 dark:text-slate-500 text-[10px] md:text-xs uppercase tracking-widest mb-1 text-center">Definitions</h4>
            {shuffledRight.map(item => {
              const conn = connections.find(c => c.rightId === item.id);
              const isActive = activeSelection?.id === item.id && activeSelection?.side === 'right';
              
              let borderClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600';
              if (isActive) borderClass = 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 shadow-md scale-[1.02] ring-2 ring-indigo-400/50';
              else if (conn) {
                if (isSubmitted || conn.isCorrect !== undefined) {
                  borderClass = conn.isCorrect ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'border-rose-400 bg-rose-50 dark:bg-rose-900/30';
                } else {
                  borderClass = 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20';
                }
              }

              return (
                <div
                  key={`right_${item.id}`}
                  ref={el => { itemRefs.current[`right_${item.id}`] = el; }}
                  onClick={(e) => {
                    if (conn && !isSubmitted) handleDisconnect(e, conn);
                    else handleItemClick(e, item.id, 'right');
                  }}
                  className={`
                    relative text-left p-3 md:p-4 rounded-xl border-2 transition-all font-bold text-sm md:text-base leading-snug cursor-pointer z-20 text-slate-700 dark:text-slate-200
                    ${borderClass}
                  `}
                  dir="auto"
                >
                  <div className={`absolute top-1/2 -left-3 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-800 transition-colors ${isActive || conn ? 'border-indigo-500 dark:border-indigo-400 scale-125' : 'border-slate-300 dark:border-slate-600'}`} />
                  {item.text}
                </div>
              )
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="absolute bottom-6 left-0 w-full flex justify-center gap-4 px-4 z-30">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={connections.length < question.matchingPairs.length}
              className={`
                px-8 py-3 rounded-2xl font-black text-white shadow-lg transition-all
                ${connections.length < question.matchingPairs.length ? 'bg-slate-300 dark:bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white hover:scale-105 active:scale-95'}
              `}
            >
              Submit Answers
            </button>
          ) : (
            connections.every(c => c.isCorrect) ? (
              <div className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Perfect!
              </div>
            ) : (
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Undo2 className="w-5 h-5" /> Fix Errors
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// --- Question Types ---
interface Question {
  id: string;
  type?: 'flashcard' | 'matching' | 'case';
  category?: 'previous_years' | 'clinoma' | 'both';
  front: string;
  back?: string;
  matchingPairs?: Array<{ left: string, right: string }>;
  caseBody?: string;
  subQuestions?: Array<{ id: string, questionText: string, back: string }>;
}

const PEDIATRICS_QUESTIONS: Record<string, Question[]> = {
  "_SUBCHAPTER_Growth & Development": [
    {
      "id": "sub_gd_enum_1",
      "front": "Enumerate four clinical uses of Percentile Curves in growth charts.",
      "back": "Early detection of protein energy malnutrition (by tracking flattening of the weight curve).\nEarly detection of hydrocephalus (by tracking jumping of head circumference curve above normal percentiles).\nDetermination of risk for obesity (if BMI lies between 85th - 95th percentiles).\nDiagnosis of overweight or obesity (if BMI is above the 95th percentile)."
    },
    {
      "id": "sub_gd_enum_2",
      "front": "Enumerate four key development warning signs in children.",
      "back": "Persistence of primitive reflexes beyond 6 months of age.\nNot walking by 18 months of age.\nNo clear spoken words by 18 months of age.\nNo two-word sentences by 2 years of age."
    },
    {
      "id": "sub_gd_def_1",
      "front": "Define the terms \"Growth\" and \"Development\".",
      "back": "* Growth: Natural increase in the size of the body either by hyperplasia or hypertrophy.\n* Development: Functional maturation of the central nervous system leading to gaining skills and social adaptation."
    },
    {
      "id": "sub_gd_list_1",
      "front": "List four major causes of Delayed Walking in pediatrics.",
      "back": "Cerebral palsy.\nMental retardation.\nMuscles disorders (like Duchenne).\nChronic systemic disorders."
    },
    {
      "id": "sub_gd_match_1",
      "front": "Match the developmental milestone to the correct age.",
      "type": "matching",
      "matchingPairs": [
        { "left": "An infant can sit without support with a round back", "right": "6 Months" },
        { "left": "Social smile is expected to appear", "right": "2 Months" },
        { "left": "Moro reflex completely disappears", "right": "4 Months" },
        { "left": "An infant develops a pincer grip (grasp by thumb and finger)", "right": "9 Months" }
      ]
    },
    {
      "id": "sub_gd_case_1",
      "front": "Case 1",
      "type": "case",
      "caseBody": "A Mother brings her 18-month-old male infant to the pediatric clinic complaining that he cannot walk alone or even with support. On examination, the infant shows marked head lag on pulling up from a supine position and an exaggerated \"U-shape\" during ventral suspension.",
      "subQuestions": [
        {
          "id": "sub_gd_case_1_q1",
          "questionText": "What is your provisional diagnosis?",
          "back": "Delayed walking due to severe hypotonia (Floppy Infant syndrome)."
        },
        {
          "id": "sub_gd_case_1_q2",
          "questionText": "Mention two lower motor unit disorders that can cause this presentation.",
          "back": "1. Werdnig-Hoffmann disease (Anterior horn cell disease)\n2. Congenital myopathy / Muscular dystrophy."
        }
      ]
    },
    {
      "id": "sub_gd_case_2",
      "front": "Case 2",
      "type": "case",
      "caseBody": "A 3-year-old boy is evaluated for short stature. His height is below the 3rd percentile on the growth chart. On reviewing his medical records, his height velocity is low-normal and running parallel to the 3rd percentile. His bone age is delayed compared to his chronologic age. His parents noted that there is a history of late pubertal growth in the family.",
      "subQuestions": [
        {
          "id": "sub_gd_case_2_q1",
          "questionText": "What is the most likely diagnosis for this normal variant of growth?",
          "back": "Constitutional delay of growth and puberty (CDGP)."
        },
        {
          "id": "sub_gd_case_2_q2",
          "questionText": "How can you distinguish this condition from Familial Short Stature?",
          "back": "In Familial Short Stature, the bone age is consistent with chronologic age, whereas in CDGP, the bone age is characteristically delayed."
        }
      ]
    }
  ],
  "_SUBCHAPTER_Nutrition": [
    {
      "id": "sub_nut_enum_1",
      "front": "Enumerate the four constant features of Kwashiorkor (KWO).",
      "back": "1. Growth failure (Weight for age < 80% of reference).\n2. Pitting edema (starts in feet and legs, moon face).\n3. Mental changes (apathy, no interest in surroundings).\n4. Muscle wasting with preserved subcutaneous fat."
    },
    {
      "id": "sub_nut_enum_2",
      "front": "Enumerate the classic radiological findings (epiphyseal triad) seen in an active wrist X-ray of a child with Rickets.",
      "back": "1. Broadening of the metaphysis.\n2. Cupping (concave metaphysis).\n3. Fraying (irregular epiphyseal line)."
    },
    {
      "id": "sub_nut_def_1",
      "front": "List four anti-infective properties or factors found in human breast milk.",
      "back": "1. Secretory IgA.\n2. Bifidus factor.\n3. Lactoferrin.\n4. Lysozymes."
    },
    {
      "id": "sub_nut_def_2",
      "front": "Define Marasmus according to the clinical and anthropometric criteria.",
      "back": "It is a chronic state of protein energy malnutrition (PEM) resulting from a low intake of energy, characterized by a weight-for-age < 60% of the reference with completely absent edema, and severe loss of subcutaneous fat and muscle wasting."
    },
    {
      "id": "sub_nut_match_1",
      "front": "Match the maternal or infant clinical condition to the correct breast feeding contraindication type.",
      "type": "matching",
      "matchingPairs": [
        { "left": "Galactosemia in a newborn infant", "right": "Absolute Infant Contraindication" },
        { "left": "Maternal HIV infection", "right": "Absolute Maternal Contraindication" },
        { "left": "Acute breast abscess and mastitis", "right": "Relative Maternal Contraindication" },
        { "left": "Breast milk jaundice", "right": "Relative Infant Contraindication" }
      ]
    },
    {
      "id": "sub_nut_case_1",
      "front": "Case 1",
      "type": "case",
      "caseBody": "A 14-month-old female infant is brought to the outpatient clinic with a history of recurrent diarrhea and failure to thrive since she was weaned abruptly onto a pure carbohydrate diet (rice and starch) two months ago. On physical examination, she is irritable, has generalized pitting edema, a \"moon face\" appearance, and her hair is dry, sparse, with alternating bands of normal and light coloration.",
      "subQuestions": [
        {
          "id": "sub_nut_case_1_q1",
          "questionText": "What is the clinical diagnosis for this child?",
          "back": "Kwashiorkor (KWO)."
        },
        {
          "id": "sub_nut_case_1_q2",
          "questionText": "What does the hair sign (alternating bands of coloration) represent?",
          "back": "It is called the Flag Sign, and it signifies periods of nutritional relapse alternating with periods of normal dietary intake."
        }
      ]
    },
    {
      "id": "sub_nut_case_2",
      "front": "Case 2",
      "type": "case",
      "caseBody": "A 10-month-old exclusively breastfed infant who doesn't receive any vitamin D supplementation or sun exposure is brought with complaints of delayed teeth eruption and excessive frontal sweating. Physical examination reveals frontal bossing of the skull, a palpable rachitic rosary on the chest wall, and prominent thickening of both wrists.",
      "subQuestions": [
        {
          "id": "sub_nut_case_2_q1",
          "questionText": "What is your provisional diagnosis?",
          "back": "Nutritional Rickets (Active Rickets)."
        },
        {
          "id": "sub_nut_case_2_q2",
          "questionText": "Mention the expected biochemical changes in the serum for Calcium, Phosphorus, and Alkaline Phosphatase in this active phase.",
          "back": "* Serum Calcium: Normal (or low-normal).\n* Serum Phosphorus: Decreased.\n* Serum Alkaline Phosphatase: Markedly increased."
        }
      ]
    }
  ],
  "_SUBCHAPTER_Genetics": [
    {
      "id": "sub_gen_enum_1",
      "front": "Enumerate four dysmorphic features seen in the face and head of a child with Down Syndrome.",
      "back": "1. Upward slanting palpebral fissures.\n2. Epicanthus and Brushfield spots of iris.\n3. Small dysplastic pinnae and low set ears.\n4. Mid face hypoplasia, micrognathia, and protruded tongue."
    },
    {
      "id": "sub_gen_enum_2",
      "front": "Enumerate four indications for performing Prenatal Diagnosis in a pregnant woman.",
      "back": "1. Advanced maternal age (women aged 35 years or more).\n2. History of recurrent abortions or a previous child with chromosomal abnormalities.\n3. Parents who are carriers for chromosomal abnormalities or X-linked inherited disorders (e.g., Duchenne muscular dystrophy).\n4. Screening for inborn errors of metabolism or neural tube defects."
    },
    {
      "id": "sub_gen_def_1",
      "front": "Define Turner Syndrome and mention its most common genotype.",
      "back": "* Definition: A chromosomal disorder affecting females characterized by short stature, webbed neck, lack of development of secondary sexual characteristics due to gonadal dysgenesis, and possible cardiovascular/renal anomalies.\n* Most Common Genotype: 45X."
    },
    {
      "id": "sub_gen_def_2",
      "front": "List four invasive screening tests used for Prenatal Diagnosis.",
      "back": "1. Chorionic villus sampling (CVS).\n2. Amniocentesis.\n3. Fetal blood sampling (Cordocentesis).\n4. Fetoscopy / Fetal tissue sampling."
    },
    {
      "id": "sub_gen_match_1",
      "front": "Match the pathological condition to the correct Maternal Serum Triple Test Pattern.",
      "type": "matching",
      "matchingPairs": [
        { "left": "Maternal serum biochemical marker pattern indicating Down Syndrome", "right": "Decreased AFP, Decreased uE3, Increased HCG" },
        { "left": "Maternal serum biochemical marker pattern indicating Turner Syndrome", "right": "Normal or Decreased AFP, Decreased uE3, Increased HCG" },
        { "left": "Maternal serum biochemical marker pattern indicating Open Neural Tube Defects", "right": "Increased AFP, Not applicable uE3, Not applicable HCG" },
        { "left": "Maternal serum biochemical marker pattern indicating Edward Syndrome", "right": "Decreased AFP, Decreased uE3, Decreased HCG" }
      ]
    },
    {
      "id": "sub_gen_case_1",
      "front": "Case 1",
      "type": "case",
      "caseBody": "A 41-year-old pregnant female gives birth to a male newborn. On physical examination, the neonate shows generalized hypotonia, upward slanting palpebral fissures, a flat midface with a protruding tongue, and a single transverse palmar crease on both hands. Auscultation of the heart reveals a loud pansystolic murmur at the lower left sternal border.",
      "subQuestions": [
        {
          "id": "sub_gen_case_1_q1",
          "questionText": "What is your provisional diagnosis for this neonate?",
          "back": "Down Syndrome (Trisomy 21) associated with a Congenital Heart Defect (most likely VSD)."
        },
        {
          "id": "sub_gen_case_1_q2",
          "questionText": "Mention the most common cytogenetic type responsible for this condition and its recurrence risk.",
          "back": "Nondisjunction type (occurs in 94% of cases). It is not familial and has a low recurrence risk of less than 1-2%."
        }
      ]
    },
    {
      "id": "sub_gen_case_2",
      "front": "Case 2",
      "type": "case",
      "caseBody": "A 14-year-old girl is brought to the pediatric endocrine clinic due to severe short stature and failure to achieve menarche. On examination, her intelligence is completely normal, but she has a short webbed neck, a low posterior hairline, a broad chest with widely spaced nipples, and a wide carrying angle at her elbows. Her blood pressure is persistently elevated at 140/90 mmHg.",
      "subQuestions": [
        {
          "id": "sub_gen_case_2_q1",
          "questionText": "What is the most likely clinical diagnosis?",
          "back": "Turner Syndrome."
        },
        {
          "id": "sub_gen_case_2_q2",
          "questionText": "Mention two essential components in the long-term medical management of this condition during adolescence.",
          "back": "1. Growth Hormone therapy (to treat short stature).\n2. Estrogen replacement therapy (at the time of puberty to develop secondary sexual characteristics and manage amenorrhea)."
        }
      ]
    }
  ],
  "_SUBCHAPTER_GIT": [
    {
      "id": "sub_git_enum_1",
      "front": "Enumerate four clinical diagnostic Red Flags that suggest Organic Abdominal Pain in children.",
      "back": "1. Clearly localized pain that is localized mostly away from the umbilicus.\n2. Pain that wakes the child up from sleep at night.\n3. Pain associated with persistent fever or involuntary weight loss.\n4. Evidence of blood in the stools (occult or macroscopically obvious)."
    },
    {
      "id": "sub_git_enum_2",
      "front": "Enumerate four acute clinical manifestations of IgE-Mediated Cow's Milk Allergy (CMA).",
      "back": "1. Skin signs: Urticaria, angioedema, flushing, or pruritus.\n2. Gastrointestinal signs: Acute vomiting, abdominal pain, or diarrhea.\n3. Respiratory signs: Wheeze, cough, stridor, or rhinitis.\n4. Systemic signs: Life-threatening anaphylaxis."
    },
    {
      "id": "sub_git_def_1",
      "front": "Define \"The Acute Abdomen\" and list its three key physical signs.",
      "back": "* Definition: A sudden onset of severe abdominal pain developing rapidly over a short period of time.\n* Three Key Physical Signs:\n1. Guarding (reflex contraction of abdominal muscles).\n2. Rigidity (involuntary hardness of the abdominal wall).\n3. Rebound tenderness."
    },
    {
      "id": "sub_git_def_2",
      "front": "Differentiate between the definitions of \"Vomiting\" and \"Regurgitation\".",
      "back": "* Vomiting: Forceful oral expulsion of gastric contents associated with the contraction of the abdominal and chest wall musculature.\n* Regurgitation: The act by which food is brought back into the mouth without the abdominal and diaphragmatic muscular activity."
    },
    {
      "id": "sub_git_match_1",
      "front": "Match the clinical description to the correct Cow's Milk Allergy (CMA) dietary or emergency management choice.",
      "type": "matching",
      "matchingPairs": [
        { "left": "The first-line dietary choice for a formula-fed infant diagnosed with mild-to-moderate Cow's Milk Allergy", "right": "Extensively Hydrolyzed Formula (eHF)" },
        { "left": "Dietary management used if the infant's allergic reactions are severe or completely unresponsive to extensively hydrolyzed formula", "right": "Amino Acid Formula (AAF)" },
        { "left": "Immediate emergency treatment required for severe acute anaphylaxis due to milk allergy", "right": "Intramuscular Epinephrine injection" }
      ]
    },
    {
      "id": "sub_git_case_1",
      "front": "Case 1",
      "type": "case",
      "caseBody": "A 3-month-old formula-fed male infant is brought to the clinic with a history of chronic diarrhea, failure to thrive, and frequent streaks of blood and mucus in his stool. Physical examination reveals chronic, severe, and refractory atopic dermatitis on his cheeks and limbs. The symptoms started 3 weeks after introducing standard cow's milk formula.",
      "subQuestions": [
        {
          "id": "sub_git_case_1_q1",
          "questionText": "What is the most likely diagnosis?",
          "back": "Non-IgE-mediated Cow's Milk Allergy (CMA)."
        },
        {
          "id": "sub_git_case_1_q2",
          "questionText": "Mention the gold standard test to confirm this diagnosis.",
          "back": "Oral Food Challenge (performed strictly under medical supervision)."
        }
      ]
    },
    {
      "id": "sub_git_case_2",
      "front": "Case 2",
      "type": "case",
      "caseBody": "An 8-year-old girl presents with recurrent episodes of abdominal pain over the past 4 months. The pain is paroxysmal, has a gradual onset, and is localized mostly to the periumbilical region with no relationship to food intake or defecation. She is completely symptom-free between episodes, and her physical examination is normal with no localized tenderness or organomegaly.",
      "subQuestions": [
        {
          "id": "sub_git_case_2_q1",
          "questionText": "What is the most likely diagnosis for this child?",
          "back": "Dysfunctional / Functional Abdominal Pain (according to Rome IV criteria)."
        },
        {
          "id": "sub_git_case_2_q2",
          "questionText": "Mention two autonomic symptoms that can be associated with this condition.",
          "back": "Pallor, nausea, generalized fatigue, or anxiety."
        }
      ]
    },
    {
      "id": "sub_git_def_3",
      "front": "Define Cow's Milk Allergy (CMA).",
      "back": "Cow's Milk Allergy (CMA) is an immunologically mediated adverse reaction to one or more proteins in cow's milk, occurring mainly in infants and young children."
    },
    {
      "id": "sub_git_enum_3",
      "front": "Enumerate the major allergenic proteins in cow's milk.",
      "back": "* Casein (80%)\n* Whey proteins (20%):\n  - β-lactoglobulin\n  - α-lactalbumin"
    },
    {
      "id": "sub_git_enum_4",
      "front": "Enumerate the risk factors for developing Cow's Milk Allergy.",
      "back": "* Family history of atopy (asthma, eczema, allergic rhinitis).\n* Early exposure to cow's milk protein.\n* Atopic dermatitis.\n* Other food allergies."
    },
    {
      "id": "sub_git_saq_1",
      "front": "Mention the diagnostic tests used for Cow's Milk Allergy (CMA), and state which one is considered the gold standard.",
      "back": "* Skin Prick Test (SPT).\n* Serum Specific IgE.\n* Elimination Diet.\n* Oral Food Challenge (Gold Standard)."
    },
    {
      "id": "sub_git_saq_2",
      "front": "Mention the management recommendations for a breastfed infant diagnosed with Cow's Milk Allergy (CMA).",
      "back": "* Continue breastfeeding.\n* Maternal dietary elimination: Mother avoids milk, cheese, yogurt, and butter.\n* Calcium and vitamin D supplementation for the breastfeeding mother."
    },
    {
      "id": "sub_git_case_3",
      "front": "Case 3",
      "type": "case",
      "caseBody": "An infant presents with delayed symptoms after formula feeding, including chronic diarrhea, blood and mucus in stool, abdominal distension, constipation, and failure to thrive. Skin examination reveals chronic, refractory atopic dermatitis.",
      "subQuestions": [
        {
          "id": "sub_git_case_3_q1",
          "questionText": "What is the immunological classification of this allergy?",
          "back": "Classification: Non-IgE-Mediated Cow's Milk Allergy (Delayed reaction)."
        },
        {
          "id": "sub_git_case_3_q2",
          "questionText": "Mention the first-line and alternative formula-feeding management for this infant.",
          "back": "* First-line: Extensively Hydrolyzed Formula (eHF).\n* Alternative (if severe or unresponsive to eHF): Amino Acid Formula (AAF).\n* Note: Avoid standard formula, partially hydrolyzed formula, and goat milk."
        }
      ]
    },
    {
      "id": "sub_git_case_4",
      "front": "Case 4",
      "type": "case",
      "caseBody": "An infant develops immediate symptoms within minutes of ingesting cow's milk protein. The manifestations include urticaria, flushing, vomiting, wheeze, stridor, and eventually signs of a life-threatening systemic reaction.",
      "subQuestions": [
        {
          "id": "sub_git_case_4_q1",
          "questionText": "What is the diagnosis and its underlying mechanism?",
          "back": "Diagnosis: IgE-Mediated Cow's Milk Allergy (Acute reaction).\nMechanism: Immediate hypersensitivity reaction mediated by allergen-specific IgE antibodies bound to mast cells."
        },
        {
          "id": "sub_git_case_4_q2",
          "questionText": "How should the severe/anaphylactic reaction be managed?",
          "back": "* Immediate intramuscular epinephrine injection.\n* Emergency referral to the PICU/ER.\n* Parent education on the use of an adrenaline auto-injector (if indicated)."
        }
      ]
    },
    {
      "id": "sub_git_match_2",
      "type": "matching",
      "front": "Match the clinical/pathological description to the correct milk-related condition.",
      "matchingPairs": [
        { "left": "Immune-mediated mechanism in infancy with GI, skin, and respiratory symptoms (blood in stool common)", "right": "Cow's Milk Allergy (CMA)" },
        { "left": "Enzyme deficiency mechanism in older children with strictly GI symptoms (blood in stool never present)", "right": "Lactose Intolerance" }
      ]
    },
    {
      "id": "sub_git_match_3",
      "type": "matching",
      "front": "Match the clinical classification of CMA to its correct characteristics.",
      "matchingPairs": [
        { "left": "IgE-mediated CMA", "right": "Immediate reactions (minutes to 2 hours), mediated by IgE antibodies" },
        { "left": "Non-IgE-mediated CMA", "right": "Delayed reactions (hours to days), cell-mediated immune response" },
        { "left": "Mixed CMA", "right": "Features of both IgE and non-IgE reactions" }
      ]
    }
  ],
  "_SUBCHAPTER_Endocrinology": [
    {
      "id": "sub_endo_enum_1",
      "front": "Enumerate four secondary (systemic or endocrine) causes of Pathological Short Stature.",
      "back": "1. Endocrine causes (e.g., Hypothyroidism, Growth Hormone Deficiency, Cushing syndrome).\n2. Malnutrition / Under-nutrition (e.g., Protein Energy Malnutrition).\n3. Gastrointestinal disorders (e.g., Malabsorption syndromes like Celiac disease or Cystic Fibrosis).\n4. Chronic Renal diseases (e.g., Chronic uremia, Pyelonephritis)."
    },
    {
      "id": "sub_endo_enum_2",
      "front": "Enumerate four clinical precipitating factors that can lead to Diabetic Ketoacidosis (DKA).",
      "back": "1. Acute Infections (most commonly Urinary Tract Infections - UTIs).\n2. Negligence of parents or patient to give insulin therapy (omission of insulin).\n3. Physical trauma or major surgical stress.\n4. Severe psychological disturbances."
    },
    {
      "id": "sub_endo_def_1",
      "front": "Define \"Short Stature\" according to the standard pediatric growth criteria.",
      "back": "It is a term applied to a child whose height is 2 Standard Deviations (SD) or more below the mean for children of that same sex and chronologic age (and ideally of the same racial-ethnic group). It is also considered if growth velocity is below the 25th percentile over 6-12 months of observation."
    },
    {
      "id": "sub_endo_def_2",
      "front": "List four endocrine or genetic causes/syndromes associated with Childhood Obesity.",
      "back": "1. Hypothyroidism.\n2. Cushing syndrome.\n3. Prader-Willi Syndrome.\n4. Congenital Leptin deficiency."
    },
    {
      "id": "sub_endo_match_1",
      "front": "Match the clinical and biochemical details to the correct Diabetic Ketoacidosis (DKA) Severity Classification.",
      "type": "matching",
      "matchingPairs": [
        { "left": "Venous pH between 7.15 - 7.25, plasma HCO3 is 10 - 15 mEq/L, patient has Kussmaul respirations and is oriented but sleepy or arousable", "right": "Moderate DKA" },
        { "left": "Venous pH < 7.15, plasma HCO3 < 10 mEq/L, patient presents with severe Kussmaul or depressed respiration, deep sleep to depressed sensorium, or coma", "right": "Severe DKA" },
        { "left": "Venous pH between 7.25 - 7.35, plasma HCO3 is 16 - 20 mEq/L, patient is oriented, alert but fatigued", "right": "Mild DKA" }
      ]
    },
    {
      "id": "sub_endo_case_1",
      "front": "Case 1",
      "type": "case",
      "caseBody": "A 5-month-old infant is brought to the pediatric clinic by his mother because of a severe delay in physical and mental development. On physical examination, the child's growth is severely stunted with short extremities, the anterior fontanel is wide open, the eyes appear far apart with a depressed nasal bridge, and the infant keeps his mouth open with a thick, broad protruding tongue. The skin is dry and scaly.",
      "subQuestions": [
        {
          "id": "sub_endo_case_1_q1",
          "questionText": "What is the most likely diagnosis for this neglected presentation?",
          "back": "Congenital Hypothyroidism (CHT)."
        },
        {
          "id": "sub_endo_case_1_q2",
          "questionText": "Mention the standard screening test protocol used to detect this condition early in the first week of life.",
          "back": "Neonatal screening via a heel-prick blood test performed between the 3rd and 7th day of age to measure serum TSH levels (highly successful if TSH > 20 uIU/ml)."
        }
      ]
    },
    {
      "id": "sub_endo_case_2",
      "front": "Case 2",
      "type": "case",
      "caseBody": "A 9-year-old girl is brought to the emergency department presenting with severe vomiting, persistent abdominal pain, and rapid, deep breathing (Kussmaul respiration). Her parents noted that she had a history of progressive weight loss, polyuria, and excessive thirst (polydipsia) over the past two weeks. On examination, she is intensely dehydrated and drowsy. Laboratory tests show a random plasma glucose of 400 mg/dL and a venous pH of 7.12.",
      "subQuestions": [
        {
          "id": "sub_endo_case_2_q1",
          "questionText": "What is your clinical diagnosis for this acute medical emergency?",
          "back": "Severe Diabetic Ketoacidosis (DKA) secondary to newly diagnosed Type 1 Diabetes Mellitus."
        },
        {
          "id": "sub_endo_case_2_q2",
          "questionText": "List four essential lines of medical management required immediately for this patient.",
          "back": "1. Hospitalization (admission to PICU).\n2. Correction of fluids (IV fluid resuscitation for dehydration).\n3. Insulin therapy (continuous low-dose IV insulin infusion).\n4. Correction of electrolytes (especially monitoring and replacement of Potassium)."
        }
      ]
    },
    {
      "id": "sub_endo_def_3",
      "front": "Define Type 1 Diabetes Mellitus.",
      "back": "Type 1 Diabetes Mellitus is the most common metabolic disorder of childhood and adolescence. It is a syndrome of disturbed energy homeostasis caused by deficiency of insulin, resulting in abnormal metabolism of carbohydrates, fats, and proteins. Both genetic susceptibility and environmental factors are involved in its etiology."
    },
    {
      "id": "sub_endo_enum_3",
      "front": "Enumerate the diagnostic criteria for Diabetes Mellitus according to standard guidelines.",
      "back": "* Glycosylated hemoglobin (HbA1C) >= 6.5%.\n* Fasting Plasma Glucose (FPG) >= 126 mg/dL (7.0 mmol/L).\n* 2-hour post-load glucose during OGTT >= 200 mg/dL (11.1 mmol/L).\n* Random plasma glucose >= 200 mg/dL (11.1 mmol/L) associated with classic symptoms of diabetes."
    },
    {
      "id": "sub_endo_enum_4",
      "front": "Enumerate the acute and long-term microvascular complications of Type 1 Diabetes Mellitus.",
      "back": "* Acute complications:\n  - Diabetic Ketoacidosis (DKA).\n  - Hypoglycemia.\n* Long-term microvascular diseases:\n  - Diabetic retinopathy.\n  - Diabetic nephropathy.\n  - Diabetic neuropathy.\n  - Diabetic cardiomyopathy."
    },
    {
      "id": "sub_endo_saq_1",
      "front": "Mention the pathophysiological mechanisms of Diabetes Mellitus.",
      "back": "* Core defects:\n  1. Insulin deficiency (destruction of beta cells).\n  2. Insulin resistance at peripheral tissues.\n* Other mechanisms (The Ominous Octet):\n  - Incretin deficiency / resistance.\n  - Increased glucagon secretion.\n  - Increased hepatic glucose production.\n  - Increased renal threshold for glucose.\n  - Neurotransmitter dysfunction in the brain.\n  - Increased lipolysis."
    },
    {
      "id": "sub_endo_saq_2",
      "front": "Mention the 4 autoantibodies that serve as markers of beta cell autoimmunity in Type 1 Diabetes Mellitus.",
      "back": "* Islet cell antibodies (ICA).\n* Glutamic acid decarboxylase antibodies (GAD-65).\n* Insulin autoantibodies (IAA).\n* IA-2A (antibodies to protein tyrosine phosphatase)."
    },
    {
      "id": "sub_endo_case_3",
      "front": "Case 3",
      "type": "case",
      "caseBody": "A diabetic child presents to the hospital with deep rapid respiration (Kussmaul respiration), an odor of acetone on the breath, severe dehydration, and abdominal pain. Laboratory tests reveal blood glucose > 300 mg%, and venous pH is 7.20.",
      "subQuestions": [
        {
          "id": "sub_endo_case_3_q1",
          "questionText": "What is the diagnosis and its clinical classification based on the pH level?",
          "back": "Diagnosis: Diabetic Ketoacidosis (DKA).\nClassification: Moderate DKA (as venous pH is between 7.15 and 7.25)."
        },
        {
          "id": "sub_endo_case_3_q2",
          "questionText": "Enumerate the lines of management for this condition.",
          "back": "1. Hospitalization (admission to PICU).\n2. Correction of fluids (IV fluid resuscitation).\n3. Correction of electrolytes (especially Potassium).\n4. Correction of acid-base balance.\n5. Insulin therapy (continuous low-dose IV infusion).\n6. Management of precipitating causes (e.g., infections)."
        }
      ]
    },
    {
      "id": "sub_endo_case_4",
      "front": "Case 4",
      "type": "case",
      "caseBody": "A thin child presents with sudden onset of polyuria, polydipsia, and polyphagia. Laboratory tests show low endogenous insulin and the presence of autoantibodies.",
      "subQuestions": [
        {
          "id": "sub_endo_case_4_q1",
          "questionText": "What is the most likely type of diabetes in this patient?",
          "back": "Type 1 Diabetes Mellitus."
        },
        {
          "id": "sub_endo_case_4_q2",
          "questionText": "Mention the other classic clinical manifestations of this disease.",
          "back": "* Classic presentation: Polyuria, polydipsia, and polyphagia.\n* Systemic: Weight loss, lethargy, weakness, and abdominal pain.\n* Infections: Repeated infections (e.g., urinary tract infections, candidiasis).\n* Acute Emergency: Diabetic Ketoacidosis (DKA)."
        }
      ]
    },
    {
      "id": "sub_endo_match_2",
      "type": "matching",
      "front": "Match the type of insulin to its correct pharmacokinetic characteristics.",
      "matchingPairs": [
        { "left": "Rapid-acting insulin", "right": "Takes effect within 15 minutes, taken before a meal" },
        { "left": "Regular/Short-acting insulin", "right": "Takes effect within 30-60 minutes, imitates bolus secretion" },
        { "left": "Intermediate-acting insulin", "right": "Lasts 10-16 hours, generally taken twice a day, imitates basal secretion" },
        { "left": "Long-acting insulin", "right": "Lasts 20-24 hours, usually taken once a day" }
      ]
    },
    {
      "id": "sub_endo_match_3",
      "type": "matching",
      "front": "Match the clinical profiles to the correct type of Diabetes Mellitus.",
      "matchingPairs": [
        { "left": "Sudden onset in children, thin/normal body size, common DKA, low/absent endogenous insulin", "right": "Type 1 Diabetes Mellitus" },
        { "left": "Gradual onset in older/obese patients, rare DKA, absent autoantibodies, insulin resistance", "right": "Type 2 Diabetes Mellitus" }
      ]
    }
  ],
  "_SUBCHAPTER_Hematology & Oncology": [
    {
      "id": "sub_hem_enum_1",
      "front": "Enumerate four clinical features (symptoms and signs) of Iron Deficiency Anemia (IDA) in children.",
      "back": "1. Pallor, weakness and fatigue.\n2. Glossitis.\n3. Cheilitis (inflammation/fissures of lips).\n4. Pica (intense craving for nonfood items like clay, dirt, chalk, or paper)."
    },
    {
      "id": "sub_hem_enum_2",
      "front": "Enumerate four diagnostic laboratory findings in the Iron Profile of a patient with Iron Deficiency Anemia.",
      "back": "1. Low serum iron.\n2. Low serum ferritin.\n3. Increased Total iron binding capacity (TIBC).\n4. Decreased transferrin saturation (TS)."
    },
    {
      "id": "sub_hem_enum_3",
      "front": "Enumerate the three criteria required to diagnose Severe Aplastic Anemia in a patient with a hypocellular bone marrow.",
      "back": "Hypocellular BM with two of the following:\n1. Platelet count of less than 20,000/mm³.\n2. Absolute reticulocyte count of less than 40,000/mm³.\n3. Absolute neutrophil count (ANC) of less than 500/mm³."
    },
    {
      "id": "sub_hem_enum_4",
      "front": "Enumerate four prognostic factors used to determine the outcome in Acute Lymphoblastic Leukemia (ALL).",
      "back": "1. Age (between 1 and 9 years is favorable, less than 1 or more than 10 is less favorable).\n2. White blood cell count (WBCs less than 50 x 10⁹/L is favorable).\n3. Immunophenotype (B-precursor has a better prognosis than T cell).\n4. Sex (Girls have a more favorable prognosis than Boys)."
    },
    {
      "id": "sub_hem_enum_5",
      "front": "Enumerate four triggers or precipitating factors that can produce acute episodes of intravascular hemolysis in G6PD deficiency.",
      "back": "1. Fava beans ingestion (favism).\n2. Infections and acute illnesses (e.g., Sepsis, hepatitis).\n3. Diabetic ketoacidosis (DKA).\n4. Oxidative Medications (such as Sulfonamides, aspirin, or chloramphenicol)."
    },
    {
      "id": "sub_hem_def_1",
      "front": "Define Immune Thrombocytopenia (ITP) in children.",
      "back": "It is an acquired autoimmune disorder characterized by an isolated low platelet count (platelet count <100,000/microL with completely normal WBCs and hemoglobin) resulting from antibody-mediated platelet destruction and impaired platelet production."
    },
    {
      "id": "sub_hem_def_2",
      "front": "List the three systemic symptoms classified as \"B symptoms\" in Hodgkin Lymphoma (HL) staging.",
      "back": "1. Unexplained fever higher than 38°C.\n2. Weight loss more than 10% of total body weight over 6 months.\n3. Drenching night sweats."
    },
    {
      "id": "sub_hem_def_3",
      "front": "Define Hereditary Spherocytosis (HS) and mention its primary mode of inheritance.",
      "back": "* Definition: It is an inherited chronic hemolytic anemia caused by a defect or dysfunction in spectrin or ankyrin (components of the RBC cytoskeleton), leading to a loss of cell surface area and resulting in a spherical shape of RBCs with premature destruction in the spleen.\n* Inheritance: Autosomal dominant (AD) mode of inheritance in 75% of cases."
    },
    {
      "id": "sub_hem_match_1",
      "front": "Match the clinical condition to the correct Coagulation & Hematological Screening Profile.",
      "type": "matching",
      "matchingPairs": [
        { "left": "The classic initial screening laboratory pattern indicating Hemophilia A or B", "right": "Prolonged aPTT, Normal PT, normal platelet count, normal bleeding time" },
        { "left": "The initial screening laboratory profile indicating acute childhood Immune Thrombocytopenia (ITP)", "right": "Normal aPTT, Normal PT, severely decreased platelet count" },
        { "left": "The laboratory profile indicating acute consumption of factors and platelets in Disseminated Intravascular Coagulopathy (DIC)", "right": "Prolonged aPTT, Prolonged PT, prolonged TT, markedly increased D-Dimer, reduced platelet count" }
      ]
    },
    {
      "id": "sub_hem_case_1",
      "front": "Case 1",
      "type": "case",
      "caseBody": "A 3-year-old girl is brought to the pediatric outpatient clinic with a sudden appearance of a widespread petechial rash and multiple bruises over her lower limbs. Her parents state that she is otherwise perfectly active, well, completely afebrile, and has no bone pain. On physical examination, there is no significant lymphadenopathy or hepatosplenomegaly. Initial CBC shows an isolated platelet count of 12,000/mm³, with normal hemoglobin and normal WBC count.",
      "subQuestions": [
        {
          "id": "sub_hem_case_1_q1",
          "questionText": "What is your clinical diagnosis for this well active child?",
          "back": "Newly diagnosed primary Immune Thrombocytopenia (ITP)."
        },
        {
          "id": "sub_hem_case_1_q2",
          "questionText": "Mention two first-line medical therapies that can be initiated if the child develops significant mucosal membrane bleeding.",
          "back": "1. Glucocorticoids (oral Prednisone or IV Methylprednisolone).\n2. Intravenous Immunoglobulin (IVIG)."
        }
      ]
    },
    {
      "id": "sub_hem_case_2",
      "front": "Case 2",
      "type": "case",
      "caseBody": "An 8-month-old male infant is evaluated for progressive pallor, weakness, and failure to thrive that became noticeable during the second 6 months of life. Physical examination reveals severe pallor, maxilla hyperplasia with a flat nasal bridge and frontal bossing (thalassemic facies), and marked hepatosplenomegaly. Hemoglobin electrophoresis is performed, demonstrating a marked increase in HbF% and a complete absence of HbA.",
      "subQuestions": [
        {
          "id": "sub_hem_case_2_q1",
          "questionText": "What is the most likely diagnosis for this infant?",
          "back": "Homozygous beta-thalassemia (Thalassemia Major / Cooley anemia)."
        },
        {
          "id": "sub_hem_case_2_q2",
          "questionText": "Mention two essential pillars in the long-term medical management of this major quantitative hemoglobinopathy.",
          "back": "1. Chronic regular blood transfusion (maintaining hemoglobin levels at 9-10 g/dL).\n2. Iron chelator therapy (such as Deferoxamine or oral Deferasirox, initiated when serum ferritin is >1000 ng/mL)."
        }
      ]
    }
  ],
  "_SUBCHAPTER_CVS": [
    {
      "id": "sub_cvs_enum_1",
      "front": "Enumerate four indications and timing for the closure (surgical or device) of a Ventricular Septal Defect (VSD).",
      "back": "1. Failure to thrive (if growth failure cannot be improved by medical therapy).\n2. If the pulmonary artery (PA) pressure is more than 50% of systemic pressure (should be closed by the end of the first year).\n3. Dilated left-sided chambers.\n4. Intractable congestive heart failure."
    },
    {
      "id": "sub_cvs_enum_2",
      "front": "Enumerate four clinical precipitating factors that can trigger a Hypercyanotic spell (Tetrad spell) in a child with Tetralogy of Fallot (TOF).",
      "back": "1. Crying (which increases pulmonary vascular resistance).\n2. Feeding or awakening from naps.\n3. Fever (which reduces systemic vascular resistance).\n4. Defecation or straining."
    },
    {
      "id": "sub_cvs_enum_3",
      "front": "Enumerate four manifestations of systemic congestion seen in Right-Sided Heart Failure in older children.",
      "back": "1. Congested pulsating neck veins.\n2. Enlarged tender liver (congested liver).\n3. Pain in the epigastrium and right hypochondrium.\n4. Anorexia, nausea, and vomiting (congested stomach)."
    },
    {
      "id": "sub_cvs_def_1",
      "front": "Define the classic diagnostic triad of Heart Failure in infants.",
      "back": "The classic diagnostic triad of Heart Failure in infants comprises:\n1. Tachypnea.\n2. Tachycardia.\n3. Enlarged tender liver."
    },
    {
      "id": "sub_cvs_def_2",
      "front": "Define complete Transposition of the Great Arteries (TGA) and mention its characteristic finding on a Chest X-ray.",
      "back": "* Definition: A cyanotic congenital heart disease where two independent circulations exist; the aorta arises anteriorly from the right ventricle (RV) carrying desaturated blood to the body, and the aorta arises posteriorly from the left ventricle (LV) carrying oxygenated blood back to the lungs.\n* Chest X-ray finding: Narrow mediastinum with mild cardiomegaly / Egg-shaped heart."
    },
    {
      "id": "sub_cvs_match_1",
      "front": "Match the clinical or diagnostic description to the correct cardiovascular contour or pulse finding.",
      "type": "matching",
      "matchingPairs": [
        { "left": "The characteristic cardiac contour seen on a Chest X-ray in a patient with Tetralogy of Fallot (TOF) due to RV hypertrophy and a concave pulmonary segment", "right": "Boot-shaped heart (Coeur en sabot)" },
        { "left": "The classic peripheral pulse finding characteristic of a large Patent Ductus Arteriosus (PDA)", "right": "Water-hammer pulse (Bounding peripheral pulses)" },
        { "left": "The clinical phenomenon that occurs in PDA if pulmonary vascular obstructive disease develops, causing cyanosis only in the lower half of the body", "right": "Differential cyanosis" },
        { "left": "The typical chest X-ray contour finding in a patient with d-transposition of the great arteries (TGA)", "right": "Egg-shaped heart" }
      ]
    },
    {
      "id": "sub_cvs_case_1",
      "front": "Case 1",
      "type": "case",
      "caseBody": "A 2-month-old female infant is brought to the emergency department with severe feeding difficulty, excessive sweating during feeding, and poor weight gain. On physical examination, she is tachypneic and tachycardic, and her liver is palpable 4 cm below the costal margin and tender. Auscultation reveals a loud, harsh pansystolic murmur best heard at the lower left sternal border.",
      "subQuestions": [
        {
          "id": "sub_cvs_case_1_q1",
          "questionText": "What is the most likely diagnosis for this infant?",
          "back": "Large Ventricular Septal Defect (VSD) complicated by Congestive Heart Failure (CHF)."
        },
        {
          "id": "sub_cvs_case_1_q2",
          "questionText": "Mention the standard medical management guidelines utilized initially to control heart failure in this case.",
          "back": "Treatment with diuretics and Angiotensin-Converting Exchange (ACE) inhibitors, alongside frequent feedings of high-calorie formulas."
        }
      ]
    },
    {
      "id": "sub_cvs_case_2",
      "front": "Case 2",
      "type": "case",
      "caseBody": "A 7-month-old boy known to have cyanotic congenital heart disease is brought to the clinic. While crying intensely during examination, the infant suddenly develops severe dyspnea, deeply increased cyanosis, and rapid, deep respirations, followed by generalized weakness and somnolence.",
      "subQuestions": [
        {
          "id": "sub_cvs_case_2_q1",
          "questionText": "What is the medical term for this acute life-threatening event?",
          "back": "Hypercyanotic spell / Tetrad spell."
        },
        {
          "id": "sub_cvs_case_2_q2",
          "questionText": "Mention the diagnostic cardiac anomaly layout of this disease and explain how squatting or the knee-chest position works to relieve this spell.",
          "back": "* Layout (Tetralogy of Fallot): VSD, overriding aorta, pulmonary stenosis, and right ventricular hypertrophy.\n* Mechanism of relief: Squatting increases systemic vascular resistance (SVR), which reduces the right-to-left shunt and improves pulmonary blood flow."
        }
      ]
    },
    {
      "id": "sub_cvs_enum_4",
      "front": "Enumerate the measures for the medical management of Congestive Heart Failure (CHF) in a patient with Acute Rheumatic Fever.",
      "back": "* Complete bed rest with orthopneic position and moist, cool oxygen.\n* Prednisone for severe carditis of recent onset.\n* Digoxin used with caution, starting with half the usual recommended loading dose.\n* Furosemide (1 mg/kg every 6 to 12 hours) if diuretics are indicated."
    },
    {
      "id": "sub_cvs_saq_1",
      "front": "Mention the medical treatment of Congestive Heart Failure (CHF) in infants with Ventricular Septal Defect (VSD).",
      "back": "* Medical treatment is indicated with diuretics and Angiotensin-Converting Enzyme (ACE) inhibitors for 2 to 4 months.\n* Nutritional support: Frequent feedings of high-calorie formulas, either by nasogastric tube or oral feeding, to support growth."
    },
    {
      "id": "sub_cvs_saq_2",
      "front": "Mention the clinical signs of Congestive Heart Failure (CHF) in symptomatic newborns with Coarctation of the Aorta (COA).",
      "back": "* General: Poor feeding and dyspnea.\n* Physical findings: A loud gallop rhythm and weak, thready peripheral pulses (with no significant heart murmur in sick infants)."
    },
    {
      "id": "sub_cvs_case_3",
      "front": "Case 3",
      "type": "case",
      "caseBody": "An infant presents with delayed growth and development, decreased exercise tolerance (tachypnea and excessive sweating with feeding), and symptoms of CHF. On examination, a harsh pansystolic murmur is heard on the lower left sternal border.",
      "subQuestions": [
        {
          "id": "sub_cvs_case_3_q1",
          "questionText": "What is the most likely diagnosis?",
          "back": "Moderate to large Ventricular Septal Defect (VSD) complicated by Congestive Heart Failure."
        },
        {
          "id": "sub_cvs_case_3_q2",
          "questionText": "Enumerate the indications for surgical or device closure of this defect.",
          "back": "* Failure to thrive (if growth failure cannot be improved by medical therapy).\n* Pulmonary artery (PA) pressure > 50% of systemic pressure (closure should be done by the end of the 1st year).\n* Dilated left-sided cardiac chambers.\n* Intractable congestive heart failure.\n* Subaortic VSD causing aortic regurgitation (AR)."
        }
      ]
    },
    {
      "id": "sub_cvs_match_2",
      "type": "matching",
      "front": "Match the Congenital Heart Disease (CHD) classification to its correct list of conditions.",
      "matchingPairs": [
        { "left": "Acyanotic CHD with left to right shunt", "right": "VSD, PDA, ASD, Endocardial cushion defect (ECD)" },
        { "left": "Acyanotic CHD without shunt (Obstructive lesions)", "right": "Coarctation of the Aorta, Aortic Stenosis, Pulmonary Stenosis" },
        { "left": "Acyanotic CHD without shunt (Non-obstructive lesions)", "right": "Dextrocardia" },
        { "left": "Cyanotic congenital heart diseases", "right": "Complete Transposition of the Great Arteries (TGA) & Tetralogy of Fallot (TOF)" }
      ]
    },
    {
      "id": "sub_cvs_match_3",
      "type": "matching",
      "front": "Match the Congenital Heart Disease (CHD) to its characteristic auscultatory finding.",
      "matchingPairs": [
        { "left": "Atrial Septal Defect (ASD)", "right": "Second heart sound widely split and fixed, with soft systolic ejection murmur over pulmonary area" },
        { "left": "Patent Ductus Arteriosus (PDA)", "right": "Grade 1 to 4 of 6 continuous 'machinery' murmur, best audible at the left infraclavicular area" },
        { "left": "Ventricular Septal Defect (VSD)", "right": "Harsh (grade 3 to 5 of 6) pansystolic murmur on lower left sternal border propagated all over the precordium" },
        { "left": "Pulmonary Stenosis", "right": "Systolic ejection murmur (grade 2 to 5/6), best audible at the upper left sternal border and transmitting to the back" }
      ]
    },
    {
      "id": "sub_cvs_case_4",
      "front": "Case 4",
      "type": "case",
      "caseBody": "A child experiences sudden episodes of becoming dyspneic and intensely cyanotic (hypercyanotic or \"tetrad\" spells). The mother notices that the child often assumes a \"squatting\" position after physical activity. On examination, a systolic ejection murmur is located along the middle and upper left sternal border. Chest X-ray shows a boot-shaped heart (coeur en sabot).",
      "subQuestions": [
        {
          "id": "sub_cvs_case_4_q1",
          "questionText": "What is the diagnosis?",
          "back": "Tetralogy of Fallot (TOF) associated with hypercyanotic spells."
        },
        {
          "id": "sub_cvs_case_4_q2",
          "questionText": "Enumerate the four classic components of this disease.",
          "back": "1. Ventricular Septal Defect (VSD).\n2. Overriding Aorta (aorta overrides the VSD).\n3. Pulmonary Stenosis (generally infundibular in location).\n4. Right Ventricular Hypertrophy."
        }
      ]
    },
    {
      "id": "sub_cvs_case_5",
      "front": "Case 5",
      "type": "case",
      "caseBody": "A premature infant presents with poor weight gain, decreased exercise tolerance, and repeated lower respiratory tract infections. Examination reveals bounding peripheral pulses with a water hammer pulse. Auscultation reveals a continuous \"machinery\" murmur at the left infraclavicular area.",
      "subQuestions": [
        {
          "id": "sub_cvs_case_5_q1",
          "questionText": "What is the diagnosis?",
          "back": "Large Patent Ductus Arteriosus (PDA)."
        },
        {
          "id": "sub_cvs_case_5_q2",
          "questionText": "Mention the medical management indicated for this condition in premature infants.",
          "back": "In premature infants with symptomatic PDAs, cyclooxygenase inhibitors such as indomethacin, ibuprofen, or recently paracetamol are highly effective and widely used to pharmacologically close the PDA."
        }
      ]
    }
  ],
  "_SUBCHAPTER_Infection": [
    {
      "id": "sub_inf_enum_1",
      "front": "Enumerate four respiratory or neurological complications of Measles.",
      "back": "1. Pneumonia.\n2. Otitis media.\n3. Laryngitis & Laryngo-tracheo-bronchitis.\n4. Post-infectious or Parainfectious encephalitis (or SSPE / Sinusitis)."
    },
    {
      "id": "sub_inf_enum_2",
      "front": "Enumerate four clinical features or signs of increased intra-cranial tension seen in Acute Bacterial Meningitis.",
      "back": "1. Headache & Vomiting (usually projectile).\n2. Bulging anterior fontanel (in infants < 1 year of age).\n3. Changes in sensorium.\n4. Convulsions (usually generalized)."
    },
    {
      "id": "sub_inf_def_1",
      "front": "Define Roseola Infantum and mention its pathognomonic link between fever and rash.",
      "back": "* Definition: A viral infection common in infants aged 6 months–2 years, caused mainly by Human herpes virus-6 (HHV-6).\n* Fever and Rash link: It is characteristically presenting with a high fever for 3–5 days, followed by a sudden fall of temperature (onset of drop of fever) and the immediate appearance of a maculopapular rash."
    },
    {
      "id": "sub_inf_def_2",
      "front": "List four major clinical features or peripheral blood findings in a patient with Infectious Mononucleosis.",
      "back": "1. Fever.\n2. Sore throat.\n3. Cervical lymphadenopathy.\n4. Atypical lymphocytes in peripheral blood (or Fatigue / Hepatosplenomegaly)."
    },
    {
      "id": "sub_inf_match_1",
      "front": "Match the clinical description to the correct causative viral pathogen.",
      "type": "matching",
      "matchingPairs": [
        { "left": "An acute viral infection characterized by a highly contagious itchy vesicular rash appearing in different stages described as 'dew drops on a rose petal'", "right": "Varicella-zoster virus (VZV)" },
        { "left": "Caused by an RNA paramyxovirus and characterized by painful parotid gland swelling and fever, with risks of complicating into orchitis or pancreatitis", "right": "Mumps virus" },
        { "left": "Associated with a characteristic triad of fever, sore throat, and cervical lymphadenopathy, with a peripheral blood film showing atypical lymphocytes", "right": "Epstein–Barr virus (EBV)" },
        { "left": "The causative pathogen of a childhood exanthem where maculopapular rashes characteristically appear only with the onset of drop of fever", "right": "Human herpes virus-6 (HHV-6)" }
      ]
    },
    {
      "id": "sub_inf_case_1",
      "front": "Case 1",
      "type": "case",
      "caseBody": "A 14-month-old infant is brought to the emergency room with a history of abrupt onset of high-grade fever, projectile vomiting, and extreme irritability. On physical examination, the infant has a bulging and tense anterior fontanel. When the pediatrician attempts to perform rapid passive flexion of the infant's head, a severe neck stiffness is noted, and this maneuver is immediately accompanied by a brisk, involuntary flexion of both knees.",
      "subQuestions": [
        {
          "id": "sub_inf_case_1_q1",
          "questionText": "What is your provisional diagnosis for this infant?",
          "back": "Acute Bacterial Meningitis (Septic Meningitis)."
        },
        {
          "id": "sub_inf_case_1_q2",
          "questionText": "What is the medical term for the sign elicited during head flexion, and what is the specific antibiotic combination if the patient is an infant < 6 months old?",
          "back": "* Sign term: Positive Brudzinski's sign.\n* Antibiotic combination (< 6 months): Ampicillin + Gentamicin (IV)."
        }
      ]
    },
    {
      "id": "sub_inf_case_2",
      "front": "Case 2",
      "type": "case",
      "caseBody": "A 3-year-old boy presents with a 4-day history of high fever, severe cough, coryza, and conjunctivitis. On examining the buccal mucosa, the pediatrician detects small, bluish-white spots opposite the second molar teeth. The next day, a prominent maculopapular rash appears at the hairline and begins spreading downwards to involve the face and neck.",
      "subQuestions": [
        {
          "id": "sub_inf_case_2_q1",
          "questionText": "What is the clinical diagnosis for this child?",
          "back": "Measles (Morbilli)."
        },
        {
          "id": "sub_inf_case_2_q2",
          "questionText": "What is the medical term for the pathognomonic spots found on the buccal mucosa, and what therapeutic agent reduces morbidity and mortality in these children?",
          "back": "* Spots term: Koplik spots.\n* Therapeutic Agent: Oral Vitamin A."
        }
      ]
    },
    {
      "id": "sub_inf_match_2",
      "type": "matching",
      "front": "Match the infectious exanthem disease to its correct causative organism.",
      "matchingPairs": [
        { "left": "Erythema infectiosum (5th disease)", "right": "Parvovirus B19" },
        { "left": "Roseola infantum (6th disease)", "right": "Human Herpesvirus-6 (HHV-6)" },
        { "left": "Chickenpox (Varicella)", "right": "Varicella-Zoster Virus (VZV)" },
        { "left": "Measles (Rubeola)", "right": "RNA Paramyxovirus / Measles virus" }
      ]
    },
    {
      "id": "sub_inf_match_3",
      "type": "matching",
      "front": "Match the infectious disease to its characteristic prodrome or initial presentation.",
      "matchingPairs": [
        { "left": "Measles (Rubeola)", "right": "High fever, 3 Cs (Cough, Coryza, Conjunctivitis), and Koplik spots opposite second molars" },
        { "left": "Rubella (German measles)", "right": "Low-grade fever with characteristic postauricular and suboccipital lymphadenopathy" },
        { "left": "Roseola infantum (6th disease)", "right": "High fever for 3-5 days, with abrupt defervescence before rash appears" },
        { "left": "Erythema infectiosum", "right": "Mild or absent prodrome, followed by a classic 'Slapped cheek' appearance" }
      ]
    },
    {
      "id": "sub_inf_match_4",
      "type": "matching",
      "front": "Match the infectious disease to the correct description of its rash.",
      "matchingPairs": [
        { "left": "Chickenpox (Varicella)", "right": "Pruritic rash evolving from macules to papules to vesicles to crusts ('dewdrops on a rose petal')" },
        { "left": "Measles (Rubeola)", "right": "Maculopapular rash starting at hairline/behind ears, spreading downward, followed by desquamation" },
        { "left": "Erythema infectiosum", "right": "Reticular or lacy rash appearing on the trunk and extremities" },
        { "left": "Rubella (German measles)", "right": "Maculopapular rash starting on face with rapid downward spread, characteristically fading in 3 days" }
      ]
    },
    {
      "id": "sub_inf_match_5",
      "type": "matching",
      "front": "Match the infectious disease to its potential classic complications.",
      "matchingPairs": [
        { "left": "Measles (Rubeola)", "right": "Otitis media, pneumonia, post-infectious encephalitis, and delayed lethal SSPE" },
        { "left": "Rubella (German measles)", "right": "Congenital Rubella Syndrome (CRS) if contracted during early pregnancy" },
        { "left": "Erythema infectiosum", "right": "Aplastic crisis in patients with hemoglobinopathies, and hydrops fetalis in pregnancy" },
        { "left": "Roseola infantum (6th disease)", "right": "Febrile seizures due to the rapid rise of high-grade fever" }
      ]
    }
  ],
  "_SUBCHAPTER_Neurology": [
    {
      "id": "sub_neuro_enum_1",
      "front": "Enumerate four topographic (anatomic) classifications of Cerebral Palsy (CP).",
      "back": "1. Hemiplegia: Arm & Leg on the same side of the body.\n2. Diplegia: Arms and Legs involved, but legs are more involved.\n3. Quadriplegia (Tetraplegia): Arms and Legs equally involved or arms more involved than legs.\n4. Monoplegia (one limb involved) / Paraplegia (only legs involved)."
    },
    {
      "id": "sub_neuro_enum_2",
      "front": "Enumerate four clinical signs used to diagnose severe persistent hypotonia in a Floppy Infant.",
      "back": "1. Frog leg position: denotes hypotonia of lower limbs.\n2. Head lag: when pulling the baby up from his hands in a supine position, the head lags backwards.\n3. Curved trunk on ventral suspension: when suspended in a prone position over the examiner's hand, the baby drops around it.\n4. Slippage on vertical suspension: denotes hypotonia of shoulder girdle muscles."
    },
    {
      "id": "sub_neuro_enum_3",
      "front": "Enumerate the four obligatory criteria characterized by Muscular Dystrophies.",
      "back": "1. Primary myopathy.\n2. Progressive course.\n3. Genetic basis.\n4. Characteristic muscle fiber degeneration and muscle cell death at some stage."
    },
    {
      "id": "sub_neuro_def_1",
      "front": "Define Cerebral Palsy (Little's Disease).",
      "back": "It is an encephalopathy resulting from malfunction of the motor unit of the developing brain due to brain insult during prenatal, natal, and postnatal periods, leading to a central motor deficit that is characteristically non-progressive, non-familial, and non-hereditary."
    },
    {
      "id": "sub_neuro_def_2",
      "front": "List four lower motor unit disorders/levels that can cause Floppy Infant syndrome.",
      "back": "1. Spinal cord lesion: Anterior horn cell disease (Werdnig-Hoffmann spinal muscular atrophy).\n2. Peripheral nerves: Acute polyneuropathy (Guillain-Barré Syndrome).\n3. Neuromuscular junction: Neonatal myasthenia gravis / Infantile botulism.\n4. Myopathies: Muscular dystrophies / Congenital myopathies."
    },
    {
      "id": "sub_neuro_match_1",
      "front": "Match the physiological classification of CP or clinical reflex to the correct clinical description.",
      "type": "matching",
      "matchingPairs": [
        { "left": "Characterized by hypertonia with hyperreflexia, a positive Babinski sign, and persistence of primitive neonatal reflexes", "right": "Spastic CP" },
        { "left": "Characterized by abnormal involuntary movements such as chorea, athetosis, and dystonia, with variable muscle tone", "right": "Dyskinetic CP" },
        { "left": "Passive rotation of the head to one side causes extension of limbs on the same side and flexion of contralateral limbs; its persistence beyond 3 months prevents rolling", "right": "Asymmetric tonic neck reflex" },
        { "left": "A primitive neonatal reflex that is considered a warning sign of developmental delay if it persists beyond 6 months of age", "right": "Moro reflex" }
      ]
    },
    {
      "id": "sub_neuro_case_1",
      "front": "Case 1",
      "type": "case",
      "caseBody": "A 4-year-old male boy is brought to the pediatric neurology clinic by his parents because of progressive difficulty running and climbing stairs. On physical examination, he shows a waddling lordotic gait and uses his hands to \"climb up\" his own thighs to stand up from a sitting position on the floor. The pediatrician notices firm, prominent pseudohypertrophy of his calf muscles.",
      "subQuestions": [
        {
          "id": "sub_neuro_case_1_q1",
          "questionText": "What is the most likely diagnosis for this boy?",
          "back": "Duchenne Muscle Dystrophy (DMD)."
        },
        {
          "id": "sub_neuro_case_1_q2",
          "questionText": "Mention one blood enzyme test that is consistently markedly elevated and one diagnostic test to confirm this disease.",
          "back": "* Blood Enzyme Test: Creatine kinase (CK) or Creatine phosphokinase (CPK).\n* Confirmative Test: Muscle biopsy (shows muscle fiber degeneration with replacement with fat and fibrosis)."
        }
      ]
    },
    {
      "id": "sub_neuro_case_2",
      "front": "Case 2",
      "type": "case",
      "caseBody": "A 10-month-old infant with a history of severe perinatal birth asphyxia is evaluated for delayed motor milestones. His mother notices that he cannot sit without support and keeps his hands tightly clenched. On physical examination, there is an early abnormal neck support, and the pediatrician notes a significant difficulty in abducting his thighs during a diaper change.",
      "subQuestions": [
        {
          "id": "sub_neuro_case_2_q1",
          "questionText": "What is your provisional diagnosis for this infant?",
          "back": "Spastic Cerebral Palsy (CP)."
        },
        {
          "id": "sub_neuro_case_2_q2",
          "questionText": "List two prenatal or perinatal risk factors associated with the etiology of this condition.",
          "back": "1. Prenatal: TORCH infection / teratogens / intrauterine hypoxia.\n2. Perinatal: Birth asphyxia / birth trauma / intracranial hemorrhage."
        }
      ]
    }
  ],
  "_CHAPTER_Growth & development": [
    {
      "id": "gd_saq1",
      "front": "Define the following terms: Growth and Development.",
      "back": "Growth: Natural increase in the size of the body either by (hyperplasia) through multiplication of different cells of different organs or (hypertrophy) through increase in the cell size.\n\nDevelopment: Functional maturation of the central nervous system that leading to gaining skills and social adaptation."
    },
    {
      "id": "gd_saq2",
      "front": "Enumerate four types of childhood growth patterns.",
      "back": "General (somatic) growth pattern.\n\nLymphatic growth pattern.\n\nGenital growth pattern.\n\nNeural growth pattern."
    },
    {
      "id": "gd_saq3",
      "front": "Enumerate four clinical uses of standard deviation (SD) curves in growth charts.",
      "back": "Diagnosis of short stature if the height is -2SD below the mean.\n\nDiagnosis of tall stature if the height is +2SD above the mean.\n\nDiagnosis of microcephaly if head circumference is -2SD below the mean.\n\nDiagnosis of macrocephaly if head circumference is +2SD above the mean."
    },
    {
      "id": "gd_saq4",
      "front": "Enumerate four causes of delayed bone age.",
      "back": "Malnutrition.\n\nHypopituitarism.\n\nHypothyroidism.\n\nHypoparathyroidism."
    },
    {
      "id": "gd_saq5",
      "front": "Enumerate four key development warning signs in children.",
      "back": "Discrepant head size or crossing centile lines (too large or too small).\n\nPersistence of primitive reflexes > 6 months of age.\n\nNot walking by 18 months.\n\nNo clear spoken words by 18 months."
    },
    {
      "id": "gd_saq6",
      "front": "Enumerate four causes of delayed walking.",
      "back": "Cerebral palsy.\n\nMental retardation.\n\nPeripheral nerves disorders.\n\nMuscles disorders."
    },
    {
      "id": "gd_match1",
      "front": "Match the developmental milestone with the correct normal median age of achievement:",
      "type": "matching",
      "matchingPairs": [
        {
          "left": "Social smile",
          "right": "2 months"
        },
        {
          "left": "Sitting without support",
          "right": "8 months"
        },
        {
          "left": "Pincer grip",
          "right": "9 months"
        },
        {
          "left": "Walking well",
          "right": "15 months"
        }
      ]
    },
    {
      "id": "gd_case1_q1",
      "front": "Case 1: A mother brings her 10-month-old infant to your clinic for a routine check-up. On physical examination, you note that the infant can sit steadily without support with a straight back and can creep on the floor. However, the infant cannot stand or walk alone yet.\n\nIs this infant's gross motor development normal or delayed based on his current age?",
      "back": "Normal development, as sitting without support with a straight back is expected by 8 months , and creeping is achieved at 9 months."
    },
    {
      "id": "gd_case1_q2",
      "front": "Case 1: A mother brings her 10-month-old infant to your clinic for a routine check-up. On physical examination, you note that the infant can sit steadily without support with a straight back and can creep on the floor. However, the infant cannot stand or walk alone yet.\n\nAt what age is walking well typically achieved?",
      "back": "15 months."
    },
    {
      "id": "gd_case2_q1",
      "front": "Case 2: An 18-month-old child is brought to the pediatric clinic because he is still unable to walk independently and has no clear spoken words.\n\nIdentify the two key development warning signs present in this child.",
      "back": "Not walking by 18 months and no clear spoken words by 18 months."
    },
    {
      "id": "gd_case2_q2",
      "front": "Case 2: An 18-month-old child is brought to the pediatric clinic because he is still unable to walk independently and has no clear spoken words.\n\nEnumerate two muscular or neurological causes that could lead to delayed walking in this child.",
      "back": "Cerebral palsy and muscles disorders."
    }
  ],
  "_CHAPTER_Infections": [
    {
      "id": "inf_saq_1",
      "front": "Define the following terms:\nFever of Unknown Origin (FUO): Fever >38°C for >14 days with no cause found by clinical history, physical examination, and routine laboratory tests.",
      "back": "Fever of Unknown Origin (FUO): Fever >38°C for >14 days with no cause found by clinical history, physical examination, and routine laboratory tests."
    },
    {
      "id": "inf_saq_2",
      "front": "Define the following terms:\nDysentery: It is defined as diarrhea with visible blood in the stool.",
      "back": "Dysentery is defined as diarrhea with visible blood in the stool."
    },
    {
      "id": "inf_saq_3",
      "front": "Define the following terms:\nPertussis (Whooping Cough): An acute respiratory infection which is caused by Bordetella pertussis (a Gram-negative bacillus).",
      "back": "Pertussis (Whooping Cough) is an acute respiratory infection caused by Bordetella pertussis (a Gram-negative bacillus)."
    },
    {
      "id": "inf_saq_4",
      "front": "Define the following terms:\nAcute Bacterial Meningitis (\"Septic Meningitis\"): Acute inflammation of the meninges covering the brain and spinal cord, with the production of a purulent exudate.",
      "back": "Acute Bacterial Meningitis (\"Septic Meningitis\") is acute inflammation of the meninges covering the brain and spinal cord, with production of a purulent exudate."
    },
    {
      "id": "inf_saq_5",
      "front": "Enumerate four nervous or respiratory complications associated with Measles. (Any 4)",
      "back": "Possible answers include: Pneumonia, Otitis media, Post-infectious or parainfectious encephalitis, Subacute sclerosing pan-encephalitis (SSPE), Laryngitis and laryngo-tracheo-bronchitis."
    },
    {
      "id": "inf_saq_6",
      "front": "Enumerate four clinical features characteristic of the prodromal and eruptive stages of Scarlet Fever. (Any 4)",
      "back": "Possible answers include: Acute onset of high fever (40°C) with severe sore throat and purulent tonsillar exudate, Diffuse finely papular erythematous eruption that blanches on pressure, Flushed cheeks with circum-oral pallor, White strawberry tongue progressing to red strawberry tongue, Skin desquamation of hands and feet at end of first week."
    },
    {
      "id": "inf_saq_7",
      "front": "Enumerate the three distinct clinical stages of a Pertussis infection and their durations.",
      "back": "1. Catarrhal Stage: 1-2 weeks.\n2. Paroxysmal Stage: 2-4 weeks.\n3. Convalescent Stage: 1-2 weeks."
    },
    {
      "id": "inf_saq_8",
      "front": "Enumerate the common causative organisms of Acute Bacterial Meningitis in the neonatal period versus childhood.",
      "back": "Neonatal: E. coli, Group-B streptococci, Listeria monocytogenes.\nChildhood: Neisseria meningitidis, Streptococcus pneumoniae, Haemophilus influenzae type-b (up to 5 years)."
    },
    {
      "id": "inf_saq_9",
      "front": "Enumerate four non-infectious causes or categories that can present as a Fever of Unknown Origin (FUO).",
      "back": "Possible answers: Juvenile Rheumatoid Arthritis (JRA), Systemic Lupus Erythematosus (SLE), Leukemia, Lymphoma, Neuroblastoma, Drug fever."
    },
    {
      "id": "inf_saq_10",
      "front": "Enumerate four systemic or intestinal clinical manifestations of Ancylostomiasis (Hookworm infestation).",
      "back": "Possible answers: \"Ground itch\" at skin invasion, Loeffler-like pulmonary syndrome (dry cough, wheeze, eosinophilia), Abdominal pain, distension and steatorrhea, Severe hypochromic microcytic iron-deficiency anemia (pica, fatigue, dyspnea, palpitations)."
    },
    {
      "id": "inf_match_1",
      "type": "matching",
      "front": "Match the pathognomonic clinical sign, skin manifestation, or diagnostic test in Group (A) with its exact matching disease or description in Group (B).",
      "matchingPairs": [
        { "left": "Koplik spots", "right": "Small spots erupting on the buccal mucosa opposite the second molar teeth, pathognomonic for Measles." },
        { "left": "Widal test", "right": "An agglutination test that demonstrates antibodies against somatic \"O\" and flagellar \"H\" antigens to diagnose Typhoid fever." },
        { "left": "Rose spots", "right": "A skin rash appearing on the lower chest and abdomen at the end of the 1st week of Typhoid fever." },
        { "left": "Brudzinski's sign", "right": "A sign of meningeal irritation where rapid passive flexion of the head is accompanied by brisk flexion of both knees." }
      ]
    },
    {
      "id": "inf_case1_q1",
      "front": "Case 1: A 5-year-old boy presents with abrupt high fever (40°C), severe sore throat, purulent tonsillar exudate, and within 24 hours a diffuse bright red erythematous rash that blanches on pressure, flushed cheeks with circum-oral pallor, and a red strawberry tongue. What is the most likely diagnosis?",
      "back": "Scarlet Fever."
    },
    {
      "id": "inf_case1_q2",
      "front": "What is the specific causative organism and toxin responsible for Scarlet Fever?",
      "back": "Group A beta-hemolytic streptococci producing an erythrogenic toxin."
    },
    {
      "id": "inf_case1_q3",
      "front": "Drug of choice to eradicate Scarlet Fever and two late non-suppurative complications to screen for?",
      "back": "Drug of choice: Penicillin (or Erythromycin if allergic). Late complications: Rheumatic fever and acute post-streptococcal glomerulonephritis."
    },
    {
      "id": "inf_case2_q1",
      "front": "Case 2: 11-month-old infant with severe coughing bouts, 5-10 forceful coughs per expiration followed by a loud \"whoop\" and post-cough vomiting. No trans-placental immunity or vaccination. What is the clinical diagnosis and current disease stage?",
      "back": "Pertussis (Whooping Cough), Paroxysmal stage."
    },
    {
      "id": "inf_case2_q2",
      "front": "What CBC finding supports the diagnosis of Pertussis?",
      "back": "Marked leukocytosis with absolute lymphocytosis."
    },
    {
      "id": "inf_case2_q3",
      "front": "Standard antimicrobial treatment regimen and duration for Pertussis?",
      "back": "Erythromycin 50 mg/kg/day in 4 divided doses for 14 days."
    },
    {
      "id": "inf_case3_q1",
      "front": "Case 3: 3-year-old with high fever, severe headache, vomiting, petechial rash, rigid neck, positive Kernig and Brudzinski signs. What is the diagnosis and likely organism?",
      "back": "Acute Bacterial Meningitis (Septic Meningitis), most likely Meningococci due to petechial rash."
    },
    {
      "id": "inf_case3_q2",
      "front": "What is the urgent diagnostic investigation required for Acute Bacterial Meningitis?",
      "back": "Lumbar puncture for CSF analysis, culture, and antibiotic sensitivity testing."
    },
    {
      "id": "inf_case4_q1",
      "front": "Case 4: 7-year-old girl with 9-day fever, headache, anorexia, muscle pain, coated tongue, abdominal distension, splenomegaly, normocytic anemia, leukopenia with relative lymphocytosis, eosinopenia. Most suspected diagnosis?",
      "back": "Typhoid Fever (Enterica)."
    },
    {
      "id": "inf_case4_q2",
      "front": "Which investigation is likely positive in the second week of Typhoid Fever to detect specific antibodies?",
      "back": "Widal test detecting antibodies against O and H antigens."
    },
    {
      "id": "inf_case4_q3",
      "front": "Preferred intravenous antibiotic treatment and pediatric dose for Typhoid Fever?",
      "back": "Ceftriaxone 50-80 mg/kg/day administered as a single daily dose."
    },
    {
      "id": "inf_case5_q1",
      "front": "Case 5: 4-year-old with restless sleep, irritability, nocturnal anal pruritus, teeth grinding, similar symptoms in siblings. Most likely parasitic infestation?",
      "back": "Enterobiasis (Pinworm infestation)."
    },
    {
      "id": "inf_case5_q2",
      "front": "What is the definitive laboratory diagnosis for Enterobiasis?",
      "back": "Finding characteristic eggs via cellophane tape test from peri-anal skin."
    },
    {
      "id": "inf_case5_q3",
      "front": "Treatment protocol and crucial epidemiological rule for the family in Enterobiasis?",
      "back": "Single oral dose of 100 mg Mebendazole or Flubendazole repeated after 2-3 weeks; all infected individuals and family members must be treated simultaneously."
    }
  ],
  "_CHAPTER_Nutrition": [
    {
      "id": "nut_infant_req_cf",
      "front": "What are the approximate Caloric and Fluid daily requirements for a healthy infant in the first 6 months?",
      "back": "- Caloric: ~110-120 kcal/kg/day (drops to ~100 kcal/kg/day from 6-12 months).\n- Fluids: ~150 ml/kg/day (crucial to prevent dehydration due to large surface area).",
      "type": "flashcard"
    },
    {
      "id": "nut_infant_supp",
      "front": "State the guidelines for Vitamin D, Vitamin K, and Iron supplementation in infants.",
      "back": "- Vitamin D: 400 IU/day from birth to 1 year to prevent Rickets.\n- Vitamin K: IM injection at birth to prevent Hemorrhagic disease of the newborn.\n- Iron: Stores last for the first 4-6 months, after which iron-rich foods must be introduced to prevent Anemia.",
      "type": "flashcard"
    },
    {
      "id": "nut_infant_nutrients",
      "front": "Enumerate the basic nutritional requirements for a healthy infant.",
      "back": "Mnemonic: (ميه وسكر وبروتين.. دهون ومعادن وفيتامين)\n\n1. Water (Fluids)\n2. Carbohydrates (Lactose)\n3. Proteins\n4. Fats (essential for Brain/Neurological development)\n5. Vitamins (e.g., Vit D, Vit K)\n6. Minerals (e.g., Iron, Calcium, Zinc)",
      "type": "flashcard"
    },
    {
      "id": "nut_rickets_def",
      "front": "Define Rickets and state its primary causes.",
      "back": "- Definition: Defective mineralization of growing bones (occurs only in children before epiphyses closure).\n- Causes: Vitamin D deficiency, Calcium deficiency, or Phosphorus deficiency.",
      "type": "flashcard"
    },
    {
      "id": "nut_rickets_cp",
      "front": "Enumerate the Clinical Picture of Rickets (from head to toe).",
      "back": "Mnemonic: (رأسه طرية ومربعة متأخرة في التسنين.. صدره محبب ومطبق.. وإيده ورجله عراض ومقوسين)\n\n- Head: Craniotabes, Frontal bossing (Box-like head), Delayed closure of anterior fontanelle, Delayed dentition.\n- Chest: Rachitic rosary, Harrison's sulcus.\n- Extremities: Broadening of wrists & ankles, Bow legs (Genu varum), Knock knees (Genu valgum).",
      "type": "flashcard"
    },
    {
      "id": "nut_rickets_inv_tmt",
      "front": "Enumerate the Investigations & Treatment of Rickets.",
      "back": "- Labs: Serum Ca (Normal/Low), Serum P (Low), ALP (Very High - best marker for activity/healing).\n- X-ray (wrist/hand): Cupping, Fraying, Widening.\n- Treatment: Vitamin D (daily or Stoss therapy) + Calcium supplementation (to prevent Hungry bone syndrome/Tetany).",
      "type": "flashcard"
    },
    {
      "id": "nut_tetany_latent",
      "front": "Define Tetany and describe the signs of Latent Tetany.",
      "back": "- Definition: Hyperexcitability of neuromuscular system due to Hypocalcemia.\n- Latent Tetany (requires stimulus):\n  1. Chvostek's sign: Facial muscle spasm on tapping Facial nerve.\n  2. Trousseau's sign: Carpal spasm after inflating BP cuff above systolic for 3 mins.",
      "type": "flashcard"
    },
    {
      "id": "nut_tetany_manifest",
      "front": "Enumerate the signs of Manifest Tetany.",
      "back": "Mnemonic: (قفشة في إيده ورجله، تشنج في مخه، وشرقة في حنجرته)\n\n1. Carpopedal spasm (painful spasm in hands/feet).\n2. Laryngospasm (causes stridor, can be fatal).\n3. Convulsions (Generalized seizures).",
      "type": "flashcard"
    },
    {
      "id": "nut_pem_def",
      "front": "Define Protein Energy Malnutrition (PEM) and differentiate between Marasmus and Kwashiorkor.",
      "back": "PEM is a spectrum of diseases caused by severe deficiency of proteins, calories, or both.\n\n- Marasmus: Severe energy (calorie) deficiency.\n- Kwashiorkor: Severe protein deficiency despite adequate carbohydrate calories.\n- Marasmic-Kwashiorkor: Mixed features of both.",
      "type": "flashcard"
    },
    {
      "id": "nut_pem_causes",
      "front": "Enumerate the causes of PEM.",
      "back": "Mnemonic: (جهل وفقر جابوا عدوى.. وأكل ناقص وقت الفطام)\n\n1. Dietary inadequacy\n2. Ignorance & Poverty\n3. Infections (e.g., Gastroenteritis, Measles)\n4. Faulty weaning (too early/late without proper supplements)",
      "type": "flashcard"
    },
    {
      "id": "nut_pem_marasmus",
      "front": "Describe the Clinical Picture of Marasmus.",
      "back": "Mnemonic: (عجوز جعان ومتعصب، جلد وعضم من غير ورم)\n\n1. Severe wasting of muscle & subcutaneous fat (starts in abdomen, ends in face).\n2. Senile face / Old man look (loss of buccal pad of fat).\n3. Irritable & Hungry.\n4. No Edema.\n5. Subnormal temperature & Bradycardia (to conserve energy).",
      "type": "flashcard"
    },
    {
      "id": "nut_pem_kwashiorkor",
      "front": "Describe the Clinical Picture of Kwashiorkor.",
      "back": "Mnemonic: (قمر مورّم، كبده كبير، شعره بيقع ومالوش نفس)\n\n1. Edema (Starts in lower limbs, becomes generalized due to Hypoalbuminemia).\n2. Moon face.\n3. Apathetic & Anorexic.\n4. Hepatomegaly (Fatty liver).\n5. Hair & Skin changes (Flaky paint dermatosis, hair falls easily).",
      "type": "flashcard"
    },
    {
      "id": "nut_hm_colostrum",
      "front": "What is Colostrum, when is it secreted, and what are its main characteristics?",
      "back": "- Secreted in the first days (days 1-5).\n- Yellowish, small amount, but very rich in Proteins and Immunoglobulins (especially Secretory IgA).\n- Acts as a mild laxative to help clear Meconium.",
      "type": "flashcard"
    },
    {
      "id": "nut_hm_mature",
      "front": "Compare Transitional milk and Mature milk (including Foremilk vs. Hindmilk).",
      "back": "- Transitional (days 5-14): Increased volume, fats, and carbs. Proteins decrease.\n- Mature (after 14 days):\n  * Foremilk (start of feed): rich in water, lactose, proteins (quenches thirst).\n  * Hindmilk (end of feed): rich in fats (gives energy and satiety).",
      "type": "flashcard"
    },
    {
      "id": "nut_hm_comp",
      "front": "Describe the Proteins and Carbohydrates composition in Human Milk.",
      "back": "- Proteins: Ideal Whey to Casein ratio (approx 60:40), making it very easy to digest compared to cow's milk.\n- Carbs: High Lactose, provides energy, aids Calcium absorption, and stimulates Lactobacillus bifidus (beneficial bacteria).",
      "type": "flashcard"
    },
    {
      "id": "nut_hm_fats",
      "front": "Why are the Fats in Human Milk essential for the infant?",
      "back": "Contains Essential fatty acids (like DHA & ARA) which are absolutely critical for Brain and Retinal development.",
      "type": "flashcard"
    },
    {
      "id": "nut_hm_advantages",
      "front": "Enumerate the advantages of Breastfeeding.",
      "back": "Mnemonic: (أكل مجاني بيحمي من العدوى.. وحضن بيحمي الأم من النزيف والكانسر)\n1. Nutritional: Ideal, complete, easy to digest.\n2. Economic & Convenient: Free, always ready, sterile, perfect temp.\n3. Immunological: Protects from infections (IgA, Macrophages, Lactoferrin).\n4. Psychological: Mother-infant bonding.\n5. Maternal benefits: Uterine involution, Lactational amenorrhea, decreases Breast & Ovarian cancer risk.",
      "type": "flashcard"
    },
    {
      "id": "nut_wean_artificial_ind",
      "front": "When is Artificial Feeding (Formulas) indicated?",
      "back": "Only in cases of Breastfeeding Contraindications or insufficient breast milk production.",
      "type": "flashcard"
    },
    {
      "id": "nut_wean_artificial_comp",
      "front": "Enumerate the main complications and risks of Artificial Feeding.",
      "back": "- Gastroenteritis & Infections (due to contaminated bottles)\n- Malnutrition (if formula is over-diluted)\n- Cow's milk protein allergy\n- Obesity (due to overfeeding)",
      "type": "flashcard"
    },
    {
      "id": "nut_wean_timing",
      "front": "Define Complementary Feeding (Weaning) and state its recommended timing.",
      "back": "- Definition: Gradual introduction of semi-solid & solid foods to meet increasing nutritional needs (especially Iron & Energy).\n- Timing: Recommended at 6 months. NEVER before 4 months (GI/kidneys are immature, increased allergy risk).",
      "type": "flashcard"
    },
    {
      "id": "nut_wean_rules",
      "front": "Enumerate the rules of successful weaning.",
      "back": "Mnemonic: (بالتدريج صنف واحد بالمعلقة.. ونضيف من غير غصب)\n1. Gradual introduction: increase amount and thickness gradually.\n2. One single food item at a time: wait 3-5 days to check for Food allergy/intolerance.\n3. Use spoon and cup: avoid bottles.\n4. Proper hygiene: prevent Gastroenteritis.\n5. Never force the baby.",
      "type": "flashcard"
    },
    {
      "id": "nut_bf_management",
      "front": "Enumerate the basic rules for successful Management of Breastfeeding.",
      "back": "1. Early initiation: Within 30-60 mins to get Colostrum.\n2. Exclusive breastfeeding: First 6 months.\n3. On-demand feeding: Feed when hungry/crying, no strict schedule.\n4. Proper latching & attachment: Avoid swallowing air and maternal nipple issues.",
      "type": "flashcard"
    },
    {
      "id": "nut_bf_engorgement",
      "front": "What is Breast engorgement, and how is it treated?",
      "back": "- Occurs in first days due to increased milk.\n- Treatment: Warm compresses BEFORE feeding (increase flow), Cold compresses AFTER feeding (reduce swelling). Frequent emptying of the breast. Do NOT stop breastfeeding.",
      "type": "flashcard"
    },
    {
      "id": "nut_bf_cracked",
      "front": "What is the primary cause of Cracked nipples during breastfeeding, and what is the treatment?",
      "back": "- Cause: Poor attachment / Improper latching.\n- Treatment: Correct feeding position, apply drops of breast milk on nipple and let dry, or use baby-safe soothing creams.",
      "type": "flashcard"
    },
    {
      "id": "nut_bf_mastitis",
      "front": "What is Mastitis, and what is its treatment plan?",
      "back": "- Bacterial infection causing pain, redness, swelling, and Fever.\n- Treatment: Safe Antibiotics, Analgesics. CRITICAL: Continue breastfeeding from affected breast to empty it and prevent Breast abscess.",
      "type": "flashcard"
    },
    {
      "id": "nut_bf_contra_maternal",
      "front": "Enumerate the Absolute Contraindications of Breastfeeding (Maternal causes).",
      "back": "Mnemonic: (أم مريضة إيدز وسل وهربس وبتاخد كيماوي.. وابنها عنده جالاكتوزيميا)\n1. HIV infection\n2. Active untreated TB\n3. Maternal chemotherapy or radiotherapy\n4. Active Herpes simplex lesions on the breast\n5. Illicit drug abuse",
      "type": "flashcard"
    },
    {
      "id": "nut_bf_contra_infant",
      "front": "What is the primary Infant absolute contraindication for Breastfeeding?",
      "back": "Galactosemia (Infant lacks the enzyme to break down galactose in milk).\n\nMnemonic: (أم مريضة إيدز وسل وهربس وبتاخد كيماوي.. وابنها عنده جالاكتوزيميا)",
      "type": "flashcard"
    },
    {
      "id": "nut_saq_1",
      "front": "Define the following terms:\nComplementary feeding (Weaning):",
      "back": "It is the provision of any nutrient containing foods or liquids other than breast milk and includes both solid food and infant formula."
    },
    {
      "id": "nut_saq_2",
      "front": "Define the following terms:\nTetany:",
      "back": "A state of hyper-excitability of central and peripheral nervous systems resulting from decreased ionic concentration of Ca or Mg or alkalosis."
    },
    {
      "id": "nut_saq_3",
      "front": "Enumerate four anti-infective properties or components present in human breast milk.",
      "back": "Immunoglobulins especially secretory IgA against different pathogens.\nPhagocytes & lymphocytes.\nLactoperoxidase, which protects against different bacterial pathogens.\nLysozymes that destroy bacterial cell wall."
    },
    {
      "id": "nut_saq_4",
      "front": "Enumerate four absolute contraindications to breastfeeding (Maternal or Infant).",
      "back": "Cancer breast.\nInsanity of the mother.\nHIV infection.\nInborn errors of metabolism in the infant (e.g., galactosemia)."
    },
    {
      "id": "nut_saq_5",
      "front": "Enumerate the four constant features of Kwashiorkor.",
      "back": "Growth failure.\nPitting oedema.\nMental changes.\nMuscle wasting with preserved subcutaneous fat."
    },
    {
      "id": "nut_saq_6",
      "front": "Enumerate four variable (non-constant) ectodermal or systemic features of Kwashiorkor.",
      "back": "Skin changes (erythema, hyperpigmentation, desquamation).\nHair changes (dry, sparse, easily pickable, alternating color bands).\nAnemia.\nGIT changes (hepatomegaly, diarrhea, abdominal distension)."
    },
    {
      "id": "nut_saq_7",
      "front": "Enumerate four causes of death in a child with severe Protein Energy Malnutrition (PEM).",
      "back": "Recurrent infections.\nElectrolytes imbalance as a result of refeeding syndrome or acute gastroenteritis.\nHypothermia.\nHypoglycemia."
    },
    {
      "id": "nut_saq_8",
      "front": "Enumerate four skeletal manifestations found in the head or thorax of a child with advanced rickets.",
      "back": "Frontal and parietal bossing leading to box shaped skull (caput quadratum).\nWide anterior fontanelles.\nRachitic rosaries (visible or palpable enlargement of the costochondral junction).\nHarrison sulcus (horizontal groove along lower border of the chest cage)."
    },
    {
      "id": "nut_saq_9",
      "front": "Enumerate the three steps in the diagnostic approach to refractory rickets.",
      "back": "1st step: Measure serum phosphorus.\n2nd step: Measure blood pH.\n3rd step: Measure serum calcium."
    },
    {
      "id": "nut_saq_10",
      "front": "Enumerate four indications for hospitalization in a child with severe malnutrition.",
      "back": "Hypothermia.\nSevere anemia and congestive cardiac failure.\nPersistent vomiting.\nAge less than 1 year."
    },
    {
      "id": "nut_match_1",
      "type": "matching",
      "front": "Match the clinical sign/term in Group (A) with its exact diagnostic description in Group (B):",
      "matchingPairs": [
        {
          "left": "Flag sign",
          "right": "Alternating bands of normal color and hypopigmentations due to alternating periods of normal state and protein malnutrition."
        },
        {
          "left": "Marfan's sign",
          "right": "Transverse groove on both malleoli due to abnormal proliferation of osteoid tissue at two different centers, pathognomonic for rickets."
        },
        {
          "left": "Trousseau sign",
          "right": "Carpal spasm induced by occlusion of arterial flow to the arm by inflating the cuff of a sphygmomanometer above systolic pressure for 3 minutes."
        },
        {
          "left": "Craniotabes",
          "right": "Abnormal softness due to thinning of the outer skull plate where a squash ball sensation is felt by pressing firmly over the occipital bones."
        }
      ]
    },
    {
      "id": "nut_case1_q1",
      "front": "Case 1: A 2-year-old child is brought to the hospital presentation with generalized pitting edema starting in the feet, a puffy \"moon face\", severe muscle wasting, but with preserved subcutaneous fat. The child is extremely apathetic and shows no interest in his surroundings.\n\nWhat is the diagnosis of this clinical condition according to the Welcome classification?",
      "back": "Kwashiorkor (severe PEM with edema)."
    },
    {
      "id": "nut_case1_q2",
      "front": "Case 1: A 2-year-old child is brought to the hospital presentation with generalized pitting edema starting in the feet, a puffy \"moon face\", severe muscle wasting, but with preserved subcutaneous fat. The child is extremely apathetic and shows no interest in his surroundings.\n\nEnumerate two possible causes for the mental changes (apathy) observed in this child.",
      "back": "Deficient aromatic amino acids and deficient trace elements (Cu, Mg, Zn)."
    },
    {
      "id": "nut_case2_q1",
      "front": "Case 2: A 10-month-old male infant presents with broad wrists, bow-legs, and delayed teething. Blood chemistry: normal Ca, low Ph and very high alkaline phosphatase. X-ray of wrist shows cupping & fraying.\n\nWhat is your provisional diagnosis?",
      "back": "Active Infantile (Nutritional) Rickets."
    },
    {
      "id": "nut_case2_q2",
      "front": "Case 2: A 10-month-old male infant presents with broad wrists, bow-legs, and delayed teething. Blood chemistry: normal Ca, low Ph and very high alkaline phosphatase. X-ray of wrist shows cupping & fraying.\n\nExplain the mechanism behind the increased level of serum alkaline phosphatase in this disease.",
      "back": "It is due to increased osteoblastic activity."
    },
    {
      "id": "nut_case2_q3",
      "front": "Case 2: A 10-month-old male infant presents with broad wrists, bow-legs, and delayed teething. Blood chemistry: normal Ca, low Ph and very high alkaline phosphatase. X-ray of wrist shows cupping & fraying.\n\nEnumerate the two therapeutic methods/options for treating this infantile disease.",
      "back": "Oral daily dose of 1500-5000 IU vitamin D till complete recovery, or Shock therapy (a single oral dose of 600,000 IU vitamin D)."
    },
    {
      "id": "n1",
      "front": "Describe five benefits of breastfeeding (for mothers)?",
      "back": "It helps in the involution of the birth canal.\nIt serves as a natural method of contraception.\nIt decreases the clinical incidence of breast cancer."
    },
    {
      "id": "n2",
      "front": "Mention foods avoided in weaning diet.",
      "back": "Foods that cause choking, such as nuts, fruits with seeds, and potato chips.\nFoods containing artificial colors and artificial flavors.\nSalted food, as it might cause hypertension.\nJunk food such as sweets and candies, which deprive the child from taking food that is more nutritious and encourages a desire for sweets.\nHighly spiced and fatty food."
    },
    {
      "id": "n3",
      "front": "Describe skin changes in Kwashiorkor and explain its cause.",
      "back": "Description: Skin changes start as erythema followed by hyperpigmentation and desquamation, leading directly to ulceration, fissuring, and crackling. Secondary skin infections and even gangrene are highly common because the pitting edema constitutes a suitable media for the entry of pathogenic organisms. The commonest anatomical sites involved are pressure sites (buttocks and back) and flexural sites (groin and axilla).\nCause: These pathognomonic skin changes are primarily caused by deficiencies in essential fatty acids, essential amino acids, sulfur-containing amino acids, vitamin A, and zinc."
    },
    {
      "id": "n4",
      "front": "List 5 causes of death in PEM",
      "back": "Recurrent systemic infections.\nElectrolytes imbalance occurring as a result of refeeding syndrome or acute gastroenteritis.\nHypothermia.\nHypoglycemia, due to low glycogen content in the liver and defects in catecholamine and glucagon hormone formation.\nHeart failure, due to either anemic heart failure or degenerative changes in the cardiac muscles."
    },
    {
      "id": "n5",
      "front": "Explain the causes of infection in protein-energy malnutrition.",
      "back": "Edema-Related Susceptibility: Pitting edema creates an ideal, compromised environment and suitable media for the entry of micro-organisms, leading to high rates of skin infections and gangrene.\nGastrointestinal Barrier Defect: Defective epithelization of the intestinal mucosa impairs natural defenses, making the patient highly vulnerable to bacterial, viral, and protozoal gastroenteritis."
    },
    {
      "id": "n6",
      "front": "Explain why weaning should start after the age of 4 months.",
      "back": "Weaning must begin at the age of 4 months because maternal breast milk becomes insufficient to fulfill the baseline nutritional requirements of the infant, creating a critical deficit across multiple components:\nCalories: A clear energy gap forms between breast milk intake (356 kcal/day) and total daily requirement (536.8 kcal/day) at 4 months.\nProteins: A protein intake deficit emerges between baseline intake (6.6 g/day) and requirement (9.1 g/day) at 4 months.\nVitamin D: A substantial micronutrient gap exists between intake (528 ng/day) and requirement (5000 ng/day) at 4 months.\nZinc: Intake drops below required levels, with intake at 0.98 mg/day against a requirement of 2 mg/day after 4 months.\nIron: A severe developmental gap opens between intake (0.29 mg/day) and requirement (11 mg/day) after 6 months of age. Introducing complementary feeding at 4 months is therefore mandated to explicitly avoid caloric, vitamin, and mineral deficiencies."
    },
    {
      "id": "n7",
      "front": "Discuss welcome classification for protein energy malnutrition",
      "back": "The Welcome classification categorizes protein-energy malnutrition by assessing the patient's body weight-for-age percentage relative to the standard (50th percentile reference) and evaluating for the clinical presence or absence of pitting edema:\nWeight-for-age between 60% and 80% of standard:\nWithout edema: Underweight (mild PEM).\nWith edema: Kwashiorkor (severe PEM).\nWeight-for-age < 60% of standard:\nWithout edema: Marasmus (severe PEM).\nWith edema: Marasmic Kwashiorkor (severe PEM)."
    },
    {
      "id": "n8",
      "front": "Mention Breast feeding reflexes",
      "back": "Maternal Secretory & Ejection Reflexes:\nMilk secretion reflex (prolactin reflex): Suckling directly stimulates nerve endings in the nipple, inducing anterior pituitary production of prolactin, which drives milk production.\nMilk ejection or let-down reflex (oxytocin reflex): Suckling stimulates oxytocin release from the posterior pituitary, causing acute contraction of myoepithelial cells around the lactiferous ducts to cause milk ejection.\nInfant Feeding Reflexes:\nRooting reflex: Mechanical touch to the lip or cheek causes the infant to turn toward the stimulus and open the mouth.\nSuckling reflex: Tactile stimulation of the palate directly initiates suckling.\nSwallowing reflex: The presence of milk filling the oral cavity triggers automatic swallowing."
    },
    {
      "id": "n9",
      "front": "Case 3: 1- What is most likely diagnosis?",
      "back": "The most likely diagnosis is Kwashiorkor. It is a form of severe protein-energy malnutrition caused by selective protein deficiency in the setting of nearly normal caloric intake, characterized clinically by pitting edema and growth failure."
    },
    {
      "id": "n10",
      "front": "Case 3: 2- What are the other features should be present?",
      "back": "Constant Features: Severe growth failure (weight-for-age < 80% of reference), psychological/mental changes (apathy, marked irritability, lack of interest in surroundings, absence of smile), and muscle wasting with preserved subcutaneous fat.\nVariable (Non-constant) Features: Skin changes (erythema, hyperpigmentation, desquamation, flaky paint dermatosis), hair changes (loss of luster, dry/sparse hair, color lightening, or alternating bands known as the flag sign), nutritional anemia, and gastrointestinal changes (hepatomegaly from fatty infiltration, diarrhea, and abdominal distension)."
    },
    {
      "id": "n11",
      "front": "Case 3: 3- What are the investigations should be done?",
      "back": "Serum Albumin: To evaluate the degree of hypoproteinemia (characteristically low).\nUrinary Urea per Gram Creatinine: To demonstrate reduced protein intake and metabolism (low).\nBlood Glucose Level: To evaluate for concurrent fasting hypoglycemia.\nSerum Electrolytes: To check for underlying potassium and magnesium deficiencies.\nComplete Blood Count (CBC): To identify microcytic, macrocytic, or normocytic anemia.\nRadiological Bone Age: To confirm delayed skeletal maturation."
    },
    {
      "id": "n12",
      "front": "Mention causes of hypocalcemia and tetany in rickets.",
      "back": "Hypocalcemia and manifest tetany present in rickets under specific metabolic circumstances:\nParathyroid gland failure to respond to systemic hypocalcemia due to gland exhaustion.\nComplete exhaustion of total skeletal bone stores of calcium.\nAdministration of high-dose vitamin D shock therapy without concurrent oral calcium supplementation.\nSevere concurrent chest infections causing hyperventilation, inducing a CO2 wash, resulting in systemic respiratory alkalosis tetany."
    },
    {
      "id": "n13",
      "front": "Describe the clinical picture of latent tetany.",
      "back": "Latent tetany occurs when total serum calcium levels range between 7 and 9 mg%. It lacks spontaneous clinical symptoms but is explicitly confirmed via three diagnostic neurological signs:\nChvostek sign: Mechanical tapping over the facial nerve anterior to the tragus produces immediate contraction of the ipsilateral facial muscles.\nTrousseau sign: Occlusion of arterial flow to the upper extremity using a sphygmomanometer cuff inflated above systolic pressure for 3 minutes induces ischemia, resulting in a classic carpal spasm.\nPeroneal sign: Tapping the peroneal nerve over the neck of the fibula produces immediate dorsiflexion and eversion of the foot."
    },
    {
      "id": "n14",
      "front": "Case 4: 1- What is most likely diagnosis?",
      "back": "The most likely diagnosis is Renal Osteodystrophy (Uremic Rickets). This clinical entity comprises skeletal mineralization defects secondary to chronic renal failure, presenting with rickets-like epiphyseal broadening, severe short stature, metabolic acidosis, and renal-induced systemic hypertension."
    },
    {
      "id": "n15",
      "front": "Case 4: 2- What are the investigations should be done?",
      "back": "Serum Kidney Function Tests: Evaluating blood urea and creatinine levels, which will be pathologically elevated.\nSerum Phosphorus: To confirm hyperphosphatemia caused by decreased glomerular filtration.\nSerum Calcium: To identify hypocalcemia secondary to failure of renal vitamin D hydroxylation.\nSerum Alkaline Phosphatase: Characteristically elevated due to high osteoblastic remodeling.\nBlood Gas Analysis (pH): To diagnose underlying metabolic acidosis.\nRadiological X-ray of Wrists/Long Bones: To visualize structural epiphyseal cupping, fraying, and broadening."
    },
    {
      "id": "n16",
      "front": "Case 4: 3- What is the treatment?",
      "back": "Radical management of the underlying renal pathology via chronic hemodialysis or renal transplantation.\nActive Calcitriol (1,25-dihydroxyvitamin D) administration to bypass compromised renal 1-alpha-hydroxylase activity.\nEnsuring high oral calcium intake.\nImplementation of a low phosphate diet.\nAdministration of oral phosphate binders to restrict GI absorption of dietary phosphorus."
    }
  ],
  "_CHAPTER_Genetic diseases": [
    {
      "id": "gen_saq_1",
      "front": "Define the following terms:\nGenetics:",
      "back": "The study of heredity or genes."
    },
    {
      "id": "gen_saq_2",
      "front": "Define the following terms:\nGene:",
      "back": "The basic unit of inheritance; a section of DNA that takes a specific location on a chromosome and codes for a protein product."
    },
    {
      "id": "gen_saq_3",
      "front": "Define the following terms:\nKaryotype:",
      "back": "A standardized format or photograph where individual chromosomes are arranged in pairs to detect numerical or gross structural abnormalities."
    },
    {
      "id": "gen_saq_4",
      "front": "Define the following terms:\nSyndrome:",
      "back": "Multiple anomalies in one or more tissues thought to be pathologically related due to a specific etiologic mechanism."
    },
    {
      "id": "gen_saq_5",
      "front": "Enumerate four clinical indications for chromosomal analysis.",
      "back": "Mental retardation, growth retardation, and developmental delay.\nDysmorphic features and multiple congenital anomalies.\nFemale with short stature.\nRecurrent abortions and fertility problems."
    },
    {
      "id": "gen_saq_6",
      "front": "Enumerate four structural chromosomal aberrations.",
      "back": "Deletions.\nDuplications.\nInversion.\nTranslocation."
    },
    {
      "id": "gen_saq_7",
      "front": "Enumerate the three cytogenetic types of Down Syndrome.",
      "back": "Nondisjunction Type.\nTranslocation type.\nMosaic type."
    },
    {
      "id": "gen_saq_8",
      "front": "Enumerate four characteristics of Autosomal Dominant inheritance.",
      "back": "Affected mothers and fathers transmit the phenotype to both sons and daughters equally.\nEach child of an affected parent has a 50% chance of inheriting the disease.\nThe phenotype appears in every generation presenting a \"vertical pattern\".\nExamples include Achondroplasia and Huntington disease."
    },
    {
      "id": "gen_saq_9",
      "front": "Enumerate four indications for Genetic Counseling.",
      "back": "A personal or family history of a genetic condition, birth defect, or chromosomal disorder.\nA woman who is pregnant or plans to become pregnant at or after age 35.\nHistory of recurrent miscarriages or a stillbirth.\nAbnormal test results that suggest a genetic or chromosomal condition."
    },
    {
      "id": "gen_saq_10",
      "front": "Enumerate four criteria for an ideal newborn screening program.",
      "back": "Screened condition should be an important, frequent, well-known health problem.\nScreening test should be inexpensive, simple, safe, reliable, precise and validated.\nEffective treatment or intervention must exist.\nAdequate staffing and facilities for testing, diagnosis, treatment, and program management."
    },
    {
      "id": "gen_saq_11",
      "front": "Enumerate four advantages of filter paper usage in newborn screening.",
      "back": "Simple collection.\nMore analytes stable.\nSimple transportation.\nStorage easy and compact."
    },
    {
      "id": "gen_match_1",
      "type": "matching",
      "front": "Match the chromosomal disorder or prenatal finding in Group (A) with its exact genetic description or diagnostic marker in Group (B):",
      "matchingPairs": [
        {
          "left": "Turner syndrome",
          "right": "A condition characterized by a 45,X genotype, short stature, webbed neck, and primary amenorrhea."
        },
        {
          "left": "Klinefelter syndrome",
          "right": "A condition characterized by a 47,XXY genotype, tall stature, eunuchoid build, small testes, and gynecomastia."
        },
        {
          "left": "Edward syndrome",
          "right": "Trisomy 18 presenting with low-set malformed auricles, a clenched hand with overlapping fingers, and rocker bottom feet."
        },
        {
          "left": "Down syndrome prenatal triple test",
          "right": "Decreased maternal serum alpha-fetoprotein (AFP), decreased unconjugated estriol (uE3), and increased human chorionic gonadotrophin (hCG)."
        }
      ]
    },
    {
      "id": "gen_case1_q1",
      "front": "Case 1: A 37-year-old pregnant woman has a routine prenatal triple test done at 16 weeks of gestation. The laboratory report reveals: Decreased alpha-fetoprotein (AFP), decreased unconjugated estriol (uE3), and significantly increased human chorionic gonadotrophin (hCG).\n\nWhat is the most likely chromosomal disorder affecting the fetus?",
      "back": "Down Syndrome (Trisomy 21)."
    },
    {
      "id": "gen_case1_q2",
      "front": "Case 1: A 37-year-old pregnant woman has a routine prenatal triple test done at 16 weeks of gestation. The laboratory report reveals: Decreased alpha-fetoprotein (AFP), decreased unconjugated estriol (uE3), and significantly increased human chorionic gonadotrophin (hCG).\n\nEnumerate two invasive screening methods that can be offered to this patient to obtain fetal cells for a definitive diagnosis.",
      "back": "Amniocentesis and Chorionic villus sampling."
    },
    {
      "id": "gen_case2_q1",
      "front": "Case 2: A newborn male infant is examined in the neonatal unit. The clinician observes upward slanting palpebral fissures, an epicanthic fold, a single transverse palmar crease (simian crease), a wide gap between the first and second toes, and marked generalized hypotonia.\n\nWhat is the clinical diagnosis for this infant?",
      "back": "Down Syndrome."
    },
    {
      "id": "gen_case2_q2",
      "front": "Case 2: A newborn male infant is examined in the neonatal unit. The clinician observes upward slanting palpebral fissures, an epicanthic fold, a single transverse palmar crease (simian crease), a wide gap between the first and second toes, and marked generalized hypotonia.\n\nWhat is the most common cytogenetic mechanism responsible for this syndrome, and what is its relation to maternal age?",
      "back": "Nondisjunction Type (accounts for 94% of cases) ; its risk increases significantly with advanced maternal age."
    },
    {
      "id": "gen_case3_q1",
      "front": "Case 3: A 16-year-old female presents to the endocrine clinic with complaints of failure to start her periods (primary amenorrhea) and short stature. On physical examination, she has a low posterior hairline, a short webbed neck, a broad chest with widely spaced nipples, and a wide carrying angle at her elbows.\n\nWhat is the most likely diagnosis?",
      "back": "Turner syndrome."
    },
    {
      "id": "gen_case3_q2",
      "front": "Case 3: A 16-year-old female presents to the endocrine clinic with complaints of failure to start her periods (primary amenorrhea) and short stature. On physical examination, she has a low posterior hairline, a short webbed neck, a broad chest with widely spaced nipples, and a wide carrying angle at her elbows.\n\nWhat is the most common genotype associated with this condition?",
      "back": "45,X (or 45,XO)."
    },
    {
      "id": "gen_case4_q1",
      "front": "Case 4: A 17-year-old boy is brought for evaluation because of delayed puberty and learning difficulties. He is noted to be tall with long limbs and a eunuchoid build. Physical examination reveals minimal facial hair, bilateral breast enlargement (gynecomastia), and small, firm testes.\n\nWhat is the most likely clinical diagnosis?",
      "back": "Klinefelter syndrome."
    },
    {
      "id": "gen_case4_q2",
      "front": "Case 4: A 17-year-old boy is brought for evaluation because of delayed puberty and learning difficulties. He is noted to be tall with long limbs and a eunuchoid build. Physical examination reveals minimal facial hair, bilateral breast enlargement (gynecomastia), and small, firm testes.\n\nWhat is the typical genotype for this syndrome, and when is it usually diagnosed?",
      "back": "47,XXY ; the diagnosis is rarely made before puberty."
    }
  ],
  "_CHAPTER_Gastroenterology & hepatology": [
    {
      "id": "git_saq_1",
      "front": "Define the following terms:\nDysentery:",
      "back": "It is diarrhea with visible blood in stool."
    },
    {
      "id": "git_saq_2",
      "front": "Define the following terms:\nUpper Gastrointestinal (UGI) Bleeding:",
      "back": "It is defined as bleed occurring in the GI tract above the ligament of Trietz."
    },
    {
      "id": "git_saq_3",
      "front": "Define the following terms:\nHypertrophic Pyloric Stenosis:",
      "back": "Progressive hypertrophy of circular muscles fibers of the pylorus with subsequent pyloric narrowing and gastric outflow obstruction."
    },
    {
      "id": "git_saq_4",
      "front": "Define the following terms:\nPhenylketonuria (PKU):",
      "back": "A rare, inherited metabolic disorder that prevents the body from breaking down an amino acid called phenylalanine (Phe)."
    },
    {
      "id": "git_saq_5",
      "front": "Enumerate four causes of persistent diarrhea.",
      "back": "Lactose intolerance.\nCow milk protein allergy.\nBacterial overgrowth.\nPersistent infection (Giardiasis)."
    },
    {
      "id": "git_saq_6",
      "front": "Enumerate four red flags for mothers to seek medical care regarding a child with diarrhea.",
      "back": "Many watery stools.\nRepeated vomiting.\nEating or drinking poorly.\nBecomes very thirsty."
    },
    {
      "id": "git_saq_7",
      "front": "Enumerate four methods for the prevention of diarrhea.",
      "back": "Exclusive breastfeeding.\nSafe water and sanitation.\nHand washing.\nVaccination (Rotavirus)."
    },
    {
      "id": "git_saq_8",
      "front": "Enumerate four clinical diagnostic criteria (Rome IV) for functional constipation.",
      "back": "Infrequent Stool: Fewer than 3 bowel movements per week.\nHard Stools: Large, dry, or painful-to-pass stools.\nWithholding Behavior: Posturing (stiffening legs, hiding) to avoid pooping.\nFecal Incontinence: Leakage of liquid stool in underwear."
    },
    {
      "id": "git_saq_9",
      "front": "Enumerate four mechanisms of hepatomegaly.",
      "back": "Congestion (e.g., CCF).\nInflammation (e.g., various forms of hepatitis).\nInfiltration (e.g., malignancy).\nStorage/fat accumulation (e.g., glycogen storage disease, fatty liver)."
    },
    {
      "id": "git_saq_10",
      "front": "Enumerate four clinical \"red flags\" that point to organic rather than dysfunctional recurrent abdominal pain (RAP).",
      "back": "Clearly localized pain (burning, stabbing, etc.) mostly away from umbilicus.\nPain awakening the child at night.\nPain with weight loss.\nBlood in stools (occult/obvious)."
    },
    {
      "id": "git_saq_11",
      "front": "Enumerate four clinical situations/red flags when an inborn error of metabolism should be highly suspected.",
      "back": "The \"Crash\" After Birth: A baby who is born healthy but suddenly gets very sick after their first few feedings.\nLooking Like Sepsis: A child who looks like they have a severe infection, but tests for bacteria are negative and antibiotics aren't working.\nLosing Skills: A child who was hitting their milestones but suddenly starts losing those abilities.\nStrange Smells: Unusual odors from the baby's breath, urine, or skin."
    },
    {
      "id": "git_match_1",
      "type": "matching",
      "front": "Match the clinical screening test/investigation in Group (A) with its exact diagnostic significance in Group (B):",
      "matchingPairs": [
        {
          "left": "Fecal Calprotectin (FC)",
          "right": "The most sensitive fecal marker for pediatric inflammatory bowel disease (IBD) screening."
        },
        {
          "left": "ASCA (Anti-Saccharomyces cerevisiae)",
          "right": "A serological marker primarily associated with Crohn's Disease (60-70% of cases)."
        },
        {
          "left": "pANCA (Perinuclear Anti-Neutrophil Cytoplasmic Antibodies)",
          "right": "A serological marker primarily associated with Ulcerative Colitis (60-80% of cases)."
        },
        {
          "left": "Suction rectal biopsy",
          "right": "The gold standard diagnostic investigation for confirming Hirschsprung Disease."
        }
      ]
    },
    {
      "id": "git_case1_q1",
      "front": "Case 1: A 4-week-old male infant presents with progressive, nonbilious projectile vomiting immediately following each feed. The mother notes that the infant is always extremely hungry and wants to feed again right after vomiting. On deep physical examination, a firm, hard, movable, olive-shaped mass is palpated above and to the right of the umbilicus.\n\nWhat is the most likely diagnosis?",
      "back": "Hypertrophic Pyloric Stenosis."
    },
    {
      "id": "git_case1_q2",
      "front": "Case 1: A 4-week-old male infant presents with progressive, nonbilious projectile vomiting immediately following each feed. The mother notes that the infant is always extremely hungry and wants to feed again right after vomiting. On deep physical examination, a firm, hard, movable, olive-shaped mass is palpated above and to the right of the umbilicus.\n\nWhat specific metabolic and electrolyte disturbance is characteristic of this condition?",
      "back": "Hypochloremic metabolic alkalosis."
    },
    {
      "id": "git_case1_q3",
      "front": "Case 1: A 4-week-old male infant presents with progressive, nonbilious projectile vomiting immediately following each feed. The mother notes that the infant is always extremely hungry and wants to feed again right after vomiting. On deep physical examination, a firm, hard, movable, olive-shaped mass is palpated above and to the right of the umbilicus.\n\nWhat is the definitive surgical procedure of choice for this infant?",
      "back": "Ramstedt pyloromyotomy."
    },
    {
      "id": "git_case2_q1",
      "front": "Case 2: A newborn male infant fails to pass meconium within the first 48 hours of life and develops clinical features of intestinal obstruction including abdominal distension and vomiting. A contrast barium enema is performed and demonstrates a clear transition zone with a narrow distal rectal segment.\n\nWhat is the clinical diagnosis?",
      "back": "Hirschsprung Disease (Congenital Aganglionic Megacolon)."
    },
    {
      "id": "git_case2_q2",
      "front": "Case 2: A newborn male infant fails to pass meconium within the first 48 hours of life and develops clinical features of intestinal obstruction including abdominal distension and vomiting. A contrast barium enema is performed and demonstrates a clear transition zone with a narrow distal rectal segment.\n\nWhat is the underlying pathology of this condition?",
      "back": "Absence of ganglionic cells in the myenteric & submucosal plexuses of the rectum and a variable distance of the colon."
    },
    {
      "id": "git_case2_q3",
      "front": "Case 2: A newborn male infant fails to pass meconium within the first 48 hours of life and develops clinical features of intestinal obstruction including abdominal distension and vomiting. A contrast barium enema is performed and demonstrates a clear transition zone with a narrow distal rectal segment.\n\nWhat occurs during physical examination when a digital rectal examination (PR) is performed on this child?",
      "back": "The ampulla is found empty, and its examination causes a gush of liquid stools & flatus."
    },
    {
      "id": "git_case3_q1",
      "front": "Case 3: A 5-month-old infant who appeared normal at birth is brought to the hospital with developmental delay and loss of social skills. The parents report a distinct musty or mousy odor from the child's breath and urine. On examination, the infant has microcephaly, lighter skin and hair pigmentation than the rest of his family members, and severe eczema.\n\nWhat is the most likely diagnosis?",
      "back": "Phenylketonuria (PKU)."
    },
    {
      "id": "git_case3_q2",
      "front": "Case 3: A 5-month-old infant who appeared normal at birth is brought to the hospital with developmental delay and loss of social skills. The parents report a distinct musty or mousy odor from the child's breath and urine. On examination, the infant has microcephaly, lighter skin and hair pigmentation than the rest of his family members, and severe eczema.\n\nWhat is the genetic mode of inheritance for this disorder, and what gene is defective?",
      "back": "It is an autosomal recessive disorder caused by mutations in the PAH gene."
    },
    {
      "id": "git_case3_q3",
      "front": "Case 3: A 5-month-old infant who appeared normal at birth is brought to the hospital with developmental delay and loss of social skills. The parents report a distinct musty or mousy odor from the child's breath and urine. On examination, the infant has microcephaly, lighter skin and hair pigmentation than the rest of his family members, and severe eczema.\n\nWhat is the cornerstone of lifelong treatment for this patient?",
      "back": "A low-protein diet (\"metabolic diet\") that excludes high-protein foods, strictly avoids aspartame, and utilizes a phenylalanine-free medical formula."
    }
  ],
  "_CHAPTER_Endocrinology": [
    {
      "id": "endo_saq_1",
      "front": "Define the following terms:\nShort stature:",
      "back": "A term applied to a child whose height is 2 standard deviations (SD) or more below the mean for children of that sex and chronologic age."
    },
    {
      "id": "endo_saq_2",
      "front": "Define the following terms:\nDelayed puberty:",
      "back": "No thelarche (breast development) by age 13 in girls, or no testicular enlargement (≥ 4 mL) by age 14 in boys."
    },
    {
      "id": "endo_saq_3",
      "front": "Define the following terms:\nCongenital Adrenal Hyperplasia (CAH):",
      "back": "A group of inherited enzyme defects in cortisol synthesis with overproduction of adrenal androgens."
    },
    {
      "id": "endo_saq_4",
      "front": "Define the following terms:\nDiabetic Ketoacidosis (DKA):",
      "back": "A metabolic abnormality characterized by hyperglycemia (blood glucose above 14 mmol/L) and metabolic acidosis (arterial PH below 7.35 and/or plasma bicarbonate less than 16 mEq/L) due to hyperketonemia with depression of conscious level."
    },
    {
      "id": "endo_saq_5",
      "front": "Enumerate four secondary causes of pathological short stature.",
      "back": "Under nutrition (e.g., Protein energy malnutrition).\nGastrointestinal causes (e.g., Malabsorption syndromes like celiac or cystic fibrosis).\nEndocrine causes (e.g., Hypothyroidism, Hypopituitarism, or Diabetes Mellitus).\nRenal diseases (e.g., polycystic kidney, chronic uremia, or Pyelonephritis)."
    },
    {
      "id": "endo_saq_6",
      "front": "Enumerate four early clinical signs of Congenital Hypothyroidism in infants.",
      "back": "Prolonged physiological jaundice.\nLethargy, sluggishness & poor feeding.\nHypotonia and abdominal distension.\nUmbilical hernia (or Opened, large posterior fontanel)."
    },
    {
      "id": "endo_saq_7",
      "front": "Enumerate four clinical manifestations of Hypoparathyroidism.",
      "back": "Tetany.\nCarpopedal spasm.\nPositive Chvostek and Trousseau signs.\nSeizures."
    },
    {
      "id": "endo_saq_8",
      "front": "Enumerate four causes of delayed puberty.",
      "back": "Constitutional Delay of Growth and Puberty (CDGP).\nHypergonadotropic Hypogonadism (Primary Failure, e.g., Turner or Klinefelter Syndrome).\nHypogonadotropic Hypogonadism (Central Failure, e.g., Kallmann Syndrome).\nFunctional Hypogonadism (Secondary to Stress/Chronic illness)."
    },
    {
      "id": "endo_saq_9",
      "front": "Enumerate four physical clinical features of Cushing Syndrome.",
      "back": "Moon face.\nCentral obesity.\nBuffalo hump.\nMuscle weakness (or Hypertension)."
    },
    {
      "id": "endo_saq_10",
      "front": "Enumerate the four laboratory criteria for the diagnosis of Diabetes Mellitus.",
      "back": "Glycosylated hemoglobin (HbA1C) > 6.5%.\nFasting Plasma Glucose (FPG) > 126 mg/dL (7.0 mmol/L).\nOral Glucose Tolerance Test (OGTT) > 200 mg/dL (11.1 mmol/L).\nRandom plasma glucose > 200 mg/dL (11.1 mmol/L) accompanied by symptoms."
    },
    {
      "id": "endo_saq_11",
      "front": "Enumerate four physical complications of childhood obesity.",
      "back": "Type 2 diabetes.\nHigh cholesterol and high blood pressure.\nJoint pain (in the hips, knees, and back).\nBreathing problems (Asthma and obstructive sleep apnea) or Non-alcoholic fatty liver disease (NAFLD)."
    },
    {
      "id": "endo_match_1",
      "type": "matching",
      "front": "Match the clinical term or syndrome in Group (A) with its exact diagnostic/physiological description in Group (B):",
      "matchingPairs": [
        {
          "left": "Kallmann Syndrome",
          "right": "A form of congenital permanent hypogonadotropic hypogonadism that is characteristically associated with anosmia."
        },
        {
          "left": "21-hydroxylase deficiency",
          "right": "The most common type of inherited enzyme defect responsible for Congenital Adrenal Hyperplasia (CAH)."
        },
        {
          "left": "Thelarche",
          "right": "The onset of female breast development, which represents the first sign of puberty in girls."
        },
        {
          "left": "Kussmaul respiration",
          "right": "Deep rapid respiration due to metabolic acidosis in an attempt to excrete excess CO2, characteristic of DKA."
        }
      ]
    },
    {
      "id": "endo_case1_q1",
      "front": "Case 1: A 3-week-old infant is brought to the outpatient clinic due to prolonged physiological jaundice, poor feeding, and extreme sluggishness. On physical examination, the clinician notes generalized hypotonia, a wide anterior fontanel, an open and large posterior fontanel, a protruding thick tongue, and a prominent umbilical hernia.\n\nWhat is the most likely diagnosis?",
      "back": "Congenital Hypothyroidism (CHT)."
    },
    {
      "id": "endo_case1_q2",
      "front": "Case 1: A 3-week-old infant is brought to the outpatient clinic due to prolonged physiological jaundice, poor feeding, and extreme sluggishness. On physical examination, the clinician notes generalized hypotonia, a wide anterior fontanel, an open and large posterior fontanel, a protruding thick tongue, and a prominent umbilical hernia.\n\nHow are newborns screened for this condition, and what specific parameter is measured?",
      "back": "Screened using a heel-prick blood test performed from the third to seventh day of age to measure Thyroid Stimulating Hormone (TSH) levels."
    },
    {
      "id": "endo_case1_q3",
      "front": "Case 1: A 3-week-old infant is brought to the outpatient clinic due to prolonged physiological jaundice, poor feeding, and extreme sluggishness. On physical examination, the clinician notes generalized hypotonia, a wide anterior fontanel, an open and large posterior fontanel, a protruding thick tongue, and a prominent umbilical hernia.\n\nWhat is the immediate drug of choice for treating this infant?",
      "back": "Levothyroxine (synthetic thyroid hormone, T4) started without delay."
    },
    {
      "id": "endo_case2_q1",
      "front": "Case 2: An 8-year-old child known to have Type 1 Diabetes Mellitus is rushed to the emergency department with severe dehydration, deep and rapid breathing (Kussmaul respiration), and a distinct fruity odor of acetone on his breath. The parents mention he has had a high fever and a urinary tract infection for the past 2 days. Emergency laboratory findings show: Blood glucose 350 mg%, venous pH 7.10, and serum bicarbonate 8 mEq/L.\n\nWhat is the clinical diagnosis and what is its severity classification?",
      "back": "Severe Diabetic Ketoacidosis (DKA) (since pH is < 7.15 and HCO3 is < 10 mEq/L)."
    },
    {
      "id": "endo_case2_q2",
      "front": "Case 2: An 8-year-old child known to have Type 1 Diabetes Mellitus is rushed to the emergency department with severe dehydration, deep and rapid breathing (Kussmaul respiration), and a distinct fruity odor of acetone on his breath. The parents mention he has had a high fever and a urinary tract infection for the past 2 days. Emergency laboratory findings show: Blood glucose 350 mg%, venous pH 7.10, and serum bicarbonate 8 mEq/L.\n\nIdentify the specific precipitating factor in this child's history.",
      "back": "Infection (specifically a urinary tract infection)."
    },
    {
      "id": "endo_case2_q3",
      "front": "Case 2: An 8-year-old child known to have Type 1 Diabetes Mellitus is rushed to the emergency department with severe dehydration, deep and rapid breathing (Kussmaul respiration), and a distinct fruity odor of acetone on his breath. The parents mention he has had a high fever and a urinary tract infection for the past 2 days. Emergency laboratory findings show: Blood glucose 350 mg%, venous pH 7.10, and serum bicarbonate 8 mEq/L.\n\nEnumerate three major lines of management that must be initiated immediately.",
      "back": "Correction of fluids.\nInsulin therapy.\nCorrection of electrolytes (and acid-base balance)."
    },
    {
      "id": "endo_case3_q1",
      "front": "Case 3: A newborn infant is examined in the delivery room and found to have ambiguous genitalia that cannot be clearly classified as male or female. Within the first week of life, the infant develops severe vomiting, dehydration, and circulatory shock (acute adrenal crisis). Laboratory evaluation reveals severe hyponatremia, hyperkalemia, and hypoglycemia.\n\nWhat is the most likely diagnosis?",
      "back": "Congenital Adrenal Hyperplasia (CAH) (Salt-wasting type)."
    },
    {
      "id": "endo_case3_q2",
      "front": "Case 3: A newborn infant is examined in the delivery room and found to have ambiguous genitalia that cannot be clearly classified as male or female. Within the first week of life, the infant develops severe vomiting, dehydration, and circulatory shock (acute adrenal crisis). Laboratory evaluation reveals severe hyponatremia, hyperkalemia, and hypoglycemia.\n\nWhat is the \"Golden Rule\" mentioned in your textbook regarding the management of ambiguous genitalia in the delivery room?",
      "back": "Never guess the sex in the delivery room. Tell the parents: \"The genitals are not fully developed; we need tests to be sure.\""
    },
    {
      "id": "endo_case3_q3",
      "front": "Case 3: A newborn infant is examined in the delivery room and found to have ambiguous genitalia that cannot be clearly classified as male or female. Within the first week of life, the infant develops severe vomiting, dehydration, and circulatory shock (acute adrenal crisis). Laboratory evaluation reveals severe hyponatremia, hyperkalemia, and hypoglycemia.\n\nWhat does the long-term replacement medical therapy for this condition consist of?",
      "back": "Long term replacement therapy with hydrocortisone and a salt-retaining steroid like fludrocortisone."
    }
  ],
  "_CHAPTER_Hematology & Oncology": [
    {
      "id": "hema_saq_1",
      "front": "Define the following terms:\nHematopoiesis:",
      "back": "The process by which blood cells are produced."
    },
    {
      "id": "hema_saq_2",
      "front": "Define the following terms:\nErythropoiesis:",
      "back": "A specific subset of hematopoiesis responsible for the production of red blood cells."
    },
    {
      "id": "hema_saq_3",
      "front": "Define the following terms:\nAnemia:",
      "back": "Reduced blood hemoglobin (Hb) concentration or red blood cell (RBC) mass below normal range according to age and sex."
    },
    {
      "id": "hema_saq_4",
      "front": "Define the following terms:\nImmune Thrombocytopenia (ITP):",
      "back": "An acquired autoimmune disorder characterized by a low platelet count resulting from platelet destruction and impaired platelet production."
    },
    {
      "id": "hema_saq_5",
      "front": "Enumerate four etiological mechanisms/causes of Iron Deficiency Anemia (IDA).",
      "back": "Inadequate iron intake (e.g., poor diet, poverty, ignorance).\nPoor absorption (e.g., less vitamin C, inhibitors like phytates/tannin, or small intestine disorders).\nIncreased iron demand (periods of rapid growth like infancy, childhood, and adolescence).\nExcessive iron loss (e.g., menstruation, intestinal worms, hookworm infestation)."
    },
    {
      "id": "hema_saq_6",
      "front": "Enumerate four congenital physical anomalies associated with Fanconi Anemia.",
      "back": "Hypo or hyperpigmented skin patches with café-au-lait spots.\nShort stature (or Microcephaly).\nUpper or lower limb abnormalities (e.g., absent radius, absent or hypoplastic thumb).\nCongenital heart disease (or Renal anomalies like horseshoe kidney)."
    },
    {
      "id": "hema_saq_7",
      "front": "Enumerate four clinical manifestations of chronic hemolytic anemia.",
      "back": "Anemia (pallor) and unconjugated hyperbilirubinemia (jaundice).\nHepatosplenomegaly.\nPigmentary bilirubinate gallstones.\nSkeletal manifestations due to marrow expansion (large head, prominent maxillae, protruding central incisors) or Leg ulcers."
    },
    {
      "id": "hema_saq_8",
      "front": "Enumerate four clinical indications for starting blood transfusion in a patient with Thalassemia.",
      "back": "Hemoglobin level < 7 gm/dL (on at least 2 measurements).\nPoor growth.\nFacial bone changes.\nPathological fractures or extramedullary hematopoiesis."
    },
    {
      "id": "hema_saq_9",
      "front": "Enumerate the four classic clinical manifestations (tetrad) of Henoch-Schönlein Purpura (HSP).",
      "back": "Palpable purpura without thrombocytopenia and coagulopathy.\nArthralgia and/or arthritis.\nAbdominal pain.\nKidney disease (such as initial hematuria)."
    },
    {
      "id": "hema_saq_10",
      "front": "Enumerate four favorable prognostic factors for pediatric Acute Lymphoblastic Leukemia (ALL).",
      "back": "Age: between 1 and 9 years old.\nWhite blood cell count (WBCs): less than 50 × 10^9/L.\nImmunophenotype: B-precursor cellular lineage.\nSex: Girls have a more favorable prognosis than boys."
    },
    {
      "id": "hema_saq_11",
      "front": "Enumerate four clinical \"red flags\" for malignancy in pediatric patients.",
      "back": "Pathological lymphadenopathy (non-tender, rubbery/hard, increasing or persisting size).\nJoint or bone pain.\nPersistent headache.\nHepatosplenomegaly or a palpable abdominal mass."
    },
    {
      "id": "hema_match_1",
      "type": "matching",
      "front": "Match the pathognomonic diagnostic finding or cell type in Group (A) with its corresponding hematological/oncological condition in Group (B):",
      "matchingPairs": [
        {
          "left": "Target cells",
          "right": "Thalassemia Syndromes"
        },
        {
          "left": "Heinz bodies",
          "right": "Glucose-6-phosphate dehydrogenase (G6PD) deficiency"
        },
        {
          "left": "Schistocytes (fragmented RBCs)",
          "right": "Disseminated Intravascular Coagulopathy (DIC)"
        },
        {
          "left": "Reed-Sternberg (RS) cells",
          "right": "Hodgkin Lymphoma"
        }
      ]
    },
    {
      "id": "hema_case1_q1",
      "front": "Case 1: A 9-month-old male infant is brought to the clinic because of progressive pallor and poor feeding. The dietary history reveals that he has been fed unmodified cow's milk since the age of 4 months with no introduction of solid foods. A complete blood count (CBC) reveals a hemoglobin level of 6.5 g/dL with a mean corpuscular volume (MCV) of 62 fL (Normal: 75-90 fL).\n\nWhat is the morphological classification of this child's anemia?",
      "back": "Microcytic hypochromic anemia."
    },
    {
      "id": "hema_case1_q2",
      "front": "Case 1: A 9-month-old male infant is brought to the clinic because of progressive pallor and poor feeding. The dietary history reveals that he has been fed unmodified cow's milk since the age of 4 months with no introduction of solid foods. A complete blood count (CBC) reveals a hemoglobin level of 6.5 g/dL with a mean corpuscular volume (MCV) of 62 fL (Normal: 75-90 fL).\n\nWhat is the most likely diagnosis?",
      "back": "Iron Deficiency Anemia (IDA)."
    },
    {
      "id": "hema_case1_q3",
      "front": "Case 1: A 9-month-old male infant is brought to the clinic because of progressive pallor and poor feeding. The dietary history reveals that he has been fed unmodified cow's milk since the age of 4 months with no introduction of solid foods. A complete blood count (CBC) reveals a hemoglobin level of 6.5 g/dL with a mean corpuscular volume (MCV) of 62 fL (Normal: 75-90 fL).\n\nWhat dietary measure should have been taken to prevent this condition, according to your textbook guidelines?",
      "back": "Introduce iron-rich complementary foods at 4 to 6 months of age and completely avoid unmodified cow's milk until age 1 year."
    },
    {
      "id": "hema_case2_q1",
      "front": "Case 2: A 4-year-old boy is rushed to the emergency room with a sudden onset of dark, tea-colored urine, yellowish discoloration of the eyes (jaundice), and an abrupt drop in his hemoglobin concentration by 3.5 g/dL following the consumption of fava beans 48 hours ago. A peripheral blood smear shows characteristic bite cells and blister cells.\n\nWhat is the clinical diagnosis?",
      "back": "Acute hemolytic anemia secondary to G6PD deficiency (Favism)."
    },
    {
      "id": "hema_case2_q2",
      "front": "Case 2: A 4-year-old boy is rushed to the emergency room with a sudden onset of dark, tea-colored urine, yellowish discoloration of the eyes (jaundice), and an abrupt drop in his hemoglobin concentration by 3.5 g/dL following the consumption of fava beans 48 hours ago. A peripheral blood smear shows characteristic bite cells and blister cells.\n\nWhat is the genetic mode of inheritance for this enzyme disorder?",
      "back": "Sex-linked (X-linked) recessive mode of inheritance."
    },
    {
      "id": "hema_case2_q3",
      "front": "Case 2: A 4-year-old boy is rushed to the emergency room with a sudden onset of dark, tea-colored urine, yellowish discoloration of the eyes (jaundice), and an abrupt drop in his hemoglobin concentration by 3.5 g/dL following the consumption of fava beans 48 hours ago. A peripheral blood smear shows characteristic bite cells and blister cells.\n\nWhy should a diagnostic G6PD enzyme activity assay not be relied upon during this acute hemolytic episode?",
      "back": "Because during an acute hemolytic episode, enzyme activity may appear falsely normal (false-negative), and testing must be repeated approximately 3 months after the episode resolves."
    },
    {
      "id": "hema_case3_q1",
      "front": "Case 3: A 10-month-old boy presents with a large, painful swelling of his right knee (hemarthrosis) that developed after he started crawling around the house. His parents mention he also had excessive, prolonged bleeding following his circumcision at 7 months of age. Laboratory screening reveals a prolonged activated partial thromboplastin time (aPTT) but a completely normal prothrombin time (PT) and normal platelet count.\n\nWhat is the most likely clinical diagnosis?",
      "back": "Inherited Hemophilia (A or B)."
    },
    {
      "id": "hema_case3_q2",
      "front": "Case 3: A 10-month-old boy presents with a large, painful swelling of his right knee (hemarthrosis) that developed after he started crawling around the house. His parents mention he also had excessive, prolonged bleeding following his circumcision at 7 months of age. Laboratory screening reveals a prolonged activated partial thromboplastin time (aPTT) but a completely normal prothrombin time (PT) and normal platelet count.\n\nWhat is the genetic inheritance pattern of this disease, and why are males predominantly affected?",
      "back": "It is an X-linked recessive disorder; males are predominantly affected because they possess a single X chromosome."
    },
    {
      "id": "hema_case3_q3",
      "front": "Case 3: A 10-month-old boy presents with a large, painful swelling of his right knee (hemarthrosis) that developed after he started crawling around the house. His parents mention he also had excessive, prolonged bleeding following his circumcision at 7 months of age. Laboratory screening reveals a prolonged activated partial thromboplastin time (aPTT) but a completely normal prothrombin time (PT) and normal platelet count.\n\nEnumerate two standard safe alternatives for analgesia/pain control in this patient.",
      "back": "Paracetamol, COX-2 inhibitors, or opioids."
    },
    {
      "id": "hema_case4_q1",
      "front": "Case 4: An otherwise completely healthy and active 3-year-old girl develops a sudden generalized skin rash consisting of pinpoint petechiae, purpura, and scattered bruises (ecchymoses). The mother reports that the child had a mild viral upper respiratory tract infection 2 weeks ago. Physical examination reveals an absence of fever, no lymphadenopathy, and no hepatosplenomegaly. A CBC shows an isolated platelet count of 15,000/μL with completely normal hemoglobin and normal WBC count.\n\nWhat is the most likely clinical diagnosis?",
      "back": "Primary Immune Thrombocytopenia (ITP) of childhood."
    },
    {
      "id": "hema_case4_q2",
      "front": "Case 4: An otherwise completely healthy and active 3-year-old girl develops a sudden generalized skin rash consisting of pinpoint petechiae, purpura, and scattered bruises (ecchymoses). The mother reports that the child had a mild viral upper respiratory tract infection 2 weeks ago. Physical examination reveals an absence of fever, no lymphadenopathy, and no hepatosplenomegaly. A CBC shows an isolated platelet count of 15,000/μL with completely normal hemoglobin and normal WBC count.\n\nWhat would a bone marrow aspiration (BMA) characteristically demonstrate if performed?",
      "back": "Normal granulocytic and erythrocytic series with characteristically normal or increased numbers of megakaryocytes."
    },
    {
      "id": "hema_case4_q3",
      "front": "Case 4: An otherwise completely healthy and active 3-year-old girl develops a sudden generalized skin rash consisting of pinpoint petechiae, purpura, and scattered bruises (ecchymoses). The mother reports that the child had a mild viral upper respiratory tract infection 2 weeks ago. Physical examination reveals an absence of fever, no lymphadenopathy, and no hepatosplenomegaly. A CBC shows an isolated platelet count of 15,000/μL with completely normal hemoglobin and normal WBC count.\n\nIf this patient develops an acute, life-threatening intracranial hemorrhage, what is the only clinical indication for a platelet transfusion in ITP management?",
      "back": "Life-threatening bleeding is the only indication for a platelet transfusion in the treatment of ITP."
    },
    {
      "id": "hema_case5_q1",
      "front": "Case 5: A 3-year-old child presents with an asymptomatic, firm, smooth abdominal mass that was discovered incidentally by his mother while bathing him. On physical examination, the clinician notes that the mass does not cross the midline. The child's blood pressure is elevated for his age (135/90 mmHg). Urinalysis reveals microscopic hematuria, but urinary catecholamine metabolites (VMA and HVA) are entirely within normal limits.\n\nWhat is the most likely primary malignant renal diagnosis?",
      "back": "Wilms tumor (Nephroblastoma)."
    },
    {
      "id": "hema_case5_q2",
      "front": "Case 5: A 3-year-old child presents with an asymptomatic, firm, smooth abdominal mass that was discovered incidentally by his mother while bathing him. On physical examination, the clinician notes that the mass does not cross the midline. The child's blood pressure is elevated for his age (135/90 mmHg). Urinalysis reveals microscopic hematuria, but urinary catecholamine metabolites (VMA and HVA) are entirely within normal limits.\n\nWhy should the clinician avoid vigorous or deep abdominal palpation during the physical examination of this child?",
      "back": "Care should be taken to avoid vigorous palpation to prevent the risk of renal capsule rupture."
    },
    {
      "id": "hema_case5_q3",
      "front": "Case 5: A 3-year-old child presents with an asymptomatic, firm, smooth abdominal mass that was discovered incidentally by his mother while bathing him. On physical examination, the clinician notes that the mass does not cross the midline. The child's blood pressure is elevated for his age (135/90 mmHg). Urinalysis reveals microscopic hematuria, but urinary catecholamine metabolites (VMA and HVA) are entirely within normal limits.\n\nWhy is a diagnostic percutaneous needle biopsy discouraged in this condition?",
      "back": "Because it results in disease upstaging."
    }
  ],
  "Renal Anatomy, Functions & Urine Color Changes": [],
  "Pediatric Hematuria Approach & Evaluation": [
    {
      "id": "phae1",
      "front": "List 4 indications of renal biopsy in acute post-streptococcal glomerulonephritis.",
      "back": "Acute kidney injury (AKI) and rapidly progressive glomerulonephritis (RPGN).\n\nNephrotic range proteinuria.\n\nAbsence of evidence for previous streptococcal infection.\n\nNormal complement (C3) levels.\n\nPersistent hematuria, proteinuria, diminished renal function, and/or a low C3 level persisting for more than 2 months after onset."
    }
  ],
  "Acute Nephritic Syndrome & APSGN (1)": [
    {
      "id": "ans1",
      "front": "Regarding acute poststreptococcal glomerulonephritis: Name 2 diagnostic criteria of APSGN.",
      "back": "Acute nephritic syndrome presentation (Sudden onset of gross hematuria, edema, hypertension, oliguria).\n\nEvidence of recent streptococcal infection (e.g., positive throat culture, or rising ASO/Anti-DNase B titer).\n\n(Low C3 level which returns to normal after 6-8 weeks)."
    },
    {
      "id": "ans2",
      "front": "Regarding acute poststreptococcal glomerulonephritis: Enumerate 2 possible related complications.",
      "back": "Hypertensive encephalopathy.\n\nCongestive heart failure (due to hypervolemia/fluid overload).\n\n(Hyperkalemia, Acute kidney injury, or Rapidly Progressive Glomerulonephritis)."
    }
  ],
  "Acute Nephritic Syndrome & APSGN (2)": [],
  "Proteinuria Detection & Etiological Sorting": [],
  "Nephrotic Syndrome (NS)": [
    {
      "id": "ns1",
      "front": "Enumerate 4 of the differential diagnoses of a child presented with generalized edema.",
      "back": "Renal causes (e.g., Nephrotic syndrome, Acute nephritic syndrome).\n\nCardiac causes (e.g., Congestive heart failure).\n\nHepatic causes (e.g., Liver cirrhosis / failure causing hypoalbuminemia).\n\nNutritional causes (e.g., Kwashiorkor / Protein-energy malnutrition).\n\n(Angioneurotic edema)."
    },
    {
      "id": "ns2",
      "front": "List 4 complications of nephrotic syndrome.",
      "back": "Infections (e.g., Spontaneous bacterial peritonitis, pneumonia, sepsis).\n\nThromboembolic events (arterial and venous thrombosis, like renal vein thrombosis).\n\nHypovolemic shock (with aggressive diuretic therapy).\n\nAcute renal failure.\n\nComplications of therapy (e.g., Steroid toxicity, cyclophosphamide toxicity)."
    },
    {
      "id": "ns3",
      "front": "Enumerate 5 causes of secondary Nephrotic Syndrome.",
      "back": "Systemic Lupus Erythematosus (SLE).\n\nHenoch-Schönlein purpura (HSP).\n\nCongenital infections (TORCH).\n\nDenys-Drash syndrome (Wilms tumor, genitourinary anomalies).\n\nDrug-induced."
    },
    {
      "id": "ns4",
      "front": "Case Study: Mona is 7 years-old, presented to pediatric clinic by generalized edema. There is past history similar condition 5 times during the last year. Investigations: Plasma proteins: 3 gm/dl (N=6-8 gm/dl), Serum albumin: 1.4 gm/dl, Serum cholesterol: 290 mg/dl (N=120-180 mg/dl), Blood urea: 25 mg/dl (N=20-40 mg/dl), Serum creatinine: 0.7 mg/dl (N=0.5-1.0 mg/dl), Urine examination: granular cast, protein in urine: 60 mg/m2/hour (N<4 mg/m2/hour). What is the most likely diagnosis?",
      "back": "Idiopathic Nephrotic Syndrome (Specifically: Frequent Relapsing Nephrotic Syndrome)."
    },
    {
      "id": "ns5",
      "front": "Case Study (Mona, 7 yrs old with generalized edema...): Explain your answer.",
      "back": "The diagnosis is confirmed by the classic tetrad of Nephrotic Syndrome:\n\nHeavy (Nephrotic range) Proteinuria: Exceeding 40 mg/m2/hr (Patient has 60 mg/m2/hour).\n\nHypoalbuminemia/Hypoproteinemia: Serum albumin is 1.4 gm/dl (Normal >2.5).\n\nHypercholesterolemia (Hyperlipidemia): Serum cholesterol is 290 mg/dl.\n\nGeneralized Edema.\n\nThe normal blood urea and serum creatinine indicate intact kidney function (ruling out nephritic syndrome/renal failure). The history of recurring 5 times in the last year defines her as a \"Frequent Relapser\"."
    }
  ],
  "Acute Kidney Injury (AKI) & pRIFLE Criteria": [],
  "Chronic Kidney Disease (CKD) & Growth Retardation": [
    {
      "id": "ckd1",
      "front": "Write short account about Stages of CKD.",
      "back": "Staging is based on the Glomerular Filtration Rate (GFR in ml/min/1.73m2):\n\nStage 1: GFR More than 90 (Kidney damage with normal or increased GFR).\n\nStage 2: GFR 60 - 89 (Mild decrease in GFR).\n\nStage 3: GFR 30 - 59 (Moderate decrease in GFR).\n\nStage 4: GFR 15 - 29 (Severe decrease in GFR).\n\nStage 5: GFR < 15 (End Stage Renal Disease / ESRD, requiring dialysis or transplant)."
    },
    {
      "id": "ckd2",
      "front": "List 4 causes contributing to the pathogenesis of renal osteodystrophy in cases with chronic kidney disease.",
      "back": "Impaired renal production of active vitamin D (1,25-dihydroxycholecalciferol).\n\nHyperphosphatemia (due to decreased glomerular filtration).\n\nHypocalcemia (resulting from low active Vitamin D and high phosphate).\n\nSecondary hyperparathyroidism (excessive PTH secretion in response to hypocalcemia and hyperphosphatemia)."
    }
  ],
  "URINARY TRACT INFECTIONS (UTIs) & RENAL IMAGING PROTOCOL": [
    {
      "id": "uti1",
      "front": "Case Study 1: A 5-year-old female child presented with fever, chills and flank pain. Investigations: Blood urea: 20 mg/dl, Serum creatinine: 0.7 mg/dl, Urine exam: WBCs casts, 100 pus cells/HPF. What is the most likely diagnosis?",
      "back": "Acute Pyelonephritis (Upper Urinary Tract Infection)."
    },
    {
      "id": "uti2",
      "front": "Case Study 1 (5-year-old female with fever, chills, flank pain...): Describe the possible treatment plan.",
      "back": "Medical Therapy: Parenteral broad-spectrum antibiotics for 14 days. Ceftriaxone (50-75 mg/kg/24 hr) OR Ampicillin with an Aminoglycoside (Gentamicin).\n\nSupportive: Adequate hydration and antipyretics.\n\nImaging / Follow-up: Renal ultrasound (to rule out hydronephrosis/abscess) and a Voiding Cystourethrogram (VCUG) since she is ≤5 years old with a febrile UTI, to check for Vesicoureteral Reflux (VUR) or anatomical abnormalities."
    },
    {
      "id": "uti3",
      "front": "Case Study 2: Mona is 5 years old child, presented by fever, chills and flank pain. Investigations: Blood urea: 20 mg/dl, Serum creatinine: 0.6 mg/dl, Urine analysis: WBCs casts, 100 pus cells/HPF. What is the most likely diagnosis?",
      "back": "Acute Pyelonephritis."
    },
    {
      "id": "uti4",
      "front": "Case Study 2 (Mona, 5 years old with fever, chills, flank pain...): What is the possible TTT (Treatment)?",
      "back": "Parenteral antibiotic therapy (Ceftriaxone or Ampicillin + Gentamicin) for 14 days, combined with imaging studies (US & VCUG) to detect any predisposing anomalies like VUR."
    }
  ],
  "RBC Physiology, Indices & Morphology": [],
  "Classification & Evaluation of Anemia": [
    {
      "id": "cea1",
      "front": "Hematological causes of splenomegaly?",
      "back": "Chronic hemolytic anemia (e.g., Thalassemia, Hereditary spherocytosis).\n\nLeukemias (ALL, AML, CML).\n\nLymphomas (Hodgkin's and Non-Hodgkin's).\n\nExtramedullary hematopoiesis."
    },
    {
      "id": "cea2",
      "front": "List 4 indications for splenectomy in hematological diseases?",
      "back": "Hereditary spherocytosis (after age of 5 years).\n\nThalassemia major (if hypersplenism occurs causing increased blood transfusion needs).\n\nImmune Thrombocytopenic Purpura (ITP) (chronic refractory cases).\n\nAutoimmune hemolytic anemia (unresponsive to steroids)."
    },
    {
      "id": "cea3",
      "front": "List the different types of chronic hemolytic anemia that could be diagnosed through blood film examination, and name the diagnostic cells for each.",
      "back": "Hereditary Spherocytosis: Spherocytes (small, dense RBCs with no central pallor).\n\nSickle Cell Disease: Sickle cells (crescent-shaped RBCs).\n\nThalassemia: Target cells, hypochromic microcytic RBCs, and nucleated RBCs.\n\nG6PD Deficiency (during attack): Bite cells and Heinz bodies (requires special stain)."
    },
    {
      "id": "cea4",
      "front": "List 4 early post splenectomy complications?",
      "back": "Bleeding (hemorrhage).\n\nInfection (Overwhelming Post-Splenectomy Infection - OPSI, mainly by encapsulated organisms like Pneumococcus).\n\nThrombocytosis.\n\nPancreatitis or injury to surrounding organs during surgery."
    },
    {
      "id": "cea5",
      "front": "Case 1: A 20-month-old boy presents to you with pallor. His diet contains a good amount of fortified cereal and red meat. HB 9.0, MCV 58, MCHC 28, normal platelets, and a reticulocyte count of 4%. What is the most likely diagnosis?",
      "back": "Thalassemia Trait (Beta-thalassemia minor) - suggested by the microcytic hypochromic anemia with a slightly elevated reticulocyte count in a child with a good iron intake."
    },
    {
      "id": "cea6",
      "front": "Case 1 (20-month-old boy with pallor, HB 9.0, MCV 58...): What is the D.D.?",
      "back": "Iron Deficiency Anemia (IDA), Sideroblastic anemia, Lead poisoning."
    },
    {
      "id": "cea7",
      "front": "Case 1 (20-month-old boy with pallor, HB 9.0, MCV 58...): What are the further investigations to help diagnosis?",
      "back": "Hemoglobin electrophoresis (High HbA2 and HbF indicates Thalassemia trait) and Iron profile to exclude IDA (will be normal in Thalassemia)."
    }
  ],
  "Iron Deficiency Anemia (IDA)": [
    {
      "id": "ida1",
      "front": "2 & 4) Causes of IDA, clinical picture, investigation: Causes",
      "back": "Decreased intake: prolonged exclusive breastfeeding without supplementation, early cow's milk introduction, poor diet.\nIncreased demand: prematurity, rapid growth (infancy and puberty).\nBlood loss: parasitic infestations, cow's milk allergy (occult bleeding), peptic ulcer, menstruation.\nMalabsorption: Celiac disease."
    },
    {
      "id": "ida2",
      "front": "2 & 4) Causes of IDA, clinical picture, investigation: Clinical picture",
      "back": "General: pallor, fatigue, anorexia, tachycardia, heart murmur.\nSpecific signs: Pica (eating non-nutritive substances), spooning of nails (koilonychia), angular stomatitis, smooth red tongue."
    },
    {
      "id": "ida3",
      "front": "2 & 4) Causes of IDA, clinical picture, investigation: Investigations",
      "back": "CBC: Microcytic hypochromic anemia (low MCV, low MCH, low Hb).\n\nIron profile: Low serum Iron, Low Ferritin, High TIBC."
    },
    {
      "id": "ida4",
      "front": "Case Scenario: A 3-year-old girl is brought for routine well-childcare. The family says she is a \"picky\" eater, preferring whole milk over meats. CBC shows microcytosis with hypochromia and hemoglobin of 8 g/dl. What is the most likely etiology for this child's microcytic anemia?",
      "back": "Iron Deficiency Anemia."
    },
    {
      "id": "ida5",
      "front": "Case Scenario (3-year-old picky eater...): What is the most appropriate test to confirm this etiology?",
      "back": "Serum Ferritin level (will be low)."
    },
    {
      "id": "ida6",
      "front": "Case Scenario (3-year-old picky eater...): What is the treatment?",
      "back": "Oral Iron therapy (Ferrous sulfate) for 3-6 months + Dietary modification (decrease cow's milk, increase iron-rich foods)."
    }
  ],
  "Megaloblastic Anemias (B12 & Folate Deficiency)": [],
  "Aplastic Anemia & BM Failure Syndromes": [
    {
      "id": "aa1",
      "front": "Enumerate 4 complications of bone marrow transplantation?",
      "back": "Graft-versus-host disease (GVHD).\n\nInfections (due to severe immunosuppression).\n\nGraft rejection / failure.\n\nVeno-occlusive disease of the liver (Hepatic sinusoidal obstruction syndrome)."
    },
    {
      "id": "aa2",
      "front": "Outline the management of patient with aplastic anemia?",
      "back": "Supportive: Red blood cell & Platelet transfusions, broad-spectrum antibiotics (for febrile neutropenia).\n\nDefinitive: Hematopoietic Stem Cell Transplantation (HSCT) if an HLA-matched sibling donor is available.\n\nMedical: Immunosuppressive therapy (Antithymocyte globulin \"ATG\" + Cyclosporine) if no matched donor."
    }
  ],
  "Chronic Hemolytic Anemia & Hereditary Spherocytosis": [
    {
      "id": "hs1",
      "front": "3 & 7) About Hereditary spherocytosis (Definition, Pathogenesis):",
      "back": "Definition: Inherited (autosomal dominant) chronic hemolytic anemia characterized by abnormally shaped red blood cells (spherocytes) that are easily destroyed in the spleen.\n\nPathogenesis: Genetic defect in the RBC membrane cytoskeleton proteins (Spectrin or Ankyrin). RBCs become spherical (spherocytes) and rigid, trapping them in the spleen where they are prematurely destroyed by macrophages."
    },
    {
      "id": "hs2",
      "front": "3 & 7) About Hereditary spherocytosis (C/P, Complications, Treatment):",
      "back": "C/P (Clinical Picture): Triad of Anemia, Jaundice (fluctuating), and Splenomegaly. Often positive family history.\n\nComplications: Aplastic crisis (Parvovirus B19), Hemolytic crisis, Pigment gallstones.\n\nTreatment: Folic acid supplementation. Splenectomy (curative) after the age of 5 years."
    },
    {
      "id": "hs3",
      "front": "Explain how splenectomy can be curative in hereditary spherocytosis.",
      "back": "The premature destruction (hemolysis) occurs exclusively in the spleen because the rigid spherocytes cannot pass through its microcirculation. Removing the spleen eliminates the primary site of destruction, allowing the spherocytes to survive normally in the circulation, thus curing the anemia."
    },
    {
      "id": "hs4",
      "front": "Case Scenario: A previously normal 10-year-old experiences pallor, fatigue, and a fall in hemoglobin level from 13 to 8 g/dl. His spleen is slightly enlarged. The reticulocyte count is 10%. Many spherocytes are observed on the blood smear. What is the most likely diagnosis?",
      "back": "Hereditary Spherocytosis (experiencing a hemolytic crisis)."
    },
    {
      "id": "hs5",
      "front": "Case Scenario (10-year-old with spherocytes...): What is the best treatment?",
      "back": "Splenectomy (since he is > 5 years old) preceded by vaccines."
    },
    {
      "id": "hs6",
      "front": "Case Scenario (10-year-old with spherocytes...): What is the next diagnostic step?",
      "back": "Osmotic fragility test (will be increased)."
    }
  ],
  "The Thalassemia Syndromes (Alpha & Beta)": [],
  "Sickle Cell Disease (SCD)": [
    {
      "id": "scd1",
      "front": "List four crises occurring in children with sickle cell disease",
      "back": "Four Crises: 1) Vaso-occlusive (painful) crisis. 2) Splenic sequestration crisis. 3) Aplastic crisis. 4) Hemolytic crisis."
    },
    {
      "id": "scd2",
      "front": "describe the clinical picture, and the treatment for one of them (Vaso-occlusive crisis)",
      "back": "Clinical Picture: Severe pain in bones (arms, legs, back), Dactylitis in infants, acute chest syndrome, or stroke.\n\nTreatment: Intravenous hydration, potent Analgesia (NSAIDs or Opiates like Morphine), Oxygen therapy if hypoxic."
    }
  ],
  "G6PD Deficiency & Immune Hemolytic Anemias": [
    {
      "id": "g6pd1",
      "front": "Case Scenario: A previously normal African American army recruit was assigned to Southeast Asia and given malarial prophylaxis. He experienced pallor, fatigue, and dark urine. His hemoglobin level decreased from 14.8 to 9 g/dL. What is the most likely diagnosis?",
      "back": "G6PD Deficiency (Acute hemolytic episode precipitated by antimalarial drugs)."
    },
    {
      "id": "g6pd2",
      "front": "Case Scenario (Army recruit given malarial prophylaxis...): What is the best treatment?",
      "back": "Immediate discontinuation of the offending drug. Blood transfusion if anemia is severe."
    },
    {
      "id": "g6pd3",
      "front": "Case Scenario (Army recruit given malarial prophylaxis...): What is the next diagnostic step?",
      "back": "Quantitative G6PD enzyme assay (done weeks after the acute episode resolves). During the attack, a blood film showing \"Heinz bodies\" and \"bite cells\" is suggestive."
    }
  ],
  "Hemostasis & Bleeding Disorders": [
    {
      "id": "hbd1",
      "front": "Enumerate Causes of bleeding tendency.",
      "back": "Platelet disorders (Quantitative like ITP, or Qualitative).\n\nCoagulation factor deficiencies (Hemophilia A/B, VWD).\n\nVascular disorders (Henoch-Schönlein Purpura - HSP).\n\nMixed/Acquired conditions (DIC, Liver failure)."
    },
    {
      "id": "hbd2",
      "front": "Mention 3 differentiating clinical points between platelet disorders & clotting factor disorders.",
      "back": "Site of bleeding: Platelet (mucocutaneous); Factor (deep tissues - joints, muscles).\n\nLesions: Platelet (Petechiae and superficial ecchymoses); Factor (Large hematomas, no petechiae).\n\nBleeding after trauma: Platelet (Immediate but stops with local pressure); Factor (Delayed bleeding, not easily controlled by pressure)."
    },
    {
      "id": "hbd3",
      "front": "40 & 41) When to suspect bleeding or hemorrhage disorder? / The most important point in a history is:",
      "back": "Suspect it in: Spontaneous heavy bleeding, prolonged bleeding post-trauma/circumcision, bleeding from multiple orifices, or recurrent hemarthrosis.\n\nMost important point in history: Family history."
    }
  ],
  "Inherited Coagulation Hemophilia & VWD": [
    {
      "id": "ich1",
      "front": "Mention C/P and management of hemophilia.",
      "back": "C/P: Exclusively in males. Deep tissue bleeding (Hemarthrosis, Muscle hematomas), prolonged bleeding after trauma/circumcision. No petechiae.\n\nManagement: Avoid trauma/IM injections/Aspirin. Specific therapy: Factor VIII concentrate replacement (for Hemophilia A) or Factor IX (for Hemophilia B)."
    },
    {
      "id": "ich2",
      "front": "List 4 differences between VWD and hemophilia A and mention the treatment of one of them?",
      "back": "Differences: 1) Inheritance: VWD (Autosomal dominant); Hemophilia (X-linked recessive).\n2) Bleeding Type: VWD (Mucocutaneous); Hemophilia (Deep tissue).\n3) Defect: VWD (vWF affecting primary hemostasis); Hemophilia (Factor VIII).\n4) Labs: VWD (Prolonged Bleeding Time and APTT); Hemophilia (Normal Bleeding Time, Prolonged APTT).\n\nTreatment of VWD: Desmopressin (DDAVP) or vWF/Factor VIII concentrates."
    },
    {
      "id": "ich3",
      "front": "Describe a management plan for a child with severe hemophilia.",
      "back": "Prophylactic regular replacement therapy with Factor VIII concentrates (e.g., 3 times a week).\n\nPrompt \"on-demand\" factor replacement during acute bleeding.\n\nMultidisciplinary care (physiotherapy for joints), avoid NSAIDs."
    },
    {
      "id": "ich4",
      "front": "Young girl presented with menorrhagia & severe pallor: Important point in history?",
      "back": "Family history of mucosal bleeding or heavy menses."
    },
    {
      "id": "ich5",
      "front": "Young girl presented with menorrhagia & severe pallor: Investigations?",
      "back": "CBC, Bleeding Time (Prolonged), APTT, vWF antigen level."
    },
    {
      "id": "ich6",
      "front": "Young girl presented with menorrhagia & severe pallor: Diagnosis?",
      "back": "Von Willebrand Disease (VWD)."
    },
    {
      "id": "ich7",
      "front": "Young girl presented with menorrhagia & severe pallor: Treatment?",
      "back": "Desmopressin (DDAVP), Antifibrinolytics (Tranexamic acid), or OCPs."
    }
  ],
  "Platelet Disorders ITP & Thrombocytopenias": [
    {
      "id": "pd1",
      "front": "3 & 6) Enumerate 4 causes of thrombocytopenia? / causes of platelets disorders:",
      "back": "Increased destruction (Immune: ITP / Non-immune: HUS, DIC, Hypersplenism).\n\nDecreased production (Aplastic anemia, Leukemia).\n\nSequestration (Splenomegaly).\n\nInherited (Wiskott-Aldrich syndrome)."
    },
    {
      "id": "pd2",
      "front": "Outline the management of patient with thrombocytopenia? (Specifically acute ITP)",
      "back": "Observation: If bleeding is mild and platelets >20,000-30,000.\n\nMedical Treatment: Oral Corticosteroids, IVIG, or Anti-D (if active bleeding or very low platelets).\n\nEmergency: Platelet transfusion + IVIG + high-dose IV steroids."
    },
    {
      "id": "pd3",
      "front": "Case Study: A 10-year-old male child presented with increased paleness... HSM with no lymphadenopathy. Platelet count was 26 x 10³/µL. What is your provisional diagnosis?",
      "back": "Hypersplenism secondary to Portal Hypertension OR a storage disease like Gaucher disease."
    },
    {
      "id": "pd4",
      "front": "Case Study (10-year-old with HSM, Platelets 26k...): Is there any further needed investigation?",
      "back": "LFTs, Abdominal Ultrasound (with Doppler), and Bone marrow aspiration."
    },
    {
      "id": "pd5",
      "front": "Case Study (10-year-old with HSM, Platelets 26k...): Treatment plan?",
      "back": "Treatment of the underlying cause. Avoid trauma. Splenectomy may be considered in severe cases."
    },
    {
      "id": "pd6",
      "front": "Case Scenario: A 4-year-old child... new onset of severe bruising on her legs. Mucosal bleeding in the oral cavity. Flu-like symptoms several weeks earlier. No family history of bleeding disorders. a. Grades of severity & management of patient with ITP?",
      "back": "Mild (Observation), Moderate/Severe as in this case (Medical treatment: IVIG or Steroids), Life-threatening (Platelets + high dose meds)."
    },
    {
      "id": "pd7",
      "front": "Case Scenario (4-year-old child with severe bruising...): b. Important findings in clinical examination?",
      "back": "Presence of petechiae/mucosal bleeding. Crucial negative findings: NO hepatosplenomegaly and NO lymphadenopathy."
    },
    {
      "id": "pd8",
      "front": "Case Scenario (4-year-old child with severe bruising...): d. Most useful initial investigation?",
      "back": "CBC with Peripheral Blood Smear."
    },
    {
      "id": "pd9",
      "front": "Case Scenario (4-year-old child with severe bruising...): e. Treatment plan?",
      "back": "Restrict physical activity, avoid NSAIDs, and start IVIG or oral Corticosteroids (due to mucosal bleeding)."
    },
    {
      "id": "pd10",
      "front": "Case 1: A 22-year-old female patient... multiple petechiae and mild epistaxis. Plt 30,000. Bone marrow biopsy showed numerous megakaryocytes. Spleen diameter 10 cm. Most probable diagnosis?",
      "back": "Immune Thrombocytopenic Purpura (ITP)."
    },
    {
      "id": "pd11",
      "front": "Case 1 (22-year-old female with petechiae...): Justify your Diagnosis?",
      "back": "Isolated thrombocytopenia, clinically normal spleen size, and a bone marrow biopsy showing increased megakaryocytes (indicating peripheral destruction)."
    },
    {
      "id": "pd12",
      "front": "Case 1 (22-year-old female with petechiae...): Outline the treatment?",
      "back": "First-line: Corticosteroids. If severe: IVIG or Anti-D."
    },
    {
      "id": "pd13",
      "front": "Case Scenario: A 3-year-old boy presents with sudden onset of rash (small red spots and large purple area). Three weeks previously, he had a mild illness. Spleen is not palpable. Platelet count is 20,000/mm³. Most likely diagnosis?",
      "back": "Acute Immune Thrombocytopenic Purpura (Acute ITP)."
    },
    {
      "id": "pd14",
      "front": "Case Scenario (3-year-old boy with rash...): Next step in management?",
      "back": "Reassurance, restrict physical activities, avoid IM injections/NSAIDs. A short course of oral Corticosteroids or observation depending on guidelines."
    }
  ],
  "Non-Thrombocytopenic Purpura (Vascular & HSP)": [
    {
      "id": "ntp1",
      "front": "Case 2: A 5-year-old boy... low-grade fever, colicky abdominal pain, and a rash mainly on the back of his legs and buttocks. Stool positive for blood and a normal platelet count. What is the most likely diagnosis?",
      "back": "Henoch-Schönlein Purpura (HSP) / IgA Vasculitis."
    },
    {
      "id": "ntp2",
      "front": "Case 2 (5-year-old boy with HSP...): What are the renal manifestations?",
      "back": "Microscopic or macroscopic hematuria, proteinuria, and sometimes glomerulonephritis."
    },
    {
      "id": "ntp3",
      "front": "Case 2 (5-year-old boy with HSP...): What is the treatment?",
      "back": "Supportive (Hydration, rest, NSAIDs for joint pain). Systemic Corticosteroids are indicated for severe colicky abdominal pain or severe GI bleeding."
    }
  ],
  "Pediatric Oncology The Leukemias (ALL & AML)": [
    {
      "id": "pol1",
      "front": "Define leukemia and its classification in children, then mention clinical picture and treatment of the most common type in children.",
      "back": "Definition: Malignant proliferation of white blood cell precursors (blasts) in the bone marrow, which suppress normal hematopoiesis.\n\nClassification: Acute Lymphoblastic Leukemia (ALL) - most common (80%). Acute Myeloid Leukemia (AML) (15-20%).\n\nMost common type (ALL) C/P: Bone marrow failure signs (Pallor, bleeding/petechiae, fever/infections) + Infiltration signs (Bone pain, hepatosplenomegaly, lymphadenopathy).\n\nTreatment of ALL: Multi-agent chemotherapy (Induction, Consolidation, Maintenance) + CNS prophylaxis (intrathecal methotrexate)."
    },
    {
      "id": "pol2",
      "front": "Describe the clinical picture of acute lymphoblastic leukemia in children, list the investigations required for diagnosis.",
      "back": "Clinical picture: Bone marrow failure signs (Pallor, bleeding/petechiae, fever/infections) + Infiltration signs (Bone pain, hepatosplenomegaly, lymphadenopathy).\n\nInvestigations: CBC (abnormal blasts), Bone Marrow Aspiration (>20% blasts), Flow cytometry (Immunophenotyping), and Lumbar puncture."
    },
    {
      "id": "pol3",
      "front": "About AML: a. What is the Diagnosis?",
      "back": "Diagnosis: CBC and Bone Marrow Aspiration showing >20% myeloblasts (often contain \"Auer rods\" and are MPO positive)."
    },
    {
      "id": "pol4",
      "front": "About AML: b. What is the Treatment?",
      "back": "Treatment: Intensive combination chemotherapy (Cytarabine + Anthracycline) +/- HSCT."
    },
    {
      "id": "pol5",
      "front": "From Blood Film Test: 1) Name of this test: 2) Enumerate abnormalities in this test:",
      "back": "1) Name of this test: Peripheral blood smear.\n\n2) Abnormalities: Presence of abnormal nucleated cells (blasts), decreased RBCs, decreased platelets."
    },
    {
      "id": "pol6",
      "front": "From Blood Film Test: 3) Name the abnormal cells: 4) Diagnosis:",
      "back": "3) Name the abnormal cells: Blast cells (Lymphoblasts or Myeloblasts).\n\n4) Diagnosis: Acute Leukemia."
    },
    {
      "id": "pol7",
      "front": "Case scenario of acute leukemia in a child: a. Classifications of acute leukemia? b. Cutoff points of blast cells for diagnosis?",
      "back": "a. Classifications: ALL (B-cell or T-cell) and AML.\n\nb. Cutoff points: > 20% blast cells in the bone marrow."
    },
    {
      "id": "pol8",
      "front": "Case scenario of acute leukemia in a child: c. Is there any staging system for leukemia? d. Principle of ttt of acute leukemia:",
      "back": "c. Staging: No traditional TNM staging. \"Risk Stratification\" is used (Standard Risk vs. High Risk).\n\nd. Principle of ttt: Systemic combination chemotherapy divided into phases (Induction, Consolidation, Maintenance) + CNS-directed therapy."
    }
  ],
  "Lymphomas & Solid Tumors": [
    {
      "id": "lst1",
      "front": "Define neuroblastoma, describe its clinical presentation and outline its diagnostic workup.",
      "back": "Definition: Embryonal extracranial solid tumor arising from neural crest cells, commonly in the adrenal medulla or sympathetic ganglia.\n\nClinical presentation: Abdominal mass (firm, irregular, often crossing the midline), signs of metastasis (proptosis/\"raccoon eyes\", bone pain), and Paraneoplastic syndromes (Opsoclonus-myoclonus syndrome).\n\nDiagnostic workup: Urine catecholamine metabolites (VMA and HVA), Abdominal CT/MRI, MIBG scan, and Tissue Biopsy."
    },
    {
      "id": "lst2",
      "front": "Describe the clinical picture of Wilms tumor in children, list the investigations required for the diagnosis and treatment.",
      "back": "Clinical picture: Asymptomatic, smooth, firm abdominal mass that rarely crosses the midline. May present with microscopic hematuria or hypertension.\n\nInvestigations: Abdominal Ultrasound, CT/MRI of abdomen, CT chest (to check for lung metastasis), Urinalysis.\n\nTreatment: Surgical excision (radical nephrectomy) + Chemotherapy +/- Radiotherapy."
    },
    {
      "id": "lst3",
      "front": "Regarding Lymphoma Management Protocols: Supportive care of a case of NHL:",
      "back": "Vigorous IV hydration, Allopurinol/Rasburicase (prevent Tumor Lysis Syndrome), Alkalinization of urine, and infection treatment."
    },
    {
      "id": "lst4",
      "front": "Regarding Lymphoma Management Protocols: Role of surgery in lymphoma? Diagnosis?",
      "back": "Role of surgery: Strictly diagnostic (Excisional biopsy of lymph node). Not for debulking.\n\nDiagnosis: Excisional tissue biopsy is the gold standard."
    },
    {
      "id": "lst5",
      "front": "Regarding Lymphoma Management Protocols: Compression manifestation (obstruction)?",
      "back": "Superior Vena Cava (SVC) syndrome, mediastinal mass airway obstruction, or intussusception."
    },
    {
      "id": "lst6",
      "front": "Regarding Lymphoma Management Protocols: Role of radiotherapy in lymphoma HL, before splenectomy?",
      "back": "Involved-field radiotherapy is often used in Hodgkin Lymphoma as consolidation therapy for bulky disease."
    },
    {
      "id": "lst7",
      "front": "Case Scenario: A 3-year-old male... rapidly growing mass in left side of abdomen. Pink tinge to urine (hematuria). Mass with smooth, regular margins that did not cross the midline. What are needed in general and abdominal examination?",
      "back": "General examination: Check Blood Pressure (hypertension), look for congenital anomalies (Aniridia, Hemihypertrophy).\n\nAbdominal examination: Very gentle palpation to confirm the mass (Do NOT palpate vigorously to avoid tumor spillage)."
    },
    {
      "id": "lst8",
      "front": "Case Scenario (3-year-old with abdominal mass): DD (Differential Diagnosis)? Investigations?",
      "back": "DD: Wilms tumor, Neuroblastoma, Hydronephrosis.\n\nInvestigations: Abdominal Ultrasound, CT of abdomen & pelvis, CT chest, Urinalysis."
    }
  ],
  "Acquired Bleeding & DIC": [],
  "Safe Blood Transfusion & Complications": [],
  "Acute Rheumatic Fever (ARF)": [
    {
      "id": "arf1",
      "front": "What are the diagnostic criteria of rheumatic fever?",
      "back": "Jones Criteria: Diagnosis requires evidence of a preceding Group A Streptococcal infection (e.g., positive throat culture, positive rapid strep test, or elevated ASO titer) PLUS either:\n\nTwo Major criteria, OR\n\nOne Major criterion and Two Minor criteria."
    },
    {
      "id": "arf2",
      "front": "Enumerate 2 major and 2 minor criteria of acute rheumatic fever:",
      "back": "2 Major criteria: 1. Carditis. 2. Polyarthritis. (أو Chorea, Erythema marginatum, Subcutaneous nodules).\n\n2 Minor criteria: 1. Fever. 2. Elevated acute phase reactants (High ESR or High CRP). (أو Polyarthralgia, Prolonged PR interval on ECG)."
    }
  ],
  "Acyanotic Obstructive Lesions (Aortic Stenosis)": [
    {
      "id": "as1",
      "front": "Describe murmur of sever aortic stenosis?",
      "back": "Harsh Ejection Systolic Murmur, best heard at the aortic area (right upper sternal border) and radiates to the neck (carotids) and apex. It is usually accompanied by a systolic thrill and an early systolic ejection click."
    }
  ],
  "Acyanotic Obstructive Lesions (Pulmonary Stenosis)": [],
  "Atrial Septal Defect (ASD)": [
    {
      "id": "asd1",
      "front": "From Comparison Table: Compare between ASD and VSD regarding: Chambers that will dilate",
      "back": "ASD: Right Atrium (RA) and Right Ventricle (RV).\n\nVSD: Left Atrium (LA) and Left Ventricle (LV)."
    },
    {
      "id": "asd2",
      "front": "From Comparison Table: Compare between ASD and VSD regarding: Murmur",
      "back": "ASD: Ejection systolic murmur at the pulmonary area + Wide fixed splitting of the 2nd heart sound (S2).\n\nVSD: Harsh holosystolic (pansystolic) murmur at the left lower sternal border."
    },
    {
      "id": "asd3",
      "front": "From Comparison Table: Compare between ASD and VSD regarding: Indications of surgical closure",
      "back": "ASD: Significant left-to-right shunt (Qp:Qs > 1.5:1) causing RV volume overload (usually done electively at 3-5 years of age).\n\nVSD: Uncontrolled heart failure, elevated pulmonary vascular resistance (pulmonary hypertension), or significant shunt."
    }
  ],
  "CHD Introduction & Etiological Classifications": [],
  "Coarctation of the Aorta (CoA)": [
    {
      "id": "coa1",
      "front": "From case study (2-week-old neonate with weak femoral pulses and severe narrowing of the aorta): 1. Explain why symptoms appeared after the first week of life rather than immediately after birth.",
      "back": "Because the presence of the Patent Ductus Arteriosus (PDA) during the first few days of life provides a bypass for blood to reach the descending aorta, masking the severe obstruction. When the ductus arteriosus naturally closes after the first week, the severe narrowing (coarctation) is unmasked, leading to sudden hypoperfusion of the lower body and severe symptoms (ductal-dependent systemic circulation)."
    },
    {
      "id": "coa2",
      "front": "Case study (2-week-old neonate with weak femoral pulses...): 2. Identify the ECG findings most likely to be present in this neonate.",
      "back": "Right Ventricular Hypertrophy (RVH) is commonly seen in neonates with severe CoA (because the RV was pumping against systemic resistance in utero via the PDA)."
    },
    {
      "id": "coa3",
      "front": "Case study (2-week-old neonate with weak femoral pulses...): 3. Describe the immediate management required.",
      "back": "Continuous IV infusion of Prostaglandin E1 (PGE1) to keep the ductus arteriosus open (to maintain systemic perfusion).\n\nInotropic support and Diuretics (to manage heart failure).\n\nCorrection of metabolic acidosis.\n\nUrgent surgical repair or balloon angioplasty once stabilized."
    }
  ],
  "Complete Transposition of the Great Arteries (TGA)": [
    {
      "id": "tga1",
      "front": "From Comparison Tables: Compare between Tetralogy of Fallot and Transposition of Great Arteries (TGA) regarding: 1- Time of Clinical Presentation (Onset of cyanosis)",
      "back": "TOF: Gradual onset, usually appears after the neonatal period (around 3 to 6 months of age), unless severe (pulmonary atresia).\n\nTGA: Immediate, early neonatal period (first hours/days of life)."
    },
    {
      "id": "tga2",
      "front": "From Comparison Tables: Compare between TOF and TGA regarding: 2- Cardiac X-Ray Findings",
      "back": "TOF: Boot-shaped heart (Coeur en sabot) with oligemic (dark) lung fields due to decreased pulmonary blood flow.\n\nTGA: Egg-shaped heart (Egg on a string appearance) with plethoric (congested) lung fields due to increased pulmonary blood flow."
    },
    {
      "id": "tga3",
      "front": "From Comparison Tables: Compare between TOF and TGA regarding: 3- Lines of treatment / Best Time for Complete Surgical repair",
      "back": "TOF: Medical: Management of hypoxic spells. Surgical: Palliative (Blalock-Taussig shunt) if needed early. Complete repair (VSD closure + RVOT enlargement) is best done electively at 6 - 12 months of age.\n\nTGA: Medical: Prostaglandin E1 (to keep PDA open) +/- Balloon atrial septostomy (Rashkind procedure) to improve mixing. Surgical: Complete repair (Arterial Switch Operation / Jatene procedure) is best done within the first 1 to 2 weeks of life."
    }
  ],
  "Patent Ductus Arteriosus (PDA)": [],
  "Pediatric Heart Failure (HF)": [
    {
      "id": "phf1",
      "front": "3 clinical signs of left sided heart failure.",
      "back": "Tachypnea (Respiratory distress/orthopnea).\n\nTachycardia (with gallop rhythm).\n\nPulmonary congestion findings (Crackles/crepitations on chest auscultation)."
    },
    {
      "id": "phf2",
      "front": "Define Heart failure",
      "back": "Definition: It is the inability of the heart to pump an adequate amount of blood to meet the metabolic and oxygen demands of the body."
    },
    {
      "id": "phf3",
      "front": "Enumerate 3 mechanisms of HF in Pediatric.",
      "back": "Volume overload (e.g., left-to-right shunts like VSD, PDA).\n\nPressure overload (e.g., obstructive lesions like Aortic stenosis, Coarctation of the aorta).\n\nMyocardial dysfunction / Pump failure (e.g., Myocarditis, Cardiomyopathies)."
    },
    {
      "id": "phf4",
      "front": "Enumerate types of heart failure.",
      "back": "Left-sided vs. Right-sided vs. Biventricular heart failure.\n\nSystolic vs. Diastolic heart failure.\n\nHigh output vs. Low output heart failure."
    },
    {
      "id": "phf5",
      "front": "Q4) Enumerate 3 cardiac lesions that cause this condition (heart failure).",
      "back": "Ventricular Septal Defect (VSD).\n\nPatent Ductus Arteriosus (PDA).\n\nCoarctation of the Aorta (CoA).\n(ويمكن ذكر Myocarditis أو Rheumatic carditis)."
    },
    {
      "id": "phf6",
      "front": "Q2) Explain 3 lines of treatment (for heart failure case).",
      "back": "Diuretics: (e.g., Furosemide/Lasix) to decrease preload and relieve pulmonary/systemic congestion.\n\nInotropes: (e.g., Digoxin) to increase myocardial contractility.\n\nAfterload Reducing Agents: (e.g., ACE inhibitors like Captopril/Enalapril) to decrease peripheral resistance and improve cardiac output.\n(ويمكن إضافة: General measures like semi-sitting position, oxygen therapy, and treating the underlying cause)."
    }
  ],
  "Tetralogy of Fallot (TOF) & Hypercyanotic Spells": [
    {
      "id": "tof1",
      "front": "From Comparison Tables: Compare between Tetralogy of Fallot and Transposition of Great Arteries (TGA) regarding: 1- Time of Clinical Presentation (Onset of cyanosis)",
      "back": "TOF: Gradual onset, usually appears after the neonatal period (around 3 to 6 months of age), unless severe (pulmonary atresia).\n\nTGA: Immediate, early neonatal period (first hours/days of life)."
    },
    {
      "id": "tof2",
      "front": "From Comparison Tables: Compare between TOF and TGA regarding: 2- Cardiac X-Ray Findings",
      "back": "TOF: Boot-shaped heart (Coeur en sabot) with oligemic (dark) lung fields due to decreased pulmonary blood flow.\n\nTGA: Egg-shaped heart (Egg on a string appearance) with plethoric (congested) lung fields due to increased pulmonary blood flow."
    },
    {
      "id": "tof3",
      "front": "From Comparison Tables: Compare between TOF and TGA regarding: 3- Lines of treatment / Best Time for Complete Surgical repair",
      "back": "TOF: Medical: Management of hypoxic spells. Surgical: Palliative (Blalock-Taussig shunt) if needed early. Complete repair (VSD closure + RVOT enlargement) is best done electively at 6 - 12 months of age.\n\nTGA: Medical: Prostaglandin E1 (to keep PDA open) +/- Balloon atrial septostomy (Rashkind procedure) to improve mixing. Surgical: Complete repair (Arterial Switch Operation / Jatene procedure) is best done within the first 1 to 2 weeks of life."
    },
    {
      "id": "tof4",
      "front": "Regarding cyanotic (Tet) spell that may occur in patient with tetralogy of Fallot: 1. Explain the cause of its occurrence.",
      "back": "It is caused by a sudden spasm/increase in the Right Ventricular Outflow Tract (RVOT) obstruction, OR a sudden drop in systemic vascular resistance (SVR). This forces more deoxygenated blood from the right ventricle to shunt across the VSD into the left ventricle and aorta (increased right-to-left shunt), leading to severe hypoxia and cyanosis."
    },
    {
      "id": "tof5",
      "front": "Regarding cyanotic (Tet) spell that may occur in patient with tetralogy of Fallot: 2. Enumerate 6 lines of treatment.",
      "back": "Place the child in the Knee-chest position (to increase systemic vascular resistance).\n\nAdminister Oxygen (100%) via face mask.\n\nMorphine (IV or Subcutaneous) to calm the child and relieve infundibular spasm.\n\nIV fluids to expand intravascular volume.\n\nBeta-blockers (IV Propranolol/Esmolol) to relax the right ventricular outflow tract muscle.\n\nSodium bicarbonate (IV) to correct metabolic acidosis."
    }
  ],
  "Ventricular Septal Defect (VSD) -1": [
    {
      "id": "vsd1",
      "front": "From case study (3-month-old boy with tachypnea, retractions, and a 4/6 harsh holosystolic murmur): 1. What is the most appropriate diagnosis?",
      "back": "Ventricular Septal Defect (VSD) - Moderate to Large."
    },
    {
      "id": "vsd2",
      "front": "Case study (3-month-old boy with tachypnea...): 2. Enumerate 2 complications that may occur in this case?",
      "back": "Congestive Heart Failure (CHF).\n\nRecurrent chest infections (Bronchopneumonia).\n(ويمكن إضافة: Pulmonary hypertension, Infective endocarditis)."
    },
    {
      "id": "vsd3",
      "front": "Case study (3-month-old boy with tachypnea...): 3. Describe lines of treatment of this case?",
      "back": "Medical Treatment (Anti-failure measures): Diuretics (e.g., Furosemide) to reduce preload, ACE inhibitors (e.g., Captopril) to reduce afterload, and Digoxin. Nutritional support (high caloric formula).\n\nSurgical Treatment: Surgical patch closure (indicated if severe heart failure not controlled by medical treatment or development of pulmonary hypertension)."
    },
    {
      "id": "vsd4",
      "front": "From Comparison Table: Compare between ASD and VSD regarding: Chambers that will dilate",
      "back": "ASD: Right Atrium (RA) and Right Ventricle (RV).\n\nVSD: Left Atrium (LA) and Left Ventricle (LV)."
    },
    {
      "id": "vsd5",
      "front": "From Comparison Table: Compare between ASD and VSD regarding: Murmur",
      "back": "ASD: Ejection systolic murmur at the pulmonary area + Wide fixed splitting of the 2nd heart sound (S2).\n\nVSD: Harsh holosystolic (pansystolic) murmur at the left lower sternal border."
    },
    {
      "id": "vsd6",
      "front": "From Comparison Table: Compare between ASD and VSD regarding: Indications of surgical closure",
      "back": "ASD: Significant left-to-right shunt (Qp:Qs > 1.5:1) causing RV volume overload (usually done electively at 3-5 years of age).\n\nVSD: Uncontrolled heart failure, elevated pulmonary vascular resistance (pulmonary hypertension), or significant shunt."
    }
  ],
  "Ventricular Septal Defect (VSD) - 2": [],
  "Acute Diarrhea & Dehydration Assessment": [
    {
      "id": "adda1",
      "front": "Mention 3 causes of persistent diarrhea.",
      "back": "Post-gastroenteritis syndrome (e.g., secondary lactose intolerance).\n\nCow's milk protein allergy.\n\nCeliac disease (or Immunodeficiency / Malnutrition)."
    },
    {
      "id": "adda2",
      "front": "Enumerate 4 signs of severe dehydration.\n(حسب بروتوكول IMCI المعتمد)",
      "back": "Lethargic or unconscious.\n\nSunken eyes.\n\nNot able to drink or drinking poorly.\n\nSkin pinch goes back very slowly (≥ 2 seconds)."
    },
    {
      "id": "adda3",
      "front": "Case Study: Ahmed is a 2-year-old boy complaining of diarrhea for 5 days. He seems irritable, drinks eagerly, and his skin pinch goes back slowly. According to IMCI: 1. Assess the case.",
      "back": "The child has two signs from the yellow row (Irritable, drinks eagerly, skin pinch goes back slowly)."
    },
    {
      "id": "adda4",
      "front": "Case Study: Ahmed is a 2-year-old boy... 2. Classify the degree of dehydration.",
      "back": "Some Dehydration."
    },
    {
      "id": "adda5",
      "front": "Case Study: Ahmed is a 2-year-old boy... 3. Name the plan of management.",
      "back": "Plan B (Oral Rehydration Therapy - ORS)."
    },
    {
      "id": "adda6",
      "front": "Case Study: A 6-month-old with 5 days of watery diarrhea (8 stools/day), vomiting, and poor feeding. The mother notices sunken eyes. 1. Is this acute or persistent diarrhea?",
      "back": "Acute diarrhea (because it is less than 14 days)."
    },
    {
      "id": "adda7",
      "front": "Case Study: A 6-month-old with 5 days of watery diarrhea... 2. What signs of dehydration are present?",
      "back": "Poor feeding (not able to drink/drinking poorly) and sunken eyes."
    },
    {
      "id": "adda8",
      "front": "Case Study: A 6-month-old with 5 days of watery diarrhea... 3. Which WHO plan is appropriate?",
      "back": "Plan C (Intravenous fluids), as these signs indicate Severe Dehydration."
    }
  ],
  "Diarrhea Management & Rehydration Protocols": [
    {
      "id": "dmrp1",
      "front": "Mention three Complications of gastroenteritis? / 1) Enumerate metabolic complications of diarrhea.",
      "back": "Dehydration.\n\nElectrolyte imbalance (Hypernatremia, Hyponatremia, Hypokalemia).\n\nMetabolic acidosis.\n\nPrerenal acute renal failure."
    },
    {
      "id": "dmrp2",
      "front": "TTT (Treatment) of diarrhea.",
      "back": "Rehydration (Plan A, B, or C according to the degree of dehydration).\n\nZinc supplementation (reduces severity and duration).\n\nContinued feeding (do not stop breast milk or food).\n\nAntibiotics ONLY for specific indications (e.g., dysentery, cholera)."
    },
    {
      "id": "dmrp3",
      "front": "Which element to give in diarrhea.",
      "back": "Zinc."
    },
    {
      "id": "dmrp4",
      "front": "Enumerate complications of diarrhea.",
      "back": "Dehydration, electrolyte disturbances, metabolic acidosis, acute kidney injury."
    }
  ],
  "Pediatric Inflammatory Bowel Disease (IBD)": [
    {
      "id": "pibd1",
      "front": "TTT (Treatment) of UC (Ulcerative Colitis):",
      "back": "Medical: Aminosalicylates (e.g., Mesalamine), Corticosteroids (for acute flares), Immunomodulators (Azathioprine), Biologics (Infliximab).\n\nSurgical: Colectomy (which is curative in UC)."
    },
    {
      "id": "pibd2",
      "front": "Which is characteristic in Crohn's disease: / 5) Crohn's disease is characterized by:",
      "back": "Transmural inflammation.\n\nSkip lesions (discontinuous).\n\nCan affect any part of the GIT from mouth to anus (mostly terminal ileum).\n\nNon-caseating granulomas on biopsy.\n\nCobblestone appearance of the mucosa.\n\nPerianal diseases (fistulas, fissures)."
    },
    {
      "id": "pibd3",
      "front": "Compare between ulcerative colitis and Crohn's disease regarding the site of GIT affected in each and the layer of GIT wall affected.",
      "back": "Site:\nUC: Confined to the colon and rectum (continuous inflammation).\nCrohn's: Any part of the GIT from mouth to anus (commonly terminal ileum/cecum) with skip lesions.\n\nLayer:\nUC: Affects mucosa and submucosa only.\nCrohn's: Transmural (affects all layers of the wall)."
    },
    {
      "id": "pibd4",
      "front": "Regarding Ulcerative Colitis: Enumerate three diagnostic criteria.",
      "back": "1) Bloody diarrhea with tenesmus. 2) Continuous mucosal inflammation starting from the rectum on colonoscopy. 3) Crypt abscesses on biopsy."
    },
    {
      "id": "pibd5",
      "front": "Regarding Ulcerative Colitis: Mention two treatment lines and their indications.",
      "back": "1) Medical (Corticosteroids for inducing remission during flare-ups / Aminosalicylates for maintenance).\n2) Surgical (Colectomy indicated in toxic megacolon, severe refractory cases, or dysplasia)."
    },
    {
      "id": "pibd6",
      "front": "Case Study: Male patient, 24 years old presented with diarrhea for 3 months with weight loss of 7 kg... Colonoscopy revealed linear ulcerations with cobblestone appearance in colon and terminal ileum. What is the diagnosis?",
      "back": "Crohn's Disease."
    },
    {
      "id": "pibd7",
      "front": "Case Study (Crohn's Disease): How to confirm your diagnosis?",
      "back": "Intestinal Biopsy (to detect transmural inflammation and non-caseating granulomas)."
    },
    {
      "id": "pibd8",
      "front": "Case Study (Crohn's Disease): Outline the management of this patient.",
      "back": "Nutritional support, Medical therapy (Corticosteroids for remission, Immunosuppressants like Azathioprine, Biologics like Infliximab), and Surgery only if complications occur (like strictures or fistulas)."
    }
  ],
  "GERD & Hypertrophic Pyloric Stenosis (CHIPS)": [
    {
      "id": "ghps1",
      "front": "Gold standard investigation for HPS (Hypertrophic Pyloric Stenosis)?",
      "back": "Abdominal Ultrasound (showing thickened and elongated pyloric muscle / target sign)."
    }
  ],
  "Hirschsprung Disease vs. Functional Constipation": [
    {
      "id": "hdfc1",
      "front": "Which is characteristic in Hirschsprung's disease:",
      "back": "Delayed passage of meconium (>48 hours after birth).\n\nAbdominal distension and bilious vomiting.\n\nEmpty ampulla of rectum on digital rectal examination (DRE), followed by an explosive discharge of stool and gas upon withdrawal of the finger."
    },
    {
      "id": "hdfc2",
      "front": "Compare between functional constipation and Hirschsprung disease.",
      "back": "Onset: Functional (Toddler/preschool age); Hirschsprung (Since birth/neonatal period).\n\nMeconium passage: Functional (Normal); Hirschsprung (Delayed >48 hours).\n\nFecal soiling (Encopresis): Functional (Common); Hirschsprung (Rare).\n\nRectal exam: Functional (Ampulla full of stool); Hirschsprung (Empty tight ampulla)."
    },
    {
      "id": "hdfc3",
      "front": "Regarding Encopresis: Define the condition.",
      "back": "It is fecal incontinence or repetitive voluntary/involuntary passage of stool in inappropriate places in a child ≥ 4 years old (after toilet training age)."
    },
    {
      "id": "hdfc4",
      "front": "Regarding Encopresis: Enumerate causes of encopresis.",
      "back": "Chronic functional constipation (overflow incontinence), psychological/emotional distress, lack of proper toilet training."
    },
    {
      "id": "hdfc5",
      "front": "Regarding Encopresis: Outline the treatment.",
      "back": "1) Disimpaction (using enemas or high-dose PEG).\n2) Maintenance therapy (Laxatives like PEG/Lactulose for months).\n3) Behavioral modification (scheduled toilet sitting after meals)."
    },
    {
      "id": "hdfc6",
      "front": "Regarding Encopresis: How to diagnose?",
      "back": "Detailed history & physical examination (palpable fecal mass in abdomen, stool in rectum on DRE), occasionally Abdominal X-ray to confirm fecal loading."
    }
  ],
  "Acute & Recurrent Abdominal Pain (RAP)": [
    {
      "id": "arap1",
      "front": "Enumerate 4 items of red flags of abdominal pain.",
      "back": "Unexplained weight loss or growth failure.\n\nGastrointestinal bleeding (hematemesis, melena, or hematochezia).\n\nPain that awakens the child from sleep.\n\nChronic severe diarrhea or unexplained fever."
    }
  ],
  "Acute Viral & Autoimmune Hepatitis": [
    {
      "id": "avah1",
      "front": "Which indicates long immunity in HAV:",
      "back": "Positive Anti-HAV IgG."
    },
    {
      "id": "avah2",
      "front": "Mention 3 hepatotropic viruses that have a vaccine.",
      "back": "Hepatitis A Virus (HAV).\n\nHepatitis B Virus (HBV).\n(الفيروس الثالث هو Hepatitis E (HEV) حيث يوجد له لقاح معتمد في بعض الدول، ويمكن ذكر الفيروسات الأخرى بشكل عام ولكن HAV و HBV هما الأساس)."
    },
    {
      "id": "avah3",
      "front": "Case Study: A 10-year-old female patient presents to pediatric clinic with malaise... swelling in both knees... jaundice... AST and ALT of 250 and 180... positive LKM antibodies. What is the most likely diagnosis?",
      "back": "Autoimmune Hepatitis (Type 2, indicated by positive anti-LKM-1 antibodies)."
    },
    {
      "id": "avah4",
      "front": "Case Study (Autoimmune Hepatitis): What is the best approach to the treatment of the patient?",
      "back": "Immunosuppressive therapy using Corticosteroids (Prednisone) alone or in combination with Azathioprine."
    },
    {
      "id": "avah5",
      "front": "List 2 serum autoantibodies positive in autoimmune hepatitis.",
      "back": "ANA (Anti-nuclear antibody) - Type 1.\n\nASMA (Anti-smooth muscle antibody) - Type 1.\n\nAnti-LKM-1 (Anti-liver kidney microsomal antibody) - Type 2."
    }
  ],
  "Hepatomegaly & Hepatosplenomegaly (HSM)": [
    {
      "id": "hsm1",
      "front": "Enumerate five causes of pediatric hepatomegaly.",
      "back": "Infections (e.g., Viral hepatitis, TORCH infections, Malaria).\n\nStorage diseases (e.g., Gaucher disease, Glycogen storage disease).\n\nMalignancy (e.g., Leukemia, Lymphoma, Neuroblastoma).\n\nCongestion (e.g., Congestive heart failure).\n\nBiliary tract diseases (e.g., Biliary atresia)."
    }
  ],
  "Gastrointestinal Bleeding (UGIB & LGIB)": [
    {
      "id": "gib1",
      "front": "Heartburn, bloody diarrhea, no other complaints; next step of investigations?",
      "back": "Stool analysis & culture (to rule out infectious colitis), followed by Colonoscopy with biopsy (to confirm Inflammatory Bowel Disease like Ulcerative Colitis)."
    },
    {
      "id": "gib2",
      "front": "Case of upper GI bleeding due to duodenal ulcer treatment by:",
      "back": "Proton Pump Inhibitors (PPIs).\n\nEndoscopic therapy (if active bleeding is present).\n\nEradication of H. pylori if tests are positive (using a combination of PPI + 2 Antibiotics like Amoxicillin and Clarithromycin)."
    }
  ],
  "Inborn Errors of Metabolism & Phenylketonuria (PKU)": [],
  "COW MILK ALLERGY & LACTOSE INTOLERANCE": [],
  "INTRODUCTION TO ENDOCRINE SYSTEM": [
    {
      "id": "ies1",
      "front": "Mention three releasing hormones secreted from hypothalamus.",
      "back": "Growth hormone-releasing hormone (GHRH).\n\nThyrotropin-releasing hormone (TRH).\n\nCorticotropin-releasing hormone (CRH).\n(ويمكن أيضاً إضافة Gonadotropin-releasing hormone (GnRH))."
    }
  ],
  "SHORT STATURE & TALL STATURE": [
    {
      "id": "ssts1",
      "front": "What are the red flags that suggest a pathological cause of short stature?",
      "back": "Severe short stature (Height is far below the 3rd percentile / < -3 SD).\n\nAbnormal or decreased growth velocity (Crossing centile lines downwards).\n\nDisproportionate short stature (abnormal upper/lower segment ratio).\n\nPresence of dysmorphic features or congenital anomalies.\n\nSigns of chronic systemic diseases (e.g., chronic diarrhea, heart murmur, pallor).\n\nMarkedly delayed bone age."
    },
    {
      "id": "ssts2",
      "front": "Mention three causes of primary pathological short stature.",
      "back": "Genetic / Chromosomal abnormalities: e.g., Turner syndrome, Down syndrome.\n\nSkeletal dysplasias: e.g., Achondroplasia.\n\nIntrauterine growth restriction (IUGR): Failure of catch-up growth."
    }
  ],
  "THYROID GLAND DISORDERS": [
    {
      "id": "tgd1",
      "front": "Mention three radiological findings in hypothyroidism.",
      "back": "Markedly delayed bone age.\n\nEpiphyseal dysgenesis (fragmentation or stippling of the epiphyses).\n\nEnlarged cardiac shadow (Cardiomegaly) which may be due to pericardial effusion.\n(يمكن أيضاً ذكر Anterior beaking of the vertebrae)."
    },
    {
      "id": "tgd2",
      "front": "A 5-month-old girl presented with a history of constipation, delayed developmental Milestones. She had a history of neonatal prolonged jaundice, On examination she Pale, hypoactive has an opened mouth with large tongue:\na. What is the most likely diagnosis?",
      "back": "Congenital Hypothyroidism."
    },
    {
      "id": "tgd3",
      "front": "b. What is the diagnostic investigation in this case?",
      "back": "Thyroid profile: Serum TSH (which will be markedly elevated) and Free T4 (which will be decreased)."
    },
    {
      "id": "tgd4",
      "front": "c. What is the treatment?",
      "back": "Life-long replacement therapy with oral L-thyroxine (Levothyroxine)."
    },
    {
      "id": "tgd5",
      "front": "From Case Study (5 month old girl with constipation, delayed developmental milestones, prolonged jaundice, pale, hypoactive, opened mouth with large tongue): 1. What is the most likely diagnosis?",
      "back": "Congenital Hypothyroidism."
    },
    {
      "id": "tgd6",
      "front": "From Case Study: 2. What is the diagnostic investigation in this case?",
      "back": "Serum TSH and Free T4 levels."
    },
    {
      "id": "tgd7",
      "front": "From Case Study: 3. What is the treatment?",
      "back": "L-thyroxine (Levothyroxine) replacement therapy."
    }
  ],
  "PARATHYROID GLAND DISORDERS": [],
  "PUBERTY and DISORDERS": [],
  "ADRENAL GLAND DISORDERS & CUSHING SYNDROME": [],
  "DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA)": [
    {
      "id": "dm1",
      "front": "Enumerate 3 Diagnostic criteria of Type 1 Diabetes Mellitus:",
      "back": "Fasting plasma glucose ≥ 126 mg/dL (7.0 mmol/L).\n\nRandom plasma glucose ≥ 200 mg/dL (11.1 mmol/L) with classic symptoms of hyperglycemia (polyuria, polydipsia, weight loss).\n\n2-hour plasma glucose ≥ 200 mg/dL during an Oral Glucose Tolerance Test (OGTT).\n(يمكن إضافة HbA1c ≥ 6.5%)."
    },
    {
      "id": "dm2",
      "front": "Case Study 1: 5-year-old son with confusion, tachycardia, hypotension, slow deep respirations, weight loss, thirst, frequent urination, and new onset of nocturnal enuresis. 1. What is the most likely diagnosis?",
      "back": "Diabetic Ketoacidosis (DKA) as the first presentation of Type 1 Diabetes Mellitus."
    },
    {
      "id": "dm3",
      "front": "Case Study 1: 2. What is the best therapy?",
      "back": "IV fluid resuscitation (rehydration with normal saline).\n\nContinuous intravenous infusion of regular insulin.\n\nCorrection of electrolytes disturbances (specifically Potassium replacement)."
    },
    {
      "id": "dm4",
      "front": "Case Study 2: 9-year-old boy presenting with vomiting and abdominal pain, polyuria starting 2 months ago, weight loss, deep rapid breathing with respiratory rate 50/m. 1. What is the most likely diagnosis?",
      "back": "Diabetic Ketoacidosis (DKA). (Note: The deep rapid breathing is Kussmaul breathing, a sign of metabolic acidosis)."
    },
    {
      "id": "dm5",
      "front": "Case Study 2: 2. What are the investigations?",
      "back": "Blood glucose level (Hyperglycemia).\n\nArterial blood gases (Metabolic acidosis: Low pH and low HCO3).\n\nUrine analysis (Glycosuria and Ketonuria).\n\nSerum electrolytes (Na, K) and Serum Ketones."
    },
    {
      "id": "dm6",
      "front": "Case Study 2: 3. What is the treatment?",
      "back": "Admission to ICU/hospital.\n\nGradual IV fluid replacement (to correct dehydration and prevent cerebral edema).\n\nIntravenous regular insulin therapy.\n\nPotassium replacement (as total body potassium is depleted)."
    }
  ],
  "CHILDHOOD OBESITY": [
    {
      "id": "co1",
      "front": "Enumerate indication for Bariatric surgery in pediatrics?",
      "back": "BMI ≥ 35 kg/m² associated with severe comorbidities (e.g., Type 2 Diabetes Mellitus, severe obstructive sleep apnea, pseudotumor cerebri).\n\nBMI ≥ 40 kg/m² with milder comorbidities.\n\nPhysical maturity (usually reached Tanner stage IV or V, and near final adult height).\n\nFailure of a multidisciplinary weight loss program (diet, exercise, behavioral modifications) for at least 6 months.\n\nPsychological capability of the patient and family to adhere to strict post-operative dietary rules."
    }
  ],
  "INTRODUCTION TO GENETICS & BASIC CONCEPTS": [
    {
      "id": "ig1",
      "front": "Define Crossing over and when it occurs.",
      "back": "Definition: Chromatids change parts between homologous chromatids during the meiosis, and this causes redistribution of the heredity material.\n\nWhen it occurs: During meiosis."
    },
    {
      "id": "ig2",
      "front": "Enumerate 4 differences between meiosis and mitosis.",
      "back": "Mitosis:\nDivision of somatic cells.\nProduces two daughter cells from one parent cell.\nThe number of chromosomes does not change (Diploid).\nTakes 1-2 hours.\n\nMeiosis:\nOccurs only in gamete formation.\nOne diploid parent cell produces four haploid gametocytes.\nMature gametocytes have 23 chromosomes (Haploid/n).\nCrossing over occurs during this division."
    }
  ],
  "CHROMOSOMAL ABERRATIONS & DISORDERS": [
    {
      "id": "cad1",
      "front": "Enumerate Complications of Turner Syndrome.",
      "back": "Renal anomalies.\n\nCoarctation of the aorta & bicuspid aortic valve.\n\nGonadal dysgenesis leading to infertility & primary amenorrhea.\n\nIncreased risk of hypertension.\n\nLung hypoplasia (intrauterine)."
    },
    {
      "id": "cad2",
      "front": "Enumerate Types of structural aberrations of chromosomes.",
      "back": "Translocation (reciprocal or Robertsonian, balanced or unbalanced).\n\nDeletions.\n\nDuplications.\n\nInversion (pericentric or paracentric).\n\nIsochromosome.\n\nDicentric chromosome.\n\nRing chromosomes."
    },
    {
      "id": "cad3",
      "front": "Define major anomaly and give an example.",
      "back": "Definition: Abnormality that has medical, surgical, or cosmetic significance so it increases the risk of disability, morbidity or mortality.\n\nExample: Congenital heart defects (like VSD in Down syndrome) or Cleft lip +/- palate (in Patau syndrome)."
    },
    {
      "id": "cad4",
      "front": "Define aneuploidy and give an example.",
      "back": "Definition: A change in the chromosome number that does not involve the entire set and involves trisomy (2n+1), monosomy (2n-1) or nullisomy (2n-2).\n\nExample: Down syndrome (Trisomy 21) or Turner Syndrome (Monosomy 45,X)."
    },
    {
      "id": "cad5",
      "front": "Mention 3 karyotyping styles for Down syndrome.",
      "back": "Nondisjunction Type (94%).\n\nTranslocation type (3-4%).\n\nMosaic type (1-2%)."
    },
    {
      "id": "cad6",
      "front": "Explain the presence of delayed puberty in 45 X syndrome.",
      "back": "Due to Gonadal dysgenesis, which leads to infertility, primary amenorrhea, and a lack of development of secondary sexual characteristics (absence of breast development and failure to menstruate)."
    },
    {
      "id": "cad7",
      "front": "Enumerate 6 dysmorphic features that may affect the head in Down syndrome.",
      "back": "Upward slanting palpebral fissures.\n\nEpicanthus.\n\nBurchfield spots of iris.\n\nSmall dysplastic pinnae & low set ears.\n\nMid face hypoplasia.\n\nMicrognathia & protruded tongue."
    },
    {
      "id": "cad8",
      "front": "Define Translocation.",
      "back": "It occurs when a piece of one chromosome breaks off and attaches to another chromosome. It may be reciprocal or Robertsonian, balanced or unbalanced."
    },
    {
      "id": "cad9",
      "front": "Mention 4 different management options for Turner syndrome.",
      "back": "Early screening for cardiac disease.\n\nGrowth hormone therapy for short stature.\n\nEstrogen replacement at the time of puberty.\n\n(Regular follow-up and monitoring)."
    },
    {
      "id": "cad10",
      "front": "Case Study: A baby presents with upward slanting palpebral fissure, single palmar crease, and hypotonia. The baby is the fourth sibling, and maternal age is 39 years old.\n\nWhat is the most likely diagnosis and its cytogenetic type?",
      "back": "Diagnosis: Down Syndrome.\n\nCytogenetic type: Nondisjunction Type (The risk increases with advanced maternal age)."
    },
    {
      "id": "cad11",
      "front": "Case Study (Continued): Mention two other congenital anomalies that may be present in this child.",
      "back": "Congenital heart defects (particularly VSD).\n\nGastrointestinal anomalies (Duodenal/esophageal/anal atresia or Hirschsprung disease)."
    },
    {
      "id": "cad12",
      "front": "Enumerate 5 somatic features that may occur with Down syndrome.",
      "back": "Short fingers & curved 5th finger.\n\nTransverse palmar crease (Single palmar crease).\n\nWide gap between 1st and 2nd toes.\n\nLax joints including dysplastic hips.\n\nVertebral anomalies including atlantoaxial instability."
    },
    {
      "id": "cad13",
      "front": "Case Study: A 36-year-old woman with little prenatal care delivers a 3900-g girl. The infant has decreased tone, up-slanting palpebral fissures, epicanthal folds, redundant nuchal skin, fifth finger clinodactyly and brachydactyly, and a single transverse palmar crease.\n\nWhat is the most likely diagnosis? What is the next step in the evaluation? What are the complications?",
      "back": "Diagnosis: Down Syndrome (Trisomy 21).\n\nNext step: Karyotyping (Chromosomal analysis) to detect numerical or gross structural chromosomal abnormalities.\n\nComplications:\nCardiac: Congenital heart defects (septal defects/VSD).\nCNS: Microcephaly, mental retardation, and premature Alzheimer.\nEndocrine: Hypothyroidism, obesity, insulin resistance.\nGIT: Duodenal atresia, Hirschsprung disease.\nBlood: Leukemia."
    }
  ],
  "CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE": [
    {
      "id": "cafp1",
      "front": "Pedigree Chart Case 1: Draw the family pedigree: 'Ali is 3 years old, He is the 2nd spill of consanguinity marriage, one month ago, he suffers from bleeding after eating beans, His sister died from accident from 6 months'",
      "back": "طريقة الرسم:\n\nيتم رسم مربع (يمثل الأب) ودائرة (تمثل الأم) ويوصل بينهما بخطين مزدوجين (للدلالة على زواج الأقارب Consanguinity).\n\nيتدلى من هذا الزواج فرعان (الأبناء):\n\nالفرع الأول (الأخت الكبرى التي ماتت): دائرة مشطوب عليها بخط مائل (للدلالة على الوفاة).\n\nالفرع الثاني (علي، المريض بـ G6PD، وهو مرض X-Linked Recessive): يتم رسم مربع مظلل بالكامل (Affected Male) ويوضع بجانبه سهم (للدلالة على أنه الـ Proband/المريض الأساسي). الأم في هذه الحالة يجب أن توضع بداخل دائرتها نقطة لتوضيح أنها (Carrier) حاملة للمرض."
    },
    {
      "id": "cafp2",
      "front": "Pedigree Chart Case 2: Draw the pedigree of Ahmed who was diagnosed as a neurofibromatosis case with his father complained of the same disease, his mother died in accident, (his parents were consanguineous), he has two sisters.",
      "back": "طريقة الرسم:\n\nNeurofibromatosis هو مرض (Autosomal Dominant).\n\nيتم رسم مربع مظلل بالكامل يمثل (الأب المصاب)، ودائرة مشطوب عليها مائلاً تمثل (الأم المتوفاة في حادث). يوصل بينهما خطين مزدوجين (زواج أقارب).\n\nيتدلى من هذا الزواج ثلاثة أبناء:\n\nمربع مظلل بالكامل ويمثل (أحمد)، ويوضع بجانبه سهم (Proband).\n\nدائرتان غير مظللتين تمثلان (أختي أحمد)."
    }
  ],
  "PATTERNS OF SINGLE GENE INHERITANCE": [
    {
      "id": "psgi1",
      "front": "Explain why a father cannot inherit G6PD to his boys.",
      "back": "G6PD is an X-Linked Recessive disorder. The defective allele is located on the X-chromosome. Since males pass the Y chromosome to their sons (to make them male) and the X chromosome only to their daughters, affected males will never have affected sons (No male-to-male transmission), but all of their daughters will be carriers of the abnormal gene."
    }
  ],
  "PREVENTIVE GENETICS": [
    {
      "id": "pg1",
      "front": "Define Genetic counseling.",
      "back": "A health service that provides information and support to people who have or may be at risk for genetic disorders. During a consultation, a professional meets with an individual or family to discuss genetic risks or to diagnose, confirm, or rule out a genetic condition."
    },
    {
      "id": "pg2",
      "front": "Enumerate 3 prenatal screening methods for Down syndrome.",
      "back": "Biochemical markers in maternal serum (Non-invasive): Triple tests (AFP, uE3, HCG).\n\nUltrasound (Non-invasive): to assess nuchal fold thickness and fetal measurements.\n\nInvasive screening tests: Chorionic villus sampling or Amniocentesis."
    },
    {
      "id": "pg3",
      "front": "Why is the Neonatal screening test done through the first 3 to 7 days? And enumerate 2 screening tests.",
      "back": "Why: Because the baby should be fed at least once. Early detection and treatment results in prevention of irreversible complications before the baby has signs and symptoms.\n\n2 screening tests: Phenylketonuria (PKU) and Congenital Hypothyroidism (CHT)."
    },
    {
      "id": "pg4",
      "front": "Explain the need for genetic counseling for a 40 years old female planning for pregnancy.",
      "back": "A woman who is pregnant or plans to become pregnant at or after age 35 is considered at high risk. Advanced maternal age (especially over 35-40 years) increases the occurrence of numerical chromosomal aberrations (nondisjunction) such as Down syndrome (Trisomy 21), where the risk reaches 1/20 by age 45. It also increases the risk of spontaneous abortions."
    },
    {
      "id": "pg5",
      "front": "Mention the technique of the heel pricking test.",
      "back": "Whole blood samples are collected using either the lateral or medial plantar surface of the infant's heel for the puncture site on a filter paper (which is simple to collect, transport, and store)."
    },
    {
      "id": "pg6",
      "front": "Regarding the neonatal screening program in Egypt: Describe the technique of sample withdrawal and its timing. Give 1 example of a screened disease and its measured substance.",
      "back": "Technique: Whole blood sample from a heel prick on a filter paper.\n\nTiming: Between 24 hours and 7 days after birth (usually 3rd to 7th day).\n\nExample: Congenital hypothyroidism (Measured substance: Thyroid Stimulating Hormone 'TSH')."
    },
    {
      "id": "pg7",
      "front": "Define Neonatal screening.",
      "back": "It is a public health program designed to screen infants shortly after birth to detect babies at risk for congenital and heritable disorders before they have signs and symptoms, allowing early detection and treatment to prevent irreversible complications."
    },
    {
      "id": "pg8",
      "front": "List 4 methods of invasive prenatal screening tests.",
      "back": "Chorionic villus sampling.\n\nAmniocentesis.\n\nFetal blood sampling (cordocentesis).\n\nFetoscopy.\n(ويمكن إضافة Fetal tissue sampling خامساً)."
    },
    {
      "id": "pg9",
      "front": "Name 3 examples of diseases screened in newly-born infants.",
      "back": "Congenital hypothyroidism.\n\nPhenylketonuria.\n\nBlood cell disorders (like Sickle cell anemia or Beta-Thalassemia)."
    },
    {
      "id": "pg10",
      "front": "Name the example of the screened newborn disorder in Egypt.",
      "back": "Congenital hypothyroidism (and Phenylketonuria)."
    }
  ],
  "PEDIATRIC GROWTH": [
    {
      "id": "pg1",
      "front": "Define growth.",
      "back": "Growth is the natural increase in the size of the body either by hyperplasia through the multiplication of different cells of different organs or by hypertrophy through an increase in cell size."
    },
    {
      "id": "pg2",
      "front": "Mention types of Growth charts",
      "back": "Percentile curves.\nStandard deviation curves.\nVelocity curves.\nConditional centiles."
    }],
  "Biological Age & Maturation (Bone & Teeth)": [
    {
      "id": "bone1",
      "front": "Enumerate the causes of Delayed Dentition.",
      "back": "Rickets (أشهر وأهم سبب)\nHypothyroidism\nHypopituitarism\nDown syndrome\nMalnutrition\nFamilial / Idiopathic\n\n💡 Mnemonic لتسهيل التذكر:\n(عيلة داون عندها نقص تغذية وكساح في الغدة)"
    }],
  "_CHAPTER_Neurology": [
    {
      "id": "neuro_q1",
      "category": "previous_years",
      "front": "Functional classification of cerebral palsy.",
      "back": "Class 1: No limitation of activity.\nClass 2: Slight to moderate limitation of activity.\nClass 3: Moderate to great limitation of activity.\nClass 4: No useful physical activity."
    },
    {
      "id": "neuro_q2",
      "category": "previous_years",
      "front": "Enumerate four investigations for Duchenne Muscular Dystrophy (DMD).",
      "back": "1. Creatine kinase (CK) / CPK: Markedly elevated.\n2. Electromyography (EMG): Myopathic pattern.\n3. Muscle biopsy: Diagnostic — shows muscle fiber degeneration with replacement by fat and fibrosis.\n4. Prenatal diagnosis: Amniocentesis or chorionic villous sampling (genetic diagnosis). Detection of female carrier via high serum CPK can also be included."
    },
    {
      "id": "neuro_q3",
      "category": "previous_years",
      "front": "Mention two main causes for inability to walk in children.",
      "back": "1. Primary inability to walk (no walking till age 18 months):\n   - Paralytic: e.g. Cerebral palsy.\n   - Non-paralytic: e.g. Rickets.\n2. Secondary inability to walk (loss of previously acquired walking ability):\n   - Paralytic: e.g. Muscular dystrophies.\n   - Non-paralytic: e.g. Severe debilitating diseases."
    },
    {
      "id": "neuro_q4",
      "category": "previous_years",
      "front": "Enumerate the clinical types (topographical distribution) of Spastic Cerebral Palsy.",
      "back": "1. Hemiplegia: Arm & leg on the same side of the body.\n2. Diplegia: Arms and legs involved, but legs more than arms.\n3. Quadriplegia / Tetraplegia: Arms and legs equally involved OR arms more than legs.\n4. Monoplegia: One limb only.\n5. Triplegia: Three limbs.\n6. Paraplegia: Only legs involved."
    },
    {
      "id": "neuro_q5",
      "category": "previous_years",
      "front": "Enumerate the clinical features and physical findings of a child presenting with Duchenne Muscular Dystrophy (DMD).",
      "back": "Sex & Age: Usually male, presenting at 3–5 years of age.\nMuscle Weakness: Bilateral symmetrical, proximal > distal, with no sensory manifestation.\nShoulder Girdle Weakness: Unable to raise arm above the head; winging of scapula (weak serratus anterior).\nPelvic Girdle Weakness: Waddling lordotic gait, difficulty climbing stairs, positive Gower sign.\nPseudohypertrophy: Affects calf muscles, deltoid and forearm.\nPreserved Muscles: Hand muscles, extraocular muscles, urethral and anal sphincters, diaphragm.\nAssociated Features: Cardiomyopathy (constant feature), mental subnormality (frank MR in 25%), frequent respiratory infections and UTI.\nProgression: Most patients unable to walk by 12 years; death by end of second decade due to respiratory or heart failure."
    },
    {
      "id": "neuro_q6",
      "category": "previous_years",
      "front": "Enumerate the causes of microcephaly in children.",
      "back": "Primary (Genetic) Microcephaly:\n- Exposure of the embryo to a noxious agent during the first weeks after conception.\n- Microcephaly vera (AR inheritance).\n- Chromosomal disorders (Down syndrome, Edward syndrome).\n- Defective neurulation (Anencephaly, Encephalocele).\n- Defective prosencephalization (Agenesis of corpus callosum, Holoprosencephaly).\n- Defective cellular migration (Lissencephaly).\n\nSecondary Microcephaly:\n- Intrauterine disorders: Congenital infections (CMV, Rubella, Toxoplasmosis), drugs, fetal alcohol.\n- Perinatal brain injuries: HIE, Intracranial hemorrhage, Meningitis & Encephalitis.\n- Postnatal systemic disease: Chronic renal disease & Malnutrition."
    },
    {
      "id": "neuro_q7",
      "category": "previous_years",
      "front": "Enumerate the clinical signs of increased intracranial pressure (ICP) in an infant.",
      "back": "1. Seizures and disturbed level of consciousness.\n2. Hyperreflexia.\n3. Abnormal cranial expansion or bowing of the forehead (due to ventricular enlargement).\n4. Slippage on vertical suspension (associated with profound central hypotonia secondary to severe cerebral insults)."
    },
    {
      "id": "neuro_q8",
      "category": "previous_years",
      "front": "Mention the clinical diagnostic criteria for Autism Spectrum Disorder (ASD).",
      "back": "1. Persistent deficits in social communication and social interaction across multiple contexts.\n2. Restricted, repetitive patterns of behavior, interests, or activities (e.g. stereotyped motor movements, insistence on sameness, fixated interests).\n3. Symptoms must be present in the early developmental period.\n4. Symptoms cause clinically significant impairment in social, occupational, or other important areas of current functioning."
    },
    {
      "id": "neuro_q9",
      "category": "both",
      "front": "Enumerate four main clinical features or diagnostic hallmarks of West Syndrome (Infantile Spasms).",
      "back": "1. Onset: Characteristically between 4–8 months of age.\n2. Spasms in clusters: Sudden movements — Flexor (sudden flexion of neck, arms and legs), Extensor (extension of arms and extremities), or Mixed.\n3. EEG Hallmark: Hypsarrhythmia (chaotic high-voltage slow waves).\n4. Mental retardation / Developmental delay: Highly associated with secondary/organic forms (~80% of cases)."
    },
    {
      "id": "neuro_clinoma_q1",
      "category": "clinoma",
      "type": "flashcard",
      "front": "Define the following terms:\n1. Cerebral palsy\n2. Seizure\n3. Status Epilepticus\n4. Febrile convulsion\n5. Craniostenosis",
      "back": "1. Cerebral palsy: An encephalopathy resulting from malfunction of motor unit of the developing brain due to brain insult during prenatal, natal and postnatal periods leading to central motor deficit which is non-progressive, non-familial, and non-hereditary.\n2. Seizure: Paroxysmal bouts of electrical activities of the brain manifested by impaired consciousness, motor, sensory, psychic or autonomic manifestations.\n3. Status Epilepticus: A seizure that lasts longer than 5 minutes, or having more than 1 seizure within a 5 minutes period, without returning to a normal level of consciousness between episodes.\n4. Febrile convulsion: Generalized, tonic-clonic seizure associated with a febrile illness, in infancy and childhood but without any CNS infection, severe metabolic disturbance, or other known neurological cause.\n5. Craniostenosis: Premature closure of one or more cranial sutures."
    },
    {
      "id": "neuro_clinoma_q2",
      "category": "clinoma",
      "type": "flashcard",
      "front": "Enumerate four clinical signs used for the early detection or suspicion of cerebral palsy in infants.",
      "back": "(Any 4 of the following)\n1. Delayed motor milestones.\n2. Keeping the hand clenched after the age of 3 months.\n3. Difficulty of abduction of the thighs during a diaper change (early sign of spasticity).\n4. Early neck support.\n5. Persistence of Moro reflex after 6 months or Grasp reflex after 4 months."
    },
    {
      "id": "neuro_clinoma_q3",
      "category": "clinoma",
      "type": "flashcard",
      "front": "Enumerate the four clinical signs used to diagnose severe hypotonia in a floppy infant.",
      "back": "1. Frog leg position (denotes hypotonia of lower limbs).\n2. Head lag (when pulled up from hands in supine position, the head lags backwards).\n3. Curved trunk on ventral suspension (the baby drops around the examiner's hand in prone suspension).\n4. Slippage on vertical suspension (denotes hypotonia of shoulder girdle muscles)."
    },
    {
      "id": "neuro_clinoma_q4",
      "category": "clinoma",
      "type": "flashcard",
      "front": "Enumerate the four obligatory criteria that characterize muscular dystrophies.",
      "back": "1. Primary myopathy.\n2. Progressive.\n3. Genetic basis.\n4. Characteristic muscle fiber degeneration and muscle cell death at some stage."
    },
    {
      "id": "neuro_clinoma_q5",
      "category": "clinoma",
      "type": "flashcard",
      "front": "Enumerate four paralytic or non-paralytic causes of primary inability to walk (no walking by age 18 months).",
      "back": "(Any 4 of the following)\n1. Cerebral palsy.\n2. Hydrocephalus.\n3. Poliomyelitis.\n4. Werding Hoffman disease.\n5. Mental retardation or Rickets."
    },
    {
      "id": "neuro_clinoma_q6",
      "category": "clinoma",
      "type": "flashcard",
      "front": "Enumerate four clinical criteria of a typical febrile convulsion.",
      "back": "(Any 4 of the following)\n1. Susceptible age: 9 months up to 5 years.\n2. Seizure is generalized tonic-clonic.\n3. Brief duration (lasting from a few seconds to 15 minutes).\n4. Only one fit during the same illness in 24 hours.\n5. No signs of CNS infection."
    },
    {
      "id": "neuro_clinoma_q7",
      "category": "clinoma",
      "type": "flashcard",
      "front": "Enumerate four risk factors for developing epilepsy in a child with a history of febrile convulsions.",
      "back": "1. Atypical features of the seizure (focal, repeated, or prolonged >15 min).\n2. Positive family history of epilepsy.\n3. An initial febrile seizure before 9 months of age.\n4. Delayed developmental milestones, or a pre-existing neurologic disorder."
    },
    {
      "id": "neuro_clinoma_q8",
      "category": "clinoma",
      "type": "flashcard",
      "front": "Enumerate four cranial causes of macrocephaly (conditions with a thickened skull).",
      "back": "(Any 4 of the following)\n1. Rickets.\n2. Chronic hemolytic anemia.\n3. Osteopetrosis.\n4. Osteogenesis imperfecta.\n5. Bone dysplasia."
    },
    {
      "id": "neuro_clinoma_matching_1",
      "category": "clinoma",
      "type": "matching",
      "front": "Match the pathognomonic clinical sign, EEG pattern, or skull deformity with its exact diagnostic description or condition:",
      "matchingPairs": [
        {
          "left": "Gowers sign",
          "right": "A classic clinical sign demonstrating proximal motor weakness, characteristically seen when a patient climbs up his own body to stand up."
        },
        {
          "left": "Hypsarrhythmia",
          "right": "A chaotic, high-voltage slow-wave discharge seen on an EEG, which is characteristically diagnostic of Infantile Spasms (West syndrome)."
        },
        {
          "left": "Scaphocephaly",
          "right": "The most common form of primary craniostenosis, caused by premature closure of the sagittal suture, resulting in a long and narrow skull."
        },
        {
          "left": "Milkmaid's grip",
          "right": "A neurological sign in Sydenham's chorea characterized by an inability to maintain a hand grip, causing the child to squeeze and release the examiner's hand."
        }
      ]
    },
    {
      "id": "neuro_clinoma_case_1",
      "category": "clinoma",
      "type": "case",
      "front": "Case Scenario 1 (Neurology)",
      "caseBody": "A 4-year-old boy is brought to the clinic because of progressive difficulty in climbing stairs and a clumsy, waddling gait. On physical examination, the clinician notes bilateral, symmetrical proximal muscle weakness affecting the pelvic girdle, marked pseudohypertrophy of the calf muscles, and a positive Gowers sign. Laboratory investigations reveal a markedly elevated serum creatine kinase (CK) level.",
      "subQuestions": [
        {
          "id": "neuro_c1_sq1",
          "questionText": "What is the most likely clinical diagnosis?",
          "back": "Duchenne muscular dystrophy."
        },
        {
          "id": "neuro_c1_sq2",
          "questionText": "What is the genetic mode of inheritance and the specific protein defect responsible for this disease?",
          "back": "It is an X-linked recessive (XLR) disorder caused by a defect in the dystrophin protein."
        },
        {
          "id": "neuro_c1_sq3",
          "questionText": "What would a muscle biopsy characteristically demonstrate to confirm the diagnosis?",
          "back": "Muscle fiber degeneration with replacement by fat and fibrosis."
        }
      ]
    },
    {
      "id": "neuro_clinoma_case_2",
      "category": "clinoma",
      "type": "case",
      "front": "Case Scenario 2 (Neurology)",
      "caseBody": "A 3-year-old child with an acute out-of-hospital history of high fever due to acute otitis media is rushed to the emergency department while actively convulsing. The parent states that the generalized tonic-clonic fit has been continuous for the past 20 minutes, and the child has not regained normal consciousness between episodes.",
      "subQuestions": [
        {
          "id": "neuro_c2_sq1",
          "questionText": "What is the exact medical emergency diagnosis for this child's current condition?",
          "back": "Status Epilepticus (specifically a prolonged febrile convulsion)."
        },
        {
          "id": "neuro_c2_sq2",
          "questionText": "What is the immediate first-line medication protocol and route of choice if intravenous (IV) access is not yet established?",
          "back": "Rectal diazepam at a dose of 0.3-0.5 mg/kg (maximum 10 mg)."
        },
        {
          "id": "neuro_c2_sq3",
          "questionText": "What life-threatening risk must the clinician anticipate if intravenous Phenobarbital is administered immediately after giving Diazepam?",
          "back": "Severe incidence of respiratory depression."
        }
      ]
    },
    {
      "id": "neuro_clinoma_case_3",
      "category": "clinoma",
      "type": "case",
      "front": "Case Scenario 3 (Neurology)",
      "caseBody": "A 2-month-old infant is evaluated for profound, persistent generalized muscle weakness and severe floppy hypotonia noticed since birth. On physical examination, the infant lies in a complete \"frog leg position,\" shows marked head lag when pulled to sit, and has completely absent deep tendon reflexes. The clinician observes distinct fine fasciculations of the tongue, but notes that the infant is completely alert and responsive.",
      "subQuestions": [
        {
          "id": "neuro_c3_sq1",
          "questionText": "What is the most likely diagnosis?",
          "back": "Werding Hoffman Disease (Spinal Muscular Atrophy)."
        },
        {
          "id": "neuro_c3_sq2",
          "questionText": "What is the primary underlying pathological mechanism of this disease?",
          "back": "Primary degeneration and atrophy of the anterior horn cells (AHC) and motor nuclei of the brain stem."
        },
        {
          "id": "neuro_c3_sq3",
          "questionText": "What does a confirmatory muscle biopsy characteristically reveal?",
          "back": "Neurogenic type of atrophy, or muscle spindles atrophied in groups."
        }
      ]
    }
  ]
};

const getQuestionsForKey = (key: string) => {
  if (!key) return [];
  const lowerKey = key.toLowerCase();
  const matchedKey = Object.keys(PEDIATRICS_QUESTIONS).find(k => k.toLowerCase() === lowerKey);
  return matchedKey ? PEDIATRICS_QUESTIONS[matchedKey] : [];
};

const ARABIC_SYSTEM_NAMES: Record<string, string> = {
  'Cardiovascular diseases': 'أمراض القلب للأطفال',
  'Endocrinology': 'الغدد الصماء',
  'Gastroenterology & hepatology': 'الجهاز الهضمي والكبد',
  'Genetic diseases': 'الأمراض الوراثية',
  'Growth & development': 'النمو والتطور',
  'Hematology & Oncology': 'أمراض الدم والأورام',
  'Infections': 'الأمراض المعدية',
  'Neurology': 'أمراض الأعصاب',
  'Nutrition': 'التغذية',
  'Renal diseases': 'أمراض الكلى',
};

const SYSTEM_COLORS: Record<string, string> = {
  'Cardiovascular diseases': '#ef4444',
  'Endocrinology': '#f59e0b',
  'Gastroenterology & hepatology': '#10b981',
  'Genetic diseases': '#8b5cf6',
  'Growth & development': '#14b8a6',
  'Hematology & Oncology': '#f43f5e',
  'Infections': '#f97316',
  'Neurology': '#6366f1',
  'Nutrition': '#22c55e',
  'Renal diseases': '#0ea5e9',
};

// --- Case Questions Logic ---
const groupCases = (questions: any[]) => {
  try {
    const result: any[] = [];
    const caseMap = new Map<string, any>();
    
    questions.forEach(q => {
      if (!q) return;
      if (q.type === 'case') {
        result.push(q);
        return;
      }
      if (q.front && typeof q.front === 'string' && q.front.toLowerCase().startsWith('case ')) {
        const match = q.front.match(/^(Case\s+Study(?:\s+\(Continued\))?|Case\s+\d+)\s*:/i);
        let caseIdentifier = match ? match[1].replace(/\s*\(Continued\)/i, '').trim() : "Unknown Case";
        const bodyWithoutId = match ? q.front.substring(match[0].length).trim() : q.front.trim();
        
        let caseBody = "";
        let questionText = "";

        if (q.front.includes('\n\n')) {
          const parts = bodyWithoutId.split('\n\n');
          caseBody = parts[0].trim();
          questionText = parts.slice(1).join('\n\n').trim();
        } else {
          if (caseMap.has(caseIdentifier)) {
            // If the case group already exists, this is a follow-up question
            questionText = bodyWithoutId;
          } else {
            // First time seeing this case group, but it's on a single line
            const qMatch = bodyWithoutId.match(/(?:\.|\?)\s+(\d+\s*-.*)$/);
            if (qMatch) {
              caseBody = bodyWithoutId.substring(0, qMatch.index! + 1).trim();
              questionText = qMatch[1].trim();
            } else {
              caseBody = bodyWithoutId;
              questionText = "What is your diagnosis/next step?";
            }
          }
        }
        
        if (!caseMap.has(caseIdentifier)) {
          const caseObj = {
            id: `case_group_${q.id || Math.random()}`,
            type: 'case',
            front: caseBody,
            caseBody: caseBody,
            subQuestions: []
          };
          caseMap.set(caseIdentifier, caseObj);
          result.push(caseObj);
        }
        
        const existingGroup = caseMap.get(caseIdentifier);
        if (caseBody && (!existingGroup.caseBody || existingGroup.caseBody.length < caseBody.length)) {
          existingGroup.caseBody = caseBody;
          existingGroup.front = caseBody;
        }
        
        existingGroup.subQuestions.push({
          id: q.id,
          questionText: questionText,
          back: q.back
        });
        
        return;
      }
      
      result.push(q);
    });
    
    return result;
  } catch (error) {
    console.error("groupCases error:", error);
    return questions || [];
  }
};

// --- Case Study UI Component ---
const CaseStudyUI = ({ question, onComplete, currentPriority, onSetPriority }: { question: any, onComplete: () => void, currentPriority?: 'A'|'B'|'C'|null, onSetPriority?: (p: 'A'|'B'|'C'|null) => void }) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setRevealed({});
  }, [question]);

  const allRevealed = question.subQuestions && Object.keys(revealed).length === question.subQuestions.length;

  return (
    <div className="flex flex-col w-full h-full max-w-4xl mx-auto overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl" onClick={e => e.stopPropagation()}>
      {/* Top Header - Case Body */}
      <div className="w-full bg-indigo-50 dark:bg-indigo-900/30 p-6 md:p-8 shrink-0 relative flex flex-col gap-4">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

        {/* Header Controls: Title & Priority Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
              <span className="text-indigo-600 dark:text-indigo-300 font-black">C</span>
            </div>
            <span className="font-black text-slate-500 dark:text-slate-400 text-xs md:text-sm uppercase tracking-wider">Case Study Description</span>
          </div>

          {onSetPriority && (
            <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-800/70 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm self-end sm:self-auto shrink-0">
              <span className="text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mx-2">Priority:</span>
              {(['A', 'B', 'C'] as const).map(p => (
                <button
                  key={p}
                  onClick={(e) => { e.stopPropagation(); onSetPriority(currentPriority === p ? null : p); }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-all text-xs ${currentPriority === p ? (p === 'A' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110' : p === 'B' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-110' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110') : 'bg-white dark:bg-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Case Text Content */}
        <div className="w-full pr-1">
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-base md:text-lg whitespace-pre-wrap leading-relaxed" dir="auto">
            {question.caseBody}
          </h3>
        </div>
      </div>
      
      {/* Sub Questions List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col gap-4">
        <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs mb-2">Questions ({question.subQuestions?.length || 0})</h4>
        
        {question.subQuestions?.map((sub: any, index: number) => (
          <div key={sub.id} className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col gap-4 transition-all hover:border-indigo-200 dark:hover:border-indigo-800/50">
            <p className="font-bold text-slate-700 dark:text-slate-200" dir="auto">{sub.questionText}</p>
            
            {!revealed[sub.id] ? (
              <button 
                onClick={() => setRevealed(prev => ({...prev, [sub.id]: true}))}
                className="self-start px-5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm transition-all flex items-center gap-2"
              >
                Reveal Answer
              </button>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-xl mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="font-bold text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap" dir="auto">{sub.back}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completion */}
      <div className="shrink-0 p-4 bg-white dark:bg-slate-800 border-t-2 border-slate-100 dark:border-slate-700 flex justify-center">
        <button
          onClick={onComplete}
          disabled={!allRevealed}
          className={`px-8 py-3 rounded-2xl font-black transition-all ${allRevealed ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
        >
          {allRevealed ? 'Complete Case' : 'Reveal All Answers First'}
        </button>
      </div>
    </div>
  );
};

const FlashSpace = () => {
  const navigate = useNavigate();
  const { isSpaceSubscribed, userData, user } = useAuth();
  const userRole = userData?.role;
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<Board[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [systems, setSystems] = useState<Record<string, string[]>>({});
  
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedSubSystem, setSelectedSubSystem] = useState<string | null>(null);
  const matchesSubSystem = (bSubSystem: string | undefined, selSubSys: string | null) => {
    if (!selSubSys) return true;
    if (selSubSys === 'CNS') return bSubSystem === 'Neurology' || bSubSystem === 'Infection';
    return bSubSystem === selSubSys;
  };
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [growthViews, setGrowthViews] = useState<number>(0);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  // --- First Paper Camp states ---
  const [campActiveDay, setCampActiveDay] = useState<number>(1);
  const [campActiveTab, setCampActiveTab] = useState<'chapters' | 'notebook'>('chapters');
  const [campShowSettings, setCampShowSettings] = useState(false);
  const [campStartTimeStr, setCampStartTimeStr] = useState<string>(() => {
    return localStorage.getItem('camp_start_time') || new Date(Date.now() - 5 * 60 * 1000).toISOString().slice(0, 16);
  });
  const [campDurationMins, setCampDurationMins] = useState<number>(() => {
    return Number(localStorage.getItem('camp_duration') || '15');
  });
  const [campTimeRemainingToStart, setCampTimeRemainingToStart] = useState<number>(0);
  const [campExamState, setCampExamState] = useState<'locked' | 'ready' | 'active' | 'finished'>('ready');
  const [campGameQuestions, setCampGameQuestions] = useState<{ id: string; text: string }[]>([]);
  const [campGameAnswers, setCampGameAnswers] = useState<{ id: string; text: string }[]>([]);
  const [campSelectedQ, setCampSelectedQ] = useState<string | null>(null);
  const [campSelectedA, setCampSelectedA] = useState<string | null>(null);
  const [campMatches, setCampMatches] = useState<Record<string, string>>({});
  const [campWrongMatches, setCampWrongMatches] = useState<string[]>([]);
  const [campTestTimeLeft, setCampTestTimeLeft] = useState<number>(0);
  const [campScore, setCampScore] = useState<number>(0);

  const handleDownloadPDF = async (compressFlag: boolean) => {
    setDownloadProgress(0);
    setDownloadStatus("جاري الاتصال وسحب الملف الأصلي...");
    
    const pdfUrl = compressFlag ? "/tahdedat_pediatrics_compressed.pdf" : "/tahdedat_pediatrics.pdf";
    const displayName = user?.displayName || userData?.name || "Omar Mahmoud";
    const displayEmail = user?.email || userData?.email || "omar.mahmoud@gmail.com";
    
    try {
      // Step 1: Fetch PDF bytes
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Failed to load PDF template file.");
      
      const contentLength = response.headers.get("content-length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to initialize PDF stream reader.");
      
      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        receivedBytes += value.length;
        
        if (totalBytes > 0) {
          const percent = Math.round((receivedBytes / totalBytes) * 70); // Up to 70% for fetching
          setDownloadProgress(percent);
          setDownloadStatus(`جاري تحميل عناصر التجميعة الطبية... ${percent}%`);
        }
      }
      
      setDownloadProgress(75);
      setDownloadStatus("جاري تهيئة وتوقيع ملف الـ PDF مائياً في المتصفح...");
      
      // Step 2: Combine chunks
      const pdfBytes = new Uint8Array(receivedBytes);
      let offset = 0;
      for (const chunk of chunks) {
        pdfBytes.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Step 3: Load pdf-lib dynamically from CDN (highly optimized ESM)
      // @ts-ignore
      const { PDFDocument, rgb, StandardFonts } = await import('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.esm.js');
      
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      setDownloadProgress(85);
      setDownloadStatus("جاري كتابة وتشفير هويتك الرقمية كعلامة مائية أمنية...");
      
      // Page numbers of chapter covers to skip watermarking
      const chapterCovers = [3, 7, 11, 15, 19, 24, 35, 43];
      const pageCount = pdfDoc.getPageCount();
      
      for (let i = 0; i < pageCount; i++) {
        const p = i + 1;
        // Skip cover, index, and chapter covers
        if (p > 2 && !chapterCovers.includes(p)) {
          const page = pdfDoc.getPage(i);
          const height = page.getHeight();
          const width = page.getWidth();
          const margin = 12;
          const box_w = 200;
          const box_h = 13;
          const header_y = height - margin - 17;
          
          // Draw left box
          page.drawRectangle({
            x: margin + 5,
            y: header_y,
            width: box_w,
            height: box_h,
            color: rgb(240/255, 249/255, 255/255),
            borderColor: rgb(186/255, 230/255, 253/255),
            borderWidth: 0.5,
            opacity: 1,
          });
          page.drawText('USER:', {
            x: margin + 10,
            y: header_y + 3.5,
            size: 7,
            font: helveticaBoldFont,
            color: rgb(3/255, 105/255, 161/255),
          });
          page.drawText(displayName, {
            x: margin + 42,
            y: header_y + 3.5,
            size: 7,
            font: helveticaFont,
            color: rgb(15/255, 23/255, 42/255),
          });
          
          // Draw right box
          page.drawRectangle({
            x: width - margin - box_w - 5,
            y: header_y,
            width: box_w,
            height: box_h,
            color: rgb(240/255, 249/255, 255/255),
            borderColor: rgb(186/255, 230/255, 253/255),
            borderWidth: 0.5,
            opacity: 1,
          });
          page.drawText('EMAIL:', {
            x: width - margin - box_w + 10,
            y: header_y + 3.5,
            size: 7,
            font: helveticaBoldFont,
            color: rgb(3/255, 105/255, 161/255),
          });
          page.drawText(displayEmail, {
            x: width - margin - box_w + 45,
            y: header_y + 3.5,
            size: 7,
            font: helveticaFont,
            color: rgb(15/255, 23/255, 42/255),
          });
        }
      }
      
      setDownloadProgress(95);
      setDownloadStatus("جاري حفظ مستند التجميعة المشفر...");
      
      const modifiedPdfBytes = await pdfDoc.save();
      
      // Step 4: Trigger native browser download
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = compressFlag ? "تحديدات_الأطفال_مضغوط.pdf" : "تحديدات_الأطفال.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      setDownloadProgress(100);
      setDownloadStatus("تم التنزيل بنجاح! 🎉");
      setTimeout(() => {
        setIsDownloadModalOpen(false);
        setDownloadStatus(null);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      alert(`فشل تجهيز وتنزيل الملف: ${err.message}`);
      setDownloadStatus(null);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      const fetchViews = async () => {
        try {
          const statsRef = doc(db, 'analytics', 'growth_chapter');
          const snap = await getDoc(statsRef);
          if (snap.exists()) {
            setGrowthViews(snap.data().views || 0);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchViews();
    }
  }, [userRole]);

  const trackGrowthView = async () => {
    try {
      if (userRole === 'admin') return;
      const statsRef = doc(db, 'analytics', 'growth_chapter');
      const snap = await getDoc(statsRef);
      if (snap.exists()) {
        await updateDoc(statsRef, { views: increment(1) });
      } else {
        await setDoc(statsRef, { views: 1 });
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop toggle
  const [activeTool, setActiveTool] = useState<Tool>('pan');
  const [showSettingsFor, setShowSettingsFor] = useState<Tool | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const initialPinchCenterRef = useRef<Point | null>(null);
  const initialOffsetRef = useRef<Point | null>(null);
  const [isTwoFingerDragging, setIsTwoFingerDragging] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showStudyExitConfirm, setShowStudyExitConfirm] = useState(false);
  const [activeNoteTab, setActiveNoteTab] = useState<'notes' | 'questions'>('notes');

  // --- Question Session State ---
  const [qQueue, setQQueue] = useState<Question[]>([]);
  const [qDone, setQDone] = useState<Question[]>([]);
  const [qHardCount, setQHardCount] = useState(0);
  const [qRepeatCount, setQRepeatCount] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [qSessionDone, setQSessionDone] = useState(false);
  const [isChapterQuestionMode, setIsChapterQuestionMode] = useState(false);
  // --- Priority Review System State ---
  const [spacePriorities, setSpacePriorities] = useState<Record<string, 'A'|'B'|'C'>>({});
  const [isReviewCenterOpen, setIsReviewCenterOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<'images'|'questions'>('questions');
  const [reviewFilter, setReviewFilter] = useState<'A'|'B'|'C'>('A');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNoteText, setEditedNoteText] = useState("");
  const [firebaseNotes, setFirebaseNotes] = useState<Record<string, string>>({});
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (userData?.spacePriorities) {
      setSpacePriorities(userData.spacePriorities);
    }
  }, [userData?.spacePriorities]);

  const handleSetPriority = async (itemId: string, priority: 'A'|'B'|'C'|null) => {
    if (!user) return;
    try {
      const newPriorities = { ...spacePriorities };
      if (priority) {
        newPriorities[itemId] = priority;
      } else {
        delete newPriorities[itemId];
      }
      setSpacePriorities(newPriorities);
      
      const userRef = doc(db, 'users', user.uid);
      // We use dot notation to update specific field in map
      await updateDoc(userRef, {
        [`spacePriorities.${itemId}`]: priority ? priority : deleteField()
      });
      toast.success('Priority Updated');
    } catch (error) {
      console.error("Failed to set priority", error);
      toast.error('Failed to update priority');
    }
  };

  const handleConfirmExitStudySession = async () => {
    const earnedPoints = Math.floor(sessionSeconds * 3);
    
    if (user && earnedPoints > 0) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          points: increment(earnedPoints),
          spacePoints: increment(earnedPoints)
        });
        toast.success(`أحسنت! لقد ربحت ${earnedPoints} نقطة لمذاكرتك النشطة! 🏆`, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '1rem',
          }
        });
      } catch (error) {
        console.error("Failed to add study time points", error);
      }
    } else if (earnedPoints === 0) {
      toast.success('تم إنهاء جلسة المذاكرة بنجاح');
    }
    
    setSelectedBoard(null);
    setSelectedSystem(null);
    setSelectedSubSystem(null);
    setIsSidebarOpen(false);
    setPaths([]);
    setRedoPaths([]);
    setIsChapterQuestionMode(false);
    setShowQuestions(false);
    setShowExplanation(false);
    setSessionSeconds(0);
    setIsTimerActive(false);
    setShowStudyExitConfirm(false);
  };

  const triggerExitStudySession = () => {
    setIsTimerActive(false);
    setShowStudyExitConfirm(true);
  };

  const handleCancelExitStudySession = () => {
    setIsTimerActive(true);
    setShowStudyExitConfirm(false);
  };

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [historyStack, setHistoryStack] = useState<{qQueue: Question[], qDone: Question[], qHardCount: number, qRepeatCount: number}[]>([]);

  // Vector Engine
  const [paths, setPaths] = useState<Path[]>([]);
  const [redoPaths, setRedoPaths] = useState<Path[]>([]);
  const currentPathRef = useRef<Path | null>(null);
  const fadingLasersRef = useRef<Path[]>([]);
  const [laserPaths, setLaserPaths] = useState<Path[]>([]);

  // Timer
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [toolSettings, setToolSettings] = useState<Record<Tool, { size: number, opacity: number, color: string }>>({
    pen: { size: 3, opacity: 1, color: '#3b82f6' },
    highlighter: { size: 35, opacity: 0.3, color: '#eab308' },
    eraser: { size: 40, opacity: 1, color: '#ffffff' },
    laser: { size: 10, opacity: 1, color: '#ef4444' },
    text: { size: 24, opacity: 1, color: '#1e293b' },
    pan: { size: 0, opacity: 0, color: '' }
  });

  // --- Professional Zero-Lag Cursor ---
  useEffect(() => {
    const cursor = cursorRef.current;
    const handleMove = (e: MouseEvent) => {
      if (cursor) {
        // Direct DOM update for performance (No React re-render)
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const CursorUI = () => {
    // ONLY show custom preview for Eraser. For others, we use the standard crosshair cursor.
    if (activeTool !== 'eraser') return null;

    const size = toolSettings.eraser.size * zoom;
    
    return (
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[2000] -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div className="w-full h-full rounded-full border border-slate-400 bg-white/20 transition-all duration-200" />
      </div>
    );
  };

  // --- Timer Engine (Restored) ---
  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // --- Data Fetching (Restored) ---
  useEffect(() => {
    setQQueue([]);
    setQDone([]);
    setQSessionDone(false);
  }, [selectedBoard?.id]);

  useEffect(() => {
    const fetchData = async () => {
      const timeoutId = setTimeout(() => setLoading(false), 5000);
      try {
        getDocs(collection(db, 'notes')).then(notesSnap => {
          const notesData: Record<string, string> = {};
          notesSnap.docs.forEach(doc => { notesData[doc.id] = doc.data().content; });
          setFirebaseNotes(notesData);
        }).catch(err => console.error("Error fetching notes:", err));

        const snap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
        
        // Add the Pediatrics boards dynamically
        const generatedPediatricsBoards: Board[] = [];
        Object.entries(PEDIATRICS_SLIDES).forEach(([chapter, files]) => {
          files.forEach(file => {
            const title = (file.split('/').pop() || file).replace(/\.[^/.]+$/, "");
            const customExp = PEDIATRICS_EXPLANATIONS[title];
            generatedPediatricsBoards.push({
              id: `pediatrics_${chapter.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
              module: 'Pediatrics',
              system: chapter,
              subSystem: chapter === 'تحديدات الاطفال' && file.includes('/') ? file.split('/')[1] : undefined,
              disease: title,
              medicalImage: file.includes('/') ? `/assets/TIP-Peditrics/${file}` : `/assets/TIP-Peditrics/${chapter}/${file}`,
              explanation: customExp || `A comprehensive visual study guide for ${title} under the Pediatrics ${chapter} system. Use this interactive flash space to annotate, highlight, and review key clinical presentation, diagnostic criteria, and management protocols.`,
              createdAt: Date.now()
            });
          });
        });

        const finalBoards = [...generatedPediatricsBoards, ...fetched];
        setBoards(finalBoards);
        
        const mods = Array.from(new Set(finalBoards.map(b => b.module))).filter(Boolean);
        const sysMap: Record<string, string[]> = {};
        finalBoards.forEach(b => {
          if (b.module && b.system) {
            if (!sysMap[b.module]) sysMap[b.module] = [];
            if (!sysMap[b.module].includes(b.system)) sysMap[b.module].push(b.system);
          }
        });
        setModules(mods);
        setSystems(sysMap);
      } catch (err) {
        console.error("FlashSpace Fetch Error:", err);
        toast.error('Failed to connect to cloud');
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- First Paper Camp Scheduler & Timers ---
  useEffect(() => {
    const checkSchedule = () => {
      const startMs = new Date(campStartTimeStr).getTime();
      const nowMs = Date.now();
      const diff = startMs - nowMs;
      
      if (diff > 0) {
        setCampTimeRemainingToStart(Math.ceil(diff / 1000));
        setCampExamState('locked');
      } else {
        setCampTimeRemainingToStart(0);
        if (campExamState === 'locked') {
          setCampExamState('ready');
        }
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 1000);
    return () => clearInterval(interval);
  }, [campStartTimeStr, campExamState]);

  useEffect(() => {
    if (campExamState !== 'active') return;

    if (campTestTimeLeft <= 0) {
      const correctCount = Object.keys(campMatches).length;
      const finalScore = Math.round((correctCount / (campGameQuestions.length || 6)) * 100);
      setCampScore(finalScore);
      setCampExamState('finished');
      return;
    }

    const interval = setInterval(() => {
      setCampTestTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [campTestTimeLeft, campExamState]);

  const startCampMatchingGame = () => {
    const MATCHING_POOL = [
      { id: '1', question: 'Widely split & fixed S2', answer: 'Atrial Septal Defect (ASD)' },
      { id: '2', question: 'Continuous machinery murmur', answer: 'Patent Ductus Arteriosus (PDA)' },
      { id: '3', question: 'Boot-shaped heart on X-ray', answer: 'Tetralogy of Fallot (TOF)' },
      { id: '4', question: 'Egg-on-a-string heart shape', answer: 'Transposition of Great Arteries (TGA)' },
      { id: '5', question: 'Rib notching on Chest X-ray', answer: 'Coarctation of the Aorta (CoA)' },
      { id: '6', question: 'Knee-Chest position therapy', answer: 'Hypercyanotic Tet Spell' },
      { id: '7', question: 'Webbed neck & short female stature', answer: 'Turner Syndrome' },
      { id: '8', question: '47, XXY karyotype & long limbs', answer: 'Klinefelter Syndrome' },
      { id: '9', question: 'Overlapping fingers & rocker-bottom feet', answer: 'Edward Syndrome (Trisomy 18)' },
      { id: '10', question: 'Cleft lip/palate & microphthalmia', answer: 'Patau Syndrome (Trisomy 13)' }
    ];
    const shuffledPool = [...MATCHING_POOL].sort(() => Math.random() - 0.5).slice(0, 6);
    const qs = shuffledPool.map(item => ({ id: item.id, text: item.question })).sort(() => Math.random() - 0.5);
    const ans = shuffledPool.map(item => ({ id: item.id, text: item.answer })).sort(() => Math.random() - 0.5);
    
    setCampGameQuestions(qs);
    setCampGameAnswers(ans);
    setCampMatches({});
    setCampWrongMatches([]);
    setCampSelectedQ(null);
    setCampSelectedA(null);
    setCampTestTimeLeft(campDurationMins * 60);
    setCampExamState('active');
  };

  // --- Pro Rendering Engine (Optimized) ---
  const drawPath = useCallback((ctx: CanvasRenderingContext2D, path: Path, opacityOverride?: number) => {
    if (path.points.length < 2) return;
    
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = opacityOverride ?? path.opacity;

    if (path.tool === 'highlighter') ctx.globalCompositeOperation = 'multiply';
    else if (path.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
    else ctx.globalCompositeOperation = 'source-over';

    ctx.lineWidth = path.size;
    ctx.strokeStyle = path.color;

    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length - 2; i++) {
      const xc = (path.points[i].x + path.points[i + 1].x) / 2;
      const yc = (path.points[i].y + path.points[i + 1].y) / 2;
      ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, xc, yc);
    }
    if (path.points.length > 2) {
      const n = path.points.length;
      ctx.quadraticCurveTo(path.points[n - 2].x, path.points[n - 2].y, path.points[n - 1].x, path.points[n - 1].y);
    }
    ctx.stroke();

    // Zero-Lag 3D Laser Effect (Double Stroke instead of Shadows)
    if (path.tool === 'laser') {
      ctx.beginPath();
      ctx.lineWidth = path.size / 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length - 1; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  // Redraw all paths to bgCanvas when paths array changes
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    paths.forEach(p => drawPath(ctx, p));
  }, [paths, drawPath]);


      // RADICAL PERFORMANCE FIX: renderFrame and requestAnimationFrame removed to prevent CPU/GPU thermal throttling.
  // We now use direct incremental drawing to the active canvas and CSS-faded SVG for lasers.


  // --- Object-Based Pro Eraser ---
  const handleEraser = (pos: Point) => {
    const eraserSize = toolSettings.eraser.size;
    setPaths(prev => prev.filter(path => {
      // If any point in the path is near the eraser, remove the entire path (Object Eraser)
      const isHit = path.points.some(p => {
        const dx = p.x - pos.x;
        const dy = p.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < eraserSize / 2;
      });
      return !isHit;
    }));
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length === 2) {
      setIsTwoFingerDragging(true);
      currentPathRef.current = null;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      initialPinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
      initialZoomRef.current = zoom;
      initialPinchCenterRef.current = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
      initialOffsetRef.current = { ...offset };
      return;
    }

    if (activeTool === 'pan') {
      setIsPanning(true);
      panStartRef.current = { 
        x: ('touches' in e ? e.touches[0].clientX : e.clientX) - offset.x,
        y: ('touches' in e ? e.touches[0].clientY : e.clientY) - offset.y
      };
      return;
    }

    const pos = getPos(e);
    if (activeTool === 'eraser') {
      handleEraser(pos);
      currentPathRef.current = { id: 'eraser-mark', points: [pos], tool: 'eraser', color: '#fff', size: 1, opacity: 0 };
      return;
    }

    const settings = toolSettings[activeTool];
    currentPathRef.current = {
      id: Math.random().toString(),
      points: [pos],
      tool: activeTool,
      color: settings.color,
      size: settings.size,
      opacity: settings.opacity
    };

    // Incremental Drawing: Draw the initial dot
    if (activeTool === 'laser') {
      const d = `M ${pos.x},${pos.y} L ${pos.x},${pos.y}`;
      const outer = document.getElementById('live-laser-outer');
      const inner = document.getElementById('live-laser-inner');
      if (outer) {
        outer.setAttribute('stroke', currentPathRef.current.color);
        outer.setAttribute('stroke-width', (currentPathRef.current.size * 1.5).toString());
        outer.style.filter = `drop-shadow(0 0 12px ${currentPathRef.current.color}) drop-shadow(0 0 6px ${currentPathRef.current.color})`;
        outer.setAttribute('d', d);
      }
      if (inner) {
        inner.setAttribute('stroke-width', (currentPathRef.current.size / 2.5).toString());
        inner.setAttribute('d', d);
      }
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.fillStyle = currentPathRef.current.color;
          ctx.globalAlpha = currentPathRef.current.opacity;
          ctx.arc(pos.x, pos.y, currentPathRef.current.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length === 2 && isTwoFingerDragging) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (initialPinchDistRef.current && initialPinchCenterRef.current && initialOffsetRef.current) {
        const scale = dist / initialPinchDistRef.current;
        const newZoom = Math.min(3, Math.max(0.5, initialZoomRef.current * scale));
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        const deltaX = midX - initialPinchCenterRef.current.x;
        const deltaY = midY - initialPinchCenterRef.current.y;
        setZoom(newZoom);
        setOffset({ x: initialOffsetRef.current.x + deltaX, y: initialOffsetRef.current.y + deltaY });
      }
      return;
    }

    if (activeTool === 'pan' && isPanning) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setOffset({ x: clientX - panStartRef.current.x, y: clientY - panStartRef.current.y });
      return;
    }

    if (!currentPathRef.current) return;
    const pos = getPos(e);
    if (activeTool === 'eraser') {
      handleEraser(pos);
      return;
    }

    // POINT DECIMATION to save memory and arrays length
    const lastPoint = currentPathRef.current.points[currentPathRef.current.points.length - 1];
    const dx = pos.x - lastPoint.x;
    const dy = pos.y - lastPoint.y;
    if (dx * dx + dy * dy < 9) return; // 3px distance threshold

    currentPathRef.current.points.push(pos);

    // INCREMENTAL DRAWING
    if (activeTool === 'laser') {
      const d = `M ${currentPathRef.current.points.map(pt => `${pt.x},${pt.y}`).join(' L ')}`;
      const outer = document.getElementById('live-laser-outer');
      const inner = document.getElementById('live-laser-inner');
      if (outer) outer.setAttribute('d', d);
      if (inner) inner.setAttribute('d', d);
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pos.x, pos.y);
        if (activeTool === 'highlighter') ctx.globalCompositeOperation = 'multiply';
        else ctx.globalCompositeOperation = 'source-over';
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = currentPathRef.current.opacity;

        ctx.strokeStyle = currentPathRef.current.color;
        ctx.lineWidth = currentPathRef.current.size;
        ctx.stroke();
      }
    }
  };

  const handleEnd = () => {
    if (isTwoFingerDragging) {
      setIsTwoFingerDragging(false);
      initialPinchDistRef.current = null;
      initialPinchCenterRef.current = null;
      initialOffsetRef.current = null;
      return;
    }

    if (activeTool === 'pan') {
      setIsPanning(false);
      return;
    }

    if (!currentPathRef.current) return;
    
    if (activeTool === 'laser') {
      const outer = document.getElementById('live-laser-outer');
      const inner = document.getElementById('live-laser-inner');
      if (outer) outer.setAttribute('d', '');
      if (inner) inner.setAttribute('d', '');
    }

    // Clear Active Canvas (because it will be moved to bgCanvas or SVG)
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (activeTool === 'laser') {
      const laser = { ...currentPathRef.current, id: Math.random().toString() };
      setLaserPaths(prev => [...prev, laser]);
      setTimeout(() => {
        setLaserPaths(prev => prev.filter(p => p.id !== laser.id));
      }, 1500);
    } else if (activeTool !== 'eraser') {
      setPaths(prev => [...prev, currentPathRef.current!]);
      setRedoPaths([]);
    }
    
    currentPathRef.current = null;
  };

  const updateSetting = (tool: Tool, key: string, val: any) => {
    setToolSettings(prev => ({ ...prev, [tool]: { ...prev[tool], [key]: val } }));
  };

  // --- Question Session Helpers ---
  const startQuestionSession = (questions: Question[]) => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQQueue(shuffled);
    setQDone([]);
    setQHardCount(0);
    setQRepeatCount(0);
    setHistoryStack([]);
    setIsCardFlipped(false);
    setQSessionDone(false);
  };

  const previousCard = () => {
    if (historyStack.length === 0) return;
    const lastState = historyStack[historyStack.length - 1];
    setQQueue(lastState.qQueue);
    setQDone(lastState.qDone);
    setQHardCount(lastState.qHardCount);
    setQRepeatCount(lastState.qRepeatCount);
    setHistoryStack(prev => prev.slice(0, -1));
    setIsCardFlipped(false);
  };

  const rateCard = (rating: 'easy' | 'repeat' | 'hard') => {
    const current = qQueue[0];
    const rest = qQueue.slice(1);
    
    // Save state before changing
    setHistoryStack(prev => [...prev, { qQueue, qDone, qHardCount, qRepeatCount }]);
    
    setIsCardFlipped(false);
    setTimeout(() => {
      if (rating === 'easy') {
        const newDone = [...qDone, current];
        setQDone(newDone);
        if (rest.length === 0) {
          setQSessionDone(true);
          setQQueue([]);
          
          // Submit Points to Firebase
          const user = auth.currentUser;
          if (user) {
            const minutes = Math.floor(sessionSeconds / 60);
            const timePoints = minutes * 2;
            let earnedPoints = newDone.length * 10 + timePoints;
            const updates: any = { 
              points: increment(earnedPoints),
              spacePoints: increment(earnedPoints)
            };
            let successMessage = `You earned ${earnedPoints} points! 🏆`;
            
            // Topic Completion Check
            if (selectedModule && selectedSystem) {
              const totalSlides = boards.filter(b => b.module === selectedModule && b.system === selectedSystem).length;
              if (newDone.length >= totalSlides && totalSlides > 0) {
                earnedPoints += 100;
                updates.points = increment(earnedPoints);
                updates.spacePoints = increment(earnedPoints);
                updates.completedSpaceTopics = arrayUnion(`${selectedModule}_${selectedSystem}`);
                successMessage = `Module Completed! +100 Bonus! Total: ${earnedPoints} Pts 🏅`;
              }
            }

            const userRef = doc(db, 'users', user.uid);
            updateDoc(userRef, updates)
              .then(() => toast.success(successMessage))
              .catch(err => console.error("Failed to add points", err));
          }
        } else {
          setQQueue(rest);
        }
      } else {
        if (rating === 'hard') setQHardCount(c => c + 1);
        else setQRepeatCount(c => c + 1);
        setQQueue([...rest, current]);
      }
    }, 300);
  };

  // --- Premium UI ---
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 100%)'}}>  
      <div className="text-center space-y-8">
        <div className="relative w-28 h-28 mx-auto">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-[2.5rem] animate-ping" />
          <div className="relative w-28 h-28 bg-indigo-500/10 border border-indigo-500/30 rounded-[2.5rem] flex items-center justify-center">
            <Brain className="w-14 h-14 text-indigo-400" />
          </div>
        </div>
        <div>
          <p className="text-white font-black text-3xl tracking-tight">CLINOMA Flash Space</p>
          <p className="text-slate-400 mt-3 text-lg">جاري تحميل اللوحات الطبية...</p>
        </div>
        <div className="flex gap-3 justify-center">
          {[0,1,2].map(i => (
            <div key={i} className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: `${i * 150}ms`}} />
          ))}
        </div>
      </div>
    </div>
  );

  if (boards.length === 0) return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-12 text-center" style={{background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 100%)'}}>
      <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-white/20 mb-8">
        <Layout className="w-16 h-16" />
      </div>
      <h2 className="text-3xl font-black text-white mb-4">لا توجد لوحات</h2>
      <p className="text-slate-400 max-w-md mb-10">لم يتم العثور على أي لوحات طبية.</p>
      <button onClick={() => navigate('/flashcards')} className="px-10 py-5 bg-indigo-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
        العودة للمكتبة
      </button>
    </div>
  );

  // ---- BROWSE SCREENS (no board selected) ----
  if (!selectedBoard) {
    return (
      <div className="h-screen w-full flex flex-col overflow-hidden" style={{background: 'linear-gradient(160deg, #0f1117 0%, #131729 100%)'}}>
        {/* Header */}
        <div className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white font-black">Flash Space</span>
              {selectedModule && <>
                <span className="text-white/20">/</span>
                <span className="text-slate-400 font-bold">{selectedModule}</span>
              </>}
              {selectedSystem && <>
                <span className="text-white/20">/</span>
                <span className="text-indigo-400 font-bold">{selectedSystem}</span>
              </>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-black">
              ⭐ {userData?.points ?? 0}
            </div>
            <button onClick={() => navigate('/flashcards')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 font-bold text-xs flex items-center gap-2 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedModule ? (
            // MODULE SELECTION
            <div className="h-full flex flex-col p-4 md:p-8 gap-6 md:gap-10 max-w-7xl mx-auto w-full">
              <div className="text-center pt-8 md:pt-16 shrink-0">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
                  <Zap className="w-4 h-4" /> Flash Space
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">Choose a Subject</h1>
                <p className="text-slate-400 mt-2 text-sm md:text-base">Select a subject to start your learning journey</p>
              </div>
              <div className="flex-1 overflow-y-auto pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {modules.map(mod => {
                    return (
                    <button key={mod} onClick={() => setSelectedModule(mod)}
                      className="group relative backdrop-blur-xl border border-white/5 active:border-indigo-500/50 hover:border-indigo-500/50 rounded-3xl text-left transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] overflow-hidden p-6 hover:shadow-2xl hover:shadow-indigo-500/10 bg-slate-900/50"
                    >
                      {/* Gradient Glow */}
                      <div className="absolute top-0 right-0 w-40 h-40 opacity-10 group-hover:opacity-30 transition-opacity duration-500 blur-3xl rounded-full" style={{background: '#6366f1', transform: 'translate(40%, -40%)'}} />
                      
                      <div className="relative z-10 flex flex-col h-full gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:-translate-y-1 transition-transform duration-300">
                          <BookOpen className="w-7 h-7 drop-shadow-md" />
                        </div>
                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <h3 className="text-xl font-black text-white leading-tight">{mod}</h3>
                            <p className="text-slate-400 text-xs font-semibold mt-1">{systems[mod]?.length || 0} chapters available</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  )})}
                </div>
              </div>
            </div>
          ) : !selectedSystem ? (
            // SYSTEM SELECTION - premium glassmorphism layout
            <div className="h-full flex flex-col p-4 md:p-8 gap-6 md:gap-8 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-4 shrink-0 mt-2">
                <button onClick={() => {
                  setSelectedModule(null);
                  setSelectedSystem(null);
                  setSelectedSubSystem(null);
                  setSelectedBoard(null);
                  setIsChapterQuestionMode(false);
                  setShowQuestions(false);
                  setShowExplanation(false);
                }} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{selectedModule}</h2>
                  <p className="text-slate-500 text-sm mt-0.5 tracking-wide uppercase font-bold">Select a Chapter</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {[...(systems[selectedModule] || [])].sort((a, b) => {
                    const getPriority = (x: string) => {
                      if (x === 'تحديدات الاطفال') return 1;
                      if (x === 'معسكر الورقة الأولى') return 2;
                      if (x === 'Growth & development') return 3;
                      return 100;
                    };
                    const pA = getPriority(a);
                    const pB = getPriority(b);
                    if (pA !== pB) return pA - pB;
                    return a.localeCompare(b);
                  }).map(sys => {
                    const color = SYSTEM_COLORS[sys] || '#6366f1';
                    const count = boards.filter(b => b.module === selectedModule && b.system === sys).length;
                    
                    const SYSTEM_BGS: Record<string, string> = {
                      'تحديدات الاطفال': '/assets/chapters/tahdedat_bg.jpg',
                      'معسكر الورقة الأولى': '/assets/chapters/camp_bg.png',
                      'Cardiovascular diseases': '/assets/chapters/cardio_bg_1779636563389.png',
                      'Endocrinology': '/assets/chapters/endo_bg_1779636576095.png',
                      'Gastroenterology & hepatology': '/assets/chapters/gastro_bg_1779636588519.png',
                      'Genetic diseases': '/assets/chapters/genetic_bg_1779636605335.png',
                      'Growth & development': '/assets/chapters/growth_bg_1779636618747.png',
                      'Hematology & Oncology': '/assets/chapters/hemato_bg_1779636647999.png',
                      'Infections': '/assets/chapters/infect_bg_1779636662158.png',
                      'Neurology': '/assets/chapters/neuro_bg_1779636673967.png',
                      'Nutrition': '/assets/chapters/nutrition_bg_1779636686441.png',
                      'Renal diseases': '/assets/chapters/renal_bg_1779636699582.png',
                    };

                    const lwSys = sys.toLowerCase();
                    let SysIcon = Stethoscope;
                    if (sys === 'تحديدات الاطفال') SysIcon = Zap;
                    else if (lwSys.includes('cardio')) SysIcon = Heart;
                    else if (lwSys.includes('neuro')) SysIcon = Brain;
                    else if (lwSys.includes('gastro')) SysIcon = Apple;
                    else if (lwSys.includes('endo')) SysIcon = Target;
                    else if (lwSys.includes('genetic')) SysIcon = Dna;
                    else if (lwSys.includes('hematology')) SysIcon = Droplets;
                    else if (lwSys.includes('infect')) SysIcon = ShieldAlert;
                    else if (lwSys.includes('renal')) SysIcon = Activity;

                    return (
                      <button key={sys} onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (sys === 'Growth & development' || (selectedModule && isSpaceSubscribed(selectedModule))) {
                            if (sys === 'Growth & development') {
                              trackGrowthView();
                            }
                            setSelectedSystem(sys);
                            setSelectedSubSystem(null);
                            setIsChapterQuestionMode(false);
                            setShowQuestions(false);
                            setShowExplanation(false);
                            setSelectedBoard(null);
                          } else {
                            setShowSubscriptionModal(true);
                          }
                        }}
                        className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 active:border-white/20 hover:border-white/20 rounded-3xl text-left transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] overflow-hidden p-6 flex flex-col justify-between min-h-[160px] hover:shadow-2xl"
                      >
                        {(!selectedModule || !isSpaceSubscribed(selectedModule)) && sys !== 'Growth & development' && (
                          <div className="absolute top-4 right-4 z-10 bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Premium</span>
                          </div>
                        )}
                        {sys === 'تحديدات الاطفال' && (
                          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white border border-rose-400/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-lg shadow-rose-500/20">
                            <span className="text-[14px]">🔥</span>
                            <span className="text-xs font-black tracking-wider">رائج الآن</span>
                          </div>
                        )}
                        {/* Admin Views Counter */}
                        {userRole === 'admin' && sys === 'Growth & development' && (
                          <div className="absolute top-4 left-4 z-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold tracking-wider">{growthViews} Views</span>
                          </div>
                        )}
                        {/* AI Background Image */}
                        {SYSTEM_BGS[sys] && (
                          <div className="absolute inset-0 z-0">
                            <img src={SYSTEM_BGS[sys]} alt={sys} className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all duration-500 mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                          </div>
                        )}

                        {/* Gradient Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-3xl rounded-full z-0" style={{background: color, transform: 'translate(30%, -30%)'}} />
                        
                        <div className="relative z-10 flex justify-between items-start w-full">
                          {sys === 'تحديدات الاطفال' ? (
                            <div className="w-12 h-12"></div>
                          ) : (
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:-translate-y-1" style={{background: `linear-gradient(135deg, ${color}20, ${color}10)`, border: `1px solid ${color}40`, color: color}}>
                              <SysIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="relative z-10 mt-6">
                          <h3 className="text-white font-black text-lg leading-tight mb-1">
                            {sys === 'معسكر الورقة الأولى' ? 'معسكر الورقة الأولى ⚡' : sys}
                          </h3>
                          {sys !== 'معسكر الورقة الأولى' && (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{background: color, boxShadow: `0 0 10px ${color}`}} />
                              <p className="text-slate-400 text-xs font-semibold">{count} visual slides</p>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : selectedSystem === 'معسكر الورقة الأولى' ? (
            // --- CUSTOM CAMP DASHBOARD INSIDE FLASH SPACE ---
            <div className="h-full flex flex-col p-4 md:p-8 gap-6 md:gap-8 max-w-7xl mx-auto w-full relative" dir="rtl">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 shrink-0 mt-2">
                <div className="flex items-center gap-4">
                  <button onClick={() => {
                    setSelectedSystem(null);
                    setSelectedSubSystem(null);
                    setSelectedBoard(null);
                    setIsChapterQuestionMode(false);
                    setShowQuestions(false);
                    setShowExplanation(false);
                  }} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">معسكر الورقة الأولى للأطفال ⚡</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase mt-1">تصفح المعسكر المكثف مقسماً إلى 3 أيام</p>
                  </div>
                </div>
              </div>

              {/* View Tab Switcher */}
              <div className="flex justify-center gap-4 border-b border-white/5 pb-4 shrink-0">
                <button
                  onClick={() => setCampActiveTab('chapters')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all flex items-center gap-2",
                    campActiveTab === 'chapters' 
                      ? "bg-white/10 text-white border border-white/10" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <BookOpen className="w-4 h-4" /> الشباتر والملفات الدراسية
                </button>
                <button
                  onClick={() => setCampActiveTab('notebook')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all flex items-center gap-2",
                    campActiveTab === 'notebook' 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 animate-pulse" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <Pencil className="w-4 h-4" /> كشكول جدول المذاكرة (ToDo List)
                </button>
              </div>

              {campActiveTab === 'chapters' ? (
                <>
                  {/* Day Switcher */}
              <div className="flex justify-center gap-3 shrink-0 my-2">
                {[1, 2, 3].map((day) => (
                  <button
                    key={day}
                    onClick={() => setCampActiveDay(day)}
                    className={`px-6 py-3 rounded-2xl font-black text-sm md:text-base transition-all duration-300 shadow-md ${
                      campActiveDay === day 
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white scale-[1.04]'
                        : 'bg-slate-900/50 border border-white/5 text-slate-350 hover:bg-white/5'
                    }`}
                  >
                    اليوم {day === 1 ? 'الأول' : day === 2 ? 'الثاني' : 'الثالث'}
                  </button>
                ))}
              </div>

              {/* Grid of Chapter Slides */}
              <div className="flex-1 overflow-y-auto pb-8">
                {(() => {
                  const dayLabel = campActiveDay === 1 ? 'اليوم الأول' : campActiveDay === 2 ? 'اليوم الثاني' : 'اليوم الثالث';
                  const dayLabelEng = campActiveDay === 1 ? 'Day 1' : campActiveDay === 2 ? 'Day 2' : 'Day 3';
                  const campActiveSlides = (
                    campActiveDay === 1 ? [
                      { 
                        label: 'I. GROWTH AND DEVELOPMENT', 
                        subSystemKey: 'Growth & Development', 
                        arabic: 'النمو والتطور للأطفال',
                        gradient: 'from-amber-500 to-orange-500 bg-amber-500/10 text-amber-400' 
                      },
                      { 
                        label: 'II. NUTRITION', 
                        subSystemKey: 'Nutrition', 
                        arabic: 'التغذية العلاجية للأطفال',
                        gradient: 'from-emerald-500 to-teal-500 bg-emerald-500/10 text-emerald-400' 
                      },
                      { 
                        label: 'III. GIT', 
                        subSystemKey: 'GIT', 
                        arabic: 'الجهاز الهضمي للأطفال',
                        gradient: 'from-indigo-500 to-blue-500 bg-indigo-500/10 text-indigo-400' 
                      },
                      { 
                        label: 'IV. GENETIC DISEASES', 
                        subSystemKey: 'Genetics', 
                        arabic: 'الأمراض الوراثية للأطفال',
                        gradient: 'from-rose-500 to-pink-500 bg-rose-500/10 text-rose-400' 
                      }
                    ] : campActiveDay === 2 ? [
                      { 
                        label: 'V. ENDOCRINOLOGY', 
                        subSystemKey: 'Endocrinology', 
                        arabic: 'الغدد الصماء للأطفال',
                        gradient: 'from-violet-500 to-fuchsia-500 bg-violet-500/10 text-violet-400' 
                      },
                      { 
                        label: 'VI. HEMATOLOGY AND ONCOLOGY', 
                        subSystemKey: 'Hematology & Oncology', 
                        arabic: 'أمراض الدم والأورام للأطفال',
                        gradient: 'from-red-500 to-rose-500 bg-red-500/10 text-red-400' 
                      }
                    ] : [
                      { 
                        label: 'VII. CVS', 
                        subSystemKey: 'CVS', 
                        arabic: 'القلب والأوعية الدموية للأطفال',
                        gradient: 'from-amber-500 to-orange-500 bg-amber-500/10 text-amber-400' 
                      },
                      { 
                        label: 'VIII. CNS', 
                        subSystemKey: 'CNS', 
                        arabic: 'الجهاز العصبي والالتهابات للأطفال',
                        gradient: 'from-indigo-500 to-cyan-500 bg-indigo-500/10 text-indigo-400' 
                      }
                    ]
                  );

                  if (campActiveSlides.length === 0) {
                    return (
                      <div className="py-16 text-center bg-slate-900/30 backdrop-blur-md rounded-[2rem] border border-dashed border-white/5 space-y-3">
                        <p className="text-base font-black text-slate-300">سيتم إضافة محتوى {dayLabel} قريباً 📚</p>
                        <p className="text-xs text-slate-500 font-bold">يرجى متابعة التحديثات القادمة للمعسكر المتميز.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {campActiveSlides.map((item, idx) => {
                        const slideCount = boards.filter(b => 
                          b.system === 'تحديدات الاطفال' && 
                          b.subSystem === item.subSystemKey
                        ).length;

                        return (
                          <div 
                            key={idx}
                            onClick={() => {
                              setSelectedSystem('تحديدات الاطفال');
                              setSelectedSubSystem(item.subSystemKey);
                            }}
                            className="group bg-slate-900/50 backdrop-blur-xl border border-white/5 hover:border-indigo-500/40 rounded-3xl p-6 shadow-lg active:scale-[0.98] hover:scale-[1.01] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px]"
                          >
                            <div className="space-y-3 text-right">
                              <div className="flex items-center justify-between">
                                <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full ${item.gradient}`}>
                                  {slideCount} ملفات تفاعلية
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">تحديدات الاطفال</span>
                              </div>
                              <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors leading-snug font-mono tracking-wide uppercase">
                                {item.label}
                              </h3>
                            </div>
                            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6 text-xs font-black text-slate-400 group-hover:text-amber-400 transition-colors">
                              <span className="transform group-hover:translate-x-[-6px] transition-transform">← افتح محتوى الشابتر بالأسئلة والتحديدات كاملة</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* PDFs and Timed Matching Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-10">
                  {/* PDF Center */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center gap-3 text-right">
                      <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">تحميل ملفات الـ PDF</h3>
                        <p className="text-xs text-slate-400 font-semibold">تنزيل مذكرات وأسئلة المعسكر التفاعلية.</p>
                      </div>
                    </div>

                    <div className="py-8 text-center bg-slate-950/40 rounded-2xl border border-dashed border-white/5 space-y-2">
                      <p className="text-xs font-black text-slate-350">سيتم إضافة مذكرات التحميل قريباً 📚</p>
                      <p className="text-[10px] text-slate-500 font-bold">يمكنك تحميل مذكرات المراجعة والأسئلة فور رفعها.</p>
                    </div>
                  </div>

                  {/* Timed Test */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3 text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">اختبار التوصيل التفاعلي</h3>
                          <p className="text-xs text-slate-400 font-semibold">اختبار توصيل ذكي مدمج مثل بقية الشباتر.</p>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold">نظام الاختبار</p>
                          <p className="text-xs font-black text-slate-200">حل فوري وإرسال لكل سؤال بنظام الماتشينج الأصلي</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => {
                          const campSlides = boards.filter(b => b.module === 'Pediatrics' && b.system === 'معسكر الورقة الأولى');
                          const campQuestions = campSlides.flatMap(board => {
                            const diseaseKey = (board.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                            return getQuestionsForKey(diseaseKey);
                          });
                          const generalQuestions = getQuestionsForKey(`_CHAPTER_معسكر الورقة الأولى`);
                          const matchingQs = [...campQuestions, ...generalQuestions].filter(q => q.type === 'matching' || q.front.toLowerCase().startsWith('match'));
                          
                          if (matchingQs.length === 0) {
                            toast.error('سيتم إضافة أسئلة اختبار التوصيل لهذا المعسكر قريباً!');
                            return;
                          }
                          
                          setIsChapterQuestionMode(true);
                          setShowQuestions(true);
                          setShowExplanation(false);
                          setActiveCategory('Matching');
                          startQuestionSession(matchingQs);
                        }}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg active:scale-[0.98] hover:scale-[1.01]"
                      >
                        ابدأ اختبار التوصيل الآن
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto pb-8">
              <CampNotebookToDo />
            </div>
          )}
          </div>
          ) : selectedSystem === 'تحديدات الاطفال' && !selectedSubSystem ? (
            // --- SUB-SYSTEM SELECTION FOR TAHDEDAT ---
            <div className="h-full flex flex-col p-4 md:p-8 gap-6 md:gap-8 max-w-7xl mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mt-2">
                <div className="flex items-center gap-4">
                  <button onClick={() => {
                    setSelectedSystem(null);
                    setSelectedSubSystem(null);
                    setSelectedBoard(null);
                    setIsChapterQuestionMode(false);
                    setShowQuestions(false);
                    setShowExplanation(false);
                  }} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 border border-white/5">
                      {selectedModule} <ChevronRight className="w-3 h-3 mx-1" /> تحديدات الاطفال
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Choose a Chapter</h2>
                    <p className="text-slate-500 text-sm mt-0.5 tracking-wide uppercase font-bold">Select a Chapter</p>
                  </div>
                </div>
                
                {/* Download PDF Button */}
                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-indigo-400/20"
                >
                  <Download className="w-5 h-5" />
                  <span>تنزيل تجميعة الـ PDF</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {Array.from(new Set(boards.filter(b => b.system === 'تحديدات الاطفال').map(b => b.subSystem))).filter(Boolean).sort().map(subSys => {
                    if (!subSys) return null;
                    const color = '#6366f1';
                    
                    const SYSTEM_BGS: Record<string, string> = {
                      'CVS': '/assets/chapters/cardio_bg_1779636563389.png',
                      'Endocrinology': '/assets/chapters/endo_bg_1779636576095.png',
                      'GIT': '/assets/chapters/gastro_bg_1779636588519.png',
                      'Genetics': '/assets/chapters/genetic_bg_1779636605335.png',
                      'Growth & Development': '/assets/chapters/growth_bg_1779636618747.png',
                      'Hematology & Oncology': '/assets/chapters/hemato_bg_1779636647999.png',
                      'Infection': '/assets/chapters/infect_bg_1779636662158.png',
                      'Neurology': '/assets/chapters/neuro_bg_1779636673967.png',
                      'Nutrition': '/assets/chapters/nutrition_bg_1779636686441.png',
                    };

                    const lwSys = subSys.toLowerCase();
                    let SysIcon = Stethoscope;
                    if (lwSys.includes('cvs')) SysIcon = Heart;
                    else if (lwSys.includes('neuro')) SysIcon = Brain;
                    else if (lwSys.includes('git')) SysIcon = Apple;
                    
                    return (
                      <button
                        key={subSys}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubSystem(subSys);
                        }}
                        className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 active:border-white/20 hover:border-white/20 rounded-3xl text-left transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] overflow-hidden p-6 flex flex-col justify-between min-h-[160px] hover:shadow-2xl"
                      >
                        {SYSTEM_BGS[subSys] && (
                          <div className="absolute inset-0 z-0">
                            <img src={SYSTEM_BGS[subSys]} alt={subSys} className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all duration-500 mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                          </div>
                        )}

                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-3xl rounded-full z-0" style={{background: color, transform: 'translate(30%, -30%)'}} />
                        
                        <div className="relative z-10 flex justify-between items-start w-full">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/90 border border-white/20 shadow-inner group-hover:-translate-y-1 transition-transform duration-300">
                            <SysIcon className="w-6 h-6 drop-shadow-md" />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-indigo-500 group-hover:border-indigo-400 group-hover:text-white transition-all duration-300">
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                          </div>
                        </div>

                        <div className="relative z-10 mt-6">
                          <h3 className="text-xl font-black text-white/90 leading-tight group-hover:text-white transition-colors">{subSys}</h3>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // BOARD/SLIDE SELECTION - premium glassmorphism layout
            <div className="h-full flex flex-col p-4 md:p-8 gap-6 md:gap-8 max-w-7xl mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mt-2">
                <div className="flex items-center gap-4">
                  <button onClick={() => {
                    if (selectedSystem === 'تحديدات الاطفال' && selectedSubSystem) {
                      setSelectedSubSystem(null);
                    } else {
                      setSelectedSystem(null);
                    }
                    setSelectedBoard(null);
                    setIsChapterQuestionMode(false);
                    setShowQuestions(false);
                    setShowExplanation(false);
                  }} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{selectedSystem}</h2>
                    <p className="text-slate-500 text-sm mt-0.5 tracking-wide uppercase font-bold">{boards.filter(b => b.module === selectedModule && b.system === selectedSystem).length} Slides Available</p>
                  </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-black">
                    ⭐ {userData?.points ?? 0}
                  </div>
                  <button
                    onClick={() => setIsReviewCenterOpen(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    مركز المراجعة
                  </button>
                </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pb-8">
                {isChapterQuestionMode ? (
                  // --- CHAPTER QUESTIONS TAB - Flashcard Session ---
                  (() => {
                    const chapterSlides = boards.filter(b => b.module === selectedModule && b.system === selectedSystem && matchesSubSystem(b.subSystem, selectedSubSystem));
                    const chapterQuestions = selectedSystem === 'تحديدات الاطفال' ? [] : chapterSlides.flatMap(board => {
                      const diseaseKey = (board.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                      return getQuestionsForKey(diseaseKey);
                    });
                    const generalQuestions = getQuestionsForKey(`_CHAPTER_${selectedSystem}`);
                    const subChapterQuestions = selectedSubSystem ? getQuestionsForKey(`_SUBCHAPTER_${selectedSubSystem}`) : [];
                    const allQuestions = [...chapterQuestions, ...generalQuestions, ...subChapterQuestions];

                    const isNeuroChapter = selectedSystem === 'Neurology';
                    const hasNeuroCategories = isNeuroChapter && allQuestions.some(q => (q as any).category);

                    const getFilteredQuestions = (cat: string) => {
                      let filtered = allQuestions;
                      if (cat === 'previous_years') {
                        filtered = allQuestions.filter(q => (q as any).category === 'previous_years');
                      } else if (cat === 'clinoma') {
                        filtered = allQuestions.filter(q => (q as any).category === 'clinoma');
                      } else if (cat !== 'All') {
                        filtered = allQuestions.filter(q => {
                          if (cat === 'Definitions') return q.front.toLowerCase().startsWith('define');
                          if (cat === 'Enumerate') return q.front.toLowerCase().startsWith('enumerate');
                          if (cat === 'Cases') return q.front.toLowerCase().startsWith('case');
                          if (cat === 'Matching') return q.front.toLowerCase().startsWith('match') || q.type === 'matching';
                          return true;
                        });
                      }
                      return groupCases(filtered);
                    };

                    const CategoryTabs = () => (
                      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 w-full max-w-2xl mx-auto border-b border-slate-100 pb-3">
                        {(hasNeuroCategories
                          ? ['previous_years', 'clinoma']
                          : ['All', 'Definitions', 'Enumerate', 'Matching', 'Cases']
                        ).map(cat => {
                          const count = getFilteredQuestions(cat).length;
                          const label = cat === 'previous_years' ? '📅 السنين السابقة' : cat === 'clinoma' ? '⭐ أسئلة Clinoma' : cat;
                          const activeColor = cat === 'previous_years' ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : cat === 'clinoma' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-indigo-500 text-white shadow-md';
                          return (
                            <button
                              key={cat}
                              onClick={() => {
                                setActiveCategory(cat);
                                const newQs = getFilteredQuestions(cat);
                                if (newQs.length > 0) startQuestionSession(newQs);
                                else { setQQueue([]); setQDone([]); setQSessionDone(false); }
                              }}
                              className={`px-5 py-2.5 flex items-center gap-2 rounded-full text-sm font-bold transition-all ${
                                activeCategory === cat ? activeColor : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {label}
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeCategory === cat ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    );

                    const questions = qQueue.concat(qDone); // Total questions in this session
                    const totalQ = qDone.length + qQueue.length;
                    const currentCard = qQueue[0];

                    if (questions.length === 0 && allQuestions.length > 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                          <CategoryTabs />
                          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                            <Brain className="w-10 h-10 text-slate-400" />
                          </div>
                          <h3 className="text-2xl font-black text-slate-800 mb-2">No Questions in this Category</h3>
                          <p className="text-slate-400">Please select another category.</p>
                        </div>
                      );
                    }

                    if (questions.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                            <Brain className="w-8 h-8 text-emerald-300" />
                          </div>
                          <p className="font-black text-slate-400 text-lg">Questions Coming Soon</p>
                          <p className="text-slate-300 text-sm mt-2">Questions for this chapter are being prepared</p>
                        </div>
                      );
                    }

                    if (qSessionDone) {
                      // Session complete
                      return (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                          <div className="text-6xl mb-6">🎉</div>
                          <h3 className="text-3xl font-black text-slate-800 mb-2">Session Complete!</h3>
                          <p className="text-slate-400 mb-8">You've mastered all {questions.length} questions</p>
                          <div className="grid grid-cols-3 gap-4 mb-10 w-full max-w-sm">
                            <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                              <p className="text-2xl font-black text-emerald-600">{qDone.length}</p>
                              <p className="text-xs font-bold text-emerald-500 mt-1">Easy</p>
                            </div>
                            <div className="bg-amber-50 rounded-2xl p-4 text-center">
                              <p className="text-2xl font-black text-amber-600">{qRepeatCount}</p>
                              <p className="text-xs font-bold text-amber-500 mt-1">Repeated</p>
                            </div>
                            <div className="bg-rose-50 rounded-2xl p-4 text-center">
                              <p className="text-2xl font-black text-rose-600">{qHardCount}</p>
                              <p className="text-xs font-bold text-rose-500 mt-1">Hard</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => startQuestionSession(getFilteredQuestions(activeCategory))}
                              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all"
                            >
                              Restart Session
                            </button>
                            <button
                              onClick={() => {
                                setIsChapterQuestionMode(false);
                                setShowQuestions(false);
                                setShowExplanation(false);
                                setSelectedBoard(null);
                              }}
                              className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black hover:border-slate-300 hover:bg-slate-50 transition-all"
                            >
                              Back to Chapter
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Active flashcard
                    return (
                      <div className="flex flex-col items-center justify-between h-full py-4 px-2 md:px-6 max-w-5xl mx-auto">
                        <CategoryTabs />
                        {/* Header Controls */}
                        <div className="w-full flex items-center justify-between mb-4">
                          <button
                            onClick={() => setIsChapterQuestionMode(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                          >
                            <ChevronLeft className="w-4 h-4" /> Exit
                          </button>
                          <h3 className="font-black text-indigo-600">Chapter Questions</h3>
                        </div>

                        {/* Progress */}
                        <div className="w-full space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-400">
                            <span>{qDone.length} done</span>
                            <span>{qQueue.length} remaining</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                              style={{width: `${totalQ > 0 ? (qDone.length / totalQ) * 100 : 0}%`}}
                            />
                          </div>
                        </div>

                        {/* Flashcard */}
                        <div className="w-full flex-1 flex items-center justify-center py-4 md:py-8">
                          <div
                            className="flashcard-container w-full max-w-3xl lg:max-w-4xl"
                            style={{perspective: '1200px'}}
                          >
                            <div
                              className="flashcard relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[550px]"
                              style={{
                                transformStyle: 'preserve-3d',
                                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                              }}
                            >
                              {/* Front */}
                              {currentCard?.type === 'case' ? (
                                <CaseStudyUI question={currentCard} onComplete={() => rateCard('easy')} currentPriority={spacePriorities[currentCard.id]} onSetPriority={(p) => handleSetPriority(currentCard.id, p)} />
                              ) : currentCard?.type === 'matching' ? (
                                <MatchingGameUI question={currentCard} onComplete={() => setIsCardFlipped(true)} />
                              ) : (
                                <div
                                  className="absolute inset-0 flex flex-col items-center justify-center p-5 sm:p-8 md:p-12 bg-white rounded-3xl border-2 border-slate-100 shadow-xl cursor-pointer"
                                  style={{backfaceVisibility: 'hidden'}}
                                  onClick={() => !isCardFlipped && setIsCardFlipped(true)}
                                >
                                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 shrink-0">
                                    <span className="text-indigo-500 font-black text-sm md:text-base">Q</span>
                                  </div>
                                  <div className="flex-1 w-full flex items-center justify-center overflow-y-auto custom-scrollbar pr-2">
                                    <p className={`text-slate-800 font-black leading-relaxed whitespace-pre-line w-full ${(currentCard?.front?.length || 0) > 100 ? 'text-sm sm:text-base lg:text-lg text-left' : 'text-lg sm:text-xl md:text-2xl lg:text-3xl text-center'}`} dir="auto">{currentCard?.front}</p>
                                  </div>
                                  {!isCardFlipped && (
                                    <p className="text-slate-300 text-xs md:text-sm mt-4 font-bold uppercase tracking-widest shrink-0">Tap to reveal answer</p>
                                  )}
                                </div>
                              )}
                              {/* Back */}
                              <div
                                className="absolute inset-0 flex flex-col items-center justify-center p-5 sm:p-8 md:p-12 bg-indigo-50 rounded-3xl border-2 border-indigo-100 shadow-xl"
                                style={{backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}
                              >
                                {currentCard?.type === 'case' ? null : currentCard?.type === 'matching' ? (
                                  <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                                      <span className="text-3xl">🎉</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Perfect Match!</h3>
                                    <p className="text-slate-500 font-bold text-sm md:text-base">You successfully connected all terms.</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 md:mb-6 shrink-0">
                                      <span className="text-white font-black text-sm md:text-base">A</span>
                                    </div>
                                    <div className="flex-1 w-full flex items-center justify-center overflow-y-auto custom-scrollbar pr-2">
                                      <p className={`text-slate-800 font-black leading-relaxed whitespace-pre-line w-full ${(currentCard?.back?.length || 0) > 100 ? 'text-sm sm:text-base lg:text-lg text-left' : 'text-base sm:text-lg md:text-xl lg:text-2xl text-center'}`} dir="auto">{currentCard?.back}</p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rating Buttons */}
                        {isCardFlipped ? (
                          <div className="w-full space-y-3">
                            <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-3">How well did you know this?</p>
                            <div className="grid grid-cols-3 gap-2 md:gap-3">
                              <button
                                onClick={() => rateCard('hard')}
                                className="py-3 md:py-4 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-2xl font-black text-xs md:text-sm transition-all hover:scale-105 active:scale-95 border-2 border-rose-100 hover:border-rose-500"
                              >
                                🔴 Hard
                              </button>
                              <button
                                onClick={() => setIsCardFlipped(false)}
                                className="py-3 md:py-4 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white rounded-2xl font-black text-xs md:text-sm transition-all hover:scale-105 active:scale-95 border-2 border-amber-100 hover:border-amber-500"
                              >
                                ↩️ Return Question
                              </button>
                              <button
                                onClick={() => rateCard('easy')}
                                className="py-3 md:py-4 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-2xl font-black text-xs md:text-sm transition-all hover:scale-105 active:scale-95 border-2 border-emerald-100 hover:border-emerald-500"
                              >
                                🟢 Easy
                              </button>
                            </div>
                          </div>
                        ) : (
                          currentCard?.type === 'case' ? null : currentCard?.type === 'matching' ? (
                            <div className="py-4 opacity-50 select-none pointer-events-none">
                              <p className="text-center font-bold text-slate-400 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></span>
                                Match all pairs to continue
                              </p>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsCardFlipped(true)}
                              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg"
                            >
                              Reveal Answer
                            </button>
                          )
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {boards.filter(b => b.module === selectedModule && b.system === selectedSystem && matchesSubSystem(b.subSystem, selectedSubSystem)).map(board => (
                    <button
                      key={board.id}
                      onClick={() => { setSelectedBoard(board); setIsTimerActive(true); setPaths([]); setRedoPaths([]); }}
                      className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 active:border-indigo-500/50 hover:border-indigo-500/40 rounded-3xl overflow-hidden transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] text-left flex flex-col hover:shadow-2xl hover:shadow-indigo-500/20"
                    >
                      <div className="flex-1 overflow-hidden bg-black/40 relative aspect-video">
                        <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 mix-blend-overlay" />
                        <img src={board.medicalImage} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        
                        {/* Play Icon overlay */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                          <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center backdrop-blur-sm shadow-xl">
                            <Play className="w-5 h-5 ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:p-5 shrink-0 bg-gradient-to-t from-slate-900/80 to-transparent">
                        <h5 className="font-black text-white text-sm md:text-base leading-snug line-clamp-2 drop-shadow-md">{board.disease}</h5>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                          <span className="text-slate-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Study Mode</span>
                        </div>
                      </div>
                    </button>
                  ))}
                    <button
                      onClick={() => {
                        const chapterSlides = (selectedSystem === 'تحديدات الاطفال' && selectedSubSystem)
                          ? boards.filter(b => b.system === selectedSystem && matchesSubSystem(b.subSystem, selectedSubSystem))
                          : boards.filter(b => b.module === selectedModule && b.system === selectedSystem);
                        
                        const chapterQuestions = selectedSystem === 'تحديدات الاطفال' ? [] : chapterSlides.flatMap(board => {
                          const diseaseKey = (board.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                          return getQuestionsForKey(diseaseKey);
                        });
                        
                        const generalQuestions = getQuestionsForKey(`_CHAPTER_${selectedSystem}`);
                        const subChapterQuestions = selectedSubSystem ? getQuestionsForKey(`_SUBCHAPTER_${selectedSubSystem}`) : [];
                        
                        const allQuestions = (selectedSystem === 'تحديدات الاطفال' && selectedSubSystem)
                          ? [...subChapterQuestions]
                          : [...chapterQuestions, ...generalQuestions];

                        if (allQuestions.length > 0) {
                          startQuestionSession(allQuestions);
                          setIsChapterQuestionMode(true);
                        } else {
                          toast.error('No questions available for this section yet');
                        }
                      }}
                      className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 active:border-emerald-500/50 hover:border-emerald-500/40 rounded-3xl overflow-hidden transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] text-left flex flex-col hover:shadow-2xl hover:shadow-emerald-500/20"
                    >
                      <div className="flex-1 overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 relative aspect-video flex flex-col items-center justify-center">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 mix-blend-overlay" />
                        <Brain className="w-16 h-16 text-white/90 drop-shadow-lg transition-transform duration-700 group-hover:scale-110" />
                        
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                          <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center backdrop-blur-sm shadow-xl">
                            <Brain className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:p-5 shrink-0 bg-gradient-to-t from-slate-900/80 to-transparent">
                        <h5 className="font-black text-white text-sm md:text-base leading-snug drop-shadow-md">Practice All Questions</h5>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                          <p className="text-emerald-400 font-bold text-[10px] md:text-xs tracking-wider uppercase">Quiz Mode</p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Session Summary Modal */}
        {showSummary && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-4">
            <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-12 text-center space-y-8 shadow-3xl animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto">
                <Trophy className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800">أحسنت! 🎉</h2>
                <p className="text-slate-400 mt-2">انتهت جلسة الدراسة</p>
              </div>
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block mb-1">وقت الجلسة</span>
                <span className="text-4xl font-black text-emerald-700">{Math.floor(sessionSeconds/60)}m {sessionSeconds%60}s</span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSummary(false);
                    setSelectedBoard(null);
                    setIsTimerActive(false);
                    setSessionSeconds(0);
                    setPaths([]);
                    setRedoPaths([]);
                    setIsChapterQuestionMode(false);
                    setSelectedSubSystem(null);
                  }}
                  className="w-full py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black transition-all"
                >
                  لوحة أخرى
                </button>
                <button onClick={() => navigate('/dashboard')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all">
                  العودة للداشبورد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- REVIEW CENTER MODAL --- */}
        {isReviewCenterOpen && (
          <div className="fixed inset-0 z-[3000] bg-slate-950/95 backdrop-blur-2xl p-4 md:p-8 flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900/50 p-4 md:p-6 rounded-[2rem] border border-white/5 mb-6 gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button onClick={() => setIsReviewCenterOpen(false)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white">مركز المراجعة</h2>
                  <p className="text-slate-400 text-sm mt-1">{selectedSystem}</p>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex bg-slate-950/50 rounded-2xl p-1.5 border border-white/5 w-full md:w-auto">
                <button onClick={() => setReviewTab('images')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-sm transition-all ${reviewTab === 'images' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>الصور</button>
                <button onClick={() => setReviewTab('questions')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-sm transition-all ${reviewTab === 'questions' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>الأسئلة</button>
              </div>
            </div>

            {/* Priority Filter */}
            <div className="flex justify-center gap-4 md:gap-6 mb-8 shrink-0">
              {(['A', 'B', 'C'] as const).map(p => (
                <button 
                  key={p} onClick={() => setReviewFilter(p)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex flex-col items-center justify-center transition-all ${reviewFilter === p ? (p === 'A' ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30 scale-110' : p === 'B' ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30 scale-110' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-110') : 'bg-slate-900 border border-white/5 text-slate-500 hover:bg-slate-800 hover:text-white hover:scale-105'}`}
                >
                  <span className="text-2xl md:text-3xl font-black">{p}</span>
                </button>
              ))}
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
              {reviewTab === 'images' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 max-w-[1600px] mx-auto">
                  {boards
                    .filter(b => b.module === selectedModule && b.system === selectedSystem && spacePriorities[b.id] === reviewFilter)
                    .map(board => (
                      <div key={board.id} className="bg-slate-900 rounded-3xl overflow-hidden group cursor-pointer border border-white/5 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1" onClick={() => { setSelectedBoard(board); setIsReviewCenterOpen(false); }}>
                        <div className="aspect-[4/3] bg-black/50 relative overflow-hidden">
                          <img src={board.medicalImage} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                          <div className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg ${reviewFilter === 'A' ? 'bg-rose-500' : reviewFilter === 'B' ? 'bg-amber-500' : 'bg-emerald-500'}`}>{spacePriorities[board.id]}</div>
                          <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 text-white">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="p-4 md:p-5">
                          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">{board.disease}</h3>
                        </div>
                      </div>
                    ))
                  }
                  {boards.filter(b => b.module === selectedModule && b.system === selectedSystem && matchesSubSystem(b.subSystem, selectedSubSystem) && spacePriorities[b.id] === reviewFilter).length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
                      <Target className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-bold text-lg">لا توجد صور في هذه الأولوية</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                  {(() => {
                    try {
                      const chapterSlides = boards.filter(b => b.module === selectedModule && b.system === selectedSystem);
                      const chapterQuestions = selectedSystem === 'تحديدات الاطفال' ? [] : chapterSlides.flatMap(board => {
                        if (!board) return [];
                        const diseaseKey = (board.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                        return getQuestionsForKey(diseaseKey);
                      });
                      const generalQuestions = getQuestionsForKey(`_CHAPTER_${selectedSystem}`);
                      const allChapterQuestions = selectedSystem === 'تحديدات الاطفال'
                        ? (() => {
                            const subChapters = Array.from(new Set(boards
                              .filter(b => b.system === 'تحديدات الاطفال')
                              .map(b => b.subSystem)
                              .filter(Boolean)
                            ));
                            const subChapterQuestions = subChapters.flatMap(sub => getQuestionsForKey(`_SUBCHAPTER_${sub}`));
                            return groupCases(subChapterQuestions);
                          })()
                        : groupCases([...chapterQuestions, ...generalQuestions]);
                      
                      const filteredQs = allChapterQuestions.filter(q => q && spacePriorities[q.id] === reviewFilter);
                      
                      if (filteredQs.length === 0) {
                        return (
                          <div className="py-20 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-[3rem] border border-white/5">
                            <Brain className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-bold text-lg">لا توجد أسئلة في هذه الأولوية</p>
                          </div>
                        );
                      }

                      return filteredQs.map(q => (
                        <div key={q.id} className="bg-slate-900/80 p-5 md:p-6 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <span className="text-[10px] font-black text-indigo-400 mb-2 inline-block uppercase tracking-widest px-2 py-1 bg-indigo-500/10 rounded-md">{q.type || 'Flashcard'}</span>
                              <h3 className="text-white font-bold text-base md:text-lg leading-relaxed mb-3 whitespace-pre-wrap">{q.front}</h3>
                              {q.type === 'case' ? (
                                <div className="flex flex-col gap-2">
                                  {q.subQuestions?.map((sq: any, i: number) => (
                                    <div key={i} className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                      <p className="text-slate-300 text-sm leading-relaxed font-bold mb-2">Q: {sq.questionText}</p>
                                      <p className="text-indigo-300 text-sm leading-relaxed whitespace-pre-wrap">A: {typeof sq.back === 'string' ? sq.back : 'Multiple choices...'}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{typeof q.back === 'string' ? q.back : 'Multiple choices...'}</p>
                                </div>
                              )}
                            </div>
                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-lg ${reviewFilter === 'A' ? 'bg-rose-500' : reviewFilter === 'B' ? 'bg-amber-500' : 'bg-emerald-500'}`}>{spacePriorities[q.id]}</div>
                          </div>
                        </div>
                      ));
                    } catch (err) {
                      console.error(err);
                      return <div className="text-rose-500 p-8 font-bold">حدث خطأ أثناء تحميل الأسئلة.</div>;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Download PDF Modal */}
        {isDownloadModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => !downloadStatus && setIsDownloadModalOpen(false)} />
            <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <button 
                onClick={() => !downloadStatus && setIsDownloadModalOpen(false)} 
                disabled={!!downloadStatus}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30 shadow-inner">
                <Download className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2">تنزيل تجميعة الـ PDF</h2>
              <p className="text-slate-400 mb-6 font-medium leading-relaxed">
                سيتم توليد وتوقيع نسختك من التجميعة تلقائياً ببياناتك الأمنية (<strong className="text-white">{user?.displayName || userData?.name || "اسمك الشخصي"}</strong>) لمنع تسريب الملف.
              </p>
              
              {downloadStatus ? (
                // Progress View
                <div className="w-full space-y-4 py-4">
                  <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold animate-pulse text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{downloadStatus}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">
                    {downloadProgress}% Completed
                  </div>
                </div>
              ) : (
                // Options View
                <div className="w-full space-y-4">
                  <button
                    onClick={() => handleDownloadPDF(true)}
                    className="group relative w-full p-4 bg-slate-950/50 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-2xl text-left transition-all active:scale-[0.98] duration-300"
                  >
                    <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      موصى به
                    </div>
                    <div className="text-white font-black text-base flex items-center gap-2 mb-1">
                      <span>النسخة مضغوطة فائقة الجودة</span>
                    </div>
                    <div className="text-xs text-slate-400 font-bold leading-relaxed">
                      دقة 2K عالية جداً مع الاحتفاظ بكل تفاصيل الخطوط والنصوص الطبية. حجم صغير جداً (21.8 MB).
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleDownloadPDF(false)}
                    className="group w-full p-4 bg-slate-950/50 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl text-left transition-all active:scale-[0.98] duration-300"
                  >
                    <div className="text-white font-black text-base flex items-center gap-2 mb-1">
                      <span>النسخة الأصلية بالدقة الكاملة</span>
                    </div>
                    <div className="text-xs text-slate-400 font-bold leading-relaxed">
                      الملف الأصلي المصدر بجميع الصور بأعلى جودة تجميعية ممكنة. حجم كبير جداً (148.6 MB).
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Modal for Browse Screen */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSubscriptionModal(false)} />
            <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2">Premium Content</h2>
              <p className="text-slate-400 mb-6">Unlock all chapters and interactive boards for a complete learning experience.</p>
              
              <div className="bg-slate-950/50 rounded-2xl p-6 w-full mb-6 border border-white/5">
                <div className="text-4xl font-black text-white mb-2">50 EGP</div>
                <div className="text-sm font-bold text-amber-400 uppercase tracking-widest">Special prices for groups</div>
                
                <ul className="mt-6 space-y-3 text-left">
                  <li className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Comprehensive chapter boards</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Interactive learning tools</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited priority review access</span>
                  </li>
                </ul>
              </div>
              
              <div className="w-full space-y-3">
                <a 
                  href="https://wa.me/201039322938?text=أريد الاستفسار أكثر عن كورس pediatrics على flash space"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all shadow-lg shadow-[#25D366]/20"
                >
                  Subscribe via WhatsApp
                </a>
                <a 
                  href="https://t.me/Clinoma_Admins?text=أريد الاستفسار أكثر عن كورس pediatrics على flash space"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white transition-all shadow-lg shadow-[#0088cc]/20"
                >
                  Subscribe via Telegram
                </a>
                <button 
                  onClick={() => setShowSubscriptionModal(false)}
                  className="w-full py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- STUDY MODE (board selected) ----
  return (
    <div className="h-screen w-full bg-slate-100 flex overflow-hidden font-sans no-select">
      <CursorUI />

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[102] md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - Simple slides list for current system */}
      <div className={cn(
        "fixed md:relative top-0 bottom-0 left-0 h-full bg-white border-r border-slate-200 transition-all duration-500 z-[103] flex flex-col shadow-xl overflow-hidden",
        isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-64",
        isSidebarCollapsed ? "md:w-0" : "md:w-64"
      )}>
        {/* Sidebar header with back + close */}
        <div className="shrink-0 border-b border-slate-100">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
            <button
              onClick={triggerExitStudySession}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs transition-all group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Change System
            </button>
            <button onClick={() => { setIsSidebarOpen(false); setIsSidebarCollapsed(true); }} className="p-1.5 hover:bg-slate-200 rounded-lg transition-all">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current System</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{background: SYSTEM_COLORS[selectedBoard?.system || ''] || '#6366f1'}} />
              <p className="font-black text-slate-800 text-xs leading-tight">{selectedBoard?.system}</p>
            </div>
          </div>
        </div>

        {/* Slides list */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {(() => {
            const filteredBoards = boards.filter(b => b.module === selectedModule && b.system === selectedSystem);
            
            if (selectedSystem === 'تحديدات الاطفال') {
              const grouped = filteredBoards.reduce((acc, b) => {
                const sub = b.subSystem || 'Other';
                if (!acc[sub]) acc[sub] = [];
                acc[sub].push(b);
                return acc;
              }, {} as Record<string, typeof boards>);
              
              let globalIdx = 0;
              return Object.entries(grouped).map(([subSys, sysBoards]) => (
                <div key={subSys}>
                  <div className="bg-slate-100/80 px-4 py-2 sticky top-0 backdrop-blur-md border-y border-slate-200 z-10 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{subSys}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const generalQuestions = getQuestionsForKey(`_SUBCHAPTER_${subSys}`);
                        const allQuestions = [...generalQuestions];
                        if (allQuestions.length > 0) {
                          setSelectedBoard(null);
                          setPaths([]); 
                          setRedoPaths([]);
                          setShowQuestions(false);
                          setIsSidebarOpen(false);
                          if (selectedBoard) {
                            setSelectedModule(selectedBoard.module);
                            setSelectedSystem(selectedBoard.system);
                          }
                          setSelectedSubSystem(subSys);
                          startQuestionSession(allQuestions);
                          setIsChapterQuestionMode(true);
                        } else {
                          toast.error('No questions available for this sub-chapter yet');
                        }
                      }}
                      className="p-1 hover:bg-emerald-100 rounded text-emerald-500 transition-colors"
                      title={`Practice ${subSys}`}
                    >
                      <Brain className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {sysBoards.map((board) => {
                    globalIdx++;
                    return (
                      <button
                        key={board.id}
                        onClick={() => { setSelectedBoard(board); setIsSidebarOpen(false); setPaths([]); setRedoPaths([]); setShowExplanation(false); setShowQuestions(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all border-b border-slate-50",
                          selectedBoard?.id === board.id
                            ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <span className={cn("text-[10px] font-black w-5 shrink-0", selectedBoard?.id === board.id ? "text-indigo-500" : "text-slate-300")}>{globalIdx}</span>
                        <span className={cn("text-[11px] font-bold leading-snug line-clamp-2", selectedBoard?.id === board.id ? "text-indigo-700" : "text-slate-500")}>{board.disease}</span>
                      </button>
                    )
                  })}
                </div>
              ));
            }

            return filteredBoards.map((board, idx) => (
              <button
                key={board.id}
                onClick={() => { setSelectedBoard(board); setIsSidebarOpen(false); setPaths([]); setRedoPaths([]); setShowExplanation(false); setShowQuestions(false); }}
                className={cn(
                  "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all border-b border-slate-50",
                  selectedBoard?.id === board.id
                    ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                    : "hover:bg-slate-50"
                )}
              >
                <span className={cn("text-[10px] font-black w-5 shrink-0", selectedBoard?.id === board.id ? "text-indigo-500" : "text-slate-300")}>{idx + 1}</span>
                <span className={cn("text-[11px] font-bold leading-snug line-clamp-2", selectedBoard?.id === board.id ? "text-indigo-700" : "text-slate-500")}>{board.disease}</span>
              </button>
            ));
          })()}
          {selectedBoard?.system !== 'تحديدات الاطفال' && (
          <button
            onClick={() => {
              const chapterSlides = boards.filter(b => b.module === selectedBoard?.module && b.system === selectedBoard?.system);
              const chapterQuestions = chapterSlides.flatMap(board => {
                const diseaseKey = (board.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                return getQuestionsForKey(diseaseKey);
              });
              const generalQuestions = getQuestionsForKey(`_CHAPTER_${selectedBoard?.system}`);
              const allQuestions = [...chapterQuestions, ...generalQuestions];
              if (allQuestions.length > 0) {
                // Exit study mode and enter chapter question mode
                setSelectedBoard(null);
                setPaths([]); 
                setRedoPaths([]);
                setShowQuestions(false);
                setIsSidebarOpen(false);
                // We need to set selectedModule and selectedSystem so the chapter question view can render
                if (selectedBoard) {
                  setSelectedModule(selectedBoard.module);
                  setSelectedSystem(selectedBoard.system);
                }
                startQuestionSession(allQuestions);
                setIsChapterQuestionMode(true);
              } else {
                toast.error('No questions available for this chapter yet');
              }
            }}
            className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all hover:bg-emerald-50 mt-2 border-t border-slate-100"
          >
            <div className="w-5 shrink-0 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Practice Chapter</span>
          </button>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-12 md:h-14 bg-white border-b border-slate-200 px-2 md:px-3 flex items-center justify-between z-50 shrink-0 gap-1.5">
          {/* Left: menu + end */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => { setIsSidebarOpen(true); setIsSidebarCollapsed(false); }}
              className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-500 transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={triggerExitStudySession}
              className="p-2 bg-rose-50 text-rose-500 active:bg-rose-100 hover:bg-rose-100 rounded-xl transition-all"
              title="End session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Center: title - hidden on small screens */}
          <div className="text-center hidden sm:block min-w-0 flex-1 mx-2">
            <p className="font-black text-slate-800 text-xs line-clamp-1">{selectedBoard?.disease}</p>
          </div>

          {/* Right: Drawing Tools - scrollable on mobile */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-visible">
            {/* Tools Palette */}
            <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-xl border border-slate-200">
              {[
                { id: 'laser', icon: Zap, label: 'ليزر' },
                { id: 'pan', icon: Hand, label: 'تحريك' },
              ].map(tool => (
                <div key={tool.id} className="relative">
                  <button
                    onClick={() => {
                      setActiveTool(tool.id as Tool);
                      if (tool.id !== 'pan') {
                        setShowSettingsFor(showSettingsFor === tool.id ? null : tool.id as Tool);
                      } else {
                        setShowSettingsFor(null);
                      }
                    }}
                    title={tool.label}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      activeTool === tool.id
                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <tool.icon className="w-4 h-4" />
                  </button>
                  {showSettingsFor === tool.id && (
                    <div className="absolute top-full mt-3 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 w-56 z-[2000] animate-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                            <span>الحجم</span>
                            <span className="text-indigo-500">{toolSettings[tool.id as Tool].size}px</span>
                          </div>
                          <input type="range" min="1" max="100" value={toolSettings[tool.id as Tool].size}
                            onChange={e => updateSetting(tool.id as Tool, 'size', parseInt(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        {tool.id === 'highlighter' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                              <span>الشفافية</span>
                              <span className="text-indigo-500">{Math.round(toolSettings.highlighter.opacity * 100)}%</span>
                            </div>
                            <input type="range" min="0.1" max="1" step="0.1" value={toolSettings.highlighter.opacity}
                              onChange={e => updateSetting('highlighter', 'opacity', parseFloat(e.target.value))}
                              className="w-full accent-indigo-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        )}
                        {tool.id !== 'eraser' ? (
                          <div className="flex gap-2 flex-wrap">
                            {['#6366f1','#ef4444','#10b981','#f59e0b','#1e293b','#ec4899','#0ea5e9','#f97316'].map(c => (
                              <button key={c} onClick={() => updateSetting(tool.id as Tool, 'color', c)}
                                className={cn("w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                                  toolSettings[tool.id as Tool].color === c ? "border-slate-800 scale-110" : "border-transparent"
                                )}
                                style={{backgroundColor: c}}
                              />
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (window.confirm('مسح كل الرسومات؟')) {
                                setPaths([]); setRedoPaths([]); fadingLasersRef.current = [];
                                setShowSettingsFor(null); toast.success('تم مسح اللوحة');
                              }
                            }}
                            className="w-full py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all"
                          >
                            <Trash2 className="w-4 h-4" /> مسح الكل
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button onClick={() => { if(paths.length > 0) { setRedoPaths(p => [...p, paths[paths.length-1]]); setPaths(p => p.slice(0,-1)); } }} className="p-2 text-slate-400 hover:text-slate-700 transition-all rounded-lg hover:bg-white">
                <Undo2 className="w-4 h-4" />
              </button>
              <button onClick={() => { if(redoPaths.length > 0) { setPaths(p => [...p, redoPaths[redoPaths.length-1]]); setRedoPaths(p => p.slice(0,-1)); } }} className="p-2 text-slate-400 hover:text-slate-700 transition-all rounded-lg hover:bg-white">
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-600 hidden sm:block" />
              <span className="text-xs font-black text-emerald-700 tabular-nums w-10 text-center">
                {Math.floor(sessionSeconds/60)}:{(sessionSeconds%60).toString().padStart(2,'0')}
              </span>
              <button onClick={() => setIsTimerActive(!isTimerActive)} className="p-0.5 bg-white rounded-md shadow-sm text-emerald-600">
                {isTimerActive ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              </button>
            </div>

            {/* Priority Selector (Compact) */}
            <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 mr-1 hidden sm:block">Priority</span>
              {(['A', 'B', 'C'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => handleSetPriority(selectedBoard.id, spacePriorities[selectedBoard.id] === p ? null : p)}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black transition-all ${spacePriorities[selectedBoard.id] === p ? (p === 'A' ? 'bg-rose-500 text-white shadow-md' : p === 'B' ? 'bg-amber-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md') : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-200">
          <div className="relative w-full h-full bg-white m-3 md:m-5 rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex items-center justify-center">
            <div
              className={cn("relative", activeTool !== 'pan' && "transition-transform duration-100")}
              style={{transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`}}
            >
                  <img src={selectedBoard.medicalImage} alt="" className="max-w-full max-h-[85vh] pointer-events-none select-none" draggable={false} />
              <canvas
                ref={bgCanvasRef}
                width={2500} height={1800}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              <svg viewBox="0 0 2500 1800" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ overflow: 'visible' }}>
                {laserPaths.map(p => (
                  <g key={p.id} className="animate-fade-out">
                    <path
                      d={`M ${p.points.map(pt => `${pt.x},${pt.y}`).join(' L ')}`}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={p.size * 1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: `drop-shadow(0 0 12px ${p.color}) drop-shadow(0 0 6px ${p.color})` }}
                    />
                    <path
                      d={`M ${p.points.map(pt => `${pt.x},${pt.y}`).join(' L ')}`}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={p.size / 2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: `drop-shadow(0 0 2px #ffffff)` }}
                    />
                  </g>
                ))}
                
                {/* Live Laser Layer */}
                <g>
                  <path id="live-laser-outer" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path id="live-laser-inner" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 2px #ffffff)` }} />
                </g>
              </svg>
              <canvas
                ref={canvasRef}
                width={2500} height={1800}
                onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
                onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
                className={cn(
                  "absolute inset-0 w-full h-full touch-none z-[100]",
                  activeTool === 'pan' ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
                )}
                style={{ touchAction: 'none' }}
              />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
              {/* Notes + MCQ buttons */}
              <div className="flex items-center bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
                <button
                  onClick={() => { setShowExplanation(true); setShowQuestions(false); setActiveNoteTab('notes'); }}
                  className="px-5 py-3 text-white hover:bg-indigo-600 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest border-r border-white/10"
                >
                  <FileText className="w-4 h-4" />
                  Notes
                </button>
                <button
                  onClick={() => { setShowExplanation(true); setShowQuestions(true); setActiveNoteTab('questions'); if (qQueue.length === 0 && !qSessionDone) { const diseaseKey = (selectedBoard?.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim(); const imgQs = getQuestionsForKey(diseaseKey); const qs = groupCases([...imgQs]); if (qs.length > 0) startQuestionSession(qs); } }}
                  className="px-5 py-3 text-white hover:bg-emerald-600 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                >
                  <Brain className="w-4 h-4" />
                  Questions
                </button>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-xl">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="text-slate-400 hover:text-slate-700 transition-all"><Minus className="w-4 h-4" /></button>
                <span className="text-xs font-black text-slate-700 w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="text-slate-400 hover:text-slate-700 transition-all"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Notes / MCQ Panel */}
            {showExplanation && (
              <div className="absolute inset-0 bg-white z-[100] animate-in slide-in-from-bottom-full duration-400 flex flex-col">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-slate-100 shrink-0">
                  <div>
                    <h4 className="text-lg md:text-xl font-black text-slate-900">{selectedBoard.disease}</h4>
                    <p className="text-slate-400 text-xs mt-0.5">{selectedBoard.system}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {userRole === 'admin' && activeNoteTab === 'notes' && (
                      <button onClick={() => { setIsEditingNotes(true); setEditedNoteText(firebaseNotes[selectedBoard.disease] || PEDIATRICS_EXPLANATIONS[selectedBoard.disease] || ''); }} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all font-bold text-xs flex items-center gap-2 shadow-sm">
                        <Edit className="w-4 h-4" />
                        تعديل النوتس
                      </button>
                    )}
                    <button onClick={() => setShowExplanation(false)} className="p-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Tabs */}
                <div className="flex border-b border-slate-100 shrink-0">
                  <button
                    onClick={() => setActiveNoteTab('notes')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 font-black text-sm border-b-2 transition-all",
                      activeNoteTab === 'notes' ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <FileText className="w-4 h-4" /> Notes
                  </button>
                  <button
                    onClick={() => setActiveNoteTab('questions')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 font-black text-sm border-b-2 transition-all",
                      activeNoteTab === 'questions' ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Brain className="w-4 h-4" /> Questions
                  </button>
                </div>
                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  {activeNoteTab === 'notes' ? (
                    <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 pb-20" dir="rtl">
                      {(firebaseNotes[selectedBoard.disease] || PEDIATRICS_EXPLANATIONS[selectedBoard.disease]) ? (
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-black text-black mt-8 mb-4 border-b pb-3 border-slate-200 text-right" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-black text-black mt-6 mb-3 border-r-4 border-black pr-3 text-right" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-extrabold text-black mt-5 mb-2 text-right" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-black leading-loose text-base text-right" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mr-4 mb-4 space-y-2 text-black text-right" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mr-4 mb-4 space-y-2 text-black text-right" {...props} />,
                            li: ({node, ...props}) => <li className="marker:text-black" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-black font-black bg-slate-100 px-2 py-0.5 rounded-lg mx-0.5" {...props} />,
                            hr: ({node, ...props}) => <hr className="my-8 border-slate-200" {...props} />,
                          }}
                        >
                          {firebaseNotes[selectedBoard.disease] || PEDIATRICS_EXPLANATIONS[selectedBoard.disease]}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center" dir="ltr">
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="font-black text-slate-400 text-lg">Notes Coming Soon</p>
                          <p className="text-slate-300 text-sm mt-2">Notes for this slide are being prepared</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // --- QUESTIONS TAB - Flashcard Session ---
                    (() => {
                      const diseaseKey = (selectedBoard.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                      const allQuestions = selectedBoard.system === 'تحديدات الاطفال'
                        ? getQuestionsForKey(`_SUBCHAPTER_${selectedBoard.subSystem}`)
                        : getQuestionsForKey(diseaseKey);
                      
                      const getFilteredQuestions = (cat: string) => {
                        let filtered = allQuestions;
                        if (cat !== 'All') {
                          filtered = allQuestions.filter(q => {
                            if (cat === 'Definitions') return q.front.toLowerCase().startsWith('define');
                            if (cat === 'Enumerate') return q.front.toLowerCase().startsWith('enumerate');
                            if (cat === 'Cases') return q.front.toLowerCase().startsWith('case');
                            if (cat === 'Matching') return q.front.toLowerCase().startsWith('match') || q.type === 'matching';
                            return true;
                          });
                        }
                        return groupCases(filtered);
                      };
                      
                      const questions = getFilteredQuestions(activeCategory);
                      const totalQ = qDone.length + qQueue.length;
                      const currentCard = qQueue[0];

                      const CategoryTabs = () => (
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 w-full max-w-2xl mx-auto border-b border-slate-100 pb-4">
                          {['All', 'Definitions', 'Enumerate', 'Matching', 'Cases'].map(cat => {
                            const count = getFilteredQuestions(cat).length;
                            return (
                              <button
                                key={cat}
                                onClick={() => {
                                  setActiveCategory(cat);
                                  const newQs = getFilteredQuestions(cat);
                                  if (newQs.length > 0) startQuestionSession(newQs);
                                  else { setQQueue([]); setQDone([]); setQSessionDone(false); }
                                }}
                                className={`px-4 py-2 flex items-center gap-1.5 rounded-full text-xs md:text-sm font-bold transition-all ${activeCategory === cat ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                              >
                                {cat} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      );

                      if (allQuestions.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                              <Brain className="w-8 h-8 text-emerald-300" />
                            </div>
                            <p className="font-black text-slate-400 text-lg">Questions Coming Soon</p>
                            <p className="text-slate-300 text-sm mt-2">Questions for this slide are being prepared</p>
                          </div>
                        );
                      }

                      if (questions.length === 0 && allQuestions.length > 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                            <CategoryTabs />
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                              <Brain className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">No Questions in this Category</h3>
                            <p className="text-slate-400">Please select another category.</p>
                          </div>
                        );
                      }

                      if (qQueue.length === 0 && qDone.length === 0) {
                        // Not started yet
                        return (
                          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                            <CategoryTabs />
                            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-6">
                              <Brain className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">{selectedBoard.disease}</h3>
                            <p className="text-slate-400 mb-2">{questions.length} questions</p>
                            <p className="text-slate-300 text-sm mb-10 max-w-xs">Rate each card as Easy, Repeat, or Hard. Hard & Repeat cards come back until you know them all.</p>
                            <button
                              onClick={() => startQuestionSession(questions)}
                              className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-base hover:bg-emerald-600 transition-all shadow-lg hover:scale-105 active:scale-95"
                            >
                              Start Session →
                            </button>
                          </div>
                        );
                      }

                      if (qSessionDone) {
                        // Session complete
                        return (
                          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                            <div className="text-6xl mb-6">🎉</div>
                            <h3 className="text-3xl font-black text-slate-800 mb-2">Session Complete!</h3>
                            <p className="text-slate-400 mb-8">You've mastered all {questions.length} questions</p>
                            <div className="grid grid-cols-3 gap-4 mb-10 w-full max-w-sm">
                              <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-black text-emerald-600">{qDone.length}</p>
                                <p className="text-xs font-bold text-emerald-500 mt-1">Easy</p>
                              </div>
                              <div className="bg-amber-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-black text-amber-600">{qRepeatCount}</p>
                                <p className="text-xs font-bold text-amber-500 mt-1">Repeated</p>
                              </div>
                              <div className="bg-rose-50 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-black text-rose-600">{qHardCount}</p>
                                <p className="text-xs font-bold text-rose-500 mt-1">Hard</p>
                              </div>
                            </div>
                            <button
                              onClick={() => startQuestionSession(questions)}
                              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all"
                            >
                              Restart Session
                            </button>
                          </div>
                        );
                      }

                      // Active flashcard
                      return (
                        <div className="flex flex-col items-center justify-between h-full py-8 px-6 max-w-5xl mx-auto">
                          <CategoryTabs />
                          {/* Progress */}
                          <div className="w-full space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-400">
                              <span>{qDone.length} done</span>
                              <span>{qQueue.length} remaining</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                style={{width: `${totalQ > 0 ? (qDone.length / totalQ) * 100 : 0}%`}}
                              />
                            </div>
                          </div>

                          {/* Flashcard */}
                          <div className="w-full flex-1 flex items-center justify-center py-6 md:py-10">
                            <div
                              className="flashcard-container w-full max-w-3xl lg:max-w-4xl"
                              style={{perspective: '1200px'}}
                            >
                              <div
                                className="flashcard relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[550px]"
                                style={{
                                  transformStyle: 'preserve-3d',
                                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                  transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                }}
                              >
                                {/* Front */}
                                {currentCard?.type === 'case' ? (
                                  <CaseStudyUI question={currentCard} onComplete={() => rateCard('easy')} currentPriority={spacePriorities[currentCard.id]} onSetPriority={(p) => handleSetPriority(currentCard.id, p)} />
                                ) : currentCard?.type === 'matching' ? (
                                  <MatchingGameUI question={currentCard} onComplete={() => setIsCardFlipped(true)} />
                                ) : (
                                  <div
                                    className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 bg-white rounded-3xl border-2 border-slate-100 shadow-xl cursor-pointer"
                                    style={{backfaceVisibility: 'hidden'}}
                                    onClick={() => !isCardFlipped && setIsCardFlipped(true)}
                                  >
                                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 shrink-0">
                                    <span className="text-indigo-500 font-black text-sm md:text-base">Q</span>
                                  </div>
                                  <div className="flex-1 w-full flex items-center justify-center overflow-y-auto custom-scrollbar pr-2">
                                    <p className={`text-slate-800 font-black leading-relaxed whitespace-pre-line w-full ${(currentCard?.front?.length || 0) > 100 ? 'text-sm sm:text-base lg:text-lg text-left' : 'text-lg sm:text-xl md:text-2xl lg:text-3xl text-center'}`} dir="auto">{currentCard?.front}</p>
                                  </div>
                                  {!isCardFlipped && (
                                    <p className="text-slate-300 text-xs md:text-sm mt-4 font-bold uppercase tracking-widest shrink-0">Tap to reveal answer</p>
                                  )}
                                </div>
                                )}
                                {/* Back */}
                                <div
                                  className="absolute inset-0 flex flex-col items-center justify-center p-5 sm:p-8 md:p-12 bg-indigo-50 rounded-3xl border-2 border-indigo-100 shadow-xl"
                                  style={{backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}
                                >
                                  {currentCard?.type === 'case' ? null : currentCard?.type === 'matching' ? (
                                    <div className="flex flex-col items-center text-center">
                                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                                        <span className="text-3xl">🎉</span>
                                      </div>
                                      <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Perfect Match!</h3>
                                      <p className="text-slate-500 font-bold text-sm md:text-base">You successfully connected all terms.</p>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 md:mb-6 shrink-0">
                                        <span className="text-white font-black text-sm md:text-base">A</span>
                                      </div>
                                      <div className="flex-1 w-full flex items-center justify-center overflow-y-auto custom-scrollbar pr-2">
                                        <p className={`text-slate-800 font-black leading-relaxed whitespace-pre-line w-full ${(currentCard?.back?.length || 0) > 100 ? 'text-sm sm:text-base lg:text-lg text-left' : 'text-base sm:text-lg md:text-xl lg:text-2xl text-center'}`} dir="auto">{currentCard?.back}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Rating Buttons */}
                          {isCardFlipped ? (
                            <div className="w-full space-y-3">
                              <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-3">How well did you know this?</p>
                              <div className="grid grid-cols-3 gap-3">
                                <button
                                  onClick={() => rateCard('hard')}
                                  className="py-4 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 border-2 border-rose-100 hover:border-rose-500"
                                >
                                  🔴 Hard
                                </button>
                                <button
                                  onClick={() => setIsCardFlipped(false)}
                                  className="py-4 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 border-2 border-amber-100 hover:border-amber-500"
                                >
                                  ↩️ Return Question
                                </button>
                                <button
                                  onClick={() => rateCard('easy')}
                                  className="py-4 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 border-2 border-emerald-100 hover:border-emerald-500"
                                >
                                  🟢 Easy
                                </button>
                              </div>
                            </div>
                          ) : (
                            currentCard?.type === 'case' ? null : currentCard?.type === 'matching' ? (
                              <div className="py-4 opacity-50 select-none pointer-events-none">
                                <p className="text-center font-bold text-slate-400 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></span>
                                  Match all pairs to continue
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={() => setIsCardFlipped(true)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg mx-auto block"
                              >
                                Reveal Answer
                              </button>
                            )
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-4">
          <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-12 text-center space-y-8 shadow-3xl animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto">
              <Trophy className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">أحسنت! 🎉</h2>
              <p className="text-slate-400 mt-2">انتهت جلسة الدراسة</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block mb-1">وقت الجلسة</span>
              <span className="text-4xl font-black text-emerald-700">{Math.floor(sessionSeconds/60)}m {sessionSeconds%60}s</span>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSummary(false);
                  setSelectedBoard(null);
                  setIsTimerActive(false);
                  setSessionSeconds(0);
                  setPaths([]);
                  setRedoPaths([]);
                  setIsChapterQuestionMode(false);
                  setSelectedSubSystem(null);
                }}
                className="w-full py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black transition-all"
              >
                لوحة أخرى
              </button>
              <button onClick={() => navigate('/dashboard')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all">
                العودة للداشبورد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Study Exit Confirmation Modal */}
      {showStudyExitConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4">
          <div className="w-full max-w-md bg-white rounded-[3.5rem] p-8 md:p-10 text-center space-y-6 shadow-3xl animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto">
              <LogOut className="w-9 h-9" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800">مغادرة جلسة المذاكرة؟ 🚪</h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                هل أنت متأكد من رغبتك في إنهاء جلسة المذاكرة الحالية؟ سيتم حساب وقت مجهودك وإضافة رصيد نقاطك فوراً!
              </p>
            </div>

            {/* Time and Points summary card */}
            <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 grid grid-cols-2 gap-4">
              <div className="text-center border-r border-indigo-100/50">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-1">وقت المذاكرة</span>
                <span className="text-xl font-black text-indigo-900">
                  {Math.floor(sessionSeconds / 60)}د {sessionSeconds % 60}ث
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block mb-1">النقاط المكتسبة</span>
                <span className="text-xl font-black text-emerald-700">
                  +{Math.floor(sessionSeconds * 3)} 🏆
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleConfirmExitStudySession}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 active:scale-[0.98] transition-all shadow-lg shadow-rose-600/20 text-sm"
              >
                نعم، إنهاء وحفظ النقاط
              </button>
              <button
                onClick={handleCancelExitStudySession}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 active:scale-[0.98] transition-all text-sm"
              >
                تراجع، مواصلة الدراسة
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* --- REVIEW CENTER MODAL --- */}
      {isReviewCenterOpen && (
        <div className="fixed inset-0 z-[3000] bg-slate-950/95 backdrop-blur-2xl p-4 md:p-8 flex flex-col animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900/50 p-4 md:p-6 rounded-[2rem] border border-white/5 mb-6 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={() => setIsReviewCenterOpen(false)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition-all">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">مركز المراجعة</h2>
                <p className="text-slate-400 text-sm mt-1">{selectedSystem}</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-slate-950/50 rounded-2xl p-1.5 border border-white/5 w-full md:w-auto">
              <button onClick={() => setReviewTab('images')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-sm transition-all ${reviewTab === 'images' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>الصور</button>
              <button onClick={() => setReviewTab('questions')} className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-sm transition-all ${reviewTab === 'questions' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>الأسئلة</button>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex justify-center gap-4 md:gap-6 mb-8 shrink-0">
            {(['A', 'B', 'C'] as const).map(p => (
              <button 
                key={p} onClick={() => setReviewFilter(p)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex flex-col items-center justify-center transition-all ${reviewFilter === p ? (p === 'A' ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30 scale-110' : p === 'B' ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30 scale-110' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-110') : 'bg-slate-900 border border-white/5 text-slate-500 hover:bg-slate-800 hover:text-white hover:scale-105'}`}
              >
                <span className="text-2xl md:text-3xl font-black">{p}</span>
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
            {reviewTab === 'images' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 max-w-[1600px] mx-auto">
                {boards
                  .filter(b => b.module === selectedModule && b.system === selectedSystem && spacePriorities[b.id] === reviewFilter)
                  .map(board => (
                    <div key={board.id} className="bg-slate-900 rounded-3xl overflow-hidden group cursor-pointer border border-white/5 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1" onClick={() => { setSelectedBoard(board); setIsReviewCenterOpen(false); }}>
                      <div className="aspect-[4/3] bg-black/50 relative overflow-hidden">
                        <img src={board.medicalImage} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                        <div className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg ${reviewFilter === 'A' ? 'bg-rose-500' : reviewFilter === 'B' ? 'bg-amber-500' : 'bg-emerald-500'}`}>{spacePriorities[board.id]}</div>
                        <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 text-white">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="p-4 md:p-5">
                        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">{board.disease}</h3>
                      </div>
                    </div>
                  ))
                }
                {boards.filter(b => b.module === selectedModule && b.system === selectedSystem && spacePriorities[b.id] === reviewFilter).length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
                    <Target className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-bold text-lg">لا توجد صور في هذه الأولوية</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4">
                {(() => {
                  try {
                    const chapterSlides = boards.filter(b => b.module === selectedModule && b.system === selectedSystem);
                    const chapterQuestions = selectedSystem === 'تحديدات الاطفال' ? [] : chapterSlides.flatMap(board => {
                      if (!board) return [];
                      const diseaseKey = (board.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                      return getQuestionsForKey(diseaseKey);
                    });
                    const generalQuestions = getQuestionsForKey(`_CHAPTER_${selectedSystem}`);
                    const allChapterQuestions = selectedSystem === 'تحديدات الاطفال'
                      ? (() => {
                          const subChapters = Array.from(new Set(boards
                            .filter(b => b.system === 'تحديدات الاطفال')
                            .map(b => b.subSystem)
                            .filter(Boolean)
                          ));
                          const subChapterQuestions = subChapters.flatMap(sub => getQuestionsForKey(`_SUBCHAPTER_${sub}`));
                          return groupCases(subChapterQuestions);
                        })()
                      : groupCases([...chapterQuestions, ...generalQuestions]);
                    
                    const filteredQs = allChapterQuestions.filter(q => q && spacePriorities[q.id] === reviewFilter);
                    
                    if (filteredQs.length === 0) {
                      return (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-[3rem] border border-white/5">
                          <Brain className="w-16 h-16 mb-4 opacity-20" />
                          <p className="font-bold text-lg">لا توجد أسئلة في هذه الأولوية</p>
                        </div>
                      );
                    }

                    return filteredQs.map(q => (
                      <div key={q.id} className="bg-slate-900/80 p-5 md:p-6 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <span className="text-[10px] font-black text-indigo-400 mb-2 inline-block uppercase tracking-widest px-2 py-1 bg-indigo-500/10 rounded-md">{q.type || 'Flashcard'}</span>
                            <h3 className="text-white font-bold text-base md:text-lg leading-relaxed mb-3 whitespace-pre-wrap">{q.front}</h3>
                            {q.type === 'case' ? (
                              <div className="flex flex-col gap-2">
                                {q.subQuestions?.map((sq: any, i: number) => (
                                  <div key={i} className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                    <p className="text-slate-300 text-sm leading-relaxed font-bold mb-2">Q: {sq.questionText}</p>
                                    <p className="text-indigo-300 text-sm leading-relaxed whitespace-pre-wrap">A: {typeof sq.back === 'string' ? sq.back : 'Multiple choices...'}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{typeof q.back === 'string' ? q.back : 'Multiple choices...'}</p>
                              </div>
                            )}
                          </div>
                          <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-lg ${reviewFilter === 'A' ? 'bg-rose-500' : reviewFilter === 'B' ? 'bg-amber-500' : 'bg-emerald-500'}`}>{spacePriorities[q.id]}</div>
                        </div>
                      </div>
                    ));
                  } catch (err) {
                    console.error(err);
                    return <div className="text-rose-500 p-8 font-bold">حدث خطأ أثناء تحميل الأسئلة.</div>;
                  }
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Download PDF Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => !downloadStatus && setIsDownloadModalOpen(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => !downloadStatus && setIsDownloadModalOpen(false)} 
              disabled={!!downloadStatus}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30 shadow-inner">
              <Download className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-black text-white mb-2">تنزيل تجميعة الـ PDF</h2>
            <p className="text-slate-400 mb-6 font-medium leading-relaxed">
              سيتم توليد وتوقيع نسختك من التجميعة تلقائياً ببياناتك الأمنية (<strong className="text-white">{user?.displayName || userData?.name || "اسمك الشخصي"}</strong>) لمنع تسريب الملف.
            </p>
            
            {downloadStatus ? (
              // Progress View
              <div className="w-full space-y-4 py-4">
                <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold animate-pulse text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{downloadStatus}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">
                  {downloadProgress}% Completed
                </div>
              </div>
            ) : (
              // Options View
              <div className="w-full space-y-4">
                <button
                  onClick={() => handleDownloadPDF(true)}
                  className="group relative w-full p-4 bg-slate-950/50 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-2xl text-left transition-all active:scale-[0.98] duration-300"
                >
                  <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    موصى به
                  </div>
                  <div className="text-white font-black text-base flex items-center gap-2 mb-1">
                    <span>النسخة مضغوطة فائقة الجودة</span>
                  </div>
                  <div className="text-xs text-slate-400 font-bold leading-relaxed">
                    دقة 2K عالية جداً مع الاحتفاظ بكل تفاصيل الخطوط والنصوص الطبية. حجم صغير جداً (21.8 MB).
                  </div>
                </button>
                
                <button
                  onClick={() => handleDownloadPDF(false)}
                  className="group w-full p-4 bg-slate-950/50 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl text-left transition-all active:scale-[0.98] duration-300"
                >
                  <div className="text-white font-black text-base flex items-center gap-2 mb-1">
                    <span>النسخة الأصلية بالدقة الكاملة</span>
                  </div>
                  <div className="text-xs text-slate-400 font-bold leading-relaxed">
                    الملف الأصلي المصدر بجميع الصور بأعلى جودة تجميعية ممكنة. حجم كبير جداً (148.6 MB).
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSubscriptionModal(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-black text-white mb-2">Premium Access</h2>
            <p className="text-slate-400 mb-6 font-medium leading-relaxed">Unlock <strong className="text-white">ALL</strong> remaining chapters with a single, affordable subscription.</p>
            
            <div className="bg-slate-950/50 rounded-2xl p-6 w-full mb-6 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">One-Time Payment</div>
              <div className="text-4xl font-black text-white mb-1 flex items-baseline justify-center gap-1">
                50 <span className="text-xl text-slate-400">EGP</span>
              </div>
              <div className="text-sm font-black text-amber-400 uppercase tracking-widest mb-1">For ALL Chapters</div>
              <div className="text-xs font-bold text-slate-500">Special prices available for groups</div>
              
              <ul className="mt-6 space-y-3 text-left">
                <li className="flex items-start gap-3 text-slate-300 text-sm font-medium">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span><strong className="text-emerald-400 font-bold">All Premium Chapters</strong> unlocked instantly</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-sm font-medium">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span>Hundreds of interactive visual boards & diagrams</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-sm font-medium">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span>Full access to Clinical Case Studies & MCQs</span>
                </li>
              </ul>
            </div>
            
            <div className="w-full space-y-3">
              <a 
                href="https://wa.me/201039322938?text=أريد الاستفسار أكثر عن كورس pediatrics على flash space"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all shadow-lg shadow-[#25D366]/20"
              >
                Subscribe via WhatsApp
              </a>
              <a 
                href="https://t.me/Clinoma_Admins?text=أريد الاستفسار أكثر عن كورس pediatrics على flash space"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white transition-all shadow-lg shadow-[#0088cc]/20"
              >
                Subscribe via Telegram
              </a>
              <button 
                onClick={() => setShowSubscriptionModal(false)}
                className="w-full py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notes Modal for Admins */}
      {isEditingNotes && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsEditingNotes(false)} />
          <div className="relative bg-white border border-slate-200 rounded-[2rem] p-6 max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Edit className="w-6 h-6 text-indigo-500" />
                تعديل النوتس لـ: <span className="text-indigo-600 font-bold ml-1">{selectedBoard?.disease}</span>
              </h3>
              <button onClick={() => setIsEditingNotes(false)} className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 text-sm mb-4">قم بنسخ نص الـ Markdown من جيمني (Gemini) والصقه هنا. ستظهر المعاينة في الجهة اليسرى.</p>
            
            <div className="w-full bg-slate-100 p-2 rounded-t-2xl border border-b-0 border-slate-200 flex gap-2">
              <button onClick={() => setEditedNoteText(prev => prev + '\\n# عنوان رئيسي\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold text-slate-700 hover:bg-slate-50">H1</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n## عنوان فرعي 1\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold text-slate-700 hover:bg-slate-50">H2</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n### عنوان فرعي 2\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold text-slate-700 hover:bg-slate-50">H3</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n**نص عريض**')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold text-slate-700 hover:bg-slate-50">Bold</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n* نقطة جديدة')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold text-slate-700 hover:bg-slate-50">List</button>
              <button onClick={() => setEditedNoteText(prev => prev + '\\n\\n---\\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-bold text-slate-700 hover:bg-slate-50">Line</button>
            </div>
            
            <div className="flex-1 min-h-0 bg-white rounded-b-2xl border border-slate-200 overflow-hidden mb-4 relative flex gap-4 p-4">
              {/* Textarea for Editing */}
              <textarea
                value={editedNoteText}
                onChange={e => setEditedNoteText(e.target.value)}
                onPaste={(e) => {
                  const html = e.clipboardData.getData('text/html');
                  if (html) {
                    e.preventDefault();
                    import('turndown').then((TurndownModule) => {
                      const TurndownService = TurndownModule.default || TurndownModule;
                      const turndownService = new TurndownService({ headingStyle: 'atx' });
                      const markdown = turndownService.turndown(html);
                      const target = e.target as HTMLTextAreaElement;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      const currentVal = target.value;
                      const newVal = currentVal.substring(0, start) + markdown + currentVal.substring(end);
                      setEditedNoteText(newVal);
                      
                      // setTimeout used to focus and set cursor pos after React state update
                      setTimeout(() => {
                        target.focus();
                        target.setSelectionRange(start + markdown.length, start + markdown.length);
                      }, 0);
                    }).catch(err => {
                      console.error('Failed to load turndown', err);
                    });
                  }
                }}
                className="flex-1 h-full bg-slate-50 rounded-xl p-4 outline-none resize-none font-mono text-sm leading-relaxed text-slate-900 border border-slate-200 custom-scrollbar shadow-inner"
                dir="auto"
                placeholder="الصق النص هنا..."
              />
              
              {/* Live Preview */}
              <div className="flex-1 h-full overflow-y-auto bg-slate-50 rounded-xl border border-slate-200 p-6 custom-scrollbar" dir="rtl">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">Live Preview</p>
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-black text-black mt-8 mb-4 border-b pb-3 border-slate-200 text-right" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-black text-black mt-6 mb-3 border-r-4 border-black pr-3 text-right" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-extrabold text-black mt-5 mb-2 text-right" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-black leading-loose text-base text-right" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mr-4 mb-4 space-y-2 text-black text-right" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mr-4 mb-4 space-y-2 text-black text-right" {...props} />,
                    li: ({node, ...props}) => <li className="marker:text-black" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-black font-black bg-slate-200 px-2 py-0.5 rounded-lg mx-0.5" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-8 border-slate-200" {...props} />,
                  }}
                >
                  {editedNoteText || 'سيظهر العرض هنا...'}
                </ReactMarkdown>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsEditingNotes(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all" disabled={isSavingNote}>
                إلغاء
              </button>
              <button 
                disabled={isSavingNote}
                onClick={async () => {
                  setIsSavingNote(true);
                  try {
                    const noteId = selectedBoard?.disease || '';
                    if (!noteId) return;
                    await setDoc(doc(db, 'notes', noteId), {
                      content: editedNoteText,
                      updatedAt: Date.now()
                    });
                    setFirebaseNotes(prev => ({ ...prev, [noteId]: editedNoteText }));
                    toast.success('تم حفظ النوتس بنجاح!');
                    setIsEditingNotes(false);
                  } catch (e: any) {
                    toast.error(e.message || 'حدث خطأ أثناء الحفظ');
                  } finally {
                    setIsSavingNote(false);
                  }
                }} 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSavingNote ? <span className="animate-spin text-xl block w-5 h-5">↻</span> : <Check className="w-5 h-5" />}
                حفظ النوتس (Save)
              </button>
            </div>
          </div>
        </div>
      )}

<style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        canvas { touch-action: none; }
        .no-select { user-select: none; }
        @keyframes fadeOut {
          0% { opacity: 1; filter: brightness(1.5); }
          50% { opacity: 0.8; filter: brightness(1); }
          100% { opacity: 0; filter: brightness(0.5); }
        }
        .animate-fade-out {
          animation: fadeOut 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FlashSpace;
