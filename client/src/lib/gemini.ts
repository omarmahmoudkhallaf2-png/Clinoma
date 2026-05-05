import { GoogleGenerativeAI } from "@google/generative-ai";

// سيتم جلب المفتاح من ملف الإعدادات لضمان الأمان
const GEN_AI_KEY = "AIzaSyDGSNgEm4bDP-xetTfwrkbxUF1IdBk-0fI";

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  try {
    const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "أنت (Med-Prep AI)، مساعد طبي ذكي وخبير في شرح المحاضرات الطبية. مهمتك هي تبسيط المعلومات المعقدة وشرح الملفات المرفوعة بأسلوب أكاديمي سهل. لا تذكر أبداً أنك نموذج لشركة جوجل. أنت جزء من منصة Med-Prep التعليمية."
    });

    const parts: any[] = [prompt];
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
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("عذراً، واجه المساعد الذكي مشكلة في معالجة طلبك.");
  }
};
