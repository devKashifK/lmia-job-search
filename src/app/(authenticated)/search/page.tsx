import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Search LMIA Jobs & Trends | JobMaze',
  description: 'Search and filter Canadian job openings. Find LMIA-approved employers, compare salaries, and discover in-demand NOC roles tailored to your profile.',
};

export default function SearchPage() {
  return <ClientPage />;
}
