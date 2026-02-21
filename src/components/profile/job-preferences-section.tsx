"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Target,
    Briefcase,
    MapPin,
    Building,
    ChevronDown,
    X,
    Plus,
    Sparkles,
    Bell
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { useJobTitles, useCategories, useProvinces, useCitiesForProvinces, useNocCodes, useCompanyTiers } from "@/hooks/use-job-data";
import { NocSummary } from "@/lib/noc-service";
import { CreateAlertDialog } from "@/components/alerts/create-alert-dialog";

// ----------------------------------------------------------------------
// Reusable Sub-Component for Recommendations
// ----------------------------------------------------------------------
interface RecommendationBlockProps<T> {
    title: string;
    description: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    onAdd: (item: T) => void;
}

function RecommendationBlock<T>({ title, description, items, renderItem, onAdd }: RecommendationBlockProps<T>) {
    if (!items || items.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg border border-brand-100 bg-brand-50/50 p-4"
        >
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-medium text-brand-900">{title}</h3>
            </div>
            <p className="text-xs text-brand-700 mb-3">{description}</p>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAdd(item)}
                        className="group flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-sm transition-all hover:bg-brand-600 hover:text-white"
                    >
                        {renderItem(item)}
                        <Plus className="h-3 w-3 ml-1" />
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

export function JobPreferencesSection() {
    const { preferences, updatePreferences, isUpdating } = useUserPreferences();
    const [showAlertDialog, setShowAlertDialog] = useState(false);

    // Fetch data from database
    const { data: jobTitles, isLoading: loadingTitles } = useJobTitles();
    const { data: categories, isLoading: loadingCategories } = useCategories();
    const { data: provinces, isLoading: loadingProvinces } = useProvinces();
    const { data: nocCodes, isLoading: loadingNocCodes } = useNocCodes();
    const { data: companyTiers, isLoading: loadingTiers } = useCompanyTiers();

    // Location selection state
    const [selectedProvinces, setSelectedProvinces] = useState<string[]>(
        preferences?.preferred_provinces || []
    );
    const [selectedCities, setSelectedCities] = useState<string[]>(
        preferences?.preferred_cities || []
    );
    const [showLocationMenu, setShowLocationMenu] = useState(false);
    const [locationStep, setLocationStep] = useState<'province' | 'city'>('province');

    const [recommendedNocs, setRecommendedNocs] = useState<NocSummary[]>([]);
    const [recommendedTeers, setRecommendedTeers] = useState<string[]>([]);
    const [recommendedIndustries, setRecommendedIndustries] = useState<string[]>([]);

    // Fetch NOC recommendations when job titles change
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (preferences?.preferred_job_titles?.length > 0) {
                try {
                    const response = await fetch('/api/match-noc', {
                        method: 'POST',
                        body: JSON.stringify({ jobTitles: preferences.preferred_job_titles }),
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setRecommendedNocs(data.matches || []);
                        setRecommendedTeers(data.teerMatches || []);
                        setRecommendedIndustries(data.industryMatches || []);
                    }
                } catch (e) {
                    console.error("Failed to fetch recommendations", e);
                }
            } else {
                setRecommendedNocs([]);
                setRecommendedTeers([]);
                setRecommendedIndustries([]);
            }
        };

        const timeoutId = setTimeout(fetchRecommendations, 1000); // Debounce
        return () => clearTimeout(timeoutId);
    }, [preferences?.preferred_job_titles]);

    // Fetch cities when provinces are selected
    const { data: availableCities } = useCitiesForProvinces(selectedProvinces);

    // Sync with preferences
    useEffect(() => {
        if (preferences?.preferred_provinces) {
            setSelectedProvinces(preferences.preferred_provinces);
        }
        if (preferences?.preferred_cities) {
            setSelectedCities(preferences.preferred_cities);
        }
    }, [preferences]);

    // Convert data to multi-select options
    const jobTitleOptions = (jobTitles || []).map(title => ({
        value: title,
        label: title,
    }));

    const categoryOptions = (categories || []).map(category => ({
        value: category,
        label: category,
    }));

    const nocCodeOptions = (nocCodes || []).map(code => ({
        value: code,
        label: code,
    }));

    const tierOptions = (companyTiers || []).map(tier => ({
        value: tier,
        label: `Tier ${tier}`,
    }));

    // Location handlers
    const handleProvinceToggle = (province: string) => {
        const newProvinces = selectedProvinces.includes(province)
            ? selectedProvinces.filter(p => p !== province)
            : [...selectedProvinces, province];

        setSelectedProvinces(newProvinces);
        // Clear cities when provinces change
        setSelectedCities([]);
    };

    const handleCityToggle = (city: string) => {
        const newCities = selectedCities.includes(city)
            ? selectedCities.filter(c => c !== city)
            : [...selectedCities, city];

        setSelectedCities(newCities);
    };

    const handleApplyLocation = () => {
        updatePreferences({
            preferred_provinces: selectedProvinces,
            preferred_cities: selectedCities,
        });
        setShowLocationMenu(false);
    };

    const handleClearLocation = () => {
        setSelectedProvinces([]);
        setSelectedCities([]);
        setLocationStep('province');
        updatePreferences({
            preferred_provinces: [],
            preferred_cities: [],
        });
    };

    // Get location display text
    const getLocationText = () => {
        if (selectedCities.length > 0) {
            return `${selectedCities.length} Cit${selectedCities.length > 1 ? 'ies' : 'y'} Selected`;
        } else if (selectedProvinces.length > 0) {
            return `${selectedProvinces.length} Province${selectedProvinces.length > 1 ? 's' : ''} Selected`;
        }
        return '';
    };

    // Check if any preferences are set
    const hasJobTitles = (preferences?.preferred_job_titles?.length || 0) > 0;
    const hasLocations = (preferences?.preferred_provinces?.length || 0) > 0 || (preferences?.preferred_cities?.length || 0) > 0;
    const hasIndustries = (preferences?.preferred_industries?.length || 0) > 0;
    const hasNocCodes = (preferences?.preferred_noc_codes?.length || 0) > 0;
    const hasTiers = (preferences?.preferred_company_tiers?.length || 0) > 0;
    const hasAnyPreferences = hasJobTitles || hasLocations || hasIndustries || hasNocCodes || hasTiers;

    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-brand-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Job Preferences</h2>
                </div>
                <Badge className="bg-brand-100 text-brand-700 border-0">
                    For Recommendations
                </Badge>
            </div>

            {/* Alert Button */}
            <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white p-4 rounded-xl border border-brand-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 rounded-lg">
                        <Bell className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Get notified for these jobs</h3>
                        <p className="text-xs text-gray-500">Create an alert based on your preferences.</p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowAlertDialog(true)}
                    size="sm"
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                >
                    Create Alert
                </Button>
            </div>

            {/* Current Preferences Summary */}
            {hasAnyPreferences && (
                <div className="mb-6 rounded-lg border border-brand-100 bg-brand-50/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-brand-900">Your Current Preferences</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-brand-600 hover:text-brand-700"
                            onClick={() => {
                                // Scroll to preferences form below
                                const element = document.getElementById('preferences-form');
                                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        >
                            Edit Below
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {hasJobTitles && (
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Job Titles:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {preferences?.preferred_job_titles?.slice(0, 5).map((title, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-white text-xs">
                                            {title}
                                        </Badge>
                                    ))}
                                    {(preferences?.preferred_job_titles?.length || 0) > 5 && (
                                        <Badge variant="secondary" className="bg-white text-xs">
                                            +{(preferences?.preferred_job_titles?.length || 0) - 5} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                        {hasLocations && (
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Locations:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {preferences?.preferred_provinces?.map((prov, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-white text-xs">
                                            {prov}
                                        </Badge>
                                    ))}
                                    {preferences?.preferred_cities?.slice(0, 3).map((city, idx) => (
                                        <Badge key={`city-${idx}`} variant="secondary" className="bg-white text-xs">
                                            {city}
                                        </Badge>
                                    ))}
                                    {(preferences?.preferred_cities?.length || 0) > 3 && (
                                        <Badge variant="secondary" className="bg-white text-xs">
                                            +{(preferences?.preferred_cities?.length || 0) - 3} more cities
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                        {hasIndustries && (
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Industries:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {preferences?.preferred_industries?.slice(0, 4).map((ind, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-white text-xs">
                                            {ind}
                                        </Badge>
                                    ))}
                                    {(preferences?.preferred_industries?.length || 0) > 4 && (
                                        <Badge variant="secondary" className="bg-white text-xs">
                                            +{(preferences?.preferred_industries?.length || 0) - 4} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                        {hasNocCodes && (
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">NOC Codes:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {preferences?.preferred_noc_codes?.map((code, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-white text-xs font-mono">
                                            {code}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {hasTiers && (
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">Company Tiers:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {preferences?.preferred_company_tiers?.map((tier, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-white text-xs">
                                            Tier {tier}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
                Help us recommend the most relevant jobs by sharing your preferences.
                This information will only be used to personalize your job
                recommendations.
            </p>

            {/* Preferences Form */}
            <div id="preferences-form" className="space-y-5">
                {/* Preferred Job Titles */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-brand-600" />
                        Preferred Job Titles
                    </label>
                    <MultiSelect
                        options={jobTitleOptions}
                        selected={preferences?.preferred_job_titles || []}
                        onChange={(values) =>
                            updatePreferences({ preferred_job_titles: values })
                        }
                        placeholder={loadingTitles ? "Loading job titles..." : "Select job titles you're interested in..."}
                        emptyText="No job titles found."
                    />
                    <p className="text-xs text-gray-500">
                        Select the types of positions you're looking for
                    </p>
                </motion.div>

                {/* Preferred Locations (State → City Selector) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand-600" />
                        Preferred Locations
                    </label>

                    {/* Location Selector Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLocationMenu(!showLocationMenu)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-brand-300 transition-colors"
                        >
                            <div className="flex flex-wrap gap-1.5 flex-1">
                                {getLocationText() || (
                                    <span className="text-gray-400">Select provinces and cities...</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {getLocationText() && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClearLocation();
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded-full"
                                    >
                                        <X className="h-4 w-4 text-gray-400" />
                                    </button>
                                )}
                                <ChevronDown className={`h - 4 w - 4 text - gray - 400 transition - transform ${showLocationMenu ? 'rotate-180' : ''} `} />
                            </div>
                        </button>

                        {/* Location Menu Dropdown */}
                        {showLocationMenu && (
                            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
                                {locationStep === 'province' ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Select Provinces
                                            </div>
                                            {selectedProvinces.length > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setLocationStep('city')}
                                                    className="h-7 text-xs text-brand-600 font-semibold hover:text-brand-700 hover:bg-brand-50"
                                                >
                                                    Next: Select Cities →
                                                </Button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto p-2">
                                            {loadingProvinces ? (
                                                <div className="p-4 text-center text-gray-400 text-sm">Loading provinces...</div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-1">
                                                    {provinces?.map((province, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                            onClick={() => handleProvinceToggle(province)}
                                                        >
                                                            <Checkbox
                                                                checked={selectedProvinces.includes(province)}
                                                                className="border-gray-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">{province}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setLocationStep('province')}
                                                className="h-8 px-2 text-gray-500 hover:text-gray-900"
                                            >
                                                ← Back to Provinces
                                            </Button>
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Select Cities
                                            </div>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto p-2">
                                            {availableCities && availableCities.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-1">
                                                    {availableCities.map((cityData, idx) => (
                                                        <div
                                                            key={`${cityData.province} -${cityData.city} -${idx} `}
                                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                            onClick={() => handleCityToggle(cityData.city)}
                                                        >
                                                            <Checkbox
                                                                checked={selectedCities.includes(cityData.city)}
                                                                className="border-gray-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-700">{cityData.city}</span>
                                                                <span className="text-[10px] text-gray-400">{cityData.province}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-gray-400 text-sm">
                                                    {selectedProvinces.length === 0
                                                        ? 'Please select provinces first'
                                                        : 'No cities found for selected provinces'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-gray-100">
                                            <Button
                                                onClick={handleApplyLocation}
                                                className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg h-9 text-sm"
                                            >
                                                Apply ({selectedCities.length} cities selected)
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                        Choose cities or provinces you're willing to work in
                    </p>
                </motion.div>

                {/* Preferred Industries (Categories from DB) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Building className="h-4 w-4 text-brand-600" />
                        Preferred Industries
                    </label>
                    <MultiSelect
                        options={categoryOptions}
                        selected={preferences?.preferred_industries || []}
                        onChange={(values) =>
                            updatePreferences({ preferred_industries: values })
                        }
                        placeholder={loadingCategories ? "Loading industries..." : "Select industries you're interested in..."}
                        emptyText="No industries found."
                    />
                    <p className="text-xs text-gray-500">
                        Select industries that align with your career goals
                    </p>
                </motion.div>
                {/* NOC Codes */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-brand-600" />
                        Preferred NOC Codes
                    </label>
                    <MultiSelect
                        options={nocCodeOptions}
                        selected={preferences?.preferred_noc_codes || []}
                        onChange={(values) =>
                            updatePreferences({ preferred_noc_codes: values })
                        }
                        placeholder={loadingNocCodes ? "Loading NOC codes..." : "Select NOC codes..."}
                        emptyText="No NOC codes found."
                    />
                    <p className="text-xs text-gray-500">
                        Select National Occupational Classification codes
                    </p>
                </motion.div>

                {/* Company Tiers */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                >
                    <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Building className="h-4 w-4 text-brand-600" />
                        Preferred Company Tiers
                    </label>
                    <MultiSelect
                        options={tierOptions}
                        selected={preferences?.preferred_company_tiers || []}
                        onChange={(values) =>
                            updatePreferences({ preferred_company_tiers: values })
                        }
                        placeholder={loadingTiers ? "Loading tiers..." : "Select company tiers..."}
                        emptyText="No tiers found."
                    />
                    <p className="text-xs text-gray-500">
                        Select preferred company performance tiers
                    </p>
                </motion.div>

                {/* NOC Recommendations */}
                <RecommendationBlock
                    title="Recommended NOC Codes"
                    description="Based on your preferred job titles, we recommend checking these NOC codes:"
                    items={recommendedNocs.filter(noc => !preferences?.preferred_noc_codes?.includes(noc.code))}
                    onAdd={(noc) => {
                        const current = preferences?.preferred_noc_codes || [];
                        if (!current.includes(noc.code)) {
                            updatePreferences({ preferred_noc_codes: [...current, noc.code] });
                        }
                    }}
                    renderItem={(noc) => (
                        <>
                            <span>{noc.code}</span>
                            <span className="max-w-[150px] truncate opacity-80 group-hover:opacity-100">
                                - {noc.title}
                            </span>
                        </>
                    )}
                />

                {/* Industry Recommendations */}
                <RecommendationBlock
                    title="Recommended Industries"
                    description="Based on your job titles, these industries might specific to your field:"
                    items={recommendedIndustries.filter(ind => !preferences?.preferred_industries?.includes(ind))}
                    onAdd={(ind) => {
                        const current = preferences?.preferred_industries || [];
                        if (!current.includes(ind)) {
                            updatePreferences({ preferred_industries: [...current, ind] });
                        }
                    }}
                    renderItem={(ind) => (
                        <>
                            <Building className="h-3 w-3" />
                            <span>{ind}</span>
                        </>
                    )}
                />

                {/* Tier Recommendations */}
                <RecommendationBlock
                    title="Recommended TEER Categories"
                    description="Based on your matched NOC Codes, these TEER categories apply to you:"
                    items={recommendedTeers.filter(tier => !preferences?.preferred_company_tiers?.includes(tier))}
                    onAdd={(tier) => {
                        const current = preferences?.preferred_company_tiers || [];
                        if (!current.includes(tier)) {
                            updatePreferences({ preferred_company_tiers: [...current, tier] });
                        }
                    }}
                    renderItem={(tier) => <span>TEER {tier}</span>}
                />


                {isUpdating && (
                    <div className="text-sm text-brand-600 flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                        Saving preferences...
                    </div>
                )}
            </div>

            {/* Create Alert Dialog */}
            <CreateAlertDialog
                open={showAlertDialog}
                onOpenChange={setShowAlertDialog}
                criteria={{
                    q: preferences?.preferred_job_titles || [],
                    title: preferences?.preferred_job_titles || [],
                    location: preferences?.preferred_cities?.length > 0 ? preferences.preferred_cities : preferences?.preferred_provinces,
                    noc: preferences?.preferred_noc_codes?.[0] || '',
                    tier: preferences?.preferred_company_tiers?.[0] || '',
                    // We'll let the user refine these in the dialog
                }}
                defaultName="My Preference Alert"
            />
        </section >
    );
}
