/**
 * Canada Federal Skilled Worker Program (FSWP) 67-Points Logic
 */

export interface Canada67Inputs {
    age: string;
    firstLangReading: string;
    firstLangWriting: string;
    firstLangListening: string;
    firstLangSpeaking: string;
    secondLangReading: string;
    secondLangWriting: string;
    secondLangListening: string;
    secondLangSpeaking: string;
    educationLevel: string;
    workExperience: string;
    arrangedEmployment: string;
    adaptability: string;
}

const EDUCATION_POINTS: Record<string, number> = {
    less: 0,
    secondary: 5,
    oneYear: 15,
    twoYear: 19,
    bachelors: 21,
    masters: 23,
    doctoral: 25,
};

const WORK_POINTS: Record<string, number> = {
    "0": 0,
    "1": 9,
    "2-3": 11,
    "4-5": 13,
    "6+": 15,
};

const firstLangRule = (clb: number) => {
    if (clb >= 9) return 6;
    if (clb === 8) return 5;
    if (clb === 7) return 4;
    return 0;
};

const secondLangRule = (clb: number) => (clb >= 5 ? 1 : 0);

export function calculateCanada67Score(values: Canada67Inputs) {
    // 1. Age
    const age = parseInt(values.age, 10);
    let ageScore = 0;
    if (age >= 18 && age <= 35) ageScore = 12;
    else if (age >= 36 && age <= 47) ageScore = 12 - (age - 35);

    // 2. Language (First)
    const firstLangKeys = ["firstLangReading", "firstLangWriting", "firstLangListening", "firstLangSpeaking"] as const;
    const firstLangScore = firstLangKeys.reduce((sum, k) => sum + firstLangRule(parseInt(values[k] || "0", 10)), 0);

    // 3. Language (Second)
    const secondLangKeys = ["secondLangReading", "secondLangWriting", "secondLangListening", "secondLangSpeaking"] as const;
    const secondLangScore = secondLangKeys.reduce((sum, k) => sum + secondLangRule(parseInt(values[k] || "0", 10)), 0);

    // 4. Education
    const educationScore = EDUCATION_POINTS[values.educationLevel] || 0;

    // 5. Work Experience
    const workScore = WORK_POINTS[values.workExperience] || 0;

    // 6. Arranged Employment
    const arrangedScore = values.arrangedEmployment === "yes" ? 10 : 0;

    // 7. Adaptability
    const adaptabilityScore = values.adaptability === "yes" ? 10 : 0;

    const breakdown = {
        age: ageScore,
        firstLanguage: firstLangScore,
        secondLanguage: secondLangScore,
        education: educationScore,
        workExperience: workScore,
        arrangedEmployment: arrangedScore,
        adaptability: adaptabilityScore,
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { total, breakdown };
}
