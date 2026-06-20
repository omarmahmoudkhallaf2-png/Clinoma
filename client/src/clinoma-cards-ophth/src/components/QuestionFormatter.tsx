import React, { useMemo, useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface QuestionPromptProps {
  content: string;
  topic?: string;
  chapterTitle?: string;
  type?: string;
  title?: string;
  answer?: string;
  isPastYear?: boolean;
  isSurgical?: boolean;
}

export function extractCoreTerms(title?: string, topic?: string): string[] {
  const termsSet = new Set<string>();
  
  const cleanTerm = (t: string) => {
    return t
      .replace(/Definition\s*&\s*Etiology/gi, '')
      .replace(/Definition\s*&\s*Classification/gi, '')
      .replace(/Definition\s*&\s*Etiology\s*classification/gi, '')
      .replace(/Clinical\s*Picture\s*of/gi, '')
      .replace(/Clinical\s*Picture/gi, '')
      .replace(/Clinical\s*Features\s*of/gi, '')
      .replace(/Clinical\s*Features/gi, '')
      .replace(/Features\s*of/gi, '')
      .replace(/Characteristics/gi, '')
      .replace(/Management\s*&\s*CT\s*Scan\s*Role/gi, '')
      .replace(/Management/gi, '')
      .replace(/Treatment\s*of/gi, '')
      .replace(/Treatment/gi, '')
      .replace(/Anatomy\s*of\s*the/gi, '')
      .replace(/Anatomy/gi, '')
      .replace(/Physiology\s*of\s*the/gi, '')
      .replace(/Physiology/gi, '')
      .replace(/Pathogenesis\s*&\s*Stages\s*of/gi, '')
      .replace(/Pathogenesis/gi, '')
      .replace(/Presentation\s*&\s*Management/gi, '')
      .replace(/Causes\s*of/gi, '')
      .replace(/Causes/gi, '')
      .replace(/General\s*Treatment\s*Lines\s*for/gi, '')
      .replace(/Description/gi, '')
      .replace(/Outline/gi, '')
      .replace(/Differentiating/gi, '')
      .replace(/Differentiation\s*of/gi, '')
      .replace(/Anomalies/gi, '')
      .replace(/Reflexes/gi, '')
      .replace(/Reflex/gi, '')
      .replace(/Pathway/gi, '')
      .replace(/Anatomy\s*&\s*Physiology/gi, '')
      .replace(/Gross\s*Anatomy/gi, '')
      .replace(/Gross/gi, '')
      .replace(/Types\s*and\s*Features/gi, '')
      .replace(/Features/gi, '')
      .replace(/Involvement/gi, '')
      .replace(/Case\s*Study/gi, '')
      .replace(/Preoperative\s*Assessment/gi, '')
      .replace(/Preoperative\s*Preparation\s*for/gi, '')
      .replace(/Preoperative/gi, '')
      .replace(/Preparation/gi, '')
      .replace(/Extraction/gi, '')
      .replace(/Surgical\s*Techniques\s*for/gi, '')
      .replace(/Surgical\s*Technique/gi, '')
      .replace(/Defects/gi, '')
      .replace(/Field/gi, '')
      .replace(/Visual/gi, '')
      .trim();
  };

  const processAndAdd = (raw?: string) => {
    if (!raw) return;
    const cleaned = raw.trim();
    if (cleaned.length > 3) {
      termsSet.add(cleaned);
    }
    let core = cleanTerm(cleaned);
    core = core.replace(/^[\s&,\-:\u00A0]+/g, '').replace(/[\s&,\-:\u00A0]+$/g, '').trim();
    if (core.length > 3) {
      termsSet.add(core);
      const subParts = core.split(/\s+(?:and|&|vs|or|with|\/)\s+/gi);
      if (subParts.length > 1) {
        subParts.forEach(sp => {
          const cleanSp = sp.trim();
          if (cleanSp.length > 3) {
            termsSet.add(cleanSp);
          }
        });
      }
    }
  };

  processAndAdd(topic);
  processAndAdd(title);

  // Common ophthalmic conditions / keywords
  const commonOphthalmicTerms = [
    "Orbital Cellulitis", "orbital cellulitis", "Preseptal Cellulitis", "preseptal cellulitis",
    "Cavernous Sinus Thrombosis", "cavernous sinus thrombosis", "Cataract", "cataract",
    "Congenital Cataract", "Developmental Cataract", "Senile Cataract", "Cortical Cataract", 
    "Nuclear Cataract", "Complicated Cataract", "Traumatic Cataract", "After-Cataract",
    "Posterior Capsule Opacification", "Optic Neuritis", "Papillitis", "Retrobulbar Neuritis",
    "Papilledema", "Optic Atrophy", "Retinitis Pigmentosa", "Vossius Ring",
    "Elschnig's pearls", "Capsular Fibrosis", "Soemmering's ring", "Dacryocystitis",
    "Ligneous Conjunctivitis", "Trachoma", "Ophthalmia Neonatorum", "Spring Catarrh",
    "Vernal Keratoconjunctivitis", "Phlyctenular Conjunctivitis", "Pterygium", "Symblepharon",
    "Pinguecula", "Dry Eye Syndrome", "Keratoconus", "Bacterial Corneal Ulcer", "Hypopyon",
    "Fungal Corneal Ulcer", "Viral Keratitis", "Dendritic Ulcer", "Disciform Keratitis",
    "Acanthamoeba Keratitis", "Corneal Opacity", "Nebula", "Macula", "Leucoma", "Krukenberg Spindle",
    "Blepharitis", "Stye", "Hordeolum", "Chalazion", "Trichiasis", "Entropion", "Ectropion",
    "Ptosis", "Lagophthalmos", "Sympathetic Ophthalmitis", "Endophthalmitis", "Panophthalmitis",
    "Primary Open Angle Glaucoma", "Primary Angle Closure Glaucoma", "Buphthalmos",
    "Developmental Glaucoma", "Secondary Glaucoma", "Uveitis", "Anterior Uveitis", "Iridocyclitis",
    "Intermediate Uveitis", "Posterior Uveitis", "Choroiditis", "Retinitis", "Retinal Detachment",
    "Diabetic Retinopathy", "Hypertensive Retinopathy", "Retinoblastoma", "Strabismus", "Esotropia",
    "Exotropia", "Hypertropia", "Ambyclopia", "Refractive Errors", "Myopia", "Hypermetropia",
    "Astigmatism", "Presbyopia", "Anisometropia", "Aphakia"
  ];

  commonOphthalmicTerms.forEach(term => {
    termsSet.add(term);
  });

  return Array.from(termsSet)
    .filter(t => t.length > 3)
    .sort((a, b) => b.length - a.length);
}

export function renderTextWithHighlights(text: string, title?: string, topic?: string, keyPrefix: string = 'text-hl'): React.ReactNode {
  if (!text) return "";

  // Split on double equals: (==.*?==)
  const markRegex = /(==.*?==)/g;
  const markParts = text.split(markRegex);
  
  if (markParts.length > 1) {
    return (
      <React.Fragment key={keyPrefix}>
        {markParts.map((markPart, mIdx) => {
          if (markPart.startsWith("==") && markPart.endsWith("==")) {
            const innerText = markPart.slice(2, -2);
            return (
              <span 
                key={`mark-${mIdx}`} 
                className="bg-yellow-200 text-slate-950 font-bold px-1.5 py-0.5 rounded-md inline-block select-all transition-all shadow-sm mx-1 border border-yellow-300"
              >
                {innerText}
              </span>
            );
          }
          // For non-marked parts, apply standard core terms highlight
          return renderCoreTermsHighlights(markPart, title, topic, `${keyPrefix}-p-${mIdx}`);
        })}
      </React.Fragment>
    );
  }

  return renderCoreTermsHighlights(text, title, topic, keyPrefix);
}

export function renderBoldAndHighlights(text: string, title?: string, topic?: string): React.ReactNode {
  if (!text) return "";
  const boldRegex = /(\*\*.*?\*\*)/g;
  const parts = text.split(boldRegex);
  return (
    <>
      {parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={`bold-${pIdx}`} className="font-extrabold text-slate-950">
              {renderTextWithHighlights(part.slice(2, -2), title, topic, `bold-inner-${pIdx}`)}
            </strong>
          );
        }
        return (
          <React.Fragment key={`plain-${pIdx}`}>
            {renderTextWithHighlights(part, title, topic, `plain-inner-${pIdx}`)}
          </React.Fragment>
        );
      })}
    </>
  );
}

