import React from 'react';
import { CalculatorConfig } from '../shared/calculator-page';
import { calculateManitobaScore } from '@/lib/calculators/manitoba';
import { MANITOBA_POINTS_BREAKDOWN_SECTIONS } from '@/lib/calculators/constants';
import { Users, GraduationCap, MapPin, Briefcase } from 'lucide-react';

const yesNo = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const MANITOBA_CONFIG: CalculatorConfig = {
    id: 'manitoba',
    title: 'Manitoba PNP',
    badgeText: 'Skilled Worker',
    description: 'Assessment for the Manitoba Provincial Nominee Program (MPNP).',
    calculate: calculateManitobaScore,
    breakdownSections: MANITOBA_POINTS_BREAKDOWN_SECTIONS,
    stats: [
        {
            icon: "Users",
            value: 20,
            suffix: " PTS",
            label: "Factor 5: Connection",
            bgColor: "bg-cyan-100",
            placeholderValue: "20 PTS",
        },
        {
            icon: "BadgeCheck",
            value: 60,
            suffix: " pass",
            label: "Min requirement",
            bgColor: "bg-emerald-100",
            placeholderValue: "60 pass",
        }
    ],
    features: [
        {
            icon: <Users size={22} className="text-cyan-600" />,
            title: "Strong Community",
            description: "Points for relatives or friends settled in Manitoba.",
            iconBg: "bg-cyan-100",
        },
        {
            icon: <MapPin size={22} className="text-rose-600" />,
            title: "Winnipeg vs Rural",
            description: "Additional points for choosing locations outside the city of Winnipeg.",
            iconBg: "bg-rose-100",
        }
    ],
    formPages: [
        [
            {
                key: "firstLangCLB",
                label: "First Language Proficiency (CLB)",
                type: "select",
                options: [4, 5, 6, 7, 8].map(n => ({ label: `CLB ${n}+`, value: `${n}` })),
            },
            {
                key: "secondLangCLB",
                label: "Second Language Proficiency (CLB)",
                type: "select",
                options: [{ label: "CLB 5 or higher", value: "5" }, { label: "No/Lower", value: "0" }],
            },
        ],
        [
            {
                key: "age",
                label: "Age at the time of application",
                type: "input",
            },
            {
                key: "yearsExperience",
                label: "Years of Full-time Experience",
                description: "Skilled work experience (NOC 0, A, B).",
                type: "select",
                options: [
                    { label: "4+ years", value: "4" },
                    { label: "3 years", value: "3" },
                    { label: "2 years", value: "2" },
                    { label: "1 year", value: "1" },
                ],
            },
        ],
        [
            {
                key: "educationLevel",
                label: "Level of Education",
                type: "select",
                options: [
                    { label: "Master’s or Doctoral Degree", value: "masters" },
                    { label: "Two post-secondary programs (2+ years total)", value: "twoPrograms" },
                    { label: "One post-secondary program (2+ years)", value: "oneProgram2" },
                    { label: "One post-secondary program (1 year)", value: "oneProgram1" },
                    { label: "Licensed Trade professional", value: "trade" },
                ],
            },
        ],
        [
            {
                key: "relativeManitoba",
                label: "Relative in Manitoba",
                type: "select",
                options: yesNo,
            },
            {
                key: "invitation",
                label: "Manitoba Strategic Invitation",
                type: "select",
                options: yesNo,
            },
            {
                key: "outsideWinnipeg",
                label: "Regional Destination (Outside Winnipeg)",
                type: "select",
                options: yesNo,
            },
        ]
    ]
};
