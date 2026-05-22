import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, Search, ArrowRight, BookOpen, ChevronLeft, Eye, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

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

const PEDIATRICS_SLIDES: Record<string, string[]> = {
  'cardiovascular_diseases': [
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
  'endocrinology': [
    'ADRENAL GLAND DISORDERS & CUSHING SYNDROME.jpeg',
    'CHILDHOOD OBESITY.jpeg',
    'DIABETES MELLITUS (DM) DIABETIC KETOACIDOSIS (DKA).jpeg',
    'INTRODUCTION TO ENDOCRINE SYSTEM.jpeg',
    'PARATHYROID GLAND DISORDERS.jpeg',
    'PUBERTY and DISORDERS.jpeg',
    'SHORT STATURE & TALL STATURE.jpeg',
    'THYROID GLAND DISORDERS.jpeg'
  ],
  'gastroenterology_hepatology': [
    'Acute & Recurrent Abdominal Pain (RAP).jpeg',
    'Acute Diarrhea & Dehydration Assessment.jpeg',
    'Acute Viral & Autoimmune Hepatitis.jpeg',
    'COW MILK ALLERGY & LACTOSE INTOLERANCE.jpeg',
    'Diarrhea Management & Rehydration Protocols.jpeg',
    'GERD & Hypertrophic Pyloric Stenosis (CHIPS).jpeg',
    'Gastrointestinal Bleeding (UGIB & LGIB).jpeg',
    'Hepatomegaly & Hepatosplenomegaly (HSM).jpeg',
    'Hirschsprung Disease vs. Functional Constipation.jpeg',
    'Inborn Errors of Metabolism & Phenylketonuria (PKU).jpeg',
    'Pediatric Inflammatory Bowel Disease (IBD).jpeg'
  ],
  'genetic_diseases': [
    'CHROMOSOMAL ABERRATIONS & DISORDERS.jpeg',
    'CHROMOSOMAL ANALYSIS & FAMILY PEDIGREE.jpeg',
    'INTRODUCTION TO GENETICS & BASIC CONCEPTS.jpeg',
    'PATTERNS OF SINGLE GENE INHERITANCE.jpeg',
    'PREVENTIVE GENETICS.jpeg'
  ],
  'growth_development': [
    'BIOLOGICAL AGE & MATURATION (BONE & TEETH).jpeg',
    'DEVELOPMENTAL MILESTONES & NEURODEVELOPMENT.jpeg',
    'PEDIATRIC GROWTH.jpeg'
  ],
  'hematology_oncology': [
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
  'infections': [
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
  'neurology': [
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
  'nutrition': [
    'ARTIFICIAL & COMPLEMENTARY FEEDING (WEANING).jpeg',
    'BREASTFEEDING MANAGEMENT & CHALLENGES.jpeg',
    'HUMAN MILK STAGES, COMPOSITION & ADVANTAGES.jpeg',
    'PROTEIN ENERGY MALNUTRITION (PEM).jpeg',
    'RICKETS & TETANY.jpeg',
    'THE FOUNDATIONS OF INFANT FEEDING.jpeg'
  ],
  'renal_diseases': [
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

export default function PediatricsHub() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const currentSubject = subjectId ? SUBJECT_MAP[subjectId] : null;
  const slides = subjectId ? PEDIATRICS_SLIDES[subjectId] || [] : [];

  if (!currentSubject) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200">التخصص غير موجود</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-3 bg-primary text-white rounded-2xl">
          العودة للخلف
        </button>
      </div>
    );
  }

  const filteredSlides = slides.filter(slide => {
    const cleanTitle = slide.replace(/\.[^/.]+$/, "");
    return cleanTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0c0d12] p-6 md:p-12 space-y-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" dir="rtl">
          <button 
            onClick={() => navigate(`/course/pediatrics_course`)} 
            className="group self-start p-3 px-5 bg-white dark:bg-slate-900 border border-amber-100/60 dark:border-slate-800 rounded-2xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-all flex items-center gap-3 font-black text-xs shadow-sm text-slate-700 dark:text-slate-200"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> 
            <span>العودة للمنهج الرئيسي</span>
          </button>

          {/* Search Box */}
          <div className="relative max-w-md w-full" dir="rtl">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن لوحة بصرية أو مرض..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-750 dark:text-slate-200 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-black text-xs uppercase tracking-widest shadow-sm">
            <BookOpen className="w-4 h-4" />
            <span>{currentSubject.folderName}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {currentSubject.arabicName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg">
            اختر مجلد اللوحة البصرية للبدء في تصفح الشرح والأسئلة التفاعلية
          </p>
        </div>

        {/* Grid of Folders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" dir="rtl">
          {filteredSlides.length > 0 ? (
            filteredSlides.map((slide, index) => {
              const cleanTitle = slide.replace(/\.[^/.]+$/, "");
              const folderId = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
              const imagePath = `/assets/TIP-Peditrics/${currentSubject.folderName}/${slide}`;

              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.6) }}
                  onClick={() => navigate(`/course/pediatrics_course/subject/${subjectId}/folder/${folderId}`, { state: { slideName: slide } })}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[2rem] shadow-md hover:shadow-xl hover:border-amber-500/50 hover:-translate-y-1.5 transition-all p-5 text-right flex flex-col gap-5 relative overflow-hidden"
                >
                  {/* Folder Design Background Accent */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full -ml-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                  
                  {/* Visual Image Thumbnail & Icon */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-inner">
                    <img 
                      src={imagePath} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <div className="p-3 bg-white text-amber-600 rounded-full shadow-lg">
                        <Eye className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Folder className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-200 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                        {cleanTitle}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>مجلد دراسي تفاعلي شامل</span>
                      </p>
                    </div>
                  </div>

                  {/* Navigate Arrow */}
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-auto">
                    <span className="text-xs font-black text-amber-650 dark:text-amber-400 group-hover:underline">فتح المجلد الدراسي</span>
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:translate-x-[-4px] transition-transform" />
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-850 rounded-[2.5rem] space-y-4">
              <span className="text-5xl">🔍</span>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">لم يتم العثور على لوحات مطابقة</h3>
              <p className="text-slate-400 text-sm font-medium">حاول البحث باستخدام كلمات رئيسية أخرى.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
