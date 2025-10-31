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
import { VirtualizedSearchableSelector } from '@/components/compare/virtualized-searchable-selector';
import { useSavedJobs } from '@/hooks/use-saved-jobs';
import { useSession } from '@/hooks/use-session';
import { Bookmark, Search, X, ChevronDown, ChevronUp, Clock, Trash2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import db from '@/db';

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
  const [entity3, setEntity3] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [enable3Way, setEnable3Way] = useState(false);

  // Load comparison from URL parameters or localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlType = params.get('type') as ComparisonType;
      const urlEntity1 = params.get('entity1');
      const urlEntity2 = params.get('entity2');
      const urlEntity3 = params.get('entity3');

      if (urlType && urlEntity1 && urlEntity2) {
        setComparisonType(urlType);
        setEntity1(urlEntity1);
        setEntity2(urlEntity2);
        if (urlEntity3) {
          setEntity3(urlEntity3);
          setEnable3Way(true);
        }
        setShowResults(true);
      } else {
        // Load from comparedCompanies localStorage
        const compared = localStorage.getItem('comparedCompanies');
        if (compared) {
          try {
            const comparedList = JSON.parse(compared);
            if (comparedList.length >= 2) {
              setComparisonType('employer');
              setEntity1(comparedList[0].name);
              setEntity2(comparedList[1].name);
              if (comparedList.length >= 3) {
                setEntity3(comparedList[2].name);
                setEnable3Way(true);
              }
              // Show a helpful toast
              toast.info(`Comparing ${comparedList.length} companies`, {
                description: 'You can modify selections or add more below',
              });
            }
          } catch (err) {
            console.error('Failed to load compared companies:', err);
          }
        }
      }
    }
  }, []);
  const [selectedSavedJob1, setSelectedSavedJob1] = useState<any>(null);
  const [selectedSavedJob2, setSelectedSavedJob2] = useState<any>(null);
  const [showAllSavedJobs, setShowAllSavedJobs] = useState(false);
  const [savedJobsSearch, setSavedJobsSearch] = useState('');
  const [recentComparisons, setRecentComparisons] = useState<any[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<any[]>([]);
  const [comparedCompanies, setComparedCompanies] = useState<any[]>([]);

  const { data: options, isLoading } = useCompareData(comparisonType);
  const { data: savedJobs, isLoading: savedJobsLoading } = useSavedJobs();
  const { session } = useSession();

  const hasSavedJobs = savedJobs && savedJobs.length > 0;

  // Load recent comparisons, saved comparisons, and compared companies from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('recentComparisons');
    if (stored) {
      setRecentComparisons(JSON.parse(stored));
    }
    
    const saved = localStorage.getItem('savedComparisons');
    if (saved) {
      setSavedComparisons(JSON.parse(saved));
    }

    const compared = localStorage.getItem('comparedCompanies');
    if (compared) {
      try {
        setComparedCompanies(JSON.parse(compared));
      } catch (err) {
        console.error('Failed to parse compared companies:', err);
      }
    }
  }, []);

  // Handle deleting saved comparison
  const handleDeleteSavedComparison = (id: string) => {
    const updated = savedComparisons.filter((c) => c.id !== id);
    setSavedComparisons(updated);
    localStorage.setItem('savedComparisons', JSON.stringify(updated));
    toast.success('Comparison deleted');
  };

  // Handle removing company from comparison queue
  const handleRemoveFromQueue = (companyName: string) => {
    const updated = comparedCompanies.filter((c) => c.name !== companyName);
    setComparedCompanies(updated);
    localStorage.setItem('comparedCompanies', JSON.stringify(updated));
    toast.success(`${companyName} removed from comparison queue`);
  };

  // Clear all companies from queue
  const handleClearQueue = () => {
    setComparedCompanies([]);
    localStorage.removeItem('comparedCompanies');
    toast.success('Comparison queue cleared');
  };

  // Handle selecting company from queue
  const handleSelectFromQueue = (companyName: string) => {
    setComparisonType('employer');
    if (!entity1) {
      setEntity1(companyName);
      toast.success(`${companyName} selected as first company`);
    } else if (!entity2) {
      setEntity2(companyName);
      toast.success(`${companyName} selected as second company`);
    } else if (!entity3 && enable3Way) {
      setEntity3(companyName);
      toast.success(`${companyName} selected as third company`);
    } else if (!enable3Way) {
      setEntity2(companyName);
      toast.success(`${companyName} selected as second company`);
    } else {
      toast.info('All slots filled. Remove a company to add this one.');
    }
  };

  // Get entity value from job based on comparison type
  const getEntityValue = React.useCallback((job: any) => {
    switch (comparisonType) {
      case 'job_title':
        return job.job_title || job.occupation_title;
      case 'employer':
        return job.operating_name || job.employer;
      case 'city':
        return job.city;
      case 'state':
        return job.state || job.territory;
      default:
        return '';
    }
  }, [comparisonType]);

  // Filter saved jobs based on search
  const filteredSavedJobs = React.useMemo(() => {
    if (!savedJobs) return [];
    if (!savedJobsSearch) return savedJobs;

    const query = savedJobsSearch.toLowerCase();
    return savedJobs.filter((job: any) => {
      const jobValue = getEntityValue(job);
      const company = job.operating_name || job.employer || '';
      const city = job.city || '';
      return (
        jobValue.toLowerCase().includes(query) ||
        company.toLowerCase().includes(query) ||
        city.toLowerCase().includes(query)
      );
    });
  }, [savedJobs, savedJobsSearch, getEntityValue]);

  // Determine how many jobs to show
  const visibleSavedJobs = showAllSavedJobs
    ? filteredSavedJobs
    : filteredSavedJobs.slice(0, 6);

  // Handle saved job card selection
  const handleSavedJobSelect = (job: any, position: 1 | 2) => {
    if (position === 1) {
      if (selectedSavedJob1?.RecordID === job.RecordID) {
        setSelectedSavedJob1(null);
      } else {
        setSelectedSavedJob1(job);
      }
    } else {
      if (selectedSavedJob2?.RecordID === job.RecordID) {
        setSelectedSavedJob2(null);
      } else {
        setSelectedSavedJob2(job);
      }
    }
  };

  const saveToRecentComparisons = (val1: string, val2: string, type: ComparisonType) => {
    const newComparison = {
      entity1: val1,
      entity2: val2,
      type,
      timestamp: Date.now(),
    };

    const updated = [newComparison, ...recentComparisons.filter(
      (c) => !(c.entity1 === val1 && c.entity2 === val2 && c.type === type)
    )].slice(0, 5); // Keep only last 5

    setRecentComparisons(updated);
    localStorage.setItem('recentComparisons', JSON.stringify(updated));
  };

  const handleCompareSavedJobs = () => {
    if (selectedSavedJob1 && selectedSavedJob2) {
      const val1 = getEntityValue(selectedSavedJob1);
      const val2 = getEntityValue(selectedSavedJob2);
      setEntity1(val1);
      setEntity2(val2);
      saveToRecentComparisons(val1, val2, comparisonType);
      setShowResults(true);
    }
  };

  const handleCompare = () => {
    if (entity1 && entity2) {
      saveToRecentComparisons(entity1, entity2, comparisonType);
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setEntity1('');
    setEntity2('');
    setShowResults(false);
    setSelectedSavedJob1(null);
    setSelectedSavedJob2(null);
  };

  const handleClearSelections = () => {
    setSelectedSavedJob1(null);
    setSelectedSavedJob2(null);
  };

  const handleQuickCompare = (comparison: any) => {
    setComparisonType(comparison.type);
    setEntity1(comparison.entity1);
    setEntity2(comparison.entity2);
    setShowResults(true);
  };

  const handleRemoveSavedJob = async (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id) return;
    
    try {
      const { error } = await db
        .from('saved_jobs')
        .delete()
        .eq('record_id', recordId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Clear selections if this job was selected
      if (selectedSavedJob1?.RecordID === recordId) setSelectedSavedJob1(null);
      if (selectedSavedJob2?.RecordID === recordId) setSelectedSavedJob2(null);

      toast.success('Job removed from saved jobs');
      // Refetch will happen automatically via React Query
    } catch (error) {
      console.error('Error removing job:', error);
      toast.error('Failed to remove job');
    }
  };

  // Generate suggested comparisons based on saved jobs
  const suggestedComparisons = React.useMemo(() => {
    if (!savedJobs || savedJobs.length < 2) return [];

    const suggestions: any[] = [];
    
    // Same job in different cities
    const jobsByTitle = new Map<string, any[]>();
    savedJobs.forEach((job: any) => {
      const title = job.job_title || job.occupation_title;
      if (!jobsByTitle.has(title)) jobsByTitle.set(title, []);
      jobsByTitle.get(title)!.push(job);
    });

    jobsByTitle.forEach((jobs, title) => {
      if (jobs.length >= 2 && jobs[0].city !== jobs[1].city) {
        suggestions.push({
          label: `${title} in different cities`,
          job1: jobs[0],
          job2: jobs[1],
          type: 'city' as ComparisonType,
        });
      }
    });

    // Different jobs at same company
    const jobsByCompany = new Map<string, any[]>();
    savedJobs.forEach((job: any) => {
      const company = job.operating_name || job.employer;
      if (!jobsByCompany.has(company)) jobsByCompany.set(company, []);
      jobsByCompany.get(company)!.push(job);
    });

    jobsByCompany.forEach((jobs, company) => {
      if (jobs.length >= 2) {
        const title1 = jobs[0].job_title || jobs[0].occupation_title;
        const title2 = jobs[1].job_title || jobs[1].occupation_title;
        if (title1 !== title2) {
          suggestions.push({
            label: `Different roles at ${company}`,
            job1: jobs[0],
            job2: jobs[1],
            type: 'job_title' as ComparisonType,
          });
        }
      }
    });

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }, [savedJobs]);

  // Get type-specific icon for cards
  const getTypeIcon = () => {
    switch (comparisonType) {
      case 'job_title':
        return Briefcase;
      case 'employer':
        return Building2;
      case 'city':
        return MapPin;
      case 'state':
        return MapPin;
      default:
        return Briefcase;
    }
  };

  const TypeIcon = getTypeIcon();
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

          {/* Comparison Queue Banner */}
          {comparedCompanies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-purple-200 bg-purple-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">
                        Comparison Queue
                      </h3>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {comparedCompanies.length} {comparedCompanies.length === 1 ? 'company' : 'companies'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearQueue}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {comparedCompanies.map((company, idx) => (
                      <div
                        key={idx}
                        className="group relative"
                      >
                        <Badge
                          variant="outline"
                          className="bg-white border-purple-200 text-gray-700 pl-3 pr-8 py-1.5 text-sm cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                          onClick={() => handleSelectFromQueue(company.name)}
                        >
                          {company.name}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromQueue(company.name);
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 hover:bg-purple-100 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {comparedCompanies.length >= 2 && (
                    <p className="text-xs text-purple-600 mt-3 flex items-center gap-1">
                      <span className="font-medium">💡 Tip:</span> Click on any company to add it to the comparison
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

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

              {/* Recently Compared Section */}
              {recentComparisons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-6"
                >
                  <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-900">Recently Compared</h3>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {recentComparisons.length}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentComparisons.map((comp, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickCompare(comp)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs hover:border-blue-400 hover:shadow-sm transition-all"
                        >
                          <span className="font-medium text-gray-700">{comp.entity1}</span>
                          <span className="text-gray-400">vs</span>
                          <span className="font-medium text-gray-700">{comp.entity2}</span>
                        </motion.button>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Saved Comparisons Section */}
              {savedComparisons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="mb-6"
                >
                  <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Bookmark className="w-4 h-4 text-purple-600 fill-purple-600" />
                      <h3 className="text-sm font-bold text-gray-900">Saved Comparisons</h3>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {savedComparisons.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {savedComparisons.map((comp) => (
                        <motion.div
                          key={comp.id}
                          whileHover={{ scale: 1.02 }}
                          className="group flex items-center justify-between px-3 py-2 bg-white border border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-sm transition-all"
                        >
                          <button
                            onClick={() => handleQuickCompare(comp)}
                            className="flex-1 flex items-center gap-2 text-left"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-900">{comp.name}</span>
                                <Badge variant="outline" className="text-[10px] px-1">
                                  {comp.type}
                                </Badge>
                              </div>
                              {comp.notes && (
                                <p className="text-[10px] text-gray-500 line-clamp-1">{comp.notes}</p>
                              )}
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(comp.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </button>
                          <button
                            onClick={() => handleDeleteSavedComparison(comp.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-100 transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Empty State when no saved jobs */}
              {!hasSavedJobs && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-6"
                >
                  <Card className="p-8 text-center bg-gradient-to-br from-amber-50/30 to-orange-50/30 border-amber-100">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full">
                        <Bookmark className="w-8 h-8 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          No Saved Jobs Yet
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Save jobs to quickly compare them here
                        </p>
                        <Button
                          onClick={() => window.location.href = '/'}
                          variant="outline"
                          className="border-amber-300 hover:bg-amber-50"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Browse Jobs
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Saved Jobs Cards Section */}
              {hasSavedJobs && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-6"
                >
                  <Card className="p-6 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-50/50 border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                        <Bookmark className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Compare Your Saved Jobs</h3>
                        <p className="text-sm text-gray-600">Select 2 jobs to compare side by side</p>
                      </div>
                      <Badge variant="outline" className="ml-auto bg-white">
                        {savedJobs.length} saved
                      </Badge>
                    </div>

                    {/* Search Bar */}
                    {savedJobs.length > 3 && (
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search saved jobs..."
                          value={savedJobsSearch}
                          onChange={(e) => setSavedJobsSearch(e.target.value)}
                          className="pl-10 h-9 text-sm"
                        />
                        {savedJobsSearch && (
                          <button
                            onClick={() => setSavedJobsSearch('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Clear Selections Button */}
                    {(selectedSavedJob1 || selectedSavedJob2) && (
                      <div className="mb-3 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearSelections}
                          className="text-xs h-7"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clear Selections
                        </Button>
                      </div>
                    )}

                    {/* Loading Skeleton */}
                    {savedJobsLoading && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="rounded-lg border-2 border-gray-200 p-3">
                            <div className="flex items-start gap-2">
                              <Skeleton className="w-10 h-10 rounded-lg" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-1/2" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Saved Jobs Grid */}
                    {!savedJobsLoading && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {visibleSavedJobs.map((job: any) => {
                        const jobValue = getEntityValue(job);
                        const isSelected1 = selectedSavedJob1?.RecordID === job.RecordID;
                        const isSelected2 = selectedSavedJob2?.RecordID === job.RecordID;
                        const isSelected = isSelected1 || isSelected2;

                        return (
                          <TooltipProvider key={job.RecordID}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    if (isSelected1) {
                                      setSelectedSavedJob1(null);
                                    } else if (isSelected2) {
                                      setSelectedSavedJob2(null);
                                    } else if (!selectedSavedJob1) {
                                      handleSavedJobSelect(job, 1);
                                    } else if (!selectedSavedJob2) {
                                      handleSavedJobSelect(job, 2);
                                    }
                                  }}
                                  className={cn(
                                    'group relative cursor-pointer rounded-lg border-2 p-3 transition-all',
                                    isSelected
                                      ? 'border-brand-500 bg-brand-50 shadow-md'
                                      : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm'
                                  )}
                                >
                                  {/* Remove Button */}
                                  <button
                                    onClick={(e) => handleRemoveSavedJob(job.RecordID, e)}
                                    className="absolute top-2 right-2 p-1 rounded-md hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </button>

                                  {isSelected && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                      {isSelected1 ? '1' : '2'}
                                    </div>
                                  )}
                                  <div className="flex items-start gap-2">
                                    <div className={cn(
                                      'p-2 rounded-lg shrink-0',
                                      isSelected ? 'bg-brand-100' : 'bg-gray-100'
                                    )}>
                                      <TypeIcon className={cn(
                                        'w-4 h-4',
                                        isSelected ? 'text-brand-600' : 'text-gray-600'
                                      )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-gray-900 truncate">
                                        {jobValue}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                                        {job.operating_name || job.employer}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {job.city}, {job.state || job.territory}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold text-xs">{job.job_title || job.occupation_title}</p>
                                  {job.noc_code && (
                                    <p className="text-xs text-gray-600">NOC: {job.noc_code || job['2021_noc']}</p>
                                  )}
                                  {job.date_of_job_posting && (
                                    <p className="text-xs text-gray-600">Posted: {new Date(job.date_of_job_posting).toLocaleDateString()}</p>
                                  )}
                                  <p className="text-xs text-gray-500">Type: {job.type === 'lmia' ? 'LMIA' : 'Hot Leads'}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                        })}
                      </div>
                    )}

                    {/* View All Button */}
                    {!savedJobsLoading && filteredSavedJobs.length > 6 && (
                      <div className="flex justify-center mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllSavedJobs(!showAllSavedJobs)}
                          className="text-sm text-brand-600 hover:text-brand-700"
                        >
                          {showAllSavedJobs ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              View All ({filteredSavedJobs.length} jobs)
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* No Results Message */}
                    {!savedJobsLoading && savedJobsSearch && filteredSavedJobs.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No saved jobs match &ldquo;{savedJobsSearch}&rdquo;</p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setSavedJobsSearch('')}
                          className="text-brand-600"
                        >
                          Clear search
                        </Button>
                      </div>
                    )}

                    {/* Compare Button for Saved Jobs */}
                    {selectedSavedJob1 && selectedSavedJob2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <Button
                          onClick={handleCompareSavedJobs}
                          className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Compare Selected Jobs
                        </Button>
                      </motion.div>
                    )}

                    {/* Suggested Comparisons */}
                    {suggestedComparisons.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-amber-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="w-4 h-4 text-amber-600" />
                          <h4 className="text-sm font-bold text-gray-900">Suggested Comparisons</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {suggestedComparisons.map((suggestion, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setComparisonType(suggestion.type);
                                setSelectedSavedJob1(suggestion.job1);
                                setSelectedSavedJob2(suggestion.job2);
                                const val1 = getEntityValue(suggestion.job1);
                                const val2 = getEntityValue(suggestion.job2);
                                setEntity1(val1);
                                setEntity2(val2);
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg text-xs hover:shadow-md transition-all"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span className="font-medium text-gray-700">{suggestion.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="text-sm text-gray-500 font-medium">OR</span>
                    <div className="flex-1 border-t border-gray-200" />
                  </div>
                </motion.div>
              )}

              {/* Selection Interface */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-8 bg-white shadow-xl border-2 border-gray-100">
                  {/* 3-Way Toggle */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">Comparison Mode</h3>
                      <p className="text-xs text-gray-600">Compare 2 or 3 entities side-by-side</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enable3Way}
                          onChange={(e) => {
                            setEnable3Way(e.target.checked);
                            if (!e.target.checked) setEntity3('');
                          }}
                          className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-gray-700">3-Way Comparison</span>
                        {enable3Way && (
                          <Badge className="bg-brand-100 text-brand-700 text-[10px]">Beta</Badge>
                        )}
                      </label>
                    </div>
                  </div>

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
                      <VirtualizedSearchableSelector
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
                      <VirtualizedSearchableSelector
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

                    {/* Entity 3 (Conditional) */}
                    {enable3Way && (
                      <>
                        {/* VS Indicator 2 */}
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
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                VS
                              </span>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                          className="flex-1 max-w-md"
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            {selectedType && (
                              <selectedType.icon className="w-4 h-4 text-brand-600" />
                            )}
                            {selectedType?.label} #3
                          </label>
                          <VirtualizedSearchableSelector
                            value={entity3}
                            onValueChange={setEntity3}
                            options={options || []}
                            placeholder={`Search ${selectedType?.label
                              .toLowerCase()
                              .slice(0, -1)}...`}
                            isLoading={isLoading}
                            excludeValue={entity1}
                          />
                        </motion.div>
                      </>
                    )}
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
                      disabled={!entity1 || !entity2 || (enable3Way && !entity3)}
                      size="lg"
                      className="px-8 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Compare {enable3Way ? '3' : '2'} Entities
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
              entity3={enable3Way ? entity3 : undefined}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </BackgroundWrapper>
  );
}
