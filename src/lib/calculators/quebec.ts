/**
 * Quebec QSWP Calculation Logic
 */

export interface QuebecInputs {
    educationLevel: string;
    fieldOfTraining: string;
    yearsExperience: string;
    age: string;
    frenchLevel: string;
    englishLevel: string;
    jobOffer: string;
}

export function calculateQuebecScore(values: QuebecInputs) {
    const age = parseInt(values.age);
    let ageScore = 0;
    if (age >= 18 && age <= 35) ageScore = 16;
    else if (age > 35 && age <= 43) ageScore = 16 - (age - 35) * 2;

    const frenchScore = parseInt(values.frenchLevel) || 0;
    const englishScore = parseInt(values.englishLevel) || 0;

    const breakdown = {
        age: ageScore,
        language: Math.min(frenchScore + englishScore, 22),
        education: values.educationLevel === "doctoral" ? 14 : 12,
        jobOffer: values.jobOffer === "yes" ? 10 : 0
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return { total, breakdown };
}
