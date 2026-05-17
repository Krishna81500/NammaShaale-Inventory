import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateInventorySummary(assets: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    return "AI Summary is not available (API Key missing).";
  }

  const prompt = `
    You are an AI School Inventory Auditor. 
    Analyze the following inventory data and provide a professional, encouraging, 150-word summary report for the school administration (SDMC).
    Highlight any critical items needing repair or lost items, and suggest positive reinforcement for "Asset Care".
    
    Data:
    ${JSON.stringify(assets.map(a => ({ 
      name: a.name, 
      category: a.category, 
      condition: a.condition,
      repairHint: a.repairHint,
      cost: a.estimatedRepairCost
    })))}
    
    Format the response as a clear, scannable report with a title and bullet points if needed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate AI summary.";
  }
}
