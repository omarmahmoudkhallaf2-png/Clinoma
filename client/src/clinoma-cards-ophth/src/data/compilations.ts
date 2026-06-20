export interface CompilationItem {
  id: number;
  titleAr: string;
  titleEn: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo' | 'purple';
  icon: string;
  isTable?: boolean;
  isDualCol?: boolean;
  introAr?: string;
  colHeaders?: { col1: string; col2: string };
  listItems?: {
    term: string;
    desc?: string;
    type?: string; 
    bulletPoints?: string[];
  }[];
  tableData?: {
    col1: string[];
    col2: string[];
  };
}

export const COMPILATIONS: CompilationItem[] = [
  {
    id: 1,
    titleAr: "Causes of Painless Visual Loss",
    titleEn: "Causes of Painless Visual Loss",
    badge: "Clinical Key",
    badgeColor: "emerald",
    icon: "👁️",
    listItems: [
      { term: "Cataract", desc: "(Senile, Complicated, Congenital)." },
      { term: "Primary Open Angle Glaucoma (POAG)", desc: "(Asymptomatic until late stages, peripheral field loss)." },
      { term: "Choroiditis", desc: "(Posterior uveitis - unless the macula is involved)." },
      { term: "Retinal Detachment", desc: "(If macular off, described as a progressive black curtain, usually painless)." },
      { term: "Diabetic Retinopathy", desc: "(Gradual, often asymptomatic until macula involved)." },
      { term: "Keratoconus", desc: "(Gradual progressive myopic astigmatism, no pain)." },
      { term: "Optic Atrophy", desc: "(Gradual failure, concentric contraction of fields)." },
      { term: "Retinitis Pigmentosa", desc: "(Night blindness and peripheral loss)." }
    ]
  },
  {
    id: 2,
    titleAr: "Causes of Painful Visual Loss",
    titleEn: "Causes of Painful Visual Loss",
    badge: "Pain Clues",
    badgeColor: "rose",
    icon: "⚡",
    listItems: [
      { term: "Hypopyon Ulcer (Acute Serpiginous Ulcer)", desc: "Stitching pain, photophobia." },
      { term: "Acute Congestive Angle Closure Glaucoma", desc: "Severe periocular pain, nausea, vomiting." },
      { term: "Iridocyclitis (Acute)", desc: "Neuralgic pain (worse at night, referred to eyebrow)." },
      { term: "Endophthalmitis / Panophthalmitis", desc: "Severe pain with red eye and drop of vision." },
      { term: "Herpes Zoster Ophthalmicus", desc: "Severe neuralgic pain before vesicles." },
      { term: "Chemical Injuries", desc: "Severe burning and pain (emergency)." }
    ]
  },
  {
    id: 3,
    titleAr: "Causes of Shallow Anterior Chamber (AC)",
    titleEn: "Causes of Shallow Anterior Chamber (AC)",
    badge: "Glaucoma Prep",
    badgeColor: "amber",
    icon: "🔍",
    listItems: [
      { term: "Hypermetropia (High)", desc: "Small eye, crowded angle." },
      { term: "Intumescent Cataract (Phacomorphic Glaucoma)", desc: "Swollen lens pushes iris forward." },
      { term: "Primary Angle Closure Glaucoma (PACG)", desc: "Pupillary block, iris bombe." },
      { term: "Anterior Dislocation / Subluxation of the Lens" },
      { term: "Posterior Synechiae (Seclusio-pupillae)", desc: "Iris bombe due to 360° adhesions." }
    ]
  },
  {
    id: 4,
    titleAr: "Causes of Deep Anterior Chamber (AC)",
    titleEn: "Causes of Deep Anterior Chamber (AC)",
    badge: "AC Anatomy",
    badgeColor: "blue",
    icon: "🚇",
    listItems: [
      { term: "High Myopia", desc: "Enlarged globe." },
      { term: "Aphakia", desc: "(After cataract extraction)." },
      { term: "Hypermature Senile Cortical Cataract", desc: "(Shrinkage of lens, reappearance of iris shadow)." },
      { term: "Anterior Chamber Paracentesis", desc: "(Post-procedural)." }
    ]
  },
  {
    id: 5,
    titleAr: "Causes of Cataract",
    titleEn: "Causes of Cataract",
    badge: "Comprehensive Cataract",
    badgeColor: "purple",
    icon: "🔮",
    listItems: [
      { 
        term: "Senile", 
        desc: "Cortical (75%), Nuclear (25%), Cortico-nuclear." 
      },
      { 
        term: "Congenital & Developmental", 
        desc: "Hereditary, Rubella (1st trimester), Galactosemia, Lowe Syndrome, Hypoglycemia, Anterior/Posterior polar, Zonular, Blue-dotted, Coronary." 
      },
      { 
        term: "Complicated (Local Eye Disease)", 
        desc: "Corneal ulcer, Iridocyclitis, Glaucoma, Retinal Detachment, Degenerative Myopia, Retinitis Pigmentosa, Intraocular tumors, Prolonged topical steroids." 
      },
      { 
        term: "Complicated (Systemic Disease / Presenile)", 
        desc: "Diabetes Mellitus, Hypoparathyroidism, Galactosemia, Myotonic Dystrophy, Atopic Dermatitis, Neurofibromatosis." 
      },
      { 
        term: "Traumatic (Concussion)", 
        desc: "Rosette-shaped (posterior cortex)." 
      },
      { 
        term: "Traumatic (Perforating)", 
        desc: "Ruptured capsule." 
      },
      { 
        term: "Traumatic (Physical)", 
        desc: "Infra-red (Glass blower's), Radiation, Electrical." 
      }
    ]
  },
  {
    id: 6,
    titleAr: "Causes of Red Eye",
    titleEn: "Causes of Red Eye",
    badge: "Red Eye Differential",
    badgeColor: "rose",
    icon: "🔴",
    listItems: [
      { term: "Conjunctivitis", desc: "(Mucopurulent, Purulent, Viral, Allergic)." },
      { term: "Keratitis (Corneal Ulcer)", desc: "Ciliary injection, photophobia." },
      { term: "Iridocyclitis", desc: "Ciliary injection, miosis, KPs." },
      { term: "Acute Angle Closure Glaucoma", desc: "Congested, hazy cornea, fixed semi-dilated pupil." },
      { term: "Scleritis / Episcleritis" },
      { term: "Subconjunctival Hemorrhage", desc: "(Traumatic/spontaneous)." }
    ]
  },
  {
    id: 7,
    titleAr: "Causes of Epiphora (Watering Eye)",
    titleEn: "Causes of Epiphora (Watering Eye)",
    badge: "Lacrimal Path",
    badgeColor: "indigo",
    icon: "💧",
    listItems: [
      { 
        term: "Lacrimation (Over-secretion)", 
        desc: "Psychic, Bright light, Trigeminal irritation, Nasal irritation." 
      },
      { 
        term: "Pump Failure", 
        desc: "Ectropion, Irregular lid margin, Bell's palsy (paralysis of orbicularis)." 
      },
      { 
        term: "Obstruction (Puncta/Canaliculi)", 
        desc: "Congenital absence, Trachomatous scarring, Trauma." 
      },
      { 
        term: "Obstruction (Lacrimal Sac)", 
        desc: "Dacryocystitis, Tumors." 
      },
      { 
        term: "Obstruction (Nasolacrimal Duct)", 
        desc: "Imperforate Hasner's valve, Congestion (50%), Fungal, Fractures, Tumors." 
      },
      { 
        term: "Obstruction (Nose conditions)", 
        desc: "Adenoids, Nasal polyps, Deviated septum, Hypertrophied turbinate." 
      }
    ]
  },
  {
    id: 8,
    titleAr: "Causes of Ptosis (Drooping Eyelid)",
    titleEn: "Causes of Ptosis (Drooping Eyelid)",
    badge: "Eyelid Path",
    badgeColor: "indigo",
    icon: "😑",
    listItems: [
      { term: "Congenital", desc: "Levator dysgenesis (with Marcus Gunn Jaw-winking)." },
      { term: "Neurogenic", desc: "3rd Nerve palsy, Horner's syndrome (mild ptosis + miosis + anhidrosis)." },
      { term: "Myogenic", desc: "Myasthenia Gravis (worse in evening, relieved by Prostigmine), Muscular dystrophy." },
      { term: "Aponeurotic (Senile)", desc: "Degenerative changes." },
      { term: "Traumatic", desc: "Direct injury to levator." },
      { term: "Mechanical", desc: "Tumors, Chalazia, Spring catarrh, Blepharochalasis." },
      { term: "Hysterical", desc: "Young females." },
      { term: "Pseudoptosis", desc: "Enophthalmos, Loss of orbital fat, Atrophic eye." }
    ]
  },
  {
    id: 9,
    titleAr: "Causes of Proptosis (Unilateral vs Bilateral)",
    titleEn: "Causes of Proptosis (Unilateral vs Bilateral)",
    badge: "Orbit Prep",
    badgeColor: "purple",
    icon: "👁️‍🗨️",
    listItems: [
      { term: "Unilateral (Congenital)", desc: "Dermoid cyst." },
      { term: "Unilateral (Traumatic)", desc: "Retrobulbar hemorrhage, Emphysema." },
      { term: "Unilateral (Inflammatory)", desc: "Orbital cellulitis, Pseudotumor." },
      { term: "Unilateral (Vascular)", desc: "Orbital varices, Carotid-cavernous fistula." },
      { term: "Unilateral (Neoplastic)", desc: "Hemangioma (benign), Rhabdomyosarcoma, Glioma, Metastases." },
      { term: "Bilateral (Most common: TED)", desc: "Thyroid Eye Disease (TED - most common), Cavernous Sinus Thrombosis." }
    ]
  },
  {
    id: 10,
    titleAr: "Causes of Secondary Glaucoma",
    titleEn: "Causes of Secondary Glaucoma",
    badge: "Glaucoma Match",
    badgeColor: "amber",
    icon: "🟢",
    listItems: [
      { term: "Lens-induced (Phacolytic)", desc: "Hypermature cataract - protein blocking TM." },
      { term: "Lens-induced (Phacoanaphylactic)", desc: "Trauma/ECCE - lens protein reaction." },
      { term: "Lens-induced (Phacomorphic)", desc: "Intumescent cataract - pupillary block." },
      { term: "Lens-induced (Pseudo-exfoliation)", desc: "Abnormal deposits." },
      { term: "Inflammatory", desc: "Iridocyclitis (edema of TM or PAS)." },
      { term: "Traumatic", desc: "Angle recession, Hyphema, Corneal laceration with iris incarceration." },
      { term: "Vascular (Rubeosis iridis)", desc: "CRVO, PDR ➔ Neovascular glaucoma." },
      { term: "Drug-induced", desc: "Steroid-induced (MPS deposition in TM)." },
      { term: "Posterior Segment", desc: "Retinoblastoma, CRVO." }
    ]
  },
  {
    id: 11,
    titleAr: "Causes of Vitreous Hemorrhage",
    titleEn: "Causes of Vitreous Hemorrhage",
    badge: "Retina Key",
    badgeColor: "rose",
    icon: "🩸",
    listItems: [
      { term: "Posterior Vitreous Detachment (PVD)" },
      { term: "Retinal breaks / Retinal detachment" },
      { term: "Trauma" },
      { term: "Central Retinal Vein Occlusion (CRVO)" },
      { term: "Proliferative Diabetic Retinopathy (PDR)" },
      { term: "Blood diseases", desc: "(Anemia, Leukemia, Sickle cell)." }
    ]
  },
  {
    id: 12,
    titleAr: "Causes of Retinal Detachment (RD)",
    titleEn: "Causes of Retinal Detachment (RD)",
    badge: "Retina Master",
    badgeColor: "rose",
    icon: "🖼️",
    listItems: [
      { term: "Rhegmatogenous", desc: "Retinal breaks (high myopia, aphakia, trauma, lattice degeneration)." },
      { term: "Tractional", desc: "Proliferative Diabetic Retinopathy (PDR), ROP, Sickle cell retinopathy, Posterior segment trauma." },
      { term: "Exudative (Serous)", desc: "Choroidal tumors (Melanoma), Inflammation (Harada's disease, Coat's), Toxemia of pregnancy, Malignant hypertension." }
    ]
  },
  {
    id: 13,
    titleAr: "Causes of Corneal Ulcer (Keratitis)",
    titleEn: "Causes of Corneal Ulcer (Keratitis)",
    badge: "Cornea Path",
    badgeColor: "blue",
    icon: "🕸️",
    listItems: [
      { term: "Bacterial (Infective)", desc: "Pneumococcus (Hypopyon ulcer), Pseudomonas, Staph, Strep, Morax-Axenfeld." },
      { term: "Viral (Infective)", desc: "Herpes Simplex (Dendritic), Herpes Zoster Ophthalmicus." },
      { term: "Fungal (Infective)", desc: "Candida (immunocompromised), Fusarium/Aspergillus (vegetative trauma)." },
      { term: "Neurotrophic (Non-Infective)", desc: "Absent corneal sensation." },
      { term: "Exposure (Non-Infective)", desc: "Lagophthalmos, Ectropion." },
      { term: "Allergic (Non-Infective)", desc: "Phlyctenular, Marginal ulcers." }
    ]
  },
  {
    id: 14,
    titleAr: "Causes of Corneal Opacity (Scars)",
    titleEn: "Causes of Corneal Opacity (Scars)",
    badge: "Cornea Scars",
    badgeColor: "blue",
    icon: "🌫️",
    listItems: [
      { term: "Nebula", desc: "Faint scar (superficial ulcers)." },
      { term: "Macula", desc: "Localized scar (intermediate density)." },
      { term: "Leucoma", desc: "Dense white scar (deep ulcers)." },
      { term: "Adherent Leucoma", desc: "Leucoma with iris incarcerated." },
      { term: "Keratoconus", desc: "(Apex opacities)." },
      { term: "Trachomatous Pannus", desc: "(Cicatrized pannus)." }
    ]
  },
  {
    id: 15,
    titleAr: "Causes of Optic Atrophy",
    titleEn: "Causes of Optic Atrophy",
    badge: "Neuro Key",
    badgeColor: "purple",
    icon: "🔌",
    listItems: [
      { term: "Primary", desc: "MS (commonest), Neurosyphilis, Fracture base of skull, Pituitary tumors, Ischemia (blood loss)." },
      { term: "Secondary", desc: "Post-papilledmic (raised ICT), Post-neuritic (papillitis)." },
      { term: "Consecutive", desc: "Central Retinal Artery Occlusion (CRAO), Retinitis Pigmentosa." },
      { term: "Post-glaucomatous", desc: "Glaucomatous cupping." }
    ]
  },
  {
    id: 16,
    titleAr: "Causes of Leukocoria (White Pupil)",
    titleEn: "Causes of Leukocoria (White Pupil)",
    badge: "Pediatric Clues",
    badgeColor: "purple",
    icon: "⚪",
    listItems: [
      { term: "Congenital Cataract", desc: "(Zonular, Total rubella)." },
      { term: "Retinoblastoma", desc: "(Intraocular tumor)." },
      { term: "Retinopathy of Prematurity (ROP)", desc: "- Stage 5." },
      { term: "Persistent Hyperplastic Primary Vitreous (PHPV)" },
      { term: "Coats' disease", desc: "(Exudative retinitis)." },
      { term: "Cyclitic Membrane", desc: "(Organized exudates behind lens in severe uveitis)." },
      { term: "Endophthalmitis", desc: "(Amaurotic cat's eye - yellowish reflex)." }
    ]
  },
  {
    id: 17,
    titleAr: "Causes of Lagophthalmos",
    titleEn: "Causes of Lagophthalmos",
    badge: "Lids & Protection",
    badgeColor: "indigo",
    icon: "😳",
    listItems: [
      { term: "General Conditions", desc: "Extreme debility, Unconsciousness, General anesthesia." },
      { term: "Physiological", desc: "Sleep (children)." },
      { term: "Pathological Lid", desc: "Severe ectropion, Coloboma, Post-surgical (ptosis overcorrection), Spastic lid retraction (Thyroid), Facial palsy (LMN)." },
      { term: "Pathological Globe", desc: "Proptosis, Anterior staphyloma, Buphthalmos." }
    ]
  },
  {
    id: 18,
    titleAr: "Types of Pannus",
    titleEn: "Types of Pannus",
    badge: "Exam Differentials",
    badgeColor: "emerald",
    icon: "🌱",
    listItems: [
      { term: "Trachomatous", desc: "Upper, serrated border, variable cells/vessels." },
      { term: "Phlyctenular", desc: "Any site, rounded border, very vascular straight vessels." },
      { term: "Leprotic", desc: "Any site, irregular, deep infiltration, few vessels." },
      { term: "Degenerative", desc: "Any site, irregular, fibrous tissue." }
    ]
  },
  {
    id: 19,
    titleAr: "Complications of Iridocyclitis",
    titleEn: "Complications of Iridocyclitis",
    badge: "High-Yield Complex",
    badgeColor: "rose",
    icon: "🔥",
    listItems: [
      { term: "Synechiae (Anterior & Posterior)", desc: "PAS ➔ Glaucoma; Posterior (Seclusio-pupillae, Total) ➔ Iris bombe (pupillary expansion blockage)." },
      { term: "Occlusio-pupillae", desc: "Organized exudates blocking pupil." },
      { term: "Cyclitic membrane", desc: "Pseudo-glioma, Retinal Detachment." },
      { term: "Secondary Glaucoma", desc: "Early: caused by plasmoid/hypopyon; Late: caused by PAS/Iris bombe." },
      { term: "Complicated Cataract", desc: "Posterior cortical opacification." },
      { term: "Severe Inflammations", desc: "Endophthalmitis / Panophthalmitis." },
      { term: "Atrophia bulbi", desc: "Atrophy and shrinkage of the eyeball." }
    ]
  },
  {
    id: 20,
    titleAr: "Causes of Miosis vs Mydriasis",
    titleEn: "Causes of Miosis vs Mydriasis",
    badge: "Comparison Table",
    badgeColor: "teal" as any,
    icon: "🌓",
    isTable: true,
    colHeaders: { col1: "Miosis (Constricted Pupil)", col2: "Mydriasis (Dilated Pupil)" },
    tableData: {
      col1: [
        "**Physiological**: Light reflex, Sleep, Old age",
        "**Drugs**: Miotics, Morphine poisoning",
        "**Local**: Acute iridocyclitis, Trauma, Puncture of AC",
        "**Neurological**: Horner's syndrome, Argyll Robertson pupil, Pontine hemorrhage"
      ],
      col2: [
        "**Physiological**: Darkness, Emotions, Stress",
        "**Drugs**: Mydriatics, Datura poisoning",
        "**Local**: Trauma, Acute congestive glaucoma, Blind eye",
        "**Neurological**: 3rd Nerve palsy, Hutchinson pupil (advanced), Coma (except morphine/pontine)"
      ]
    }
  },
  {
    id: 21,
    titleAr: "Preauricular Lymphadenopathy Causes",
    titleEn: "Preauricular Lymphadenopathy Causes",
    badge: "conjunctiva & Glnds",
    badgeColor: "emerald",
    icon: "🎯",
    listItems: [
      { term: "Acute Inclusion Conjunctivitis", desc: "(Chlamydia)." },
      { term: "Adenoviral Infection", desc: "(EKC & PCF)." },
      { term: "Acute Trachoma" },
      { term: "Parinaud Oculoglandular Syndrome" }
    ]
  },
  {
    id: 22,
    titleAr: "Causes of Hyphema",
    titleEn: "Causes of Hyphema",
    badge: "AC Blood",
    badgeColor: "rose",
    icon: "🥊",
    listItems: [
      { term: "Trauma (Blunt trauma)", desc: "Most common etiology." },
      { term: "Iridocyclitis", desc: "Hemorrhagic iritis (Diabetes, Gout, Herpes, TB)." },
      { term: "Intraocular tumors" },
      { term: "Rubeosis iridis", desc: "(Iris Neovascularization)." }
    ]
  },
  {
    id: 23,
    titleAr: "Indications for Specific Surgeries",
    titleEn: "Indications for Specific Surgeries",
    badge: "Operations Master",
    badgeColor: "indigo",
    icon: "✂️",
    listItems: [
      { term: "Dacryocystorhinostomy (DCR)", desc: "Chronic dacryocystitis, failed probing in adults." },
      { term: "Trabeculectomy", desc: "POAG failed medical/laser, Chronic PACG." },
      { term: "Enucleation", desc: "Blind painful eye, Retinoblastoma, Sympathetic ophthalmia, Deformed eye." },
      { term: "Evisceration", desc: "Endophthalmitis, Panophthalmitis, Expulsive hemorrhage." },
      { term: "Exenteration", desc: "Malignant orbital tumors, Malignant lid/conjunctival tumors." },
      { term: "Keratoplasty (Penetrating)", desc: "Keratoconus, Corneal opacities, Resistant ulcers, Corneal fistula." }
    ]
  }
];
