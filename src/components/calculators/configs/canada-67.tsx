import React from 'react';
import { CalculatorConfig } from '../shared/calculator-page';
import { calculateCanada67Score } from '@/lib/calculators/canada-67';
import { FSW_67_BREAKDOWN_SECTIONS } from '@/lib/calculators/constants';
import { Star, MessageCircle, Briefcase, GraduationCap, Calendar, DollarSign } from 'lucide-react';

const clbOptions = [4, 5, 6, 7, 8, 9, 10].map((n) => ({
  label: `CLB ${n}`,
  value: `${n}`,
}));

const yesNo = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const CANADA_67_CONFIG: CalculatorConfig = {
    id: 'canada-67',
    title: 'Canada 67 Points',
    badgeText: 'Federal Skilled Worker',
    description: 'Check if you meet the 67-point pass mark for the Federal Skilled Worker Program (FSWP).',
    calculate: calculateCanada67Score,
    breakdownSections: FSW_67_BREAKDOWN_SECTIONS,
    stats: [
        {
            icon: "BadgeCheck",
            value: 67,
            suffix: "/100",
            label: "Pass mark",
            bgColor: "bg-emerald-100",
            placeholderValue: "67/100",
        },
        {
            icon: "Users",
            value: 1,
            suffix: " on 1",
            label: "Consultant Follow-up",
            bgColor: "bg-amber-100",
            placeholderValue: "1 on 1",
        }
    ],
    features: [
        {
            icon: <MessageCircle size={22} className="text-blue-500" />,
            title: "Language Skills",
            description: "Minimum CLB 7 in all four abilities for one official language.",
            iconBg: "bg-blue-100",
        },
        {
            icon: <Briefcase size={22} className="text-green-600" />,
            title: "Work Experience",
            description: "At least 1 year of continuous skilled work experience in the last 10 years.",
            iconBg: "bg-green-100",
        }
    ],
    formPages: [
        [
            {
                key: "age",
                label: "Age",
                description: "Optimal points are awarded for ages 18–35.",
                type: "input",
            },
            {
                key: "educationLevel",
                label: "Education",
                type: "select",
                options: [
                    { label: "Doctoral degree (PhD)", value: "doctoral" },
                    { label: "Master’s degree", value: "masters" },
                    { label: "Two or more post-secondary credentials", value: "twoYear" },
                    { label: "Bachelor’s degree (3+ years)", value: "bachelors" },
                    { label: "Secondary diploma", value: "secondary" },
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
            {
                key: "arrangedEmployment",
                label: "Arranged Employment",
                description: "Do you have a valid job offer with LMIA support?",
                type: "select",
                options: yesNo,
            },
            {
                key: "adaptability",
                label: "Adaptability factors",
                description: "Study, work, or relative in Canada.",
                type: "select",
                options: yesNo,
            },
        ]
    ]
};
