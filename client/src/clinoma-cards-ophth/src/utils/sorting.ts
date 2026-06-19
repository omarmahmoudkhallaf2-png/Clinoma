import type { Question } from '../types';
import { CHAPTERS } from '../data/chapters';

export function getQuestionLogicalScore(q: Question): number {
  const title = q.title.toLowerCase();
  const content = q.content.toLowerCase();
  const id = q.id.toLowerCase();

  // 1. Foundations / Anatomy (Lowest score - earliest)
  if (
    title.includes('anatomy') || title.includes('histology') || title.includes('physiology') ||
    title.includes('structure') || title.includes('layer') || title.includes('supply') ||
    title.includes('nerve') || title.includes('vascular') || title.includes('muscle') ||
    content.includes('anatomy') || content.includes('histology') || content.includes('physiology')
  ) {
    return 10;
  }

  // 2. Definition & Etiology
  if (
    title.includes('definition') || title.includes('etiology') || title.includes('causative') ||
    title.includes('pathogenesis') || title.includes('mechanism') || title.includes('risk factor') ||
    title.includes('cause') || title.includes('define') ||
    content.includes('causative organism') || content.includes('pathogenesis') || content.includes('etiology')
  ) {
    return 20;
  }

  // 3. Classification & Types
  if (
    title.includes('classification') || title.includes('types') || title.includes('grade') ||
    title.includes('grading') || title.includes('division') || title.includes('stage') ||
    content.includes('classification') || content.includes('types according to')
  ) {
    return 30;
  }

  // 4. Clinical Features / Signs / Symptoms
  if (
    title.includes('symptom') || title.includes('sign') || title.includes('clinical presentation') ||
    title.includes('clinical feature') || title.includes('clinical signs') || title.includes('clinical picture') ||
    title.includes('slit-lamp') || title.includes('presentation') || title.includes('finding') ||
    title.includes('fundus') || content.includes('symptom') || content.includes('clinical features') ||
    content.includes('clinical signs') || content.includes('clinical picture')
  ) {
    return 40;
  }

  // 5. Evaluation & Diagnosis
  if (
    title.includes('investigation') || title.includes('diagnosis') || title.includes('evaluation') ||
    title.includes('assessment') || title.includes('measurement') || title.includes('test') ||
    title.includes('approach') || title.includes('workup') || title.includes('mrd') ||
    content.includes('investigation') || content.includes('diagnostic workflow') || content.includes('diagnose')
  ) {
    return 50;
  }

  // 6. Complications & Sequelae
  if (
    title.includes('complication') || title.includes('sequela') || title.includes('perforation') ||
    title.includes('fistula') || title.includes('outcome') || content.includes('complications')
  ) {
    return 60;
  }

  // 7. Clinical Cases & Scenarios
  if (
    title.includes('case') || title.includes('scenario') || id.includes('case') ||
    content.includes('year-old') || content.includes('complaining of') ||
    content.includes('presents with') || content.includes('presents complaining')
  ) {
    return 70;
  }

  // 8. Medical Treatment & Management
  if (
    title.includes('treatment') || title.includes('management') || title.includes('medical protocol') ||
    title.includes('contraindication') || title.includes('drug') || title.includes('therapy') ||
    title.includes('conservative') || title.includes('regimen') || title.includes('option') ||
    title.includes('culture') || title.includes('emergency') || title.includes('prevent') ||
    content.includes('treatment') || content.includes('management') || content.includes('contraindication')
  ) {
    return 80;
  }

  // 9. Surgery & Operations (Highest score - latest)
  if (
    title.includes('surgical') || title.includes('surgery') || title.includes('incision') ||
    title.includes('operation') || title.includes('technique') || title.includes('decompression') ||
    title.includes('evisceration') || title.includes('enucleation') || title.includes('exenteration') ||
    title.includes('procedure') || title.includes('timing') || q.isSurgical || id.startsWith('surgical')
  ) {
    return 90;
  }

  // Default fallback score (Intermediate)
  return 45;
}

