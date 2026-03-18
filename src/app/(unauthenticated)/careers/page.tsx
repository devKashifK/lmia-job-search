import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Careers at JobMaze – Join Our Team',
  description: 'Explore career opportunities at JobMaze. Join a fast-growing tech platform transforming the way people discover jobs in Canada.',
  keywords: ['jobmaze careers', 'tech jobs canada', 'work at jobmaze'],
};

export default function Page() {
  return <ClientPage />;
}
