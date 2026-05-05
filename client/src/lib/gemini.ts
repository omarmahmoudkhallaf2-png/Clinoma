import { GoogleGenerativeAI } from "@google/generative-ai";

// سيتم جلب المفتاح من ملف الإعدادات لضمان الأمان
const GEN_AI_KEY = "AIzaSyDGSNgEm4bDP-xetTfwrkbxUF1IdBk-0fI";

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  try {
    console.log("CRITICAL DEBUG: Attempting Direct API Call to Gemini v1...");
    
    // التعليمات البرمجية كجزء من الطلب
    const systemInstruction = "أنت (Med-Prep AI)، مساعد طبي ذكي. اشرح بأسلوب أكاديمي سهل ولا تذكر أنك Gemini. أنت جزء من منصة Med-Prep.";
    
    const contents = [
      {
        role: "user",
        parts: [
          { text: systemInstruction + "\n\n" + prompt }
        ]
      }
    ];

    if (fileData) {
      contents[0].parts.push({
        inline_data: {
          mime_type: fileData.mimeType,
          data: fileData.data.split(',')[1]
        }
      } as any);
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEN_AI_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error Data:", errorData);
      throw new Error(errorData.error?.message || 'API Request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("لم يتم استلام رد من المساعد الذكي.");
    
    console.log("CRITICAL DEBUG: Direct API Call Success.");
    return text;
  } catch (error: any) {
    console.error("CRITICAL ERROR (Direct API):", error);
    if (error.message?.includes('API key not valid')) return "خطأ: مفتاح الـ API غير مفعل أو غير صحيح.";
    throw new Error("عذراً، واجه المساعد الذكي مشكلة في معالجة طلبك.");
  }
};
