'use client';

import {
  Building2,
  Globe,
  Flame,
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
    <section className={isMobile ? "py-10 relative bg-gradient-to-b from-white to-gray-50/50" : "py-20 relative bg-gradient-to-b from-white to-gray-50/50"}>
      <div className={isMobile ? "max-w-full mx-auto px-4" : "max-w-full mx-auto px-16"}>
        <SectionTitle
          title="What JobMaze Offers"
          subtitle="Three pillars of intelligent job search"
        />
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={isMobile ? "mt-6 grid grid-cols-1 gap-4" : "mt-12 grid grid-cols-1 md:grid-cols-3 gap-10"}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className={isMobile ? "relative group rounded-xl shadow-sm p-0 flex flex-col" : `relative group rounded-2xl shadow-sm col-span-1 p-0 flex flex-col`}
            >
              {/* Tilted brand background effect */}
              <div className={isMobile ? "absolute inset-0 bg-gradient-to-br from-brand-500/10 via-brand-400/10 to-brand-300/10 rounded-xl pointer-events-none" : "absolute inset-0 bg-gradient-to-br from-brand-500/10 via-brand-400/10 to-brand-300/10 rounded-2xl -rotate-2 group-hover:rotate-0 transition-transform duration-300 pointer-events-none"} />
              {/* Card content */}
              <div className={isMobile ? "relative bg-white rounded-xl p-4 flex flex-col h-full border border-brand-100/20 overflow-hidden" : "relative bg-white rounded-2xl p-6 flex flex-col h-full border border-brand-100/20 overflow-hidden group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"}>
                <div className={isMobile ? "flex items-center gap-2 mb-3" : "flex items-center gap-3 mb-4"}>
                  <div className={isMobile ? "rounded-lg p-1.5 bg-gradient-to-br from-brand-500 to-brand-600 shadow text-white" : "rounded-lg p-2 bg-gradient-to-br from-brand-500 to-brand-600 shadow text-white"}>
                    <feature.icon className={isMobile ? "w-4 h-4" : "w-6 h-6"} />
                  </div>
                  <h3 className={isMobile ? "font-bold text-sm text-brand-600" : "font-bold text-lg text-brand-600"}>
                    {feature.title}
                  </h3>
                </div>
                <p className={isMobile ? "text-xs mb-2 opacity-80 text-gray-700" : "text-sm mb-3 opacity-80 text-gray-700"}>
                  {feature.description}
                </p>
                {feature.content && (
                  <div className="flex-1 mt-auto">{feature.content}</div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
