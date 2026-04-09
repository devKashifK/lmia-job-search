'use client';

import React from 'react';
import { useAgencyApplications, APPLICATION_STATUSES, ApplicationStatus } from '@/hooks/use-agency-applications';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, ExternalLink, Briefcase, ChevronRight, MoreHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClientApplicationsProps {
  clientUrn: string;
}

const STAGE_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; dotColor: string; border: string }> = {
    applied:    { label: 'Applied',    color: 'text-blue-700',   bg: 'bg-blue-50',   dotColor: 'bg-blue-500',   border: 'border-blue-100' },
    screening:  { label: 'Screening',  color: 'text-violet-700', bg: 'bg-violet-50', dotColor: 'bg-violet-500', border: 'border-violet-100' },
    interview:  { label: 'Interview',  color: 'text-amber-700',  bg: 'bg-amber-50',  dotColor: 'bg-amber-500',  border: 'border-amber-100' },
    offered:    { label: 'Offered',    color: 'text-green-700',  bg: 'bg-green-50',  dotColor: 'bg-green-500',  border: 'border-green-100' },
    rejected:   { label: 'Rejected',   color: 'text-red-600',    bg: 'bg-red-50',    dotColor: 'bg-red-500',    border: 'border-red-100' },
};

export function ClientApplications({ clientUrn }: ClientApplicationsProps) {
  const { applications, isLoading, error, refresh, updateApplicationStatus } = useAgencyApplications(clientUrn);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-12 border-red-100 bg-red-50/10 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div>
            <h3 className="text-sm font-bold text-gray-900 font-black uppercase tracking-tight">Sync Failed</h3>
            <p className="text-[11px] text-red-600 max-w-xs mx-auto mb-4">{error}</p>
            <Button size="sm" onClick={refresh} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-8 px-6 text-[10px] font-bold">
                Retry Connection
            </Button>
        </div>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="p-12 border-dashed border-2 border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-gray-300" />
        </div>
        <div className="space-y-1">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">No applications tracked</h3>
            <p className="text-[11px] text-gray-400 max-w-sm mx-auto">Applications submitted via the <b>Matching Lab</b> will appear here as a Kanban pipeline.</p>
        </div>
        
        <div className="flex flex-col items-center gap-3">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                className="h-8 rounded-lg border-gray-200 text-[10px] font-bold text-gray-500 hover:text-brand-600 hover:border-brand-200"
            >
                <RefreshCw className={cn("w-3 h-3 mr-1.5", isLoading && "animate-spin")} />
                Sync Pipeline
            </Button>
            
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">Context: {clientUrn}</p>
        </div>
      </Card>
    );
  }

  const getNext = (current: ApplicationStatus): ApplicationStatus => {
    const i = APPLICATION_STATUSES.indexOf(current);
    return APPLICATION_STATUSES[i + 1] ?? current;
  };

  return (
    <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Application Pipeline</h3>
            <Badge variant="outline" className="text-[9px] font-bold text-gray-400">
                {applications.length} Total
            </Badge>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-5 gap-3 min-h-[300px]">
            {APPLICATION_STATUSES.map((status) => {
                const config = STAGE_CONFIG[status];
                const stageApps = applications.filter(a => (a.status || 'applied') === status);

                return (
                    <div key={status} className="flex flex-col gap-2">
                        {/* Column Header */}
                        <div className={cn("flex items-center justify-between px-2.5 py-2 rounded-lg border", config.bg, config.border)}>
                            <div className="flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
                                <span className={cn("text-[10px] font-black uppercase tracking-wider", config.color)}>
                                    {config.label}
                                </span>
                            </div>
                            {stageApps.length > 0 && (
                                <span className={cn("text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center", config.bg, config.color)}>
                                    {stageApps.length}
                                </span>
                            )}
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-2 flex-1">
                            <AnimatePresence>
                                {stageApps.map((app) => (
                                    <motion.div
                                        key={app.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white rounded-lg border border-gray-100 shadow-sm p-2.5 space-y-2 group hover:shadow-md transition-shadow"
                                    >
                                        {/* Job Title + Actions */}
                                        <div className="flex items-start justify-between gap-1">
                                            <p className="text-[10px] font-bold text-gray-900 leading-tight line-clamp-2 flex-1">
                                                {app.job_title}
                                            </p>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-100 rounded transition-all shrink-0">
                                                        <MoreHorizontal className="w-3 h-3 text-gray-400" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36 text-xs">
                                                    {APPLICATION_STATUSES.filter(s => s !== status).map(s => (
                                                        <DropdownMenuItem 
                                                            key={s}
                                                            onClick={() => updateApplicationStatus(app.id, s)}
                                                            className="text-[11px] cursor-pointer"
                                                        >
                                                            <div className={cn("w-1.5 h-1.5 rounded-full mr-2", STAGE_CONFIG[s].dotColor)} />
                                                            Move to {STAGE_CONFIG[s].label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Employer */}
                                        <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase">
                                            <Building2 className="w-2.5 h-2.5 shrink-0" />
                                            <span className="truncate">{app.employer_name}</span>
                                        </div>

                                        {/* Date + Advance */}
                                        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                                            <div className="flex items-center gap-1 text-[9px] text-gray-300 font-bold">
                                                <Calendar className="w-2.5 h-2.5" />
                                                {format(new Date(app.created_at), 'MMM dd')}
                                            </div>
                                            {status !== 'rejected' && status !== 'offered' && (
                                                <button
                                                    onClick={() => updateApplicationStatus(app.id, getNext(status))}
                                                    className="flex items-center gap-0.5 text-[9px] font-bold text-brand-500 hover:text-brand-700 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    Advance <ChevronRight className="w-2.5 h-2.5" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Empty state per column */}
                            {stageApps.length === 0 && (
                                <div className="flex-1 flex items-center justify-center border border-dashed border-gray-100 rounded-lg min-h-[80px]">
                                    <span className="text-[9px] text-gray-300 font-bold uppercase">Empty</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
}
