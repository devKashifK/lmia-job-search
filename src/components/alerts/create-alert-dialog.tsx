'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
    Bell,
    Loader2,
    MapPin,
    Search as SearchIcon,
    Mail,
    CheckCircle2,
    ChevronsUpDown,
    Check,
    ArrowRight,
    X,
    Layers,
    Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/use-session';
import db from '@/db';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from "@/components/ui/multi-select";
import { useJobTitles } from "@/hooks/use-job-data";

interface CreateAlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    criteria: {
        q?: string | string[]; // Allow array
        location?: string | string[];
        searchBy?: string;
        [key: string]: any;
    };
    defaultName?: string;
}

interface Suggestion {
    suggestion: string;
    field?: string;
    hits?: number;
}

export function CreateAlertDialog({
    open,
    onOpenChange,
    criteria,
    defaultName = '',
}: CreateAlertDialogProps) {
    // Form State
    const [name, setName] = useState(defaultName);
    const { data: jobTitleOptions = [], isLoading: loadingTitles } = useJobTitles();
    const [jobTitles, setJobTitles] = useState<string[]>([]);

    const [frequency, setFrequency] = useState('daily');
    const [nocCode, setNocCode] = useState('');
    const [tier, setTier] = useState('');

    // Fetch Tier when NOC changes
    useEffect(() => {
        const fetchTier = async () => {
            if (nocCode.length >= 4) {
                const { getTierByNoc } = await import('@/lib/api/analytics');
                const tier = await getTierByNoc(nocCode);
                if (tier) {
                    setTier(tier);
                }
            }
        };
        const timer = setTimeout(fetchTier, 500);
        return () => clearTimeout(timer);
    }, [nocCode]);



    // Location State (SearchBox Logic)
    const [locationText, setLocationText] = useState('');
    const [showLocationMenu, setShowLocationMenu] = useState(false);
    const [provinces, setProvinces] = useState<{ province: string }[]>([]);
    const [cities, setCities] = useState<{ city: string; province: string }[]>([]);
    const [locationStep, setLocationStep] = useState<'province' | 'city'>('province');
    const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { toast } = useToast();
    const { session } = useSession();

    // Initialize form
    useEffect(() => {
        if (open) {
            // 1. Job Title / Keywords
            const initialQ = criteria.q || criteria.title;
            if (Array.isArray(initialQ)) {
                setJobTitles(initialQ);
            } else if (typeof initialQ === 'string' && initialQ.trim()) {
                setJobTitles([initialQ]);
            } else {
                setJobTitles([]);
            }

            setNocCode(criteria.noc || '');
            setTier(criteria.tier || '');

            // 2. Location Initialization
            // We need to parse the location string back into selectedCities if possible, 
            // or just assume it's a generic text. 
            // ideally criteria.location matches our schema.
            // For now, if it comes from SearchBox, it should be passed correctly.
            if (Array.isArray(criteria.location)) {
                // If array, assume cities? Or mixed?
                // Simplification: just reset location to empty or try to map if it matches known cities
                // But strict generic "Location" string support is tough with this strict UI.
                // Let's rely on user effectively setting it new, OR if we have accurate data.
                setSelectedCities(criteria.location as string[]);
                // We can't easily reverse-engineer provinces from just city names without a map, 
                // unless we fetch all cities.
                // For UX consistency, we might start "clean" or just show the count.
                setLocationText(`${(criteria.location as string[]).length} Cities Selected`);
            } else if (typeof criteria.location === 'string' && criteria.location) {
                // If it's a single string, is it a city? or a generic string?
                setLocationText(criteria.location);
                // We can't map this easily to the checkboxes without more logic.
                // So for this "Strict" Select UI, we might accept it strictly as a visual
                // but making it editable means interacting with the checkboxes.
            } else {
                setLocationText('');
                setSelectedProvinces([]);
                setSelectedCities([]);
            }

            // Smart naming
            if (!defaultName || defaultName === 'My Job Alert') {
                const autoName = criteria.q ? `${criteria.q} Jobs` : 'New Job Alert';
                setName(autoName);
            } else {
                setName(defaultName);
            }

            // Reset steps
            setLocationStep('province');
            setSuccess(false);

            // Load initial provinces
            fetchProvinces();
        }
    }, [open, criteria, defaultName]);




    // Location Logic
    const fetchProvinces = async () => {
        try {
            const { getProvinces } = await import('@/lib/api/locations');
            const data = await getProvinces();
            setProvinces(data.map(p => ({ province: p })));
        } catch (err) {
            console.error('Error fetching provinces:', err);
        }
    };

    const fetchCitiesForProvinces = async (provincesList: string[]) => {
        try {
            const { getCitiesForProvinces } = await import('@/lib/api/locations');
            const cities = await getCitiesForProvinces(provincesList);
            setCities(cities);
        } catch (err) {
            console.error('Error fetching cities:', err);
        }
    };

    useEffect(() => {
        if (selectedProvinces.length > 0) {
            fetchCitiesForProvinces(selectedProvinces);
        } else {
            setCities([]);
        }
    }, [selectedProvinces]);

    // Update text representation
    useEffect(() => {
        if (selectedCities.length > 0) {
            const count = selectedCities.length;
            setLocationText(`${count} Cit${count > 1 ? 'ies' : 'y'} Selected`);
        } else if (selectedProvinces.length > 0) {
            const count = selectedProvinces.length;
            setLocationText(`${count} Province${count > 1 ? 's' : ''} Selected`);
        } else {
            // Only clear if empty, don't overwrite if it was initialized str
            if (selectedProvinces.length === 0 && selectedCities.length === 0) setLocationText('');
        }
    }, [selectedProvinces, selectedCities]);

    const handleProvinceToggle = (province: string) => {
        setSelectedProvinces(prev => {
            const next = prev.includes(province) ? prev.filter(p => p !== province) : [...prev, province];
            // Clear cities on province change to force re-selection relative to active provinces? 
            // Or keep them? SearchBox clears them roughly.
            if (prev.includes(province)) setSelectedCities([]); // Clear if removing province
            return next;
        });
    };

    const handleCityToggle = (city: string) => {
        setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
    };


    const handleCreateAlert = async () => {
        if (!session?.user?.id) {
            toast({ title: 'Authentication Required', description: 'Please sign in to create a job alert.', variant: 'destructive' });
            return;
        }

        if (!name.trim()) {
            toast({ title: 'Name Required', description: 'Please give your alert a name.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const finalCriteria = {
                ...criteria,
                q: jobTitles,
                title: jobTitles,
                noc: nocCode || undefined,
                tier: tier !== 'all' ? tier : undefined,
                location: selectedCities.length > 0 ? selectedCities : (selectedProvinces.length > 0 ? selectedProvinces : locationText),
                locationType: selectedCities.length > 0 ? 'cities' : (selectedProvinces.length > 0 ? 'provinces' : 'raw'),
            };

            const { createAlert } = await import('@/lib/api/alerts');
            await createAlert({
                user_id: session.user.id,
                name: name,
                criteria: finalCriteria,
                frequency: frequency as any,
                is_active: true,
            });

            setSuccess(true);
            setTimeout(() => { onOpenChange(false); setSuccess(false); }, 1500);

        } catch (error) {
            console.error('Error creating alert:', error);
            toast({ title: 'Error', description: 'Failed to create alert.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600" />

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-16 px-6 text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Created!</h2>
                            <p className="text-gray-500">We'll notify you when relevant jobs appear in your selected locations.</p>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <DialogHeader className="px-6 pt-6 pb-2">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-2 bg-brand-50 rounded-lg">
                                        <Bell className="w-4 h-4 text-brand-600" />
                                    </div>
                                    <DialogTitle className="text-lg font-bold text-gray-900">Create Job Alert</DialogTitle>
                                </div>
                                <DialogDescription className="text-gray-500 text-xs ml-11">
                                    Get notified for <span className="font-semibold text-gray-700">{jobTitles.length > 0 ? `${jobTitles.length} Roles` : 'jobs'}</span> in <span className="font-semibold text-gray-700">{locationText || 'Canada'}</span>.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="px-6 py-4 space-y-4">

                                {/* Alert Name */}
                                <div className="space-y-1">
                                    <Label htmlFor="name" className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Alert Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Software Engineer in Toronto"
                                        className="h-9 text-sm border-gray-200 focus:border-brand-500 focus:ring-brand-500/20 bg-gray-50/50"
                                    />
                                </div>

                                {/* Main Filters */}
                                <div className="space-y-3">
                                    {/* JOB TITLE (Multi-Select) */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Job Titles</Label>
                                        <div className="relative">
                                            <MultiSelect
                                                options={jobTitleOptions.map(t => ({ value: t, label: t }))}
                                                selected={jobTitles}
                                                onChange={setJobTitles}
                                                placeholder={loadingTitles ? "Loading..." : "Select Job Titles..."}
                                                emptyText="No titles found."
                                                className="bg-white border-gray-200 min-h-[36px]"
                                            />
                                        </div>
                                    </div>

                                    {/* LOCATION */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 z-10" />
                                            <Popover open={showLocationMenu} onOpenChange={setShowLocationMenu}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start pl-9 h-9 text-left font-normal border-gray-200 bg-white text-sm"
                                                    >
                                                        <span className="truncate">
                                                            {locationText || "Select Location..."}
                                                        </span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[320px] p-0" align="start">
                                                    <div className="p-2 max-h-[300px] overflow-y-auto">
                                                        {locationStep === 'province' ? (
                                                            <>
                                                                <div className="flex items-center justify-between px-2 py-2 mb-1">
                                                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Provinces</div>
                                                                    {selectedProvinces.length > 0 && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setLocationStep('city')}
                                                                            className="h-6 text-xs text-brand-600 font-semibold hover:text-brand-700 hover:bg-brand-50"
                                                                        >
                                                                            Next <ArrowRight className="w-3 h-3 ml-1" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-1">
                                                                    {provinces.map((p, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="flex items-center space-x-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                                            onClick={() => handleProvinceToggle(p.province)}
                                                                        >
                                                                            <Checkbox
                                                                                checked={selectedProvinces.includes(p.province)}
                                                                                className="h-3.5 w-3.5 border-gray-300 data-[state=checked]:bg-brand-600"
                                                                            />
                                                                            <span className="text-xs font-medium text-gray-700">{p.province}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center justify-between px-1 mb-2 sticky top-0 bg-white z-10 py-2 border-b border-gray-50">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setLocationStep('province')}
                                                                        className="h-7 px-2 text-gray-500 hover:text-gray-900 text-xs"
                                                                    >
                                                                        <ArrowRight className="w-3 h-3 rotate-180 mr-1" /> Back
                                                                    </Button>
                                                                </div>

                                                                {cities.length > 0 ? (
                                                                    <div className="grid grid-cols-1 gap-1">
                                                                        {cities.map((c, idx) => (
                                                                            <div
                                                                                key={`${c.province}-${c.city}-${idx}`}
                                                                                className="flex items-center space-x-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                                                onClick={() => handleCityToggle(c.city)}
                                                                            >
                                                                                <Checkbox
                                                                                    checked={selectedCities.includes(c.city)}
                                                                                    className="h-3.5 w-3.5 border-gray-300 data-[state=checked]:bg-brand-600"
                                                                                />
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-xs font-medium text-gray-700">{c.city}</span>
                                                                                    <span className="text-[10px] text-gray-400">{c.province}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-4 text-center text-gray-400 text-xs">No cities found.</div>
                                                                )}

                                                                <div className="sticky bottom-0 bg-white p-2 border-t border-gray-100 mt-2">
                                                                    <Button onClick={() => setShowLocationMenu(false)} className="w-full bg-brand-600 h-7 text-xs">
                                                                        Apply Selection
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Filters Row */}
                                <div className="grid grid-cols-3 gap-3">
                                    {/* NOC Code */}
                                    <div className="space-y-1">
                                        <Label htmlFor="nocCode" className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">NOC Code</Label>
                                        <div className="relative">
                                            <Input
                                                id="nocCode"
                                                value={nocCode}
                                                onChange={(e) => setNocCode(e.target.value)}
                                                placeholder="e.g. 21232"
                                                className="h-9 text-xs border-gray-200 focus:border-brand-500 focus:ring-brand-500/20 bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Company Tier */}
                                    <div className="space-y-1">
                                        <Label htmlFor="tier" className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Tier</Label>
                                        <Select value={tier} onValueChange={setTier}>
                                            <SelectTrigger className="h-9 text-xs border-gray-200 focus:ring-brand-500/20">
                                                <SelectValue placeholder="Any Tier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Any Tier</SelectItem>
                                                <SelectItem value="1">Tier 1</SelectItem>
                                                <SelectItem value="2">Tier 2</SelectItem>
                                                <SelectItem value="3">Tier 3</SelectItem>
                                                <SelectItem value="4">Tier 4</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Frequency */}
                                    <div className="space-y-1">
                                        <Label htmlFor="frequency" className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Frequency</Label>
                                        <Select value={frequency} onValueChange={setFrequency}>
                                            <SelectTrigger className="h-9 text-xs border-gray-200 focus:ring-brand-500/20">
                                                <SelectValue placeholder="Daily" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="instant">Instant</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>


                                <div className="flex items-start gap-2 p-2.5 bg-brand-50/50 text-brand-700 rounded-lg text-[10px] border border-brand-100/50">
                                    <Bell className="w-3 h-3 mt-0.5 shrink-0 fill-brand-200" />
                                    <p>We'll notify you as soon as new jobs match your preferences.</p>
                                </div>

                            </div>

                            <DialogFooter className="px-6 py-4 bg-gray-50/30 flex-row gap-2 border-t border-gray-100/50">
                                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9 text-sm border-gray-200 hover:bg-white hover:text-gray-900">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateAlert}
                                    disabled={loading}
                                    className="flex-1 h-9 text-sm bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Alert'
                                    )}
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog >
    );
}