function renderCoreTermsHighlights(text: string, title?: string, topic?: string, keyPrefix: string = ''): React.ReactNode {
  const terms = extractCoreTerms(title, topic);
  if (terms.length === 0) return <React.Fragment key={keyPrefix}>{text}</React.Fragment>;

  // Let's escape regex special characters
  const { escapedTerms, validTerms } = terms.reduce((acc, t) => {
    // Make sure we only highlight valid terms that have actual text (avoid empty ones or single characters)
    if (t && t.length > 3) {
      acc.escapedTerms.push(t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
      acc.validTerms.push(t);
    }
    return acc;
  }, { escapedTerms: [] as string[], validTerms: [] as string[] });

  if (escapedTerms.length === 0) return <React.Fragment key={keyPrefix}>{text}</React.Fragment>;

  // Build safe case-insensitive RegExp matching our terms as complete words
  const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

  const parts = text.split(regex);
  if (parts.length <= 1) return <React.Fragment key={keyPrefix}>{text}</React.Fragment>;

  return (
    <React.Fragment key={keyPrefix}>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span 
              key={`${keyPrefix}-${index}`} 
              className="text-[#DC2626] font-extrabold text-[1.02em] underline decoration-red-600 decoration-2 underline-offset-4 inline tracking-normal select-all transition-all duration-150"
            >
              {part}
            </span>
          );
        }
        return <React.Fragment key={`${keyPrefix}-part-${index}`}>{part}</React.Fragment>;
      })}
    </React.Fragment>
  );
}

