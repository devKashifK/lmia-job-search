import React from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Award,
  Clock,
  ExternalLink,
  Star,
} from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { usePlanFeatures } from '@/hooks/use-plan-features';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Separator } from './separator';
import { Mail, Phone, Contact, Sparkles } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { consumeCreditsIfNoPremium } from '@/lib/api/credits';
import { useQueryClient } from '@tanstack/react-query';
import { useCreditUnlock } from '@/components/ui/credit-unlock-dialog';
import { useState } from 'react';

interface Job {
  id?: number;
  RecordID?: number;
  employer: string;
  job_title?: string;
  occupation_title?: string;
  city: string;
  state: string;
  noc_code?: string;
  '2021_noc'?: string;
  category?: string;
  employer_type?: string;
  date_of_job_posting?: string;
  program?: string;
  lmia_year?: number;
  priority_occupation?: string;
  approved_positions?: number;
  territory?: string;
  email?: string;
  phone?: string;
}

interface JobDetailsProps {
  job: Job | null;
  onSaveJob?: () => void;
  onViewNOC?: () => void;
  isSaved?: boolean;
  className?: string;
}

export function JobDetails({
  job,
  onSaveJob,
  onViewNOC,
  isSaved = false,
  className = '',
}: JobDetailsProps) {
  const { canViewEmployerContacts, creditRemaining } = usePlanFeatures();
  const { session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { showUnlockDialog, CreditUnlockComponent } = useCreditUnlock();

  // Per-job local unlock state
  const jobId = job?.RecordID || (job as any).id;
  const isLocallyUnlocked = typeof window !== 'undefined' && jobId && localStorage.getItem(`unlocked_contact_${session?.user?.id}_${jobId}`) === 'true';

  const executeUnlock = async () => {
    setIsUnlocking(true);
    try {
      const success = await consumeCreditsIfNoPremium(session?.user?.id || '', 150);
      if (success) {
        toast({
          title: 'Contacts Unlocked!',
          description: '150 credits have been deducted from your account.',
        });
        await queryClient.invalidateQueries({ queryKey: ['credits', session?.user?.id] });
        if (jobId) {
          localStorage.setItem(`unlocked_contact_${session?.user?.id}_${jobId}`, 'true');
          window.location.reload(); // Refresh to show contacts
        }
      } else {
        toast({
          title: 'Insufficient Credits',
          description: 'You need at least 150 credits to unlock this feature.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error unlocking contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlock contacts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleUnlockWithCredits = async () => {
    if (!session?.user?.id) return;
    
    showUnlockDialog({
      title: 'Unlock Employer Contacts',
      description: 'You are about to unlock the direct contact information for this employer. This will use 150 credits from your balance.',
      creditAmount: 150,
      userCredits: creditRemaining === Infinity ? 999999 : creditRemaining,
      onConfirm: executeUnlock
    });
  };

  const isUnlocked = canViewEmployerContacts || isLocallyUnlocked;

  if (!job) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Job
          </h3>
          <p className="text-gray-500">
            Choose a job from the list to view details
          </p>
        </div>
      </div>
    );
  }

  const jobTitle = job.job_title || job.occupation_title || 'N/A';
  const nocCode = job.noc_code || job['2021_noc'] || 'N/A';

  return (
    <div className={`bg-white overflow-y-auto shadow-sm relative ${className}`}>
      {/* Subtle top border for selected job indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-blue-500 z-10"></div>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1 pr-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {jobTitle}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-brand-600" />
              <span className="text-xl font-semibold text-gray-800">
                {job.employer}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 text-lg">
              <MapPin className="w-5 h-5" />
              <span>
                {job.city}, {job.state}
              </span>
            </div>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="default"
              onClick={onSaveJob}
              className={`flex items-center gap-2 px-6 py-3 transition-all duration-200 ${
                isSaved
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-700 hover:from-yellow-100 hover:to-orange-100 shadow-sm'
                  : 'hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <Star
                className={`w-5 h-5 transition-colors duration-200 ${
                  isSaved ? 'fill-current text-yellow-500' : 'text-gray-500'
                }`}
              />
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={onViewNOC}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ExternalLink className="w-5 h-5" />
              View NOC Profile
            </Button>
          </div>
        </div>

        {/* Job Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 bg-gray-50">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-600" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  NOC Code:
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-sm px-3 py-1"
                >
                  {nocCode}
                </Badge>
              </div>
              {job.category && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Category:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {job.category}
                  </span>
                </div>
              )}
              {job.employer_type && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Employer Type:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {job.employer_type}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 bg-gray-50">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {job.date_of_job_posting && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Posted:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {new Date(job.date_of_job_posting).toLocaleDateString()}
                  </span>
                </div>
              )}
              {job.lmia_year && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    LMIA Year:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {job.lmia_year}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* LMIA Specific Information */}
        {(job.program ||
          job.priority_occupation ||
          job.approved_positions ||
          job.territory) && (
          <Card className="mb-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 bg-gray-50">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-600" />
                LMIA Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {job.program && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Program:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {job.program}
                  </span>
                </div>
              )}
              {job.priority_occupation && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Priority Occupation:
                  </span>
                  <Badge variant="secondary" className="px-3 py-1">
                    {job.priority_occupation}
                  </Badge>
                </div>
              )}
              {job.approved_positions && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Approved Positions:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {job.approved_positions}
                  </span>
                </div>
              )}
              {job.territory && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Territory:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {job.territory}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Record Information */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4 bg-gray-50">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              Record Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Record ID:
              </span>
              <span className="text-sm font-semibold font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded">
                {(job as any).RecordID || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information (Gated) */}
        <Card className="mt-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className={`pb-4 ${isUnlocked ? 'bg-emerald-50' : 'bg-gray-50'}`}>
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Contact className={`w-5 h-5 ${isUnlocked ? 'text-emerald-600' : 'text-brand-600'}`} />
              Employer Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!isUnlocked ? (
              <div className="text-center py-4">
                <div className="bg-brand-50 rounded-xl p-4 border border-brand-100 mb-4">
                  <p className="text-sm text-brand-900 font-medium mb-2">Contact Details Locked</p>
                  <p className="text-xs text-gray-600 mb-4">Upgrade plan or use credits to reveal employer email and phone number.</p>
                  <div className="flex flex-col gap-2 sm:flex-row justify-center">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-brand-200 text-brand-600 hover:bg-brand-50"
                      onClick={() => window.location.href = '/pricing'}
                    >
                      View Pricing
                    </Button>
                    <Button
                      size="sm"
                      className="bg-brand-600 hover:bg-brand-700"
                      onClick={handleUnlockWithCredits}
                      disabled={isUnlocking}
                    >
                      {isUnlocking ? 'Unlocking...' : 'Unlock for 150 Credits'}
                      {!isUnlocking && <Sparkles className="w-4 h-4 ml-2 fill-current" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3">
                    Your current credits: <span className="font-bold text-brand-600">{creditRemaining === Infinity ? 'Unlimited' : creditRemaining}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {job.email ? (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                      <a href={`mailto:${job.email}`} className="text-sm font-semibold text-gray-900 hover:text-brand-600">
                        {job.email}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No email provided</p>
                )}
                <Separator />
                {job.phone ? (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                      <a href={`tel:${job.phone}`} className="text-sm font-semibold text-gray-900 hover:text-brand-600">
                        {job.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No phone provided</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <CreditUnlockComponent />
    </div>
  );
}
