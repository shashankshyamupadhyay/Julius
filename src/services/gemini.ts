import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// In a real production app, this should be handled securely.
// For this MVP, we use the injected process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGeminiResponse = async (prompt: string, context?: string) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  try {
    const modelId = "gemini-2.0-flash-exp";
    
    // Construct the full prompt with RAG context if provided
    let finalPrompt = prompt;
    if (context) {
      finalPrompt = `
You are Julius, an academic research assistant. Use the following context from a research paper to answer the user's question.
If the answer is not in the context, say you don't know based on the document.

CONTEXT:
${context}

USER QUESTION:
${prompt}
      `;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: finalPrompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};