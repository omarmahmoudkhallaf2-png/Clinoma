
const tryFetch = async (model: string, payload: any, key: string) => {
  // Try stable v1 first, then fallback to v1beta
  const endpoints = ['v1', 'v1beta'];
  
  for (const version of endpoints) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) return response;
      
      const errData = await response.json();
      // If model not found (404), try next model/version
      if (response.status === 404) continue;
      
      // If other error (quota, auth), return the response to handle it
      return response;
    } catch (err) {
      continue;
    }
  }
  return null;
};

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  const KEYS = [
    "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
    "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4"
  ];
  
  // 2026 Stable & Preview Models
  const models = [
    "gemini-3.1-pro-preview",
    "gemini-3-pro-preview",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash"
  ];

  const allKeys = [import.meta.env.VITE_GEMINI_API_KEY, ...KEYS].filter(Boolean);

  for (const key of allKeys) {
    for (const model of models) {
      const contents: any[] = [{ 
        role: 'user', 
        parts: [{ 
          text: `
أنت (Med-Prep Expert AI)، أستاذ طبي وخبير في المناهج الأكاديمية. 
مهمتك: الشرح باستفاضة، تحري الدقة القصوى، ومراجعة المعلومات قبل عرضها. 

قواعدك:
1. ابدأ دائماً بملخص سريع للنقاط الأساسية.
2. اشرح المفاهيم المعقدة بأمثلة طبية واقعية.
3. نسق الإجابة باستخدام Markdown (عناوين، نقاط، جداول، خط عريض).
4. إذا سألك المستخدم عن معلومة طبية، ابحث في "قاعدة بياناتك الأكاديمية" وقدم أدق التفاصيل.
5. لا تذكر أبداً أنك نموذج ذكاء اصطناعي، أنت جزء مدمج في منصة Med-Prep.

الموضوع المطلوب شرحه: 
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
      if (res && res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      }
    }
  }
  throw new Error("عذراً، واجه النظام مشكلة في الاتصال بمحرك الذكاء الاصطناعي (2026 Update). يرجى التأكد من الـ API Key.");
};

export const generateFlashcards = async (text: string, fileData?: { data: string, mimeType: string }) => {
  const KEYS = [
    "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
    "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4"
  ];
  
  const models = [
    "gemini-3.1-pro-preview",
    "gemini-3-pro-preview",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash"
  ];

  const allKeys = [import.meta.env.VITE_GEMINI_API_KEY, ...KEYS].filter(Boolean);

  for (const key of allKeys) {
    for (const model of models) {
      const contents: any[] = [{
        role: 'user',
        parts: [{
          text: `You are a specialized medical educator. Convert this ${fileData ? 'file content' : 'text'} into a JSON array of flashcards: [{ "front": "...", "back": "...", "tags": ["..."] }]. 
Focus on key medical concepts, definitions, and high-yield exam facts. 
ONLY return valid JSON. No conversational text. \n\n Input: ${text}`
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
      if (res && res.ok) {
        const data = await res.json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    }
  }
  throw new Error("فشل توليد الفلاش كارد. يرجى التأكد من إعدادات الذكاء الاصطناعي.");
};

export const generateAIExam = async (content: string, fileData?: { data: string, mimeType: string }) => {
  const KEYS = [
    "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
    "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4"
  ];
  
  const models = [
    "gemini-3.1-pro-preview",
    "gemini-3-pro-preview",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash"
  ];
  const allKeys = [import.meta.env.VITE_GEMINI_API_KEY, ...KEYS].filter(Boolean);

  for (const key of allKeys) {
    for (const model of models) {
      const contents: any[] = [{
        role: 'user',
        parts: [{
          text: `You are an exact text extractor for medical exams. Your task is to extract the MCQs from the provided file into a JSON array EXACTLY as they appear in the original file. 
DO NOT TRANSLATE. DO NOT REPHRASE. Keep the exact original language (usually English).

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
Content context: ${content}`
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
      if (res && res.ok) {
        const data = await res.json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    }
  }
  throw new Error("فشل توليد الامتحان. يرجى المحاولة لاحقاً.");
};
