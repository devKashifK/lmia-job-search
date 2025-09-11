'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Expand,
  Info,
  Maximize2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  totalValue?: string | number;
  className?: string;
  onExpand?: () => void;
  onDownload?: () => void;
  height?: string;
  loading?: boolean;
  error?: string;
}

const chartVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  hover: {
    y: -2,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const shimmerVariants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3 animate-pulse" />
    </div>
    <div className="h-64 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl relative overflow-hidden">
      <motion.div
        variants={shimmerVariants}
        animate="animate"
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
    </div>
  </div>
);

export function ModernChartWrapper({
  title,
  description,
  children,
  icon,
  trend,
  totalValue,
  className = '',
  onExpand,
  onDownload,
  height = '380px',
  loading = false,
  error,
}: ChartWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);

  const defaultIcon = <BarChart3 className="h-5 w-5 text-brand-600" />;

  if (loading) {
    return (
      <Card
        className={`relative overflow-hidden bg-white border shadow-sm ${className}`}
      >
        <CardHeader className="pb-2">
          <LoadingSkeleton />
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className={`relative overflow-hidden bg-white border shadow-sm ${className}`}
      >
        <CardContent
          className="flex flex-col items-center justify-center p-8"
          style={{ minHeight: height }}
        >
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Info className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">Unable to load chart data</p>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={className}
      >
        <Card className="relative overflow-hidden bg-white border shadow-sm hover:shadow-lg transition-all duration-300 group">
          {/* Gradient background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Animated border effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-400/20 via-purple-500/20 to-brand-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
            style={{ padding: '1px' }}
          >
            <div className="h-full w-full bg-white rounded-lg" />
          </div>

          <CardHeader className="relative z-10 pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <motion.div
                  className="p-2 bg-brand-100 rounded-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon || defaultIcon}
                </motion.div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {description}
                    </p>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mt-2">
                    {totalValue && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Total:</span>
                        <span className="font-semibold text-gray-900 text-sm">
                          {totalValue}
                        </span>
                      </div>
                    )}

                    {trend && (
                      <Badge
                        variant={trend.isPositive ? 'default' : 'destructive'}
                        className="text-xs px-2 py-0.5"
                      >
                        <TrendingUp
                          className={`h-3 w-3 mr-1 ${
                            trend.isPositive ? '' : 'rotate-180'
                          }`}
                        />
                        {Math.abs(trend.value).toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex gap-1"
                  >
                    {onExpand && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onExpand}
                            className="h-7 w-7 p-0 hover:bg-brand-100"
                          >
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Expand chart</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {onDownload && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDownload}
                            className="h-7 w-7 p-0 hover:bg-brand-100"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download chart</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 pt-0 pb-4">
            <div style={{ height }} className="w-full overflow-hidden">
              {children}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
