import React from 'react';
import { Section } from './section';
import { ListChecks } from 'lucide-react';

interface JobResponsibilitiesProps {
  jobDescription: string[];
}

export const JobResponsibilities = ({
  jobDescription,
}: JobResponsibilitiesProps) => (
  <Section
    title={
      <>
        <ListChecks className="mr-3 text-brand-500" size={24} /> Job Description
      </>
    }
  >
    <ul className="list-disc list-inside space-y-2">
      {jobDescription.map((item: string, index: number) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </Section>
);
