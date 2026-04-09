import React from 'react';
import { CalculatorConfig } from '../shared/calculator-page';
import { calculateAlbertaScore } from '@/lib/calculators/alberta';
import { ALBERTA_AAIP_POINTS_BREAKDOWN_SECTIONS } from '@/lib/calculators/constants';
import { Star, Briefcase, GraduationCap, Users, MapPin, Award } from 'lucide-react';

const clbOptions = [4, 5, 6, 7, 8, 9, 10].map((n) => ({
  label: `CLB ${n}`,
  value: `${n}`,
}));

const yesNo = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const ALBERTA_CONFIG: CalculatorConfig = {
    id: 'alberta',
    title: 'Alberta AAIP',
    badgeText: 'PNP Express Entry',
    description: 'Evaluate your eligibility for the Alberta Advantage Immigration Program (AAIP).',
    calculate: calculateAlbertaScore,
    breakdownSections: ALBERTA_AAIP_POINTS_BREAKDOWN_SECTIONS,
    stats: [
        {
            icon: "Star",
            value: 100,
            suffix: "%",
            label: "Free eligibility check",
            bgColor: "bg-green-100",
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
            icon: <Star size={22} className="text-yellow-500" />,
            title: "Express Entry stream",
            description: "Receive 600 additional CRS points for a provincial nomination.",
            iconBg: "bg-yellow-100",
        },
        {
            icon: <Briefcase size={22} className="text-green-600" />,
            title: "Multiple Streams",
            description: "Choose from Alberta Opportunity, Rural Renewal, and Graduate Entrepreneur streams.",
            iconBg: "bg-green-100",
        }
    ],
    formPages: [
        [
            {
                key: "age",
                label: "Age",
                description: "Enter your age in years on the date of application.",
                type: "input",
            },
            {
                key: "educationLevel",
                label: "Highest Education",
                description: "Recognized levels by IRCC/AAIP.",
                type: "select",
                options: [
                    { label: "Less than secondary", value: "less" },
                    { label: "Secondary diploma", value: "secondary" },
                    { label: "One-year post-secondary", value: "oneYear" },
                    { label: "Two-year post-secondary", value: "twoYear" },
                    { label: "Bachelor’s degree", value: "bachelors" },
                    { label: "Master’s degree", value: "masters" },
                    { label: "Doctoral (PhD)", value: "doctoral" },
                ],
            },
        ],
        [
            {
                key: "firstLangReading",
                label: "First Lang - Reading",
                type: "select",
                options: clbOptions,
            },
            {
                key: "firstLangWriting",
                label: "First Lang - Writing",
                type: "select",
                options: clbOptions,
            },
            {
                key: "firstLangListening",
                label: "First Lang - Listening",
                type: "select",
                options: clbOptions,
            },
            {
                key: "firstLangSpeaking",
                label: "First Lang - Speaking",
                type: "select",
                options: clbOptions,
            },
        ],
        [
            {
                key: "arrangedEmployment",
                label: "Valid Job Offer in Alberta",
                description: "Job offer from an Alberta employer supported by LMIA.",
                type: "select",
                options: yesNo,
            },
            {
                key: "adaptability",
                label: "Adaptability Factors",
                description: "Previous work, study, or close relatives in Alberta.",
                type: "select",
                options: yesNo,
            },
            {
                key: "workExperience",
                label: "Years of Skilled Work Experience",
                type: "select",
                options: [
                    { label: "<1 year", value: "0" },
                    { label: "1 year", value: "1" },
                    { label: "2–3 years", value: "2-3" },
                    { label: "4–5 years", value: "4-5" },
                    { label: "6+ years", value: "6+" },
                ],
            },
        ]
    ]
};
