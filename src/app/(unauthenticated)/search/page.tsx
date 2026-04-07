import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Advanced Job Search – Find Your Next Role in Canada',
  description: 'Use JobMaze’s advanced AI search to find jobs, LMIA opportunities, and market trends. Filter by NOC code, province, and industry.',
  keywords: ['canada job search', 'ai job search', 'lmia search', 'jobmaze search'],
};

export default function SearchPage() {
  return <ClientPage />;
}
