"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Info, Users, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import SectionTitle from "@/components/ui/section-title";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/use-mobile";

type Currency = 'CAD' | 'INR';

type Plan = {
  name: string;
  badge?: string;
  cadPrice?: string;
  inrPrice?: string;
  period?: string;
  description?: string;
  features: string[];
  popular?: boolean;
  cta?: string;
  href?: string;
  tone?: 'primary' | 'dark';
};

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
      '1 job search with full contact details',
      'NOC Code insights included',
      'Lifetime access to result',
    ],
    badge: 'Flexible',
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
    inrPrice: '₹3,105',
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

export default function Pricing() {
  const [currency, setCurrency] = useState<Currency>('CAD');
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) return null;

  const renderPlans = (plans: Plan[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {plans.map((plan, i) => {
        const value = plan.cadPrice === 'Custom' || plan.inrPrice === 'Custom'
          ? 'Custom'
          : currency === 'CAD'
            ? plan.cadPrice ?? '—'
            : plan.inrPrice ?? '—';

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative flex flex-col p-6 rounded-2xl border transition-all duration-300",
              plan.popular
                ? "bg-white border-brand-200 shadow-xl shadow-brand-100/50 ring-1 ring-brand-100"
                : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-lg"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 -mt-3 mr-6 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}
            {plan.badge && !plan.popular && (
              <div className="absolute top-0 right-0 -mt-3 mr-6 bg-brand-100 text-brand-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {plan.badge}
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline text-gray-900">
                <span className="text-3xl font-extrabold tracking-tight">{value}</span>
                {plan.period && <span className="ml-1 text-sm font-medium text-gray-500">{plan.period}</span>}
              </div>
              <p className="mt-4 text-sm text-gray-500 line-clamp-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className="flex-shrink-0 w-5 h-5 text-brand-500 mr-3" />
                  <span className="text-gray-600 text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button className={cn(
              "w-full py-4 px-6 rounded-xl font-bold text-sm transition-colors",
              plan.tone === 'primary'
                ? "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30"
                : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
            )}>
              {plan.cta}
            </button>

          </motion.div>
        )
      })}
    </div>
  );

  return (
    <section id="pricing" className="py-12 bg-gray-50/30 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <SectionTitle
          badge="Flexible Data Plans"
          title={<>Transparent <span className="text-brand-600">Data Pricing</span></>}
          subtitle="Invest in clarity. Choose the plan that fits your search needs."
        />

        {/* Currency Toggle */}
        <div className="flex items-center justify-center gap-2 mt-6 mb-10">
          <span className={cn('text-sm font-medium', currency === 'CAD' ? 'text-gray-900' : 'text-gray-500')}>CAD</span>
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
          <span className={cn('text-sm font-medium', currency === 'INR' ? 'text-gray-900' : 'text-gray-500')}>INR</span>
        </div>

        {/* Individual Plans */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6 ml-2 justify-center md:justify-start">
            <Users className="w-5 h-5 text-brand-600" />
            <h4 className="text-xl font-bold text-gray-900">For Individuals</h4>
          </div>
          {renderPlans(individualPlans)}
        </div>

        {/* Employer Plans */}
        <div>
          <div className="flex items-center gap-3 mb-6 ml-2 justify-center md:justify-start">
            <Building2 className="w-5 h-5 text-brand-600" />
            <h4 className="text-xl font-bold text-gray-900">For Enterprise</h4>
          </div>
          {renderPlans(employerPlans)}
        </div>


        <div className="mt-16 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <Info className="w-4 h-4" />
            Secure payments. Cancel anytime.
          </p>
        </div>

      </div>
    </section>
  );
}
