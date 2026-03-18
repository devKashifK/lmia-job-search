import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Comparison Tool – Analyze Opportunities',
  description: 'Detailed side-by-side analysis of job opportunities, locations, and employer data on JobMaze.',
  keywords: ['job analysis tool', 'career comparison'],
};

export default function CompareToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
