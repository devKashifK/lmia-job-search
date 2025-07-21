import React from 'react';
import { InfoBadge } from './info-badge';
import { Briefcase, Clock, Mail, Lock, PhoneCall } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import Link from 'next/link';

interface JobInfoBadgesProps {
  experienceLevel: string;
  jobType: string;
}

export const JobInfoBadges = ({
  experienceLevel,
  jobType,
}: JobInfoBadgesProps) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
    <InfoBadge
      label="Experience Level"
      value={experienceLevel}
      icon={<Briefcase size={20} />}
    />
    <InfoBadge label="Job Type" value={jobType} icon={<Clock size={20} />} />
    <Dialog>
      <DialogTrigger>
        <div className="flex items-center text-sm cursor-pointer">
          <div className="text-brand-500 mr-3">
            <Mail size={20} />
          </div>
          <div>
            <p className="font-semibold text-black">Email</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-white p-0 max-w-sm">
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="rounded-full bg-brand-100 p-4">
            <Lock size={32} className="text-brand-500" />
          </div>
          <h2 className="mt-6 text-xl font-bold">Unlock Contact Information</h2>
          <p className="mt-2 text-sm text-gray-500">
            Subscribe to our premium plan to view the employer&apos;s email.
          </p>
          <Button asChild className="mt-6 bg-brand-500">
            <Link href="/pricing">Upgrade to Premium</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog>
      <DialogTrigger>
        <div className="flex items-center text-sm cursor-pointer">
          <div className="text-brand-500 mr-3">
            <PhoneCall size={20} />
          </div>
          <div>
            <p className="font-semibold text-black">Phone</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-white p-0 max-w-sm">
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="rounded-full bg-brand-100 p-4">
            <Lock size={32} className="text-brand-500" />
          </div>
          <h2 className="mt-6 text-xl font-bold">Unlock Contact Information</h2>
          <p className="mt-2 text-sm text-gray-500">
            Subscribe to our premium plan to view the employer&apos;s phone
            number.
          </p>
          <Button asChild className="mt-6 bg-brand-500">
            <Link href="/pricing">Upgrade to Premium</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);
