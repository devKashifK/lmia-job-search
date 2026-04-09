/**
 * Manitoba PNP (Provincial Nominee Program) Calculation Logic
 */

export interface ManitobaInputs {
    firstLangCLB: string;
    secondLangCLB: string;
    age: string;
    yearsExperience: string;
    educationLevel: string;
    relativeManitoba: string;
    invitation: string;
    mbWorkExp: string;
    mbEdu2: string;
    mbEdu1: string;
    friendDistant: string;
    outsideWinnipeg: string;
}

const scoreFirstLang = (clb: number) => {
    if (clb >= 8) return 20;
    if (clb === 7) return 18;
    if (clb === 6) return 16;
    if (clb === 5) return 14;
    if (clb === 4) return 12;
    return 0;
};

const scoreSecondLang = (clb: number) => (clb >= 5 ? 5 : 0);

const scoreAge = (age: number) => {
    if (age === 18) return 4;
    if (age === 19) return 6;
    if (age === 20) return 8;
    if (age >= 21 && age <= 45) return 10;
    if (age === 46) return 8;
    if (age === 47) return 6;
    if (age === 48) return 4;
    if (age === 49) return 2;
    return 0;
};

const scoreExperience = (years: number) => {
    if (years >= 4) return 15;
    if (years === 3) return 12;
    if (years === 2) return 10;
    if (years === 1) return 8;
    return 0;
};

const scoreEducation = (key: string) => {
    switch (key) {
        case "masters": return 25;
        case "twoPrograms": return 23;
        case "oneProgram2": return 20;
        case "oneProgram1":
        case "trade": return 14;
        default: return 0;
    }
};

export function calculateManitobaScore(values: ManitobaInputs) {
    const breakdown = {
        firstLanguage: scoreFirstLang(Number(values.firstLangCLB)),
        secondLanguage: scoreSecondLang(Number(values.secondLangCLB)),
        age: scoreAge(Number(values.age)),
        experience: scoreExperience(Number(values.yearsExperience)),
        education: scoreEducation(values.educationLevel),
        adaptability: (
            (values.relativeManitoba === "yes" ? 20 : 0) +
            (values.invitation === "yes" ? 20 : 0) +
            (values.mbWorkExp === "yes" ? 12 : 0) +
            (values.mbEdu2 === "yes" ? 12 : 0) +
            (values.mbEdu1 === "yes" ? 10 : 0) +
            (values.friendDistant === "yes" ? 10 : 0) +
            (values.outsideWinnipeg === "yes" ? 5 : 0)
        )
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { total, breakdown };
}
