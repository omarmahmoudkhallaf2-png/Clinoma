import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Crown, CheckCircle, Infinity as InfinityIcon } from 'lucide-react';
import SupportModal from '../components/ui/SupportModal';
import { db } from '../lib/firebase';
import { doc, getDoc, getDocs, collection, query } from 'firebase/firestore';

export default function AvailableCourses() {
  const { isSubscribed } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({ telegramUser: 'omarrkhallaf', whatsappNumber: '', preferredContact: 'telegram' });
  const [isTelegramOpen, setIsTelegramOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [configDoc, coursesSnap] = await Promise.all([
          getDoc(doc(db, 'settings', 'general')),
          getDocs(query(collection(db, 'courses')))
        ]);

        if (configDoc.exists()) setConfig(configDoc.data() as any);

        const coursesData = coursesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        coursesData.sort((a, b) => (a.level || '').localeCompare(b.level || ''));
        setCourses(coursesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const colors = [
    { primary: 'bg-primary', shadow: 'shadow-primary/20', border: 'border-primary/20', text: 'text-primary' },
    { primary: 'bg-blue-600', shadow: 'shadow-blue-600/20', border: 'border-blue-500/20', text: 'text-blue-600' },
    { primary: 'bg-purple-600', shadow: 'shadow-purple-600/20', border: 'border-purple-500/20', text: 'text-purple-600' },
    { primary: 'bg-emerald-600', shadow: 'shadow-emerald-600/20', border: 'border-emerald-500/20', text: 'text-emerald-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 p-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full font-black text-xs uppercase tracking-widest animate-bounce">
          <Crown className="w-4 h-4" />
          برامجنا التعليمية
        </div>
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter">
          اختر مستقبلك <span className="text-primary italic">اليوم</span>
        </h1>
        <p className="text-muted-foreground font-bold text-xl max-w-2xl mx-auto">
          احصل على وصول كامل لأفضل بنوك الأسئلة الطبية في الوطن العربي.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin shadow-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {courses.map((plan, idx) => {
            const subscribed = isSubscribed(plan.level);
            const features = plan.details ? plan.details.split('\n').filter((f: string) => f.trim() !== '') : [];
            const color = colors[idx % colors.length];

            return (
              <div 
                key={plan.id}
                className={`group bg-card border-2 ${color.border} p-10 rounded-[3.5rem] relative flex flex-col shadow-2xl transition-all hover:-translate-y-4 hover:shadow-primary/5`}
              >
                {subscribed && (
                  <div className="absolute -top-4 right-10 bg-emerald-500 text-white text-[10px] font-black px-6 py-2 rounded-full shadow-xl flex items-center gap-2 z-10">
                    <CheckCircle className="w-4 h-4" />
                    أنت مشترك الآن
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                      LEVEL {plan.level?.toUpperCase()}
                    </div>
                    <h3 className="text-4xl font-black">{plan.name}</h3>
                  </div>
                  <div className={`p-4 ${color.primary} text-white rounded-3xl shadow-lg`}>
                    <Crown className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="mb-10 flex items-baseline gap-2">
                  <span className={`text-7xl font-black tracking-tighter ${color.text}`}>{plan.price}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-muted-foreground tracking-widest">EGP</span>
                    <span className="text-xs font-bold text-muted-foreground italic">LIFE ACCESS</span>
                  </div>
                </div>

                <div className="h-px w-full bg-border mb-10" />

                <ul className="space-y-6 mb-12 flex-1" dir="rtl">
                  {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-4 group/item">
                      <div className={`w-6 h-6 rounded-lg ${color.primary} text-white flex items-center justify-center shrink-0 shadow-lg`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-lg">{f}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-4 group/item opacity-50 italic">
                    <div className={`w-6 h-6 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0`}>
                      <InfinityIcon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg">تحديثات دورية مجانية</span>
                  </li>
                </ul>

                <button 
                  disabled={subscribed}
                  onClick={() => setIsTelegramOpen(true)}
                  className={`w-full py-6 rounded-3xl font-black text-2xl shadow-2xl transition-all active:scale-95 ${
                    subscribed 
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed' 
                    : `${color.primary} text-white ${color.shadow} hover:shadow-2xl hover:scale-[1.02]`
                  }`}
                >
                  {subscribed ? 'تم تفعيل الاشتراك' : 'اشترك في الكورس'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <SupportModal 
        isOpen={isTelegramOpen}
        onClose={() => setIsTelegramOpen(false)}
        telegramUser={config.telegramUser}
        whatsappNumber={config.whatsappNumber}
      />
    </div>
  );
}
