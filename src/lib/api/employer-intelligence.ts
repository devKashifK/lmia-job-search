import db from '@/db';

export interface EmployerStrategicInsights {
    total_insights: number;
    lmia_count: number;
    trending_count: number;
    yearly_distribution: Record<string, number>;
    top_titles: string[];
    locations: string[];
    avg_wage?: number;
    last_active?: string;
    strategic_brief?: string;
}

/**
 * Fetches strategic hiring patterns for a specific employer and NOC set
 */
export async function getEmployerStrategicInsights(
    employerName: string,
    nocCodes: string[]
): Promise<EmployerStrategicInsights> {
    try {
        const { data, error } = await (db as any).rpc('get_employer_strategic_insights', {
            p_employer_name: employerName,
            p_noc_codes: nocCodes
        });

        if (error) throw error;
        
        const insights = data as EmployerStrategicInsights;
        
        // Generate a strategic brief based on the data
        insights.strategic_brief = generateStrategicBrief(insights, employerName);
        
        return insights;
    } catch (error) {
        console.error('Error fetching employer insights:', error);
        return {
            total_insights: 0,
            lmia_count: 0,
            trending_count: 0,
            yearly_distribution: {},
            top_titles: [],
            locations: []
        };
    }
}

/**
 * Heuristic engine to generate a human-readable strategic brief
 */
function generateStrategicBrief(data: EmployerStrategicInsights, employer: string): string {
    if (data.total_insights === 0) {
        return `No historical data found for ${employer} in targeted NOCs. This employer may be a cold-outreach target or hiring under different classifications.`;
    }

    const segments = [];
    
    // Sponsorship DNA
    if (data.lmia_count > 10) {
        segments.push(`Proven sponsorship DNA with ${data.lmia_count} approved LMIAs.`);
    } else if (data.lmia_count > 0) {
        segments.push(`Established sponsorship history for specifically targeted roles.`);
    }

    // Hiring Momentum
    if (data.trending_count > 0) {
        segments.push(`Currently active with ${data.trending_count} recent job postings, indicating high hiring momentum.`);
    }

    // Wage Analysis
    if (data.avg_wage && data.avg_wage > 25) {
        segments.push(`Offers competitive compensation ($${data.avg_wage.toFixed(2)}/hr avg), exceeding industry baselines.`);
    }

    // Title Consistency
    if (data.top_titles.length > 0) {
        segments.push(`Primary focus is on ${data.top_titles[0]} roles.`);
    }

    return segments.join(' ') || `Active target with documented hiring patterns in your client's field.`;
}
