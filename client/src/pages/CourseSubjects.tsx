import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ChevronRight, BookOpen, Clock, Loader2, ArrowLeft } from 'lucide-react';

export default function CourseSubjects() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      if (courseId === 'clinical_nutrition_course') {
        setCourse({
          name: 'التغذية الإكلينيكية (Clinical Nutrition)',
          description: 'بنك أسئلة مادة التغذية الإكلينيكية الشامل مقسم إلى شباتر الكتاب الأصلية.'
        });
        setSubjects([
          {
            id: 'clinical_nutrition_subject',
            name: 'Clinical Nutrition MCQ Bank',
            courseId: 'clinical_nutrition_course'
          }
        ]);
        setLoading(false);
        return;
      }
      if (courseId === 'pediatrics_course') {
        setCourse({
          name: 'طب الأطفال البصري (TIP Pediatrics)',
          description: 'تصفح تخصصات طب الأطفال الفرعية بمجلدات اللوحات البصرية والشروحات والأسئلة.'
        });
        setSubjects([
          { id: 'first_paper_camp', name: '🔥 معسكر الورقة الأولى (First Paper Camp)', courseId: 'pediatrics_course' },
          { id: 'cardiovascular_diseases', name: 'أمراض القلب للأطفال (Cardiovascular)', courseId: 'pediatrics_course' },
          { id: 'endocrinology', name: 'الغدد الصماء (Endocrinology)', courseId: 'pediatrics_course' },
          { id: 'gastroenterology_hepatology', name: 'الجهاز الهضمي والكبد (Gastroenterology & Hepatology)', courseId: 'pediatrics_course' },
          { id: 'genetic_diseases', name: 'الأمراض الوراثية (Genetic Diseases)', courseId: 'pediatrics_course' },
          { id: 'growth_development', name: 'النمو والتطور (Growth & Development)', courseId: 'pediatrics_course' },
          { id: 'hematology_oncology', name: 'أمراض الدم والأورام (Hematology & Oncology)', courseId: 'pediatrics_course' },
          { id: 'infections', name: 'الأمراض المعدية (Infections)', courseId: 'pediatrics_course' },
          { id: 'neurology', name: 'أمراض الأعصاب (Neurology)', courseId: 'pediatrics_course' },
          { id: 'nutrition', name: 'التغذية (Nutrition)', courseId: 'pediatrics_course' },
          { id: 'renal_diseases', name: 'أمراض الكلى للأطفال (Renal Diseases)', courseId: 'pediatrics_course' }
        ]);
        setLoading(false);
        return;
      }
      if (courseId === 'ophthalmology_course') {
        setCourse({
          name: 'طب وجراحة العيون (Ophthalmology)',
          description: 'تصفح منهج طب وجراحة العيون (الرمد) الموزع بين النظري والعملي بكروت الاستذكار التفاعلية.'
        });
        setSubjects([
          { id: 'ophthalmology_practical', name: 'عملي الرمد (Ophthalmology Practical)', courseId: 'ophthalmology_course' },
          { id: 'ophthalmology_written', name: 'نظري الرمد (Ophthalmology Written)', courseId: 'ophthalmology_course' }
        ]);
        setLoading(false);
        return;
      }
      try {
        const cSnap = await getDoc(doc(db, 'courses', courseId));
        if (cSnap.exists()) setCourse(cSnap.data());

        const q = query(collection(db, 'subjects'), where('courseId', '==', courseId));
        const sSnap = await getDocs(q);
        setSubjects(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative h-[300px] bg-primary flex items-end p-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-10 left-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all">
            <ArrowLeft />
          </button>
        </div>
        <div className="relative z-10 text-white space-y-2">
          <h1 className="text-5xl font-black">{course?.name} Curriculum</h1>
          <p className="text-white/70 font-bold max-w-2xl">{course?.description?.split('\n')[0]}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 grid grid-cols-1 md:grid-cols-2 gap-8">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => {
              if (sub.id === 'first_paper_camp') {
                navigate('/flashcards', { state: { selectSystem: 'معسكر الورقة الأولى' } });
              } else {
                navigate(`/course/${courseId}/subject/${sub.id}/lectures`);
              }
            }}
            className="p-8 bg-card border-2 border-border rounded-[3rem] shadow-xl hover:scale-[1.02] hover:border-primary transition-all text-left group flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black">{sub.name}</h3>
                <p className="text-muted-foreground font-bold text-sm">Explore lectures, notes and practice questions.</p>
              </div>
            </div>
            <ChevronRight className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
