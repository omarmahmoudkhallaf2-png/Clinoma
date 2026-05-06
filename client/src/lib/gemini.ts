
export const generateFlashcards = async (text: string) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
  
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to Cloudflare.");
  }

  try {
    // Using direct fetch to avoid SDK v1beta issues
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
              You are a specialized medical educator. Convert this text into a JSON array of flashcards.
              Format: [{ "front": "...", "back": "...", "tags": ["..."] }]
              ONLY return the JSON array.
              
              Text: ${text}
            `
          }]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "API Request failed");
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI returned malformed data.");

    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Failed to generate flashcards.");
  }
};

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
  
  try {
    const contents: any[] = [{
      parts: [{ text: prompt }]
    }];

    if (fileData) {
      contents[0].parts.push({
        inline_data: {
          mime_type: fileData.mimeType,
          data: fileData.data.split(',')[1]
        }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "API Request failed");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    throw new Error(error.message || "Failed to get AI response.");
  }
};
