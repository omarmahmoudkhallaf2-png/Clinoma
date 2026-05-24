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
  Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc, increment, arrayUnion, deleteField } from 'firebase/firestore';
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
* **دم:** Subdural hematoma`
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
  front: string;
  back?: string;
  matchingPairs?: Array<{ left: string, right: string }>;
  caseBody?: string;
  subQuestions?: Array<{ id: string, questionText: string, back: string }>;
}

const PEDIATRICS_QUESTIONS: Record<string, Question[]> = {
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
      "back": "Normal development, as sitting without support with a straight back is expected by 8 months, and creeping is achieved at 9 months."
    },
    {
      "id": "gd_case1_q2",
      "front": "Case 1: A mother brings her 10-month-old infant to your clinic for a routine check-up. On physical examination, you note that the infant can sit steadily without support with a straight back and can creep on the floor. However, the infant cannot stand or walk alone yet.\n\nAt what age is walking well typically achieved?",
      "back": "Walking well is typically achieved at 15 months."
    },
    {
      "id": "gd_case2_q1",
      "front": "Case 2: An 18-month-old child is brought to the pediatric clinic because he is still unable to walk independently and has no clear spoken words.\n\nIdentify the two key development warning signs present in this child.",
      "back": "Key warning signs: Not walking by 18 months and no clear spoken words by 18 months."
    },
    {
      "id": "gd_case2_q2",
      "front": "Case 2: An 18-month-old child is brought to the pediatric clinic because he is still unable to walk independently and has no clear spoken words.\n\nEnumerate two muscular or neurological causes that could lead to delayed walking in this child.",
      "back": "Causes of delayed walking: Cerebral palsy and muscles disorders."
    }
  ],
  "_CHAPTER_Nutrition": [
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
  "THE FOUNDATIONS OF INFANT FEEDING": [
    {
      "id": "fif1",
      "front": "Mention Breast feeding reflexes.",
      "back": "Milk secretion reflex (prolactin reflex): Suckling stimulates the nerve endings in the nipple leading to stimulation of the anterior pituitary producing prolactin, which stimulates milk production.\n\nMilk ejection or let down reflex (oxytocin reflex): Suckling simulates oxytocin release from the posterior pituitary → contraction of the myoepithelial cells around the lactiferous ducts causing milk ejection.\n\nIn addition, visual, auditory and emotional stimuli affect the cerebral cortex → releasing impulses to the hypothalamus and the pituitary → oxytocin release and milk ejection."
    }
  ],
  "HUMAN MILK (STAGES, COMPOSITION & ADVANTAGES)": [
    {
      "id": "hm1",
      "front": "Describe five benefits of breastfeeding (for mothers)?",
      "back": "Help involution of the birth canal.\n\nNatural method of contraception.\n\nDecrease the incidence of breast cancer.\n\nPsychological advantages and establishing the maternal - infant bond.\n\nConvenience (available anytime, anywhere) and Cheaper."
    }
  ],
  "BREASTFEEDING MANAGEMENT & CHALLENGES": [],
  "ARTIFICIAL & COMPLEMENTARY FEEDING (WEANING)": [
    {
      "id": "acf1",
      "front": "Mention foods avoided in weaning diet.",
      "back": "Food that causes chocking as nuts, fruits with seeds, potato chips, etc.\n\nArtificial colors and flavored foods.\n\nSalted food might cause hypertension.\n\nJunk food as sweets, candies that deprive the child from taking food that is more nutritious and encourages the desire for sweets.\n\nHighly spiced and fatty food."
    },
    {
      "id": "acf2",
      "front": "Explain why weaning should start after the age of 4 months.",
      "back": "Breast milk becomes insufficient in Calories, as there is a gap between the intake and the requirement at the age of 4 months.\n\nIt is insufficient in Proteins.\n\nIt is insufficient in Vitamin D.\n\nIt is insufficient in Zinc and Iron after the age of 4-6 months.\n\nWeaning is recommended to avoid caloric, vitamins and mineral deficiency."
    }
  ],
  "PROTEIN ENERGY MALNUTRITION (PEM)": [
    {
      "id": "pem1",
      "front": "Describe skin changes in Kwashiorkor and explain its cause.",
      "back": "Description: Start as erythema hyperpigmentation and desquamation → ulceration, fissuring and crackling. Skin infections & even gangrene are common. The commonest sites: pressure sites (buttocks & back), flexural sites (groin an axilla).\n\nCause: Skin changes may be due to deficiency of essential fatty acids, essential amino acids, sulfur containing amino acids, vitamin A and zinc."
    },
    {
      "id": "pem2",
      "front": "List 5 causes of death in PEM.",
      "back": "Recurrent infections.\n\nElectrolytes imbalance as a result of refeeding syndrome or acute gastroenteritis.\n\nHypothermia.\n\nHypoglycemia (due to low glycogen content in the liver and defect in catecolamines and glucagons hormone formation).\n\nHeart failure (due to anemic heart failure or degenerative changes in the cardiac muscles)."
    },
    {
      "id": "pem3",
      "front": "Explain the causes of infection in protein-energy malnutrition.",
      "back": "The pitting oedema constitutes a suitable media for entry of the organisms, leading to skin infections and even gangrene.\n\nAssociated vitamins and mineral deficiency, such as Vitamin A deficiency.\n\nRepeated infections can also lead to bone marrow depression (normocytic anemia)."
    },
    {
      "id": "pem4",
      "front": "Discuss welcome classification for protein energy malnutrition.",
      "back": "Nutritional disorders are classified according to the body weight and the presence or absence of oedema (The standard reference weight is the 50 percentile).\n\nWeight for age 60-80% of standard:\nWithout oedema: underweight (mild PEM).\nWith oedema: kwashiorkor (sever PEM).\n\nWeight for age <60% of standard:\nWithout oedema: marasmus (sever PEM).\nWith oedema: marasmic kwashiokor (sever PEM)."
    },
    {
      "id": "pem5",
      "front": "Case 3: 9-month-old infant presenting with lower edema, on a diet of Carbohydrates 55%, fat 40%, and protein 5% for the last 5 months. 1- What is most likely diagnosis?",
      "back": "Kwashiorkor (Severe PEM)."
    },
    {
      "id": "pem6",
      "front": "Case 3: 2- What are the other features should be present?",
      "back": "Constant features: Growth failure (Weight for age < 80% of the reference), Pitting oedema (starts in feet, puffy face with prominent cheeks/moon face), Mental changes (apathy, with no interest in surroundings and no smile), Muscle wasting with preserved subcutaneous fat.\n\nVariable features: Skin changes (erythema, desquamation, ulceration), Hair changes (loses luster, easily pickable, flag sign), Anemia, and GIT changes (Hepatomegaly, diarrhea, abdominal distension)."
    },
    {
      "id": "pem7",
      "front": "Case 3: 3- What are the investigations should be done?",
      "back": "Assess weight for age using Growth charts.\n\nBiochemical tests including Serum albumin (Low) and Urinary urea per g creatinine (Low).\n\nElectrolytes assessment (to detect hypokalemia).\n\nComplete blood count to determine the type of Anemia."
    }
  ],
  "RICKETS & TETANY": [
    {
      "id": "rt1",
      "front": "Mention causes of hypocalcemia and tetany in rickets.",
      "back": "The parathyroid glands fail to respond to the state of hypocalcaemia (gland exhaustion).\n\nBone stores of calcium are exhausted.\n\nVitamin D shock therapy is given without calcium supplementation.\n\nSevere chest infection → hyperventilation → CO2 wash → alkalosis tetany."
    },
    {
      "id": "rt2",
      "front": "Describe the clinical picture of latent tetany.",
      "back": "Latent tetany (level of calcium 7-9 mg%) becomes evident by the following tests:\n\nChevostick sign: tapping of facial nerve anterior to the tragus → contraction of the facial muscles.\n\nTrousseau sign: occlusion the arterial flow to the arm by inflation the cuff of sphygmomanometer above the systolic pressure for 3 minutes ← ischemia → carpal spasm.\n\nPeroneal sign: tapping the peroneal nerve over the neck of the fibula → dorsiflexion and eversion of the foot."
    },
    {
      "id": "rt3",
      "front": "Case 2: 5-year-old child with short stature, blood pressure 140/100, tachypnea, pallor, and abnormal long bone ends. 1- What is most likely diagnosis?",
      "back": "Renal osteodystrophy (Uremic rickets), indicating skeletal changes occurring with chronic renal failure."
    },
    {
      "id": "rt4",
      "front": "Case 2: 2- What are the investigations should be done?",
      "back": "Serum phosphorus (hypersphatemia).\n\nSerum calcium (hypocalcemia).\n\nRaised alkaline phosphatase.\n\nBlood pH to detect metabolic acidosis.\n\nElevated urea and creatinine.\n\nRadiological findings (X-ray of wrist)."
    },
    {
      "id": "rt5",
      "front": "Case 2: 3- What is the treatment?",
      "back": "Treatment of renal dysfunction → transplantation or hemodialysis.\n\nCalcitriol (1,25-dihydroxy vit D) administration.\n\nHigh calcium intake & Low phosphate intake.\n\nPhosphate binders to bind excess phosphate in diet."
    }
  ],
  "PEDIATRIC GROWTH": [
    {
      "id": "g1",
      "front": "Define growth.",
      "back": "Growth: Natural increase in the size of the body either by (hyperplasia) through multiplication of different cells of different organs or (hypertrophy) through increase in the cell size."
    },
    {
      "id": "g2",
      "front": "Mention types of Growth charts.",
      "back": "Percentile curves.\n\nStandard deviation curves.\n\nVelocity curves.\n\nConditional centiles."
    }
  ],
  "BIOLOGICAL AGE & MATURATION (BONE & TEETH)": [
    {
      "id": "bone1",
      "front": "Enumerate the causes of Delayed Dentition.",
      "back": "Rickets (أشهر وأهم سبب)\nHypothyroidism\nHypopituitarism\nDown syndrome\nMalnutrition\nFamilial / Idiopathic\n\n💡 Mnemonic لتسهيل التذكر:\n(عيلة داون عندها نقص تغذية وكساح في الغدة)"
    }
  ],
  "DEVELOPMENTAL MILESTONES & NEURODEVELOPMENT": [
    {
      "id": "dm1",
      "front": "Mention 6 warning signs of infant development.",
      "back": "Discrepant head size or crossing centile lines (too large or too small).\n\nPersistence of primitive reflexes > 6 months of age.\n\nNo response to environment or parent by 12 months.\n\nNot walking by 18 months.\n\nNo clear spoken words by 18 months.\n\nNo two word sentences by 2 years."
    },
    {
      "id": "dm2",
      "front": "Mention Developmental milestones at age of 9 month.",
      "back": "Gross motor: Creeps, Pulls to standing position.\n\nFine motor: Grasp by thumb and finger (pincer grip).\n\nLanguage: Say dada & mama nonspecific.\n\nSocial: Explores."
    }
  ]
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
  const result: any[] = [];
  const caseMap = new Map<string, any>();
  
  questions.forEach(q => {
    if (q.front && q.front.toLowerCase().startsWith('case ')) {
      const parts = q.front.split('\n\n');
      if (parts.length >= 2) {
        const caseBody = parts[0].trim();
        const questionText = parts.slice(1).join('\n\n').trim();
        
        if (!caseMap.has(caseBody)) {
          const caseObj = {
            id: `case_group_${q.id}`,
            type: 'case',
            front: caseBody,
            caseBody: caseBody,
            subQuestions: []
          };
          caseMap.set(caseBody, caseObj);
          result.push(caseObj);
        }
        
        caseMap.get(caseBody).subQuestions.push({
          id: q.id,
          questionText: questionText,
          back: q.back
        });
        
        return;
      }
    }
    // Not a case or poorly formatted, push as is
    result.push(q);
  });
  
  return result;
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
      <div className="w-full bg-indigo-50 dark:bg-indigo-900/30 p-6 md:p-8 shrink-0 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

          {onSetPriority && (
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mx-2">Priority:</span>
              {(['A', 'B', 'C'] as const).map(p => (
                <button
                  key={p}
                  onClick={(e) => { e.stopPropagation(); onSetPriority(currentPriority === p ? null : p); }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-all ${currentPriority === p ? (p === 'A' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110' : p === 'B' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-110' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110') : 'bg-white dark:bg-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-indigo-600 dark:text-indigo-300 font-black">C</span>
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-base md:text-lg whitespace-pre-wrap leading-relaxed" dir="auto">{question.caseBody}</h3>
          </div>
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
  const [isChapterQuestionMode, setIsChapterQuestionMode] = useState(false);
  // --- Priority Review System State ---
  const [spacePriorities, setSpacePriorities] = useState<Record<string, 'A'|'B'|'C'>>({});
  const [isReviewCenterOpen, setIsReviewCenterOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<'images'|'questions'>('images');
  const [reviewFilter, setReviewFilter] = useState<'A'|'B'|'C'>('A');

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

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [historyStack, setHistoryStack] = useState<{qQueue: Question[], qDone: Question[], qHardCount: number, qRepeatCount: number}[]>([]);

  // Vector Engine
  const [paths, setPaths] = useState<Path[]>([]);
  const [redoPaths, setRedoPaths] = useState<Path[]>([]);
  const currentPathRef = useRef<Path | null>(null);
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
    setQQueue([]);
    setQDone([]);
    setQSessionDone(false);
  }, [selectedBoard?.id]);

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
    if (currentPathRef.current) drawPath(ctx, currentPathRef.current);

    const now = Date.now();
    fadingLasersRef.current = fadingLasersRef.current.filter(l => {
      const elapsed = now - (l.fadeStart || 0);
      if (elapsed > 1500) return false;
      drawPath(ctx, l, 1 - (elapsed / 1500));
      return true;
    });

    requestRef.current = requestAnimationFrame(renderFrame);
  }, [paths, drawPath]);

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
      currentPathRef.current = null;
      
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

    if (!currentPathRef.current) return;
    const pos = getPos(e);
    if (activeTool === 'eraser') {
      handleEraser(pos);
      return;
    }
    currentPathRef.current.points.push(pos);
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
      fadingLasersRef.current.push({ ...currentPathRef.current, fadeStart: Date.now(), isFading: true });
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
                  {modules.map(mod => {
                    const hasAccess = isSpaceSubscribed(mod);
                    return (
                    <button key={mod} onClick={() => {
                        if (hasAccess) setSelectedModule(mod);
                        else toast.error('This module is locked. Please subscribe to access it.');
                      }}
                      className={cn("group relative backdrop-blur-xl border border-white/5 active:border-indigo-500/50 hover:border-indigo-500/50 rounded-3xl text-left transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] overflow-hidden p-6 hover:shadow-2xl hover:shadow-indigo-500/10",
                        hasAccess ? "bg-slate-900/50" : "bg-slate-900/20 grayscale opacity-70"
                      )}
                    >
                      {/* Gradient Glow */}
                      {hasAccess && <div className="absolute top-0 right-0 w-40 h-40 opacity-10 group-hover:opacity-30 transition-opacity duration-500 blur-3xl rounded-full" style={{background: '#6366f1', transform: 'translate(40%, -40%)'}} />}
                      
                      <div className="relative z-10 flex flex-col h-full gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:-translate-y-1 transition-transform duration-300">
                          {hasAccess ? <BookOpen className="w-7 h-7 drop-shadow-md" /> : <Lock className="w-7 h-7 drop-shadow-md" />}
                        </div>
                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <h3 className="text-xl font-black text-white leading-tight">{mod}</h3>
                            <p className="text-slate-400 text-xs font-semibold mt-1">{systems[mod]?.length || 0} chapters available</p>
                          </div>
                          {!hasAccess && <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 bg-rose-500/10 text-rose-500 rounded-md">Locked</span>}
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mt-2">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedSystem(null)} className="p-2.5 bg-white/5 active:bg-white/15 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{selectedSystem}</h2>
                    <p className="text-slate-500 text-sm mt-0.5 tracking-wide uppercase font-bold">{boards.filter(b => b.module === selectedModule && b.system === selectedSystem).length} Slides Available</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pb-8">
                {isChapterQuestionMode ? (
                  // --- CHAPTER QUESTIONS TAB - Flashcard Session ---
                  (() => {
                    const chapterSlides = boards.filter(b => b.module === selectedModule && b.system === selectedSystem);
                    const chapterQuestions = chapterSlides.flatMap(board => {
                      const diseaseKey = (board.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                      return PEDIATRICS_QUESTIONS[diseaseKey] || [];
                    });
                    const generalQuestions = PEDIATRICS_QUESTIONS[`_CHAPTER_${selectedSystem}`] || [];
                    const allQuestions = [...chapterQuestions, ...generalQuestions];

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

                    const CategoryTabs = () => (
                      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 w-full max-w-2xl mx-auto border-b border-slate-100 pb-2">
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
                              onClick={() => setIsChapterQuestionMode(false)}
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
                    <button
                      onClick={() => {
                        const chapterSlides = boards.filter(b => b.module === selectedModule && b.system === selectedSystem);
                        const chapterQuestions = chapterSlides.flatMap(board => {
                          const diseaseKey = (board.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                          return PEDIATRICS_QUESTIONS[diseaseKey] || [];
                        });
                        const generalQuestions = PEDIATRICS_QUESTIONS[`_CHAPTER_${selectedSystem}`] || [];
                        const allQuestions = [...chapterQuestions, ...generalQuestions];
                        if (allQuestions.length > 0) {
                          startQuestionSession(allQuestions);
                          setIsChapterQuestionMode(true);
                        } else {
                          toast.error('No questions available for this chapter yet');
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
          <button
            onClick={() => {
              const chapterSlides = boards.filter(b => b.module === selectedBoard?.module && b.system === selectedBoard?.system);
              const chapterQuestions = chapterSlides.flatMap(board => {
                const diseaseKey = (board.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                return PEDIATRICS_QUESTIONS[diseaseKey] || [];
              });
              const generalQuestions = PEDIATRICS_QUESTIONS[`_CHAPTER_${selectedBoard?.system}`] || [];
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
              
                  {/* Image Priority Selector */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-slate-700/50 shadow-xl z-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Priority:</span>
                    {(['A', 'B', 'C'] as const).map(p => (
                      <button
                        key={p}
                        onClick={(e) => { e.stopPropagation(); handleSetPriority(selectedBoard.id, spacePriorities[selectedBoard.id] === p ? null : p); }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-all ${spacePriorities[selectedBoard.id] === p ? (p === 'A' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-110' : p === 'B' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-110' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110') : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

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
                  onClick={() => { setShowExplanation(true); setShowQuestions(true); setActiveNoteTab('questions'); if (qQueue.length === 0 && !qSessionDone) { const diseaseKey = (selectedBoard?.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim(); const qs = PEDIATRICS_QUESTIONS[diseaseKey] || []; if (qs.length > 0) startQuestionSession(qs); } }}
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
                      const diseaseKey = (selectedBoard.disease || '').replace(/\.(jpeg|jpg|png)\s*$/i, '').trim();
                      const allQuestions = PEDIATRICS_QUESTIONS[diseaseKey] || [];
                      
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
