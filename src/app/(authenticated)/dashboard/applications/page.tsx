import { Suspense } from 'react';
import ApplicationsClient from './client';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'My Applications | Job Maze',
  description: 'View and track your job applications',
};

export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
      </div>
    }>
      <ApplicationsClient />
    </Suspense>
  );
}
