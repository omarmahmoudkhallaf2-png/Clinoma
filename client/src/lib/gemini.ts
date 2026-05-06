import { GoogleGenerativeAI } from "@google/generative-ai";

// ملاحظة: تم وضع المفاتيح هنا بناءً على طلب المستخدم بعد تحويل المستودع إلى Private
// لكن الأفضل دائماً استخدام Cloudflare Environment Variables
const KEYS = [
  "AIzaSyB0GrBSsl3xbr_eDmSQtWk5v4VOS0p2gFQ",
  "AIzaSyALv9jWafoAN9AVh4psyYQUaPpPL-ig-J4"
];

// جلب المفتاح من البيئة (Cloudflare) أو استخدام المفاتيح الاحتياطية
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || KEYS[0];

const tryFetch = async (model: string, payload: any, key: string) => {
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response;
};

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  const models = ["gemini-1.5-flash-latest", "gemini-pro"];
  const allKeys = [import.meta.env.VITE_GEMINI_API_KEY, ...KEYS].filter(Boolean);

  for (const key of allKeys) {
    for (const model of models) {
      try {
        const contents: any[] = [{ parts: [{ text: "أنت مساعد طبي ذكي من Med-Prep. اشرح الآتي: \n\n" + prompt }] }];
        if (fileData) {
          contents[0].parts.push({
            inline_data: {
              mime_type: fileData.mimeType,
              data: fileData.data.split(',')[1]
            }
          });
        }

        const res = await tryFetch(model, { contents }, key!);
        if (res.ok) {
          const data = await res.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        }
      } catch (err) {
        console.error(`Failed with key ${key?.substring(0, 5)} and model ${model}`);
      }
    }
  }
  throw new Error("عذراً، جميع محاولات الاتصال بالذكاء الاصطناعي فشلت. يرجى التأكد من الـ API Keys.");
};

export const generateFlashcards = async (text: string) => {
  const models = ["gemini-1.5-flash-latest", "gemini-pro"];
  const allKeys = [import.meta.env.VITE_GEMINI_API_KEY, ...KEYS].filter(Boolean);

  for (const key of allKeys) {
    for (const model of models) {
      try {
        const payload = {
          contents: [{
            parts: [{
              text: `Convert this medical text into a JSON array of flashcards: [{ "front": "...", "back": "...", "tags": ["..."] }]. ONLY return JSON. \n\n Text: ${text}`
            }]
          }]
        };

        const res = await tryFetch(model, payload, key!);
        if (res.ok) {
          const data = await res.json();
          const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.error(`Flashcard generation failed with key ${key?.substring(0, 5)}`);
      }
    }
  }
  throw new Error("فشل في توليد الفلاش كارد. يرجى المحاولة لاحقاً.");
};
