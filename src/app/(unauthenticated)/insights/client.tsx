'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, MapPin, Briefcase, Globe, ChevronRight, ChevronLeft,
    BarChart3, Users, Loader2, RefreshCw, Search,
    Calendar, Database, Share2, Check, Flame, Clock,
    DollarSign, ExternalLink, LineChart, ArrowRight, Lightbulb, TrendingDown, RefreshCcw, ChevronDown
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import Link from 'next/link';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { format, parseISO, isValid } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';



// ─── Types ────────────────────────────────────────────────────────────────────

interface NocRow {
    noc_code: string;
    title: string;
    tier: string;
    count: number;
    avg_salary: number | null;
    hot?: boolean;
}

interface RegionData {
    key: string;
    region: string;
    rows: NocRow[];
}

interface ApiResponse {
    totalCount: number;
    regions: RegionData[];
    source: string;
    year: string;
    updatedAt: string;
    hotNocs: string[];
}

type YearFilter = '2026' | '2025' | '2024' | '2023' | '2022' | 'all' | 'custom';
type SourceFilter = 'trending' | 'lmia';

function getDateParams(year: YearFilter, dateRange: DateRange | undefined) {
    const params = new URLSearchParams();
    if (year === 'custom' && dateRange?.from) {
        params.set('date_from', format(dateRange.from, 'yyyy-MM-dd'));
        if (dateRange.to) {
            params.set('date_to', format(dateRange.to, 'yyyy-MM-dd'));
        }
    } else if (year !== 'all' && year !== 'custom') {
        params.set('date_from', `${year}-01-01`);
        params.set('date_to', `${year}-12-31`);
    }
    return params;
}

// ─── Color themes ─────────────────────────────────────────────────────────────

interface Theme {
    heroGradient: string;
    tabActive: string;
    panelHeader: string;
    nocBadge: string;
    rowHover: string;
    viewLink: string;
    viewLinkHover: string;
    loaderColor: string;
}

