'use client';
import React, { useState } from 'react';
import { useAgencyAlerts } from '@/hooks/use-agency-alerts';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Trash2, Plus, Mail, ShieldCheck, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sparkles, Globe, Building2, MapPin, ChevronRight } from 'lucide-react';

const ALERT_TEMPLATES = [
    {
        id: 'titles',
        name: 'Role Pulse',
        description: 'Laser-focused monitoring for specific matched job titles.',
        icon: Sparkles,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        getCriteria: (c: any) => ({
            job_titles: c.extracted_data.recommended_job_titles || [c.extracted_data.position],
            location: 'Any Canada'
        })
    },
    {
        id: 'nocs',
        name: 'NOC Specific',
        description: 'Monitor all job listings strictly matching candidate NOC codes.',
        icon: ShieldCheck,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        getCriteria: (c: any) => ({
            noc_codes: c.extracted_data.recommended_noc_codes || [c.extracted_data.noc_code],
            location: 'Any Canada'
        })
    },
    {
        id: 'employer',
        name: 'Employer Watch',
        description: 'Strictly monitor new listings from target database employers.',
        icon: Building2,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        getCriteria: (c: any) => ({
            employers: c.extracted_data.recommended_employers || [],
        })
    },
    {
        id: 'regional',
        name: 'Regional Pulse',
        description: 'Focused monitoring for all roles in preferred provinces/cities.',
        icon: MapPin,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        getCriteria: (c: any) => ({
            location: c.extracted_data.location || 'Any Canada'
        })
    }
];

interface ClientAlertsProps {
  client: any;
}

