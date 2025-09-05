'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Share2 } from 'lucide-react';
import { ShareDialog } from './share-dialog';

interface ShareButtonProps {
  jobTitle?: string;
  employer?: string;
  city?: string;
  state?: string;
  url?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function ShareButton({
  jobTitle = '',
  employer = '',
  city = '',
  state = '',
  url = '',
  className = '',
  size = 'sm',
  variant = 'default',
}: ShareButtonProps) {
  const [openShareDialog, setOpenShareDialog] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size}
            variant={variant}
            onClick={() => setOpenShareDialog(true)}
            className={`transition-all duration-200 ${className}`}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Share this job</p>
        </TooltipContent>
      </Tooltip>

      <ShareDialog
        open={openShareDialog}
        onOpenChange={setOpenShareDialog}
        jobTitle={jobTitle}
        employer={employer}
        city={city}
        state={state}
        url={url}
      />
    </>
  );
}
