'use client';

import React, { useState } from 'react';
import { 
    AlertCircle, 
    Plus, 
    Save, 
    X, 
    CheckCircle2, 
    BrainCircuit,
    ChevronRight,
    Loader2
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
import { Badge } from '@/components/ui/badge';
import { AgencyClient } from '@/lib/api/agency';
import { useAgencyClients } from '@/hooks/use-agency-clients';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ClientProfileGapsProps {
    client: AgencyClient;
}

const CRITICAL_FIELDS = [
    { key: 'age', label: 'Age', type: 'number', placeholder: 'e.g., 28' },
    { key: 'experience_years', label: 'Work Experience', type: 'number', placeholder: 'Total years' },
    { 
        key: 'education_level', 
        label: 'Education', 
        type: 'select', 
        options: [
            { label: 'Secondary / High School', value: 'high_school' },
            { label: 'Trade / Diploma', value: 'diploma' },
            { label: 'Bachelors Degree', value: 'bachelors' },
            { label: 'Masters Degree', value: 'masters' },
            { label: 'PhD / Doctoral', value: 'phd' }
        ]
    },
    { 
        key: 'language_clb', 
        label: 'English (CLB)', 
        type: 'select', 
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
        key: 'noc_teer', 
        label: 'NOC TEER Level', 
        type: 'select', 
        options: [
            { label: 'TEER 0 (Management)', value: '0' },
            { label: 'TEER 1 (Professional)', value: '1' },
            { label: 'TEER 2 (Technical)', value: '2' },
            { label: 'TEER 3 (Admin/Trade)', value: '3' },
            { label: 'TEER 4 (Intermediate)', value: '4' },
            { label: 'TEER 5 (Labour)', value: '5' }
        ]
    },
    { 
        key: 'job_offer', 
        label: 'Canadian Job Offer', 
        type: 'select', 
        options: [
            { label: 'Yes (Valid Offer)', value: 'yes' },
            { label: 'No (N/A)', value: 'no' }
        ]
    }
];

export function ClientProfileGaps({ client }: ClientProfileGapsProps) {
    const { updateClient, isUpdating } = useAgencyClients();
    const { toast } = useToast();
    const [editingField, setEditingField] = useState<string | null>(null);
    const [value, setValue] = useState('');

    const data = client.extracted_data || {};
    
    // Logic to detect gaps
    const gaps = CRITICAL_FIELDS.filter(f => !data[f.key]);

    const handleSave = async (key: string) => {
        try {
            const updatedData = {
                ...data,
                [key]: value
            };

            await updateClient({
                id: client.id,
                updates: { extracted_data: updatedData }
            });

            toast({
                title: "Profile Updated",
                description: `Successfully added ${key.replace('_', ' ')}.`,
            });
            setEditingField(null);
            setValue('');
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not save the profile detail.'
            });
        }
    };

    if (gaps.length === 0) return null;

    return (
        <Card className="border-amber-100 bg-amber-50/30 shadow-none overflow-hidden h-full">
            <div className="bg-amber-100/50 px-4 py-2 border-b border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Auto-Scoring Blocks</span>
                </div>
                <Badge className="bg-white text-amber-700 border-amber-200 text-[8px] font-black h-4 px-1.5 flex items-center gap-1">
                    <BrainCircuit className="w-2.5 h-2.5" />
                    {gaps.length} GAPS
                </Badge>
            </div>
            <CardContent className="p-3 space-y-2">
                <p className="text-[10px] text-amber-700/70 font-bold leading-tight">
                    Add these details to unlock automatic eligibility scoring for this candidate.
                </p>

                <div className="space-y-1.5">
                    {gaps.map((gap) => (
                        <div key={gap.key} className="p-2 bg-white rounded-lg border border-amber-100/50 flex flex-col gap-2">
                            {editingField === gap.key ? (
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-2 duration-200">
                                    <Label className="text-[9px] font-black uppercase tracking-tighter text-gray-400">{gap.label}</Label>
                                    <div className="flex gap-1.5">
                                        {gap.type === 'number' ? (
                                            <Input 
                                                autoFocus
                                                type="number"
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                                className="h-7 text-xs rounded-md border-amber-200 bg-amber-50/20 focus:ring-amber-500"
                                                placeholder={gap.placeholder}
                                            />
                                        ) : (
                                            <Select value={value} onValueChange={setValue}>
                                                <SelectTrigger className="h-7 text-xs rounded-md border-amber-200 bg-amber-50/20 focus:ring-amber-500">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-amber-100 shadow-xl">
                                                    {gap.options?.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium py-1.5">
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleSave(gap.key)}
                                            disabled={isUpdating || !value}
                                            className="bg-brand-600 hover:bg-brand-700 h-7 w-7 p-0 shrink-0"
                                        >
                                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => setEditingField(null)}
                                            className="h-7 w-7 p-0 shrink-0 text-gray-400"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => { setEditingField(gap.key); setValue(''); }}
                                    className="flex items-center justify-between group text-left w-full"
                                >
                                    <span className="text-[10px] font-bold text-gray-700 group-hover:text-amber-600 transition-colors">{gap.label}</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[9px] font-black text-amber-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Add Detail</span>
                                        <Plus className="w-3 h-3 text-amber-500" />
                                    </div>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
