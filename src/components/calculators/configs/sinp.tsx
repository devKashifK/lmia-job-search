import React from 'react';
import { CalculatorConfig } from '../shared/calculator-page';
import { calculateSINPScore } from '@/lib/calculators/sinp';
import { SINP_POINTS_BREAKDOWN_SECTIONS } from '@/lib/calculators/constants';
import { Award, Briefcase, GraduationCap, MapPin, Users } from 'lucide-react';

const yesNo = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const SINP_CONFIG: CalculatorConfig = {
    id: 'saskatchewan',
    title: 'Saskatchewan SINP',
    badgeText: 'SINP Points Grid',
    description: 'Assess eligibility for the Saskatchewan Immigrant Nominee Program.',
    calculate: calculateSINPScore,
    breakdownSections: SINP_POINTS_BREAKDOWN_SECTIONS,
    stats: [
        {
            icon: "Award",
            value: 60,
            suffix: "/100",
            label: "Min Pass Mark",
            bgColor: "bg-orange-100",
            placeholderValue: "60/100",
        },
        {
            icon: "MapPin",
            value: 5,
            suffix: " pts",
            label: "Past Study/Work",
            bgColor: "bg-blue-100",
            placeholderValue: "5 pts",
        }
    ],
    features: [
        {
            icon: <Award size={22} className="text-orange-600" />,
            title: "Occupations In-Demand",
            description: "No job offer required for certain skilled professional streams.",
            iconBg: "bg-orange-100",
        },
        {
            icon: <Users size={22} className="text-blue-600" />,
            title: "Family Connection",
            description: "Significant points for immediate family living in Saskatchewan.",
            iconBg: "bg-blue-100",
        }
    ],
    formPages: [
        [
            {
                key: "educationLevel",
                label: "Education",
                type: "select",
                options: [
                    { label: "Master’s or Doctoral Degree", value: "doctoral" },
                    { label: "University degree (3+ years)", value: "uni3yr" },
                    { label: "Trade/Vocational Certification", value: "trade" },
                    { label: "Degree/Diploma (2+ years)", value: "diploma2" },
                    { label: "Certificate (1 year)", value: "cert1" },
                ],
            },
            {
                key: "ageRange",
                label: "Age Range",
                type: "select",
                options: [
                    { label: "22–34 years", value: "22-34" },
                    { label: "35–45 years", value: "35-45" },
                    { label: "18–21 years", value: "18-21" },
                    { label: "46–50 years", value: "46-50" },
                ],
            },
        ],
        [
            {
                key: "skilledExpRecent",
                label: "Skilled Experience (Recent 5 years)",
                type: "select",
                options: [
                    { label: "5 years", value: "5" },
                    { label: "4 years", value: "4" },
                    { label: "3 years", value: "3" },
                    { label: "2 years", value: "2" },
                    { label: "1 year", value: "1" },
                ],
            },
            {
                key: "skilledExpOlder",
                label: "Skilled Experience (6-10 years ago)",
                type: "select",
                options: [
                    { label: "5 years", value: "5" },
                    { label: "4 years", value: "4" },
                    { label: "3 years", value: "3" },
                    { label: "2 years", value: "2" },
                ],
            },
        ],
        [
            {
                key: "firstLangCLB",
                label: "First Language Ability",
                type: "select",
                options: [4, 5, 6, 7, 8].map(n => ({ label: `CLB ${n}+`, value: `${n}` })),
            },
            {
                key: "jobOffer",
                label: "Job Offer in SK",
                type: "select",
                options: yesNo,
            },
            {
                key: "relative",
                label: "Relative in Saskatchewan",
                type: "select",
                options: yesNo,
            },
        ]
    ]
};
