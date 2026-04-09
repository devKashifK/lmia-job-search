import React from 'react';
import { CalculatorConfig } from '../shared/calculator-page';
import { calculateExpressEntryScore } from '@/lib/calculators/express-entry';
import { FSW_67_BREAKDOWN_SECTIONS } from '@/lib/calculators/constants';
import { Star, Clock, Languages, Briefcase, Landmark, BookOpen, Users, BadgeCheck } from 'lucide-react';

const clbOptions = [
    { label: "CLB 0", value: "0" },
    { label: "CLB 1", value: "1" },
    { label: "CLB 2", value: "2" },
    { label: "CLB 3", value: "3" },
    { label: "CLB 4", value: "4" },
    { label: "CLB 5", value: "5" },
    { label: "CLB 6", value: "6" },
    { label: "CLB 7", value: "7" },
    { label: "CLB 8", value: "8" },
    { label: "CLB 9", value: "9" },
    { label: "CLB 10+", value: "10" },
];

const yesNo = [
    { label: "No", value: "no" },
    { label: "Yes", value: "yes" },
];

const ageOptions = Array.from({ length: 82 }, (_, i) => ({
    label: `${18 + i}`,
    value: `${18 + i}`
}));

export const EXPRESS_ENTRY_CONFIG: CalculatorConfig = {
    id: 'express-entry',
    title: 'Express Entry CRS',
    badgeText: 'Federal Skilled Worker',
    description: 'Calculate your Comprehensive Ranking System (CRS) score for Canadian Express Entry.',
    calculate: calculateExpressEntryScore,
    breakdownSections: FSW_67_BREAKDOWN_SECTIONS, // Reusing FSW sections for layout, or I can define new ones
    stats: [
        {
            icon: "Star",
            value: 100,
            suffix: "%",
            label: "Free eligibility check",
            bgColor: "bg-amber-100",
            placeholderValue: "100%",
        },
        {
            icon: "Clock",
            value: 60,
            suffix: " SEC",
            label: "Instant scoring",
            bgColor: "bg-blue-100",
            placeholderValue: "60 SEC",
        }
    ],
    features: [
        {
            icon: <Languages size={22} className="text-blue-600" />,
            title: "Optimize Language",
            description: "Achieving CLB 9 can add up to 136 points to your profile.",
            iconBg: "bg-blue-100",
        },
        {
            icon: <Landmark size={22} className="text-yellow-600" />,
            title: "Provincial Nomination",
            description: "A provincial nomination adds 600 points instantly.",
            iconBg: "bg-yellow-100",
        }
    ],
    formPages: [
        // Page 1: Marital & Age
        [
            {
                key: "maritalStatus",
                label: "Marital Status",
                type: "select",
                options: [
                    { label: "Never Married / Single", value: "single" },
                    { label: "Married", value: "married" },
                    { label: "Common-Law", value: "commonLaw" },
                    { label: "Divorced / Separated", value: "divorced" },
                    { label: "Widowed", value: "widowed" },
                ],
            },
            {
                key: "spouseCitizen",
                label: "Is spouse a Canadian Citizen/PR?",
                type: "select",
                options: yesNo,
            },
            {
                key: "spouseComing",
                label: "Will spouse accompany you?",
                type: "select",
                options: yesNo,
            },
            {
                key: "age",
                label: "Your Age",
                type: "select",
                options: ageOptions,
            },
        ],
        // Page 2: Education
        [
            {
                key: "educationLevel",
                label: "Level of Education",
                type: "select",
                options: [
                    { label: "Secondary (high school) or less", value: "less" },
                    { label: "One- or two-year diploma", value: "diploma" },
                    { label: "Bachelors / Three-year degree", value: "bachelorsPlus" },
                    { label: "Masters degree", value: "masters" },
                    { label: "Doctoral (PhD)", value: "doctoral" },
                ],
            },
            {
                key: "hasCanadianEducation",
                label: "Earned a Canadian credential?",
                type: "select",
                options: yesNo,
            },
            {
                key: "canadianEducationLevel",
                label: "Canadian Education Level",
                type: "select",
                options: [
                    { label: "One or two years", value: "oneTwoYear" },
                    { label: "Three years or more", value: "bachelorsPlus" },
                ],
            },
        ],
        // Page 3: First Language
        [
            { key: "firstLangSpeaking", label: "Speaking (First)", type: "select", options: clbOptions },
            { key: "firstLangListening", label: "Listening (First)", type: "select", options: clbOptions },
            { key: "firstLangReading", label: "Reading (First)", type: "select", options: clbOptions },
            { key: "firstLangWriting", label: "Writing (First)", type: "select", options: clbOptions },
        ],
        // Page 4: Work Experience
        [
            {
                key: "canadianExperience",
                label: "Canadian Experience (Years)",
                type: "select",
                options: [
                    { label: "None / <1 year", value: "0" },
                    { label: "1 year", value: "1" },
                    { label: "2 years", value: "2" },
                    { label: "3 years", value: "3" },
                    { label: "4 years", value: "4" },
                    { label: "5+ years", value: "5" },
                ],
            },
            {
                key: "foreignExperience",
                label: "Foreign Experience (Years)",
                type: "select",
                options: [
                    { label: "None / <1 year", value: "0" },
                    { label: "1 year", value: "1" },
                    { label: "2 years", value: "2" },
                    { label: "3+ years", value: "3" },
                ],
            },
            {
                key: "certificateQualification",
                label: "Certificate of Qualification?",
                type: "select",
                options: yesNo,
            },
        ],
        // Page 5: Job Offer & PNP
        [
            {
                key: "jobOffer",
                label: "Valid Job Offer?",
                type: "select",
                options: yesNo,
            },
            {
                key: "jobOfferNocLevel",
                label: "Job Offer NOC TEER",
                type: "select",
                options: [
                    { label: "TEER 0 Major Group 00", value: "0" },
                    { label: "Other TEER 0, 1, 2, 3", value: "123" },
                ],
            },
            {
                key: "hasPNP",
                label: "Provincial Nomination?",
                type: "select",
                options: yesNo,
            },
            {
                key: "siblingInCanada",
                label: "Sibling in Canada (PR/Citizen)?",
                type: "select",
                options: yesNo,
            },
        ],
        // Page 6: Spouse Factors (Simplified)
        [
            {
                key: "spouseEducation",
                label: "Spouse Education",
                type: "select",
                options: [
                    { label: "Secondary or less", value: "secondary" },
                    { label: "Bachelors degree", value: "bachelors" },
                    { label: "Masters degree", value: "masters" },
                    { label: "Doctoral (PhD)", value: "doctoral" },
                ],
            },
            {
                key: "spouseCanadianExperience",
                label: "Spouse Canadian Exp",
                type: "select",
                options: [
                    { label: "None", value: "0" },
                    { label: "1 year", value: "1" },
                    { label: "2 years", value: "2" },
                    { label: "3+ years", value: "3" },
                ],
            },
            { key: "spouseLangSpeaking", label: "Spouse Speaking CLB", type: "select", options: clbOptions },
        ]
    ]
};
