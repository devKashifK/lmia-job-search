import React from 'react';
import { CalculatorConfig } from '../shared/calculator-page';
import { calculateNovaScotiaScore } from '@/lib/calculators/nova-scotia';
import { NOVA_SCOTIA_POINTS_BREAKDOWN_SECTIONS } from '@/lib/calculators/constants';
import { MapPin, GraduationCap, Briefcase, Users, Star } from 'lucide-react';

const yesNo = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const NOVA_SCOTIA_CONFIG: CalculatorConfig = {
    id: 'nova-scotia',
    title: 'Nova Scotia PNP',
    badgeText: 'Skilled Worker Stream',
    description: "Check eligibility for Nova Scotia's Labour Market Priorities and Skilled Worker streams.",
    calculate: calculateNovaScotiaScore,
    breakdownSections: NOVA_SCOTIA_POINTS_BREAKDOWN_SECTIONS,
    stats: [
        {
            icon: "MapPin",
            value: 67,
            suffix: "/100",
            label: "Pass Mark",
            bgColor: "bg-rose-100",
            placeholderValue: "67/100",
        },
        {
            icon: "Star",
            value: 10,
            suffix: " max",
            label: "Adaptability",
            bgColor: "bg-yellow-100",
            placeholderValue: "10 max",
        }
    ],
    features: [
        {
            icon: <MapPin size={22} className="text-rose-600" />,
            title: "Ocean Advantage",
            description: "Targeted streams for healthcare, construction, and early childhood educators.",
            iconBg: "bg-rose-100",
        },
        {
            icon: <Star size={22} className="text-yellow-600" />,
            title: "Labour Market Priorities",
            description: "Direct invitations from the Express Entry pool based on market needs.",
            iconBg: "bg-yellow-100",
        }
    ],
    formPages: [
        [
            {
                key: "educationLevel",
                label: "Highest Education",
                type: "select",
                options: [
                    { label: "Doctoral Degree", value: "doctoral" },
                    { label: "Master’s Degree", value: "masters" },
                    { label: "Two or more post-secondary programs", value: "twoPrograms" },
                    { label: "Bachelor’s degree (3+ years)", value: "threeYear" },
                    { label: "Two-year post-secondary", value: "twoYear" },
                    { label: "One-year post-secondary", value: "oneYear" },
                    { label: "Secondary diploma", value: "secondary" },
                ],
            },
            {
                key: "age",
                label: "Age range",
                type: "select",
                options: [
                    { label: "18–35 years", value: "18–35" },
                    { label: "36 years", value: "36" },
                    { label: "37 years", value: "37" },
                    { label: "38 years", value: "38" },
                    { label: "39 years", value: "39" },
                    { label: "40 years", value: "40" },
                    { label: "41 years", value: "41" },
                    { label: "42 years", value: "42" },
                    { label: "43 years", value: "43" },
                ],
            },
        ],
        [
            {
                key: "firstLangCLB",
                label: "First Language Ability",
                type: "select",
                options: [
                    { label: "Advanced (CLB 9+)", value: "advanced" },
                    { label: "High Intermediate (CLB 8)", value: "highIntermediate" },
                    { label: "Intermediate (CLB 7)", value: "intermediate" },
                ],
            },
            {
                key: "workExperience",
                label: "Skilled Work Experience",
                type: "select",
                options: [
                    { label: "6+ years", value: "6+" },
                    { label: "4–5 years", value: "4-5" },
                    { label: "2–3 years", value: "2-3" },
                    { label: "1 year", value: "1" },
                ],
            },
        ],
        [
            {
                key: "arrangedEmployment",
                label: "Arranged Employment in NS",
                type: "select",
                options: yesNo,
            },
            {
                key: "relativeInNS",
                label: "Close Relative in Nova Scotia",
                type: "select",
                options: yesNo,
            },
        ]
    ]
};
