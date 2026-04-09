'use client';

import React from 'react';
import db from '@/db';
import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Download,
  History,
  BadgeCheck,
  Zap,
  Star,
  Info,
  LineChart,
  Target,
  Bell,
  CheckCircle2,
  FileUser,
  RefreshCw,
  Edit,
  Save,
  Loader2,
  Send,
  X as CloseIcon
} from 'lucide-react';
import { AgencyTab } from '@/context/agency-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAgencyClients } from '@/hooks/use-agency-clients';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { motion } from 'framer-motion';
import { calculateCandidateScore, getScoreLabel } from '@/lib/utils/scoring_utils';
import { cn } from '@/lib/utils';

// New Modules
import { ClientApplications } from './modules/client-applications';
import { ClientMatches } from './modules/client-matches';
import { ClientStrategy } from './modules/client-strategy';
import { ClientAlerts } from './modules/client-alerts';
import { ClientOutreach } from './modules/client-outreach';
import { ClientScorecard } from './modules/client-scorecard';
import { useAgencyProfile } from '@/hooks/use-agency-profile';
import { useSession } from '@/hooks/use-session';

export const PIPELINE_STATUSES = [
    'pre-screening',
    'marketing',
    'interviewing',
    'offered',
    'placed',
    'rejected'
] as const;

export type PipelineStatus = typeof PIPELINE_STATUSES[number];

