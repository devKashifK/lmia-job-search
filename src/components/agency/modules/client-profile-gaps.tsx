'use client';

import React, { useState } from 'react';
import { 
    Plus, 
    Save, 
    X, 
    BrainCircuit,
    Loader2,
    Users,
    GraduationCap,
    MapPin,
    Briefcase,
    Target,
    Award,
    Star,
    Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { useAgencyClients } from '@/hooks/use-agency-clients';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Calculator Imports
import { calculateExpressEntryScore, CRSInputs } from '@/lib/calculators/express-entry';
import { calculateManitobaScore, ManitobaInputs } from '@/lib/calculators/manitoba';
import { calculateSINPScore, SINPInputs } from '@/lib/calculators/sinp';
import { calculateBCScore, BCPointsInputs } from '@/lib/calculators/bc-pnp';
import { calculateOntarioScore, OntarioInputs } from '@/lib/calculators/ontario';

const CRITICAL_FIELDS = [
    // CORE Factors
    { key: 'age', label: 'Age', type: 'number', category: 'General', placeholder: 'e.g., 28', icon: Target },
    { 
        key: 'marital_status', 
        label: 'Marital Status', 
        type: 'select', 
        category: 'General',
        icon: Users,
        options: [
            { label: 'Never Married / Single', value: 'single' },
            { label: 'Married', value: 'married' },
            { label: 'Common-Law', value: 'commonLaw' },
            { label: 'Divorced / Separated', value: 'divorced' }
        ]
    },
    
    // Education & Language
    { 
        key: 'education_level', 
        label: 'Education', 
        type: 'select', 
        category: 'Education/Language',
        icon: GraduationCap,
        options: [
            { label: 'High School', value: 'less' },
            { label: 'One or Two year Diploma', value: 'diploma' },
            { label: 'Bachelors Degree', value: 'bachelorsPlus' },
            { label: 'Masters Degree', value: 'masters' },
            { label: 'PhD / Doctoral', value: 'doctoral' }
        ]
    },
    { 
        key: 'language_clb', 
        label: 'First Language (CLB)', 
        type: 'select', 
        category: 'Education/Language',
        icon: Award,
        options: [
            { label: 'CLB 4 (Basic)', value: '4' },
            { label: 'CLB 5', value: '5' },
            { label: 'CLB 6', value: '6' },
            { label: 'CLB 7 (Competent)', value: '7' },
            { label: 'CLB 8', value: '8' },
            { label: 'CLB 9 (Advanced)', value: '9' },
            { label: 'CLB 10 (Native)', value: '10' }
        ]
    },
    { 
        key: 'second_language_clb', 
        label: 'Second Language (CLB)', 
        type: 'select', 
        category: 'Education/Language',
        icon: Award,
        options: [
            { label: 'CLB 5+', value: '5' },
            { label: 'None / Below 5', value: '0' }
        ]
    },

    // Work Experience
    { key: 'experience_years', label: 'Foreign Work Exp', type: 'number', category: 'Experience', icon: Briefcase, placeholder: 'Years outside Canada' },
    { key: 'canadian_experience_years', label: 'Canadian Work Exp', type: 'number', category: 'Experience', icon: Briefcase, placeholder: 'Years in Canada' },
    { 
        key: 'skilled_exp_recent', 
        label: 'Recent Skilled Exp', 
        type: 'select', 
        category: 'Experience',
        icon: Clock,
        options: [
            { label: '5+ years', value: '5' },
            { label: '3-4 years', value: '3' },
            { label: '1-2 years', value: '1' },
            { label: 'None', value: '0' }
        ]
    },
    
    // PNP & Connections
    { 
        key: 'provincial_ties', 
        label: 'Connection to Province', 
        type: 'select', 
        category: 'Regional/PNP',
        icon: Users,
        options: [
            { label: 'Relative in Manitoba', value: 'mb_relative' },
            { label: 'Relative in Saskatchewan', value: 'sk_relative' },
            { label: 'Friend in Manitoba', value: 'mb_friend' },
            { label: 'Past Work/Study in BC', value: 'bc_past' },
            { label: 'No Connections', value: 'none' }
        ]
    },
    { 
        key: 'target_region', 
        label: 'Target Work Area', 
        type: 'select', 
        category: 'Regional/PNP',
        icon: MapPin,
        options: [
            { label: 'Outside Winnipeg (MB)', value: 'mb_rural' },
            { label: 'Outside GTA (ON)', value: 'on_rural' },
            { label: 'Outside Metro Vancouver (BC)', value: 'bc_rural' },
            { label: 'Major City Center', value: 'metro' }
        ]
    },
    { 
        key: 'job_offer_wage', 
        label: 'Job Offer Wage Level', 
        type: 'select', 
        category: 'Experience',
        icon: Award,
        options: [
            { label: '$35+ per hour (Competitive)', value: 'high' },
            { label: '$25+ per hour (Median)', value: 'mid' },
            { label: 'Market Minimum', value: 'low' }
        ]
    }
];

interface ClientProfileGapsProps {
    client: any;
    context?: 'agency' | 'public';
    urn?: string;
    pin?: string;
    onUpdate?: (updatedData: any) => void;
}

export function ClientProfileGaps({ client, context = 'agency', urn, pin, onUpdate }: ClientProfileGapsProps) {
    const { updateClient, isUpdating: isAgencyUpdating } = useAgencyClients();
    const { toast } = useToast();
    const [editingField, setEditingField] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('General');
    const [value, setValue] = useState('');
    const [isPublicUpdating, setIsPublicUpdating] = useState(false);

    const isUpdating = isAgencyUpdating || isPublicUpdating;
    const data = client.extracted_data || {};
    
    // Gaps logic
    const allGaps = CRITICAL_FIELDS.filter(f => !data[f.key]);
    const filteredGaps = allGaps.filter(f => f.category === activeCategory);
    
    if (allGaps.length === 0) return null;

    // Multidimensional Scoring logic
    const scores = {
        crs: calculateExpressEntryScore({
            maritalStatus: data.marital_status || 'single', spouseCitizen: 'no', spouseComing: 'no',
            age: data.age?.toString() || '30', educationLevel: data.education_level || 'bachelorsPlus',
            hasCanadianEducation: data.has_canadian_education || 'no', canadianEducationLevel: 'bachelorsPlus',
            languageTestValid: 'yes', firstLangSpeaking: data.language_clb || '7',
            firstLangListening: data.language_clb || '7', firstLangReading: data.language_clb || '7',
            firstLangWriting: data.language_clb || '7', otherResults: 'no',
            secondLangSpeaking: '0', secondLangListening: '0', secondLangReading: '0', secondLangWriting: '0',
            canadianExperience: data.canadian_experience_years?.toString() || '0', foreignExperience: data.experience_years?.toString() || '0',
            certificateQualification: 'no', jobOffer: 'no', jobOfferNocLevel: '123', hasPNP: 'no',
            siblingInCanada: 'no', spouseEducation: 'secondary', spouseCanadianExperience: '0',
            spouseLangSpeaking: '0', spouseLangListening: '0', spouseLangReading: '0', spouseLangWriting: '0'
        } as any).total,
        manitoba: calculateManitobaScore({
            firstLangCLB: data.language_clb || '0', secondLangCLB: data.second_language_clb || '0',
            age: data.age || '30', yearsExperience: data.experience_years || '0', educationLevel: data.education_level || 'diploma',
            relativeManitoba: data.provincial_ties === 'mb_relative' ? 'yes' : 'no', invitation: 'no', mbWorkExp: 'no', mbEdu2: 'no',
            mbEdu1: 'no', friendDistant: data.provincial_ties === 'mb_friend' ? 'yes' : 'no', outsideWinnipeg: data.target_region === 'mb_rural' ? 'yes' : 'no'
        } as any).total,
        sinp: calculateSINPScore({
            educationLevel: data.education_level === 'doctoral' ? 'doctoral' : 'uni3yr',
            skilledExpRecent: data.skilled_exp_recent || '0', skilledExpOlder: '0',
            firstLangCLB: data.language_clb || '0', secondLangCLB: '0', ageRange: '22-34',
            jobOffer: 'no', relative: data.provincial_ties === 'sk_relative' ? 'yes' : 'no', pastWork: 'no', pastStudy: 'no'
        } as any).total,
        bc: calculateBCScore({
            yearsRelatedExp: '>=60', bcExperienceBonus: 'no', educationLevel: data.education_level || 'bachelors',
            bcEducationBonus: 'no', canadaEducationBonus: 'no', professionalDesignationBonus: 'no',
            engCLB: data.language_clb || '0', freCLB: '0', wageRange: data.job_offer_wage || '<16',
            region: data.target_region === 'bc_rural' ? 'other' : 'metro', regionalExperienceBonus: 'no'
        } as any).total,
        ontario: calculateOntarioScore({
            jobOfferWage: data.job_offer_wage || 'low', nocTeer: data.noc_teer || '1',
            canadianExperience: data.canadian_experience_years > 0 ? 'yes' : 'no',
            workLocation: data.target_region === 'on_rural' ? 'outsideGTA' : 'insideGTA',
            educationLevel: data.education_level || 'undergrad', primaryLanguage: 'english'
        } as any).total
    };

    const handleSave = async (key: string) => {
        try {
            const updatedData = { ...data, [key]: value };
            if (context === 'agency') {
                await updateClient({ id: client.id, updates: { extracted_data: updatedData }});
            } else {
                setIsPublicUpdating(true);
                const res = await fetch(`/api/agency/public-update-client`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ urn, pin, updates: { [key]: value } })
                });
                if (!res.ok) throw new Error('Update failed');
                const result = await res.json();
                onUpdate?.(result.updatedData);
            }
            toast({ title: "Updated", description: "Eligibility data synchronized." });
            setEditingField(null);
            setValue('');
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Save failed.' });
        } finally {
            setIsPublicUpdating(false);
        }
    };

    return (
        <Card className="border-brand-100 bg-brand-50 shadow-none overflow-hidden h-full flex flex-col">
            <div className="bg-white px-4 py-3 border-b border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-600 rounded-xl text-white">
                        <BrainCircuit className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 block">Universal Eligibility Engine</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Live Path Simulation</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <div className="text-right px-2 border-r border-gray-100">
                        <span className="text-[8px] font-bold text-brand-600 uppercase block">CRS Score</span>
                        <span className="text-xs font-bold text-gray-900">{scores.crs}</span>
                    </div>
                    <div className="text-right px-2">
                        <span className="text-[8px] font-bold text-emerald-600 uppercase block">PNP Fit</span>
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1 justify-end">
                            {Math.max(scores.manitoba, scores.sinp, scores.bc)}
                            <Star className="w-2 h-2 fill-amber-500 text-amber-500" />
                        </span>
                    </div>
                </div>
            </div>
            
            <CardContent className="p-3 space-y-4 flex-1">
                {/* Scoreboard Carousel */}
                <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { label: 'Express Entry', val: scores.crs, color: 'text-brand-600', bg: 'bg-indigo-50', icon: Target },
                        { label: 'Manitoba', val: scores.manitoba, color: 'text-cyan-600', bg: 'bg-cyan-50', icon: MapPin },
                        { label: 'Saskatchewan', val: scores.sinp, color: 'text-orange-600', bg: 'bg-orange-50', icon: Award },
                        { label: 'BC PNP', val: scores.bc, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Target },
                        { label: 'Ontario', val: scores.ontario, color: 'text-blue-600', bg: 'bg-blue-50', icon: GraduationCap },
                    ].map(s => (
                        <div key={s.label} className={cn("min-w-[100px] p-2 rounded-xl border flex flex-col gap-1 transition-all shadow-sm", s.bg, "border-white/50")}>
                            <s.icon className={cn("w-3 h-3", s.color)} />
                            <span className="text-[8px] font-bold uppercase tracking-tighter text-gray-500 truncate">{s.label}</span>
                            <span className={cn("text-xs font-bold", s.color)}>{s.val} <span className="text-[8px] font-bold opacity-60">PTS</span></span>
                        </div>
                    ))}
                </div>

                {/* Category Selector */}
                <div className="flex gap-1 bg-gray-100/50 p-1 rounded-xl">
                    {['General', 'Education/Language', 'Experience', 'Regional/PNP'].map(cat => {
                        const count = allGaps.filter(g => g.category === cat).length;
                        return (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "flex-1 px-1 py-1 px-2 rounded-xl transition-all text-[8px] font-bold uppercase tracking-tighter relative",
                                    activeCategory === cat ? "bg-white text-brand-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {cat.split('/')[0]}
                                {count > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 text-white rounded-xl flex items-center justify-center text-[7px] border-white border">
                                    {count}
                                </span>}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {filteredGaps.map((field) => {
                        const Icon = field.icon;
                        return (
                            <div key={field.key} className="p-2 rounded-xl border transition-all bg-white border-gray-100 shadow-sm animate-in fade-in duration-300">
                                {editingField === field.key ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[9px] font-bold uppercase text-gray-400">{field.label}</Label>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingField(null)} className="h-4 w-4 p-0 text-gray-300"><X className="w-3 h-3" /></Button>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {field.type === 'number' ? (
                                                <Input autoFocus type="number" value={value} onChange={(e) => setValue(e.target.value)} className="h-7 text-xs rounded-xl border-brand-100 focus:ring-brand-500 shadow-none font-bold" placeholder={field.placeholder}/>
                                            ) : (
                                                <Select value={value} onValueChange={setValue}>
                                                    <SelectTrigger className="h-7 text-xs rounded-xl border-brand-100 focus:ring-brand-500 shadow-none font-bold">
                                                        <SelectValue placeholder="Select..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-brand-100 shadow-xl">
                                                        {field.options?.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs font-bold py-1.5">{opt.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            <Button size="sm" onClick={() => handleSave(field.key)} disabled={isUpdating || !value} className="bg-brand-600 hover:bg-indigo-700 h-7 w-7 p-0 shrink-0 shadow-lg shadow-brand-500/20">
                                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => { setEditingField(field.key); setValue(data[field.key]?.toString() || ''); }} className="flex items-center justify-between group text-left w-full">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                                                <Icon className="w-3 h-3 text-gray-400 group-hover:text-brand-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{field.label}</span>
                                                <span className="text-[10px] font-bold uppercase text-amber-600">MISSING</span>
                                            </div>
                                        </div>
                                        <Plus className="w-3.5 h-3.5 text-gray-200 group-hover:text-amber-500 transition-colors" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
