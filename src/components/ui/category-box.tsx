import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Baby,
  Briefcase,
  Building,
  Calculator,
  Car,
  ChevronDown,
  ChevronUp,
  Coffee,
  Cog,
  DollarSign,
  Droplet,
  Dumbbell,
  Factory,
  Flame,
  Flower,
  GraduationCap,
  HardHat,
  Heart,
  HeartHandshake,
  Hospital,
  Hotel,
  Laptop,
  LayoutGrid,
  Leaf,
  Megaphone,
  MoreHorizontal,
  Palette,
  PenTool,
  Scale,
  Shield,
  SprayCan,
  Star,
  Stethoscope,
  Store,
  Truck,
  UserCog,
  Users,
  Utensils,
  Wheat,
  Wrench,
} from 'lucide-react';
import { useUpdateCredits } from '@/hooks/use-credits';
import { useRouter } from 'next/navigation';

const categories = [
  { icon: <Wheat className="h-5 w-5" />, noc_priority: 'Agriculture', label: 'Agriculture', bg: 'bg-brand-50' },
  { icon: <Palette className="h-5 w-5" />, noc_priority: 'Art', label: 'Art', bg: 'bg-brand-50' },
  { icon: <Car className="h-5 w-5" />, noc_priority: 'Automotive', label: 'Automotive', bg: 'bg-brand-50' },
  { icon: <Star className="h-5 w-5" />, noc_priority: 'Beauty', label: 'Beauty', bg: 'bg-brand-50' },
  { icon: <Briefcase className="h-5 w-5" />, noc_priority: 'Business', label: 'Business', bg: 'bg-brand-50' },
  { icon: <HardHat className="h-5 w-5" />, noc_priority: 'Construction', label: 'Construction', bg: 'bg-brand-50' },
  { icon: <PenTool className="h-5 w-5" />, noc_priority: 'Design', label: 'Design', bg: 'bg-brand-50' },
  { icon: <GraduationCap className="h-5 w-5" />, noc_priority: 'Education', label: 'Education', bg: 'bg-brand-50' },
  { icon: <Cog className="h-5 w-5" />, noc_priority: 'Engineering', label: 'Engineering', bg: 'bg-brand-50' },
  { icon: <Leaf className="h-5 w-5" />, noc_priority: 'Environmental', label: 'Environmental', bg: 'bg-brand-50' },
  { icon: <Utensils className="h-5 w-5" />, noc_priority: 'F&B', label: 'F&B', bg: 'bg-brand-50' },
  { icon: <DollarSign className="h-5 w-5" />, noc_priority: 'Finance', label: 'Finance', bg: 'bg-brand-50' },
  { icon: <Users className="h-5 w-5" />, noc_priority: 'HR', label: 'HR', bg: 'bg-brand-50' },
  { icon: <Stethoscope className="h-5 w-5" />, noc_priority: 'Healthcare', label: 'Healthcare', bg: 'bg-brand-50' },
  { icon: <Hotel className="h-5 w-5" />, noc_priority: 'Hospitality', label: 'Hospitality', bg: 'bg-brand-50' },
  { icon: <Laptop className="h-5 w-5" />, noc_priority: 'IT', label: 'IT', bg: 'bg-brand-50' },
  { icon: <UserCog className="h-5 w-5" />, noc_priority: 'Management', label: 'Management', bg: 'bg-brand-50' },
  { icon: <Factory className="h-5 w-5" />, noc_priority: 'Manufacturing', label: 'Manufacturing', bg: 'bg-brand-50' },
  { icon: <Megaphone className="h-5 w-5" />, noc_priority: 'Marketing', label: 'Marketing', bg: 'bg-brand-50' },
  { icon: <Store className="h-5 w-5" />, noc_priority: 'Office & Retail', label: 'Office & Retail', bg: 'bg-brand-50' },
  { icon: <Droplet className="h-5 w-5" />, noc_priority: 'Oil & Gas', label: 'Oil & Gas', bg: 'bg-brand-50' },
  { icon: <MoreHorizontal className="h-5 w-5" />, noc_priority: 'Other', label: 'Other', bg: 'bg-brand-50' },
  { icon: <Shield className="h-5 w-5" />, noc_priority: 'Security', label: 'Security', bg: 'bg-brand-50' },
  { icon: <HeartHandshake className="h-5 w-5" />, noc_priority: 'Social Services', label: 'Social Services', bg: 'bg-brand-50' },
  { icon: <Dumbbell className="h-5 w-5" />, noc_priority: 'Sports & Fitness', label: 'Sports & Fitness', bg: 'bg-brand-50' },
  { icon: <Truck className="h-5 w-5" />, noc_priority: 'Transportation & Logistics', label: 'Transportation & Logistics', bg: 'bg-brand-50' },
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
  const [showAll, setShowAll] = useState(false);

  // Show first 10, or all if expanded
  const visibleCategories = showAll ? categories : categories.slice(0, 10);

  const handleCategoryClick = (category: { noc_priority: string }) => {
    updateCreditsAndSearch(category.noc_priority);
    if (searchType === 'hot_leads') {
      const qs = new URLSearchParams({
        field: 'category',
        t: 'trending_job',
      });
      if (location?.trim()) qs.set('loc', location.trim());
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
      if (location?.trim()) qs.set('loc', location.trim());
      const base = `/search/lmia/${encodeURIComponent(category.noc_priority)}`;
      router.push(qs.toString() ? `${base}?${qs.toString()}` : base);
    }
  };

  return (
    <div className="pb-6 px-10 mt-8">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div className="p-2 rounded-xl bg-gradient-to-r from-brand-100 to-brand-200 shadow-lg shadow-brand-500/20">
              <LayoutGrid className="w-5 h-5 text-brand-600" />
            </div>
          </motion.div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              Popular Categories
            </h3>
            <p className="text-sm text-gray-500">
              Find jobs by industry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <AnimatePresence>
            {visibleCategories.map((category, index) => (
              <motion.button
                key={category.noc_priority}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: 'rgb(249 250 251)',
                  borderColor: 'rgb(134 239 172)', // brand-300 approx
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  handleCategoryClick({ noc_priority: category.noc_priority })
                }
                className="flex flex-col items-center gap-3 p-3 lg:p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                  {category.icon}
                </div>
                <div className="w-full text-center">
                  <div className="font-medium text-gray-900 text-sm group-hover:text-brand-700 transition-colors">
                    {category.label}
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {categories.length > 10 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show More Categories <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoryBox;
