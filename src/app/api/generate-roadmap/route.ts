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

        // 1. Fetch User Profile and Preferences for AI context
        const [{ data: profile }, { data: preferences }] = await Promise.all([
            (supabase.from('user_profiles') as any).select('*').eq('user_id', user.id).single(),
            (supabase.from('user_preferences') as any).select('*').eq('user_id', user.id).single()
        ]);

        if (!profile && !preferences) {
            return NextResponse.json({ error: 'Please complete your profile first' }, { status: 400 });
        }

        // 2. Prepare AI Context
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const toArray = (val: any) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
            return [];
        };

        const context = {
            name: profile?.full_name || user.email?.split('@')[0],
            position: profile?.position || preferences?.preferred_job_titles?.[0] || 'Professional',
            experience: profile?.experience || 'Not specified',
            education: profile?.education || 'Not specified',
            location: profile?.location || preferences?.preferred_locations?.[0] || 'Canada',
            skills: toArray(profile?.skills),
            targetTitles: toArray(preferences?.preferred_job_titles),
            nocCodes: toArray(preferences?.preferred_noc_codes),
            summary: profile?.bio || 'Looking for LMIA/work permit opportunities in Canada.'
        };

        const prompt = `You are a senior Canadian immigration and career strategist. Based on the candidate profile below, generate a 7-step Strategic Career Roadmap to help them land an LMIA job and settle in Canada.

CANDIDATE PROFILE:
- Name: ${context.name}
- Current/Target Role: ${context.position}
- Experience: ${context.experience}
- Education: ${context.education}
- Preferred Province: ${context.location}
- Key Skills: ${context.skills.slice(0, 10).join(', ') || 'General Professional'}
- Target NOCs: ${context.nocCodes.join(', ') || 'N/A'}
- Target Titles: ${context.targetTitles.join(', ') || 'N/A'}
- Background: ${context.summary}

Generate exactly 7 steps. Each step must be:
1. Highly personalized to their role and destination.
2. Direct and actionable (start with a verb).
3. Maximum 15 words long.
4. Focused on the Canadian LMIA and work permit market.

Return ONLY a valid JSON array of strings:
["Step 1", "Step 2", ..., "Step 7"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Invalid AI response format');
        
        const steps = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(steps) || steps.length === 0) throw new Error('Invalid steps format');

        return NextResponse.json({ steps: steps.slice(0, 7) });

    } catch (error: any) {
        console.error('User Roadmap Error:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
