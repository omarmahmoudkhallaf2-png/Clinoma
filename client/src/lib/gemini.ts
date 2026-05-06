import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  try {
    if (!API_KEY) throw new Error("API Key is missing from Cloudflare.");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const chat = model.startChat({
      history: [],
      generationConfig: { maxOutputTokens: 2000 },
    });

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
    return response.text();
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    throw new Error(error.message || "Failed to get AI response.");
  }
};

export const generateFlashcards = async (text: string) => {
  try {
    if (!API_KEY) throw new Error("API Key is missing from Cloudflare.");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      أنت مدرس طبي متخصص. حول النص التالي إلى كروت فلاش كارد (Flashcards).
      يجب أن يكون الرد بصيغة JSON فقط مصفوفة من الكائنات.
      كل كائن يحتوي على: front (السؤال)، back (الإجابة)، tags (وسوم طبية).
      
      النص:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text();
    const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI returned malformed data.");
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error("AI Flashcards Error:", error);
    throw new Error(error.message || "Failed to generate flashcards.");
  }
};
