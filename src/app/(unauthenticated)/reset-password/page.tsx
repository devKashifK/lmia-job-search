import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Reset Password – JobMaze',
  description: 'Update your JobMaze account password with a new, secure one.',
};

export default function Page() {
  return <ClientPage />;
}
