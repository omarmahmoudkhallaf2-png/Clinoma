import { Database, GraduationCap, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuestionBanksPortal() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Visual background lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex p-3 bg-primary/15 rounded-3xl text-primary border border-primary/20 animate-pulse">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">بنوك الأسئلة الطبية</h1>
          <p className="text-muted-foreground font-bold leading-relaxed">
            مرحباً بك في مستودع الأسئلة لـ CLINOMA. يرجى اختيار الدفعة الدراسية للانتقال مباشرة إلى بنك الأسئلة المخصص لها.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Batch 43 Card */}
          <motion.button
            variants={itemVariants}
            onClick={() => window.open('https://pediatrics-qbank-clinoma-support.pages.dev/', '_blank')}
            className="group relative p-8 rounded-[2.5rem] bg-card/45 backdrop-blur-xl border border-border/80 hover:border-primary/50 text-right transition-all hover:shadow-2xl hover:shadow-primary/10 flex flex-col justify-between h-[300px] overflow-hidden"
          >
            {/* Accent glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-primary/10 border border-primary/25 rounded-full text-[10px] font-black text-primary uppercase">الدفعة 43</span>
              </div>
              <h2 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">بنوك أسئلة الدفعة 43</h2>
              <p className="text-muted-foreground text-sm font-bold leading-relaxed">
                اضغط هنا للدخول الفوري إلى بنك أسئلة الدفعة 43، وتشمل بنك أسئلة الأطفال وبنك أسئلة الرمد المتكامل بالتعاون مع سبورت.
              </p>
            </div>

            <div className="flex items-center gap-2 text-primary font-black text-sm group-hover:translate-x-[-8px] transition-transform relative z-10">
              <span>دخول للبنك الآن</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </motion.button>

          {/* Batch 44 Card */}
          <motion.button
            variants={itemVariants}
            onClick={() => window.open('https://clinomabank-44.pages.dev/', '_blank')}
            className="group relative p-8 rounded-[2.5rem] bg-card/45 backdrop-blur-xl border border-border/80 hover:border-purple-500/50 text-right transition-all hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between h-[300px] overflow-hidden"
          >
            {/* Accent glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center">
                <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/25 rounded-full text-[10px] font-black text-purple-400 uppercase">الدفعة 44</span>
              </div>
              <h2 className="text-2xl font-black text-foreground group-hover:text-purple-500 transition-colors">بنوك أسئلة الدفعة 44</h2>
              <p className="text-muted-foreground text-sm font-bold leading-relaxed">
                اضغط هنا للدخول الفوري إلى بنك أسئلة الدفعة 44 الجديد المتكامل.
              </p>
            </div>

            <div className="flex items-center gap-2 text-purple-500 font-black text-sm group-hover:translate-x-[-8px] transition-transform relative z-10">
              <span>دخول للبنك الآن</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
