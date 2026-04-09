"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { getUserAlerts, JobAlert } from '@/lib/api/alerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Bell, BellOff, Calendar, Search, Users, ShieldCheck, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AgencyAlertsView() {
    const { session } = useSession();
    const [alerts, setAlerts] = useState<JobAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (session?.user?.id) {
            fetchAlerts();
        }
    }, [session]);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const data = await getUserAlerts(session?.user?.id!);
            setAlerts(data || []);
        } catch (error) {
            console.error('Error fetching agency alerts:', error);
            toast({
                title: 'Error',
                description: 'Failed to load client alerts.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setAlerts(prev => prev.filter(a => a.id !== id));
            const { deleteAlert } = await import('@/lib/api/alerts');
            await deleteAlert(id);
            toast({ title: 'Alert Removed', description: 'Client alert successfully cleared.' });
        } catch (error) {
            fetchAlerts();
        }
    };

    if (loading) {
        return (
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-gray-100 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-40 bg-gray-100 rounded-2xl" />
              <div className="h-40 bg-gray-100 rounded-2xl" />
              <div className="h-40 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Agency Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-200 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-50" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="h-4 w-4 text-brand-600" />
                            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest leading-none">Global Monitoring</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                           Client Matches
                        </h1>
                        <p className="text-gray-500 max-w-lg text-sm">
                            Real-time tracking for new job listings that match your clients' criteria and eligibility.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 leading-none">{alerts.length}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Monitors</p>
                        </div>
                    </div>
                </div>
            </div>

            {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <Target className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">No Active Match Monitors</h3>
                    <p className="text-gray-500 max-w-sm text-sm">
                        Create job alerts per client to get notified immediately when a matching position is posted.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {alerts.map((alert) => (
                            <motion.div
                                key={alert.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className={cn(
                                    "overflow-hidden transition-all duration-300 border bg-white rounded-2xl",
                                    alert.is_active ? "border-brand-100 hover:shadow-lg hover:shadow-brand-500/5 hover:border-brand-200" : "opacity-60 border-gray-100 shadow-none grayscale-[50%]"
                                )}>
                                    <CardHeader className="p-5 pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-bold text-gray-900 line-clamp-1">
                                                    {alert.name}
                                                </CardTitle>
                                                {alert.client_urn && (
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                                                        <Users className="h-3 w-3" />
                                                        Client: {alert.client_urn.split('-').pop()}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                                                onClick={() => handleDelete(alert.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 space-y-4">
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[9px] font-bold uppercase tracking-wider px-2 border-0">
                                                {alert.frequency}
                                            </Badge>
                                            {alert.criteria?.q && (
                                                <Badge variant="outline" className="text-[10px] text-gray-600 border-gray-100">
                                                    "{alert.criteria.q}"
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center text-[10px] text-gray-400 font-medium tracking-tight">
                                                <Calendar className="mr-1.5 w-3 h-3" />
                                                Active since {format(new Date(alert.created_at), 'MMMM yyyy')}
                                            </div>
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                alert.is_active ? "bg-brand-500 animate-pulse" : "bg-gray-300"
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
