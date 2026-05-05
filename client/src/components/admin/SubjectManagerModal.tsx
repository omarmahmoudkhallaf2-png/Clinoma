import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { X, Plus, Edit2, Trash2, Loader2, BookOpen } from 'lucide-react';

interface SubjectManagerModalProps {
  courseId: string;
  courseName: string;
  onClose: () => void;
}

export default function SubjectManagerModal({ courseId, courseName, onClose }: SubjectManagerModalProps) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ name: '', lectureCount: 12 });
  const [saving, setSaving] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'subjects'), where('courseId', '==', courseId));
      const snap = await getDocs(q);
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [courseId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'subjects', editingId), {
          name: form.name,
          lectureCount: Number(form.lectureCount) || 12,
        });
      } else {
        await addDoc(collection(db, 'subjects'), {
          name: form.name,
          lectureCount: Number(form.lectureCount) || 12,
          courseId,
          createdAt: serverTimestamp()
        });
      }
      setForm({ name: '', lectureCount: 12 });
      setIsAdding(false);
      setEditingId(null);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟ سيتم مسحها فقط من العرض وليس الأسئلة المتعلقة بها.')) return;
    try {
      await deleteDoc(doc(db, 'subjects', id));
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-2xl rounded-[3rem] shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/30">
          <div>
            <h2 className="text-2xl font-black">إدارة مواد الكورس</h2>
            <p className="text-muted-foreground font-bold text-sm">{courseName}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-background rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {!isAdding && !editingId ? (
            <>
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full py-4 border-2 border-dashed border-primary/50 text-primary rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
              >
                <Plus className="w-5 h-5" /> إضافة مادة جديدة
              </button>

              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground font-bold">لا توجد مواد مضافة لهذا الكورس بعد.</div>
              ) : (
                <div className="space-y-3">
                  {subjects.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-4 bg-secondary/30 border border-border rounded-2xl group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black">{sub.name}</h4>
                          <p className="text-sm font-bold text-muted-foreground">{sub.lectureCount || 12} محاضرة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => {
                          setEditingId(sub.id);
                          setForm({ name: sub.name, lectureCount: sub.lectureCount || 12 });
                        }} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(sub.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-6 bg-secondary/10 p-6 rounded-3xl border border-border">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground block text-right">اسم المادة</label>
                <input 
                  type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: Anatomy"
                  className="w-full p-4 bg-card border border-border rounded-2xl font-bold outline-none focus:border-primary text-right" dir="auto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground block text-right">عدد المحاضرات</label>
                <input 
                  type="number" required min="1" max="50" value={form.lectureCount} onChange={e => setForm({ ...form, lectureCount: Number(e.target.value) })}
                  className="w-full p-4 bg-card border border-border rounded-2xl font-bold outline-none focus:border-primary text-right" dir="ltr"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); setForm({name: '', lectureCount: 12}); }}
                  className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-black hover:bg-border transition-all">
                  إلغاء
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
