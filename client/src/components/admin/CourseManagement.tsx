import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Loader2, X, BookOpen } from 'lucide-react';
import SubjectManagerModal from './SubjectManagerModal';

interface CourseManagementProps {
  onDeleteCourse?: (id: string) => Promise<void>;
  isDeletingId?: string | null;
}

export default function CourseManagement({ onDeleteCourse, isDeletingId }: CourseManagementProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [selectedCourseForSubjects, setSelectedCourseForSubjects] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    details: '',
    level: 'F1',
    subjects: '', // Comma separated subjects
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'courses'), orderBy('level'));
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), formData);
      } else {
        await addDoc(collection(db, 'courses'), { ...formData, createdAt: new Date() });
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      console.error('Save error:', err);
      alert('Error saving course: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({ 
      name: course.name, 
      price: course.price, 
      details: course.details, 
      level: course.level,
      subjects: course.subjects || ''
    });
    setIsModalOpen(true);
  };

  const [courseToDelete, setCourseToDelete] = useState<any | null>(null);

  const handleDelete = async (course: any) => {
    setCourseToDelete(course);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    const id = courseToDelete.id;
    
    try {
      if (onDeleteCourse) {
        await onDeleteCourse(id);
      } else {
        await deleteDoc(doc(db, 'courses', id));
      }
      setCourseToDelete(null);
      fetchCourses();
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
      setCourseToDelete(null);
    }
  };

  const openNew = () => {
    setEditingCourse(null);
    setFormData({ name: '', price: '', details: '', level: 'F1', subjects: '' });
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">إدارة الكورسات</h2>
          <p className="text-muted-foreground font-bold">أضف وعدل أسماء، أسعار وتفاصيل الكورسات المتاحة</p>
        </div>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          إضافة كورس جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4 relative group">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button onClick={() => setSelectedCourseForSubjects(course)} className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg hover:bg-indigo-600 transition-all" title="إدارة المواد">
                <BookOpen className="w-4 h-4" />
              </button>
              <button onClick={() => handleEdit(course)} className="p-3 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-all" title="تعديل">
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(course)} 
                disabled={isDeletingId === course.id}
                className="p-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isDeletingId === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="inline-block px-3 py-1 bg-secondary/50 rounded-lg text-xs font-black uppercase tracking-widest text-muted-foreground">
              {course.level}
            </div>
            <h3 className="text-2xl font-black text-foreground">{course.name}</h3>
            <p className="text-3xl font-black text-primary">{course.price} <span className="text-sm text-muted-foreground uppercase">EGP</span></p>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed whitespace-pre-line border-t border-border pt-4">
              {course.details}
            </p>
          </div>
        ))}
      </div>

      {/* Course Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-border overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/30">
              <h2 className="text-xl font-black">{editingCourse ? 'تعديل الكورس' : 'إضافة كورس'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-background rounded-full hover:bg-secondary"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground text-right block">المستوى / الفرقة (مثال: F1, F2)</label>
                <input 
                  type="text" 
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value.toUpperCase()})}
                  className="w-full bg-secondary/30 border border-border p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary uppercase text-right"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground text-right block">اسم الكورس (مثال: كورس الفرقة الأولى الشامل)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-secondary/30 border border-border p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary text-right"
                  dir="rtl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground text-right block">السعر (EGP)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-secondary/30 border border-border p-4 rounded-2xl font-black outline-none focus:ring-2 focus:ring-primary text-right"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground text-right block">التفاصيل (كل سطر يعتبر ميزة منفصلة)</label>
                <textarea 
                  value={formData.details}
                  onChange={e => setFormData({...formData, details: e.target.value})}
                  rows={3}
                  className="w-full bg-secondary/30 border border-border p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary text-right"
                  dir="rtl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground text-right block">المواد (افصل بين كل مادة بفاصلة ,)</label>
                <textarea 
                  value={formData.subjects}
                  onChange={e => setFormData({...formData, subjects: e.target.value})}
                  placeholder="Anatomy, Physiology, Histology..."
                  rows={2}
                  className="w-full bg-secondary/30 border border-border p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary text-right"
                  dir="rtl"
                />
              </div>

              <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-all">
                {editingCourse ? 'حفظ التعديلات' : 'إضافة الكورس'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-[3rem] p-10 text-center space-y-8 border-2 border-red-500/20 shadow-2xl animate-in zoom-in-95">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black">حذف الكورس؟</h3>
              <p className="text-muted-foreground font-bold leading-relaxed">
                هل أنت متأكد من حذف <span className="text-foreground">"{courseToDelete.name}"</span>؟<br/>
                هذا الإجراء لا يمكن التراجع عنه.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setCourseToDelete(null)}
                className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-black hover:bg-secondary/80 transition-all"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Subject Manager Modal */}
      {selectedCourseForSubjects && (
        <SubjectManagerModal
          courseId={selectedCourseForSubjects.id}
          courseName={selectedCourseForSubjects.name}
          onClose={() => setSelectedCourseForSubjects(null)}
        />
      )}
    </div>
  );
}
