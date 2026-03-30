'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Zap, Users, Building2, HelpCircle, Clock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { HoverCard } from '@/components/ui/hover-card';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { cn } from '@/lib/utils';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';
import PaymentButton from '@/components/ui/payment-button';
import Link from 'next/link';
import { X, Sparkles, User, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';



// Assuming PricingPage is the component that will be defined later in the file
// For now, I'll just add the metadata and the new imports.
// The instruction implies that `const PricingPage = () => {` would follow this block.

type Plan = {
  name: string;
  cadPrice?: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string | null;
  tone?: 'primary' | 'ghost';
  icon?: React.ReactNode;
  bestFor?: string;
};

const individualPlans: Plan[] = [
  {
    name: 'Free Plan',
    cadPrice: '$0',
    description: 'Try the basics before upgrading',
    features: [
      '5 job searches',
      'Free NOC Code Finder',
      'No employer contacts',
    ],
    highlighted: false,
    badge: null,
    tone: 'ghost',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Pay-as-you-go',
    cadPrice: '$0.50',
    period: '/search',
    description: 'Only pay when you need a search',
    features: [
      '1 job search with full employer contact details',
      'NOC Code insights included',
    ],
    highlighted: false,
    badge: 'Most Flexible',
    tone: 'primary',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: 'Pay-as-you-go Bundle',
    cadPrice: '$3',
    period: '/10 searches',
    description: 'Save with a bundle of searches',
    features: [
      '10 job searches with full details',
      'NOC Code insights included',
      'No expiry date',
    ],
    highlighted: false,
    badge: 'Best Value Bundle',
    tone: 'primary',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: 'Weekly Plan',
    cadPrice: '$10',
    period: '/week',
    description: 'Unlimited access for 7 days',
    features: [
      'Unlimited job searches',
      'NOC insights + employer contacts',
      'Valid for 7 days',
    ],
    highlighted: true,
    badge: 'Most Popular',
    tone: 'primary',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: 'Monthly Plan',
    cadPrice: '$25',
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
    icon: <Zap className="w-5 h-5" />,
  },
];

const agencyPlans: Plan[] = [
  {
    name: 'Starter Plan',
    cadPrice: '$59',
    period: '/month',
    description: 'Essentials for small agencies',
    features: [
      'Job database access',
      '150 employer contacts / month',
      'Basic analytics',
      'NOC-based search'
    ],
    bestFor: 'Small agencies',
    highlighted: false,
    badge: null,
    tone: 'ghost',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    name: 'Pro Plan',
    cadPrice: '$119',
    period: '/month',
    description: 'Advanced tools for growing agencies',
    features: [
      'Unlimited contacts',
      '5-year employer analytics',
      'Hiring trends (seasonal + location)',
      'NOC-based hiring insights',
      'Export employer lists'
    ],
    bestFor: 'Growing agencies',
    highlighted: true,
    badge: 'Most Popular',
    tone: 'primary',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    name: 'Advanced Intelligence',
    cadPrice: '$199',
    period: '/month',
    description: 'Precision data for top performance',
    features: [
      'Everything in Pro',
      'Top hiring employers by NOC',
      'LMIA trend tracking',
      'Market demand insights',
      'Priority data updates'
    ],
    bestFor: 'Performance-driven agencies',
    highlighted: false,
    badge: null,
    tone: 'ghost',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: 'Enterprise',
    cadPrice: 'Custom',
    description: 'Scale with confidence',
    features: [
      'Multi-user dashboard',
      'API + CRM integration',
      'White-label reports',
      'Dedicated support',
    ],
    bestFor: 'Large consultancies',
    highlighted: false,
    badge: 'Custom Solution',
    tone: 'ghost',
    icon: <Building2 className="w-5 h-5" />,
  },
];

function Price({ plan }: { plan: Plan }) {
  const value = plan.cadPrice === 'Custom' ? 'Custom' : plan.cadPrice ?? '—';

  return (
    <div className="mb-4">
      <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
        {value}
      </span>
      {plan.period && value !== 'Custom' ? (
        <span className="text-sm font-medium text-gray-500 ml-1">
          {plan.period}
        </span>
      ) : null}
    </div>
  );
}

function PlanCard({
  plan,
  index,
  onContactSales,
}: {
  plan: Plan;
  index: number;
  onContactSales?: () => void;
}) {
  return (
    <motion.div
      key={plan.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="h-full"
    >
      <HoverCard>
        <div
          className={cn(
            'relative rounded-3xl p-8 h-full flex flex-col transition-all duration-300 group',
            plan.highlighted
              ? 'bg-white shadow-xl shadow-brand-500/10 border-2 border-brand-500 scale-105 z-10'
              : 'bg-white/60 backdrop-blur-sm border border-gray-100 hover:border-brand-200 hover:shadow-lg hover:-translate-y-1'
          )}
        >
          {plan.badge && (
            <div className="absolute top-0 right-0 -mt-3 mr-4">
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm',
                  plan.highlighted
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {plan.badge}
              </span>
            </div>
          )}

          <div className="mb-6">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors", plan.highlighted ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-500")}>
              {plan.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {plan.name}
            </h2>
            <p className="text-sm text-gray-500 min-h-[40px]">
              {plan.description}
            </p>
            {plan.bestFor && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-tight border border-gray-100">
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                Best For: {plan.bestFor}
              </div>
            )}
          </div>

          <Price plan={plan} />

          <div className="w-full h-px bg-gray-100 my-6" />

          <ul className="space-y-4 mb-8 flex-1">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start text-sm text-gray-700"
              >
                <Check
                  className={cn(
                    'h-5 w-5 mr-3 flex-shrink-0',
                    plan.highlighted ? 'text-brand-500' : 'text-gray-400'
                  )}
                />
                <span className="leading-tight">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            {plan.name.includes('Enterprise') ? (
              <Button
                onClick={onContactSales}
                className={cn(
                  'w-full h-12 rounded-xl font-semibold transition-all',
                  'bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg'
                )}
              >
                Contact Sales
              </Button>
            ) : plan.name === 'Free Plan' ? (
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl font-semibold border-gray-200 hover:bg-gray-50 hover:text-gray-900 text-gray-600"
              >
                Get Started Free
              </Button>
            ) : (
              <PaymentButton
                amount={parseFloat(plan.cadPrice?.replace('$', '') || '0')}
                currency="CAD"
                planName={plan.name}
                className={cn(
                  'w-full h-12 rounded-xl font-bold shadow-md hover:shadow-xl transition-all',
                  plan.tone === 'primary'
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white'
                    : 'bg-white border-2 border-brand-100 text-brand-700 hover:border-brand-200 hover:bg-brand-50'
                )}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </PaymentButton>
            )}
          </div>
        </div>
      </HoverCard>
    </motion.div>
  );
}

function ContactSalesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-400 to-brand-600" />
        
        <DialogHeader className="px-8 pt-10 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-600">
            <Users className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">Contact Our Sales Team</DialogTitle>
          <DialogDescription className="text-gray-500 mt-2">
            Looking for a custom solution or enterprise-grade features? We're here to help you scale.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-10 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-brand-200 hover:bg-brand-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-600">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest leading-none mb-1">Sales Inquiry</p>
                <a href="mailto:info@jobmaze.ca" className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors">info@jobmaze.ca</a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-brand-200 hover:bg-brand-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-600">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest leading-none mb-1">General Support</p>
                <a href="mailto:support@jobmaze.ca" className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors">support@jobmaze.ca</a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-brand-200 hover:bg-brand-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-600">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest leading-none mb-1">Business Hours</p>
                <p className="text-sm font-semibold text-gray-900">Mon - Fri, 9:00AM - 6:00PM EST</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const PricingPage = () => {
  const { isMobile } = useMobile();
  const [showContactSales, setShowContactSales] = useState(false);

  return (
    <BackgroundWrapper>
      <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
        {/* Using a very light gray background for contrast against white cards */}
        {isMobile ? (
          <MobileHeader title="Pricing Plans" showBack={true} />
        ) : (
          <Navbar />
        )}

        <main className="flex-grow pt-32 pb-24">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-brand-50/50 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-16 lg:mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest">
                  <Zap className="w-3 h-3 fill-current" />
                  Transparent Pricing
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-l border-gray-200 pl-4">
                  Prices in CAD
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight"
              >
                Simple plans for <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">every ambition.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Choose the perfect plan to unlock comprehensive job market insights and verified employer contacts.
              </motion.p>
            </div>

            {/* Individual Plans Section */}
            <div className="mb-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-400 font-medium uppercase tracking-widest text-sm">
                  <Users className="w-4 h-4" />
                  For Job Seekers
                </div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 align-stretch">
                {individualPlans.map((plan, idx) => (
                  <PlanCard
                    key={plan.name}
                    plan={plan}
                    index={idx}
                  />
                ))}
              </div>
            </div>

            {/* Employer Plans Section */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-400 font-medium uppercase tracking-widest text-sm">
                  <Building2 className="w-4 h-4" />
                  For Agencies
                </div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {agencyPlans.map((plan, idx) => (
                  <PlanCard
                    key={plan.name}
                    plan={plan}
                    onContactSales={() => setShowContactSales(true)}
                    index={idx + individualPlans.length}
                  />
                ))}
              </div>
            </div>

            {/* FAQ / Info Section */}
            <div className="mt-24 text-center">
              <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Have questions about our plans? <a href="/contact" className="text-brand-600 hover:underline font-semibold">Contact our support team</a>
              </p>
            </div>
            
            <ContactSalesDialog open={showContactSales} onOpenChange={setShowContactSales} />
          </div>
        </main>

        {!isMobile && <Footer />}
        {isMobile && <BottomNav />}
      </div>
    </BackgroundWrapper>
  );
};

export default PricingPage;
