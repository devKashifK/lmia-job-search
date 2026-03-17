import { Metadata } from 'next';
import ClientPage from './client';

export const metadata: Metadata = {
  title: 'My JobMaze Dashboard | Track Canadian Roles',
  description: 'Access your personalized JobMaze dashboard. Track saved searches, view recommended LMIA roles, and receive customized alerts for the Canadian job market.',
};

export default function DashboardPage() {
  return <ClientPage />;
}
