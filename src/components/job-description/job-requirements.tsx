import React from 'react';
import { Section } from './section';
import { ClipboardList } from 'lucide-react';

interface JobRequirementsProps {
  requirements: string[];
}

export const JobRequirements = ({ requirements }: JobRequirementsProps) => (
  <Section
    title={
      <>
        <ClipboardList className="mr-3 text-brand-500" size={24} /> Requirements
      </>
    }
  >
    <ul className="list-disc list-inside space-y-2">
      {requirements.map((item: string, index: number) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </Section>
);
