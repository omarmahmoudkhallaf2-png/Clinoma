import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

const FlashcardsDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold mb-2"
        >
          <Sparkles size={16} className="text-yellow-500" />
          البطاقات التعليمية المتاحة
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-blue-600 tracking-tight"
        >
          الفلاش كارد | Flashcards
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-lg max-w-lg mx-auto font-medium"
        >
          ادرس وحلِّل الحالات الطبية بذكاء وبطرق تفاعلية حديثة.
        </motion.p>
      </div>

      {/* Main Single Card OSCE 44 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative group max-w-xl mx-auto rounded-3xl p-8 bg-gradient-to-br from-card to-card/50 border border-border/80 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -left-24 -top-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-300" />
        
        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Brain size={40} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground">اوسكي 44</h2>
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              OSCE 44 CLINICAL CARDS
            </span>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            الفلاش كارد الرسمية والكاملة الخاصة بالاوسكي 44. تم إدراجها بدون أي تعديلات لضمان حصولك على المحتوى الأصلي.
          </p>

          <div className="w-full pt-4">
            <a
              href="/osce44/index.html"
              className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-3 hover:scale-[1.02]"
            >
              <BookOpen size={20} />
              ابدأ المذاكرة الآن
              <ArrowRight size={20} className="transform rotate-180" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlashcardsDashboard;
