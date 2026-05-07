
const tryFetch = async (model: string, payload: any, key: string) => {
  const versions = ['v1beta', 'v1'];
  for (const version of versions) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // If quota exceeded or restricted, return special status to skip this key
      if (response.status === 429 || response.status === 403) return { ok: false, status: response.status };
      
      if (response.ok) return response;
      if (response.status === 404 || response.status === 400) continue;
      
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      continue;
    }
  }
  return null;
};

export const extractTopics = async (fileData: { data: string, mimeType: string }) => {
  const KEYS = [
    "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
    "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4",
    "AIzaSyAsuqzTQlgwhhhUAUhLy9Wd92xgR_kvVDA",
    "AIzaSyA05ajCmTzdHKYE1YAU0t6VQHj3DhUE-Zw",
    "AIzaSyAyZ-gdyKEgGgBwZx77EkPVpC1vDyjsyPc"
  ];
  const models = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash"];
  const allKeys = [import.meta.env.VITE_GEMINI_API_KEY, ...KEYS]
    .filter(Boolean)
    .sort(() => Math.random() - 0.5);

  for (const key of allKeys) {
    for (const model of models) {
      const contents = [{ 
        role: 'user', 
        parts: [
          { text: "Extract the main scientific/medical topics from this file. Return them as a simple numbered list. Example:\n1. Myopia\n2. Hypermetropia\n\nOnly the list, no other text." },
          { inline_data: { mime_type: fileData.mimeType, data: fileData.data.split(',')[1] } }
        ] 
      }];

      const res = await tryFetch(model, { contents }, key!);
      if (res && (res.status === 429 || res.status === 403)) break; // Skip to next key
      if (res && res.ok) {
        const data = await (res as Response).json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    }
  }
  return "";
};

export const generateAIResponse = async (
  prompt: string, 
  fileData?: { data: string, mimeType: string }, 
  options?: { depth?: string, language?: string }
) => {
  const KEYS = [
    "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
    "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4",
    "AIzaSyAsuqzTQlgwhhhUAUhLy9Wd92xgR_kvVDA",
    "AIzaSyA05ajCmTzdHKYE1YAU0t6VQHj3DhUE-Zw",
    "AIzaSyAyZ-gdyKEgGgBwZx77EkPVpC1vDyjsyPc"
  ];
  
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-3.1-pro-preview"
  ];

  // Shuffle keys to distribute load
  const allKeys = [import.meta.env.VITE_GEMINI_API_KEY, ...KEYS]
    .filter(Boolean)
    .sort(() => Math.random() - 0.5);

  const depthPrompt = options?.depth === 'detailed' 
    ? 'اشرح كل شيء بالتفصيل الممل، لا تترك أي نقطة.' 
    : options?.depth === 'medium' 
    ? 'اشرح غالبية الموضوع مع التركيز على النقاط المهمة.' 
    : 'اشرح فقط المعلومات الجوهرية والمهمة باختصار.';

  const langPrompt = options?.language === 'ar-en'
    ? 'استخدم اللغة العربية مع ذكر المصطلحات العلمية بالإنجليزية بين قوسين.'
    : 'استخدم اللغة الإنجليزية فقط في الشرح.';

  for (const key of allKeys) {
    for (const model of models) {
      const contents: any[] = [{ 
        role: 'user', 
        parts: [{ 
          text: `
أنت (Med-Guide)، الدليل الطبي الذكي لمنصة Med-Prep. خبير في المناهج الطبية والأكاديمية.

مهمتك الحالية:
${depthPrompt}
${langPrompt}

قواعد التنسيق الإجبارية (Wowed Aesthetics):
1. استخدم الجداول المقارنة (Tables) كلما أمكن.
2. استخدم الإيموجي (Emojis) المناسبة للسياق الطبي.
3. استخدم العناوين (Headings) والخط العريض (Bold) للكلمات المفتاحية.
4. اجعل الإجابة منظمة جداً وسهلة القراءة.
5. نوع في أحجام العناوين واستخدم القوائم.
6. إذا كان هناك كلمات مفتاحية (Keywords)، قم بتمييزها بوضوح باستخدام الخط العريض **Keyword**.
7. التزم التزاماً تاماً بأسلوب الشرح المطلوب (Depth) واللغة المطلوبة (Language) المذكورين أعلاه.

الموضوع المطلوب: 
${prompt}` 
        }] 
      }];

      if (fileData) {
        contents[0].parts.push({
          inline_data: {
            mime_type: fileData.mimeType,
            data: fileData.data.split(',')[1]
          }
        });
      }

      const res = await tryFetch(model, { contents }, key!);
      if (res && (res.status === 429 || res.status === 403)) break; // Skip to next key
      if (res && res.ok) {
        const data = await (res as Response).json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      }
    }
  }
  throw new Error("عذراً، واجه النظام مشكلة في الاتصال بمحرك الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.");
};

