import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'Contact Us | Get in Touch with JobMaze',
  description: 'Contact the JobMaze team for support, business inquiries, or feedback. We are here to help you navigate the Canadian job market.',
};

export default function Page() {
  return <ClientPage />;
}
