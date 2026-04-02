'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  UserCheck,
  PlusCircle,
  Unlock,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/hooks/use-session';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { submitApplication } from '@/lib/api/applications';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ApplyJobDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    RecordID: number;
    job_title: string;
    noc_code: string;
    employer: string;
    city: string;
    state: string;
    tableName: string;
    posted_link?: string;
  };
  type: 'apply' | 'notify';
}

export function ApplyJobDialog({ isOpen, onOpenChange, job, type }: ApplyJobDialogProps) {
  const { session } = useSession();
  const { preferences, updatePreferences, isLoading: prefsLoading } = useUserPreferences();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAddingPreference, setIsAddingPreference] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  // Real Resume Check from Metadata
  const userMetadata = session?.user?.user_metadata;
  const resumeUrl = userMetadata?.resume_url;
  const resumeName = userMetadata?.resume_name || "resume.pdf";
  const resumeUploaded = !!resumeUrl;

  // Preference matching logic
  const nocMatched = useMemo(() => {
    if (!preferences?.preferred_noc_codes) return false;
    return preferences.preferred_noc_codes.includes(job.noc_code);
  }, [preferences, job.noc_code]);

  const titleMatched = useMemo(() => {
    if (!preferences?.preferred_job_titles) return false;
    return preferences.preferred_job_titles.some(t =>
      t.toLowerCase() === job.job_title.toLowerCase()
    );
  }, [preferences, job.job_title]);

  const preferencesMatched = nocMatched && titleMatched;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSuccess(false);
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleAddPreference = async () => {
    setIsAddingPreference(true);
    try {
      const updatedNocs = nocMatched
        ? preferences.preferred_noc_codes
        : [...(preferences.preferred_noc_codes || []), job.noc_code];

      const updatedTitles = titleMatched
        ? preferences.preferred_job_titles
        : [...(preferences.preferred_job_titles || []), job.job_title];

      await updatePreferences({
        preferred_noc_codes: updatedNocs,
        preferred_job_titles: updatedTitles
      });

      toast({
        title: "Preferences Updated",
        description: "Job details added to your preferences.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setIsAddingPreference(false);
    }
  };

  const handleAction = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to apply for jobs.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplication({
        user_id: session.user.id,
        job_id: job.RecordID,
        job_title: job.job_title,
        noc_code: job.noc_code,
        employer_name: job.employer,
        city: job.city,
        state: job.state,
        table_name: job.tableName,
        status: type === 'apply' ? 'applied' : 'notified',
        posted_link: typeof window !== 'undefined' ? window.location.href : (job.posted_link || '')
      });

      setIsSuccess(true);
      setStep(3);

      toast({
        title: "Application Sent",
        description: `Successfully applied to ${job.employer}`,
      });
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: "There was an error submitting your application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] rounded-[24px] overflow-hidden border-none shadow-2xl p-0 bg-white/90 backdrop-blur-xl">
        <div className="relative">
          {/* Progress Bar Top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100/50 z-50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-brand-500"
            />
          </div>

          {/* Header Section with Mesh Gradient */}
          <div className={`px-6 py-5 relative overflow-hidden transition-colors duration-500 ${isSuccess ? 'bg-brand-100/80 shadow-inner shadow-brand-200/20' : 'bg-brand-50/80'
            }`}>
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-brand-200 rounded-full blur-[80px]" />
              <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-brand-100 rounded-full blur-[80px]" />
            </div>

            <DialogHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2.5 text-lg font-black text-gray-900 leading-tight">
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="success-title"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2.5"
                      >
                        <div className="p-1.5 bg-brand-600 rounded-lg shadow-lg shadow-brand-600/10">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-800">Confirmed</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="active-title"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2.5"
                      >
                        <div className="p-1.5 bg-brand-600 rounded-lg shadow-lg shadow-brand-600/20">
                          <Zap className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-brand-900">
                          {type === 'apply' ? 'Smart Apply' : 'Set Notification'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm border-white/40 text-brand-600 font-bold text-[9px] tracking-widest px-2 py-0.5">
                    STEP {step}/3
                  </Badge>
                </div>
              </div>
              <DialogDescription className="text-gray-400 font-bold mt-1 text-[10px] uppercase tracking-[0.1em] flex items-center gap-2">
                ID: {job.RecordID} <span className="text-gray-200">•</span> NOC {job.noc_code} <span className="text-gray-200">•</span> {job.employer}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {/* Scanning State */}
                  {isScanning ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
                      <div className="relative w-12 h-12">
                        <Loader2 className="w-12 h-12 text-brand-500 animate-spin opacity-20" />
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <ShieldCheck className="w-6 h-6 text-brand-600" />
                        </motion.div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-brand-900 uppercase tracking-widest">Scanning Profile Match</p>
                        <p className="text-[9px] text-gray-400 font-medium mt-1">Verifying eligibility for NOC {job.noc_code}</p>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {/* Resume Section with Hover Effect */}
                      <div className="flex items-center justify-between p-3.5 bg-brand-50/30 rounded-2xl border border-brand-100/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <FileText className="w-5 h-5 text-brand-600" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Resume</p>
                            <p className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[200px]">{resumeUploaded ? resumeName : "No resume found"}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {resumeUploaded ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-brand-500" />
                              <span className="text-[8px] font-black text-brand-600 uppercase tracking-tight">Ready</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-brand-400" />
                              <span className="text-[8px] font-black text-brand-400 uppercase tracking-tight">Missing</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Preferences Section - Premium Card */}
                      <div className={`p-4 rounded-2xl border transition-all duration-300 ${preferencesMatched
                        ? 'bg-brand-100/20 border-brand-200/50'
                        : 'bg-brand-50 border-brand-100/50'
                        }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl ${preferencesMatched ? 'bg-white text-brand-600 shadow-sm' : 'bg-white text-brand-500 shadow-sm'
                            }`}>
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Match Analysis</p>
                              {preferencesMatched && <Badge className="bg-brand-600 text-white border-none rounded-md text-[8px] px-1.5 py-0">MATCHED</Badge>}
                            </div>
                            <h4 className="text-xs font-black text-gray-900 mb-1 leading-tight">
                              {preferencesMatched ? 'Verified Career Alignment' : 'Preference Discrepancy'}
                            </h4>

                            {!preferencesMatched && (
                              <div className="space-y-3">
                                <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                                  NOC <span className="text-brand-700 font-black">{job.noc_code}</span> isn't in your target list. Updating your preferences ensures priority visibility.
                                </p>
                                <Button
                                  onClick={handleAddPreference}
                                  disabled={isAddingPreference || prefsLoading}
                                  variant="outline"
                                  className="w-full bg-white border-brand-200 text-brand-700 hover:bg-brand-50 h-9 font-black text-[9px] uppercase tracking-[0.1em] rounded-xl shadow-sm group"
                                >
                                  {isAddingPreference ? 'Processing...' : 'Sync Preference'}
                                  <PlusCircle className="w-3.5 h-3.5 ml-2 transition-transform" />
                                </Button>
                              </div>
                            )}
                            {preferencesMatched && (
                              <p className="text-[10px] text-brand-700 font-bold flex items-center gap-1.5 mt-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Position matches your career goals.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="p-5 bg-brand-50/50 rounded-2xl border border-brand-100/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-600 rounded-lg shadow-lg shadow-brand-600/20">
                        <Unlock className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Assisted Application Service</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-brand-50/50 border-l-3 border-l-brand-500">
                        <p className="text-[11px] text-brand-900 leading-relaxed font-bold italic">
                          "We will submit your profile to the employer through our prioritized channel."
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-semibold px-1">
                        By proceeding, you authorize us to use your uploaded resume and profile details for this specific application.
                        To apply manually, <Link href="/pricing" className="text-brand-600 font-black border-b border-brand-200 cursor-pointer">unlock employer info</Link>.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100 shrink-0">
                        <FileText className="w-5 h-5 text-brand-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Submission Profile</p>
                        <p className="text-xs font-black text-gray-900 truncate mt-1">{resumeName}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0.5 bg-brand-50 text-brand-600 border-brand-100 shrink-0 uppercase tracking-widest">Standard</Badge>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center"
                >
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-brand-100/50 rounded-[32px] border-2 border-dashed border-brand-200"
                    />
                    <div className="absolute inset-3 bg-brand-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-600/30">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2.5 px-4">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">Application Dispatched!</h3>
                    <p className="text-xs text-brand-600 font-bold uppercase tracking-widest opacity-80">
                      Processing with Employer
                    </p>
                    <div className="pt-3 flex flex-wrap justify-center gap-1.5">
                      <Badge className="bg-brand-50 text-brand-700 border-brand-100 font-black text-[9px] px-2.5 py-0.5">{job.job_title}</Badge>
                      <Badge className="bg-gray-50 text-gray-600 border-gray-100 font-black text-[9px] px-2.5 py-0.5">@{job.employer}</Badge>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="px-6 pb-6 pt-0">
            {step < 3 ? (
              <Button
                disabled={isSubmitting || !resumeUploaded || isScanning}
                onClick={handleAction}
                className={`relative w-full font-black h-14 rounded-2xl transition-all overflow-hidden uppercase tracking-[0.2em] text-[10px] border-none group ${step === 1
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/20'
                  : 'bg-brand-800 hover:bg-brand-900 text-white shadow-xl shadow-brand-700/20'
                  }`}
              >
                {/* Shimmer Effect */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                />

                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      SENDING...
                    </>
                  ) : (
                    <>
                      {step === 1 ? 'Verify Profile' : 'Confirm Application'}
                      <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            ) : (
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full bg-gray-900 hover:bg-black text-white font-black h-14 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-[10px] border-none"
              >
                Continue Browsing
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
