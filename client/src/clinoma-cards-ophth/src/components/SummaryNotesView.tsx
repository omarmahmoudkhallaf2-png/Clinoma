import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUMMARY_NOTES } from '../data/summaryNotes';
import type { SummaryChapter, SummaryTopic } from '../data/summaryNotes';;
import { 
  Search, 
  BookOpen, 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

interface SummaryNotesViewProps {
  onBack?: () => void;
  inlineMode?: boolean;
}

export default function SummaryNotesView({ onBack, inlineMode = false }: SummaryNotesViewProps) {
  // Mode selection: 'system' (Continuous Study) or 'flashcards' (Flashcards Mode)
  const [studyMode, setStudyMode] = useState<'system' | 'flashcards'>('system');
  
  // Selected Chapter (default is Chapter 1)
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Font scale (for readability)
  const [textScale, setTextScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  
  // Mastered / read topic identifiers: saved in localStorage
  const [readTopics, setReadTopics] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('clinoma_read_summary_topics');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Active flashcard deck indices
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState(0);

  // Sync mastered status with localStorage
  useEffect(() => {
    localStorage.setItem('clinoma_read_summary_topics', JSON.stringify(readTopics));
  }, [readTopics]);

  // Current selected chapter object
  const currentChapter = useMemo(() => {
    return SUMMARY_NOTES.find(c => c.id === selectedChapterId) || SUMMARY_NOTES[0];
  }, [selectedChapterId]);

  // Toggle topics completed status
  const toggleTopicRead = (chapterId: number, topicTitle: string) => {
    const key = `${chapterId}_${topicTitle}`;
    setReadTopics(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Reset all progress
  const handleResetProgress = () => {
    if (confirm("هل تريد تصفير تقدم قراءة الخلاصة؟")) {
      setReadTopics([]);
    }
  };

  // Filter topics / chapters based on search query
  const filteredChaptersAndTopics = useMemo(() => {
    if (!searchQuery.trim()) {
      return SUMMARY_NOTES;
    }
    const query = searchQuery.toLowerCase().trim();
    return SUMMARY_NOTES.map(ch => {
      const matchTopics = ch.topics.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.bullets.some(b => b.toLowerCase().includes(query))
      );
      return {
        ...ch,
        topics: matchTopics
      };
    }).filter(ch => ch.topics.length > 0 || ch.titleEn.toLowerCase().includes(query) || ch.titleAr.includes(query));
  }, [searchQuery]);

  // Flashcards List calculated globally or per-chapter
  const flashcardTopicsList = useMemo(() => {
    if (searchQuery.trim()) {
      const flat: { chapterId: number; chapterTitle: string; topic: SummaryTopic }[] = [];
      filteredChaptersAndTopics.forEach(ch => {
        ch.topics.forEach(t => {
          flat.push({ chapterId: ch.id, chapterTitle: ch.titleEn, topic: t });
        });
      });
      return flat;
    } else {
      return currentChapter.topics.map(t => ({
        chapterId: currentChapter.id,
        chapterTitle: currentChapter.titleEn,
        topic: t
      }));
    }
  }, [filteredChaptersAndTopics, currentChapter, searchQuery]);

  // Reset active card index when source list changes
  useEffect(() => {
    setActiveFlashcardIdx(0);
  }, [selectedChapterId, searchQuery, studyMode]);

  // Completion calculation
  const totalTopicsCount = useMemo(() => {
    return SUMMARY_NOTES.reduce((acc, ch) => acc + ch.topics.length, 0);
  }, []);

  const masteredTopicsCount = useMemo(() => {
    return readTopics.length;
  }, [readTopics]);

  const completionPercentage = useMemo(() => {
    if (totalTopicsCount === 0) return 0;
    return Math.round((masteredTopicsCount / totalTopicsCount) * 100);
  }, [totalTopicsCount, masteredTopicsCount]);

  // Current flashcard details
  const currentFlashcard = flashcardTopicsList[activeFlashcardIdx];

  // Helper styles for font scaling
  const getBulletFontSizeClass = () => {
    if (textScale === 'large') return 'text-base md:text-lg leading-relaxed';
    if (textScale === 'xlarge') return 'text-lg md:text-xl leading-relaxed';
    return 'text-sm md:text-base leading-relaxed';
  };

  const getTitleFontSizeClass = () => {
    if (textScale === 'large') return 'text-md md:text-lg font-bold';
    if (textScale === 'xlarge') return 'text-lg md:text-xl font-extrabold';
    return 'text-sm md:text-base font-semibold';
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-1 sm:px-4 font-sans text-slate-900" dir="rtl">
      
      {/* 1. Header Area: Calm, quiet and beautiful */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">📝</span>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-800">
              CLINOMA Quick Notes
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ملخص مراجعة البورد السريع — علم طب وجراحة العيون
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {readTopics.length > 0 && (
            <button 
              onClick={handleResetProgress}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
              title="تصفير القراءة"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة تعيين التقدم ({masteredTopicsCount}/{totalTopicsCount})</span>
            </button>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-250 text-slate-700 rounded-lg transition-all cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 ml-1" />
              <span>الرئيسية</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Controls & Modes Switcher Toolbar: Highly compact, simplified */}
      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Simplified Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في العناوين والسطور..."
            className="w-full text-right py-1.5 pr-9 pl-3 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 text-slate-800 rounded-lg text-xs transition-all outline-none"
          />
        </div>

        {/* Text Size & Mode Settings */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap">
          
          {/* Sizing switches */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              onClick={() => setTextScale('normal')}
              className={`px-2 py-1 rounded-md transition-all font-medium ${textScale === 'normal' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Aa
            </button>
            <button
              onClick={() => setTextScale('large')}
              className={`px-2 py-1 rounded-md transition-all font-bold ${textScale === 'large' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Aa+
            </button>
            <button
              onClick={() => setTextScale('xlarge')}
              className={`px-2 py-1 rounded-md transition-all font-black ${textScale === 'xlarge' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Aa++
            </button>
          </div>

          {/* Simple Segment Mode switch */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/85">
            <button
              onClick={() => setStudyMode('system')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold tracking-wide transition-all ${
                studyMode === 'system'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span>قراءة مستمرة</span>
            </button>
            <button
              onClick={() => setStudyMode('flashcards')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold tracking-wide transition-all ${
                studyMode === 'flashcards'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/45'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3 h-3 text-slate-400" />
              <span>بطاقات فلاش</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Chapter Scroller: Zero metadata clutter under buttons, extremely clean swipeable bar on Mobile/Tablet/Desktop */}
      <div className="border-b border-slate-100 pb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">اختر الشابتر:</label>
        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin scroll-smooth mask-image-horizontal">
          {SUMMARY_NOTES.map((ch) => {
            const isSelected = selectedChapterId === ch.id;
            const completedInCh = ch.topics.filter(t => readTopics.includes(`${ch.id}_${t.title}`)).length;
            const isChAllCompleted = completedInCh > 0 && completedInCh === ch.topics.length;

            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChapterId(ch.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                    : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-sm shrink-0">{ch.icon}</span>
                <span className="font-semibold text-right leading-none group">{ch.titleEn}</span>
                {completedInCh > 0 && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isChAllCompleted ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Display Content Area */}
      {studyMode === 'system' ? (
        /* Minimalist Article/System View */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>الفصل الحالي: {currentChapter.titleEn} ({currentChapter.titleAr})</span>
            <span>{currentChapter.topics.length} موضوع</span>
          </div>

          <div className="space-y-3">
            {currentChapter.topics.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200/65">
                <p className="text-xs font-semibold text-slate-500">لا يوجد عناصر تطابق البحث في هذا الفصل</p>
                <button onClick={() => setSearchQuery('')} className="text-xs text-indigo-650 font-bold underline mt-1.5 cursor-pointer">مسح التصفية</button>
              </div>
            ) : (
              currentChapter.topics.map((item, idx) => {
                const keyToken = `${currentChapter.id}_${item.title}`;
                const isRead = readTopics.includes(keyToken);

                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl border p-4 sm:p-5 transition-all text-right relative ${
                      isRead 
                        ? 'border-slate-200 bg-slate-50/20' 
                        : 'border-slate-200 hover:border-slate-350 shadow-sm'
                    }`}
                  >
                    {/* Compact Read / Unread Trigger Box */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block mb-0.5">
                          TOPIC {idx + 1}
                        </span>
                        <h4 className={`${getTitleFontSizeClass()} text-slate-900 leading-snug font-bold`}>
                          {item.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => toggleTopicRead(currentChapter.id, item.title)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider border transition-all cursor-pointer ${
                          isRead
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {isRead ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>تمت المراجعة</span>
                          </>
                        ) : (
                          <span>تحديد كمقروء</span>
                        )}
                      </button>
                    </div>

                    {/* Scientific bullets with custom clean text scale */}
                    <ul className="space-y-2 mt-2 border-t border-slate-100/80 pt-2 text-right" dir="ltr">
                      {item.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-1.5 text-slate-700">
                          <span className="text-slate-400 select-none text-xs mt-1 shrink-0">•</span>
                          <span className={`${getBulletFontSizeClass()} font-mono select-text font-medium text-slate-800 text-left w-full`}>
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Minimalist and Calm Flashcard Slider */
        <div className="space-y-4 max-w-2xl mx-auto">
          {flashcardTopicsList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-xs text-slate-500">لا يوجد بطاقات لتصفيتها. حاول مسح شريط البحث.</p>
              <button onClick={() => setSearchQuery('')} className="text-xs text-indigo-650 font-bold underline mt-2 cursor-pointer">إلغاء البحث</button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Card stack box container */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFlashcardIdx + "_" + currentFlashcard.topic.title}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white rounded-xl border border-slate-200 p-5 sm:p-7 shadow-sm text-right relative min-h-[220px] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-3 border-b border-slate-50 pb-2">
                      <span className="order-2 font-mono uppercase">{currentFlashcard.chapterTitle}</span>
                      <span className="order-1">بطاقة {activeFlashcardIdx + 1} من {flashcardTopicsList.length}</span>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                        {currentFlashcard.topic.title}
                      </h3>

                      <ul className="space-y-2 mt-2 border-t border-slate-150 pt-3 text-right" dir="ltr">
                        {currentFlashcard.topic.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                            <span className="text-slate-400 text-xs mt-1 shrink-0">•</span>
                            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-mono font-medium text-left w-full">
                              {bullet}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Master status indicator inside card */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 font-mono">Clinoma Notes</span>

                    {(() => {
                      const deckToken = `${currentFlashcard.chapterId}_${currentFlashcard.topic.title}`;
                      const isCardRead = readTopics.includes(deckToken);
                      return (
                        <button
                          onClick={() => toggleTopicRead(currentFlashcard.chapterId, currentFlashcard.topic.title)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                            isCardRead 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {isCardRead ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                          <span>{isCardRead ? 'تمت قراءتها ✓' : 'تحديد كمقروء'}</span>
                        </button>
                      );
                    })()}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    if (activeFlashcardIdx > 0) setActiveFlashcardIdx(activeFlashcardIdx - 1);
                  }}
                  disabled={activeFlashcardIdx === 0}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                  <span>السابق</span>
                </button>

                <div className="text-xs text-slate-400 font-bold font-mono">
                  {activeFlashcardIdx + 1} / {flashcardTopicsList.length}
                </div>

                <button
                  onClick={() => {
                    if (activeFlashcardIdx < flashcardTopicsList.length - 1) setActiveFlashcardIdx(activeFlashcardIdx + 1);
                  }}
                  disabled={activeFlashcardIdx === flashcardTopicsList.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-sm"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4 mr-0.5" />
                </button>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center items-center gap-1 pt-1 overflow-x-hidden max-w-full flex-wrap">
                {flashcardTopicsList.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveFlashcardIdx(dotIdx)}
                    className={`h-1.5 rounded-full cursor-pointer transition-all ${dotIdx === activeFlashcardIdx ? 'w-3.5 bg-slate-800' : 'w-1.5 bg-slate-200 hover:bg-slate-300'}`}
                    title={`البطاقة ${dotIdx + 1}`}
                  />
                ))}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
