export interface MentionedTerm {
  term: string;
  definition: string;
  primaryRelation: string;
  otherLocations: string;
}

export const MENTIONED_TERMS: MentionedTerm[] = [
  {
    term: "Pannus",
    definition: "Cellular infiltration together with superficial vascularization of the upper part of the cornea.",
    primaryRelation: "Hallmark of Trachoma (Chlamydia trachomatis). Appears in T1 (onset).",
    otherLocations: "Also occurs in Phlyctenular keratoconjunctivitis (allergic, very vascular), Leprotic keratitis, and Degenerative conditions. In trachoma, it is classified as thin (tenius), vascular (vasculosus), fleshy (carnosus), annular, or cicatrized (with Herbert's pits). Associated with corneal ulcers and cicatrization."
  },
  {
    term: "Hypopyon",
    definition: "Sterile pus in the anterior chamber (PMNL, fibrin, iris pigment) with a flat upper level.",
    primaryRelation: "Classic feature of Hypopyon Ulcer (Acute Serpiginous Ulcer) – typically Pneumococcal (80%).",
    otherLocations: "Occurs in severe Iridocyclitis, Fungal ulcers (Candida/Fusarium), Endophthalmitis, and Purulent conjunctivitis complications. Indicates toxic iridocyclitis. Also seen in secondary bacterial infection of Dendritic ulcer."
  },
  {
    term: "Iris Bombe",
    definition: "Peripheral iris bulging forward due to pupillary block (aqueous trapped in posterior chamber).",
    primaryRelation: "Complication of Iridocyclitis due to total posterior synechiae (Seclusio-pupillae).",
    otherLocations: "Pathogenic mechanism in Primary Angle Closure Glaucoma (PACG) – pupillary block type. May lead to secondary glaucoma. Treated with laser iridotomy or filtering surgery."
  },
  {
    term: "Keratic Precipitates (KPs)",
    definition: "Inflammatory cell deposits on the back of the cornea, typically forming a triangle with the base down due to gravity.",
    primaryRelation: "A classic sign of Iridocyclitis (Anterior Uveitis).",
    otherLocations: "Seen with corneal haziness and aqueous flare. Also present in corneal ulcers and Endophthalmitis."
  },
  {
    term: "Leukocoria (White Pupil)",
    definition: "White color of the pupil.",
    primaryRelation: "Seen in Congenital Cataract (Zonular/Lamellar, Rubella total).",
    otherLocations: "Also occurs in Retinoblastoma, Retinopathy of Prematurity (ROP) – Stage 5, Persistent Hyperplastic Primary Vitreous (PHPV), Coats' disease, and Cyclitic membrane (organized exudates behind the lens in severe uveitis). Indicates poor fixation in children."
  },
  {
    term: "Cherry Red Spot",
    definition: "Red fovea contrasting with white ischemic retina.",
    primaryRelation: "Pathognomonic for Central Retinal Artery Occlusion (CRAO) – early stage.",
    otherLocations: "Also seen in Commotio retinae (Berlin's edema), Amaurotic family idiocy, Macular hole with retinal detachment, and Quinine poisoning. In CRAO, accompanied by afferent pupillary defect, attenuated arteries, and cattle-trucking."
  },
  {
    term: "Cotton Wool Spots (Soft Exudates)",
    definition: "Microinfarctions of the nerve fiber layer (ischemic infarction of retinal arterioles).",
    primaryRelation: "Hallmark of Pre-proliferative Diabetic Retinopathy and Proliferative Diabetic Retinopathy (PDR).",
    otherLocations: "Seen in Malignant Hypertensive Retinopathy, Ischemic Central Retinal Vein Occlusion (CRVO), and Retinopathy of Prematurity. Represents retinal capillary closure."
  },
  {
    term: "Optic Disc Cupping",
    definition: "Enlargement of the physiological cup with vertical elongation, overhanging (undermined) edges, and nasal shift of retinal vessels.",
    primaryRelation: "Cardinal sign of Primary Open Angle Glaucoma (POAG).",
    otherLocations: "Also seen in Secondary glaucomas (phacolytic, uveitic, steroid-induced). Progressive with visual field defects (arcuate scotoma, nasal step). C/D ratio >0.4 (early) to >0.7 (late). Associated with splinter hemorrhages and increased visibility of lamina cribrosa pores."
  },
  {
    term: "Arlt's Line",
    definition: "A white line of scar tissue involving the sulcus subtarsalis.",
    primaryRelation: "A sign of stage T3 (Starting cicatrization) in Trachoma.",
    otherLocations: "Associated with PTDs (Post-Trachomatous Degenerations) and PTCs (Post-Trachomatous Concretions) on the upper tarsal conjunctiva."
  },
  {
    term: "Herbert's Pits (and Rosettes)",
    definition: "Herbert's rosettes are corneal follicles (cellular aggregations) at the edge of active pannus. Herbert's pits are depressed pits left after healing at the lower edge of pannus.",
    primaryRelation: "A corneal manifestation of Trachoma pannus.",
    otherLocations: "Seen at the edge of cicatrized pannus (pannus cicus). Gives a serrated border to the corneal scar (nebula ex-pannus)."
  },
  {
    term: "Iridodonesis",
    definition: "Tremulous iris due to lack of support.",
    primaryRelation: "Occurs in Hypermature Senile Cortical Cataract (lens shrinkage, reappearance of iris shadow, deep AC).",
    otherLocations: "Also present in Aphakia (absence of lens) and Lens subluxation/dislocation. Associated with partial or complete rupture of zonules."
  },
  {
    term: "Rubeosis Iridis",
    definition: "Neovascularization of the iris.",
    primaryRelation: "A complication of Ischemic Central Retinal Vein Occlusion (CRVO) and Proliferative Diabetic Retinopathy (PDR).",
    otherLocations: "Leads to Neovascular glaucoma (secondary glaucoma). Also seen in hemorrhagic iritis (diabetes, gout, herpes, tuberculosis). May cause hyphema."
  },
  {
    term: "Iridodialysis",
    definition: "Disinsertion of the iris at its root producing a D-shaped pupillary aperture.",
    primaryRelation: "A result of Blunt (Non-penetrating) trauma to the iris.",
    otherLocations: "Causes polycoria (multiple pupils) and uniocular diplopia if within the palpebral fissure. Differential diagnosis includes malignant melanoma of iris and peripheral iridectomy."
  },
  {
    term: "Angle Recession",
    definition: "A tear within the ciliary body itself.",
    primaryRelation: "A consequence of Blunt trauma to the ciliary body.",
    otherLocations: "Results in hyphema (acute) and Angle Recession Glaucoma (secondary open-angle glaucoma, late). Detected on gonioscopy."
  },
  {
    term: "Cyclodialysis",
    definition: "Tear of the ciliary body from its attachment at the scleral spur.",
    primaryRelation: "A result of Blunt trauma causing sustained hypotony (low IOP).",
    otherLocations: "Should be suspected when IOP remains low after ocular trauma. Different from cyclodestructive procedures used in glaucoma treatment."
  },
  {
    term: "Marcus Gunn Pupil (Relative Afferent Pupillary Defect - RAPD)",
    definition: "Paradoxical pupillary dilatation on the swinging flashlight test (appears dilating instead of constricting).",
    primaryRelation: "Indicates an incomplete optic nerve lesion or severe retinal disease.",
    otherLocations: "Seen in Papillitis, Retrobulbar neuritis, CRAO, and severe retinal disease. Both pupils equal in size (no anisocoria). Variable decrease in VA of the affected eye."
  },
  {
    term: "Argyll Robertson Pupil",
    definition: "Bilateral asymmetrical small and irregular pupils with light-near dissociation (light reflex absent/sluggish, near response normal).",
    primaryRelation: "Pathognomonic for Neurosyphilis.",
    otherLocations: "Pupils are difficult to dilate. Differentiates from Adie's tonic pupil (large, slow near response, slow redilatation)."
  },
  {
    term: "Fleischer's Ring",
    definition: "A brown ring of hemosiderin deposition in the epithelial cells at the base of the cone.",
    primaryRelation: "A classic sign of advanced Keratoconus.",
    otherLocations: "Associated with Munson's sign, corneal thinning, and apical opacities."
  },
  {
    term: "Munson's Sign",
    definition: "Angulation of the lower lid on looking down.",
    primaryRelation: "A clinical sign of advanced Keratoconus.",
    otherLocations: "Associated with Fleischer's ring, Vogt's striae, and acute hydrops. Indicates conical corneal bulging."
  },
  {
    term: "Tranta Spots",
    definition: "White spots (calcified deposits of eosinophils and necrotic epithelium) within limbal gelatinous masses.",
    primaryRelation: "A sign of the Bulbar (Limbal) type of Vernal Keratoconjunctivitis (Spring Catarrh).",
    otherLocations: "Seen in the mixed type (20%). Associated with itching, ropy discharge rich in eosinophils, and cobblestone papillae (palpebral type)."
  },
  {
    term: "Elschnig's Pearls",
    definition: "Transparent soap-bubble lens cells (opaque lens fibers).",
    primaryRelation: "A type of After-Cataract (posterior capsular opacity) following cataract surgery or partially absorbed traumatic cataract.",
    otherLocations: "Associated with capsular fibrosis (2-6 months post-surgery). Treated by YAG laser or surgical capsulotomy."
  },
  {
    term: "Haab's Striae",
    definition: "Corneal opacity due to tears in Descemet's membrane.",
    primaryRelation: "A sign of Primary Infantile Glaucoma (Buphthalmos) due to corneal stretching from elevated IOP.",
    otherLocations: "Associated with corneal edema, corneal enlargement (>12mm), lacrimation, photophobia, and blepharospasm. Deep AC, enlarged globe, and bluish sclera."
  },
  {
    term: "Vossius Ring",
    definition: "Pigmentation of the anterior lens capsule due to impact of the pupillary border of the iris.",
    primaryRelation: "A sign of Concussion (Contusion) Cataract from blunt trauma.",
    otherLocations: "Associated with rosette-shaped posterior cortical cataract. Trauma by fist, stick, or ball."
  },
  {
    term: "Phacolytic Glaucoma",
    definition: "Glaucoma caused by lens protein (from microscopic capsule openings in hypermature cataract) escaping and blocking the trabecular meshwork, or engulfed by macrophages that swell and obstruct the angle.",
    primaryRelation: "Occurs in Hypermature Senile Cortical Cataract.",
    otherLocations: "Clinical picture like acute congestive glaucoma but with normal AC depth and open angle with AC reaction. Treated by lens extraction, beta-blockers, and steroids."
  },
  {
    term: "Phacomorphic Glaucoma",
    definition: "Glaucoma caused by pupillary block due to an intumescent (swollen) lens increasing in size, leading to shallow AC and raised IOP.",
    primaryRelation: "Occurs in the Intumescent stage of Immature Senile Cortical Cataract.",
    otherLocations: "Simulates acute angle closure glaucoma. Treatment is just lens extraction. Differentiates from phacolytic (open angle) and phacoanaphylactic (post-trauma)."
  },
  {
    term: "Phacoanaphylactic Glaucoma (Phacoantigenic)",
    definition: "Glaucoma caused by lens protein reaction (iritis) following lens trauma or after ECCE with capsule rupture, leading to TM edema and protein deposition.",
    primaryRelation: "Occurs after lens trauma or ECCE.",
    otherLocations: "Treated by steroids and anti-glaucoma medications. Associated with lens particle glaucoma."
  },
  {
    term: "Commotio Retinae (Berlin's Edema)",
    definition: "Transient white edema of the deep sensory retina following blunt ocular trauma; typically involves the retina opposite the side of anterior segment impact.",
    primaryRelation: "A Blunt (Non-penetrating) ocular injury.",
    otherLocations: "Usually asymptomatic unless involving the macula. Resolves spontaneously. Associated with retinal breaks, traumatic macular hole, and retinal dialysis."
  },
  {
    term: "Retinal Dialysis",
    definition: "Disinsertion of the peripheral retina from its attachment at the ora serrata.",
    primaryRelation: "A Blunt trauma injury to the retina.",
    otherLocations: "Occurs particularly at retinal periphery, more commonly in high myopic eyes. Usually followed by retinal detachment. Associated with retinal breaks and traumatic macular hole."
  },
  {
    term: "Descemetocoele",
    definition: "Bulging of Descemet's membrane (translucent bleb) surrounded by a grayish ulcer under the effect of normal IOP.",
    primaryRelation: "A complication of a deeply progressive Corneal Ulcer (e.g., Hypopyon ulcer).",
    otherLocations: "Indicates impending perforation. Treated with CL bandage, complete bed rest, avoid straining, and Diamox to lower IOP. May need paracentesis."
  },
  {
    term: "Shield Ulcer",
    definition: "Epithelial macro-erosions of the cornea.",
    primaryRelation: "A corneal complication of Vernal Keratoconjunctivitis (Spring Catarrh).",
    otherLocations: "Associated with punctate epithelial keratitis (Tobgy), Cupid's bow, and pseudo-gerontoxon. Seen in severe palpebral/bulbar type."
  },
  {
    term: "Cupid's Bow",
    definition: "Corneal opacity resembling arcus senilis.",
    primaryRelation: "A corneal sign in Vernal Keratoconjunctivitis (Spring Catarrh).",
    otherLocations: "Associated with pseudo-gerontoxon and Shield ulcer. Represents stromal involvement in spring catarrh."
  },
  {
    term: "Seclusio-Pupillae (Ring Synechia)",
    definition: "Adhesions between the pupillary border and the lens (360 degrees).",
    primaryRelation: "A complication of Iridocyclitis (posterior synechiae).",
    otherLocations: "Leads to Iris bombe (pupillary block) and secondary glaucoma. On dilatation, gives a festooned pupil. Treated by laser iridotomy or peripheral iridectomy if no PAS; filtering operation if PAS present."
  },
  {
    term: "Occlusio-Pupillae",
    definition: "Occlusion of the pupil by organized exudates (membrane).",
    primaryRelation: "A complication of Iridocyclitis.",
    otherLocations: "Leads to secondary glaucoma. Associated with cyclitic membrane (organized exudates behind the lens causing pseudo-glioma). Contracture of cyclitic membrane leads to retinal detachment."
  },
  {
    term: "Ptylosis",
    definition: "Destruction of the sharp posterior border of the lid margin.",
    primaryRelation: "A complication of Blepharitis (ulcerative type).",
    otherLocations: "Leads to epiphora and initiates the vicious circle of epiphora → eczema → ectropion. Associated with trichiasis and madarosis."
  },
  {
    term: "Madarosis",
    definition: "Loss of eyelashes due to destruction of hair follicles.",
    primaryRelation: "A complication of Blepharitis (ulcerative type).",
    otherLocations: "Associated with trichiasis, ptylosis, and multiple styes. Also seen in leprosy and Vogt-Koyanagi-Harada syndrome (poliosis is greying, not loss)."
  },
  {
    term: "Trichiasis",
    definition: "Acquired condition in which more than 4 lashes are directed posteriorly and rub against the cornea or bulbar conjunctiva.",
    primaryRelation: "A complication of Trachoma (commonest cause in Egypt), ulcerative blepharitis, trauma, chemical burns, cicatrizing diseases.",
    otherLocations: "Differentiates from rubbing lashes (≤4 lashes). Treated by electrolysis, argon laser, or surgery if with entropion."
  },
  {
    term: "Distichiasis",
    definition: "Congenital abnormality in which extra row of lashes arise from the lid margin behind the grey line (in place of Meibomian gland orifices).",
    primaryRelation: "Congenital lid anomaly.",
    otherLocations: "Differentiates from trichiasis (acquired, >4 lashes). Treated by direct removal or cryotherapy after splitting the lamellae."
  },
  {
    term: "Evisceration",
    definition: "Removal of intraocular contents leaving the sclera, conjunctiva, and optic nerve free.",
    primaryRelation: "Indicated for Endophthalmitis, Panophthalmitis, and Expulsive hemorrhage.",
    otherLocations: "Differentiates from Enucleation (removal of eyeball leaving muscles/conjunctiva/optic nerve – for blind painful eye, retinoblastoma, sympathetic ophthalmia). Differentiates from Exenteration (removal of all orbital contents within periosteum with eyelids – for malignant orbital tumors)."
  },
  {
    term: "Pre-auricular Lymphadenopathy",
    definition: "Enlarged tender preauricular lymph nodes.",
    primaryRelation: "Occurs in Acute Inclusion Conjunctivitis (Chlamydia), Adenoviral infection (EKC/PCF), Acute Trachoma, and Parinaud Syndrome.",
    otherLocations: "Also seen in Purulent Conjunctivitis (gonococcal). Absent in bacterial MPC or simple viral conjunctivitis. Indicates chlamydial or severe viral etiology."
  },
  {
    term: "Phlycten",
    definition: "Round nodule (1-3 mm), greyish, elevated, surrounded by small area of conjunctival injection.",
    primaryRelation: "The characteristic lesion of Phlyctenular Keratoconjunctivitis (endogenous allergy to tuberculo-protein, streptococcal toxin, intestinal parasites).",
    otherLocations: "Differentiates from Pinguecula (yellow, triangular, nasal, old age). Differentiates from Limbal Spring Catarrh (gelatinous masses, no ulceration, eosinophils). Occurs at limbus and bulbar conjunctiva. May ulcerate (phlyctenular ulcer). Responds dramatically to topical steroids."
  },
  {
    term: "Symblepharon",
    definition: "Adhesion of the palpebral conjunctiva to the ocular surface (bulbar conjunctiva or cornea).",
    primaryRelation: "Complication of Trachoma (conjunctival scarring), Chemical injuries, Trauma, and Autoimmune diseases (Stevens-Johnson, Ocular pemphigoid).",
    otherLocations: "Usually posterior symblepharon leading to shallow fornix. Complications include diplopia, visual affection, disfigurement, lid malposition, and exposure keratopathy. Treated by excision with mucous membrane or amniotic membrane graft."
  },
  {
    term: "Corneal Fistula",
    definition: "Small central perforated corneal ulcer with delayed healing, river green sign, soft ocular tension, and lost anterior chamber.",
    primaryRelation: "A complication of Perforated Corneal Ulcer (e.g., Hypopyon ulcer).",
    otherLocations: "Results from repeated dislodgement of clot closing the perforation. May lead to endophthalmitis, muscular edema, papilledema (hypotony), anterior polar cataract, and PAS. Treated by chauffage (thermal cautery) or therapeutic keratoplasty."
  },
  {
    term: "Atrophia Bulbi (Phthisis Bulbi)",
    definition: "Shrunken globe with loss of vision.",
    primaryRelation: "Complication of Severe ocular trauma, Long-standing retinal detachment, and Severe ocular inflammation (Endophthalmitis, Panophthalmitis).",
    otherLocations: "Also complication of absolute glaucoma (ciliary shutdown) and chronic iridocyclitis. Management: Enucleation if blind painful. Associated with hypotony and disorganization of ocular structures."
  },
  {
    term: "Amaurotic Pupil (Absolute Afferent Pupillary Defect)",
    definition: "No pupillary constriction when the affected eye is stimulated (blind eye). Both pupils constrict only when the normal eye is stimulated.",
    primaryRelation: "Indicates complete optic nerve lesion (total destruction of the optic nerve).",
    otherLocations: "Differentiates from Marcus Gunn pupil (incomplete lesion – paradoxical dilatation). Both pupils equal in size (no anisocoria). Accommodation is normal."
  }
];
