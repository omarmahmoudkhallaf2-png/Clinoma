import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateFlashcards = async (text: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a specialized medical educator. Your task is to convert the following medical text into a set of high-quality flashcards for medical students.
      
      Requirements:
      1. Each flashcard must have a 'front' (question/term) and a 'back' (answer/explanation).
      2. Keep questions concise and focused on a single concept.
      3. Add relevant medical 'tags' for each card.
      4. Output the result ONLY as a JSON array of objects.
      
      Text to convert:
      ${text}
      
      Format example:
      [
        { "front": "What is the primary symptom of...", "back": "...", "tags": ["subject", "symptom"] }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text();
    
    // Clean JSON output if AI includes markdown code blocks
    const jsonString = textOutput.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini AI Generation Error:", error);
    throw new Error("Failed to generate flashcards using AI.");
  }
};

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let parts: any[] = [{ text: prompt }];
    
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
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to get AI response.");
  }
};

