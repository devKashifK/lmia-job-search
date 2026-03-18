import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Sign In – Access Your JobMaze Account',
  description: 'Sign in to JobMaze to manage your job search, track LMIA applications, and update your profile.',
  keywords: ['jobmaze login', 'sign in canada jobs'],
};

export default function Page() {
  return <ClientPage />;
}
