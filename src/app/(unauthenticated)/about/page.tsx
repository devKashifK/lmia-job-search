import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about JobMaze, a smart job search platform designed to help candidates and recruiters discover Canadian job opportunities and LMIA data.',
  keywords: ['about jobmaze', 'canada job platform', 'lmia job search', 'canadian employment'],
};

export default function Page() {
  return <ClientPage />;
}
