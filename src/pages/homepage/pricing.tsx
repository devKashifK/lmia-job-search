'use client';

import { useState } from 'react';
import {
  Check,
  Zap,
  DollarSign,
  Users,
  BarChart4,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { HoverCard } from '@/components/ui/hover-card';
import SectionTitle from '@/components/ui/section-title';
import { cn } from '@/lib/utils';
import useMobile from '@/hooks/use-mobile';

type Currency = 'CAD' | 'INR';

type Plan = {
  name: string;
  badge?: string;
  cadPrice?: string; // e.g. "$10"
  inrPrice?: string; // e.g. "₹599"
  period?: string; // "/month", "/week", "/search"
  description?: string;
  features: string[];
  popular?: boolean;
  cta?: string;
  href?: string;
  tone?: 'primary' | 'dark';
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// YOUR CURRENT PRICING (mapped into objects)
const individualPlans: Plan[] = [
  {
    name: 'Free Plan',
    cadPrice: '$0',
    inrPrice: '₹0',
    period: '',
    description: 'Perfect for trying things out',
    features: [
      '5 job searches',
      'Free NOC Code Finder',
      'No employer contacts',
    ],
    cta: 'Start Free',
    tone: 'dark',
  },
  {
    name: 'Pay-as-you-go',
    cadPrice: '$3',
    inrPrice: '₹199',
    period: '/search',
    description: 'Only pay when you need results',
    features: [
      '1 job search with full employer contact details',
      'NOC Code insights included',
    ],
    badge: 'Most Flexible',
    cta: 'Buy a Search',
    tone: 'primary',
  },
  {
    name: 'Weekly Plan',
    cadPrice: '$10',
    inrPrice: '₹599',
    period: '/week',
    description: 'Great for intensive weekly searches',
    features: [
      'Unlimited job searches',
      'NOC insights + employer contacts',
      'Valid for 7 days',
    ],
    popular: true,
    cta: 'Go Weekly',
    tone: 'primary',
  },
  {
    name: 'Monthly Plan',
    cadPrice: '$25',
    inrPrice: '₹1,499',
    period: '/month',
    description: 'Best long-term value',
    features: [
      'Unlimited searches',
      'NOC guidance',
      'Employer contacts',
      'Analytics dashboard access',
      'Valid for 30 days',
    ],
    cta: 'Subscribe Monthly',
    tone: 'dark',
  },
];

const employerPlans: Plan[] = [
  {
    name: 'Starter Plan',
    cadPrice: '$49',
    inrPrice: '₹3,105', // not provided in your table
    period: '/month',
    description: 'Essentials for small teams',
    features: ['Employer analytics dashboard', '100 employer contacts / month'],
    cta: 'Choose Starter',
    tone: 'dark',
  },
  {
    name: 'Pro Plan',
    cadPrice: '$99',
    inrPrice: '₹6,275',
    period: '/month',
    description: 'Advanced tools for growing teams',
    features: [
      'Unlimited employer contacts',
      'Full analytics (5-year trends, seasonal hiring, NOC insights)',
      'Advanced dashboards',
    ],
    popular: true,
    cta: 'Choose Pro',
    tone: 'primary',
  },
  {
    name: 'Enterprise Plan',
    cadPrice: 'Custom',
    inrPrice: 'Custom',
    period: '',
    description: 'Scale with confidence',
    features: [
      'API access',
      'Team dashboard',
      'Unlimited analytics',
      'Dedicated support',
    ],
    badge: 'Contact Sales',
    cta: 'Talk to Sales',
    tone: 'dark',
  },
];

function Price({
  plan,
  currency,
  isMobile,
}: {
  plan: Plan;
  currency: Currency;
  isMobile: boolean;
}) {
  // “Custom” stays “Custom”, otherwise show currency-specific price
  const value =
    plan.cadPrice === 'Custom' || plan.inrPrice === 'Custom'
      ? 'Custom'
      : currency === 'CAD'
      ? plan.cadPrice ?? '—'
      : plan.inrPrice ?? '—';

  return (
    <div className={isMobile ? 'mb-4' : 'mb-6'}>
      <span
        className={
          isMobile
            ? 'text-3xl font-bold text-gray-900'
            : 'text-4xl font-bold text-gray-900'
        }
      >
        {value}
      </span>
      {plan.period ? (
        <span className="text-gray-600 ml-2">{plan.period}</span>
      ) : null}
    </div>
  );
}

function PlanCard({
  plan,
  currency,
  isMobile,
}: {
  plan: Plan;
  currency: Currency;
  isMobile: boolean;
}) {
  const Icon = plan.name.includes('Enterprise')
    ? Building2
    : plan.period?.includes('search')
    ? DollarSign
    : plan.period?.includes('week')
    ? Zap
    : plan.name.includes('Pro')
    ? BarChart4
    : Users;

  return (
    <motion.div variants={item}>
      <HoverCard>
        <Card
          className={cn(
            'h-full relative border transition-colors',
            plan.popular ? 'border-brand-500' : 'border-transparent'
          )}
        >
          {plan.popular && (
            <div
              className={
                isMobile
                  ? 'absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg'
                  : 'absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg'
              }
            >
              Most Popular
            </div>
          )}
          {plan.badge && !plan.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-100 text-brand-800 px-4 py-1.5 rounded-full text-xs font-semibold border border-brand-200 shadow">
              {plan.badge}
            </div>
          )}

          <CardHeader className={isMobile ? 'p-4' : 'p-8'}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-100">
              <Icon className="w-4 h-4" />
              {plan.name}
            </div>

            <h3
              className={
                isMobile
                  ? 'text-xl font-bold text-gray-900 mb-3'
                  : 'text-2xl font-bold text-gray-900 mb-4'
              }
            >
              {plan.name}
            </h3>
            <Price plan={plan} currency={currency} isMobile={isMobile} />
            {plan.description ? (
              <p className="text-gray-600">{plan.description}</p>
            ) : null}
          </CardHeader>

          <CardContent className={isMobile ? 'p-4 pt-0' : ''}>
            <ul className={isMobile ? 'space-y-3 mb-6' : 'space-y-4 mb-8'}>
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <div
                    className={
                      isMobile
                        ? 'mt-0.5 w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center mr-2'
                        : 'mt-0.5 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mr-3'
                    }
                  >
                    <Check
                      className={
                        isMobile
                          ? 'w-3 h-3 text-brand-600'
                          : 'w-4 h-4 text-brand-600'
                      }
                    />
                  </div>
                  <span
                    className={
                      isMobile ? 'text-sm text-gray-700' : 'text-gray-700'
                    }
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              className={cn(
                isMobile
                  ? 'w-full rounded-full py-4 text-base font-semibold transition-all duration-300'
                  : 'w-full rounded-full py-6 text-lg font-semibold transition-all duration-300',
                plan.tone === 'primary'
                  ? 'bg-brand-600 hover:bg-brand-700'
                  : 'bg-gray-900 hover:bg-gray-800'
              )}
              onClick={() => {
                // Wire to your routes/checkout as needed:
                // e.g., router.push(plan.href ?? '/checkout?plan=' + encodeURIComponent(plan.name))
              }}
            >
              {plan.cta ?? 'Get Started'}
            </Button>
          </CardContent>
        </Card>
      </HoverCard>
    </motion.div>
  );
}

export default function Pricing() {
  const [currency, setCurrency] = useState<Currency>('CAD');
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) {
    return null;
  }

  return (
    <section
      id="pricing"
      className={isMobile ? 'py-10 relative' : 'py-16 relative'}
    >
      <div
        className={
          isMobile
            ? 'max-w-7xl mx-auto px-4'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
        }
      >
        <SectionTitle
          title="Simple, Transparent Pricing"
          subtitle="Choose the plan that works best for you"
        />

        {/* Currency toggle */}
        <div
          className={
            isMobile
              ? 'flex items-center justify-center gap-2 mt-4 mb-6'
              : 'flex items-center justify-center gap-2 mt-6 mb-10'
          }
        >
          <span
            className={cn(
              'text-sm font-medium',
              currency === 'CAD' ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            CAD
          </span>
          <button
            aria-label="Toggle currency"
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200"
            onClick={() => setCurrency((c) => (c === 'CAD' ? 'INR' : 'CAD'))}
          >
            <span
              className={cn(
                'inline-block h-6 w-6 transform rounded-full bg-white shadow transition',
                currency === 'INR' ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
          <span
            className={cn(
              'text-sm font-medium',
              currency === 'INR' ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            INR
          </span>
        </div>

        {/* Individuals */}
        <div className={isMobile ? 'mb-8' : 'mb-6'}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-brand-600" />
            <h4 className="text-lg font-semibold text-gray-900">
              For Individuals
            </h4>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className={
              isMobile
                ? 'grid grid-cols-1 gap-6'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'
            }
          >
            {individualPlans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                currency={currency}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        </div>

        {/* Employers */}
        <div className={isMobile ? 'mt-10' : 'mt-14'}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-brand-600" />
            <h4 className="text-lg font-semibold text-gray-900">
              For Employers
            </h4>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className={
              isMobile
                ? 'grid grid-cols-1 gap-6'
                : 'grid grid-cols-1 md:grid-cols-3 gap-8'
            }
          >
            {employerPlans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                currency={currency}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
