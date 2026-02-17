'use client';

import {
  Building2,
  Globe,
  Flame,
  CheckCircle2,
  Bell,
  FileSearch,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/ui/section-title';
import useMobile from '@/hooks/use-mobile';

const features = [
  {
    title: 'LMIA-Based Hiring Opportunities',
    description: `Explore Canadian employers that have historically hired foreign workers or may consider LMIA-based hiring — subject to IRCC rules and employer discretion.`,
    icon: Building2,
    span: 'col-span-1 row-span-1',
    content: (
      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Employer hiring history
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Role & location patterns
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          No job or LMIA guarantees
        </li>
      </ul>
    ),
  },
  {
    title: 'Jobs Open to Global Candidates',
    description:
      'Find Canadian job opportunities that are open to applicants worldwide, including remote, hybrid, and global talent roles.',
    icon: Globe,
    span: 'col-span-1 row-span-1',
    content: (
      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Open international eligibility
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Employer preference visibility
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Clear application scope
        </li>
      </ul>
    ),
  },
  {
    title: 'Hot & High-Demand Jobs in Canada',
    description:
      'Identify roles and regions with strong and consistent hiring demand based on multi-year data.',
    icon: Flame,
    span: 'col-span-1 row-span-1',
    content: (
      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          High-frequency hiring roles
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Province & city demand
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Trend-based insights
        </li>
      </ul>
    ),
  },
  {
    title: 'Smart Job Alerts',
    description:
      'Never miss an opportunity. Get notified instantly when verified employers post jobs matching your specific criteria.',
    icon: Bell,
    span: 'col-span-1 row-span-1',
    content: (
      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Instant Email Notifications
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Custom Criteria Filters
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Verified Employer Tracking
        </li>
      </ul>
    ),
  },
  {
    title: 'AI Resume Analysis',
    description:
      'Optimize your profile. Get instant feedback on your resume\'s compatibility with Canadian job market standards.',
    icon: FileSearch,
    span: 'col-span-1 row-span-1',
    content: (
      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Parses & Scores Resume
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Suggests Missing Keywords
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Extracts Key Skills
        </li>
      </ul>
    ),
  },
  {
    title: 'Tailored Recommendations',
    description:
      'Discover your path. Receive personalized industry and TEER suggestions based on your unique profile.',
    icon: Sparkles,
    span: 'col-span-1 row-span-1',
    content: (
      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Industry Matching
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          TEER Category Suggestions
        </li>
        <li className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          NOC Code Alignment
        </li>
      </ul>
    ),
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Features() {
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) {
    return null;
  }

  return (
    <section className="relative py-16 bg-white overflow-hidden">
      {/* Background Decor - Subtle Light Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50/50 via-white to-transparent pointer-events-none" />

      <div className={isMobile ? "w-full px-4 relative z-10" : "max-w-7xl mx-auto px-6 lg:px-8 relative z-10"}>
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-brand-700 font-bold">Market Intelligence</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Intelligence. Not just <span className="text-brand-600 relative inline-block">
              jobs
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
            </span>.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-light">
            We process millions of data points to give you the signal, not the noise. Discover opportunities hidden in plain sight.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="relative group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-start text-left"
              whileHover={{ y: -5 }}
            >
              {/* Hover Gradient Border Effect (Subtle) */}
              <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-transparent group-hover:ring-brand-200/50 transition-all duration-300 pointer-events-none" />

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 shadow-sm ${index === 0 ? 'bg-blue-50 text-blue-600' :
                index === 1 ? 'bg-purple-50 text-purple-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                <feature.icon className="w-7 h-7" strokeWidth={1.5} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-brand-600 transition-colors">
                {feature.title}
              </h3>

              <p className="text-gray-500 mb-8 leading-relaxed text-sm font-medium">
                {feature.description}
              </p>

              <div className="mt-auto pt-6 border-t border-gray-50 w-full bg-gray-50/50 -mx-8 -mb-8 p-8 rounded-b-[2rem] group-hover:bg-gray-50 transition-colors">
                <div className="space-y-3">
                  {index === 0 && (
                    <>
                      <div className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Hiring History Analysis</div>
                      <div className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Compliance Risk Checks</div>
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <div className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Remote & Hybrid Roles</div>
                      <div className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Global Talent Stream</div>
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <div className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Demand Heatmaps</div>
                      <div className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle2 className="w-4 h-4 text-orange-500" /> 5-Year Wage Trends</div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
