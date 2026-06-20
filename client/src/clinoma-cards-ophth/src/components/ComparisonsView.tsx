import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPARISONS_DATA } from '../data/comparisons';
import type { ComparisonTable } from '../data/comparisons';;
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  ChevronsUpDown,
  Maximize2,
  Minimize2,
  Printer,
  Scale,
  Sparkles
} from 'lucide-react';

interface ComparisonsViewProps {
  onBack: () => void;
}

export default function ComparisonsView({ onBack }: ComparisonsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>(COMPARISONS_DATA.map(c => c.id));

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setExpandedIds(COMPARISONS_DATA.map(c => c.id));
  };

  const collapseAll = () => {
    setExpandedIds([]);
  };

  const filteredComparisons = useMemo(() => {
    if (!searchTerm.trim()) return COMPARISONS_DATA;
    const term = searchTerm.toLowerCase();
    
    return COMPARISONS_DATA.filter(comp => {
      const matchesTitle = comp.titleEn.toLowerCase().includes(term) || comp.titleAr.toLowerCase().includes(term);
      const matchesHeader = comp.headers.some(h => h.toLowerCase().includes(term));
      const matchesRows = comp.rows.some(row => row.some(cell => cell.toLowerCase().includes(term)));
      
      return matchesTitle || matchesHeader || matchesRows;
    });
  }, [searchTerm]);

  const formatText = (text: string) => {
    if (!text.includes('**')) return text;
    
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-rose-950 font-extrabold underline decoration-rose-500/25 bg-rose-50 px-1 py-0.5 rounded">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header section identical in theme structure to TreatmentsView and CompilationsView */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-[#154c59] hover:text-[#0f363f] bg-[#154c59]/5 hover:bg-[#154c59]/10 px-3 py-1.5 rounded-xl transition-all select-none mb-3"
            id="comparisons-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#154c59] to-rose-500 text-white flex items-center justify-center text-xl shadow-md shadow-rose-500/10">
              ⚖️
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 font-display">High-Yield Board Comparisons</h1>
              <p className="text-xs text-slate-550 font-medium mt-1">
                Juxtaposed tables and itemized differences of clinical board look-alikes
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={expandAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            title="Expand All Tables"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand All</span>
          </button>
          <button 
            onClick={collapseAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            title="Collapse All Tables"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Collapse All</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            title="Print Sheets"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Tables</span>
          </button>
        </div>
      </div>

      {/* Info Warning Tip Banner */}
      <div className="bg-rose-50/60 p-3.5 border border-rose-200/50 rounded-2xl text-slate-800 text-xs font-semibold flex items-center gap-2 select-none">
        <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
        <span>Compare similar ophthalmology anomalies side-by-side. Perfect for rapid MCQ recall and board exam differentiation.</span>
      </div>

      {/* Search Input */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input 
            type="text"
            placeholder="Quick search in comparisons (e.g. Stye, Chalazion, Pterygium, CRVO, Papilledema, AR Pupil)..."
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
      </div>

      {/* Comparisons Render Area */}
      <div className="space-y-6">
        {filteredComparisons.length > 0 ? (
          filteredComparisons.map((comp) => {
            const isExpanded = expandedIds.includes(comp.id);
            return (
              <div 
                key={comp.id}
                className="bg-white border hover:border-slate-300 rounded-3xl shadow-sm transition-all overflow-hidden flex flex-col"
              >
                {/* Header of each comparison card */}
                <div 
                  onClick={() => toggleExpand(comp.id)}
                  className="p-5 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center gap-4 cursor-pointer select-none border-b border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📋</span>
                    <div>
                      <h3 className="font-extrabold text-sm md:text-base text-slate-900 font-display">
                        {comp.titleEn}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono mt-0.5">
                        {comp.reference}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ChevronsUpDown className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Table display */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="p-4 md:p-6 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="border-b-2 border-slate-200 bg-slate-55/40">
                              {comp.headers.map((hdr, hIdx) => (
                                <th 
                                  key={hIdx} 
                                  className={`p-3 text-xs font-extrabold text-slate-800 ${
                                    hIdx === 0 ? 'w-[180px] bg-slate-50/50 sticky left-0 z-10' : ''
                                  }`}
                                >
                                  {hdr}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {comp.rows.map((row, rIdx) => (
                              <tr 
                                key={rIdx} 
                                className="hover:bg-slate-50/50 transition-colors"
                              >
                                {row.map((cell, cIdx) => (
                                  <td 
                                    key={cIdx} 
                                    className={`p-3 leading-relaxed font-sans ${
                                      cIdx === 0 
                                        ? 'font-bold text-slate-900 bg-slate-50/40 font-display sticky left-0 z-10' 
                                        : 'text-slate-700 font-medium'
                                    }`}
                                  >
                                    {formatText(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-12 border text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              🔍
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No comparisons found</h3>
              <p className="text-sm text-slate-400 mt-1">
                Try searching for main words like 'stye', 'crvo', 'paralytic', or 'pupil'!
              </p>
            </div>
            <button 
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-[#154c59] hover:bg-[#0f363f] text-white text-xs font-bold rounded-xl transition-all"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* Footer Branding Design details */}
      <div className="bg-slate-50 border rounded-3xl p-6 text-center select-none space-y-2">
        <Scale className="w-5 h-5 text-rose-500 mx-auto" />
        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
          CLINOMA CARDS Ophthalmology Comparisons Database
        </h4>
        <p className="text-[10px] text-slate-500 max-w-xl mx-auto leading-relaxed">
          Comprehensive comparison layout modeled on the standard syllabus.
        </p>
      </div>
    </div>
  );
}
