import { GoogleGenerativeAI } from "@google/generative-ai";

// سيتم جلب المفتاح من ملف الإعدادات لضمان الأمان
const GEN_AI_KEY = "AIzaSyDGSNgEm4bDP-xetTfwrkbxUF1IdBk-0fI";

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  // 1. محاولة جلب قائمة الموديلات المتاحة أولاً لمعرفة "العنوان الصحيح"
  try {
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GEN_AI_KEY}`);
    const listData = await listResponse.json();
    console.log("🔍 [Med-Prep AI] Available Models for your Key:", listData.models?.map((m: any) => m.name));
  } catch (e) {
    console.warn("Could not list models", e);
  }

  const models = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro"];
  const versions = ["v1", "v1beta"];
  
  let lastError = null;

  for (const modelName of models) {
    for (const apiVersion of versions) {
      try {
        console.log(`🚀 [Med-Prep AI] Attempting: ${apiVersion} | Model: ${modelName}`);
        
        const systemInstruction = "أنت (Med-Prep AI)، مساعد طبي ذكي. اشرح بأسلوب أكاديمي سهل.";
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

        const response = await fetch(`https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEN_AI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log(`✅ [Med-Prep AI] FOUND IT! Working with: ${apiVersion}/${modelName}`);
            return text;
          }
        } else {
          const errData = await response.json();
          lastError = errData.error?.message;
          console.warn(`❌ ${apiVersion}/${modelName} failed:`, lastError);
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }
  }

  throw new Error("عذراً، لم نجد موديل متاح لحسابك حالياً. يرجى مراجعة الـ Console.");
};