const THEMES: Record<string, Theme> = {
    'trending-2026': {
        heroGradient: 'from-brand-700 via-brand-600 to-brand-700',
        tabActive: 'bg-brand-600 text-white shadow-sm shadow-brand-200',
        panelHeader: 'from-brand-600 to-brand-700',
        nocBadge: 'bg-brand-50 text-brand-700 border-brand-100',
        rowHover: 'hover:bg-brand-50/50',
        viewLink: 'text-brand-600',
        viewLinkHover: 'hover:text-brand-700',
        loaderColor: 'text-brand-500',
    },
    'trending-2025': {
        heroGradient: 'from-indigo-600 via-brand-600 to-indigo-700',
        tabActive: 'bg-indigo-600 text-white shadow-sm shadow-brand-200',
        panelHeader: 'from-indigo-600 to-indigo-700',
        nocBadge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        rowHover: 'hover:bg-brand-50/50',
        viewLink: 'text-indigo-600',
        viewLinkHover: 'hover:text-indigo-700',
        loaderColor: 'text-indigo-500',
    },
    'trending-2024': {
        heroGradient: 'from-violet-600 via-indigo-600 to-violet-700',
        tabActive: 'bg-violet-600 text-white shadow-sm shadow-violet-200',
        panelHeader: 'from-violet-600 to-violet-700',
        nocBadge: 'bg-violet-50 text-violet-700 border-violet-100',
        rowHover: 'hover:bg-brand-50/50',
        viewLink: 'text-violet-600',
        viewLinkHover: 'hover:text-violet-700',
        loaderColor: 'text-violet-500',
    },
    'trending-2023': {
        heroGradient: 'from-purple-600 via-violet-600 to-purple-700',
        tabActive: 'bg-purple-600 text-white shadow-sm shadow-purple-200',
        panelHeader: 'from-purple-600 to-purple-700',
        nocBadge: 'bg-purple-50 text-purple-700 border-purple-100',
        rowHover: 'hover:bg-brand-50/50',
        viewLink: 'text-purple-600',
        viewLinkHover: 'hover:text-purple-700',
        loaderColor: 'text-purple-500',
    },
    'trending-2022': {
        heroGradient: 'from-fuchsia-600 via-purple-600 to-fuchsia-700',
        tabActive: 'bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-200',
        panelHeader: 'from-fuchsia-600 to-fuchsia-700',
        nocBadge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
        rowHover: 'hover:bg-brand-50/50',
        viewLink: 'text-fuchsia-600',
        viewLinkHover: 'hover:text-fuchsia-700',
        loaderColor: 'text-fuchsia-500',
    },
    'trending-all': {
        heroGradient: 'from-slate-700 via-slate-600 to-slate-800',
        tabActive: 'bg-slate-600 text-white shadow-sm shadow-slate-200',
        panelHeader: 'from-slate-600 to-slate-700',
        nocBadge: 'bg-slate-50 text-slate-700 border-slate-100',
        rowHover: 'hover:bg-brand-50/50',
        viewLink: 'text-slate-600',
        viewLinkHover: 'hover:text-slate-700',
        loaderColor: 'text-slate-500',
    },
    'lmia-2026': {
        heroGradient: 'from-orange-600 via-orange-500 to-amber-600',
        tabActive: 'bg-orange-500 text-white shadow-sm shadow-orange-200',
        panelHeader: 'from-orange-500 to-amber-600',
        nocBadge: 'bg-orange-50 text-orange-700 border-orange-100',
        rowHover: 'hover:bg-orange-50/50',
        viewLink: 'text-orange-600',
        viewLinkHover: 'hover:text-orange-700',
        loaderColor: 'text-orange-500',
    },
    'lmia-2025': {
        heroGradient: 'from-rose-600 via-orange-500 to-rose-700',
        tabActive: 'bg-rose-600 text-white shadow-sm shadow-rose-200',
        panelHeader: 'from-rose-600 to-rose-700',
        nocBadge: 'bg-rose-50 text-rose-700 border-rose-100',
        rowHover: 'hover:bg-orange-50/50',
        viewLink: 'text-rose-600',
        viewLinkHover: 'hover:text-rose-700',
        loaderColor: 'text-rose-500',
    },
    'lmia-2024': {
        heroGradient: 'from-pink-600 via-rose-500 to-pink-700',
        tabActive: 'bg-pink-600 text-white shadow-sm shadow-pink-200',
        panelHeader: 'from-pink-600 to-pink-700',
        nocBadge: 'bg-pink-50 text-pink-700 border-pink-100',
        rowHover: 'hover:bg-orange-50/50',
        viewLink: 'text-pink-600',
        viewLinkHover: 'hover:text-pink-700',
        loaderColor: 'text-pink-500',
    },
    'lmia-2023': {
        heroGradient: 'from-red-600 via-pink-500 to-red-700',
        tabActive: 'bg-red-600 text-white shadow-sm shadow-red-200',
        panelHeader: 'from-red-600 to-red-700',
        nocBadge: 'bg-red-50 text-red-700 border-red-100',
        rowHover: 'hover:bg-orange-50/50',
        viewLink: 'text-red-600',
        viewLinkHover: 'hover:text-red-700',
        loaderColor: 'text-red-500',
    },
    'lmia-2022': {
        heroGradient: 'from-amber-600 via-red-500 to-amber-700',
        tabActive: 'bg-amber-600 text-white shadow-sm shadow-amber-200',
        panelHeader: 'from-amber-600 to-amber-700',
        nocBadge: 'bg-amber-50 text-amber-700 border-amber-100',
        rowHover: 'hover:bg-orange-50/50',
        viewLink: 'text-amber-600',
        viewLinkHover: 'hover:text-amber-700',
        loaderColor: 'text-amber-500',
    },
    'lmia-all': {
        heroGradient: 'from-slate-700 via-orange-500 to-slate-800',
        tabActive: 'bg-slate-600 text-white shadow-sm shadow-slate-200',
        panelHeader: 'from-slate-600 to-slate-700',
        nocBadge: 'bg-slate-50 text-slate-700 border-slate-100',
        rowHover: 'hover:bg-orange-50/50',
        viewLink: 'text-slate-600',
        viewLinkHover: 'hover:text-slate-700',
        loaderColor: 'text-slate-500',
    },
};

