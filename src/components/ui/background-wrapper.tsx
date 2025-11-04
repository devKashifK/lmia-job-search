'use client';

import { cn } from '@/lib/utils';

interface BackgroundWrapperProps {
  children: React.ReactNode;
  className: string;
}

export default function BackgroundWrapper({
  children,
  className,
}: BackgroundWrapperProps) {
  return (
    <div
      className={cn(
        'relative min-h-screen flex-col flex  overflow-x-hidden',
        className
      )}
    >
      {/* Subtle background blobs */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