export const STATUS_CONFIG: Record<PipelineStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
    'pre-screening': { label: 'Pre-screening', color: 'text-gray-600',   bg: 'bg-gray-50',    border: 'border-gray-200',   dot: 'bg-gray-400' },
    'marketing':     { label: 'Marketing',     color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-100',   dot: 'bg-blue-500' },
    'interviewing':  { label: 'Interviewing',  color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-100',  dot: 'bg-amber-500' },
    'offered':       { label: 'Offer Stage',   color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-100', dot: 'bg-violet-500' },
    'placed':        { label: 'Placed',        color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-100',  dot: 'bg-green-500' },
    'rejected':      { label: 'Rejected',      color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-100',    dot: 'bg-red-500' },
};

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ClientDetailViewProps {
  tab: AgencyTab;
}

export function ClientDetailView({ tab }: ClientDetailViewProps) {
  const { clients, updateClient, isUpdating } = useAgencyClients();
  const client = clients?.find(c => c.id === tab.id) || tab.data;
  
  const data = client?.extracted_data || {};
  const score = calculateCandidateScore(data);
  const label = getScoreLabel(score);

  if (!client) {
    return (
      <div className="p-10 text-center text-gray-500 text-sm">
        No client data available.
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const [isReanalyzing, setIsReanalyzing] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = React.useState(false);
  const [editedClient, setEditedClient] = React.useState(client);
  const { toast } = useToast();
  const { session } = useSession();
  const { profile: agencyProfile } = useAgencyProfile();

  React.useEffect(() => {
    setEditedClient(client);
  }, [client]);

  const handleSave = async () => {
    try {
        const { id, agency_id, urn, created_at, ...updates } = editedClient;
        await updateClient({
            id: client.id,
            updates: updates
        });
        setIsEditing(false);
    } catch (err: any) {
        // Mutation error handled by hook
    }
  };

  const updateExtractedField = (field: string, value: any) => {
    setEditedClient((prev: any) => ({
        ...prev,
        extracted_data: {
            ...(prev.extracted_data || {}),
            [field]: value
        }
    }));
  };

  const handleReanalyze = async () => {
    if (!client.id || !client.resume_url) return;
    
    setIsReanalyzing(true);
    try {
        // Get the session to include the access token in headers for robust auth
        const { data: { session } } = await db.auth.getSession();

        const response = await fetch('/api/agency/reanalyze-resume', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({ clientId: client.id, resumeUrl: client.resume_url })
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Re-analysis failed');
        
        toast({
            title: 'Analysis Complete',
            description: 'Candidate profile has been successfully updated with new data.',
        });

        // Trigger a global refresh to update all views
        window.location.reload(); 
    } catch (err: any) {
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: err.message,
        });
    } finally {
        setIsReanalyzing(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {/* Client Header Info - Condensed */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 relative"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
          <div className="w-14 h-14 bg-brand-600 rounded-xl flex items-center justify-center text-white text-xl font-bold uppercase shadow-md shadow-brand-500/10">
            {client.full_name?.[0] || '?'}
          </div>
          
          <div className="flex-1 space-y-3 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input 
                     value={editedClient.full_name || ''} 
                     onChange={(e) => setEditedClient({...editedClient, full_name: e.target.value})}
                     className="h-8 text-base font-bold w-64 bg-white/50 border-brand-100 focus:border-brand-500 transition-all rounded-lg"
                     placeholder="Full Name"
                  />
                </div>
              ) : (
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{client.full_name}</h2>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-brand-50 text-brand-600 border-brand-100 uppercase text-[10px] tracking-wider font-bold h-5 px-2 whitespace-nowrap shrink-0">
                  {client.urn}
                </Badge>
                
                <Select 
                    value={client.status || 'pre-screening'} 
                    onValueChange={(val) => updateClient({ id: client.id, updates: { status: val } })}
                >
                    <SelectTrigger className={cn(
                        "h-6 min-w-[120px] text-[10px] font-bold uppercase tracking-wider rounded-lg border px-2.5 transition-all shadow-none focus:ring-0",
                        STATUS_CONFIG[client.status as PipelineStatus]?.bg || 'bg-gray-50',
                        STATUS_CONFIG[client.status as PipelineStatus]?.color || 'text-gray-600',
                        STATUS_CONFIG[client.status as PipelineStatus]?.border || 'border-gray-200'
                    )}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                        {PIPELINE_STATUSES.map(status => (
                            <SelectItem key={status} value={status} className="text-[11px] font-bold uppercase tracking-tight py-2 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CONFIG[status as PipelineStatus].dot)} />
                                    {STATUS_CONFIG[status as PipelineStatus].label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="max-w-3xl">
              {isEditing ? (
                <Textarea 
                   value={editedClient.extracted_data?.bio || ''} 
                   onChange={(e) => updateExtractedField('bio', e.target.value)}
                   className="text-xs min-h-[80px] leading-relaxed p-3 bg-white/50 border-brand-100 focus:border-brand-500 rounded-xl resize-none"
                   placeholder="Enter a professional summary for the candidate..."
                   rows={3}
                />
              ) : (
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 italic">
                  "{data.bio || "No professional summary available."}"
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 pt-1">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-600">
                <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5 text-brand-600" />
                </div>
                {isEditing ? (
                  <Input 
                    value={editedClient.email || ''} 
                    onChange={(e) => setEditedClient({...editedClient, email: e.target.value})}
                    className="h-7 text-[10px] w-40 bg-white/50 border-brand-100"
                    placeholder="Email Address"
                  />
                ) : (
                  <span className="truncate max-w-[150px]">{client.email || 'N/A'}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-600">
                <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-brand-600" />
                </div>
                {isEditing ? (
                  <Input 
                    value={editedClient.phone || ''} 
                    onChange={(e) => setEditedClient({...editedClient, phone: e.target.value})}
                    className="h-7 text-[10px] w-40 bg-white/50 border-brand-100"
                    placeholder="Phone Number"
                  />
                ) : (
                  <span>{client.phone || 'N/A'}</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-600">
                <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                </div>
                {isEditing ? (
                  <Input 
                    value={editedClient.extracted_data?.location || ''} 
                    onChange={(e) => updateExtractedField('location', e.target.value)}
                    className="h-7 text-[10px] w-40 bg-white/50 border-brand-100"
                    placeholder="Toronto, ON"
                  />
                ) : (
                  <span>{data.location || 'N/A'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col justify-center md:justify-start gap-2">
            {!isEditing ? (
                <>
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-[10px] font-bold h-9 px-4 transition-all gap-2"
                    >
                        <Edit className="w-3.5 h-3.5" /> Edit Profile
                    </Button>
                    {client.resume_url && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleReanalyze}
                            disabled={isReanalyzing}
                            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-[10px] font-bold h-9 px-4 transition-all gap-2"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isReanalyzing && "animate-spin")} />
                            {isReanalyzing ? 'Re-Analyze' : 'Re-Analyze'}
                        </Button>
                    )}
                </>
            ) : (
                <>
                    <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-[10px] font-bold h-9 px-4 transition-all gap-2 shadow-md shadow-brand-500/20"
                    >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => { setIsEditing(false); setEditedClient(client); }}
                        className="text-gray-500 hover:bg-gray-100 rounded-xl text-[10px] font-bold h-9 px-4 transition-all gap-2"
                    >
                        <CloseIcon className="w-3.5 h-3.5" /> Cancel
                    </Button>
                </>
            )}
            <div className="flex gap-2">
                {client.resume_url && (
                    <Button size="sm" className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm text-[10px] font-bold h-9 px-3 transition-all flex-1">
                        <a href={client.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <Download className="w-3.5 h-3.5" /> Resume
                        </a>
                    </Button>
                )}
                <Button 
                   size="sm" 
                   variant="outline" 
                   onClick={() => setIsScorecardOpen(true)}
                   className="border-gray-200 rounded-xl text-[10px] font-bold h-9 px-3 text-gray-600 hover:bg-gray-50 flex-1"
                >
                    Scorecard
                </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CASE MANAGEMENT HIGHER LEVEL TABS */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-gray-100/50 p-1 rounded-xl w-full justify-start gap-1 mb-4 border border-gray-100 h-11">
          <TabsTrigger value="profile" className="flex-1 max-w-[140px] rounded-lg h-9 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-tight transition-all gap-1.5 text-gray-500">
            <FileUser className="w-3.5 h-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex-1 max-w-[140px] rounded-lg h-9 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-tight transition-all gap-1.5 text-gray-500">
            <Target className="w-3.5 h-3.5" /> Lab
          </TabsTrigger>
          <TabsTrigger value="track" className="flex-1 max-w-[140px] rounded-lg h-9 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-tight transition-all gap-1.5 text-gray-500">
            <LineChart className="w-3.5 h-3.5" /> Track
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex-1 max-w-[140px] rounded-lg h-9 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-tight transition-all gap-1.5 text-gray-500">
            <Send className="w-3.5 h-3.5" /> Marketing
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex-1 max-w-[140px] rounded-lg h-9 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-tight transition-all gap-1.5 text-gray-500">
            <Bell className="w-3.5 h-3.5" /> Alerts
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex-1 max-w-[140px] rounded-lg h-9 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-tight transition-all gap-1.5 text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5" /> Strategy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
           <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-transparent h-auto p-0 w-full justify-start gap-2 mb-4">
                <TabsTrigger value="overview" className="rounded-lg h-8 px-3 data-[state=active]:bg-brand-600 data-[state=active]:text-white font-bold text-[10px] uppercase tracking-wider transition-all gap-1.5 border border-transparent data-[state=active]:border-brand-600 text-gray-400">
                    Overview
                </TabsTrigger>
                <TabsTrigger value="experience" className="rounded-lg h-8 px-3 data-[state=active]:bg-brand-600 data-[state=active]:text-white font-bold text-[10px] uppercase tracking-wider transition-all gap-1.5 border border-transparent data-[state=active]:border-brand-600 text-gray-400">
                    History
                </TabsTrigger>
                <TabsTrigger value="education" className="rounded-lg h-8 px-3 data-[state=active]:bg-brand-600 data-[state=active]:text-white font-bold text-[10px] uppercase tracking-wider transition-all gap-1.5 border border-transparent data-[state=active]:border-brand-600 text-gray-400">
                    Education
                </TabsTrigger>
                <TabsTrigger value="skills" className="rounded-lg h-8 px-3 data-[state=active]:bg-brand-600 data-[state=active]:text-white font-bold text-[10px] uppercase tracking-wider transition-all gap-1.5 border border-transparent data-[state=active]:border-brand-600 text-gray-400">
                    Skills
                </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 border-gray-100 rounded-xl shadow-sm md:col-span-3 space-y-4">
                        <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <BadgeCheck className="w-4 h-4 text-brand-600" />
                            Key Qualifications
                        </h3>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                            <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Exp. Total</p>
                            <p className="text-sm font-bold text-gray-800">{data.experience || '0'} Years</p>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                            <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Top Title</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{data.position || 'Unknown'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                            <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Location Pref.</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{data.location || 'Any'}</p>
                        </div>
                        </div>

                        <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-900">Latest Experience Overview</h3>
                        <div className="p-3 border border-brand-50 bg-brand-50/10 rounded-lg relative overflow-hidden group">
                            <Building2 className="absolute top-[-5px] right-[-5px] w-12 h-12 text-brand-500/5 group-hover:scale-110 transition-transform duration-500" />
                            <p className="text-xs font-bold text-gray-900 mb-1">{data.position} <span className="text-gray-400">at</span> {data.company}</p>
                            <p className="text-[11px] text-gray-500 leading-relaxed italic line-clamp-3">
                                {data.work_experience?.[0]?.split('): ')[1] || 'No detailed description available.'}
                            </p>
                        </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center justify-between w-full">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Candidate Score</h3>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-brand-50 hover:text-brand-600 transition-colors">
                                        <Info className="w-3.5 h-3.5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent side="top" align="end" className="w-64 p-4 rounded-xl border-gray-100 shadow-xl bg-white/95 backdrop-blur-sm">
                                    <h4 className="text-xs font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Scoring Metrics Breakdown</h4>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500">Experience Years</span>
                                            <span className="font-bold text-brand-600">40%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500">Skill Density</span>
                                            <span className="font-bold text-brand-600">20%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500">Profile Completeness</span>
                                            <span className="font-bold text-brand-600">20%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500">Record Depth</span>
                                            <span className="font-bold text-brand-600">20%</span>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-[9px] text-gray-400 italic leading-snug">
                                        Score represents automated readiness for Canadian professional placement.
                                    </p>
                                </PopoverContent>
                            </Popover>
                        </div>
                        
                        <div className="relative inline-block">
                            <svg className="w-20 h-20 transform -rotate-90">
                            <circle className="text-gray-100" strokeWidth="6" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" />
                            <circle className="text-brand-600" strokeWidth="6" strokeDasharray={213.6} strokeDashoffset={213.6 * (1 - score / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-bold text-gray-900">{score}%</span>
                            </div>
                        </div>
                        <div className="text-center w-full space-y-1">
                        <p className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block", 
                            score >= 75 ? "bg-green-100 text-green-700" : "bg-brand-50 text-brand-600")}>
                            {label}
                        </p>
                        <p className="text-[9px] text-gray-400 font-medium">Automatic Assessment</p>
                        </div>
                    </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="experience">
                    <Card className="p-6 border-gray-100 rounded-xl shadow-sm">
                        <h3 className="text-md font-bold text-gray-900 mb-6">Detailed Work History</h3>
                        <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                        {(data.work_experience || []).map((exp: string, i: number) => {
                            const parts = exp.split('): ');
                            const main = parts[0]?.split(' at ');
                            const role = main?.[0] || 'Role';
                            const rest = main?.[1]?.split(' (');
                            const company = rest?.[0] || 'Company';
                            const date = rest?.[1] || 'Period';
                            const desc = parts[1] || '';

                            return (
                                <motion.div key={i} variants={itemVariants} className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-2 border-brand-500 rounded-full z-10" />
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-tight">{role}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-50 rounded text-gray-400">{date.replace(')', '')}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-brand-600/80">{company}</p>
                                    <p className="text-[10px] text-gray-500 leading-normal line-clamp-4 pt-1">
                                        {desc}
                                    </p>
                                </div>
                                </motion.div>
                            );
                        })}
                        {(data.work_experience || []).length === 0 && (
                            <div className="py-4 text-center text-gray-400 text-xs">No experience found.</div>
                        )}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="education">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(data.education || []).map((edu: string, i: number) => {
                        const parts = edu.split('): ');
                        const main = parts[0]?.split(' at ');
                        const degree = main?.[0] || 'Degree';
                        const rest = main?.[1]?.split(' (');
                        const school = rest?.[0] || 'Institution';
                        const date = rest?.[1] || 'Period';
                        const desc = parts[1] || '';

                        return (
                            <Card key={i} className="p-4 border-gray-100 rounded-xl shadow-sm hover:border-brand-100 transition-all flex gap-3 h-fit">
                                <div className="p-2 bg-brand-50 rounded-lg text-brand-600 h-fit">
                                <GraduationCap className="w-4 h-4" />
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">{degree}</h4>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{date.replace(')', '')}</span>
                                </div>
                                <p className="text-[11px] font-bold text-gray-600">{school}</p>
                                <p className="text-[10px] text-gray-400 leading-snug pt-1 line-clamp-2 italic">
                                    {desc}
                                </p>
                                </div>
                            </Card>
                        );
                    })}
                    {(data.education || []).length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-400 text-xs">No education records.</div>
                    )}
                    </motion.div>
                </TabsContent>

                <TabsContent value="skills">
                    <Card className="p-6 border-gray-100 rounded-xl shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Extracted Skills</h3>
                        {isEditing ? (
                            <Textarea 
                                value={editedClient.extracted_data?.skills || ""} 
                                onChange={(e) => updateExtractedField('skills', e.target.value)}
                                className="text-sm min-h-[120px]"
                                placeholder="Enter skills separated by commas..."
                            />
                        ) : (
                            <div className="flex flex-wrap justify-center gap-2">
                            {(data.skills || "").split(',').map((skill: string, i: number) => (
                                <div 
                                    key={i} 
                                    className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-600 hover:border-brand-200 hover:text-brand-600 transition-all cursor-default"
                                >
                                    {skill.trim()}
                                </div>
                            ))}
                            </div>
                        )}
                    </Card>
                </TabsContent>
           </Tabs>
        </TabsContent>

        <TabsContent value="matches" className="m-0 focus-visible:outline-none">
          <ClientMatches 
            key={`${client.id}-${JSON.stringify(client.extracted_data)}`}
            clientId={client.id} 
            extractedData={client.extracted_data} 
          />
        </TabsContent>

        <TabsContent value="track" className="mt-0 focus-visible:outline-none">
            <ClientApplications clientUrn={client.urn} />
        </TabsContent>

        <TabsContent value="marketing" className="mt-0 focus-visible:outline-none">
            <ClientOutreach client={client} />
        </TabsContent>

        <TabsContent value="alerts" className="mt-0 focus-visible:outline-none">
            <ClientAlerts client={client} />
        </TabsContent>

        <TabsContent value="strategy" className="mt-0 focus-visible:outline-none">
            <ClientStrategy client={client} />
        </TabsContent>
      </Tabs>

      <ClientScorecard 
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        client={client}
        agencyProfile={agencyProfile}
      />
    </div>
  );
}
