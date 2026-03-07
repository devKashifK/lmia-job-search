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
 * Parses a combined description blob that may contain embedded tasks.
 *
 * A typical pattern:
 *   "Description This Job has been imported... Skills and Abilities Tasks - Do X - Do Y Security and safety - Bondable"
 *
 * Returns { overviewText, tasks } where:
 *   - overviewText = prose before any task section
 *   - tasks = individual task strings extracted from the "Tasks - " section
 */
function parseDescriptionBlob(raw: string): { overviewText: string; tasks: string[] } {
    // Strip leading "Description " prefix (common in flat scrapers)
    let text = raw.replace(/^Description\s+/i, '').trim();

    // Task section markers — split at any of these
    const taskSectionMatch = text.match(
        /\b(Skills and Abilities\s+)?Tasks\s*-\s*/i
    );

    if (!taskSectionMatch || taskSectionMatch.index === undefined) {
        // No tasks section found — return the whole text as overview
        return { overviewText: text, tasks: [] };
    }

    const taskStart = taskSectionMatch.index;
    const afterTaskMarker = text.slice(taskStart + taskSectionMatch[0].length);

    // Prose part before the Tasks section
    const overviewText = text.slice(0, taskStart).trim();

    // Split the tasks section on " - " bullet markers
    // Stop at known non-task section markers like "Security and safety", "Employment terms"
    const nonTaskBreak = afterTaskMarker.search(
        /\b(Security and safety|Employment terms|Additional Comment|About US|About The Team|For more information)\b/i
    );
    const taskSection = nonTaskBreak !== -1
        ? afterTaskMarker.slice(0, nonTaskBreak)
        : afterTaskMarker;

    const tasks = taskSection
        .split(/\s*-\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3); // filter out very short fragments

    return { overviewText, tasks };
}

/**
 * Tries to resolve the overview text from several possible sources, in priority order.
 */
function resolveOverview(ov: Record<string, string>): { text: string | null; extractedTasks: string[] } {
    // 1. Job Bank "On site" field → strip the redundant "Responsibilities …" suffix
    if (ov['On site']) {
        const cleaned = ov['On site'].split('Responsibilities')[0].trim();
        if (cleaned) return { text: cleaned, extractedTasks: [] };
    }

    // 2. Explicit description-style keys (any scraper format) — may contain embedded tasks
    for (const key of ['description', 'Description', 'Job Description', 'Summary', 'summary']) {
        if (ov[key]) {
            const { overviewText, tasks } = parseDescriptionBlob(ov[key]);
            return { text: overviewText || null, extractedTasks: tasks };
        }
    }

    return { text: null, extractedTasks: [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────────────────────────────────────

export function parseJobDescription(raw: unknown): ParsedJobDescription | null {
    if (!raw) return null;

    // ── Resolve to a plain object ────────────────────────────────────────────
    let data: Record<string, unknown>;

    if (typeof raw === 'object' && !Array.isArray(raw)) {
        data = raw as Record<string, unknown>;
    } else if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                data = parsed as Record<string, unknown>;
            } else {
                return { overview: raw, responsibilities: [], requirements: [], additionalInfo: [], jobUrl: null, salary: null };
            }
        } catch {
            return { overview: raw, responsibilities: [], requirements: [], additionalInfo: [], jobUrl: null, salary: null };
        }
    } else {
        return null;
    }

    // ── Normalise nested objects ──────────────────────────────────────────────
    const ov = (typeof data.overview === 'object' && data.overview && !Array.isArray(data.overview)
        ? data.overview : {}) as Record<string, string>;

    const details = (typeof data.jobDetails === 'object' && data.jobDetails && !Array.isArray(data.jobDetails)
        ? data.jobDetails : {}) as Record<string, string>;

    // ── Overview (+ extract embedded tasks from description blobs) ───────────
    const { text: overview, extractedTasks } = resolveOverview(ov);

    // ── Responsibilities ──────────────────────────────────────────────────────
    let responsibilities: string[] = [];

    if (Array.isArray(data.responsibilities) && (data.responsibilities as unknown[]).length > 0) {
        // Format A: explicit array
        responsibilities = (data.responsibilities as string[]).filter(Boolean);
    } else if (ov.Tasks) {
        // Format A fallback: Tasks string → try to split into bullets
        const bullets = extractBullets(ov.Tasks);
        responsibilities = bullets ?? [ov.Tasks];
    } else if (extractedTasks.length > 0) {
        // Format B: tasks extracted from description blob
        responsibilities = extractedTasks;
    }

    // ── Requirements ──────────────────────────────────────────────────────────
    const requirements: string[] = [];

    // Known structured fields inside overview (Format A)
    if (ov.Education) requirements.push(`Education: ${ov.Education}`);
    if (ov.Languages) requirements.push(`Languages: ${ov.Languages}`);
    if (ov.Experience) requirements.push(`Experience: ${ov.Experience}`);

    // Who can apply (Format A)
    if (Array.isArray(data.whoCanApply)) {
        const eligible = (data.whoCanApply as string[]).filter(Boolean);
        if (eligible.length) requirements.push(`Who can apply: ${eligible.join(', ')}`);
    }

    // Format B: top-level requirement keys (Education, Experience, Languages, etc.)
    for (const [key, val] of Object.entries(data)) {
        if (TOP_LEVEL_REQUIREMENT_KEYS.has(key) && typeof val === 'string' && val.trim()) {
            requirements.push(`${key}: ${val.trim()}`);
        }
    }

    // Catch-all: short unknown overview keys → Requirements
    for (const [key, val] of Object.entries(ov)) {
        if (!KNOWN_OVERVIEW.has(key) && typeof val === 'string' && val.trim() && val.trim().length < 200) {
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
    // Skip requirement keys (already handled) and known structured keys
    for (const [key, val] of Object.entries(data)) {
        if (KNOWN_TOP_LEVEL.has(key)) continue;
        if (TOP_LEVEL_REQUIREMENT_KEYS.has(key)) continue; // already in requirements
        if (TOP_LEVEL_SALARY_KEYS.includes(key)) continue; // extracted separately

        if (Array.isArray(val)) {
            const items = (val as unknown[]).filter((v) => typeof v === 'string' && (v as string).trim()).map(String);
            if (items.length) additionalInfo.push(`${key}: ${items.join(', ')}`);
        } else if (typeof val === 'string' && val.trim()) {
            additionalInfo.push(`${key}: ${val.trim()}`);
        }
    }

    // ── Salary ────────────────────────────────────────────────────────────────
    let salary: string | null = details.Salary ?? null;
    if (!salary) {
        for (const key of TOP_LEVEL_SALARY_KEYS) {
            if (typeof data[key] === 'string' && (data[key] as string).trim()) {
                salary = (data[key] as string).trim();
                break;
            }
        }
    }

    // ── Job URL ───────────────────────────────────────────────────────────────
    const jobUrl = typeof data.jobUrl === 'string' ? data.jobUrl : null;

    return {
        overview,
        responsibilities,
        requirements: [...new Set(requirements)],
        additionalInfo: [...new Set(additionalInfo)],
        jobUrl,
        salary,
    };
}
