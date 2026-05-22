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
  Target
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

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
    'Acquired Bleeding & DIC.jpeg',
    'Aplastic Anemia & BM Failure Syndromes.jpeg',
    'Chronic Hemolytic Anemia & Hereditary Spherocytosis.jpeg',
    'Classification & Evaluation of Anemia.jpeg',
    'G6PD Deficiency & Immune Hemolytic Anemias.jpeg',
    'Hemostasis & Bleeding Disorders.jpeg',
    'Inherited Coagulation Hemophilia & VWD.jpeg',
    'Iron Deficiency Anemia (IDA).jpeg',
    'Lymphomas & Solid Tumors.jpeg',
    'Megaloblastic Anemias (B12 & Folate Deficiency).jpeg',
    'Non-Thrombocytopenic Purpura (Vascular & HSP).jpeg',
    'Pediatric Oncology The Leukemias (ALL & AML).jpeg',
    'Platelet Disorders ITP & Thrombocytopenias.jpeg',
    'RBC Physiology, Indices & Morphology.jpeg',
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
  ]
};

const PEDIATRICS_EXPLANATIONS: Record<string, string> = {
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
* **الغدة:** **Hypothyroidism** & **Hypopituitarism**`
};
// --- Question Types ---
interface Question {
  id: string;
  front: string;
  back: string;
}

const PEDIATRICS_QUESTIONS: Record<string, Question[]> = {

  'BIOLOGICAL AGE & MATURATION (BONE & TEETH)': [
    {
      id: 'ba1',
      front: '17) Mention causes of hypocalcemia and tetany in rickets.',
      back: '1. Parathyroid gland failure to respond to systemic hypocalcemia due to gland exhaustion.\n2. Complete exhaustion of total skeletal bone stores of calcium.\n3. Administration of high-dose vitamin D shock therapy without concurrent oral calcium supplementation.\n4. Severe concurrent chest infections causing hyperventilation → CO2 wash → respiratory alkalosis tetany.',
    },
    {
      id: 'ba2',
      front: '49) Describe the clinical picture of latent tetany.',
      back: 'Occurs when total serum calcium = 7–9 mg%. No spontaneous symptoms, confirmed by 3 signs:\n\n1. Chvostek sign: Tapping over the facial nerve anterior to the tragus → contraction of ipsilateral facial muscles.\n2. Trousseau sign: Sphygmomanometer cuff inflated above systolic for 3 minutes → carpal spasm.\n3. Peroneal sign: Tapping the peroneal nerve over the neck of the fibula → dorsiflexion and eversion of the foot.',
    },
    {
      id: 'ba3',
      front: 'Case: 5-year-old with abnormal long bone ends, short stature, and hypertension.\n1) What is the most likely diagnosis?',
      back: 'Renal Osteodystrophy (Uremic Rickets). Skeletal mineralization defects secondary to chronic renal failure, presenting with rickets-like epiphyseal broadening, severe short stature, metabolic acidosis, and renal-induced systemic hypertension.',
    },
    {
      id: 'ba4',
      front: 'Case: 5-year-old with abnormal long bone ends, short stature, and hypertension.\n2) What are the investigations that should be done?',
      back: '1. Serum Kidney Function Tests (BUN & Creatinine) → elevated\n2. Serum Phosphorus → hyperphosphatemia\n3. Serum Calcium → hypocalcemia\n4. Serum Alkaline Phosphatase → elevated\n5. Blood Gas Analysis (pH) → metabolic acidosis\n6. X-ray of Wrists/Long Bones → epiphyseal cupping, fraying, broadening',
    },
    {
      id: 'ba5',
      front: 'Case: 5-year-old with abnormal long bone ends, short stature, and hypertension.\n3) What is the treatment?',
      back: '1. Radical management of renal pathology: chronic hemodialysis or renal transplantation.\n2. Active Calcitriol (1,25-dihydroxyvitamin D) → bypass compromised renal 1-alpha-hydroxylase.\n3. High oral calcium intake.\n4. Low phosphate diet.\n5. Oral phosphate binders → restrict GI absorption of dietary phosphorus.',
    },
  ],

  'PEDIATRIC GROWTH': [
    {
      id: 'pg1',
      front: '50) Define growth.',
      back: 'Growth is the natural increase in the size of the body either by hyperplasia through the multiplication of different cells of different organs or by hypertrophy through an increase in cell size.',
    },
    {
      id: 'pg2',
      front: '56) Mention types of Growth charts.',
      back: '1. Percentile curves.\n2. Standard deviation curves.\n3. Velocity curves.\n4. Conditional centiles.',
    },
    {
      id: 'pg3',
      front: '13) Describe five benefits of breastfeeding for mothers.',
      back: '1. It helps in the involution of the birth canal.\n2. It serves as a natural method of contraception.\n3. It decreases the clinical incidence of breast cancer.',
    },
    {
      id: 'pg4',
      front: '14) Mention foods avoided in weaning diet.',
      back: '1. Foods that cause choking: nuts, fruits with seeds, potato chips.\n2. Foods containing artificial colors and artificial flavors.\n3. Salted food → may cause hypertension.\n4. Junk food such as sweets and candies.\n5. Highly spiced and fatty food.',
    },
    {
      id: 'pg5',
      front: '15) Describe skin changes in Kwashiorkor and explain its cause.',
      back: 'Description: Erythema → hyperpigmentation → desquamation → ulceration, fissuring, and crackling. Secondary skin infections and gangrene are common. Sites: pressure sites (buttocks & back) and flexural sites (groin & axilla).\n\nCause: Deficiencies in essential fatty acids, essential amino acids, sulfur-containing amino acids, vitamin A, and zinc.',
    },
    {
      id: 'pg6',
      front: '16) List 5 causes of death in PEM.',
      back: '1. Recurrent systemic infections.\n2. Electrolytes imbalance (refeeding syndrome or acute gastroenteritis).\n3. Hypothermia.\n4. Hypoglycemia: low liver glycogen + defects in catecholamine and glucagon formation.\n5. Heart failure: anemic heart failure or degenerative changes in cardiac muscles.',
    },
    {
      id: 'pg7',
      front: '48) Explain the causes of infection in protein-energy malnutrition.',
      back: '1. Edema-Related Susceptibility: Pitting edema creates an ideal environment for micro-organisms → skin infections and gangrene.\n2. Gastrointestinal Barrier Defect: Defective epithelization of intestinal mucosa → vulnerability to bacterial, viral, and protozoal gastroenteritis.',
    },
    {
      id: 'pg8',
      front: '51) Explain why weaning should start after the age of 4 months.',
      back: 'Maternal breast milk becomes insufficient to fulfill nutritional requirements:\n\n• Calories: intake 356 kcal/day vs requirement 536.8 kcal/day\n• Proteins: intake 6.6 g/day vs requirement 9.1 g/day\n• Vitamin D: intake 528 ng/day vs requirement 5000 ng/day\n• Zinc: intake 0.98 mg/day vs requirement 2 mg/day\n• Iron: intake 0.29 mg/day vs requirement 11 mg/day (after 6 months)\n\nComplementary feeding at 4 months avoids caloric, vitamin, and mineral deficiencies.',
    },
    {
      id: 'pg9',
      front: '53) Discuss Welcome classification for protein energy malnutrition.',
      back: 'Weight-for-age 60–80% of standard:\n• Without edema → Underweight (mild PEM)\n• With edema → Kwashiorkor (severe PEM)\n\nWeight-for-age < 60% of standard:\n• Without edema → Marasmus (severe PEM)\n• With edema → Marasmic Kwashiorkor (severe PEM)',
    },
    {
      id: 'pg10',
      front: '54) Mention Breastfeeding reflexes.',
      back: 'Maternal Reflexes:\n1. Milk secretion reflex (Prolactin reflex): Suckling → anterior pituitary → prolactin → milk production.\n2. Milk ejection / let-down reflex (Oxytocin reflex): Suckling → posterior pituitary → oxytocin → myoepithelial contraction → milk ejection.\n\nInfant Reflexes:\n1. Rooting reflex: Touch to lip/cheek → turns toward stimulus, opens mouth.\n2. Suckling reflex: Tactile stimulation of palate → suckling.\n3. Swallowing reflex: Milk filling oral cavity → automatic swallowing.',
    },
    {
      id: 'pg11',
      front: 'Case: 9-month-old infant with lower limb edema on a low-protein diet.\n1) What is the most likely diagnosis?',
      back: 'Kwashiorkor. A form of severe protein-energy malnutrition caused by selective protein deficiency in the setting of nearly normal caloric intake, characterized clinically by pitting edema and growth failure.',
    },
    {
      id: 'pg12',
      front: 'Case: 9-month-old infant with lower limb edema on a low-protein diet.\n2) What other features should be present?',
      back: 'Constant Features: Severe growth failure (weight-for-age < 80%), psychological changes (apathy, marked irritability, lack of interest, absence of smile), muscle wasting with preserved subcutaneous fat.\n\nVariable Features: Skin changes (flaky paint dermatosis), hair changes (flag sign), nutritional anemia, hepatomegaly (fatty infiltration), diarrhea, abdominal distension.',
    },
    {
      id: 'pg13',
      front: 'Case: 9-month-old infant with lower limb edema on a low-protein diet.\n3) What investigations should be done?',
      back: '1. Serum Albumin → degree of hypoproteinemia (low)\n2. Urinary Urea per Gram Creatinine → reduced protein intake (low)\n3. Blood Glucose Level → fasting hypoglycemia\n4. Serum Electrolytes → potassium and magnesium deficiencies\n5. CBC → type of anemia\n6. Radiological Bone Age → delayed skeletal maturation',
    },
  ],

  'DEVELOPMENTAL MILESTONES & NEURODEVELOPMENT': [
    {
      id: 'dm1',
      front: '55) Mention Developmental milestones at age of 9 months.',
      back: 'Gross Motor: Creeps and pulls themselves up into a standing position.\nFine Motor: Pincer grip using thumb and index finger.\nLanguage: Says "dada" and "mama" non-specifically.\nSocial: Actively explores their immediate surroundings.',
    },
    {
      id: 'dm2',
      front: '52) Mention 6 warning signs of infant development.',
      back: '1. Discrepant head size or crossing centile lines (too large or too small).\n2. Persistence of primitive reflexes beyond 6 months of age.\n3. Complete absence of response to the environment or parent by 12 months.\n4. Failure to walk independently by 18 months.\n5. Complete absence of clear spoken words by 18 months.\n6. Failure to produce two-word sentences by 2 years of age.\n7. Pronounced problems with social interaction at 3 years of age.',
    },
  ],

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

const FlashSpace = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<Board[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [systems, setSystems] = useState<Record<string, string[]>>({});
  
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop toggle
  const [activeTool, setActiveTool] = useState<Tool>('pen');
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
  const [activeNoteTab, setActiveNoteTab] = useState<'notes' | 'questions'>('notes');

  // --- Question Session State ---
  const [qQueue, setQQueue] = useState<Question[]>([]);
  const [qDone, setQDone] = useState<Question[]>([]);
  const [qHardCount, setQHardCount] = useState(0);
  const [qRepeatCount, setQRepeatCount] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [qSessionDone, setQSessionDone] = useState(false);

  // Vector Engine
  const [paths, setPaths] = useState<Path[]>([]);
  const [redoPaths, setRedoPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const fadingLasersRef = useRef<Path[]>([]);

  // Timer
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

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
    const fetchData = async () => {
      const timeoutId = setTimeout(() => setLoading(false), 5000);
      try {
        const snap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
        
        // Add the Pediatrics boards dynamically
        const generatedPediatricsBoards: Board[] = [];
        Object.entries(PEDIATRICS_SLIDES).forEach(([chapter, files]) => {
          files.forEach(file => {
            const title = file.replace(/\.[^/.]+$/, "");
            const customExp = PEDIATRICS_EXPLANATIONS[title];
            generatedPediatricsBoards.push({
              id: `pediatrics_${chapter.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
              module: 'Pediatrics',
              system: chapter,
              disease: title,
              medicalImage: `/assets/TIP-Peditrics/${chapter}/${file}`,
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

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach(p => drawPath(ctx, p));
    if (currentPath) drawPath(ctx, currentPath);

    const now = Date.now();
    fadingLasersRef.current = fadingLasersRef.current.filter(l => {
      const elapsed = now - (l.fadeStart || 0);
      if (elapsed > 1500) return false;
      drawPath(ctx, l, 1 - (elapsed / 1500));
      return true;
    });

    requestRef.current = requestAnimationFrame(renderFrame);
  }, [paths, currentPath, drawPath]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderFrame);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [renderFrame]);

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
      setCurrentPath(null);
      
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      initialPinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
      initialZoomRef.current = zoom;
      initialPinchCenterRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
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
      setCurrentPath({ id: 'eraser-mark', points: [pos], tool: 'eraser', color: '#fff', size: 1, opacity: 0 });
      return;
    }

    const settings = toolSettings[activeTool];
    setCurrentPath({
      id: Math.random().toString(),
      points: [pos],
      tool: activeTool,
      color: settings.color,
      size: settings.size,
      opacity: settings.opacity
    });
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
        setOffset({
          x: initialOffsetRef.current.x + deltaX,
          y: initialOffsetRef.current.y + deltaY
        });
      }
      return;
    }

    if (activeTool === 'pan' && isPanning) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setOffset({
        x: clientX - panStartRef.current.x,
        y: clientY - panStartRef.current.y
      });
      return;
    }

    if (!currentPath) return;
    const pos = getPos(e);
    if (activeTool === 'eraser') {
      handleEraser(pos);
      return;
    }
    setCurrentPath(prev => prev ? ({ ...prev, points: [...prev.points, pos] }) : null);
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

    if (!currentPath) return;
    if (activeTool === 'laser') {
      fadingLasersRef.current.push({ ...currentPath, fadeStart: Date.now(), isFading: true });
    } else if (activeTool !== 'eraser') {
      setPaths(prev => [...prev, currentPath]);
      setRedoPaths([]);
    }
    setCurrentPath(null);
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
    setIsCardFlipped(false);
    setQSessionDone(false);
  };

  const rateCard = (rating: 'easy' | 'repeat' | 'hard') => {
    const current = qQueue[0];
    const rest = qQueue.slice(1);
    setIsCardFlipped(false);
    setTimeout(() => {
      if (rating === 'easy') {
        const newDone = [...qDone, current];
        setQDone(newDone);
        if (rest.length === 0) {
          setQSessionDone(true);
          setQQueue([]);
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
          <button onClick={() => navigate('/flashcards')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 font-bold text-xs flex items-center gap-2 transition-all">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
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
                  {modules.map(mod => (
                    <button key={mod} onClick={() => setSelectedModule(mod)}
                      className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 active:border-indigo-500/50 hover:border-indigo-500/50 rounded-3xl text-left transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] overflow-hidden p-6 hover:shadow-2xl hover:shadow-indigo-500/10"
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
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all duration-300">
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : !selectedSystem ? (
            // SYSTEM SELECTION - premium glassmorphism layout
            <div className="h-full flex flex-col p-4 md:p-8 gap-6 md:gap-8 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-4 shrink-0 mt-2">
                <button onClick={() => setSelectedModule(null)} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{selectedModule}</h2>
                  <p className="text-slate-500 text-sm mt-0.5 tracking-wide uppercase font-bold">Select a Chapter</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {systems[selectedModule]?.map(sys => {
                    const color = SYSTEM_COLORS[sys] || '#6366f1';
                    const count = boards.filter(b => b.module === selectedModule && b.system === sys).length;
                    
                    const lwSys = sys.toLowerCase();
                    let SysIcon = Stethoscope;
                    if (lwSys.includes('cardio')) SysIcon = Heart;
                    else if (lwSys.includes('neuro')) SysIcon = Brain;
                    else if (lwSys.includes('gastro')) SysIcon = Apple;
                    else if (lwSys.includes('endo')) SysIcon = Target;
                    else if (lwSys.includes('genetic')) SysIcon = Dna;
                    else if (lwSys.includes('hematology')) SysIcon = Droplets;
                    else if (lwSys.includes('infect')) SysIcon = ShieldAlert;
                    else if (lwSys.includes('renal')) SysIcon = Activity;

                    return (
                      <button key={sys} onClick={() => setSelectedSystem(sys)}
                        className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 active:border-white/20 hover:border-white/20 rounded-3xl text-left transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] overflow-hidden p-6 flex flex-col justify-between min-h-[160px] hover:shadow-2xl"
                      >
                        {/* Gradient Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-3xl rounded-full" style={{background: color, transform: 'translate(30%, -30%)'}} />
                        
                        <div className="relative z-10 flex justify-between items-start w-full">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:-translate-y-1" style={{background: `linear-gradient(135deg, ${color}20, ${color}10)`, border: `1px solid ${color}40`, color: color}}>
                            <SysIcon className="w-6 h-6" />
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="relative z-10 mt-6">
                          <h3 className="text-white font-black text-lg leading-tight mb-1">{sys}</h3>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{background: color, boxShadow: `0 0 10px ${color}`}} />
                            <p className="text-slate-400 text-xs font-semibold">{count} visual slides</p>
                          </div>
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
              <div className="flex items-center gap-4 shrink-0 mt-2">
                <button onClick={() => setSelectedSystem(null)} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{selectedSystem}</h2>
                  <p className="text-slate-500 text-sm mt-0.5 tracking-wide uppercase font-bold">{boards.filter(b => b.module === selectedModule && b.system === selectedSystem).length} Slides Available</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pb-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {boards.filter(b => b.module === selectedModule && b.system === selectedSystem).map(board => (
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
                </div>
              </div>
            </div>
          )}
        </div>
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
              onClick={() => { setSelectedBoard(null); setSelectedSystem(null); setIsSidebarOpen(false); setPaths([]); setRedoPaths([]); }}
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
          {boards
            .filter(b => b.module === selectedBoard?.module && b.system === selectedBoard?.system)
            .map((board, idx) => (
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
            ))
          }
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
              onClick={() => setShowSummary(true)}
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
                { id: 'pen', icon: Pencil, label: 'قلم' },
                { id: 'highlighter', icon: Highlighter, label: 'تظليل' },
                { id: 'eraser', icon: Eraser, label: 'ممحاة' },
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
                ref={canvasRef}
                width={2500} height={1800}
                onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
                onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
                className={cn(
                  "absolute inset-0 z-10 w-full h-full touch-none",
                  activeTool === 'pan' ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
                )}
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
                  onClick={() => { setShowExplanation(true); setShowQuestions(true); setActiveNoteTab('questions'); if (qQueue.length === 0 && !qSessionDone) { const qs = PEDIATRICS_QUESTIONS[selectedBoard?.disease || ''] || []; if (qs.length > 0) startQuestionSession(qs); } }}
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
                  <button onClick={() => setShowExplanation(false)} className="p-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                  </button>
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
                      {PEDIATRICS_EXPLANATIONS[selectedBoard.disease] ? (
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-black text-slate-800 mt-8 mb-4 border-b pb-3 border-slate-100" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-black text-slate-800 mt-6 mb-3 border-r-4 border-indigo-500 pr-3" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-extrabold text-slate-800 mt-5 mb-2" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-slate-600 leading-loose text-base" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mr-4 mb-4 space-y-2 text-slate-600" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mr-4 mb-4 space-y-2 text-slate-600" {...props} />,
                            li: ({node, ...props}) => <li className="marker:text-indigo-500" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-indigo-600 font-black bg-indigo-50 px-2 py-0.5 rounded-lg mx-0.5" {...props} />,
                            hr: ({node, ...props}) => <hr className="my-8 border-slate-100" {...props} />,
                          }}
                        >
                          {PEDIATRICS_EXPLANATIONS[selectedBoard.disease]}
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
                      const questions = PEDIATRICS_QUESTIONS[selectedBoard.disease] || [];
                      const totalQ = qDone.length + qQueue.length;
                      const currentCard = qQueue[0];

                      if (questions.length === 0) {
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

                      if (qQueue.length === 0 && qDone.length === 0) {
                        // Not started yet
                        return (
                          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
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
                        <div className="flex flex-col items-center justify-between h-full py-8 px-6 max-w-2xl mx-auto">
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
                          <div className="w-full flex-1 flex items-center justify-center py-6">
                            <div
                              className="flashcard-container w-full max-w-lg"
                              style={{perspective: '1200px'}}
                            >
                              <div
                                className="flashcard relative w-full"
                                style={{
                                  transformStyle: 'preserve-3d',
                                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                  transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                  minHeight: '280px',
                                }}
                              >
                                {/* Front */}
                                <div
                                  className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-slate-100 shadow-xl cursor-pointer"
                                  style={{backfaceVisibility: 'hidden'}}
                                  onClick={() => !isCardFlipped && setIsCardFlipped(true)}
                                >
                                  <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                                    <span className="text-indigo-500 font-black text-sm">Q</span>
                                  </div>
                                  <p className="text-slate-800 font-black text-xl text-center leading-relaxed" dir="rtl">{currentCard?.front}</p>
                                  {!isCardFlipped && (
                                    <p className="text-slate-300 text-xs mt-6 font-bold uppercase tracking-widest">Tap to reveal answer</p>
                                  )}
                                </div>
                                {/* Back */}
                                <div
                                  className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-indigo-50 rounded-3xl border-2 border-indigo-100 shadow-xl"
                                  style={{backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}
                                >
                                  <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                                    <span className="text-white font-black text-sm">A</span>
                                  </div>
                                  <p className="text-slate-800 font-black text-lg text-center leading-relaxed whitespace-pre-line" dir="rtl">{currentCard?.back}</p>
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
                                  onClick={() => rateCard('repeat')}
                                  className="py-4 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 border-2 border-amber-100 hover:border-amber-500"
                                >
                                  🟡 Repeat
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
                            <button
                              onClick={() => setIsCardFlipped(true)}
                              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all"
                            >
                              Reveal Answer
                            </button>
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
                onClick={() => { setShowSummary(false); setSelectedBoard(null); setIsTimerActive(false); setSessionSeconds(0); setPaths([]); setRedoPaths([]); }}
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        canvas { touch-action: none; }
        .no-select { user-select: none; }
      `}</style>
    </div>
  );
};

export default FlashSpace;
