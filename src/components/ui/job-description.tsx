'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { JobHeader } from '@/components/job-description/job-header';
import { JobInfoBadges } from '@/components/job-description/job-info-badges';
import { AboutCompany } from '@/components/job-description/about-company';
import { JobResponsibilities } from '@/components/job-description/job-responsibilities';
import { JobRequirements } from '@/components/job-description/job-requirements';
import { Separator } from '@/components/ui/separator';
import { useSelectedColumnRecord } from './dynamic-data-view';
import { PremiumDialog } from './premium-dialog';

interface NocProfile {
  code: string;
  title: string;
  overview: string;
  mainDuties: Record<string, string[]>;
  employmentRequirements: string[];
  additionalInfo: string[];
}

interface JobDescriptionProps {
  id: string; // NOC code
}

async function fetchNocProfile(code: string): Promise<NocProfile | null> {
  try {
    const response = await fetch(`/noc_description/noc_profiles.json`);
    const data = await response.json();
    return data[code] || null;
  } catch (error) {
    console.error('Error fetching NOC profile:', error);
    return null;
  }
}

function formatMainDuties(mainDuties: Record<string, string[]>): string[] {
  const duties: string[] = [];
  Object.values(mainDuties).forEach((items) => {
    if (items && items.length > 0) {
      duties.push(...items);
    }
  });
  return duties;
}

function isJobRecord(jd: unknown): jd is {
  operating_name?: string;
  city?: string;
  state?: string;
  date_of_job_posting?: string;
  noc_priority?: string;
} {
  return typeof jd === 'object' && jd !== null;
}

function JobDescription({ id }: JobDescriptionProps) {
  const [nocProfile, setNocProfile] = useState<NocProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { record: jd } = useSelectedColumnRecord();

  useEffect(() => {
    async function loadNocProfile() {
      const profile = await fetchNocProfile(id);
      setNocProfile(profile);
      setLoading(false);
    }
    loadNocProfile();
  }, [id]);

  const jobData = nocProfile
    ? {
      title: nocProfile.title,
      company:
        isJobRecord(jd) && jd.operating_name
          ? jd.operating_name
          : 'Unknown Company',
      location: isJobRecord(jd)
        ? `${jd.city || 'Unknown City'}, ${jd.state || 'Unknown Province'}`
        : 'Unknown City, Unknown Province',
      postedDate:
        isJobRecord(jd) && jd.date_of_job_posting
          ? jd.date_of_job_posting
          : 'Unknown',
      salary:
        isJobRecord(jd) && jd.noc_priority
          ? jd.noc_priority
          : 'Varies by employer',
      experienceLevel: 'As per requirements',
      jobType: 'Full-time',
      workType: 'On-site',
      salaryHourly: 'Varies by employer',
      aboutCompany: nocProfile.overview,
      jobDescription: formatMainDuties(nocProfile.mainDuties),
      requirements: nocProfile.employmentRequirements,
      companyLogoUrl: '/logo.svg',
      additionalInfo: nocProfile.additionalInfo,
    }
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">
          No job details found for this NOC code.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans w-[70%]">
      <div className="">
        <Card className="overflow-hidden border-none px-0 rounded-2xl shadow-none relative">
          <CardContent className="p-8 pt-8">
            <JobHeader
              title={jobData.title}
              company={jobData.company}
              location={jobData.location}
              salary={jobData.salary}
              postedDate={jobData.postedDate}
            />
            <Separator className="my-8" />
            <JobInfoBadges
              experienceLevel={jobData.experienceLevel}
              jobType={jobData.jobType}
            />
            <Separator className="my-8" />
            <div className="space-y-10">
              {jobData.aboutCompany && (
                <AboutCompany aboutCompany={jobData.aboutCompany} />
              )}
              {jobData.jobDescription && jobData.jobDescription.length > 0 && (
                <JobResponsibilities jobDescription={jobData.jobDescription} />
              )}
              {jobData.requirements && jobData.requirements.length > 0 && (
                <JobRequirements requirements={jobData.requirements} />
              )}
              {jobData.additionalInfo && jobData.additionalInfo.length > 0 && (
                <div className="bg-brand-500/5 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-brand-500">
                    Additional Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-black/70">
                    {jobData.additionalInfo.map(
                      (info: string, index: number) => (
                        <li key={index}>{info}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default JobDescription;

export function AnalysisDialog() {
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const { record: selectedJob } = useSelectedColumnRecord();

  return (
    <PremiumDialog
      open={showPremiumDialog}
      onOpenChange={setShowPremiumDialog}
      selectedValue={selectedJob}
    />
  );
}