export function getSubtopicKey(q: Question): string {
  const topic = q.topic || '';
  const title = q.title.toLowerCase();
  const content = q.content.toLowerCase();
  const id = q.id.toLowerCase();
  const combined = `${title} ${content} ${id}`;

  if (topic.includes('Acute Bacterial Conjunctivitis')) {
    if (combined.includes('mucopurulent') || combined.includes('mpc')) return 'MPC';
    if (combined.includes('purulent') || combined.includes('gonococc') || combined.includes('pc')) return 'PC';
  }

  if (topic.includes('Allergic Conjunctivitis')) {
    if (combined.includes('phlycten') || combined.includes('nodule')) return 'Phlyctenular';
    if (combined.includes('spring') || combined.includes('vernal') || combined.includes('cobble') || combined.includes('trantas') || combined.includes('vck') || combined.includes('itchy') || combined.includes('itching') || combined.includes('gelatinous') || combined.includes('masses')) return 'Vernal (Spring Catarrh)';
  }

  if (topic.includes('Disorders of Eyelashes')) {
    if (combined.includes('distichiasis')) return 'Distichiasis';
    if (combined.includes('trichiasis') || combined.includes('rubbing')) return 'Trichiasis';
  }

  if (topic.includes('Inflammations of the Eyelid Glands')) {
    if (combined.includes('stye') || combined.includes('hordeolum')) return 'Hordeolum / Stye';
    if (combined.includes('chalazion')) return 'Chalazion';
  }

  if (topic.includes('Positional Anomalies')) {
    if (combined.includes('entropion')) return 'Entropion';
    if (combined.includes('ectropion')) return 'Ectropion';
  }

  if (topic.includes('Ophthalmia Neonatorum & Inclusion Conjunctivitis')) {
    if (combined.includes('neonatorum') || combined.includes('neonat') || combined.includes('ophthalmia n')) return 'Ophthalmia Neonatorum';
    if (combined.includes('inclusion') || combined.includes('chlamydia')) return 'Inclusion Conjunctivitis';
  }

  if (topic.includes('Tear Film & Dry Eye Syndrome')) {
    if (combined.includes('dry eye') || combined.includes('sjogren') || combined.includes('sicca') || combined.includes('schirmer') || combined.includes('rose bengal') || combined.includes('artificial tear')) return 'Dry Eye';
    if (combined.includes('tear film') || combined.includes('break-up') || combined.includes('but') || combined.includes('mucin') || combined.includes('aqueous') || combined.includes('lipid')) return 'Tear Film';
  }

  if (topic.includes('Conjunctival Degenerations & Symblepharon')) {
    if (combined.includes('pinguecula')) return 'Pinguecula';
    if (combined.includes('pterygium')) return 'Pterygium';
    if (combined.includes('symblepharon')) return 'Symblepharon';
  }

  if (topic.includes('Viral Ulcers')) {
    if (combined.includes('simplex') || combined.includes('dendritic') || combined.includes('hsv') || combined.includes('acyclovir')) return 'HSV';
    if (combined.includes('zoster') || combined.includes('hzo') || combined.includes('hutchinson') || combined.includes('dermatome')) return 'HZO';
  }

  if (topic.includes('Proptosis & Enophthalmos')) {
    if (combined.includes('enophthalmos') || combined.includes('blowout') || combined.includes('blow-out')) return 'Enophthalmos';
    if (combined.includes('proptosis') || combined.includes('exophthalmos')) return 'Proptosis';
  }

  if (topic.includes('Non-Mechanical Injuries')) {
    if (combined.includes('chemical') || combined.includes('alkali') || combined.includes('acid') || combined.includes('lime')) return 'Chemical';
    if (combined.includes('physical') || combined.includes('burn') || combined.includes('radiation') || combined.includes('thermal') || combined.includes('electric') || combined.includes('infrared') || combined.includes('uv')) return 'Physical';
  }

  if (topic.includes('Optic Disc Swelling Differential Diagnosis')) {
    if (combined.includes('neuritis') || combined.includes('papillitis') || combined.includes('retrobulbar')) return 'Optic Neuritis';
    if (combined.includes('papilledema')) return 'Papilledema';
    if (combined.includes('naion') || combined.includes('ischemic')) return 'NAION';
  }

  if (topic.includes('Apparent Squint & Latent Squint (Heterophoria)')) {
    if (combined.includes('apparent') || combined.includes('pseudo')) return 'Apparent Squint';
    if (combined.includes('latent') || combined.includes('heterophoria') || combined.includes('esophoria') || combined.includes('exophoria')) return 'Latent Squint';
  }

  if (topic.includes('Suppurative Uveitis')) {
    if (combined.includes('endophthalmitis')) return 'Endophthalmitis';
    if (combined.includes('panophthalmitis')) return 'Panophthalmitis';
  }

  return 'General';
}

export function sortChapterQuestions(chapterId: number, qList: Question[]): Question[] {
  const chapter = CHAPTERS.find(c => c.id === chapterId);
  if (!chapter) return qList;

  const getTopicIndex = (topic: string | undefined): number => {
    if (!topic) return 999;
    const idx = chapter.topics.indexOf(topic);
    return idx === -1 ? 998 : idx;
  };

  const list = [...qList];
  list.sort((a, b) => {
    const topicA = getTopicIndex(a.topic);
    const topicB = getTopicIndex(b.topic);

    if (topicA !== topicB) {
      return topicA - topicB;
    }

    const subA = getSubtopicKey(a);
    const subB = getSubtopicKey(b);

    if (subA !== subB) {
      if (subA === 'General') return 1;
      if (subB === 'General') return -1;
      return subA.localeCompare(subB);
    }

    const scoreA = getQuestionLogicalScore(a);
    const scoreB = getQuestionLogicalScore(b);

    return scoreA - scoreB;
  });

  return list;
}

export function sortAllQuestions(questions: Question[]): Question[] {
  const result = [...questions];
  result.sort((a, b) => {
    if (a.chapterId !== b.chapterId) {
      return a.chapterId - b.chapterId;
    }
    const chapter = CHAPTERS.find(c => c.id === a.chapterId);
    if (!chapter) return 0;

    const topicIdxA = chapter.topics.indexOf(a.topic || '');
    const topicIdxB = chapter.topics.indexOf(b.topic || '');

    const resolvedA = topicIdxA === -1 ? 999 : topicIdxA;
    const resolvedB = topicIdxB === -1 ? 999 : topicIdxB;

    if (resolvedA !== resolvedB) {
      return resolvedA - resolvedB;
    }

    const subA = getSubtopicKey(a);
    const subB = getSubtopicKey(b);

    if (subA !== subB) {
      if (subA === 'General') return 1;
      if (subB === 'General') return -1;
      return subA.localeCompare(subB);
    }

    const scoreA = getQuestionLogicalScore(a);
    const scoreB = getQuestionLogicalScore(b);

    return scoreA - scoreB;
  });
  return result;
}
