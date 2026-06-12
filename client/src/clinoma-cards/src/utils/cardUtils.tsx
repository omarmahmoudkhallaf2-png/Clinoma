import React from 'react';

export const renderCardContent = (content: string) => {
  if (!content) return null;
  
  // Normalize string: first replace any literal "\\n" with real "\n"
  const cleanContent = content.replace(/\\n/g, '\n');
  
  // Normalize inline run-on questions (e.g. Case 11: "Questions: 1- How... 2- Identify...")
  // Split them into newlines safely
  const normalized = cleanContent.replace(/(\s+)(\d+[-.)\s]|[a-zA-Z][)-])(?=\s*[A-Z\u0600-\u06FF])/g, '\n$2');
  const lines = normalized.split('\n');
  
  let inCaseDescription = true;
  const caseLines: string[] = [];
  const questionLines: string[] = [];
  let questionsHeader = '';

  const isArabic = /[\u0600-\u06FF]/.test(cleanContent);
  const dir = isArabic ? 'rtl' : 'ltr';
  const textClass = isArabic ? 'text-right' : 'text-left';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    
    // Check if line is a header like "Questions:" or "Question:"
    const isHeader = lower.startsWith('questions:') || 
                     lower.startsWith('question:') || 
                     lower.startsWith('questions') || 
                     lower.startsWith('question') || 
                     (trimmed.endsWith(':') && trimmed.length < 30); // short label ending with colon

    // Check if it's a list item starting with a bullet/number
    const isQuestionLine = /^(?:\d+|[a-zA-Z])[-.)]\s*/.test(trimmed);

    if (isHeader) {
      inCaseDescription = false;
      questionsHeader = trimmed;
    } else if (inCaseDescription && isQuestionLine) {
      inCaseDescription = false;
      // If we transition to questions via a question line, we don't have a specific header, which is fine
      questionLines.push(line);
    } else if (inCaseDescription) {
      caseLines.push(line);
    } else {
      questionLines.push(line);
    }
  });

  if (questionLines.length === 0 && !questionsHeader) {
    return (
      <div 
        className={`space-y-3 whitespace-pre-wrap text-slate-850 leading-relaxed font-semibold ${textClass}`} 
        dir={dir}
      >
        {cleanContent}
      </div>
    );
  }

  const caseBorderColor = isArabic ? 'border-emerald-500/80' : 'border-blue-600/80';
  const caseBgColor = isArabic ? 'bg-emerald-50/40' : 'bg-slate-50/90';
  const bulletColorClass = isArabic ? 'text-emerald-600' : 'text-indigo-650';
  const itemBgClass = isArabic 
    ? 'bg-emerald-50/20 hover:bg-emerald-50/40 border-emerald-500/5' 
    : 'bg-indigo-50/30 hover:bg-indigo-50/50 border-indigo-500/10';

  return (
    <div className={`space-y-6 w-full ${textClass}`} dir={dir}>
      {/* Case Description Box */}
      {caseLines.length > 0 && (
        <div className={`${caseBgColor} border-r-4 ${caseBorderColor} p-5 rounded-2xl rounded-r-none text-slate-705 text-base md:text-lg leading-relaxed font-semibold shadow-sm`}>
          {caseLines.join('\n')}
        </div>
      )}

      {/* Questions Header */}
      {questionsHeader && (
        questionLines.length === 0 ? (
          <div className={`flex items-start gap-3 p-4 rounded-2xl border ${itemBgClass}`}>
            <span className={`${bulletColorClass} font-black text-base md:text-lg shrink-0 select-none`}>❓</span>
            <p className="text-slate-850 font-bold text-base md:text-lg leading-relaxed">
              {questionsHeader}
            </p>
          </div>
        ) : (
          <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 font-mono tracking-wider flex items-center gap-2">
            <span>❓</span> {questionsHeader}
          </h4>
        )
      )}

      {/* Questions List */}
      {questionLines.length > 0 && (
        <div className="space-y-3.5 mr-2">
          {questionLines.map((line, idx) => {
            if (!line.trim()) return null;
            
            // Highlight question numbers/bullet points
            const match = line.match(/^(\d+[-.)\s]|[-•a-z][-.)\s]|[a-zA-Z][)-])/i);
            let numPrefix = '';
            let restText = line;
            if (match) {
              numPrefix = match[0];
              restText = line.substring(numPrefix.length);
            }

            return (
              <div 
                key={idx} 
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${itemBgClass}`}
              >
                {numPrefix ? (
                  <span className={`${bulletColorClass} font-black text-base md:text-lg shrink-0 select-none`}>
                    {numPrefix}
                  </span>
                ) : (
                  <span className={`${bulletColorClass} shrink-0 select-none mt-1.5`}>•</span>
                )}
                <p className="text-slate-850 font-bold text-base md:text-lg leading-relaxed">
                  {restText.trim()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
