type PageProps = {
  params: Promise<{ name: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

import { Metadata } from 'next';
import ClientPage from './client';

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const qs = await searchParams;
  
  // Try to use the exact database match from 'value', fallback to decoded slug from URL
  const exactValue = Array.isArray(qs.value) ? qs.value[0] : qs.value;
  const companyName = exactValue || decodeURIComponent(name);

  const title = `${companyName} Job Trends & LMIA Analysis | JobMaze`;
  const description = `Explore hiring trends, job locations, and LMIA approvals for ${companyName}. Get detailed data analysis and salary insights on JobMaze.`;

  const canonicalUrl = `https://jobmaze.ca/analysis/${name}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default function Page(props: PageProps) {
  return <ClientPage {...props} />;
}
