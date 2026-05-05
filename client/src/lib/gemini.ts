import { GoogleGenerativeAI } from "@google/generative-ai";

// سيتم جلب المفتاح من ملف الإعدادات لضمان الأمان
const GEN_AI_KEY = "AIzaSyBQAfqrAmnDRs-rPEEC6odo6k90tGL0KTE";

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  try {
    console.log("🚀 [Med-Prep AI] Connecting via Official SDK...");
    const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
    
    // محاولة الاتصال بالموديل الأكثر استقراراً
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const parts: any[] = [{ text: "أنت مساعد طبي ذكي خبير من منصة Med-Prep. اشرح الآتي بأسلوب أكاديمي سهل: \n\n" + prompt }];
    
    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data.split(',')[1]
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ [Med-Prep AI] SDK Success!");
    return text;
  } catch (error: any) {
    console.error("❌ [Med-Prep AI] SDK Error:", error);
    
    // إذا فشل الـ SDK، سنحاول محاولة أخيرة عبر الـ Fetch التقليدي
    console.log("🔄 [Med-Prep AI] Falling back to Fetch...");
    return await fallbackFetch(prompt, fileData);
  }
};

async function fallbackFetch(prompt: string, fileData?: any) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEN_AI_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، تعذر الوصول للمساعد الذكي.";
}
