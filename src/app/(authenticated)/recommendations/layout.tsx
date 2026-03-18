import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Recommendations – Personalized for You',
  description: 'View personalized job recommendations based on your profile, skills, and preferences on JobMaze.',
  keywords: ['job recommendations', 'personalized job search'],
};

export default function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
