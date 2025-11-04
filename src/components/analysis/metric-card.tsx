'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@iconify/react/dist/iconify.js';
import {
  TrendingUp,
  MapPin,
  Hash,
  Briefcase,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: string;
}

export const MetricCard = ({ label, value, subtitle, icon }: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full"
    >
      <Card className="group bg-white/90 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 overflow-hidden relative h-full">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/0 group-hover:from-brand-500/5 group-hover:via-brand-500/5 group-hover:to-brand-500/10 transition-all duration-500" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {label}
                </p>
                {label === 'Growth Rate' && (
                  <motion.div
                    animate={{ rotate: String(value)?.includes('+') ? 0 : 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TrendingUp
                      className={`w-3 h-3 ${
                        String(value)?.includes('+') ? 'text-green-500' : 'text-red-500'
                      }`}
                    />
                  </motion.div>
                )}
              </div>
              <motion.p
                className="text-xl font-bold text-gray-900 group-hover:text-brand-700 transition-colors"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {value}
              </motion.p>
            </div>
            <motion.div
              className="p-2 bg-gradient-to-br from-brand-50 to-brand-100/80 rounded-lg ring-1 ring-brand-200/40 group-hover:ring-brand-400/50 group-hover:shadow-md transition-all"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon
                icon={icon}
                className="w-4 h-4 text-brand-600 group-hover:text-brand-700"
              />
            </motion.div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
              {subtitle}
            </p>
            {/* Contextual status indicator */}
            {label === 'Growth Rate' && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    String(value)?.includes('+')
                      ? 'bg-green-500'
                      : String(value)?.includes('-')
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    String(value)?.includes('+')
                      ? 'text-green-600'
                      : String(value)?.includes('-')
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {String(value)?.includes('+')
                    ? 'Growing'
                    : String(value)?.includes('-')
                    ? 'Declining'
                    : 'Stable'}
                </span>
              </motion.div>
            )}
            {label === 'Top Location' && (
              <motion.div
                className="flex items-center gap-1 text-brand-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <MapPin className="w-3 h-3" />
                <span className="text-xs font-medium">Primary</span>
              </motion.div>
            )}
            {label === 'Top NOC Code' && (
              <motion.div
                className="flex items-center gap-1 text-brand-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Hash className="w-3 h-3" />
                <span className="text-xs font-medium">Popular</span>
              </motion.div>
            )}
            {(label === 'Avg. Positions' || label === 'Common Role') && (
              <motion.div
                className="flex items-center gap-1 text-brand-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Briefcase className="w-3 h-3" />
                <span className="text-xs font-medium">Key Metric</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
