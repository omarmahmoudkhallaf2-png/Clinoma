export interface SummaryTopic {
  title: string;
  bullets: string[];
}

export interface SummaryChapter {
  id: number;
  titleAr: string;
  titleEn: string;
  icon: string;
  topics: SummaryTopic[];
}

export const SUMMARY_NOTES: SummaryChapter[] = [
  {
    id: 1,
    titleAr: "الجفون",
    titleEn: "Eyelid",
    icon: "👁️",
    topics: [
      {
        title: "Gross Anatomy of the Eyelids",
        bullets: [
          "Two movable muco-cutaneous folds",
          "Upper eyelid covers 1–2 mm of cornea",
          "Palpebral fissure: elliptical space when eyelids open",
          "Canthi: angles of palpebral fissure",
          "Medial canthus: rounded, surrounds tear lake (Lacus lacrimalis) containing caruncle and plica semilunaris"
        ]
      },
      {
        title: "Layers of Eyelid (Outside to Inside)",
        bullets: [
          "1. Skin - thin, elastic, loosely adherent",
          "2. Subcutaneous areolar tissue - no fat",
          "3. Muscles layer - orbicularis oculi, levator palpebrae superioris, Muller's muscle",
          "4. Submuscular areolar tissue - contains peripheral arterial arcade and sensory nerves",
          "5. Fibrous layer - tarsal plates, meibomian glands, orbital septum",
          "6. Palpebral conjunctiva"
        ]
      },
      {
        title: "Orbicularis Oculi Muscle Parts",
        bullets: [
          "1. Orbital part - tight closure of eyelids",
          "2. Palpebral part - gentle closure (preseptal, pretarsal)",
          "3. Lacrimal part (Horner's muscle) - lacrimal pump",
          "Supplied by facial nerve (7th nerve)"
        ]
      },
      {
        title: "Levator Palpebrae Superioris",
        bullets: [
          "Origin: Lesser wing of sphenoid",
          "Insertion: anterior surface of tarsus, skin, lateral/medial horns, upper fornix",
          "Action: elevates upper eyelids"
        ]
      },
      {
        title: "Muller's Muscle",
        bullets: [
          "Origin: posterior aspect of levator",
          "Insertion: superior tarsal border",
          "Innervation: sympathetic nerves",
          "Action: sustains elevation of upper eyelid"
        ]
      },
      {
        title: "Blepharitis - Types",
        bullets: [
          "1. Anterior blepharitis - affects skin around eyelashes (staphylococcal or seborrheic)",
          "2. Posterior blepharitis - affects Meibomian glands (MGD)",
          "3. Mixed blepharitis - combination of both"
        ]
      },
      {
        title: "Anterior Blepharitis - Clinical Picture",
        bullets: [
          "Symptoms: burning (worse in morning), itching, lacrimation, photophobia, hair falling",
          "Squamous type: greasy grayish-white scales between lashes",
          "Ulcerative type: yellow crusts, bleeding ulcers when crusts removed"
        ]
      },
      {
        title: "Complications of Blepharitis",
        bullets: [
          "Trichiasis - scarring at lashes' roots",
          "Madarosis - destruction of hair follicles",
          "Ptylosis - destruction of sharp posterior border, leading to epiphora",
          "Multiple styes"
        ]
      },
      {
        title: "Hordeolum Externum (Stye)",
        bullets: [
          "Definition: Acute suppurative inflammation of Zeiss gland",
          "Etiology: Staphylococcus aureus",
          "Clinical: painful red swelling at eyelid margin, yellow point",
          "Treatment: warm compresses, topical antibiotics, drain by epilation with horizontal incision",
          "DO NOT PRESS - dangerous area (risk of orbital cellulitis, cavernous sinus thrombosis)"
        ]
      },
      {
        title: "Hordeolum Internum",
        bullets: [
          "Definition: Acute suppurative inflammation of Meibomian gland",
          "Clinical: more severe pain, swelling away from lid margin, yellow spot on conjunctival side",
          "Treatment: vertical/cruciate incision on conjunctival side"
        ]
      },
      {
        title: "Chalazion",
        bullets: [
          "Definition: Localized chronic inflammatory lipo-granuloma of Meibomian gland",
          "Clinical: painless swelling, skin freely mobile, red/bluish-grey conjunctiva",
          "Treatment: small - observation; large - incision and curettage; recurrent - excision biopsy",
          "Intralesional steroids (0.1 ml) may resolve chalazion"
        ]
      },
      {
        title: "Distichiasis",
        bullets: [
          "Definition: Congenital extra row of lashes from lid margin behind grey line",
          "Treatment: asymptomatic - none; symptomatic - direct removal or cryotherapy"
        ]
      },
      {
        title: "Trichiasis vs Rubbing Lashes",
        bullets: [
          "Rubbing lashes: ≤4 inward misdirected lashes",
          "Trichiasis: >4 lashes directed posteriorly rubbing cornea"
        ]
      },
      {
        title: "Entropion - Types",
        bullets: [
          "1. Congenital - hypertrophy of orbicularis, dehiscence of lower lid retractors",
          "2. Cicatricial - scarring (trachoma, burns, pemphigoid)",
          "3. Spastic - young age, reflex blepharospasm",
          "4. Senile (Involutional) - old age, horizontal laxity"
        ]
      },
      {
        title: "Ectropion - Types",
        bullets: [
          "1. Congenital - rare, associated with blepharophimosis",
          "2. Acquired:",
          "  - Cicatricial - scar in skin (burns, tumors, post-surgical)",
          "  - Senile (Involutional) - most common, gravity with redundant skin",
          "  - Mechanical - weight of tumor/chalazia",
          "  - Paralytic - facial nerve palsy (Bell's palsy)"
        ]
      },
      {
        title: "Lagophthalmos",
        bullets: [
          "Definition: Incomplete closure of palpebral fissure",
          "Degrees: Mild (closes with squeezing) vs Severe (cannot close)",
          "Complications: Exposure keratitis, corneal ulceration",
          "Treatment: temporary (ointment, plaster) or surgical (tarsorrhaphy)"
        ]
      },
      {
        title: "Ptosis",
        bullets: [
          "Definition: Drooping of upper eyelid (normally covers upper 1/6 of cornea)",
          "Types:",
          "  - Congenital - levator dysgenesis",
          "  - Neurogenic - 3rd nerve palsy, Horner's syndrome",
          "  - Myogenic - myasthenia gravis (worse in evening, relieved by anticholinesterases)",
          "  - Aponeurotic (Senile) - degenerative changes",
          "  - Traumatic - direct trauma",
          "  - Mechanical - increased weight",
          "  - Hysterical - young females",
          "Pseudoptosis: enophthalmos, loss of orbital fat"
        ]
      },
      {
        title: "Ptosis - Clinical Assessment",
        bullets: [
          "Amount: MRD (Mild 1-2mm, Moderate 3mm, Severe >4mm)",
          "Levator function: Poor ≤4mm, Fair 5-11mm, Good 11-14mm, Normal ≥15mm"
        ]
      },
      {
        title: "Ptosis Surgery",
        bullets: [
          "If levator has fair/good action: Resection and advancement (Blascovic or Everbusch)",
          "If levator function poor: Frontalis suspension (Hiss operation)",
          "Contraindications: recent 3rd nerve palsy, neuroparalytic keratitis, myasthenic ptosis, corneal anesthesia"
        ]
      }
    ]
  },
  {
    id: 2,
    titleAr: "الجهاز الدمعي",
    titleEn: "Lacrimal System",
    icon: "💧",
    topics: [
      {
        title: "Lacrimal Secretory System Components",
        bullets: [
          "1. Main orbital (superior) lacrimal gland",
          "2. Palpebral (inferior) lacrimal gland",
          "3. Accessory glands: Krause's (fornices), Wolfring (mid-tarsus), Meibomian, Zeis, Goblet cells"
        ]
      },
      {
        title: "Tear Film Layers",
        bullets: [
          "1. Outer lipid layer - Meibomian glands - prevents evaporation",
          "2. Middle aqueous layer - lacrimal glands - main bulk, antibacterial",
          "3. Inner mucin layer - goblet cells - hydrophilic surface"
        ]
      },
      {
        title: "Functions of Tears",
        bullets: [
          "Nutrition: O2 and glucose supply to cornea",
          "Optical: maintains optical uniformity",
          "Protection: wetting, washout, antimicrobial"
        ]
      },
      {
        title: "Lacrimal Drainage System",
        bullets: [
          "1. 2 Puncta (6mm from inner canthus)",
          "2. 2 Canaliculi (vertical 2mm, horizontal 8mm)",
          "3. Lacrimal sac (lacrimal fossa)",
          "4. Nasolacrimal duct (ends at inferior meatus, Hasner's valve)"
        ]
      },
      {
        title: "Tear Drainage",
        bullets: [
          "Evaporation: 25%",
          "Excretion: passive (gravity, capillarity) + active (pump mechanism by lacrimal sac)"
        ]
      },
      {
        title: "Epiphora - Etiology",
        bullets: [
          "1. Failure of pump mechanism (irregular margin, ectropion, Bell's palsy)",
          "2. Obstruction of drainage system:",
          "  - Puncta/canaliculi: congenital, trachomatous, traumatic",
          "  - Lacrimal sac: dacryocystitis, tumors",
          "  - Nasolacrimal duct: Hasner's valve, infection, fractures",
          "  - Nose: polyps, deviated septum"
        ]
      },
      {
        title: "Investigations for Epiphora",
        bullets: [
          "Regurgitation test: Press on lacrimal sac - positive if pus/tears reflux from puncta",
          "Jones test I: fluorescein instilled - stained cotton under turbinate = patent passages",
          "Jones test II: irrigation - partial block if fluorescein recovered, complete block if not",
          "Dacryocystography, Dacryoscintigraphy, CT scan"
        ]
      },
      {
        title: "Acute Dacryocystitis",
        bullets: [
          "Definition: Acute suppurative inflammation of lacrimal sac",
          "Etiology: NLD obstruction, pneumococci, staphylococci, streptococci",
          "Clinical: severe pain, epiphora, fever, tender swelling with redness",
          "Complications: lacrimal fistula, pyocele, orbital cellulitis, cavernous sinus thrombosis"
        ]
      },
      {
        title: "Chronic Dacryocystitis",
        bullets: [
          "Common in females at menopausal age",
          "Predisposing factors: long narrow duct, hypertrophied mucosa",
          "Clinical: epiphora with discharge, swelling below MPL, positive regurgitation",
          "Complications: hypopyon corneal ulcer, intraocular surgery infection, recurrent conjunctivitis"
        ]
      },
      {
        title: "Congenital Dacryocystitis - Stepwise Treatment",
        bullets: [
          "1. First 9–12 months: topical antibiotics + digital massage",
          "2. After 1 year: probing",
          "3. If probing fails: silastic intubation",
          "4. If intubation fails: Dacryocystorhinostomy"
        ]
      },
      {
        title: "Dacryocystorhinostomy (DCR)",
        bullets: [
          "Principle: Connect lacrimal sac to nasal mucosa of middle meatus",
          "Dacryocystectomy: indicated for TB of sac, neoplasms, fibrosis, associated hypopyon ulcer"
        ]
      },
      {
        title: "Keratoconjunctivitis Sicca (Dry Eye)",
        bullets: [
          "Most common cause of lacrimal gland atrophy",
          "Etiology: autoimmune, mucin deficiency (trachoma, burns, Vit A), senile, iatrogenic",
          "Diagnosis: Schirmer's test, Tear film break-up time (BUT), Rose Bengal staining",
          "Treatment: artificial tears, punctal occlusion, bandage contact lens, mucolytics, steroids"
        ]
      },
      {
        title: "Lacrimal Gland Tumors",
        bullets: [
          "Clinical: Up and temporal lid swelling, S-shaped deformity, mechanical ptosis, proptosis"
        ]
      }
    ]
  },
  {
    id: 3,
    titleAr: "الملتحمة",
    titleEn: "Conjunctiva",
    icon: "👁️‍🗨️",
    topics: [
      {
        title: "Conjunctiva - Histology",
        bullets: [
          "1. Epithelium: non-keratinized stratified squamous with goblet cells (mucous)",
          "2. Substantia propria:",
          "  - Superficial adenoid layer - loose CT with leukocytes",
          "  - Deep fibrous layer - blood vessels and nerves"
        ]
      },
      {
        title: "Mucopurulent Conjunctivitis (MPC)",
        bullets: [
          "Causative organisms: Koch-Week's bacillus (80%), staph, strep, pneumococci",
          "Clinical: discomfort, red eye, mucopurulent discharge, chemosis",
          "Complications: corneal ulcer, iritis",
          "Treatment: hot fomentation, antibiotics, dark glasses",
          "Bandage contraindicated (traps discharge)"
        ]
      },
      {
        title: "Purulent Conjunctivitis (Acute Blenorrhaea)",
        bullets: [
          "Organism: Gonococcus (80%) - gram negative diplococci",
          "Stages: Infiltration (2-3 days) → Discharge (2-3 weeks) → Chronic (2-3 months)",
          "Corneal ulcers common because: gonococci invade intact epithelium, conjunctival edema impairs nutrition",
          "Treatment: systemic broad-spectrum antibiotics, local antibiotics, mydriatics for corneal involvement"
        ]
      },
      {
        title: "Ophthalmia Neonatorum",
        bullets: [
          "Definition: Acute conjunctivitis in 1st month of life",
          "Transmission: maternal passage during labor",
          "Chemical: within hours, self-limited",
          "N. Gonorrhea: 24-48 hours, hyperacute, copious purulent discharge",
          "Chlamydia: 5-12 days, mild-moderate purulent",
          "Treatment: Benzyl penicillin/cefotaxime (gonococcal), erythromycin (chlamydia)"
        ]
      },
      {
        title: "Inclusion Conjunctivitis",
        bullets: [
          "Organism: Chlamydia oculogenitalis (serotypes D,E,F)",
          "Clinical: hyperemia, mucopurulent discharge, large follicles (lower palpebral), preauricular lymphadenopathy",
          "Preauricular lymphadenopathy occurs in: acute inclusion conjunctivitis, adenoviral infection, acute trachoma, Parinaud syndrome"
        ]
      },
      {
        title: "Adenoviral Conjunctivitis",
        bullets: [
          "Types: EKC (adenovirus 8,19) and PCF (adenovirus 3,7)",
          "Clinical: acute red eye, photophobia, lacrimation, subconjunctival hemorrhages, follicles",
          "EKC: keratitis progresses (punctate epithelial → subepithelial → stromal infiltrates)",
          "PCF: systemic symptoms (fever, pharyngitis)",
          "Treatment: supportive only (antivirals not effective)"
        ]
      },
      {
        title: "Trachoma (Egyptian Ophthalmia)",
        bullets: [
          "Organism: Chlamydia trachomatis (serotypes A,B,Ba,C for endemic trachoma)",
          "Transmission: direct/indirect contact, flies",
          "Incubation: 6-12 days"
        ]
      },
      {
        title: "Mc Callan's Classification",
        bullets: [
          "T1 (Onset): immature follicles on upper tarsus, pannus begins",
          "T2 (Florid): mature follicles with papillary hypertrophy",
          "  - T2a: mature follicles",
          "  - T2b: papillary hypertrophy",
          "  - T2c: + gonococcal infection",
          "T3 (Cicatrization): star-shaped scars, Arlt's line, PTDs, PTCs",
          "T4 (Healed): only scar tissue, no active inflammation"
        ]
      },
      {
        title: "WHO Classification",
        bullets: [
          "TF: Trachomatous Follicles (≥5 follicles ≥0.5mm)",
          "TI: Trachomatous Intense (inflammation obscuring >50% of vessels)",
          "TS: Trachomatous Scarring (white lines/bands)",
          "TT: Trachomatous Trichiasis (≥1 in-turning lash)",
          "CO: Corneal Opacity (obscuring pupil margin)"
        ]
      },
      {
        title: "Trachoma - Corneal Manifestations",
        bullets: [
          "1. Pannus: cellular infiltration + superficial vascularization of upper cornea",
          "  - Thin (pannus tenius) - mild, commonest",
          "  - Vascular (pannus vasculosus) - many vessels, few cells",
          "  - Fleshy (pannus carnosus) - many cells, few vessels",
          "  - Annular - all around cornea",
          "  - Cicatrized - healed, crescentic scar",
          "2. Trachomatous corneal ulcer: superficial, linear, at lower border of pannus"
        ]
      },
      {
        title: "Trachoma - Complications",
        bullets: [
          "Eyelid: trichiasis, entropion (upper lid), ptosis",
          "Conjunctival: xerosis, symblepharon, hyaline degeneration",
          "Corneal: diffuse nebulae, leucoma, xerosis",
          "Lacrimal: chronic dacryocystitis, dacryoadenitis"
        ]
      },
      {
        title: "Vernal Kerato-Conjunctivitis (Spring Catarrh)",
        bullets: [
          "Definition: Chronic bilateral recurrent seasonal allergic conjunctivitis",
          "Age: children (boys more), exacerbation in warm season",
          "Etiology: IgE-mediated allergy to UV rays, heat, dust, pollen",
          "Clinical: itching, lacrimation, photophobia, ropy discharge (eosinophils)"
        ]
      },
      {
        title: "Spring Catarrh - Types",
        bullets: [
          "1. Palpebral type (70%): cobblestone papillae on upper tarsus",
          "2. Bulbar type (10%): limbal gelatinous masses with Tranta spots (calcium deposits)",
          "3. Mixed type (20%)"
        ]
      },
      {
        title: "Spring Catarrh - Corneal Signs",
        bullets: [
          "1. Punctate epithelial keratitis (Tobgy)",
          "2. Shield ulcer (epithelial macro-erosions)",
          "3. Cupid's bow (arcus-like opacity)",
          "4. Pseudo-gerontoxon (stromal ulcer)"
        ]
      },
      {
        title: "Phlyctenular Keratoconjunctivitis",
        bullets: [
          "Etiology: endogenous allergy (tuberculo-protein, intestinal parasites, septic foci)",
          "Age: children (5-12 years)",
          "Lesion: Phlycten - round nodule (1-3mm), greyish, elevated, surrounded by injection",
          "Sites: limbus and bulbar conjunctiva",
          "Corneal manifestations: corneal phlycten, phlyctenular ulcer (marginal or ring), phlyctenular pannus",
          "Treatment: topical steroids (dramatic effect), antibiotics for secondary infection"
        ]
      },
      {
        title: "Phlycten vs Pinguecula",
        bullets: [
          "Phlycten: allergic, young, round, grey, any site, ulcerates",
          "Pinguecula: degenerative, old, triangular, yellow, nasal side, no ulceration"
        ]
      },
      {
        title: "Pterygium",
        bullets: [
          "Definition: Triangular encroachment of conjunctiva onto cornea",
          "Etiology: chronic irritation, UV rays (most important)",
          "Clinical: discomfort, disfigurement, diminished vision if encroaches pupil",
          "Parts: Apex (head on cornea), Neck (limbus), Body (on sclera)",
          "Treatment: small/stationary - none",
          "Indications for surgery: progressive, interferes with vision, cosmetic, recurrent with diplopia"
        ]
      },
      {
        title: "Pterygium - Surgical Techniques",
        bullets: [
          "Simple excision (high recurrence)",
          "Excision with bare sclera",
          "Prevention of recurrence: conjunctival/amniotic graft, postoperative beta irradiation, Mitomycin C"
        ]
      },
      {
        title: "Pinguecula",
        bullets: [
          "Definition: Yellow degenerative nodule in old people on nasal side of limbus",
          "Etiology: UV rays",
          "Treatment: none; excise if cosmetically bad"
        ]
      },
      {
        title: "Symblepharon",
        bullets: [
          "Definition: Adhesion of palpebral conjunctiva to ocular surface",
          "Causes: trachoma, trauma (chemical), postoperative, membranous conjunctivitis, autoimmune",
          "Complications: diplopia, visual affection, disfigurement, lid malposition, exposure keratopathy",
          "Treatment: prophylactic (glass rod, cortisone, contact shell) or curative (excision with/without graft)"
        ]
      }
    ]
  },
  {
    id: 4,
    titleAr: "القرنية والصلبة",
    titleEn: "Cornea & Sclera",
    icon: "🧿",
    topics: [
      {
        title: "Corneal Dimensions",
        bullets: [
          "Vertical: 11mm, Horizontal: 12mm",
          "Refractive power: 42 diopters",
          "Refractive index: 1.37"
        ]
      },
      {
        title: "Corneal Layers (Outside to Inside)",
        bullets: [
          "1. Epithelium: stratified squamous non-keratinized",
          "2. Bowman's membrane: condensation of anterior stroma, doesn't regenerate",
          "3. Substantia propria (stroma): 90% of corneal thickness, mucopolysaccharides",
          "4. Descemet's membrane: basement membrane of endothelium, regenerates, highly elastic",
          "5. Endothelium: single layer of hexagonal cells, barrier function"
        ]
      },
      {
        title: "Corneal Transparency - Factors",
        bullets: [
          "Anatomical: non-keratinized epithelium, regular lamellae, avascularity, non-myelinated nerves",
          "Physiological: detergence (relative dehydration), mucopolysaccharides, uniform refractive index"
        ]
      },
      {
        title: "Hypopyon Ulcer (Acute Serpiginous Ulcer)",
        bullets: [
          "Definition: Primary infective corneal ulcer with toxic iridocyclitis and early hypopyon",
          "Commonest organism: Pneumococcus (80% of cases)",
          "Source: chronic dacryocystitis, angular blepharoconjunctivitis, contaminated fluorescein, F.B. scratch",
          "Predisposing factors: old age, DM, malnutrition, trauma, trichiasis"
        ]
      },
      {
        title: "Hypopyon Ulcer - Clinical Picture",
        bullets: [
          "Symptoms: stitching pain, defective vision, photophobia, lacrimation, blepharospasm, halos",
          "Signs: ciliary injection, greyish infiltration, positive fluorescein, crescentic advancing edge",
          "Hypopyon: sterile pus (PMNL, fibrin, iris pigment) in anterior chamber"
        ]
      },
      {
        title: "Hypopyon Ulcer - Complications",
        bullets: [
          "1. Secondary iridocyclitis",
          "2. Secondary glaucoma",
          "3. Descemetocoele - Descemet's membrane bulges (translucent bleb)",
          "4. Corneal opacities: Nebula (faint), Macula (localized), Leucoma (dense)",
          "5. Perforation → iris prolapse, anterior synechia, leucoma adherent, corneal fistula, endophthalmitis"
        ]
      },
      {
        title: "Corneal Fistula",
        bullets: [
          "Occurs in central perforated ulcers with delayed healing",
          "River green sign, soft ocular tension, lost anterior chamber"
        ]
      },
      {
        title: "Hypopyon Ulcer - Treatment",
        bullets: [
          "Uncomplicated: topical antibiotics (dual therapy or fluoroquinolones), atropine 1%, bandage, hot fomentation",
          "Resistant: subconjunctival antibiotics, collagen shields, paracentesis, amniotic membrane graft, conjunctival flap, tarsorrhaphy, therapeutic keratoplasty",
          "Complications: glaucoma treatment, descemetocoele (bed rest, Diamox), perforated (bed rest, no iris reposition)",
          "Corneal fistula: chauffage (thermal cautery) or keratoplasty"
        ]
      },
      {
        title: "Dendritic Ulcer",
        bullets: [
          "Cause: Herpes simplex virus (epitheliotropic)",
          "Clinical: mild pain, corneal hypoesthesia, superficial linear/cratered ulcer with side branches",
          "Complications: herpetic iridocyclitis, secondary glaucoma, disciform keratitis, meta-herpetic keratitis, secondary bacterial infection",
          "Treatment: acyclovir (Zovirax), atropine, antibiotics, bandage (NO hot fomentation), vitamins A and C"
        ]
      },
      {
        title: "Herpes Zoster Ophthalmicus (HZO)",
        bullets: [
          "Cause: Herpes zoster virus affecting ophthalmic division of Trigeminal",
          "Incubation: 12-14 days",
          "Clinical: fever, severe neuralgic pain, vesicles following nerve distribution",
          "Treatment: sedation, analgesics, acyclovir tablets for 10 days, local steroids, atropine"
        ]
      },
      {
        title: "Fungal Ulcers - Types",
        bullets: [
          "1. Candida: immunocompromised, oval outline, plaque-like surface, satellite lesions",
          "2. Filamentous: Fusarium, Aspergillus - after vegetable matter trauma, feathery extensions, satellite lesions"
        ]
      },
      {
        title: "Keratoconus (Conical Cornea)",
        bullets: [
          "Definition: Developmental weakness of central stroma, conical projection under IOP",
          "Age: puberty, more in females, bilateral",
          "Clinical: gradual painless diminution of vision (myopia, irregular astigmatism, opacities)",
          "Signs: thin ectatic cornea, Munson's sign, Fleischer's ring (hemosiderin), opacities at apex"
        ]
      },
      {
        title: "Keratoconus - Treatment",
        bullets: [
          "1. Spectacles (early cases)",
          "2. Hard/RGP contact lenses",
          "3. Corneal Collagen Cross-Linking (CXL) - to stop progression",
          "4. Intrastromal Corneal Ring Segments (ICRS)",
          "5. Penetrating keratoplasty (if glasses/CL fail, opacities)"
        ]
      },
      {
        title: "Keratoplasty (Corneal Graft)",
        bullets: [
          "Lamellar: superficial layers (half-thickness) for superficial opacity",
          "Penetrating: all layers",
          "Indications: optical (improve vision), therapeutic (resistant ulcers), structural (restore continuity)",
          "Contraindications: untreated glaucoma, anterior uveitis, xerosis, neuroparalytic keratitis, deep vascularization"
        ]
      },
      {
        title: "Keratorefractive Surgery",
        bullets: [
          "1. PRK (Photorefractive Keratectomy): Excimer laser removal of anterior stroma",
          "2. LASIK: Excimer laser removal beneath 130-160μm flap"
        ]
      }
    ]
  },
  {
    id: 5,
    titleAr: "عدسة العين",
    titleEn: "Lens",
    icon: "🔍",
    topics: [
      {
        title: "Lens Anatomy",
        bullets: [
          "Two surfaces: anterior less convex than posterior",
          "Meet at equator"
        ]
      },
      {
        title: "Lens Transparency - Factors",
        bullets: [
          "Avascularity",
          "Tightly packed cells",
          "Lens protein arrangement",
          "Semipermeable capsule",
          "Pump mechanism (regulates electrolyte/water balance, maintaining dehydration)"
        ]
      },
      {
        title: "Accommodation Mechanism",
        bullets: [
          "Contraction of ciliary muscle → zonule relaxation → lens becomes more spherical (especially anterior surface) → increased lens power"
        ]
      },
      {
        title: "Congenital Cataract",
        bullets: [
          "Causes: hereditary, fetal hypoxia, maternal malnutrition, maternal infection (1st trimester), metabolic (galactosemia), syndromes",
          "Features: usually bilateral, partial, stationary, soft cataract",
          "Complications if large: amblyopia, squint (unilateral), nystagmus (bilateral)"
        ]
      },
      {
        title: "Types of Congenital Cataract",
        bullets: [
          "1. Anterior Polar: small, asymptomatic",
          "2. Zonular (Lamellar): disc-shaped central opacity with radial riders (steering wheel), leukocoria",
          "3. Posterior Polar: proximity to nodal point → marked visual loss",
          "4. Blue Dotted: asymptomatic",
          "5. Coronary: peripheral club-shaped opacities at puberty",
          "6. Rubella Total: maternal rubella 1st trimester, total opacification, with microcephaly, deafness, PDA, VSD"
        ]
      },
      {
        title: "Senile Cataract - Types",
        bullets: [
          "1. Cortical (75%)",
          "2. Nuclear (25%)",
          "3. Cortico-nuclear"
        ]
      },
      {
        title: "Senile Cortical Cataract - Stages",
        bullets: [
          "1. Incipient: wedge-shaped peripheral opacities, uniocular diplopia, haloes",
          "2. Immature: incomplete opacification, iris shadow present",
          "  - Intumescent form: swollen lens → phacomorphic glaucoma",
          "3. Mature: total greyish-white opacification, iris shadow absent",
          "4. Hypermature: signs of shrinkage (reappearance of iris shadow, deep AC, iridodonesis), Morgagnian form (nucleus mobile in liquefied cortex)"
        ]
      },
      {
        title: "Senile Nuclear Cataract",
        bullets: [
          "Features: bilateral, progressive, hard cataract",
          "Pathology: exaggerated dehydration and opacification of nucleus",
          "Clinical: index myopia (second sight - corrects presbyopia), day blindness",
          "DD from Nuclear Sclerosis: Nuclear Sclerosis corrected by glasses, Nuclear Cataract not improved by glasses"
        ]
      },
      {
        title: "Preoperative Assessment for Cataract",
        bullets: [
          "VA (No PL = No Surgery)",
          "IOP (guarded prognosis if glaucoma)",
          "Conjunctiva (infection)",
          "Cornea (clarity)",
          "AC (depth, inflammation)",
          "Iris & Pupil (reaction to light)",
          "Lens (type, grade, stability)",
          "Fundus (optic disc, macula, vessels)"
        ]
      },
      {
        title: "Cataract Surgery Techniques",
        bullets: [
          "1. Phacoemulsification: ultrasonic emulsification + aspiration",
          "2. ECCE: nucleus delivery through capsulotomy + I/A of remaining cortex",
          "3. ICCE: removal of lens within capsule (limited use - vitreous loss, retinal detachment, CME)"
        ]
      },
      {
        title: "Complicated Cataract",
        bullets: [
          "Local eye disease: corneal ulcer, iridocyclitis, glaucoma, lens subluxation, steroid use, chorioretinitis, retinal detachment, myopia, RP, tumors",
          "Systemic disease: DM, hypoparathyroidism, galactosemia, myotonic dystrophy, atopic dermatitis"
        ]
      },
      {
        title: "Traumatic Cataract",
        bullets: [
          "Concussion: rosette-shaped posterior cortical, Vossius ring",
          "Perforating: lens capsule rupture",
          "Physical:",
          "  - Infra-red (glass blower's) - posterior cortical",
          "  - Radiation - posterior cortical",
          "  - Electrical - anterior cortical"
        ]
      },
      {
        title: "After-Cataract",
        bullets: [
          "Definition: Posterior capsular opacity after cataract surgery or absorbed traumatic cataract",
          "Types: Elschnig's pearls, capsular fibrosis",
          "Treatment: YAG laser or surgical capsulotomy"
        ]
      }
    ]
  },
  {
    id: 6,
    titleAr: "الحجاج والماء الأزرق",
    titleEn: "Orbit & Glaucoma",
    icon: "🪐",
    topics: [
      {
        title: "Orbit - Walls",
        bullets: [
          "7 bones: ethmoid, frontal, lacrimal, maxillary, palatine, sphenoid, zygomatic",
          "Roof: frontal bone",
          "Floor: maxillary, palatine, zygoma",
          "Medial wall: thinnest (ethmoid, maxillary, lacrimal)",
          "Lateral wall: bounded by orbital fissures"
        ]
      },
      {
        title: "Orbital Fissures - Contents",
        bullets: [
          "1. Optic foramen: optic nerve, ophthalmic artery",
          "2. Superior orbital fissure: oculomotor, trochlear, abducent, ophthalmic division of trigeminal, ophthalmic veins, sympathetic fibers",
          "3. Inferior orbital fissure: maxillary division of trigeminal, infra-orbital artery"
        ]
      },
      {
        title: "Orbital Cellulitis",
        bullets: [
          "Etiology: endogenous (sinuses), exogenous (trauma), blood-born (pyemia)",
          "Causative organisms: pyogenic, especially staphylococci",
          "Clinical: fever, orbital pain, lid edema, chemosis, axial proptosis, limitation of movements",
          "Complications: exposure keratopathy, abscess, panophthalmitis, CRAO/CRVO, meningitis, brain abscess, cavernous sinus thrombosis"
        ]
      },
      {
        title: "Preseptal Cellulitis",
        bullets: [
          "Definition: Infection of eyelid anterior to orbital septum",
          "Clinical: eyelid swelling, pain, redness, NO visual loss, NO limitation of movement, NO proptosis",
          "Differentiation: CT/MRI shows involvement anterior to septum (preseptal) vs posterior (orbital)"
        ]
      },
      {
        title: "Thyroid Eye Disease (TED)",
        bullets: [
          "Commonest cause of unilateral and bilateral proptosis",
          "May occur in hyper-, hypo-, or euthyroid patients",
          "Pathogenesis: immunogenic deposition of mucopolysaccharides, lymphocytic infiltration, fibrosis of muscles"
        ]
      },
      {
        title: "Graves' Disease - Clinical Signs",
        bullets: [
          "General: enlarged thyroid, increased pulse, tremors",
          "Local: lid edema, lid retraction (staring look, lid lag), axial proptosis, restrictive myopathy, optic neuropathy"
        ]
      },
      {
        title: "Cavernous Sinus Thrombosis",
        bullets: [
          "Etiology: spread from orbital cellulitis or blood-borne infection",
          "Signs: lid edema, chemosis, rapidly increasing proptosis, ophthalmoplegia, mastoid edema, contralateral involvement"
        ]
      },
      {
        title: "Proptosis - Etiology",
        bullets: [
          "Unilateral: TED (most common), dermoid cyst, retrobulbar hemorrhage, orbital cellulitis, pseudotumor, orbital varices, tumors",
          "Bilateral: TED (most common), cavernous sinus thrombosis"
        ]
      },
      {
        title: "Enucleation",
        bullets: [
          "Definition: Removal of eyeball leaving extraocular muscles, conjunctiva, optic nerve",
          "Indications: blind painful eye, intraocular tumors (retinoblastoma), sympathetic ophthalmia, cosmetic"
        ]
      },
      {
        title: "Evisceration",
        bullets: [
          "Definition: Removal of intraocular contents leaving sclera, conjunctiva, optic nerve",
          "Indications: endophthalmitis, panophthalmitis, expulsive hemorrhage"
        ]
      },
      {
        title: "Exenteration",
        bullets: [
          "Definition: Removal of all orbital contents within periosteum with eyelids",
          "Indications: malignant orbital tumors, malignant tumors of lid/conjunctiva/eyeball"
        ]
      }
    ]
  },
  {
    id: 7,
    titleAr: "عيوب الانكسار",
    titleEn: "Errors of Refraction",
    icon: "👓",
    topics: [
      {
        title: "Emmetropia vs Ametropia",
        bullets: [
          "Emmetropia: parallel rays focus on retina with accommodation relaxed",
          "Ametropia: parallel rays do NOT focus on retina"
        ]
      },
      {
        title: "Myopia (Short Sightedness)",
        bullets: [
          "Definition: Focus in front of retina with accommodation relaxed",
          "Far point (PR): nearer than infinity"
        ]
      },
      {
        title: "Myopia - Types",
        bullets: [
          "1. Simple: starts at puberty, slowly progresses, ≤6D",
          "2. Progressive (Malignant): starts 5-10 years, progresses after 25, ≥25D, degenerative fundus changes",
          "3. Congenital: from birth, reaches 10D then stationary"
        ]
      },
      {
        title: "Myopia - Etiology",
        bullets: [
          "Axial: increased axial length (most common, 1mm = 3D)",
          "Refractive: curvature (keratoconus, lenticonus), index (senile nuclear sclerosis, hyperglycemia)",
          "Abnormal lens position: anterior dislocation"
        ]
      },
      {
        title: "Myopia - Fundus Signs",
        bullets: [
          "Tessellated (tigeroid) fundus",
          "Chorio-retinal degenerations",
          "Posterior staphyloma",
          "Myopic crescent (temporal to disc)",
          "Fuchs' spot (CNV at macula with central vision loss)"
        ]
      },
      {
        title: "Myopia - Complications",
        bullets: [
          "Squint (apparent convergent, true divergent)",
          "PVD",
          "Retinal detachment",
          "Macular hemorrhage/hole",
          "Complicated cataract",
          "Pigmentary glaucoma",
          "Consecutive optic atrophy"
        ]
      },
      {
        title: "Myopia - Treatment",
        bullets: [
          "Glasses: concave (minus) lenses",
          "Contact lenses",
          "Corneal refractive surgery: LASIK, PRK, Femto-SMILE",
          "Lens refractive surgery: Phakic IOL, RLE"
        ]
      },
      {
        title: "Hypermetropia (Far Sightedness)",
        bullets: [
          "Definition: Focus behind retina with accommodation relaxed",
          "Far point (PR): imaginary (virtual) behind eye"
        ]
      },
      {
        title: "Hypermetropia - Etiology",
        bullets: [
          "Axial: small eye (infants, failure to grow)",
          "Refractive: curvature (cornea plana), index (cortical cataract, hypoglycemia)",
          "Abnormal lens position: posterior dislocation",
          "Aphakia"
        ]
      },
      {
        title: "Hypermetropia - Components",
        bullets: [
          "Total: measured under atropine (ciliary muscle completely paralyzed)",
          "Latent: corrected by ciliary muscle tone (about 1D)",
          "Manifest: total - latent",
          "Facultative: corrected by accommodation",
          "Absolute: not corrected by accommodation (manifest - facultative)"
        ]
      },
      {
        title: "Hypermetropia - Complications",
        bullets: [
          "Squint (apparent divergent, true convergent)",
          "Primary angle closure glaucoma (marked hypermetropia)"
        ]
      },
      {
        title: "Hypermetropia - Treatment",
        bullets: [
          "Glasses: convex (plus) lenses",
          "  - Children with symptoms: full correction",
          "  - Adults: highest tolerated plus lens",
          "  - Old age: full correction (weak accommodation)",
          "Contact lenses",
          "Refractive surgery: LASIK, PRK, Phakic IOL, RLE"
        ]
      },
      {
        title: "Astigmatism",
        bullets: [
          "Definition: Different refractive power in different meridians",
          "Parallel rays do not form point focus on retina"
        ]
      },
      {
        title: "Astigmatism - Types",
        bullets: [
          "Corneal (commonest): congenital, acquired (keratoconus, scars, tumors, post-surgical)",
          "Lenticular: cataract, subluxation, lenticonus",
          "Regular: principal meridians at right angles, gradual change",
          "Irregular: meridians not at right angles, cannot be corrected by glasses (keratoconus, scars)"
        ]
      },
      {
        title: "Regular Astigmatism - Types",
        bullets: [
          "With the rule: vertical meridian more curved",
          "Against the rule: vertical meridian less curved",
          "Simple: one meridian emmetropic (simple myopic or hypermetropic)",
          "Compound: both meridians ametropic same type",
          "Mixed: one myopic, one hypermetropic"
        ]
      },
      {
        title: "Astigmatism - Clinical Picture",
        bullets: [
          "Symptoms: blurred vision, running/dropped letters, uniocular diplopia (marked), accommodative asthenopia",
          "Signs: oval optic disc, distorted Placido's circles, scissor reflex (irregular), spinning reflex (keratoconus)"
        ]
      },
      {
        title: "Astigmatism - Treatment",
        bullets: [
          "Glasses: cylindrical lens (axis perpendicular to meridian to be corrected)",
          "Contact lenses: soft/toric for regular, RGP for irregular",
          "Surgical: LASIK/PRK (regular), CXL/ICRS/keratoplasty (keratoconus), PTK/keratoplasty (opacities)"
        ]
      },
      {
        title: "Aphakia",
        bullets: [
          "Definition: Absence of crystalline lens",
          "Etiology: congenital (rare), acquired (post-traumatic, post-operative)",
          "Optical problems: hypermetropia, loss of accommodation, astigmatism (against rule), anisometropia (unilateral)",
          "Signs: scar, absence of Purkinje-Sanson images, deep AC, iridodonesis, jet black pupil",
          "Treatment: bilateral - two pairs of glasses (distance + near); unilateral - IOL or contact lenses"
        ]
      },
      {
        title: "Anisometropia",
        bullets: [
          "Definition: Refractive difference >4D between eyes",
          "Types: simple, compound, mixed",
          "Clinical: asthenopia, loss of binocular vision (alternating or unicolar)"
        ]
      },
      {
        title: "Presbyopia",
        bullets: [
          "Definition: Physiological recession of near point making near vision difficult",
          "Occurs around 45 years in emmetropes (earlier in hypermetropes, later in myopes)",
          "Symptoms: difficulty reading, accommodative asthenopia",
          "Treatment: Add biconvex lens to far prescription; keep 1/3 amplitude in reserve"
        ]
      }
    ]
  },
  {
    id: 8,
    titleAr: "المياه الزرقاء",
    titleEn: "Glaucoma",
    icon: "🧿",
    topics: [
      {
        title: "Angle of Anterior Chamber - Gonioscopic Structures",
        bullets: [
          "1. Schwall's line (end of Descemet's membrane)",
          "2. Trabecular meshwork (TM)",
          "3. Scleral spur (SS)",
          "4. Ciliary body (CB)",
          "5. Root of iris"
        ]
      },
      {
        title: "Aqueous Humor",
        bullets: [
          "Volume: 1.25ml",
          "Secretion: active (80%) by non-pigmented ciliary epithelium, passive (20%) by ultrafiltration",
          "Flow: ciliary process → posterior chamber → pupil → anterior chamber → trabecular (80%) or uveoscleral (20%)"
        ]
      },
      {
        title: "Normal IOP",
        bullets: [
          "10-21 mmHg (mean 16 mmHg)",
          "Diurnal variation: highest in morning, minimum in evening (difference 2-3 mmHg)"
        ]
      },
      {
        title: "Glaucoma - Definition",
        bullets: [
          "Progressive optic neuropathy with elevated IOP as major risk → optic nerve damage + visual field defect"
        ]
      },
      {
        title: "Glaucoma Classification",
        bullets: [
          "1. Congenital (Developmental)",
          "2. Primary:",
          "  - Open angle (POAG/Chronic simple glaucoma)",
          "  - Closed angle (Angle closure glaucoma)",
          "3. Secondary: secondary to ocular disease (open or closed angle)"
        ]
      },
      {
        title: "Primary Infantile Glaucoma (Buphthalmos)",
        bullets: [
          "Cause: trabeculo-dysgenesis",
          "Triad: lacrimation, photophobia, blepharospasm (due to corneal edema)",
          "Signs: corneal edema, corneal enlargement (>12mm), Haab's striae, deep AC, tremulous iris"
        ]
      },
      {
        title: "Primary Open Angle Glaucoma (POAG)",
        bullets: [
          "Definition: Bilateral, asymmetrical, non-congestive IOP elevation with open angle → optic nerve damage",
          "Risk factors: age >50, family history, dark races, CRVO, high myopia, DM, migraine",
          "Etiology: age-related sclerosis of TM → decreased outflow"
        ]
      },
      {
        title: "POAG - Clinical Picture",
        bullets: [
          "Symptoms: asymptomatic, mild headache, early presbyopia, night blindness, visual field loss",
          "Signs: ↑IOP, optic disc cupping, field defects, open angle"
        ]
      },
      {
        title: "POAG - Diagnosis",
        bullets: [
          "1. IOP: >21mmHg, difference between eyes ≤4mmHg, diurnal variation ≤4mmHg",
          "2. Optic disc: C/D ratio >0.4 (early), vertical elongation, asymmetry, splinter hemorrhages; >0.7 (late), undermined edge, nasal vessel shift",
          "3. Visual fields: paracentral scotoma, Seidle scotoma, arcuate scotoma, baring of blind spot, Ronne nasal step, tubular field"
        ]
      },
      {
        title: "POAG - Treatment",
        bullets: [
          "1. Medical: Beta-blockers (↓aqueous formation), Prostaglandins (↑uveoscleral outflow), CAI, Alpha-2 agonists",
          "2. Laser Trabeculoplasty: YAG/Argon to TM → ↑outflow",
          "3. Surgical: Trabeculectomy (new pathway to subconjunctival space), Setons (valves), Cyclodestructive procedures"
        ]
      },
      {
        title: "Primary Angle Closure Glaucoma (PACG)",
        bullets: [
          "Definition: IOP elevation from partial/complete occlusion of angle by iris periphery",
          "Risk factors: females >40, hypermetropia, old age, mydriasis"
        ]
      },
      {
        title: "PACG - Pathogenesis",
        bullets: [
          "Pupillary block (iris bombe): shallow AC, apposition of iris to lens → aqueous trapped in posterior chamber → iris root pushed forward",
          "Plateau iris: flat central iris, peripheral dragging from anterior ciliary processes"
        ]
      },
      {
        title: "PACG - Stages",
        bullets: [
          "1. Latent: asymptomatic, shallow AC, narrow angle (grade 1-2)",
          "2. Intermittent: transient IOP rise, haloes, eye ache, broken by miosis",
          "3. Acute congestive: sudden angle closure, severe pain, nausea/vomiting, hazy cornea, semi-dilated unreactive pupil, iris bombe",
          "4. Chronic: variable angle closure, PAS, like POAG",
          "5. Absolute: no PL, extensive cupping, degenerative changes"
        ]
      },
      {
        title: "Acute PACG - Treatment",
        bullets: [
          "During attack: Hyperosmotic agents (IV Mannitol), CAI (Acetazolamide), Beta-blockers, Miotics (Pilocarpine after IOP lowered)",
          "After attack: Peripheral iridectomy/iridotomy if angle open; Trabeculectomy if >50% angle closed"
        ]
      },
      {
        title: "Secondary Glaucoma - Local Causes",
        bullets: [
          "1. Corneal: ulcer/iritis (open), leucoma adherent (closed)",
          "2. AC: hypopyon/hyphema (open), anterior lens dislocation (closed)",
          "3. Iridocyclitis: TM edema (open), PAS (closed)",
          "4. Lens: Phacolytic (hypermature cataract), Phacoanaphylactic (trauma), Phacomorphic (intumescent), Pseudo-exfoliation",
          "5. Trauma: angle recession, corneal laceration, hyphema",
          "6. Steroid-induced: mucopolysaccharide deposition in TM"
        ]
      },
      {
        title: "Phacolytic Glaucoma",
        bullets: [
          "Hypermature cataract → lens protein escapes → blocks TM or macrophages obstruct angle",
          "Clinical: like acute congestive glaucoma but with normal AC depth, open angle, AC reaction",
          "Treatment: lens extraction, beta-blockers, steroids"
        ]
      },
      {
        title: "Phacomorphic Glaucoma",
        bullets: [
          "Intumescent cataract → lens size increases → shallow AC + pupillary block → ↑IOP",
          "Treatment: lens extraction"
        ]
      }
    ]
  },
  {
    id: 9,
    titleAr: "المشيمية والقزحية",
    titleEn: "Uveal Tract",
    icon: "🔥",
    topics: [
      {
        title: "Iris - Anatomy",
        bullets: [
          "Site: between cornea and lens, diaphragm dividing AC and PC",
          "Shape: thin circular pigmented disc with pupil at center",
          "Anterior surface: collarette, iris crypts",
          "Muscles: Sphincter pupillae (parasympathetic, miosis), Dilator pupillae (sympathetic, mydriasis)"
        ]
      },
      {
        title: "Iris - Blood Supply",
        bullets: [
          "Circulus arteriosus major: 2 long posterior ciliary + 7 anterior ciliary arteries",
          "Circulus arteriosus minor",
          "Veins: 4 vortex veins"
        ]
      },
      {
        title: "Ciliary Body - Anatomy",
        bullets: [
          "Site: intermediate uveal tract, iris to choroid",
          "Shape: triangular",
          "Internal surface: Pars plicata (70-80 ciliary processes), Pars plana (ends at ora serrata)",
          "Muscles: longitudinal (accommodation), circular, oblique"
        ]
      },
      {
        title: "Choroid - Anatomy",
        bullets: [
          "Site: posterior uveal tract, ciliary body to optic nerve",
          "Layers: suprachoroidal lamina, vascular layers, choriocapillaris, Bruch's membrane"
        ]
      },
      {
        title: "Accommodation - Mechanism",
        bullets: [
          "Contraction of circular ciliary muscle → zonule relaxation → lens more spherical → increased power"
        ]
      },
      {
        title: "Uveitis - Classification",
        bullets: [
          "Anatomoical: anterior (iridocyclitis), posterior (choroiditis), panuveitis",
          "Clinical: acute vs chronic",
          "Etiological: infected vs non-infected",
          "Pathological: granulomatous vs non-granulomatous"
        ]
      },
      {
        title: "Iridocyclitis - Etiology",
        bullets: [
          "Primary: infective (exogenous/endogenous) or non-infective (allergic/autoimmune)",
          "Syndromes: Bechet's (triad: iridocyclitis + oral + genital ulcers), Fuchs heterochromic iridocyclitis, Vogt-Koyanagi-Harada (uveitis + vitiligo + poliosis)"
        ]
      },
      {
        title: "Iridocyclitis - Clinical Picture",
        bullets: [
          "Symptoms: neuralgic pain (worse at night, referred to eyebrow), photophobia, lacrimation, blepharospasm, rapid diminution of vision",
          "Signs: ciliary injection, KPs (triangular with base down), aqueous flare, hypopyon/hyphema, muddy iris, miosis, irregular pupil, posterior synechiae"
        ]
      },
      {
        title: "Iridocyclitis - Complications",
        bullets: [
          "1. Synechiae: peripheral anterior, posterior (seclusio-pupillae, total), occlusio-pupillae",
          "2. Cyclitic membrane → pseudo-glioma",
          "3. Secondary glaucoma",
          "4. Complicated cataract (posterior cortical)",
          "5. Endophthalmitis/Panophthalmitis",
          "6. Atrophia bulbi"
        ]
      },
      {
        title: "Iridocyclitis - Treatment",
        bullets: [
          "Local: hot applications, mydriatic-cycloplegics (atropine), corticosteroids, dark glasses",
          "Systemic: anti-infective, steroids, NSAIDs",
          "Complications: Secondary glaucoma (Diamox, paracentesis, filtering surgery), Seclusio-pupillae (iridotomy), Total synechiae (iridectomy + lens extraction)"
        ]
      },
      {
        title: "Choroiditis",
        bullets: [
          "Differences from iridocyclitis: painless, no marked visual loss (unless central), secondary glaucoma uncommon, corticosteroids important"
        ]
      },
      {
        title: "Endophthalmitis",
        bullets: [
          "Definition: Acute suppurative inflammation inside globe",
          "Clinical: painful drop of vision, red eye, chemosis, hypopyon, yellowish fundus reflex (amaurotic cat's eye)",
          "Treatment: early (antibiotics, atropine, steroids, vitrectomy), late (evisceration)"
        ]
      },
      {
        title: "Panophthalmitis",
        bullets: [
          "Definition: Suppurative inflammation involving all ocular tissues, Tenon's capsule, soft orbital tissues",
          "Clinical: severe endophthalmitis signs + proptosis + limitation of movements",
          "Treatment: evisceration"
        ]
      }
    ]
  },
  {
    id: 10,
    titleAr: "الحول",
    titleEn: "Strabismus",
    icon: "🔄",
    topics: [
      {
        title: "Extraocular Muscles - Origin",
        bullets: [
          "4 recti: annulus of Zinn",
          "Superior oblique: apex of orbit (above annulus)",
          "Inferior oblique: floor of orbit (lateral to NLD opening)"
        ]
      },
      {
        title: "Extraocular Muscles - Insertion",
        bullets: [
          "MR: 5.5mm from limbus",
          "IR: 6.5mm",
          "LR: 6.9mm",
          "SR: 7.7mm",
          "SO: upper postero-lateral sclera",
          "IO: lower postero-lateral sclera"
        ]
      },
      {
        title: "Extraocular Muscles - Nerve Supply",
        bullets: [
          "SR, MR, IR, IO: Oculomotor (3rd nerve)",
          "SO: Trochlear (4th nerve)",
          "LR: Abducent (6th nerve)"
        ]
      },
      {
        title: "Extraocular Muscles - Actions",
        bullets: [
          "MR: Adduction",
          "LR: Abduction",
          "SR: Elevation (primary), adduction, intorsion",
          "IR: Depression (primary), adduction, extorsion",
          "SO: Intorsion (primary), depression, abduction",
          "IO: Extorsion (primary), elevation, abduction"
        ]
      },
      {
        title: "Binocular Vision - Development",
        bullets: [
          "6 months: binocular fixation (fovea fully developed)",
          "6 years: binocular vision fully developed"
        ]
      },
      {
        title: "Binocular Vision - Grades",
        bullets: [
          "1. Simultaneous perception: see two dissimilar objects",
          "2. Fusion: superimpose two incomplete objects",
          "3. Stereoscopic vision: depth perception"
        ]
      },
      {
        title: "Types of Squint",
        bullets: [
          "1. Apparent (Pseudo): looks like squint but visual axes normal",
          "  - Causes: epicanthus (apparent convergent), high hypermetropia (apparent divergent)",
          "2. True: abnormal visual axes",
          "  - Latent (Heterophoria): only when binocular vision dissociated",
          "  - Manifest: Paralytic (non-comitant) or Concomitant"
        ]
      },
      {
        title: "Latent Squint (Heterophoria)",
        bullets: [
          "Types: esophoria (in), exophoria (out), hyperphoria (up), hypophoria (down)",
          "Etiology: uncorrected hypermetropia → esophoria; myopia → exophoria",
          "Compensated: no symptoms; Decompensated: asthenopia, blurring",
          "Diagnosis: Cover test, Maddox rod, Maddox wing",
          "Treatment: correction of refractive error, orthoptic exercises, surgical"
        ]
      },
      {
        title: "Paralytic Squint",
        bullets: [
          "Definition: Deviation due to paralysis/paresis of EOMs, angle varies in different gazes",
          "Symptoms: diplopia (in action direction), limitation of movement, ocular torticollis, vertigo",
          "Signs: Primary deviation (fixating normal eye) < Secondary deviation (fixating paralyzed eye) - due to Herring's law of equal innervation"
        ]
      },
      {
        title: "Paralytic Squint - Clinical Features",
        bullets: [
          "Right 6th nerve palsy: right eye deviated inwards, limitation outward, uncrossed diplopia, face turn to right",
          "Binocular diplopia: disappears on covering one eye, true image (normal eye) vs false image (paralyzed eye)",
          "Uncrossed diplopia: false image on same side (LR paralysis)",
          "Crossed diplopia: false image on opposite side (MR paralysis)"
        ]
      },
      {
        title: "Ocular Torticollis (Compensatory Head Posture)",
        bullets: [
          "Direction: in direction of action of paralyzed muscle",
          "Horizontal deviation → simple (face turn)",
          "Vertical deviation → compound (face turn + chin elevation/depression + head tilt)"
        ]
      },
      {
        title: "Concomitant Squint",
        bullets: [
          "Definition: Same angle of deviation in all gazes, no limitation of movements",
          "No diplopia (suppression)",
          "Etiology: refractive errors (hypermetropia → convergent, myopia → divergent), motor obstacles, central obstacles"
        ]
      },
      {
        title: "Types of Concomitant Squint",
        bullets: [
          "Direction: convergent (esotropia), divergent (exotropia), vertical (hypertropia/hypotropia), mixed",
          "Laterality: unilateral vs alternating",
          "Constancy: constant vs intermittent"
        ]
      },
      {
        title: "Concomitant Squint - Clinical Picture",
        bullets: [
          "Symptoms: ocular deviation, defective vision (unilateral)",
          "Signs: decreased VA in unilateral squint (stimulus deprivation or strabismic amblyopia), constant angle of deviation"
        ]
      },
      {
        title: "Cover Test - Results",
        bullets: [
          "Manifest squint: deviated eye moves to take fixation",
          "Concomitant: primary angle = secondary angle",
          "Paralytic: secondary angle > primary angle",
          "Latent squint: eye under cover moves",
          "Apparent squint: no movement"
        ]
      },
      {
        title: "Angle Measurement - Hirschberg Test",
        bullets: [
          "Central corneal reflex: fixing eye",
          "Eccentric reflex: squinting eye",
          "  - 15°: at pupillary margin",
          "  - 30°: midway between pupil and limbus",
          "  - 45°: at limbus"
        ]
      },
      {
        title: "Strabismus - Treatment",
        bullets: [
          "1. Correction of refractive error",
          "2. Occlusion (to treat amblyopia)",
          "3. Pleoptics (full sight - foveal stimulation)",
          "4. Orthoptics (straight sight - binocular training)",
          "5. Surgical: Strengthening (resection, advancement, plication) or Weakening (recession)"
        ]
      }
    ]
  },
  {
    id: 11,
    titleAr: "الشبكية",
    titleEn: "Retina",
    icon: "👁️",
    topics: [
      {
        title: "Retinal Layers (Outside to Inside)",
        bullets: [
          "1. Retinal pigment epithelium",
          "2. Photoreceptors (rods and cones)",
          "3. Outer limiting membrane",
          "4. Outer nuclear layer (nuclei of rods/cones)",
          "5. Outer plexiform layer (synapses with bipolar cells)",
          "6. Inner nuclear layer (bipolar cells, Muller's cells)",
          "7. Inner plexiform layer (synapses with ganglion cells)",
          "8. Ganglion cell layer",
          "9. Nerve fiber layer (axons → optic nerve)",
          "10. Inner limiting membrane"
        ]
      },
      {
        title: "Retinal Blood Supply",
        bullets: [
          "Inner 5 layers: central retinal artery (branch of ophthalmic)",
          "Outer 5 layers: diffusion from choroid (avascular)",
          "Cilioretinal artery (10-20%): supplies macula"
        ]
      },
      {
        title: "Normal Fundus",
        bullets: [
          "Optic disc: 1.5mm, pale pink, sharp edge, physiological cup",
          "Macula lutea: 3mm temporal to disc",
          "Fovea: depression in center of macula",
          "Foveola: avascular center",
          "Artery/Vein diameter = 2/3"
        ]
      },
      {
        title: "Vitreous Hemorrhage - Causes",
        bullets: [
          "1. Posterior vitreous detachment",
          "2. Retinal breaks",
          "3. Trauma",
          "4. CRVO",
          "5. Proliferative retinopathies (PDR)",
          "6. Blood diseases (anemia, leukemia)"
        ]
      },
      {
        title: "Diabetic Retinopathy - Risk Factors",
        bullets: [
          "Young age, long duration",
          "Poor control",
          "Hypertension",
          "High blood lipids",
          "Pregnancy"
        ]
      },
      {
        title: "Diabetic Retinopathy - Stages",
        bullets: [
          "1. NPDR: microaneurysms, dot-blot hemorrhages, hard exudates, retinal edema",
          "2. Pre-proliferative: cotton wool spots, venous beading, IRMA",
          "3. PDR: NVD, NVE, preretinal/vitreous hemorrhage, fibrous proliferation, TRD",
          "4. Diabetic maculopathy: CSME (edema/exudates within 500μ of fovea)"
        ]
      },
      {
        title: "Diabetic Retinopathy - Treatment",
        bullets: [
          "1. Control diabetes",
          "2. Follow-up: NPDR (9 months), Pre-proliferative (4 months), PDR (3 months), CSME (2 months)",
          "3. Laser: PRP (PDR), focal/grid for macular edema",
          "4. Anti-VEGF: mainstay for diabetic macular edema",
          "5. Vitrectomy: persistent vitreous hemorrhage, TRD"
        ]
      },
      {
        title: "Hypertensive Retinopathy - Signs",
        bullets: [
          "Arteriolar narrowing (focal/generalized)",
          "Vascular leakage: flame-shaped hemorrhages, retinal edema, hard exudates",
          "Papilledema and exudative RD (malignant hypertension)"
        ]
      },
      {
        title: "Retinopathy of Prematurity (ROP)",
        bullets: [
          "Affects preterm infants <30 weeks, low birth weight <1500g exposed to high oxygen",
          "Stages: 1 (demarcation line) → 2 (ridge) → 3 (fibrovascular proliferation) → 4 (subtotal RD) → 5 (total RD)",
          "Management: Stages 1-2: none; Stage 3: laser/cryotherapy; Stages 4-5: surgical"
        ]
      },
      {
        title: "Retinal Vein Occlusion - Risk Factors",
        bullets: [
          "Old age, hypertension, DM, blood abnormalities, phlebitis, raised IOP"
        ]
      },
      {
        title: "Central Retinal Vein Occlusion (CRVO)",
        bullets: [
          "Non-ischemic: VA >6/60, mild tortuous veins, good perfusion → 50% resolve",
          "Ischemic: VA <6/60, marked tortuous veins, cotton wool spots, extensive non-perfusion → 50% neovascularization"
        ]
      },
      {
        title: "Branch Retinal Vein Occlusion (BRVO)",
        bullets: [
          "Clinical: dilated/tortuous veins, dot-blot/flame hemorrhages, edema, cotton wool spots in drained area",
          "Treatment: laser for macular edema, aspirin, treat underlying conditions"
        ]
      },
      {
        title: "Retinal Arterial Occlusion - Causes",
        bullets: [
          "1. Thrombosis (atherosclerosis)",
          "2. Embolism (cholesterol from carotid, calcific from heart valves, talc, fat)",
          "3. Spasm (hypertension, migraine)",
          "4. Vasculitis (giant cell arteritis)"
        ]
      },
      {
        title: "Central Retinal Artery Occlusion (CRAO)",
        bullets: [
          "Acute: painless loss of vision, afferent pupillary defect, attenuated arteries, white retina, cherry red spot (fovea)",
          "Late: transparent atrophic retina, pale disc (consecutive optic atrophy)",
          "Treatment: emergency (within 90 min) - lower IOP, ocular massage, sublingual nitroglycerin, paracentesis"
        ]
      },
      {
        title: "Retinal Detachment - Types",
        bullets: [
          "1. Rhegmatogenous: retinal breaks allow liquefied vitreous under retina",
          "2. Tractional: fibrous tissue pulls retina (PDR, Sickle cell, ROP, trauma)",
          "3. Exudative: fluid from choroid accumulates (tumors, inflammation, toxemia, hypertension)"
        ]
      },
      {
        title: "Rhegmatogenous RD - Clinical",
        bullets: [
          "Symptoms: photopsia (flashes), floaters, progressive black curtain",
          "Signs: hypotony, grey detached retina (convex, folded), retinal break (red-pink)",
          "Treatment: prophylactic laser/cryotherapy for tears; scleral buckling or vitrectomy + endolaser"
        ]
      }
    ]
  },
  {
    id: 12,
    titleAr: "أمراض العين العصبية",
    titleEn: "Neuro-ophthalmology",
    icon: "🧠",
    topics: [
      {
        title: "Visual Pathway",
        bullets: [
          "1. Optic nerve (4cm, lamina cribrosa to chiasm)",
          "2. Optic chiasm (nasal fibers cross)",
          "3. Optic tract (contains temporal fibers + contralateral nasal)",
          "4. Lateral geniculate body (synapse)",
          "5. Optic radiation → occipital lobe",
          "6. Visual cortex"
        ]
      },
      {
        title: "Visual Field Defects",
        bullets: [
          "Optic nerve: blind eye",
          "Chiasm: bitemporal hemianopia",
          "Optic tract: contralateral homonymous hemianopia",
          "Parietal lobe: contralateral inferior quadrantanopia",
          "Temporal lobe: contralateral superior quadrantanopia",
          "Occipital lobe: contralateral homonymous hemianopia (usually macula sparing)"
        ]
      },
      {
        title: "Optic Neuritis - Classification",
        bullets: [
          "1. Papillitis: disc swelling with visual loss",
          "2. Retrobulbar neuritis: inflammation behind globe, normal fundus",
          "3. Neuro-retinitis: papillitis + macular star"
        ]
      },
      {
        title: "Papillitis - Clinical",
        bullets: [
          "Symptoms: rapid visual loss (up to PL), pain with eye movements",
          "Signs: elevated hyperemic disc with filled cup, congested veins, central scotoma for red/green"
        ]
      },
      {
        title: "Retrobulbar Neuritis - Clinical",
        bullets: [
          "Acute unilateral visual loss (age 20-40)",
          "Pain with eye movements",
          "RAPD",
          "Normal fundus (unless papillitis)"
        ]
      },
      {
        title: "Papilledema - Clinical",
        bullets: [
          "Symptoms: increased ICT (headache, vomiting), transient visual loss",
          "Early: blurred disc edges, hyperemia, mild elevation",
          "Established: severe elevation (up to 9D), hemorrhage, cotton wool spots, engorged veins, macular star",
          "Long-standing: champagne cork appearance, opto-ciliary shunts",
          "Atrophic: post-papilledmic optic atrophy",
          "Field defect: enlarged blind spot (early), central scotoma for blue (late)"
        ]
      },
      {
        title: "Optic Atrophy - Types",
        bullets: [
          "1. Primary: CNS disease (MS, neurosyphilis), injury, pressure (pituitary tumors), ischemia",
          "2. Secondary: post-papilledmic or post-neuritic",
          "3. Consecutive: CRAO, retinitis pigmentosa",
          "4. Post-glaucomatous"
        ]
      }
    ]
  },
  {
    id: 13,
    titleAr: "حدقة العين",
    titleEn: "The Pupil",
    icon: "⚫",
    topics: [
      {
        title: "Normal Pupil",
        bullets: [
          "Size: 3-4mm",
          "Sphincter: Parasympathetic (3rd nerve → ciliary ganglion → short ciliary nerves)",
          "Dilator: Sympathetic"
        ]
      },
      {
        title: "Light Reflex Pathway",
        bullets: [
          "Stimulus: light on one eye",
          "Afferent: optic nerve → optic tract → pretectal nucleus → Edinger-Westphal nucleus (both sides)",
          "Efferent: oculomotor nerve → ciliary ganglion → short ciliary nerves → sphincter pupillae",
          "Response: direct (ipsilateral) + consensual (contralateral) constriction"
        ]
      },
      {
        title: "Near Response",
        bullets: [
          "1. Accommodation (ciliary muscle contraction)",
          "2. Convergence (medial recti contraction)",
          "3. Miosis (pupil constriction)"
        ]
      },
      {
        title: "Abnormal Pupillary Responses",
        bullets: [
          "1. Amaurotic pupil (absolute afferent defect): complete optic nerve lesion → blind eye, no reaction when affected eye stimulated",
          "2. Marcus Gunn pupil (RAPD): incomplete optic nerve lesion → swinging flashlight test shows paradoxical dilatation",
          "3. Light-near dissociation: light reflex absent/sluggish, near response normal",
          "  - Argyll Robertson pupil: bilateral small irregular, neurosyphilis",
          "  - Adie (tonic) pupil: large regular, slow near response then slow redilatation",
          "4. Hutchinson pupil: traumatic subdural hemorrhage → constricted (early) → dilated irreactive (advanced)"
        ]
      },
      {
        title: "Miosis - Causes",
        bullets: [
          "Physiological: light, near reflexes, sleep, old age",
          "Drugs: miotics, morphine",
          "Local: trauma, acute iridocyclitis",
          "Neurological: Horner syndrome, Argyll Robertson, pontine hemorrhage"
        ]
      },
      {
        title: "Mydriasis - Causes",
        bullets: [
          "Physiological: darkness, emotions",
          "Drugs: mydriatics, datura",
          "Local: trauma, acute congestive glaucoma, blind eye",
          "Neurological: 3rd nerve palsy, coma (except morphine/pontine/4th stage anesthesia)"
        ]
      }
    ]
  },
  {
    id: 14,
    titleAr: "إصابات العين",
    titleEn: "Ocular Trauma",
    icon: "🩹",
    topics: [
      {
        title: "Chemical Injuries",
        bullets: [
          "Acids: toilet cleaner, battery fluids, pool cleaners - localized epithelial damage",
          "Alkalis: drain cleaner, oven cleaner, lime (most serious - deep penetration)",
          "Treatment:",
          "  1. Copious irrigation (20 minutes or 2 liters)",
          "  2. Remove particulate matter",
          "  3. Debride necrotic epithelium",
          "  4. pH monitoring (normal: 7.3-7.7)",
          "  5. Topical steroids, antibiotics, cycloplegics",
          "  6. Tetracyclines (collagenase inhibitors)",
          "  7. Monitor IOP"
        ]
      },
      {
        title: "Physical Injuries",
        bullets: [
          "Thermal: usually eyelids (steam, hot water, molten metals)",
          "Electric: cataract formation (most common)",
          "Radiation"
        ]
      },
      {
        title: "Mechanical Injuries",
        bullets: [
          "Extraocular Foreign Body: In conjunctival sac or on cornea → remove immediately",
          "Penetrating Injuries: Causes: sharp objects, flying FB. Effects: corneal laceration, lens injury, intraocular FB → infection or chemical reaction",
          "Non-penetrating (Blunt) Injuries: Causes: fist, stick, ball. Mechanism: compression + decompression of globe"
        ]
      },
      {
        title: "Blunt Injuries - Specific Ocular Structures",
        bullets: [
          "Eyelid: Ecchymosis (black eye), Traumatic ptosis (mechanical, paralytic, neuromyogenic), Lacerated wounds (suture + systemic antibiotics if contaminated)",
          "Orbit: Retrobulbar hemorrhage, Ophthalmoplegia (limitation of motility), Orbital wall fractures (floor > medial wall)",
          "Conjunctiva: Chemosis, Subconjunctival hemorrhage, Laceration (small [conservative], large [>6mm, suture])",
          "Cornea: Abrasion (fluorescein positive, bandage + antibiotics), Rupture (urgent surgical repair)",
          "Sclera: Scleral rupture (proper suturing, restore globe integrity)",
          "Anterior Chamber: Traumatic hyphema (blood in AC with upper horizontal level). Complications: recurrence, secondary glaucoma, chemical iritis, blood staining of cornea. Treatment: bed rest, stop anticoagulants, cycloplegics, steroids, antiglaucoma (IOP >40 or >30 for 2 weeks), Vitamin K",
          "Iris: Traumatic miosis/mydriasis, Post-traumatic iritis, Traumatic aniridia, Iridodialysis (D-shaped pupil, polycoria, binocular/uniocular diplopia)",
          "Ciliary Body: Spasm/paralysis of accommodation, ciliary body shutdown, angle recession → hyphema + angle recession glaucoma, cyclodialysis → sustained hypotony",
          "Lens: Concussion cataract: rosette-shaped (posterior cortex), Dislocation/subluxation, Lens particle glaucoma",
          "Vitreous: Vitreous hemorrhage, Vitreous liquefaction + PVD",
          "Choroid: Choroidal hemorrhage, Choroidal rupture",
          "Retina: Retinal breaks → retinal detachment (high myopia risk), Traumatic macular hole, Commotio retinae (Berlin's edema): transient white retinal edema, Retinal dialysis: disinsertion at ora serrata",
          "Optic Nerve: Laceration/avulsion, Optic neuropathy",
          "Intraocular Pressure Changes: Hypotony (cyclitis with loss of function, ruptured globe), Secondary glaucoma: 4 different mechanisms"
        ]
      }
    ]
  }
];
