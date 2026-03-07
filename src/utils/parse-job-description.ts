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
 * FORMAT B — Flat scraped (all keys at top-level or inside overview as a "description" blob):
 * {
 *   overview: { description: "long concatenated text…" },
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Keys that are explicitly handled — won't be caught by the catch-all loops.
 */
const KNOWN_TOP_LEVEL = new Set([
    'jobUrl', 'overview', 'jobDetails', 'whoCanApply', 'responsibilities',
]);
const KNOWN_OVERVIEW = new Set([
    'Tasks', 'On site', 'Education', 'Languages', 'Experience',
    // description-style keys — handled as overview text, not as requirements
    'description', 'Description', 'Job Description', 'job_description',
    'Summary', 'summary',
]);
const KNOWN_DETAILS = new Set([
    'Salary', 'Source', 'Location', 'vacancies',
    'Terms of employment', 'Starts as soon as possible', 'detail_1',
]);

/**
 * Splits a concatenated description blob into individual bullet items.
 *
 * Handles patterns like:
 *   "Education- Food Safe Certificate- Journeyperson Cook"
 *   → ["Food Safe Certificate", "Journeyperson Cook"]
 *
 * Returns null when it cannot find meaningful bullet structure.
 */
function extractBullets(text: string): string[] | null {
    // Split on "- " that follows a word character (avoids splitting on em-dashes etc.)
    const raw = text.split(/(?<=[A-Za-z0-9.,)])- /).map((s) => s.trim()).filter(Boolean);
    // Only treat as bullet list if we got at least 2 items
    return raw.length >= 2 ? raw : null;
}

/**
 * Tries to resolve the overview text from several possible sources, in priority order.
 * Returns a short, clean prose string (or null).
 */
function resolveOverview(ov: Record<string, string>): string | null {
    // 1. Job Bank "On site" field → strip the redundant "Responsibilities …" suffix
    if (ov['On site']) {
        const cleaned = ov['On site'].split('Responsibilities')[0].trim();
        if (cleaned) return cleaned;
    }

    // 2. Explicit description-style keys (any scraper format)
    for (const key of ['description', 'Description', 'Job Description', 'Summary', 'summary']) {
        if (ov[key]) return ov[key];
    }

    // 3. Fallback: first string value that looks like a sentence (ends with '.')
    for (const val of Object.values(ov)) {
        if (typeof val === 'string' && val.includes('.')) return val;
    }

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────────────────────────────────────

export function parseJobDescription(raw: unknown): ParsedJobDescription | null {
    if (!raw) return null;

    // ── Resolve to a plain object ────────────────────────────────────────────
    // Supabase JSONB columns return already-parsed JS objects, NOT strings.
    let data: Record<string, unknown>;

    if (typeof raw === 'object' && !Array.isArray(raw)) {
        // Already parsed by Supabase (JSONB column)
        data = raw as Record<string, unknown>;
    } else if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                data = parsed as Record<string, unknown>;
            } else {
                // Primitive JSON (number, bool) or array → treat as plain overview text
                return { overview: raw, responsibilities: [], requirements: [], additionalInfo: [], jobUrl: null, salary: null };
            }
        } catch {
            // Not valid JSON — treat the whole string as a plain-text overview
            return { overview: raw, responsibilities: [], requirements: [], additionalInfo: [], jobUrl: null, salary: null };
        }
    } else {
        return null;
    }

    // ── Normalise nested objects ──────────────────────────────────────────────
    const ov = (typeof data.overview === 'object' && data.overview && !Array.isArray(data.overview)
        ? data.overview
        : {}) as Record<string, string>;

    const details = (typeof data.jobDetails === 'object' && data.jobDetails && !Array.isArray(data.jobDetails)
        ? data.jobDetails
        : {}) as Record<string, string>;

    // ── Overview ──────────────────────────────────────────────────────────────
    const overview: string | null = resolveOverview(ov);

    // ── Responsibilities ──────────────────────────────────────────────────────
    let responsibilities: string[] = [];

    if (Array.isArray(data.responsibilities)) {
        // FORMAT A: explicit array
        responsibilities = (data.responsibilities as string[]).filter(Boolean);
    } else if (ov.Tasks) {
        // FORMAT A fallback: Tasks string → try to split into bullets
        const bullets = extractBullets(ov.Tasks);
        responsibilities = bullets ?? (ov.Tasks ? [ov.Tasks] : []);
    }

    // ── Requirements ──────────────────────────────────────────────────────────
    const requirements: string[] = [];

    // Known structured requirement fields (Format A)
    if (ov.Education) requirements.push(`Education: ${ov.Education}`);
    if (ov.Languages) requirements.push(`Languages: ${ov.Languages}`);
    if (ov.Experience) requirements.push(`Experience: ${ov.Experience}`);

    // Who can apply (Format A)
    if (Array.isArray(data.whoCanApply)) {
        const eligible = (data.whoCanApply as string[]).filter(Boolean);
        if (eligible.length) {
            requirements.push(`Who can apply: ${eligible.join(', ')}`);
        }
    }

    // Catch-all: unknown overview keys that are SHORT (< 200 chars) → Requirements
    // Long blobs (descriptions) are intentionally excluded here — they go to Overview.
    for (const [key, val] of Object.entries(ov)) {
        if (
            !KNOWN_OVERVIEW.has(key) &&
            typeof val === 'string' &&
            val.trim() &&
            val.trim().length < 200
        ) {
            requirements.push(`${key}: ${val.trim()}`);
        }
    }

    // ── Additional Info ───────────────────────────────────────────────────────
    const additionalInfo: string[] = [];

    // Known jobDetails fields (Format A)
    if (details.vacancies) additionalInfo.push(details.vacancies);
    if (details['Terms of employment']) additionalInfo.push(details['Terms of employment']);
    if ('Starts as soon as possible' in details) {
        const v = details['Starts as soon as possible'];
        additionalInfo.push(v ? `Starts: ${v}` : 'Starts as soon as possible');
    }
    if (details.Source) additionalInfo.push(`Source: ${details.Source}`);

    // Catch-all: unknown jobDetails keys → Additional Info
    for (const [key, val] of Object.entries(details)) {
        if (!KNOWN_DETAILS.has(key) && typeof val === 'string' && val.trim()) {
            additionalInfo.push(`${key}: ${val.trim()}`);
        }
    }

    // Catch-all: unknown top-level keys → Additional Info (Format B flat fields)
    for (const [key, val] of Object.entries(data)) {
        if (KNOWN_TOP_LEVEL.has(key)) continue;
        if (Array.isArray(val)) {
            const items = (val as unknown[]).filter((v) => typeof v === 'string' && (v as string).trim()).map(String);
            if (items.length) additionalInfo.push(`${key}: ${items.join(', ')}`);
        } else if (typeof val === 'string' && val.trim()) {
            additionalInfo.push(`${key}: ${val.trim()}`);
        }
    }

    // ── Salary ────────────────────────────────────────────────────────────────
    // Also check top-level "Wage/Salary Info" for Format B scrapers
    const salary =
        details.Salary ??
        (typeof data['Wage/Salary Info'] === 'string' ? (data['Wage/Salary Info'] as string) : null) ??
        null;

    // ── Job URL ───────────────────────────────────────────────────────────────
    const jobUrl = typeof data.jobUrl === 'string' ? data.jobUrl : null;

    return { overview, responsibilities, requirements, additionalInfo, jobUrl, salary };
}
