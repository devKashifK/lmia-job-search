import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Sign In | JobMaze',
  description: 'Access your JobMaze account to save jobs, set alerts, and manage your Canadian job search.',
};

export default function Page() {
  return <ClientPage />;
}
