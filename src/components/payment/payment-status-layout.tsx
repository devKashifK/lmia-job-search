'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface PaymentStatusLayoutProps {
    icon: React.ReactNode;
    iconBgClass: string;
    title: string;
    subtitle: React.ReactNode;
    gradientClass: string;
    borderColorClass: string;
    children: React.ReactNode;
}

export function PaymentStatusLayout({
    icon,
    iconBgClass,
    title,
    subtitle,
    gradientClass,
    borderColorClass,
    children
}: PaymentStatusLayoutProps) {
    return (
        <div className={`min-h-screen bg-gradient-to-br ${gradientClass} flex items-center justify-center p-4`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <Card className={`${borderColorClass} shadow-xl`}>
                    <CardHeader className="text-center pb-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="mx-auto mb-4"
                        >
                            <div className={`w-20 h-20 ${iconBgClass} rounded-full flex items-center justify-center`}>
                                {icon}
                            </div>
                        </motion.div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            {title}
                        </CardTitle>
                        <p className="text-gray-600 mt-2">
                            {subtitle}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {children}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
