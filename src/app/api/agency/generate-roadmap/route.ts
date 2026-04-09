import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { clientData } = await req.json();
        if (!clientData) return NextResponse.json({ error: 'Client data required' }, { status: 400 });

        // Normalize fields to ensure they are arrays for join/slice operations
        const toArray = (val: any) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
            return [];
        };

        const skills = toArray(clientData.skills);
        const languages = toArray(clientData.languages);
        const recommendedTitles = toArray(clientData.recommended_job_titles);
        const recommendedNocs = toArray(clientData.recommended_noc_codes || [clientData.noc_code]);
        const recommendedEmployers = toArray(clientData.recommended_employers);

        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are a senior Canadian immigration and employment consultant. Based on the candidate profile below, generate a precise, actionable 7-step strategic placement roadmap for this candidate to successfully land a job and obtain a work permit/LMIA in Canada.

CANDIDATE PROFILE:
- Name: ${clientData.name || 'Unknown'}
- Position/Title: ${clientData.position || 'N/A'}
- NOC Codes: ${recommendedNocs.filter(Boolean).join(', ') || 'N/A'}
- Target Job Titles: ${recommendedTitles.join(', ') || clientData.position || 'N/A'}
- Experience: ${clientData.experience || 0} years
- Education: ${clientData.education_level || 'N/A'}
- Location Preference: ${clientData.location || 'Canada'}
- Key Skills: ${skills.slice(0, 8).join(', ') || 'N/A'}
- Languages: ${languages.length ? languages.join(', ') : 'English'}
- Target Employers: ${recommendedEmployers.slice(0, 5).join(', ') || 'N/A'}
- Current Country: ${clientData.country || 'Not specified'}

Generate exactly 7 steps. Each step must be:
1. Specific to this candidate's profile (mention their actual NOC, titles, province, etc.)
2. Actionable (start with a strong verb)
3. Maximum 15 words long
4. Focused on Canadian job market strategy

Return ONLY a valid JSON array of strings, no other text:
["Step 1 text", "Step 2 text", ..., "Step 7 text"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Invalid AI response format');

        const steps = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(steps) || steps.length === 0) throw new Error('Invalid steps format');

        return NextResponse.json({ steps: steps.slice(0, 7) });
    } catch (error: any) {
        console.error('Roadmap generation error:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
