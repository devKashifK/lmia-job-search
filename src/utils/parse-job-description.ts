/**
 * Parses the `job_description` JSONB column from the DB.
 *
 * Handles two common formats:
 *
 * FORMAT A — Job Bank (structured):
 * {
 *   jobUrl: string,
 *   overview: { Tasks, "On site", Education, Languages, Experience },
 *   jobDetails: { Salary, Source, Location, vacancies, "Terms of employment", ... },
 *   whoCanApply: string[],
 *   responsibilities: string[]
 * }
 *
 * FORMAT B — Flat scraped (all keys at top-level, with optional nested overview.description):
 * {
 *   overview: { description: "long concatenated text including Tasks..." },
 *   "Education": "Grade 12",
 *   "Experience": "1-2 Years",
 *   "Employer Name": "...",
 *   "Wage/Salary Info": "...",
 *   "Posted Date": "..."
 * }
 *
 * Falls back gracefully to plain-text strings.
 */

export interface ParsedJobDescription {
    /** Short prose blurb for the "Overview" card */
    overview: string | null;
    /** Bullet-point list for "Key Responsibilities" */
    responsibilities: string[];
    /** Bullet-point list for "Requirements" */
    requirements: string[];
    /** Bullet-point list for "Additional Info" */
    additionalInfo: string[];
    /** External link to the original posting, e.g. Job Bank */
    jobUrl: string | null;
    /** Salary string extracted from jobDetails (may override DB salary field) */
    salary: string | null;
    /** Combined results of any unknown fields from the JSON */
    extraSections: Array<{ title: string; content: string | string[] }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Key classification sets
// ─────────────────────────────────────────────────────────────────────────────

/** Top-level keys handled explicitly — skipped by the catch-all loop */
const KNOWN_TOP_LEVEL = new Set([
    'jobUrl', 'overview', 'jobDetails', 'whoCanApply', 'responsibilities',
]);

/** Top-level keys that map to Requirements (Format B flat) */
const TOP_LEVEL_REQUIREMENT_KEYS = new Set([
    'Education', 'education',
    'Experience', 'experience',
    'Languages', 'languages',
    'Skills', 'skills',
    'Qualifications', 'qualifications',
    'Certifications', 'certifications',
    'License', 'license', 'Licence', 'licence',
]);

/** Top-level keys to extract salary from (Format B flat) */
const TOP_LEVEL_SALARY_KEYS = ['Wage/Salary Info', 'Salary', 'salary', 'Pay', 'pay', 'Compensation'];

/** Keys inside `overview` that are handled explicitly */
const KNOWN_OVERVIEW = new Set([
    'Tasks', 'On site',
    'Education', 'Languages', 'Experience',
    'description', 'Description', 'Job Description', 'job_description',
    'Summary', 'summary',
]);

/** Keys inside `jobDetails` that are handled explicitly */
const KNOWN_DETAILS = new Set([
    'Salary', 'Source', 'Location', 'vacancies',
    'Terms of employment', 'Starts as soon as possible', 'detail_1',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Splits a "- item1 - item2" style string into individual bullet strings.
 * Returns null if no bullet structure is found.
 */
function extractBullets(text: string): string[] | null {
    const parts = text.split(/(?<=[A-Za-z0-9.,)])- /).map((s) => s.trim()).filter(Boolean);
    return parts.length >= 2 ? parts : null;
}

/**
 * Attempts to extract a valid JSON block from a string that might have noise
 * like leading hyphens, bullet points, or triple backticks.
 */
function cleanJsonString(raw: string): string {
    let text = raw.trim();
    
    // Remove leading/trailing markdown code blocks
    text = text.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    
    // Remove leading bullet points/hyphens if they appear before the first '{'
    if (text.startsWith('-') || text.startsWith('*')) {
        const firstBrace = text.indexOf('{');
        if (firstBrace !== -1) {
            text = text.slice(firstBrace).trim();
        }
    }
    
    return text;
}

/**
 * Parses a combined description blob that may contain embedded tasks.
 *
 * A typical pattern:
 *   "Description This Job has been imported... Skills and Abilities Tasks - Do X - Do Y Security and safety - Bondable"
 *
 * Returns { overviewText, tasks } where:
 *   - overviewText = prose before any task section
 *   - tasks = individual task strings extracted from the "Tasks - " section
 */
function parseDescriptionBlob(raw: string): { overviewText: string; tasks: string[]; extraSections: Record<string, string[]> } {
    // Strip leading "Description " prefix (common in flat scrapers)
    let text = raw.replace(/^Description\s+/i, '').trim();

    // ─────────────────────────────────────────────────────────────────────────
    // Privacy and Source Stripping
    // ─────────────────────────────────────────────────────────────────────────
    // Strip URLs
    text = text.replace(/https?:\/\/[^\s]+/gi, '');
    // Strip Email addresses
    text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '');
    // Strip Phone numbers (common North American formats)
    text = text.replace(/\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g, '');
    
    // Strip Source-related footers and phrases
    const sourcePhrases = [
        /\bFor the complete posting please visit.*\b/i,
        /\bVisit our website at.*\b/i,
        /\bSource:.*\b/i,
        /\bOriginally posted on.*\b/i,
        /\bThis job has been imported from.*\b/i,
        /\bJob Bank job number:.*\b/i,
    ];
    sourcePhrases.forEach(p => {
        text = text.replace(p, '');
    });

    const extraSections: Record<string, string[]> = {};
    const tasks: string[] = [];
    let overviewText = text;

    // 1. Identify common section markers
    // Note: We avoid leading \b for cases like "profitabilityQualifications" (missing space)
    // but we require a trailing symbol (:, *, or \n) to ensure it's a header
    const sectionMarkers = [
        { key: 'responsibilities', pattern: /Key Responsibilities\s*[:*-]*/i, title: 'Key Responsibilities' },
        { key: 'qualifications', pattern: /Qualifications (and|&) Education\s*[:*-]*/i, title: 'Qualifications' },
        { key: 'requirements', pattern: /(Employment )?Requirements\s*[:*-]*/i, title: 'Requirements' },
        { key: 'tasks', pattern: /(Skills and Abilities\s+)?Tasks\s*[:*-]*/i, title: 'Tasks' },
        { key: 'benefits', pattern: /Benefits\s*[:*-]*/i, title: 'Benefits' },
        { key: 'schedule', pattern: /Schedule\s*[:*-]*/i, title: 'Schedule' },
        { key: 'work_with', pattern: /Work with\s*[:*-]*/i, title: 'Work With' },
        { key: 'suitability', pattern: /Personal suitability\s*[:*-]*/i, title: 'Personal Suitability' },
        { key: 'safety', pattern: /Security (and|&) safety\s*[:*-]*/i, title: 'Security and Safety' },
        { key: 'conditions', pattern: /Work conditions (and|&) physical capabilities\s*[:*-]*/i, title: 'Work Conditions' },
        { key: 'additional', pattern: /Additional information\s*[:*-]*/i, title: 'Additional Information' },
    ];

    // Find all occurrences of markers
    const foundMarkers = sectionMarkers
        .map(m => {
            const match = text.match(m.pattern);
            return match ? { ...m, index: match.index!, length: match[0].length } : null;
        })
        .filter((m): m is any => m !== null)
        .sort((a, b) => a.index - b.index);

    if (foundMarkers.length > 0) {
        overviewText = text.slice(0, foundMarkers[0].index).replace(/[,;.\s\-]+$/, '').trim();
        if (overviewText) overviewText += '.'; // Ensure it ends with a period if it was cut

        for (let i = 0; i < foundMarkers.length; i++) {
            const current = foundMarkers[i];
            const next = foundMarkers[i + 1];
            let sectionContent = text.slice(current.index + current.length, next ? next.index : undefined).trim();
            
            // Clean leading punctuation like commas or dashes left behind
            sectionContent = sectionContent.replace(/^[,;.\s\-]+/, '').trim();

            // Split content into bullets if markers exist (* or -)
            let bullets = sectionContent.split(/\s*(?:\n|\*|-)\s+/).map(s => s.trim()).filter(s => s.length > 3);
            
            if (bullets.length <= 1) {
                // Try splitting by sentences if no bullets found
                bullets = sectionContent.split(/(?<=[.!?])\s+(?=[A-Z])/).map(s => s.trim()).filter(s => s.length > 10);
            }

            if (current.key === 'tasks' || current.key === 'responsibilities') {
                tasks.push(...bullets);
            } else {
                extraSections[current.title] = bullets;
            }
        }
    } else {
        // Fallback: If no markers but contains bullets (* or -), try to extract them
        const bulletSplit = text.split(/\s*(?:\n|\*|-)\s+/);
        if (bulletSplit.length > 2) {
            overviewText = bulletSplit[0].trim();
            tasks.push(...bulletSplit.slice(1).map(s => s.trim()).filter(s => s.length > 2));
        } else {
            // Check for extractBullets specifically
            const autoBullets = extractBullets(text);
            if (autoBullets && autoBullets.length > 1) {
                overviewText = autoBullets[0];
                tasks.push(...autoBullets.slice(1));
            }
        }
    }

    return { overviewText, tasks, extraSections };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────────────────────────────────────

export function parseJobDescription(raw: unknown): ParsedJobDescription | null {
    if (!raw) return null;

    // ── Resolve to a plain object ────────────────────────────────────────────
    let data: Record<string, unknown> = {};

    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
        data = raw as Record<string, unknown>;
    } else if (typeof raw === 'string') {
        const cleaned = cleanJsonString(raw);
        try {
            const parsed = JSON.parse(cleaned);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                data = parsed as Record<string, unknown>;
            } else {
                return { overview: cleaned, responsibilities: [], requirements: [], additionalInfo: [], jobUrl: null, salary: null, extraSections: [] };
            }
        } catch {
            return {
                overview: null,
                responsibilities: [],
                requirements: [],
                additionalInfo: [],
                jobUrl: null,
                salary: null,
                extraSections: []
            };
        }
    } else {
        return null;
    }

