import React from 'react';
import { CalculatorConfig } from '../shared/calculator-page';
import { calculateQuebecScore } from '@/lib/calculators/quebec';
import { QUEBEC_POINTS_BREAKDOWN_SECTIONS } from '@/lib/calculators/constants';
import { Languages, GraduationCap, Briefcase, UserCircle, MapPin } from 'lucide-react';

const yesNo = [
  { label: "Oui (Yes)", value: "yes" },
  { label: "Non (No)", value: "no" },
];

export const QUEBEC_CONFIG: CalculatorConfig = {
    id: 'quebec',
    title: 'Quebec QSWP',
    badgeText: 'Skilled Worker',
    description: "Assessment for the Quebec Regular Skilled Worker Program (Programme régulier des travailleurs qualifiés).",
    calculate: calculateQuebecScore,
    breakdownSections: QUEBEC_POINTS_BREAKDOWN_SECTIONS,
    stats: [
        {
            icon: "Languages",
            value: 22,
            suffix: " max",
            label: "FR/EN Language",
            bgColor: "bg-pink-100",
            placeholderValue: "22 max",
        },
        {
            icon: "MapPin",
            value: 10,
            suffix: " pts",
            label: "Validated Offer",
            bgColor: "bg-blue-100",
            placeholderValue: "10 pts",
        }
    ],
    features: [
        {
            icon: <Languages size={22} className="text-pink-600" />,
            title: "Francophone Focus",
            description: "High points awarded for intermediate-advanced French language ability.",
            iconBg: "bg-pink-100",
        },
        {
            icon: <MapPin size={22} className="text-blue-600" />,
            title: "Validated Job Offer",
            description: "Points awarded for permanent job offers validated by MIFI.",
            iconBg: "bg-blue-100",
        }
    ],
    formPages: [
        [
            {
                key: "educationLevel",
                label: "Niveau de Scolarité (Education)",
                type: "select",
                options: [
                    { label: "Doctorat (PhD)", value: "doctoral" },
                    { label: "Maîtrise (Masters)", value: "masters" },
                    { label: "Baccalauréat (Bachelors)", value: "bachelors" },
                    { label: "Diplôme d'études collégiales (Diploma)", value: "diploma" },
                ],
            },
            {
                key: "age",
                label: "Âge",
                description: "Points maximum pour les candidats de 18 à 35 ans.",
                type: "input",
            },
        ],
        [
            {
                key: "frenchLevel",
                label: "Connaissance du Français",
                description: "Score combiné (Parler, Écouter, Lire, Écrire).",
                type: "select",
                options: [
                    { label: "Avancé (CLB 9+)", value: "16" },
                    { label: "Intermédiaire (CLB 7-8)", value: "12" },
                    { label: "Débutant (CLB 5-6)", value: "8" },
                    { label: "Aucun", value: "0" },
                ],
            },
            {
                key: "englishLevel",
                label: "Connaissance de l'Anglais",
                type: "select",
                options: [
                    { label: "CLB 7 ou plus", value: "6" },
                    { label: "CLB 5-6", value: "4" },
                    { label: "Aucun", value: "0" },
                ],
            },
        ],
        [
            {
                key: "jobOffer",
                label: "Offre d'Emploi Validée",
                description: "Avez-vous une offre d'emploi validée par le MIFI?",
                type: "select",
                options: yesNo,
            },
        ]
    ]
};
