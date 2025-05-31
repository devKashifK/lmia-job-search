// File: pages/api/summarize.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface RequestBody {
  prompt: string; // Now this is required, not optional
}

/**
 * POST /api/summarize
 * Expects a JSON body:
 * {
 *   prompt: string
 * }
 *
 * Returns:
 *   { summary: string }
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const body = (await request.json()) as RequestBody;
    const { prompt } = body;

    // Basic validation
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          error: "Request body must contain { prompt: string }",
        },
        { status: 400 }
      );
    }

    // Send prompt to Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No response from Gemini API");
    }

    // Trim off any ```json fences if Gemini wrapped its output in code fences
    let rawText = text.trim();
    const fenceMatch = rawText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenceMatch) {
      rawText = fenceMatch[1].trim();
    }

    // Return the final summary text
    return NextResponse.json({ summary: rawText });
  } catch (error) {
    console.error("Gen AI error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate summary via Gemini: " + message },
      { status: 500 }
    );
  }
}
