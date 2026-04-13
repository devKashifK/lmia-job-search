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
  X as CloseIcon,
  Calculator,
  AlertCircle,
  BrainCircuit,
  ChevronRight,
  ClipboardList,
  Plus,
  Trash2,
  Settings2,
  Sparkles
} from 'lucide-react';
import { CanadianResumeButton } from '../dashboard/canadian-resume-button';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { ClientCalculators } from './modules/client-calculators';
import { ClientProfileGaps } from './modules/client-profile-gaps';
import { ClientChecklist } from './modules/client-checklist';
import { ClientSimulator } from './modules/client-simulator';
import { ClientPitchDeck } from './modules/client-pitch-deck';
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
  const [isItemEditorOpen, setIsItemEditorOpen] = React.useState(false);
  const [editingItemType, setEditingItemType] = React.useState<'work_experience' | 'education' | null>(null);
  const [editingItemIndex, setEditingItemIndex] = React.useState<number>(-1);
  const [itemFormData, setItemFormData] = React.useState({ role: '', company: '', date: '', desc: '' });
  
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

  const parseItem = (str: string) => {
    // Format: "Role at Company (Date): Description"
    const parts = str.split('): ');
    const main = parts[0]?.split(' at ');
    const role = main?.[0] || '';
    const rest = main?.[1]?.split(' (');
    const company = rest?.[0] || '';
    const date = (rest?.[1] || '').replace(')', '');
    const desc = parts[1] || '';
    return { role, company, date, desc };
  };

  const formatItem = (item: typeof itemFormData) => {
    return `${item.role} at ${item.company} (${item.date}): ${item.desc}`;
  };

  const openItemEditor = (type: 'work_experience' | 'education', index: number = -1) => {
    setEditingItemType(type);
    setEditingItemIndex(index);
    if (index >= 0) {
        const itemStr = editedClient.extracted_data?.[type]?.[index] || '';
        setItemFormData(parseItem(itemStr));
    } else {
        setItemFormData({ role: '', company: '', date: '', desc: '' });
    }
    setIsItemEditorOpen(true);
  };

  const saveItem = () => {
    const formatted = formatItem(itemFormData);
    const type = editingItemType!;
    const currentList = [...(editedClient.extracted_data?.[type] || [])];
    
    if (editingItemIndex >= 0) {
        currentList[editingItemIndex] = formatted;
    } else {
        currentList.unshift(formatted);
    }

    updateExtractedField(type, currentList);
    setIsItemEditorOpen(false);
  };

  const deleteItem = (type: 'work_experience' | 'education', index: number) => {
    const currentList = [...(editedClient.extracted_data?.[type] || [])];
    currentList.splice(index, 1);
    updateExtractedField(type, currentList);
    toast({
        title: 'Item Deleted',
        description: 'Profile has been updated locally. Save to persist.',
    });
  };

  return (
    <div className="p-4 w-full max-w-[1400px] mx-auto space-y-4">
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
                <CanadianResumeButton 
                  profile={{
                    full_name: client.full_name,
                    email: client.email,
                    phone: client.phone,
                    bio: data.bio,
                    skills: data.skills,
                    work_history: data.work_experience?.join('\n\n'),
                    education: data.education?.join('\n\n'),
                    location: data.location,
                    position: data.position,
                    company: data.company
                  }}
                  clientId={client.id}
                  initialData={data.canadian_resume}
                  variant="outline"
                  className="rounded-xl text-[10px] font-bold h-9 px-3 border-brand-200 text-brand-600 hover:bg-brand-50 flex-1"
                />
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
          <TabsTrigger value="calculators" className="flex-1 max-w-[140px] rounded-lg h-9 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-tight transition-all gap-1.5 text-gray-500">
            <Calculator className="w-3.5 h-3.5" /> Calculators
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex-1 max-w-[140px] rounded-lg h-9 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-tight transition-all gap-1.5 text-gray-500">
            <ClipboardList className="w-3.5 h-3.5" /> Documents
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
                        <div className="md:col-span-3 space-y-4 flex flex-col">
                            {!data.canadian_resume && (!data.location || !['canada', 'toronto', 'vancouver', 'ontario', 'bc', 'alberta', 'on', 'ab', 'qc'].some(v => data.location.toLowerCase().includes(v))) && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-brand-50/50 border border-brand-100 rounded-xl flex items-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-5 h-5 text-brand-600 animate-pulse" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-700 transition-colors">Improve Canadian Candidate Success</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            This candidate's profile is currently localized outside of Canada. To apply for Canadian roles, we recommend generating a 
                                            <span className="font-bold text-brand-600"> Canadian-standard resume</span> using our AI tool above.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="bg-white text-brand-600 border-brand-200 text-[10px] font-black uppercase">Action Needed</Badge>
                                </motion.div>
                            )}
                            <ClientProfileGaps client={client} />
                            
                            <Card className="p-4 border-gray-100 rounded-xl shadow-sm flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <BadgeCheck className="w-4 h-4 text-brand-600" />
                                        Key Qualifications
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Exp. Total</p>
                                        <p className="text-sm font-bold text-gray-800">{data.experience_years || data.experience || '0'} Years</p>
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
                        </div>

                        <Card className="p-4 border-gray-100 rounded-xl shadow-none border bg-white flex flex-col gap-4 overflow-hidden relative">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                             <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-brand-50 flex items-center justify-center">
                                    <BrainCircuit className="w-3 h-3 text-brand-600" />
                                </div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate Readiness</h3>
                             </div>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-brand-50 hover:text-brand-600 transition-colors">
                                        <Info className="w-3.5 h-3.5 text-gray-300" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent side="top" align="end" className="w-64 p-4 rounded-xl border-gray-100 shadow-xl bg-white/95 backdrop-blur-sm">
                                    <h4 className="text-xs font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Scoring Algorithm</h4>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500">Professional Tenure</span>
                                            <span className="font-bold text-brand-600">40%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500">Skill Density</span>
                                            <span className="font-bold text-brand-600">20%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500">Profile Integrity</span>
                                            <span className="font-bold text-brand-600">20%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500">Evidence Depth</span>
                                            <span className="font-bold text-brand-600">20%</span>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        
                        <div className="flex items-center gap-6 py-1">
                            <div className="relative shrink-0">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    <circle className="text-gray-50" strokeWidth="8" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                                    <circle 
                                        className={cn(
                                            "transition-all duration-1000",
                                            score >= 75 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-gray-300"
                                        )}
                                        strokeWidth="8" 
                                        strokeDasharray={238.76} 
                                        strokeDashoffset={238.76 * (1 - score / 100)} 
                                        strokeLinecap="round" 
                                        stroke="currentColor" 
                                        fill="transparent" 
                                        r="38" cx="48" cy="48" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-gray-900 tracking-tighter leading-none">{score}%</span>
                                    <span className={cn(
                                        "text-[7px] font-black uppercase tracking-widest mt-0.5",
                                        score >= 75 ? "text-green-600" : "text-gray-400"
                                    )}>{label}</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                {[
                                    { label: 'Tenure', weight: 40, val: Math.min((parseFloat(data.experience_years || data.experience) || 0) * 4, 40) },
                                    { label: 'Skills', weight: 20, val: Math.min((data.skills?.split(',').length || 0) * 2, 20) },
                                    { label: 'Data', weight: 20, val: (data.email ? 5 : 0) + (data.phone ? 5 : 0) + (data.location ? 5 : 0) + (data.bio?.length > 50 ? 5 : 0) },
                                    { label: 'Depth', weight: 20, val: Math.min((data.work_experience?.length || 0) * 5, 20) }
                                ].map((metric, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-400 tracking-tighter">
                                            <span>{metric.label}</span>
                                            <span>{Math.round((metric.val / metric.weight) * 100)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(metric.val / metric.weight) * 100}%` }}
                                                className="h-full bg-brand-600 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-gray-50">
                            {!data.language_clb || !data.noc_teer ? (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/50 border border-amber-100 group cursor-help transition-all hover:bg-amber-100/50">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-tighter leading-none">Assessment Incomplete</p>
                                        <p className="text-[8px] font-bold text-amber-600 mt-0.5">Missing NOC/CLB Evidence</p>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50/50 border border-green-100">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-tighter leading-none">High Fidelity Evaluation</p>
                                        <p className="text-[8px] font-bold text-green-600 mt-0.5">Full Prerequisite Data Sync</p>
                                    </div>
                                    <BadgeCheck className="w-3 h-3 text-green-500" />
                                </div>
                            )}
                        </div>
                    </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="experience">
                    <Card className="p-6 border-gray-100 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-md font-bold text-gray-900">Detailed Work History</h3>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 rounded-lg border-brand-100 text-brand-600 hover:bg-brand-50 gap-1.5 text-[10px] font-bold uppercase"
                                onClick={() => openItemEditor('work_experience')}
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Experience
                            </Button>
                        </div>
                        
                        <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                        {(data.work_experience || []).map((exp: string, i: number) => {
                            const { role, company, date, desc } = parseItem(exp);

                            return (
                                <motion.div key={i} variants={itemVariants} className="relative pl-6 group/item">
                                <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-2 border-brand-500 rounded-full z-10" />
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-tight">{role}</h4>
                                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                                                    onClick={() => openItemEditor('work_experience', i)}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => deleteItem('work_experience', i)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-50 rounded text-gray-400">{date}</span>
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
                            <div className="py-4 text-center text-gray-400 text-xs">No experience found. Click "Add Experience" to populate history.</div>
                        )}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="education">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Academic Background</h3>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 rounded-lg border-brand-100 text-brand-600 hover:bg-brand-50 gap-1.5 text-[10px] font-bold uppercase"
                            onClick={() => openItemEditor('education')}
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Education
                        </Button>
                    </div>
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(data.education || []).map((edu: string, i: number) => {
                        const { role: degree, company: school, date, desc } = parseItem(edu);

                        return (
                            <Card key={i} className="p-4 border-gray-100 rounded-xl shadow-sm hover:border-brand-100 transition-all flex gap-3 h-fit group/edu relative">
                                <div className="p-2 bg-brand-50 rounded-lg text-brand-600 h-fit">
                                <GraduationCap className="w-4 h-4" />
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-2 max-w-[70%]">
                                        <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">{degree}</h4>
                                        <div className="opacity-0 group-hover/edu:opacity-100 transition-opacity flex items-center shrink-0">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 text-gray-400 hover:text-brand-600"
                                                onClick={() => openItemEditor('education', i)}
                                            >
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 text-gray-400 hover:text-red-600"
                                                onClick={() => deleteItem('education', i)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{date}</span>
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
                        <div className="col-span-full py-10 text-center text-gray-400 text-xs bg-gray-50 border border-dashed border-gray-200 rounded-xl mt-4">No education records found. Click "Add Education" to start.</div>
                    )}
                    </motion.div>
                </TabsContent>

                <TabsContent value="skills">
                    <Card className="p-5 border-gray-100 rounded-xl shadow-sm bg-white overflow-hidden relative">
                        <div className="relative z-10 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-black text-gray-900 tracking-tight">Technical & Soft Skills</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">Refine the candidate's core competencies.</p>
                                </div>
                                <Badge className="bg-brand-50 text-brand-600 border-none uppercase text-[8px] font-black tracking-widest px-2 py-0.5">
                                    Inline Edit
                                </Badge>
                            </div>

                            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-xl space-y-3">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Add skill (e.g. AWS)..."
                                        className="h-9 rounded-lg bg-white border-gray-200 text-xs font-bold px-3 flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = e.currentTarget.value.trim();
                                                if (val) {
                                                    const currentSkills = (editedClient.extracted_data?.skills || "").split(',').filter(Boolean).map((s: string) => s.trim());
                                                    if (!currentSkills.some((s: string) => s.toLowerCase() === val.toLowerCase())) {
                                                        const newList = [...currentSkills, val].join(', ');
                                                        updateExtractedField('skills', newList);
                                                        toast({ title: 'Skill Added', description: `"${val}" added.` });
                                                    }
                                                    e.currentTarget.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <Button 
                                        size="sm"
                                        onClick={(e) => {
                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                            const val = input.value.trim();
                                            if (val) {
                                                const currentSkills = (editedClient.extracted_data?.skills || "").split(',').filter(Boolean).map((s: string) => s.trim());
                                                if (!currentSkills.some((s: string) => s.toLowerCase() === val.toLowerCase())) {
                                                    const newList = [...currentSkills, val].join(', ');
                                                    updateExtractedField('skills', newList);
                                                    toast({ title: 'Skill Added', description: `"${val}" added.` });
                                                }
                                                input.value = '';
                                            }
                                        }}
                                        className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 h-9 font-black text-[10px] uppercase tracking-widest"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {(editedClient.extracted_data?.skills || "").split(',').filter(Boolean).map((skill: string, i: number) => (
                                        <div 
                                            key={i} 
                                            className="group relative px-2.5 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-700 flex items-center gap-2 shadow-sm"
                                        >
                                            <div className="w-1 h-1 rounded-full bg-brand-500" />
                                            {skill.trim()}
                                            <button 
                                                onClick={() => {
                                                    const currentSkills = (editedClient.extracted_data?.skills || "").split(',').filter(Boolean).map((s: string) => s.trim());
                                                    currentSkills.splice(i, 1);
                                                    updateExtractedField('skills', currentSkills.join(', '));
                                                }}
                                                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                            >
                                                <CloseIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
           </Tabs>
        </TabsContent>

        <TabsContent value="matches" className="m-0 focus-visible:outline-none space-y-6">
          <ClientSimulator client={client} />
          <ClientMatches 
            key={`${client.id}-${JSON.stringify(client.extracted_data)}`}
            clientId={client.id} 
            clientUrn={client.urn}
            extractedData={client.extracted_data} 
          />
        </TabsContent>

        <TabsContent value="track" className="mt-0 focus-visible:outline-none">
            <ClientApplications clientUrn={client.urn} />
        </TabsContent>

        <TabsContent value="marketing" className="mt-0 focus-visible:outline-none space-y-8">
            <ClientPitchDeck client={client} />
            <div className="border-t border-gray-100 pt-8">
                <ClientOutreach client={client} />
            </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-0 focus-visible:outline-none">
            <ClientAlerts client={client} />
        </TabsContent>

        <TabsContent value="strategy" className="mt-0 focus-visible:outline-none">
          <ClientStrategy client={client} />
        </TabsContent>

        <TabsContent value="calculators" className="mt-0 focus-visible:outline-none pb-20">
          <ClientCalculators client={client} />
        </TabsContent>

        <TabsContent value="checklist" className="mt-0 focus-visible:outline-none pb-20">
          <ClientChecklist client={client} />
        </TabsContent>
      </Tabs>

      <ClientScorecard 
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        client={client}
        agencyProfile={agencyProfile}
      />

      <Dialog open={isItemEditorOpen} onOpenChange={setIsItemEditorOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
            <div className="bg-brand-600 px-5 py-4 relative">
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white shrink-0">
                        {editingItemType === 'work_experience' ? <History className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                    </div>
                    <div>
                        <DialogTitle className="text-base font-black text-white tracking-tight">
                            {editingItemIndex >= 0 ? 'Update' : 'Add'} {editingItemType === 'work_experience' ? 'Experience' : 'Education'}
                        </DialogTitle>
                    </div>
                </div>
            </div>
            
            <div className="p-4 space-y-4 bg-white">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="role" className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">
                            {editingItemType === 'work_experience' ? 'Position' : 'Degree'}
                        </Label>
                        <Input
                            id="role"
                            value={itemFormData.role}
                            onChange={(e) => setItemFormData({...itemFormData, role: e.target.value})}
                            className="h-9 rounded-lg bg-gray-50 border-gray-100 focus:bg-white text-xs font-bold"
                            placeholder={editingItemType === 'work_experience' ? 'e.g. Manager' : 'e.g. B.Sc.'}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="company" className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">
                            {editingItemType === 'work_experience' ? 'Employer' : 'Institution'}
                        </Label>
                        <Input
                            id="company"
                            value={itemFormData.company}
                            onChange={(e) => setItemFormData({...itemFormData, company: e.target.value})}
                            className="h-9 rounded-lg bg-gray-50 border-gray-100 focus:bg-white text-xs font-bold"
                            placeholder={editingItemType === 'work_experience' ? 'e.g. Google' : 'e.g. Stanford'}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="date" className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">
                            Period
                        </Label>
                        <Input
                            id="date"
                            value={itemFormData.date}
                            onChange={(e) => setItemFormData({...itemFormData, date: e.target.value})}
                            className="h-9 rounded-lg bg-gray-50 border-gray-100 focus:bg-white text-xs font-bold"
                            placeholder="e.g. 2020 - 2023"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="desc" className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">
                            Description
                        </Label>
                        <Textarea
                            id="desc"
                            value={itemFormData.desc}
                            onChange={(e) => setItemFormData({...itemFormData, desc: e.target.value})}
                            className="min-h-[80px] rounded-lg bg-gray-50 border-gray-100 focus:bg-white text-[11px] leading-tight p-3 resize-none"
                            placeholder="Key responsibilities..."
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-1">
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsItemEditorOpen(false)}
                        className="flex-1 h-10 rounded-lg text-xs font-bold text-gray-400"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={saveItem}
                        className="flex-[1.5] h-10 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-widest"
                    >
                        Save
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
