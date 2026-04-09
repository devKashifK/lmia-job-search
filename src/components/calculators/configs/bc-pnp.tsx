import React from 'react';
import { CalculatorConfig } from '../shared/calculator-page';
import { calculateBCScore } from '@/lib/calculators/bc-pnp';
import { BC_PNP_POINTS_BREAKDOWN_SECTIONS } from '@/lib/calculators/constants';
import { MapPin, Briefcase, GraduationCap, DollarSign, Award, Globe } from 'lucide-react';

const clbOptions = [4, 5, 6, 7, 8, 9, 10].map((n) => ({
  label: `CLB ${n}`,
  value: `${n}`,
}));

const yesNo = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const BC_PNP_CONFIG: CalculatorConfig = {
    id: 'bc',
    title: 'British Columbia PNP',
    badgeText: 'SIRS Scoring',
    description: "Evaluate your eligibility for BC's Skills Immigration streams using the SIRS system.",
    calculate: calculateBCScore,
    breakdownSections: BC_PNP_POINTS_BREAKDOWN_SECTIONS,
    stats: [
        {
            icon: "MapPin",
            value: 25,
            suffix: " PTS",
            label: "Regional Max",
            bgColor: "bg-rose-100",
            placeholderValue: "25 PTS",
        },
        {
            icon: "Briefcase",
            value: 120,
            suffix: " max",
            label: "Economic Points",
            bgColor: "bg-blue-100",
            placeholderValue: "120 max",
        }
    ],
    features: [
        {
            icon: <MapPin size={22} className="text-rose-600" />,
            title: "BC Tech Stream",
            description: "Priority processing for technical occupations in British Columbia.",
            iconBg: "bg-rose-100",
        },
        {
            icon: <Globe size={22} className="text-blue-600" />,
            title: "Regional Bonus",
            description: "Additional points for jobs located outside the Metro Vancouver area.",
            iconBg: "bg-blue-100",
        }
    ],
    formPages: [
        [
            {
                key: "yearsRelatedExp",
                label: "Directly Related Work Experience",
                description: "Experience in the specific NOC of your BC job offer.",
                type: "select",
                options: [
                    { label: "5+ years (60+ months)", value: ">=60" },
                    { label: "4 to 5 years", value: "48-59" },
                    { label: "3 to 4 years", value: "36-47" },
                    { label: "2 to 3 years", value: "24-35" },
                    { label: "1 to 2 years", value: "12-23" },
                    { label: "Less than 1 year", value: "<12" },
                ],
            },
            {
                key: "bcExperienceBonus",
                label: "BC Work Experience Bonus",
                description: "Do you have at least 1 year of full-time experience in BC?",
                type: "select",
                options: yesNo,
            },
        ],
        [
            {
                key: "educationLevel",
                label: "Highest Education",
                type: "select",
                options: [
                    { label: "Doctoral (PhD)", value: "doctoral" },
                    { label: "Master’s degree", value: "masters" },
                    { label: "Post-Graduate Diploma/Certificate", value: "postGrad" },
                    { label: "Bachelor’s degree", value: "bachelors" },
                    { label: "Associate degree", value: "associate" },
                    { label: "Non-degree diploma", value: "diploma" },
                    { label: "High school", value: "highSchool" },
                ],
            },
            {
                key: "bcEducationBonus",
                label: "BC Post-Secondary Education",
                description: "Completed your highest degree in BC?",
                type: "select",
                options: yesNo,
            },
        ],
        [
            {
                key: "wageRange",
                label: "Annual Wage of BC Job Offer",
                type: "select",
                options: [
                    { label: "$35+ per hour", value: ">=35" },
                    { label: "$30 – $34.99", value: "30-34.99" },
                    { label: "$25 – $29.99", value: "25-29.99" },
                    { label: "$20 – $24.99", value: "20-24.99" },
                    { label: "$16 – $19.99", value: "16-19.9" },
                    { label: "Less than $16", value: "<16" },
                ],
            },
            {
                key: "region",
                label: "Region of Employment",
                type: "select",
                options: [
                    { label: "Metro Vancouver", value: "metro" },
                    { label: "Secondary (Victoria/etc)", value: "secondary" },
                    { label: "Other Areas", value: "other" },
                ],
            },
        ],
        [
            {
                key: "engCLB",
                label: "English Language Proficiency (CLB)",
                type: "select",
                options: clbOptions,
            },
            {
                key: "freCLB",
                label: "French Language Proficiency (CLB)",
                type: "select",
                options: clbOptions,
            },
        ]
    ]
};
