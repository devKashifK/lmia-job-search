/**
 * SINP (Saskatchewan Immigrant Nominee Program) Calculation Logic
 */

export interface SINPInputs {
    educationLevel: string;
    skilledExpRecent: string;
    skilledExpOlder: string;
    firstLangCLB: string;
    secondLangCLB: string;
    ageRange: string;
    jobOffer: string;
    relative: string;
    pastWork: string;
    pastStudy: string;
}

const EDUCATION_POINTS: Record<string, number> = {
    doctoral: 23, masters: 23, uni3yr: 20, trade: 20, diploma2: 15, cert1: 12, secondary: 0,
};

const RECENT_EXP_POINTS: Record<string, number> = {
    "5": 10, "4": 8, "3": 6, "2": 4, "1": 2,
};

const OLDER_EXP_POINTS: Record<string, number> = {
    "5": 5, "4": 4, "3": 3, "2": 2, "<1": 0,
};

const FIRST_LANG_POINTS: Record<string, number> = {
    "8": 20, "7": 18, "6": 16, "5": 14, "4": 12,
};

const SECOND_LANG_POINTS: Record<string, number> = {
    "8": 10, "7": 8, "6": 6, "5": 4, "4": 2,
};

const AGE_POINTS: Record<string, number> = {
    "<18": 0, "18-21": 8, "22-34": 12, "35-45": 10, "46-50": 8, ">50": 0,
};

export function calculateSINPScore(values: SINPInputs) {
    const educationScore = EDUCATION_POINTS[values.educationLevel] || 0;
    const workScore = (RECENT_EXP_POINTS[values.skilledExpRecent] || 0) + (OLDER_EXP_POINTS[values.skilledExpOlder] || 0);
    const firstLangScore = FIRST_LANG_POINTS[values.firstLangCLB] || 0;
    const secondLangScore = SECOND_LANG_POINTS[values.secondLangCLB] || 0;
    const ageScore = AGE_POINTS[values.ageRange] || 0;
    
    const connectionScore = (
        (values.jobOffer === "yes" ? 30 : 0) +
        (values.relative === "yes" ? 20 : 0) +
        (values.pastWork === "yes" ? 5 : 0) +
        (values.pastStudy === "yes" ? 5 : 0)
    );

    const breakdown = {
        education: educationScore,
        work: workScore,
        firstLanguage: firstLangScore,
        secondLanguage: secondLangScore,
        age: ageScore,
        connection: connectionScore
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { total, breakdown };
}
