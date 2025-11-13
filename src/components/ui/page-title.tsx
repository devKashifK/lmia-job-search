import { AttributeName } from '@/helpers/attribute';
import React from 'react';
import { Badge } from './badge';
import { useData } from './dynamic-data-view';
import { useSearchParams } from 'next/navigation';
import CompactSearch from './compact-search';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp } from 'lucide-react';
import useMobile from '@/hooks/use-mobile';

interface PageTitleProps {
  title: string;
  count?: number;
  showVerified?: boolean;
  className?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  defaultSearchType?: 'hot_leads' | 'lmia';
}

export default function PageTitle({
  title,
  count: countProp,
  showVerified = true,
  className = '',
  showSearch = false,
  searchPlaceholder = 'Quick search...',
  defaultSearchType = 'hot_leads',
}: PageTitleProps) {
  const { data } = useData(title);
  const sp = useSearchParams();
  const { isMobile } = useMobile();

  // table from URL (fallback to trending_job)
  const tableName = (sp?.get('t') ?? 'trending_job').trim();
  // Use prop if provided, otherwise fall back to useData
  const count = countProp !== undefined ? countProp : data?.count;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${
        isMobile
          ? 'flex flex-col gap-2 mb-3 pb-3 border-b border-gray-200 w-full'
          : 'flex items-center justify-between gap-4 mb-3 pb-3 border-b border-gray-200 w-full'
      } ${className}`}
    >
      {/* Left Section: Title and Metadata */}
      <div
        className={
          isMobile
            ? 'flex flex-col gap-2 w-full'
            : 'flex items-center gap-4 flex-1 min-w-0'
        }
      >
        {/* Title with Icon */}
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            className={
              isMobile
                ? 'p-1.5 bg-brand-100 rounded-lg'
                : 'p-2 bg-brand-100 rounded-lg'
            }
          >
            <Briefcase
              className={
                isMobile ? 'w-4 h-4 text-brand-600' : 'w-5 h-5 text-brand-600'
              }
            />
          </motion.div>

          <h1
            className={
              isMobile
                ? 'text-lg font-semibold text-gray-900 truncate'
                : 'text-2xl font-semibold text-gray-900 truncate'
            }
          >
            <AttributeName name={title} />
          </h1>
        </div>

        {/* Metadata Pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2 flex-wrap"
        >
          {/* Type Badge */}
          <Badge
            variant="outline"
            className="text-xs font-medium border-gray-300 text-gray-700"
          >
            <TrendingUp className="w-3 h-3 mr-1 inline" />
            <AttributeName name={tableName} />
          </Badge>

          {/* Count Badge */}
          {count !== undefined && (
            <motion.div
              key={count}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Badge className="text-xs font-medium bg-brand-100 text-brand-700 border-brand-200 hover:bg-brand-200 transition-colors">
                {count.toLocaleString()} results
              </Badge>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Search Component */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <CompactSearch
            placeholder={searchPlaceholder}
            defaultSearchType={defaultSearchType}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
