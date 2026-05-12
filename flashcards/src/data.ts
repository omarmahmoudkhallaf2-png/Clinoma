export interface FlashcardData {
  id: string;
  question: string;
  answer: string; // HTML string for rich formatting
}

export const FLASHCARDS: FlashcardData[] = [
  {
    id: "ilo-1",
    question: "What are the Intended Learning Outcomes (ILOs) for the Cardiovascular Diseases chapter?",
    answer: `
      <u>Intended learning outcomes:</u><br/>
      <span class="text-blue-600 text-sm">By the end of this chapter, the student should be able to:</span><br/>
      <ul class="list-disc ml-5">
        <li>Identify the three commonest types of congenital heart diseases: <span class="text-red-600">Ventricular Septal Defect (VSD), Patent Ductus Arteriosus (PDA), and Atrial Septal Defect (ASD).</span></li>
        <li>State the genetic and environmental factors that contribute to the etiology of congenital heart defects.</li>
        <li>Analyze various cardiovascular disease conditions by examining the underlying structural and functional abnormalities of the heart and vascular system.</li>
        <li>Explain the hemodynamics of left-to-right shunt lesions and how it leads to pulmonary plethora and hypertension.</li>
        <li>Explain the hemodynamics of obstructive lesions & cyanotic congenital heart diseases.</li>
        <li>Formulate appropriate management strategies for cardiac abnormalities that negatively impact a child's growth and development.</li>
        <li>Appraise the multifaceted impact that congenital and inherited heart diseases have on pediatric patients and their family units.</li>
        <li>Distinguish between the clinical presentations and management protocols of cyanotic and acyanotic heart disorders.</li>
        <li>Evaluate the physiological state of heart failure in children to determine the necessary clinical interventions.</li>
        <li>Apply medical management protocols, such as the use of diuretics and ACE inhibitors, for infants developing heart failure due to large ventricular defects.</li>
        <li>Diagnose acute rheumatic fever by applying established clinical criteria and managing the condition with sufficient medical knowledge.</li>
      </ul>
    `
  },
  {
    id: "chd-magnitude",
    question: "What is the magnitude of the problem of Congenital Heart Disease (CHD)?",
    answer: `
      <u>Magnitude of the problem:</u><br/>
      <ul class="list-disc ml-5">
        <li>Congenital heart disease is the most common birth defect (affects <span class="text-red-600">8-10/ 1000 live births</span>).</li>
        <li>It accounts for significant global morbidity and mortality. <span class="text-red-600">4.2% of all neonatal deaths</span> are due to a heart defect.</li>
        <li>The commonest are <span class="text-red-600">VSD, PDA & ASD.</span></li>
      </ul>
    `
  },
  {
    id: "chd-etiology-genetic",
    question: "What are the Genetic Factors involved in the etiology of Congenital Heart Diseases?",
    answer: `
      <u>Genetic factors:</u><br/>
      <span class="text-blue-600 text-sm">1. Specific chromosomal abnormalities:</span><br/>
      <ul class="list-disc ml-8">
        <li><span class="text-red-600">Trisomy 21:</span> A-V canal defects, PDA, VSD.</li>
        <li><span class="text-red-600">Trisomy 18:</span> VSD, PDA, PS.</li>
        <li><span class="text-red-600">Trisomy 13:</span> VSD, PDA, ASD.</li>
      </ul>
      <span class="text-blue-600 text-sm">2. Identical malformation occurs in some monozygotic and dizygotic twins.</span><br/>
      <span class="text-blue-600 text-sm">3. Some cardiac diseases have autosomal inheritance:</span><br/>
      <ul class="list-disc ml-8">
        <li><span class="text-red-600">Example:</span> Cardiomyopathy.</li>
      </ul>
    `
  },
  {
    id: "chd-etiology-environmental",
    question: "What are the Environmental Factors (Teratogens) involved in the etiology of Congenital Heart Diseases?",
    answer: `
      <u>Environmental factors (teratogens):</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">I. Maternal rubella</span> → PDA</li>
        <li><span class="text-red-600">II. Other viral infection:</span> TORCH infection, coxachie</li>
        <li><span class="text-red-600">III. Drugs:</span> Warfarin, anticonvulsants, alcohol, cytotoxic drugs.</li>
        <li><span class="text-red-600">IV. Irradiation.</span></li>
        <li><span class="text-red-600">V. Maternal diabetes.</span></li>
        <li><span class="text-red-600">VI. Maternal collagen diseases:</span> SLE, rheumatoid arthritis.</li>
      </ul>
      <u>Genetic environmental interaction:</u><br/>
      <span class="text-blue-600 text-sm">VII. Genetically determined and exposed to environmental factor.</span>
    `
  },
  {
    id: "chd-classification",
    question: "How are Congenital Heart Diseases classified?",
    answer: `
      <u>Classification:</u><br/>
      <span class="text-blue-600 text-sm">I. Acyanotic congenital heart diseases:</span><br/>
      <ul class="list-disc ml-8">
        <li><span class="text-red-600">With left to right shunt:</span> VSD, PDA, ASD, Endocardial cushion defect (ECD).</li>
        <li><span class="text-red-600">Without shunt:</span>
          <ul class="list-circle ml-5">
            <li>Obstructive lesions: Aortic coarctation, Aortic stenosis, Pulmonary stenosis.</li>
            <li>Non-obstructive lesions: Dextrocardia.</li>
          </ul>
        </li>
      </ul>
      <span class="text-blue-600 text-sm">II. Cyanotic congenital heart diseases.</span>
    `
  },
  {
    id: "vsd-def-prev",
    question: "Define Ventricular Septal Defect (VSD) and state its prevalence.",
    answer: `
      <u>Ventricular Septal Defect (VSD):</u><br/>
      <span class="text-blue-600 text-sm">Definition:</span> A defect in the interventricular septum.<br/>
      <span class="text-blue-600 text-sm">Prevalence:</span> Ventricular septal defect is the most common form of CHD and accounts for about <span class="text-red-600">30% of all such defects.</span>
    `
  },
  {
    id: "vsd-types-site",
    question: "What are the types of VSD according to the site of the defect?",
    answer: `
      <u>Types According to the site of defect:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">1. Common:</span> Single defect in membranous part. Usually involves part of the muscular tissue adjacent to the membranous septum (perimembranous defect).</li>
        <li><span class="text-red-600">2. Less common:</span> Single or multiple defects in muscular part of the septum (inlet, trabecular, outlet “infundibular” component).</li>
      </ul>
      <span class="text-blue-600 text-sm">N.B.: The ventricular septum is divided into small membranous part & large muscular part. The muscular part has 3 components: inlet, trabecular & outlet (infundibular).</span>
    `
  },
  {
    id: "vsd-types-size",
    question: "What are the types of VSD according to the size of the defect?",
    answer: `
      <u>Types According to the size of the defect:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">1. Small defect (Roger’s disease):</span> Usually asymptomatic, discovered accidentally. Small defects have a better chance to close spontaneously than large defects.</li>
        <li><span class="text-red-600">2. Moderate defect.</span></li>
        <li><span class="text-red-600">3. Large defects:</span> Causes hemodynamic changes & patient is symptomatic.</li>
      </ul>
    `
  },
  {
    id: "vsd-hemodynamics",
    question: "Explain the Hemodynamics of VSD.",
    answer: `
      <u>Hemodynamics of VSD:</u><br/>
      <ul class="list-disc ml-5">
        <li>The blood from the Lt. ventricle is divided into 2 portions: one passes to the aorta and the other passes through the defect to the Rt ventricle.</li>
        <li>The amount of shunted blood depends on the size of the VSD and the level of pulmonary vascular resistance.</li>
        <li>All this blood (RV output & part from LV output that came through VSD) will pass through the pulmonary artery → <span class="text-red-600">pulmonary plethora.</span></li>
        <li>Then, pass to the Lt Atrium → <span class="text-red-600">Lt Atrium dilatation (LVH or LV dilatation).</span></li>
        <li>Persistence of pulmonary plethora → <span class="text-red-600">pulmonary hypertension</span> → Low COP symptoms.</li>
        <li>Pulmonary hypertension → ↑↑Rt ventricular pressure → <span class="text-red-600">Eisenmenger Syndrome</span> → "Persistent cyanosis".</li>
      </ul>
    `
  },
  {
    id: "vsd-symptoms",
    question: "What are the Clinical Manifestations (Symptoms) of VSD?",
    answer: `
      <u>Symptoms of VSD:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">1. Small VSD:</span> Patient is asymptomatic with normal growth and development.</li>
        <li><span class="text-red-600">2. Moderate to large VSD:</span> Delayed growth and development, decreased exercise tolerance (tachypnea & excessive sweating with feeding), repeated pulmonary infections, and symptoms of CHF are relatively common during infancy. Exertional dyspnea may be present in older children.</li>
        <li><span class="text-red-600">3. Long-standing pulmonary hypertension:</span> Cyanosis, clubbing and a decreased level of activity may be present in patients with pulmonary vascular obstructive disease (Eisenmenger’s syndrome).</li>
      </ul>
    `
  },
  {
    id: "vsd-signs",
    question: "What are the Clinical Signs of VSD on inspection, palpation, and auscultation?",
    answer: `
      <u>Signs of VSD:</u><br/>
      <span class="text-blue-600 text-sm">Combined inspection & palpation:</span><br/>
      <ul class="list-disc ml-8">
        <li>Precordial bulge and hyperkinetic apex are present with a large VSD.</li>
        <li>A systolic thrill may be present at the lower left sternal border.</li>
      </ul>
      <span class="text-blue-600 text-sm">Auscultation (Heart sounds):</span><br/>
      <ul class="list-disc ml-8">
        <li>The intensity of the P2 is normal with a small shunt and increased with a large shunt.</li>
        <li>The S2 is loud and single in patients with pulmonary hypertension or pulmonary vascular obstructive disease.</li>
      </ul>
    `
  },
  {
    id: "vsd-murmurs",
    question: "Describe the Murmurs associated with VSD.",
    answer: `
      <u>Murmurs of VSD:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Harsh (grade 3 to 5 of 6) pansystolic murmur</span> on lower Lt sternal border (3rd and 4th intercostals spaces) propagated all over the precordium. Sometimes the murmur is early systolic.</li>
        <li>With <span class="text-red-600">infundibular VSD</span>, a grade soft early diastolic decrescendo murmur of AR may be audible, possibly caused by herniation of an aortic cusp.</li>
      </ul>
    `
  },
  {
    id: "vsd-investigations",
    question: "What investigations are used for VSD and what are their findings?",
    answer: `
      <u>Investigations for VSD:</u><br/>
      <span class="text-blue-600 text-sm">[1] Electrocardiography (ECG):</span><br/>
      <ul class="list-disc ml-8">
        <li>Small VSD: Normal findings.</li>
        <li>Moderate VSD: LVH and occasional LAH.</li>
        <li>Large defect: Biventricular hypertrophy (BVH) with or without LAH.</li>
        <li>Pulmonary vascular obstructive disease: RVH only.</li>
      </ul>
      <span class="text-blue-600 text-sm">Radiography:</span><br/>
      <ul class="list-disc ml-8">
        <li>Cardiomegaly (LA, LV, sometimes RV).</li>
        <li>Increased pulmonary vascular markings.</li>
      </ul>
      <span class="text-blue-600 text-sm">[2] Echocardiography:</span><br/>
      <span class="text-blue-600 text-sm">Can identify the number, size, and exact location of the defect; estimate PA pressure; detect chambers enlargement; identify other associated defects; and estimate the magnitude of the shunt.</span>
    `
  },
  {
    id: "vsd-natural-history",
    question: "Describe the Natural History of VSD.",
    answer: `
      <u>Natural History of VSD:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Spontaneous closure:</span> Occurs more frequently with small defects and during the first 6 months of life.</li>
        <li>About <span class="text-red-600">60% of small to moderate muscular VSDs</span> close spontaneously but not after 8 years of age.</li>
        <li>About <span class="text-red-600">35% of small perimembranous VSDs</span> close spontaneously but not after 5 years of age.</li>
        <li><span class="text-red-600">Inlet and outlet (infundibular) defects</span> do not become smaller or close spontaneously.</li>
        <li><span class="text-red-600">CHF</span> develops in infants with large VSDs usually at 6 to 8 weeks of age.</li>
        <li><span class="text-red-600">Pulmonary vascular obstructive disease</span> may begin at 6 to 12 months with large VSDs, but right-to-left shunt usually develops in teenage years.</li>
      </ul>
    `
  },
  {
    id: "vsd-management-medical",
    question: "What is the Medical Management for VSD?",
    answer: `
      <u>Medical Management of VSD:</u><br/>
      <ul class="list-disc ml-5">
        <li>1. Treatment of CHF with <span class="text-red-600">diuretics & ACE inhibitors</span> for 2 to 4 months.</li>
        <li>2. Frequent feedings of <span class="text-red-600">high-calorie formulas</span> (nasogastric or oral).</li>
        <li>3. These measures may allow delay of surgery and promote spontaneous reduction or closure.</li>
        <li>4. No exercise restriction in the absence of pulmonary hypertension.</li>
      </ul>
    `
  },
  {
    id: "vsd-management-closure",
    question: "What are the indications, timing, and procedures for VSD closure?",
    answer: `
      <u>Closure of the defect:</u><br/>
      <span class="text-blue-600 text-sm">Indications and Timing:</span><br/>
      <ul class="list-disc ml-8">
        <li>Failure to thrive (if medical therapy fails).</li>
        <li>PA pressure > 50% of systemic pressure (surgical closure by end of 1st year).</li>
        <li>Dilated left sided chambers.</li>
        <li>Intractable congestive heart failure.</li>
        <li>Subaortic VSD causing AR.</li>
      </ul>
      <span class="text-blue-600 text-sm">Procedure:</span><br/>
      <ul class="list-disc ml-8">
        <li><span class="text-red-600">1. Nonsurgical device closure:</span> For selected muscular VSDs away from valves and difficult to access surgically.</li>
        <li><span class="text-red-600">2. PA banding:</span> Palliative, no longer performed unless additional lesions make repair difficult.</li>
        <li><span class="text-red-600">3. Surgical closure (patch closure):</span> Carried out under cardiopulmonary bypass.</li>
      </ul>
    `
  },
  {
    id: "asd-def-prev",
    question: "Define Atrial Septal Defect (ASD) and state its prevalence and types.",
    answer: `
      <u>Atrial Septal Defect (ASD):</u><br/>
      <span class="text-blue-600 text-sm">Definition:</span> A defect in the inter-atrial septum.<br/>
      <span class="text-blue-600 text-sm">Prevalence:</span> Isolated anomaly in <span class="text-red-600">5% to 10% of all CHDs.</span> More common in females (male-to-female ratio of 1:2).<br/>
      <u>Types of ASD:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Ostium secundum defect</span> (most common).</li>
        <li><span class="text-red-600">Ostium primum defect.</span></li>
        <li><span class="text-red-600">Sinus venosus defect.</span></li>
        <li><span class="text-red-600">Coronary sinus ASD.</span></li>
      </ul>
    `
  },
  {
    id: "asd-hemodynamics",
    question: "Explain the Hemodynamics of ASD.",
    answer: `
      <u>Hemodynamics of ASD:</u><br/>
      <ul class="list-disc ml-5">
        <li>Left atrial pressure > right atrial pressure. Blood shunted from LA to RA.</li>
        <li>RA receives blood from superior & inferior vena-cava + shunt → <span class="text-red-600">right atrial dilatation and enlargement.</span></li>
        <li>Blood goes to RV → RV ++ → pulmonary artery → enlargement of pulmonary artery → <span class="text-red-600">Lung plethora</span> → repeated chest infections.</li>
      </ul>
    `
  },
  {
    id: "asd-manifestations",
    question: "What are the Clinical Manifestations (Symptoms and Signs) of ASD?",
    answer: `
      <u>Clinical Manifestations of ASD:</u><br/>
      <span class="text-blue-600 text-sm">Symptoms:</span><br/>
      <ul class="list-disc ml-8">
        <li>Small ASDs: Well developed and asymptomatic.</li>
        <li>Large ASDs: Poor weight gain or symptoms/signs of CHF.</li>
      </ul>
      <span class="text-blue-600 text-sm">Signs:</span><br/>
      <ul class="list-disc ml-8">
        <li>Large ASD: Precordial bulge, prominent RV cardiac impulse, palpable PA pulsations.</li>
        <li><span class="text-red-600">Heart sounds:</span> Second heart sound is <span class="text-red-600">widely split and fixed</span> (characteristic finding).</li>
        <li><span class="text-red-600">Murmurs:</span> Soft (grade 2-3/6) systolic ejection murmur over pulmonary area. Large shunt may cause mid-diastolic rumble (relative tricuspid stenosis).</li>
        <li><span class="text-blue-600 text-sm">N.B.: There is NO MURMUR due to passage of blood through ASD.</span></li>
      </ul>
    `
  },
  {
    id: "asd-investigations",
    question: "What investigations are used for ASD and what are their findings?",
    answer: `
      <u>Investigations for ASD:</u><br/>
      <span class="text-blue-600 text-sm">I. Electrocardiography (ECG):</span><br/>
      <ul class="list-disc ml-8">
        <li>Right axis deviation, mild RVH, or <span class="text-red-600">RBBB pattern in V1</span> (due to dilated RV cavity, not actual block).</li>
      </ul>
      <span class="text-blue-600 text-sm">II. Radiography:</span><br/>
      <ul class="list-disc ml-8">
        <li>Cardiomegaly (RA and RV enlargement).</li>
        <li>Prominent PA segment and increased pulmonary vascular markings.</li>
      </ul>
      <span class="text-blue-600 text-sm">III. Echocardiography:</span><br/>
      <span class="text-blue-600 text-sm">Can identify type & size; estimate PA pressure; detect chambers enlargement; and estimate shunt magnitude.</span>
    `
  },
  {
    id: "asd-management",
    question: "What is the Management for ASD?",
    answer: `
      <u>Management of ASD:</u><br/>
      <span class="text-blue-600 text-sm">Medical:</span><br/>
      <ul class="list-disc ml-8">
        <li>Exercise restriction is unnecessary.</li>
        <li>In infants with CHF, medical management is recommended (high success rate, possibility of spontaneous closure).</li>
      </ul>
      <span class="text-blue-600 text-sm">Closure (Indications and Timing):</span><br/>
      <ul class="list-disc ml-8">
        <li>Preferably closed at <span class="text-red-600">2–4 years of age.</span></li>
        <li>Earlier if: Significant shunt with RV volume overload (Qp/Qs ≥ 1.5:1), failure to thrive, or CHF not responding to medical management.</li>
      </ul>
      <span class="text-blue-600 text-sm">Procedure:</span><br/>
      <ul class="list-disc ml-8">
        <li><span class="text-red-600">Nonsurgical:</span> Catheter-delivered device (preferred for secundum ASD).</li>
        <li><span class="text-red-600">Surgical:</span> Simple suture or patch under cardiopulmonary bypass.</li>
      </ul>
    `
  },
  {
    id: "pda-def-prev",
    question: "Define Patent Ductus Arteriosus (PDA) and state its prevalence.",
    answer: `
      <u>Patent Ductus Arteriosus (PDA):</u><br/>
      <span class="text-blue-600 text-sm">Definition:</span> Persistence of the fetal communication between the main pulmonary artery & the aortic arch after the origin of the Lt subclavian artery.<br/>
      <span class="text-blue-600 text-sm">Prevalence:</span> Occurs in <span class="text-red-600">5% to 10% of all CHDs</span> (excluding premature infants). More common in females (ratio 1:3). Common problem in premature infants.
    `
  },
  {
    id: "pda-hemodynamics",
    question: "Explain the Hemodynamics of PDA.",
    answer: `
      <u>Hemodynamics of PDA:</u><br/>
      <ul class="list-disc ml-5">
        <li>Aorta pressure > pulmonary artery pressure during systole & diastole.</li>
        <li>Blood shunted from aorta to pulmonary artery.</li>
        <li>Increased pulmonary blood flow → <span class="text-red-600">Lung plethora</span> → LA++ and LV++ (similar to VSD).</li>
      </ul>
    `
  },
  {
    id: "pda-manifestations",
    question: "What are the Clinical Manifestations (Symptoms and Signs) of PDA?",
    answer: `
      <u>Clinical Manifestations of PDA:</u><br/>
      <span class="text-blue-600 text-sm">Symptoms:</span><br/>
      <ul class="list-disc ml-8">
        <li>Small PDA: Asymptomatic.</li>
        <li>Large PDA: Poor weight gain, decreased exercise tolerance, repeated lower respiratory infections, and CHF common in infancy. Exertional dyspnea in older children.</li>
      </ul>
      <span class="text-blue-600 text-sm">Signs:</span><br/>
      <ul class="list-disc ml-8">
        <li>General: Tachycardia, tachypnea (in CHF).</li>
        <li><span class="text-red-600">Bounding peripheral pulses with water hammer pulse</span> (due to wide pulse pressure).</li>
        <li><span class="text-red-600">Differential cyanosis:</span> Cyanosis only in lower half of body if pulmonary vascular obstructive disease develops.</li>
        <li>Local: Hyperactive precordium, systolic thrill at upper left sternal border.</li>
        <li><span class="text-red-600">Murmur:</span> Grade 1-4/6 <span class="text-red-600">continuous “machinery” murmur</span> at left infraclavicular area.</li>
      </ul>
    `
  },
  {
    id: "pda-investigations",
    question: "What investigations are used for PDA and what are their findings?",
    answer: `
      <u>Investigations for PDA:</u><br/>
      <span class="text-blue-600 text-sm">I. Electrocardiography (ECG):</span><br/>
      <ul class="list-disc ml-8">
        <li>Similar to VSD. Normal or LVH in small/moderate PDA. BVH in large PDA.</li>
      </ul>
      <span class="text-blue-600 text-sm">II. Radiography:</span><br/>
      <ul class="list-disc ml-8">
        <li>Similar to VSD. Cardiomegaly (LA, LV, ascending aorta). Increased pulmonary markings.</li>
      </ul>
      <span class="text-blue-600 text-sm">III. Echocardiography:</span><br/>
      <span class="text-blue-600 text-sm">Can assess size, site, shape, and flow direction. LA and LV dimensions provide indirect assessment of shunt magnitude.</span>
    `
  },
  {
    id: "pda-natural-history",
    question: "Describe the Natural History of PDA.",
    answer: `
      <u>Natural History of PDA:</u><br/>
      <ul class="list-disc ml-5">
        <li>Spontaneous closure is <span class="text-red-600">rare in full-term infants</span> (due to structural abnormality of ductal smooth muscle).</li>
        <li>CHF or recurrent pneumonia develops if shunt is large.</li>
        <li>Pulmonary vascular obstructive disease may develop if untreated.</li>
        <li>Rarely, an aneurysm of PDA may develop and possibly rupture in adult life.</li>
      </ul>
    `
  },
  {
    id: "pda-management",
    question: "What is the Management for PDA?",
    answer: `
      <u>Management of PDA:</u><br/>
      <span class="text-blue-600 text-sm">Medical (only in premature infants):</span><br/>
      <ul class="list-disc ml-8">
        <li><span class="text-red-600">Indomethacin, ibuprofen, and paracetamol</span> are effective to close the PDA.</li>
        <li>No exercise restriction in absence of pulmonary hypertension.</li>
      </ul>
      <span class="text-blue-600 text-sm">Closure:</span><br/>
      <ul class="list-disc ml-8">
        <li>Diagnosis is indication for closure (except silent PDA).</li>
        <li><span class="text-red-600">Nonsurgical:</span> Device occlusion (standard of care).</li>
        <li><span class="text-red-600">Surgical:</span> Reserved for when device closure is not applicable.</li>
      </ul>
    `
  },
  {
    id: "ps-def-prev",
    question: "Define Pulmonary Stenosis (PS) and state its prevalence and pathology.",
    answer: `
      <u>Pulmonary Stenosis (PS):</u><br/>
      <span class="text-blue-600 text-sm">Definition:</span> Obstruction to right ventricular outflow.<br/>
      <span class="text-blue-600 text-sm">Prevalence:</span> Isolated PS occurs in <span class="text-red-600">4% to 8% of children with CHDs.</span> Often associated with Tetralogy of Fallot.<br/>
      <u>Pathology:</u><br/>
      <ul class="list-disc ml-5">
        <li>May be <span class="text-red-600">valvular (90%)</span>, subvalvular (infundibular), or supravalvular.</li>
        <li>Leads to RVH.</li>
        <li>Pathophysiologic changes: Systolic ejection murmur, hypertrophy of related ventricle, post stenotic dilatation.</li>
      </ul>
    `
  },
  {
    id: "ps-manifestations",
    question: "What are the Clinical Manifestations (Symptoms and Signs) of PS?",
    answer: `
      <u>Clinical Manifestations of PS:</u><br/>
      <span class="text-blue-600 text-sm">Symptoms:</span><br/>
      <ul class="list-disc ml-8">
        <li>Mild PS: Asymptomatic.</li>
        <li>Moderate PS: Exertional dyspnea and easy fatigability.</li>
        <li>Severe PS: CHF.</li>
        <li>Critical PS (neonates): Cyanotic and tachypneic.</li>
      </ul>
      <span class="text-blue-600 text-sm">Signs:</span><br/>
      <ul class="list-disc ml-8">
        <li>RV tap and systolic thrill at upper left sternal border (ULSB).</li>
        <li><span class="text-red-600">Heart sounds:</span> S2 may split widely, P2 diminished. <span class="text-red-600">Systolic ejection click</span> present in valvular PS.</li>
        <li><span class="text-red-600">Murmur:</span> Systolic ejection murmur (grade 2-5/6) at ULSB, transmits to back and axillae.</li>
      </ul>
    `
  },
  {
    id: "ps-investigations",
    question: "What investigations are used for PS and what are their findings?",
    answer: `
      <u>Investigations for PS:</u><br/>
      <span class="text-blue-600 text-sm">1. Chest x-ray:</span><br/>
      <ul class="list-disc ml-8">
        <li>Heart size usually normal (cardiomegaly in CHF).</li>
        <li>Prominent main PA segment (post stenotic dilatation).</li>
        <li>Pulmonary vascularity normal (decreased in severe PS).</li>
      </ul>
      <span class="text-blue-600 text-sm">2. ECG:</span><br/>
      <ul class="list-disc ml-8">
        <li>Normal in mild PS. RAD and RVH in moderate/severe PS.</li>
      </ul>
      <span class="text-blue-600 text-sm">3. Echocardiography:</span><br/>
      <span class="text-blue-600 text-sm">Assesses shape of valve and degree of stenosis; reveals associated lesions.</span>
    `
  },
  {
    id: "ps-management",
    question: "What is the Management for PS?",
    answer: `
      <u>Management of PS:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Prostaglandin (PGE1):</span> For neonates with critical PS and cyanosis to reopen the ductus.</li>
        <li><span class="text-red-600">Balloon valvuloplasty:</span> Procedure of choice for significant valvular PS.</li>
        <li><span class="text-red-600">Surgery:</span> If balloon fails or for non-valvular/complex stenosis.</li>
        <li><span class="text-red-600">Follow-up:</span> Periodic echo to detect recurrence.</li>
        <li><span class="text-red-600">Prophylaxis:</span> Against infective endocarditis.</li>
      </ul>
    `
  },
  {
    id: "as-def-prev",
    question: "Define Aortic Stenosis (AS) and state its prevalence and pathology.",
    answer: `
      <u>Aortic Stenosis (AS):</u><br/>
      <span class="text-blue-600 text-sm">Definition:</span> Left ventricular outflow tract (LVOT) obstruction.<br/>
      <span class="text-blue-600 text-sm">Prevalence:</span> Accounts for <span class="text-red-600">10% of all CHD.</span> More common in males (ratio 4:1).<br/>
      <u>Pathology:</u><br/>
      <ul class="list-disc ml-5">
        <li>Obstruction at valvular, subvalvular, or supravalvular levels.</li>
        <li>Leads to LVH.</li>
        <li>Post-stenotic dilatation of ascending aorta in valvular AS.</li>
        <li>AR usually develops with subaortic AS.</li>
      </ul>
    `
  },
  {
    id: "as-manifestations",
    question: "What are the Clinical Manifestations (Symptoms and Signs) of AS?",
    answer: `
      <u>Clinical Manifestations of AS:</u><br/>
      <span class="text-blue-600 text-sm">Symptoms:</span><br/>
      <ul class="list-disc ml-8">
        <li>Mild AS: Asymptomatic.</li>
        <li>Moderate AS: Exercise intolerance.</li>
        <li>Severe AS: Exertional chest pain, easy fatigability, or syncope.</li>
      </ul>
      <span class="text-blue-600 text-sm">Signs:</span><br/>
      <ul class="list-disc ml-8">
        <li>Blood pressure: Normal (narrow pulse pressure in severe AS).</li>
        <li>Systolic thrill at URSB, suprasternal notch, or carotid arteries.</li>
        <li><span class="text-red-600">Ejection systolic click</span> with valvular AS.</li>
        <li><span class="text-red-600">Murmur:</span> Harsh systolic ejection murmur (grade 2-4/6) at 2nd right or 3rd left intercostal space, transmits to neck and apex.</li>
        <li>High-pitched early diastolic decrescendo murmur of AR in bicuspid aortic valve.</li>
      </ul>
    `
  },
  {
    id: "as-investigations",
    question: "What investigations are used for AS and what are their findings?",
    answer: `
      <u>Investigations for AS:</u><br/>
      <span class="text-blue-600 text-sm">1. Chest x-ray:</span><br/>
      <ul class="list-disc ml-8">
        <li>Usually normal in children. Dilated ascending aorta in valvular AS. Cardiomegaly in CHF or substantial AR.</li>
      </ul>
      <span class="text-blue-600 text-sm">2. ECG:</span><br/>
      <ul class="list-disc ml-8">
        <li>Normal in mild cases. LVH in severe cases.</li>
      </ul>
      <span class="text-blue-600 text-sm">3. Echocardiography:</span><br/>
      <span class="text-blue-600 text-sm">Shows anatomy (bicuspid, tricuspid, unicuspid), site, and degree of stenosis; reveals AR and associated lesions.</span>
    `
  },
  {
    id: "as-management",
    question: "What is the Management for AS?",
    answer: `
      <u>Management of AS:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Anticongestive measures:</span> For critically ill with CHF (inotropic agents, diuretics).</li>
        <li><span class="text-red-600">PGE1 infusion</span> may be indicated.</li>
        <li><span class="text-red-600">Percutaneous balloon valvuloplasty:</span> First step for symptomatic neonates.</li>
        <li><span class="text-red-600">Activity restrictions:</span> For moderate & severe AS.</li>
        <li><span class="text-red-600">Surgical:</span> Aortic valve commissurotomy, replacement, or Ross procedure.</li>
      </ul>
    `
  },
  {
    id: "coa-def-prev",
    question: "Define Coarctation of the Aorta (COA) and state its prevalence and types.",
    answer: `
      <u>Coarctation of the Aorta (COA):</u><br/>
      <span class="text-blue-600 text-sm">Prevalence:</span> <span class="text-red-600">4% to 8% of all CHD</span>, male preponderance (2:1). 30% of Turner syndrome patients have COA.<br/>
      <u>Types:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">A. Preductal:</span> CoA above the entrance of ductus arteriosus.</li>
        <li><span class="text-red-600">B. Postductal:</span> CoA below the entrance of ductus arteriosus.</li>
      </ul>
      <u>Pathology Groups:</u><br/>
      <span class="text-blue-600 text-sm">1. Symptomatic newborns.</span><br/>
      <span class="text-blue-600 text-sm">2. Asymptomatic infants & children.</span>
    `
  },
  {
    id: "coa-pathophysiology",
    question: "Explain the Pathophysiology of COA in newborns and children.",
    answer: `
      <u>Pathophysiology of COA:</u><br/>
      <span class="text-blue-600 text-sm">Symptomatic newborns:</span><br/>
      <ul class="list-disc ml-8">
        <li>Associated with VSD or left-sided obstructive lesions.</li>
        <li>Structures become hypoplastic. After birth, deoxygenated blood passes from RV to descending aorta through PDA → <span class="text-red-600">Differential cyanosis.</span></li>
        <li>Ductus closure leads to sudden increase in LV pressure work → circulatory shock, renal failure, left sided heart failure.</li>
      </ul>
      <span class="text-blue-600 text-sm">Asymptomatic infants & children:</span><br/>
      <ul class="list-disc ml-8">
        <li>No associated anomalies. Normal blood reaches proximal aorta.</li>
        <li>Pressure gradient stimulates collateral circulation. Most tolerate postnatal ductus closure well.</li>
      </ul>
    `
  },
  {
    id: "coa-manifestations-newborns",
    question: "What are the Clinical Manifestations and investigations of COA in Symptomatic Newborns?",
    answer: `
      <u>Symptomatic Newborns (COA):</u><br/>
      <span class="text-blue-600 text-sm">Manifestations:</span><br/>
      <ul class="list-disc ml-8">
        <li>Signs of CHF (poor feeding, dyspnea) and renal failure (oliguria, anuria) at 2-6 weeks.</li>
        <li>Loud gallop, weak and thready pulses.</li>
      </ul>
      <span class="text-blue-600 text-sm">Investigations:</span><br/>
      <ul class="list-disc ml-8">
        <li>ECG: RVH, RAD.</li>
        <li>Chest X-ray: Marked cardiomegaly, signs of pulmonary edema.</li>
        <li>Echocardiography: Shows site and extent of COA.</li>
      </ul>
    `
  },
  {
    id: "coa-manifestations-children",
    question: "What are the Clinical Manifestations and investigations of COA in Asymptomatic Children?",
    answer: `
      <u>Asymptomatic Children (COA):</u><br/>
      <span class="text-blue-600 text-sm">Manifestations:</span><br/>
      <ul class="list-disc ml-8">
        <li>Usually asymptomatic except rare leg pain.</li>
        <li>Classic sign: <span class="text-red-600">Disparity in pulsations and blood pressures</span> between upper and lower limbs (weak femoral/popliteal pulses vs bounding arm pulses).</li>
        <li>Local: LV ++ & Heaving apex.</li>
        <li>Murmurs: Ejection systolic (grade 2-3/6) at upper left sternal border; murmurs due to collateral flow.</li>
      </ul>
      <span class="text-blue-600 text-sm">Investigations:</span><br/>
      <ul class="list-disc ml-8">
        <li>ECG: LVH or normal.</li>
        <li>Chest X-ray: Normal/enlarged heart. After 1st decade: <span class="text-red-600">3 sign</span> (indentation of AO), <span class="text-red-600">notching of inferior border of ribs.</span></li>
        <li>Echocardiography: Shows site, flow velocities, and collaterals.</li>
      </ul>
    `
  },
  {
    id: "coa-management",
    question: "What is the Management for COA?",
    answer: `
      <u>Management of COA:</u><br/>
      <span class="text-blue-600 text-sm">Medical:</span><br/>
      <ul class="list-disc ml-8">
        <li>Neonates: <span class="text-red-600">PGE1 infusion</span> to open the ductus.</li>
        <li>Anticongestive measures for HF.</li>
      </ul>
      <span class="text-blue-600 text-sm">Surgical:</span><br/>
      <ul class="list-disc ml-8">
        <li>Extended resection with end-to-end anastomosis (preferred).</li>
        <li>Subclavian flap aortoplasty.</li>
        <li>Patch angioplasty.</li>
        <li>Conduit insertion.</li>
      </ul>
    `
  },
  {
    id: "tga-def-prev",
    question: "Define Complete Transposition of the Great Arteries (TGA) and state its prevalence.",
    answer: `
      <u>Complete Transposition of the Great Arteries (TGA):</u><br/>
      <span class="text-blue-600 text-sm">Prevalence:</span> Most common cyanotic disorder in neonates. More frequent in males (ratio 3:1).<br/>
      <u>Pathophysiology:</u><br/>
      <ul class="list-disc ml-5">
        <li>Aorta is anterior and rightward (from RV); pulmonary artery is posterior and leftward (from LV).</li>
        <li>Two independent circulations exist. Not compatible with life unless communication exists (PFO, ASD, VSD, or PDA).</li>
        <li>60% have intact ventricular septum (atrial shunt); 40% have VSD.</li>
      </ul>
    `
  },
  {
    id: "tga-manifestations",
    question: "What are the Clinical Manifestations and investigations of TGA?",
    answer: `
      <u>Clinical Manifestations of TGA:</u><br/>
      <span class="text-blue-600 text-sm">History:</span><br/>
      <ul class="list-disc ml-8">
        <li>Cyanosis since birth. Symptoms of CHF (dyspnea, feeding difficulties).</li>
      </ul>
      <span class="text-blue-600 text-sm">Physical Examination:</span><br/>
      <ul class="list-disc ml-8">
        <li>Cyanosis within hours/days, not relieved by 100% O2.</li>
        <li>Murmur depends on associated defects (VSD, PS).</li>
        <li>Hepatomegaly and dyspnea if CHF present.</li>
      </ul>
      <span class="text-blue-600 text-sm">Investigations:</span><br/>
      <ul class="list-disc ml-8">
        <li>ECG: RAD and RVH.</li>
        <li>Chest X-ray: Cardiomegaly, increased pulmonary markings. Characteristic <span class="text-red-600">egg-shaped (egg on a string)</span> appearance.</li>
        <li>Echocardiogram: Diagnostic.</li>
      </ul>
    `
  },
  {
    id: "tga-management",
    question: "What is the Management for TGA?",
    answer: `
      <u>Management of TGA:</u><br/>
      <span class="text-blue-600 text-sm">Palliative procedures:</span><br/>
      <ul class="list-disc ml-8">
        <li><span class="text-red-600">Intravenous prostaglandin:</span> Maintains PDA.</li>
        <li><span class="text-red-600">Rashkind balloon atrial septostomy:</span> Creation of an ASD to improve mixing.</li>
      </ul>
      <span class="text-blue-600 text-sm">Corrective operation:</span><br/>
      <ul class="list-disc ml-8">
        <li><span class="text-red-600">Arterial switch operation:</span> Procedure of choice (within first 3 to 8 weeks).</li>
        <li>Atrial (venous) switch (Mustard/Senning).</li>
        <li>Ventricular switch (Rastelli) for VSD and severe PS.</li>
      </ul>
    `
  },
  {
    id: "tof-def-prev",
    question: "Define Tetralogy of Fallot (TOF) and state its prevalence and components.",
    answer: `
      <u>Tetralogy of Fallot (TOF):</u><br/>
      <span class="text-blue-600 text-sm">Prevalence:</span> Most common cyanotic disorder in children.<br/>
      <u>Four Components:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">1. Ventricular septal defect.</span></li>
        <li><span class="text-red-600">2. Aorta overriding the VSD.</span></li>
        <li><span class="text-red-600">3. Pulmonary stenosis (generally infundibular).</span></li>
        <li><span class="text-red-600">4. Right ventricular hypertrophy.</span></li>
      </ul>
    `
  },
  {
    id: "tof-pathophysiology",
    question: "Explain the Hemodynamics and Pathophysiology of TOF.",
    answer: `
      <u>Hemodynamics of TOF:</u><br/>
      <ul class="list-disc ml-5">
        <li>Combination of large VSD and severe pulmonary stenosis.</li>
        <li>Mixing of blood at VSD with right-to-left shunt causing cyanosis.</li>
        <li>Shunt magnitude depends on relative resistances of PS and systemic circulation.</li>
        <li>PS responds to catecholamines; shunt/cyanosis vary with emotion or exercise.</li>
      </ul>
    `
  },
  {
    id: "tof-manifestations",
    question: "What are the Clinical Manifestations (History and Examination) of TOF?",
    answer: `
      <u>Clinical Manifestations of TOF:</u><br/>
      <span class="text-blue-600 text-sm">History:</span><br/>
      <ul class="list-disc ml-8">
        <li>Cyanosis failing to respond to O2.</li>
        <li><span class="text-red-600">Characteristic complexes:</span> Variable cyanosis, hypercyanotic (tet) spells, and <span class="text-red-600">squatting</span> (increases systemic resistance, reduces shunt).</li>
      </ul>
      <span class="text-blue-600 text-sm">Physical Examination:</span><br/>
      <ul class="list-disc ml-8">
        <li>Cyanosis and clubbing (in older children).</li>
        <li>Systolic thrill at upper/mid LSB.</li>
        <li><span class="text-red-600">Murmur:</span> Systolic ejection murmur at mid/upper LSB (caused by PS, not VSD). Loudness inversely related to stenosis severity.</li>
      </ul>
    `
  },
  {
    id: "tof-tet-spells",
    question: "What are Cyanotic (Tet) Spells, their causes, and precipitating factors?",
    answer: `
      <u>Cyanotic (Tet) Spells:</u><br/>
      <span class="text-blue-600 text-sm">Definition:</span> Attacks of deepening cyanosis, tachypnea, irritability, crying. May lead to unconsciousness, convulsions, death.<br/>
      <span class="text-blue-600 text-sm">Cause:</span> Reduction of pulmonary blood flow due to increased pulmonary resistance or decreased systemic resistance.<br/>
      <span class="text-blue-600 text-sm">Precipitating factors:</span> Crying, defecation, fever, awakening from naps, feeding, tachycardia, iron deficiency.
    `
  },
  {
    id: "tof-investigations",
    question: "What investigations are used for TOF and what are their findings?",
    answer: `
      <u>Investigations for TOF:</u><br/>
      <span class="text-blue-600 text-sm">1. ECG:</span> RAD, right atrial enlargement, RVH.<br/>
      <span class="text-blue-600 text-sm">2. Chest X-ray:</span> Normal heart size, decreased pulmonary markings. Characteristic <span class="text-red-600">boot-shaped (coeur en sabot)</span> contour. Apex turned upwards, concave PA segment.<br/>
      <span class="text-blue-600 text-sm">3. Echocardiogram:</span> Diagnostic.
    `
  },
  {
    id: "tof-management-medical",
    question: "What is the Medical Management for TOF and Tet Spells?",
    answer: `
      <u>Medical Management of TOF:</u><br/>
      <ul class="list-disc ml-5">
        <li>Prevent/treat iron deficiency anaemia.</li>
      </ul>
      <u>Management of TET spells:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Knee-chest position.</span></li>
        <li>Calm the child, avoid agitation.</li>
        <li>Supplemental oxygen.</li>
        <li><span class="text-red-600">Morphine sulfate</span> (decreases sympathetic tone).</li>
        <li>IV sodium bicarbonate for acidosis.</li>
        <li>Fluid bolus.</li>
        <li><span class="text-red-600">β-Blockers</span> (Esmolol).</li>
        <li>Ketamine or Phenylephrine (increases systemic resistance).</li>
        <li><span class="text-blue-600 text-sm">NO INOTROPES, NO DIURETICS.</span></li>
      </ul>
    `
  },
  {
    id: "tof-management-surgical",
    question: "What is the Surgical Management for TOF?",
    answer: `
      <u>Surgical Management of TOF:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Palliative:</span> Modified Blalock Taussig shunt (between aortic branch and pulmonary branch).</li>
        <li><span class="text-red-600">Complete repair:</span> Preferred method after 6 to 9 months of age.</li>
      </ul>
    `
  },
  {
    id: "arf-def-cause",
    question: "Define Acute Rheumatic Fever (ARF) and state its cause and predisposing factors.",
    answer: `
      <u>Acute Rheumatic Fever (ARF):</u><br/>
      <span class="text-blue-600 text-sm">Cause:</span> Immunologic response occurring as a delayed sequel of <span class="text-red-600">group A streptococcal infection of the pharynx</span> (not skin). Attack rate 0.3% to 3%.<br/>
      <span class="text-blue-600 text-sm">Predisposing factors:</span> Family history, low socioeconomic status (poverty, poor hygiene), age 6-15 years (peak at 8).
    `
  },
  {
    id: "arf-pathology",
    question: "Describe the Pathology of Acute Rheumatic Fever.",
    answer: `
      <u>Pathology of ARF:</u><br/>
      <ul class="list-disc ml-5">
        <li>Inflammatory lesions in heart, brain, joints, and skin.</li>
        <li><span class="text-red-600">Rheumatic carditis:</span> Pancarditis. Valvular component is critical. Mitral valve most frequently involved.</li>
        <li><span class="text-red-600">Aschoff bodies:</span> Characteristic inflammatory lesions in atrial myocardium.</li>
      </ul>
    `
  },
  {
    id: "arf-jones-criteria",
    question: "What are the Revised Jones Criteria for diagnosing ARF?",
    answer: `
      <u>Revised Jones Criteria (Modified 2015):</u><br/>
      <span class="text-blue-600 text-sm">Major Criteria:</span><br/>
      <ul class="list-disc ml-8">
        <li>Carditis (clinical or subclinical).</li>
        <li>Arthritis (polyarthritis in low risk; mono/poly/polyarthralgia in high risk).</li>
        <li>Chorea.</li>
        <li>Erythema marginatum.</li>
        <li>Subcutaneous nodules.</li>
      </ul>
      <span class="text-blue-600 text-sm">Minor Criteria:</span><br/>
      <ul class="list-disc ml-8">
        <li>Polyarthralgia/Monoarthralgia.</li>
        <li>Fever (≥ 38.5°C low risk; ≥ 38.0°C high risk).</li>
        <li>Elevated ESR/CRP.</li>
        <li>Prolonged PR interval.</li>
      </ul>
      <span class="text-blue-600 text-sm">Diagnosis:</span> 2 major OR 1 major + 2 minor AND evidence of antecedent streptococcal infection.
    `
  },
  {
    id: "arf-major-manifestations",
    question: "Describe the Major Manifestations of ARF (Arthritis, Carditis, Erythema Marginatum, Nodules, Chorea).",
    answer: `
      <u>Major Manifestations:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Arthritis (70%):</span> Migratory polyarthritis of large joints. Dramatic response to salicylates.</li>
        <li><span class="text-red-600">Carditis (50%):</span> Most serious. Myocarditis (tachycardia, muffled sounds), Endocarditis (mitral/aortic regurgitation, <span class="text-red-600">Carey Coombs murmur</span>), Pericarditis.</li>
        <li><span class="text-red-600">Erythema Marginatum (<10%):</span> Nonpruritic serpiginous rashes on trunk/extremities. Evanescent.</li>
        <li><span class="text-red-600">Subcutaneous Nodules (2-10%):</span> Hard, painless, movable nodules over bony prominences. Associated with carditis.</li>
        <li><span class="text-red-600">Sydenham’s chorea (15%):</span> Neuropsychiatric disorder (choreic movements, hypotonia). Signs: Darting tongue, Milkmaid’s grip, Piano player sign.</li>
      </ul>
    `
  },
  {
    id: "arf-management",
    question: "What is the Management for Acute Rheumatic Fever?",
    answer: `
      <u>Management of ARF:</u><br/>
      <ul class="list-disc ml-5">
        <li>1. Eradicate streptococci: <span class="text-red-600">Benzathine penicillin G</span> (or erythromycin if allergic).</li>
        <li>2. Anti-inflammatory therapy: <span class="text-red-600">Aspirin</span> for arthritis; <span class="text-red-600">Prednisone</span> for severe carditis.</li>
        <li>3. Bed rest: Duration depends on severity (1 week to several weeks).</li>
        <li>4. Management of Chorea: Reduce stress, penicillin, phenobarbital/haloperidol for severe cases.</li>
        <li>5. Prophylaxis: Duration depends on carditis/residual disease (5 years to lifelong).</li>
      </ul>
    `
  },
  {
    id: "hf-def-pathogenesis",
    question: "Define Heart Failure and explain its Pathogenesis.",
    answer: `
      <u>Heart Failure:</u><br/>
      <span class="text-blue-600 text-sm">Definition:</span> State in which the heart cannot deliver adequate cardiac output to meet metabolic needs.<br/>
      <u>Pathogenesis:</u><br/>
      <ul class="list-disc ml-5">
        <li>1. <span class="text-red-600">Increased afterload</span> (pressure overload): AS, COA.</li>
        <li>2. <span class="text-red-600">Increased preload</span> (volume overload): Lt-to-Rt shunts, regurgitation.</li>
        <li>3. <span class="text-red-600">Decreased contractility:</span> Cardiomyopathy, Myocarditis.</li>
        <li>4. <span class="text-red-600">Tachyarrhythmias:</span> Shorten diastolic filling time.</li>
      </ul>
    `
  },
  {
    id: "hf-clinical-picture",
    question: "What is the Clinical Picture of Heart Failure in infants and older children?",
    answer: `
      <u>Clinical Picture of HF:</u><br/>
      <span class="text-blue-600 text-sm">In Infants:</span><br/>
      <ul class="list-disc ml-8">
        <li><span class="text-red-600">Triad:</span> Tachypnea, tachycardia, and enlarged tender liver.</li>
        <li>Poor weight gain, irritability, weak cry, feeding difficulty.</li>
      </ul>
      <span class="text-blue-600 text-sm">In Older Children (Left sided):</span><br/>
      <ul class="list-disc ml-8">
        <li>Low COP: Headache, syncope, pale cold skin, easy fatigability, oliguria.</li>
        <li>Pulmonary congestion: Dyspnea, cough, hemoptysis, crepitations.</li>
      </ul>
      <span class="text-blue-600 text-sm">In Older Children (Right sided):</span><br/>
      <ul class="list-disc ml-8">
        <li>Systemic congestion: Pulsating neck veins, enlarged tender liver, ascites, edema (late).</li>
      </ul>
    `
  },
  {
    id: "hf-management-drugs",
    question: "What are the major classes of drugs used in the treatment of CHF in children?",
    answer: `
      <u>Drug Therapy for CHF:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">1. Diuretics:</span> Loop diuretics (Furosemide) are choice. Aldosterone antagonists (Spironolactone).</li>
        <li><span class="text-red-600">2. Inotropic agents:</span> Digitalis (Digoxin), rapid acting agents (Dopamine, Epinephrine).</li>
        <li><span class="text-red-600">3. Afterload-reducing agents:</span> ACE inhibitors (Captopril, Enalapril), Hydralazine.</li>
        <li><span class="text-red-600">4. Beta-blockers:</span> Carvedilol (for dilated cardiomyopathy).</li>
      </ul>
    `
  },
  {
    id: "digitalis-toxicity",
    question: "What are the signs and treatment of Digitalis Toxicity?",
    answer: `
      <u>Digitalis Toxicity:</u><br/>
      <span class="text-blue-600 text-sm">Clinical signs:</span> Anorexia, nausea, vomiting, diarrhea, headache, dizziness, visual disturbance, arrhythmias.<br/>
      <span class="text-blue-600 text-sm">ECG:</span> Extrasystole, paroxysmal atrial tachycardia with block, AF.<br/>
      <u>Treatment:</u><br/>
      <ul class="list-disc ml-5">
        <li>Stop digitalis.</li>
        <li>Correct hypokalemia/hypercalcemia.</li>
        <li>Symptomatic treatment of arrhythmias.</li>
        <li>Digitalis antibodies.</li>
      </ul>
    `
  }
];