export function parseQuestionContent(content: string): { scenario: string; questions: string[] } {
  const text = content.trim();

  // 1. Check for explicit line breaks with numbers or letters at the start of lines, e.g. case scenarios
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 1) {
    const questions: string[] = [];
    const scenarioParts: string[] = [];
    
    lines.forEach(line => {
      let isQuestion = false;
      let cleanedLine = line;

      if (/^[-•●*]\s+/.test(line)) {
        isQuestion = true;
        cleanedLine = line.replace(/^[-•●*]\s+/, '').trim();
      } else if (/^(?:[qQ]|Question\s+)?\d+(?:[.)\]:]\s*|[-]\s+|\s+)/.test(line)) {
        isQuestion = true;
        cleanedLine = line.replace(/^(?:[qQ]|Question\s+)?\d+(?:[.)\]:]\s*|[-]\s+|\s+)/, '').trim();
      } else if (/^[a-zA-Z]{1,4}[.)\]\-:]+\s+/.test(line)) {
        isQuestion = true;
        cleanedLine = line.replace(/^[a-zA-Z]{1,4}[.)\]\-:]+\s+/, '').trim();
      }

      if (isQuestion) {
        questions.push(cleanedLine);
      } else {
        scenarioParts.push(line);
      }
    });

    if (questions.length > 0) {
      return {
        scenario: scenarioParts.join('\n') || text,
        questions: questions
      };
    }
  }

  // 2. Check for comma or "and" separated clauses
  let temp = text;
  temp = temp.replace(/,\s+and\s+/gi, '||');
  temp = temp.replace(/;\s+and\s+/gi, '||');
  temp = temp.replace(/;\s+/g, '||');
  
  // also comma followed by specific words suggesting separate prompt action
  temp = temp.replace(/,\s+(?=(?:its|how|why|what|describe|define|state|outline|differentiate|contrast|prevent|anatomical|clinical|etiological|pathological|is\s+it|where|when|which|who|whom|list|enumerate|name|provide|give|explain|discuss|compare|classify|identify|distinguish|determine))/gi, '||');
  
  // and followed by action words
  temp = temp.replace(/\s+and\s+(?=(?:how|why|what|describe|define|state|outline|differentiate|contrast|prevent|anatomical|clinical|etiological|pathological|is\s+it|where|when|which|who|whom|list|enumerate|name|provide|give|explain|discuss|compare|classify|identify|distinguish|determine))/gi, '||');

  const rawParts = temp.split('||').map(p => p.trim()).filter(p => p.length > 0);
  
  if (rawParts.length > 1) {
    const formattedQuestions: string[] = [];
    rawParts.forEach((part, index) => {
      let cleaned = part;
      // strip active ending punctuations
      cleaned = cleaned.replace(/[.,\s;\-:]+$/, '');
      
      // Capitalize first letter
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      
      // End with ? or :
      if (index === rawParts.length - 1 && text.endsWith('?')) {
        if (!cleaned.endsWith('?')) cleaned += '?';
      } else {
        if (/^(?:how|why|what|where|when|which|who|whom|is|does|are|can|could|should|will|would)/i.test(cleaned)) {
          cleaned += '?';
        } else {
          cleaned += ':';
        }
      }
      formattedQuestions.push(cleaned);
    });

    // We can use the first sentence as scenario or just the full text. 
    // To match the requested style, let's have the first element be the "Scenario / main quest", and subsequent are "questions" list
    return {
      scenario: text,
      questions: formattedQuestions
    };
  }

  // 3. Fallback: single question
  return {
    scenario: text,
    questions: []
  };
}

