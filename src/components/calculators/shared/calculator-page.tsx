import React, { useState } from 'react';
import { StatsSection, StatItemConfig } from '@/components/ui/stats-crs';
import { GenericCalculatorBreakdownTable, PointsSection } from '@/components/ui/table-component-calculator';
import { FeatureListWithCheckMark, Feature } from '@/components/ui/feature-list-with-checkmark';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';

export interface FormField {
    key: string;
    label: string;
    description?: React.ReactNode;
    type: 'input' | 'select';
    options?: { label: string; value: string }[];
}

export interface CalculatorConfig {
    id: string;
    title: string;
    description: string;
    badgeText: string;
    stats: StatItemConfig[];
    formPages: FormField[][];
    breakdownSections: PointsSection[];
    features: Feature[];
    calculate: (values: any) => { total: number; breakdown: any };
}

interface CalculatorPageProps {
    config: CalculatorConfig;
    initialData?: any;
    clientId?: string;
    userId?: string;
    onComplete?: (score: number) => void;
}

export function CalculatorPage({ config, initialData, clientId, userId, onComplete }: CalculatorPageProps) {
    const [page, setPage] = useState(0);
    const [values, setValues] = useState<Record<string, string>>(() => {
        const flat = config.formPages.flat();
        const base = Object.fromEntries(flat.map(f => [f.key, '']));
        return { ...base, ...initialData };
    });
    
    const [result, setResult] = useState<{ total: number; breakdown: any } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const currentFields = config.formPages[page];
    const isPageValid = currentFields.every(f => values[f.key] && values[f.key] !== '');
    const progress = Math.round((page / (config.formPages.length - 1)) * 100);

    const handleFieldChange = (key: string, value: string) => {
        setValues(prev => ({ ...prev, [key]: value }));
    };

    const handleCalculate = async () => {
        const res = config.calculate(values);
        setResult(res);
        setIsSaving(true);

        try {
            const { error } = await (db as any).from('calculator_results').insert({
                user_id: userId,
                client_id: clientId,
                calculator_type: config.id,
                score: res.total,
                inputs: values,
                breakdown: res.breakdown
            });

            if (error) throw error;
            
            toast({
                title: "Calculation Saved",
                description: `Successfully evaluated ${config.title} score.`,
            });
            
            if (onComplete) onComplete(res.total);
        } catch (err) {
            console.error('Save error:', err);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "The calculation was performed but we couldn't save it to the database.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-2 pb-20 w-full">
            <div className="flex flex-col items-start gap-2">
                <Card className="w-full border-gray-100 shadow-none border rounded-xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-50 px-4 py-2 bg-gray-50/10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <Badge className="bg-brand-50 text-brand-700 border-brand-200 px-1.5 py-0 rounded-full text-[8px] font-black uppercase tracking-wider mb-1">
                                    {config.badgeText}
                                </Badge>
                                <CardTitle className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    {config.title} Evaluation Hub
                                </CardTitle>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {config.stats.slice(0, 3).map((stat, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                        <div className={cn("w-5 h-5 rounded flex items-center justify-center", stat.bgColor)}>
                                            <span className="text-[8px] font-bold">{(stat.icon as string).charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black leading-none text-gray-900">{stat.value}{stat.suffix}</p>
                                            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">{stat.label.split(' ')[0]}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-[8px] font-black text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50">
                                    PG {page + 1}/{config.formPages.length}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            <div className="w-full bg-gray-50 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>

                            <AnimatePresence mode="wait">
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-3 min-h-[120px]">
                                    {currentFields.map((field) => (
                                        <div key={field.key} className="space-y-1">
                                            <Label className="text-[10px] font-bold text-gray-500 tracking-tight flex justify-between uppercase">
                                                {field.label}
                                                {!values[field.key] && <span className="text-red-500">*</span>}
                                            </Label>
                                            
                                            {field.type === 'input' ? (
                                                <Input 
                                                    value={values[field.key]}
                                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                    className="rounded-md border-gray-100 h-8 text-xs focus:ring-brand-500 bg-gray-50/20"
                                                    placeholder="--"
                                                />
                                            ) : (
                                                <Select 
                                                    value={values[field.key]}
                                                    onValueChange={(v) => handleFieldChange(field.key, v)}
                                                >
                                                    <SelectTrigger className="rounded-md border-gray-100 h-8 text-xs focus:ring-brand-500 bg-gray-50/20">
                                                        <SelectValue placeholder="Select..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                                        {field.options?.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium py-1.5 focus:bg-brand-50">
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </AnimatePresence>

                            <div className="flex justify-between pt-3 border-t border-gray-50">
                                <Button 
                                    variant="ghost" 
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="rounded-md font-bold text-[9px] uppercase tracking-widest text-gray-400 h-8 px-3"
                                >
                                    Previous Stage
                                </Button>
                                {page < config.formPages.length - 1 ? (
                                    <Button 
                                        disabled={!isPageValid}
                                        onClick={() => setPage(p => p + 1)}
                                        className="bg-brand-600 hover:bg-brand-700 text-white rounded-md font-bold text-[9px] uppercase tracking-widest h-8 px-4 shadow-sm flex items-center gap-2"
                                    >
                                        Next
                                        <ArrowRight className="w-3 h-3" />
                                    </Button>
                                ) : (
                                    <Button 
                                        disabled={!isPageValid || isSaving}
                                        onClick={handleCalculate}
                                        className="bg-gray-900 hover:bg-black text-white rounded-md font-bold text-[9px] uppercase tracking-widest h-8 px-4 shadow-md flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                        Run Evaluation
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-brand-900 rounded-xl p-4 shadow-lg text-white overflow-hidden relative"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-left shrink-0">
                                <h3 className="text-brand-300 font-bold uppercase tracking-[0.2em] text-[7px] mb-0.5">Eligibility Result</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-black tracking-tighter">{result.total}</p>
                                    <p className="text-[9px] font-bold text-brand-300 uppercase">Points Evaluation</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10 hidden md:block" />
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-1.5 flex-1">
                                {Object.entries(result.breakdown).map(([key, val]: [string, any]) => (
                                    <div key={key} className="flex justify-between items-center gap-2 border-b border-white/5 py-0.5">
                                        <span className="text-[7px] font-bold uppercase text-brand-300/60 truncate max-w-[90px]">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="text-[10px] font-black">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="space-y-1 w-full mt-4">
                <GenericCalculatorBreakdownTable 
                    sections={config.breakdownSections}
                    badgeText={config.badgeText}
                    heading={`Reference Matrix`}
                    headingHighlight={config.title}
                    description={config.description}
                />

                <FeatureListWithCheckMark 
                    badgeText={`${config.title} Rules`}
                    heading="Compliance Metrics"
                    subtitle="Primary criteria for nomination selection."
                    features={config.features}
                />
            </div>
        </div>
    );
}
