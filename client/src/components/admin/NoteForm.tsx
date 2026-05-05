import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

interface NoteFormProps {
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function NoteForm({ onSave, onCancel }: NoteFormProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    folder: 'f1_premium',
    lectureNumber: 1
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'courses')));
        if (!snap.empty) {
          const coursesData = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
          setCourses(coursesData);
          if (coursesData.length > 0) {
            const firstCourse = coursesData[0];
            const firstSubject = (firstCourse.subjects || '').split(',')[0].trim();
            setFormData(prev => ({ 
              ...prev, 
              folder: firstCourse.level?.toLowerCase() || 'f1',
              category: firstSubject || 'General'
            }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'folder') {
        const selectedCourse = courses.find(c => c.level?.toLowerCase() === value.replace('_premium','').replace('_free','').toLowerCase());
        if (selectedCourse?.subjects) {
          next.category = selectedCourse.subjects.split(',')[0].trim();
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border-2 border-border rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center border-b border-border pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Save className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">إضافة نوتس جديدة</h2>
            <p className="text-muted-foreground font-bold">قم بإضافة محتوى تعليمي منسق للطلاب.</p>
          </div>
        </div>
        <button type="button" onClick={onCancel} className="p-3 text-muted-foreground hover:bg-secondary rounded-2xl transition-all">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">الكورس (Course)</label>
          <select 
            name="folder"
            value={formData.folder} 
            onChange={handleChange} 
            className="w-full bg-secondary/30 p-4 rounded-2xl border-2 border-border focus:border-primary outline-none font-black"
          >
            {courses.map(course => (
              <optgroup key={course.id} label={course.name}>
                <option value={`${course.level?.toLowerCase()}_premium`}>{course.level?.toUpperCase()} Premium</option>
                <option value={`${course.level?.toLowerCase()}_free`}>{course.level?.toUpperCase()} Free</option>
              </optgroup>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">المادة (Subject)</label>
          <select 
            name="category"
            value={formData.category} 
            onChange={handleChange} 
            className="w-full bg-secondary/30 p-4 rounded-2xl border-2 border-border focus:border-primary outline-none font-black"
          >
            {(() => {
              const level = formData.folder.replace('_premium','').replace('_free','').toLowerCase();
              const currentCourse = courses.find(c => c.level?.toLowerCase() === level);
              if (currentCourse?.subjects) {
                return currentCourse.subjects.split(',').map((s: string) => s.trim()).filter(Boolean).map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ));
              }
              return <option value="General">General</option>;
            })()}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">رقم المحاضرة (Lecture)</label>
          <select 
            name="lectureNumber"
            value={formData.lectureNumber} 
            onChange={e => setFormData({...formData, lectureNumber: parseInt(e.target.value)})} 
            className="w-full bg-secondary/30 p-4 rounded-2xl border-2 border-border focus:border-primary outline-none font-black"
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(l => <option key={l} value={l}>Lecture {l}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <input 
          name="title"
          value={formData.title} 
          onChange={handleChange} 
          className="w-full bg-secondary/30 p-5 rounded-2xl border-2 border-border focus:border-primary outline-none font-black text-xl" 
          placeholder="عنوان النوتس (e.g., Introduction to Anatomy)" 
        />
        <textarea 
          name="content"
          value={formData.content} 
          onChange={handleChange} 
          className="w-full h-80 bg-secondary/30 p-5 rounded-2xl border-2 border-border focus:border-primary outline-none font-medium leading-relaxed" 
          placeholder="المحتوى التعليمي (Support Markdown)..." 
        />
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className="w-full py-5 bg-primary text-white rounded-3xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? 'جاري الحفظ...' : 'حفظ النوتس'}
      </button>
    </form>
  );
}
