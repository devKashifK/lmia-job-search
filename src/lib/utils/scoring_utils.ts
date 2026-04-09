/**
 * Programmatic Candidate Scoring Utility
 * Calculates a "Readiness Score" based on extracted resume data.
 */
export function calculateCandidateScore(data: any): number {
    if (!data) return 0;

    let score = 0;

    // 1. Experience (Weight: 40%)
    // Scale 0-10 years to 0-40 points
    const years = parseFloat(data.experience) || 0;
    score += Math.min(years * 4, 40);

    // 2. Skill Density (Weight: 20%)
    // 2 points per skill, up to 10 skills
    const skills = data.skills ? data.skills.split(',').length : 0;
    score += Math.min(skills * 2, 20);

    // 3. Profile Completeness (Weight: 20%)
    if (data.email) score += 5;
    if (data.phone) score += 5;
    if (data.location) score += 5;
    if (data.bio && data.bio.length > 50) score += 5;

    // 4. Education & Work Depth (Weight: 20%)
    const eduCount = Array.isArray(data.education) ? data.education.length : 0;
    const workCount = Array.isArray(data.work_experience) ? data.work_experience.length : 0;
    
    score += Math.min(eduCount * 5, 10);
    score += Math.min(workCount * 5, 10);

    return Math.round(score);
}

/**
 * Returns a quality label based on the score
 */
export function getScoreLabel(score: number): string {
    if (score >= 90) return 'Exceptional';
    if (score >= 75) return 'Ready';
    if (score >= 50) return 'Potential';
    return 'Action Needed';
}
