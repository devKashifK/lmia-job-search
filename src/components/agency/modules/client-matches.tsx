'use client';

import React, { useState, useEffect } from 'react';
import db from '@/db';
import { generateClientRecommendations } from '@/lib/api/recommendations';
import { getProvinces, getCitiesForProvinces } from '@/lib/api/locations';
import { MultiSelect } from '@/components/ui/multi-select';
import { DatabaseCombobox } from '@/components/ui/database-combobox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Loader2, Sparkles, Building2, MapPin, ExternalLink, CheckCircle2, Lock, History, Phone, Mail, X, RefreshCw, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmployerInsightDialog } from './employer-insight-dialog';

interface ClientMatchesProps {
    clientId: string;
    clientUrn: string;
    extractedData: any;
}

export function ClientMatches({ clientId, clientUrn, extractedData }: ClientMatchesProps) {
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Interactive Filters State
    const [selectedTitles, setSelectedTitles] = React.useState<string[]>(extractedData.recommended_job_titles || []);
    const [selectedNocs, setSelectedNocs] = React.useState<string[]>(extractedData.recommended_noc_codes?.map(String) || []);
    const [selectedEmployers, setSelectedEmployers] = React.useState<string[]>(extractedData.recommended_employers || []);

    // Dynamic Multi-Select Location States (defaulting to empty as requested)
    const [targetProvinces, setTargetProvinces] = React.useState<string[]>([]);
    const [targetCities, setTargetCities] = React.useState<string[]>([]);

    const [availableProvinces, setAvailableProvinces] = React.useState<{ value: string, label: string }[]>([]);
    const [availableCities, setAvailableCities] = React.useState<{ value: string, label: string }[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    // Database-driven employers state
    const [suggestedEmployers, setSuggestedEmployers] = React.useState<string[]>(extractedData.recommended_employers || []);
    const [isLoadingEmployers, setIsLoadingEmployers] = React.useState(false);

    // New Filters & Multi-Select State
    const [dateRange, setDateRange] = React.useState('last_30');
    const [tableSource, setTableSource] = React.useState('all');
    const [selectedJobIds, setSelectedJobIds] = React.useState<string[]>([]);
    const [isApplying, setIsApplying] = React.useState(false);

    // Custom User Inputs State
    const [customTitles, setCustomTitles] = React.useState<string[]>([]);
    const [customNocs, setCustomNocs] = React.useState<string[]>([]);

    // Unlock contacts state
    const [isUnlocking, setIsUnlocking] = React.useState(false);
    const [unlockedContacts, setUnlockedContacts] = React.useState<any[]>([]);
    const [showContactsModal, setShowContactsModal] = React.useState(false);

    // Intelligence Dialog State
    const [isInsightOpen, setIsInsightOpen] = React.useState(false);
    const [selectedEmployerForInsight, setSelectedEmployerForInsight] = React.useState('');

    const { toast } = useToast();
    const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

    // Fetch already applied jobs for this client
    useEffect(() => {
        async function fetchAppliedJobs() {
            try {
                const { data, error } = await (db as any)
                    .from('job_applications')
                    .select('job_id')
                    .ilike('client_urn', clientUrn);

                if (data) {
                    setAppliedJobIds(new Set((data as any[]).map(a => a.job_id)));
                }
            } catch (err) {
                console.error("Failed to fetch applied jobs:", err);
            }
        }
        if (clientUrn) fetchAppliedJobs();
    }, [clientUrn]);

    const isDirty = React.useMemo(() => {
        return JSON.stringify(selectedTitles) !== JSON.stringify(extractedData.recommended_job_titles || []) ||
            JSON.stringify(selectedNocs) !== JSON.stringify(extractedData.recommended_noc_codes?.map(String) || []) ||
            JSON.stringify(selectedEmployers) !== JSON.stringify(extractedData.recommended_employers || []) ||
            targetProvinces.length > 0 ||
            targetCities.length > 0;
    }, [selectedTitles, selectedNocs, selectedEmployers, targetProvinces, targetCities, extractedData]);

    const handleSaveRefinements = async () => {
        setIsSaving(true);
        try {
            const { data: { session } } = await db.auth.getSession();

            const updatedData = {
                ...extractedData,
                recommended_job_titles: selectedTitles,
                recommended_noc_codes: selectedNocs,
                recommended_employers: selectedEmployers,
                location: [...targetCities, ...targetProvinces].filter(Boolean).join(', ')
            };

            const response = await fetch('/api/agency/update-client-meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
                },
                body: JSON.stringify({
                    clientId: clientId,
                    extractedData: updatedData
                })
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (err) {
            console.error("Save refinements error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Initialize Provinces
    React.useEffect(() => {
        async function loadProvinces() {
            const provs = await getProvinces();
            setAvailableProvinces(provs.map(p => ({ value: p, label: p })));
        }
        loadProvinces();
    }, []);

    // Update Cities when Provinces change
    React.useEffect(() => {
        async function loadCities() {
            if (!targetProvinces.length) {
                setAvailableCities([]);
                setTargetCities([]); // clear if no province
                return;
            }
            setIsLoadingLocations(true);
            const cities = await getCitiesForProvinces(targetProvinces);
            setAvailableCities(cities.map(c => ({ value: c.city, label: c.city })));

            // Prune selected cities that are no longer valid for the selected provinces
            const validCitySet = new Set(cities.map(c => c.city));
            setTargetCities(prev => prev.filter(c => validCitySet.has(c)));

            setIsLoadingLocations(false);
        }
        loadCities();
    }, [targetProvinces]);

    // Fetch real matching employers when filters change
    React.useEffect(() => {
        const fetchMatchingEmployers = async () => {
            const titles = selectedTitles.length ? selectedTitles : (extractedData.recommended_job_titles || [extractedData.position]).filter(Boolean);
            const nocs = selectedNocs.length ? selectedNocs : (extractedData.recommended_noc_codes || [extractedData.noc_code]).filter(Boolean);

            if (!titles.length && !nocs.length) return;

            setIsLoadingEmployers(true);
            try {
                const { data: dbEmployers } = await (db as any).rpc('get_matching_employers', {
                    p_noc_codes: nocs,
                    p_job_titles: titles
                });

                if (dbEmployers) {
                    setSuggestedEmployers(dbEmployers.map((e: any) => e.name));
                }
            } catch (err) {
                console.error("Failed to fetch matching employers:", err);
            } finally {
                setIsLoadingEmployers(false);
            }
        };

        fetchMatchingEmployers();
    }, [selectedTitles, selectedNocs, extractedData]);

    const fetchMatches = async () => {
        setIsLoading(true);
        try {
            const overrides = {
                jobTitles: selectedTitles,
                nocCodes: selectedNocs,
                locations: [...targetCities, ...targetProvinces].filter(Boolean),
                employers: selectedEmployers,
                dateRange: dateRange,
                source: tableSource
            };

            const results = await generateClientRecommendations(extractedData, overrides);
            setMatches(results);

            // Cleanup any selected jobs that are no longer in results
            const validJobIds = new Set(results.map(r => r.job_id));
            setSelectedJobIds(prev => prev.filter(id => validJobIds.has(id)));
        } catch (err) {
            console.error('Error fetching matches:', err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMatches();
    }, [extractedData, selectedTitles, selectedNocs, selectedEmployers, targetProvinces, targetCities, dateRange, tableSource]);

    const handleBulkApply = async () => {
        if (selectedJobIds.length === 0) return;
        setIsApplying(true);
        try {
            const { data: { session } } = await db.auth.getSession();
            if (!session) return;

            const selectedMatches = matches.filter(m => selectedJobIds.includes(m.job_id));

            const applicationsToInsert = selectedMatches.map(m => ({
                user_id: session.user.id, // For standard applications, user_id is the applicant, but for agency it's the agency_id
                agency_id: session.user.id,
                client_urn: clientUrn,
                job_id: m.job_id,
                job_title: m.job_data?.job_title || m.job_data?.JobTitle || 'Unknown Position',
                noc_code: m.job_data?.noc_code || m.job_data?.noc || '00000',
                employer_name: m.job_data?.operating_name || m.job_data?.employer_name || m.job_data?.employer || 'Unknown Employer',
                city: m.job_data?.city || 'Unknown',
                state: m.job_data?.state || m.job_data?.territory || 'Unknown',
                table_name: m.job_source,
                status: 'applied',
                posted_link: `/search/${m.job_source === 'trending_job' ? 'hot-leads' : 'lmia'}/${encodeURIComponent(m.job_data?.job_title || '')}?field=title&t=${m.job_source}`
            }));

            const { error } = await (db as any).from('job_applications').insert(applicationsToInsert);

            if (error) {
                console.error("Failed to insert bulk applications:", error);
                toast({ variant: 'destructive', title: 'Apply Failed', description: error.message });
            } else {
                // Update local state for immediate feedback
                setAppliedJobIds(prev => {
                    const next = new Set(prev);
                    selectedJobIds.forEach(id => next.add(id));
                    return next;
                });
                setSelectedJobIds([]);
                toast({ title: `✅ Applied to ${applicationsToInsert.length} job(s)`, description: 'Applications saved to the tracking pipeline.' });
            }
        } catch (err) {
            console.error("Bulk apply transaction error:", err);
        } finally {
            setIsApplying(false);
        }
    };

    const handleBulkUnlock = async () => {
        if (selectedJobIds.length === 0) return;
        setIsUnlocking(true);
        try {
            const { data: { session } } = await db.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/agency/unlock-contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ jobIds: selectedJobIds })
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.code === 'INSUFFICIENT_CREDITS') {
                    toast({
                        variant: 'destructive',
                        title: 'Insufficient Credits',
                        description: `You need ${result.required} credit(s) to unlock these contacts.`
                    });
                } else {
                    throw new Error(result.error || 'Unlock failed');
                }
                return;
            }

            setUnlockedContacts(result.contacts || []);
            setShowContactsModal(true);
            setSelectedJobIds([]);
            toast({ title: `🔓 Contacts Unlocked`, description: result.message });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Unlock Failed', description: err.message });
        } finally {
            setIsUnlocking(false);
        }
    };

    const toggleFilter = (list: string[], setList: (l: string[]) => void, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handlePitch = async (employer: string) => {
        const newEntry = {
            id: Date.now().toString(),
            employer: employer,
            type: 'proactive_pitch',
            notes: `Strategic intent to pitch candidate. Added to primary outreach tracking log for follow-up.`,
            timestamp: new Date().toISOString()
        };

        try {
            const { data: clientData } = await (db as any).from('agency_clients').select('outreach_log').eq('id', clientId).single();
            const log = Array.isArray(clientData?.outreach_log) ? clientData.outreach_log : [];

            await (db as any).from('agency_clients').update({
                outreach_log: [newEntry, ...log]
            }).eq('id', clientId);

            toast({
                title: "Pipeline Updated",
                description: `${employer} added to Outreach Log for follow-up.`
            });
        } catch (err) {
            console.error("Outreach log error:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Smart Refinement Controls */}
            <Card className="p-4 border-gray-100 bg-gray-50/30 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-brand-600 fill-brand-600" />
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Refine Client Matching</h4>
                    </div>
                    {isDirty && (
                        <Badge variant="outline" className="text-[9px] font-bold text-amber-600 border-amber-200 bg-amber-50 animate-pulse">
                            Unsaved Refinement Changes
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* AI Recommendations Selection */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Suited Job Titles</p>
                            <div className="flex flex-wrap gap-1.5 items-center">
                                {[...new Set([...(extractedData.recommended_job_titles?.length ? extractedData.recommended_job_titles : [extractedData.position]).filter(Boolean), ...customTitles])]
                                    .map((title: string) => (
                                        <Badge
                                            key={title}
                                            onClick={() => toggleFilter(selectedTitles, setSelectedTitles, title)}
                                            className={cn(
                                                "cursor-pointer text-[10px] font-bold py-1 px-2.5 rounded-lg border transition-all",
                                                selectedTitles.includes(title)
                                                    ? "bg-brand-600 text-white border-brand-600"
                                                    : "bg-white text-gray-500 border-gray-200 hover:border-brand-300"
                                            )}
                                        >
                                            {title}
                                        </Badge>
                                    ))}
                                <DatabaseCombobox
                                    type="title"
                                    placeholder="Add Title..."
                                    onSelect={(val) => {
                                        setCustomTitles(prev => [...prev, val]);
                                        if (!selectedTitles.includes(val)) setSelectedTitles(prev => [...prev, val]);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Matched NOC Codes</p>
                            <div className="flex flex-wrap gap-1.5 items-center">
                                {[...new Set([...(extractedData.recommended_noc_codes?.length ? extractedData.recommended_noc_codes : [extractedData.noc_code]).map(String).filter(Boolean), ...customNocs])]
                                    .map((noc: string) => (
                                        <Badge
                                            key={noc}
                                            onClick={() => toggleFilter(selectedNocs, setSelectedNocs, String(noc))}
                                            className={cn(
                                                "cursor-pointer text-[10px] font-bold py-1 px-2.5 rounded-lg border transition-all",
                                                selectedNocs.includes(String(noc))
                                                    ? "bg-amber-500 text-white border-amber-600"
                                                    : "bg-white text-gray-500 border-gray-200 hover:border-amber-300"
                                            )}
                                        >
                                            {noc}
                                        </Badge>
                                    ))}
                                <DatabaseCombobox
                                    type="noc"
                                    placeholder="Add NOC..."
                                    onSelect={(val) => {
                                        setCustomNocs(prev => [...prev, val]);
                                        if (!selectedNocs.includes(val)) setSelectedNocs(prev => [...prev, val]);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Manual Preference Overrides */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Location Preferences</p>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[9px] font-bold text-gray-400 ml-1">STATE / PROVINCE</label>
                                    <MultiSelect
                                        options={availableProvinces}
                                        selected={targetProvinces}
                                        onChange={setTargetProvinces}
                                        placeholder="Select Province..."
                                        className="bg-white border-gray-200 text-[11px]"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[9px] font-bold text-gray-400 ml-1">CITY</label>
                                    <MultiSelect
                                        options={availableCities}
                                        selected={targetCities}
                                        onChange={setTargetCities}
                                        placeholder={targetProvinces.length === 0 ? "Select province first..." : (isLoadingLocations ? "Loading..." : "Select City...")}
                                        className="bg-white border-gray-200 text-[11px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Target Employers (Database Fit)</p>
                            <div className="flex flex-wrap gap-1.5 h-auto min-h-[32px] items-center">
                                {isLoadingEmployers ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-400 text-[10px] animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Matching Employers...
                                    </div>
                                ) : (
                                    <>
                                        {((suggestedEmployers.length ? suggestedEmployers : [extractedData.company]))
                                            .filter(Boolean)
                                            .map((emp: string) => (
                                                <Badge
                                                    key={emp}
                                                    onClick={() => toggleFilter(selectedEmployers, setSelectedEmployers, emp)}
                                                    className={cn(
                                                        "cursor-pointer text-[10px] font-bold py-1 px-2.5 rounded-lg border transition-all",
                                                        selectedEmployers.includes(emp)
                                                            ? "bg-slate-700 text-white border-slate-800"
                                                            : "bg-white text-gray-500 border-gray-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    {emp}
                                                </Badge>
                                            ))}
                                        <DatabaseCombobox
                                            type="employer"
                                            placeholder="Add Employer..."
                                            onSelect={(val) => {
                                                if (!suggestedEmployers.includes(val)) {
                                                    setSuggestedEmployers(prev => [...prev, val]);
                                                }
                                                if (!selectedEmployers.includes(val)) {
                                                    setSelectedEmployers(prev => [...prev, val]);
                                                }
                                            }}
                                        />
                                        {(!suggestedEmployers.length && !extractedData.company) && (
                                            <span className="text-[10px] text-gray-400 italic">No specific employers identified</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="pt-1 flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSaveRefinements}
                                disabled={!isDirty || isSaving}
                                className="flex-1 border-brand-200 text-brand-700 hover:bg-brand-50 rounded-lg text-[10px] font-bold h-8"
                            >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Update Profile"}
                            </Button>
                            <Button
                                size="sm"
                                onClick={fetchMatches}
                                className="flex-1 bg-brand-600 rounded-lg text-[10px] font-bold h-8"
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
            <div className="pt-8 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-4 h-4 text-brand-600" />
                            Proactive Opportunities
                        </h3>
                        <p className="text-[10px] text-gray-500 font-medium">Employers who historically sponsor this specific NOC but may not have a live listing today.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {isLoadingEmployers ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-xl" />
                        ))
                    ) : suggestedEmployers.length > 0 ? (
                        suggestedEmployers.slice(0, 6).map((employer, i) => (
                            <Card
                                key={i}
                                onClick={() => {
                                    setSelectedEmployerForInsight(employer);
                                    setIsInsightOpen(true);
                                }}
                                className="p-4 border-gray-100 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group bg-white shadow-sm"
                            >
                                <div className="flex flex-col h-full justify-between gap-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="p-1.5 bg-brand-50 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                                <Building2 className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-black text-brand-600 uppercase">View Intelligence</span>
                                                <Sparkles className="w-3 h-3 text-brand-400 animate-pulse" />
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-black text-brand-600 border-brand-100 bg-brand-50 shadow-sm">
                                                HISTORIC SPONSOR
                                            </Badge>
                                        </div>
                                        <h4 className="text-xs font-black text-gray-900 leading-tight uppercase tracking-tight">{employer}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Potential Fit
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePitch(employer);
                                        }}
                                        className="h-8 text-[10px] font-black text-brand-600 hover:bg-brand-50 border border-brand-50 uppercase tracking-widest mt-1"
                                    >
                                        Pitch Client
                                    </Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-6 text-center text-gray-400 text-[10px] italic bg-gray-50 rounded-xl border border-dashed">
                            No matching historical sponsors found for this set of criteria.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm gap-4">
                <div className="flex flex-wrap items-center bg-gray-50 p-1 rounded-lg">
                    <button onClick={() => setTableSource('all')} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all", tableSource === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>All Sources</button>
                    <button onClick={() => setTableSource('trending_job')} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all", tableSource === 'trending_job' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Trending Jobs</button>
                    <button onClick={() => setTableSource('lmia')} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all", tableSource === 'lmia' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>LMIA Records</button>
                </div>

                <div className="flex flex-wrap items-center bg-gray-50 p-1 rounded-lg">
                    <button onClick={() => setDateRange('today')} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all", dateRange === 'today' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Today</button>
                    <button onClick={() => setDateRange('last_10')} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all", dateRange === 'last_10' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Last 10 Days</button>
                    <button onClick={() => setDateRange('last_30')} className={cn("px-3 py-1.5 text-[10px] font-bold rounded-md transition-all", dateRange === 'last_30' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Last 30 Days</button>
                </div>
            </div>




            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Live Result Set
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            checked={matches.length > 0 && matches.every(m => appliedJobIds.has(m.job_id) || selectedJobIds.includes(m.job_id))}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    const newSelectableIds = matches
                                        .filter(m => !appliedJobIds.has(m.job_id))
                                        .map(m => m.job_id);
                                    setSelectedJobIds(newSelectableIds);
                                } else {
                                    setSelectedJobIds([]);
                                }
                            }}
                        />
                        <label className="text-[10px] font-bold text-gray-500 cursor-pointer">Select All New Jobs</label>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLoading && <Loader2 className="w-3 h-3 text-brand-600 animate-spin" />}
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {matches.length} matches
                        </span>
                    </div>
                </div>
            </div>

            {selectedJobIds.length > 0 && (
                <div className="sticky top-4 z-20 bg-slate-800 text-white p-3 rounded-xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-2 border border-slate-700">
                    <span className="text-xs font-bold pl-2">{selectedJobIds.length} Job{selectedJobIds.length !== 1 ? 's' : ''} Selected</span>
                    <div className="flex gap-2">
                        <Button onClick={handleBulkUnlock} size="sm" variant="ghost" disabled={isUnlocking} className="text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold">
                            {isUnlocking ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Lock className="w-3.5 h-3.5 mr-1.5" />}
                            Unlock Contact ({selectedJobIds.length})
                        </Button>
                        <Button
                            onClick={handleBulkApply}
                            size="sm"
                            disabled={isApplying || selectedJobIds.filter(id => !appliedJobIds.has(id)).length === 0}
                            className="bg-brand-500 hover:bg-brand-400 text-white border-none shrink-0 text-xs font-bold"
                        >
                            {isApplying ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
                            Apply to Selected ({selectedJobIds.filter(id => !appliedJobIds.has(id)).length})
                        </Button>
                    </div>
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-xl border border-gray-100" />
                    ))
                ) : matches.length > 0 ? (
                    matches.map((match, i) => {
                        const title = match.job_data?.job_title || match.job_data?.JobTitle || 'Unknown Position';
                        const employer = match.job_data?.operating_name || match.job_data?.employer_name || match.job_data?.employer || 'Unknown Company';
                        return (
                            <motion.div
                                key={match.job_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className={cn(
                                    "p-4 hover:shadow-md transition-all group relative overflow-hidden h-full border",
                                    selectedJobIds.includes(match.job_id) ? "border-brand-500 bg-brand-50/10" : "border-gray-100 bg-white hover:border-brand-200"
                                )}>
                                    <div className="flex gap-3">
                                        <div className="pt-0.5">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                checked={selectedJobIds.includes(match.job_id)}
                                                disabled={appliedJobIds.has(match.job_id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedJobIds([...selectedJobIds, match.job_id]);
                                                    else setSelectedJobIds(selectedJobIds.filter(id => id !== match.job_id));
                                                }} />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 leading-tight pr-2">
                                                        {title}
                                                    </h4>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                            <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                                                            <span className="truncate">{employer}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                                            <span className="truncate">{match.job_data?.city}, {match.job_data?.state || match.job_data?.territory}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-none px-2 py-0.5 text-[11px] font-bold rounded-md shrink-0 shadow-sm ring-1 ring-green-600/10">
                                                    {Math.round(match.score * 100)}% Match
                                                </Badge>
                                            </div>

                                            {appliedJobIds.has(match.job_id) && (
                                                <div className="bg-brand-50/50 border border-brand-100 p-2 rounded-lg flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase text-brand-700 tracking-wider">Already Applied</span>
                                                    </div>
                                                    <Badge variant="outline" className="text-[9px] font-bold text-brand-600 border-brand-200 bg-white">
                                                        In Pipeline
                                                    </Badge>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-2 flex-wrap">
                                                <div className="flex flex-wrap gap-1.5 flex-1 pr-2">
                                                    {match.reasons.slice(0, 2).map((reason: string, idx: number) => (
                                                        <span key={idx} className="bg-green-50/50 text-green-700 text-[8.5px] font-bold px-2 py-1 rounded truncate uppercase tracking-widest">
                                                            {reason.toUpperCase()}
                                                        </span>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/search/${match.job_source === 'trending_job' ? 'hot-leads' : 'lmia'}/${encodeURIComponent(title)}?field=title&t=${match.job_source}`, '_blank');
                                                    }}
                                                    className="p-1.5 bg-gray-50 text-gray-500 rounded flex items-center justify-center hover:bg-gray-100 hover:text-brand-600 transition-all shrink-0 border border-gray-100"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-400 text-xs italic">
                        No active matches found matching the current Filters.
                    </div>
                )}
            </div>

            {/* Feature 5: Proactive Employer Pipeline */}

            {/* Unlocked Contacts Modal */}
            <Dialog open={showContactsModal} onOpenChange={setShowContactsModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-sm font-bold">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Unlocked Employer Contacts
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {unlockedContacts.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-6">
                                Contact details are not yet available in our database for these employers.
                            </p>
                        ) : (
                            unlockedContacts.map((contact, i) => (
                                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{contact.employer}</p>
                                        <p className="text-[10px] text-gray-500">{contact.job_title} · {contact.location}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {contact.phone && (
                                            <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-[11px] text-brand-600 font-medium hover:underline">
                                                <Phone className="w-3 h-3" /> {contact.phone}
                                            </a>
                                        )}
                                        {contact.email && (
                                            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-[11px] text-brand-600 font-medium hover:underline">
                                                <Mail className="w-3 h-3" /> {contact.email}
                                            </a>
                                        )}
                                        {contact.address && (
                                            <p className="flex items-center gap-2 text-[11px] text-gray-500">
                                                <MapPin className="w-3 h-3" /> {contact.address}
                                            </p>
                                        )}
                                        {!contact.phone && !contact.email && !contact.address && (
                                            <p className="text-[10px] text-gray-400 italic">No direct contact info available for this employer.</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <EmployerInsightDialog
                isOpen={isInsightOpen}
                onOpenChange={setIsInsightOpen}
                employerName={selectedEmployerForInsight}
                nocCodes={selectedNocs.length ? selectedNocs : [(extractedData.recommended_noc_codes?.[0] || extractedData.noc_code)].map(String)}
                onPitch={handlePitch}
            />
        </div>
    );
}

