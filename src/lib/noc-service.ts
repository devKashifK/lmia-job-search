import { promises as fs } from 'fs';
import path from 'path';

export interface SalaryProspect {
    region: string;
    low: string;
    median: string;
    high: string;
}

export interface NocClassification {
    category: string;
    teer: string;
    major_group: string;
    sub_major_group: string;
    minor_group: string;
}

export interface NocProfile {
    code: string;
    title: string;
    overview: string;
    mainDuties: Record<string, string[]>;
    employmentRequirements: string[];
    additionalInfo: string[];
    // New fields
    classification?: NocClassification;
    commonJobTitles?: string[];
    salaryProspects?: SalaryProspect[];
    jobOutlook?: string[];
    labourMarketDemand?: string[];
    benefits?: string[];
    pathways?: string[];
}

export interface NocSummary {
    code: string;
    title: string;
    teer: string;
}

const DATA_DIR = path.join(process.cwd(), 'public/noc_description');
const SUMMARIES_PATH = path.join(DATA_DIR, 'noc_profiles.json');

// Cache the data in memory for server-side performance
let nocCache: Record<string, NocProfile> | null = null;

async function getNocData(): Promise<Record<string, NocProfile>> {
    if (nocCache) return nocCache;

    try {
        const fileContents = await fs.readFile(SUMMARIES_PATH, 'utf8');
        nocCache = JSON.parse(fileContents);
        return nocCache as Record<string, NocProfile>;
    } catch (error) {
        console.error('Failed to load NOC profiles:', error);
        return {};
    }
}

export async function getNocProfile(code: string): Promise<NocProfile | null> {
    const summaryData = await getNocData();
    const summary = summaryData[code];

    try {
        const filePath = path.join(DATA_DIR, `${code}.json`);
        const fileContents = await fs.readFile(filePath, 'utf8');
        const rawData = JSON.parse(fileContents);

        // Title Fallback: Use summary title if individual file has generic title
        let cleanTitle = rawData.title || '';
        if (!cleanTitle || cleanTitle.toLowerCase() === 'introduction' || cleanTitle === 'N/A') {
            cleanTitle = summary?.title || `NOC ${code}`;
        } else {
            cleanTitle = cleanTitle
                .split('|')[0] // Remove " | GTR Immigration"
                .replace(`NOC ${code} – `, '') // Remove redundant "NOC XXXX – "
                .trim();
        }

        // Clean Overview: Remove redundant "NOC XXXX – Title | GTR Immigration" prefix
        let overview = rawData.description || summary?.overview || '';
        const prefixPattern = new RegExp(`^NOC ${code} [–-] [^|]+ \\| GTR Immigration\\s*`, 'i');
        overview = overview.replace(prefixPattern, '').trim();

        // Map new schema to our interface
        return {
            code: rawData.noc || code,
            title: cleanTitle,
            overview: overview,
            mainDuties: { "Main Duties": rawData.duties || summary?.mainDuties?.["Main Duties"] || [] },
            employmentRequirements: rawData.employment_requirements || summary?.employmentRequirements || [],
            additionalInfo: rawData.additional_information || summary?.additionalInfo || [],
            // New fields
            classification: rawData.classification,
            commonJobTitles: rawData.common_job_titles,
            salaryProspects: rawData.salary_prospects,
            jobOutlook: rawData.job_outlook,
            labourMarketDemand: rawData.labour_market_demand,
            benefits: rawData.benefits,
            pathways: rawData.pathways
        };
    } catch (error) {
        // Fallback to legacy summary data if individual file fails
        return summary || null;
    }
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
