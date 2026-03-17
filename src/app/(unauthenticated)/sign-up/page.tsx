import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Sign Up | Create a JobMaze Account',
  description: 'Create your free JobMaze account. Connect with top Canadian employers, find LMIA jobs, and secure your future.',
};

export default function Page() {
  return <ClientPage />;
}
