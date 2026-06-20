export interface TreatmentTopic {
  id: string; // unique string id
  title: string; // e.g., "Blepharitis Treatment" or "Hordeolum Externum (Stye) Treatment"
  content: string[]; // array of treatment bullet points or lines
}

export interface TreatmentChapter {
  id: number; // chapter number (1 to 13)
  title: string; // e.g., "Chapter 1: Eyelid"
  topics: TreatmentTopic[];
}

export const TREATMENTS_DATA: TreatmentChapter[] = [
  {
    id: 1,
    title: "Chapter 1: Eyelid",
    topics: [
      {
        id: "t1_blepharitis",
        title: "Blepharitis Treatment",
        content: [
          "**General**: TTT of predisposing factors as well as treatment of associated conditions.",
          "**Local**: Lid hygiene using: Warm compresses, Eyelid massage. Removal of scales using diluted solution of baby shampoo. Local antibiotic ointment."
        ]
      },
      {
        id: "t1_stye",
        title: "Hordeolum Externum (Stye) Treatment",
        content: [
          "Treatment of the predisposing factors.",
          "Warm, moist compresses and topical antibiotics (drops and ointment).",
          "Systemic antibiotics are indicated in severe cases, complicated by cellulitis.",
          "If Pointing: drain pus by epilation of the related eye lash with a horizontal incision.",
          "**Do not press** to evacuate a stye (dangerous area) may spread infection and cause orbital cellulitis or cavernous sinus thrombosis."
        ]
      },
      {
        id: "t1_hordeolum_internum",
        title: "Hordeolum Internum Treatment",
        content: [
          "Like that for stye, but evacuation may be needed through a vertical or cruciate incision on the conjunctival side."
        ]
      },
      {
        id: "t1_chalazion",
        title: "Chalazion Treatment",
        content: [
          "Small chalazion: may be left alone with follow up.",
          "Large chalazion: incision (cruciate or vertical) and curettage or scraping of its contents from the conjunctival side.",
          "Infected chalazion: As hordeolum internum.",
          "Recurrent swelling in the same gland: Excision biopsy and histopathological examination is done to exclude malignancy.",
          "**N.B**: Intralesional injection of 0.1 ml steroids may resolve the chalazion."
        ]
      },
      {
        id: "t1_distichiasis",
        title: "Distichiasis Treatment",
        content: [
          "Asymptomatic cases: No treatment.",
          "Complicated cases: Destruction of ectopic lashes either by: 1) Direct removal. 2) Cryotherapy on the anterior surface of the tarsus after splitting the anterior from posterior lamellae at the grey line."
        ]
      },
      {
        id: "t1_rubbing_lashes",
        title: "Rubbing Lashes Treatment",
        content: [
          "**Temporary measures**: Epilation (always followed by regrowth of stronger lashes within 2-3 weeks).",
          "**Permanent measures**: Destruction of the involved lashes by either: 1) Electrolysis. 2) Argon laser ablation. 3) Diathermy and cryoapplication (may result in disfigurement and depigmentation of the lid margin)."
        ]
      },
      {
        id: "t1_trichiasis",
        title: "Trichiasis Treatment",
        content: [
          "Pure trichiasis (without entropion): treated surgically: Removal of the lash-bearing area. Direct internal removal of the lash roots through eyelid crease incision.",
          "Trichiasis with entropion: Treatment of entropion."
        ]
      },
      {
        id: "t1_congenital_entropion",
        title: "Congenital Entropion Treatment",
        content: [
          "Reattachment of lower lid retractors to the lower tarsal border."
        ]
      },
      {
        id: "t1_cicatricial_entropion",
        title: "Cicatricial Entropion Treatment",
        content: [
          "Mainly surgical."
        ]
      },
      {
        id: "t1_spastic_entropion",
        title: "Spastic Entropion Treatment",
        content: [
          "1. Removal or treating the predisposing cause.",
          "2. Temporary measures: T-shaped adhesive plaster. Botulinum toxin injection to orbicularis to weaken it (chemical denervation). Everting sutures: 3-4 mattress sutures, starting at the lower fornix to be tied on the skin below the eyelid margin.",
          "3. Permanent measures: Only for chronic resistant cases. Skin and muscle operation: Excision of an elliptical area of skin with the underlying muscle of Riolan close to the lid margin."
        ]
      },
      {
        id: "t1_senile_entropion",
        title: "Senile (Involutonal) Entropion Treatment",
        content: [
          "Mainly surgical."
        ]
      },
      {
        id: "t1_cicatricial_ectropion",
        title: "Cicatricial Ectropion Treatment",
        content: [
          "Protect the cornea from exposure until the deformity is corrected surgically by:",
          "Small scar: V-Y operation.",
          "Large scar: Z-plasty, or removal of the scar tissue followed by eyelid grafting."
        ]
      },
      {
        id: "t1_senile_ectropion",
        title: "Senile (Involutional) Ectropion Treatment",
        content: [
          "Mild cases: Cautery puncture (conjunctival side) to form a scar that everts the lid margin inwards.",
          "Moderate cases: Snellen's sutures.",
          "Severe cases: Dimmer's modification of Kuhnt operation."
        ]
      },
      {
        id: "t1_mechanical_ectropion",
        title: "Mechanical Ectropion Treatment",
        content: [
          "Of the cause."
        ]
      },
      {
        id: "t1_paralytic_ectropion",
        title: "Paralytic Ectropion Treatment",
        content: [
          "**Temporary measures**: Help nerve regeneration by vitamin B complex, vasodilator, cortisone, and nonsteroidal anti-inflammatory drugs. Help muscle by massage and electric stimulation. Protect cornea by artificial tears during the day and ointment during sleep as well as strapping of the lids.",
          "**If paralysis is permanent**: Tarsorrhaphy (upper and lower lid margins stitched together). Canthoplasty (lateral and medial shortening of the canthal tendon). Subcutaneous fascia lata sling (fixed to medial canthal tendon and passed subcutaneous below the lower lid to be fixed to temporalis fascia). Lateral tarsal strip (lateral part of tarsus fixed to lateral canthal tendon). Silicon or fascia lata sling encircling the eyelid."
        ]
      },
      {
        id: "t1_lagophthalmos",
        title: "Lagophthalmos Treatment",
        content: [
          "1. **Temporary protection**: In mild degrees ointment is instilled at night. Closure of the lids by narrow strips of plaster. A contact lens can be used when the lids cannot be brought together.",
          "2. **Surgical treatment**: It is indicated when it is difficult to close the eye by the previous methods: Lateral tarsorrhaphy (to reduce the width of the palpebral fissure). Median tarsorrhaphy (Union of the whole lid margin sometimes is indicated in cases with severe lagophthalmos). Removal of the cause of lagophthalmos."
        ]
      },
      {
        id: "t1_ptosis",
        title: "Ptosis Treatment",
        content: [
          "1. Mechanical: remove the cause (tumor or multiple chalazia).",
          "2. Hysterical: psychoanalysis.",
          "3. Myasthenia Gravis: prostigmine.",
          "4. Paralytic or traumatic causes: Wait for 6 months then re-evaluate the ptosis.",
          "5. Senile: levator aponeurosis repair or levator resection.",
          "**Choice of operation**: Depends on Amount of ptosis and levator action:",
          "- If levator muscle has some action (fair or good): Resection and advancement done to strengthen the muscle. Blascovic's operation (from conjunctival side). Everbusch's operation (from skin side).",
          "- If Levator function is poor & severe ptosis: Frontalis suspension (sling) (Hiss operation).",
          "**Contraindications to ptosis surgery**:",
          "1. Recent complete 3rd nerve palsy (correct squint 1st).",
          "2. Ptosis associated with neuroparalytic keratitis or absent Bell's phenomenon.",
          "3. Myasthenic ptosis (medical).",
          "4. Corneal anesthesia (to avoid exposure keratitis)."
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Chapter 2: Lacrimal System",
    topics: [
      {
        id: "t2_epiphora",
        title: "Epiphora Treatment",
        content: [
          "1. Treatment of the cause: e.g. ectropion and nasal causes.",
          "2. Stenosis of puncta and canaliculi: Dilatation and probing. One snip ampullotomy (vertical snip in the posterior wall of canal). Laser punctoplasty.",
          "3. Obstruction of puncta and canaliculi: Two snip operation (triangle removed from posterior wall of the canaliculus). Conjunctivo-dacryocystorhinostomy (conjunctiva connected to the nose by a glass tube).",
          "4. Obstruction of naso-lacrimal duct:",
          "- Congenital obstruction: Hydrostatic massage. Dilation and probing. Dacryocystorhinostomy.",
          "- Acquired obstruction: Dilatation and probing usually fails. Dacryocystorhinostomy. Dacryocystectomy."
        ]
      },
      {
        id: "t2_acute_dacryocystitis",
        title: "Acute Dacryocystitis Treatment",
        content: [
          "1. Acute phase: antibiotics (systemic and local), hot fomentation, analgesics and nasal decongestant drops.",
          "2. Pyocele: Incision and drainage of abscess.",
          "3. Lacrimal fistula: Fistulectomy with dacryocystorhinostomy."
        ]
      },
      {
        id: "t2_chronic_dacryocystitis",
        title: "Chronic Dacryocystitis Treatment",
        content: [
          "Aim to restore communication between lacrimal passages and the nose, to treat any kind of infection.",
          "**In congenital dacryocystitis: (stepwise approach)**",
          "1. In the first 9-12 months of age → Medical treatment (topical antibiotics and digital massage by the mother using her little finger) on the sac then in a downward direction the nose, to push the secretions and open Hasner's valve.",
          "2. If no improvement after the age of 1 year → Probing is indicated. Usually probing once cures most of the cases, yet it could be repeated once more.",
          "3. If the second probing fails too → silastic intubation of the lacrimal passages is performed.",
          "4. If intubation fails → Dacryosystorhinostomy is indicated.",
          "**In adults**:",
          "1. Treatment of the cause of obstruction e.g. relieve of congestion or removal of nasal polyp.",
          "2. Dacryocystorhinostomy is indicated and usually curative. (Principal: the lacrimal sac is connected to the nasal mucosa of the middle meatus after removal of the bone of the lacrimal fossa that lies between each other, creating a fistula to drain tears to the nose).",
          "3. Dacryocystectomy is only indicated if there is: T.B. of the sac, neoplasm of the sac. Atrophy, fibrosis of the sac. or if there is associated hypopyon corneal ulcer."
        ]
      },
      {
        id: "t2_keratoconjunctivitis_sicca",
        title: "Keratoconjunctivitis Sicca Treatment",
        content: [
          "1. Protective glasses.",
          "2. Tear substitutes: artificial tears eye drops and gel.",
          "3. Preservation of any existing tears by occlusion of the puncta to reduce tear drainage.",
          "4. Therapeutic bandage hydrophilic soft contact lens with artificial tears.",
          "5. Mucolytics as acetylcholine 10% to decrease the excess mucous production.",
          "6. Temporary local and systemic steroids."
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Chapter 3: Conjunctiva",
    topics: [
      {
        id: "t3_mpc",
        title: "Mucopurulent Conjunctivitis (MPC) Treatment",
        content: [
          "**Prophylactic**: To patient: patient fomites should not be used and boiled, protect other eye and combat flies. To doctors and nurse: protective goggles, disinfection of fingers, gloves. To others: health education and good sanitation.",
          "**Curative**: Hot fomentation (Produces vasodilatation that brings more antibodies and washes toxins). Antibiotics eye drops and ointment. Dark glasses (to avoid photophobia).",
          "**N.B.**: Bandage does not allow free exit of the discharge, so it is contraindicated because it increases the temperature of the conjunctival sac helping multiplication of the organisms and retention of toxins."
        ]
      },
      {
        id: "t3_purulent",
        title: "Purulent Conjunctivitis (Acute Blenorrhaea) Treatment",
        content: [
          "Prophylaxis: as MPC.",
          "Curative: As MPC but more energetic & more frequent.",
          "Systemic: broad spectrum antibiotics.",
          "Local: Broad spectrum antibiotics eye drops and ointment.",
          "Mydriatic - Cycloplegic drops in corneal involvement."
        ]
      },
      {
        id: "t3_ophthalmia_neonatorum",
        title: "Ophthalmia Neonatorum Treatment",
        content: [
          "**Prophylaxis**: Treatment of mother before labor. Washing babies from above downward. Crede's method: by antibiotics eye drops.",
          "**Curative**: As P.C. but more serious due to thin cornea, no tears and no lysozyme.",
          "**Specific agents**:",
          "- **Gonococcal**: systemic Benzyl penicillin 50.000 u/kg in two divided doses for 7 days or single IM injection of Cefotaxime 100 mg/kg and topical tobramycin-fluquinolone drops.",
          "- **Chlamydia**: local terramycin ointment and systemic erythromycin 50 mg/kg/day for 3 weeks.",
          "- **Viral (herpes)**: anti-herpetic drops or ointments."
        ]
      },
      {
        id: "t3_adenoviral",
        title: "Adenoviral Conjunctivitis Treatment",
        content: [
          "Mainly supportive (cold compresses, dark glasses, lubricants).",
          "Antivirals are not effective.",
          "Topical steroids will not shorten the course of the disease but suppress corneal inflammation in severe cases if visual acuity is diminished."
        ]
      },
      {
        id: "t3_trachoma",
        title: "Trachoma Treatment",
        content: [
          "1. Prophylaxis: strict hygiene, good sanitation, combat of flies and health education.",
          "2. Medical treatment: This is given only if there is active trachoma.",
          "3. Surgical treatment: it is only needed in the following stages:",
          "- **Stage T2a**: Large mature follicles: These need to be expressed.",
          "- **Stage T2b**: Scraping of papillae is done using a sharp spoon.",
          "- **Stage T3 and T4**: With PTDS and PTCs. Both need picking."
        ]
      },
      {
        id: "t3_spring_catarrh",
        title: "Vernal Kerato-Conjunctivitis (Spring Catarrh) Treatment",
        content: [
          "General: Antiallergic drugs and in severe cases corticosteroids (oral or injection).",
          "Local: Washing with cold lotions as cold saline, 3% sodium bicarbonate to remove the discharge. Topical anti-histamine eye drops. Mast cell stabilizer and decongestants. Topical steroid drops or ointment to control acute attacks (in severe cases) but prolonged use must be avoided which may produce glaucoma and complicated cataract. Topical non-steroidal anti-inflammatory drops.",
          "Resistant cases: Topical immuno-suppressant agents e.g. cyclosporine 2%. Intralesional injection of steroids (Triamcinolone acetate)."
        ]
      },
      {
        id: "t3_phlyctenular",
        title: "Phlyctenular Keratoconjunctivitis Treatment",
        content: [
          "1. Topical steroids give dramatic effect (drops and ointment).",
          "2. Antibiotic for secondary infection."
        ]
      },
      {
        id: "t3_pterygium",
        title: "Pterygium Treatment",
        content: [
          "No treatment if the pterygium is small and stationary, because it has a high incidence of recurrence.",
          "**Indications for surgery**: 1) Progressive pterygium. 2) Interfere with vision (encroaches on papillary area). 3) Cosmetic. 4) Recurrent pterygium with diplopia and limitation of ocular movement.",
          "**Surgical techniques**:",
          "1) Simple excision: with the edges of conjunctiva are sutured without any raw area. It has a high degree of recurrence.",
          "2) Excision with bare sclera: The pterygium is excised leaving a raw area of sclera allowing the corneal epithelium to cover the bared cornea before the conjunctival epithelium.",
          "**To prevent recurrence**, the bare sclera should be:",
          "- Covered by a conjunctival, amniotic membrane or corneal graft.",
          "- Exposed to postoperative Beta irradiation (Strontium 90).",
          "- Exposed to Mitomycin C, either: Preoperative intralesional injection, Intraoperative topical application, or postoperative eyedrops."
        ]
      },
      {
        id: "t3_pinguecula",
        title: "Pinguecula Treatment",
        content: [
          "No treatment (if cosmetically bad it can be excised)."
        ]
      },
      {
        id: "t3_symblepharon",
        title: "Symblepharon Treatment",
        content: [
          "**Prophylactic**:",
          "1. A glass rod is coated with an antibiotic ointment in the fornix frequently to prevent or break adhesions.",
          "2. Cortisone eye ointment to check fibrosis in the conjunctival sac.",
          "3. A contact shell is used in the conjunctival sac till its healing.",
          "**Curative**:",
          "1. Excision with or without graft (according to its size) as mucous membrane or amniotic membrane graft.",
          "2. Keratoplasty: If there is corneal opacity."
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Chapter 4: Cornea & Sclera",
    topics: [
      {
        id: "t4_hypopyon",
        title: "Hypopyon Ulcer (Uncomplicated) Treatment",
        content: [
          "1. **Topical Antibiotics**: One of two strategies is applied: a) Dual therapy: Two antibiotics to cover both gram +ve and gram -ve organisms. b) Monotherapy with fluoroquinolones is also effective.",
          "2. **Atropine sulphate 1% eye drops or ointment preparations**: a) Paralysis of the sphincter pupilae muscle and ciliary muscle which relieve the pain resulting from their spasm. b) Dilatation of the pupil which keeps the iris away from the lens to avoid the formation of posterior synechia.",
          "3. **Bilateral bandage**: To stop eyelid movement, so will stop the mechanical irritation of the exposed nerve endings at the ulcer; so, it cuts most of the pain. As well, it will prevent the peeling of the new epithelium at the bed of the ulcer, so it helps the rapid healing of the ulcer.",
          "4. **Hot fomentation**: whether wet or dry compresses, have a good effect through: a) Counter-irritant effect, thus relieving the pain. b) Improve the circulation, so wash the toxins, and brings immunoglobulins, PMNL, and nutrition for the healing process."
        ]
      },
      {
        id: "t4_resistant_ulcers",
        title: "Resistant Corneal Ulcers (Additional Treatment)",
        content: [
          "1. **Subconjunctival injection of antibiotics**: to bypass the epithelial barrier and reach the ulcer in high concentration.",
          "2. **Collagen shields**: Used as effective high dose drug delivery system in the form of contact lens that dissolves spontaneously over 24, 48- or 72hours. It results in 30-40-fold increase in antibiotic penetration into the aqueous.",
          "3. **Paracentesis**: Puncture & evacuation of the AC using a special knife.",
          "4. **Amniotic membrane graft**: it dissolves over a period of time and help healing by providing substrate material to cover the ulcer.",
          "5. **Conjunctival flap**: A bulbar conjunctival flap near the ulcer is used to cover the ulcer. The highly vascular conjunctiva will provide defense, nutrition for the ulcer.",
          "6. **Tarsorrhaphy**: Lateral and even permanent tarsorrhaphy may sometimes be needed in special cases of facial palsy, exophthalmos and neuroparalysis.",
          "7. **Therapeutic keratoplasty**: either lamellar or penetrating."
        ]
      },
      {
        id: "t4_complications",
        title: "Complications of Corneal Ulcer Treatment",
        content: [
          "1. **Secondary glaucoma**: In addition to the treatment of the uncomplicated ulcer: Anti-glaucoma drops ± repeated paracentesis. In PAS, external fistulizing operation is preferred; when the eye becomes quiet.",
          "2. **Descemetocoele**: In addition to the treatment of the uncomplicated ulcer: CL bandage, complete bed rest, avoid straining and Diamox to lower the I.O.P. With impending perforation, we can do paracentesis.",
          "3. **Perforated ulcer**: In addition to the treatment of the uncomplicated ulcer: CL bandage, complete bed rest, avoid straining and Diamox to lower the I.O.P. Never to repost the prolapsed iris as it may carry infection. Large perforations may need cyanoacrylate tissue glue, conjunctival flap or keratoplasty.",
          "4. **Corneal fistula**: a) Chauffage: indirect thermal cautery close to the fistula to destroy the epithelial lining of wall of the ulcer. b) If the chauffage fails, a therapeutic keratoplasty may be indicated.",
          "5. **Corneal opacities**: Depends on the effect on vision. No visual effect: No treatment may be needed. Mild effect (through astigmatism): Ordinary glasses. Irregular astigmatism with no improvement with glasses: Hard contact lenses. Excimer laser phototherapeutic keratectomy for superficial opacity. Keratoplasty for deep or full thickness corneal opacities."
        ]
      },
      {
        id: "t4_dendritic",
        title: "Dendritic Ulcer Treatment",
        content: [
          "1. Atropine, prophylactic use of antibiotics, bandage but never hot fomentation.",
          "2. General supportive treatment with tonics vitamins especially vitamin A and C.",
          "3. Treatment of the predisposing factors: treatment of any fever present and the patient are advised to avoid exposure to cold or to contact patients with common cold, influenza.",
          "4. Specific treatment: use of antiviral drugs: Acyclovir (zovirax): it is the most recent and potent. It is prescribed every 4 hours for up to 4 days after complete epithelization."
        ]
      },
      {
        id: "t4_hzo",
        title: "Herpes Zoster Ophthalmicus (HZO) Treatment",
        content: [
          "1. Rest, sedation and analgesics for the pain.",
          "2. Skin lesions: According to the stage: Pre-eruptive: local steroid skin ointment. Post-eruptive: calamine lotion & antibiotics powder to avoid secondary infection.",
          "3. Anti-viral agents such as acyclovir 'Zovirax' tablets for 10 days.",
          "4. Keratitis and iridocyclitis are treated as usual by local steroids and atropine.",
          "5. Any residual corneal opacity may need keratoplasty."
        ]
      },
      {
        id: "t4_fungal",
        title: "Fungal Ulcer Treatment",
        content: [
          "**Medical**: 1) Epithelial debridement. 2) Antifungal drugs. 3) Cycloplegic eye drops as atropine.",
          "**Surgical (in Resistant Cases)**: 1) Superficial keratectomy. 2) Conjunctival flap. 3) Keratoplasty."
        ]
      },
      {
        id: "t4_neurotrophic",
        title: "Neurotrophic Keratitis Treatment",
        content: [
          "Treatment of the ulcer along the usual lines but mainly bandage to prevent recurrences:",
          "1. Artificial tears eye drops by the day and ointment at bed time.",
          "2. Sealing of the puncta to preserve moisture.",
          "3. Therapeutic soft contact lenses.",
          "4. Median or paramedian tarsorrhaphy."
        ]
      },
      {
        id: "t4_exposure",
        title: "Ulcer with Lagophthalmos (Exposure) Treatment",
        content: [
          "1. Treatment of the ulcer along the usual lines but mainly bandage.",
          "2. Treatment of the cause of lagophthalmos to prevent recurrences.",
          "3. Treatment of dryness due to lagophthalmos: a) Artificial tears. b) Soft contact lens. c) Tarsorrhaphy."
        ]
      },
      {
        id: "t4_keratoconus",
        title: "Keratoconus Treatment",
        content: [
          "**General**: Good diet, vitamins, tonics, Correct any endocrinal disturbances.",
          "**Local**:",
          "1. Spectacle correction: may help in very early cases.",
          "2. Hard and rigid gas permeable contact lenses correct the myopic irregular astigmatism as it cancels the power of the cornea.",
          "3. Corneal Collagen Cross-Linking (CXL) is indicated to stop the progression.",
          "4. Intrastromal Corneal Ring Segments (ICRS) are indicated when the patients are intolerant to spectacles or contact lenses.",
          "5. Penetrating keratoplasty if: Glasses or the contact lens fail to correct the vision. Opacities are at the apex of the cornea."
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Chapter 5: Lens",
    topics: [
      {
        id: "t5_senile_cataract",
        title: "Senile Cataract Treatment",
        content: [
          "1. **Time of the operation**: This depends on several factors: a) V.A of the patient. b) His occupation & visual needs, his activities. c) And finally, the stage of cataract.",
          "2. **Which eye to start with in bilateral cases?** The more mature or the more liable to develop complications (intumescent form or the hypermature). If equally affected, It isn't recommended to operate on the 2 eyes on the same setting. A 1-week interval between the 2 operations is Ok (fear of operative/hospital infection).",
          "**Surgical Techniques**: 1) Phacoemulsification (ultrasonic emulsification + aspiration). 2) Extracapsular cataract extraction (ECCE) - nucleus delivery + I/A leaving posterior capsule. 3) Intracapsular cataract extraction (ICCE) - removal in capsule (limited use).",
          "**Intraocular Lens Implantation**: Primary IOL (same operation). Secondary IOL (second operation if conditions unsuitable)."
        ]
      },
      {
        id: "t5_complicated_cataract",
        title: "Complicated Cataract Treatment",
        content: [
          "1. If possible, we better start by correcting the local eye disorder responsible of the complicated cataract, medically or surgically.",
          "2. Treatment of the cataract is the surgical removal of the lens if indicated."
        ]
      },
      {
        id: "t5_after_cataract",
        title: "After-Cataract Treatment",
        content: [
          "YAG laser or Surgical capsulotomy depending to its density."
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Chapter 6: Orbit & Glaucoma",
    topics: [
      {
        id: "t6_orbital_cellulitis",
        title: "Orbital Cellulitis Treatment",
        content: [
          "Hospitalization is necessary in this situation for close follow-up.",
          "1. Topical and systemic parenteral broad-spectrum antibiotics.",
          "2. Hot foments.",
          "*N.B: If abscess is formed, it should be drained.*"
        ]
      },
      {
        id: "t6_preseptal",
        title: "Preseptal Cellulitis Treatment",
        content: [
          "Same as orbital cellulitis."
        ]
      },
      {
        id: "t6_ted",
        title: "Thyroid Eye Disease (TED) Treatment",
        content: [
          "1. Treatment of thyrotoxicosis.",
          "2. Artificial tear substitutes for corneal protection.",
          "3. Lateral tarsorrhaphy in severe lagophthalmos.",
          "4. Systemic steroids.",
          "5. Orbital decompression in advanced cases 'e.g. Optic neuropathy'."
        ]
      },
      {
        id: "t6_cavernous",
        title: "Cavernous Sinus Thrombosis Treatment",
        content: [
          "1. Hospitalization.",
          "2. IV intensive broad-spectrum antibiotics.",
          "3. IV heparin 5000 i.u. every 6 hours.",
          "4. Treatment of the causative septic focus."
        ]
      },
      {
        id: "t6_proptosis",
        title: "Proptosis Treatment",
        content: [
          "1. Symptomatic treatment, e.g. Lubricants for the dryness.",
          "2. Specific: treatment of the cause.",
          "3. Treatment of complications, e.g. corneal ulcer, secondary glaucoma, etc."
        ]
      },
      {
        id: "t6_atrophia_bulbi",
        title: "Atrophia Bulbi Management",
        content: [
          "Enucleation if blind painful."
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Chapter 7: Errors of Refraction",
    topics: [
      {
        id: "t7_myopia",
        title: "Myopia Treatment",
        content: [
          "1) **Optical**: a) Glasses: (concave or minus lenses). b) Contact lenses.",
          "2) **Refractive surgery**: a) Corneal refractive surgery (LASIK, PRK, Femto-SMILE). b) Lens refractive surgery (Phakic IOL, Refractive lens exchange)."
        ]
      },
      {
        id: "t7_hypermetropia",
        title: "Hypermetropia Treatment",
        content: [
          "1) **Optical**: a) Glasses (Spherical convex or plus lenses). b) Contact lenses.",
          "- **Children** with high errors causing symptoms: Full correction (all manifest or total in accommodative esotropia).",
          "- **Adults**: Highest tolerated plus lens.",
          "- **Old age**: Full correction (accommodation is weak).",
          "2) **Refractive surgery**: a) Corneal refractive surgery (LASIK, PRK). b) Lens refractive surgery (Phakic IOL, RLE)."
        ]
      },
      {
        id: "t7_astigmatism",
        title: "Astigmatism Treatment",
        content: [
          "1) **Optical**: a) Glasses (cylindrical lens with its axis perpendicular to the meridian to be corrected). b) Contact lenses (Soft/Toric for regular; Rigid gas permeable for irregular).",
          "2) **Surgical**:",
          "- **A. Regular astigmatism**: Excimer laser (LASIK - PRK).",
          "- **B. Keratoconus**: Corneal cross-linking - ICR - ICRS - Keratoplasty.",
          "- **C. Corneal opacities**: Phototherapeutic keratectomy (PTK) - Keratoplasty."
        ]
      },
      {
        id: "t7_aphakia",
        title: "Aphakia Treatment",
        content: [
          "1. **Bilateral aphakia**: Two pairs of glasses (one for distance and one for near).",
          "2. **Unilateral aphakia**: IOL or contact lenses (Glasses can't be prescribed due to anisokonia)."
        ]
      },
      {
        id: "t7_anisometropia",
        title: "Anisometropia Treatment",
        content: [
          "1. Contact lenses.",
          "2. Secondary IOL implantation (in unilateral aphakia).",
          "3. Refractive surgery.",
          "4. Aniseikonic lenses: A glass plate which causes magnification without introducing any appreciable refractive power."
        ]
      },
      {
        id: "t7_presbyopia",
        title: "Presbyopia Treatment",
        content: [
          "Addition of a biconvex lens to the distant prescription.",
          "1. Correct errors of refraction for far.",
          "2. Measure the near point (Punctum Proximum).",
          "3. Calculate the amplitude of accommodation.",
          "4. Keep 1/3 of the amplitude of accommodation in reserve to ensure comfort.",
          "5. Allow the patient to use the remaining two thirds of accommodation and add plus lenses to make the sum 3 dioptres; because the standard working distance is 33 cm (100/33 = 3D)."
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Chapter 8: Glaucoma (Detailed Management)",
    topics: [
      {
        id: "t8_infantile",
        title: "Primary Infantile Glaucoma Management",
        content: [
          "**Medical treatment**: Used preoperatively to ↓ IOP and corneal edema.",
          "**Surgical treatment**:",
          "1) **If corneal diameter <13 mm and clear cornea**: a) Goniotomy (standard, incise abnormal mesodermal membrane). b) Trabeculotomy (if failed goniotomy or hazy cornea).",
          "2) **If corneal diameter >13 mm and failure of goniotomy/trabeculotomy**: a) Subscleral trabeculectomy. b) Valve implantation (Ahmed valve). c) Cyclodestructive procedure in advanced cases."
        ]
      },
      {
        id: "t8_poag",
        title: "Primary Open Angle Glaucoma (POAG) Treatment",
        content: [
          "TTT of OAG is mainly medical and for life: To reach the target IOP.",
          "1. **Medical**:",
          "- **Topical**: 1st Line (Beta-blockers - ↓aqueous formation; Prostaglandin analogues - ↑uveoscleral outflow). 2nd Line (CAI - ↓formation; Alpha-2 agonists - ↓formation + ↑outflow).",
          "- **Systemic**: CAI (Acetazolamide) - ↓aqueous production. Side effects: Hypokalemia (most serious), paresthesia, leucopenia, aplastic anemia, anorexia, mental depression. Should be used temporarily in emergency.",
          "2. **Laser Trabeculoplasty**: Indicated in POAG with moderately elevated IOP despite maximally tolerated medical treatment. YAG or Argon to TM for 180°.",
          "3. **Surgical treatment**: Indications: 1) Medical or laser treatment fails to control IOP. 2) Deterioration of V.F. despite controlled IOP. 3) Poor compliance.",
          "- **Types**: 1) Trabeculectomy (new pathway to subconjunctival space). Antimetabolites (5-FU & Mitomycin C) used to increase success. 2) Setons (Valves) - used in refractory glaucoma. 3) Cyclodestructive procedures (Cyclocryotherapy, Laser cyclophotocoagulation)."
        ]
      },
      {
        id: "t8_pacg",
        title: "Primary Angle Closure Glaucoma (PACG) Treatment",
        content: [
          "**Latent Stage**: Laser peripheral iridotomy to decrease risk of ACG.",
          "**Intermittent (Prodromal)**: Laser peripheral iridotomy.",
          "**Acute Congestive Attack (In Hospital)**:",
          "- Sedatives.",
          "- Hyperosmotic agents: I.V. Acetazolamide 500mg or mannitol 20% (1-2 gm/kg) or oral glycerin.",
          "- Carbonic Anhydrase Inhibitor: Oral acetazolamide 250mg / 6 hrs.",
          "- Beta blockers to decrease aqueous formation.",
          "- Miotics: Pilocarpine eye drop, given every 15 minutes after lowering the IOP.",
          "- **After the attack**: Once IOP controlled, gonioscopy is performed. a) Peripheral surgical iridectomy or laser iridotomy if angle mostly open. b) Trabeculectomy if 50% of angle closed or IOP not controlled. c) Prophylactic iridotomy to the other eye.",
          "**Chronic Stage**: Medical treatment and filtering surgery (trabeculectomy) with prophylactic iridotomy to the other eye.",
          "**Absolute Glaucoma**: Treatment indicated if painful. Ranges from medical treatment, trabeculectomy to cyclodestructive procedures. In some cases retrobulbar alcohol to destroy ciliary ganglion or even enucleation."
        ]
      }
    ]
  },
  {
    id: 9,
    title: "Chapter 9: Uveal Tract",
    topics: [
      {
        id: "t9_iridocyclitis",
        title: "Iridocyclitis Treatment",
        content: [
          "**Etiological treatment**: 1) Removal of septic foci. 2) Treatment of T.B. 3) Control of diabetes.",
          "**Control of iridocyclitis**:",
          "- **Local treatment**:",
          "1. Hot applications.",
          "2. Mydriatic-cycloplegic drugs as atropine (Dilatation of the pupil with Relaxation of the sphincter pupillae & Relaxation of the ciliary muscle → Relieves pain, Prevents posterior synechiae, Breaks newly formed posterior synechiae, Rests the anterior uvea).",
          "3. Corticosteroid drugs: Anti-inflammatory, Anti-allergic, Fibrinolytic, Decreased vascularity.",
          "4. Dark glasses: For photophobia and protection.",
          "- **Systemic treatment**:",
          "1. Anti-infective therapy for suppurative iridocyclitis and septic foci.",
          "2. Systemic corticosteroid drugs for severe and resistant cases.",
          "3. Analgesics and non-steroidal anti-inflammatory drugs.",
          "**Treatment of the complications**:",
          "1. Secondary glaucoma (Early): Medical treatment (Diamox, atropine cannot be stopped), Paracentesis only for severe increasing IOP. (Late): Filtering operation when eye becomes quiet.",
          "2. Seclusio-Pupillae with iris bombe: Without PAS → Laser iridotomy or peripheral iridectomy. With PAS → Filtering operation.",
          "3. Total posterior synechiae: Iridectomy and lens extraction when eye becomes quiet and with good projection.",
          "4. Complicated cataract: Cataract extraction when eye becomes quiet and with good projection.",
          "5. Endophthalmitis: Medical (subconjunctival and systemic antibiotics). Evisceration if medical treatment fails.",
          "6. Painful atrophic globe: Enucleation or retrobulbar injection of alcohol."
        ]
      },
      {
        id: "t9_choroiditis",
        title: "Choroiditis Treatment",
        content: [
          "Corticosteroids are important (periocular and systemic route).",
          "Cytotoxic drugs and other immunosuppressants may be used in severe sight-threatening cases."
        ]
      },
      {
        id: "t9_endophthalmitis",
        title: "Endophthalmitis Treatment",
        content: [
          "**Early cases**:",
          "1. Medical treatment: a) Antibiotics: intravitreal, topical and systemic. b) Atropine: Drops and ointment. c) Corticosteroids.",
          "2. Vitrectomy in controlled cases.",
          "**Late cases**: Evisceration."
        ]
      },
      {
        id: "t9_panophthalmitis",
        title: "Panophthalmitis Treatment",
        content: [
          "Evisceration."
        ]
      }
    ]
  },
  {
    id: 10,
    title: "Chapter 10: Strabismus",
    topics: [
      {
        id: "t10_heterophoria",
        title: "Heterophoria (Decompensated) Treatment",
        content: [
          "1. Correction of the refractive error if present.",
          "2. **Orthoptic exercises**: To strengthen the weak muscles: a) Pencil-nose exercise esp in convergence insufficiency. b) Exercising prisms: base of the prism is in the direction of the latent deviation (e.g. a base in prism for esophoria). c) Synoptophore.",
          "3. **Relieving prism in spectacles**: To neutralize the deviation if the orthoptic exercises fail (base of the prism is against the direction of the latent deviation). Disadvantage: latent become manifest. It is only used in hyperphoria.",
          "4. **Surgical treatment**: If the above measures fail (strengthening the weak muscles or weakening the overacting muscles as in concomitant squint)."
        ]
      },
      {
        id: "t10_paralytic",
        title: "Paralytic Squint Treatment",
        content: [
          "1. **Treat the cause**: either by internist or neurologist, diabetes, hypertension, etc.",
          "2. **Occlusion of one eye**: To avoid diplopia until the muscle regains its function with recovery within 6 months: a) Occlusion of the paralyzed eye. b) Alternate occlusion with orthoptic exercises is better.",
          "3. **Surgical treatment**: If no recovery occurs after 6 months.",
          "4. **Relieving prisms**: Transmits the image to the fovea with keeping the deviation. The base of the prism is against the direction of strabismus. The prismatic power is divided equally between both eyes. (Indication: During the period of observation. If the patient refused or was unfit for surgery)."
        ]
      },
      {
        id: "t10_concomitant",
        title: "Concomitant Squint Treatment (Aim)",
        content: [
          "**Aims**: a) To build and restore binocular vision. b) To improve and preserve visual acuity in squinting eye. c) To restore normal appearance (cosmetic).",
          "**Time**: as early as possible (To avoid amblyopia. To allow binocular vision to develop).",
          "**Lines**:",
          "1) Correction of refractive error if present.",
          "2) Occlusion: The child should wear his spectacles during occlusion.",
          "3) **Pleoptics Treatment**: (means full sight) - designed to encourage foveal stimulation and to develop full vision in an amblyopic eye with eccentric fixation after occlusion of the squinting eye.",
          "4) **Orthoptics Treatment**: (means straight sight) - designed to encourage the development of binocular vision by training exercises on the synoptophore (not to increase the power of the muscles).",
          "**Surgical treatment**: Indications: 1) Residual angle >10° after correction. 2) Squint with no error of refraction, non-accommodative esotropia. 3) Neglected squint >10 years for cosmetic. 4) Most exotropia.",
          "**Actions**: 1) Strengthening a muscle: a) Resection (shortens the muscle). b) Advancement (carrying the insertion anterior). c) Plication. 2) Weakening a muscle: Recession (carrying the insertion backward)."
        ]
      }
    ]
  },
  {
    id: 11,
    title: "Chapter 11: Retina",
    topics: [
      {
        id: "t11_diabetic",
        title: "Diabetic Retinopathy Treatment",
        content: [
          "1. Medical treatment to control of diabetes.",
          "2. **Follow up**: Yearly screening for all. NPDR → every 9 months. Pre-proliferative DR → every 4 months. PDR → every 3 months. CSME → every 2 months.",
          "3. **Laser photocoagulation**: The mainstay of treatment. Aim: to eliminate ischemic areas to decrease vasoformative substances.",
          "- **Panretinal photocoagulation (PRP)**: for PDR, Neovascular glaucoma, Rubecosis with clear media.",
          "- **Focal laser** for focal macular edema. **Grid laser** for diffuse macular edema.",
          "4. **Intravitreal injection of Anti-vascular Endothelial Growth Factor (Anti-VEGF)**: Now, it is the mainstay in treatment of diabetic macular edema.",
          "5. **Intravitreal injection of Triamcinolone acetonide (4 mg) injection**: For persistent macular edema.",
          "6. **Surgical treatment (vitrectomy & endolaser)**: For Persistent vitreous hemorrhage. For Tractional retinal detachment."
        ]
      },
      {
        id: "t11_hypertensive",
        title: "Hypertensive Retinopathy Treatment",
        content: [
          "Control of systemic hypertension."
        ]
      },
      {
        id: "t11_rop",
        title: "Retinopathy of Prematurity (ROP) Management",
        content: [
          "Screen of those infants between 6th and 7th weeks postnatally. Followed by 2 weeks interval examination until retinal vascularization reaches temporal retina.",
          "- **Stages 1 and 2**: No treatment.",
          "- **Stage 3**: Cryotherapy or laser photocoagulation for avascular immature retina within 72 hrs if threshold disease present.",
          "- **Stages 4 and 5**: Surgical treatment for retinal detachment by scleral buckling, vitrectomy or both."
        ]
      },
      {
        id: "t11_crvo",
        title: "Central Retinal Vein Occlusion (CRVO) Treatment",
        content: [
          "**Laser treatment**: after resolution of hemorrhage, fluorescein angiography is done to detect ischemia and panretinal photocoagulation is done for ischemic cases.",
          "Treatment of secondary neovascular glaucoma.",
          "Aspirin 75 mg/day to reduce platelet aggregation.",
          "Treatment of predisposing factors such as systemic hypertension and diabetes."
        ]
      },
      {
        id: "t11_brvo",
        title: "Branch Retinal Vein Occlusion (BRVO) Treatment",
        content: [
          "Laser treatment for macular edema after resolution of hemorrhage.",
          "Aspirin 75 mg/day to reduce platelet aggregation.",
          "Treatment of predisposing factors."
        ]
      },
      {
        id: "t11_crao",
        title: "Central Retinal Artery Occlusion (CRAO) Treatment",
        content: [
          "**N.B.** Retinal artery occlusion is an emergency, prompt interference within 90 minutes before irreversible damage to the retina occurs.",
          "1. Lowering IOP by 500mg IV acetazolamide followed by IV mannitol 20% (1g/kg) or oral glycerol 50% (1g/kg).",
          "2. Ocular massage for 10 seconds and release 5 seconds.",
          "3. Sublingual nitroglycerin.",
          "4. Carbogen (95% oxygen and 5% carbon dioxide) 10 minutes/2hours/48 hours.",
          "5. If the initial treatments are unsuccessful after 20 minutes subsequent treatment is followed: Anterior chamber paracentesis. Intravenous streptokinase 750,000 units. Laser photocoagulation if there is evidence of iris and angle or retinal neovascularization."
        ]
      },
      {
        id: "t11_rrd",
        title: "Rhegmatogenous Retinal Detachment Treatment",
        content: [
          "**Prophylactic laser or cryotherapy**: To symptomatic tear. To asymptomatic tears in high risk patients (high myopia, RD in the other eye, etc.).",
          "**Surgical Treatment**: a) Scleral buckling and cryotherapy. b) Vitrectomy & Endo-laser (pars plana approach to remove the vitreous + endolaser around the tear)."
        ]
      },
      {
        id: "t11_trd",
        title: "Tractional Retinal Detachment Treatment",
        content: [
          "Pars plana vitrectomy with membrane removal."
        ]
      },
      {
        id: "t11_exudative",
        title: "Exudative RD Treatment",
        content: [
          "Treatment of the cause."
        ]
      },
      {
        id: "t11_rp",
        title: "Retinitis Pigmentosa Management",
        content: [
          "No definite treatment for RP is currently known.",
          "Treatment of associated ocular problems as cataract.",
          "Low vision aids.",
          "Genetic counseling."
        ]
      }
    ]
  },
  {
    id: 12,
    title: "Chapter 12: Neuro-ophthalmology",
    topics: [
      {
        id: "t12_neuritis",
        title: "Papillitis / Retrobulbar Neuritis Treatment",
        content: [
          "1. Treatment of the cause.",
          "2. Steroid therapy.",
          "3. Neurological consultation (e.g. Search for Multiple Sclerosis)."
        ]
      },
      {
        id: "t12_papilledema",
        title: "Papilledema Treatment",
        content: [
          "1. Treatment of the primary cause e.g. tumor, abscess, hemorrhage. etc.",
          "2. **Optic nerve decompression (fenestration)**: In severely affected visual functions."
        ]
      }
    ]
  },
  {
    id: 13,
    title: "Chapter 13: Ocular Trauma",
    topics: [
      {
        id: "t13_chemical",
        title: "Chemical Injuries Treatment",
        content: [
          "1. **First aid treatment**: Immediate treatment, as time is a vital factor:",
          "1) Copious irrigation of the eyes using running water saline or ringer's lactate solution for 20 minutes or by 2.00 liters.",
          "2) Any particulate F.B of the chemical matter on the corneal surface, lids & fornices should be removed with cotton or forceps followed by reirrigation.",
          "3) Debridement of necrotic areas of corneal epithelium should be performed at the slit lamp to promote re-epithelialization and remove associated chemical residue.",
          "4) If the nature of the chemical irritant is unknown, pH paper (litmus paper) is applied to the involved tissue to determine the chemical nature. It is also used to check the pH after irrigation (normal pH is 7.3 – 7.7).",
          "2. **Medical treatment**:",
          "1) Topical steroid, antibiotic and cycloplegic eye drops.",
          "2) Tetracyclines are effective collagenase inhibitors that reduce ulceration either topically (tetracycline ointment) or systemically (doxycycline 100 mg twice daily).",
          "3) IOP should be monitored, with treatment if necessary. Oral acetazolamide is recommended to avoid adding further drop.",
          "3. Treatment of the complications."
        ]
      },
      {
        id: "t13_fb",
        title: "Extra-ocular foreign body",
        content: [
          "It should be removed."
        ]
      },
      {
        id: "t13_laceration",
        title: "Conjunctival Laceration Treatment",
        content: [
          "a) Small: Conservative; antibiotic drops/ointment.",
          "b) Large (more than 6 mm): Suturing."
        ]
      },
      {
        id: "t13_abrasion",
        title: "Corneal Abrasion Treatment",
        content: [
          "Bandage or soft, therapeutic contact lenses. Antibiotic to prevent infection."
        ]
      },
      {
        id: "t13_rupture",
        title: "Corneal Rupture / Scleral Rupture",
        content: [
          "Urgent surgical repair should be performed. The globe integrity should be restored adequately."
        ]
      },
      {
        id: "t13_hyphema",
        title: "Traumatic Hyphema Treatment",
        content: [
          "1. **General measures**: Bed rest (semi-setting position) at home or at hospital according to severity. If not contraindicated stop anti-coagulants (e.g. aspirin products).",
          "2. Cycloplegics.",
          "3. Topical steroids if a fibrinous anterior reaction develops (to control any associated uveitis).",
          "4. Antiglaucoma medications: if IOP > 40 mmHg at presentation or > 30 mmHg for 2 weeks or more.",
          "5. Vitamin K to prevent rebleeding.",
          "6. Surgical evacuation may be indicated in some cases."
        ]
      }
    ]
  }
];
