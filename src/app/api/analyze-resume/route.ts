import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import db from "@/db";

// Initialize Gemini with key validation
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
    try {
        console.log("DEBUG: API Key present:", !!apiKey, "Length:", apiKey.length);

        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing or empty");
            return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
        }

        const { resumeUrl } = await req.json();

        if (!resumeUrl) {
            return NextResponse.json(
                { error: "Resume URL is required" },
                { status: 400 }
            );
        }

        // Download file from Supabase Storage
        const response = await fetch(resumeUrl);
        if (!response.ok) {
            throw new Error("Failed to download resume file");
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileType = response.headers.get("content-type");

        // Prepare content for Gemini
        let parts: any[] = [];
        let promptText = "";

        // Fetch valid job titles from DB to guide the AI
        let existingJobTitlesString = "";
        let allTitles: string[] = [];

        try {
            const [lmiaResult, trendingResult] = await Promise.all([
                db.rpc('get_distinct_values_with_count', { table_name: 'lmia_records', column_name: 'JobTitle' }),
                db.rpc('get_distinct_values_with_count', { table_name: 'trending_job', column_name: 'job_title' })
            ]);

            const lmiaTitles = (lmiaResult.data || []).map((r: any) => r.name);
            const trendingTitles = (trendingResult.data || []).map((r: any) => r.name);

            // Unique set of all titles combined (filtered for empty/short strings)
            allTitles = [...new Set([...lmiaTitles, ...trendingTitles])]
                .filter(t => t && t.length > 2)
                .sort();

            existingJobTitlesString = JSON.stringify(allTitles);
        } catch (dbError) {
            console.error("Error fetching job titles for context:", dbError);
            // Non-fatal, just continue with empty context
        }

        const basePrompt = `
      You are an expert resume parser. Extract the following information from the resume.
      
      CONTEXT - VALID JOB TITLES:
      The following is a list of valid job titles from our database. 
      CRITICAL: When inferring 'recommended_job_titles' or 'position', YOU MUST SELECT FROM THIS LIST.
      Do not invent new titles. If a perfect match isn't found, pick the closest semantic match from the valid list.
      Valid Titles List: ${existingJobTitlesString}
      
      Return ONLY a valid JSON object with the following structure. Do not include markdown formatting (like \`\`\`json).
      
      Structure:
      {
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "address": "Full Home Address (Street, City, Province, Postal Code)",
        "location": "City, Country (e.g. Toronto, Canada)",
        "website": "Personal Website or Portfolio URL",
        "linkedin": "LinkedIn Profile URL",
        "dob": "Date of Birth (YYYY-MM-DD) if found, otherwise empty string",
        "position": "Current or most recent Job Title string",
        "company": "Current or most recent Company Name",
        "bio": "A professional summary (write one if not present, max 400 characters, focusing on key skills and experience)",
        "skills": "Comma separated list of top 10 technical and soft skills found in the resume",
        "education": "Array of strings, each representing a degree/certificate and university (e.g. 'BS Computer Science, University of Toronto, 2018')",
        "work_experience": "Array of strings, each representing a job role (e.g. 'Frontend Dev at Google (2019-2021): Built search UI')",
        "experience": "Total years of experience (number, e.g. 5)",
        "recommended_job_titles": "Array of 3-5 job titles strictly selected from the 'Valid Titles List'."
      }
    `;

        if (fileType?.includes("pdf") || resumeUrl.endsWith(".pdf")) {
            // Use Gemini's native PDF support
            console.log("DEBUG: Processing as PDF with native Gemini support");
            parts = [
                { text: basePrompt },
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: buffer.toString("base64")
                    }
                }
            ];
        } else if (
            fileType?.includes("word") ||
            fileType?.includes("officedocument") ||
            resumeUrl.endsWith(".docx") ||
            resumeUrl.endsWith(".doc")
        ) {
            // Use mammoth for Word docs
            console.log("DEBUG: Processing as Word Document");
            const result = await mammoth.extractRawText({ buffer });
            const text = result.value;

            if (!text || text.trim().length === 0) {
                return NextResponse.json(
                    { error: "Could not extract text from the Word document." },
                    { status: 400 }
                );
            }

            parts = [
                { text: basePrompt + "\n\nResume Text:\n" + text.substring(0, 30000) }
            ];
        } else {
            return NextResponse.json(
                { error: "Unsupported file type. Please upload a PDF or DOCX." },
                { status: 400 }
            );
        }

        // Call Gemini to analyze
        const modelName = "gemini-2.5-flash";
        console.log("DEBUG: Using model:", modelName);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(parts);
        const responseText = result.response.text();

        console.log("DEBUG: Raw Gemini Response:", responseText.substring(0, 200) + "...");

        // Clean up response
        const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let profileData;
        try {
            profileData = JSON.parse(cleanedJson);

            // Validate recommended job titles against DB list
            if (profileData.recommended_job_titles && Array.isArray(profileData.recommended_job_titles) && allTitles.length > 0) {
                const validatedTitles = profileData.recommended_job_titles
                    .map((title: string) => {
                        // 1. Try exact match (case insensitive)
                        const exactMatch = allTitles.find(t => t.toLowerCase() === title.toLowerCase());
                        if (exactMatch) return exactMatch;

                        // 2. Try partial match (if the DB title contains the AI title or vice versa)
                        // Bias towards shorter DB titles if they are contained in AI title (e.g. AI: "Senior Software Engineer", DB: "Software Engineer")
                        // Or closest string.
                        // Simple robust fallback: Check if any valid title contains the AI title keyword
                        const partialMatch = allTitles.find(t => t.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(t.toLowerCase()));
                        return partialMatch || null;
                    })
                    .filter((t: string | null) => t !== null); // Remove nulls

                // Dedupe
                profileData.recommended_job_titles = [...new Set(validatedTitles)];

                console.log("DEBUG: Validated Job Titles:", profileData.recommended_job_titles);
            }

            console.log("DEBUG: Analysis successful. Profile Data:", JSON.stringify(profileData, null, 2));
        } catch (e) {
            console.error("Failed to parse Gemini response:", responseText);
            return NextResponse.json({ error: "Failed to parse analysis results" }, { status: 500 });
        }

        return NextResponse.json({ data: profileData });

    } catch (error: any) {
        console.error("Resume analysis error:", error);

        // Detailed error logging
        if (error.response) {
            console.error("Gemini API Error Response:", JSON.stringify(error.response, null, 2));
        }

        // Special handling for 404/403 errors from Google
        if (error.message?.includes("404") || error.message?.includes("Not Found")) {
            return NextResponse.json(
                { error: "AI Model not found or API Key invalid. Please enable 'Generative Language API' in Google Cloud Console." },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

