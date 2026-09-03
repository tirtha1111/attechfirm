import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Invalid messages array provided." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    // Format conversation history for the Google GenAI SDK contents payload
    // Gemini API contents format: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are 'A&T Tech Advisor', an elite AI technical consultant representing A&T Tech Firm, built by the visionaries Tirtharaj and Aditya. Your goal is to provide expert technical consultations on web development, SaaS architectures, mobile applications, database designs, automated workflows, and our custom agency pricing packages. Keep responses highly polished, technical yet accessible, professional, and visually formatted with clean Markdown. Bold key technical terms to create a great visual rhythm. Be enthusiastic about how A&T Tech Firm can turn any software idea into production-ready reality.",
        temperature: 0.7,
      },
    });

    return NextResponse.json({
      success: true,
      reply: response.text || "I apologize, but I could not formulate a technical response at this time. How else can I assist with your software goals?",
    });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate chatbot response" },
      { status: 500 }
    );
  }
}