const ATLANTIC_PROVINCES = [
    'Nova Scotia', 
    'New Brunswick', 
    'Prince Edward Island', 
    'Newfoundland and Labrador'
];

// ─── Province tabs ────────────────────────────────────────────────────────────

const REGION_TABS = [
    { key: 'all', label: 'All Regions', short: 'All' },
    { key: 'canada', label: 'Canada', short: 'CA' },
    { key: 'british-columbia', label: 'British Columbia', short: 'BC' },
    { key: 'alberta', label: 'Alberta', short: 'AB' },
    { key: 'saskatchewan', label: 'Saskatchewan', short: 'SK' },
    { key: 'manitoba', label: 'Manitoba', short: 'MB' },
    { key: 'ontario', label: 'Ontario', short: 'ON' },
    { key: 'quebec', label: 'Quebec', short: 'QC' },
    { key: 'atlantic', label: 'Atlantic', short: 'ATL' },
    { key: 'nova-scotia', label: 'Nova Scotia', short: 'NS' },
    { key: 'new-brunswick', label: 'New Brunswick', short: 'NB' },
    { key: 'prince-edward-island', label: 'Prince Edward Island', short: 'PEI' },
    { key: 'newfoundland-and-labrador', label: 'Newfoundland', short: 'NL' },
    { key: 'northwest-territories', label: 'NW Territories', short: 'NT' },
    { key: 'nunavut', label: 'Nunavut', short: 'NU' },
    { key: 'yukon', label: 'Yukon', short: 'YT' },
];

// ─── Region Panel ─────────────────────────────────────────────────────────────

