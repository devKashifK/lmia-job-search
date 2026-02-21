'use client';
import React from 'react';
import SectionTitle from './section-title';
import { motion } from 'framer-motion';
import {
  Utensils,
  ChefHat,
  Briefcase,
  Coffee,
  Calculator,
  Store,
  Truck,
  Soup,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTableStore } from '@/context/store';
import { useUpdateCredits } from '@/hooks/use-credits';
const popularProfiles = [
  {
    job_title: 'Food Service Supervisor',
    count: 15184,
    description:
      'Supervise, coordinate, and schedule the activities of staff who prepare, portion, and serve food.',
    icon: Utensils,
  },
  {
    job_title: 'Cook',
    count: 14459,
    description:
      'Prepare and cook complete meals or individual dishes and foods in restaurants or other establishments.',
    icon: ChefHat,
  },
  {
    job_title: 'Administrative Assistant',
    count: 8031,
    description:
      'Carry out office administrative tasks and support management and staff in daily operations.',
    icon: Briefcase,
  },
  {
    job_title: 'Food Counter Attendant',
    count: 7882,
    description:
      'Take customer orders, serve food and beverages, and handle payments at counters in fast food outlets.',
    icon: Coffee,
  },
  {
    job_title: 'Bookkeeper',
    count: 5427,
    description:
      'Maintain financial records, prepare financial statements, and manage accounts for businesses.',
    icon: Calculator,
  },
  {
    job_title: 'Food Service Supervisors',
    count: 5356,
    description:
      'Oversee food service operations and ensure quality and safety standards are met.',
    icon: Store,
  },
  {
    job_title: 'Truck Driver',
    count: 5144,
    description:
      'Operate heavy trucks to transport goods and materials over urban, interurban, and provincial routes.',
    icon: Truck,
  },
  {
    job_title: 'Kitchen Helper',
    count: 4953,
    description:
      'Assist in the kitchen by preparing ingredients, cleaning, and supporting cooks and chefs.',
    icon: Soup,
  },
  {
    job_title: 'Retail Store Supervisor',
    count: 4227,
    description:
      'Supervise and coordinate the activities of workers in retail sales establishments.',
    icon: ShoppingBag,
  },
];

export default function PopularProfile() {
  const router = useRouter();
  const { updateCreditsAndSearch } = useUpdateCredits();
  const { setFilterPanelConfig, setDataConfig } = useTableStore();
  return (
    <section className="w-full flex flex-col items-center px-4 py-16 relative bg-gradient-to-b from-white to-gray-50/50">
      <SectionTitle
        title="Popular Profiles"
        subtitle="Explore the latest job openings from top companies across various industries"
      />

      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-0 sm:px-0 lg:px-8">
        {popularProfiles.map((group, idx) => {
          const Icon = group.icon;
          return (
            <motion.div
              key={group.job_title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="flex-1 relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-500/20 via-brand-400/10 to-brand-300/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500" />

              <div className="relative bg-white rounded-2xl p-6 flex flex-col transition-all h-[280px] w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-100/30 overflow-hidden group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-brand-400/5 to-brand-300/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 w-full h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-xl text-brand-600 group-hover:from-brand-100 group-hover:to-brand-200/50 transition-colors duration-300 shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-brand-600 group-hover:text-brand-500 transition-colors duration-300 truncate">
                        {group.job_title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="px-3.5 py-1 bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-full border border-brand-100/50">
                          <span className="text-base font-semibold text-brand-600">
                            {group.count.toLocaleString()}
                          </span>
                          <span className="text-xs text-brand-500 ml-1">
                            openings
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">
                      {group.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
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
                          updateCreditsAndSearch(group.job_title);
                          router.push(
                            `/roles/${encodeURIComponent(group.job_title)}`
                          );
                          setFilterPanelConfig({
                            column: 'job_title',
                            table: 'hot_leads_new',
                            keyword: group.job_title,
                            type: 'hot_leads',
                            method: 'query',
                          });
                          setDataConfig({
                            type: 'hot_leads',
                            table: 'hot_leads_new',
                            columns: JSON.stringify([
                              {
                                job_title: group.job_title,
                              },
                            ]),
                            keyword: group.job_title,
                            method: 'query',
                            year: '',
                            page: '1',
                            pageSize: '100',
                          });
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
          );
        })}
      </div>
    </section>
  );
}
