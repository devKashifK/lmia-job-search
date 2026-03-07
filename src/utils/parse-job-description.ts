/**
 * Parses the `job_description` column from the DB.
 *
 * Expected JSON shape (Job Bank format):
 * {
 *   jobUrl: string,
 *   overview: { Tasks, "On site", Education, Languages, Experience, ... },
 *   jobDetails: { Salary, Source, Location, vacancies, "Terms of employment", ... },
 *   whoCanApply: string[],
 *   responsibilities: string[]
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
}

export function parseJobDescription(raw: string | undefined | null): ParsedJobDescription | null {
    if (!raw) return null;

    // ── Attempt JSON parse ──────────────────────────────────────────────────
    let data: Record<string, unknown> | null = null;
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            data = parsed as Record<string, unknown>;
        }
    } catch {
        // Not JSON — treat the whole string as a plain-text overview
        return {
            overview: raw,
            responsibilities: [],
            requirements: [],
            additionalInfo: [],
            jobUrl: null,
            salary: null,
        };
    }

    // If JSON parsed but was not a plain object (e.g. a bare string), treat as plain text
    if (!data) {
        return {
            overview: raw,
            responsibilities: [],
            requirements: [],
            additionalInfo: [],
            jobUrl: null,
            salary: null,
        };
    }

    // ── Known keys (used explicitly below) ──────────────────────────────────
    const KNOWN_TOP_LEVEL = new Set(['jobUrl', 'overview', 'jobDetails', 'whoCanApply', 'responsibilities']);
    const KNOWN_OVERVIEW = new Set(['Tasks', 'On site', 'Education', 'Languages', 'Experience']);
    const KNOWN_DETAILS = new Set(['Salary', 'Source', 'Location', 'vacancies',
        'Terms of employment', 'Starts as soon as possible', 'detail_1']);

    // ── Responsibilities ─────────────────────────────────────────────────────
    const responsibilities: string[] = Array.isArray(data.responsibilities)
        ? (data.responsibilities as string[]).filter(Boolean)
        : [];

    // ── Overview ─────────────────────────────────────────────────────────────
    // Use the first part of the "On site" value (before the redundant "Responsibilities" suffix)
    const ov = (data.overview as Record<string, string>) ?? {};
    const onSiteRaw = ov['On site'] ?? '';
    const stripped = onSiteRaw.split('Responsibilities')[0].trim();
    const overview: string | null = stripped || null;

    // ── Requirements ─────────────────────────────────────────────────────────
    const requirements: string[] = [];

    if (ov.Education) requirements.push(`Education: ${ov.Education}`);
    if (ov.Languages) requirements.push(`Languages: ${ov.Languages}`);
    if (ov.Experience) requirements.push(`Experience: ${ov.Experience}`);

    // Who can apply
    if (Array.isArray(data.whoCanApply)) {
        const eligible = (data.whoCanApply as string[]).filter(Boolean);
        if (eligible.length) {
            requirements.push(`Who can apply: ${eligible.join(', ')}`);
        }
    }

    // ── Catch-all: unknown overview keys → Requirements ──────────────────────
    for (const [key, val] of Object.entries(ov)) {
        if (!KNOWN_OVERVIEW.has(key) && typeof val === 'string' && val.trim()) {
            requirements.push(`${key}: ${val.trim()}`);
        }
    }

    // ── Additional Info ───────────────────────────────────────────────────────
    const additionalInfo: string[] = [];
    const details = (data.jobDetails as Record<string, string>) ?? {};

    if (details.vacancies) additionalInfo.push(details.vacancies);
    if (details['Terms of employment']) additionalInfo.push(details['Terms of employment']);
    if ('Starts as soon as possible' in details) {
        const startsVal = details['Starts as soon as possible'];
        additionalInfo.push(startsVal ? `Starts: ${startsVal}` : 'Starts as soon as possible');
    }
    if (details.Source) additionalInfo.push(`Source: ${details.Source}`);

    // ── Catch-all: unknown jobDetails keys → Additional Info ──────────────────
    for (const [key, val] of Object.entries(details)) {
        if (!KNOWN_DETAILS.has(key) && typeof val === 'string' && val.trim()) {
            additionalInfo.push(`${key}: ${val.trim()}`);
        }
    }

    // ── Catch-all: unknown top-level keys → Additional Info ───────────────────
    for (const [key, val] of Object.entries(data)) {
        if (KNOWN_TOP_LEVEL.has(key)) continue;
        if (Array.isArray(val)) {
            const items = (val as unknown[])
                .filter((v) => typeof v === 'string' && v.trim())
                .map(String);
            if (items.length) additionalInfo.push(`${key}: ${items.join(', ')}`);
        } else if (typeof val === 'string' && val.trim()) {
            additionalInfo.push(`${key}: ${val.trim()}`);
        }
    }

    // ── Salary ────────────────────────────────────────────────────────────────
    const salary = details.Salary ?? null;

    // ── Job URL ───────────────────────────────────────────────────────────────
    const jobUrl = typeof data.jobUrl === 'string' ? data.jobUrl : null;

    return { overview, responsibilities, requirements, additionalInfo, jobUrl, salary };
}
