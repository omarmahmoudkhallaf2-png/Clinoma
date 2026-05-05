import { useState, useEffect } from 'react';
import type { Question } from '../../types/quiz';
import { Save, X, ImagePlus } from 'lucide-react';
import { db, storage } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface QuestionFormProps {
  initialData?: Question | null;
  onSave: (data: Omit<Question, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function QuestionForm({ initialData, onSave, onCancel }: QuestionFormProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    category: 'Anatomy',
    folder: 'f1' as string,
    lectureNumber: 1,
    questionType: 'practice' as string,
    showInFree: false,
    imageUrl: '',
    isPremium: true,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        const MAX_DIM = 1000;
        if (width > height && width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        if (compressedBase64.length > 950000) {
          alert('الصورة معقدة وكبيرة جداً حتى بعد الضغط. يرجى استخدام صورة أبسط.');
          setUploadingImage(false);
          return;
        }
        
        setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
        setUploadingImage(false);
      };
      img.onerror = () => {
        alert('حدث خطأ أثناء معالجة الصورة');
        setUploadingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'courses')));
        if (!snap.empty) {
          const coursesData = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
          setCourses(coursesData);
        } else {
          setCourses([
            { id: 'f1', name: 'F1 Premium', level: 'f1' },
            { id: 'f2', name: 'F2 Premium', level: 'f2' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        text: initialData.text,
        options: [...initialData.options],
        correctAnswer: initialData.correctAnswer,
        explanation: initialData.explanation,
        category: initialData.category || 'Anatomy',
        folder: initialData.folder || 'f1',
        lectureNumber: initialData.lectureNumber || 1,
        questionType: initialData.questionType || 'practice',
        showInFree: initialData.showInFree || false,
        imageUrl: initialData.imageUrl || '',
        isPremium: !['f1_free', 'f2_free'].includes(initialData.folder || ''),
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (name === 'lectureNumber') {
      val = parseInt(value, 10);
    }
    
    setFormData((prev) => {
      const next = { ...prev, [name]: val };
      
      if (name === 'folder') {
        // Find the selected course
        const selectedCourse = courses.find(c => c.level?.toLowerCase() === value.replace('_free', '').toLowerCase());
        
        if (selectedCourse?.subjects) {
          const firstSubject = selectedCourse.subjects.split(',')[0].trim();
          next.category = firstSubject;
        }
      }
      return next;
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              {initialData ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
            </h2>
            <p className="text-muted-foreground font-bold">املأ البيانات بدقة لضمان أفضل تجربة للطلاب.</p>
          </div>
        </div>
        <button type="button" onClick={onCancel} className="p-3 text-muted-foreground hover:bg-secondary rounded-2xl transition-all">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">الكورس المستهدف (Target Course)</label>
          <select
            name="folder"
            value={formData.folder}
            onChange={handleChange}
            className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl focus:border-primary outline-none font-black text-lg transition-all"
          >
            {courses.map(course => (
              <option key={course.id} value={course.level?.toLowerCase()}>
                {course.name} ({course.level?.toUpperCase()})
              </option>
            ))}
            <optgroup label="Free Sections">
              {courses.map(course => (
                <option key={`${course.id}_free`} value={`${course.level?.toLowerCase()}_free`}>
                  {course.name} (Free Trial)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">المادة التعليمية (Subject)</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-4 bg-secondary/30 border-2 border-border rounded-2xl focus:border-primary outline-none font-black text-lg transition-all"
          >
            {(() => {
              const selectedLevel = formData.folder.replace('_free', '').toLowerCase();
              const currentCourse = courses.find(c => c.level?.toLowerCase() === selectedLevel);
              
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
            <label className="block text-sm font-bold mb-2 text-right">نوع السؤال (Question Type)</label>
            <select
              name="questionType"
              value={formData.questionType}
              onChange={handleChange}
              className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-right"
              dir="rtl"
            >
              <option value="past_papers">أسئلة السنين السابقة (Past Papers)</option>
              <option value="lecture_book">أسئلة المحاضرات والكتاب (Lecture & Book)</option>
              <option value="practice">أسئلة تدريبية (Practice)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold mb-2 text-right">رقم المحاضرة (Lecture Number)</label>
            <select
              name="lectureNumber"
              value={formData.lectureNumber}
              onChange={handleChange}
              className="w-full p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-right"
              dir="rtl"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>محاضرة {n}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl justify-end">
            <label htmlFor="showInFree" className="font-bold text-sm cursor-pointer">
              إتاحة السؤال في النسخة المجانية والمدفوعة معاً (Shared)
            </label>
            <input
              type="checkbox"
              id="showInFree"
              name="showInFree"
              checked={formData.showInFree}
              onChange={handleChange}
              className="w-5 h-5 accent-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Question Text</label>
          <textarea
            name="text"
            required
            value={formData.text}
            onChange={handleChange}
            className="w-full h-32 p-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
            placeholder="Enter the medical case or question..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-right">صورة السؤال (اختياري)</label>
          <div 
            className={`relative w-full min-h-[160px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 p-6 transition-all text-center group focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent outline-none
              ${uploadingImage ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary hover:bg-secondary/30'}
            `}
            tabIndex={0}
            onPaste={(e) => {
              const item = e.clipboardData.items[0];
              if (item?.type.includes('image')) {
                e.preventDefault();
                const blob = item.getAsFile();
                if (blob) handleImageUpload(blob);
              }
            }}
          >
            {uploadingImage ? (
              <>
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="font-black text-primary animate-pulse text-lg">جاري رفع الصورة...</p>
                <p className="text-muted-foreground font-bold text-sm">برجاء الانتظار ثواني معدودة</p>
              </>
            ) : formData.imageUrl ? (
              <div className="relative w-full flex items-center justify-center">
                <img src={formData.imageUrl} alt="Preview" className="max-h-64 object-contain rounded-xl shadow-md" />
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, imageUrl: '' })); }}
                  className="absolute -top-3 -right-3 p-2 bg-destructive text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                  title="حذف الصورة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <ImagePlus className="w-8 h-8" />
                </div>
                <p className="font-black text-lg">اضغط هنا أو قم بلصق الصورة <kbd className="font-mono bg-background px-2 py-1 rounded-lg border border-border text-sm mx-1 shadow-sm">Ctrl+V</kbd></p>
                <p className="text-muted-foreground font-bold text-sm">أو اضغط لاختيار ملف من جهازك</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = '';
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Options</label>
          {formData.options.map((option, idx) => (
            <input
              key={idx}
              type="text"
              required
              value={option}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder={`Option ${idx + 1}`}
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Correct Answer</label>
          <select
            name="correctAnswer"
            required
            value={formData.correctAnswer}
            onChange={handleChange}
            className="w-full p-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">Select correct option</option>
            {formData.options.map((opt, idx) => (
              <option key={idx} value={opt} disabled={!opt}>
                {opt || `Option ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Explanation</label>
          <textarea 
            name="explanation"
            required
            value={formData.explanation}
            onChange={handleChange}
            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-foreground bg-secondary hover:bg-secondary/80 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}
