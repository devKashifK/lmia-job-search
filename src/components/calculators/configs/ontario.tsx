import React from 'react';
import { CalculatorConfig } from '../shared/calculator-page';
import { calculateOntarioScore } from '@/lib/calculators/ontario';
import { ONTARIO_PNP_POINTS_BREAKDOWN_SECTIONS } from '@/lib/calculators/constants';
import { Clock, Briefcase, GraduationCap, MapPin, DollarSign, Award } from 'lucide-react';

const yesNo = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const ONTARIO_CONFIG: CalculatorConfig = {
    id: 'ontario',
    title: 'Ontario PNP',
    badgeText: 'OINP Human Capital',
    description: "Evaluate your readiness for Ontario's Employer Job Offer and Human Capital streams.",
    calculate: calculateOntarioScore,
    breakdownSections: ONTARIO_PNP_POINTS_BREAKDOWN_SECTIONS,
    stats: [
        {
            icon: "Clock",
            value: 12,
            suffix: " mo",
            label: "Min Exp Required",
            bgColor: "bg-indigo-100",
            placeholderValue: "12 mo",
        },
        {
            icon: "MapPin",
            value: 10,
            suffix: " pts",
            label: "Outside GTA Bonus",
            bgColor: "bg-blue-100",
            placeholderValue: "10 pts",
        }
    ],
    features: [
        {
            icon: <Clock size={22} className="text-indigo-600" />,
            title: "Tech Draws",
            description: "Frequent targeted draws for software developers and data scientists.",
            iconBg: "bg-indigo-100",
        },
        {
            icon: <MapPin size={22} className="text-blue-600" />,
            title: "Regional Pilot",
            description: "Priority for workers settling in small and rural Ontario communities.",
            iconBg: "bg-blue-100",
        }
    ],
    formPages: [
        [
            {
                key: "nocTeer",
                label: "Job Offer NOC TEER Level",
                description: "OINP scores higher for TEER 0, 1, 2, and 3 level occupations.",
                type: "select",
                options: [
                    { label: "TEER 0 or 1", value: "0" },
                    { label: "TEER 2 or 3", value: "2" },
                    { label: "Other", value: "other" },
                ],
            },
            {
                key: "jobOfferWage",
                label: "Annual Wage Level",
                description: "Comparative wage against Ontario's median for your occupation.",
                type: "select",
                options: [
                    { label: "Highly Competitive (Top 25%)", value: "high" },
                    { label: "Competitive (Median)", value: "mid" },
                    { label: "Other", value: "low" },
                ],
            },
        ],
        [
            {
                key: "canadianExperience",
                label: "Canadian Work Experience",
                description: "At least 1 year of full-time experience in Canada in the last 3 years.",
                type: "select",
                options: yesNo,
            },
            {
                key: "workLocation",
                label: "Primary Work Location",
                description: "Points are awarded based on where you will work in Ontario.",
                type: "select",
                options: [
                    { label: "Outside GTA", value: "outsideGTA" },
                    { label: "Inside GTA (Toronto/etc)", value: "insideGTA" },
                ],
            },
        ],
        [
            {
                key: "educationLevel",
                label: "Highest Level of Education",
                type: "select",
                options: [
                    { label: "Post-Graduate (PhD/Masters)", value: "grad" },
                    { label: "Undergraduate Degree", value: "undergrad" },
                    { label: "College Diploma (2+ years)", value: "diploma" },
                ],
            },
        ]
    ]
};