function RegionPanel({ region, index, theme, isLmia, fullWidth, search, year, dateRange }: {
    region: RegionData;
    index: number;
    theme: Theme;
    isLmia: boolean;
    fullWidth: boolean;
    search: string;
    year: YearFilter;
    dateRange: DateRange | undefined;
}) {
    const q = search.trim().toLowerCase();
    const filteredRows = q
        ? region.rows.filter(row =>
            row.noc_code.toLowerCase().includes(q) ||
            row.title.toLowerCase().includes(q)
        )
        : region.rows;


    const fieldParam = isLmia ? 'territory' : 'state';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className={`bg-white rounded-2xl shadow-md shadow-gray-200/50 ring-1 ring-gray-100 overflow-hidden ${fullWidth ? 'col-span-full' : ''}`}
        >
            {/* Header */}
            <div className={`bg-gradient-to-r ${theme.panelHeader} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/80" />
                    <h2 className="text-white font-bold text-sm tracking-wide">
                        In-demand Jobs — {region.region.toUpperCase()}
                    </h2>
                </div>
                <span className="text-white/70 text-xs font-medium tabular-nums">
                    {q ? `${filteredRows.length} / ${region.rows.length} matches` : `${region.rows[0]?.count.toLocaleString() ?? '—'} top role`}
                </span>
            </div>

            {/* Table */}
            <div className={`overflow-y-auto ${fullWidth ? 'max-h-[600px]' : 'max-h-[420px]'}`}>
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 border-b border-gray-100">
                        <tr>
                            <th className="w-8 text-center py-2.5 text-xs font-semibold text-gray-400">#</th>
                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">
                                NOC Code{!isLmia && ' · Level'} · Title
                            </th>

                            <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">
                                No. Jobs ↑
                            </th>
                            <th className="w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((row, i) => (
                            <tr key={`${row.noc_code}-${i}`} className={`border-b border-gray-50 transition-colors group ${theme.rowHover}`}>
                                <td className="text-center py-2.5 text-xs text-gray-400 font-medium">{i + 1}</td>
                                <td className="py-2.5 px-3">
                                    <div className="flex items-start gap-2">
                                        <span className={`mt-0.5 flex-shrink-0 font-mono text-[10px] border px-1.5 py-0.5 rounded-md leading-none ${theme.nocBadge}`}>
                                            {row.noc_code}{row.tier ? ` · ${row.tier}` : ''}
                                        </span>
                                        <span className="text-gray-700 text-xs leading-snug group-hover:text-gray-900">
                                            {row.title}
                                        </span>
                                        {row.hot && (
                                            <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[9px] font-bold border border-orange-100">
                                                <Flame className="w-2.5 h-2.5" /> Hot
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="text-right py-2.5 px-4">
                                    <span className="text-gray-900 font-semibold text-xs tabular-nums">
                                        {row.count.toLocaleString()}
                                    </span>
                                </td>
                                 <td className="py-2.5 pr-3">
                                    <Link
                                        href={(() => {
                                            const base = `/search/${isLmia ? 'lmia' : 'hot-leads'}/${encodeURIComponent(row.noc_code)}`;
                                            const params = new URLSearchParams();
                                            params.set('field', 'noc_code');
                                            params.set('t', isLmia ? 'lmia' : 'trending_job');
                                            
                                            if (region.key === 'atlantic') {
                                                ATLANTIC_PROVINCES.forEach(p => params.append(fieldParam, p));
                                            } else if (region.key !== 'canada' && region.key !== 'all') {
                                                params.set(fieldParam, region.region);
                                            }
                                            
                                            // Add date parameters
                                            const dateParams = getDateParams(year, dateRange);
                                            dateParams.forEach((v, k) => params.set(k, v));
                                            
                                            return `${base}?${params.toString()}`;
                                        })()}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={`Search ${row.noc_code} jobs`}
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filteredRows.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-400 text-xs">
                                    {q ? `No NOC codes match "${search}"` : 'No data available for this region'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    {q ? `${filteredRows.length} of ${region.rows.length} NOC categories` : `${region.rows.length} NOC categories`}
                </span>
                <Link
                    href={(() => {
                        const base = `/${isLmia ? 'search/lmia' : 'search/hot-leads'}/all`;
                        const params = new URLSearchParams();
                        params.set('field', fieldParam); // searching by state/territory
                        
                        if (region.key === 'atlantic') {
                            ATLANTIC_PROVINCES.forEach(p => params.append(fieldParam, p));
                        } else if (region.key !== 'canada' && region.key !== 'all') {
                            params.set(fieldParam, region.region);
                        }
                        
                        return `${base}?${params.toString()}`;
                    })()}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors ${theme.viewLink} ${theme.viewLinkHover}`}
                >
                    View jobs <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
        </motion.div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, delay }: {
    icon: React.ReactNode; label: string; value: string; sub: string; delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 ring-1 ring-white/20 flex items-center gap-4"
        >
            <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">{icon}</div>
            <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{label}</p>
                <p className="text-white text-2xl font-extrabold tracking-tight">{value}</p>
                <p className="text-white/60 text-xs mt-0.5">{sub}</p>
            </div>
        </motion.div>
    );
}

// ─── Toggle Components ────────────────────────────────────────────────────────

