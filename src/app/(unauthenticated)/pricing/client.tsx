'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Zap, Users, Building2, HelpCircle, Clock, Mail, Sparkles, User, Shield, Info } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { INDIVIDUAL_PLANS, AGENCY_PLANS, PlanInterval, LAUNCH_OFFER } from '@/config/plans';

function Price({ 
  amount, 
  interval,
  isAgency = false
}: { 
  amount: number; 
  interval: PlanInterval;
  isAgency?: boolean;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline">
        <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
          CAD ${amount}
        </span>
        <span className="text-sm font-medium text-gray-500 ml-1">
          /{interval === 'monthly' ? 'mo' : 'mo'}
        </span>
      </div>
      {interval === 'annual' && !isAgency && amount > 0 && (
        <p className="text-[10px] font-bold text-brand-600 mt-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Billed annually
        </p>
      )}
    </div>
  );
}

function FeatureList({ features, highlighted }: { features: any[], highlighted?: boolean }) {
  return (
    <ul className="space-y-3 mb-8 flex-1">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start text-sm text-gray-700 font-medium">
          <Check className={cn('h-5 w-5 mr-3 flex-shrink-0', highlighted ? 'text-brand-600' : 'text-gray-400')} />
          <span className="leading-tight flex items-center gap-2">
            {feature.text}
            {feature.upcoming && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tighter shrink-0 ring-1 ring-amber-100/50">
                Upcoming
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
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
          <DialogDescription className="text-gray-500 mt-2 font-medium">
            Looking for a custom solution or enterprise-grade features? We're here to help you scale.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-10 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-brand-300 hover:bg-brand-50/20 transition-all">
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
  const [interval, setInterval] = useState<PlanInterval>('monthly');

  return (
    <BackgroundWrapper>
      <div className="min-h-screen flex flex-col bg-white font-inter">
        {isMobile ? (
          <MobileHeader title="Pricing Plans" showBack={true} />
        ) : (
          <Navbar />
        )}

        <main className="flex-grow pt-32 pb-24">
          <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-16 lg:mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest border border-brand-100 shadow-sm">
                  <Zap className="w-3 h-3 fill-current" />
                  Launch Offer: First Month Free
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-extrabold text-[#0D1B3E] mb-6 tracking-tight"
              >
                Simple plans for <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-[#0D1B3E]">every ambition.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
              >
                Choose the perfect plan to unlock comprehensive job market insights and verified employer contacts. All paid plans include <span className="text-brand-600 font-bold">double welcome credits</span> for a limited time.
              </motion.p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <span className={cn("text-sm font-bold transition-colors", interval === 'monthly' ? "text-gray-900" : "text-gray-400")}>Monthly</span>
                <button
                  onClick={() => setInterval(interval === 'monthly' ? 'annual' : 'monthly')}
                  className="relative w-14 h-7 rounded-full bg-gray-100 border border-gray-200 p-1 transition-colors hover:border-brand-200"
                >
                  <motion.div
                    animate={{ x: interval === 'monthly' ? 0 : 28 }}
                    className="w-5 h-5 rounded-full bg-brand-600 shadow-sm"
                  />
                </button>
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm font-bold transition-colors", interval === 'annual' ? "text-gray-900" : "text-gray-400")}>Annual</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-tight border border-emerald-100 shadow-sm">
                    Save up to 25%
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Plans Section */}
            <div className="mb-24">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-gray-100" />
                <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  <User className="w-3.5 h-3.5" />
                  For Individual Candidates
                </div>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {INDIVIDUAL_PLANS.map((plan, idx) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "relative rounded-3xl p-8 flex flex-col transition-all duration-300 border shadow-sm hover:shadow-xl",
                      plan.popular ? "bg-white border-brand-200 ring-4 ring-brand-100/30 scale-105 z-10" : "bg-white/50 border-gray-100 hover:border-brand-100 hover:bg-white"
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute top-0 right-0 -mt-3 mr-6">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm", plan.popular ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600")}>
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 mb-4 h-8 line-clamp-2 font-medium">{plan.description}</p>
                      <Price 
                        amount={interval === 'monthly' ? plan.monthlyPrice : plan.annualPrice} 
                        interval={interval} 
                      />
                    </div>

                    <div className="flex flex-col gap-2 mb-8">
                       <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-brand-50/50 border border-brand-100/30">
                          <Zap className="w-3.5 h-3.5 text-brand-600" />
                          <span className="text-[11px] font-bold text-brand-700">
                             {interval === 'annual' ? plan.credits.monthly + (plan.credits.bonusAnnual || 0) : plan.credits.monthly} Credits/mo
                          </span>
                       </div>
                       {plan.employerContacts > 0 && (
                         <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-purple-50/50 border border-purple-100/30">
                            <Mail className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-[11px] font-bold text-purple-700">
                               {plan.employerContacts} Employer Contacts
                            </span>
                         </div>
                       )}
                    </div>

                    <FeatureList features={plan.features} highlighted={plan.popular} />

                    <div className="mt-auto">
                      <PaymentButton
                        amount={interval === 'monthly' ? (interval === 'monthly' ? plan.monthlyPrice : plan.totalAnnualPrice) : plan.totalAnnualPrice}
                        currency="CAD"
                        planName={`${plan.name} (${interval})`}
                        className={cn(
                          "w-full h-11 rounded-xl font-bold transition-all",
                          plan.tone === 'primary' ? "bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-200" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {plan.monthlyPrice === 0 ? 'Get Started Free' : 'Subscribe Now'}
                      </PaymentButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Agency Plans Section */}
            <div>
              <div className="flex items-center gap-4 mb-10 text-center">
                <div className="h-px flex-1 bg-gray-100" />
                <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  <Building2 className="w-3.5 h-3.5" />
                  For Recruitment Agencies
                </div>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {AGENCY_PLANS.map((plan, idx) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "relative rounded-3xl p-8 flex flex-col transition-all duration-300 border shadow-sm hover:shadow-xl",
                      plan.popular ? "bg-white border-brand-200 ring-4 ring-brand-100/30 scale-105 z-10" : "bg-white/50 border-gray-100 hover:border-brand-100 hover:bg-white"
                    )}
                  >
                     {plan.badge && (
                      <div className="absolute top-0 right-0 -mt-3 mr-6">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm", plan.popular ? "bg-brand-600 text-white" : "bg-amber-100 text-amber-700 border border-amber-200")}>
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 mb-4 h-8 line-clamp-2 font-medium">{plan.description}</p>
                      <Price 
                        amount={interval === 'monthly' ? plan.monthlyPrice : plan.annualPrice} 
                        interval={interval} 
                        isAgency={true}
                      />
                    </div>

                    <div className="flex flex-col gap-2 mb-8">
                       <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-brand-50/50 border border-brand-100/30">
                          <Users className="w-3.5 h-3.5 text-brand-600" />
                          <span className="text-[11px] font-bold text-brand-700">
                             {interval === 'annual' ? plan.credits.monthly + (plan.credits.bonusAnnual || 0) : plan.credits.monthly} Shared Credits/mo
                          </span>
                       </div>
                       <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-purple-50/50 border border-purple-100/30">
                          <Mail className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-[11px] font-bold text-purple-700">
                             {plan.employerContacts > 5000 ? 'Unlimited' : plan.employerContacts} Employer Contacts
                          </span>
                       </div>
                    </div>

                    <FeatureList features={plan.features} highlighted={plan.popular} />

                    <div className="mt-auto">
                      <Button
                        onClick={() => plan.id === 'agency_elite' ? setShowContactSales(true) : null}
                        className={cn(
                          "w-full h-11 rounded-xl font-bold transition-all shadow-md",
                          plan.tone === 'primary' ? "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {plan.id === 'agency_elite' ? 'Contact Sales' : 'Start Trial'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FAQ / Info Section */}
            <div className="mt-24 text-center">
              <p className="text-gray-500 text-sm flex items-center justify-center gap-2 font-medium">
                <HelpCircle className="w-4 h-4" />
                Have questions about our plans? <Link href="/contact" className="text-brand-600 hover:underline font-semibold">Contact our support team</Link>
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
