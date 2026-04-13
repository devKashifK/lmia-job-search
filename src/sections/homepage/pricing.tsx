"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, Users, Building2, Zap, ArrowRight, Sparkles, User, Mail } from "lucide-react";
import SectionTitle from "@/components/ui/section-title";
import { cn } from "@/lib/utils";
import useMobile from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { INDIVIDUAL_PLANS, AGENCY_PLANS, PlanInterval, Plan } from "@/config/plans";

export default function Pricing() {
  const router = useRouter();
  const [interval, setInterval] = useState<PlanInterval>('monthly');
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) return null;

  const renderPlans = (plans: Plan[], isAgency = false) => (
    <div className={cn(
      "grid grid-cols-1 gap-6",
      isAgency ? "md:grid-cols-3 max-w-5xl mx-auto" : "md:grid-cols-2 lg:grid-cols-4"
    )}>
      {plans.map((plan, i) => {
        const price = interval === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
        
        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative flex flex-col p-8 rounded-3xl border transition-all duration-300",
              plan.popular
                ? "bg-white border-brand-200 shadow-xl shadow-brand-100/50 ring-2 ring-brand-100/30 scale-105 z-10"
                : "bg-white/50 border-gray-100 hover:bg-white hover:border-brand-200 hover:shadow-lg"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 -mt-3.5 mr-6 bg-brand-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-brand-200">
                Most Popular
              </div>
            )}
            {plan.badge && !plan.popular && (
              <div className="absolute top-0 right-0 -mt-3.5 mr-6 bg-brand-50 text-brand-700 border border-brand-100 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                {plan.badge}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-xs text-gray-500 font-medium line-clamp-2 h-8">{plan.description}</p>
              
              <div className="mt-6 flex flex-col">
                <div className="flex items-baseline text-gray-900">
                  <span className="text-4xl font-extrabold tracking-tight">CAD ${price}</span>
                  <span className="ml-1 text-sm font-medium text-gray-500">/{interval === 'monthly' ? 'mo' : 'mo'}</span>
                </div>
                {interval === 'annual' && !isAgency && price > 0 && (
                  <p className="text-[10px] font-bold text-brand-600 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Billed annually
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-8">
               <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-brand-50/50 border border-brand-100/30">
                  {isAgency ? <Users className="w-3.5 h-3.5 text-brand-600" /> : <Zap className="w-3.5 h-3.5 text-brand-600" />}
                  <span className="text-[11px] font-bold text-brand-700">
                     {interval === 'annual' ? plan.credits.monthly + (plan.credits.bonusAnnual || 0) : plan.credits.monthly} {isAgency ? 'Shared ' : ''}Credits/mo
                  </span>
               </div>
               {plan.employerContacts > 0 && (
                 <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-purple-50/50 border border-purple-100/30">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[11px] font-bold text-purple-700">
                       {plan.employerContacts > 5000 ? 'Unlimited' : plan.employerContacts} Employer Contacts
                    </span>
                 </div>
               )}
            </div>

            <ul className="space-y-3.5 mb-8 flex-1">
              {plan.features.slice(0, isAgency ? 6 : 5).map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className={cn("flex-shrink-0 w-4 h-4 mr-3 mt-0.5", plan.popular ? "text-brand-600" : "text-gray-400")} />
                  <span className="text-gray-600 text-xs font-semibold leading-tight">
                    {feature.text}
                    {feature.upcoming && (
                      <span className="ml-1.5 inline-flex items-center px-1 py-0.5 rounded text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tighter">
                        Soon
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => router.push('/pricing')}
              className={cn(
              "w-full py-4 rounded-xl font-bold text-sm transition-all group/btn",
              plan.tone === 'primary'
                ? "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-200/50"
                : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-100"
            )}>
              <span className="flex items-center justify-center gap-2">
                {isAgency ? (plan.id === 'agency_elite' ? 'Contact Sales' : 'Start Trial') : 'Get Started'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-brand-50/50 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <SectionTitle
          badge="Pricing Plans"
          title={<>Simple, <span className="text-brand-600">Transparent</span> Plans</>}
          subtitle="Choose the perfect plan to accelerate your career or talent acquisition."
        />

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16 mt-8">
          <span className={cn("text-sm font-bold transition-colors", interval === 'monthly' ? "text-gray-900" : "text-gray-400")}>Monthly</span>
          <button
            onClick={() => setInterval(interval === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-14 h-7 rounded-full bg-gray-100 border border-gray-200 p-1 transition-colors hover:border-brand-200"
          >
            <motion.div
              animate={{ x: interval === 'monthly' ? 0 : 28 }}
              className="w-5 h-5 rounded-full bg-brand-600"
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-bold transition-colors", interval === 'annual' ? "text-gray-900" : "text-gray-400")}>Annual</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-tight border border-emerald-100 shadow-sm animate-pulse-subtle">
              Save up to 25%
            </span>
          </div>
        </div>

        {/* Individual Plans */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-10 justify-center">
            <div className="h-px w-10 bg-gray-200 hidden md:block" />
            <User className="w-5 h-5 text-brand-600" />
            <h4 className="text-lg font-bold text-gray-400 uppercase tracking-[0.2em]">For Individuals</h4>
            <div className="h-px w-10 bg-gray-200 hidden md:block" />
          </div>
          {renderPlans(INDIVIDUAL_PLANS)}
        </div>

        {/* Agency Plans */}
        <div>
          <div className="flex items-center gap-3 mb-10 justify-center">
            <div className="h-px w-10 bg-gray-200 hidden md:block" />
            <Building2 className="w-5 h-5 text-brand-600" />
            <h4 className="text-lg font-bold text-gray-400 uppercase tracking-[0.2em]">For Agencies</h4>
            <div className="h-px w-10 bg-gray-200 hidden md:block" />
          </div>
          {renderPlans(AGENCY_PLANS, true)}
        </div>

        <div className="mt-20 text-center">
          <p className="text-sm font-semibold text-gray-400 flex items-center justify-center gap-2">
            <Info className="w-4 h-4" />
            Launch Offer: First Month Free on all paid plans. Limited time only.
          </p>
        </div>
      </div>
    </section>
  );
}
