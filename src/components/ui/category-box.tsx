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
import { cn } from '@/lib/utils';

const categories = [
  { icon: <Wheat className="h-5 w-5" />, noc_priority: 'Agriculture', label: 'Agriculture' },
  { icon: <Palette className="h-5 w-5" />, noc_priority: 'Art', label: 'Art' },
  { icon: <Car className="h-5 w-5" />, noc_priority: 'Automotive', label: 'Automotive' },
  { icon: <Star className="h-5 w-5" />, noc_priority: 'Beauty', label: 'Beauty' },
  { icon: <Briefcase className="h-5 w-5" />, noc_priority: 'Business', label: 'Business' },
  { icon: <HardHat className="h-5 w-5" />, noc_priority: 'Construction', label: 'Construction' },
  { icon: <PenTool className="h-5 w-5" />, noc_priority: 'Design', label: 'Design' },
  { icon: <GraduationCap className="h-5 w-5" />, noc_priority: 'Education', label: 'Education' },
  { icon: <Cog className="h-5 w-5" />, noc_priority: 'Engineering', label: 'Engineering' },
  { icon: <Leaf className="h-5 w-5" />, noc_priority: 'Environmental', label: 'Environmental' },
  { icon: <Utensils className="h-5 w-5" />, noc_priority: 'F&B', label: 'F&B' },
  { icon: <DollarSign className="h-5 w-5" />, noc_priority: 'Finance', label: 'Finance' },
  { icon: <Users className="h-5 w-5" />, noc_priority: 'HR', label: 'HR' },
  { icon: <Stethoscope className="h-5 w-5" />, noc_priority: 'Healthcare', label: 'Healthcare' },
  { icon: <Hotel className="h-5 w-5" />, noc_priority: 'Hospitality', label: 'Hospitality' },
  { icon: <Laptop className="h-5 w-5" />, noc_priority: 'IT', label: 'IT' },
  { icon: <UserCog className="h-5 w-5" />, noc_priority: 'Management', label: 'Management' },
  { icon: <Factory className="h-5 w-5" />, noc_priority: 'Manufacturing', label: 'Manufacturing' },
  { icon: <Megaphone className="h-5 w-5" />, noc_priority: 'Marketing', label: 'Marketing' },
  { icon: <Store className="h-5 w-5" />, noc_priority: 'Office & Retail', label: 'Office & Retail' },
  { icon: <Droplet className="h-5 w-5" />, noc_priority: 'Oil & Gas', label: 'Oil & Gas' },
  { icon: <MoreHorizontal className="h-5 w-5" />, noc_priority: 'Other', label: 'Other' },
  { icon: <Shield className="h-5 w-5" />, noc_priority: 'Security', label: 'Security' },
  { icon: <HeartHandshake className="h-5 w-5" />, noc_priority: 'Social Services', label: 'Social Services' },
  { icon: <Dumbbell className="h-5 w-5" />, noc_priority: 'Sports & Fitness', label: 'Sports & Fitness' },
  { icon: <Truck className="h-5 w-5" />, noc_priority: 'Transportation & Logistics', label: 'Transportation & Logistics' },
];

function CategoryBox({
  searchType,
  dateFrom,
  dateTo,
  selectedProvinces,
  selectedCities,
}: {
  searchType: 'hot_leads' | 'lmia';
  dateFrom?: string;
  dateTo?: string;
  selectedProvinces: string[];
  selectedCities: string[];
}) {
  const { updateCreditsAndSearch } = useUpdateCredits();
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  // Show first 14 (7x2 rows roughly), or all if expanded
  const visibleCategories = showAll ? categories : categories.slice(0, 14);

  const handleCategoryClick = (category: { noc_priority: string }) => {
    updateCreditsAndSearch(category.noc_priority);
    if (searchType === 'hot_leads') {
      const qs = new URLSearchParams({
        field: 'category',
        t: 'trending_job',
      });
      // Add locations
      selectedProvinces.forEach(p => qs.append('state', p));
      selectedCities.forEach(c => qs.append('city', c));

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
      qs.set('field', 'category');
      qs.set('t', 'lmia');
      // Add locations
      selectedProvinces.forEach(p => qs.append('state', p));
      selectedCities.forEach(c => qs.append('city', c));

      const base = `/search/lmia/${encodeURIComponent(category.noc_priority)}`;
      router.push(qs.toString() ? `${base}?${qs.toString()}` : base);
    }
  };

  return (
    <div className="w-full mt-2 text-center">
      <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
        <AnimatePresence>
          {visibleCategories.map((category) => (
            <motion.button
              key={category.noc_priority}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                handleCategoryClick({ noc_priority: category.noc_priority })
              }
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent bg-gray-50 text-gray-600 hover:bg-white hover:border-gray-200 hover:shadow-sm hover:text-brand-600 transition-all duration-200"
              )}
            >
              <span className="text-gray-400 group-hover:text-brand-500">
                {React.cloneElement(category.icon as React.ReactElement<{ className?: string }>, { className: "w-3 h-3" })}
              </span>
              <span className="text-xs font-medium">
                {category.label}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {categories.length > 14 && (
        <div className="mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoryBox;
