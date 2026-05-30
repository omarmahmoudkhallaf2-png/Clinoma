import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, GraduationCap, ArrowRight, ExternalLink, Sparkles, BookOpen, Clock, Lock } from 'lucide-react';

export default function QuestionBanksPortal() {
  const [selectedBatch, setSelectedBatch] = useState<'43' | '44' | null>(null);

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
            مرحباً بك في مستودع الأسئلة لـ CLINOMA. يرجى اختيار الدفعة الدراسية لعرض بنك الأسئلة الخاص بها.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedBatch ? (
            // Phase 1: Choose Batch
            <motion.div
              key="choose-batch"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Batch 43 Card */}
              <motion.button
                variants={itemVariants}
                onClick={() => setSelectedBatch('43')}
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
                  <h2 className="text-2xl font-black text-foreground">بنوك أسئلة الدفعة 43</h2>
                  <p className="text-muted-foreground text-sm font-bold leading-relaxed">
                    اضغط هنا لاستعراض بنوك الأسئلة المتاحة لطلاب الدفعة 43، وتشمل بنك أسئلة الأطفال وبنك أسئلة الرمد المتكامل.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-primary font-black text-sm group-hover:translate-x-[-8px] transition-transform relative z-10">
                  <span>استعراض البنوك</span>
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </div>
              </motion.button>

              {/* Batch 44 Card */}
              <motion.button
                variants={itemVariants}
                onClick={() => setSelectedBatch('44')}
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
                  <h2 className="text-2xl font-black text-foreground">بنوك أسئلة الدفعة 44</h2>
                  <p className="text-muted-foreground text-sm font-bold leading-relaxed">
                    اضغط هنا لاستعراض بنوك الأسئلة المخصصة للدفعة 44 الجديدة. سيتم ربط البنك فور توفر الرابط الرسمي.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-purple-500 font-black text-sm group-hover:translate-x-[-8px] transition-transform relative z-10">
                  <span>استعراض البنوك</span>
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </div>
              </motion.button>
            </motion.div>
          ) : (
            // Phase 2: Show Content for Chosen Batch
            <motion.div
              key="batch-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <button
                onClick={() => setSelectedBatch(null)}
                className="flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لاختيار الدفعة</span>
              </button>

              {selectedBatch === '43' ? (
                // Batch 43 Content
                <div className="bg-card border border-border/80 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground">بنوك أسئلة الدفعة 43 المتوفرة</h3>
                      <p className="text-xs text-muted-foreground font-bold">بنوك معتمدة بالكامل ومتاحة حالياً للدراسة</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Pediatrics & Ophthalmology Card */}
                    <div className="p-6 bg-slate-900/40 border border-border hover:border-primary/30 rounded-2xl flex flex-col justify-between gap-4 group transition-all">
                      <div className="space-y-2">
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[8px] font-black rounded-full inline-block">مجاني</span>
                        <h4 className="font-black text-base text-foreground group-hover:text-primary transition-colors">بنك أسئلة الأطفال والرمد</h4>
                        <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                          بنك أسئلة الأطفال والعيون المتكامل بالتعاون مع سبورت (متاح لجميع الطلاب مجاناً).
                        </p>
                      </div>

                      <button
                        onClick={() => window.open('https://pediatrics-qbank-clinoma-support.pages.dev/', '_blank')}
                        className="w-full py-3 bg-secondary text-foreground hover:bg-primary hover:text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 border border-border"
                      >
                        <span>فتح البنك في نافذة جديدة</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Batch 44 Content (Placeholder)
                <div className="bg-card border border-border/80 p-10 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                  
                  <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-3xl flex items-center justify-center mx-auto border border-purple-500/20">
                    <Clock className="w-8 h-8 animate-spin-slow" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-xl font-black text-foreground">قريباً جداً! 🚀</h3>
                    <p className="text-muted-foreground text-sm font-bold leading-relaxed">
                      جاري تجهيز وربط بنك الأسئلة المخصص للدفعة 44 فور إرسال الرابط وتفعيله من قبل إدارة CLINOMA.
                    </p>
                  </div>

                  <div className="p-4 bg-muted/40 border border-border/60 rounded-2xl max-w-sm mx-auto flex items-center gap-3 text-right">
                    <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-foreground">في انتظار تزويد الرابط</div>
                      <div className="text-[10px] text-muted-foreground font-bold">بمجرد تزويد الرابط سيتم تفعيله فوراً لجميع المشتركين.</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
