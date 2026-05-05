import { GoogleGenerativeAI } from "@google/generative-ai";

// سيتم جلب المفتاح من ملف الإعدادات لضمان الأمان
const GEN_AI_KEY = "AIzaSyDGSNgEm4bDP-xetTfwrkbxUF1IdBk-0fI";

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  try {
    console.log("CRITICAL DEBUG: Sending request to Gemini...");
    const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
    
    // استخدام النسخة الأحدث والمستقرة من الموديل
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
    });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });

    // إضافة التعليمات البرمجية كجزء من البرومبت لضمان التوافق
    const systemPrefix = "أنت (Med-Prep AI)، مساعد طبي ذكي. اشرح بأسلوب أكاديمي سهل ولا تذكر أنك Gemini. \n\n";
    const fullPrompt = systemPrefix + prompt;

    const parts: any[] = [fullPrompt];
    if (fileData) {
      parts.push({
        inlineData: {
          data: fileData.data.split(',')[1],
          mimeType: fileData.mimeType
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();
    console.log("CRITICAL DEBUG: Gemini responded successfully.");
    return text;
  } catch (error: any) {
    console.error("CRITICAL ERROR (Gemini):", error);
    // طباعة تفاصيل الخطأ للمساعدة في الحل
    if (error.message?.includes('API_KEY_INVALID')) return "خطأ: مفتاح الـ API غير صحيح. يرجى التأكد منه.";
    if (error.message?.includes('SAFETY')) return "عذراً، المحتوى المطلوب مخالف لسياسات الأمان الخاصة بالذكاء الاصطناعي.";
    
    throw new Error("عذراً، واجه المساعد الذكي مشكلة في معالجة طلبك.");
  }
};
