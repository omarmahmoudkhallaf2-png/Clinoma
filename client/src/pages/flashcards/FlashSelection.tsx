import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const FlashSelection = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Flash Cards',
      description: 'Master your medical knowledge with spaced repetition and smart active recall.',
      icon: Brain,
      path: '/flashcards/decks',
      color: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      badge: 'Spaced Repetition'
    },
    {
      title: 'Flash Space',
      description: 'High-end interactive study boards for anatomy, ophthalmology, and visual diagnostics.',
      icon: Layers,
      path: '/flashcards/space',
      color: 'from-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      badge: 'Interactive Workspace',
      isNew: true
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gradient-to-br from-background to-accent/20">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4" />
            Study Methods
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black tracking-tight"
          >
            Choose Your <span className="text-primary">Flash</span> Mode
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Select the study method that best suits your current learning goals. Switch between active recall and visual interactive study.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {options.map((option, idx) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              onClick={() => navigate(option.path)}
              className={cn(
                "group relative p-8 rounded-[2.5rem] bg-card border-2 border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden shadow-xl",
                option.shadow,
                "hover:shadow-2xl hover:-translate-y-2"
              )}
            >
              {/* Background Glow */}
              <div className={cn(
                "absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-3xl",
                option.color
              )} />

              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
                    option.color
                  )}>
                    <option.icon className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground bg-muted px-3 py-1 rounded-full border">
                      {option.badge}
                    </span>
                    {option.isNew && (
                      <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
                        New Feature
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight group-hover:text-primary transition-colors">
                    {option.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {option.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
                  <span>Enter Workspace</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                 <option.icon className="w-full h-full transform translate-x-1/4 translate-y-1/4 -rotate-12" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Premium study workspace for medical professionals
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default FlashSelection;
