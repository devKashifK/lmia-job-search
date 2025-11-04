'use client';

import { motion } from 'framer-motion';
import SectionTitle from './section-title';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTableStore } from '@/context/store';
import { useUpdateCredits } from '@/hooks/use-credits';

const companyGroups = [
  {
    title: 'Tim Hortons',
    count: 4261,
    companies: ['Tim Hortons'],
    description: 'Leading coffee and quick service restaurant chain.',
  },
  {
    title: 'Subway',
    count: 2591,
    companies: ['Subway'],
    description: "World's largest submarine sandwich chain.",
  },
  {
    title: 'Mc Donalds',
    count: 1458,
    companies: ['Mc Donalds'],
    description: 'Global fast food restaurant chain.',
  },
  {
    title: 'A&W',
    count: 1068,
    companies: ['A&W'],
    description: 'Classic American fast food restaurant.',
  },
  {
    title: 'Pizza Hut',
    count: 1038,
    companies: ['Pizza Hut'],
    description: 'International pizza restaurant chain.',
  },
  {
    title: 'Dairy Queen',
    count: 962,
    companies: ['Dairy Queen'],
    description:
      'American chain of soft serve ice cream and fast food restaurants.',
  },
  {
    title: 'Jays Transportation',
    count: 865,
    companies: ['Jays Transportation'],
    description: 'Leading transportation and logistics company.',
  },
  {
    title: 'Pattison Agriculture',
    count: 839,
    companies: ['Pattison Agriculture'],
    description: 'Major agricultural equipment and services provider.',
  },
  {
    title: 'KFC',
    count: 806,
    companies: ['KFC'],
    description: 'Leading fast food restaurant chain.',
  },
];

export default function Company() {
  const router = useRouter();
  const { updateCreditsAndSearch } = useUpdateCredits();
  const handleViewDetails = (company: string) => {
    router.push(
      `/company/${encodeURIComponent(company)}?field=employer&t=trending_job`
    );
  };

  return (
    <section className="w-full flex flex-col items-center py-16 px-4 relative">
      <SectionTitle
        title="Top Companies Hiring Now"
        subtitle="Explore the latest job openings from top companies across various industries"
      />
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {companyGroups.map((group, idx) => (
          <motion.div
            key={group.title}
            whileHover={{ scale: 1.02 }}
            className={`flex-1 relative group ${
              idx % 2 === 0 ? 'md:text-right' : ''
            }`}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-500/10 to-brand-600/10 rounded-2xl transform -rotate-2 transition-transform duration-300 group-hover:rotate-0" />

            <div className="relative bg-white rounded-2xl p-5 flex flex-col transition-all h-[160px] w-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-brand-100/20 overflow-hidden group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-brand-400/5 to-brand-300/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 w-full h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-left text-xl bg-gradient-to-br from-brand-600 to-brand-500 bg-clip-text text-transparent group-hover:from-brand-500 group-hover:to-brand-400 transition-all duration-300">
                      {group.title}
                    </h3>
                    <p className="text-sm text-left text-gray-500 mt-1.5 line-clamp-2 group-hover:text-gray-600 transition-colors duration-300">
                      {group.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-center bg-gradient-to-br from-brand-50 to-brand-100/50 px-3.5 py-2.5 rounded-xl border border-brand-100 group-hover:border-brand-200 transition-all duration-300">
                    <span className="text-2xl font-bold bg-gradient-to-br from-brand-600 to-brand-500 bg-clip-text text-transparent group-hover:from-brand-500 group-hover:to-brand-400 transition-all duration-300">
                      {group.count}
                    </span>
                    <span className="text-xs font-medium text-brand-600 group-hover:text-brand-500 transition-colors duration-300">
                      Openings
                    </span>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse group-hover:bg-brand-400 transition-colors duration-300" />
                      <span className="text-sm font-medium text-brand-600 group-hover:text-brand-500 transition-colors duration-300">
                        Actively hiring
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors duration-300"
                      onClick={() => {
                        updateCreditsAndSearch(group.title);
                        handleViewDetails(group.title);
                      }}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