function SourceToggle({ value, onChange }: { value: SourceFilter; onChange: (v: SourceFilter) => void }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-gray-500">
                <Database className="w-3.5 h-3.5" />
                <span className="text-xs font-medium hidden sm:inline">Source</span>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                <button onClick={() => onChange('trending')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${value === 'trending' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    📈 Trending Jobs
                </button>
                <button onClick={() => onChange('lmia')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${value === 'lmia' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    🏢 LMIA
                </button>
            </div>
        </div>
    );
}

function YearToggle({ value, onChange, isLmia, dateRange, onDateRangeChange }: { 
    value: YearFilter; 
    onChange: (v: YearFilter) => void; 
    isLmia: boolean;
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
}) {
    const [open, setOpen] = useState(false);
    const [pendingRange, setPendingRange] = useState<DateRange | undefined>(dateRange);

    // Keep pendingRange in sync when dateRange changes from outside or on open
    useEffect(() => {
        if (open) setPendingRange(dateRange);
    }, [open, dateRange]);

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs font-medium hidden sm:inline">Period</span>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                {['2026', '2025', '2024', '2023', '2022'].map((y) => (
                    <button
                        key={y}
                        onClick={() => onChange(y as YearFilter)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${value === y ? (isLmia ? 'bg-orange-500 text-white shadow-sm' : 'bg-brand-600 text-white shadow-sm') : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {y}
                    </button>
                ))}
                <button
                    onClick={() => onChange('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${value === 'all' ? 'bg-slate-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All Time
                </button>

                <div className="w-px h-4 bg-gray-300 my-auto mx-0.5" />

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            onClick={() => {
                                setOpen(true);
                                onChange('custom');
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5",
                                value === 'custom' 
                                    ? (isLmia ? 'bg-orange-500 text-white shadow-sm' : 'bg-brand-600 text-white shadow-sm') 
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            {value === 'custom' && dateRange?.from ? (
                                <>
                                    {format(dateRange.from, 'MMM d')} - {dateRange.to ? format(dateRange.to, 'MMM d') : '...'}
                                </>
                            ) : (
                                "Custom Range"
                            )}
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <CalendarUI
                            initialFocus
                            mode="range"
                            defaultMonth={pendingRange?.from || dateRange?.from}
                            selected={pendingRange}
                            onSelect={(range: DateRange | undefined) => {
                                setPendingRange(range);
                            }}
                            numberOfMonths={2}
                            showManualInput={true}
                            showActionButtons={true}
                            onApply={() => {
                                onDateRangeChange(pendingRange);
                                if (pendingRange?.from) onChange('custom');
                                setOpen(false);
                            }}
                            onClear={() => {
                                onDateRangeChange(undefined);
                                onChange('all');
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton({ year, source, activeTab }: { year: string; source: string; activeTab: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = new URL(window.location.href);
        url.searchParams.set('year', year);
        url.searchParams.set('source', source);
        if (activeTab !== 'all') url.searchParams.set('region', activeTab);
        try {
            await navigator.clipboard.writeText(url.toString());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    return (
        <button
            onClick={handleShare}
            title="Copy shareable link"
            className={`p-2 rounded-lg transition-all text-xs font-medium flex items-center gap-1.5 ${copied
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InDemandJobsPage() {
    const [regions, setRegions] = useState<RegionData[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [year, setYear] = useState<YearFilter>('2026');
    const [source, setSource] = useState<SourceFilter>('trending');

    // --- Date Range State ---
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const from = sp.get('date_from');
        const to = sp.get('date_to');
        if (from && to) {
            return { from: parseISO(from), to: parseISO(to) };
        }
        return undefined;
    });
    
    // ─── Scroll logic ─────────────────────────────────────────────────────────
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollLimits = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            el.addEventListener('scroll', checkScrollLimits);
            checkScrollLimits();
            window.addEventListener('resize', checkScrollLimits);
            return () => {
                el.removeEventListener('scroll', checkScrollLimits);
                window.removeEventListener('resize', checkScrollLimits);
            };
        }
    }, [checkScrollLimits, regions]); // Re-check when regions load

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const amount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -amount : amount,
                behavior: 'smooth'
            });
        }
    };

    const themeKey = `${source}-${year}` as keyof typeof THEMES;
    const theme = THEMES[themeKey] ?? THEMES['trending-2026'];
    const isLmia = source === 'lmia';

    // Read filters from URL on mount
    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const urlYear = sp.get('year');
        const urlSource = sp.get('source');
        const urlRegion = sp.get('region');
        const validYears = ['2026', '2025', '2024', '2023', '2022', 'all'];
        if (urlYear && validYears.includes(urlYear)) setYear(urlYear as YearFilter);
        if (urlSource === 'trending' || urlSource === 'lmia') setSource(urlSource);
        if (urlRegion) setActiveTab(urlRegion);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `/api/insights?year=${year}&source=${source}`;
            if (year === 'custom' && dateRange?.from) {
                url += `&date_from=${format(dateRange.from, 'yyyy-MM-dd')}`;
                if (dateRange.to) {
                    url += `&date_to=${format(dateRange.to, 'yyyy-MM-dd')}`;
                }
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch');
            const data: ApiResponse = await res.json();
            setRegions(data.regions ?? []);
            setTotalCount(data.totalCount ?? 0);
            setUpdatedAt(data.updatedAt ?? null);
        } catch {
            setError('Could not load job market data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [year, source, dateRange]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const visibleRegions = useMemo(() => {
        let filtered = activeTab === 'all'
            ? regions.filter(r => r.key !== 'canada')
            : regions.filter(r => r.key === activeTab);

        if (search.trim()) {
            const sq = search.toLowerCase();
            filtered = filtered.filter(r =>
                r.region.toLowerCase().includes(sq) ||
                r.rows.some(row => row.title.toLowerCase().includes(sq) || row.noc_code.includes(search))
            );
        }
        return filtered;
    }, [regions, activeTab, search]);

    const topNoc = useMemo(() => regions.find(r => r.key === 'canada')?.rows[0], [regions]);

    const timeAgo = useMemo(() => {
        if (!updatedAt) return '';
        const diff = Date.now() - new Date(updatedAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    }, [updatedAt]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">

                {/* ── Hero ──────────────────────────────────────────────────── */}
                <section className={`bg-gradient-to-br ${theme.heroGradient} pt-32 pb-16 px-4 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                    <div className="max-w-6xl mx-auto relative z-10">
                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-semibold uppercase tracking-widest mb-5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                                Live Labour Market Data
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                                In-Demand Jobs<br />
                                <span className="text-white/75">Across Canada</span>
                            </h1>
                            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
                                {isLmia ? 'LMIA-approved' : 'Trending'} job rankings by province and territory
                                {year === '2026' ? ' — 2026 data.' : ' — all-time records.'}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <StatCard icon={<Briefcase className="w-5 h-5 text-white" />} label="Total Job Records" value={loading ? '—' : totalCount.toLocaleString()} sub={year === '2026' ? '2026 listings' : 'All-time listings'} delay={0.1} />
                            <StatCard icon={<Globe className="w-5 h-5 text-white" />} label="Regions Covered" value={loading ? '—' : String(regions.length)} sub="Provinces, territories & regions" delay={0.2} />
                            <StatCard icon={<TrendingUp className="w-5 h-5 text-white" />} label="Top In-Demand Role" value={loading ? '—' : (topNoc?.noc_code ?? '—')} sub={topNoc?.title ?? (loading ? 'Loading…' : 'N/A')} delay={0.3} />
                        </div>
                    </div>
                </section>

                {/* ── Controls ──────────────────────────────────────────────── */}
                <section className="bg-white border-b border-gray-100 shadow-sm sticky top-[64px] z-30">
                    <div className="max-w-6xl mx-auto px-4">

                        {/* Row 1: toggles + share + timestamp */}
                        <div className="flex flex-wrap items-center gap-3 py-2.5 border-b border-gray-100">
                            <SourceToggle value={source} onChange={setSource} />
                            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
                             <YearToggle 
                                value={year} 
                                onChange={setYear} 
                                isLmia={isLmia} 
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                             />

                            <div className="ml-auto flex items-center gap-2">
                                {/* Timestamp */}
                                {updatedAt && !loading && (
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 mr-1">
                                        <Clock className="w-3 h-3" /> Updated {timeAgo}
                                    </span>
                                )}
                                {loading && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Updating…
                                    </span>
                                )}

                                <ShareButton year={year} source={source} activeTab={activeTab} />

                                <button onClick={fetchData} disabled={loading} title="Refresh" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Row 2: region tabs + search */}
                        <div className="flex items-center gap-3 py-2">
                            <div className="relative flex-shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search NOC or title…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 w-40"
                                />
                            </div>

                            <div className="relative flex-1 flex items-center min-w-0">
                                <AnimatePresence>
                                    {canScrollLeft && (
                                        <motion.button
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            onClick={() => scroll('left')}
                                            className="absolute left-0 z-20 p-1 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-lg text-gray-600 hover:text-gray-900 transition-all -ml-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>

                                <div 
                                    ref={scrollContainerRef}
                                    className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1 py-1 px-1"
                                >
                                    {REGION_TABS.map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${activeTab === tab.key
                                                    ? `${theme.tabActive} border-transparent scale-[1.02]`
                                                    : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200'
                                                }`}
                                        >
                                            <span className="hidden sm:inline">{tab.label}</span>
                                            <span className="sm:hidden">{tab.short}</span>
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence>
                                    {canScrollRight && (
                                        <motion.button
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            onClick={() => scroll('right')}
                                            className="absolute right-0 z-20 p-1 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-lg text-gray-600 hover:text-gray-900 transition-all -mr-2"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>

                                {/* Gradient Fades */}
                                <div className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-r from-white to-transparent z-10 transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
                                <div className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-white to-transparent z-10 transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Content ───────────────────────────────────────────────── */}
                <section className="max-w-6xl mx-auto px-4 py-10">

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-32 gap-3">
                            <Loader2 className={`w-10 h-10 animate-spin ${theme.loaderColor}`} />
                            <p className="text-gray-500 text-sm">Loading job market data…</p>
                            <p className="text-gray-400 text-xs">{isLmia ? 'LMIA' : 'Trending jobs'} · {year === '2026' ? '2026' : 'All time'}</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center">
                            <BarChart3 className="w-10 h-10 text-red-300 mx-auto mb-3" />
                            <p className="text-red-600 font-medium mb-4">{error}</p>
                            <button onClick={fetchData} className="px-5 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-colors">
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Canada national overview */}
                    {!loading && !error && (activeTab === 'canada' || activeTab === 'all') && (() => {
                        const canada = regions.find(r => r.key === 'canada');
                        if (!canada) return null;
                        const sq = search.trim().toLowerCase();
                        const canadaRows = sq
                            ? canada.rows.filter(r =>
                                r.noc_code.toLowerCase().includes(sq) ||
                                r.title.toLowerCase().includes(sq)
                            )
                            : canada.rows;


                        return (
                            <motion.div
                                key={`canada-${source}-${year}`}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mb-8 rounded-2xl shadow-lg overflow-hidden bg-gradient-to-r ${theme.panelHeader}`}
                            >
                                <div className="p-5 flex items-center gap-3 border-b border-white/10">
                                    <Globe className="w-5 h-5 text-white/80" />
                                    <h2 className="text-white font-bold text-base">
                                        In-demand Jobs — CANADA (National)
                                    </h2>
                                    <span className="ml-auto text-white/50 text-xs">
                                        {sq ? `${canadaRows.length} / ${canada.rows.length} matches` : `${canada.rows.length} top roles`}
                                        {' '}· {isLmia ? 'LMIA' : 'Trending'} · {year === '2026' ? '2026' : 'All Time'}
                                    </span>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="w-10 text-center py-2.5 text-xs font-semibold text-white/50">#</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-white/60">NOC Code · Title</th>

                                            <th className="text-right py-2.5 px-5 text-xs font-semibold text-white/60">No. Jobs ↑</th>
                                            <th className="w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {canadaRows.map((row, i) => (
                                            <tr key={row.noc_code} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="text-center py-2.5 text-xs text-white/40 font-medium">{i + 1}</td>
                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-start gap-2">
                                                        <Link href={`/resources/noc-codes/${row.noc_code}`} className="flex items-start gap-2 flex-1">
                                                            <span className="mt-0.5 flex-shrink-0 font-mono text-[10px] bg-white/10 text-white/80 border border-white/10 px-1.5 py-0.5 rounded-md leading-none">
                                                                {row.noc_code}{row.tier ? ` · ${row.tier}` : ''}
                                                            </span>
                                                            <span className="text-white/90 text-xs leading-snug group-hover:text-white">{row.title}</span>
                                                        </Link>
                                                        {row.hot && (
                                                            <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-200 text-[9px] font-bold border border-orange-400/30">
                                                                <Flame className="w-2.5 h-2.5" /> Hot
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="text-right py-2.5 px-5">
                                                    <span className="text-white font-bold text-xs tabular-nums">{row.count.toLocaleString()}</span>
                                                </td>
                                                <td className="py-2.5 pr-3">
                                                    <Link
                                                        href={(() => {
                                                            const base = `/search/${isLmia ? 'lmia' : 'hot-leads'}/${encodeURIComponent(row.noc_code)}`;
                                                            const params = getDateParams(year, dateRange);
                                                            params.set('field', 'noc_code');
                                                            params.set('t', isLmia ? 'lmia' : 'trending_job');
                                                            return `${base}?${params.toString()}`;
                                                        })()}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title={`Search ${row.noc_code} jobs`}
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5 text-white/50 hover:text-white" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {canadaRows.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-8 text-white/50 text-xs">
                                                    No NOC codes match &ldquo;{search}&rdquo;
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </motion.div>
                        );
                    })()}

                    {/* Province / region grid */}
                    {!loading && !error && visibleRegions.length > 0 && (
                        <AnimatePresence mode="wait">
                            <div
                                key={`${source}-${year}-${activeTab}`}
                                className={`grid gap-6 ${visibleRegions.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
                            >
                                {visibleRegions.map((region, i) => (
                                    <RegionPanel
                                        key={region.key}
                                        region={region}
                                        index={i}
                                        theme={theme}
                                        isLmia={isLmia}
                                        fullWidth={visibleRegions.length === 1}
                                        search={search}
                                        year={year}
                                        dateRange={dateRange}
                                    />
                                ))}
                            </div>
                        </AnimatePresence>
                    )}

                    {!loading && !error && visibleRegions.length === 0 && (
                        <div className="text-center py-24 text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium text-gray-500">No results found</p>
                            <p className="text-sm mt-1">Try adjusting your search or selecting a different region</p>
                        </div>
                    )}
                </section>

                {/* ── CTA ───────────────────────────────────────────────────── */}
                {!loading && (
                    <section className={`bg-gradient-to-r ${theme.panelHeader} py-14 px-4 mt-4`}>
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                                Find jobs in your target NOC code
                            </h2>
                            <p className="text-white/70 mb-6 text-sm">
                                Search LMIA-approved positions or trending job postings by NOC code, location, and more.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <Link
                                    href={(() => {
                                        const params = getDateParams(year, dateRange);
                                        return `/search/lmia/all?${params.toString()}`;
                                    })()}
                                    className="px-6 py-3 bg-white text-gray-800 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-sm"
                                >
                                    Search LMIA Jobs
                                </Link>
                                <Link
                                    href={(() => {
                                        const params = getDateParams(year, dateRange);
                                        return `/search/hot-leads/all?${params.toString()}`;
                                    })()}
                                    className="px-6 py-3 bg-white/15 text-white border border-white/30 font-bold rounded-xl hover:bg-white/25 transition-colors text-sm"
                                >
                                    Browse Trending Jobs
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                <Footer />
            </main>
        </>
    );
}
