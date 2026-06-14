import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, CheckCircle, Infinity as InfinityIcon, Zap, Sparkles, Flame } from 'lucide-react';
import SupportModal from '../components/ui/SupportModal';
import { Button } from '../components/ui/Button';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useData } from '../context/DataContext';

export default function AvailableCourses() {
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();
  const { courses, loading: dataLoading } = useData();
  const [config, setConfig] = useState({ telegramUser: 'Clinoma_Admins', whatsappNumber: '01039322938', preferredContact: 'telegram' });
  const [isTelegramOpen, setIsTelegramOpen] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configSnap = await getDoc(doc(db, 'settings', 'general'));
        if (configSnap.exists()) setConfig(configSnap.data() as any);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConfig();
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

      {dataLoading ? (
        <div className="flex justify-center p-20">
          <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin shadow-2xl" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {courses.map((plan, idx) => {
            const features = plan.details ? plan.details.split('\n').filter((f: string) => f.trim() !== '') : [];
            const color = colors[idx % colors.length];
            const isOphth = plan.id === 'ophthalmology_flash_space';

            return (
              <div 
                key={plan.id}
                className={`group bg-card border-2 ${
                  isOphth
                    ? 'border-orange-500/50 shadow-orange-500/20 bg-gradient-to-br from-white via-orange-50/10 to-amber-50/5 dark:from-slate-900 dark:via-orange-950/5'
                    : plan.isFlashSpace 
                      ? 'border-indigo-500/50 shadow-indigo-500/20' 
                      : color.border
                } p-10 rounded-[3.5rem] relative flex flex-col shadow-2xl transition-all hover:-translate-y-4 hover:shadow-primary/5`}
              >
                {isOphth ? (
                  <div className="absolute -top-4 left-10 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-xs font-black px-6 py-2 rounded-full shadow-xl flex items-center gap-2 z-10 animate-pulse">
                    <Flame className="w-4 h-4 fill-current text-yellow-300 animate-pulse" />
                    <span>60 ج 🔥</span>
                  </div>
                ) : plan.trending ? (
                  <div className="absolute -top-4 left-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black px-6 py-2 rounded-full shadow-xl flex items-center gap-2 z-10 animate-pulse">
                    <Zap className="w-4 h-4 fill-current" />
                    رائج الآن
                  </div>
                ) : null}
                
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 flex items-center gap-2">
                      LEVEL {plan.level?.toUpperCase()}
                      {plan.isFlashSpace && (
                        <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${isOphth ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {isOphth ? <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> : <Sparkles className="w-3 h-3" />}
                          FLASH SPACE
                        </span>
                      )}
                    </div>
                    <h3 className="text-4xl font-black">{plan.name}</h3>
                    {isOphth && plan.price && (
                      <div className="flex items-center gap-2 mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-1.5 rounded-2xl text-lg font-black w-fit animate-bounce" dir="rtl">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                        <span>السعر: {plan.price} جنيه فقط 🔥</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 ${isOphth ? 'bg-gradient-to-r from-orange-500 to-rose-500' : color.primary} text-white rounded-3xl shadow-lg`}>
                    {isOphth ? <Flame className="w-8 h-8 text-yellow-300 fill-current animate-pulse" /> : <Crown className="w-8 h-8" />}
                  </div>
                </div>

                <div className="h-px w-full bg-border mb-10" />

                <ul className="space-y-6 mb-12 flex-1" dir="rtl">
                  {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-4 group/item">
                      <div className={`w-6 h-6 rounded-lg ${isOphth ? 'bg-gradient-to-r from-orange-500 to-rose-500' : color.primary} text-white flex items-center justify-center shrink-0 shadow-lg`}>
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
                  onClick={() => {
                    if (plan.isFlashSpace) {
                      const modParam = plan.flashSpaceModule ? `?module=${encodeURIComponent(plan.flashSpaceModule)}` : '';
                      navigate(`/flashcards/space${modParam}`);
                    } else {
                      navigate(`/course/${plan.id}`);
                    }
                  }}
                  className={`w-full py-6 rounded-3xl font-black text-2xl shadow-2xl transition-all active:scale-95 ${
                    isOphth 
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 shadow-orange-500/20 hover:from-orange-600 hover:to-rose-600' 
                      : plan.isFlashSpace 
                        ? 'bg-indigo-600 shadow-indigo-600/20' 
                        : color.primary
                  } text-white ${plan.isFlashSpace && !isOphth ? '' : color.shadow} hover:shadow-2xl hover:scale-[1.02]`}
                >
                  ابدأ الدراسة الآن
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-[3rem] space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-black">لا توجد كورسات متاحة حالياً</h2>
          <p className="text-muted-foreground font-medium">سيتم إضافة كورسات جديدة قريباً، ابقَ متيقظاً!</p>
          <Button onClick={() => window.location.reload()} variant="outline">تحديث الصفحة</Button>
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
