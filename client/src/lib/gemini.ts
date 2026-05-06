
const tryGenerate = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response;
};

export const generateFlashcards = async (text: string) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
  if (!API_KEY) throw new Error("Gemini API Key is missing.");

  // High-compatibility model list for 2026
  const models = [
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-pro"
  ];
  
  let lastError = "";

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`;
      const body = {
        contents: [{
          parts: [{
            text: `Convert this medical text into a JSON array of flashcards: [{ "front": "...", "back": "...", "tags": ["..."] }]. ONLY return JSON. \n\n Text: ${text}`
          }]
        }]
      };

      const response = await tryGenerate(url, body);
      if (response.ok) {
        const data = await response.json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } else {
        const errData = await response.json();
        lastError = errData.error?.message || "Unknown error";
      }
    } catch (e: any) {
      lastError = e.message;
    }
  }

  throw new Error(`AI Error: ${lastError}`);
};

export const generateAIResponse = async (prompt: string, fileData?: { data: string, mimeType: string }) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
  if (!API_KEY) throw new Error("Gemini API Key is missing.");

  const models = [
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-pro"
  ];
  
  let lastError = "";

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`;
      const contents: any[] = [{ parts: [{ text: prompt }] }];
      if (fileData) {
        contents[0].parts.push({
          inline_data: {
            mime_type: fileData.mimeType,
            data: fileData.data.split(',')[1]
          }
        });
      }

      const response = await tryGenerate(url, { contents });
      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      } else {
        const errData = await response.json();
        lastError = errData.error?.message || "Unknown error";
      }
    } catch (e: any) {
      lastError = e.message;
    }
  }

  throw new Error(`AI Assistant Error: ${lastError}`);
};
