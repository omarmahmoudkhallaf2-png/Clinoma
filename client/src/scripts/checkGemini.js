
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCJGwzTVZupdnoqUJvBoTahVWk6xT5NGck";
const genAI = new GoogleGenerativeAI(API_KEY);

async function checkModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    const response = await result.response;
    console.log("Success with gemini-1.5-flash:", response.text().substring(0, 20));
  } catch (err) {
    console.error("Failed with gemini-1.5-flash:", err.message);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("test");
      const response = await result.response;
      console.log("Success with gemini-pro:", response.text().substring(0, 20));
    } catch (err2) {
      console.error("Failed with gemini-pro:", err2.message);
    }
  }
}

checkModels();
