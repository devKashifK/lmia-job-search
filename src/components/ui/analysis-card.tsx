'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalysisCardProps extends Omit<HTMLMotionProps<"div">, "children" | "title"> {
    children?: React.ReactNode;
    header?: React.ReactNode;
    title?: React.ReactNode;
    subTitle?: React.ReactNode;
    footer?: React.ReactNode;
    backgroundIcon?: React.ReactNode;
    delay?: number;
    loading?: boolean;
}

export function AnalysisCard({
    children,
    header,
    title,
    subTitle,
    footer,
    backgroundIcon,
    className,
    onClick,
    delay = 0,
    loading = false,
    ...props
}: AnalysisCardProps) {

    if (loading) {
        return <Skeleton className={cn("h-40 w-full rounded-2xl", className)} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, type: 'spring', stiffness: 100 }}
            whileHover={onClick ? { y: -5, transition: { duration: 0.2 } } : undefined}
            onClick={onClick}
            className={cn(
                "group relative bg-white border border-gray-100 rounded-2xl p-5 overflow-hidden transition-all duration-300",
                onClick && "cursor-pointer hover:border-brand-200 hover:shadow-lg",
                className
            )}
            {...props}
        >
            {/* Background Icon Decoration */}
            {backgroundIcon && (
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    {backgroundIcon}
                </div>
            )}

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    {header && <div className="mb-3">{header}</div>}

                    {title && (
                        <div className="mb-1">
                            {typeof title === 'string' ? (
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                                    {title}
                                </h3>
                            ) : title}
                        </div>
                    )}

                    {subTitle && (
                        <div className="text-sm text-gray-500 mb-4">
                            {subTitle}
                        </div>
                    )}

                    {children}
                </div>

                {footer && (
                    <div className="mt-auto pt-3 border-t border-gray-50">
                        {footer}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Sub-components for common patterns
export function AnalysisCardStat({ label, value, subtext }: { label: string, value: string | number, subtext?: React.ReactNode }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {value}
            </h3>
            {subtext && <div className="mt-2">{subtext}</div>}
        </div>
    )
}
