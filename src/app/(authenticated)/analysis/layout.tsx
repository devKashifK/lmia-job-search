import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Market Analysis – Canadian Job Trends & Insights',
  description: 'Explore Canadian job market analysis, wage trends, hiring insights, and employment demand across provinces and industries.',
  keywords: ['canada job market analysis', 'job trends canada', 'employment statistics canada'],
};

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
