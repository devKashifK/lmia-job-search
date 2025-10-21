'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/hooks/use-session';
import { handleSave, checkIfSaved, getJobRecordId } from '@/utils/saved-jobs';
import { NocJobDescriptionSkeleton } from './skeletons';
import { ShareButton } from './share-button';
import {
  Star,
  ExternalLink,
  Briefcase,
  MapPin,
  Calendar,
  Building2,
  AlertCircle,
  FileText,
  Award,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  Globe,
  Phone,
  Mail,
  Check,
  Copy,
  TrendingUp,
  Contact,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NocProfile {
  code: string;
  title: string;
  overview: string;
  mainDuties: Record<string, string[]>;
  employmentRequirements: string[];
  additionalInfo: string[];
}

interface Job {
  id?: number;
  RecordID?: number;
  employer: string;
  job_title?: string;
  occupation_title?: string;
  city: string;
  state: string;
  noc_code?: string;
  '2021_noc'?: string;
  category?: string;
  employer_type?: string;
  date_of_job_posting?: string;
  program?: string;
  lmia_year?: number;
  priority_occupation?: string;
  approved_positions?: number;
  territory?: string;
}

interface NocJobDescriptionProps {
  job: Job | null;
  onSaveJob?: () => void;
  onViewNOC?: () => void;
  isSaved?: boolean;
  className?: string;
  searchType?: string;
}

async function fetchNocProfile(code: string): Promise<NocProfile | null> {
  try {
    const response = await fetch(`/noc_description/noc_profiles.json`);
    const data = await response.json();
    return data[code] || null;
  } catch (error) {
    console.error('Error fetching NOC profile:', error);
    return null;
  }
}

function formatMainDuties(mainDuties: Record<string, string[]>): string[] {
  const duties: string[] = [];
  Object.values(mainDuties).forEach((items) => {
    if (items && items.length > 0) {
      duties.push(...items);
    }
  });
  return duties;
}

export function NocJobDescription({
  job,
  onSaveJob,
  onViewNOC,
  isSaved = false,
  className = '',
  searchType,
}: NocJobDescriptionProps) {
  const { session } = useSession();
  const router = useRouter();
  const [nocProfile, setNocProfile] = useState<NocProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllRequirements, setShowAllRequirements] = useState(false);
  const [showAllResponsibilities, setShowAllResponsibilities] = useState(false);
  const [showAllAdditionalInfo, setShowAllAdditionalInfo] = useState(false);
  const [openPremium, setOpenPremium] = useState(false);
  const [dbSaved, setDbSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  // Check if job is saved in database
  useEffect(() => {
    const checkSavedState = async () => {
      if (!job || !session?.user?.id) {
        setDbSaved(false);
        return;
      }

      const recordId = getJobRecordId(job);
      if (!recordId) {
        setDbSaved(false);
        return;
      }

      try {
        const saved = await checkIfSaved(recordId, session);
        setDbSaved(saved);
      } catch (error) {
        console.error('Failed to check if job is saved:', error);
        setDbSaved(false);
      }
    };

    checkSavedState();
  }, [job, session?.user?.id]);

  // Handle save job with database sync
  const handleSaveJob = async () => {
    if (!job || !session?.user?.id) {
      // Fallback to prop function if no session
      onSaveJob?.();
      return;
    }

    const recordId = getJobRecordId(job);
    if (!recordId) {
      console.warn('No record ID found for job, using fallback');
      onSaveJob?.();
      return;
    }

    setSavingJob(true);
    try {
      const result = await handleSave(recordId, session);
      if (result) {
        setDbSaved(result.saved);
        // Also call the prop function for local state consistency
        onSaveJob?.();
      }
    } catch (error) {
      console.error('Failed to save/unsave job:', error);
      // Fallback to prop function on error
      onSaveJob?.();
    } finally {
      setSavingJob(false);
    }
  };

  // Copy NOC code to clipboard
  const copyNOCCode = async () => {
    const nocCode = job?.noc_code || job?.['2021_noc'] || '';
    try {
      await navigator.clipboard.writeText(nocCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy NOC code:', err);
    }
  };

  const handleViewCompanyJobs = () => {
    if (job?.employer) {
      if (searchType == 'hot_leads') {
        router.push(
          `/analysis/${encodeURIComponent(job.employer)}?t=trending_job`
        );
      } else {
        router.push(`/analysis/${encodeURIComponent(job.employer)}?t=lmia`);
      }
    }
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    if (!dateString || dateString === 'Unknown') return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (job?.noc_code || job?.['2021_noc']) {
      setLoading(true);
      const nocCode = job.noc_code || job['2021_noc'];

      async function loadNocProfile() {
        const profile = await fetchNocProfile(nocCode);
        setNocProfile(profile);
        setLoading(false);
      }
      loadNocProfile();
    } else {
      setNocProfile(null);
      setLoading(false);
    }
  }, [job?.noc_code, job?.['2021_noc']]);

  // Show skeleton for all loading states (no job selected OR loading NOC profile)
  if (!job || loading) {
    return <NocJobDescriptionSkeleton className={className} />;
  }

  // If job exists but no NOC profile found (after loading completed)
  if (job && !loading && !nocProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`bg-gradient-to-br from-gray-50 to-white overflow-y-auto relative ${className}`}
      >
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="relative z-10 w-full py-8 px-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/30">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <AlertCircle className="w-12 h-12 text-amber-600" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                NOC Profile Not Available
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6 max-w-md">
                Detailed NOC profile information is not available for this job
                posting. You can still view basic job information above.
              </p>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800 font-medium flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contact the employer directly for more details
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const jobData = {
    title: nocProfile.title,
    company: job.employer,
    location: `${job.city}, ${job.state}`,
    salary: job.priority_occupation || 'Varies by employer',
    postedDate: job.date_of_job_posting || 'Unknown',
    experienceLevel: 'As per requirements',
    jobType: 'Full-time',
    workType: 'On-site',
    salaryHourly: 'Varies by employer',
    aboutCompany: nocProfile.overview,
    jobDescription: formatMainDuties(nocProfile.mainDuties),
    requirements: nocProfile.employmentRequirements,
    companyLogoUrl: '/logo.svg',
    additionalInfo: nocProfile.additionalInfo,
  };

  const goTo = (path: string) => {
    router.push(path);
  };
  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={` min-h-full ${className}`}
      >
        <ScrollArea className="h-full">
          <div className="p-1 space-y-4">
            {/* Striking Header Card with gradient border */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative rounded-2xl bg-gradient-to-r from-brand-400 via-purple-500 to-brand-600 p-0.5">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 shadow-sm">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
                    <div
                      className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full animate-bounce"
                      style={{
                        animationDelay: '1s',
                        animationDuration: '3s',
                      }}
                    />
                  </div>

                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Enhanced NOC Badge and Status */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                              <Award className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge
                                onClick={() =>
                                  goTo(
                                    `${encodeURIComponent(
                                      job.noc_code
                                    )}?field=noc_code&t=trending_job`
                                  )
                                }
                                className="bg-white/20 cursor-pointer text-white border-white/30 font-mono text-xs px-2 py-1"
                              >
                                NOC {job.noc_code || job['2021_noc']}
                              </Badge>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={copyNOCCode}
                                    className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                                  >
                                    <motion.div
                                      animate={{
                                        scale: copied ? [1, 1.2, 1] : 1,
                                      }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      {copied ? (
                                        <Check className="w-3 h-3 text-emerald-300" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </motion.div>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {copied ? 'Copied!' : 'Copy NOC Code'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-white/90 text-xs font-medium">
                              Active Posting
                            </span>
                          </div>
                        </div>

                        {/* Job Title */}
                        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
                          {jobData.title}
                        </h1>

                        {/* Enhanced Company and Location */}
                        <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                          <div
                            className="flex items-center gap-1.5"
                            onClick={() =>
                              goTo(
                                `/analysis/${encodeURIComponent(
                                  jobData.company
                                )}`
                              )
                            }
                          >
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">
                              {jobData.company}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span>{jobData.location}</span>
                          </div>
                          {jobData.postedDate &&
                            jobData.postedDate !== 'Unknown' && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {getRelativeTime(jobData.postedDate) ||
                                    jobData.postedDate}
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Enhanced Compact Badges */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {job.category && (
                            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs px-2 py-0.5">
                              {job.category}
                            </Badge>
                          )}
                          {job.employer_type && (
                            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs px-2 py-0.5">
                              <Building2 className="w-3 h-3 mr-1" />
                              {job.employer_type}
                            </Badge>
                          )}
                          {job.approved_positions && (
                            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs px-2 py-0.5">
                              <Users className="w-3 h-3 mr-1" />
                              {job.approved_positions} Pos.
                            </Badge>
                          )}
                          {job.program && (
                            <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-xs px-2 py-0.5">
                              <Globe className="w-3 h-3 mr-1" />
                              {job.program}
                            </Badge>
                          )}
                          {job.lmia_year && (
                            <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 text-xs px-2 py-0.5">
                              <Calendar className="w-3 h-3 mr-1" />
                              LMIA {job.lmia_year}
                            </Badge>
                          )}

                          <Button
                            onClick={handleViewCompanyJobs}
                            className="bg-transparent  text-white shadow-none hover:shadow-none hover:bg-transparent transition-all duration-300 px-0 py-0 text-sm font-medium"
                          >
                            <TrendingUp className="w-5 h-5 text-white" />
                            More Jobs by {jobData.company}
                          </Button>
                        </div>
                      </div>

                      {/* Compact Action Buttons with Tooltips */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {/* Company Analysis CTA Button */}

                        <ShareButton
                          jobTitle={nocProfile?.title}
                          employer={job?.employer}
                          city={job?.city}
                          state={job?.state}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-3 py-2"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              onClick={handleSaveJob}
                              disabled={savingJob}
                              className={`transition-all duration-300 px-3 py-2 ${
                                savingJob
                                  ? 'opacity-50 cursor-not-allowed bg-white/20'
                                  : dbSaved || isSaved
                                  ? 'bg-yellow-500 hover:bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-500/25'
                                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm'
                              }`}
                            >
                              <motion.div
                                animate={{
                                  scale: dbSaved || isSaved ? [1, 1.2, 1] : 1,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    dbSaved || isSaved ? 'fill-current' : ''
                                  }`}
                                />
                              </motion.div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {savingJob
                                ? 'Saving...'
                                : dbSaved || isSaved
                                ? 'Remove from saved'
                                : 'Save this job'}
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenPremium(true)}
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-3 py-2"
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Upgrade required to unlock Phone details
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenPremium(true)}
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-3 py-2"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Upgrade required to unlock Email details
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        {/* <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              onClick={onViewNOC}
                              className="bg-white text-brand-700 hover:bg-gray-50 px-3 py-2 shadow-lg font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">View full NOC details</p>
                          </TooltipContent>
                        </Tooltip> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Compact Info Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-1 gap-4"
            >
              {/* Quick Info Card */}
              <Card className="border-0  bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-brand-100 rounded-lg">
                        <Briefcase className="w-4 h-4 text-brand-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Quick Info
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500 uppercase tracking-wide">
                          Experience
                        </p>
                        <p className="font-medium text-gray-900">
                          {jobData.experienceLevel}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase tracking-wide">
                          Type
                        </p>
                        <p className="font-medium text-gray-900">
                          {jobData.jobType}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Company Analysis CTA Card */}

            {/* Content Sections - Compact */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                {jobData.aboutCompany && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Building2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            Overview
                          </h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                          {jobData.aboutCompany}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {jobData.requirements && jobData.requirements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-red-50 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-red-100 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm">
                              Requirements
                            </h3>
                          </div>
                          {jobData.requirements.length > 4 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setShowAllRequirements(!showAllRequirements)
                              }
                              className="h-6 text-xs text-gray-500 hover:text-gray-700 p-1"
                            >
                              {showAllRequirements ? (
                                <>
                                  <ChevronUp className="w-3 h-3 mr-1" />
                                  Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 mr-1" />+
                                  {jobData.requirements.length - 4} More
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        <ul className="space-y-2 text-sm">
                          <AnimatePresence>
                            {(showAllRequirements
                              ? jobData.requirements
                              : jobData.requirements.slice(0, 4)
                            ).map((req: string, index: number) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: -10, height: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.05,
                                }}
                                className="flex items-start gap-2 text-gray-700"
                              >
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                                <span className="leading-relaxed">{req}</span>
                              </motion.li>
                            ))}
                          </AnimatePresence>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {jobData.jobDescription &&
                  jobData.jobDescription.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-green-50 hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-green-100 rounded-lg">
                                <FileText className="w-4 h-4 text-green-600" />
                              </div>
                              <h3 className="font-bold text-gray-900 text-sm">
                                Key Responsibilities
                              </h3>
                            </div>
                            {jobData.jobDescription.length > 5 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setShowAllResponsibilities(
                                    !showAllResponsibilities
                                  )
                                }
                                className="h-6 text-xs text-gray-500 hover:text-gray-700 p-1"
                              >
                                {showAllResponsibilities ? (
                                  <>
                                    <ChevronUp className="w-3 h-3 mr-1" />
                                    Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3 mr-1" />+
                                    {jobData.jobDescription.length - 5} More
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                          <ul className="space-y-2 text-sm">
                            <AnimatePresence>
                              {(showAllResponsibilities
                                ? jobData.jobDescription
                                : jobData.jobDescription.slice(0, 5)
                              ).map((desc: string, index: number) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: 10, height: 0 }}
                                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                                  exit={{ opacity: 0, x: 10, height: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: index * 0.05,
                                  }}
                                  className="flex items-start gap-2 text-gray-700"
                                >
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                                  <span className="leading-relaxed">
                                    {desc}
                                  </span>
                                </motion.li>
                              ))}
                            </AnimatePresence>
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                {jobData.additionalInfo &&
                  jobData.additionalInfo.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-purple-50 hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-purple-100 rounded-lg">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                              </div>
                              <h3 className="font-bold text-gray-900 text-sm">
                                Additional Info
                              </h3>
                            </div>
                            {jobData.additionalInfo.length > 3 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setShowAllAdditionalInfo(
                                    !showAllAdditionalInfo
                                  )
                                }
                                className="h-6 text-xs text-gray-500 hover:text-gray-700 p-1"
                              >
                                {showAllAdditionalInfo ? (
                                  <>
                                    <ChevronUp className="w-3 h-3 mr-1" />
                                    Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3 mr-1" />+
                                    {jobData.additionalInfo.length - 3} More
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          <ul className="space-y-2 text-sm">
                            <AnimatePresence>
                              {(showAllAdditionalInfo
                                ? jobData.additionalInfo
                                : jobData.additionalInfo.slice(0, 3)
                              ).map((info: string, index: number) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: 10, height: 0 }}
                                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                                  exit={{ opacity: 0, x: 10, height: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: index * 0.05,
                                  }}
                                  className="flex items-start gap-2 text-gray-700"
                                >
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                                  <span className="leading-relaxed">
                                    {info}
                                  </span>
                                </motion.li>
                              ))}
                            </AnimatePresence>
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                <div>
                  <Button
                    className="bg-brand-600 w-full"
                    onClick={() => setOpenPremium(true)}
                  >
                    <Contact className="w-4 h-4" />
                    Contact Employer
                  </Button>
                </div>
              </div>
            </div>

            {/* Expand Button */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-center pt-2"
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-medium"
                onClick={onViewNOC}
              >
                View Complete Job Details
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </motion.div> */}

            {/* Premium Contact Dialog */}
            <Dialog open={openPremium} onOpenChange={setOpenPremium}>
              <DialogContent className="sm:max-w-md">
                <DialogTitle>Unlock Employer Contacts</DialogTitle>
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Get Direct Access to {job?.employer}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Upgrade to premium to unlock employer email addresses,
                      phone numbers, and direct contact information.
                    </p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700"
                    onClick={() => setOpenPremium(false)}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </ScrollArea>
      </motion.div>
    </TooltipProvider>
  );
}
