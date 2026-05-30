import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, FileText, Download, Play, Clock, ArrowRight, Sparkles, 
  CheckCircle, AlertTriangle, ShieldAlert, Award, RefreshCw, Settings, HelpCircle, X, ChevronRight, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mocking audio feedback for premium interaction
const playSound = (type: 'click' | 'correct' | 'wrong' | 'success') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'click') {
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'correct') {
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(250, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const oscNode = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscNode.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime + idx * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + idx * 0.1 + 0.2);
        oscNode.start(audioCtx.currentTime + idx * 0.1);
        oscNode.stop(audioCtx.currentTime + idx * 0.1 + 0.25);
      });
    }
  } catch (e) {
    // Audio Context blocked
  }
};

interface Chapter {
  title: string;
  subjectId: string;
  slideName: string;
}

const DAY_CHAPTERS: Record<number, Chapter[]> = {
  1: [
    { title: 'Tetralogy of Fallot (TOF) & Hypercyanotic Spells', subjectId: 'cardiovascular_diseases', slideName: 'Tetralogy of Fallot (TOF) & Hypercyanotic Spells.jpeg' },
    { title: 'Ventricular Septal Defect (VSD) - 2', subjectId: 'cardiovascular_diseases', slideName: 'Ventricular Septal Defect (VSD) - 2.jpeg' },
    { title: 'Patent Ductus Arteriosus (PDA)', subjectId: 'cardiovascular_diseases', slideName: 'Patent Ductus Arteriosus (PDA).jpeg' },
    { title: 'DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA)', subjectId: 'endocrinology', slideName: 'DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA).jpeg' },
    { title: 'CHILDHOOD OBESITY', subjectId: 'endocrinology', slideName: 'CHILDHOOD OBESITY.jpeg' },
  ],
  2: [
    { title: 'CHROMOSOMAL ABERRATIONS & DISORDERS', subjectId: 'genetic_diseases', slideName: 'CHROMOSOMAL ABERRATIONS & DISORDERS.jpeg' },
    { title: 'CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE', subjectId: 'genetic_diseases', slideName: 'CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE.jpeg' },
    { title: 'PEDIATRIC GROWTH', subjectId: 'growth_development', slideName: 'PEDIATRIC GROWTH.jpeg' },
    { title: 'Cerebral Palsy (CP)', subjectId: 'neurology', slideName: 'Cerebral Palsy (CP).jpeg' },
    { title: 'The Floppy Infant Syndrome', subjectId: 'neurology', slideName: 'The Floppy Infant Syndrome.jpeg' }
  ],
  3: [
    { title: 'The Thalassemia Syndromes (Alpha & Beta)', subjectId: 'hematology_oncology', slideName: 'The Thalassemia Syndromes (Alpha & Beta).jpeg' },
    { title: 'Iron Deficiency Anemia (IDA)', subjectId: 'hematology_oncology', slideName: 'Iron Deficiency Anemia (IDA).jpeg' },
    { title: 'Platelet Disorders ITP & Thrombocytopenias', subjectId: 'hematology_oncology', slideName: 'Platelet Disorders ITP & Thrombocytopenias.jpeg' },
    { title: 'PROTEIN ENERGY MALNUTRITION (PEM)', subjectId: 'nutrition', slideName: 'PROTEIN ENERGY MALNUTRITION (PEM).jpeg' },
    { title: 'RICKETS & TETANY', subjectId: 'nutrition', slideName: 'RICKETS & TETANY.jpeg' },
    { title: 'Chicken Pox (Varicella)', subjectId: 'infections', slideName: 'Chicken Pox (Varicella).jpeg' }
  ]
};

const PDF_RESOURCES = [
  { id: 'questions', title: 'أسئلة بنك معسكر الورقة الأولى PDF', size: '2.4 MB', type: 'أسئلة تفصيلية' },
  { id: 'summary', title: 'مذكرة المراجعة السريعة للمعسكر PDF', size: '1.8 MB', type: 'ملخص الذهبي' }
];

interface MatchingPair {
  id: string;
  question: string;
  answer: string;
}

interface MatchingSet {
  id: string;
  title: string;
  description: string;
  pairs: MatchingPair[];
}

