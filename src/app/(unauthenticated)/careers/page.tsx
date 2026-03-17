import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Careers | Join the JobMaze Team',
  description: 'Join the JobMaze team to help reshape the Canadian job market. View our open positions, benefits, and company culture.',
};

export default function Page() {
  return <ClientPage />;
}
