export interface Flashcard {
  id: string;
  category: 'eyelid_lacrimal' | 'cornea_sclera' | 'lens' | 'glaucoma' | 'retina';
  question: string;
  explanation: {
    primary: string;
    alternative: string;
  } | string;
  answer: {
    title: string;
    content: { text: string; type: 'main' | 'sub' | 'example' | 'note' }[];
  };
}

export const flashcardCategories = [
  { id: 'eyelid_lacrimal' as const, name: 'Eyelid and Lacrimal', icon: '👁️' },
  { id: 'cornea_sclera' as const, name: 'Cornea and Sclera', icon: '🧿' },
  { id: 'lens' as const, name: 'The Lens', icon: '💎' },
  { id: 'glaucoma' as const, name: 'Glaucoma', icon: '🟢' },
  { id: 'retina' as const, name: 'Retina', icon: '🖼️' }
];

export const ophthalmologyData: Flashcard[] = [
  {
    id: '1',
    category: 'eyelid_lacrimal',
    question: 'How much of the cornea does the upper eyelid cover, and where is the position of the lower eyelid?',
    explanation: {
      primary: `**Eyelid Position**
الوضع الطبيعي للجفون بالنسبة للقرنية:
1. **Upper Eyelid**: بيغطي حوالي 1-3 مم من الجزء العلوي للـ Cornea.
2. **Lower Eyelid**: بيكون يا إما تحت الـ Cornea مباشرة أو لامس الـ limbus السفلي.

لو الجفن العلوي غطى أكتر من كده بنسميها **Ptosis** (سقوط الجفن)، ولو غطى أقل بنسميها **Lid Retraction**.`,
      alternative: `**Eyelid Position - 2nd View**
للتسهيل:
* **اللي فوق**: بيغطي طرف القرنية (كأنك مغمض حتة صغيرة).
* **اللي تحت**: يا دوب ملمس القرنية من تحت.
التوازن ده هو اللي بيخلي العين شكلها طبيعي. لو الجفن خبي القرنية زيادة = **Ptosis**، لو كشف الـ Sclera = **Lid Retraction**.`
    },
    answer: {
      title: 'Gross anatomy of the eyelids',
      content: [
        { text: 'The upper eyelid covers 1-3 mm from the upper part of the cornea.', type: 'main' },
        { text: 'The lower eyelid is just below the cornea or touching the lower limbus.', type: 'main' }
      ]
    }
  },
  {
    id: '2',
    category: 'eyelid_lacrimal',
    question: 'What is the palpebral fissure and its angles (canthi)?',
    explanation: `**Palpebral Fissure**
هي الفتحة العرضية اللي بتبان لما نفتح عينينا (elliptical space).
ليها زاويتين اسمهم **Canthi** (مفردها Canthus):
1. **Medial Canthus**: الناحية الداخلية (ناحية الأنف) وتكون مدورة (rounded).
2. **Lateral Canthus**: الناحية الخارجية وتكون زاوية حادة (acute angle).`,
    answer: {
      title: 'Palpebral Fissure',
      content: [
        { text: 'The elliptical space when the eyelids are opened is called palpebral fissure which has 2 angles called canthi.', type: 'main' },
        { text: 'The medial canthus is rounded while the lateral forms acute angle.', type: 'main' }
      ]
    }
  },
  {
    id: '3',
    category: 'eyelid_lacrimal',
    question: 'Where is the transverse crease located in the upper eyelid and what does it represent?',
    explanation: `**Upper Eyelid Crease**
الثنية اللي بنشوفها في الجفن العلوي (الكسرة):
* مكانها: حوالي 5-10 مم فوق حافة الجفن (Lid margin).
* أهميتها: بتمثل مكان مسك عضلة الرفع (**Levator aponeurosis**) في الجلد.

غياب الكسرة دي (Absent crease) ممكن يدل على ضعف في عضلة الـ Levator أو يكون طبيعي في بعض الأعراق (زي الآسيويين).`,
    answer: {
      title: 'Upper Eyelid Crease',
      content: [
        { text: 'In the upper eyelid, there is a transverse crease usually lies 5 to 10 mm above the upper lid margin.', type: 'main' },
        { text: 'It represents the insertion of the levator aponeurosis.', type: 'main' }
      ]
    }
  },
  {
    id: '4',
    category: 'eyelid_lacrimal',
    question: 'Describe the gross anatomy of the eyelid margin.',
    explanation: `**Eyelid Margin**
حافة الجفن سمكها حوالي 2-3 مم، وفي خرم صغير اسمه الـ **Punctum** بيقسمها لجزئين:
1. **Lacrimal part (1/6)**: الجزء الصغير اللي ناحية الأنف (Medial). ده مفيهوش رموش ولا غدد Tarsal، لكن فيه الـ **lacrimal canaliculus**.
2. **Ciliary part (5/6)**: بقية حافة الجفن (Lateral) ودي اللي فيها الرموش (Cilia).

> **Mnemonic**: 1/6 medially, 5/6 laterally. الـ Punctum هي النقطة الفاصلة.`,
    answer: {
      title: 'Eyelid Margin',
      content: [
        { text: 'It is the free margin of the lid 2-3 mm in width.', type: 'main' },
        { text: 'The punctum divides the eyelid margin into two parts:', type: 'sub' },
        { text: '- Lacrimal part: (medial 1/6th) from the punctum to the medial canthus where no cilia, no tarsal glands and contain lacrimal canaliculus.', type: 'example' },
        { text: '- Ciliary part: (lateral 5/6th) from the punctum to the lateral canthus.', type: 'example' }
      ]
    }
  },
  {
    id: '5',
    category: 'eyelid_lacrimal',
    question: 'What glands are found in the anterior border of the ciliary part of the lid margin?',
    explanation: `**Lid Margin Glands**
عند جذور الرموش بنلاقي نوعين من الغدد:
1. **Zeiss' glands**: دي غدد دهنية (sebaceous) ملحقة بالرموش.
2. **Moll's glands**: دي غدد عرقية (sweat) متحورة.

التهاب الغدد دي بيعمل الـ **Stye** (دمل الجفن الخارجي).

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Glands of Eyelid Margin',
      content: [
        { text: 'The lashes have modified sebaceous glands known as Zeiss\' glands.', type: 'main' },
        { text: 'Modified sweat glands are called Moll\'s glands.', type: 'main' }
      ]
    }
  },
  {
    id: '6',
    category: 'eyelid_lacrimal',
    question: 'What are the grey line, white line, and posterior border of the eyelid margin?',
    explanation: `**Important Lines on Lid Margin**
1. **Grey line**: الخط الرمادي ده مهم جداً للجراحين، لأنه مكان تقسيم الجفن لطبقتين (Anterior & Posterior lamellae).
2. **White line**: تحتها فتحات غدد الـ **Meibomian**.
3. **Posterior border**: بتكون حادة (sharp) عشان تضمن إن الدموع تمشي صح على سطح العين وتمنع تسريبها لبرا.`,
    answer: {
      title: 'Lid Margin Structures',
      content: [
        { text: 'Grey line: The lid can be surgically split in the grey line into anterior and posterior lamellae.', type: 'main' },
        { text: 'White line: behind the grey line representing the orifices of the meibomian glands.', type: 'main' },
        { text: 'Posterior border: sharp to help conduction of tears against the globe.', type: 'main' }
      ]
    }
  },
  {
    id: '7',
    category: 'eyelid_lacrimal',
    question: 'Enumerate the layers of the eyelid from outside inwards.',
    explanation: `**Eyelid Layers**
الجفن بيتكون من 5 طبقات من برا لجوا:
1. **Skin** (الجلد).
2. **Muscle layer** (العضلات).
3. **Submuscular areolar tissue** (نسيج رخو تحت العضلات).
4. **Fibrous layer/Tarsus** (الهيكل العظمي للجفن - طبقة ليفية).
5. **Conjunctiva** (الملتحمة - من جوا).

> **Mnemonic**: S-M-S-F-C (Skin, Muscle, Space, Fibrous, Conjunctiva).`,
    answer: {
      title: 'Layers of the Eyelid',
      content: [
        { text: '1- The skin.', type: 'main' },
        { text: '2- The muscle layer.', type: 'main' },
        { text: '3- The Submuscular areolar tissue.', type: 'main' },
        { text: '4- The fibrous layer (Tarsus).', type: 'main' },
        { text: '5- The Conjunctiva', type: 'main' }
      ]
    }
  },
  {
    id: '8',
    category: 'eyelid_lacrimal',
    question: 'Describe the skin and subcutaneous areolar tissue of the eyelids.',
    explanation: `**Skin & Tissue**
* **Skin**: جلد الجفن رقيق جداً ومرن (thin & elastic) ومش ماسك بقوة في اللي تحته.
* **Subcutaneous tissue**: النسيج اللي تحت الجلد ده **مفيهوش دهون** (No fat)، وده السبب إن أي التهاب أو حساسية بتخلي الجفن يورم بسرعة جداً وياخد سوايل (Edema).`,
    answer: {
      title: 'Skin Anatomy',
      content: [
        { text: 'The skin: thin, elastic and loosely adherent to underlying tissues.', type: 'main' },
        { text: 'The subcutaneous areolar tissue: containing no fat.', type: 'main' }
      ]
    }
  },
  {
    id: '9',
    category: 'eyelid_lacrimal',
    question: 'What muscles are in the muscles layer of the eyelid?',
    explanation: `**Eyelid Muscles**
العضلات نوعين:
1. **Voluntary (Striated)**:
   * **Orbicularis oculi**: بتقفل العين (عصب 7).
   * **Levator palpebrae**: بترفع العين (عصب 3).
2. **Involuntary (Non-striated)**:
   * **Muller's muscle**: عضلة مساعدة في الرفع (جهاز سمبساوي).
   * **Lower lid retractors**: مسؤولة عن شد الجفن السفلي.`,
    answer: {
      title: 'Muscles Layer',
      content: [
        { text: 'Striated (voluntary) muscles: orbicularis oculi and levator palpebrae superioris.', type: 'main' },
        { text: 'Non-striated muscles: Muller\'s muscle in the upper eyelid and lower eyelid retractors in lower eyelid.', type: 'main' }
      ]
    }
  },
  {
    id: '10',
    category: 'eyelid_lacrimal',
    question: 'What is the significance of the submuscular areolar tissue during anesthesia?',
    explanation: `**Submuscular Tissue (The Space)**
الطبقة دي موجودة بين عضلة الـ Orbicularis وبين الـ Tarsal plate.
* أهميتها في التخدير: الطبقة دي هي اللي بيمشي فيها الأعصاب والشرايين المغذية للجفن.
* عشان كدة لما نيجي ندي حقنة بنج موضعي (Local anesthesia) لازم نحقن "Deep to orbicularis" عشان توصل للأعصاب دي بفعالية.`,
    answer: {
      title: 'Submuscular Areolar Tissue',
      content: [
        { text: 'It lies between the orbicularis muscle and the tarsal plate.', type: 'main' },
        { text: 'It contains arteries & nerves of the eyelid.', type: 'main' },
        { text: '- So, it is necessary to inject local anesthetic to the eyelid deep to the orbicularis.', type: 'example' }
      ]
    }
  },
  {
    id: '11',
    category: 'eyelid_lacrimal',
    question: 'What are the tarsal plates and the meibomian glands?',
    explanation: `**Tarsus & Meibomian Glands**
* **Tarsal plates**: ده الهيكل اللي بيدي الجفن شكله وقوامه (Skeleton of the lids).
* **Meibomian glands**: غدد دهنية مدفونة جوه الـ Tarsal plate.
* وظيفتها: بتفرز طبقة زيتية بتغطي الدموع عشان تمنع تبخرها (retard evaporation) وتمنع الدموع إنها تسيح على الخد.

> **Note**: انسداد الغدد دي بيعمل الـ **Chalazion** (كيس دهني).

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'The Tarsus and Meibomian Glands',
      content: [
        { text: 'The tarsal plates: Forming the skeleton of the lids.', type: 'main' },
        { text: 'The meibomian (tarsal) glands are sebaceous glands embedded within the tarsal plate.', type: 'main' },
        { text: 'They form an oily film over the moistened cornea to retard evaporation of tears and prevents overflow of tears over the cheek.', type: 'example' }
      ]
    }
  },
  {
    id: '12',
    category: 'eyelid_lacrimal',
    question: 'Describe the palpebral conjunctiva and the sulcus subtarsalis.',
    explanation: `**Conjunctiva & Sulcus**
الـ **Palpebral conjunctiva** هي الغشاء اللي بيبطن الجفن من جوا.
* هي رقيقة جداً وحمراء (vascular) وماسكة بقوة في الـ tarsus.
* فيه خط بالعرض فوق حافة الجفن بـ 2 مم اسمه **Sulcus subtarsalis**، وده مكان مشهور جداً إنه يمسك فيه الأجسام الغريبة (Foreign bodies).`,
    answer: {
      title: 'Palpebral Conjunctiva',
      content: [
        { text: 'The palpebral conjunctiva is thin and vascular and firmly adherent to the tarsus.', type: 'main' },
        { text: '2 mm above the lid margin it shows a horizontal groove known as sulcus subtarsalis.', type: 'main' }
      ]
    }
  },
  {
    id: '13',
    category: 'eyelid_lacrimal',
    question: 'Anatomy and function of orbicularis oculi muscle components.',
    explanation: `**Orbicularis Oculi Parts**
العضلة دي ليها 4 أجزاء مهمة:
1. **Orbital part**: المسؤولة عن قفل العين "بجامد" (Tight closure).
2. **Palpebral part**: المسؤولة عن قفل العين "براحة" أو الرمش (Gentle closure).
3. **Muscle of Riolan**: الألياف اللي عند حافة الجفن وبتحافظ عليه لامس العين.
4. **Horner's muscle**: دي المسؤولة عن مضخة الدموع (**Lacrimal pump**) اللي بتصرف الدموع.`,
    answer: {
      title: 'Orbicularis Oculi Muscle',
      content: [
        { text: 'Orbital part: Responsible for tight closure of the eyelids.', type: 'main' },
        { text: 'Palpebral part: Responsible for gentle eyelid closure.', type: 'main' },
        { text: 'Muscle of Riolan: close to the lid margin and keeps the eyelid in apposition with the globe.', type: 'example' },
        { text: 'Lacrimal part (Horner\'s muscle): Responsible for lacrimal pump mechanism of tear drainage.', type: 'example' }
      ]
    }
  },
  {
    id: '14',
    category: 'eyelid_lacrimal',
    question: 'What happens when the facial nerve (7th nerve) is paralyzed?',
    explanation: `**7th Nerve Palsy**
لما العصب السابع (الفيسيال) يتشل، عضلة الـ Orbicularis بتقف، وده بيعمل 3 حاجات:
1. **Lagophthalmos**: العين مش بتعرف تقفل بالكامل.
2. **Epiphora**: دموع بتسيح لبرا لأن مضخة الدموع وقفت.
3. **Paralytic Ectropion**: الجفن السفلي بيقلب لبرا لأنه فقد القوة اللي شداه للعين.`,
    answer: {
      title: '7th Nerve Paralysis',
      content: [
        { text: 'Paralysis of orbicularis oculi leads to lagophthalmos, epiphora and paralytic ectropion.', type: 'main' }
      ]
    }
  },
  {
    id: '15',
    category: 'eyelid_lacrimal',
    question: 'Where does the Levator palpebrae superioris muscle arise and insert?',
    explanation: `**Levator Muscle (LPS)**
دي العضلة الأساسية اللي بترفع الجفن العلوي.
* المنشا: من قمّة الأوربت (Apex of the orbit).
* الاندغام (Insertion): بتدخل في كذا حتة أهمهم التارسس (**Superior tarsus**) والجلد (اللي بيعمل الـ crease).
* العصب: بتتغذى بالعصب التالت (**3rd nerve**).

> **Important**: لو العصب التالت اتشل أو العضلة نفسها ملتحمة غلط، بيحصل **Ptosis**.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Levator palpebrae superioris',
      content: [
        { text: 'Arises at the apex of the orbit.', type: 'main' },
        { text: 'Inserts in: Superior tarsus (main), Skin forming the crease, Upper fornix.', type: 'main' },
        { text: 'Supplied by the oculomotor nerve (3rd nerve); its paralysis leads to ptosis.', type: 'example' }
      ]
    }
  },
  {
    id: '16',
    category: 'eyelid_lacrimal',
    question: 'What is Muller\'s muscle and its clinical significance?',
    explanation: `**Muller's Muscle**
عضلة تانية مساعدة في رفع العين بس هي **Involuntary** (لاإرادية).
* تغذيتها: بتاخد من الجهاز السمبساوي (**Sympathetic supply**).
* أهميتها السريرية: لو اتقطعت التغذية دي بيحصل **Horner's syndrome**، ومن علاماتها الـ **Slight ptosis** (سقوط جفن بسيط).

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Muller\'s Muscle',
      content: [
        { text: 'It is a non-striated (involuntary) muscle in the upper eyelid.', type: 'main' },
        { text: 'Has sympathetic supply, & its paralysis will lead to Horner\'s syndrome.', type: 'main' }
      ]
    }
  },
  {
    id: '17',
    category: 'eyelid_lacrimal',
    question: 'What are the functions of the eyelid?',
    explanation: `**Eyelid Functions**
الجفون مش بس منظر، دي ليها فوائد كتيير:
1. **Protection**: حماية العين من أي خبطات أو أجسام غريبة.
2. **Distribution**: توزيع الدموع على القرنية عشان تفضل مبلولة ونظيفة.
3. **Drainage**: بتساعد في تصريف الدموع عن طريق مضخة الجفون.
4. **Massage**: بتعمل مساج للعين بيساعد في تصريف السوايل الداخلية للجسم (Aqueous).`,
    answer: {
      title: 'Functions of the Eyelid',
      content: [
        { text: '1- Protection of the globe from external injury.', type: 'main' },
        { text: '2- Help tear distribution by blinking so help in wetting of the cornea.', type: 'main' },
        { text: '3- Help tear drainage (through the lacrimal pump).', type: 'main' },
        { text: '4- Help aqueous drainage (through ocular massage).', type: 'main' }
      ]
    }
  },
  {
    id: '18',
    category: 'eyelid_lacrimal',
    question: 'Define Blepharitis and its three main types.',
    explanation: `**Blepharitis**
التهاب مزمن في حافة الجفون.
1. **Anterior**: بيأثر على الجلد اللي حوالين جذور الرموش.
2. **Posterior**: بيأثر على غدد الـ Meibomian (بيسموه MGD).
3. **Mixed**: الاتنين مع بعض.

> **Clinical Hint**: المرض ده بيزهق العيانين جداً لأنه مزمن وبيرجع تاني.`,
    answer: {
      title: 'Blepharitis',
      content: [
        { text: 'Definition: It is chronic inflammation of the eyelid margin.', type: 'main' },
        { text: '1) Anterior blepharitis: affects the skin around the base of eyelashes.', type: 'sub' },
        { text: '2) Posterior blepharitis: affects Meibomian glands, causing Meibomian gland dysfunction.', type: 'sub' },
        { text: '3) Mixed blepharitis: combination of both.', type: 'sub' }
      ]
    }
  },
  {
    id: '19',
    category: 'eyelid_lacrimal',
    question: 'What is the etiology and clinical picture of anterior blepharitis (squamous vs ulcerative)?',
    explanation: `**Squamous vs Ulcerative Blepharitis**
1. **Squamous (قشرية)**: دي بتكون جزء من قشرة الشعر العادية (Seborrhea).
   * العلامات: قشور زيتية لونها رمادي مبيض بين الرموش.
2. **Ulcerative (قرحية)**: دي سببها ميكروب الـ **Staph aureus**.
   * العلامات: الرموش بتكون لازقة في بعض بقشور صفراء، ولو شلناها بتبين تحتها **قرح صغيرة بتنزف** (minute bleeding ulcers).

> **Note**: الـ Ulcerative أخطر وبتبوظ الرموش.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Anterior Blepharitis Etiology & Signs',
      content: [
        { text: 'Squamous: part of generalized seborrhea with scalp dandruff. Signs: Greasy grayish white scales between lashes.', type: 'main' },
        { text: 'Ulcerative: caused by staph. aureus infection. Signs: lashes glued by yellow crusts, leaving minute bleeding ulcers when removed.', type: 'main' }
      ]
    }
  },
  {
    id: '20',
    category: 'eyelid_lacrimal',
    question: 'Enumerate the complications of anterior blepharitis.',
    explanation: `**Complications of Blepharitis**
الالتهاب ده مش بس في الجفن، ممكن يطور لمشاكل تانية:
* **Eyelid**: الرموش تقع (**Madarosis**) أو تطلع غلط (**Trichiasis**).
* **Lacrimal**: فتحة الصرف تقفل (Punctal occlusion).
* **Conjunctiva**: التهاب مزمن في الملتحمة.
* **Cornea**: قرح في القرنية بسبب السموم أو الرموش اللي بتحك.
* **Vicious Circle**: الجفن يقلب لبرا (Ectropion) والأكزيما تزيد.`,
    answer: {
      title: 'Complications of Anterior Blepharitis',
      content: [
        { text: 'Lacrimal: Punctal occlusion. Conjunctiva: Chronic conjunctivitis.', type: 'main' },
        { text: 'Cornea: Marginal corneal ulcers, Superficial punctate keratitis.', type: 'main' },
        { text: 'Eyelid: Trichiasis, Madarosis, Epiphora-eczema-ectropion cycle, Multiple styes.', type: 'main' }
      ]
    }
  },
  {
    id: '21',
    category: 'eyelid_lacrimal',
    question: 'Define Hordeolum externum (Stye) and its clinical picture.',
    explanation: `**Stye (Hordeolum Externum)**
دمل صغير ومؤلم بيطلع في جفن العين.
* التعريف: التهاب صديدي حاد في غدد **Zeiss** (الغدد الدهنية الملحقة بالرموش).
* السبب: ميكروب الـ **Staph aureus**.
* الشكل: ورم أحمر ومؤلم جداً عند حافة الجفن، وممكن تظهر "نقطة صفراء" فيها صديد عند جدر الرمش.`,
    answer: {
      title: 'Hordeolum Externum (Stye)',
      content: [
        { text: 'Definition: Acute suppurative inflammation of the Zeiss gland.', type: 'main' },
        { text: 'Etiology: Staphylococcus aureus.', type: 'sub' },
        { text: 'Symptoms: Painful red swelling at the eyelid margin.', type: 'main' },
        { text: 'Signs: Red tender swelling at the root of a lash. A yellow point may form.', type: 'main' }
      ]
    }
  },
  {
    id: '22',
    category: 'eyelid_lacrimal',
    question: 'What is the treatment for a stye and a precaution to avoid?',
    explanation: `**Stye Treatment**
* العلاج الأساسي: كمادات مياه دافئة (عشان تفتح المسام) ومضادات حيوية موضعية.
* التدخل: لو فيه صديد متجمع، بنشيل الرمش (Epilation) عشان الصديد يخرج.
* **تحذير هام جداً**: إياك تحاول تفرقع الدمل أو تضغط عليه بقوة لنقل الصديد (Don't press)! ده ممكن يخلي الميكروب يمشي لورا ويعمل **Orbital cellulitis** أو جلطة في جيوب المخ (**Cavernous sinus thrombosis**) لأن المنطقة دي "Dangerous area".`,
    answer: {
      title: 'Stye Treatment',
      content: [
        { text: 'Warm compresses and topical antibiotics.', type: 'main' },
        { text: 'Drain pus by epilation with a horizontal incision if pointing.', type: 'main' },
        { text: 'Do not press to evacuate a stye (dangerous area); may cause orbital cellulites or cavernous sinus thrombosis.', type: 'example' }
      ]
    }
  },
  {
    id: '23',
    category: 'eyelid_lacrimal',
    question: 'What is Hordeolum internum and its differences from a stye?',
    explanation: `**Hordeolum Internum**
زي الـ Stye بس "داخلي".
* التعريف: التهاب صديدي حاد في غدد الـ **Meibomian**.
* الفرق عن الـ Stye:
  1. الوجع بكون **أشد جداً** (لأن الصديد مزنوق جوه الـ Tarsus الناشف).
  2. الورم بيكون بعيد شوية عن حافة الجفن.
  3. النقطة الصفراء بتبان من ناحية **الملتحمة** (الكونج) مش من ناحية الجلد.`,
    answer: {
      title: 'Hordeolum Internum',
      content: [
        { text: 'Definition: Acute, suppurative inflammation of the Meibomian gland.', type: 'main' },
        { text: 'Difference: Pain is more severe (pus under tension in tarsus). Swelling is away from lid margin and not related to lashes.', type: 'main' },
        { text: 'Yellow spot appears on the conjunctival side.', type: 'example' }
      ]
    }
  },
  {
    id: '24',
    category: 'eyelid_lacrimal',
    question: 'Define Chalazion and its clinical picture.',
    explanation: `**Chalazion (كيس دهني)**
ده تورم "غير مؤلم" ومزمن.
* التعريف: تجمّع دهني مزمن (lipo-granuloma) بسبب انسداد فتحة غدة الـ **Meibomian**.
* العلامات: ورم ناشف، غير مؤلم، الجلد اللي فوقيه بيتحرك بحرية.
* من ناحية الملتحمة: بنلاقي مكان الورم لونه محمر أو مزرق شوية.

> **Key Word**: **Painless** (غير مؤلم). لو وجعك يبقى اتقلب لـ Hordeolum.`,
    answer: {
      title: 'Chalazion',
      content: [
        { text: 'Definition: A localized chronic inflammatory lipo-granuloma of a Meibomian gland.', type: 'main' },
        { text: 'Symptoms: Painless swelling under the skin of the eyelid.', type: 'main' },
        { text: 'Signs: Firm, painless swelling, skin freely mobile over it. Palpebral conjunctiva is red or bluish-grey.', type: 'main' }
      ]
    }
  },
  {
    id: '25',
    category: 'eyelid_lacrimal',
    question: 'How is a large chalazion treated?',
    explanation: `**Chalazion Treatment**
لو الكيس الدهني كبير ومش راضي يروح بالعلاجات البسيطة أو الحقن:
* العلاج الجراحي: بنعمل فتحة (**Incision**) وننضف المحتويات (**Curettage**) من ناحية الملتحمة (جوا الجفن) عشان ميسيبش أثر في الجلد.
* **ملحوظة هامة**: لو الكيس الدهني بيرجع كتير في "نفس المكان" عند حد كبير، لازم ناخد عينة عشان نتأكد إنها مش ورم سرطاني (**Malignancy**).

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Chalazion Treatment',
      content: [
        { text: 'Incision (cruciate or vertical) and curettage or scraping of its contents from the conjunctival side.', type: 'main' },
        { text: 'Recurrent swelling in same gland: Excision biopsy to exclude malignancy.', type: 'example' }
      ]
    }
  },
  {
    id: '26',
    category: 'eyelid_lacrimal',
    question: 'Define Distichiasis and its treatment.',
    explanation: `**Distichiasis (منبت رموش إضافي)**
حالة بيطلع فيها "صف رموش زيادة" ورا الخط الرمادي (grey line)، يعني في مكان فتحات غدد الـ Meibomian.
* المشكلة: الرموش دي بتحك في العين وبتعمل تهيج.
* العلاج: لازم ندمر منبت الرموش دي، إما بجراحة معينة أو بالتجميد (**Cryotherapy**).

> **Mnemonic**: "Di-" يعني اتنين، يعني صفين رموش.`,
    answer: {
      title: 'Distichiasis',
      content: [
        { text: 'Definition: Abnormality where extra row of lashes arise behind the grey line in place of Meibomian gland orifices.', type: 'main' },
        { text: 'Treatment: Selective destruction (rubbing lashes) or cryotherapy on the anterior surface of tarsus.', type: 'main' }
      ]
    }
  },
  {
    id: '27',
    category: 'eyelid_lacrimal',
    question: 'Differentiate between "rubbing lashes" and "trichiasis".',
    explanation: `**Rubbing Lashes vs Trichiasis**
الفرق في "العدد":
1. **Rubbing lashes**: رمش أو اتنين أو تلاتة (لحد 4) طالعين غلط وبيحكوا في العين.
2. **Trichiasis**: لما يكون أكتر من 4 رموش داخلين لجوا وبيحكوا في القرنية، ودي حالة مكتسبة بتبوظ العين.`,
    answer: {
      title: 'Rubbing Lashes vs Trichiasis',
      content: [
        { text: 'Rubbing lashes: Four or less inward misdirected lashes.', type: 'main' },
        { text: 'Trichiasis: Acquired condition in which more than four lashes are directed posteriorly.', type: 'main' }
      ]
    }
  },
  {
    id: '28',
    category: 'eyelid_lacrimal',
    question: 'What are the causes and clinical picture of trichiasis?',
    explanation: `**Trichiasis (انقلاب الرموش)**
الرموش طالعة من مكانها الصح بس رايحة "لورا" ناحية القرنية.
* الأسباب: أي حاجة بتعمل "تليف" في الجفن، وأشهر سبب في مصر هو الـ **Trachoma** (الرمد الحبيبي).
* المريض بيشتكي من: إحساس جسم غريب (Foreign body sensation)، وجع، دموع، والقرنية بتبدأ تتأثر.

> **Mnemonic**: **T**richiasis = **T**rachoma is the main cause.`,
    answer: {
      title: 'Trichiasis Causes & Signs',
      content: [
        { text: 'Causes: Cicatrizing diseases: Trachoma (commonest in Egypt), Ulcerative blepharitis, Trauma, Chemical burns.', type: 'main' },
        { text: 'Clinical Picture: Foreign body sensation, pain, lacrimation, photophobia, conjunctival hyperemia.', type: 'main' },
        { text: 'Signs: Misdirected lashes, corneal vascularization.', type: 'example' }
      ]
    }
  },
  {
    id: '29',
    category: 'eyelid_lacrimal',
    question: 'Define Entropion and its etiological types.',
    explanation: `**Entropion (انقلاب الجفن للداخل)**
هنا "الجفن كله" بيقلب لجوه، وبالتبعية الرموش كلها بتدخل تحك في العين.
* الأنواع:
  1. **Cicatricial**: بسبب تليف (زي التراكوما).
  2. **Senile**: بسبب كبر السن وضعف العضلات.
  3. **Spastic**: بسبب تشنج في العضلات.
  4. **Congenital**: مولود بيه.

> **Hint**: الـ "En-" يعني لجوه (Inward rolling).`,
    answer: {
      title: 'Entropion',
      content: [
        { text: 'Definition: Rolling in of the lid margin with eyelashes rubbing against the eyeball.', type: 'main' },
        { text: 'Types: 1- Congenital, 2- Cicatricial, 3- Spastic, 4- Senile (Involutional).', type: 'main' }
      ]
    }
  },
  {
    id: '30',
    category: 'eyelid_lacrimal',
    question: 'Define Ectropion and its degrees.',
    explanation: `**Ectropion (انقلاب الجفن للخارج)**
الجفن بيقلب لبرة، فالعين بتنكشف والدموع بتسيح.
* الدرجات:
  * **Mild**: فتحة الدموع (punctum) بتبان من غير ما نشد الجفن.
  * **Moderate**: الملتحمة اللي تحت الـ tarsus بتبان.
  * **Severe**: الجفن كله مقلوب وبطانة العين كلها باينة.

> **Hint**: الـ "Ec-" يعني لبرة (Outward rotation).`,
    answer: {
      title: 'Ectropion',
      content: [
        { text: 'Definition: Rolling out (outward rotation) of the lid margin.', type: 'main' },
        { text: 'Mild: Lacrimal punctum visible without pulling lid.', type: 'sub' },
        { text: 'Moderate: Tarsal conjunctiva exposed.', type: 'sub' },
        { text: 'Severe: Completely everted lid with exposure of conjunctival fornix.', type: 'sub' }
      ]
    }
  },
  {
    id: '31',
    category: 'eyelid_lacrimal',
    question: 'What is the "vicious circle" of ectropion?',
    explanation: `**The Vicious Circle of Ectropion**
دي حلقة مفرغة مريض الـ **Ectropion** بيتحبس فيها:
1. الجفن مقلوب لبرا -> الدموع مش بتصرف -> تحصل دموع غزيرة (**Epiphora**).
2. الدموع دي بتنزل على الجلد وتعمل التهاب وأكزيما (**Eczema**).
3. الأكزيما بتعمل تليف وشد في الجلد (**Scarring**).
4. الشد ده بيسحب الجفن لبرا أكتر -> فيزيد الـ **Ectropion**.
5. ونرجع نعيد الدائرة من الأول.

> **Key**: لازم نقطع الدائرة دي بالعلاج أو الجراحة عشان الحالة متسؤش.`,
    answer: {
      title: 'Ectropion Vicious Circle',
      content: [
        { text: 'Epiphora lead to eczematous reaction of skin which leads to scaring, causing more ectropion, then more epiphora.', type: 'main' }
      ]
    }
  },
  {
    id: '32',
    category: 'eyelid_lacrimal',
    question: 'Define Lagophthalmos and its causes.',
    explanation: `**Lagophthalmos (العين الأرنبية)**
المريض مش بيقدر يقفل عينه بالكامل.
* أهم الأسباب:
  1. شلل العصب السابع (7th nerve palsy).
  2. جحوظ العين (Proptosis).
  3. مشاكل في الغدة الدرقية (Thyroid eye disease).
  4. ندرة أو ضيق في جلد الجفن (Cicatricial).

> **Danger**: العين اللي مش بتقفل بتتعرض للهواء دايماً، وده بيعمل **Exposure keratitis** (قرحة جفاف القرنية).`,
    answer: {
      title: 'Lagophthalmos',
      content: [
        { text: 'Definition: Incomplete closure of the palpebral fissure on closure of the eyelids.', type: 'main' },
        { text: 'Causes: Severe ectropion, Coloboma, Overcorrection of ptosis, Thyroid ophthalmopathy, 7th nerve palsy, Proptosis.', type: 'main' }
      ]
    }
  },
  {
    id: '33',
    category: 'eyelid_lacrimal',
    question: 'What is Bell\'s phenomenon?',
    explanation: `**Bell's Phenomenon**
دي وسيلة حماية طبيعية في جسمنا.
* اللي بيحصل: لما المريض يحاول يقفل عينه (أو وهو نايم)، العين بتلف "لفوق" تلقائياً.
* الفائدة: الحركة دي بتحمي القرنية وتغطيها بالجفن العلوي حتى لو العين مش بتقفل بالكامل.

> **Clinical Tip**: لو المريض عنده **Lagophthalmos** وكمان **Bell's Phenomenon** بتاعته ضعيفة (عينه مش بتطلع لفوق)، القرنية هتتدمر بسرعة جداً.`,
    answer: {
      title: 'Bell\'s Phenomenon',
      content: [
        { text: 'A protective mechanism in which rolling up of the eye during sleep diminishes the effect of incomplete closure of the palpebral fissure.', type: 'main' }
      ]
    }
  },
  {
    id: '34',
    category: 'eyelid_lacrimal',
    question: 'Define Ptosis and its congenital causes.',
    explanation: `**Ptosis (سقوط الجفن)**
الجفن نازل عن مستواه الطبيعي ومغطي القرنية أكتر من اللازم.
* السبب الخلقي (Congenital): غالباً بيكون عيب في تكوين عضلة الـ **Levator** (Dystrophy) أو مشكلة في العصب المغذي ليها.
* علامات مرتبطة: ممكن تلاقي عضلة العين العلوي (**Superior rectus**) هي كمان ضعيفة.

> **Important**: لو الـ Ptosis شديد ومغطي العين تماماً في طفل صغير، لازم يتدخل جراحياً فوراً عشان ميحصلش **Amblyopia** (كسل في العين).

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Ptosis',
      content: [
        { text: 'Definition: Drooping of the upper eyelid.', type: 'main' },
        { text: 'Congenital Cause: Faulty development of the levator muscle or its nerve supply.', type: 'sub' },
        { text: 'Associated anomalies: Weak superior rectus muscle, Marcus Grunn phenomenon (Jaw-Winking).', type: 'example' }
      ]
    }
  },
  {
    id: '35',
    category: 'eyelid_lacrimal',
    question: 'List the types of acquired ptosis.',
    explanation: `**Types of Acquired Ptosis**
الواحد ممكن يجيله ترهل في الجفن في مراحل حياته المختلفة لأسباب متنوعة:
1. **Neurogenic**: شلل في العصب التالت أو متلازمة هورنر.
2. **Myogenic**: وهن العضلات (**Myasthenia gravis**) - مميز جداً إنه بيزيد بليل لما المريض يتعب.
3. **Aponeurotic**: وده أشهر نوع في كبار السن، العضلة بتفك من مكانها.
4. **Traumatic**: خبطة مباشرة في الجفن.
5. **Mechanical**: الجفن تقيل (ورم أو كيس دهني كبير) فبيقع لتحت.

> **Mnemonic**: N-A-M-T-M (Neuro, Aponeurotic, Myo, Traumatic, Mechanical).`,
    answer: {
      title: 'Acquired Ptosis Types',
      content: [
        { text: '1- Neurogenic: 3rd nerve paralysis or Horner syndrome.', type: 'main' },
        { text: '2- Myogenic: Myasthenia gravis (ptosis is periodic, worst in evening).', type: 'main' },
        { text: '3- Aponeurotic: Degenerative changes in levator aponeurosis.', type: 'main' },
        { text: '4- Traumatic: Direct trauma.', type: 'main' },
        { text: '5- Mechanical: Increased weight of lid (tumor, multiple chalazia).', type: 'main' }
      ]
    }
  },
  {
    id: '36',
    category: 'eyelid_lacrimal',
    question: 'How is ptosis severity graded?',
    explanation: `**Ptosis Grading**
بنشوف الجفن نازل قد إيه عن مستواه الطبيعي:
1. **Mild**: نازل 1-2 مم.
2. **Moderate**: نازل 3 مم.
3. **Severe**: نازل 4 مم أو أكتر.

> **Key**: في العادة الجفن بيغطي 1-2 مم من القرنية، فلو غطى 4 مم، يبقى هو كدة "نازل" 2 مم إضافي (Mild).`,
    answer: {
      title: 'Grading of Ptosis',
      content: [
        { text: 'Mild: drooping 1-2 mm.', type: 'main' },
        { text: 'Moderate: dropping 3 mm.', type: 'main' },
        { text: 'Severe: dropping > 4 mm.', type: 'main' }
      ]
    }
  },
  {
    id: '37',
    category: 'eyelid_lacrimal',
    question: 'What is the "Frontalis suspension" operations for ptosis?',
    explanation: `**Frontalis Suspension (الحبال)**
دي عملية بنعملها لما تكون عضلة الرفع (levator) ضعيفة جداً وميتة.
* الفكرة: بنربط الجفن بعضلة الجبهة (**Frontalis muscle**) بخيوط أو شرائح خاصة.
* النتيجة: المريض لما يحب يفتح عينه بيرفع حواجبه، فالجفن يترفع معاه.

> **Also known as**: **Hess operation** or **Sling operation**.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Frontalis Suspension',
      content: [
        { text: 'Also known as Hiss operation/sling operation.', type: 'main' },
        { text: 'Indicated when levator function is poor and ptosis is severe.', type: 'main' }
      ]
    }
  },
  {
    id: '38',
    category: 'eyelid_lacrimal',
    question: 'What does the lacrimal secretory system consist of?',
    explanation: `**Where do tears come from?**
جهاز إفراز الدموع بيتكون من مصدرين:
1. **Main lacrimal gland**: دي اللي بتفرز الدموع الغزيرة لما نعيط (Reflex tearing).
2. **Accessory glands**: دي غدد صغيرة كتيير (Krause, Wolfring, etc.) مسؤولة عن الترطيب الدائم للعين والدموع الأساسية (Basal tearing).

> **Note**: الـ Goblet cells في الملتحمة بتفرز المخاط (mucin) اللي بيخلي الدموع تمسك في العين.`,
    answer: {
      title: 'Lacrimal Secretory System',
      content: [
        { text: '1- The main lacrimal gland.', type: 'main' },
        { text: '2- The accessory lacrimal glands (Krause, Wolfring, Meibomian, Zeis, Goblet cells).', type: 'main' }
      ]
    }
  },
  {
    id: '39',
    category: 'eyelid_lacrimal',
    question: 'Explain the three layers of the precorneal tear film.',
    explanation: `**Tear Film Layers**
الدموع مش مياه بس، دي 3 طبقات فوق بعض:
1. **Outer lipid layer**: (من غدد ميبوميان) زيت عشان يمنع التبخر.
2. **Middle aqueous layer**: (من الغدد الدمعية) مياه ودي كمية الدموع الأكبر وفيها الأكسجين.
3. **Inner mucin layer**: (من خلايا Goblet) مخاط بيثبّت الدموع على القرنية.

> **Mnemonic**: L-A-M (Lipid - Aqueous - Mucin). بالترتيب من برا لجوا.`,
    answer: {
      title: 'Tear Film Layers',
      content: [
        { text: '1. Outer lipid layer: secreted by Meibomian glands. Prevents evaporation.', type: 'main' },
        { text: '2. Middle aqueous layer: secreted by lacrimal glands. Bulk of tears, supplies oxygen.', type: 'main' },
        { text: '3. Inner mucin layer: secreted by goblet cells. Makes cornea hydrophilic.', type: 'main' }
      ]
    }
  },
  {
    id: '40',
    category: 'eyelid_lacrimal',
    question: 'Describe components of the lacrimal drainage system.',
    explanation: `**Lacrimal Drainage (The Plumbing)**
صرف الدموع بيمشي كدة بالترتيب:
1. **Puncta**: الفتحتين اللي في طرف الجفون.
2. **Canaliculi**: القنوات الصغيرة اللي ماشية في الجفن.
3. **Lacrimal sac**: الكيس الدمعي (مخزن مؤقت).
4. **Nasolacrimal duct (NLD)**: القناة اللي بتنزل الدموع في الأنف (هي دي سبب رشح الأنف لما نعيط).

في آخر قناة الـ NLD فيه صمام اسمه **Hasner's valve** بيمنع رجوع الهوا من المناخير للعين.`,
    answer: {
      title: 'Lacrimal Drainage System',
      content: [
        { text: '2 puncta, 2 canaliculi, lacrimal sac, and nasolacrimal duct.', type: 'main' },
        { text: 'Nasolacrimal duct ends in inferior meatus, guarded by Hasner\'s valve.', type: 'example' }
      ]
    }
  },
  {
    id: '41',
    category: 'eyelid_lacrimal',
    question: 'What is the purpose of Hasner\'s valve?',
    explanation: `**Hasner's Valve**
عبارة عن وسيلة حماية في نهاية القناة الدمعية (NLD).
* الوظيفة: هو صمام "في اتجاه واحد" (One-way valve). بيسمح للدموع إنها تنزل من العين للمناخير، لكن بيمنع الهوا أو السوائل إنها تطلع من المناخير للعين لما تيجي تنف (blow your nose).

> **Hint**: لو الصمام ده مسدود في الأطفال حديثي الولادة، بيعمل **Congenital dacryocystitis**.`,
    answer: {
      title: 'Hasner\'s Valve',
      content: [
        { text: 'A one-way valve at the end of the nasolacrimal duct allowing tears down but not air up.', type: 'main' }
      ]
    }
  },
  {
    id: '42',
    category: 'eyelid_lacrimal',
    question: 'Differentiate between Lacrimation and Epiphora.',
    explanation: `**Lacrimation vs Epiphora**
الاتنين معناهم "دموع زيادة"، بس السبب مختلف تماماً:
1. **Lacrimation**: المشكلة في "الإنتاج" (Hypersecretion). الصرف شغال كويس بس الحنفية مفتوحة ع الآخر (زي العياط أو حاجة دخلت في العين).
2. **Epiphora**: المشكلة في "الصرف" (Obstructed drainage). الإنتاج طبيعي بس البلاعة مسدودة (زي انسداد القناة الدمعية).

> **Mnemonic**:
> **L**acrimation = **L**ots of tears produced.
> **E**piphora = **E**xit is blocked.`,
    answer: {
      title: 'Watering of the Eye',
      content: [
        { text: 'Lacrimation: Excessive secretion of tears; lacrimal passages are normal.', type: 'main' },
        { text: 'Epiphora: Obstruction of lacrimal passage; normal tear secretion.', type: 'main' }
      ]
    }
  },
  {
    id: '43',
    category: 'eyelid_lacrimal',
    question: 'What is the regurgitation test?',
    explanation: `**Regurgitation Test (اختبار الارتجاع)**
اختبار بسيط عشان نشوف فيه انسداد في مجرى الدموع ولا لأ.
* الطريقة: بنضغط بالأصبع على الكيس الدمعي (على عظمة الأنف بجانب العين).
* **Positive regurge (+)**: لو طلع صديد أو دموع من فتحة الـ punctum، ده معناه إن فيه انسداد ورا الكيس الدمعي.
* **Negative regurge (-)**: لو مطلعش حاجة، ده معناه إن الممر بنسبة كبيرة سالك أو الانسداد في مكان تاني.`,
    answer: {
      title: 'Regurgitation Test',
      content: [
        { text: 'Press on the lacrimal sac against lacrimal bone.', type: 'main' },
        { text: '+Ve regurge: reflux of pus or tears (proof of obstruction).', type: 'main' },
        { text: '-Ve regurge: no reflux (passages likely patent).', type: 'main' }
      ]
    }
  },
  {
    id: '44',
    category: 'eyelid_lacrimal',
    question: 'Define Acute Dacryocystitis and its complications.',
    explanation: `**Acute Dacryocystitis (التهاب الكيس الدمعي الحاد)**
التهاب صديدي مفاجئ وشديد في الكيس الدمعي.
* الأعراض: وجع شديد جداً، احمرار، وتورم عند زاوية العين الداخلية.
* المضاعفات:
  1. **Lacrimal fistula**: ناصور دمعي (فتحة بتخرج دمع لبرا على الجلد).
  2. **Pyocele**: تجمع صديدي كبير.
  3. **Orbital cellulitis**: التهاب خلوي في الأوربت (خطير).
  4. جلطة في جيوب المخ (Cavernous sinus thrombosis).`,
    answer: {
      title: 'Acute Dacryocystitis',
      content: [
        { text: 'Definition: Acute suppurative inflammation of the lacrimal sac.', type: 'main' },
        { text: 'Complications: Lacrimal fistula, Pyocele, Orbital cellulitis, Cavernous sinus thrombosis.', type: 'main' }
      ]
    }
  },
  {
    id: '45',
    category: 'eyelid_lacrimal',
    question: 'What is Dry Eye and some of its common symptoms?',
    explanation: `**Dry Eye (جفاف العين)**
نقص في كمية أو جودة الدموع اللي بترطب العين.
* الأعراض: إحساس بحرقان (burning)، شكشكة، إحساس بوجود رمل في العين.
* ديماً المريض بيشتكي إن الأعراض دي بتزيد أول ما يصحى من النوم (on waking up) أو وهو بيقرأ أو بيستخدم الموبايل كتير.`,
    answer: {
      title: 'Dry Eye',
      content: [
        { text: 'Definition: Partial or absolute deficiency in aqueous tear production.', type: 'main' },
        { text: 'Symptoms: Irritation, FB sensation, and burning sensation (on waking up).', type: 'main' }
      ]
    }
  },
  {
    id: '46',
    category: 'eyelid_lacrimal',
    question: 'List common clinical diagnostic tests for Dry Eye.',
    explanation: `**Dry Eye Tests**
إزاي نشخص جفاف العين في العيادة؟
1. **Schirmer's test**: بنحط شريط ورق صغير في العين ونشوف تبلل قد إيه (بيحسب الكمية).
2. **BUT (Break-up time)**: بنشوف الدموع بتاخد وقت قد إيه عشان "تتقطع" على القرنية (بيحسب الجودة والثبات).
3. **Rose Bengal staining**: صبغة بتبين الخلايا الميتة أو اللي حصلها جفاف في الملتحمة والقرنية.`,
    answer: {
      title: 'Dry Eye Diagnosis',
      content: [
        { text: '1. Schirmer\'s test.', type: 'main' },
        { text: '2. Tear film break-up time (BUT).', type: 'main' },
        { text: '3. Rose Bengal staining.', type: 'main' }
      ]
    }
  },
  {
    id: '47',
    category: 'eyelid_lacrimal',
    question: 'What are the main causes of Lacrimation?',
    explanation: `**Why do we have excessive tears (Lacrimation)?**
السبب هو إفراز زيادة، وده بيحصل لعدة أسباب:
1. **نفسية**: العياط العادي.
2. **ردود فعل (Reflexes)**:
   * ضوء جامد.
   * حاجة دخلت في العين (جسم غريب في القرنية أو الملتحمة).
   * التهاب في العين.
3. **أسباب تانية**: زي التثاؤب (yawning) أو الترجيع (vomiting).`,
    answer: {
      title: 'Causes of Lacrimation',
      content: [
        { text: 'Psychic and emotional conditions as weeping.', type: 'main' },
        { text: 'Synkiness with the 9th and 10th cranial nerves as: yawning, vomiting.', type: 'main' },
        { text: 'Reflexes:', type: 'sub' },
        { text: '- Bright light (afferent optic nerve).', type: 'example' },
        { text: '- Irritation of trigeminal nerve endings e.g. FB in the conjunctiva or cornea.', type: 'example' }
      ]
    }
  },
  {
    id: '48',
    category: 'eyelid_lacrimal',
    question: 'Describe investigation steps for a case of epiphora.',
    explanation: `**Epiphora Investigation**
لو جالك مريض عينه بتدمع، بتمشي بالخطوات دي:
1. **التاريخ المرضي**: تفرّق هل هو lacrimation ولا epiphora؟ (عين واحدة ولا اتنين؟).
2. **الفحص**:
   * الجفون: فيه شعرة بتحك أو الجفن مقلوب؟
   * الكيس الدمعي: فيه ورم؟
   * الأنف: فيه أي لحميات أو مشاكل قافلة المجرى؟
3. **الاختبارات**:
   * Regurgitation test.
   * غسيل للقناة الدمعية (Syringing).
   * أشعة (Dacryocystography).`,
    answer: {
      title: 'Epiphora Investigation',
      content: [
        { text: 'History: Exclude lacrimation (Bilateral vs Unilateral).', type: 'main' },
        { text: 'Examination: Eyelids (ectropion/trichiasis), Lacrimal sac (swelling), Nose (polypi).', type: 'main' },
        { text: 'Tests:', type: 'sub' },
        { text: '- Regurgitation test.', type: 'example' },
        { text: '- Dacryocystography / CT scan.', type: 'example' },
        { text: '- E.N.T. examination.', type: 'example' }
      ]
    }
  },
  {
    id: '49',
    category: 'eyelid_lacrimal',
    question: 'What is the treatment for congenital dacryocystitis (stepwise approach)?',
    explanation: `**Congenital Dacryocystitis Treatment**
لو طفل مولود وقناته الدمعية مسدودة، بنمشي معاه بالترتيب:
1. **في أول سنة**: بنكتفي بقطرات مضاد حيوي ومساج بطريقة معينة (Digital massage) عشان المجرى يفتح لوحده.
2. **بعد سنة**: لو لسة مسدودة، بنعمل عملية "تسليك" (Probing).
3. **لو فشلت**: بنركب أنبوبة (Silastic intubation).
4. **كحل أخير**: عملية توصيل الكيس الدمعي بالأنف (DCR).

> **Note**: المساج في أول سنة بيجيب نتيجة في أغلب الحالات، متستعجلش ع العملية.`,
    answer: {
      title: 'Congenital Dacryocystitis Treatment',
      content: [
        { text: '1- Medical treatment (first 9-12 months): topical antibiotics and digital massage.', type: 'main' },
        { text: '2- Probing: indicated if no improvement after age of one year.', type: 'main' },
        { text: '3- Silastic intubation: if probing fails.', type: 'main' },
        { text: '4- Dacryosyctorhinostomy: if intubation fails.', type: 'main' }
      ]
    }
  },
  // NEW CATEGORY: Cornea and Sclera
  {
    id: '50',
    category: 'cornea_sclera',
    question: 'What is the macro-anatomy of the cornea?',
    explanation: `**Cornea Macro-anatomy**
القرنية هي الطبقة الخارجية الشفافة للعين.
بتمثل أكتر من 70% من قوة تركيز الضوء في العين.
* القطر العرضي (Horizontal): 11-12 مم.
* القطر الطولي (Vertical): 10-11 مم.
يعني هي مش دايرة كاملة، هي بيضاوية شوية (Oval).`,
    answer: {
      title: 'Macro-anatomy of the Cornea',
      content: [
        { text: 'It is the outer coat of the globe.', type: 'main' },
        { text: 'It is a transparent, avascular structure.', type: 'main' },
        { text: 'Dimensions: Horizontal diameter is 11-12 mm.', type: 'sub' }
      ]
    }
  },
  {
    id: '51',
    category: 'cornea_sclera',
    question: 'List the 5 layers of the cornea in order from outside inwards.',
    explanation: `**Corneal Layers**
القرنية بتتكون من 5 طبقات مرتبين من برا لجوا:
1. **Epithelium**: الطبقة المتجددة.
2. **Bowman's membrane**: الغشاء اللي مش بيتجدد.
3. **Stroma**: الطبقة الأسمك (90%).
4. **Descemet's membrane**: الغشاء القوي والمقاوم.
5. **Endothelium**: مضخة المياه.

> **Mnemonic**:
> **E**very **B**ody **S**ays **D**o **E**xams.
> (Epithelium, Bowman, Stroma, Descemet, Endothelium).`,
    answer: {
      title: 'Micro-anatomy (Layers)',
      content: [
        { text: '1. Epithelium', type: 'main' },
        { text: '2. Bowman membrane', type: 'main' },
        { text: '3. Substantia propria (Stroma)', type: 'main' },
        { text: '4. Descemet\'s membrane', type: 'main' },
        { text: '5. Endothelium', type: 'main' }
      ]
    }
  },
  {
    id: '52',
    category: 'cornea_sclera',
    question: 'Describe the corneal epithelium.',
    explanation: `**Corneal Epithelium**
دي الطبقة السطحية اللي بنلمسها.
* نوعها: Non-keratinized stratified squamous.
* ميزتها: بتجدد نفسها بسرعة جداً (في ظرف 24-48 ساعة لو فيه خدش بسيط).
* قوتها: بتديك حوالي 42 ديوبتر من قوة العين الانكسارية.

> **Refractive index**: 1.37. رقم مهم في الحسابات.`,
    answer: {
      title: 'Corneal Epithelium',
      content: [
        { text: 'It is non-keratinized stratified squamous epithelium.', type: 'main' },
        { text: 'Optical function: Contributes to 42 diopters of refractive power.', type: 'sub' },
        { text: 'Refractive index: 1.37.', type: 'sub' }
      ]
    }
  },
  {
    id: '53',
    category: 'cornea_sclera',
    question: 'What are the characteristics of the Bowman membrane?',
    explanation: `**Bowman Membrane**
طبقة رقيقة تحت الـ Epithelium.
* أهم معلومة: **It does not regenerate**. لو باظت أو اتجرحت بتسيب عتامة (Opacity) أو ندبة.
* وظيفتها: بتعمل حاجز حماية (barrier) للطبقات اللي تحتها.`,
    answer: {
      title: 'Bowman Membrane',
      content: [
        { text: 'It is an elastic layer with low resistance.', type: 'main' },
        { text: 'Regeneration: When injured, it doesn\'t regenerate (heals by opacity).', type: 'main' }
      ]
    }
  },
  {
    id: '54',
    category: 'cornea_sclera',
    question: 'Describe the corneal stroma (Substantia propria).',
    explanation: `**Corneal Stroma**
دي "قلب" القرنية.
* سمكها: بتمثل **90%** من سمك القرنية كله.
* تركيبها: collagen fibers مترتبة بنظام دقيق جداً (Lattice arrangement) وده سر شفافيتها.
* لو حصل فيها أي التهاب أو خبطة، الترتيب ده بيبوظ وبتحصل عتامة.`,
    answer: {
      title: 'Corneal Stroma',
      content: [
        { text: 'Represents 90% of the corneal thickness.', type: 'main' },
        { text: 'Structure: Formed of collagen fibers embedded in mucopolysaccharides.', type: 'main' }
      ]
    }
  },
  {
    id: '55',
    category: 'cornea_sclera',
    question: 'What are the characteristics of Descemet\'s membrane?',
    explanation: `**Descemet's Membrane**
غشاء رقيق بس "جبار".
* ميزته: **Very resistant** (قوي جداً ومقاوم للميكروبات والسموم).
* التجديد: **Regenerates** (بيطّلع من الـ Endothelium).
* في حالات القرح العميقة، ممكن هو الوحيد اللي يفضل صامد ويعمل بلونة لبره بنسميها **Descemetocele**.`,
    answer: {
      title: 'Descemet\'s Membrane',
      content: [
        { text: 'It is a strong layer with high resistance.', type: 'main' },
        { text: 'Regeneration: When injured, it can regenerate.', type: 'main' }
      ]
    }
  },
  {
    id: '56',
    category: 'cornea_sclera',
    question: 'What is the function of the corneal endothelium?',
    explanation: `**Corneal Endothelium**
دي الطبقة الداخلية الأهم للحفاظ على الشفافية.
* وظيفتها: بتعمل كـ **Pump** (مضخة) بتشد المياه الزيادة من القرنية وتخرجها برا.
* لو الخلايا دي ماتت أو عددها قل، القرنية بتشرب مياه وتورم (**Edema**) وتبقى بيضاء ومش شفافة.
* الخلايا دي مش بتنقسم (Not regenerate)، يعني اللي بيموت مبيصلحش.`,
    answer: {
      title: 'Corneal Endothelium',
      content: [
        { text: 'A single layer of cells responsible for keeping the cornea dehydrated.', type: 'main' },
        { text: 'It is continuous with the trabecular meshwork at the angle.', type: 'sub' }
      ]
    }
  },
  {
    id: '57',
    category: 'cornea_sclera',
    question: 'Describe the blood and nerve supply of the cornea.',
    explanation: `**Nerve & Blood Supply**
القرنية "يتيمة" بس "حساسة":
* **Blood**: مش بيوصلها دم خالص (**Avascular**)، وعشان كدة القرنية شفافة. بتاخد غذاها من الدموع والخزانة الأمامية.
* **Nerves**: هي **أكتر حتة حساسة في جسم الإنسان**! بتتغذى بالعصب الخامس (**Trigeminal nerve**).
* عشان كدة أي رملة صغيرة في العين بتخلي الواحد مش طايق نفسه من الوجع.`,
    answer: {
      title: 'Blood & Nerve Supply',
      content: [
        { text: 'Blood: Avascular except for the peripheral 1 mm (limbal plexus).', type: 'main' },
        { text: 'Nerve: Supplied by the 2 long ciliary nerves (Ophthalmic branch of Trigeminal).', type: 'main' },
        { text: 'It is the most sensitive tissue in the body.', type: 'example' }
      ]
    }
  },
  {
    id: '58',
    category: 'cornea_sclera',
    question: 'What histological changes occur at the limbus?',
    explanation: `**The Limbus**
هو منطقة الانتقال (Transition zone) بين القرنية الشفافة والصلبة (Sclera) البيضاء.
بيحصل فيه 4 تغيرات أساسية:
1. الـ Epithelium بتاع القرنية بيكمل كـ Conjunctiva.
2. الـ Bowman's membrane بيخلص.
3. الـ Stroma بتتحول لـ Sclera.
4. الـ Descemet's membrane بيتحول لـ Trabecular meshwork (مصفاة تصريف العين).`,
    answer: {
      title: 'The Limbus',
      content: [
        { text: '1. Corneal epithelium becomes conjunctival epithelium.', type: 'main' },
        { text: '2. Bowman\'s membrane ends.', type: 'main' },
        { text: '3. Stroma becomes continuous with sclera.', type: 'main' },
        { text: '4. Descemet\'s membrane becomes trabecular meshwork.', type: 'main' }
      ]
    }
  },
  {
    id: '59',
    category: 'cornea_sclera',
    question: 'How does the cornea receive its nutrition?',
    explanation: `**Corneal Nutrition**
بما إنها avascular، بتاخد أكلها منين؟
1. **Aqueous humor**: المصدر الأساسي للجلوكوز (الأكل).
2. **Tear film**: المصدر الأساسي للأكسجين (التنفس).
3. **Limbal capillaries**: بتغذي الأطراف بس.
* عشان كدة لما بنلبس عدسات لاصقة فترة طويلة بنقلل الأكسجين اللي واصل للقرنية وممكن تتعب.`,
    answer: {
      title: 'Nutrition of the Cornea',
      content: [
        { text: '1. Limbal capillaries.', type: 'main' },
        { text: '2. Aqueous humor (main supply of glucose).', type: 'main' },
        { text: '3. Tears (main supply of O2 and NaCl).', type: 'main' }
      ]
    }
  },
  {
    id: '60',
    category: 'cornea_sclera',
    question: 'What anatomical factors contribute to corneal transparency?',
    explanation: `**Why is the Cornea Transparent?**
ليها أسباب تشريحية وفيزيائية:
1. **Anatomical**: معندهاش أوعية دموية ولا أعصاب مغلّفة (no myelin). والخلايا مترتبة بدقة.
2. **Physiological**: حالة الجفاف النسبي (**Dehydration**) اللي بيحافظ عليها الـ Endothelium.
3. التساوي في معامل الانكسار بين كل الطبقات.`,
    answer: {
      title: 'Causes of Transparency',
      content: [
        { text: '1. Non-keratinized, uniform epithelium.', type: 'main' },
        { text: '2. Uniform refractive index of all layers.', type: 'main' },
        { text: '3. Non-myelinated nerve fibers.', type: 'main' },
        { text: '4. Dehydrated state (maintained by endothelium).', type: 'main' }
      ]
    }
  },
  {
    id: '61',
    category: 'cornea_sclera',
    question: 'Define Hypopyon ulcer (Acute serpiginous ulcer).',
    explanation: `**Hypopyon Ulcer**
هي قرحة قرنية حادة وخطيرة، بتتميز بوجود "Hypopyon" وهو صديد معقم (sterile pus) في الخزانة الأمامية للعين (Anterior Chamber).
كلمة "serpiginous" جاية من شكلها لأنها بتمشي وتزحف في القرنية زي التعبان.

### Key Points
1. **Primary Infective**: القرحة نفسها هي المصدر.
2. **Pneumococcus**: هو الميكروب الأشهر اللي بيسببها (80% من الحالات).
3. **Sterile Pus**: الصديد اللي في الخزانة الأمامية مش فيه ميكروبات، هو مجرد رد فعل (toxic reaction) من القزحية والجسم الهدبي.

مهم تعرف إن العيان بيشتكي من وجع جامد وزغللة، وبنشوف الـ hypopyon واضح جداً بالعين المجردة في الحالات المتقدمة.`,
    answer: {
      title: 'Hypopyon Ulcer',
      content: [
        { text: 'Definition: Primary infective corneal ulcer with severe toxic iridocyclitis and sterile pus (hypopyon).', type: 'main' },
        { text: 'Causative organism: Pneumococcus is the commonest (80%).', type: 'sub' }
      ]
    }
  },
  {
    id: '62',
    category: 'cornea_sclera',
    question: 'What are the characteristic clinical signs of a typical hypopyon ulcer?',
    explanation: `**Hypopyon Ulcer Signs**
شكل القرحة دي مميز جداً:
* القرحة بتكون شبه القرص (Disc-shaped).
* بتزحف في اتجاه واحد فبتعمل حرف شبه الهلال (Crescentic edge).
* الخزانة الأمامية فيها **Hypopyon** (خط أبيض تحت) ده صديد ميت.
* المريض بيعاني من وجع شديد واحمرار وضيق في الحدقة.`,
    answer: {
      title: 'Hypopyon Ulcer Signs',
      content: [
        { text: '1. Disc-shaped paracentral ulcer with an advancing crescentic edge.', type: 'main' },
        { text: '2. Positive fluorescein test (green stain).', type: 'main' },
        { text: '3. Hypopyon: Yellowish fluid settling at the bottom of the AC.', type: 'main' },
        { text: 'Hypopyon is sterile pus formed from PMNL and fibrin.', type: 'note' }
      ]
    }
  },
  {
    id: '63',
    category: 'cornea_sclera',
    question: 'List the common complications of a corneal ulcer.',
    explanation: `**Keratitis Complications**
لو مالحقناش القرحة، الدنيا بتبوظ:
1. **Desmetocele**: لما القرنية تتآكل وميفضلش غير غشاء ديسمت هو اللي سادد العين.
2. **Glaucoma**: جلوكوما ثانوية بسبب الالتهاب.
3. **Perforation**: القرنية تتخرم والسوايل تخرج.
4. **Opacities**: حتى لو خفت بتسيب عتامة (سحابة).`,
    answer: {
      title: 'Complications of Keratitis',
      content: [
        { text: '1. Secondary iridocyclitis & Secondary glaucoma.', type: 'main' },
        { text: '2. Descemetocele (bulging of Descemet\'s membrane).', type: 'main' },
        { text: '3. Corneal opacities (Nebula, Macula, Leucoma).', type: 'main' },
        { text: '4. Perforation of the ulcer.', type: 'main' }
      ]
    }
  },
  {
    id: '64',
    category: 'cornea_sclera',
    question: 'What are the possible sequelae of corneal perforation?',
    explanation: `**Corneal Perforation**
لما العين "تتخرم" دي حالة طوارئ:
* القزحية (Iris) ممكن تطلع بره الخرم ده (**Iris prolapse**).
* العدسة ممكن تتحرك من مكانها.
* ممكن يحصل نزيف أو تلوث شديد يؤدي لفقدان العين بالكامل (**Endophthalmitis**).

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Sequelae of Perforation',
      content: [
        { text: 'Iris prolapse and Anterior synechia.', type: 'main' },
        { text: 'Leucoma adherent (dense scar with iris adhesion).', type: 'main' },
        { text: 'Corneal fistula (failure of healing due to epithelium growth).', type: 'main' },
        { text: 'Endophthalmitis (severe internal infection).', type: 'main' }
      ]
    }
  },
  {
    id: '65',
    category: 'cornea_sclera',
    question: 'Differentiate between Nebula, Macula, and Leucoma.',
    explanation: `**Types of Scars**
 العتامة درجات حسب قوتها:
1. **Nebula**: "سحابة" خفيفة جداً، المريض بس بيحس بزغللة.
2. **Macula**: "بقعة" متوسطة الوضوح.
3. **Leucoma**: "عتامة بيضاء" تقيلة جداً وسادة النظر تماماً.

> **Mnemonic**: مرتبين حسب الترتيب الأبجدي من الأخف للأتقل: **N**ebula -> **M**acula -> **L**eucoma.`,
    answer: {
      title: 'Types of Corneal Scars',
      content: [
        { text: 'Nebula (cloud): Faint scar following superficial ulcers.', type: 'main' },
        { text: 'Macula (spot): Localized scar with intermediate density.', type: 'main' },
        { text: 'Leucoma (white): Dense white scar following deep ulcers.', type: 'main' }
      ]
    }
  },
  {
    id: '66',
    category: 'cornea_sclera',
    question: 'What is the general treatment strategy for an uncomplicated corneal ulcer?',
    explanation: `**Keratitis Treatment**
خطتنا العلاجية للهجوم على القرحة:
1. **Antibiotics**: قطرات مكثفة كل ساعة.
2. **Atropine**: "راحة" للعين، بيوسع الحدقة عشان يمنع الالتصاقات ويريح الوجع.
3. **Bandage**: بنغطي العين عشان الجفن ميفضلش يحك في القرحة.
4. **Hot compresses**: كمادات مياه دافئة عشان تزود الدم الواصل للأطراف وتساعد في الدفاع والتعافي.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Treatment of Keratitis',
      content: [
        { text: '1. Topical Antibiotics (Dual therapy or Monotherapy).', type: 'main' },
        { text: '2. Atropine 1%: Relieves pain and prevents synechia.', type: 'main' },
        { text: '3. Bandage: Stops eyelid movement and mechanical irritation.', type: 'main' },
        { text: '4. Hot fomentation: Improves circulation and reduces toxins.', type: 'main' }
      ]
    }
  },
  {
    id: '67',
    category: 'cornea_sclera',
    question: 'Describe the Dendritic ulcer associated with Herpes Simplex.',
    explanation: `**Dendritic Ulcer (Herpes)**
أشهر قرحة فيروسية وشببه "فروع الشجر":
* الشكل: قرحة متفرعة (linear and branched) في أخر كل فرع فيه "عقدة" (knobs).
* العلامة الذهبية: **Loss of corneal sensation**. العين بتبقى "مبنجة" طبيعياً فالمريض مش حاسس بوجع يتناسب مع حجم القرحة.
* **ممنوع** استخدام الكورتيزون هنا لأنه بيزود الفيروس ويخرم العين.`,
    answer: {
      title: 'Dendritic Ulcer',
      content: [
        { text: 'Shape: Linear, superficial, with side branches ending in knobs.', type: 'main' },
        { text: 'Key signs: Corneal hypothesia (reduced sensation) and positive fluorescein.', type: 'main' },
        { text: 'Treatment: Acyclovir (Zovirax) ointment/drops.', type: 'sub' }
      ]
    }
  },
  {
    id: '68',
    category: 'cornea_sclera',
    question: 'What are the ocular manifestations of Herpes Zoster Ophthalmicus (HZO)?',
    explanation: `**Herpes Zoster Ophthalmicus**
ده فيروس بيجي في مسار عصب معين (Trigeminal).
* العلامة المميزة: طفح جلدي (vesicles) واخد نص الوش بالظبط (Unilateral).
* **Hutchinson sign**: لو شفت حبوب على حرف المناخير، ده معناه إن العين بنسبة 100% مصابة وفيه التهاب جواها.
* بيعمل وجع عصبي شديد وممكن يسبب شلل في عضلات العين.`,
    answer: {
      title: 'Herpes Zoster Ophthalmicus',
      content: [
        { text: 'Affection of the ophthalmic division of the Trigeminal nerve.', type: 'main' },
        { text: 'Signs: Grouped unilateral vesicles following the nerve distribution.', type: 'main' },
        { text: 'Hutchinson sign: Vesicles on the tip of the nose (nasociliary involvement).', type: 'example' },
        { text: 'Can cause corneal ulcers, iridocyclitis, and nerve palsies.', type: 'sub' }
      ]
    }
  },
  {
    id: '69',
    category: 'cornea_sclera',
    question: 'How do fungal ulcers present and what is a common risk factor?',
    explanation: `**Fungal Keratitis**
قرحة الفطريات بتيجي ديماً بعد "خبطة بحاجة نباتية" (غصن شجرة، قشة، الخ).
* شكلها: بقعة بيضاء "ناشفة" وليها أطراف شبه الريش (Feathery margins).
* ممكن تلاقي حواليها "جزر صغيرة" (Satellite lesions).
* علاجها بيحتاج قطرات مضادة للفطريات فترة طويلة.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Fungal Keratitis',
      content: [
        { text: 'Types: Yeast (Candida) or Filamentous (Fusarium, Aspergillus).', type: 'sub' },
        { text: 'Risk factor: Trauma with vegetable matter/plants.', type: 'main' },
        { text: 'Signs: Greyish white infiltrate with feathery margins and satellite lesions.', type: 'main' }
      ]
    }
  },
  {
    id: '70',
    category: 'cornea_sclera',
    question: 'Define Neurotrophic keratitis.',
    explanation: `**Neurotrophic Keratitis**
دي قرحة "اللامبالاة":
* سببها: العصب الخامس بايظ، فالقرنية مش حاسة بأي وجع.
* طالما القرنية مش حاسة، الـ Epithelium مش بيعرف يجدد نفسه فبتقع وتعمل قرحة.
* المريض بيبقى عينه مدمرة بس بيقولك "أنا مش حاسس بوجع خالص يا دكتور".

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Neurotrophic Keratitis',
      content: [
        { text: 'Definition: Inflammation due to absence of corneal sensation (5th nerve palsy).', type: 'main' },
        { text: 'Hallmark: Central disc-shaped ulcer with NO pain.', type: 'main' },
        { text: 'Treatment: Intensive lubrication, bandage, or tarsorrhaphy.', type: 'sub' }
      ]
    }
  },
  {
    id: '71',
    category: 'cornea_sclera',
    question: 'Describe the clinical picture of a lagophthalmos ulcer.',
    explanation: `**Exposure Keratitis**
بتحصل لما العين متقفلش كويس (**Lagophthalmos**).
* القرنية بتنشف من الهواء وتتشقق وتلتهب.
* ديماً القرحة دي بتكون في الجزء السفلي من القرنية لأنه هو اللي بيفضل مكشوف.
* الحل: ترطيب مكثف أو نقفل الجفون بـ "غرزة" (Tarsorrhaphy) مؤقتاً.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Ulcer with Lagophthalmos',
      content: [
        { text: 'Definition: Exposure keratitis due to incomplete lid closure.', type: 'main' },
        { text: 'Location: Usually involves the lower 1/3 of the cornea.', type: 'main' },
        { text: 'Treatment: Lubricants, bandage, and treating the cause of lagophthalmos.', type: 'sub' }
      ]
    }
  },
  {
    id: '72',
    category: 'cornea_sclera',
    question: 'What is Keratoconus and its common clinical signs?',
    explanation: `**Keratoconus (القرنية المخروطية)**
ضعف في أنسجة القرنية بيخليها تبرز لقدام وتعمل شكل "مخروط" (Cone).
* بيعمل استجماتيزم وضعف نظر شديد مش بيتصلح بالنظارة.
* **Munson sign**: لما المريض يبص لتحت، الجفن السفلي بـ "يتحشر" على القرنية المخلوطية ويبان شكل الـ V.
* العلاج: تثبيت قرنية (Cross-linking) أو عدسات صلبة.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Keratoconus (Conical Cornea)',
      content: [
        { text: 'Definition: Developmental weakness causing the cornea to bulge as a cone.', type: 'main' },
        { text: 'Munson\'s sign: Bulging of the lower lid on down gaze.', type: 'example' },
        { text: 'Fleischer\'s ring: Iron deposition at the base of the cone.', type: 'example' },
        { text: 'Treatment: Rigid contact lenses, CXL (cross-linking), or keratoplasty.', type: 'sub' }
      ]
    }
  },
  {
    id: '73',
    category: 'cornea_sclera',
    question: 'What are the main types and indications for Keratoplasty (Corneal Graft)?',
    explanation: `**Keratoplasty (ترقيع القرنية)**
عملية استبدال القرنية البايظة بقرنية من متبرع.
* **Penetrating (PKP)**: بنغير كل الطبقات (كل السمك).
* **Lamellar**: بنغير طبقات معينة بس (وده أأمن بكتير).
* بنعملها عشان نحسن النظر (Vision) أو عشان نعالج قرحة مش راضية تخف (Therapeutic).`,
    answer: {
      title: 'Keratoplasty',
      content: [
        { text: 'Types: 1. Lamellar (partial thickness), 2. Penetrating (full thickness).', type: 'sub' },
        { text: 'Optical indication: To improve vision (e.g. Keratoconus, scars).', type: 'main' },
        { text: 'Therapeutic: Resistant ulcers or fistula.', type: 'main' },
        { text: 'Structural (Tectonic): Restore continuity.', type: 'main' }
      ]
    }
  },
  {
    id: '74',
    category: 'cornea_sclera',
    question: 'Differentiate between PRK and LASIK refractive surgeries.',
    explanation: `**PRK vs LASIK**
 عمليات تصحيح النظر بالليزر:
1. **PRK**: بنشيل الـ Epithelium خالص ونضرب الليزر على السطح. المريض بيتعب شوية أول يومين لحد ما الطبقة تنمو تاني.
2. **LASIK**: بنعمل "رف" (Flap) من القرنية، نرفعها ونضرب الليزر تحتها وبعدين نرجعها. النظر بيتحسن في نفس اللحظة والوجع أقل بكتير.
* كقاعدة: الـ PRK أأمن للقرنيات الضعيفة، والليزك أريح وأسرع للعيان.`,
    answer: {
      title: 'Keratorefractive Surgery',
      content: [
        { text: 'PRK: Laser removal of tissue from the anterior stroma (surface ablation).', type: 'main' },
        { text: 'LASIK: Laser removal of deep stroma after creating a superficial flap.', type: 'main' }
      ]
    }
  },
  // NEW CATEGORY: The Lens
  {
    id: '75',
    category: 'lens',
    question: 'Describe the surfaces and pertemuan (equator) of the lens.',
    explanation: `**Lens Surfaces**
العدسة ليها سطحين:
* **Anterior surface**: السطح اللي قدام بكون "مفلطح" شوية (less convex).
* **Posterior surface**: السطح اللي ورا بكون "محدب" أكتر (more convex).
* **Equator**: هو الخط الوهمي اللي بيتقابل عنده السطحين.`,
    answer: {
      title: 'Applied Anatomy of the Lens',
      content: [
        { text: 'The lens has two surfaces: the anterior surface is less convex than the posterior.', type: 'main' },
        { text: 'These two surfaces meet at the equator.', type: 'main' }
      ]
    }
  },
  {
    id: '76',
    category: 'lens',
    question: 'What factors maintain lens clarity and transparency?',
    explanation: `**Lens Transparency**
إزاي العدسة بتفضل شفافة؟
1. معندهاش أوعية دموية (**Avascular**).
2. الخلايا والبروتينات مترتبة بنظام كيميائي دقيق.
3. الغلاف بتاعها (Capsule) بيسمح بمرور حاجات معينة بس.
4. ليها "مضخة" بتطرد المياه الزيادة عشان تفضل ناشفة شوية (**Dehydrated**).`,
    answer: {
      title: 'Lens Transparency',
      content: [
        { text: 'Avascularity.', type: 'main' },
        { text: 'Tightly packed nature of lens cells.', type: 'main' },
        { text: 'The arrangement of lens proteins.', type: 'main' },
        { text: 'Semipermeable character of lens capsule.', type: 'main' },
        { text: 'Pump mechanism of lens fibers’ membranes that regulate electrolyte and water balance (maintaining relative dehydration).', type: 'main' }
      ]
    }
  },
  {
    id: '77',
    category: 'lens',
    question: 'How does the lens power change during accommodation?',
    explanation: `**Accommodation (التكيف)**
دي العملية اللي بتخلينا نشوف الحاجات القريبة بوضوح.
* اللي بيحصل: عضلة العين (Ciliary muscle) بتنقبض، فتقوم العدسة "تكوّر" أكتر وتزود قوتها.
* التغير الكبير بيحصل في السطح الأمامي (**Anterior surface**)، بيبقى محدب أكتر.`,
    answer: {
      title: 'Accommodation',
      content: [
        { text: 'The power of the lens increases due to increased curvature of its surfaces.', type: 'main' },
        { text: 'The curvature of the posterior surface remains almost the same, but the anterior surface becomes more convex.', type: 'main' }
      ]
    }
  },
  {
    id: '78',
    category: 'lens',
    question: 'Define Congenital Cataract and its main causes.',
    explanation: `**Congenital Cataract**
هو عتامة في عدسة العين أو الكابسول بتاعها موجودة منذ الولادة أو تظهر بعد الولادة بفترة قصيرة.
يعني الطفل يتولد والـ lens مش شفافة بالكامل، وده ممكن يأثر على الإبصار وتطور النظر الطبيعي.

### Main Causes of Congenital Cataract

1. **Hereditary causes (genetic)**
   * أسباب وراثية وجينية، ودي من أشهر الأسباب.

2. **Maternal causes during pregnancy**
   * سوء تغذية الأم أثناء الحمل:
     * نقص Vitamin D
     * نقص Calcium
     * نقص البروتينات
   * إصابات وعدوى أثناء الحمل خصوصًا في **first trimester**.

3. **Metabolic disorders**
   * زي:
     * **Galactosemia**
     * **Hypoglycemia**

4. **Systemic syndromes**
   * ضمن متلازمات عامة في الجسم مثل:
     * **Lowe syndrome**

5. **Fetal hypoxia**
   * نقص الأكسجين للجنين، مثل حالات:
     * placental hemorrhage (نزيف بالمشيمة)

في الامتحانات ساعات يحبوا يسألوا:
> “Congenital cataract may be hereditary, metabolic, infective, or associated with systemic syndromes.”
فرتبهم في دماغك بالشكل ده عشان الحفظ يبقى أسهل.`,
    answer: {
      title: 'Congenital & Developmental Cataract',
      content: [
        { text: 'Definition: Opacity of the lens or its capsule dating since birth or soon after.', type: 'main' },
        { text: 'Hereditary (genetically determined).', type: 'sub' },
        { text: 'Maternal malnutrition (vit. D, Ca, proteins) or infection (especially 1st trimester).', type: 'sub' },
        { text: 'Metabolic: Galactosemia, hypoglycemia.', type: 'sub' },
        { text: 'Systemic syndromes: e.g., Lowe syndrome.', type: 'sub' },
        { text: 'Fetal hypoxia: e.g., placental hemorrhage.', type: 'sub' }
      ]
    }
  },
  {
    id: '79',
    category: 'lens',
    question: 'What are the general features of congenital cataract?',
    explanation: `**Congenital Cataract Features**
صفات المياه البيضاء الخلقية:
1. ديماً بتيجي في **العينين الاتنين** (Bilateral).
2. وغالباً مش بتزيد مع الوقت (**Stationary**).
3. العدسة بتبقى "طريّة" (**Soft cataract**) لأن لسة مفيهاش نواة ناشفة.`,
    answer: {
      title: 'General Features',
      content: [
        { text: 'Usually bilateral.', type: 'main' },
        { text: 'Usually partial.', type: 'main' },
        { text: 'Stationary (rarely progresses to total, e.g., rubella).', type: 'main' },
        { text: 'Soft cataract.', type: 'main' }
      ]
    }
  },
  {
    id: '80',
    category: 'lens',
    question: 'What is "Leukocoria" in the context of congenital cataract?',
    explanation: `**Leukocoria**
يعني "الحدقة البيضاء".
* لما الأم تلاحظ إن نني العين بتاع ابنها لونه "أبيض" بدل "أسود".
* ده معناه إن فيه عتامة كبيرة سادة النظر أو قريبة من السطح.`,
    answer: {
      title: 'Clinical Picture: Symptoms',
      content: [
        { text: 'Leukocoria is the white color of the pupil seen if the cataract is extensive or superficial.', type: 'main' },
        { text: 'Other symptoms include defective vision or being asymptomatic if small.', type: 'main' }
      ]
    }
  },
  {
    id: '81',
    category: 'lens',
    question: 'What are the complications of a large congenital cataract interfering with vision?',
    explanation: `**Cataract Complications in Children**
المياه البيضاء في الأطفال أخطر من الكبار لسببين:
1. **Amblyopia**: كسل العين، لأن المخ مش بيوصله صورة فبيتعود مبيشوفش.
2. **Mental development**: الطفل مش بيتفاعل مع البيئة كويس.
3. **Squint & Nystagmus**: الحول ورعشة العين بسبب ضعف النظر.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Complications',
      content: [
        { text: 'Interference with mental development.', type: 'main' },
        { text: 'Sensory deprivation amblyopia due to lack of macular development.', type: 'main' },
        { text: 'Squint (in unilateral cases).', type: 'main' },
        { text: 'Nystagmus (in bilateral and extensive cases).', type: 'main' }
      ]
    }
  },
  {
    id: '82',
    category: 'lens',
    question: 'Describe symptoms of Zonular (lamellar) cataract?',
    explanation: `**Zonular (Lamellar) Cataract**
أشهر نوع مياه بيضاء خلقية.
* الأعراض: المريض بيشوف الحدقة بيضاء (leukocoria) والنظر بيكون ضعيف جداً.
* ديماً بتيجي بسبب نقص الكالسيوم أو فيتامين D عند الأم.`,
    answer: {
      title: 'Zonular or Lamellar Cataract',
      content: [
        { text: 'White color of the pupil (Leukocoria).', type: 'main' },
        { text: 'Poor fixation (child does not see well).', type: 'main' },
        { text: 'Markedly dropped visual acuity.', type: 'main' }
      ]
    }
  },
  {
    id: '83',
    category: 'lens',
    question: 'What are the characteristic signs of Zonular cataract on oblique illumination?',
    explanation: `**Zonular Cataract Signs**
شكلها مميز جداً تحت الكشاف:
* عتامة دائرية في النص، والأطراف بتاعة العدسة شفافة.
* طالع منها خطوط شبه "أسلاك العجلة" بنسميها **Riders**.

> **Mnemonic**: شبه **الدركسيون** أو عجلة العربية (Steering wheel shape).`,
    answer: {
      title: 'Zonular Cataract Signs',
      content: [
        { text: 'Grayish white, disc-shaped opacity at the central part; periphery is clear.', type: 'main' },
        { text: 'Radial riders or spokes project from the main opacity (steering wheel shape).', type: 'main' }
      ]
    }
  },
  {
    id: '84',
    category: 'lens',
    question: 'What does the red reflex show in Zonular cataract?',
    explanation: `**Zonular Cataract Red Reflex**
لما نبص بالمنظار (Ophthalmoscope):
* بنشوف أحمر قوي في الأطراف (عشان شفافة).
* وبنشوف أحمر باهت أو معتم في النص (مكان العتامة).`,
    answer: {
      title: 'Zonular Cataract Red Reflex',
      content: [
        { text: 'Peripheral bright red reflex through clear periphery.', type: 'main' },
        { text: 'Central dim red reflex due to the central opacity.', type: 'main' }
      ]
    }
  },
  {
    id: '85',
    category: 'lens',
    question: 'Why does Posterior Polar Cataract cause marked drop in vision?',
    explanation: `**Posterior Polar Cataract**
العتامة موجودة عند القطب الخلفي للعدسة.
* دي أخطر أنواع العتامة في التأثير على النظر لأنها "قريبة جداً" من مركز تجمع الضوء (Nodal point).
* الطفل مش بيعرف يركز نظره على الحاجات خالص.`,
    answer: {
      title: 'Posterior Polar Cataract',
      content: [
        { text: 'Due to the proximity of the lens opacity to the nodal point.', type: 'main' },
        { text: 'The mother notices poor fixation; Leukocoria is rare as it rarely becomes total.', type: 'main' }
      ]
    }
  },
  {
    id: '86',
    category: 'lens',
    question: 'Describe Coronary Cataract.',
    explanation: `**Coronary Cataract**
دي مياه بيضاء بتظهر عند البلوغ.
* الشكل: شبه "التاج" (Corona).
* العتامة بتبقى على شكل "هراوات" (club-shaped) في أطراف العدسة.
* غالباً المريض مش بيحس بحاجة خالص ومش بتأثر على النظر.`,
    answer: {
      title: 'Coronary Cataract',
      content: [
        { text: 'Symptoms: Usually asymptomatic.', type: 'main' },
        { text: 'Appearance: Corona of peripheral club-shaped opacities seen at puberty.', type: 'main' },
        { text: 'Red reflex: Peripheral black oval spots matching opacities.', type: 'main' }
      ]
    }
  },
  {
    id: '87',
    category: 'lens',
    question: 'What are the features of Rubella Total Cataract?',
    explanation: `**Rubella Cataract**
بسبب إصابة الأم بالفيروس الألماني (Rubella).
* الطفل بيتولد عنده مياه بيضاء "كاملة" (Total).
* وبكون معاه مشاكل تانية زي: صغر حجم الدماغ، مشاكل في القلب، وصمم.

> **Mnemonic**: عتامة كاملة + قلب + ودن = **Rubella** syndrome.`,
    answer: {
      title: 'Rubella Total Cataract',
      content: [
        { text: 'Cause: Maternal rubella in 1st trimester.', type: 'main' },
        { text: 'Symptoms: Total opacificaton at birth (Leukocoria), poor fixation.', type: 'main' },
        { text: 'Systemic signs: Microcephaly, mental retardation, deafness, heart defects (PDA, VSD).', type: 'sub' },
        { text: 'Ocular signs: Micro-ophthalmos, totally blackened red reflex, no iris shadow.', type: 'sub' }
      ]
    }
  },
  {
    id: '88',
    category: 'lens',
    question: 'What is the management approach for congenital cataract based on visual significance?',
    explanation: `**Management of Congenital Cataract**
نعمل عملية ولا نستنى؟
1. لو العتامة سادة النظر تماماً: **عملية فوراً** (عشان نمنع كسل العين).
2. لو العتامة صغيرة أو في الأطراف: بنتابع لحد سن 5 سنوات ونشوف تأثيرها على النظر باللوحة.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Management Guidelines',
      content: [
        { text: 'Visually significant (dense/posterior polar): Cataract extraction as early as possible.', type: 'main' },
        { text: 'Not visually significant (peripheral/anterior polar): Follow-up until age 5 to assess VA.', type: 'main' }
      ]
    }
  },
  {
    id: '89',
    category: 'lens',
    question: 'What surgical technique is used for soft congenital cataract?',
    explanation: `**Lensectomy**
هي العملية اللي بنعملها للأطفال.
* لأن العدسة طرية، بنشفطها بجهاز خاص وبنشيل معاها جزء من الجسم الزجاجي (**Anterior vitrectomy**) عشان نمنع تكون سحابة تانية وراها.`,
    answer: {
      title: 'Lensectomy',
      content: [
        { text: 'Lensectomy and anterior vitrectomy.', type: 'main' },
        { text: 'Approached via pars plana or a small corneal incision.', type: 'main' }
      ]
    }
  },
  {
    id: '90',
    category: 'lens',
    question: 'Define Senile Cataract and its main types.',
    explanation: `**Senile Cataract (المياه البيضاء للكبار)**
دي المياه البيضاء الطبيعية اللي بتيجي مع السن (فوق الـ 50).
* الأنواع:
  1. **Cortical**: بتبدأ من القشرة (الأطراف).
  2. **Nuclear**: بتبدأ من النواة (المركز).`,
    answer: {
      title: 'Senile Cataract',
      content: [
        { text: 'Definition: Acquired progressive opacity in patients > 50 years without systemic/local disease.', type: 'main' },
        { text: '1. Senile Cortical (75% cases).', type: 'sub' },
        { text: '2. Senile Nuclear (25% cases).', type: 'sub' },
        { text: '3. Cortico-nuclear: both occurring together.', type: 'sub' }
      ]
    }
  },
  {
    id: '91',
    category: 'lens',
    question: 'What are the two pathological changes in senile cortical cataract?',
    explanation: `**Pathogenesis of Cortical Cataract**
إزاي القشرة بتعتم؟
1. **Hydration**: الجلوكوز بيقل، فالأملاح تزيد، فتقوم العدسة تشرب مياه كتير.
2. **Denaturation**: بروتينات العدسة بتتجمد وتتحول للون الأبيض (زي بياض البيض لما يستوي).`,
    answer: {
      title: 'Cortical Cataract Pathogenesis',
      content: [
        { text: '1. Hydration: water droplets appear between lens fibers.', type: 'main' },
        { text: '2. Denaturation/Coagulation of lens proteins leading to opacity.', type: 'main' }
      ]
    }
  },
  {
    id: '92',
    category: 'lens',
    question: 'Describe symptoms of the Incipient stage of senile cortical cataract.',
    explanation: `**Incipient Stage (البداية)**
أول مراحل المياه البيضاء:
* المريض يشتكي من: "زغللة بالتدريج"، "بيشوف الحاجة اتنين" (Polyopia)، أو "هالات حوالين النور" بسبب قطرات المياه اللي جوه العدسة.`,
    answer: {
      title: 'Incipient Stage',
      content: [
        { text: 'Gradual progressive diminution of vision.', type: 'main' },
        { text: 'Uniocular diplopia: Due to irregular refraction.', type: 'main' },
        { text: 'Haloes around light: Prismatic effect of water droplets between fibers.', type: 'main' }
      ]
    }
  },
  {
    id: '93',
    category: 'lens',
    question: 'What do the opacities look like in the Incipient stage?',
    explanation: `**Incipient Stage Signs**
لما نفحصها:
* بنلاقي عتامات في الأطراف شكلها "مثلثات" (Wedge-shaped) وقاعدتها لبره.
* بتظهر في الـ Red reflex كأنها "أسلاك سودة" في خلفية حمراء.`,
    answer: {
      title: 'Incipient Stage Signs',
      content: [
        { text: 'Peripheral Grayish-white opacities.', type: 'main' },
        { text: 'Shape: Triangular or wedge-shaped (apex towards pupil).', type: 'main' }
      ]
    }
  },
  {
    id: '94',
    category: 'lens',
    question: 'What are the symptoms and signs of Immature senile cortical cataract?',
    explanation: `**Immature Stage**
المرحلة "غير الناضجة":
* المريض بيشتكي من "عشى ليلي" (بيشوف أوحش بليل).
* العلامة المهمة: **Iris shadow is present** (فيه خيال للقزحية). ده معناه إن فيه لسة جزء شفاف في العدسة.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Immature Stage',
      content: [
        { text: 'Symptoms: Night blindness (diminution of vision by night).', type: 'main' },
        { text: 'Sign: Iris shadow is PRESENT (due to transparent zone between iris and opacity).', type: 'main' }
      ]
    }
  },
  {
    id: '95',
    category: 'lens',
    question: 'What is Intumescent cataract and its potential complication?',
    explanation: `**Intumescent Cataract**
العدسة "بتنفش" (تتورم) بسبب المياه الكتيرة اللي شربتها.
* الخطر: العدسة لما تنفش بتقفل زاوية العين وتعمل جلوكوما حادة (**Phacomorphic Glaucoma**).
* دي حالة طوارئ بتحتاج عملية.`,
    answer: {
      title: 'Intumescent Cataract',
      content: [
        { text: 'Rapid hydration causes the lens to swell.', type: 'main' },
        { text: 'Complication: Secondary pupillary block glaucoma (Phacomorphic glaucoma).', type: 'example' }
      ]
    }
  },
  {
    id: '96',
    category: 'lens',
    question: 'Describe the Mature stage of senile cortical cataract.',
    explanation: `**Mature Stage (المستوية)**
العدسة بقت معتمة بالكامل.
* المريض مش بيشوف غير "حركة إيد" بس (Hand movement).
* **Iris shadow is absent**: مفيش خيال للقزحية لأن العدسة كلها بقت بيضاء لحد السطح.`,
    answer: {
      title: 'Mature Stage',
      content: [
        { text: 'Symptom: Marked painless drop of vision (Hand Movement).', type: 'main' },
        { text: 'Sign: Iris shadow is ABSENT (no clear zone left).', type: 'main' },
        { text: 'Appearance: Total grayish-white opacification of cortex.', type: 'sub' }
      ]
    }
  },
  {
    id: '97',
    category: 'lens',
    question: 'List the signs of Hypermaturity in cortical cataract.',
    explanation: `**Hypermature Stage (المهجورة)**
المرحلة اللي بعد النضوج، العدسة بتبدأ "تكرمش" وتتحلل:
1. **Morgagnian**: القشرة بتسيح وتبقى مياه، والنواة بتسقط لتحت.
2. **Sclerotic**: العدسة بتفقد مياهها وتنشف وتصغر.
* خطرها: بتعمل التهابات شديدة جوا العين (**Phacolytic uveitis**).`,
    answer: {
      title: 'Hypermature Stage Signs',
      content: [
        { text: 'Calcium & cholesterol deposits on capsule.', type: 'main' },
        { text: 'Reappearance of iris shadow (due to shrinkage from escape of liquefied cortex).', type: 'main' },
        { text: 'Deep anterior chamber.', type: 'main' },
        { text: 'Tremulous iris (Iridodonesis) due to lack of lens support.', type: 'main' },
        { text: 'Morgagnian form: Nucleus settles at bottom of liquefied cortex.', type: 'example' }
      ]
    }
  },
  {
    id: '98',
    category: 'lens',
    question: 'Describe Pathology and clinical symptoms of Senile Nuclear Cataract.',
    explanation: `**Senile Nuclear Cataract**
بتبدأ في مركز العدسة.
* **Second Sight**: المريض بيفرح إنه بقى "بيشوف القريب من غير نظارة" (لأن قوة العدسة زادت)، بس النظر البعيد بيسوء جداً.
* **Day Blindness**: بيشوف أوحش في الشمس لأن الحدقة بتضيق فتتقفل بالظبط قدام العتامة اللي في النص.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Senile Nuclear Cataract',
      content: [
        { text: 'Pathology: Exaggerated dehydration and denaturation of nucleus proteins.', type: 'main' },
        { text: 'Second Sight: Increase in Refractive Index of nucleus corrects presbyopia.', type: 'example' },
        { text: 'Day Blindness: Vision is worst by day due to central location of opacity.', type: 'example' }
      ]
    }
  },
  {
    id: '99',
    category: 'lens',
    question: 'What are the key points in preoperative ocular examination for cataract?',
    explanation: `**Pre-op Exam (الفحص قبل العملية)**
لازم نتأكد من 4 حاجات:
1. فيه إدراك للضوء؟ (مش هنعمل عملية لعين ميتة).
2. ضغط العين مظبوط؟
3. استجابة الحدقة للنور؟ (بيدل على صحة العصب البصري).
4. أشعة تلفزيونية (B-scan) لو مش شايفين قاع العين.`,
    answer: {
      title: 'Preoperative Examination',
      content: [
        { text: 'Visual Acuity: "No PL = No Surgery".', type: 'main' },
        { text: 'Intraocular Pressure (IOP): Check for associated glaucoma.', type: 'main' },
        { text: 'Pupillary Reaction: Vital to assess optic nerve health.', type: 'main' },
        { text: 'Fundus examination: To predict post-op prognosis (macula, optic disc).', type: 'main' }
      ]
    }
  },
  {
    id: '100',
    category: 'lens',
    question: 'Compare Phacoemulsification, ECCE, and ICCE.',
    explanation: `**Surgical Techniques**
طرق شيل المياه البيضاء:
1. **Phaco (الفاكو)**: تفتيت العدسة بالموجات الصوتية وشفطها من خرم صغير جداً (مش بيحتاج غرز).
2. **ECCE**: جراحة بنشيل فيها النواة حتة واحدة وبنسيب الكبسولة اللي ورا.
3. **ICCE**: بنشيل العدسة بالكبسولة بتاعتها (طريقة قديمة ومبقتش تتعمل).`,
    answer: {
      title: 'Surgical Techniques',
      content: [
        { text: 'Phacoemulsification: Ultrasonic fragmentation and aspiration (small incision).', type: 'main' },
        { text: 'ECCE: Removal of nucleus, cortex aspirated, posterior capsule remains intact.', type: 'main' },
        { text: 'ICCE: Removal of lens within its capsule (rare now; risk of vitreous loss, RD).', type: 'main' }
      ]
    }
  },
  {
    id: '101',
    category: 'lens',
    question: 'What is the difference between Primary and Secondary IOL implantation?',
    explanation: `**Primary vs Secondary IOL**
* **Primary IOL**: بنركب العدسة الصناعية في "نفس العملية" اللي بنشيل فيها المياه البيضاء. ده الطبيعي والأنسب للمريض.
* **Secondary IOL**: بنركب العدسة في "عملية تانية" منفصلة بعد فترة. بنعمل كدة لو حصلت مشكلة أثناء العملية الأولى منعتنا من تركيب العدسة (زي فقدان كبير في الكبسولة).

> **Mnemonic**: Primary = Same session. Secondary = Second session.`,
    answer: {
      title: 'Intraocular Lens (IOL)',
      content: [
        { text: 'Primary: IOL implanted during the same cataract surgery.', type: 'main' },
        { text: 'Secondary: IOL implanted in a separate, later operation.', type: 'main' }
      ]
    }
  },
  {
    id: '102',
    category: 'lens',
    question: 'List common complications of cataract surgery.',
    explanation: `**Cataract Surgery Complications**
ممكن نقسمهم حسب الوقت:
1. **Intraoperative** (أثناء العملية): نزيف، أو فقدان جزء من الجسم الزجاجي (**Vitreous loss**).
2. **Early Post-op** (بعد العملية مباشرة):
   * التهاب القزحية.
   * ارتفاع ضغط العين.
   * **Endophthalmitis**: عدوى بكتيرية جوه العين، ودي أخطر حاجة وممكن تضيع العين تماماً.
3. **Late Post-op** (بعد فترة):
   * انفصال الشبكية.
   * عتامة ورا العدسة (**PCO**).`,
    answer: {
      title: 'Surgical Complications',
      content: [
        { text: 'Vitreous loss or hemorrhage.', type: 'main' },
        { text: 'Uveitis.', type: 'main' },
        { text: 'Increased eye pressure (Glaucoma).', type: 'main' },
        { text: 'Retinal detachment.', type: 'main' },
        { text: 'Endophthalmitis (severe internal infection).', type: 'main' }
      ]
    }
  },
  {
    id: '103',
    category: 'lens',
    question: 'Define Complicated Cataract and list common causes.',
    explanation: `**Complicated Cataract**
دي مياه بيضاء "ثانوية"، مش بسبب السن، لكن بسبب مرض تاني.
* **أسباب موضعية (Local)**:
  * التهاب القزحية المزمن (Iridocyclitis).
  * قصر النظر الشديد (High myopia).
  * انفصال الشبكية القديم.
* **أسباب عامة (Systemic)**:
  * مرض السكر (**Diabetes**).
  * نقص الكالسيوم.

> **Key**: دايماً بتتميز بوجود ألوان "قزحية" (Polychromatic luster) في البداية.`,
    answer: {
      title: 'Complicated Cataract',
      content: [
        { text: 'Definition: Acquired lens opacity secondary to local or systemic disease.', type: 'main' },
        { text: 'Local causes: Iridocyclitis, Glaucoma, High myopia, Retinal detachment.', type: 'sub' },
        { text: 'Systemic causes (Presenile): Diabetes mellitus, Hypoparathyroidism, Galactosemia.', type: 'sub' }
      ]
    }
  },
  {
    id: '104',
    category: 'lens',
    question: 'Describe characteristic features of Traumatic Cataract.',
    explanation: `**Traumatic Cataract (خبطات العين)**
العدسة بتتأثر جداً بالخبطات:
1. **Concussion** (خبطة مقفولة): بتعمل عتامة شكلها شبه "الوردة" (**Rosette-shaped**) في القشرة الخلفية.
2. **Vossius ring**: حلقة من صبغة القزحية بتطبع على وش العدسة من قوة الخبطة.
3. **Perforating** (خبطة نافذة): لو آلة حادة قطعت غلاف العدسة، المياه بتدخل جواها وتخليها بيضاء فجأة.`,
    answer: {
      title: 'Traumatic Cataract',
      content: [
        { text: 'Concussion: Rosette-shaped posterior cortical opacity (feathery appearance).', type: 'main' },
        { text: 'Vossius ring: Pigment on anterior capsule from pupillary iris border.', type: 'main' },
        { text: 'Perforating: Direct lens capsule rupture.', type: 'main' }
      ]
    }
  },
  {
    id: '105',
    category: 'lens',
    question: 'What is "After Cataract" (PCO) and how is it treated?',
    explanation: `**After Cataract (PCO)**
بيسموها "المياه البيضاء اللي رجعت"، بس ده اسم غلط.
* اللي بيحصل: الغشاء الخلفي (**Posterior capsule**) اللي بنسيبوا عشان نسند عليه العدسة هو اللي بيعتم بسبب نمو خلايا باقية.
* بنشوف فيها "حبيبات" شبه اللؤلؤ (**Elschnig's pearls**).
* **العلاج**: مش محتاج عملية جراحية، بنستخدم ليزر اسمه **YAG laser** بيعمل فتحة في الغشاء ويدخل النور تاني. المريض بيتحسن في دقيقتين.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Posterior Capsule Opacification (PCO)',
      content: [
        { text: 'Definition: Opacity forming after surgery or absorbed traumatic cataract.', type: 'main' },
        { text: 'Signs: Elschnig’s pearls (bubble-like cells) or Capsular fibrosis.', type: 'sub' },
        { text: 'Treatment: YAG laser capsulotomy or surgical capsulotomy.', type: 'main' }
      ]
    }
  },
  // NEW CATEGORY: Glaucoma
  {
    id: '106',
    category: 'glaucoma',
    question: 'Describe the anatomy of the Angle of the anterior chamber and how it is examined.',
    explanation: `**Anatomy of the Angle**
هي الزاوية اللي بين القرنية (Cornea) وجدر العين (Iris root). دي أهم حتة في العين لأنها "البلاعة" اللي بتصرف مياه العين.
* **إزاي بنشوفها؟**: مش بتتشاف بالكشاف العادي بسبب "الانعكاس الكلي للضوء" (Internal reflection). لازم نستخدم عدسة خاصة اسمها **Gonioscopy** (زي عدسة Goldman 3-mirror).
* **بنشوف إيه؟**: 5 حاجات بالترتيب (من قدام لورا):
1. Schwalbe's line.
2. Trabecular meshwork (المصفاة).
3. Scleral spur.
4. Ciliary body.
5. Iris root.

> **Mnemonic**: ترتيبهم من قدام لورا: **S**ome **T**asty **S**tuff **C**omes **I**n.`,
    answer: {
      title: 'Anatomy of the Angle',
      content: [
        { text: 'Definition: The angle between the periphery of the cornea and the root of the iris.', type: 'main' },
        { text: 'Examination: Cannot be seen by direct illumination; requires Gonioscopy (e.g., Goldman 3-mirror + slit lamp).', type: 'main' },
        { text: 'Structures seen: Schwalbe\'s line -> Trabecular meshwork -> Scleral spur -> Ciliary body -> Root of iris.', type: 'sub' }
      ]
    }
  },
  {
    id: '107',
    category: 'glaucoma',
    question: 'Define Aqueous Humor and its two main drainage routes.',
    explanation: `**Aqueous Humor (سائل العين)**
سائل شفاف بيغذي العين وبيحافظ على ضغطها. بيفرزه الـ **Ciliary process**.
* **طرق التصريف**:
1. **Trabecular (70-80%)**: دي الطريق الرئيسي (الرسمي)، بتمشي في المصفاة (TM) ومنها لقناة **Schlemm**.
2. **Uveoscleral (20-30%)**: طريق جانبي، بيمشي بين عضلات العين والصلبة.

> **Key**: معظم الأدوية بتشتغل بإنها تفتح الطريق ده أو تقلل الإفراز.`,
    answer: {
      title: 'Physiology of the Aqueous',
      content: [
        { text: 'Definition: Transparent colorless fluid (1.25 ml) filling AC and PC, secreted by the ciliary process.', type: 'main' },
        { text: '1. Trabecular (70-80%): TM -> Schlemm\'s canal -> Aqueous veins.', type: 'sub' },
        { text: '2. Uveoscleral (20-30%): Across C.B. to suprachoroidal space and choroid.', type: 'sub' }
      ]
    }
  },
  {
    id: '108',
    category: 'glaucoma',
    question: 'What is the normal IOP range and its diurnal variation?',
    explanation: `**Intraocular Pressure (IOP)**
ضغط العين الطبيعي بين **10 و 21 مم زئبق**.
* **التغير اليومي (Diurnal variation)**: الضغط مش ثابت طول اليوم. ديماً بيكون **أعلى حاجة الصبح** (Morning) وأقل حاجة بليل.
* التغير الطبيعي بيكون في حدود 2-3 مم. لو زاد عن 5-8 مم، ده بيخلينا نشك في وجود جلوكوما حتى لو الضغط في الرينج الطبيعي.`,
    answer: {
      title: 'Intraocular Pressure (IOP)',
      content: [
        { text: 'Normal Range: 10 - 21 mmHg.', type: 'main' },
        { text: 'Diurnal Variation: Highest in the morning, minimum in evening (Diff: 2-3 mmHg).', type: 'main' },
        { text: 'Measurement: Tonometry (Indentation, Applanation, Air puff, I-care).', type: 'sub' }
      ]
    }
  },
  {
    id: '109',
    category: 'glaucoma',
    question: 'Describe the features of a normal optic disc.',
    explanation: `**The Normal Optic Disc**
هو "رأس العصب البصري".
* الشكل: دايرة لونها وردي فاتح (Pale pink).
* **The Cup**: في نص العصب فيه حتة غويطة شوية اسمها Cup.
* **C/D Ratio**: بنقارن حجم الـ Cup بحجم العصب كله. الطبيعي بكون حوالي 0.3 (يعني الكب واخد تلت العصب).
* في الجلوكوما، الـ Cup ده بيكبر جداً (Cupping) لأن الألياف العصبية بتموت.`,
    answer: {
      title: 'The Optic Disc (Normal)',
      content: [
        { text: 'Shape: Rounded with a central physiological cup (C/D ratio: 0.3).', type: 'main' },
        { text: 'Size & Color: 1.5mm diameter, pale pink, well-defined edge.', type: 'main' },
        { text: 'Neuro-retinal rim: Area between cup and outer edge containing nerve fibers.', type: 'sub' }
      ]
    }
  },
  {
    id: '110',
    category: 'glaucoma',
    question: 'Define Glaucoma and its primary classification.',
    explanation: `**Glaucoma (المياه الزرقاء)**
هي مرض بيصيب العصب البصري (Optic neuropathy) وبيعمل فيه تآكل تدريجي، وغالباً بيكون معاه ارتفاع في ضغط العين.
* **الأنواع**:
1. **Congenital**: مولود بيها (Buphthalmos).
2. **Primary**: بتيجي لوحدها (Open angle أو Closed angle).
3. **Secondary**: بسبب مرض تاني (خبطة، التهاب، سكر).

> **Why call it Blue?**: زمان كانت الحالات اللي بتوصل لمراحل متأخرة القرنية بتورم فيها وبتبان بلون أزرق أو رمادي باهت.`,
    answer: {
      title: 'Glaucoma Overview',
      content: [
        { text: 'Definition: Progressive optic neuropathy with IOP elevation as a major risk factor, causing optic nerve damage and field defects.', type: 'main' },
        { text: 'Classification:', type: 'sub' },
        { text: '- Congenital (Buphthalmos).', type: 'example' },
        { text: '- Primary (Open angle or Closed angle).', type: 'example' },
        { text: '- Secondary (Secondary to ocular disease).', type: 'example' }
      ]
    }
  },
  {
    id: '111',
    category: 'glaucoma',
    question: 'What are the characteristic clinical symptoms (triad) of Congenital Glaucoma?',
    explanation: `**Congenital Glaucoma Triad (الثلاثية الشهيرة)**
لو أم شافت ابنها الصغير عنده الـ 3 حاجات دول، لازم تروح لدكتور فوراً:
1. **Lacrimation**: دموع زيادة.
2. **Photophobia**: مش طايق الضوء وبيهرب منه.
3. **Blepharospasm**: بيقفل عينه جامد.
* السبب: ضغط العين العالي بيشد على أعصاب القرنية وبيعمل فيها تورم (Edema).

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Congenital Glaucoma Triad',
      content: [
        { text: '1. Lacrimation.', type: 'main' },
        { text: '2. Photophobia.', type: 'main' },
        { text: '3. Blepharospasm.', type: 'main' },
        { text: 'Caused by stretching of ciliary nerves due to high IOP and corneal edema.', type: 'note' }
      ]
    }
  },
  {
    id: '112',
    category: 'glaucoma',
    question: 'List the ocular signs of Congenital Glaucoma.',
    explanation: `**Signs of Buphthalmos (عين الثور)**
العين بتبان كبيرة جداً وجميلة في الأول، بس دي كارثة:
* **Megalocornea**: قطر القرنية بيكبر (أكتر من 12 مم).
* **Haab's striae**: شروخ في غشاء ديسمت (Descemet) بسبب شد العين.
* **Bluish sclera**: بياض العين بيبقى لونه أزرق لأن الطبقة بقت رقيقة ومبينة اللي تحتها.
* **Deep AC**: الخزانة الأمامية بتبقى غويطة جداً.

> **Mnemonic**: العين بتوسع في كل الاتجاهات لأن أنسجة الطفل لسة مرنة (Distensible).

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Signs of Buphthalmos',
      content: [
        { text: 'Cornea: Edema, Enlargement (>12mm), and Haab\'s striae (tears in Descemet membrane).', type: 'main' },
        { text: 'Eyeball: Enlarged (Buphthalmos).', type: 'main' },
        { text: 'Sclera: Bluish color (thinning).', type: 'main' },
        { text: 'Anterior Chamber: Very deep.', type: 'main' },
        { text: 'Gonioscopy: Flat iris insertion into TM.', type: 'sub' }
      ]
    }
  },
  {
    id: '113',
    category: 'glaucoma',
    question: 'How is Congenital Glaucoma managed surgically?',
    explanation: `**Surgical Management**
الجلوكوما الخلقية **علاجها جراحي فقط**، الأدوية بس بنستخدمها مؤقتاً لحد العملية.
1. **Goniotomy**: لو القرنية شفافة بنفتح الزاوية من جوا.
2. **Trabeculotomy**: لو القرنية معتمة بنفتح الزاوية من برا.
3. **Trabeculectomy & Valves**: لو الحالات متأخرة أو العمليات اللي فات فشلت.`,
    answer: {
      title: 'Management of Congenital Glaucoma',
      content: [
        { text: 'Treatment is always SURGICAL.', type: 'main' },
        { text: '< 13mm diameter + Clear cornea: Goniotomy.', type: 'sub' },
        { text: '< 13mm diameter + Opaque cornea: Trabeculotomy.', type: 'sub' },
        { text: '> 13mm or failed previous: Trabeculectomy or Valve implantation.', type: 'sub' }
      ]
    }
  },
  {
    id: '114',
    category: 'glaucoma',
    question: 'What are the risk factors for Primary Open Angle Glaucoma (POAG)?',
    explanation: `**POAG Risk Factors**
دي المياه الزرقاء اللي بتسرق النظر ببطء ومن غير وجع:
* السن: غالباً فوق الـ 50.
* الوراثة: بتجري في العائلات.
* العرق: أكتر في أصحاب البشرة السمراء وبسورة أعنف.
* أمراض عامة: السكر والضغط والصداع النصفي.
* قصر النظر الشديد (**High Myopia**).`,
    answer: {
      title: 'POAG Risk Factors',
      content: [
        { text: 'Age: Usually > 50 years.', type: 'main' },
        { text: 'Family history (hereditary).', type: 'main' },
        { text: 'Race: Darker races (4x more common).', type: 'main' },
        { text: 'Systemic diseases: Diabetes Mellitus, Migraine.', type: 'main' },
        { text: 'Ocular conditions: Topical steroids, High myopia.', type: 'sub' }
      ]
    }
  },
  {
    id: '115',
    category: 'glaucoma',
    question: 'Describe the symptoms and signs of POAG.',
    explanation: `**POAG (The Silent Thief)**
ليها اسم شهرة "سارق النظر الصامت".
* **الأعراض**: المريض غالباً مش حاسس بحاجة لحد ما بيفقد جزء كبير من مجال نظره. ممكن يشتكي من صداع خفيف أو إن النظارة بتاعته مابقتش مريحة.
* **العلامات**:
1. ضغط العين أعلى من 21.
2. الزاوية مفتوحة بوضوح (Open angle).
3. **Glaucomatous Cupping**: العصب البصري متآكل.
4. **Field defects**: نقط سوداء في مجال النظر بتبدأ من الأطراف.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'POAG Clinical Picture',
      content: [
        { text: 'Symptoms: Often asymptomatic (Silent Thief), late headache, early presbyopia, night blindness.', type: 'main' },
        { text: 'Sign (IOP): > 21 mmHg with open angle on gonioscopy.', type: 'main' },
        { text: 'Sign (Disc): Pathological glaucomatous cupping.', type: 'main' },
        { text: 'Sign (Field): Specific visual field defects (Arcuate scotoma, etc.).', type: 'sub' }
      ]
    }
  },
  {
    id: '116',
    category: 'glaucoma',
    question: 'What are the first-line medical treatments for POAG?',
    explanation: `**POAG Medical Treatment**
بنبدأ ديماً بقطرة واحدة ونشوف النتيجة:
1. **Beta Blockers** (Timolol): بتقلل "المحابس" (بتقلل إنتاج السائل).
2. **Prostaglandins** (Latanoprost): بتفتح "البلاعات" (بتزود التصريف Uveoscleral). ودي الأقوى والأشهر حالياً.
3. **CAI** (Azopt/Trusopt): بتقلل الإفراز.

> **Mnemonic**: يا إما بنقلل الحنفية (Production) يا إما بنفتح البلاعة (Drainage).`,
    answer: {
      title: 'Medical Treatment of POAG',
      content: [
        { text: '1st Line (Beta Blockers): E.g., Timolol. Action: Decrease aqueous formation.', type: 'main' },
        { text: '1st Line (Prostaglandin Analogues): E.g., Latanoprost. Action: Increase uveoscleral outflow.', type: 'main' },
        { text: '2nd Line/Adjuvants: Carbonic Anhydrase Inhibitors (CAI), Alpha-2 agonists.', type: 'sub' }
      ]
    }
  },
  {
    id: '117',
    category: 'glaucoma',
    question: 'Enumerate the four phases of Primary Closed Angle Glaucoma (PCAG).',
    explanation: `**Phases of PCAG**
المياه الزرقاء ذات الزاوية المغلقة بتمشي في 4 مراحل:
1. **Intermittent (Prodromal)**: هجمات بسيطة وبتروح لوحدها.
2. **Acute attack**: كارثة، هجمة حادة ومؤلمة جداً.
3. **Chronic**: الزاوية قفلت بجد ومبقتش تفتح، والحالة قلبت لمزمنة.
4. **Absolute**: العين فقدت النظر وبقت مؤلمة (Blind painful eye).`,
    answer: {
      title: 'Phases of PCAG',
      content: [
        { text: '1. Intermittent (Prodromal): Rapid, partial reversible closure.', type: 'main' },
        { text: '2. Acute: Sudden, total angle closure.', type: 'main' },
        { text: '3. Chronic: Similar to POAG but with closed angle.', type: 'main' },
        { text: '4. Absolute: End stage, blind painful eye.', type: 'main' }
      ]
    }
  },
  {
    id: '118',
    category: 'glaucoma',
    question: 'Describe the clinical symptoms and signs of an Acute PCAG attack.',
    explanation: `**Acute PCAG Attack (حالة طوارئ)**
* **الأعراض**: وجع رهيب في العين لدرجة إن المريض ممكن يرجع (Vomiting) ويفتكر إن عنده مشكلة في معدته. النظر بيقل فجأة.
* **العلامات**:
1. العين "حجر" (**Stony hard**) من كتر الضغط (ممكن يوصل لـ 60).
2. القرنية معتمة (Edema).
3. الحدقة (Pupil) بتكون **بيضاوية وثابتة** في النص (Oval semi-dilated).
4. احمرار شديد في العين (Ciliary injection).

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Acute PCAG Attack',
      content: [
        { text: 'Symptoms: Severe headache, periocular pain, nausea/vomiting, severe vision drop.', type: 'main' },
        { text: 'Signs: Hand movement vision, Corneal edema, Circum-corneal ciliary injection (CCCI).', type: 'main' },
        { text: 'Pupil: Oval, semi-dilated, fixed (temporal paralysis of sphincter).', type: 'main' },
        { text: 'IOP: Extremely high (often up to 50 mmHg), "Stony hard" sensation.', type: 'sub' }
      ]
    }
  },
  {
    id: '119',
    category: 'glaucoma',
    question: 'How is an Acute PCAG attack managed?',
    explanation: `**Acute Attack Management**
لازم ننزل الضغط بسرعة قبل ما العصب يموت:
1. **Medical**: مدرات بول قوية (Mannitol) وحقن (Acetazolamide) وقطرات.
2. **Surgery**: لما الضغط ينزل شوية والقرنية تنشف، لازم نعمل خرم في القزحية بالليزر (**Laser Iridotomy**).
* **ملحوظة ذهبية**: لازم نعمل خرم وقائي في العين التانية (**The other eye**) لأنها بنسبة 50% هيحصلها نفس الهجمة!`,
    answer: {
      title: 'Management of Acute PCAG',
      content: [
        { text: 'Emergency Hospitalization Medical: Hyperosmotics (Mannitol), Acetazolamide, Timolol, Pilocarpine.', type: 'main' },
        { text: 'Operative: Laser iridotomy or Peripheral Iridectomy.', type: 'main' },
        { text: 'IMPORTANT: Prophylactic PI/Iridotomy for the OTHER eye is mandatory.', type: 'example' }
      ]
    }
  },
  {
    id: '120',
    category: 'glaucoma',
    question: 'List common causes of Secondary Glaucoma.',
    explanation: `**Secondary Glaucoma Causes**
الجلوكوما هنا "تابعة" لمشكلة تانية:
* **القزحية**: التهاب مزمن (Iridocyclitis) بيسد الزاوية.
* **العدسة**: مياه بيضاء منفوخة (Phacomorphic) أو مياه بيضاء "دايبة" (Phacolytic).
* **الشبكية**: جلطة في الوريد (CRVO) بطلع أوعية دموية جديدة تسد الزاوية (**100 days glaucoma**).
* **الأدوية**: استخدام الكورتيزون (Steroids) لفترة طويلة.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Causes of Secondary Glaucoma',
      content: [
        { text: 'Iris/Ciliary Body: Iridocyclitis.', type: 'main' },
        { text: 'Lens: Phacomorphic (Lens swell), Phacolytic (Lens protein leak).', type: 'main' },
        { text: 'Retina: Central retinal vein occlusion (Neovascular Glaucoma / 100 days glaucoma).', type: 'main' },
        { text: 'Steroid induced.', type: 'main' },
        { text: 'Intraocular tumors (Direct invasion or pushing pupil-lens diaphragm).', type: 'sub' }
      ]
    }
  },
  // NEW CATEGORY: Retina
  {
    id: '121',
    category: 'retina',
    question: 'Describe the gross anatomy and blood supply of the retina.',
    explanation: `**Retina Anatomy (الشبكية)**
هي الطبقة الحساسة للضوء اللي بتبطّن العين من جوا.
* **البناء**: بتتكون من 10 طبقات (منها الخلايا اللي بنشوف بيها: الـ Rods والـ Cones).
* **التغذية**: الشبكية "طماعة" وبتاخد غذاها من مصدرين:
1. **Inner 5 layers**: بتتغذى من الشريان المركزي للشبكية (CRA).
2. **Outer 5 layers**: دي الأهم (فيها الخلايا الحساسة) وبتتغذى بالانتشار من المشيمة اللي وراها (Choroid).

> **Note**: الـ Macula هي أكتير حتة حساسة في الشبكية ومسؤولة عن حدة النظر.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Retinal Anatomy & Blood Supply',
      content: [
        { text: 'Gross Anatomy: Inner neurosensory layer, between choroid and vitreous; starts at ora serrata and ends at optic disc.', type: 'main' },
        { text: 'Inner 5 layers: Supplied by central retinal artery (from ophthalmic artery).', type: 'sub' },
        { text: 'Outer 5 layers: Avascular, supplied by diffusion from the choroid.', type: 'sub' },
        { text: 'Cilioretinal artery: Present in 10-20%, branch of posterior ciliary arteries, supplies the macula.', type: 'note' }
      ]
    }
  },
  {
    id: '122',
    category: 'retina',
    question: 'What are the main functions of the vitreous humor?',
    explanation: `**Vitreous Humor (الجسم الزجاجي)**
جيل شفاف مالي معظم فراغ العين من جوا.
* **الوظيفة**:
1. بيحافظ على شكل العين وحجمها.
2. بيمتص الصدمات (Cushion).
3. شفاف فبيسمح بمرور الضوء للشبكية.
* ماسك بقوة في الشبكية عند الأطراف (Vitreous base) وعند العصب البصري. مع السن، الجيل ده بيتحلل وممكن يشد الشبكية ويخرمها.`,
    answer: {
      title: 'Vitreous Humor',
      content: [
        { text: '1. Stabilizes globe volume and acts as a cushion for the retina.', type: 'main' },
        { text: '2. Acts as one of the optical media of the eye.', type: 'main' },
        { text: 'It is firmly attached at the vitreous base (peripheral retina/pars plana) and around the optic disc.', type: 'sub' }
      ]
    }
  },
  {
    id: '123',
    category: 'retina',
    question: 'What are the characteristic vascular changes (hemorrhage and exudates) in retinopathies?',
    explanation: `**Retinopathy signs (لغة الشبكية)**
لما دكتور الرمد يبص في قاع العين بيشوف:
1. **Superficial hemorrhage**: نزيف سطحي شكله شبه "لهب الشمعة" (**Flame-shaped**).
2. **Deep hemorrhage**: نزيف عميق وشكله نقط (Dot/Blot).
3. **Hard exudates**: دهون مترسبة لونها أصفر.
4. **Soft exudates (Cotton wool)**: بقع بيضاء شبه القطن، دي بتبين إن فيه جلطات صغيرة في الشبكية.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Retinopathy Pathology',
      content: [
        { text: 'Superficial Hemorrhage: Flame-shaped (in nerve fiber layer).', type: 'main' },
        { text: 'Deep Hemorrhage: Dot or Blot (in nuclear layer).', type: 'main' },
        { text: 'Hard Exudates: Yellow-white spots (lipoprotein).', type: 'sub' },
        { text: 'Soft Exudates (Cotton Wool): White, represent ischemia/micro-infarction.', type: 'sub' },
        { text: 'Macular Star: Edema arranged according to fiber direction at macula.', type: 'example' }
      ]
    }
  },
  {
    id: '124',
    category: 'retina',
    question: 'Describe the four grades of Hypertensive Retinopathy.',
    explanation: `**Hypertensive Retinopathy (تأثير الضغط)**
الضغط العالي بيقفل الشرايين بالتدريج:
* **Grade 1 & 2**: الشرايين بتضيق (Attenuation) وبتبقى رفيعة.
* **Grade 3**: الشبكية تبدأ تطلع نزيف ودهون (Exudates).
* **Grade 4**: العصب البصري نفسه بيورم (**Papilledema**) ودي حالة خطيرة جداً بنسميها Malignant hypertension.

> **Mnemonic**: 1&2 (Vessels), 3 (Retina), 4 (Disc).`,
    answer: {
      title: 'Hypertensive Retinopathy Grades',
      content: [
        { text: 'Grade I: Generalized mild attenuation of arteries.', type: 'main' },
        { text: 'Grade II: Focal attenuation of arteries + irregular vein caliber.', type: 'main' },
        { text: 'Grade III: Angiopathic retinopathy (exudates, hemorrhage, and edema).', type: 'main' },
        { text: 'Grade IV: All above + Papilledema and Macular star.', type: 'main' }
      ]
    }
  },
  {
    id: '125',
    category: 'retina',
    question: 'Differentiate between the three stages of Diabetic Retinopathy (DR).',
    explanation: `**Stages of Diabetic Retinopathy**
تأثير السكر على العين بيمشي في كذا مرحلة:
1. **Background (BDR)**: البداية (نزيف بسيط ودهون).
2. **Pre-proliferative**: الشبكية مخنوقة ومحتاجة أكسجين (Cotton wool spots).
3. **Proliferative (PDR)**: دي "مرحلة الانفجار"، الشبكية بطلع أوعية دموية جديدة وضعيفة (Neovascularization) ممكن تنزف في أي لحظة.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Stages of Diabetic Retinopathy',
      content: [
        { text: '1. Background DR: Micro-aneurysms, hard exudates, retinal hemorrhages (dot/blot).', type: 'main' },
        { text: '2. Pre-proliferative DR: Cotton-wool spots, IRMA (microvascular abnormality), venous beading.', type: 'main' },
        { text: '3. Proliferative DR: Neovascularization (NVD, NVE, NVI) and fibrovascular proliferation.', type: 'main' },
        { text: 'Complications: Tractional RD and vitreous hemorrhage.', type: 'example' }
      ]
    }
  },
  {
    id: '126',
    category: 'retina',
    question: 'What are the management options for Diabetic Retinopathy?',
    explanation: `**DR Management**
إزاي بنحمي مريض السكر من العمى؟
1. **المتابعة وسكر مظبوط**: ده رقم 1.
2. **حقن Anti-VEGF**: حقن جوه العين عشان تموت الأوعية الدموية الزيادة وتقلل تورم مركز الإبصار.
3. **الليزر (Argon laser)**: بنكوي أطراف الشبكية عشان نوفر الأكسجين للجزء المهم اللي في النص.
4. **العملية (Vitrectomy)**: لو حصل نزيف كبير مش راضي يروح أو انفصال شديد في الشبكية.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Management of DR',
      content: [
        { text: '1. Tight control of system blood sugar.', type: 'main' },
        { text: '2. Anti-VEGF Intravitreal injection: Mainstay for diabetic macular edema (DME).', type: 'main' },
        { text: '3. Laser Photocoagulation: For Proliferative DR or Maculopathy.', type: 'sub' },
        { text: '4. Vitrectomy: For non-clearing vitreous hemorrhage or tractional RD.', type: 'sub' }
      ]
    }
  },
  {
    id: '127',
    category: 'retina',
    question: 'Describe the clinical picture and complications of Central Retinal Vein Occlusion (CRVO).',
    explanation: `**CRVO (جلطة الوريد)**
الوريد اتسد، فالدم اتحبس جوه الشبكية وانفجر:
* **الشكل**: بنسميها **Blood and thunder fundus** (نزيف في كل حتة كأن فيه عاصفة دم).
* **الأعراض**: ضعف نظر مفاجئ بس من غير وجع.
* **المضاعفات**: أخطرها هي مياه زرقاء عنيفة (**100 days glaucoma**) بسبب نقص الأكسجين الشديد.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'CRVO clinical features',
      content: [
        { text: 'Symptoms: Rapid painless drop of vision.', type: 'main' },
        { text: 'Signs: Dilated/tortuous veins, extensive hemorrhages, edema, cotton wool spots.', type: 'main' },
        { text: 'Complications: Vitreous hemorrhage, Tractional RD, and Neovascular Glaucoma (100 days glaucoma).', type: 'sub' }
      ]
    }
  },
  {
    id: '128',
    category: 'retina',
    question: 'What are the classic symptoms and signs of Central Retinal Artery Occlusion (CRAO)?',
    explanation: `**CRAO (جلطة الشريان - سكتة العين)**
الحنفية اتقفلت فجأة، الشبكية مبقاش واصلها دم:
* **الأعراض**: فقدان نظر كلي ومفاجئ في ثواني.
* **العلامة الذهبية**: **Cherry red spot** (نقطة حمراء شبه الكريزة في النص، والشبكية حواليها بيضاء ميتة من نقص الدم).
* دي حالة طوارئ قصوى، لو الدم مرجعش في خلال ساعات الشبكية بتموت للأبد.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'CRAO features',
      content: [
        { text: 'Symptoms: Sudden painless loss of vision.', type: 'main' },
        { text: 'Signs (Early): Thread-like arteries, milky white retina (ischemic edema).', type: 'main' },
        { text: 'Hallmark Sign: Cherry red spot at the fovea.', type: 'example' },
        { text: 'Late Sign: Consecutive optic atrophy (waxy yellow disc).', type: 'sub' }
      ]
    }
  },
  {
    id: '129',
    category: 'retina',
    question: 'Define Rhegmatogenous Retinal Detachment (RD) and its clinical symptoms.',
    explanation: `**Rhegmatogenous RD (انفصال الشبكية بسبب خرم)**
ده النوع الأشهر، بيحصل خرم في الشبكية (Tear) والماية بتدخل من تحته وتفصلها عن مكانها.
* **الأعراض بالترتيب**:
1. **Flashes**: فلاشات نور (نور بيطفي وينور فجأة).
2. **Floaters**: ذبابة طايرة كتير فجأة.
3. **Curtain sensation**: المريض يحس إن فيه "ستارة سودة" نازلة على عينه.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Rhegmatogenous RD',
      content: [
        { text: 'Definition: RD caused by a full thickness retinal hole or tear.', type: 'main' },
        { text: 'Symptoms Sequence: Flashes (photopsia) -> Floaters -> Field defect -> Visual loss.', type: 'main' },
        { text: 'Signs: Grayish red reflex, soft IOP, whitish detached retina with dark tortuous vessels.', type: 'sub' }
      ]
    }
  },
  {
    id: '130',
    category: 'retina',
    question: 'How is Rhegmatogenous Retinal Detachment treated?',
    explanation: `**RD Treatment (تثبيت الشبكية)**
الشبكية لازم ترجع مكانها وتتلزق:
1. **الليزر**: لو فيه خرم بس لسه مصلش انفصال، بنلحمه بالليزر.
2. **Scleral buckling**: بنحط حزام حوالين العين عشان نضغط على الصلبة ونقفل الخرم.
3. **Vitrectomy**: بنشيل الجسم الزجاجي ونحقن زيت سيليكون أو غاز عشان يزق الشبكية مكانها.`,
    answer: {
      title: 'Treatment of Rhegmatogenous RD',
      content: [
        { text: 'Break without detachment: Argon Laser photocoagulation.', type: 'main' },
        { text: 'RD with Break: Scleral buckling (with drainage) + sealing by cryopexy/photocoagulation.', type: 'main' },
        { text: 'Neglected Cases/PVR: Vitrectomy with silicon oil injection.', type: 'sub' }
      ]
    }
  },
  {
    id: '131',
    category: 'retina',
    question: 'List causes of Secondary Retinal Detachment (Non-Rhegmatogenous).',
    explanation: `**Secondary RD (الأنواع التانية)**
هنا الشبكية انفصلت بس مفيش خرم:
1. **Tractional**: بسبب تليف بيشد الشبكية لقدام (زي حالات السكر المتقدمة).
2. **Exudative**: بسبب سائل بيتجمع تحت الشبكية (زي الالتهابات العنيفة أو الأورام).`,
    answer: {
      title: 'Secondary RD Causes',
      content: [
        { text: '1. Tractional RD: PDR, organized vitreous hemorrhage, cyclitic membrane.', type: 'main' },
        { text: '2. Exudative RD: Exudative choroiditis, malignant melanoma.', type: 'main' }
      ]
    }
  },
  {
    id: '132',
    category: 'retina',
    question: 'Describe Retinitis Pigmentosa (Clinical Picture and Triad).',
    explanation: `**Retinitis Pigmentosa (مرض العشى الليلي)**
مرض وراثي بيدمر خلايا الشبكية (الـ Rods) المسؤولة عن الرؤية في الضلمة.
* **الأعراض**: المريض مش بيشوف خالص بليل ومجال نظره بيصغر.
* **الثلاثية الشهيرة (The Triad)**:
1. **Bone corpuscles**: رواسب سوداء شكلها شبه الخلايا العصبية.
2. **Waxy yellow disc**: العصب البصري لونه أصفر باهت.
3. **Attenuated vessels**: شرايين الشبكية ضيقة جداً.

> **Result**: المريض بيشوف كأنه بيبص من "ماسورة" (**Tubular vision**).`,
    answer: {
      title: 'Retinitis Pigmentosa',
      content: [
        { text: 'Definition: Bilateral progressive hereditary degeneration affecting rods first (night blindness).', type: 'main' },
        { text: 'Classic Triad (Signs): Bone corpuscles (black pigments), Attenuated blood vessels, Waxy yellow optic disc.', type: 'main' },
        { text: 'Visual Field: Ring scotoma progressing to tubular vision.', type: 'sub' },
        { text: 'Can be part of Laurence-Moon-Biedl Syndrome.', type: 'note' }
      ]
    }
  },
  {
    id: '133',
    category: 'retina',
    question: 'Describe the pathology of Diabetic Retinopathy (Occlusion vs Leakage).',
    explanation: `**DR Pathology (إزاي السكر بيبوظ الشبكية؟)**
بيشتغل بطريقتين:
1. **Leakage (تسريب)**: جدران الأوعية بتضعف، فتسرب مياه ودهون (Exudates) وتعمل تورم في الماكولا.
2. **Occlusion (انسداد)**: الشعيرات الدموية بتتقفل، فالشبكية متعرفش تتنفس، فتطلع مواد (VEGF) تحفز نمو أوعية دموية جديدة مضرة.`,
    answer: {
      title: 'Diabetic Retinopathy Pathology',
      content: [
        { text: '1. Micro-vascular occlusion: Basement membrane thickening, Endothelial proliferation, Platelet aggregation.', type: 'main' },
        { text: '2. Micro-vascular leakage: Loss of tight junctions and loss of pericytes.', type: 'main' }
      ]
    }
  },
  {
    id: '134',
    category: 'retina',
    question: 'What are the investigations required before treating Diabetic Retinopathy?',
    explanation: `**Retina Investigations**
قبل ما نعالج لازم نصور ونحلل:
1. **Fundus Camera**: تصوير قاع العين العادي للتوثيق.
2. **FA (الصبغة)**: بنحقن صبغة Fluorescein عشان نشوف أماكن التسريب والمناطق اللي مش واصلها دم.
3. **OCT (الأشعة المقطعية)**: دي أهم حاجة، بتبين سمك الشبكية بالتفصيل (زي السونار بس بالليزر).`,
    answer: {
      title: 'DR Investigations',
      content: [
        { text: 'Fundus examination and colored fundus photography.', type: 'main' },
        { text: 'Fluorescein angiography (FA).', type: 'main' },
        { text: 'Optical Coherence Tomography (OCT).', type: 'main' }
      ]
    }
  },
  {
    id: '135',
    category: 'retina',
    question: 'What is the etiology of Central Retinal Vein Occlusion (CRVO)?',
    explanation: `**CRVO Etiology (مين اللي بيجيلة جلطة؟)**
بيحصل انسداد في مخرج الدم من العين:
* زيادة لزوجة الدم (زي الـ Polycythemia).
* التهاب في جدار الوريد (Vasculitis) بسبب السكر أو الضغط.
* تصلب الشريان اللي ماشي جنب الوريد (Atherosclerosis) فبيضغط عليه ويقله.`,
    answer: {
      title: 'CRVO Etiology',
      content: [
        { text: 'Lumen: Increased blood viscosity (e.g., polycythemia).', type: 'main' },
        { text: 'Wall: Vasculitis (e.g., in Diabetes Mellitus).', type: 'main' },
        { text: 'Outside: Atherosclerosis at lamina cribrosa or increased IOP.', type: 'main' }
      ]
    }
  },
  {
    id: '136',
    category: 'retina',
    question: 'What is the etiology of Central Retinal Artery Occlusion (CRAO)?',
    explanation: `**CRAO Etiology (ليه الشريان بيتحبس؟)**
السبب غالباً "سدادة" (Emboli):
* حتة دهون أو جلطة جاية من القلب أو من شريان الرقبة (Carotid) وسدت شريان العين.
* تشنج في الشريان (Arterial spasm).
* التهاب شديد في الأوعية الدموية (Giant cell arteritis).`,
    answer: {
      title: 'CRAO Etiology',
      content: [
        { text: 'Lumen: Emboli (e.g., atheromatous patches).', type: 'main' },
        { text: 'Wall: Arteritis (e.g., SLE) or Arterial spasm (Raynaud\'s disease).', type: 'main' },
        { text: 'Outside: Tight scleral buckle in RD surgery.', type: 'main' }
      ]
    }
  },
  {
    id: '137',
    category: 'retina',
    question: 'What are the main functions of the vitreous gel?',
    explanation: `**Vitreous Functions**
1. ممر للضوء (Optical media).
2. بيحافظ على "كروية" العين.
3. بيثبت الشبكية في مكانها ويحافظ على تماسكها مع المشيمة.`,
    answer: {
      title: 'Vitreous Functions',
      content: [
        { text: '1. Stabilizes globe volume and acts as a cushion for the retina.', type: 'main' },
        { text: '2. Acts as one of the optical media.', type: 'main' },
        { text: 'Firmly attached to peripheral retina, pars plana, and optic disc.', type: 'sub' }
      ]
    }
  },
  // GLUCOMA Missing content
  {
    id: '138',
    category: 'glaucoma',
    question: 'What is the etiology of Congenital Glaucoma (Trabeculo-dysgenesis)?',
    explanation: `**Etiology (ليه بتحصل؟)**
المشكلة بتكون عيب خلقي في تكوين زاوية العين (Angle):
1. **Mesodermal atrophy failure**: المفروض الأنسجة الزيادة في الزاوية تختفي قبل الولادة، هنا بتفضل موجودة وتقفل المخرج.
2. **Barkan's membrane**: غشاء رقيق بيغطي المصفاة (TM) ويمنع مرور السائل.
3. عدم وجود قناة **Schlemm** بكل بساطة.`,
    answer: {
      title: 'Congenital Glaucoma Etiology',
      content: [
        { text: 'Failure of complete separation of iris from cornea (failure of mesodermal atrophy).', type: 'main' },
        { text: 'Abnormal anterior insertion of iris/ciliary muscle into TM.', type: 'main' },
        { text: 'Absence of Canal of Schlemm.', type: 'main' }
      ]
    }
  },
  {
    id: '139',
    category: 'glaucoma',
    question: 'Enumerate the differential diagnosis of Congenital Glaucoma.',
    explanation: `**D.D. (ممكن تتلخبط مع إيه؟)**
مش كل طفل عينه كبيرة أو معتمة يبقى عنده جلوكوما:
1. **عينه كبيرة بس سليمة**: زي حالات قصر النظر الشديد (**High Myopia**) أو مرض الـ **Megalocornea** (قرنية كبيرة بس الضغط طبيعي).
2. **قرنية معتمة لسبب تاني**: خبطة أثناء الولادة (Birth trauma) أو نقص مواد معينة (Metabolic factors).
3. **مياه زرقاء ثانوية**: بسبب ورم في العين (لي قدر الله) زي الـ **Retinoblastoma**.`,
    answer: {
      title: 'D.D. of Buphthalmos',
      content: [
        { text: 'Large Cornea: Megalocornea, High myopia, Keratoglobus.', type: 'main' },
        { text: 'Cloudy Cornea: Birth trauma, Metabolic (MPS), Rubella.', type: 'main' },
        { text: '2ry Infantile Glaucoma: Retinoblastoma, ROP, Inflammation.', type: 'main' }
      ]
    }
  },
  {
    id: '140',
    category: 'glaucoma',
    question: 'Describe the diagnostic steps for Congenital Glaucoma under GA.',
    explanation: `**Diagnosis under GA (الفحص تحت البنج)**
الطفل الصغير مش هيخلينا نفحصه في العيادة، فلازم "نخدره" ونقيس 3 حاجات:
1. **القطر**: لو قطر القرنية أكبر من 11-12 مم بنشك.
2. **ضغط العين**: بنقيسه بجهاز خاص وهو نايم (مع مراعاة إن البنج نفسه بينزل الضغط شوية).
3. **الزاوية**: بنبص عليها بعدسة الـ Gonioscopy.
4. **العصب**: بنشوف لو فيه Cupping.`,
    answer: {
      title: 'Diagnosis under GA',
      content: [
        { text: '1. Measure corneal diameter: > 11mm is suspicious.', type: 'main' },
        { text: '2. Gonioscopy: Koeppe lens shows flat iris insertion.', type: 'main' },
        { text: '3. IOP Measurement.', type: 'main' }
      ]
    }
  },
  {
    id: '141',
    category: 'glaucoma',
    question: 'What is the etiology of Primary Open Angle Glaucoma (POAG)?',
    explanation: `**POAG Etiology (إزاي بتحصل؟)**
الزاوية شكلياً مفتوحة، بس "المصفاة" (TM) نفسها مسدودة.
* مع السن، بيحصل تصلب (Sclerosis) في أنسجة الزاوية، والفتحات (Fontana spaces) بتضيق.
* ده بيخلي السائل يخرج بصعوبة، فيرتفع الضغط بالتدريج ويضغط على العصب البصري.`,
    answer: {
      title: 'POAG Etiology',
      content: [
        { text: 'Age-related sclerosis of trabecular meshwork.', type: 'main' },
        { text: 'Narrowing of Fontana spaces leads to decreased aqueous outflow.', type: 'main' }
      ]
    }
  },
  {
    id: '142',
    category: 'glaucoma',
    question: 'What are the characteristic predisposing factors for PCAG?',
    explanation: `**PCAG Predisposing Factors**
مين الشخص اللي ديماً بنخاف يجيله انسداد مفاجئ في الزاوية؟
* **السن والجنس**: غالباً سيدة فوق الـ 40.
* **شكل العين**: العين "الصغيرة" (Hypermetropic). عشان العين صغيرة، كل المحتويات محشورة جوه فبتكون الزاوية ضيقة جداً (Shallow AC).
* دايماً بتيجي في العينين الاتنين.`,
    answer: {
      title: 'PCAG Predisposing Factors',
      content: [
        { text: 'Demographics: 40-45 year old female.', type: 'main' },
        { text: 'Configuration: Hypermetropic small eye with shallow anterior chamber.', type: 'main' },
        { text: 'Usually bilateral.', type: 'note' }
      ]
    }
  },
  {
    id: '143',
    category: 'glaucoma',
    question: 'Describe the clinical symptoms and diagnosis of the PCAG Intermittent (Prodromal) phase.',
    explanation: `**Prodromal Phase (الإنذارات)**
هجمات "بسيطة" وبتروح لوحدها، المريض بيقولك:
* "بيجيلي صداع لما أزعل أو أقعد في الضلمة كتير".
* "بشوف قوس قزح (Rainbow haloes) حوالين اللمبات بليل".
* "بشوف غيامة (Foggy vision) وبتروح لما أنام أو أطلع في النور".
* بنفحصهم باختبارات زي الـ **Darkroom test** (نقعده في الضلمة ونشوف الضغط هيعلى ولا لأ).`,
    answer: {
      title: 'PCAG Intermittent Phase',
      content: [
        { text: 'Symptoms: Frontal headache, foggy vision, rainbow haloes around lights.', type: 'main' },
        { text: 'Diagnosis Tests: Darkroom test, Prone test, Darkroom prone test.', type: 'sub' },
        { text: 'Spontaneously resolves within 1-2 hours.', type: 'note' }
      ]
    }
  },
  {
    id: '144',
    category: 'glaucoma',
    question: 'How is a PCAG Prodromal attack managed (During vs After)?',
    explanation: `**Prodromal Management**
* **فترة الهجمة**: قطرة **Pilocarpine** بتضيق الحدقة فتشد القزحية بعيد عن الزاوية وتفتحها.
* **بعد الهجمة**: لازم "حل جذري" عشان الهجمة متتكررش بشكل أعنف (Acute)، فبنعمل خرم في القزحية بالليزر (**LPI**).
* **ممنوع تماماً**: استخدام الـ **Atropine** لأنه بيوسع العين ويقفل الزاوية تماماً ويسبب كارثة.`,
    answer: {
      title: 'Management of Prodromal PCAG',
      content: [
        { text: 'During attack: Miotic (2% Pilocarpine) to diseased eye + 1% prophylactic to other eye.', type: 'main' },
        { text: 'After attack: Bilateral peripheral iridectomy or Laser iridotomy.', type: 'main' },
        { text: 'CONTRAINDICATION: Atropine.', type: 'example' }
      ]
    }
  },
  {
    id: '145',
    category: 'glaucoma',
    question: 'Briefly describe Chronic and Absolute phases of PCAG.',
    explanation: `**Chronic & Absolute PCAG**
1. **Chronic**: القزحية خلاص "لزقت" في الزاوية ومبقتش تفتح تاني. الصورة فيها بتبقى شبه الـ POAG (فقدان نظر ببطء).
2. **Absolute**: دي المرحلة الأخيرة، العين بقت عمياء (No PL) ومؤلمة جداً. العين ممكن تنشف وتصغر في الآخر (Atrophy).`,
    answer: {
      title: 'Chronic & Absolute PCAG',
      content: [
        { text: 'Chronic: Different degrees of angle closure; similar picture to POAG.', type: 'main' },
        { text: 'Management (Chronic): Filtering surgery and prophylactic iridectomy of other eye.', type: 'sub' },
        { text: 'Absolute: Blind painful eye, total optic atrophy, C.B. atrophy leads to hypotony.', type: 'main' }
      ]
    }
  },
  {
    id: '146',
    category: 'glaucoma',
    question: 'List specific local causes of Secondary Glaucoma.',
    explanation: `**Local Causes of 2ry Glaucoma**
مشاكل العين اللي ممكن تعلي الضغط:
* **خرم في القرنية**: القزحية بتطلع وتسد الزاوية.
* **العدسة**: مياه بيضاء "منفوخة" (Intumescent) أو "متحركة" (Dislocated).
* **دم أو صديد**: الـ **Hyphema** (دم في الخزانة الأمامية) بيسد المصفاة.
* **أوعية دموية جديدة**: بتنمو في حالات السكر المتأخر أو جلطة الوريد وتسد الزاوية.

**جت في اند المجموعة التانية**`,
    answer: {
      title: 'Local Causes of 2ry Glaucoma',
      content: [
        { text: 'Cornea: Perforation, fistula, ulcers.', type: 'main' },
        { text: 'Lens: Cataract, subluxation, dislocation.', type: 'main' },
        { text: 'AC: Exudates, blood (Hyphema), pus (Hypopyon).', type: 'main' },
        { text: 'Retina: CRVO (100 days glaucoma), PDR, intraocular tumors.', type: 'main' }
      ]
    }
  },
  // Final Retina details
  {
    id: '147',
    category: 'retina',
    question: 'What are the complications of Rhegmatogenous Retinal Detachment?',
    explanation: `**RD Complications**
لو الشبكية مابرجعش مكانها بسرعة:
1. **Total detachment**: الشبكية كلها بتنفصل وتكرمش.
2. **Atrophy bulbi**: العين بتصغر وتفقد وظيفتها وتنشف.
3. **Cataract**: مياه بيضاء ثانوية بسبب الالتهاب المزمن.`,
    answer: {
      title: 'RD Complications',
      content: [
        { text: 'Total Retinal Detachment.', type: 'main' },
        { text: 'Atrophic Bulbi (Eye shrinkage).', type: 'main' },
        { text: 'Iridocyclitis.', type: 'main' },
        { text: 'Complicated Cataract.', type: 'main' }
      ]
    }
  },
  {
    id: '148',
    category: 'retina',
    question: 'What are the complications of Retinitis Pigmentosa?',
    explanation: `**RP Complications**
مريض العشى الليلي ممكن يحصلة مشاكل تانية:
1. مياه بيضاء مبكرة (Complicated cataract).
2. مياه زرقاء (Glaucoma).
3. ضمور كلي في العصب البصري في المراحل الأخيرة.`,
    answer: {
      title: 'Retinitis Pigmentosa Complications',
      content: [
        { text: '1. Complicated Cataract.', type: 'main' },
        { text: '2. Secondary Glaucoma.', type: 'main' },
        { text: '3. Consecutive Optic Atrophy.', type: 'main' }
      ]
    }
  },
  {
    id: '149',
    category: 'retina',
    question: 'How is CRVO treated and monitored?',
    explanation: `**CRVO Treatment**
1. **علاجي**: بنعالج السبب (ضغط أو سكر) وندّي مميعات للدم (Aspirin).
2. **المتابعة**: لازم نعمل أشعة صبغة (FA) كل فترة عشان لو بدأ يطلع أوعية دموية جديدة نلحقها بالليزر قبل ما تعمل جلوكوما.
3. **الحقن**: لو فيه تورم في الماكولا بنحقن Anti-VEGF.`,
    answer: {
      title: 'CRVO Treatment & Monitoring',
      content: [
        { text: 'Identify cause: Measure BP, IOP, Blood sugar, CBC.', type: 'main' },
        { text: 'Blood thinning: Aspirin or anticoagulants.', type: 'sub' },
        { text: 'Monitoring: Fluorescein angiography (FA) after 3 months to detect neovascularization.', type: 'sub' },
        { text: 'Surgery: Laser for DME/NV; Vitrectomy for hemorrhage/RD.', type: 'example' }
      ]
    }
  }
];
