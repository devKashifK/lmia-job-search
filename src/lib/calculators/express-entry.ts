/**
 * Express Entry CRS (Comprehensive Ranking System) Calculation Logic
 * production-ready module based on IRCC guidelines.
 */

export interface CRSInputs {
  maritalStatus: string;
  spouseCitizen: string;
  spouseComing: string;
  age: string;
  educationLevel: string;
  hasCanadianEducation: string;
  canadianEducationLevel: string;
  languageTestValid: string;
  firstLangSpeaking: string;
  firstLangListening: string;
  firstLangReading: string;
  firstLangWriting: string;
  otherResults: string;
  secondLangSpeaking: string;
  secondLangListening: string;
  secondLangReading: string;
  secondLangWriting: string;
  canadianExperience: string;
  foreignExperience: string;
  certificateQualification: string;
  jobOffer: string;
  jobOfferNocLevel: string;
  hasPNP: string;
  siblingInCanada: string;
  spouseEducation: string;
  spouseCanadianExperience: string;
  spouseLangSpeaking: string;
  spouseLangListening: string;
  spouseLangReading: string;
  spouseLangWriting: string;
}

const ageTable = {
  single: [
    { min: 18, max: 18, pts: 99 },
    { min: 19, max: 19, pts: 105 },
    { min: 20, max: 29, pts: 110 },
    { min: 30, max: 30, pts: 105 },
    { min: 31, max: 31, pts: 99 },
    { min: 32, max: 32, pts: 94 },
    { min: 33, max: 33, pts: 88 },
    { min: 34, max: 34, pts: 83 },
    { min: 35, max: 35, pts: 77 },
    { min: 36, max: 36, pts: 72 },
    { min: 37, max: 37, pts: 66 },
    { min: 38, max: 38, pts: 61 },
    { min: 39, max: 39, pts: 55 },
    { min: 40, max: 40, pts: 50 },
    { min: 41, max: 41, pts: 39 },
    { min: 42, max: 42, pts: 28 },
    { min: 43, max: 43, pts: 17 },
    { min: 44, max: 44, pts: 6 },
    { min: 45, max: 100, pts: 0 },
  ],
  spouse: [
    { min: 18, max: 18, pts: 90 },
    { min: 19, max: 19, pts: 95 },
    { min: 20, max: 29, pts: 100 },
    { min: 30, max: 30, pts: 95 },
    { min: 31, max: 31, pts: 90 },
    { min: 32, max: 32, pts: 85 },
    { min: 33, max: 33, pts: 80 },
    { min: 34, max: 34, pts: 75 },
    { min: 35, max: 35, pts: 70 },
    { min: 36, max: 36, pts: 65 },
    { min: 37, max: 37, pts: 60 },
    { min: 38, max: 38, pts: 55 },
    { min: 39, max: 39, pts: 50 },
    { min: 40, max: 40, pts: 45 },
    { min: 41, max: 41, pts: 35 },
    { min: 42, max: 42, pts: 25 },
    { min: 43, max: 43, pts: 15 },
    { min: 44, max: 44, pts: 5 },
    { min: 45, max: 100, pts: 0 },
  ],
};

const educationTable = {
  single: {
    less: 0,
    diploma: 98,
    bachelorsPlus: 120,
    masters: 135,
    doctoral: 150
  },
  spouse: {
    less: 0,
    diploma: 91,
    bachelorsPlus: 112,
    masters: 126,
    doctoral: 140
  },
};

const firstLangTable = {
  single: [
    { clb: 4, pts: 6 },
    { clb: 5, pts: 6 },
    { clb: 6, pts: 9 },
    { clb: 7, pts: 17 },
    { clb: 8, pts: 23 },
    { clb: 9, pts: 31 },
    { clb: 10, pts: 34 },
  ],
  spouse: [
    { clb: 4, pts: 6 },
    { clb: 5, pts: 6 },
    { clb: 6, pts: 8 },
    { clb: 7, pts: 16 },
    { clb: 8, pts: 22 },
    { clb: 9, pts: 29 },
    { clb: 10, pts: 32 },
  ],
};

const canadianExpTable = {
  single: [
    { years: 1, pts: 40 },
    { years: 2, pts: 53 },
    { years: 3, pts: 64 },
    { years: 4, pts: 72 },
    { years: 5, pts: 80 },
  ],
  spouse: [
    { years: 1, pts: 35 },
    { years: 2, pts: 46 },
    { years: 3, pts: 56 },
    { years: 4, pts: 63 },
    { years: 5, pts: 70 },
  ],
};

const spouseEducationTable: Record<string, number> = {
  none: 0,
  secondary: 2,
  oneYear: 6,
  twoYear: 7,
  bachelors: 8,
  multiDiploma: 9,
  masters: 10,
  doctoral: 10,
};

function getMaritalType(maritalStatus: string, spouseCitizen: string, spouseComing: string) {
  if (maritalStatus === 'single' || maritalStatus === 'divorced' || maritalStatus === 'widowed' || maritalStatus === 'annulled') return 'single';
  if (spouseCitizen === 'yes' || spouseComing === 'no') return 'single';
  return 'spouse';
}

function hasAllAtLeast(arr: number[], n: number) {
  return arr.every((v) => v >= n);
}
function hasAnyAtLeast(arr: number[], n: number) {
  return arr.some((v) => v >= n);
}

