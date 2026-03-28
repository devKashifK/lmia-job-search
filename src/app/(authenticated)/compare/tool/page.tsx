'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

import {
  ArrowLeftRight,
  Building2,
  MapPin,
  Briefcase,
  BarChart3,
  Users,
  Sparkles,
  ChevronLeft,
  Home,
  Menu,
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Navbar from '@/components/ui/nabvar';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { cn } from '@/lib/utils';
import { useCompareData } from '@/components/compare/use-compare-data';
import ComparisonResults from '@/components/compare/comparison-results';
import { VirtualizedSearchableSelector } from '@/components/compare/virtualized-searchable-selector';
import { useQueryClient } from '@tanstack/react-query';
import { useSavedJobs } from '@/hooks/use-saved-jobs';
import { useSession } from '@/hooks/use-session';
import {
  Bookmark,
  Search,
  Check,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
  Info,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';
import Footer from '@/sections/homepage/footer';
import { usePlanFeatures } from '@/hooks/use-plan-features';

type ComparisonType = 'job_title' | 'state' | 'city' | 'employer';

const COMPARISON_TYPES = [
  {
    value: 'job_title' as ComparisonType,
    label: 'Job Titles',
    icon: Briefcase,
    description: 'Compare different job positions',
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
  },
  {
    value: 'state' as ComparisonType,
    label: 'States',
    icon: MapPin,
    description: 'Compare job markets by state',
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
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
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
  },
];

export default function ComparePage() {
  const { isMobile } = useMobile();
  const router = useRouter();
  const sp = useSearchParams();

  // Data source: trending_job (Hot Leads) or lmia
  const [dataSource, setDataSource] = useState<'trending_job' | 'lmia'>(
    () => (sp?.get('t') === 'lmia' ? 'lmia' : 'trending_job')
  );

  const handleDataSourceChange = (source: 'trending_job' | 'lmia') => {
    setDataSource(source);
    setEntity1('');
    setEntity2('');
    setEntity3('');
    // Update URL so useCompareData re-fetches with correct table
    const next = new URLSearchParams(sp?.toString() ?? '');
    next.set('t', source);
    router.replace(`/compare/tool?${next.toString()}`, { scroll: false });
  };

  const [comparisonType, setComparisonType] =
    useState<ComparisonType>('job_title');
  const [entity1, setEntity1] = useState<string>('');
  const [entity2, setEntity2] = useState<string>('');
  const [entity3, setEntity3] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [enable3Way, setEnable3Way] = useState(false);
  // Pending type change — used to confirm-before-clear
  const [pendingType, setPendingType] = useState<ComparisonType | null>(null);

  const applyTypeChange = (type: ComparisonType) => {
    // If selections are filled warn the user first 
    if ((entity1 || entity2) && type !== comparisonType) {
      setPendingType(type);
      return;
    }
    setComparisonType(type);
    setEntity1('');
    setEntity2('');
    setEntity3('');
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      setComparisonType(pendingType);
      setEntity1('');
      setEntity2('');
      setEntity3('');
      setPendingType(null);
    }
  };

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
              toast.info(`Comparing ${comparedList.length} companies`, {
                description: 'You can modify selections or add more below',
              });
            } else if (comparedList.length === 1) {
              // Pre-fill first slot and prompt user to pick a second company
              setComparisonType('employer');
              setEntity1(comparedList[0].name);
              toast.info(`${comparedList[0].name} is selected`, {
                description: 'Now pick a second company to compare against',
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
  const { data: employerOptions, isLoading: employersLoading } = useCompareData('employer');
  const { data: savedJobs, isLoading: savedJobsLoading } = useSavedJobs();
  const { session } = useSession();
  const { planType, isLoading: isPlanLoading } = usePlanFeatures();
  const queryClient = useQueryClient();
  const isPremium = planType !== 'free';

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

  // Handle adding company to queue from within tool
  const handleAddToQueue = (companyName: string) => {
    if (comparedCompanies.some(c => c.name === companyName)) {
      toast.info(`${companyName} is already in the queue`);
      return;
    }
    const updated = [...comparedCompanies, { name: companyName }];
    setComparedCompanies(updated);
    localStorage.setItem('comparedCompanies', JSON.stringify(updated));
    toast.success(`${companyName} added to comparison queue`);
  };

  // Get entity value from job based on comparison type
  const getEntityValue = React.useCallback(
    (job: any) => {
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
    },
    [comparisonType]
  );

  // Filter saved jobs based on search
  const filteredSavedJobs = React.useMemo(() => {
    if (!savedJobs) return [];
    if (!savedJobsSearch) return savedJobs;

    const query = savedJobsSearch.toLowerCase();
    return savedJobs.filter((job: any) => {
      const jobValue = getEntityValue(job);
      const company = job.employer || '';
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

  const saveToRecentComparisons = (
    val1: string,
    val2: string,
    type: ComparisonType
  ) => {
    const newComparison = {
      entity1: val1,
      entity2: val2,
      type,
      timestamp: Date.now(),
    };

    const updated = [
      newComparison,
      ...recentComparisons.filter(
        (c) => !(c.entity1 === val1 && c.entity2 === val2 && c.type === type)
      ),
    ].slice(0, 5); // Keep only last 5

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
      if (enable3Way && !isPremium) {
        toast.error('Premium Feature', {
          description: '3-Way Comparison is available on premium plans.',
          action: { label: 'Upgrade', onClick: () => router.push('/pricing') }
        });
        return;
      }
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

  const handleRemoveSavedJob = async (
    recordId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!session?.user?.id) return;

    try {
      const { unsaveJob } = await import('@/lib/api/saved-jobs');
      await unsaveJob(recordId, session.user.id);

      // Clear selections if this job was selected
      if (selectedSavedJob1?.RecordID === recordId) setSelectedSavedJob1(null);
      if (selectedSavedJob2?.RecordID === recordId) setSelectedSavedJob2(null);

      toast.success('Job removed from saved jobs');
      // Invalidate the query to force a refresh
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
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
      {isMobile && (
        <MobileHeader title="Compare & Analyze" showBack={true} />
      )}

      <div className={isMobile ? 'min-h-screen pt-4 pb-24' : 'min-h-screen pb-20'}>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-brand-50/50 via-white/20 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-100/30 rounded-full blur-[100px] -mr-32 -mt-32 opacity-60 animate-pulse-slow -z-10" />

        <div className={isMobile ? 'mx-auto px-4' : 'max-w-[1600px] mx-auto px-8'}>
          {/* Sticky Header Bar - Desktop Only */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="sticky top-4 z-20 flex items-center justify-between gap-4 mb-8 p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              {/* Left Section: Back, Home & Title */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 p-1 bg-gray-50/50 rounded-xl border border-gray-100">
                  <Button
                    onClick={() => window.location.href = '/compare'}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </Button>
                  
                  <div className="w-px h-4 bg-gray-200 mx-0.5" />

                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                    title="Home"
                  >
                    <Home className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>

                {/* Title with Icon */}
                <div className="flex items-center gap-3 ml-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="p-2 bg-brand-50 rounded-xl border border-brand-100/50 shadow-sm"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-brand-600" />
                  </motion.div>

                  <div className="hidden sm:block">
                    <h1 className="text-sm font-extrabold text-gray-900 leading-none tracking-tight">
                      Compare & Analyze
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      Multi-Entity Intelligence
                    </p>
                  </div>
                </div>
              </div>

              {/* Center: Data Source Toggle */}
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => handleDataSourceChange('trending_job')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300',
                    dataSource === 'trending_job'
                      ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </button>
                <button
                  onClick={() => handleDataSourceChange('lmia')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300',
                    dataSource === 'lmia'
                      ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  <Shield className="w-3 h-3" />
                  LMIA
                </button>
              </div>

              {/* Right Section: Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex items-center gap-2"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all rounded-xl"
                    >
                      <Menu className="w-4 h-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-gray-100 shadow-2xl backdrop-blur-xl bg-white/90">
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/search'}
                      className="rounded-xl focus:bg-brand-50 focus:text-brand-700"
                    >
                      <Search className="w-4 h-4 mr-2 opacity-70" />
                      Search Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/dashboard'}
                      className="rounded-xl focus:bg-brand-50 focus:text-brand-700"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2 opacity-70" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-50" />
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/pricing'}
                      className="rounded-xl focus:bg-brand-50 focus:text-brand-700"
                    >
                      <CreditCard className="w-4 h-4 mr-2 opacity-70" />
                      Premium
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </motion.div>
          )}

          {/* Mobile: Page Title */}
          {isMobile && (
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Compare & Analyze
              </h1>
              <p className="text-sm text-gray-600">
                Compare jobs, locations, or companies side by side
              </p>
            </div>
          )}

          {/* Comparison Queue Banner */}
          {comparedCompanies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Card className="relative overflow-hidden border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] group/queue">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full blur-[80px] -mr-32 -mt-32 transition-colors group-hover/queue:bg-brand-100/30" />
                
                <div className={isMobile ? "p-6" : "p-10"}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl shadow-xl shadow-brand-500/20">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">Comparison Queue</h3>
                          <Badge className="bg-brand-600 text-white border-0 rounded-full px-3 py-0.5 font-black text-[10px]">
                            {comparedCompanies.length} ACTIVE
                          </Badge>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Your Selected Entity Repository</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-10 px-5 border-gray-100 bg-gray-50/50 hover:bg-white hover:border-brand-200 rounded-xl transition-all font-bold text-xs text-brand-700">
                            <Plus className="w-4 h-4 mr-2" /> DISCOVER MORE
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[320px] p-3 rounded-2xl border-gray-100 shadow-2xl backdrop-blur-xl bg-white/90">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Inject Company Vector</div>
                          <VirtualizedSearchableSelector
                            value=""
                            onValueChange={handleAddToQueue}
                            options={(employerOptions || [])}
                            placeholder="Search by name..."
                            isLoading={employersLoading}
                            excludeValues={comparedCompanies.map(c => c.name)}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearQueue}
                        className="h-10 px-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-xs"
                      >
                        <X className="w-4 h-4 mr-2" />
                        FLUSH
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {comparedCompanies.map((company, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group/chip"
                      >
                        <button
                          onClick={() => handleSelectFromQueue(company.name)}
                          className="bg-gray-50/50 border border-gray-100 hover:border-brand-300 hover:bg-white text-gray-900 px-6 py-3 text-sm font-black transition-all rounded-[1.2rem] shadow-sm hover:shadow-xl hover:shadow-brand-500/5"
                        >
                          {company.name.toUpperCase()}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromQueue(company.name);
                          }}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-full flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition-all shadow-xl"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {comparedCompanies.length >= 2 && (
                    <div className="pt-8 border-t-2 border-dashed border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Queue ready for multi-vector analysis
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setComparisonType('employer');
                          setEntity1(comparedCompanies[0].name);
                          setEntity2(comparedCompanies[1].name);
                          if (comparedCompanies[2]) {
                            setEntity3(comparedCompanies[2].name);
                            setEnable3Way(true);
                          }
                          saveToRecentComparisons(comparedCompanies[0].name, comparedCompanies[1].name, 'employer');
                          setShowResults(true);
                        }}
                        className="h-12 px-8 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-1 active:scale-95 group"
                      >
                        <BarChart3 className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                        INITIALIZE {comparedCompanies.length >= 3 ? `TOP 3` : 'DUAL'} ENGINE
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {!showResults ? (
            <>
              {!hasSavedJobs && comparedCompanies.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <Card className="relative overflow-hidden border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] group/banner">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-colors duration-1000 group-hover/banner:bg-brand-500/10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-100/30 rounded-full blur-[80px] -ml-20 -mb-20" />
                    
                    <div className={cn("relative flex flex-col md:flex-row items-center gap-8", isMobile ? "p-6" : "p-10")}>
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="flex-shrink-0 p-5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-[2rem] shadow-xl shadow-brand-500/20"
                      >
                        <BarChart3 className="w-10 h-10 text-white" />
                      </motion.div>
                      <div className={isMobile ? "text-center" : "text-left"}>
                        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                          Welcome to the Comparator Engine
                        </h2>
                        <p className="text-gray-600 max-w-2xl leading-relaxed font-medium">
                          Harness real-time Canadian market intelligence. Compare employers, cities, jobs, or states side-by-side to uncover competitive insights, wage benchmarks, and regional growth vectors.
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 1: Comparison Type Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8 mb-8 "
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <h2
                      className={cn(
                        'font-bold text-gray-900',
                        isMobile ? 'text-base' : 'text-xl'
                      )}
                    >
                      Choose What to Compare
                    </h2>
                  </div>
                  {comparisonType === 'employer' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = '/search'}
                      className="text-brand-600 hover:bg-brand-50 text-xs hidden sm:flex h-8"
                    >
                      Browse Top Companies <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        onClick={() => applyTypeChange(type.value)}
                        className={cn(
                          'relative rounded-[2.5rem] transition-all duration-500 group text-left overflow-hidden border-2',
                          isMobile ? 'p-5' : 'p-8',
                          isSelected
                            ? 'bg-brand-600 border-brand-400 shadow-2xl shadow-brand-500/30 scale-[1.02]'
                            : 'bg-white hover:shadow-2xl shadow-sm border-gray-100 hover:border-brand-200'
                        )}
                      >
                        {/* Selected Glow Effect */}
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                        )}

                        <div className="relative z-10">
                          <div
                            className={cn(
                              'rounded-2xl mb-6 inline-flex transition-all duration-500',
                              isMobile ? 'p-3' : 'p-4',
                              isSelected
                                ? 'bg-white/20 backdrop-blur-md shadow-inner'
                                : 'bg-brand-50 group-hover:bg-brand-100 group-hover:scale-110'
                            )}
                          >
                            <Icon
                              className={cn(
                                'transition-all duration-500',
                                isMobile ? 'w-5 h-5' : 'w-7 h-7',
                                isSelected ? 'text-white' : 'text-brand-600'
                              )}
                            />
                          </div>
                          <h3
                            className={cn(
                              'font-black mb-2 tracking-tight leading-none',
                              isMobile ? 'text-lg' : 'text-xl',
                              isSelected ? 'text-white' : 'text-gray-900'
                            )}
                          >
                            {type.label}
                          </h3>
                          <p
                            className={cn(
                              'font-medium leading-relaxed',
                              isMobile ? 'text-xs' : 'text-sm',
                              isSelected ? 'text-white/80' : 'text-gray-500'
                            )}
                          >
                            {type.description}
                          </p>
                        </div>

                        {/* Hover Overlay */}
                        {!isSelected && (
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
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
                  className="mb-8"
                >
                  <Card className="relative overflow-hidden border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-[80px] -mr-32 -mt-32 transition-colors group-hover:bg-brand-50/50" />
                    
                    <div className="relative flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-brand-50 transition-colors">
                          <Clock className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Recently Compared</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your Quick History</p>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-600 border-0 rounded-full px-4 py-1.5 font-bold text-xs">
                        {recentComparisons.length} SESSIONS
                      </Badge>
                    </div>

                    <div className="relative flex flex-wrap gap-3">
                      {recentComparisons.map((comp, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickCompare(comp)}
                          className="flex items-center gap-3 px-5 py-3 bg-gray-50/50 hover:bg-white rounded-2xl text-sm font-bold text-gray-700 transition-all border border-gray-100/50 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 group/item"
                        >
                          <span className="truncate max-w-[120px]">{comp.entity1}</span>
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-100 text-[10px] text-gray-400 font-black shadow-sm group-hover/item:border-brand-200 group-hover/item:text-brand-500">VS</div>
                          <span className="truncate max-w-[120px]">{comp.entity2}</span>
                          <Badge className="ml-1 bg-white text-[9px] text-brand-600 font-black border-brand-100 px-2 py-0">
                            {COMPARISON_TYPES.find(t => t.value === comp.type)?.label.toUpperCase() || comp.type.toUpperCase()}
                          </Badge>
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
                  className="mb-8"
                >
                  <Card className="border-0 bg-white shadow-sm">
                    <div className={isMobile ? "p-4" : "p-6"}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-100 rounded-xl">
                            <Bookmark className="w-4 h-4 text-brand-600" />
                          </div>
                          <h3 className="font-bold text-gray-900">
                            Compare Your Saved Jobs
                          </h3>
                        </div>
                        <Badge className="bg-brand-100 text-brand-700 border-0 rounded-full px-3">
                          {savedComparisons.length} saved
                        </Badge>
                      </div>
                      <div className="grid gap-3">
                        {savedComparisons.map((comp) => (
                          <motion.div
                            key={comp.id}
                            whileHover={{ scale: 1.01 }}
                            className="group relative"
                          >
                            <button
                              onClick={() => handleQuickCompare(comp)}
                              className="w-full flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-left border border-gray-100 hover:border-gray-200"
                            >
                              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                <Building2 className="w-5 h-5 text-gray-700" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900 text-sm truncate">
                                    {comp.name}
                                  </h4>
                                  <Badge className="bg-white text-gray-600 border-0 text-xs px-2 shrink-0">
                                    {comp.type}
                                  </Badge>
                                </div>
                                {comp.notes && (
                                  <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                                    {comp.notes}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400">
                                  {new Date(comp.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleDeleteSavedComparison(comp.id)}
                              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-red-50 hover:bg-red-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
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
                  className="mb-12"
                >
                  <Card className="relative overflow-hidden p-12 text-center bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] group/empty">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-50/50 via-transparent to-transparent opacity-50" />
                    <div className="relative flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-2xl group-hover/empty:scale-150 transition-transform duration-1000" />
                        <div className="relative p-6 bg-gradient-to-br from-brand-100 to-brand-50 rounded-[2rem] shadow-inner">
                          <Bookmark className="w-10 h-10 text-brand-600 animate-pulse-slow" />
                        </div>
                      </div>
                      <div className="max-w-md mx-auto">
                        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                          No Saved Jobs Yet
                        </h3>
                        <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                          Your comparison power grows as you save. Track interesting roles and companies to unlock side-by-side market intelligence.
                        </p>
                        <Button
                          onClick={() => (window.location.href = '/')}
                          className="h-12 px-8 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-1 active:scale-95"
                        >
                          <Sparkles className="w-5 h-5 mr-3" />
                          Explore Opportunities
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
                  className="mb-8"
                >
                  <Card className="relative overflow-hidden bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-10 group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-50/50 rounded-full blur-[100px] -mr-32 -mt-32 transition-colors duration-1000 group-hover:bg-brand-100/30" />
                    
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl shadow-xl shadow-brand-500/20">
                          <Bookmark className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Compare Your Saved Jobs</h3>
                          <p className="text-xs text-brand-600 font-bold uppercase tracking-widest">Market Intelligence Workbench</p>
                        </div>
                      </div>
                      <Badge className="bg-brand-50 text-brand-700 border-2 border-brand-100 rounded-full px-5 py-2 font-black text-xs">
                        {savedJobs.length} JOBS BOOKMARKED
                      </Badge>
                    </div>

                    {/* Modern Search Bar */}
                    {savedJobs.length > 3 && (
                      <div className="relative mb-8 max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-400 group-focus-within:text-brand-600 transition-colors" />
                        <Input
                          type="text"
                          placeholder="Filter your saved repository..."
                          value={savedJobsSearch}
                          onChange={(e) => setSavedJobsSearch(e.target.value)}
                          className="pl-12 h-12 text-sm bg-gray-50/50 border-gray-100 rounded-2xl focus:bg-white transition-all shadow-inner font-medium placeholder:text-gray-400"
                        />
                        {savedJobsSearch && (
                          <button
                            onClick={() => setSavedJobsSearch('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
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
                          <div
                            key={i}
                            className="rounded-lg border-2 border-gray-200 p-3"
                          >
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
                      <div
                        className={cn(
                          'grid mb-4',
                          isMobile
                            ? 'grid-cols-1 gap-2'
                            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
                        )}
                      >
                        {visibleSavedJobs.map((job: any) => {
                          const jobValue = getEntityValue(job);
                          const isSelected1 =
                            selectedSavedJob1 &&
                            selectedSavedJob1.RecordID === job.RecordID;
                          const isSelected2 =
                            selectedSavedJob2 &&
                            selectedSavedJob2.RecordID === job.RecordID;
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
                                      'group relative cursor-pointer rounded-lg border-2 transition-all',
                                      isMobile ? 'p-2' : 'p-3',
                                      isSelected
                                        ? 'border-brand-500 bg-brand-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm'
                                    )}
                                  >
                                    {/* Remove Button */}
                                    <button
                                      onClick={(e) =>
                                        handleRemoveSavedJob(job.RecordID, e)
                                      }
                                      className="absolute top-2 right-2 p-1 rounded-md hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-500" />
                                    </button>
                                    <div className={cn("p-6 flex items-start gap-4", isMobile ? "gap-3" : "gap-4")}>
                                      <div
                                        className={cn(
                                          'w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-all duration-500',
                                          isSelected
                                            ? 'bg-white/20 backdrop-blur-md rotate-0'
                                            : 'bg-white shadow-sm border border-gray-100 group-hover/job:bg-brand-50 group-hover/job:rotate-12'
                                        )}
                                      >
                                        <TypeIcon
                                          className={cn(
                                            'w-6 h-6 transition-colors duration-500',
                                            isSelected
                                              ? 'text-white'
                                              : 'text-brand-600'
                                          )}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={cn(
                                            'font-black truncate tracking-tight',
                                            isMobile ? 'text-sm' : 'text-base',
                                            isSelected ? 'text-white' : 'text-gray-900'
                                          )}
                                        >
                                          {jobValue}
                                        </p>
                                        <p
                                          className={cn(
                                            'truncate font-bold mt-0.5',
                                            isMobile ? 'text-[10px]' : 'text-xs',
                                            isSelected ? 'text-white/80' : 'text-gray-500'
                                          )}
                                        >
                                          {job.operating_name || job.employer}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <MapPin className={cn("w-3 h-3", isSelected ? "text-white/60" : "text-gray-400")} />
                                          <p
                                            className={cn(
                                              'font-bold truncate',
                                              isMobile ? 'text-[10px]' : 'text-xs',
                                              isSelected ? 'text-white/60' : 'text-gray-400'
                                            )}
                                          >
                                            {job.city}, {job.state || job.territory}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Select Indicator */}
                                    {isSelected && (
                                       <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                                         <div className="w-6 h-6 rounded-full bg-white text-brand-600 flex items-center justify-center shadow-lg">
                                           <Check className="w-3.5 h-3.5 font-black" />
                                         </div>
                                       </div>
                                    )}
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-4 rounded-2xl bg-gray-900 text-white border-0 shadow-2xl">
                                  <div className="space-y-2">
                                    <p className="font-black text-sm leading-tight">
                                      {job.job_title || job.occupation_title}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10">
                                      {job.noc_code && (
                                        <Badge className="bg-white/10 text-white border-0 text-[9px] font-black">NOC {job.noc_code}</Badge>
                                      )}
                                      <Badge className="bg-brand-500 text-white border-0 text-[9px] font-black uppercase">{job.type === 'lmia' ? 'LMIA' : 'LEAD'}</Badge>
                                    </div>
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
                      <div className="flex justify-center mb-10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllSavedJobs(!showAllSavedJobs)}
                          className="px-6 h-10 rounded-xl border-gray-100 hover:border-brand-200 hover:bg-brand-50 text-xs font-black uppercase tracking-widest transition-all"
                        >
                          {showAllSavedJobs ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Minimize History
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Expand Full Repository ({filteredSavedJobs.length})
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* No Results Message */}
                    {!savedJobsLoading &&
                      savedJobsSearch &&
                      filteredSavedJobs.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">
                            No saved jobs match &ldquo;{savedJobsSearch}&rdquo;
                          </p>
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
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="flex justify-center"
                      >
                        <Button
                          onClick={handleCompareSavedJobs}
                          className="h-14 px-10 bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white rounded-[1.5rem] font-black tracking-tight text-lg shadow-2xl shadow-brand-500/30 transition-all hover:-translate-y-1 active:scale-95 group"
                        >
                          <BarChart3 className="w-5 h-5 mr-3 transition-transform group-hover:rotate-12" />
                          Initialize Intelligence Capture
                        </Button>
                      </motion.div>
                    )}

                    {/* Suggested Comparisons */}
                    {suggestedComparisons.length > 0 && (
                      <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-amber-50 rounded-xl">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                              Engine Suggestions
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">Automated Intelligence Vectors</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {suggestedComparisons.map((suggestion, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.05, y: -2 }}
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
                              className="flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-amber-50/50 to-orange-50/50 hover:from-white border border-amber-100 rounded-2xl text-xs font-black shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all group/suggestion"
                            >
                              <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover/suggestion:bg-amber-500/20 transition-colors">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              </div>
                              <span className="text-amber-900 uppercase">
                                {suggestion.label}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="text-sm text-gray-500 font-medium">
                      OR
                    </span>
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
                <Card
                  className={cn(
                    'relative overflow-hidden bg-white border-0 shadow-[0_20px_50px_rgba(0,0,0,0.08)]',
                    isMobile ? 'p-6 rounded-[2.5rem]' : 'p-12 rounded-[3rem]'
                  )}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400" />
                  
                  {/* Step 2 Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-brand-500/20">
                        2
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
                          Select Entities to Compare
                        </h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                          Picking {enable3Way ? '3' : '2'} {selectedType?.label.toLowerCase()} for deep analysis
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (!isPremium) {
                            toast.error('Premium Feature', {
                              description: '3-Way Comparison is only available on premium plans.',
                              action: { label: 'Upgrade', onClick: () => router.push('/pricing') }
                            });
                            return;
                          }
                          const next = !enable3Way;
                          setEnable3Way(next);
                          if (!next) setEntity3('');
                        }}
                        className={cn(
                          'flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all text-sm font-bold',
                          enable3Way
                            ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm shadow-brand-500/10'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-brand-100 hover:bg-brand-50/50'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300',
                          enable3Way ? 'bg-brand-600 text-white rotate-0' : 'bg-gray-200 text-transparent rotate-90'
                        )}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        3-Way Mode
                        <Badge className={cn(
                          'ml-1 text-[9px] px-2 py-0 border-0 font-black tracking-tighter',
                          enable3Way ? 'bg-brand-200 text-brand-800' : 'bg-gray-100 text-gray-400'
                        )}>
                          BETA
                        </Badge>
                      </button>
                    </div>
                  </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="hidden sm:flex border-brand-200 text-brand-600 hover:bg-brand-50">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Company to Queue
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[300px] p-2">
                        <div className="text-xs font-semibold text-gray-500 mb-2 px-2">Search companies to add to queue</div>
                        <VirtualizedSearchableSelector
                          value=""
                          onValueChange={handleAddToQueue}
                          options={(employerOptions || [])}
                          placeholder="Search companies..."
                          isLoading={employersLoading}
                          excludeValues={comparedCompanies.map(c => c.name)}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div
                    className={cn(
                      'flex items-center justify-center',
                      isMobile ? 'flex-col gap-3' : 'gap-8'
                    )}
                  >
                    {/* Entity 1 */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className={isMobile ? 'w-full' : 'flex-1 max-w-md'}
                    >
                      <label
                        className={cn(
                          'block font-semibold text-gray-700 mb-3 flex items-center gap-2',
                          isMobile ? 'text-xs' : 'text-sm'
                        )}
                      >
                        {selectedType && (
                          <selectedType.icon
                            className={cn(
                              isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4',
                              'text-brand-600'
                            )}
                          />
                        )}
                        {selectedType?.label} #1
                      </label>
                      <VirtualizedSearchableSelector
                        value={entity1}
                        onValueChange={setEntity1}
                        options={(options || [])}
                        placeholder={`Search ${selectedType?.label
                          .toLowerCase()
                          .slice(0, -1)}...`}
                        isLoading={isLoading}
                        excludeValue={entity2}
                      />
                    </motion.div>

                    {/* VS Indicator 1 */}
                    <div className="flex-shrink-0 py-4">
                      <div className="relative group/vs">
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 5, repeat: Infinity }}
                          className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-xl shadow-brand-500/20 z-10 relative"
                        >
                          <span className="text-white font-black text-xl italic tracking-tighter">
                            VS
                          </span>
                        </motion.div>
                        <div className="absolute inset-0 bg-brand-500/20 rounded-[1.5rem] blur-2xl group-hover/vs:scale-150 transition-transform duration-700" />
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="absolute inset--2 rounded-[2rem] border-2 border-dashed border-brand-200 opacity-50"
                        />
                      </div>
                    </div>

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
                        options={(options || [])}
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
                        <div className="flex-shrink-0 py-4">
                          <div className="relative group/vs">
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, -5, 5, 0]
                              }}
                              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                              className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-xl shadow-brand-500/20 z-10 relative"
                            >
                              <span className="text-white font-black text-xl italic tracking-tighter">
                                VS
                              </span>
                            </motion.div>
                            <div className="absolute inset-0 bg-brand-500/20 rounded-[1.5rem] blur-2xl group-hover/vs:scale-150 transition-transform duration-700" />
                          </div>
                        </div>

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
                            options={(options || [])}
                            placeholder={`Search ${selectedType?.label
                              .toLowerCase()
                              .slice(0, -1)}...`}
                            isLoading={isLoading}
                            excludeValues={[entity1, entity2]}
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
                      disabled={
                        !entity1 || !entity2 || (enable3Way && !entity3)
                      }
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
              dataSource={dataSource}
              onReset={handleReset}
              onModify={() => setShowResults(false)}
            />
          )}
        </div>
      </div>

      {/* Mobile: Bottom Navigation */}
      {isMobile && <BottomNav />}

      {/* Standard Footer */}
      {!showResults && <Footer />}
    </BackgroundWrapper >
  );
}