const DAY1_MATCHING_SETS: MatchingSet[] = [
  {
    id: 'set1',
    title: 'المجموعة 1: منحنيات النمو (Curves Types)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'c1', question: 'Percentile Curves', answer: 'Consists of: "Length-for-age," "Weight-for-age," "Stature-for-age," BMI-for-age, Head circumference-for-age, and Weight-for-length' },
      { id: 'c2', question: 'Standard Deviation Curves', answer: 'Shows how much variation or \'dispersion\' there is from the average (mean)' },
      { id: 'c3', question: 'Velocity Curves', answer: 'Considers the change (increment) in growth over time from year to year' },
      { id: 'c4', question: 'Conditional Centiles', answer: 'Centiles in which reference data are conditional on or adjusted for some specific factor over or above age and sex' }
    ]
  },
  {
    id: 'set2',
    title: 'المجموعة 2: عمر التطور العصبي (Milestones)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'm1', question: 'Walks alone or with one hand', answer: '12 months' },
      { id: 'm2', question: 'Moro reflexes disappear', answer: '4 months' },
      { id: 'm3', question: 'Jumps', answer: '3 years' },
      { id: 'm4', question: 'Smile socially', answer: '2 months' },
      { id: 'm5', question: 'Coos', answer: '3 months' },
      { id: 'm6', question: 'Sit without support', answer: '7 months' },
      { id: 'm7', question: 'walks up stairs, feeds self', answer: '18 months' },
      { id: 'm8', question: 'Head support', answer: '3 months' }
    ]
  },
  {
    id: 'set3',
    title: 'المجموعة 3: علامات الخطورة في النمو (Red Flags)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'rf1', question: 'No Clear Spoken Words', answer: 'by 18 months' },
      { id: 'rf2', question: 'Problems with Social Interaction', answer: 'at 3 years' },
      { id: 'rf3', question: 'Persistence of Primitive Reflexes', answer: '> 6 months' },
      { id: 'rf4', question: 'No Two-Word Sentences', answer: 'by 2 years' },
      { id: 'rf5', question: 'Not Walking', answer: 'by 18 months' },
      { id: 'rf6', question: 'No Response to Environment or Parent', answer: 'by 12 months' }
    ]
  },
  {
    id: 'set4',
    title: 'المجموعة 4: الرضاعة الطبيعية (Breastfeeding)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'bf1', question: 'Lactoferrin', answer: 'An iron-binding protein that prevents iron uptake by organisms, causing a bacteriostatic effect.' },
      { id: 'bf2', question: 'Bifidus factor', answer: 'Stimulates lactic acid production, changing intestinal pH to become unsuitable for pathogenic organisms.' },
      { id: 'bf3', question: 'Galactosemia', answer: 'An absolute infant contraindication for breastfeeding.' },
      { id: 'bf4', question: 'Acute mastitis', answer: 'A relative maternal contraindication that requires regular breast evacuation until recovery.' }
    ]
  },
  {
    id: 'set5',
    title: 'المجموعة 5: أعراض وأسباب سوء التغذية (Malnutrition)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'cp1', question: 'Pitting oedema', answer: 'Causes: decreased plasma proteins, increased plasma aldosterone/ADH, oxidative stress.' },
      { id: 'cp2', question: 'Mental changes', answer: 'Caused by deficient amino acids and trace elements Cu, Mg, Zn.' },
      { id: 'cp3', question: 'Skin changes', answer: 'Deficiency of essential fatty acids, amino acids, Vit A, Zn.' },
      { id: 'cp4', question: 'Abdominal distension', answer: 'hypokalemia/toxic ileus.' },
      { id: 'cp5', question: 'Loss of subcutaneous fat', answer: 'First abdomen, then limbs, finally buccal pad of fat (→ senile face).' }
    ]
  },
  {
    id: 'set6',
    title: 'المجموعة 6: الكساح المقاوم للفيتامينات (Refractory Rickets)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'rr1', question: 'Primary Hypophosphatemic Rickets', answer: 'X-linked dominant, defect in phosphate reabsorption & Vit D conversion.' },
      { id: 'rr2', question: 'Vitamin D Dependent Rickets Type I', answer: 'Autosomal recessive, renal 1α hydroxylase defect.' },
      { id: 'rr3', question: 'Vitamin D Dependent Rickets Type II', answer: 'Autosomal recessive, target organ resistance.' },
      { id: 'rr4', question: 'Lowe Syndrome (Oculo-Cerebrorenal Disease)', answer: 'X-linked recessive.' },
      { id: 'rr5', question: 'Hypophosphatasia', answer: 'Autosomal recessive, marked deficiency of alkaline phosphatase.' }
    ]
  },
  {
    id: 'set7',
    title: 'المجموعة 7: حساسية ألبان الأبقار (CMA)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'cma1', question: 'IgE-mediated CMA', answer: 'Immediate reactions (minutes to 2 hours), mediated by IgE antibodies.' },
      { id: 'cma2', question: 'Non-IgE-mediated CMA', answer: 'Delayed reactions (hours to days), driven by cell-mediated response.' },
      { id: 'cma3', question: 'Skin Prick Test (SPT)', answer: 'Identifies IgE-mediated CMA; positive points to allergy.' },
      { id: 'cma4', question: 'Elimination Diet', answer: 'Complete removal for 2-4 weeks; clinical improvement supports diagnosis.' },
      { id: 'cma5', question: 'Oral Food Challenge (Gold Standard)', answer: 'Strict medical supervision; contraindicated in severe anaphylaxis.' }
    ]
  },
  {
    id: 'set8',
    title: 'المجموعة 8: مصطلحات القيء (Vomiting Definitions)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'v1', question: 'Nausea', answer: 'An unpleasant sensation of the imminent need to vomit, usually referred to the throat or epigastrium; a sensation that may or may not ultimately lead to the act of vomiting.' },
      { id: 'v2', question: 'Vomiting', answer: 'Forceful oral expulsion of gastric contents associated with the contraction of the abdominal and chest wall musculature.' },
      { id: 'v3', question: 'Regurgitation', answer: 'The act by which food is brought back into the mouth without the abdominal and diaphragmatic muscular activity that characterizes true vomiting.' }
    ]
  },
  {
    id: 'set9',
    title: 'المجموعة 9: متلازمات الكروموسومات (Down vs. Turner)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'dt1', question: 'Turner Syndrome: Intrauterine', answer: 'May be presented with polyhydramnios and lung hypoplasia.' },
      { id: 'dt2', question: 'Turner Syndrome: Neonatal', answer: 'May be presented with lymphedema of hands and feet, low posterior hair line and cystic hygroma.' },
      { id: 'dt3', question: 'Down Syndrome: Dysmorphic Features', answer: 'Upward slanting palpebral fissures, Epicanthus and Burchfield spots of iris.' },
      { id: 'dt4', question: 'Turner Syndrome: Childhood', answer: 'Intelligence usually normal (mild learning disabilities possible), short stature, short webbed neck, wide carrying angle at elbows.' },
      { id: 'dt5', question: 'Down Syndrome: Orthopedics Affection', answer: 'Short fingers, curved 5th finger, transverse palmer crease, wide gap between 1st and 2nd toes.' }
    ]
  },
  {
    id: 'set10',
    title: 'المجموعة 10: الفحص قبل الولادة (Prenatal screening)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال للانتقال للمجموعة التالية.',
    pairs: [
      { id: 'ps1', question: 'Open neural tube defect', answer: 'AFP Increased, HCG Not applicable' },
      { id: 'ps2', question: 'Down syndrome', answer: 'AFP Decreased, HCG Increased' },
      { id: 'ps3', question: 'Turner syndrome', answer: 'AFP Normal/Decreased, HCG Increased' },
      { id: 'ps4', question: 'Edward syndrome', answer: 'AFP Decreased, HCG Decreased' }
    ]
  },
  {
    id: 'set11',
    title: 'المجموعة 11: الفحوصات التداخلية (Invasive Screening Tests)',
    description: 'قم بتوصيل جميع النقاط، ثم اضغط إرسال لتسليم الكويز بالكامل.',
    pairs: [
      { id: 'is1', question: 'Chorionic villus sampling', answer: 'Can be done at about 10-11 weeks, either transvaginal or transabdominally.' },
      { id: 'is2', question: 'Amniocentesis', answer: 'Can be done at 16-18/20 weeks, transabdominally.' },
      { id: 'is3', question: 'Fetal blood sampling', answer: 'Blood is taken from the umbilical vein at the placental insertion.' },
      { id: 'is4', question: 'Fetoscopy', answer: 'Permit direct access to fetus via percutaneous introduction of small fiberoptic telescope in amniotic cavity.' }
    ]
  }
];

