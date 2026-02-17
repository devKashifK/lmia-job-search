'use client';

import React, { useState } from 'react';

import { AlertsList } from '@/components/dashboard/alerts-list';
import { Button } from '@/components/ui/button';
// import Link from 'next/link'; // Not needed
import { Plus } from 'lucide-react';
import { CreateAlertDialog } from '@/components/alerts/create-alert-dialog';

export default function AlertsPage() {
    const [showNewAlertDialog, setShowNewAlertDialog] = useState(false);

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Job Alerts</h1>
                    <p className="text-gray-500 mt-1">Manage your notification preferences and active alerts.</p>
                </div>
                <Button
                    onClick={() => setShowNewAlertDialog(true)}
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Custom Alert
                </Button>
            </div>

            <AlertsList />

            <CreateAlertDialog
                open={showNewAlertDialog}
                onOpenChange={setShowNewAlertDialog}
                criteria={{}} // Empty criteria for custom alert
                defaultName="New Custom Alert"
            />
        </div>
    );
}