    const extraSections: Array<{ title: string; content: string | string[] }> = [];
    const responsibilitiesSet = new Set<string>();
    const requirements: string[] = [];
    const additionalInfo: string[] = [];
    let overviewCandidates: string[] = [];

    // Helper to process any value recursively
    const processValue = (key: string, val: unknown) => {
        if (!val) return;

        if (typeof val === 'string' && val.trim()) {
            const strVal = val.trim();
            
            // Try to extract structured content from this string
            const { overviewText, tasks, extraSections: blobSections } = parseDescriptionBlob(strVal);
            
            if (overviewText && overviewText.length > 5) {
                overviewCandidates.push(overviewText);
            } else if (strVal.length > 5 && !KNOWN_TOP_LEVEL.has(key) && !KNOWN_OVERVIEW.has(key) && !KNOWN_DETAILS.has(key)) {
                overviewCandidates.push(strVal);
            }

            tasks.forEach(t => responsibilitiesSet.add(t));
            Object.entries(blobSections).forEach(([title, content]) => {
                extraSections.push({ title, content });
            });

            // Handle metadata capture
            if (TOP_LEVEL_REQUIREMENT_KEYS.has(key)) {
                requirements.push(`${key}: ${strVal}`);
                extraSections.push({ title: key, content: strVal });
            } else if (!KNOWN_TOP_LEVEL.has(key) && !KNOWN_OVERVIEW.has(key) && !KNOWN_DETAILS.has(key)) {
                // Unknown meta-data
                additionalInfo.push(`${key}: ${strVal}`);
                extraSections.push({ title: key, content: strVal });
            }
        } else if (Array.isArray(val)) {
            const items = val.filter(v => typeof v === 'string').map(String);
            if (items.length > 0) {
                if (key === 'responsibilities' || key === 'tasks') {
                    items.forEach(i => responsibilitiesSet.add(i));
                } else if (key === 'whoCanApply') {
                    requirements.push(`Who can Apply: ${items.join(', ')}`);
                } else {
                    const combined = items.join(', ');
                    additionalInfo.push(`${key}: ${combined}`);
                    extraSections.push({ title: key, content: items });
                }
            } else {
                // Recurse into array of objects if needed
                val.forEach(v => processValue(key, v));
            }
        } else if (typeof val === 'object') {
            // Recurse into nested objects
            Object.entries(val).forEach(([k, v]) => processValue(k, v));
        }
    };