export function ClientAlerts({ client }: ClientAlertsProps) {
  const { alerts, isLoading, toggleAlert, deleteAlert, createAlert } = useAgencyAlerts(client.urn);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // New alert form state
  const [alertName, setAlertName] = useState(`Match Alert: ${client.full_name}`);
  const [frequency, setFrequency] = useState('daily');
  const [activeCriteria, setActiveCriteria] = useState<any>(null);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-gray-400 font-bold flex flex-col items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
        Syncing alerts...
    </div>;
  }

  const handleTemplateSelect = (template: typeof ALERT_TEMPLATES[0]) => {
    const criteria = template.getCriteria(client);
    setActiveCriteria(criteria);
    setAlertName(`${template.name}: ${client.full_name}`);
    setIsOpen(true);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
        // Use activeCriteria if set (from template), else default logic
        const criteria = activeCriteria || {
            job_titles: client.extracted_data.recommended_job_titles || [client.extracted_data.position],
            noc_codes: client.extracted_data.recommended_noc_codes || [client.extracted_data.noc_code],
            location: client.extracted_data.location
        };

        const result = await createAlert({
            name: alertName,
            criteria,
            frequency,
            clientUrn: client.urn
        });

        if (result.success) {
            toast({ title: "Alert Created", description: "You will be notified of new matches." });
            setIsOpen(false);
        } else {
            throw new Error("Failed to save alert");
        }
    } catch (err) {
        toast({ variant: "destructive", title: "Creation Failed", description: "Internal database error." });
    } finally {
        setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-600" />
                Job Match Alerts
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5 font-bold">Automatic monitoring for new jobs matching this candidate.</p>
        </div>
        <Button 
            size="sm" 
            onClick={() => {
                setActiveCriteria(null);
                setAlertName(`Match Alert: ${client.full_name}`);
                setIsOpen(true);
            }}
            className="bg-brand-600 rounded-xl text-[10px] font-bold h-8 hover:bg-brand-700 transition-all shadow-sm shadow-brand-500/10"
        >
            <Plus className="w-3 h-3 mr-1.5" />
            Create Alert
        </Button>
      </div>

      {/* Smart Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-2 pt-1">
        {ALERT_TEMPLATES.map(template => (
            <Card 
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="p-3 border-gray-100 hover:border-brand-200 transition-all cursor-pointer group bg-white/50 border-dashed"
            >
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className={cn("p-1.5 rounded-xl shrink-0", template.bg, template.color)}>
                            <template.icon className="w-3.5 h-3.5" />
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-brand-500 transition-colors" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">{template.name}</h4>
                        <p className="text-[9px] text-gray-400 font-bold leading-tight mt-0.5">{template.description}</p>
                    </div>
                </div>
            </Card>
        ))}
      </div>

      {/* Create Alert Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-xl border-gray-100 shadow-2xl">
            <DialogHeader>
                <DialogTitle className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Configure New Alert
                </DialogTitle>
                <DialogDescription className="text-[10px] text-gray-400">
                    Define preferences for automated candidate matching.
                </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Alert Identifier</Label>
                    <Input 
                        value={alertName}
                        onChange={(e) => setAlertName(e.target.value)}
                        className="rounded-xl border-gray-100 text-[11px] font-bold focus:ring-1 focus:ring-brand-500 h-9"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Notification Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger className="rounded-xl border-gray-100 text-[11px] font-bold h-9">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100">
                            <SelectItem value="instant" className="text-[11px] font-bold">Instant Notifications</SelectItem>
                            <SelectItem value="daily" className="text-[11px] font-bold">Daily Digest</SelectItem>
                            <SelectItem value="weekly" className="text-[11px] font-bold">Weekly Summary</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 space-y-2.5">
                    <p className="text-[9px] uppercase font-bold text-gray-400">Targeting Summary</p>
                    <div className="max-h-[120px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                        {/* Job Titles - Only if specifically targeted */}
                        {activeCriteria?.job_titles && (
                            <div className="flex flex-wrap gap-1.5">
                                {activeCriteria.job_titles.filter(Boolean).map((t: string) => (
                                    <Badge key={t} variant="outline" className="bg-white text-[9px] border-indigo-100 text-indigo-700 font-bold uppercase truncate max-w-[180px] rounded-xl">
                                        <Sparkles className="w-2.5 h-2.5 mr-1 text-indigo-400" /> {t}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* NOC Codes - Only if specifically targeted */}
                        {activeCriteria?.noc_codes && (
                            <div className="flex flex-wrap gap-1.5">
                                {activeCriteria.noc_codes.filter(Boolean).map((n: string | number) => (
                                    <Badge key={n} variant="outline" className="bg-white text-[9px] border-amber-100 text-amber-900 font-bold uppercase rounded-xl">
                                        <ShieldCheck className="w-2.5 h-2.5 mr-1 text-amber-500" /> NOC {n}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Location / Employers */}
                        <div className="flex flex-wrap gap-1.5">
                            {activeCriteria?.location && (
                                <Badge variant="outline" className="bg-emerald-50 text-[9px] border-emerald-200 text-emerald-700 font-bold uppercase rounded-xl">
                                    <MapPin className="w-2.5 h-2.5 mr-1" /> {activeCriteria.location}
                                </Badge>
                            )}
                            {activeCriteria?.employers?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {activeCriteria.employers.map((emp: string) => (
                                        <Badge key={emp} variant="outline" className="bg-slate-50 text-slate-700 text-[9px] border-slate-200 font-bold uppercase truncate max-w-[150px] rounded-xl">
                                            <Building2 className="w-2.5 h-2.5 mr-1 text-slate-400" /> {emp}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fallback for 'Manual/Legacy' alerts with no activeCriteria yet */}
                        {!activeCriteria && (
                            <p className="text-[10px] text-gray-400">Configure targeting details above...</p>
                        )}
                    </div>
                </div>
            </div>

            <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl text-[10px] font-bold h-9">Cancel</Button>
                <Button 
                    onClick={handleCreate} 
                    disabled={isCreating}
                    className="bg-brand-600 rounded-xl text-[10px] font-bold h-9 flex-1 shadow-md shadow-brand-500/10"
                >
                    {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save & Activate"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3">
        <AnimatePresence>
            {alerts.map((alert) => (
                <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <Card className="p-4 border-gray-100 shadow-sm flex items-center justify-between hover:border-brand-100 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${alert.is_active ? "bg-brand-50 text-brand-600" : "bg-gray-50 text-gray-400"}`}>
                                {alert.is_active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-[11px] font-bold text-gray-900">{alert.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded-xl">
                                        {alert.frequency}
                                    </span>
                                    <span className="text-[9px] text-gray-400">•</span>
                                    <div className="flex items-center gap-1 text-[9px] text-brand-600 font-bold">
                                         <Mail className="w-2.5 h-2.5" />
                                         digest_active
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch 
                                    checked={alert.is_active} 
                                    onCheckedChange={() => toggleAlert(alert.id, alert.is_active)}
                                    className="data-[state=checked]:bg-brand-600 shadow-none border-gray-200"
                                />
                            </div>
                            <button 
                                onClick={() => deleteAlert(alert.id)}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </AnimatePresence>
        
        {alerts.length === 0 && (
            <Card className="p-8 border-dashed border-2 border-gray-100 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50/20">
                <ShieldCheck className="w-8 h-8 text-gray-200" />
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-900">Automate your search</p>
                    <p className="text-[10px] text-gray-400 max-w-[200px]">Create an alert to get notified every time a job matches this candidate's profile.</p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsOpen(true)}
                    className="border-brand-200 text-brand-600 hover:bg-brand-50 rounded-xl text-[10px] font-bold h-8"
                >
                    Setup First Alert
                </Button>
            </Card>
        )}
      </div>
    </div>
  );
}