export function calculateExpressEntryScore(values: CRSInputs) {
    const maritalType = getMaritalType(values.maritalStatus, values.spouseCitizen, values.spouseComing);
    const isSpouse = maritalType === 'spouse';
    
    let total = 0;
    const breakdown: any = {};

    // 1. Age
    const age = parseInt(values.age) || 0;
    const ageTableType = ageTable[maritalType];
    let agePts = 0;
    for (const row of ageTableType) {
        if (age >= row.min && age <= row.max) {
            agePts = row.pts;
            break;
        }
    }
    total += agePts;
    breakdown.age = agePts;

    // 2. Education
    const eduPts = (educationTable[maritalType] as any)[values.educationLevel] || 0;
    total += eduPts;
    breakdown.education = eduPts;

    // 3. Language
    const fLang = [
        parseInt(values.firstLangSpeaking) || 0,
        parseInt(values.firstLangListening) || 0,
        parseInt(values.firstLangReading) || 0,
        parseInt(values.firstLangWriting) || 0
    ];
    let fLangPts = 0;
    fLang.forEach(clb => {
        const row = firstLangTable[maritalType].find(r => clb >= 10 ? r.clb === 10 : r.clb === clb);
        fLangPts += row ? row.pts : (clb >= 4 ? 6 : 0);
    });
    total += fLangPts;
    breakdown.firstLanguage = fLangPts;

    // 4. Canadian Experience
    const canExpY = parseInt(values.canadianExperience) || 0;
    let canExpPts = 0;
    if (canExpY > 0) {
        const row = canadianExpTable[maritalType].find(r => canExpY >= 5 ? r.years === 5 : r.years === canExpY);
        canExpPts = row ? row.pts : 0;
    }
    total += canExpPts;
    breakdown.canadianExperience = canExpPts;

    // 5. Spouse Factors
    if (isSpouse) {
        const spEduPts = spouseEducationTable[values.spouseEducation] || 0;
        total += spEduPts;
        breakdown.spouseEducation = spEduPts;

        const spLang = [
            parseInt(values.spouseLangSpeaking) || 0,
            parseInt(values.spouseLangListening) || 0,
            parseInt(values.spouseLangReading) || 0,
            parseInt(values.spouseLangWriting) || 0
        ];
        let spLangPts = 0;
        spLang.forEach(clb => {
            if (clb >= 9) spLangPts += 5;
            else if (clb >= 7) spLangPts += 3;
            else if (clb >= 5) spLangPts += 1;
        });
        total += spLangPts;
        breakdown.spouseLanguage = Math.min(spLangPts, 20);

        const spCanExpY = parseInt(values.spouseCanadianExperience) || 0;
        let spCanExpPts = 0;
        if (spCanExpY >= 5) spCanExpPts = 10;
        else if (spCanExpY === 4) spCanExpPts = 9;
        else if (spCanExpY === 3) spCanExpPts = 8;
        else if (spCanExpY === 2) spCanExpPts = 7;
        else if (spCanExpY === 1) spCanExpPts = 5;
        total += spCanExpPts;
        breakdown.spouseCanadianExperience = spCanExpPts;
    }

    // 6. Transferability
    const transfers: number[] = [];
    // Edu + Lang
    if (values.educationLevel !== 'less' && hasAllAtLeast(fLang, 7)) {
        if (values.educationLevel === 'masters' || values.educationLevel === 'doctoral') transfers.push(hasAllAtLeast(fLang, 9) ? 50 : 25);
        else transfers.push(hasAllAtLeast(fLang, 9) ? 25 : 13);
    }
    // Edu + CanExp
    if (values.educationLevel !== 'less' && canExpY >= 1) {
        if (values.educationLevel === 'masters' || values.educationLevel === 'doctoral') transfers.push(canExpY >= 2 ? 50 : 25);
        else transfers.push(canExpY >= 2 ? 25 : 13);
    }
    // Foreign Exp + Lang
    const forExpY = parseInt(values.foreignExperience) || 0;
    if (forExpY >= 1 && hasAllAtLeast(fLang, 7)) {
        if (forExpY >= 3) transfers.push(hasAllAtLeast(fLang, 9) ? 50 : 25);
        else transfers.push(hasAllAtLeast(fLang, 9) ? 25 : 13);
    }
    // Foreign Exp + CanExp
    if (forExpY >= 1 && canExpY >= 1) {
        if (forExpY >= 3 && canExpY >= 2) transfers.push(50);
        else if (forExpY >= 3 || canExpY >= 2) transfers.push(25);
        else transfers.push(13);
    }
    // Trade + Lang
    if (values.certificateQualification === 'yes' && hasAllAtLeast(fLang, 5)) {
        transfers.push(hasAllAtLeast(fLang, 7) ? 50 : 25);
    }

    const transferTotal = transfers.sort((a,b) => b-a).slice(0, 2).reduce((a,b) => a+b, 0);
    total += Math.min(transferTotal, 100);
    breakdown.transferability = Math.min(transferTotal, 100);

    // 7. Additional Factors
    const pnp = values.hasPNP === 'yes' ? 600 : 0;
    const offer = values.jobOffer === 'yes' ? (values.jobOfferNocLevel === '0' ? 200 : 50) : 0;
    const study = values.hasCanadianEducation === 'yes' ? (values.canadianEducationLevel === 'bachelorsPlus' ? 30 : 15) : 0;
    const sibling = values.siblingInCanada === 'yes' ? 15 : 0;
    
    // French bonus
    let french = 0;
    const sLang = [
        parseInt(values.secondLangSpeaking) || 0,
        parseInt(values.secondLangListening) || 0,
        parseInt(values.secondLangReading) || 0,
        parseInt(values.secondLangWriting) || 0
    ];
    if (hasAllAtLeast(sLang, 7)) {
        french = hasAllAtLeast(fLang, 5) ? 50 : 25;
    }

    const additionalTotal = Math.min(600, pnp + offer + study + sibling + french);
    total += additionalTotal;
    breakdown.additionalFactors = additionalTotal;

    return { total, breakdown };
}