export const generateFlashcards = async (text: string, files?: { data: string, mimeType: string }[]) => {
  const allKeys = [
    import.meta.env.VITE_GEMINI_API_KEY,
    "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
    "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4",
    "AIzaSyAsuqzTQlgwhhhUAUhLy9Wd92xgR_kvVDA",
    "AIzaSyA05ajCmTzdHKYE1YAU0t6VQHj3DhUE-Zw",
    "AIzaSyAyZ-gdyKEgGgBwZx77EkPVpC1vDyjsyPc"
  ].filter(Boolean).sort(() => Math.random() - 0.5);
  
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-pro-preview",
    "gemini-flash-latest"
  ];

  for (const key of allKeys) {
    for (const model of models) {
      const parts: any[] = [{
        text: `You are a specialized medical educator. Convert the provided ${files ? 'files and instructions' : 'text'} into a JSON array of flashcards: [{ "front": "...", "back": "...", "tags": ["..."] }]. 
Focus on key medical concepts, definitions, and high-yield exam facts. 
ONLY return valid JSON. No conversational text. \n\n Additional Instructions/Text: ${text}`
      }];

      if (files && files.length > 0) {
        files.forEach(f => {
          parts.push({
            inline_data: {
              mime_type: f.mimeType,
              data: f.data.split(',')[1]
            }
          });
        });
      }

      const res = await tryFetch(model, { contents: [{ role: 'user', parts }] }, key!);
      if (res && (res.status === 429 || res.status === 403)) break; 
      if (res && res.ok) {
        const data = await (res as Response).json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    }
  }
  throw new Error("فشل توليد الفلاش كارد. يرجى التأكد من إعدادات الذكاء الاصطناعي.");
};

export const generateAIExam = async (prompt: string, files?: { data: string, mimeType: string }[]) => {
  const allKeys = [
    import.meta.env.VITE_GEMINI_API_KEY,
    "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
    "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4",
    "AIzaSyAsuqzTQlgwhhhUAUhLy9Wd92xgR_kvVDA",
    "AIzaSyA05ajCmTzdHKYE1YAU0t6VQHj3DhUE-Zw",
    "AIzaSyAyZ-gdyKEgGgBwZx77EkPVpC1vDyjsyPc"
  ].filter(Boolean).sort(() => Math.random() - 0.5);
  
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-pro-preview",
    "gemini-flash-latest"
  ];

  for (const key of allKeys) {
    for (const model of models) {
      const parts: any[] = [{
        text: `You are an exact text extractor for medical exams. Your task is to extract the MCQs from the provided files and instructions into a JSON array EXACTLY as they appear. 
DO NOT TRANSLATE. DO NOT REPHRASE. Keep the exact original language.

If the correct answer is marked or provided, ensure "correctAnswer" reflects its index (0-3). 
If an explanation is provided, extract it exactly. If not, leave it empty or generate a brief accurate one in the same language.

Format required:
[{ 
  "question": "Exact question text", 
  "options": ["Exact option A", "Exact option B", "Exact option C", "Exact option D"], 
  "correctAnswer": 0, 
  "explanation": "Exact explanation text" 
}]

Return ONLY valid JSON.
Instructions: ${prompt}`
      }];

      if (files && files.length > 0) {
        files.forEach(f => {
          parts.push({
            inline_data: {
              mime_type: f.mimeType,
              data: f.data.split(',')[1]
            }
          });
        });
      }

      const res = await tryFetch(model, { contents: [{ role: 'user', parts }] }, key!);
      if (res && (res.status === 429 || res.status === 403)) break; 
      if (res && res.ok) {
        const data = await (res as Response).json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    }
  }
  throw new Error("فشل توليد الامتحان. يرجى المحاولة لاحقاً.");
};
