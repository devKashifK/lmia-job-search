'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Zap, Users, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';
import { HoverCard } from '@/components/ui/hover-card';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { cn } from '@/lib/utils';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';

type Currency = 'CAD' | 'INR';

type Plan = {
  name: string;
  cadPrice?: string;
  inrPrice?: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string | null;
  tone?: 'primary' | 'ghost';
};

const individualPlans: Plan[] = [
  {
    name: 'Free Plan',
    cadPrice: '$0',
    inrPrice: '₹0',
    description: 'Try the basics before upgrading',
    features: [
      '5 job searches',
      'Free NOC Code Finder',
      'No employer contacts',
    ],
    highlighted: false,
    badge: null,
    tone: 'ghost',
  },
  {
    name: 'Pay-as-you-go',
    cadPrice: '$3',
    inrPrice: '₹199',
    period: '/search',
    description: 'Only pay when you need a search',
    features: [
      '1 job search with full employer contact details',
      'NOC Code insights included',
    ],
    highlighted: false,
    badge: 'Most Flexible',
    tone: 'primary',
  },
  {
    name: 'Weekly Plan',
    cadPrice: '$10',
    inrPrice: '₹599',
    period: '/week',
    description: 'Unlimited for 7 days',
    features: [
      'Unlimited job searches',
      'NOC insights + employer contacts',
      'Valid for 7 days',
    ],
    highlighted: true,
    badge: 'Most Popular',
    tone: 'primary',
  },
  {
    name: 'Monthly Plan',
    cadPrice: '$25',
    inrPrice: '₹1,499',
    period: '/month',
    description: 'Best value for power users',
    features: [
      'Unlimited searches',
      'NOC guidance',
      'Employer contacts',
      'Analytics dashboard access',
      'Valid for 30 days',
    ],
    highlighted: false,
    badge: null,
    tone: 'ghost',
  },
];

const employerPlans: Plan[] = [
  {
    name: 'Starter Plan',
    cadPrice: '$49',
    inrPrice: '₹3,105',
    period: '/month',
    description: 'Essentials for small teams',
    features: ['Employer analytics dashboard', '100 employer contacts / month'],
    highlighted: false,
    badge: null,
    tone: 'ghost',
  },
  {
    name: 'Pro Plan',
    cadPrice: '$99',
    inrPrice: '₹6,271',
    period: '/month',
    description: 'Advanced tools for growing teams',
    features: [
      'Unlimited employer contacts',
      'Full analytics (5-year trends, seasonal hiring, NOC insights)',
      'Advanced dashboards',
    ],
    highlighted: true,
    badge: 'Most Popular',
    tone: 'primary',
  },
  {
    name: 'Enterprise Plan',
    cadPrice: 'Custom',
    inrPrice: 'Custom',
    description: 'Scale with confidence',
    features: [
      'API access',
      'Team dashboard',
      'Unlimited analytics',
      'Dedicated support',
    ],
    highlighted: false,
    badge: 'Custom Solution',
    tone: 'ghost',
  },
];

function Price({ plan, currency }: { plan: Plan; currency: Currency }) {
  const value =
    plan.cadPrice === 'Custom' || plan.inrPrice === 'Custom'
      ? 'Custom'
      : currency === 'CAD'
      ? plan.cadPrice ?? '—'
      : plan.inrPrice ?? '—';

  return (
    <div className="mb-3 sm:mb-4">
      <span className="text-3xl sm:text-4xl font-bold text-gray-900">
        {value}
      </span>
      {plan.period && value !== 'Custom' ? (
        <span className="text-base sm:text-lg text-gray-500">
          {plan.period}
        </span>
      ) : null}
    </div>
  );
}

