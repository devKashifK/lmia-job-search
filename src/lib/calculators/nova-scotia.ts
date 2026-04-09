/**
 * Nova Scotia PNP (Provincial Nominee Program) Calculation Logic
 */

export interface NovaScotiaInputs {
    educationLevel: string;
    firstLangCLB: string;
    secondLangCLB: string;
    workExperience: string;
    age: string;
    arrangedEmployment: string;
    pastWork: string;
    pastStudy: string;
    pastWorkSpouse: string;
    pastStudySpouse: string;
    relativeInNS: string;
    spouseLanguage: string;
}

const scoreEducation = (key: string) => {
    switch (key) {
        case "doctoral": return 25;
        case "masters": return 23;
        case "twoPrograms": return 22;
        case "threeYear": return 21;
        case "twoYear": return 19;
        case "oneYear": return 15;
        case "secondary": return 5;
        default: return 0;
    }
};

const scoreFirstLang = (level: string) => {
    switch (level) {
        case "intermediate": return 16;
        case "highIntermediate": return 20;
        case "advanced": return 24;
        case "spouseCLB4": return 5;
        default: return 0;
    }
};

const scoreExperience = (exp: string) => {
    switch (exp) {
        case "1": return 9;
        case "2-3": return 11;
        case "4-5": return 13;
        case "6+": return 15;
        default: return 0;
    }
};

const scoreAge = (age: string) => {
    const map: Record<string, number> = {
        "18–35": 12, "36": 11, "37": 10, "38": 9, "39": 8, "40": 7, "41": 6, "42": 5, "43": 4, "44": 3, "45": 2, "46": 1, "47+": 0
    };
    return map[age] ?? 0;
};

export function calculateNovaScotiaScore(values: NovaScotiaInputs) {
    const adaptabilityPoints = (
        (values.pastWork === "yes" ? 10 : 0) +
        (values.pastStudy === "yes" ? 5 : 0) +
        (values.pastWorkSpouse === "yes" ? 5 : 0) +
        (values.pastStudySpouse === "yes" ? 5 : 0) +
        (values.relativeInNS === "yes" ? 5 : 0) +
        (values.spouseLanguage === "yes" ? 5 : 0)
    );

    const breakdown = {
        education: scoreEducation(values.educationLevel),
        firstLanguage: scoreFirstLang(values.firstLangCLB),
        secondLanguage: (values.secondLangCLB === "clb5All" ? 4 : 0),
        experience: scoreExperience(values.workExperience),
        age: scoreAge(values.age),
        arranged: (values.arrangedEmployment === "yes" ? 10 : 0),
        adaptability: Math.min(adaptabilityPoints, 10)
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { total, breakdown };
}
