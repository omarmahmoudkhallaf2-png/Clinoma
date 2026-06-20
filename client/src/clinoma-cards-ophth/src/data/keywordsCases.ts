export interface KeywordCaseItem {
  id: string;
  keywords: string;
  caseName: string;
}

export interface KeywordCaseChapter {
  id: number;
  titleAr: string;
  titleEn: string;
  cases: KeywordCaseItem[];
}

export const KEYWORD_CASES_DATA: KeywordCaseChapter[] = [
  {
    id: 1,
    titleAr: "حالات الجفن",
    titleEn: "Eyelid",
    cases: [
      {
        id: "kc-1-1",
        keywords: "Greasy grayish white scales between lashes, itching, burning worse in morning.",
        caseName: "Anterior Blepharitis (Squamous type)"
      },
      {
        id: "kc-1-2",
        keywords: "Yellow crusts gluing lashes, when removed leave minute bleeding ulcers.",
        caseName: "Anterior Blepharitis (Ulcerative type / Staphylococcal)"
      },
      {
        id: "kc-1-3",
        keywords: "Painful red tender swelling at root of eyelash, yellow point forms, don't press (dangerous area).",
        caseName: "Hordeolum Externum (Stye)"
      },
      {
        id: "kc-1-4",
        keywords: "Severe pain (more than stye), swelling away from lid margin, yellow spot on conjunctival side.",
        caseName: "Hordeolum Internum (Infected Meibomian gland)"
      },
      {
        id: "kc-1-5",
        keywords: "Painless localized swelling under eyelid skin, skin freely mobile over it, bluish-grey conjunctiva underneath.",
        caseName: "Chalazion (Lipo-granuloma)"
      },
      {
        id: "kc-1-6",
        keywords: "Drooping of upper eyelid since birth, worse in evening (myasthenia), or associated with miosis and anhidrosis (Horner's).",
        caseName: "Ptosis (Congenital / Myogenic / Neurogenic)"
      },
      {
        id: "kc-1-7",
        keywords: "Rolling out of lid margin, exposed conjunctiva, epiphora, elderly patient (most common type).",
        caseName: "Senile (Involutional) Ectropion"
      },
      {
        id: "kc-1-8",
        keywords: "Rolling in of lid margin, lashes rubbing cornea, scarred conjunctiva (trachoma), or spasm in young age.",
        caseName: "Entropion (Cicatricial or Spastic)"
      }
    ]
  },
  {
    id: 2,
    titleAr: "حالات الجهاز الدمعي",
    titleEn: "Lacrimal",
    cases: [
      {
        id: "kc-2-1",
        keywords: "Watering eye, press on sac → reflux of pus or mucus from punctum (positive regurgitation test).",
        caseName: "Chronic Dacryocystitis (NLD obstruction)"
      },
      {
        id: "kc-2-2",
        keywords: "Severe pain over lacrimal sac, redness, swelling, fever, abscess formation with fluctuation.",
        caseName: "Acute Dacryocystitis"
      },
      {
        id: "kc-2-3",
        keywords: "Burning sensation, FB sensation on waking up, punctate erosions, positive Schirmer's test (low).",
        caseName: "Keratoconjunctivitis Sicca (Dry Eye)"
      }
    ]
  },
  {
    id: 3,
    titleAr: "حالات الملتحمة",
    titleEn: "Conjunctiva",
    cases: [
      {
        id: "kc-3-1",
        keywords: "Red eye, mucopurulent discharge (glues lashes in morning), chemosis, common in Egypt (April-June).",
        caseName: "Mucopurulent Conjunctivitis (Koch-Week's bacillus)"
      },
      {
        id: "kc-3-2",
        keywords: "Copious purulent discharge, marked lid edema, chemosis, preauricular lymphadenopathy, risk of corneal perforation.",
        caseName: "Purulent Conjunctivitis (Gonococcal / Acute Blenorrhaea)"
      },
      {
        id: "kc-3-3",
        keywords: "Neonate (1st month), lid swelling, copious discharge 24-48 hours after birth.",
        caseName: "Ophthalmia Neonatorum (Gonococcal)"
      },
      {
        id: "kc-3-4",
        keywords: "Neonate, mild purulent discharge, onset 5-12 days after birth.",
        caseName: "Ophthalmia Neonatorum (Chlamydial / Inclusion Blenorrhoea)"
      },
      {
        id: "kc-3-5",
        keywords: "Follicles on upper tarsus, pannus (superficial vascularization of upper cornea), cicatrization, Arlt's line.",
        caseName: "Trachoma (Egyptian Ophthalmia)"
      },
      {
        id: "kc-3-6",
        keywords: "Severe itching, ropy (thready) discharge rich in eosinophils, cobblestone papillae on upper tarsus, summer exacerbation.",
        caseName: "Vernal Keratoconjunctivitis (Palpebral type / Spring Catarrh)"
      },
      {
        id: "kc-3-7",
        keywords: "Gelatinous limbal masses with white dots (Tranta spots).",
        caseName: "Vernal Keratoconjunctivitis (Bulbar/Limbal type)"
      },
      {
        id: "kc-3-8",
        keywords: "Round greyish nodule (1-3 mm) at limbus, surrounded by injection, children (5-12 years), responds dramatically to steroids.",
        caseName: "Phlycten (Phlyctenular keratoconjunctivitis)"
      },
      {
        id: "kc-3-9",
        keywords: "Triangular encroachment of conjunctiva onto cornea, nasal side, very common in Egypt, UV exposure.",
        caseName: "Pterygium"
      },
      {
        id: "kc-3-10",
        keywords: "Yellow degenerative nodule on nasal side of limbus, old age, triangular shape.",
        caseName: "Pinguecula"
      }
    ]
  },
  {
    id: 4,
    titleAr: "حالات القرنية",
    titleEn: "Cornea",
    cases: [
      {
        id: "kc-4-1",
        keywords: "Paracentral disc-shaped ulcer, crescentic undermined advancing edge (creeps towards center), hypopyon in AC.",
        caseName: "Hypopyon Ulcer (Acute Serpiginous Ulcer / Pneumococcal)"
      },
      {
        id: "kc-4-2",
        keywords: "Linear superficial ulcer with crenated edges and side branches ending in knobs (dendritic shape), corneal hypoesthesia.",
        caseName: "Dendritic Ulcer (Herpes Simplex Keratitis)"
      },
      {
        id: "kc-4-3",
        keywords: "Severe neuralgic pain, unilateral vesicles on forehead/eyelid (follows nerve distribution), fever.",
        caseName: "Herpes Zoster Ophthalmicus (HZO)"
      },
      {
        id: "kc-4-4",
        keywords: "Grey/dirty white dry textured ulcer, feathery extensions into stroma, satellite lesions, history of trauma with vegetable matter.",
        caseName: "Fungal Ulcer (Filamentous - Fusarium/Aspergillus)"
      },
      {
        id: "kc-4-5",
        keywords: "Central ulcer, punched-out edges, NO pain (characteristic), corneal anesthesia.",
        caseName: "Neurotrophic (Neuroparalytic) Keratitis"
      },
      {
        id: "kc-4-6",
        keywords: "Ulcer in lower 1/3 of cornea (upper straight level), inability to close eye, exposure dryness.",
        caseName: "Exposure Keratitis (with Lagophthalmos)"
      },
      {
        id: "kc-4-7",
        keywords: "Progressive painless diminution of vision, thin ectatic cone-shaped cornea, Munson's sign (angulation of lower lid on looking down), Fleischer's ring.",
        caseName: "Keratoconus (Conical Cornea)"
      },
      {
        id: "kc-4-8",
        keywords: "Translucent bleb bulging from grayish ulcer (Descemet's membrane pushing forward under IOP).",
        caseName: "Descemetocoele"
      }
    ]
  },
  {
    id: 5,
    titleAr: "حالات العدسة",
    titleEn: "Lens",
    cases: [
      {
        id: "kc-5-1",
        keywords: "Gradual painless visual loss, uniocular diplopia (irregular refraction), haloes, wedge-shaped peripheral opacities.",
        caseName: "Incipient Senile Cortical Cataract"
      },
      {
        id: "kc-5-2",
        keywords: "Incomplete greyish opacification, iris shadow present, worse night vision.",
        caseName: "Immature Senile Cortical Cataract"
      },
      {
        id: "kc-5-3",
        keywords: "Total greyish-white opacification, no iris shadow, hand movement vision only.",
        caseName: "Mature Senile Cortical Cataract"
      },
      {
        id: "kc-5-4",
        keywords: "Reappearance of iris shadow, deep anterior chamber, iridodonesis (tremulous iris), calcium/cholesterol crystals.",
        caseName: "Hypermature Senile Cortical Cataract"
      },
      {
        id: "kc-5-5",
        keywords: "Index myopia (second sight - corrects presbyopia), day blindness (worse in light), progressive opacification of nucleus.",
        caseName: "Senile Nuclear Cataract"
      },
      {
        id: "kc-5-6",
        keywords: "Mother had rubella in first trimester, leukocoria at birth, total opacity, microphthalmos, deafness, PDA.",
        caseName: "Rubella Total Cataract"
      },
      {
        id: "kc-5-7",
        keywords: "Rosette-shaped opacity in posterior cortex, history of blunt trauma (fist, ball).",
        caseName: "Concussion (Contusion) Cataract"
      },
      {
        id: "kc-5-8",
        keywords: "Soap-bubble cells (Elschnig's pearls) or capsular fibrosis after cataract surgery.",
        caseName: "After-Cataract (Posterior Capsular Opacity)"
      }
    ]
  },
  {
    id: 6,
    titleAr: "حالات الجلوكوما",
    titleEn: "Glaucoma",
    cases: [
      {
        id: "kc-6-1",
        keywords: "Asymptomatic patient, optic disc cupping (C/D > 0.4), visual field defects (arcuate scotoma, nasal step), open angle on gonioscopy, IOP > 21.",
        caseName: "Primary Open Angle Glaucoma (POAG / Chronic Simple Glaucoma)"
      },
      {
        id: "kc-6-2",
        keywords: "Sudden severe periocular pain, nausea/vomiting, haloes, hazy cornea, semi-dilated fixed oval pupil, shallow AC, high IOP.",
        caseName: "Acute Congestive Angle Closure Glaucoma (PACG)"
      },
      {
        id: "kc-6-3",
        keywords: "Hypermature cataract, macrophages blocking trabeculum, normal AC depth, open angle, anterior chamber reaction.",
        caseName: "Phacolytic Glaucoma"
      },
      {
        id: "kc-6-4",
        keywords: "Intumescent (swollen) cataract, shallow AC, pupillary block, high IOP simulating acute glaucoma.",
        caseName: "Phacomorphic Glaucoma"
      },
      {
        id: "kc-6-5",
        keywords: "Infant, triad of lacrimation, photophobia, blepharo-spasm, cloudy enlarged cornea (>12mm), Haab's striae.",
        caseName: "Primary Infantile Glaucoma (Buphthalmos)"
      }
    ]
  },
  {
    id: 7,
    titleAr: "حالات العنبية",
    titleEn: "Uveitis",
    cases: [
      {
        id: "kc-7-1",
        keywords: "Dull ache (worse at night), photophobia, ciliary injection, KPs (triangle with base down), aqueous flare, muddy iris, miosis.",
        caseName: "Acute Iridocyclitis (Anterior Uveitis)"
      },
      {
        id: "kc-7-2",
        keywords: "Triad: bilateral recurrent iridocyclitis + recurrent oral ulcers + recurrent genital ulcers.",
        caseName: "Bechet's Syndrome"
      },
      {
        id: "kc-7-3",
        keywords: "Bilateral uveitis + Vitiligo (skin depigmentation) + Poliosis (greying of eyebrows/lashes).",
        caseName: "Vogt-Koyanagi-Harada Syndrome"
      },
      {
        id: "kc-7-4",
        keywords: "Painless, no marked visual loss (unless macula), vitreous cells, choroidal lesions.",
        caseName: "Posterior Uveitis (Choroiditis)"
      }
    ]
  },
  {
    id: 8,
    titleAr: "حالات الشبكية",
    titleEn: "Retina",
    cases: [
      {
        id: "kc-8-1",
        keywords: "Microaneurysms, dot-blot hemorrhages, hard exudates, asymptomatic patient with diabetes.",
        caseName: "Non-Proliferative Diabetic Retinopathy (NPDR)"
      },
      {
        id: "kc-8-2",
        keywords: "Cotton wool spots, venous beading, IRMA (pre-proliferative signs).",
        caseName: "Pre-Proliferative Diabetic Retinopathy"
      },
      {
        id: "kc-8-3",
        keywords: "Neovessels at disc (NVD) or elsewhere (NVE), vitreous hemorrhage, fibrous tissue proliferation.",
        caseName: "Proliferative Diabetic Retinopathy (PDR)"
      },
      {
        id: "kc-8-4",
        keywords: "Sudden painless loss of vision, cherry red spot at fovea, white swollen retina, attenuated arteries (cattle trucking).",
        caseName: "Central Retinal Artery Occlusion (CRAO)"
      },
      {
        id: "kc-8-5",
        keywords: "Sudden unilateral loss of vision (worse in early morning), engorged tortuous veins, extensive flame/dot-blot hemorrhages, cotton wool spots.",
        caseName: "Central Retinal Vein Occlusion (Ischemic CRVO)"
      },
      {
        id: "kc-8-6",
        keywords: "Flashes of light (photopsia), floaters (musca volitans), progressive black curtain, grey convex detached retina with reddish break.",
        caseName: "Rhegmatogenous Retinal Detachment"
      },
      {
        id: "kc-8-7",
        keywords: "Tractional retinal detachment in diabetic patient (PDR) with fibrous membranes.",
        caseName: "Tractional Retinal Detachment"
      },
      {
        id: "kc-8-8",
        keywords: "Night blindness (nyctalopia), bone-spicule pigment clumps (mid-periphery), arteriolar attenuation, waxy disc pallor.",
        caseName: "Retinitis Pigmentosa (Pigmentary Dystrophy)"
      }
    ]
  },
  {
    id: 9,
    titleAr: "حالات الحول",
    titleEn: "Strabismus",
    cases: [
      {
        id: "kc-9-1",
        keywords: "Eye deviated inwards, limitation of outward movement, uncrossed diplopia, face turn to opposite side (right side in right LR palsy).",
        caseName: "Right 6th Nerve Palsy (Paralytic Squint)"
      },
      {
        id: "kc-9-2",
        keywords: "Hypermetropic child, excessive accommodation → convergence, esotropia, no limitation of movements, no diplopia.",
        caseName: "Concomitant Convergent Squint (Accommodative Esotropia)"
      },
      {
        id: "kc-9-3",
        keywords: "Myopic child, lack of accommodation → less convergence, exotropia.",
        caseName: "Concomitant Divergent Squint (Exotropia)"
      }
    ]
  },
  {
    id: 10,
    titleAr: "حالات المدار والرمد",
    titleEn: "Orbit & Infections",
    cases: [
      {
        id: "kc-10-1",
        keywords: "Lid edema, chemosis, axial proptosis, painful limitation of movements in all directions, fever. (Posterior to septum).",
        caseName: "Orbital Cellulitis"
      },
      {
        id: "kc-10-2",
        keywords: "Swollen red eyelid only (anterior to septum), NO proptosis, NO limitation of movements, NO visual loss.",
        caseName: "Preseptal Cellulitis"
      },
      {
        id: "kc-10-3",
        keywords: "Lid retraction (staring look), lid lag (retarded descent on down gaze), axial proptosis (unilateral or bilateral), restrictive myopathy, female patient.",
        caseName: "Thyroid Eye Disease (Graves' Ophthalmopathy)"
      },
      {
        id: "kc-10-4",
        keywords: "Rapidly increasing proptosis, ophthalmoplegia, lid edema, mastoid edema, contralateral eye involvement.",
        caseName: "Cavernous Sinus Thrombosis"
      }
    ]
  },
  {
    id: 11,
    titleAr: "حالات الإصابات",
    titleEn: "Trauma",
    cases: [
      {
        id: "kc-11-1",
        keywords: "Blood in anterior chamber with upper horizontal level, history of blunt trauma, photophobia, high IOP.",
        caseName: "Traumatic Hyphema"
      },
      {
        id: "kc-11-2",
        keywords: "D-shaped pupil, black area (dialysed iris root) giving polycoria, history of blunt trauma.",
        caseName: "Traumatic Iridodialysis"
      },
      {
        id: "kc-11-3",
        keywords: "Transient white retinal edema (Berlin's edema) after blunt trauma, usually asymptomatic unless macula.",
        caseName: "Commotio Retinae"
      },
      {
        id: "kc-11-4",
        keywords: "Severe burn, copious irrigation required, lime (calcium monoxide) is most serious.",
        caseName: "Alkali Chemical Injury (Ocular emergency)"
      }
    ]
  },
  {
    id: 12,
    titleAr: "حالات العصب البصري والتلميذ",
    titleEn: "Neuro-ophthalmology",
    cases: [
      {
        id: "kc-12-1",
        keywords: "Rapid visual loss, pain with eye movements (adduction/elevation), hyperemic swollen disc, filled cup, central scotoma for red/green.",
        caseName: "Papillitis (Optic Neuritis)"
      },
      {
        id: "kc-12-2",
        keywords: "Acute unilateral visual loss in young adult (20-40), pain with eye movements, RAPD (Marcus Gunn), but FUNDUS IS NORMAL.",
        caseName: "Retrobulbar Neuritis"
      },
      {
        id: "kc-12-3",
        keywords: "Bilateral disc swelling, headache/vomiting, transient visual obscurations (< 1 minute), engorged veins, hemorrhages on disc.",
        caseName: "Papilledema (Raised Intracranial Tension)"
      },
      {
        id: "kc-12-4",
        keywords: "Swinging flashlight test shows paradoxical dilatation (pupil dilates when light is swung to it).",
        caseName: "Marcus Gunn Pupil (Relative Afferent Pupillary Defect - RAPD)"
      },
      {
        id: "kc-12-5",
        keywords: "Small irregular pupils, bilateral, light reflex absent but near reflex is intact (Light-Near Dissociation), neurosyphilis.",
        caseName: "Argyll Robertson Pupil"
      }
    ]
  },
  {
    id: 13,
    titleAr: "حالات متنوعة",
    titleEn: "Miscellaneous",
    cases: [
      {
        id: "kc-13-1",
        keywords: "Difficult reading at age 45, needs to hold book further away, normal emmetrope (or earlier in hypermetrope).",
        caseName: "Presbyopia"
      },
      {
        id: "kc-13-2",
        keywords: "Absence of crystalline lens (aphakic eye), deep AC, iridodonesis, jet black pupil, unilateral aphakia causes anisometropia.",
        caseName: "Aphakia (Post-traumatic or Post-operative)"
      },
      {
        id: "kc-13-3",
        keywords: "Same size pupil in both eyes (no anisocoria), affected eye is blind (no PL), when affected eye stimulated no reaction, but normal eye stimulation constricts both.",
        caseName: "Amaurotic Pupil (Complete optic nerve lesion)"
      }
    ]
  }
];
