import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, ArrowRight, User as UserIcon, Loader2 } from 'lucide-react';

export default function CompleteProfile() {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateUserStatus } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().split(' ').length < 2) {
      alert('يرجى إدخال اسمك الثنائي على الأقل باللغة العربية');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        await updateUserStatus(user.uid, { 
          displayName_ar: fullName.trim(),
          profileCompleted: true 
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-[3rem] shadow-2xl space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mb-2">
            <Brain className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">أهلاً بك في CLINOMA</h1>
          <p className="text-slate-400 font-bold">يرجى إكمال بياناتك للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block text-right">الاسم الثنائي (باللغة العربية)</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: يوسف محمد"
                className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-primary transition-all text-right"
                dir="rtl"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <span>دخول للمنصة</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs font-bold">سيتم تسجيلك في لوحة التحكم بهذا الاسم</p>
      </div>
    </div>
  );
}
