import { GoogleGenerativeAI } from "@google/generative-ai";

// سيتم جلب المفتاح من ملف الإعدادات لضمان الأمان
const GEN_AI_KEY = "AIzaSyDGSNgEm4bDP-xetTfwrkbxUF1IdBk-0fI";

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  // قائمة الموديلات التي سنحاول الاتصال بها بالترتيب
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🚀 [Med-Prep AI] Attempting connection via model: ${modelName}...`);
      
      const systemInstruction = "أنت (Med-Prep AI)، مساعد طبي ذكي خبير. اشرح بأسلوب أكاديمي سهل. أنت جزء من منصة Med-Prep.";
      
      const contents = [{
        role: "user",
        parts: [{ text: systemInstruction + "\n\n" + prompt }]
      }];

      if (fileData) {
        contents[0].parts.push({
          inline_data: {
            mime_type: fileData.mimeType,
            data: fileData.data.split(',')[1]
          }
        } as any);
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEN_AI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`✅ [Med-Prep AI] Connection successful using ${modelName}`);
          return text;
        }
      } else {
        const errJson = await response.json();
        console.warn(`⚠️ [Med-Prep AI] Model ${modelName} failed:`, errJson.error?.message);
        lastError = errJson.error?.message;
      }
    } catch (err) {
      console.error(`❌ [Med-Prep AI] Fatal error with ${modelName}:`, err);
      lastError = err;
    }
  }

  throw new Error(lastError || "عذراً، تعذر الوصول لمحرك الذكاء الاصطناعي حالياً.");
};
