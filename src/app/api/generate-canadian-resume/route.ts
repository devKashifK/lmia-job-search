import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.split("Bearer ")[1];
        
        const supabase = await createClient();
        let user;

        if (token) {
            const { data } = await supabase.auth.getUser(token);
            user = data?.user;
        } else {
            const { data } = await supabase.auth.getUser();
            user = data?.user;
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
        }

        const { profile } = await req.json();

        if (!profile) {
            return NextResponse.json({ error: "Profile data is required" }, { status: 400 });
        }

        const prompt = `
      Act as an expert Canadian Technical Career Coach. Your goal is to rewrite the candidate's profile into a "Canadian Standard" resume content.
      
      STRICT GUIDELINES:
      1. FORMAT: Content must be suitable for a single-column, reverse-chronological layout. 
      2. SPELLING (Canadian English): Use Canadian spelling (e.g., 'centre', 'fibre', 'labour', 'colour', 'behaviour'). Use '-ize' (e.g., 'organize', 'optimize').
      3. PRIVACY: Exclude photos, age, marital status, or full home address. Only include Name, City, Province, LinkedIn, and Website.
      4. CONTENT: Transform duties into achievement-based bullet points. Use the G-A-R (Goal-Action-Result) formula. 
         - Include numbers, percentages, and dollar amounts ($) where possible to show impact.
         - Start bullet points with strong action verbs (e.g., "Spearheaded", "Architected", "Optimized").
      5. PROJECTS: For software projects like 'Job Maze', emphasize the tech stack and the specific problem solved for the Canadian market.
      
      CANDIDATE DATA:
      - Name: ${profile.full_name || user.user_metadata?.name || "User"}
      - Current Position: ${profile.position || "Professional"}
      - Current Company: ${profile.company || "N/A"}
      - Bio: ${profile.bio || "No summary provided"}
      - Skills: ${profile.skills || "N/A"}
      - Experience History: ${profile.work_history || "N/A"}
      - Education: ${profile.education || "N/A"}
      - Projects: ${profile.projects || "N/A"}
      - Contact: ${profile.email || user.email}, ${profile.phone || "N/A"}, ${profile.location || "Canada"}
      
      OUTPUT STRUCTURE (Return ONLY valid JSON):
      {
        "header": {
          "name": "Full Name",
          "location": "City, Province",
          "contact": ["Email", "Phone", "LinkedIn URL", "Portfolio URL"]
        },
        "professional_summary": "3-4 impact-heavy sentences using Canadian spelling and technical keywords.",
        "skills": ["Category Name: Skill 1, Skill 2, Skill 3", ...],
        "work_experience": [
          {
            "role": "Job Title",
            "company": "Company Name",
            "location": "City, Province",
            "date": "Month YYYY - Present/Month YYYY",
            "bullets": ["Achievement 1 with numbers", "Achievement 2 with impact"]
          }
        ],
        "projects": [
          {
            "name": "Project Name",
            "tech_stack": "React, TypeScript, etc.",
            "bullets": ["Challenge solved", "Technical achievement"]
          }
        ],
        "education": [
          {
            "degree": "Degree Name",
            "institution": "University Name",
            "location": "City, Province/Country",
            "date": "Year - Year"
          }
        ]
      }
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up response
        const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const resumeData = JSON.parse(cleanedJson);

        return NextResponse.json({ data: resumeData });

    } catch (error: any) {
        console.error("Resume generation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
