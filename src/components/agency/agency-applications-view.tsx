"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Bell,
  User,
  Users,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { getAgencyApplications, JobApplication } from "@/lib/api/applications";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export function AgencyApplicationsView() {
  const { session } = useSession();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      if (!session?.user?.id) return;
      try {
        const data = await getAgencyApplications(session.user.id);
        setApplications(data);
      } catch (error) {
        console.error("Failed to fetch agency applications:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load client applications.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, [session?.user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-brand-50 text-brand-700 border-brand-100";
      case "notified":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-48 bg-gray-100 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded-2xl" />
          <div className="h-24 bg-gray-100 rounded-2xl" />
          <div className="h-24 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Agency Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-200 shadow-sm transition-all hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-brand-50/10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-wider">Agency Workspace</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Client Case Applications
            </h1>
            <p className="text-gray-500 max-w-lg text-sm leading-relaxed">
              Consolidated view of all job submissions made across your entire client roster.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-4">
                <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Global Submissions</p>
                <p className="text-2xl font-bold text-gray-900 leading-none">{applications.length}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-200">
                    <Target className="h-6 w-6" />
                </div>
              </div>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-dashed border-gray-300 p-16 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
            <Users className="w-10 h-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">No client submissions found</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">
              Applications you submit for your clients will appear here for centralized tracking.
            </p>
          </div>
          <Link href="/">
            <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-8 h-12 font-semibold shadow-lg shadow-brand-500/20">
              <Search className="w-4 h-4 mr-2" />
              Start Client Search
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              Submission Log
            </h2>
          </div>

          <div className="space-y-4">
            {applications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative overflow-hidden border border-gray-200 hover:border-brand-200 transition-all duration-300 p-0 bg-white hover:shadow-lg hover:shadow-brand-500/5 rounded-2xl">
                  <div className="flex flex-col md:flex-row">
                    {/* Client Sidebar on the Card */}
                    <div className="md:w-48 bg-gray-50 border-r border-gray-100 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3 text-brand-600" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {app.client?.full_name || app.client_urn || 'Unknown'}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">#{app.client_urn?.split('-').pop()}</p>
                    </div>

                    <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-6">
                        {/* Job Info */}
                        <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                            {app.job_title}
                            </h3>
                            <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                            getStatusColor(app.status)
                            )}>
                            {app.status}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            {app.employer_name}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {app.city}, {app.state}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            Submitted {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'recently'}
                            </div>
                        </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                        {app.posted_link && (
                            <a 
                            href={app.posted_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="shrink-0"
                            >
                            <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-xs text-gray-600 hover:text-brand-600 border-gray-200 hover:border-brand-200 bg-white shadow-sm transition-all font-semibold">
                                View Job
                                <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                            </a>
                        )}
                        </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
