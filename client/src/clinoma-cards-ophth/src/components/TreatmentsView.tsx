import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TREATMENTS_DATA } from '../data/treatments';
import type { TreatmentChapter, TreatmentTopic } from '../data/treatments';;
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Sparkle, 
  ChevronsUpDown,
  Maximize2,
  Minimize2,
  Printer,
  Stethoscope,
  BookOpen
} from 'lucide-react';

interface TreatmentsViewProps {
  onBack: () => void;
}

export default function TreatmentsView({ onBack }: TreatmentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChapterFilter, setActiveChapterFilter] = useState<number | null>(null);
  
  // Set default expanded state for topics (expanded by default for immediate view/read)
  const [expandedIds, setExpandedIds] = useState<string[]>(() => {
    const list: string[] = [];
    TREATMENTS_DATA.forEach(chap => {
      chap.topics.forEach(t => list.push(t.id));
    });
    return list;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    const list: string[] = [];
    TREATMENTS_DATA.forEach(chap => {
      chap.topics.forEach(t => list.push(t.id));
    });
    setExpandedIds(list);
  };

  const collapseAll = () => {
    setExpandedIds([]);
  };

  // Filter content based on search & active chapter selection
  const filteredChapters = useMemo(() => {
    return TREATMENTS_DATA.map(chapter => {
      // Filter topics inside each chapter
      const matchedTopics = chapter.topics.filter(topic => {
        const matchesSearch = 
          topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.content.some(line => line.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
      });

      return {
        ...chapter,
        topics: matchedTopics
      };
    }).filter(chapter => {
      // Keep chapter if it has matches AND meets active chapter filter
      if (activeChapterFilter !== null && chapter.id !== activeChapterFilter) {
        return false;
      }
      return chapter.topics.length > 0;
    });
  }, [searchTerm, activeChapterFilter]);

  // Total matching treatment count
  const totalMatches = useMemo(() => {
    return filteredChapters.reduce((sum, ch) => sum + ch.topics.length, 0);
  }, [filteredChapters]);

  // Formatter for markdown syntax (e.g., **text**)
  const formatText = (text: string) => {
    if (!text.includes('**')) return text;
    
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-slate-950 font-extrabold underline decoration-teal-500/20">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-[#154c59] hover:text-[#0f363f] bg-[#154c59]/5 hover:bg-[#154c59]/10 px-3 py-1.5 rounded-xl transition-all select-none mb-3"
            id="treatments-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#154c59] to-emerald-500 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/10">
              🩺
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 font-display">High-Yield Treatment Compilations</h1>
              <p className="text-xs text-slate-550 font-medium mt-1">
                Step-by-step therapeutic guidelines and medical managements organized by board chapters
              </p>
            </div>
          </div>
        </div>

        {/* Top Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={expandAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            title="Expand All Topics"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand All</span>
          </button>
          <button 
            onClick={collapseAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            title="Collapse All Topics"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Collapse All</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#154c59]/10 text-[#154c59] hover:bg-[#154c59]/20 text-xs font-bold rounded-xl transition-all"
            title="Print Sheets"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Search & Chapter Switcher Box */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input 
            type="text"
            placeholder="Quick search in treatments (e.g. Blepharitis, Atropine, Steroids, Tarsorrhaphy, Evisceration)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#154c59]/50 focus:bg-white transition-all shadow-inner"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Chapter Quick Switch Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 mt-2">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide mr-2 py-1 block">Chapters:</span>
          
          <button
            onClick={() => setActiveChapterFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
              activeChapterFilter === null 
                ? 'bg-[#154c59] text-white border-transparent shadow-sm' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Chapters ({TREATMENTS_DATA.length})
          </button>
          
          {TREATMENTS_DATA.map(chapter => (
            <button
              key={chapter.id}
              onClick={() => setActiveChapterFilter(chapter.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeChapterFilter === chapter.id 
                  ? 'bg-emerald-600 text-white border-transparent shadow-sm' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {chapter.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Info Warning Tip banner */}
      <div className="bg-emerald-50/60 p-3.5 border border-emerald-200/50 rounded-2xl text-slate-800 text-xs font-semibold flex items-center gap-2 select-none">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Treatment compilations are presented as Board Q&A high-yield listings. Touch any term or use Voice mode for audiotory lectures.</span>
      </div>

      {/* Content Renderers per active dynamic query */}
      <div className="space-y-8">
        {filteredChapters.length > 0 ? (
          filteredChapters.map((chapter) => (
            <div key={chapter.id} className="space-y-4">
              {/* Chapter title header */}
              <div className="flex items-center gap-2 px-1">
                <BookOpen className="w-4 h-4 text-[#154c59]" />
                <h2 className="text-[#154c59] text-lg font-black tracking-tight">{chapter.title}</h2>
                <div className="flex-1 h-[1px] bg-slate-200" />
                <span className="text-xs text-slate-400 font-bold font-mono">({chapter.topics.length} topics)</span>
              </div>

              {/* Grid or stack of topics in this chapter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapter.topics.map((topic) => {
                  const isExpanded = expandedIds.includes(topic.id);
                  return (
                    <div 
                      key={topic.id}
                      className="bg-white border hover:border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                      {/* Topic title head */}
                      <div 
                        onClick={() => toggleExpand(topic.id)}
                        className="p-4 bg-slate-50/50 flex justify-between items-center gap-2 cursor-pointer select-none border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs mt-0.5">🔹</span>
                          <span className="font-extrabold text-sm text-slate-900 pr-1 hover:text-[#154c59] transition-colors">
                            {topic.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>

                      {/* Content block */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div className="p-4 space-y-3 flex-1 flex flex-col bg-white text-xs leading-relaxed font-semibold">
                              {topic.content.map((point, pIdx) => {
                                // Match N.B., Contraindications, stages cleanly with spacing
                                const isWarning = point.toLowerCase().includes('do not press') || point.toLowerCase().includes('contraindications') || point.toLowerCase().includes('danger');
                                const isNB = point.toLowerCase().includes('n.b');
                                return (
                                  <div 
                                    key={pIdx} 
                                    className={`p-2.5 rounded-xl border ${
                                      isWarning 
                                        ? 'bg-rose-50/50 border-rose-200/50 text-rose-800' 
                                        : isNB 
                                          ? 'bg-amber-50/50 border-amber-200/50 text-amber-900' 
                                          : 'bg-slate-50/50 border-slate-200/40 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="text-[10px] mt-0.5 shrink-0">
                                        {isWarning ? '⚠️' : isNB ? '💡' : '⚡'}
                                      </span>
                                      <span className="break-words leading-relaxed font-sans font-medium text-slate-800">
                                        {formatText(point)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 border text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              🔍
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No treatments found matching your query</h3>
              <p className="text-sm text-slate-400 mt-1">
                Try typing other keywords or check a different eye chapter filter!
              </p>
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setActiveChapterFilter(null); }}
              className="px-4 py-2 bg-[#154c59] hover:bg-[#0f363f] text-white text-xs font-bold rounded-xl transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Print Specific Stylings inside a hidden container usually but clean and stylish */}
      <div className="bg-slate-100 border border-slate-200/80 rounded-3xl p-6 text-center select-none space-y-2 mt-8">
        <Stethoscope className="w-5 h-5 text-emerald-500 mx-auto" />
        <h4 className="text-xs font-extrabold text-slate-800">
          CLINOMA CARDS Therapeutic Guidelines
        </h4>
        <p className="text-[10px] text-slate-500 max-w-xl mx-auto leading-relaxed">
          High-yield summary listings designed solely for quick board reference and therapeutic review.
        </p>
      </div>
    </div>
  );
}
