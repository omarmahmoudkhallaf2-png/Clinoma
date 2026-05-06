
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
  
  // 2026 Stable Models
  const models = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro",
    "gemini-3-flash-preview"
  ];

  const allKeys = [import.meta.env.VITE_GEMINI_API_KEY, ...KEYS].filter(Boolean);

  for (const key of allKeys) {
    for (const model of models) {
      const contents: any[] = [{ parts: [{ text: "أنت مساعد طبي ذكي من Med-Prep. اشرح الآتي بأسلوب أكاديمي: \n\n" + prompt }] }];
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

export const generateFlashcards = async (text: string) => {
  const KEYS = [
    "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
    "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4"
  ];
  
  const models = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro"
  ];

  const allKeys = [import.meta.env.VITE_GEMINI_API_KEY, ...KEYS].filter(Boolean);

  for (const key of allKeys) {
    for (const model of models) {
      const payload = {
        contents: [{
          parts: [{
            text: `You are a specialized medical educator. Convert this text into a JSON array of flashcards: [{ "front": "...", "back": "...", "tags": ["..."] }]. ONLY return JSON. \n\n Text: ${text}`
          }]
        }]
      };

      const res = await tryFetch(model, payload, key!);
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
