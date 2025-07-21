import React from 'react';
import { Section } from './section';
import { Building2 } from 'lucide-react';

interface AboutCompanyProps {
  aboutCompany: string;
}

export const AboutCompany = ({ aboutCompany }: AboutCompanyProps) => (
  <Section
    title={
      <>
        <Building2 className="mr-3 text-brand-500" size={24} /> Overview
      </>
    }
  >
    <p>{aboutCompany}</p>
  </Section>
);