export default function QuestionPrompt({ content, topic, chapterTitle, type, title, answer, isPastYear, isSurgical }: QuestionPromptProps) {
  const [copied, setCopied] = useState(false);

  const cleanContent = useMemo(() => {
    if (!content) return "";
    return content.replace(/\\n/g, '\n');
  }, [content]);

  const cleanAnswer = useMemo(() => {
    if (!answer) return "";
    return answer.replace(/\\n/g, '\n');
  }, [answer]);

  const handleCopy = async () => {
    if (!cleanAnswer) return;
    const plainText = `Question:\n${cleanContent}\n\nAnswer:\n${cleanAnswer}`;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isCase = useMemo(() => {
    const matchTitle = title?.toLowerCase().includes('case') || false;
    const matchTopic = topic?.toLowerCase().includes('case') || false;
    const matchType = type?.toLowerCase().includes('case') || false;
    const hasNumberedList = /\n\s*(?:1|\d+)[\s.)\-]+/.test(cleanContent);
    return matchTitle || matchTopic || matchType || hasNumberedList;
  }, [title, topic, type, cleanContent]);

  const parsed = useMemo(() => {
    if (isCase) {
      return parseQuestionContent(cleanContent);
    }
    return {
      scenario: cleanContent,
      questions: []
    };
  }, [isCase, cleanContent]);

  return (
    <div className="w-full flex flex-col text-left font-sans">
      <div className="flex flex-wrap gap-2 mb-4">
        {isPastYear && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-amber-300 bg-amber-50 rounded-xl text-amber-800 text-xs font-black tracking-wider select-none max-w-max mr-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>Past Exam Question 📜</span>
          </div>
        )}
        {isSurgical && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 bg-blue-50 rounded-xl text-blue-800 text-xs font-black tracking-wider select-none max-w-max uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span>surgical principles ✂️</span>
          </div>
        )}
      </div>

      {/* Copy row */}
      <div className="flex justify-end items-center mb-4">
        {cleanAnswer && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-705 hover:text-slate-900 shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer select-none"
            title="Copy Question & Answer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50 duration-150" />
                <span className="text-emerald-700 font-medium">Question & Answer copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium">Copy Question & Answer</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Scenario / Main Prompt Container with Border-Left Accent */}
      {isCase ? (
        <div 
          className="bg-[#EFF6FF] border-l-[4px] border-[#2563EB] rounded-2xl p-6 md:p-8 text-left shadow-sm transition-colors relative group"
        >
          <p className="text-base md:text-lg leading-relaxed font-semibold max-w-4xl text-[#1E40AF]">
            {renderBoldAndHighlights(parsed.scenario, title, topic)}
          </p>
        </div>
      ) : (
        <div 
          className="bg-[#F8FAFC] border-l-[4px] border-[#2563EB] rounded-2xl p-6 md:p-8 text-left shadow-sm transition-colors relative group"
        >
          <p className="text-slate-800 text-base md:text-lg leading-relaxed font-semibold max-w-4xl">
            {renderBoldAndHighlights(cleanContent, title, topic)}
          </p>
        </div>
      )}

      {/* Sub-Questions list (if multiple items are present) */}
      {isCase && parsed.questions.length > 0 && (
        <>
          <div className="flex items-center gap-1.5 text-[#1D4ED8] font-bold text-xs tracking-wider uppercase mt-6 mb-3">
            <span className="text-sm font-black">?</span> Questions:
          </div>
          <div className="space-y-3">
            {parsed.questions.map((subQ, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-sm hover:border-slate-300 transition-all flex items-start gap-4 text-left duration-200"
              >
                <div className="w-2 h-2 rounded-full bg-slate-900 shrink-0 mt-2" />
                <span className="text-slate-900 font-bold text-sm md:text-base leading-relaxed">
                  {renderBoldAndHighlights(subQ, title, topic)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface AnswerFormatterProps {
  answer: string;
  topic?: string;
  title?: string;
  content?: string;
}

export function extractSubjects(title?: string, topic?: string): [string, string] | null {
  const text = title || topic || "";
  // Search for VS in title
  const vsRegex = /(?:differentiating|differentiation\s+of|contrast|comparison\s+between|compare)?\s*([A-Za-z0-9_ \(\)'\-]+?)\s+(?:vs\.?|versus|VS)\s+([A-Za-z0-9_ \(\)'\-]+)/i;
  const match = text.match(vsRegex);
  if (match) {
    let subA = match[1].trim();
    let subB = match[2].trim();
    
    // Clean-up prefix noise
    subA = subA.replace(/^(?:differentiating|differentiation\s+of|contrast|comparison\s+between|compare|between\s+the|between|the|of|points\s+of\s+differential\s+diagnosis\s+between\s+the|points\s+of\s+diff.*?\s+between\s+the|differentiating\s+between|contrast\s+between)\s+/i, "");
    subB = subB.replace(/^(?:the|of)\s+/i, "");
    
    // Clean-up suffix noise
    subB = subB.replace(/\s+(?:differential\s+diagnosis|comparison|differentiation|features|presentation|management|signs|complications|complication|papillae)$/i, "");
    subA = subA.replace(/\s+(?:differential\s+diagnosis|comparison|differentiation|features|presentation|management|signs|complications|complication|papillae)$/i, "");
    
    return [subA, subB];
  }
  
  // Try pattern "between X and Y"
  const betweenRegex = /between\s+the\s+([A-Za-z0-9_ \(\)'\-]+?)\s+and\s+the\s+([A-Za-z0-9_ \(\)'\-]+)/i;
  const matchBetween = text.match(betweenRegex);
  if (matchBetween) {
    return [matchBetween[1].trim(), matchBetween[2].trim()];
  }

  const betweenPlainRegex = /between\s+([A-Za-z0-9_ \(\)'\-]+?)\s+and\s+([A-Za-z0-9_ \(\)'\-]+)/i;
  const matchBetweenPlain = text.match(betweenPlainRegex);
  if (matchBetweenPlain) {
    return [matchBetweenPlain[1].trim(), matchBetweenPlain[2].trim()];
  }

  return null;
}

export interface ComparisonRow {
  criterion?: string;
  valA: string;
  valB: string;
}

export interface ComparisonData {
  titleA: string;
  titleB: string;
  rows: ComparisonRow[];
  isCriterionBased: boolean;
}

export function splitOuterVs(line: string): { left: string; right: string } | null {
  let depth = 0;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '(' || char === '[' || char === '{') {
      depth++;
    } else if (char === ')' || char === ']' || char === '}') {
      depth = Math.max(0, depth - 1);
    } else if (depth === 0) {
      const remaining = line.substring(i);
      const matchVs = remaining.match(/^(?:\s+(?:vs\.?|versus|VS)\s+)/i);
      if (matchVs) {
        const matchStr = matchVs[0];
        const left = line.substring(0, i);
        const right = line.substring(i + matchStr.length);
        return { left, right };
      }
    }
  }
  return null;
}

export function splitCriterionAndVal(left: string): { criterion?: string; val: string } {
  let depth = 0;
  for (let i = 0; i < left.length; i++) {
    const char = left[i];
    if (char === '(' || char === '[' || char === '{') {
      depth++;
    } else if (char === ')' || char === ']' || char === '}') {
      depth = Math.max(0, depth - 1);
    } else if (depth === 0 && char === ':') {
      const criterion = left.substring(0, i).replace(/^[-*•●\d+\.\s]+/, '').trim();
      const val = left.substring(i + 1).trim();
      if (criterion.length > 0 && criterion.length < 60) {
        return { criterion, val };
      }
    }
  }
  return { val: left.replace(/^[-*•●\d+\.\s]+/, '').trim() };
}

export function tryParseComparison(answer: string, title?: string, topic?: string): ComparisonData | null {
  if (!answer) return null;
  
  const lines = answer.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return null;

  // Pattern 2: Block-based comparison of 2 items
  if (lines.length === 2) {
    const line1 = lines[0];
    const line2 = lines[1];
    
    const colon1 = line1.indexOf(':');
    const colon2 = line2.indexOf(':');
    if (colon1 > 0 && colon2 > 0) {
      const isBullet1 = /^[-*•●\d+\.\)]/.test(line1);
      const isBullet2 = /^[-*•●\d+\.\)]/.test(line2);
      if (isBullet1 && isBullet2) {
        const subA = line1.substring(0, colon1).replace(/^[-*•●\d\.\)\s]+/, '').trim();
        const descA = line1.substring(colon1 + 1).trim();
        
        const subB = line2.substring(0, colon2).replace(/^[-*•●\d\.\)\s]+/, '').trim();
        const descB = line2.substring(colon2 + 1).trim();
        
        if (subA.length > 1 && subB.length > 1) {
          return {
            titleA: subA,
            titleB: subB,
            isCriterionBased: false,
            rows: [
              {
                valA: descA,
                valB: descB
              }
            ]
          };
        }
      }
    }
  }

  // Pattern 1: Criterion-based rows split
  const rows: ComparisonRow[] = [];
  let containsVsLines = 0;

  for (const line of lines) {
    const splitRes = splitOuterVs(line);
    if (splitRes) {
      containsVsLines++;
      const { left, right } = splitRes;
      const { criterion, val } = splitCriterionAndVal(left);
      rows.push({
        criterion,
        valA: val,
        valB: right.trim()
      });
    }
  }

  if (rows.length >= 2 || (rows.length >= 1 && containsVsLines >= lines.length / 2)) {
    let titleA = "";
    let titleB = "";
    
    const subjects = extractSubjects(title, topic);
    if (subjects) {
      titleA = subjects[0];
      titleB = subjects[1];
    } else {
      if (title && title.includes('vs')) {
        const parts = title.split(/\s+(?:vs\.?|versus|VS)\s+/i);
        if (parts.length === 2) {
          titleA = parts[0].trim();
          titleB = parts[1].trim();
        }
      }
    }

    if (!titleA || !titleB) {
      return null;
    }

    return {
      titleA,
      titleB,
      isCriterionBased: true,
      rows
    };
  }

  return null;
}

export function getCriterionIcon(name: string): string {
  const n = name.toLowerCase().trim();
  if (n.includes('etiology') || n.includes('cause') || n.includes('etiological')) return '🔬';
  if (n.includes('symptom') || n.includes('sign') || n.includes('presentation') || n.includes('clinical')) return '👁️';
  if (n.includes('season') || n.includes('time') || n.includes('duration') || n.includes('period')) return '📅';
  if (n.includes('sex') || n.includes('gender')) return '👥';
  if (n.includes('size')) return '📏';
  if (n.includes('top') || n.includes('shape') || n.includes('form') || n.includes('contour')) return '💠';
  if (n.includes('color')) return '🎨';
  if (n.includes('discharge') || n.includes('tearing') || n.includes('secretion') || n.includes('wet')) return '💧';
  if (n.includes('inclusion') || n.includes('body') || n.includes('micro') || n.includes('patho') || n.includes('organism') || n.includes('cell')) return '🧫';
  if (n.includes('site') || n.includes('location') || n.includes('area') || n.includes('position')) return '📍';
  if (n.includes('treatment') || n.includes('manage') || n.includes('therapy') || n.includes('medical') || n.includes('drug')) return '💊';
  if (n.includes('surgical') || n.includes('surgery') || n.includes('incision') || n.includes('operation')) return '✂️';
  if (n.includes('age') || n.includes('onset') || n.includes('incidence')) return '👶';
  if (n.includes('ulcer') || n.includes('suppur') || n.includes('abscess') || n.includes('wound') || n.includes('bleed')) return '🩹';
  if (n.includes('vascul') || n.includes('blood') || n.includes('vessel') || n.includes('inject')) return '🩸';
  if (n.includes('history') || n.includes('diagnostic') || n.includes('eval') || n.includes('test') || n.includes('investig')) return '🩺';
  if (n.includes('complicat')) return '⚠️';
  if (n.includes('prognosis') || n.includes('outcome')) return '🔮';
  return '📌';
}

interface TableBlock {
  type: 'table';
  headers: string[];
  alignments: ('left' | 'center' | 'right')[];
  rows: string[][];
}

interface TextBlock {
  type: 'text';
  lines: string[];
}

type ContentBlock = TableBlock | TextBlock;

export function AnswerFormatter({ answer, topic, title, content }: AnswerFormatterProps) {
  const [showTraditional, setShowTraditional] = useState(false);

  const cleanAnswer = useMemo(() => {
    if (!answer) return "";
    return answer.replace(/\\n/g, '\n');
  }, [answer]);

  const lines = useMemo(() => cleanAnswer.split('\n'), [cleanAnswer]);

  // Try parsing comparison data (original Criterion/Block comparisons)
  const comparisonData = useMemo(() => {
    return tryParseComparison(cleanAnswer, title, topic);
  }, [cleanAnswer, title, topic]);

  // Sequentially parse cleanAnswer into blocks (paragraphs/lists and markdown tables)
  const blocks = useMemo(() => {
    const list = cleanAnswer.split('\n');
    const result: ContentBlock[] = [];
    let currentTextBlock: string[] = [];

    for (let i = 0; i < list.length; i++) {
      const line = list[i];
      const trimmed = line.trim();

      // Check if it is a table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (currentTextBlock.length > 0) {
          result.push({ type: 'text', lines: currentTextBlock });
          currentTextBlock = [];
        }

        const tableLines: string[] = [];
        while (i < list.length && list[i].trim().startsWith('|') && list[i].trim().endsWith('|')) {
          tableLines.push(list[i].trim());
          i++;
        }
        i--; // Adjust index

        if (tableLines.length >= 2) {
          // Line 0 is headers
          const headers = tableLines[0]
            .slice(1, -1)
            .split('|')
            .map(h => h.trim());

          // Line 1 is the separator: e.g. |:---|:---|
          const separatorMatches = tableLines[1].slice(1, -1).split('|');
          
          let isRealTable = true;
          // Verify separator line has only dashes, colons, spaces, and vertical bars
          if (!/^[:\-\s]+$/.test(tableLines[1].replace(/\|/g, ''))) {
            isRealTable = false;
          }

          if (isRealTable) {
            const alignments = separatorMatches.map(part => {
              const s = part.trim();
              if (s.startsWith(':') && s.endsWith(':')) return 'center';
              if (s.endsWith(':')) return 'right';
              return 'left';
            });

            const rows: string[][] = [];
            for (let j = 2; j < tableLines.length; j++) {
              const rowData = tableLines[j]
                .slice(1, -1)
                .split('|')
                .map(r => r.trim());
              rows.push(rowData);
            }

            result.push({
              type: 'table',
              headers,
              alignments,
              rows
            });
          } else {
            currentTextBlock.push(...tableLines);
          }
        } else {
          currentTextBlock.push(...tableLines);
        }
      } else {
        currentTextBlock.push(line);
      }
    }

    if (currentTextBlock.length > 0) {
      result.push({ type: 'text', lines: currentTextBlock });
    }

    return result;
  }, [cleanAnswer]);

  if (comparisonData && !showTraditional) {
    const data = comparisonData;
    return (
      <div className="w-full font-sans">
        {data.isCriterionBased ? (
          /* Criterion Based Table */
          <div className="w-full my-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-blue-600 transition-all">
            {/* Header section with contrasting subjects badges */}
            <div className="bg-slate-50/70 p-4 md:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl text-lg shrink-0">
                  ⚖️
                </div>
                <div>
                  <h4 className="text-[#154c59] font-extrabold text-sm md:text-base tracking-tight uppercase">
                    Structured Comparison
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Detailed comparison based on multiple diagnostic criteria
                  </p>
                </div>
              </div>
              
              {/* Subjects in beautiful matching badges */}
              <div className="flex items-center gap-2 select-all flex-wrap">
                <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-black px-3 py-1.5 rounded-xl shadow-sm">
                  {data.titleA}
                </span>
                <span className="text-slate-400 text-[10px] font-black shrink-0 px-1.5 py-0.5 border border-slate-200 bg-white rounded-lg shadow-sm font-mono">VS</span>
                <span className="bg-purple-50 text-purple-700 border border-purple-200/60 text-xs font-black px-3 py-1.5 rounded-xl shadow-sm">
                  {data.titleB}
                </span>
              </div>
            </div>

            {/* Structured Table UI */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-slate-50/40 border-b border-slate-200">
                    <th className="py-4 px-5 text-xs font-black text-slate-500 uppercase tracking-wider w-1/4 select-none">
                      Criterion
                    </th>
                    <th className="py-4 px-5 text-xs font-black text-blue-700 uppercase tracking-wider w-3/8 border-l border-slate-100 bg-blue-50/10">
                      {data.titleA}
                    </th>
                    <th className="py-4 px-5 text-xs font-black text-purple-700 uppercase tracking-wider w-3/8 border-l border-slate-100 bg-purple-50/10">
                      {data.titleB}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.rows.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      className={`hover:bg-slate-50/40 transition-colors ${rIdx % 2 === 1 ? 'bg-slate-50/10' : 'bg-white'}`}
                    >
                      {/* Point of comparison / Criterion column */}
                      <td className="py-4 px-5 text-slate-900 text-sm align-top font-bold">
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none select-none filter drop-shadow-sm shrink-0">
                            {getCriterionIcon(row.criterion || "")}
                          </span>
                          <span className="text-slate-950 font-extrabold tracking-tight">
                            {row.criterion || `Point ${rIdx + 1}`}
                          </span>
                        </span>
                      </td>
                      
                      {/* Subject A Side Value */}
                      <td className="py-4 px-5 text-slate-800 text-sm leading-relaxed border-l border-slate-100 align-top max-w-[260px]">
                        <span className="block font-medium">
                          {renderBoldAndHighlights(row.valA, title, topic)}
                        </span>
                      </td>
                      
                      {/* Subject B Side Value */}
                      <td className="py-4 px-5 text-slate-800 text-sm leading-relaxed border-l border-slate-105 border-slate-100 align-top max-w-[260px]">
                        <span className="block font-medium">
                          {renderBoldAndHighlights(row.valB, title, topic)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table bottom labels and toggle button */}
            <div className="bg-slate-50/40 py-3 px-5 border-t border-slate-150 border-slate-200/80 text-slate-500 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span>💡 Double-click any word to select and copy directly.</span>
              </span>
              
              <button
                type="button"
                onClick={() => setShowTraditional(true)}
                className="text-blue-600 hover:text-blue-800 font-extrabold text-xs flex items-center gap-1 cursor-pointer underline hover:no-underline align-middle shrink-0"
              >
                <span>View as plain text template 📄</span>
              </button>
            </div>
          </div>
        ) : (
          /* Side by Side Block Comparisons */
          <div className="space-y-4 my-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.rows.map((row, index) => (
                <React.Fragment key={index}>
                  {/* Subject A Box */}
                  <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-blue-500 transition-all duration-200">
                    <div className="bg-blue-50/40 p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        <h5 className="text-blue-900 font-extrabold text-sm md:text-base tracking-tight select-all">
                          {data.titleA}
                        </h5>
                      </div>
                      <span className="bg-blue-100/50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg select-none">
                        Concept One
                      </span>
                    </div>
                    <div className="p-5 text-slate-800 text-sm md:text-base leading-relaxed font-semibold">
                      {renderBoldAndHighlights(row.valA, title, topic)}
                    </div>
                  </div>

                  {/* Subject B Box */}
                  <div className="bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-purple-500 transition-all duration-200">
                    <div className="bg-purple-50/40 p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        <h5 className="text-purple-900 font-extrabold text-sm md:text-base tracking-tight select-all">
                          {data.titleB}
                        </h5>
                      </div>
                      <span className="bg-purple-100/50 text-purple-700 text-[10px] font-black px-2.5 py-1 rounded-lg select-none">
                        Concept Two
                      </span>
                    </div>
                    <div className="p-5 text-slate-800 text-sm md:text-base leading-relaxed font-semibold">
                      {renderBoldAndHighlights(row.valB, title, topic)}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Traditional Option under Blocks */}
            <div className="flex justify-end pr-2 select-none">
              <button
                type="button"
                onClick={() => setShowTraditional(true)}
                className="text-blue-600 hover:text-blue-800 font-extrabold text-xs flex items-center gap-1 cursor-pointer underline hover:no-underline"
              >
                <span>View as plain text template 📄</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Base fallback flow mapping through detected Text & Markdown Table blocks sequentially
  return (
    <div className="space-y-4 font-sans w-full">
      {/* Traditional Toggle if custom comparison exists */}
      {comparisonData && showTraditional && (
        <div className="bg-blue-50/60 p-3.5 border border-blue-200/70 rounded-2xl flex items-center justify-between gap-4 select-none mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
            <span>ℹ️ Currently displayed in plain text blocks format.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTraditional(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            📊 Convert to Structured Comparison Table
          </button>
        </div>
      )}

      {blocks.map((block, bIdx) => {
        if (block.type === 'table') {
          return (
            <div 
              key={`table-block-${bIdx}`} 
              className="w-full my-6 bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden border-t-4 border-t-[#154c59] transition-all"
            >
              <div className="bg-slate-50/70 p-4 md:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#154c59]/10 text-[#154c59] p-2.5 rounded-xl text-lg shrink-0">
                    📊
                  </div>
                  <div>
                    <h4 className="text-[#154c59] font-extrabold text-sm md:text-base tracking-tight uppercase">
                      Structured Comparison Table
                    </h4>
                    <p className="text-xs text-slate-550 font-medium mt-0.5">
                      Precise and clean presentation based on Board preparation criteria
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[550px]" dir="ltr">
                  <thead>
                    <tr className="bg-slate-100/50 border-b border-slate-200">
                      {block.headers.map((hdr, hIdx) => {
                        const align = block.alignments[hIdx] || 'left';
                        const isFirst = hIdx === 0;
                        return (
                          <th 
                            key={hdr + hIdx} 
                            className={`py-4 px-5 text-xs font-black uppercase tracking-wider ${
                              isFirst 
                                ? 'text-slate-900 border-none' 
                                : hIdx === 1 
                                  ? 'text-blue-700 bg-blue-50/10 border-l border-slate-200' 
                                  : 'text-purple-700 bg-purple-50/10 border-l border-slate-200'
                            } ${
                              align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
                            }`}
                          >
                            {renderBoldAndHighlights(hdr, title, topic)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {block.rows.map((row, rIdx) => (
                      <tr 
                        key={rIdx} 
                        className={`hover:bg-slate-50/40 transition-colors ${rIdx % 2 === 1 ? 'bg-slate-50/10' : 'bg-white'}`}
                      >
                        {row.map((cell, cIdx) => {
                          const align = block.alignments[cIdx] || 'left';
                          const isFirst = cIdx === 0;
                          return (
                            <td 
                              key={cIdx} 
                              className={`py-4 px-5 text-sm leading-relaxed align-top ${
                                isFirst 
                                  ? 'text-slate-950 font-extrabold font-sans w-1/4' 
                                  : 'text-slate-800 font-semibold w-3/8 border-l border-slate-200'
                              } ${
                                align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
                              }`}
                            >
                              {isFirst ? (
                                <span className="flex items-center gap-2">
                                  <span className="text-base leading-none select-none filter drop-shadow-sm shrink-0">
                                    {getCriterionIcon(cell || "")}
                                  </span>
                                  <span>
                                    {renderBoldAndHighlights(cell, title, topic)}
                                  </span>
                                </span>
                              ) : (
                                renderBoldAndHighlights(cell, title, topic)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50/40 py-3 px-5 border-t border-slate-150 border-slate-250 text-slate-500 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span>💡 Double-click any word to select and copy directly.</span>
                </span>
              </div>
            </div>
          );
        } else {
          return (
            <React.Fragment key={`text-block-${bIdx}`}>
              {renderTextBlockLines(block.lines, title, topic)}
            </React.Fragment>
          );
        }
      })}
    </div>
  );
}

function renderTextBlockLines(lines: string[], title?: string, topic?: string) {
  return (
    <div className="space-y-3 font-sans w-full text-left">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.length === 0) {
          return <div key={idx} className="h-2" />;
        }

        const leadingSpaces = line.match(/^ */)?.[0].length || 0;
        
        let indentClass = "";
        if (leadingSpaces >= 6) {
          indentClass = "pl-6 border-l-2 border-slate-200 ml-4 py-0.5";
        } else if (leadingSpaces >= 3) {
          indentClass = "pl-4 border-l border-slate-300 ml-2 py-0.5";
        }

        let cleanText = trimmed;
        let isBullet = false;
        let isHeading = false;
        let customBullet = "";

        if (/^[-*•●]\s+/.test(cleanText)) {
          isBullet = true;
          cleanText = cleanText.replace(/^[-*•●]\s+/, '');
        }

        const numMatch = cleanText.match(/^(\d+(?:\.\d+)*[\s.)\-]+)/);
        const letterMatch = !numMatch && cleanText.match(/^([a-zA-Z])[.)\-]+\s+/);
        
        if (numMatch) {
          isBullet = true;
          customBullet = numMatch[1].trim();
          cleanText = cleanText.replace(/^(\d+(?:\.\d+)*[\s.)\-]+)/, '');
        } else if (letterMatch) {
          isBullet = true;
          customBullet = letterMatch[1].trim();
          cleanText = cleanText.replace(/^([a-zA-Z])[.)\-]+\s+/, '');
        }

        const hasColon = cleanText.includes(':');
        const colonPos = cleanText.indexOf(':');
        const isColonHeader = hasColon && (cleanText.endsWith(':') || colonPos < 20 && cleanText.length - colonPos < 4);
        
        if (isColonHeader && !cleanText.includes('http')) {
          isHeading = true;
        }

        const hasInlinePrefix = hasColon && !isHeading && colonPos > 0 && colonPos < 35 && cleanText.length - colonPos > 5 && !cleanText.includes('http');

        let prefix = "";
        let bodyText = cleanText;
        if (hasInlinePrefix) {
          prefix = cleanText.substring(0, colonPos + 1);
          bodyText = cleanText.substring(colonPos + 1).trim();
        }

        if (isHeading) {
          return (
            <div key={idx} className={`mt-5 mb-2.5 ${indentClass}`}>
              <h4 className="text-[#8a6d2c] font-extrabold text-sm md:text-base tracking-tight uppercase border-b border-slate-100 pb-1.5 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#154c59] rounded-full shrink-0" />
                {renderBoldAndHighlights(cleanText, title, topic)}
              </h4>
            </div>
          );
        }

        return (
          <div key={idx} className={`flex items-start gap-3 leading-relaxed text-slate-705 text-slate-750 text-sm md:text-base ${indentClass}`}>
            {isBullet ? (
              customBullet ? (
                <span className="bg-amber-50 border border-amber-200 text-[#8a6d2c] text-[10px] md:text-xs font-black min-w-[22px] h-[22px] flex items-center justify-center rounded-lg shrink-0 mt-0.5 select-none px-1 shadow-sm font-mono">
                  {customBullet}
                </span>
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#154c59] shrink-[#154c59] shrink-0 mt-2 relative">
                  <div className="absolute inset-0 rounded-full bg-[#1e5c6b] animate-pulse" />
                </div>
              )
            ) : (
              leadingSpaces > 0 ? (
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2" />
              ) : (
                <div className="w-2 h-2 bg-[#154c59] rounded-full shrink-0 mt-2" />
              )
            )}
            
            <span className="font-sans font-medium text-slate-800">
              {prefix && (
                <strong className="text-[#8a6d2c] font-black inline mr-1">
                  {prefix}
                </strong>
              )}
              {renderBoldAndHighlights(bodyText, title, topic)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
