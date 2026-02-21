import { NextRequest, NextResponse } from "next/server";
import { findNocMatches } from "@/lib/noc-service";
import db from "@/db";

const KEYWORD_MAPPINGS: Record<string, string[]> = {
    // IT & Engineering
    'software': ['IT', 'Engineering'],
    'developer': ['IT', 'Engineering'],
    'programmer': ['IT'],
    'computer': ['IT', 'Engineering'],
    'tech': ['IT'],
    'data': ['IT', 'Business'],
    'engineer': ['Engineering'],

    // Food & Hospitality
    'cook': ['Food & Beverage', 'F&B', 'Hospitality'],
    'chef': ['Food & Beverage', 'F&B', 'Hospitality'],
    'kitchen': ['Food & Beverage', 'F&B'],
    'restaurant': ['Food & Beverage', 'F&B', 'Hospitality'],
    'server': ['Food & Beverage', 'F&B', 'Hospitality'],
    'food': ['Food & Beverage', 'F&B'],
    'hotel': ['Hospitality'],

    // Healthcare
    'nurse': ['Healthcare'],
    'medical': ['Healthcare'],
    'health': ['Healthcare'],
    'doctor': ['Healthcare'],
    'clinic': ['Healthcare'],
    'patient': ['Healthcare'],

    // Office & Business
    'admin': ['Office & Retail', 'Business', 'Management'],
    'assistant': ['Office & Retail', 'Business'],
    'clerk': ['Office & Retail', 'Business'],
    'manager': ['Management', 'Business'],
    'supervisor': ['Management'],
    'account': ['Finance', 'Business'],
    'finance': ['Finance', 'Business'],
    'sales': ['Business', 'Office & Retail', 'Marketing'],
    'marketing': ['Marketing', 'Business'],
    'office': ['Office & Retail', 'Business'],

    // Trades & Construction
    'construction': ['Construction'],
    'electrician': ['Construction', 'Engineering'],
    'plumber': ['Construction'],
    'mechanic': ['Automotive', 'Engineering'],
    'carpenter': ['Construction'],
    'driver': ['Transportation & Logistics'],
    'transport': ['Transportation & Logistics'],
    'truck': ['Transportation & Logistics'],
};

export async function POST(req: NextRequest) {
    try {
        const { jobTitles } = await req.json();

        if (!jobTitles || !Array.isArray(jobTitles) || jobTitles.length === 0) {
            return NextResponse.json({ matches: [], teerMatches: [], industryMatches: [] });
        }

        // 1. Get NOC Matches
        const matches = await findNocMatches(jobTitles);

        // 2. Extract Unique TEERs derived from NOC matches
        // Extract just the numeric TEER code (0, 1, 2, 3, 4, 5)
        const teerSet = new Set<string>();
        matches.forEach(m => {
            // m.teer format is "TEER 1" or "TEER 2" etc.
            const teerDigit = m.teer.replace('TEER ', '');
            if (teerDigit) teerSet.add(teerDigit);
        });
        const teerMatches = Array.from(teerSet).sort();

        // 3. Find Industry Matches (from DB Categories)
        let industryMatches: string[] = [];
        try {
            // Fetch categories similar to use-job-data.ts
            const [lmiaResult, trendingResult] = await Promise.all([
                db.from('lmia').select('Category').not('Category', 'is', null).limit(1000),
                db.from('trending_job').select('category').not('category', 'is', null).limit(1000),
            ]);

            const lmiaCategories = lmiaResult.data?.map((r: any) => r.Category).filter(Boolean) || [];
            const trendingCategories = trendingResult.data?.map((r: any) => r.category).filter(Boolean) || [];
            const uniqueCategories = [...new Set([...lmiaCategories, ...trendingCategories])];

            // Normalize categories for easier matching
            const normalizedCategories = uniqueCategories.map(c => ({
                original: c,
                lower: c.toLowerCase()
            }));

            const matchedSet = new Set<string>();

            jobTitles.forEach((title: string) => {
                const lowerTitle = title.toLowerCase();
                const titleWords = lowerTitle.split(/[\s-]+/).filter((w: string) => w.length > 2);

                // Strategy A: Check Keyword Mappings
                titleWords.forEach((word: string) => {
                    const mappedCats = KEYWORD_MAPPINGS[word];
                    if (mappedCats) {
                        mappedCats.forEach(cat => {
                            // Verify the mapped category actually exists in our DB set matching loosely
                            const exists = normalizedCategories.find(c =>
                                c.original === cat ||
                                c.lower === cat.toLowerCase() ||
                                c.lower.includes(cat.toLowerCase())
                            );
                            if (exists) matchedSet.add(exists.original);
                        });
                    }
                });

                // Strategy B: Direct & Substring Matching
                normalizedCategories.forEach(cat => {
                    // Exact cat in title (e.g. "Software" in "Software Engineer")
                    if (lowerTitle.includes(cat.lower)) matchedSet.add(cat.original);

                    // Title words in category
                    if (titleWords.some((w: string) => cat.lower.includes(w))) {
                        matchedSet.add(cat.original);
                    }
                });
            });

            industryMatches = Array.from(matchedSet).slice(0, 7); // Top 7 matches

        } catch (dbError) {
            console.error("Error fetching industries:", dbError);
        }

        return NextResponse.json({ matches, teerMatches, industryMatches });
    } catch (error) {
        console.error("Error matching preferences:", error);
        return NextResponse.json(
            { error: "Failed to match preferences" },
            { status: 500 }
        );
    }
}
