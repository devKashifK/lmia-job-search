import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";

const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Isolated Agency-specific resume parsing function.
 */
export async function parseAgencyResume(
    buffer: Buffer, 
    mimeType: string, 
    fileName: string,
    dbContext: { jobTitles: string[], nocCodes: string[], employers: string[] } = { jobTitles: [], nocCodes: [], employers: [] },
    target_canadian_province?: string
) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const modelName = "gemini-2.5-flash"; // Project standard model
    const model = genAI.getGenerativeModel({ model: modelName });

    let resumeText = "";
    let isPdf = mimeType.includes("pdf") || fileName.endsWith(".pdf");

    // Standard extraction logic
    if (!isPdf) {
        const { value } = await mammoth.extractRawText({ buffer });
        resumeText = value;
        if (!resumeText || resumeText.length < 50) {
            throw new Error("Could not extract sufficient text from document");
        }
    }

    const basePrompt = `
      You are an expert recruitment agency assistant. Your task is to extract high-quality structured data from potential candidates' resumes.
      
      CONTEXT - VALID ENTITIES FROM OUR DATABASE:
      Job Titles: ${JSON.stringify(dbContext.jobTitles.slice(0, 100))}
      NOC Codes: ${JSON.stringify(dbContext.nocCodes.slice(0, 100))}
      Top Employers: ${JSON.stringify(dbContext.employers.slice(0, 100))}

      Return ONLY a valid JSON object. No markdown.
      
      Structure:
      {
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "location": "City, Country",
        "position": "Current or most recent Job Title",
        "company": "Current or most recent Company Name",
        "bio": "A professional summary (max 400 chars)",
        "skills": "Comma separated list of top 10 skills",
        "education": "Array of strings. Format: 'Degree at Institution (Date Range): Description'",
        "work_experience": "Array of strings. Format: 'Role at Company (Date Range): Description'",
        "experience_years": "Total numeric years of experience. Leave empty if not determinable.",
        "age": "Current age in years (number). ONLY if DOB is present or can be clearly inferred from graduation dates (e.g. Grad Year - 22). Leave empty if not found.",
        "education_level": "Standardized degree level (high_school, diploma, bachelors, masters, phd). Leave empty if not found.",
        "language_clb": "Detected English CLB level (4-10) based on IELTS/CELPIP mentions. Do NOT guess if no language metrics are present.",
        "noc_teer": "Inferred NOC TEER level (0-5) based on responsibilities. Leave empty if unclear.",
        "job_offer": "Is there a mention of a valid Canadian job offer? ('yes' or 'no'). Leave empty if not mentioned.",
        "recommended_job_titles": "Array of 3-5 job titles. CRITICAL: Select from the VALID Job Titles list above.",
        "recommended_noc_codes": "Array of best matching 5-digit NOC 2021 codes.",
        "recommended_employers": "Array of 3-5 real employer names from the provided database list that hire for these roles.",
        "target_canadian_province": "If the candidate is currently outside Canada, analyze their profession to suggest exactly ONE best-fitting Canadian Province (e.g., 'Ontario', 'British Columbia', 'Alberta') where demand for their role is highest."
      }

      STRICT FALLBACK RULES:
      - If no direct match in Job Titles list, use the most common professional equivalent.
      - NEVER return empty recommended_job_titles or recommended_noc_codes.
      - If location is outside Canada, ALWAYS suggest a Canadian target province in the 'target_canadian_province' field.
    `;

    const parts: any[] = [];
    if (isPdf) {
        parts.push({ text: basePrompt });
        parts.push({
            inlineData: {
                mimeType: "application/pdf",
                data: buffer.toString("base64")
            }
        });
    } else {
        parts.push({ text: `${basePrompt}\n\nRESUME CONTENT:\n${resumeText.substring(0, 30000)}` });
    }

    try {
        const result = await model.generateContent(parts);
        const responseText = result.response.text();
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const parsed = JSON.parse(cleaned);
            
            // Normalization & Backward Compatibility
            if (parsed.experience_years) {
                parsed.experience = parsed.experience_years;
            }
            if (parsed.experience && !parsed.experience_years) {
                parsed.experience_years = parsed.experience;
            }

            // Numeric cleaning
            if (parsed.experience_years) {
                parsed.experience_years = parseFloat(String(parsed.experience_years)) || 0;
            }
            if (parsed.age) {
                parsed.age = parseFloat(String(parsed.age)) || 0;
            }
            
            return parsed;
        } catch (e) {
            console.error("Failed to parse Gemini response for agency resume:", responseText);
            throw new Error("The AI returned an invalid response structure. Please try again.");
        }
    } catch (e: any) {
        console.error("Gemini Agency Parsing Error:", e);
        
        // Handle common API errors with friendly messages
        if (e.message?.includes("503") || e.message?.includes("Service Unavailable") || e.message?.includes("high demand")) {
            throw new Error("The AI model is currently experiencing high demand. Please wait a few seconds and try again.");
        }
        
        if (e.message?.includes("429") || e.message?.includes("quota")) {
            throw new Error("Rate limit reached. Please wait a moment before processing more resumes.");
        }

        throw new Error(e.message || "An unexpected error occurred during AI analysis.");
    }
}
