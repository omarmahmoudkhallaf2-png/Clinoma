import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string;
  questionTitle: string;
  topic?: string;
}

export function ExplanationDrawer({
  isOpen,
  onClose,
  explanation,
  questionTitle,
  topic
}: ExplanationDrawerProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const highlightText = (text: string) => {
    if (!text) return '';
    // Regexp to split by English scientific/clinical terminology
    const parts = text.split(/([A-Za-z0-9_<>%+\-/]+(?:\s+[A-Za-z0-9_<>%+\-/]+){0,2})/g);
    return parts.map((part, i) => {
      const isEnglish = /^[A-Za-z0-9_<>%+\-/]/.test(part.trim());
      if (isEnglish && part.trim().length > 1) {
        return (
          <span
            key={i}
            className="inline-block mx-1 px-2.5 py-0.5 text-sm font-black font-mono tracking-tight bg-blue-50/95 text-blue-700 border border-blue-200 rounded-lg shadow-sm align-baseline"
            dir="ltr"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderExplanationLine = (line: string, index: number) => {
    const cleanLine = line.trim();
    if (!cleanLine) return null;

    // 1. Main Header block
    const isHeader = cleanLine.endsWith(':') && !cleanLine.match(/^\d+/) && !cleanLine.startsWith('-');
    if (isHeader) {
      const title = cleanLine.replace(/:$/, '');
      return (
        <div key={index} className="mt-6 mb-3 border-r-4 border-amber-500 pr-3">
          <h4 className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-snug">
            {highlightText(title)}
          </h4>
        </div>
      );
    }

    // 2. Numbered card item
    const numMatch = cleanLine.match(/^(\d+)\.\s*(?:\*\*(.*?)\*\*:?)?\s*(.*)$/);
    if (numMatch) {
      const [, stepNum, boldText, bodyText] = numMatch;
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.03, 0.3) }}
          className="group relative flex items-start gap-3.5 p-4 my-2.5 bg-gradient-to-br from-amber-500/[0.015] to-amber-500/[0.045] border border-amber-500/15 hover:border-amber-500/30 rounded-2xl transition-all duration-300 shadow-sm text-right"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-sm shadow-amber-400/20">
            {stepNum.padStart(2, '0')}
          </div>
          <div className="flex-1 min-w-0">
            {boldText && (
              <h5 className="text-[13.5px] sm:text-sm font-black text-amber-950 mb-0.5 flex flex-wrap items-center gap-1">
                {highlightText(boldText)}
              </h5>
            )}
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-semibold break-words">
              {highlightText(bodyText)}
            </p>
          </div>
        </motion.div>
      );
    }

    // 3. Bullet card item
    const bulletMatch = cleanLine.match(/^[-*]\s*(?:\*\*(.*?)\*\*:?)?\s*(.*)$/);
    if (bulletMatch) {
      const [, boldText, bodyText] = bulletMatch;
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.03, 0.3) }}
          className="group relative flex items-start gap-2.5 p-3.5 my-2 bg-gradient-to-br from-sky-500/[0.015] to-sky-500/[0.04] border border-sky-500/10 hover:border-sky-500/25 rounded-2xl transition-all duration-300 shadow-sm text-right"
        >
          <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shadow-sm" />
          <div className="flex-1 min-w-0">
            {boldText && (
              <h5 className="text-[13.5px] sm:text-sm font-black text-sky-950 mb-0.5">
                {highlightText(boldText)}
              </h5>
            )}
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-semibold break-words">
              {highlightText(bodyText)}
            </p>
          </div>
        </motion.div>
      );
    }

    // 4. Default plain text line
    const boldParts = cleanLine.split(/\*\*(.*?)\*\*/g);
    if (boldParts.length > 1) {
      return (
        <p key={index} className="text-slate-700 text-xs sm:text-sm leading-relaxed my-2 font-semibold break-words text-right">
          {boldParts.map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return (
                <strong key={pIdx} className="text-indigo-950 font-black bg-indigo-500/5 px-1 py-0.5 rounded-md">
                  {highlightText(part)}
                </strong>
              );
            }
            return highlightText(part);
          })}
        </p>
      );
    }

    return (
      <p key={index} className="text-slate-700 text-xs sm:text-sm leading-relaxed my-2 font-semibold break-words text-right">
        {highlightText(cleanLine)}
      </p>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="explanation-modal-container">
          {/* Backdrop Overlay with premium blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer transition-opacity"
          />

          {/* Centered Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden border border-slate-100"
            dir="rtl"
          >
            {/* Top Amber Accenting Stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            {/* Header Area */}
            <div className="p-4 sm:p-5 border-b border-slate-100/80 flex items-center justify-between bg-gradient-to-l from-amber-500/[0.04] via-amber-500/[0.01] to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-2xl shadow-inner">
                  💡
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">شرح حالة السؤال</h3>
                  {topic && (
                    <span className="text-[10px] sm:text-xs font-black text-amber-800 bg-amber-100/70 border border-amber-200/50 px-2.5 py-0.5 rounded-lg uppercase tracking-wider mt-0.5 inline-block">
                      {topic}
                    </span>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Scrolling Explanation Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
              {/* Prominent Question Header Text - Now highly visible and formatted beautifully */}
              <div className="pb-4 border-b border-slate-100" dir="ltr">
                <span className="text-xs font-black text-blue-600 block mb-1.5 uppercase tracking-wider">
                  Question Content:
                </span>
                <p className="text-slate-900 text-base sm:text-lg font-extrabold leading-relaxed text-left antialiased">
                  {questionTitle}
                </p>
              </div>

              {/* Parsed Explanation Lines */}
              <div className="py-1">
                {explanation.split('\n').map((line, idx) => renderExplanationLine(line, idx))}
              </div>
            </div>

            {/* Premium Interactive Footer */}
            <div className="p-4 border-t border-slate-100/80 bg-slate-50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 text-center bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                فهمت الشرح العلمي 🎯
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
