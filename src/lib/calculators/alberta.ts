/**
 * Alberta AAIP (Provincial Nominee Program) Calculation Logic
 */

export interface AlbertaInputs {
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

export const ALBERTA_EDUCATION_MAP: Record<string, number> = {
    less: 0,
    secondary: 5,
    oneYear: 15,
    twoYear: 19,
    bachelors: 21,
    masters: 23,
    doctoral: 25,
};

export const ALBERTA_WORK_MAP: Record<string, number> = {
    "0": 0,
    "1": 9,
    "2-3": 11,
    "4-5": 13,
    "6+": 15,
};

export function calculateAlbertaScore(values: AlbertaInputs) {
    // 1. Age
    const age = Number(values.age);
    let ageScore = 0;
    if (age >= 18 && age <= 35) ageScore = 12;
    else if (age >= 36 && age <= 47) ageScore = 12 - (age - 35);

    // 2. Language (First)
    const firstLangKeys = ["firstLangReading", "firstLangWriting", "firstLangListening", "firstLangSpeaking"] as const;
    const firstLangScore = firstLangKeys.reduce((sum, k) => {
        const val = Number(values[k]);
        if (val >= 9) return sum + 6;
        if (val === 8) return sum + 5;
        if (val === 7) return sum + 4;
        return sum;
    }, 0);

    // 3. Language (Second)
    const secondLangKeys = ["secondLangReading", "secondLangWriting", "secondLangListening", "secondLangSpeaking"] as const;
    const secondLangScore = secondLangKeys.reduce((sum, k) => {
        const val = Number(values[k]);
        return sum + (val >= 5 ? 1 : 0);
    }, 0);

    // 4. Education
    const educationScore = ALBERTA_EDUCATION_MAP[values.educationLevel] || 0;

    // 5. Work Experience
    const workScore = ALBERTA_WORK_MAP[values.workExperience] || 0;

    // 6. Arranged Employment
    const employmentScore = values.arrangedEmployment === "yes" ? 10 : 0;

    // 7. Adaptability
    const adaptabilityScore = values.adaptability === "yes" ? 10 : 0;

    const breakdown = {
        age: ageScore,
        firstLanguage: firstLangScore,
        secondLanguage: secondLangScore,
        education: educationScore,
        workExperience: workScore,
        arrangedEmployment: employmentScore,
        adaptability: adaptabilityScore,
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { total, breakdown };
}
