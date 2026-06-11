import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain, TrendingUp, CheckCircle,
  ArrowRight, Sparkles,
  Zap, Shield, Users, Star
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import SupportModal from '../components/ui/SupportModal';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [config, setConfig] = useState({ telegramUser: 'Clinoma_Admins', whatsappNumber: '01039322938', preferredContact: 'telegram' });
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configSnap = await getDoc(doc(db, 'settings', 'general'));
        if (configSnap.exists()) setConfig(configSnap.data() as any);

        const snap = await getDocs(query(collection(db, 'courses')));
        const coursesData = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setCourses(coursesData.sort((a, b) => (a.level || '').localeCompare(b.level || '')));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full flex flex-col min-h-screen bg-background selection:bg-primary selection:text-white">
      {/* Intelligent Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="group-hover:scale-110 transition-transform duration-500">
              <img src="/favicon.png" alt="Clinoma Logo" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tighter">CLINOMA</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/available" className="hidden md:block font-bold text-sm text-muted-foreground hover:text-primary transition-colors">Courses</Link>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-primary text-white rounded-full font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                Dashboard
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="font-bold text-sm">Login</Link>
                <Link to="/register" className="px-6 py-2.5 bg-primary text-white rounded-full font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero: Personalized Context */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-10 relative">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-secondary/50 backdrop-blur-md rounded-full border border-border animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">The Future of Medical Learning</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            Your Medical Journey <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-primary-dark">Starts Here.</span>
          </h1>

          <p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The only adaptive question bank designed specifically for your medical school journey. Real-time analytics, spaced repetition, and thousands of expert-crafted questions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link to="/register" className="w-full sm:w-auto px-16 py-6 bg-primary text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
              <span>ابدأ الآن 🚀</span>
            </Link>
          </div>
        </div>
      </section>



      {/* Courses Explore: Premium Cards */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-black tracking-tight">Explore Our Programs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Choose the curriculum that matches your current academic year.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course) => (
              <div key={course.id} className="group p-10 bg-card border-2 border-border rounded-[4rem] shadow-sm hover:shadow-2xl hover:border-primary/40 transition-all relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative flex-1 space-y-6">
                  <div className="inline-block px-4 py-1 bg-secondary rounded-xl text-[10px] font-black uppercase tracking-widest text-primary">
                    LIFETIME ACCESS
                  </div>
                  <h3 className="text-3xl font-black">{course.name}</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-primary">{course.price}</span>
                    <span className="text-lg font-black text-muted-foreground mb-1 uppercase">EGP</span>
                  </div>
                  <ul className="space-y-4 pt-6 border-t border-border">
                    {course.details?.split('\n').slice(0, 4).map((line: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 font-bold text-sm text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" /> {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/register" className="mt-10 w-full py-5 bg-secondary text-foreground rounded-[2.5rem] font-black text-lg group-hover:bg-primary group-hover:text-white group-hover:scale-105 transition-all text-center">
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="hover:scale-110 transition-transform duration-500">
                <img src="/favicon.png" alt="Clinoma Logo" className="w-10 h-10 object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter">CLINOMA</span>
            </div>
            <p className="text-muted-foreground font-bold max-w-sm">The world's most advanced question bank for medical students. Built by doctors, for future doctors.</p>
          </div>
          <div>
            <h5 className="font-black mb-6 uppercase tracking-widest text-xs">Product</h5>
            <ul className="space-y-4 font-bold text-sm text-muted-foreground">
              <li><Link to="/available" className="hover:text-primary transition-colors">Courses</Link></li>
              <li><Link to="/quiz-setup" className="hover:text-primary transition-colors">Question Bank</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black mb-6 uppercase tracking-widest text-xs">Support</h5>
            <ul className="space-y-4 font-bold text-sm text-muted-foreground">
              <li><button onClick={() => setIsSupportOpen(true)} className="hover:text-primary transition-colors">Contact Support</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-border flex justify-between items-center text-xs font-black text-muted-foreground uppercase tracking-widest">
          <span>© 2026 CLINOMA Intelligence. All rights reserved.</span>
        </div>
      </footer>

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        telegramUser={config.telegramUser}
        whatsappNumber={config.whatsappNumber}
      />
    </div>
  );
}
