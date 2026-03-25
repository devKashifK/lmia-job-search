import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Forgot Password – JobMaze',
  description: 'Reset your JobMaze account password to regain access to your job search dashboard.',
};

export default function Page() {
  return <ClientPage />;
}
