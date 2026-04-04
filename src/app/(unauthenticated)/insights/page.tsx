import { Metadata } from 'next';
import ClientPage from './client';
import { getAllPrograms } from '@/lib/api/programs';

export const metadata: Metadata = {
  title: 'JobMaze Insights | Canadian Job Market Data & Trends',
  description: 'Deep dive into Canadian job market trends, salary expectations, and immigration policies. Stay informed with JobMaze Insights.',
};

export default async function Page() {
  const initialPrograms = await getAllPrograms();
  return <ClientPage initialPrograms={initialPrograms} />;
}
