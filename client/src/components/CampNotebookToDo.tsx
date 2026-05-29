import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle, ChevronRight, Sparkles, Check, RefreshCw, PenTool } from 'lucide-react';

interface CampNotebookToDoProps {
  initialDay?: number;
}

const CAMP_TODO_DATA = {
  1: [
    {
      chapter: 'I. GROWTH AND DEVELOPMENT',
      topics: [
        'Growth charts',
        'Development milestones during 1st 4 years',
        'Key warning signs & delayed milestones'
      ]
    },
    {
      chapter: 'II. NUTRITION',
      topics: [
        'Advantages of breast feeding & contraindication',
        'Nutritional disorders: Kwashiorkor & Marasmus',
        'Nutritional disorders: Rickets'
      ]
    },
    {
      chapter: 'III. GIT',
      topics: [
        "Cow's milk allergy in Pediatrics",
        'Vomiting in pediatrics',
        'Abdominal pain in pediatrics'
      ]
    },
    {
      chapter: 'IV. GENETIC DISEASES',
      topics: [
        'Chromosomal disorders: Down Syndrome',
        'Chromosomal disorders: Turner syndrome',
        'Prenatal diagnosis (importance, indications & types)'
      ]
    }
  ],
  2: [
    {
      chapter: 'V. ENDOCRINOLOGY',
      topics: [
        'Short stature',
        'Hypothyroidism',
        'Diabetes Mellitus Type 1 & DKA',
        'Childhood obesity'
      ]
    },
    {
      chapter: 'VI. HEMATOLOGY AND ONCOLOGY',
      topics: [
        'Iron deficiency anaemia',
        'Aplastic anaemia',
        'Chronic hemolytic anaemia',
        'RBC abnormalities: Spherocytosis',
        'RBC abnormalities: Thalassemias',
        'RBC abnormalities: G6PD deficiency',
        'Hemophilia',
        'ITP (Immune Thrombocytopenic Purpura)',
        'ALL & Prognostic factors',
        'Hodgkin lymphoma'
      ]
    }
  ],
  3: [
    {
      chapter: 'VII. CVS',
      topics: [
        'Acyanotic Heart: VSD (Part 1)',
        'Acyanotic Heart: VSD (Part 2)',
        'Acyanotic Heart: ASD',
        'Acyanotic Heart: PDA',
        'Cyanotic Heart: TGA',
        'Cyanotic Heart: Fallot / TOF',
        'Heart Failure'
      ]
    },
    {
      chapter: 'VIII. CNS',
      topics: [
        'Cerebral Palsy',
        'Floppy infant',
        'Duchenne muscle dystrophy',
        'Infection'
      ]
    }
  ]
};

