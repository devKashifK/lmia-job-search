'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
    CalendarDays,
    Filter,
    X,
    Briefcase,
    MapPin,
    Building2,
    Hash,
    BarChart3,
    Check,
    ChevronDown,
    TrendingUp,
    ArrowLeft,
    Menu,
    Home,
    Search,
    LayoutDashboard,
    CreditCard,
    GitCompare,
    BarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { AttributeName } from '@/helpers/attribute';

const DATE_PRESETS = [
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', days: 90 },
    { label: 'Last 6 months', days: 180 },
    { label: 'Last year', days: 365 },
    { label: 'All time', days: null },
];

interface SearchPageHeaderProps {
    currentSearchType: 'hot_leads' | 'lmia';
    title?: string;
    field?: string;
    count?: number;
}

export function SearchPageHeader({
    currentSearchType,
    title,
    field,
    count,
}: SearchPageHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // --- State & Helpers ---

    const updateFilters = (
        updates: Record<string, string | string[] | undefined>
    ) => {
        const newSearchParams = new URLSearchParams(searchParams?.toString() || '');

        Object.entries(updates).forEach(([key, value]) => {
            newSearchParams.delete(key);
            if (Array.isArray(value)) {
                value.forEach((v) => newSearchParams.append(key, v));
            } else if (value) {
                newSearchParams.set(key, value);
            }
        });

        // Always reset to page 1 on filter change
        newSearchParams.set('page', '1');

        router.push(`${pathname}?${newSearchParams.toString()}`);
    };

    const removeFilter = (key: string, value: string) => {
        const current = searchParams?.getAll(key) || [];
        const next = current.filter((v) => v !== value);

        const newSearchParams = new URLSearchParams(searchParams?.toString() || '');
        newSearchParams.delete(key);
        next.forEach(v => newSearchParams.append(key, v));
        newSearchParams.set('page', '1');
        router.push(`${pathname}?${newSearchParams.toString()}`);
    };

    const removeDateFilter = () => {
        const newSearchParams = new URLSearchParams(searchParams?.toString() || '');
        newSearchParams.delete('date_from');
        newSearchParams.delete('date_to');
        newSearchParams.set('page', '1');
        router.push(`${pathname}?${newSearchParams.toString()}`);
    };

    const switchSearchType = (type: 'hot_leads' | 'lmia') => {
        if (type === currentSearchType) return;
        
        const newSearchParams = new URLSearchParams(searchParams?.toString() || '');
        newSearchParams.set('t', type === 'hot_leads' ? 'trending_job' : 'lmia');
        newSearchParams.set('page', '1');
        
        // Re-construct the path
        const searchTerm = pathname.split('/').pop() || 'all';
        const newPath = `/search/${type === 'hot_leads' ? 'hot-leads' : 'lmia'}/${searchTerm}`;
        
        router.push(`${newPath}?${newSearchParams.toString()}`);
    };

    const clearFilters = () => {
        const newSearchParams = new URLSearchParams();
        const preserve = ['t', 'field', 'pageSize', 'q'];
        preserve.forEach(k => {
            const v = searchParams?.get(k);
            if (v) newSearchParams.set(k, v);
        });

        // Ensure current table is preserved
        newSearchParams.set('t', currentSearchType === 'hot_leads' ? 'trending_job' : 'lmia');

        router.push(`${pathname}?${newSearchParams.toString()}`);
    };

    // --- Derived State ---

    const dateFrom = searchParams?.get('date_from');
    const dateTo = searchParams?.get('date_to');

    // Filter keys to display as badges
    const filterKeys = [
        'job_title',
        'location',
        'state',
        'city',
        'noc_code',
        'category',
        'employer',
        'territory',
        'program',
        'priority_occupation'
    ];

    const activeFilters: { key: string; value: string }[] = [];
    filterKeys.forEach(key => {
        const values = searchParams?.getAll(key);
        values?.forEach(val => activeFilters.push({ key, value: val }));
    });

    const hasDateFilter = !!(dateFrom || dateTo);
    const activeCount = activeFilters.length + (hasDateFilter ? 1 : 0);

    // --- Render ---

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="mx-auto px-16 py-3 sm:px-16 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left Side: Home + Icon + Title + Info */}
                    <div className="flex items-center gap-3">
                        {/* Home Icon Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            title="Home"
                            className="h-9 w-9 p-0 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 shrink-0"
                            onClick={() => router.push('/')}
                        >
                            <Home className="w-5 h-5" />
                        </Button>
                        {/* Main Icon */}
                        <div className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border shadow-sm",
                            currentSearchType === 'hot_leads'
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                : "bg-blue-50 border-blue-100 text-brand-600"
                        )}>
                            {currentSearchType === 'hot_leads' ? (
                                <TrendingUp className="h-4.5 w-4.5" />
                            ) : (
                                <BarChart3 className="h-4.5 w-4.5" />
                            )}
                        </div>

                        <div className="space-y-0.5">
                            {/* Title (Search Query/Results) */}
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-none">
                                {title || 'Search Results'}
                            </h1>

                            {/* Metadata Row: Source • Field • Count */}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                                <div className="flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
                                    <button 
                                        onClick={() => switchSearchType('hot_leads')}
                                        className={cn(
                                            "px-2 py-0.5 rounded-full transition-all text-[10px] font-bold uppercase tracking-tight",
                                            currentSearchType === 'hot_leads' 
                                                ? "bg-white text-emerald-600 shadow-sm" 
                                                : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        Trending
                                    </button>
                                    <button 
                                        onClick={() => switchSearchType('lmia')}
                                        className={cn(
                                            "px-2 py-0.5 rounded-full transition-all text-[10px] font-bold uppercase tracking-tight",
                                            currentSearchType === 'lmia' 
                                                ? "bg-white text-brand-600 shadow-sm" 
                                                : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        LMIA
                                    </button>
                                </div>
                                <span className="text-gray-300 mx-0.5">•</span>
                                <span>
                                    {count !== undefined ? `${count.toLocaleString()} results found` : 'Results'}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-700 font-medium border border-gray-200">
                                    in <AttributeName name={field || 'all'} />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-center">

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm text-xs"
                            onClick={() => router.push('/compare/tool')}
                        >
                            <GitCompare className="w-3.5 h-3.5" />
                            Comparator
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm text-xs"
                            onClick={() => router.push('/analysis')}
                        >
                            <BarChart className="w-3.5 h-3.5" />
                            Analysis
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 border-gray-300 hover:border-brand-300 hover:bg-brand-50 transition-all font-medium text-xs text-gray-700 gap-1.5"
                                >
                                    <Menu className="w-3.5 h-3.5" />
                                    Menu
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => router.push('/search')}>
                                    <Search className="w-4 h-4 mr-2" />
                                    Search Jobs
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/pricing')}>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pricing
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Applied Filters Bar (if active) */}
            {(activeFilters.length > 0 || hasDateFilter) && (
                <div className="px-20 py-3 sm:px-20 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Active Filters:</span>

                    {activeFilters.map((filter, idx) => (
                        <Badge
                            key={`${filter.key}-${filter.value}-${idx}`}
                            variant="secondary"
                            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 h-7 px-2.5 text-xs flex items-center gap-1.5 transition-colors"
                        >
                            <span className="font-medium text-gray-500"><AttributeName name={filter.key} />:</span>
                            <span className="font-semibold text-gray-900">{filter.value}</span>
                            <button
                                onClick={() => removeFilter(filter.key, filter.value)}
                                className="ml-1 p-0.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}

                    {hasDateFilter && (
                        <Badge
                            variant="secondary"
                            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 h-7 px-2.5 text-xs flex items-center gap-1.5 transition-colors"
                        >
                            <CalendarDays className="w-3.5 h-3.5 text-brand-500" />
                            <span className="font-semibold text-gray-900">
                                {dateFrom ? format(parseISO(dateFrom as string), 'MMM d, yyyy') : '...'} 
                                {dateTo ? ` - ${format(parseISO(dateTo as string), 'MMM d, yyyy')}` : ''}
                            </span>
                            <button
                                onClick={removeDateFilter}
                                className="ml-1 p-0.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    )}

                    <button
                        onClick={clearFilters}
                        className="text-[10px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors ml-auto sm:ml-0"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
}
