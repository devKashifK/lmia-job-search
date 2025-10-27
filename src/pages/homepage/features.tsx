'use client';

import {
  Search,
  BarChart2,
  Newspaper,
  Lock,
  Wand2,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/ui/section-title';

const features = [
  {
    title: 'Advance Search',
    description: `Instantly find jobs by title, company, NOC code, or city. Use advanced filters to narrow results and discover the most relevant opportunities for your career goals. Easily combine multiple criteria, such as job type, location, and employer, to pinpoint exactly what you're looking for. Our search engine is optimized for speed and accuracy, ensuring you never miss a match.`,
    icon: Search,
    span: 'col-span-2 row-span-1',
    content: null,
  },
  {
    title: 'Dynamic Charts',
    description:
      'Explore trends, compare salaries, and analyze hiring patterns with beautiful, easy-to-understand charts that update as you search.',
    icon: BarChart2,
    span: 'col-span-1 row-span-1',
    content: null,
  },
  {
    title: 'Latest Job Details',
    description:
      'Access up-to-date listings, employer profiles, and job requirements. Never miss a new opportunity with real-time updates and detailed job insights.',
    icon: Newspaper,
    span: 'col-span-1 row-span-1',
    content: null,
  },
  {
    title: 'Premium Information',
    description: `View hidden contact details, company analytics, and insider information available only to premium users, giving you a competitive edge in your job search. Unlock access to recruiter emails, phone numbers, and in-depth company data. Premium members also receive exclusive insights, such as salary benchmarks and hiring trends, to help you make informed decisions.`,
    icon: Lock,
    span: 'col-span-2 row-span-1',
    content: null,
  },
  {
    title: 'Smart Search',
    description: `Get intelligent recommendations as you type, with personalized job matches and employer suggestions based on your profile and preferences. Our AI-powered engine learns from your activity and preferences, offering smarter suggestions and highlighting jobs you're most likely to be interested in. Save time and discover hidden opportunities tailored just for you.`,
    icon: Wand2,
    span: 'col-span-2 row-span-1',
    content: null,
  },
  {
    title: 'Real-Time Filtering',
    description:
      'Refine your search on the fly—adjust filters for salary, location, job type, and more, and see results update instantly for a seamless experience.',
    icon: Filter,
    span: 'col-span-1 row-span-1',
    content: null,
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
  return (
    <section className="py-20 relative bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-full mx-auto px-16">
        <SectionTitle
          title="Powerful Features for Enhanced Job Search"
          subtitle="Everything you need to streamline your job search experience"
        />
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 grid-rows-6 md:grid-rows-3 gap-10 auto-rows-[minmax(160px,1fr)]"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className={`relative group rounded-2xl shadow-sm ${feature.span} p-0 flex flex-col`}
            >
              {/* Tilted brand background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-brand-400/10 to-brand-300/10 rounded-2xl -rotate-2 group-hover:rotate-0 transition-transform duration-300 pointer-events-none" />
              {/* Card content */}
              <div className="relative bg-white rounded-2xl p-6 flex flex-col h-full border border-brand-100/20 overflow-hidden group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg p-2 bg-gradient-to-br from-brand-500 to-brand-600 shadow text-white">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-brand-600">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm mb-3 opacity-80 text-gray-700">
                  {feature.description}
                </p>
                {feature.content && (
                  <div className="flex-1">{feature.content}</div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
