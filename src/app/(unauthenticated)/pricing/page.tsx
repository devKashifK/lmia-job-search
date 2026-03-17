import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Pricing | JobMaze Plans for Seekers & Employers',
  description: 'Flexible plans for job seekers and employers. Access premium data analysis tools, unlimited LMIA applications, and employer contacts.',
};

export default function Page() {
  return <ClientPage />;
}
