import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Explore JobMaze pricing plans designed for job seekers, recruiters, and immigration professionals searching Canadian jobs.',
  keywords: ['jobmaze pricing', 'job search platform plans'],
};

export default function Page() {
  return <ClientPage />;
}
