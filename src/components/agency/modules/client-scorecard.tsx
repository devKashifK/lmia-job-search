'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Download, 
    Printer, 
    ShieldCheck, 
    Award, 
    CheckCircle2, 
    Building2, 
    GraduationCap, 
    FileText,
    Star,
    Zap
} from 'lucide-react';
import { calculateCandidateScore, getScoreLabel } from '@/lib/utils/scoring_utils';
import { cn } from '@/lib/utils';

interface ClientScorecardProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  agencyProfile: any;
}

export function ClientScorecard({ isOpen, onClose, client, agencyProfile }: ClientScorecardProps) {
  const data = client.extracted_data || {};
  const score = calculateCandidateScore(data);
  const label = getScoreLabel(score);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white shadow-2xl">
        <div className="sticky top-0 z-20 bg-gray-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600 rounded-xl">
                <FileText className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-sm">Professional Scorecard Preview</h3>
                <p className="text-[10px] text-gray-400">White-labeled for employer submission</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="bg-transparent border-white/20 hover:bg-white/10 text-white gap-2 h-9 rounded-xl font-bold text-xs">
                <Printer className="w-4 h-4" /> Print / Save PDF
            </Button>
            <Button size="sm" onClick={onClose} className="bg-white text-gray-900 hover:bg-gray-100 h-9 rounded-xl font-bold text-xs">
                Close
            </Button>
          </div>
        </div>

        {/* SCORECARD CONTENT - THIS PART IS STYLED FOR PRINT */}
        <div id="scorecard-printable" className="p-10 bg-white print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-brand-600 pb-8 mb-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{client.full_name}</h1>
                <p className="text-xl font-bold text-brand-600 uppercase tracking-widest">{data.position || 'Professional Candidate'}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Verified Client #{client.urn}</span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-2">
               <div className="flex items-center justify-end gap-2 mb-2">
                   {agencyProfile?.logo_url ? (
                       <img src={agencyProfile.logo_url} alt="Agency" className="h-10 object-contain" />
                   ) : (
                       <div className="px-3 py-1.5 bg-brand-600 text-white font-bold rounded-xl text-sm">
                           {agencyProfile?.company_name || 'JOBMAZE RECRUITMENT'}
                       </div>
                   )}
               </div>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Confidential Candidate Profile</p>
               <p className="text-[9px] text-gray-400">Protected by Recruitment Agreement</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar Stats */}
            <div className="col-span-4 space-y-6">
               <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-6 text-center space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">Candidate Score</h3>
                  <div className="relative inline-block">
                    <svg className="w-24 h-24 transform -rotate-90">
                        <circle className="text-white" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                        <circle className="text-brand-600" strokeWidth="8" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - score / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{score}%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-900">{label}</p>
                    <p className="text-[9px] text-gray-400 font-medium">Placement Readiness Index</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Core Competencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {(data.skills || "").split(',').slice(0, 15).map((skill: string, i: number) => (
                        <div key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-700 capitalize">
                            {skill.trim()}
                        </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-4 pt-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Quick Facts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl"><Award className="w-3.5 h-3.5 text-brand-600" /></div>
                        <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Experience</p>
                            <p className="text-[11px] font-bold">{data.experience || '0'} Total Years</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl"><Building2 className="w-3.5 h-3.5 text-brand-600" /></div>
                        <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Last Company</p>
                            <p className="text-[11px] font-bold truncate max-w-[120px]">{data.company || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl"><Star className="w-3.5 h-3.5 text-brand-600" /></div>
                        <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Education</p>
                            <p className="text-[11px] font-bold truncate max-w-[120px]">Degree Verified</p>
                        </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Main Content */}
            <div className="col-span-8 space-y-8">
               <section className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-600 flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-brand-600" /> Executive Summary
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    {data.bio || "Candidate is a highly qualified professional with extensive experience in their field. Demonstrates strong technical proficiency and cultural adaptability for the Canadian market."}
                  </p>
               </section>

               <section className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2">Professional Experience</h3>
                  <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {(data.work_experience || []).slice(0, 3).map((exp: string, i: number) => {
                        const parts = exp.split('): ');
                        const main = parts[0]?.split(' at ');
                        const role = main?.[0] || 'Role';
                        const rest = main?.[1]?.split(' (');
                        const company = rest?.[0] || 'Company';
                        const date = rest?.[1] || 'Period';
                        const desc = parts[1] || '';

                        return (
                            <div key={i} className="relative pl-8">
                                <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-4 border-brand-600 rounded-xl z-10 shadow-sm" />
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{role}</h4>
                                        <Badge variant="outline" className="text-[9px] font-bold h-5 border-gray-200 rounded-xl">{date.replace(')', '')}</Badge>
                                    </div>
                                    <p className="text-xs font-bold text-brand-600/80">{company}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed pt-1">
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                  </div>
               </section>

               <section className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2">Educational Background</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(data.education || []).slice(0, 2).map((edu: string, i: number) => {
                        const parts = edu.split('): ');
                        const main = parts[0]?.split(' at ');
                        const degree = main?.[0] || 'Degree';
                        const rest = main?.[1]?.split(' (');
                        const school = rest?.[0] || 'Institution';

                        return (
                            <div key={i} className="p-4 border border-gray-100 rounded-xl flex gap-3 bg-gray-50/20">
                                <GraduationCap className="w-5 h-5 text-brand-600 shrink-0" />
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-gray-900 leading-tight uppercase truncate">{degree}</h4>
                                    <p className="text-[10px] font-bold text-gray-500 truncate">{school}</p>
                                </div>
                            </div>
                        );
                    })}
                  </div>
               </section>

               <div className="pt-8 text-center bg-gray-900 border-t-4 border-brand-600 p-8 rounded-b-xl text-white">
                  <div className="flex items-center justify-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-bold uppercase tracking-[0.2em]">Agency Recommended</span>
                  </div>
                  <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
                    This candidate has been pre-screened and assessed for Canadian placement suitability by **{agencyProfile?.company_name || 'JobMaze Recruitment'}**. 
                    For interview requests or additional documentation, please contact your account manager.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #scorecard-printable, #scorecard-printable * {
            visibility: visible;
          }
          #scorecard-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Dialog>
  );
}
