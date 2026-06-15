
function getGeminiKeys(): string[] {
  const localKeys = localStorage.getItem("admin_gemini_keys");
  if (localKeys) {
    return localKeys.split(',').map((k: string) => k.trim()).filter(Boolean);
  }
  const envKeys = import.meta.env.VITE_GEMINI_KEYS;
  if (envKeys) {
    return envKeys.split(',').map((k: string) => k.trim()).filter(Boolean);
  }
  return [
    "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
    "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4",
    "AIzaSyAsuqzTQlgwhhhUAUhLy9Wd92xgR_kvVDA",
    "AIzaSyA05ajCmTzdHKYE1YAU0t6VQHj3DhUE-Zw",
    "AIzaSyAyZ-gdyKEgGgBwZx77EkPVpC1vDyjsyPc"
  ];
}

const MODELS = [
  "gemini-3.1-flash-lite", 
  "gemini-3-flash",      
  "gemini-3.1-pro"       
];

const tryGeminiFetch = async (model: string, payload: any, key: string) => {
  const versions = ['v1beta', 'v1'];
  for (const version of versions) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); 

    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      if (response.status === 429 || response.status === 403) return { ok: false, status: response.status };
      if (response.ok) return response;
      continue;
    } catch (err) {
      clearTimeout(timeoutId);
      continue;
    }
  }
  return null;
};

export const extractTopics = async (fileData: { data: string, mimeType: string }) => {
  const allKeys = [...getGeminiKeys()].sort(() => Math.random() - 0.5);

  for (const key of allKeys) {
    for (const model of MODELS) {
      const payload = {
        contents: [{ 
          role: 'user', 
          parts: [
            { text: "Extract the main scientific/medical topics from this file. Return them as a simple numbered list. Only the list, no other text." },
            { inline_data: { mime_type: fileData.mimeType, data: fileData.data.split(',')[1] } }
          ] 
        }]
      };

      const res = await tryGeminiFetch(model, payload, key);
      if (res && 'ok' in res && res.ok && 'json' in res) {
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
  const depthPrompt = options?.depth === 'detailed' 
    ? 'اشرح كل شيء بالتفصيل الممل، لا تترك أي نقطة.' 
    : options?.depth === 'medium' 
    ? 'اشرح غالبية الموضوع مع التركيز على النقاط المهمة.' 
    : 'اشرح فقط المعلومات الجوهرية والمهمة باختصار.';

  const langPrompt = options?.language === 'ar-en'
    ? 'استخدم اللغة العربية مع ذكر المصطلحات العلمية بالإنجليزية بين قوسين.'
    : 'استخدم اللغة الإنجليزية فقط في الشرح.';

  const systemPrompt = `
أنت (Med-Guide)، الدليل الطبي الذكي لمنصة Med-Prep. خبير عالمي في المناهج الطبية.
قواعد العمل:
1. التزم التزاماً حرفياً بالفلاتر المختارة (العمق: ${depthPrompt} | اللغة: ${langPrompt}).
2. استخدم الجداول المقارنة (Tables) والإيموجي الطبية.
3. التزم بمحتوى الملف المرفوع إذا وجد.`;

  const allKeys = [...getGeminiKeys()].sort(() => Math.random() - 0.5);

  for (const key of allKeys) {
    for (const model of MODELS) {
      const payload = {
        contents: [{
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nQuestion: ${prompt}` },
            ...(fileData ? [{ inline_data: { mime_type: fileData.mimeType, data: fileData.data.split(',')[1] } }] : [])
          ]
        }]
      };

      const res = await tryGeminiFetch(model, payload, key);
      if (res && 'ok' in res && res.ok && 'json' in res) {
        const data = await (res as Response).json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    }
  }
  throw new Error("عذراً، جميع المحركات حالياً تحت ضغط كبير.");
};

export const generateFlashcards = async (text: string, files?: { data: string, mimeType: string }[]) => {
  const allKeys = [...getGeminiKeys()].sort(() => Math.random() - 0.5);

  const systemPrompt = `You are a professional medical educator. 
  CRITICAL RULE: Generate flashcards ONLY from the provided content. 
  If the user provides specific instructions below, follow them strictly.
  Return a JSON array: [{ "front": "...", "back": "...", "tags": ["subject"] }].
  Return ONLY the JSON array.`;

  for (const key of allKeys) {
    for (const model of MODELS) {
      const payload = {
        contents: [{
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUSER SPECIFIC INSTRUCTIONS: ${text}\n\nAnalyze the attached document and generate cards based on these rules.` },
            ...(files || []).map(f => ({
              inline_data: { mime_type: f.mimeType, data: f.data.split(',')[1] }
            }))
          ]
        }]
      };

      const res = await tryGeminiFetch(model, payload, key);
      if (res && 'ok' in res && res.ok && 'json' in res) {
        const data = await (res as Response).json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    }
  }
  return []; 
};

export const generateAIExam = async (prompt: string, files?: { data: string, mimeType: string }[]) => {
  const allKeys = [...getGeminiKeys()].sort(() => Math.random() - 0.5);

  const systemPrompt = `You are an expert medical examiner. 
  STRICT RULE: Generate MCQs ONLY from the provided content.
  Return a JSON array: [{ "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "..." }].
  Return ONLY the JSON array.`;

  for (const key of allKeys) {
    for (const model of MODELS) {
      const payload = {
        contents: [{
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nTask: ${prompt}` },
            ...(files || []).map(f => ({
              inline_data: { mime_type: f.mimeType, data: f.data.split(',')[1] }
            }))
          ]
        }]
      };

      const res = await tryGeminiFetch(model, payload, key);
      if (res && 'ok' in res && res.ok && 'json' in res) {
        const data = await (res as Response).json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    }
  }
  return [];
};
