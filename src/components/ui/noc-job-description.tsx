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
import { getJobRecordId } from '@/utils/saved-jobs';
import { NocJobDescriptionSkeleton } from './skeletons';
import { ShareButton } from './share-button';
import { useSaveJob } from '@/hooks/use-save-job';
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
  const recordId = job ? getJobRecordId(job) : undefined;
  const {
    isSaved: dbSaved,
    toggleSave,
    isLoading: savingJob,
    checkSavedStatus,
    LoginAlertComponent,
  } = useSaveJob(recordId);

  const [nocProfile, setNocProfile] = useState<NocProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllRequirements, setShowAllRequirements] = useState(false);
  const [showAllResponsibilities, setShowAllResponsibilities] = useState(false);
  const [showAllAdditionalInfo, setShowAllAdditionalInfo] = useState(false);
  const [openPremium, setOpenPremium] = useState(false);

  useEffect(() => {
    checkSavedStatus();
  }, [checkSavedStatus]);

  const handleSaveJob = async () => {
    await toggleSave();
    onSaveJob?.();
  };

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
      if (searchType === 'hot_leads') {
        router.push(
          `/analysis/${encodeURIComponent(
            job.employer
          )}?t=trending_job&jobTitle=${encodeURIComponent(
            job.job_title ?? ''
          )}&location=${encodeURIComponent(
            job.state
          )}&city=${encodeURIComponent(job.city)}&noc=${encodeURIComponent(
            job.noc_code ?? ''
          )}`
        );
      } else {
        router.push(
          `/analysis/${encodeURIComponent(
            job.employer
          )}?t=lmia&jobTitle=${encodeURIComponent(
            job.job_title ?? ''
          )}&location=${encodeURIComponent(
            job.state
          )}&city=${encodeURIComponent(job.city)}&noc=${encodeURIComponent(
            job.noc_code ?? ''
          )}`
        );
      }
    }
  };

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
      const nocCode = job.noc_code || job['2021_noc'] || '';
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

  const jobData = {
    title: nocProfile?.title,
    company: job?.employer,
    location: `${job?.city}, ${job?.state}`,
    salary: job?.priority_occupation || 'Varies by employer',
    postedDate: job?.date_of_job_posting || 'Unknown',
    experienceLevel: 'As per requirements',
    jobType: 'Full-time',
    workType: 'On-site',
    salaryHourly: 'Varies by employer',
    aboutCompany: nocProfile?.overview,
    jobDescription: formatMainDuties(nocProfile?.mainDuties ?? {}), // ✅ safe fallback
    requirements: nocProfile?.employmentRequirements ?? [], // ✅ safe fallback
    companyLogoUrl: '/logo.svg',
    additionalInfo: nocProfile?.additionalInfo ?? [], // ✅ safe fallback
  };

  const goTo = (path: string) => router.push(path);

  if (!job || loading) {
    return <NocJobDescriptionSkeleton className={className} />;
  }

  if (job && !loading && !nocProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`bg-gray-50/50 relative ${className}`}
      >
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

        <div className="relative z-10 w-full py-8 px-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/30">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
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
      </motion.div >
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={` min-h-full ${className}`}
      >
        <ScrollArea className="h-full">
          <div className="p-2 space-y-3">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-0.5 shadow-xl shadow-brand-500/10">
                <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl" />
                  </div>

                  <div className="relative p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 backdrop-blur-sm rounded-lg">
                              <Award className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge
                                onClick={() =>
                                  goTo(
                                    `${encodeURIComponent(
                                      job!.noc_code ?? job!['2021_noc'] ?? ''
                                    )}?field=noc_code&t=trending_job`
                                  )
                                }
                                className="bg-white/10 backdrop-blur-md cursor-pointer text-white border-white/20 font-medium text-xs px-2.5 py-1 hover:bg-white/20 transition-all"
                              >
                                NOC {job!.noc_code || job!['2021_noc']}
                              </Badge>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={copyNOCCode}
                                    className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                                  >
                                    <motion.div
                                      animate={{
                                        scale: copied ? [1, 1.2, 1] : 1,
                                      }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      {copied ? (
                                        <Check className="w-2.5 h-2.5 text-emerald-300" />
                                      ) : (
                                        <Copy className="w-2.5 h-2.5" />
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
                        </div>

                        <h1 className="text-xl lg:text-2xl font-bold text-white mb-2 leading-tight">
                          {jobData.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
                          <div
                            className="flex items-center gap-1"
                            onClick={() =>
                              goTo(
                                `/analysis/${encodeURIComponent(
                                  jobData.company ?? ''
                                )}`
                              )
                            }
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span className="font-medium text-sm">
                              {jobData.company}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-sm">{jobData.location}</span>
                          </div>
                          {jobData.postedDate &&
                            jobData.postedDate !== 'Unknown' && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-sm">
                                  {getRelativeTime(jobData.postedDate) ||
                                    jobData.postedDate}
                                </span>
                              </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job?.category && (
                            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs px-2 py-0.5">
                              {job.category}
                            </Badge>
                          )}
                          {job?.employer_type && (
                            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs px-2 py-0.5">
                              <Building2 className="w-3 h-3 mr-1" />
                              {job.employer_type}
                            </Badge>
                          )}
                          {job?.approved_positions && (
                            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs px-2 py-0.5">
                              <Users className="w-3 h-3 mr-1" />
                              {job.approved_positions} Pos.
                            </Badge>
                          )}
                          {job?.program && (
                            <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-xs px-2 py-0.5">
                              <Globe className="w-3 h-3 mr-1" />
                              {job.program}
                            </Badge>
                          )}
                          {job?.lmia_year && (
                            <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 text-xs px-2 py-0.5">
                              <Calendar className="w-3 h-3 mr-1" />
                              LMIA {job.lmia_year}
                            </Badge>
                          )}

                          <Button
                            onClick={handleViewCompanyJobs}
                            className="bg-transparent text-white shadow-none hover:shadow-none hover:bg-transparent transition-all duration-300 px-0 py-0 text-xs font-medium"
                          >
                            <TrendingUp className="w-4 h-4 text-white" />
                            More Jobs by {jobData.company}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <ShareButton
                          jobTitle={nocProfile?.title}
                          employer={job?.employer}
                          city={job?.city}
                          state={job?.state}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-2.5 py-1.5 text-xs transition-all duration-200 hover:scale-105"
                        />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              onClick={handleSaveJob}
                              disabled={savingJob}
                              className={`transition-all duration-300 px-2.5 py-1.5 text-xs hover:scale-105 ${savingJob
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
                                  className={`w-3.5 h-3.5 ${dbSaved || isSaved ? 'fill-current' : ''
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

                        <div className="flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOpenPremium(true)}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-2 py-1.5 hover:scale-105 transition-all duration-200"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Upgrade to unlock Phone</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOpenPremium(true)}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-2 py-1.5 hover:scale-105 transition-all duration-200"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Upgrade to unlock Email</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100 rounded-xl overflow-hidden">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg">
                        <Briefcase className="w-3.5 h-3.5 text-brand-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Quick Info
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 uppercase tracking-wide mb-1">
                          Experience
                        </p>
                        <p className="font-medium text-gray-900">
                          {jobData.experienceLevel}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 uppercase tracking-wide mb-1">
                          Type
                        </p>
                        <p className="font-medium text-gray-900">
                          {jobData.jobType}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 uppercase tracking-wide mb-1">
                          Work Mode
                        </p>
                        <p className="font-medium text-gray-900">
                          {jobData.workType}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 uppercase tracking-wide mb-1">
                          Salary
                        </p>
                        <p className="font-medium text-gray-900 truncate">
                          {jobData.salary}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Content sections */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <div className="space-y-4">
                {jobData.aboutCompany && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all duration-300 rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            Overview
                          </h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {jobData.aboutCompany}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {jobData.requirements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-red-50 hover:shadow-lg transition-all duration-300 rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
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
                              className="h-6 text-xs text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-md transition-colors"
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
                            ).map((req, index) => (
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
                                <span className="leading-relaxed text-xs">
                                  {req}
                                </span>
                              </motion.li>
                            ))}
                          </AnimatePresence>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              <div className="space-y-4">
                {jobData.jobDescription.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-green-50 hover:shadow-lg transition-all duration-300 rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                              <FileText className="w-3.5 h-3.5 text-green-600" />
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
                              className="h-6 text-xs text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-md transition-colors"
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
                            ).map((desc, index) => (
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
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                                <span className="leading-relaxed text-xs">
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

                {jobData.additionalInfo.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-purple-50 hover:shadow-lg transition-all duration-300 rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
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
                                setShowAllAdditionalInfo(!showAllAdditionalInfo)
                              } // ✅ use correct setter
                              className="h-6 text-xs text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              {showAllAdditionalInfo ? ( // ✅ use correct state
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
                            ).map((info, index) => (
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
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                                <span className="leading-relaxed text-xs">
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

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Button
                    className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white w-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3"
                    onClick={() => setOpenPremium(true)}
                  >
                    <Contact className="w-4 h-4 mr-2" />
                    Contact Employer
                  </Button>
                </motion.div>
              </div>
            </div>

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
      <LoginAlertComponent />
    </TooltipProvider>
  );
}
