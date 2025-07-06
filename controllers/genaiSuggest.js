import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Set up Google Gemini API instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const suggestBio = async (req, res) => {
  try {
    const { prompt } = req.body;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate a professional bio based strictly on the following prompt: "${prompt}". 
  The output must be a single paragraph with no headings, greetings, or conversational elements. 
  Limit the response to exactly 100 words or fewer. Respond only with the paragraph.`,
    });

    const suggestion =
      geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.status(200).json({ suggestion });
  } catch (error) {
    console.error("GenAI API error:", error.message);
    res.status(500).json({ error: "Failed to get suggestion" });
  }
};
