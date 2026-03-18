import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Jobs, Locations & Companies – JobMaze',
  description: 'Use JobMaze comparison tool to analyze job roles, salaries, and company metrics side-by-side.',
  keywords: ['compare jobs canada', 'job market comparison'],
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