export const CLINICAL_CARDS: FlashcardData[] = [
  {
    id: "clin-vsd",
    question: "Ventricular Septal Defect (VSD)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-blue-600">Most common CHD</span> (30% of defects).</li>
        <li><span class="text-red-600">Murmur:</span> Harsh (grade 3-5/6) pansystolic murmur at lower Lt sternal border.</li>
        <li><span class="text-red-600">Signs:</span> Precordial bulge, hyperkinetic apex, systolic thrill.</li>
        <li><span class="text-blue-600">Hemodynamics:</span> Left-to-right shunt → pulmonary plethora → pulmonary hypertension → Eisenmenger Syndrome (cyanosis).</li>
        <li><span class="text-blue-600">Natural History:</span> Spontaneous closure common in small/muscular defects (60%) before age 8.</li>
      </ul>
    `
  },
  {
    id: "clin-asd",
    question: "Atrial Septal Defect (ASD)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-blue-600">Types:</span> Ostium secundum (most common), primum, sinus venosus.</li>
        <li><span class="text-red-600">Heart Sounds:</span> Widely split and fixed S2 (Pathognomonic).</li>
        <li><span class="text-red-600">Murmur:</span> Soft systolic ejection murmur over pulmonary area (relative PS).</li>
        <li><span class="text-blue-600">N.B.:</span> No murmur due to blood passage through ASD itself.</li>
        <li><span class="text-blue-600">ECG:</span> Right axis deviation, RBBB pattern in V1.</li>
      </ul>
    `
  },
  {
    id: "clin-pda",
    question: "Patent Ductus Arteriosus (PDA)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-blue-600">Common in:</span> Premature infants.</li>
        <li><span class="text-red-600">Murmur:</span> Continuous "machinery" murmur at left infraclavicular area.</li>
        <li><span class="text-red-600">Pulses:</span> Bounding peripheral pulses with <span class="text-red-600">water hammer pulse</span>.</li>
        <li><span class="text-red-600">Differential Cyanosis:</span> Cyanosis only in lower half of body (if Eisenmenger develops).</li>
        <li><span class="text-blue-600">Treatment:</span> Indomethacin/Ibuprofen in premature infants.</li>
      </ul>
    `
  },
  {
    id: "clin-ps",
    question: "Pulmonary Stenosis (PS)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Murmur:</span> Systolic ejection murmur at ULSB transmitting to back/axillae.</li>
        <li><span class="text-red-600">Signs:</span> RV tap, systolic thrill at ULSB, <span class="text-red-600">systolic ejection click</span> (valvular).</li>
        <li><span class="text-blue-600">Pathophysiology:</span> RVH, post-stenotic dilatation of PA.</li>
        <li><span class="text-blue-600">Management:</span> Balloon valvuloplasty is procedure of choice.</li>
      </ul>
    `
  },
  {
    id: "clin-as",
    question: "Aortic Stenosis (AS)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Murmur:</span> Harsh systolic ejection murmur at 2nd RICS, transmits to neck.</li>
        <li><span class="text-red-600">Signs:</span> Narrow pulse pressure (severe), systolic thrill at URSB/suprasternal notch, ejection click.</li>
        <li><span class="text-blue-600">Symptoms:</span> Exercise intolerance, chest pain, syncope.</li>
        <li><span class="text-blue-600">Pathophysiology:</span> LVH, post-stenotic dilatation of ascending aorta.</li>
      </ul>
    `
  },
  {
    id: "clin-coa",
    question: "Coarctation of the Aorta (COA)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Classic Sign:</span> Disparity in pulsations/BP between upper and lower limbs (weak femoral vs bounding arm pulses).</li>
        <li><span class="text-red-600">X-ray:</span> "3 sign" (indentation of AO), rib notching.</li>
        <li><span class="text-blue-600">Associations:</span> Turner syndrome (30%).</li>
        <li><span class="text-blue-600">Newborns:</span> May present with circulatory shock and differential cyanosis.</li>
      </ul>
    `
  },
  {
    id: "clin-tga",
    question: "Transposition of the Great Arteries (TGA)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-blue-600">Most common cyanotic disorder in neonates.</span></li>
        <li><span class="text-red-600">History:</span> Cyanosis since birth, not relieved by 100% O2.</li>
        <li><span class="text-red-600">X-ray:</span> <span class="text-red-600">"Egg-on-a-string"</span> appearance.</li>
        <li><span class="text-blue-600">Management:</span> PGE1 to keep ductus open, Rashkind septostomy, <span class="text-red-600">Arterial Switch (Jatene)</span> within 3-8 weeks.</li>
      </ul>
    `
  },
  {
    id: "clin-tof",
    question: "Tetralogy of Fallot (TOF)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-blue-600">Components:</span> VSD, Overriding aorta, PS (infundibular), RVH.</li>
        <li><span class="text-red-600">X-ray:</span> <span class="text-red-600">"Boot-shaped" (coeur en sabot)</span> heart.</li>
        <li><span class="text-red-600">Clinical:</span> <span class="text-red-600">Squatting</span> (increases SVR, reduces shunt), Tet spells.</li>
        <li><span class="text-red-600">Murmur:</span> Systolic ejection murmur at LSB (due to PS, not VSD).</li>
        <li><span class="text-blue-600">Management:</span> Knee-chest for spells, BT shunt (palliative), complete repair at 6-9 months.</li>
      </ul>
    `
  },
  {
    id: "clin-arf",
    question: "Acute Rheumatic Fever (ARF)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-blue-600">Cause:</span> Delayed sequel of Group A Strep pharyngitis.</li>
        <li><span class="text-red-600">Major Criteria (Jones):</span> Carditis, Polyarthritis, Chorea, Erythema marginatum, Subcutaneous nodules.</li>
        <li><span class="text-red-600">Signs:</span> <span class="text-red-600">Carey Coombs murmur</span> (mitral valvulitis), Aschoff bodies (pathology).</li>
        <li><span class="text-blue-600">Chorea Signs:</span> Darting tongue, Milkmaid’s grip, Piano player sign.</li>
        <li><span class="text-blue-600">Treatment:</span> Penicillin, Aspirin (arthritis), Steroids (severe carditis).</li>
      </ul>
    `
  },
  {
    id: "clin-hf",
    question: "Heart Failure (HF)",
    answer: `
      <u>Clinical Points & Signs:</u><br/>
      <ul class="list-disc ml-5">
        <li><span class="text-red-600">Infant Triad:</span> Tachypnea, tachycardia, and enlarged tender liver.</li>
        <li><span class="text-blue-600">Older Children (Left):</span> Pulmonary congestion (dyspnea, cough, crepitations).</li>
        <li><span class="text-blue-600">Older Children (Right):</span> Systemic congestion (pulsating neck veins, ascites, edema).</li>
        <li><span class="text-blue-600">Management:</span> Diuretics (Furosemide), Inotropes (Digoxin), Afterload reducers (ACEi).</li>
        <li><span class="text-red-600">Digoxin Toxicity:</span> Anorexia, vomiting, arrhythmias (extrasystole, block).</li>
      </ul>
    `
  }
];
