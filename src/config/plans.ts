export type PlanInterval = 'monthly' | 'annual';

export interface PlanFeature {
  text: string;
  upcoming?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number; // per month if annual
  totalAnnualPrice: number;
  credits: {
    monthly: number;
    bonusAnnual?: number;
  };
  employerContacts: number;
  features: PlanFeature[];
  popular?: boolean;
  badge?: string;
  tone: 'primary' | 'ghost';
}

export const INDIVIDUAL_PLANS: Plan[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Perfect for trying things out',
    monthlyPrice: 0,
    annualPrice: 0,
    totalAnnualPrice: 0,
    credits: {
      monthly: 500, // 1000 for launch
    },
    employerContacts: 0,
    features: [
      { text: 'Full job search — 550K+ jobs' },
      { text: 'NOC code filtering' },
      { text: 'LMIA & program filters' },
      { text: 'Apply Now integration' },
      { text: 'Know Your Rights section' },
      { text: 'Permit expiry tracker', upcoming: true },
      { text: '5-year hiring trends' },
    ],
    tone: 'ghost',
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Great for focused job searching',
    monthlyPrice: 10,
    annualPrice: 9, // $108/yr
    totalAnnualPrice: 108,
    credits: {
      monthly: 400,
      bonusAnnual: 100, // 500 total/mo on annual
    },
    employerContacts: 3,
    features: [
      { text: 'Everything in Explorer' },
      { text: 'Email notifications' },
      { text: '5-year trends (basic)' },
      { text: 'Comparator (150 cr/use)' },
      { text: 'Analytics (150 cr/use)' },
      { text: 'Resume AI builder' },
      { text: 'RCIC direct connect' },
    ],
    tone: 'primary',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best value for active candidates',
    monthlyPrice: 18,
    annualPrice: 14, // $168/yr
    totalAnnualPrice: 168,
    popular: true,
    badge: 'Most Popular',
    credits: {
      monthly: 900,
      bonusAnnual: 200, // 1100 total/mo on annual
    },
    employerContacts: 15,
    features: [
      { text: 'Everything in Starter' },
      { text: 'Resume AI (50 cr/build)' },
      { text: 'AI optimizer (25 cr/use)' },
      { text: '5-year trends — full' },
      { text: 'RCIC connect (30 cr/session)' },
      { text: 'In-app + email alerts' },
      { text: 'Multilingual support' },
    ],
    tone: 'primary',
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'White-glove immigration support',
    monthlyPrice: 29,
    annualPrice: 22, // $264/yr
    totalAnnualPrice: 264,
    badge: 'Immigration Ready',
    credits: {
      monthly: 2000,
      bonusAnnual: 500, // 2500 total/mo on annual
    },
    employerContacts: 40,
    features: [
      { text: 'Everything in Pro' },
      { text: 'Dedicated RCIC partner match' },
      { text: 'Unlimited AI resume builds' },
      { text: 'Express Entry/TEER guidance' },
      { text: 'Priority real-time job alerts' },
      { text: 'PR pathway tracker' },
      { text: 'Priority support (24hr)' },
    ],
    tone: 'primary',
  },
];

export const AGENCY_PLANS: Plan[] = [
  {
    id: 'agency_starter',
    name: 'Agency Starter',
    description: 'Essentials for small teams',
    monthlyPrice: 39,
    annualPrice: 33,
    totalAnnualPrice: 396,
    badge: '60-day trial (Upcoming)',
    credits: {
      monthly: 1500,
      bonusAnnual: 500, // 2000 total/mo on annual
    },
    employerContacts: 10,
    features: [
      { text: 'Up to 3 consultant seats' },
      { text: 'Shared credits pool' },
      { text: 'Agency portal access' },
      { text: 'Client tracking up to 30' },
      { text: 'NOC + LMIA filters' },
      { text: 'AI candidate matching' },
      { text: 'Direct employer connect' },
    ],
    tone: 'ghost',
  },
  {
    id: 'agency_pro',
    name: 'Agency Pro',
    description: 'Advanced tools for growing agencies',
    monthlyPrice: 89,
    annualPrice: 69,
    totalAnnualPrice: 828,
    popular: true,
    badge: 'Most Popular',
    credits: {
      monthly: 5000,
      bonusAnnual: 1000, // 6000 total/mo on annual
    },
    employerContacts: 60,
    features: [
      { text: 'Everything in Starter' },
      { text: 'Up to 10 consultant seats' },
      { text: 'Unlimited client candidates' },
      { text: 'Real-time LMIA feed' },
      { text: 'IRCC policy alerts' },
      { text: 'Dedicated account manager' },
    ],
    tone: 'primary',
  },
  {
    id: 'agency_elite',
    name: 'Agency Elite',
    description: 'Full-scale enterprise solutions',
    monthlyPrice: 199,
    annualPrice: 159,
    totalAnnualPrice: 1908,
    credits: {
      monthly: 15000,
      bonusAnnual: 3000, // 18000 total/mo on annual
    },
    employerContacts: 9999, // "Unlimited" in PPT
    features: [
      { text: 'Everything in Pro' },
      { text: 'Unlimited consultant seats' },
      { text: 'White-label co-branded portal', upcoming: true },
      { text: 'API access — CRM integration' },
      { text: 'Custom LMIA/NOC reports' },
      { text: 'Priority employer pipeline' },
      { text: 'SLA: 4-hr support response' },
    ],
    tone: 'primary',
  },
];

export const LAUNCH_OFFER = {
  doubleCredits: true,
  welcomeCreditsNormal: 500,
  welcomeCreditsLaunch: 1000,
  firstMonthFree: true,
};