export const CampNotebookToDo: React.FC<CampNotebookToDoProps> = ({ initialDay = 1 }) => {
  const [currentPage, setCurrentPage] = useState<'cover' | 1 | 2 | 3>('cover');
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('clinoma_camp_todo_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save progress
  const toggleCheckbox = (day: number, chapter: string, topic: string, type: 'study' | 'quiz' | 'review') => {
    const key = `${day}_${chapter}_${topic}_${type}`;
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    localStorage.setItem('clinoma_camp_todo_progress', JSON.stringify(newProgress));
  };

  // Helper to check if a specific checkbox is active
  const isChecked = (day: number, chapter: string, topic: string, type: 'study' | 'quiz' | 'review') => {
    return !!progress[`${day}_${chapter}_${topic}_${type}`];
  };

  // Helper to check if all 3 checkboxes for a topic are complete
  const isTopicComplete = (day: number, chapter: string, topic: string) => {
    return (
      isChecked(day, chapter, topic, 'study') &&
      isChecked(day, chapter, topic, 'quiz') &&
      isChecked(day, chapter, topic, 'review')
    );
  };

  // Calculate day progress percentage
  const getDayProgress = (day: 1 | 2 | 3) => {
    const chapters = CAMP_TODO_DATA[day];
    let totalItems = 0;
    let completedItems = 0;
    
    chapters.forEach(ch => {
      ch.topics.forEach(topic => {
        totalItems += 3; // study, quiz, review
        if (isChecked(day, ch.chapter, topic, 'study')) completedItems++;
        if (isChecked(day, ch.chapter, topic, 'quiz')) completedItems++;
        if (isChecked(day, ch.chapter, topic, 'review')) completedItems++;
      });
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-2 md:px-6 select-none" dir="rtl">
      {/* Dynamic Printing Style Block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #camp-notebook-todo-print-area, #camp-notebook-todo-print-area * {
            visibility: visible !important;
          }
          #camp-notebook-todo-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      {/* Notebook Wrapper */}
      <div className="relative min-h-[580px] bg-[#dcfce7] dark:bg-emerald-950/20 rounded-[2.5rem] p-4 md:p-8 shadow-2xl border-4 border-[#16a34a] flex flex-col md:flex-row gap-0 overflow-visible">
        
        {/* Notebook Wire Rings (Realistic 3D Metal Rings on Right for RTL) */}
        <div className="absolute right-0 top-10 bottom-10 w-8 flex flex-col justify-between items-center z-40 pointer-events-none pr-3 no-print">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="relative w-10 h-7 flex items-center justify-start my-1">
              {/* Paper Hole */}
              <div className="absolute left-2 w-3.5 h-3.5 rounded-full bg-slate-900 shadow-inner border border-slate-700/30" />
              {/* Wire Coil Ring */}
              <div className="absolute -left-1 w-8 h-4 rounded-full border-[3.5px] border-slate-350 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 shadow-md transform rotate-12" />
            </div>
          ))}
        </div>

        {/* Notebook Index Separator Tabs (Colored Tabs on Left Edge) */}
        <div className="absolute -left-3 top-24 bottom-24 w-12 flex flex-col gap-8 items-start z-30 no-print">
          <button 
            onClick={() => setCurrentPage('cover')}
            className={`w-12 py-6 rounded-l-2xl text-xs font-black transition-all shadow-md text-white ${
              currentPage === 'cover' 
                ? 'bg-amber-500 scale-[1.08] translate-x-1 shadow-lg' 
                : 'bg-amber-600/60 hover:bg-amber-500/80 hover:translate-x-1'
            }`}
          >
            📂 الغلاف
          </button>
          <button 
            onClick={() => setCurrentPage(1)}
            className={`w-12 py-6 rounded-l-2xl text-xs font-black transition-all shadow-md text-white ${
              currentPage === 1 
                ? 'bg-rose-500 scale-[1.08] translate-x-1 shadow-lg' 
                : 'bg-rose-600/60 hover:bg-rose-500/80 hover:translate-x-1'
            }`}
          >
            🥇 اليوم 1
          </button>
          <button 
            onClick={() => setCurrentPage(2)}
            className={`w-12 py-6 rounded-l-2xl text-xs font-black transition-all shadow-md text-white ${
              currentPage === 2 
                ? 'bg-indigo-500 scale-[1.08] translate-x-1 shadow-lg' 
                : 'bg-indigo-600/60 hover:bg-indigo-500/80 hover:translate-x-1'
            }`}
          >
            🥈 اليوم 2
          </button>
          <button 
            onClick={() => setCurrentPage(3)}
            className={`w-12 py-6 rounded-l-2xl text-xs font-black transition-all shadow-md text-white ${
              currentPage === 3 
                ? 'bg-emerald-500 scale-[1.08] translate-x-1 shadow-lg' 
                : 'bg-emerald-600/60 hover:bg-emerald-500/80 hover:translate-x-1'
            }`}
          >
            🥉 اليوم 3
          </button>
        </div>

        {/* Real Notebook Paper Sheet */}
        <div id="camp-notebook-todo-print-area" className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border border-slate-200/50 p-6 md:p-10 relative overflow-hidden mr-6 ml-2 min-h-[500px]">
          
          {/* Subtle notebook lines decoration */}
          <div className="absolute inset-0 bg-[linear-gradient(#f1f5f9_1px,transparent_1px)] bg-[size:100%_2.5rem] opacity-75 pointer-events-none z-0" />
          {/* Margin line */}
          <div className="absolute right-12 top-0 bottom-0 w-[2px] bg-rose-200 pointer-events-none z-0" />

          {/* Notebook Page Content */}
          <div className="relative z-10 h-full flex flex-col">
            
            {currentPage === 'cover' ? (
              // --- COVER PAGE VIEW ---
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-8 select-none">
                <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-500/20 animate-bounce">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-slate-400 tracking-wider font-mono">CLINOMA PLATFORM</h4>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 leading-tight py-2">
                    كشكول معسكر الورقة الأولى ⚡
                  </h1>
                  <p className="text-slate-500 text-sm font-semibold max-w-md mx-auto leading-relaxed">
                    جدول المذاكرة والتحصيل التفاعلي والمطور للأطفال. تتبع تقدمك يوماً بيوم واحصل على شرف التتويج! 📚🏆
                  </p>
                </div>

                {/* Hand-drawn style sticky note */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 rounded-3xl p-6 max-w-sm w-full shadow-md transform rotate-2">
                  <h5 className="font-black text-amber-800 dark:text-amber-400 text-lg mb-2 flex items-center justify-center gap-2">
                    <PenTool className="w-5 h-5" /> ملاحظة دراسية
                  </h5>
                  <p className="text-xs text-amber-700 dark:text-amber-300/80 font-bold leading-loose">
                    كل موضوع يحتوي على 3 مراحل أساسية: مذاكرة المحتوى البصري، حل بنك الأسئلة المخصص، ومراجعته لضمان التثبيت الكامل.
                  </p>
                </div>

                <div>
                  <button 
                    onClick={() => setCurrentPage(1)}
                    className="px-10 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-2xl font-black text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20"
                  >
                    افتح الكشكول وابدأ المذاكرة 📖
                  </button>
                </div>
              </div>
            ) : (
              // --- DAYS PAGES VIEW ---
              (() => {
                const day = currentPage as 1 | 2 | 3;
                const chapters = CAMP_TODO_DATA[day];
                const dayProgress = getDayProgress(day);
                
                return (
                  <div className="flex-1 flex flex-col justify-between h-full space-y-6">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-slate-100 pb-4 shrink-0 pr-8">
                      <div>
                        <div className="flex items-center gap-2 mb-2 no-print">
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-black">
                            معسكر الورقة الأولى ⚡
                          </div>
                          <button 
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] md:text-xs font-black transition-all"
                          >
                            📥 تحميل كـ PDF
                          </button>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-200">
                          جدول اليوم {day === 1 ? 'الأول 🥇' : day === 2 ? 'الثاني 🥈' : 'الثالث 🥉'}
                        </h2>
                      </div>
                      
                      {/* Cumulative progress block */}
                      <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">نسبة الإنجاز اليومي</p>
                          <p className="text-lg font-black text-slate-800 dark:text-slate-200">{dayProgress}%</p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner relative">
                          <svg className="w-12 h-12 transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="4" fill="transparent" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" className="text-rose-500" strokeWidth="4" fill="transparent"
                              strokeDasharray={2 * Math.PI * 20}
                              strokeDashoffset={2 * Math.PI * 20 * (1 - dayProgress / 100)}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Checkbox Category Columns Header */}
                    <div className="hidden md:flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-400 text-xs font-black uppercase tracking-wider shrink-0 pr-8">
                      <span className="w-2/5">الموضوع الدراسي</span>
                      <div className="w-3/5 flex justify-end gap-16 pl-6">
                        <span className="w-16 text-center">مذاكرة 📚</span>
                        <span className="w-16 text-center">حل أسئلة ✍️</span>
                        <span className="w-16 text-center">مراجعة 🔄</span>
                      </div>
                    </div>

                    {/* Chapters list */}
                    <div className="flex-1 overflow-y-auto pr-8 space-y-8 max-h-[380px] scrollbar-thin scrollbar-thumb-slate-200">
                      {chapters.map((ch, chIdx) => (
                        <div key={chIdx} className="space-y-4">
                          {/* Chapter Header */}
                          <div className="flex items-center gap-2 border-r-4 border-indigo-500 pr-3">
                            <h3 className="text-sm md:text-base font-black text-indigo-600 dark:text-indigo-400 uppercase font-mono tracking-wide">
                              {ch.chapter}
                            </h3>
                          </div>

                          {/* Topics List */}
                          <div className="space-y-3">
                            {ch.topics.map((topic, tIdx) => {
                              const complete = isTopicComplete(day, ch.chapter, topic);
                              
                              return (
                                <div 
                                  key={tIdx} 
                                  className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                                    complete 
                                      ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' 
                                      : 'bg-white dark:bg-slate-900 border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                  }`}
                                >
                                  {/* Topic Label */}
                                  <div className="relative w-full md:w-2/5 pr-1 py-1">
                                    <span className={`text-sm font-extrabold text-slate-700 dark:text-slate-300 transition-all ${
                                      complete ? 'line-through opacity-50 decoration-rose-500 decoration-2' : ''
                                    }`}>
                                      {topic}
                                    </span>
                                    {complete && (
                                      <div className="absolute right-0 top-1/2 w-full h-[2px] bg-rose-500/40 rounded transform -translate-y-1/2 rotate-[-1.5deg] pointer-events-none" />
                                    )}
                                  </div>

                                  {/* Checkboxes Row */}
                                  <div className="w-full md:w-3/5 flex justify-between md:justify-end gap-4 md:gap-16 mt-3 md:mt-0 pl-0 md:pl-6">
                                    {/* Study Box */}
                                    <button 
                                      onClick={() => toggleCheckbox(day, ch.chapter, topic, 'study')}
                                      className={`w-20 md:w-16 py-2 px-1 rounded-xl font-black text-[10px] md:text-xs flex flex-col items-center gap-1 transition-all ${
                                        isChecked(day, ch.chapter, topic, 'study')
                                          ? 'bg-amber-500 text-white shadow-md'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                                      }`}
                                    >
                                      <span>📚 ذاكرت</span>
                                      {isChecked(day, ch.chapter, topic, 'study') ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                                      )}
                                    </button>

                                    {/* Quiz Box */}
                                    <button 
                                      onClick={() => toggleCheckbox(day, ch.chapter, topic, 'quiz')}
                                      className={`w-20 md:w-16 py-2 px-1 rounded-xl font-black text-[10px] md:text-xs flex flex-col items-center gap-1 transition-all ${
                                        isChecked(day, ch.chapter, topic, 'quiz')
                                          ? 'bg-indigo-500 text-white shadow-md'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                                      }`}
                                    >
                                      <span>✍️ حليت</span>
                                      {isChecked(day, ch.chapter, topic, 'quiz') ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                                      )}
                                    </button>

                                    {/* Review Box */}
                                    <button 
                                      onClick={() => toggleCheckbox(day, ch.chapter, topic, 'review')}
                                      className={`w-20 md:w-16 py-2 px-1 rounded-xl font-black text-[10px] md:text-xs flex flex-col items-center gap-1 transition-all ${
                                        isChecked(day, ch.chapter, topic, 'review')
                                          ? 'bg-rose-500 text-white shadow-md'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                                      }`}
                                    >
                                      <span>🔄 راجعت</span>
                                      {isChecked(day, ch.chapter, topic, 'review') ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
