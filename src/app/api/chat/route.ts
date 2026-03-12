import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
// Provide fallback environment variables if necessary
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json(
            { error: 'Gemini API key not configured in environment variables.' },
            { status: 500 }
        );
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const { messages, contextData } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required.' },
                { status: 400 }
            );
        }

        // Prepare the system instruction with the visible job context
        let systemInstruction = `You are a helpful and concise AI assistant for JobMaze, a Canadian LMIA and Trending Job search platform. `;

        if (contextData && contextData.length > 0) {
            systemInstruction += `\n\nThe user is currently viewing the following list of ${contextData.length} jobs on their screen. You MUST answer their questions based primarily on this data set when applicable:\n\n`;

            const contextString = contextData.map((job: any, index: number) => {
                const title = job.job_title || job.jobTitle || 'Unknown Title';
                const employer = job.employer || job.operating_name || 'Unknown Employer';
                const location = [job.city, job.state || job.territory].filter(Boolean).join(', ') || 'Unknown Location';
                const noc = job.noc_code ? ` (NOC: ${job.noc_code})` : '';
                return `[${index + 1}] ${title} at ${employer} in ${location}${noc}`;
            }).join('\n');

            systemInstruction += contextString;
        } else {
            systemInstruction += `\n\nThe user is currently viewing a search page, but no specific job listings were found or provided in the current filter context.`;
        }

        // Initialize the model with system instructions
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
        });

        // Format previous messages for Gemini history
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));

        // Start chat with history
        const chat = model.startChat({ history });

        // Send the latest user message
        const lastUserMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastUserMessage);
        const responseText = result.response.text();

        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred during AI processing.' },
            { status: 500 }
        );
    }
}
