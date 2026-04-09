/**
 * Ontario PNP (OINP) Calculation Logic
 * Simplified based on Human Capital / Employer Job Offer streams.
 */

export interface OntarioInputs {
    jobOfferWage: string;
    nocTeer: string;
    canadianExperience: string;
    workLocation: string;
    educationLevel: string;
    primaryLanguage: string;
}

export function calculateOntarioScore(values: OntarioInputs) {
    const ageScore = 0; // OINP usually doesn't score age directly in many streams
    
    // 1. NOC TEER
    const teerScore = values.nocTeer === "0" || values.nocTeer === "1" ? 10 : 5;
    
    // 2. Wage
    const wageScore = values.jobOfferWage === "high" ? 10 : 5;

    // 3. Experience
    const expScore = values.canadianExperience === "yes" ? 10 : 0;

    // 4. Location
    const locScore = values.workLocation === "outsideGTA" ? 10 : 5;

    const breakdown = {
        teer: teerScore,
        wage: wageScore,
        experience: expScore,
        location: locScore,
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { total, breakdown };
}
