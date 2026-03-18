import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Sign Up – Create Your JobMaze Account',
  description: 'Join JobMaze today to discover LMIA-approved jobs, get personalized recommendations, and start your career in Canada.',
  keywords: ['jobmaze registration', 'create account canada jobs'],
};

export default function Page() {
  return <ClientPage />;
}
