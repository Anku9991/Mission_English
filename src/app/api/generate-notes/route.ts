import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    // Initialize the Google Generative AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We use gemini-1.5-flash as it is the fastest and recommended model for standard text generation
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert educator. Create comprehensive, well-structured study notes on the following topic: "${topic}". 
Use clear headings, bullet points, and easy-to-understand language. Make it suitable for students preparing for exams. Do not use markdown that cannot be easily read as plain text, just structure it cleanly.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    if (!generatedText) {
      throw new Error("No text generated from Gemini");
    }

    return NextResponse.json({ text: generatedText });

  } catch (error: any) {
    console.error("Error generating notes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to communicate with Google AI API" },
      { status: 500 }
    );
  }
}
