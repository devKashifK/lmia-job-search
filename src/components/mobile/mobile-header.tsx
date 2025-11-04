'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CustomLink from '../ui/CustomLink';
import Logo from '../ui/logo';
import UserDropdown from '../ui/user-dropdown';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  showBack = false,
  onBack,
  rightAction,
  className,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <CustomLink href="/" className="flex items-center min-w-[140px] group">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 rounded-xl blur-lg opacity-30 group-hover:opacity-60 group-hover:blur-xl transition-all duration-500 animate-pulse" />
              {/* Logo container */}
              <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 shadow-lg group-hover:shadow-2xl group-hover:shadow-brand-500/50 group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                <Logo className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-transparent bg-clip-text leading-tight group-hover:from-brand-500 group-hover:via-brand-600 group-hover:to-brand-700 transition-all duration-300">
                Job Maze
              </span>
              <span className="text-[10px] font-semibold text-gray-500 group-hover:text-brand-600 leading-none transition-colors duration-300">
                Find Your Dream Job
              </span>
            </div>
          </div>
        </CustomLink>
        <UserDropdown />
      </div>
    </motion.header>
  );
}
