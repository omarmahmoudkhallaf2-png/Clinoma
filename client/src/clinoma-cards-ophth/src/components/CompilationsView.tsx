import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPILATIONS } from '../data/compilations';
import { MENTIONED_TERMS } from '../data/whereIsItMentioned';
import type { MentionedTerm } from '../data/whereIsItMentioned';;
import { 
  ArrowLeft, 
  Search, 
  Sparkle, 
  ChevronsUpDown,
  Maximize2,
  Minimize2,
  Printer,
  RotateCcw,
  BookOpen,
  Layers,
  ChevronRight,
  ChevronLeft,
  Check,
  Eye,
  Settings
} from 'lucide-react';

interface CompilationsViewProps {
  onBack: () => void;
}

export default function CompilationsView({ onBack }: CompilationsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab controller: 'sheets' (Standard lists) or 'where' (Where is it mentioned flashcards)
  const [compViewMode, setCompViewMode] = useState<'sheets' | 'where'>('sheets');

  // Sheet states
  const [activeBadgeFilter, setActiveBadgeFilter] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>(COMPILATIONS.map(c => c.id));

  // "Where" session states
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [whereCardOrder, setWhereCardOrder] = useState<'shuffled' | 'sequential'>('shuffled');
  const [whereDisplayMode, setWhereDisplayMode] = useState<'card' | 'list'>('card');
  const [flashcardList, setFlashcardList] = useState<MentionedTerm[]>([]);
  const [currentFlashIdx, setCurrentFlashIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Handlers for standard sheets
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setExpandedIds(COMPILATIONS.map(c => c.id));
  };

  const collapseAll = () => {
    setExpandedIds([]);
  };

  // Extract all unique badges for standard sheets
  const allBadges = useMemo(() => {
    const badges = new Set<string>();
    COMPILATIONS.forEach(c => {
      if (c.badge) {
        badges.add(c.badge.trim());
      }
    });
    return Array.from(badges);
  }, []);

  // Filtered standard compilations based on search
  const filteredCompilations = useMemo(() => {
    return COMPILATIONS.filter(item => {
      const matchSearch = 
        item.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.listItems && item.listItems.some(li => 
          li.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (li.desc && li.desc.toLowerCase().includes(searchTerm.toLowerCase()))
        )) ||
        (item.tableData && (
          item.tableData.col1.some(text => text.toLowerCase().includes(searchTerm.toLowerCase())) ||
          item.tableData.col2.some(text => text.toLowerCase().includes(searchTerm.toLowerCase()))
        ));

      if (activeBadgeFilter) {
        return matchSearch && (item.badge?.trim() === activeBadgeFilter);
      }
      return matchSearch;
    });
  }, [searchTerm, activeBadgeFilter]);

  // "Where Is It Mentioned" search & filtering logic
  const filteredWhereTerms = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return MENTIONED_TERMS;
    return MENTIONED_TERMS.filter(item => 
      item.term.toLowerCase().includes(query) ||
      item.definition.toLowerCase().includes(query) ||
      item.primaryRelation.toLowerCase().includes(query) ||
      item.otherLocations.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  // Start "Where Is It Mentioned" Session of Flashcards/List
  const handleStartWhereSession = () => {
    let list = [...filteredWhereTerms];
    if (whereCardOrder === 'shuffled') {
      list.sort(() => Math.random() - 0.5);
    } else {
      list.sort((a, b) => a.term.localeCompare(b.term));
    }
    setFlashcardList(list);
    setCurrentFlashIdx(0);
    setIsCardFlipped(false);
    setIsSessionStarted(true);
  };

  // Reset/Reconfigure session
  const handleResetWhereSession = () => {
    setIsSessionStarted(false);
    setIsCardFlipped(false);
  };

  // Styling helper for badges
  const getBadgeClass = (color?: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200/60';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'teal': return 'bg-teal-50 text-teal-700 border-teal-200/60';
      default: return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  // Text formatter for parsing bold markdown `**text**` safely
  const formatText = (text: string) => {
    if (!text.includes('**')) return text;
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-slate-900 font-extrabold">{part}</strong>;
      }
      return part;
    });
  };

  // Current selected active word
  const activeTerm = flashcardList[currentFlashIdx];

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-1 sm:px-4 font-sans text-slate-900" dir="rtl">
      
      {/* 1. Header: Minimalist and highly readable */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all select-none mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 ml-1" />
            <span>العودة للرئيسية</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <h1 className="text-lg md:text-xl font-black text-slate-900 font-display">تجميعات البورد الشاملة (Revision)</h1>
          </div>
        </div>

        {/* Global tab switcher bar */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 grow sm:grow-0">
          <button
            onClick={() => { setCompViewMode('sheets'); }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              compViewMode === 'sheets'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            📋 أوراق التجميعات
          </button>
          <button
            onClick={() => { setCompViewMode('where'); }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              compViewMode === 'where'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-550 hover:text-slate-800'
            }`}
          >
            🔍 تبويب "ذكر فين"
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT: STANDARD SHEETS */}
      {compViewMode === 'sheets' && (
        <div className="space-y-4">
          {/* Controls Bar for Sheets */}
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 flex flex-col md:flex-row justify-between gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                placeholder="البحث السريع في التجميعات (مثل الجلوكوما، المياه البيضاء)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-right py-1.5 pr-9 pl-3 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 text-slate-800 rounded-lg text-xs transition-all outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button 
                onClick={expandAll}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-lg transition-all font-semibold"
              >
                توسيع الكل
              </button>
              <button 
                onClick={collapseAll}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-lg transition-all font-semibold"
              >
                طي الكل
              </button>
              <button 
                onClick={() => window.print()}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg"
                title="طباعة"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Categories Bar */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">تصفية بالفئات:</span>
            <button
              onClick={() => setActiveBadgeFilter(null)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                activeBadgeFilter === null 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              الكل ({COMPILATIONS.length})
            </button>
            {allBadges.map(badge => (
              <button
                key={badge}
                onClick={() => setActiveBadgeFilter(badge)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                  activeBadgeFilter === badge 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {badge}
              </button>
            ))}
          </div>

          {/* Render Items */}
          <div className="grid grid-cols-1 gap-4">
            {filteredCompilations.length > 0 ? (
              filteredCompilations.map((item, idx) => {
                const isExpanded = expandedIds.includes(item.id);
                return (
                  <div 
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all text-right"
                  >
                    <div 
                      onClick={() => toggleExpand(item.id)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            {item.badge && (
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${getBadgeClass(item.badgeColor)}`}>
                                {item.badge}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-400 font-mono">الملف #{item.id}</span>
                          </div>
                          <h2 className="text-slate-800 font-bold text-sm tracking-tight mt-0.5">
                            {item.titleEn}
                          </h2>
                        </div>
                      </div>
                      <ChevronsUpDown className="w-4 h-4 text-slate-400" />
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                        {item.isTable ? (
                          <div className="overflow-x-auto w-full border border-slate-200 rounded-xl bg-white">
                            <table className="w-full border-collapse" dir="ltr">
                              <thead>
                                <tr className="bg-slate-800 text-white font-bold text-xs">
                                  <th className="py-2.5 px-3.5 text-left w-1/2 border-b border-slate-700">
                                    {item.colHeaders?.col1}
                                  </th>
                                  <th className="py-2.5 px-3.5 text-left w-1/2 border-b border-slate-700 border-l border-slate-700">
                                    {item.colHeaders?.col2}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {Array.from({ 
                                  length: Math.max(
                                    item.tableData?.col1.length || 0, 
                                    item.tableData?.col2.length || 0
                                  ) 
                                }).map((_, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-2.5 px-3.5 text-xs text-slate-700 leading-relaxed align-top">
                                      {item.tableData?.col1[rIdx] ? (
                                        <div className="flex items-start gap-1.5">
                                          <span className="text-blue-500 shrink-0 text-xs">•</span>
                                          <span>{formatText(item.tableData.col1[rIdx])}</span>
                                        </div>
                                      ) : null}
                                    </td>
                                    <td className="py-2.5 px-3.5 text-xs text-slate-700 leading-relaxed align-top border-l border-slate-200">
                                      {item.tableData?.col2[rIdx] ? (
                                        <div className="flex items-start gap-1.5">
                                          <span className="text-amber-500 shrink-0 text-xs">•</span>
                                          <span>{formatText(item.tableData.col2[rIdx])}</span>
                                        </div>
                                      ) : null}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" dir="ltr">
                            {item.listItems?.map((li, liIdx) => (
                              <div 
                                key={liIdx}
                                className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between shadow-xs transition-colors"
                              >
                                <div>
                                  <div className="flex items-start gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                    <span className="font-sans font-bold text-xs text-slate-900 break-words">
                                      {li.term}
                                    </span>
                                  </div>
                                  {li.desc && (
                                    <p className="text-[11px] text-slate-500 leading-relaxed pl-3 mt-1 text-left">
                                      {formatText(li.desc)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl p-8 border text-center text-slate-500 text-xs">لا توجد نتائج تطابق شروط التصفية والبحث في أوراق التجميعات.</div>
            )}
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT: "WHERE IS IT MENTIONED" */}
      {compViewMode === 'where' && (
        <div className="space-y-4">
          
          {/* Filter / Search input (persistent) */}
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 flex flex-col md:flex-row justify-between gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                placeholder="البحث السريع في المصطلحات (مثال: Pannus, Hypopyon)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-right py-1.5 pr-9 pl-3 bg-white border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 text-slate-800 rounded-lg text-xs transition-all outline-none"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isSessionStarted ? (
              /* Settings Block Screen (Quiet and Direct) */
              <motion.div 
                key="settings"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-md mx-auto space-y-6 text-right"
              >
                <div className="text-center space-y-1.5 border-b pb-3">
                  <span className="text-xl">🧐</span>
                  <h3 className="text-sm font-extrabold text-slate-800">تجهيز جلسة مصطلحات (ذكر فين؟)</h3>
                  <p className="text-[11px] text-slate-500">مجموع المصطلحات الطبية المتوفرة: <span className="font-bold text-slate-800">{filteredWhereTerms.length}</span></p>
                </div>

                <div className="space-y-4">
                  {/* Card Order Option */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 block">ترتيب عرض المصطلحات:</label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setWhereCardOrder('shuffled')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                          whereCardOrder === 'shuffled' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-550 hover:text-slate-900'
                        }`}
                      >
                        🔀 عشوائي (Shuffled)
                      </button>
                      <button
                        onClick={() => setWhereCardOrder('sequential')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                          whereCardOrder === 'sequential' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-550 hover:text-slate-900'
                        }`}
                      >
                        🔢 ترتيب أبجدي
                      </button>
                    </div>
                  </div>

                  {/* Display Mode Option */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 block">طريقة الاستعراض والتعلم:</label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setWhereDisplayMode('card')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                          whereDisplayMode === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-550 hover:text-slate-900'
                        }`}
                      >
                        🎴 بطاقات فلاشية (Flashcards)
                      </button>
                      <button
                        onClick={() => setWhereDisplayMode('list')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                          whereDisplayMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-550 hover:text-slate-900'
                        }`}
                      >
                        📋 قائمة تصفح مسرد كامل
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartWhereSession}
                  disabled={filteredWhereTerms.length === 0}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-lg font-bold text-xs transition-all active:scale-98 cursor-pointer"
                >
                  إبدأ الاستعراض والمذاكرة الآن
                </button>
              </motion.div>
            ) : (
              /* Session displays (Active study panel) */
              <motion.div 
                key="session"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Header configuration info */}
                <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-semibold mb-1">
                  <button 
                    onClick={handleResetWhereSession}
                    className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>إعادة ضبط الجلسة</span>
                  </button>
                  <span className="font-mono">
                    {whereDisplayMode === 'card' 
                      ? `بطاقة ${currentFlashIdx + 1} من ${flashcardList.length}` 
                      : `مستعرض كامل لـ (${flashcardList.length}) مصطلح`}
                  </span>
                </div>

                {flashcardList.length === 0 ? (
                  <div className="bg-white border rounded-xl p-8 text-center text-slate-500 text-xs">لا يوجد مصطلحات مطابقة للبحث الحالي.</div>
                ) : whereDisplayMode === 'card' ? (
                  /* CARD FLIP INTERACTIVE VIEWER */
                  <div className="max-w-xl mx-auto space-y-4">
                    <div 
                      onClick={() => setIsCardFlipped(prev => !prev)}
                      className={`bg-white rounded-xl border p-6 min-h-[220px] transition-all flex flex-col justify-between align-middle cursor-pointer text-center select-none ${
                        isCardFlipped ? 'border-indigo-300 bg-indigo-50/5' : 'border-slate-250 hover:border-slate-400'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-550 tracking-wide block mb-1">TERM</span>
                        <h2 className="text-slate-900 font-extrabold text-lg sm:text-xl font-mono">
                          {activeTerm.term}
                        </h2>

                        {!isCardFlipped ? (
                          <div className="py-12 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
                            <Eye className="w-5 h-5 text-slate-300" />
                            <span>انقر أو لمس هنا للكشف عن مواضع الذكر بالبورد والتعريف كامل</span>
                          </div>
                        ) : (
                          <div className="space-y-4 mt-4 pt-4 border-t border-slate-150 text-right" dir="ltr">
                            <div>
                              <strong className="text-[11px] uppercase text-emerald-600 block mb-0.5">Definition:</strong>
                              <p className="text-xs text-slate-800 leading-relaxed pl-1 font-medium font-mono">{activeTerm.definition}</p>
                            </div>
                            <div>
                              <strong className="text-[11px] uppercase text-indigo-600 block mb-0.5">Primary Relation:</strong>
                              <p className="text-xs text-slate-800 leading-relaxed pl-1 font-medium font-mono">{formatText(activeTerm.primaryRelation)}</p>
                            </div>
                            <div>
                              <strong className="text-[11px] uppercase text-slate-500 block mb-0.5">Other Locations/Links:</strong>
                              <p className="text-xs text-slate-700 leading-relaxed pl-1 font-mono font-medium">{formatText(activeTerm.otherLocations)}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-semibold pt-2 border-t border-slate-100 flex justify-between">
                        <span>Clinoma Cards</span>
                        <span>{isCardFlipped ? 'انقر للطي' : 'انقر للكشف'}</span>
                      </div>
                    </div>

                    {/* Pagination controllers */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (currentFlashIdx > 0) {
                            setCurrentFlashIdx(currentFlashIdx - 1);
                            setIsCardFlipped(false);
                          }
                        }}
                        disabled={currentFlashIdx === 0}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>المصطلح السابق</span>
                      </button>

                      <button
                        onClick={() => setIsCardFlipped(prev => !prev)}
                        className="px-3 py-1.5 bg-slate-105 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        {isCardFlipped ? 'إخفاء الإجابة' : 'كشف الإجابة'}
                      </button>

                      <button
                        onClick={() => {
                          if (currentFlashIdx < flashcardList.length - 1) {
                            setCurrentFlashIdx(currentFlashIdx + 1);
                            setIsCardFlipped(false);
                          }
                        }}
                        disabled={currentFlashIdx === flashcardList.length - 1}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                      >
                        <span>المصطلح التالي</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Miniature dot buttons */}
                    <div className="flex justify-center items-center gap-1 pt-1 overflow-x-hidden max-w-full flex-wrap">
                      {flashcardList.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => {
                            setCurrentFlashIdx(dotIdx);
                            setIsCardFlipped(false);
                          }}
                          className={`h-1.5 rounded-full cursor-pointer transition-all ${dotIdx === currentFlashIdx ? 'w-3.5 bg-slate-800' : 'w-1.5 bg-slate-200 hover:bg-slate-300'}`}
                          title={`البطاقة ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* FULL CONTINUOUS SCROLLABLE LIST VIEW */
                  <div className="space-y-3 max-w-2xl mx-auto">
                    {flashcardList.map((item, idx) => (
                      <div 
                        key={idx}
                        className="bg-white border border-slate-200 rounded-xl p-4 transition-all text-left"
                        dir="ltr"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                          <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wide font-mono">TERM {idx + 1}</span>
                          <h4 className="text-slate-950 font-extrabold text-sm font-mono tracking-tight">{item.term}</h4>
                        </div>
                        <div className="space-y-2 text-xs leading-relaxed text-slate-800 font-medium">
                          <div>
                            <span className="text-[10px] font-black uppercase text-emerald-600 block mb-0.5">Definition:</span>
                            <p className="font-mono">{item.definition}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-indigo-600 block mb-0.5">Primary Relation:</span>
                            <p className="font-mono">{formatText(item.primaryRelation)}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-500 block mb-0.5">Other Locations/Links:</span>
                            <p className="font-mono">{formatText(item.otherLocations)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Styled clean minimal footer citation */}
      <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-5 text-center mt-6 select-none space-y-1">
        <Sparkle className="w-4 h-4 text-amber-500 mx-auto" />
        <h4 className="text-[11px] font-bold text-slate-700">CLINOMA CARDS Board Revision Hub</h4>
      </div>
    </div>
  );
}