function PlanCard({
  plan,
  currency,
  index,
}: {
  plan: Plan;
  currency: Currency;
  index: number;
}) {
  return (
    <motion.div
      key={plan.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="h-full"
    >
      <HoverCard>
        <div
          className={cn(
            'relative rounded-2xl p-6 sm:p-8 h-full flex flex-col bg-white/80 backdrop-blur-sm border shadow-md hover:shadow-lg transition-all duration-300',
            plan.highlighted
              ? 'border-2 border-brand-500 shadow-xl scale-[1.02]'
              : 'border-brand-100'
          )}
        >
          {plan.badge && (
            <div className="absolute top-4 right-4">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium',
                  plan.highlighted
                    ? 'bg-brand-500 text-white'
                    : 'bg-brand-100 text-brand-700'
                )}
              >
                {plan.badge}
              </span>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {plan.name}
            </h2>
            <Price plan={plan} currency={currency} />
            {plan.description && (
              <p className="text-sm sm:text-base text-gray-600">
                {plan.description}
              </p>
            )}
          </div>

          <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center text-sm sm:text-base text-gray-700"
              >
                <Check
                  className={cn(
                    'h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0',
                    plan.highlighted ? 'text-brand-500' : 'text-brand-400'
                  )}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <Button
              className={cn(
                'w-full h-11 sm:h-12',
                plan.tone === 'primary'
                  ? 'bg-brand-500 hover:bg-brand-600 text-white'
                  : 'bg-brand-100 hover:bg-brand-200 text-brand-700'
              )}
            >
              {plan.name.includes('Enterprise') ? (
                'Contact Sales'
              ) : (
                <>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </HoverCard>
    </motion.div>
  );
}

const PricingPage = () => {
  const { isMobile } = useMobile();
  const [currency, setCurrency] = useState<Currency>('CAD');

  return (
    <BackgroundWrapper>
      <div className="bg-brand-50/80">
        {isMobile ? (
          <MobileHeader title="Pricing Plans" showBack={true} />
        ) : (
          <Navbar />
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-3 sm:mb-4"
            >
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-brand-500" />
              <span className="uppercase text-[10px] sm:text-xs font-semibold text-brand-600 tracking-widest">
                Pricing
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4"
            >
              Find Your Perfect Job Match
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0"
            >
              Access comprehensive listings, advanced search tools, and powerful
              analytics—whether you’re an individual or an employer.
            </motion.p>

            {/* Currency Toggle */}
            <div className="mt-6 flex items-center justify-center gap-2">
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
                onClick={() =>
                  setCurrency((c) => (c === 'CAD' ? 'INR' : 'CAD'))
                }
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
          </div>

          {/* Individuals */}
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-4 w-4 text-brand-500" />
              <span className="uppercase text-xs font-semibold text-brand-700 tracking-widest">
                For Individuals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {individualPlans.map((plan, idx) => (
                <PlanCard
                  key={plan.name}
                  plan={plan}
                  currency={currency}
                  index={idx}
                />
              ))}
            </div>
          </div>

          {/* Employers */}
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-brand-500" />
              <span className="uppercase text-xs font-semibold text-brand-700 tracking-widest">
                For Employers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {employerPlans.map((plan, idx) => (
                <PlanCard
                  key={plan.name}
                  plan={plan}
                  currency={currency}
                  index={idx}
                />
              ))}
            </div>
          </div>

          {/* CTA Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 sm:mt-20 text-center"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-brand-100 shadow-lg">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                <Zap className="h-4 w-4 text-brand-500" />
                <span className="uppercase text-[10px] sm:text-xs font-semibold text-brand-600 tracking-widest">
                  Enterprise Solutions
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Need a Custom Solution?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Get personalized support, custom integrations, and flexible
                pricing tailored to your organization&apos;s needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-brand-200 text-brand-600 hover:bg-brand-50"
                >
                  Schedule Demo
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </motion.div>
        </main>

        {!isMobile && <Footer />}
        {isMobile && <BottomNav />}
      </div>
    </BackgroundWrapper>
  );
};

export default PricingPage;
