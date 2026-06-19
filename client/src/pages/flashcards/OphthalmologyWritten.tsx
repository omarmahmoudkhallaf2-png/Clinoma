import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, Download, Copy, Search, Eye, EyeOff, Sparkles, HelpCircle, ChevronRight, FileText, CheckCircle, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth } from '../../lib/firebase';
import data from './ophth_written_data.json';

interface WrittenQuestion {
  id: string;
  type: string;
  question: string;
  answer: string;
}

interface WrittenChapter {
  id: number;
  title: string;
  titleAr?: string;
  questions: WrittenQuestion[];
}

interface WrittenData {
  chapters: WrittenChapter[];
}

const WRITTEN_DATA = data as WrittenData;

export default function OphthalmologyWritten({ onExit }: { onExit?: () => void }) {
  const [activeChapter, setActiveChapter] = useState<WrittenChapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [studyMode, setStudyMode] = useState<'answers' | 'practice'>('answers');
  
  // Back action
  const handleBack = () => {
    if (activeChapter) {
      setActiveChapter(null);
      setExpandedQuestions({});
    } else if (onExit) {
      onExit();
    } else {
      window.history.back();
    }
  };

  // Toggle individual answer visibility
  const toggleAnswer = (qId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Expand/collapse all answers in the current chapter/view
  const toggleAllAnswers = (questionsList: WrittenQuestion[], expand: boolean) => {
    const nextState: Record<string, boolean> = {};
    questionsList.forEach(q => {
      nextState[q.id] = expand;
    });
    setExpandedQuestions(nextState);
  };

  // Copy question and answer
  const handleCopy = (e: React.MouseEvent, q: WrittenQuestion) => {
    e.stopPropagation();
    const textToCopy = `Question: ${q.question}\n\nModel Answer:\n${q.answer}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success('تم نسخ السؤال والإجابة بنجاح! 📋');
  };

  // Get matching questions globally or in current chapter
  const getFilteredQuestions = () => {
    const list = activeChapter 
      ? activeChapter.questions 
      : WRITTEN_DATA.chapters.flatMap(ch => ch.questions);
    
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(q => 
      q.question.toLowerCase().includes(query) || 
      q.answer.toLowerCase().includes(query)
    );
  };

  const filteredQuestions = getFilteredQuestions();

  // Helper to generate blank lines for practice mode
  const renderBlankLines = (length: number) => {
    const lineCount = Math.max(3, Math.min(10, Math.ceil(length / 125)));
    return (
      <div className="space-y-4 my-2 opacity-50">
        {Array.from({ length: lineCount }).map((_, idx) => (
          <div key={idx} className="border-b border-dashed border-slate-700/60 h-4 w-full" />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 md:p-12 overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4" dir="rtl">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles className="w-4 h-4" />
              Clinoma Written
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-1 font-display">أسئلة الرمد المقالية ✍️</h2>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base">تجميعة الأسئلة المقالية الشاملة والمحلولة لكل فصول الرمد</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-xs sm:text-sm md:text-base px-3.5 py-2 sm:px-5 sm:py-3 border border-slate-800 rounded-xl bg-slate-900 shadow-sm shrink-0 cursor-pointer active:scale-95 animate-in fade-in"
            >
              <ArrowLeft className="w-4 h-4 transform rotate-180" />
              <span>{activeChapter ? 'العودة للفصول' : 'العودة للرئيسية'}</span>
            </button>
          </div>
        </div>

        {/* Global PDF Download Callout Panel */}
        {!activeChapter && (
          <div className="relative rounded-[2rem] bg-gradient-to-r from-slate-900/60 to-indigo-950/40 border border-indigo-500/20 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl" dir="rtl">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>تحميل المذكرة الرسمية للطباعة (PDF)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">تنزيل نسخة الأسئلة المقالية كاملة</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
                يمكنك تحميل كتيب الأسئلة المقالية للرمد كاملاً بنسختين جاهزتين للطباعة الفورية مع ترميز الحماية الأمني.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="/clinoma_written_ophthalmology_student.pdf"
                download="Clinoma_Written_Ophthalmology_Student_Copy.pdf"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white text-xs font-black text-center flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تحميل نسخة الطالب (فارغة)</span>
              </a>
              <a
                href="/clinoma_written_ophthalmology.pdf"
                download="Clinoma_Written_Ophthalmology_Answer_Key.pdf"
                className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-650 rounded-xl text-white text-xs font-black text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الإجابات النموذجية</span>
              </a>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Dashboard Menu Screen */}
          {!activeChapter && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 sm:space-y-8"
              dir="rtl"
            >
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن سؤال أو كلمة مفتاحية في كل الفصول..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-12 py-4 bg-slate-900/60 border border-slate-850 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-bold shadow-inner"
                />
              </div>

              {/* Title / Info */}
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xl font-extrabold text-white">
                  {searchQuery ? 'نتائج البحث:' : 'تصفح الأسئلة بالفصول:'}
                </h3>
                {searchQuery && (
                  <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                    تم العثور على {filteredQuestions.length} سؤال
                  </span>
                )}
              </div>

              {/* Chapters List or Search Results */}
              {searchQuery.trim() ? (
                // SEARCH RESULTS RENDER
                <div className="space-y-4">
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q) => {
                      const isExpanded = !!expandedQuestions[q.id];
                      return (
                        <div 
                          key={q.id}
                          className="bg-slate-900 border border-slate-850 rounded-[1.5rem] p-5 md:p-6 transition-all hover:border-indigo-500/50 shadow-md space-y-4 text-right"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0">
                              {q.type.toUpperCase().replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleCopy(e, q)}
                                className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="نسخ السؤال والإجابة"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleAnswer(q.id)}
                                className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title={isExpanded ? 'إخفاء الإجابة' : 'عرض الإجابة'}
                              >
                                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          
                          <h4 className="text-lg sm:text-xl font-black text-white text-left pl-1 leading-relaxed" dir="ltr">
                            {q.question}
                          </h4>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-slate-800/80 pt-4 mt-2" dir="ltr">
                                  <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase mb-2">
                                    Model Answer
                                  </span>
                                  <p className="text-slate-200 text-sm sm:text-base whitespace-pre-line leading-relaxed font-medium pl-1 text-left">
                                    {q.answer}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-850 text-center p-8 max-w-xl mx-auto space-y-4">
                      <HelpCircle className="w-16 h-16 text-slate-700 opacity-40 mx-auto animate-pulse" />
                      <div>
                        <p className="text-lg font-black text-slate-300">لم يتم العثور على نتائج للبحث 🔍</p>
                        <p className="text-xs text-slate-500 font-bold mt-1">تأكد من كتابة الكلمات المفتاحية باللغة الإنجليزية كما وردت بالأسئلة.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // CHAPTER GRID
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WRITTEN_DATA.chapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChapter(ch)}
                      className="flex items-center justify-between p-6 bg-slate-900 border border-slate-850 rounded-[2rem] hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-right group cursor-pointer active:scale-[0.995]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-black text-base sm:text-lg shrink-0 border border-indigo-500/20">
                          {ch.id}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-200 group-hover:text-indigo-400 transition-colors block text-lg sm:text-xl">
                            {ch.titleAr || ch.title}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-500 font-bold block mt-0.5" dir="ltr">
                            {ch.questions.length} Written Questions
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-400 transform rotate-180 group-hover:translate-x-[-4px] transition-transform" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Chapter Details Screen */}
          {activeChapter && (
            <motion.div
              key="chapter-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
              dir="rtl"
            >
              {/* Header inside chapter */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-850 rounded-[2.5rem] p-6 shadow-md">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-400 block uppercase tracking-widest">
                    Chapter {activeChapter.id}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {activeChapter.titleAr} ({activeChapter.title})
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">يحتوي هذا الفصل على {activeChapter.questions.length} سؤال مقالي نموذجياً.</p>
                </div>
                
                {/* Control bar */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {/* Study Mode Selector */}
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-black shrink-0">
                    <button 
                      onClick={() => setStudyMode('answers')}
                      className={`px-4 py-2 rounded-lg transition-all ${studyMode === 'answers' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      إجابات نموذجية
                    </button>
                    <button 
                      onClick={() => setStudyMode('practice')}
                      className={`px-4 py-2 rounded-lg transition-all ${studyMode === 'practice' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      تمرين ذاتي (مسافات فارغة)
                    </button>
                  </div>
                  
                  {/* Toggle All */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleAllAnswers(activeChapter.questions, true)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold hover:text-white transition-colors"
                    >
                      فتح الكل
                    </button>
                    <button 
                      onClick={() => toggleAllAnswers(activeChapter.questions, false)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold hover:text-white transition-colors"
                    >
                      غلق الكل
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions list inside chapter */}
              <div className="space-y-6">
                {activeChapter.questions.map((q, index) => {
                  const isExpanded = !!expandedQuestions[q.id];
                  return (
                    <div 
                      key={q.id}
                      className="bg-slate-900 border border-slate-850 rounded-[2rem] p-6 md:p-8 transition-all hover:border-indigo-500/50 shadow-md space-y-4 text-right cursor-pointer"
                      onClick={() => toggleAnswer(q.id)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-black text-xs border border-indigo-500/20 shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0">
                            {q.type.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleCopy(e, q)}
                            className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="نسخ السؤال والإجابة"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAnswer(q.id);
                            }}
                            className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title={isExpanded ? 'إخفاء الإجابة' : 'عرض الإجابة'}
                          >
                            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="text-xl sm:text-2xl font-black text-white text-left pl-1 leading-relaxed" dir="ltr">
                        {q.question}
                      </h4>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-slate-800/80 pt-4 mt-2" dir="ltr" onClick={(e) => e.stopPropagation()}>
                              {studyMode === 'answers' ? (
                                <>
                                  <span className="inline-flex bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase mb-2">
                                    Model Answer
                                  </span>
                                  <p className="text-slate-200 text-sm sm:text-base whitespace-pre-line leading-relaxed font-medium pl-1 text-left">
                                    {q.answer}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <span className="inline-flex bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase mb-2">
                                    Practice Sandbox
                                  </span>
                                  {renderBlankLines(q.answer.length)}
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
