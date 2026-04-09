import { PointsSection } from "@/components/ui/table-component-calculator";

/**
 * Breakdown Sections for Alberta AAIP
 */
export const ALBERTA_AAIP_POINTS_BREAKDOWN_SECTIONS: PointsSection[] = [
    {
        title: "Section 1: Education",
        maxPoints: 25,
        rows: [
            { label: "Doctoral degree (PhD)", points: 25 },
            { label: "Master's degree", points: 23 },
            { label: "Bachelor's degree or 3+ yr program", points: 21 },
            { label: "Two-year post-secondary credential", points: 19 },
            { label: "One-year post-secondary credential", points: 15 },
            { label: "Secondary diploma", points: 5 },
        ]
    },
    {
        title: "Section 2: Language Ability",
        maxPoints: 28,
        rows: [
            { label: "CLB 9 or higher (per ability)", points: 6 },
            { label: "CLB 8 (per ability)", points: 5 },
            { label: "CLB 7 (per ability)", points: 4 },
            { label: "Second Language (CLB 5+ per ability)", points: 1 },
        ]
    },
    {
        title: "Section 3: Work Experience",
        maxPoints: 15,
        rows: [
            { label: "6 years or more", points: 15 },
            { label: "4–5 years", points: 13 },
            { label: "2–3 years", points: 11 },
            { label: "1 year", points: 9 },
        ]
    },
    {
        title: "Section 4: Age",
        maxPoints: 12,
        rows: [
            { label: "18–35 years", points: 12 },
            { label: "36 years", points: 11 },
            { label: "47 years or older", points: 0 },
        ]
    }
];

/**
 * Breakdown Sections for Canada 67 Points (FSWP)
 */
export const FSW_67_BREAKDOWN_SECTIONS: PointsSection[] = [
    {
        title: "Factor 1: Language Skills",
        maxPoints: 28,
        rows: [
            { label: "First Official Language (Max)", points: 24 },
            { label: "Second Official Language (Max)", points: 4 },
        ]
    },
    {
        title: "Factor 2: Education",
        maxPoints: 25,
        rows: [
            { label: "University degree at doctoral level (PhD)", points: 25 },
            { label: "University degree at master's level", points: 23 },
            { label: "Two or more post-secondary credentials", points: 22 },
            { label: "Bachelor's degree (3+ years)", points: 21 },
        ]
    },
    {
        title: "Factor 3: Experience",
        maxPoints: 15,
        rows: [
            { label: "6 years or more", points: 15 },
            { label: "4–5 years", points: 13 },
            { label: "2–3 years", points: 11 },
            { label: "1 year", points: 9 },
        ]
    },
    {
        title: "Factor 4: Age",
        maxPoints: 12,
        rows: [
            { label: "Age 18–35 (maximum points)", points: 12 },
            { label: "Age 36", points: 11 },
            { label: "Age 47 and older", points: 0 },
        ]
    }
];

/**
 * Breakdown Sections for BC PNP (SIRS)
 */
export const BC_PNP_POINTS_BREAKDOWN_SECTIONS: PointsSection[] = [
    {
        title: "Economic Factors: Job Offer",
        maxPoints: 120,
        rows: [
            { label: "Directly Related Work Experience", points: 20 },
            { label: "Highest Level of Education", points: 27 },
            { label: "Language Proficiency (CLB 9+)", points: 30 },
        ]
    },
    {
        title: "Regional Factors",
        maxPoints: 25,
        rows: [
            { label: "Annual Wage of BC Job Offer", points: 55 },
            { label: "Region of Employment", points: 15 },
            { label: "Regional Alumni/Experience Bonus", points: 10 },
        ]
    }
];

/**
 * Breakdown Sections for Manitoba PNP
 */
export const MANITOBA_POINTS_BREAKDOWN_SECTIONS: PointsSection[] = [
    {
        title: "Factor 1: Language Proficiency",
        maxPoints: 25,
        rows: [
            { label: "CLB 8 or higher", points: 20 },
            { label: "CLB 7", points: 18 },
            { label: "CLB 6", points: 16 },
        ]
    },
    {
        title: "Factor 2: Age",
        maxPoints: 10,
        rows: [
            { label: "21–45 years", points: 10 },
            { label: "18 or 48 years", points: 4 },
        ]
    },
    {
        title: "Factor 3: Work Experience",
        maxPoints: 15,
        rows: [
            { label: "4 years or more", points: 15 },
            { label: "2 years", points: 10 },
        ]
    }
];

/**
 * Breakdown Sections for Nova Scotia PNP
 */
export const NOVA_SCOTIA_POINTS_BREAKDOWN_SECTIONS: PointsSection[] = [
    {
        title: "Education & Language",
        maxPoints: 53,
        rows: [
            { label: "Education (Maximum)", points: 25 },
            { label: "Language (Maximum)", points: 28 },
        ]
    },
    {
        title: "Experience & Adaptability",
        maxPoints: 47,
        rows: [
            { label: "Skilled Work Experience", points: 15 },
            { label: "Age (18–35)", points: 12 },
            { label: "Arranged Employment", points: 10 },
            { label: "Adaptability", points: 10 },
        ]
    }
];

/**
 * Breakdown Sections for SINP (Saskatchewan)
 */
export const SINP_POINTS_BREAKDOWN_SECTIONS: PointsSection[] = [
    {
        title: "Labor Market Success: Education & Exp",
        maxPoints: 70,
        rows: [
            { label: "Education", points: 23 },
            { label: "Skilled Work Experience", points: 15 },
            { label: "Language Ability", points: 30 },
            { label: "Age", points: 12 },
        ]
    },
    {
        title: "Connection to Saskatchewan",
        maxPoints: 30,
        rows: [
            { label: "Job Offer", points: 30 },
            { label: "Close Family Absolute", points: 20 },
            { label: "Past Work/Study in SK", points: 5 },
        ]
    }
];

/**
 * Breakdown Sections for Ontario PNP (OINP)
 */
export const ONTARIO_PNP_POINTS_BREAKDOWN_SECTIONS: PointsSection[] = [
    {
        title: "Education & NOC Level",
        maxPoints: 40,
        rows: [
            { label: "NOC TEER 0 or 1", points: 10 },
            { label: "Post-Secondary Education", points: 10 },
            { label: "Canadian Work Experience", points: 10 },
        ]
    },
    {
        title: "Job Offer & Location",
        maxPoints: 30,
        rows: [
            { label: "Job Offer Wage", points: 10 },
            { label: "Work Outside GTA", points: 10 },
            { label: "Strategic Priorities", points: 10 },
        ]
    }
];

/**
 * Breakdown Sections for Quebec QSWP
 */
export const QUEBEC_POINTS_BREAKDOWN_SECTIONS: PointsSection[] = [
    {
        title: "Formation et Expérience",
        maxPoints: 30,
        rows: [
            { label: "Niveau de Scolarité", points: 14 },
            { label: "Domaine de Formation", points: 12 },
            { label: "Expérience Professionnelle", points: 8 },
        ]
    },
    {
        title: "Facteurs Personnels",
        maxPoints: 50,
        rows: [
            { label: "Âge (18–35 ans)", points: 16 },
            { label: "Connaissances Linguistiques (Français)", points: 16 },
            { label: "Séjour et Famille au Québec", points: 8 },
            { label: "Offre d'Emploi Validée", points: 10 },
        ]
    }
];
