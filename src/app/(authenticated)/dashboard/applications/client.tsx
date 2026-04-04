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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { getUserApplications, JobApplication } from "@/lib/api/applications";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ApplicationsClient() {
  const { session } = useSession();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      if (!session?.user?.id) return;
      try {
        const data = await getUserApplications(session.user.id);
        setApplications(data);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your applications.",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "applied":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "notified":
        return <Bell className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getReviewStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("selected") || s.includes("hired") || s.includes("accepted"))
      return "bg-green-50 text-green-700 border-green-100";
    if (s.includes("rejected") || s.includes("declined") || s.includes("not selected"))
      return "bg-red-50 text-red-700 border-red-100";
    if (s.includes("review") || s.includes("shortlisted"))
      return "bg-purple-50 text-purple-700 border-purple-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-50/50 to-transparent opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              My Applications
            </h1>
            <p className="text-gray-500 max-w-lg">
              Track all your job applications and their current status in one place.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-brand-50 px-4 py-2 rounded-2xl border border-brand-100">
            <div className="text-brand-600 font-bold text-2xl">
              {applications.length}
            </div>
            <div className="text-xs text-brand-700 font-semibold uppercase tracking-wider leading-tight">
              Total<br />Applications
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
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="w-10 h-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">No applications yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">
              Start your job search and apply to your favorite positions to see them here.
            </p>
          </div>
          <Link href="/">
            <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-8 h-12 font-semibold shadow-lg shadow-brand-500/20">
              <Search className="w-4 h-4 mr-2" />
              Find Your Next Job
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              Recent Applications
            </h2>
            <div className="text-xs text-gray-400 font-medium italic">
              Showing {applications.length} applications
            </div>
          </div>

          <div className="space-y-4">
            {applications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative overflow-hidden border border-gray-200 hover:border-brand-200 transition-all duration-300 p-5 bg-white hover:shadow-lg hover:shadow-brand-500/5 rounded-2xl">
                  {/* Status Gradient Bar */}
                  <div 
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b transition-all duration-300",
                      app.status === 'applied' ? "from-brand-400 to-brand-600" : "from-blue-400 to-blue-600"
                    )}
                  />

                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Job Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                          {app.job_title}
                        </h3>
                        <div className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          getStatusColor(app.status)
                        )}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </div>
                        {app.review_status && (
                          <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            getReviewStatusColor(app.review_status)
                          )}>
                            <Clock className="w-3.5 h-3.5" />
                            {app.review_status}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          {app.employer_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {app.city}, {app.state}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="w-4 h-4 text-gray-400" />
                          Applied {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'recently'}
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
                          <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl text-gray-600 hover:text-brand-600 border-gray-200 hover:border-brand-200 bg-white shadow-sm transition-all">
                            View Job
                            <ExternalLink className="w-3.5 h-3.5 ml-2" />
                          </Button>
                        </a>
                      )}
                      <Link href={`/dashboard/applications/${app.id}`} className="hidden">
                        <Button size="icon" variant="ghost" className="h-10 w-10 text-gray-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </Link>
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