const MATCHING_POOL: MatchingPair[] = [
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

export default function FirstPaperCamp() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);

  // Time & Date scheduling configuration
  const [startTimeStr, setStartTimeStr] = useState<string>(() => {
    return localStorage.getItem('camp_start_time') || new Date(Date.now() - 5 * 60 * 1000).toISOString().slice(0, 16); // Defaults to 5 mins ago (active)
  });
  const [durationMins, setDurationMins] = useState<number>(() => {
    return Number(localStorage.getItem('camp_duration') || '15');
  });

  const [timeRemainingToStart, setTimeRemainingToStart] = useState<number>(0);
  const [examState, setExamState] = useState<'locked' | 'ready' | 'active' | 'finished'>('ready');

  // Matching Test Gameplay State
  const [gameQuestions, setGameQuestions] = useState<{ id: string; text: string }[]>([]);
  const [gameAnswers, setGameAnswers] = useState<{ id: string; text: string }[]>([]);
  const [selectedQ, setSelectedQ] = useState<string | null>(null);
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // Maps Q id to A id
  const [wrongMatches, setWrongMatches] = useState<string[]>([]); // Q ids that were wrongly paired (not used in Exam system, but kept for compatibility)
  const [testTimeLeft, setTestTimeLeft] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // SVG Line Connecting Refs & States
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [renderTick, setRenderTick] = useState<number>(0);
  const [activeSelection, setActiveSelection] = useState<{ id: string; side: 'left' | 'right' } | null>(null);

  // Sequential Sets Game Loop States
  const [currentSetIdx, setCurrentSetIdx] = useState<number>(0);
  const [totalCorrectCount, setTotalCorrectCount] = useState<number>(0);
  const [totalPairsCount, setTotalPairsCount] = useState<number>(0);

  // Timer interval for scheduling countdown
  useEffect(() => {
    const checkSchedule = () => {
      const startMs = new Date(startTimeStr).getTime();
      const nowMs = Date.now();
      const diff = startMs - nowMs;
      
      if (diff > 0) {
        setTimeRemainingToStart(Math.ceil(diff / 1000));
        setExamState('locked');
      } else {
        setTimeRemainingToStart(0);
        if (examState === 'locked') {
          setExamState('ready');
        }
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 1000);
    return () => clearInterval(interval);
  }, [startTimeStr, examState]);

  // Timer interval for the actual active test
  useEffect(() => {
    if (examState !== 'active') return;

    if (testTimeLeft <= 0) {
      finishTest(totalCorrectCount + getCorrectMatchesInCurrentSet(), totalPairsCount);
      return;
    }

    const interval = setInterval(() => {
      setTestTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [testTimeLeft, examState, totalCorrectCount, matches, totalPairsCount]);

  const saveSettings = () => {
    localStorage.setItem('camp_start_time', startTimeStr);
    localStorage.setItem('camp_duration', durationMins.toString());
    setShowSettings(false);
    playSound('click');
  };

  const startMatchingTest = () => {
    playSound('success');
    
    // Choose appropriate sets pool
    const setsPool = DAY1_MATCHING_SETS;
    setCurrentSetIdx(0);
    setTotalCorrectCount(0);
    
    const totalPairs = setsPool.reduce((acc, s) => acc + s.pairs.length, 0);
    setTotalPairsCount(totalPairs);
    
    loadSet(0, setsPool);
    setTestTimeLeft(durationMins * 60);
    setExamState('active');
  };

  const loadSet = (setIdx: number, sets = DAY1_MATCHING_SETS) => {
    const currentSet = sets[setIdx];
    if (!currentSet) return;
    
    const qs = currentSet.pairs.map(item => ({ id: item.id, text: item.question })).sort(() => Math.random() - 0.5);
    const ans = currentSet.pairs.map(item => ({ id: item.id, text: item.answer })).sort(() => Math.random() - 0.5);
    
    setGameQuestions(qs);
    setGameAnswers(ans);
    setMatches({});
    setWrongMatches([]);
    setSelectedQ(null);
    setSelectedA(null);
    setActiveSelection(null);
    itemRefs.current = {};
    setTimeout(() => setRenderTick(t => t + 1), 100);
  };

  // SVG Line Connecting Coordinate Calculations
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

  // Selection Game Loop Handlers
  const handleItemClick = (id: string, side: 'left' | 'right') => {
    playSound('click');
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

        const newMatches = { ...matches };
        // Maintain strict 1-to-1 connection mapping
        Object.keys(newMatches).forEach(key => {
          if (newMatches[key] === rightId || key === leftId) {
            delete newMatches[key];
          }
        });

        newMatches[leftId] = rightId;
        setMatches(newMatches);
        setActiveSelection(null);
      }
    }
    setRenderTick(t => t + 1);
  };

  const handleItemDisconnect = (id: string, side: 'left' | 'right') => {
    playSound('click');
    const newMatches = { ...matches };
    if (side === 'left') {
      delete newMatches[id];
    } else {
      const qId = Object.keys(newMatches).find(key => newMatches[key] === id);
      if (qId) delete newMatches[qId];
    }
    setMatches(newMatches);
    setActiveSelection(null);
    setRenderTick(t => t + 1);
  };

  const renderLines = () => {
    const lines: React.ReactNode[] = [];
    Object.entries(matches).forEach(([leftId, rightId], idx) => {
      const p1 = getDotCoordinates(leftId, 'left');
      const p2 = getDotCoordinates(rightId, 'right');
      if (!p1 || !p2) return;

      lines.push(
        <line 
          key={`conn_${idx}`}
          x1={p1.x} y1={p1.y} 
          x2={p2.x} y2={p2.y} 
          stroke="#eab308" 
          strokeWidth="3.5"
          strokeLinecap="round"
          className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]"
        />
      );
    });
    return lines;
  };

  // Scroll and Resize Updater effect
  useEffect(() => {
    const handleUpdate = () => setRenderTick(t => t + 1);
    window.addEventListener('resize', handleUpdate);
    
    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleUpdate);
    }

    const interval = setInterval(handleUpdate, 200);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', handleUpdate);
      }
      clearInterval(interval);
    };
  }, [examState, currentSetIdx]);

  const getCorrectMatchesInCurrentSet = () => {
    let count = 0;
    gameQuestions.forEach(q => {
      const draftAns = matches[q.id];
      if (draftAns === q.id) {
        count += 1;
      }
    });
    return count;
  };

  const handleNextSet = () => {
    const correctCountInCurrentSet = getCorrectMatchesInCurrentSet();
    const newTotalCorrect = totalCorrectCount + correctCountInCurrentSet;
    setTotalCorrectCount(newTotalCorrect);
    
    if (currentSetIdx < DAY1_MATCHING_SETS.length - 1) {
      playSound('success');
      const nextIdx = currentSetIdx + 1;
      setCurrentSetIdx(nextIdx);
      loadSet(nextIdx);
    } else {
      finishTest(newTotalCorrect, totalPairsCount);
    }
  };

  const finishTest = (finalCorrect: number, total: number) => {
    playSound('success');
    const finalScore = Math.round((finalCorrect / total) * 100);
    setScore(finalScore);
    setExamState('finished');
  };

  const handleChapterClick = (chap: Chapter) => {
    playSound('click');
    const folderId = chap.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    navigate(`/course/pediatrics_course/subject/${chap.subjectId}/folder/${folderId}`, {
      state: { slideName: chap.slideName }
    });
  };

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Convert index to choice letter: 0 -> A, 1 -> B, etc.
  const getLetter = (index: number) => String.fromCharCode(65 + index);

  const isSetCompleted = gameQuestions.length > 0 && Object.keys(matches).length === gameQuestions.length;

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#090a0f] p-4 md:p-10 space-y-12 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button 
            onClick={() => navigate(`/course/pediatrics_course`)} 
            className="group self-start p-3 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-all flex items-center gap-3 font-black text-xs shadow-sm text-slate-700 dark:text-slate-200"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> 
            <span>العودة لمنهج الأطفال الرئيسي</span>
          </button>

          <button 
            onClick={() => { playSound('click'); setShowSettings(true); }}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:text-amber-500 transition-all flex items-center gap-2 font-black text-xs text-slate-700 dark:text-slate-200 shadow-sm"
          >
            <Settings className="w-4 h-4" />
            <span>لوحة التحكم بالمواعيد والاختبار</span>
          </button>
        </div>

        {/* Camp Header Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full font-black text-xs shadow-md animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>معسكر المراجعة المكثف</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-amber-600 to-rose-600 dark:from-slate-100 dark:via-amber-400 dark:to-rose-400 tracking-tight leading-tight">
            معسكر الورقة الأولى للأطفال
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg max-w-2xl mx-auto">
            مرحباً بك في المعسكر الشامل! قمنا بتقسيم أهم تفريدات وتحديدات الأطفال لثلاثة أيام منسقة لتضمن أعلى درجات التميز في الورقة الأولى.
          </p>
        </div>

        {/* 3 Days Interactive Chapters Section */}
        <div className="space-y-6">
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((day) => (
              <button
                key={day}
                onClick={() => { playSound('click'); setActiveDay(day); }}
                className={`relative px-8 py-4 rounded-2xl font-black text-sm md:text-base transition-all duration-300 shadow-md ${
                  activeDay === day 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white scale-[1.04]'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-amber-500/10'
                }`}
              >
                اليوم {day === 1 ? 'الأول' : day === 2 ? 'الثاني' : 'الثالث'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {DAY_CHAPTERS[activeDay].map((chap, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleChapterClick(chap)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-md hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div className="space-y-3">
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                      {chap.subjectId.replace('_', ' ')}
                    </span>
                    <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-3">
                      {chap.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 text-xs font-black text-amber-600 dark:text-amber-400">
                    <span>افتح المجلد التفاعلي</span>
                    <span className="transform group-hover:-translate-x-1.5 transition-transform">←</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mid-Camp Interactive Grid: PDFs and Testing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          
          {/* PDF Download Center */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 space-y-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">مركز تحميل الـ PDF</h2>
                <p className="text-sm font-bold text-slate-455">حمل مذكرات الأسئلة والشروحات الخاصة بالمعسكر.</p>
              </div>
            </div>

            <div className="space-y-4">
              {PDF_RESOURCES.map((pdf) => (
                <div 
                  key={pdf.id}
                  className="bg-white dark:bg-slate-955 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-xl flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-200">{pdf.title}</h4>
                      <p className="text-[11px] text-slate-450 font-bold flex items-center gap-2">
                        <span>الحجم: {pdf.size}</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400">{pdf.type}</span>
                      </p>
                    </div>
                  </div>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); playSound('click'); alert(`جاري تحضير ملف ${pdf.title} للتحميل المباشر...`); }}
                    className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Timed & Scheduled Matching Test Box */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 space-y-6 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                  <Award className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white">اختبار التوصيل التفاعلي</h2>
                  <p className="text-sm font-bold text-slate-455">اختبر معلوماتك في تشخيص حالات الأطفال بوقت وموعد محدد.</p>
                </div>
              </div>

              {/* Status banner */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/80 rounded-2xl p-4 flex items-center gap-4">
                <Clock className="w-5 h-5 text-amber-500" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400">مدة الاختبار المحددة</p>
                  <p className="text-sm font-black text-slate-850 dark:text-slate-200">{durationMins} دقيقة كاملة</p>
                </div>
              </div>
            </div>

            {/* Test Action Box */}
            <div className="pt-6">
              {examState === 'locked' ? (
                <div className="space-y-4 text-center p-6 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-[2rem]">
                  <ShieldAlert className="w-12 h-12 mx-auto text-amber-500 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-slate-800 dark:text-slate-200">هذا الاختبار مغلق حالياً</h4>
                    <p className="text-xs font-bold text-slate-400">سيفتح الاختبار تلقائياً بعد انتهاء الوقت التالي:</p>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-wider">
                    {formatCountdown(timeRemainingToStart)}
                  </div>
                </div>
              ) : examState === 'ready' ? (
                <button
                  onClick={startMatchingTest}
                  className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-lg transition-all shadow-lg hover:shadow-rose-500/20 hover:scale-[1.01] flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>دخول اختبار التوصيل الآن</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-black text-rose-500 bg-rose-500/10 p-3 rounded-xl animate-pulse">
                    <span>الاختبار قيد التشغيل حالياً!</span>
                    <button 
                      onClick={() => { playSound('click'); setExamState('ready'); }}
                      className="text-xs underline"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                  <button
                    onClick={() => { playSound('click'); setExamState('active'); }}
                    className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black transition-all hover:scale-[1.01]"
                  >
                    عرض نافذة الاختبار
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Popups & Overlays */}
      
      {/* 1. Scheduler Control Settings Popup */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] w-full max-w-md p-8 space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => { playSound('click'); setShowSettings(false); }}
                className="absolute top-6 left-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <span>تعديل إعدادات وجدولة الاختبار</span>
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  لوحة تحكم مرنة تتيح لك برمجة الموعد والوقت لتجربة الطلاب.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">تاريخ ووقت بدء الاختبار</label>
                  <input 
                    type="datetime-local" 
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-600 font-bold mt-1">تلميح: اختر تاريخاً مستقبلياً لاختبار شاشة العد التنازلي.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500">مدة الاختبار (بالدقائق)</label>
                  <input 
                    type="number" 
                    value={durationMins}
                    onChange={(e) => setDurationMins(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={saveSettings}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl font-black text-sm hover:opacity-90 transition-opacity"
                >
                  حفظ التعديلات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Active Matching Gameplay Overlay */}
      <AnimatePresence>
        {examState === 'active' && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div 
              ref={containerRef}
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-[3rem] p-6 md:p-8 flex flex-col justify-between text-white relative shadow-2xl overflow-hidden"
            >
              {/* SVG Overlay covering the entire parent coordinate system */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                {renderTick > -1 && renderLines()}
              </svg>

              {/* Decorative accents */}
              <div className="absolute top-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Game Top Info */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-black text-amber-500 tracking-tight">
                      {DAY1_MATCHING_SETS[currentSetIdx].title}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">
                      {DAY1_MATCHING_SETS[currentSetIdx].description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-slate-950 border border-slate-800 px-5 py-2.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="font-mono text-lg font-bold text-rose-500">
                      {Math.floor(testTimeLeft / 60)}:{(testTimeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-slate-800" />
                  <div className="text-xs font-black text-slate-400">
                    السؤال (المجموعة): <span className="text-amber-500">{currentSetIdx + 1}</span> / {DAY1_MATCHING_SETS.length}
                  </div>
                </div>
              </div>

              {/* Matching Board Grid */}
              <div 
                ref={scrollContainerRef}
                className="game-scroll-container grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 my-8 overflow-y-auto flex-1 px-4 relative"
                dir="ltr"
              >
                {/* Column 1: Questions (Clinical Signs - Left Items) */}
                <div className="flex-1 flex flex-col gap-4 relative z-20">
                  <h4 className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest text-center mb-2">العلامة أو المصطلح</h4>
                  {gameQuestions.map((q) => {
                    const matchedAnsId = matches[q.id];
                    const isActive = activeSelection?.id === q.id && activeSelection?.side === 'left';
                    
                    let borderClass = 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-700';
                    if (isActive) borderClass = 'border-amber-400 bg-amber-500/10 shadow-md scale-[1.02] ring-2 ring-amber-500/30';
                    else if (matchedAnsId) borderClass = 'border-amber-500/30 bg-slate-950/80 text-slate-200 shadow-inner';

                    return (
                      <div
                        key={`left_${q.id}`}
                        ref={el => { itemRefs.current[`left_${q.id}`] = el; }}
                        onClick={() => {
                          if (matchedAnsId) handleItemDisconnect(q.id, 'left');
                          else handleItemClick(q.id, 'left');
                        }}
                        className={`
                          relative text-right p-4 rounded-2xl border-2 transition-all font-black text-sm md:text-base leading-relaxed cursor-pointer z-20 select-none
                          ${borderClass}
                        `}
                        dir="rtl"
                      >
                        {q.text}
                        {/* Dot on the right edge of left column Question card */}
                        <div className={`absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-slate-950 transition-colors ${isActive || matchedAnsId ? 'border-amber-500 scale-125' : 'border-slate-800'}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Column 2: Answers (Diagnosis - Right Items) */}
                <div className="flex-1 flex flex-col gap-4 relative z-20">
                  <h4 className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest text-center mb-2">الوصف العلمي المطابق</h4>
                  {gameAnswers.map((a) => {
                    const matchedQId = Object.keys(matches).find(key => matches[key] === a.id);
                    const isActive = activeSelection?.id === a.id && activeSelection?.side === 'right';
                    
                    let borderClass = 'border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-700';
                    if (isActive) borderClass = 'border-amber-400 bg-amber-500/10 shadow-md scale-[1.02] ring-2 ring-amber-500/30';
                    else if (matchedQId) borderClass = 'border-amber-500/30 bg-slate-950/80 text-slate-200 shadow-inner';

                    return (
                      <div
                        key={`right_${a.id}`}
                        ref={el => { itemRefs.current[`right_${a.id}`] = el; }}
                        onClick={() => {
                          if (matchedQId) handleItemDisconnect(a.id, 'right');
                          else handleItemClick(a.id, 'right');
                        }}
                        className={`
                          relative text-right p-4 rounded-2xl border-2 transition-all font-bold text-xs leading-relaxed cursor-pointer z-20 select-none
                          ${borderClass}
                        `}
                        dir="rtl"
                      >
                        {/* Dot on the left edge of right column Answer card */}
                        <div className={`absolute top-1/2 -left-3 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-slate-950 transition-colors ${isActive || matchedQId ? 'border-amber-500 scale-125' : 'border-slate-800'}`} />
                        {a.text}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Game Bottom Actions */}
              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <button
                  onClick={() => { playSound('click'); setExamState('ready'); }}
                  className="px-6 py-3 bg-slate-850 hover:bg-slate-800 text-slate-350 rounded-xl font-bold text-xs transition-colors"
                >
                  انسحاب وإغلاق النافذة
                </button>
                
                {isSetCompleted ? (
                  <motion.button
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={handleNextSet}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/15 flex items-center gap-2"
                  >
                    <span>{currentSetIdx === DAY1_MATCHING_SETS.length - 1 ? 'تسليم الكويز وإنهاء الاختبار' : 'إرسال والانتقال للسؤال التالي'}</span>
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </motion.button>
                ) : (
                  <div className="text-xs font-bold text-slate-500">
                    أجب على جميع النقاط في المجموعة الحالية لفتح زر الإرسال. (حدد السؤال أولاً ثم اضغط على الاختيار المناسب له)
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. finished Test Score overlay */}
      <AnimatePresence>
        {examState === 'finished' && (
          <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-55 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-lg p-10 text-center text-white space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px]" />

              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                  <Award className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black">أحسنت يا بطل! اكتمل الاختبار</h2>
                <p className="text-sm font-bold text-slate-400">نتيجتك النهائية في معسكر الورقة الأولى هي:</p>
              </div>

              {/* Score circular badge */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center bg-slate-950 border-4 border-slate-800 rounded-full">
                <div className="space-y-1">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
                    {score}%
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">التقييم العام</p>
                </div>
              </div>

              {/* feedback message */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-sm font-bold text-slate-300">
                {score >= 80 
                  ? 'رائع جداً! مستواك متميز ومستعد تماماً لاجتياز الورقة الأولى بتفوق باهر.' 
                  : score >= 50 
                    ? 'جيد جداً! لديك أساس قوي ولكن مراجعة بعض شباتر المعسكر ستضمن لك الدرجة الكاملة.'
                    : 'فرصة رائعة للمذاكرة! أعد تصفح مجلدات الأيام الثلاثة وأعد الاختبار لتحقق درجة أفضل.'}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { playSound('click'); setExamState('ready'); }}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-2xl font-black text-sm hover:scale-[1.01] transition-transform"
                >
                  العودة للمعسكر
                </button>
                <button
                  onClick={() => { playSound('click'); startMatchingTest(); }}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-black text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
