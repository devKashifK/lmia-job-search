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

        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are an expert Canadian hiring manager. Based on the candidate profile below, generate 8 tailored interview questions to prepare them for a job in Canada. 
        
        CANDIDATE PROFILE:
        - Role: ${clientData.position || 'Professional'}
        - NOC: ${clientData.noc_code || 'Not specified'}
        - Key Skills: ${Array.isArray(clientData.skills) ? clientData.skills.join(', ') : 'Relevant skills'}
        - Experience: ${clientData.experience || 0} years
        
        For each question, provide:
        1. "question": The actual interview question.
        2. "rationale": Why this question is important for the Canadian market or this specific NOC.
        3. "star_tip": A hint on how to use the STAR method to answer this specifically.
        
        Return ONLY a valid JSON array of objects:
        [
          { "question": "...", "rationale": "...", "star_tip": "..." }
        ]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Invalid AI response format');

        const questions = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ questions });
    } catch (error: any) {
        console.error('Interview prep error:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
