import React from 'react';
import { motion } from 'framer-motion';
import { Building, Car, Hospital, Store, Utensils, Wheat } from 'lucide-react';
import { useUpdateCredits } from '@/hooks/use-credits';
import { useRouter } from 'next/navigation';

const categories = [
  {
    icon: <Car className="h-5 w-5" />,
    noc_priority: 'Automotive_Maintenance',
    bg: 'bg-brand-50',
  },
  {
    icon: <Building className="h-5 w-5" />,
    noc_priority: 'Construction',
    bg: 'bg-brand-50',
  },
  {
    icon: <Wheat className="h-5 w-5" />,
    noc_priority: 'Farm',
    bg: 'bg-brand-50',
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    noc_priority: 'F&B',
    bg: 'bg-brand-50',
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    noc_priority: 'Food Processing',
    bg: 'bg-brand-50',
  },
  {
    icon: <Hospital className="h-5 w-5" />,
    noc_priority: 'Healthcare',
    bg: 'bg-brand-50',
  },
  {
    icon: <Store className="h-5 w-5" />,
    noc_priority: 'Office_Retail',
    bg: 'bg-brand-50',
  },
];

function CategoryBox({
  searchType,
  dateFrom,
  dateTo,
  location,
}: {
  searchType: 'hot_leads' | 'lmia';
  dateFrom?: string;
  dateTo?: string;
  location: string;
}) {
  const { updateCreditsAndSearch } = useUpdateCredits();
  const router = useRouter();

  const handleCategoryClick = (category: { noc_priority: string }) => {
    updateCreditsAndSearch(category.noc_priority);
    if (searchType === 'hot_leads') {
      const qs = new URLSearchParams({
        field: 'category',
        t: 'trending_job',
      });
      if (location.trim()) qs.set('loc', location.trim());
      if (dateFrom && dateTo) {
        qs.set('date_from', dateFrom);
        qs.set('date_to', dateTo);
      }
      router.push(
        `/search/hot-leads/${encodeURIComponent(
          category.noc_priority
        )}?${qs.toString()}`
      );
    } else {
      const qs = new URLSearchParams();
      if (location.trim()) qs.set('loc', location.trim());
      const base = `/search/lmia/${encodeURIComponent(category.noc_priority)}`;
      router.push(qs.toString() ? `${base}?${qs.toString()}` : base);
    }
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl">
      {categories.map((category, index) => (
        <motion.button
          key={category.noc_priority}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + index * 0.05, duration: 0.3 }}
          whileHover={{
            scale: 1.02,
            backgroundColor: 'rgb(249 250 251)',
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            handleCategoryClick({ noc_priority: category.noc_priority })
          }
          className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-300 transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-100 text-brand-600">
            {category.icon}
          </div>
          <div className="w-full">
            <div className="font-medium text-gray-900 text-sm text-center">
              {category.noc_priority.replace(/_/g, ' ')}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export default CategoryBox;
