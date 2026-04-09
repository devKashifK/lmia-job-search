/**
 * BC PNP (British Columbia Provincial Nominee Program) Calculation Logic
 * Uses the Skills Immigration Registration System (SIRS) scoring.
 */

export interface BCPointsInputs {
    yearsRelatedExp: string;
    bcExperienceBonus: string;
    educationLevel: string;
    bcEducationBonus: string;
    canadaEducationBonus: string;
    professionalDesignationBonus: string;
    engCLB: string;
    freCLB: string;
    wageRange: string;
    region: string;
    regionalExperienceBonus: string;
}

const RELATED_EXP_POINTS: Record<string, number> = {
    ">=60": 20,
    "48-59": 16,
    "36-47": 12,
    "24-35": 8,
    "12-23": 4,
    "<12": 1,
};

const EDUCATION_POINTS: Record<string, number> = {
    doctoral: 27,
    masters: 22,
    postGrad: 15,
    bachelors: 15,
    associate: 5,
    diploma: 5,
    highSchool: 0,
};

const WAGE_POINTS: Record<string, number> = {
    "<16": 0,
    "16-19.9": 5,
    "20-24.9": 15,
    "25-29.9": 25,
    "30-34.9": 35,
    ">=35": 55,
};

const REGION_POINTS: Record<string, number> = {
    metro: 0,
    secondary: 5,
    other: 15,
};

const getCLBScore = (clb: number) => {
    if (clb >= 9) return 30;
    if (clb === 8) return 25;
    if (clb === 7) return 20;
    if (clb === 6) return 15;
    if (clb === 5) return 10;
    if (clb === 4) return 5;
    return 0;
};

export function calculateBCScore(values: BCPointsInputs) {
    // 1. Work Experience
    const workExpBase = RELATED_EXP_POINTS[values.yearsRelatedExp] || 0;
    const bcExpBonus = values.bcExperienceBonus === "yes" ? 10 : 0;
    const workScore = workExpBase + bcExpBonus;

    // 2. Education
    const eduBase = EDUCATION_POINTS[values.educationLevel] || 0;
    const eduBonus = 
        (values.bcEducationBonus === "yes" ? 8 : 0) +
        (values.canadaEducationBonus === "yes" ? 6 : 0) +
        (values.professionalDesignationBonus === "yes" ? 5 : 0);
    const educationScore = eduBase + eduBonus;

    // 3. Language
    const eng = getCLBScore(parseInt(values.engCLB || "0", 10));
    const fre = getCLBScore(parseInt(values.freCLB || "0", 10));
    const bilBonus = (eng >= 4 && fre >= 4) ? 10 : 0;
    const langScore = Math.min(eng + fre + bilBonus, 40);

    // 4. Wage
    const wageScore = WAGE_POINTS[values.wageRange] || 0;

    // 5. Region
    const regionBase = REGION_POINTS[values.region] || 0;
    const regBonus = values.regionalExperienceBonus === "yes" ? 10 : 0;
    const regionScore = regionBase + regBonus;

    const breakdown = {
        work: workScore,
        education: educationScore,
        language: langScore,
        wage: wageScore,
        region: regionScore
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { total, breakdown };
}
