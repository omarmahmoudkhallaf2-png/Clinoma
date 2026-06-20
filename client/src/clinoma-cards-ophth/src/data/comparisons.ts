export interface ComparisonTable {
  id: string;
  titleAr: string;
  titleEn: string;
  reference: string;
  headers: string[]; // e.g., ["Item of Difference", "Hordeolum Externum (Stye)", ...]
  rows: string[][]; // each element is an array of cells matching the headers length
}

export const COMPARISONS_DATA: ComparisonTable[] = [
  {
    id: "stye_hordeolum_chalazion",
    titleAr: "Stye (External) vs Internal Hordeolum vs Chalazion",
    titleEn: "Stye (External) vs Internal Hordeolum vs Chalazion",
    reference: "Pages: 13-15",
    headers: ["Item of Difference", "Hordeolum Externum (Stye)", "Hordeolum Internum", "Chalazion"],
    rows: [
      [
        "Definition",
        "Acute suppurative inflammation of the **Zeiss gland**.",
        "Acute suppurative inflammation of the **Meibomian gland**.",
        "Localized chronic inflammatory **lipo-granuloma** of a Meibomian gland."
      ],
      [
        "Site",
        "At the **lid margin** (root of lash).",
        "Away from lid margin (deep in tarsus).",
        "Away from lid margin."
      ],
      [
        "Pain",
        "Painful red swelling.",
        "More severe pain (pus under tension).",
        "**Painless** (unless infected)."
      ],
      [
        "Pointing site",
        "Yellow point on the **skin** side.",
        "Yellow spot on the **conjunctival** side.",
        "Red or bluish-grey on conjunctival side."
      ],
      [
        "Treatment",
        "Epilation + horizontal incision. Do NOT press.",
        "Vertical or cruciate incision on conjunctival side.",
        "Incision + curettage. Recurrent → excision biopsy."
      ]
    ]
  },
  {
    id: "pterygium_pinguecula_phlycten",
    titleAr: "Pterygium vs Pinguecula vs Phlycten",
    titleEn: "Pterygium vs Pinguecula vs Phlycten",
    reference: "Pages: 56, 57, 59",
    headers: ["Item of Difference", "Phlycten", "Pinguecula", "Pterygium"],
    rows: [
      [
        "Cause",
        "Allergic (endogenous toxin).",
        "Degenerative (UV rays, old age).",
        "Chronic irritation, UV rays."
      ],
      [
        "Age",
        "Young (children 5-12 years).",
        "Old age.",
        "Adults (common in Egypt)."
      ],
      [
        "Shape",
        "**Round** nodule (1-3 mm).",
        "**Triangular** nodule.",
        "**Triangular** encroachment onto cornea."
      ],
      [
        "Color",
        "**Greyish**.",
        "**Yellow**.",
        "Fleshy / vascular."
      ],
      [
        "Site",
        "Anywhere (commonly limbus / bulbar).",
        "**Nasal side** of limbus (never on cornea).",
        "**Nasal side** (head on cornea)."
      ],
      [
        "Ulceration",
        "**Occurs** (phlyctenular ulcer).",
        "**Never**.",
        "Never (unless recurrent surgery)."
      ],
      [
        "Treatment",
        "Topical steroids (dramatic effect).",
        "No treatment needed.",
        "Surgery only if progressive or affects vision."
      ]
    ]
  },
  {
    id: "spring_catarrh_trachoma",
    titleAr: "Papillae of Spring Catarrh vs Papillae of Trachoma",
    titleEn: "Papillae of Spring Catarrh vs Papillae of Trachoma",
    reference: "Table 5, Page: 55",
    headers: ["Item of Difference", "Papillae of Spring Catarrh", "Papillae of Trachoma"],
    rows: [
      [
        "Etiology",
        "Allergic (IgE).",
        "Chlamydia trachomatis."
      ],
      [
        "Symptoms",
        "**Itching**.",
        "Heaviness of lids."
      ],
      [
        "Season",
        "**Summer** (exacerbation).",
        "Not seasonal."
      ],
      [
        "Sex",
        "Males more.",
        "Equal."
      ],
      [
        "Size",
        "**Large** (cobblestone).",
        "Fine."
      ],
      [
        "Top",
        "**Flat topped**.",
        "Rounded tops."
      ],
      [
        "Color",
        "**Bluish-white**.",
        "Red."
      ],
      [
        "Upper Fornix",
        "**Always free**.",
        "Affected."
      ],
      [
        "Discharge",
        "Ropy, rich in **eosinophils**.",
        "No eosinophils."
      ],
      [
        "Inclusion bodies",
        "Absent.",
        "**Present**."
      ]
    ]
  },
  {
    id: "types_of_pannus",
    titleAr: "Types of Pannus (Trachomatous vs Phlyctenular vs Leprotic vs Degenerative)",
    titleEn: "Types of Pannus (Trachomatous vs Phlyctenular vs Leprotic vs Degenerative)",
    reference: "Table 8, Page: 57",
    headers: ["Item of Difference", "Trachomatous", "Phlyctenular", "Leprotic", "Degenerative"],
    rows: [
      [
        "Cause",
        "Chlamydia trachomatis.",
        "Allergic.",
        "Infective (lepra bacilli).",
        "Degenerative."
      ],
      [
        "Site",
        "**Upper** part of cornea.",
        "Any site.",
        "Any site.",
        "Any site."
      ],
      [
        "Border",
        "**Serrated** edge.",
        "**Rounded** edge.",
        "Irregular.",
        "Irregular."
      ],
      [
        "Cells & Vessels",
        "Variable & branching.",
        "**Thin, very vascular**, vessels straight (deep to Bowman's).",
        "Irregular deep infiltration, few vessels.",
        "Fibrous tissue, few blood vessels."
      ],
      [
        "Associated Signs",
        "Follicles or papillae.",
        "Phlycten, irritation, eczema.",
        "Leprotic iritis, corneal anesthesia.",
        "Signs of absolute glaucoma."
      ]
    ]
  },
  {
    id: "nuclear_sclerosis_cataract",
    titleAr: "Nuclear Sclerosis vs Nuclear Cataract",
    titleEn: "Nuclear Sclerosis vs Nuclear Cataract",
    reference: "Table, Page: 90",
    headers: ["Feature", "Nuclear Sclerosis", "Nuclear Cataract"],
    rows: [
      [
        "Cause",
        "Exaggerated physiological nuclear dehydration & lens fibers get compressed towards the center.",
        "Pathological nuclear dehydration & opacification."
      ],
      [
        "Visual Acuity",
        "**Corrected** by glasses to normal levels.",
        "**Not improved** by glasses."
      ],
      [
        "Oblique Illumination",
        "Grayish appearance of the nucleus.",
        "Yellow to yellow-brown or black."
      ],
      [
        "Red Reflex",
        "All Red.",
        "**Black center** on red periphery."
      ],
      [
        "Treatment",
        "Glasses.",
        "Surgical \"If indicated\"."
      ]
    ]
  },
  {
    id: "crvo_ischemic_vs_non",
    titleAr: "Ischemic vs Non-Ischemic Central Retinal Vein Occlusion (CRVO)",
    titleEn: "Ischemic vs Non-Ischemic Central Retinal Vein Occlusion (CRVO)",
    reference: "Table, Page: 188",
    headers: ["Feature", "Non-Ischemic CRVO", "Ischemic CRVO"],
    rows: [
      [
        "Visual Acuity",
        "Moderate diminution of vision **> 6/60**.",
        "Severe diminution of vision **< 6/60**."
      ],
      [
        "Afferent Pupillary Defect",
        "Absent or mild.",
        "**Marked**."
      ],
      [
        "Fundus",
        "Mild tortuous veins, dot-blot/flame hemorrhages (more in periphery). Few or absent cotton wool spots.",
        "Marked tortuous, engorged veins, **extensive** hemorrhages (center + periphery). **Numerous** cotton wool spots."
      ],
      [
        "Fluorescein Angiography",
        "Good capillary perfusion.",
        "Extensive areas of **capillary non-perfusion**."
      ],
      [
        "Fate / Prognosis",
        "50% resolve, VA near normal.",
        "50% develop **neovascularization**."
      ]
    ]
  },
  {
    id: "types_of_rd",
    titleAr: "Types of Retinal Detachment (RD)",
    titleEn: "Types of Retinal Detachment (RD)",
    reference: "Pages: 192-194",
    headers: ["Feature", "Rhegmatogenous RD", "Tractional RD", "Exudative RD"],
    rows: [
      [
        "Mechanism",
        "Retinal break allows liquefied vitreous under retina.",
        "Fibrous tissue pulls sensory retina off.",
        "Fluid from choroid accumulates in subretinal space."
      ],
      [
        "Retinal Breaks",
        "**Present**.",
        "**Absent**.",
        "**Absent**."
      ],
      [
        "Retinal Appearance",
        "Grey, convex, undulates with eye movement.",
        "**Concave** appearance.",
        "Shallow or bullous convex, very mobile (shifting fluid)."
      ],
      [
        "Common Causes",
        "High myopia, aphakia, trauma, lattice degeneration.",
        "PDR, ROP, Sickle cell retinopathy, trauma.",
        "Choroidal tumors (melanoma), inflammation (Harada's), toxemia, malignant hypertension."
      ],
      [
        "Treatment",
        "Scleral buckling / Vitrectomy + endolaser.",
        "Pars plana vitrectomy + membrane removal.",
        "Treatment of the underlying cause."
      ]
    ]
  },
  {
    id: "squint_paralytic_vs_concomitant",
    titleAr: "Paralytic Squint vs Concomitant Squint",
    titleEn: "Paralytic Squint vs Concomitant Squint",
    reference: "Pages: 163, 168",
    headers: ["Feature", "Paralytic Squint", "Concomitant Squint"],
    rows: [
      [
        "Angle of Deviation",
        "**Variable** in different directions of gaze.",
        "**Constant** in all directions of gaze."
      ],
      [
        "Limitation of Movements",
        "**Present** (in the direction of action of paralyzed muscle).",
        "**Absent** (no limitation)."
      ],
      [
        "Diplopia",
        "**Present** (binocular diplopia).",
        "**Absent** (due to suppression in children)."
      ],
      [
        "Primary vs Secondary Angle",
        "Secondary angle **>** Primary angle (due to Herring's law).",
        "Primary angle **=** Secondary angle."
      ],
      [
        "Compensatory Head Posture",
        "**Present** (ocular torticollis to avoid diplopia).",
        "**Absent**."
      ]
    ]
  },
  {
    id: "papillitis_vs_papilledema",
    titleAr: "Papillitis vs Papilledema",
    titleEn: "Papillitis vs Papilledema",
    reference: "Pages: 198, 200",
    headers: ["Feature", "Papillitis", "Papilledema"],
    rows: [
      [
        "Laterality",
        "Usually **unilateral**.",
        "Usually **bilateral**."
      ],
      [
        "Visual Acuity",
        "**Markedly reduced** (rapid progressive visual loss).",
        "Normal or slightly blurred (late visual loss)."
      ],
      [
        "Pain",
        "**Present** (pain with eye movements).",
        "**Absent** (headache from ↑ICT present)."
      ],
      [
        "Pupil",
        "**RAPD (Marcus Gunn)** present.",
        "Rounded, regular, reactive (RRR)."
      ],
      [
        "Fundus",
        "Hyperemic disc, filled cup, retinal vessels may be normal or slightly congested.",
        "Severe elevation (up to 9D), engorged tortuous veins, flame hemorrhages on disc."
      ],
      [
        "Field Defect",
        "Central scotoma (for red/green).",
        "Enlarged blind spot (early), central scotoma for blue (late)."
      ]
    ]
  },
  {
    id: "miosis_vs_mydriasis",
    titleAr: "Causes of Miosis vs Mydriasis",
    titleEn: "Causes of Miosis vs Mydriasis",
    reference: "Table, Page: 206",
    headers: ["Category", "Miosis (Pupil diameter < 2mm)", "Mydriasis (Pupil diameter > 7mm)"],
    rows: [
      [
        "Physiological",
        "Light/near reflexes, Sleep, Old age.",
        "Withdrawal of light, Emotions (Stress)."
      ],
      [
        "Drugs",
        "Miotics, Morphine poisoning.",
        "Mydriatics, Datura poisoning."
      ],
      [
        "Local diseases",
        "Acute iridocyclitis, Trauma, Puncture of AC.",
        "Acute congestive glaucoma, Trauma, Blind eye (bilateral optic atrophy)."
      ],
      [
        "Neurological",
        "Horner syndrome, Argyll Robertson pupil, Pontine hemorrhage.",
        "3rd Nerve palsy, Irritative stage of extra-dural hemorrhage (Hutchinson pupil), Coma (except in morphine/pontine)."
      ]
    ]
  },
  {
    id: "abnormal_pupils_dissociation",
    titleAr: "Types of Abnormal Pupils (Light-Near Dissociation)",
    titleEn: "Types of Abnormal Pupils (Light-Near Dissociation)",
    reference: "Pages: 205-206",
    headers: ["Feature", "Argyll Robertson Pupil", "Adie (Tonic) Pupil", "Marcus Gunn Pupil (RAPD)"],
    rows: [
      [
        "Cause",
        "Neurosyphilis.",
        "Viral illness.",
        "Incomplete optic nerve lesion / severe retinal disease."
      ],
      [
        "Laterality",
        "Bilateral, asymmetrical.",
        "Usually unilateral.",
        "Unilateral."
      ],
      [
        "Pupil Size",
        "**Small and irregular**.",
        "**Large** (except when old).",
        "Both pupils equal in size."
      ],
      [
        "Light Reflex",
        "**Absent / Sluggish**.",
        "**Absent / Sluggish**.",
        "**Paradoxical dilatation** on swinging flashlight."
      ],
      [
        "Near Reflex",
        "**Normal** (intact).",
        "**Slow** response, followed by slow redilatation.",
        "Normal."
      ]
    ]
  },
  {
    id: "lagophthalmos_ectropion_entropion",
    titleAr: "Lagophthalmos vs Ectropion vs Entropion",
    titleEn: "Lagophthalmos vs Ectropion vs Entropion (Positional Anomalies)",
    reference: "Pages: 17, 19, 22",
    headers: ["Feature", "Entropion", "Ectropion", "Lagophthalmos"],
    rows: [
      [
        "Definition",
        "Rolling **in** of the lid margin (lashes rub globe).",
        "Rolling **out** (outward rotation) of lid margin.",
        "Incomplete **closure** of palpebral fissure."
      ],
      [
        "Common Cause",
        "Senile (Involutional), Cicatricial (trachoma).",
        "Senile (Involutional - most common), Paralytic (Bell's palsy).",
        "Facial palsy, Ectropion, Proptosis."
      ],
      [
        "Complication",
        "Corneal irritation, Trichiasis.",
        "Epiphora (eversion of punctum), Exposure keratitis.",
        "Exposure keratitis (lower 1/3 of cornea)."
      ],
      [
        "Treatment",
        "Reattachment of retractors (congenital). Everting sutures (spastic).",
        "V-Y plasty (cicatricial). Lateral tarsal strip (senile).",
        "Tarsorrhaphy (lateral or median)."
      ]
    ]
  },
  {
    id: "endophthalmitis_vs_panophthalmitis",
    titleAr: "Endophthalmitis vs Panophthalmitis",
    titleEn: "Endophthalmitis vs Panophthalmitis",
    reference: "Pages: 154-155",
    headers: ["Feature", "Endophthalmitis", "Panophthalmitis"],
    rows: [
      [
        "Definition",
        "Acute suppurative inflammation **inside** the globe.",
        "Acute suppurative inflammation involving all ocular tissues, **Tenon's capsule** and soft orbital tissues."
      ],
      [
        "Proptosis",
        "**Absent** (Tenon's not affected).",
        "**Present** (marked)."
      ],
      [
        "Limitation of Movements",
        "**Absent**.",
        "**Present** (all directions)."
      ],
      [
        "Treatment",
        "Early: Medical (intravitreal/topical/systemic antibiotics + atropine + steroids) or Vitrectomy. Late: Evisceration.",
        "Evisceration."
      ]
    ]
  }
];
