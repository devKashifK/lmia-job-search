import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'About Us | JobMaze Mission & Team',
  description: 'Learn about JobMaze, our mission to connect global talent with Canadian employers, and our commitment to transparency in hiring.',
};

export default function Page() {
  return <ClientPage />;
}
