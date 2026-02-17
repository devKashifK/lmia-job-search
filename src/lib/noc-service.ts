import { promises as fs } from 'fs';
import path from 'path';

export interface NocProfile {
    code: string;
    title: string;
    overview: string;
    mainDuties: Record<string, string[]>;
    employmentRequirements: string[];
    additionalInfo: string[];
}

export interface NocSummary {
    code: string;
    title: string;
    teer: string;
}

const DATA_PATH = path.join(process.cwd(), 'public/noc_description/noc_profiles.json');

// Cache the data in memory for server-side performance
let nocCache: Record<string, NocProfile> | null = null;

async function getNocData(): Promise<Record<string, NocProfile>> {
    if (nocCache) return nocCache;

    try {
        const fileContents = await fs.readFile(DATA_PATH, 'utf8');
        nocCache = JSON.parse(fileContents);
        return nocCache as Record<string, NocProfile>;
    } catch (error) {
        console.error('Failed to load NOC profiles:', error);
        return {};
    }
}

export async function getNocProfile(code: string): Promise<NocProfile | null> {
    const data = await getNocData();
    return data[code] || null;
}

export async function getAllNocSummaries(): Promise<NocSummary[]> {
    const data = await getNocData();
    return Object.values(data).map(profile => ({
        code: profile.code,
        title: profile.title,
        teer: getTeerCategory(profile.code)
    })).sort((a, b) => a.code.localeCompare(b.code));
}

export function getTeerCategory(code: string): string {
    // In NOC 2021, the 2nd digit usually represents the TEER category
    // 0 = Management
    // 1 = University degree
    // 2 = College diploma / apprenticeship (2+ years)
    // 3 = College diploma / apprenticeship (<2 years)
    // 4 = High school diploma
    // 5 = No formal education
    if (!code || code.length < 5) return 'Unknown';

    const teerToken = code.charAt(1);

    switch (teerToken) {
        case '0': return 'TEER 0';
        case '1': return 'TEER 1';
        case '2': return 'TEER 2';
        case '3': return 'TEER 3';
        case '4': return 'TEER 4';
        case '5': return 'TEER 5';
        default: return 'TEER';
    }
}

export async function findNocMatches(jobTitles: string[]): Promise<NocSummary[]> {
    const data = await getNocData();
    const profiles = Object.values(data);
    const matches: { profile: NocProfile; score: number }[] = [];

    // Simple scoring system
    // We want to find NOCs that match ANY of the job titles
    const uniqueTitles = [...new Set(jobTitles.map(t => t.toLowerCase()))];

    profiles.forEach(profile => {
        let score = 0;
        const nocTitle = profile.title.toLowerCase();
        const duties = Object.values(profile.mainDuties).flat().join(' ').toLowerCase();

        uniqueTitles.forEach(jobTitle => {
            // Title Match (High weight)
            if (nocTitle.includes(jobTitle)) {
                score += 10;
            } else {
                // Partial word match in title
                const words = jobTitle.split(' ');
                const matchCount = words.filter(w => w.length > 3 && nocTitle.includes(w)).length;
                score += matchCount * 2;
            }

            // Duty Match (Medium weight)
            if (duties.includes(jobTitle)) {
                score += 5;
            }
        });

        if (score > 0) {
            matches.push({ profile, score });
        }
    });

    // Sort by score descending and take top 5
    return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(m => ({
            code: m.profile.code,
            title: m.profile.title,
            teer: getTeerCategory(m.profile.code)
        }));
}