    // Deep scan top-level
    for (const [key, val] of Object.entries(data)) {
        if (key === 'overview' && typeof val === 'object' && val !== null) {
            for (const [oKey, oVal] of Object.entries(val)) {
                processValue(oKey, oVal);
                // Format A explicit handling
                if (oKey === 'Education') requirements.push(`Education: ${oVal}`);
                if (oKey === 'Languages') requirements.push(`Languages: ${oVal}`);
                if (oKey === 'Experience') requirements.push(`Experience: ${oVal}`);
            }
        } else if (key === 'jobDetails' && typeof val === 'object' && val !== null) {
            for (const [dKey, dVal] of Object.entries(val)) {
                processValue(dKey, dVal);
                // Format A explicit handling
                if (dKey === 'vacancies') additionalInfo.push(`Vacancies: ${dVal}`);
                if (dKey === 'Terms of employment') additionalInfo.push(`Terms: ${dVal}`);
                if (dKey === 'Salary') { /* handled separately */ }
            }
        } else {
            processValue(key, val);
        }
    }

    // Pick best overview
    overviewCandidates.sort((a, b) => b.length - a.length);
    const bestOverview = overviewCandidates.find(o => o.split(' ').length > 3) || overviewCandidates[0] || null;

    // Salary extraction
    let salary: string | null = (data.jobDetails as any)?.Salary ?? null;
    if (!salary) {
        for (const key of TOP_LEVEL_SALARY_KEYS) {
            if (data[key] && typeof data[key] === 'string') {
                salary = String(data[key]).trim();
                break;
            }
        }
    }

    const jobUrl = typeof data.jobUrl === 'string' ? data.jobUrl : null;

    return {
        overview: bestOverview,
        responsibilities: Array.from(responsibilitiesSet),
        requirements: [...new Set(requirements)],
        additionalInfo: [...new Set(additionalInfo)],
        jobUrl,
        salary,
        extraSections,
    };
}
