'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import db from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Bell, BellOff, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/ui/loader';
import { motion, AnimatePresence } from 'framer-motion';

interface JobAlert {
    id: string;
    name: string;
    criteria: any;
    frequency: 'daily' | 'weekly' | 'instant';
    is_active: boolean;
    created_at: string;
}

export function AlertsList() {
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
            const { getUserAlerts } = await import('@/lib/api/alerts');
            const data = await getUserAlerts(session?.user?.id!);
            setAlerts(data || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            toast({
                title: 'Error',
                description: 'Failed to load your alerts.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // Optimistic update
            setAlerts(prev => prev.filter(a => a.id !== id));

            const { deleteAlert } = await import('@/lib/api/alerts');
            await deleteAlert(id);

            toast({
                title: 'Alert Deleted',
                description: 'Your job alert has been removed.',
            });
        } catch (error) {
            console.error('Error deleting alert:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete alert.',
                variant: 'destructive',
            });
            fetchAlerts(); // Revert on error
        }
    };

    const handleToggle = async (id: string, currentState: boolean) => {
        try {
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentState } : a));

            const { updateAlertStatus } = await import('@/lib/api/alerts');
            await updateAlertStatus(id, !currentState);
        } catch (error) {
            console.error('Error updating alert:', error);
            fetchAlerts(); // Revert
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (alerts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Alerts Created</h3>
                <p className="text-gray-500 max-w-sm">
                    Run a search and click the bell icon to get notified when new jobs match your criteria.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
                {alerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                    >
                        <Card className={`overflow-hidden transition-all ${alert.is_active ? 'border-brand-100 hover:border-brand-200 hover:shadow-md' : 'border-gray-100 opacity-75'}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold line-clamp-1" title={alert.name}>
                                    {alert.name || "Untitled Alert"}
                                </CardTitle>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-brand-600"
                                        onClick={() => handleToggle(alert.id, alert.is_active)}
                                        title={alert.is_active ? "Pause Alert" : "Resume Alert"}
                                    >
                                        {alert.is_active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                                        onClick={() => handleDelete(alert.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Badge variant="secondary" className="bg-brand-50 text-brand-700 hover:bg-brand-100">
                                        {alert.frequency}
                                    </Badge>
                                    {/* Display Filters from Criteria */}
                                    {alert.criteria?.q && (
                                        <Badge variant="outline" className="border-gray-200 text-gray-600">
                                            {alert.criteria.q}
                                        </Badge>
                                    )}
                                    {alert.criteria?.location && (
                                        <Badge variant="outline" className="border-gray-200 text-gray-600">
                                            <Search className="w-3 h-3 mr-1" />
                                            {typeof alert.criteria.location === 'string' ? alert.criteria.location : 'Location'}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center text-xs text-gray-400">
                                    <Calendar className="mr-1 w-3 h-3" />
                                    Created {format(new Date(alert.created_at), 'MMM d, yyyy')}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
