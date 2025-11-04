'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
}: DashboardCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-full"
    >
      <Card
        className={`group bg-white/90 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-400 flex flex-col overflow-hidden relative h-full ${className}`}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500" />

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <motion.div
            className="p-2 bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg ring-1 ring-brand-200/50 shadow-sm"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="w-5 h-5 text-brand-600" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-brand-700 transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {children}
        </div>
      </Card>
    </motion.div>
  );
};
