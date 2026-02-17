'use client';

import React from 'react';
import {
    Building2,
    MapPin,
    Calendar,
    Briefcase,
    Star,
    Clock,
    Info,
} from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from './tooltip';
import Link from 'next/link';
import { AttributeName } from '@/helpers/attribute';
import { MatchScoreBadge } from '@/components/recommendations/match-score-badge';
import { useMatchScore } from '@/hooks/use-match-score';
import { UserPreferences } from '@/hooks/use-user-preferences';
import { getJobRecordId } from '@/utils/saved-jobs';

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

interface JobListItemProps {
    job: Job;
    isSelected: boolean;
    onSelect: (job: Job) => void;
    isSaved: boolean;
    onToggleSave: (e: React.MouseEvent) => void;
    searchType: 'lmia' | 'hot_leads';
    isLoadingSaved: boolean;
    userPreferences: UserPreferences | null;
    index: number; // For debugging or keys if needed
}

export function JobListItem({
    job,
    isSelected,
    onSelect,
    isSaved,
    onToggleSave,
    searchType,
    isLoadingSaved,
    userPreferences,
}: JobListItemProps) {
    // --- Match Score Logic ---
    // Create a job object structure compatible with useMatchScore
    const jobForScoring = React.useMemo(() => ({
        job_title: job.job_title || job.occupation_title,
        JobTitle: job.job_title || job.occupation_title,
        employer: job.employer,
        city: job.city,
        City: job.city,
        province: job.state || job.territory,
        Province: job.state || job.territory,
        industry: job.category,
        noc: job.noc_code || job['2021_noc'],
        program: job.program,
        teer: null,
    }), [job]);

    const { score } = useMatchScore({
        job: jobForScoring,
        preferences: userPreferences,
    });

    // --- Derived Values ---
    const jobTitle = job.job_title || job.occupation_title || 'N/A';
    const nocCode = job.noc_code || job['2021_noc'] || 'N/A';
    const isRecent =
        job.date_of_job_posting &&
        new Date().getTime() - new Date(job.date_of_job_posting).getTime() <
        7 * 24 * 60 * 60 * 1000;

    return (
        <div
            className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden rounded-xl border mb-3 mx-2 ${isSelected
                ? 'bg-gradient-to-br from-brand-50 to-white border-brand-500/30 shadow-md ring-1 ring-brand-500/20'
                : 'bg-white border-transparent hover:border-brand-200/50'
                }`}
            onClick={() => onSelect(job)}
        >
            {/* Match Score Badge - Positioned Absolute Top Right */}
            <div className="absolute top-2 right-2 z-10">
                <Tooltip>
                    <TooltipTrigger asChild>
                        {/* Wrap in div to ensure ref forwarding works if Badge doesn't support it directly, and add cursor style */}
                        <div className="cursor-help">
                            <MatchScoreBadge score={score} size="sm" showLabel={false} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="p-3 max-w-[200px] bg-white text-gray-900 border border-gray-100 shadow-xl rounded-xl z-50">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                            <p className="font-semibold text-sm">Match Score: {score}%</p>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Calculated based on your profile skills and preferences.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </div>

            <div className="px-3 py-2.5">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        {/* Job Title and Company */}
                        <div className="flex items-start gap-2 mb-1.5 pr-8">
                            {/* Added pr-8 to avoid overlap with badge */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${isSelected
                                            ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-500/20'
                                            : 'bg-white border border-gray-100 text-gray-500 group-hover:border-brand-200 group-hover:text-brand-600 group-hover:shadow-sm'
                                            }`}
                                    >
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Company: <AttributeName name={job.employer} />
                                    </p>
                                    {job.employer_type && <p>Type: {job.employer_type}</p>}
                                </TooltipContent>
                            </Tooltip>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <h4 className="font-semibold text-gray-900 truncate cursor-help text-sm group-hover:text-brand-700 transition-colors">
                                                <AttributeName name={jobTitle} />
                                            </h4>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                <AttributeName name={jobTitle} />
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                    {isRecent && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300 font-semibold shadow-sm"
                                                >
                                                    New
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Posted within the last 7 days</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                                <Link
                                    onClick={(e) => e.stopPropagation()}
                                    href={`/search/${searchType === 'hot_leads' ? 'hot-leads' : 'lmia'
                                        }/${encodeURIComponent(job.employer)}?field=employer&t=${searchType === 'hot_leads' ? 'trending_job' : 'lmia'
                                        }`}
                                    className="text-xs text-gray-600 truncate hover:text-brand-600 hover:underline transition-colors font-medium"
                                >
                                    <AttributeName name={job.employer} />
                                </Link>
                            </div>
                        </div>

                        {/* Enhanced Job Details */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                        <MapPin className="w-3 h-3" />
                                        <span className="text-xs flex items-center gap-1">
                                            <Link
                                                onClick={(e) => e.stopPropagation()}
                                                href={`/search/${searchType === 'hot_leads' ? 'hot-leads' : 'lmia'
                                                    }/${encodeURIComponent(job.city)}?field=city&t=${searchType === 'hot_leads' ? 'trending_job' : 'lmia'
                                                    }`}
                                                className="hover:text-brand-600 hover:underline transition-colors"
                                            >
                                                <AttributeName name={job.city} />
                                            </Link>
                                            ,
                                            <Link
                                                onClick={(e) => e.stopPropagation()}
                                                href={`/search/${searchType === 'hot_leads' ? 'hot-leads' : 'lmia'
                                                    }/${encodeURIComponent(job.state)}?field=state&t=${searchType === 'hot_leads' ? 'trending_job' : 'lmia'
                                                    }`}
                                                className="hover:text-brand-600 hover:underline transition-colors"
                                            >
                                                <AttributeName name={job.state} />
                                            </Link>
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Job Location</p>
                                    {job.territory && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Territory: {job.territory}
                                        </p>
                                    )}
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                        <Briefcase className="w-3 h-3" />
                                        <span className="text-xs">
                                            NOC:{' '}
                                            <Link
                                                onClick={(e) => e.stopPropagation()}
                                                href={`/search/${searchType === 'hot_leads' ? 'hot-leads' : 'lmia'
                                                    }/${encodeURIComponent(nocCode)}?field=noc_code&t=${searchType === 'hot_leads' ? 'trending_job' : 'lmia'
                                                    }`}
                                                className="hover:text-brand-600 hover:underline transition-colors"
                                            >
                                                {nocCode}
                                            </Link>
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>National Occupational Classification</p>
                                    <p className="text-xs text-gray-500 mt-1">Code: {nocCode}</p>
                                </TooltipContent>
                            </Tooltip>

                            {job.date_of_job_posting && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 cursor-help">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-xs">
                                                {new Date(job.date_of_job_posting).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Job Posted Date</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(job.date_of_job_posting).toLocaleDateString(
                                                'en-US',
                                                {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                }
                                            )}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {job.approved_positions && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="cursor-help text-xs">
                                            {job.approved_positions} positions
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Number of approved positions for this job</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {job.lmia_year && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 cursor-help">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-xs">LMIA {job.lmia_year}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Labour Market Impact Assessment Year</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>

                        {/* Enhanced Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {job.category && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs px-2 py-0.5 cursor-help bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100 transition-colors"
                                        >
                                            <Link
                                                onClick={(e) => e.stopPropagation()}
                                                href={`/search/${searchType === 'hot_leads' ? 'hot-leads' : 'lmia'
                                                    }/${encodeURIComponent(job.category)}?field=category&t=${searchType === 'hot_leads' ? 'trending_job' : 'lmia'
                                                    }`}
                                            >
                                                {job.category}
                                            </Link>
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Job Category</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {job.program && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="outline"
                                            className="text-xs px-2 py-0.5 cursor-help bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100 transition-colors"
                                        >
                                            <Link
                                                onClick={(e) => e.stopPropagation()}
                                                href={`/search/${searchType === 'hot_leads' ? 'hot-leads' : 'lmia'
                                                    }/${encodeURIComponent(job.program)}?field=program&t=${searchType === 'hot_leads' ? 'trending_job' : 'lmia'
                                                    }`}
                                            >
                                                {job.program}
                                            </Link>
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Immigration Program</p>
                                        <p className="text-xs text-gray-500 mt-1">{job.program}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {job.priority_occupation && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="outline"
                                            className="text-xs px-2 py-0.5 border-green-300 text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 cursor-help hover:from-green-100 hover:to-emerald-100 transition-all font-semibold shadow-sm"
                                        >
                                            <Link
                                                onClick={(e) => e.stopPropagation()}
                                                href={`/search/${searchType === 'hot_leads' ? 'hot-leads' : 'lmia'
                                                    }/${encodeURIComponent(
                                                        job.priority_occupation
                                                    )}?field=priority_occupation&t=${searchType === 'hot_leads' ? 'trending_job' : 'lmia'
                                                    }`}
                                            >
                                                Priority
                                            </Link>
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Priority Occupation</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {job.priority_occupation}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Save Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isLoadingSaved}
                                onClick={onToggleSave}
                                className={`flex-shrink-0 p-1.5 h-7 w-7 rounded-lg transition-all duration-200 ${isLoadingSaved
                                    ? 'opacity-50 cursor-not-allowed'
                                    : isSaved
                                        ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100 shadow-sm'
                                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                    }`}
                            >
                                <Star
                                    className={`w-3.5 h-3.5 transition-all duration-200 ${isSaved ? 'fill-current scale-110' : ''
                                        }`}
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isSaved ? 'Remove from saved jobs' : 'Save this job'}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
