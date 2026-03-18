import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact JobMaze for support, partnerships, or platform inquiries related to Canadian job search and LMIA job opportunities.',
  keywords: ['contact jobmaze', 'canada job portal support'],
};

export default function Page() {
  return <ClientPage />;
}
