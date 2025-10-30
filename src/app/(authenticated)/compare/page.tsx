'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Building2,
  MapPin,
  Briefcase,
  BarChart3,
  Users,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/ui/nabvar';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { cn } from '@/lib/utils';
import { useCompareData } from '@/components/compare/use-compare-data';
import ComparisonResults from '@/components/compare/comparison-results';
import { SearchableSelector } from '@/components/compare/searchable-selector';

type ComparisonType = 'job_title' | 'state' | 'city' | 'employer';

const COMPARISON_TYPES = [
  {
    value: 'job_title' as ComparisonType,
    label: 'Job Titles',
    icon: Briefcase,
    description: 'Compare different job positions',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    value: 'state' as ComparisonType,
    label: 'States',
    icon: MapPin,
    description: 'Compare job markets by state',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    value: 'city' as ComparisonType,
    label: 'Cities',
    icon: Building2,
    description: 'Compare opportunities by city',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    value: 'employer' as ComparisonType,
    label: 'Companies',
    icon: Users,
    description: 'Compare employers side by side',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
];

export default function ComparePage() {
  const [comparisonType, setComparisonType] =
    useState<ComparisonType>('job_title');
  const [entity1, setEntity1] = useState<string>('');
  const [entity2, setEntity2] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  const { data: options, isLoading } = useCompareData(comparisonType);

  const handleCompare = () => {
    if (entity1 && entity2) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setEntity1('');
    setEntity2('');
    setShowResults(false);
  };

  const selectedType = COMPARISON_TYPES.find((t) => t.value === comparisonType);

  return (
    <BackgroundWrapper>
      <Navbar />
      <div className="min-h-screen pt-[6.5rem] pb-12">
        <div className="max-w-7xl mx-auto px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg"
              >
                <ArrowLeftRight className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-900">
                Compare & Analyze
              </h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get detailed insights by comparing job titles, locations, or
              companies side by side
            </p>
          </motion.div>

          {!showResults ? (
            <>
              {/* Comparison Type Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  Choose Comparison Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {COMPARISON_TYPES.map((type, index) => {
                    const Icon = type.icon;
                    const isSelected = comparisonType === type.value;
                    return (
                      <motion.button
                        key={type.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.1 + index * 0.05,
                        }}
                        onClick={() => {
                          setComparisonType(type.value);
                          setEntity1('');
                          setEntity2('');
                        }}
                        className={cn(
                          'relative p-6 rounded-xl border-2 transition-all duration-300 group text-left',
                          isSelected
                            ? `${type.borderColor} ${type.bgColor} shadow-lg scale-105`
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              isSelected
                                ? type.bgColor
                                : 'bg-gray-50 group-hover:bg-gray-100'
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-5 h-5 transition-colors',
                                isSelected ? type.color : 'text-gray-600'
                              )}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {type.label}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {type.description}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            layoutId="selected-indicator"
                            className="absolute top-3 right-3"
                          >
                            <Badge
                              className={cn(
                                'text-xs',
                                type.color,
                                type.bgColor
                              )}
                            >
                              Selected
                            </Badge>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Selection Interface */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-8 bg-white shadow-xl border-2 border-gray-100">
                  <div className="flex items-center justify-center gap-8">
                    {/* Entity 1 */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex-1 max-w-md"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        {selectedType && (
                          <selectedType.icon className="w-4 h-4 text-brand-600" />
                        )}
                        {selectedType?.label} #1
                      </label>
                      <SearchableSelector
                        value={entity1}
                        onValueChange={setEntity1}
                        options={options || []}
                        placeholder={`Search ${selectedType?.label
                          .toLowerCase()
                          .slice(0, -1)}...`}
                        isLoading={isLoading}
                        excludeValue={entity2}
                      />
                    </motion.div>

                    {/* VS Indicator */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        delay: 0.5,
                      }}
                      className="flex-shrink-0"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            VS
                          </span>
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="absolute inset-0 rounded-full border-2 border-dashed border-brand-300"
                        />
                      </div>
                    </motion.div>

                    {/* Entity 2 */}
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex-1 max-w-md"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        {selectedType && (
                          <selectedType.icon className="w-4 h-4 text-brand-600" />
                        )}
                        {selectedType?.label} #2
                      </label>
                      <SearchableSelector
                        value={entity2}
                        onValueChange={setEntity2}
                        options={options || []}
                        placeholder={`Search ${selectedType?.label
                          .toLowerCase()
                          .slice(0, -1)}...`}
                        isLoading={isLoading}
                        excludeValue={entity1}
                      />
                    </motion.div>
                  </div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-8 flex items-center justify-center gap-4"
                  >
                    <Button
                      onClick={handleCompare}
                      disabled={!entity1 || !entity2}
                      size="lg"
                      className="px-8 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Compare Now
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            </>
          ) : (
            <ComparisonResults
              type={comparisonType}
              entity1={entity1}
              entity2={entity2}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </BackgroundWrapper>
  );
}
