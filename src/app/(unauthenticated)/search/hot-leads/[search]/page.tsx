import React from 'react';
import { SearchResultsLayout } from '@/components/ui/search-result-layout';
import { Metadata } from 'next';

type PageProps = {
  params: Promise<{ search: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Helper function to capitalize words
function capitalize(str: string) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { search } = await params;
  const qs = await searchParams;
  
  const field = (Array.isArray(qs.field) ? qs.field[0] : qs.field) ?? 'all';
  // Use 'search' param if it's not 'all', otherwise try to use 'value' from qs. 
  // If neither are good, try to derive from path or just use a generic term.
  let rawValue = decodeURIComponent(search !== 'all' ? search : ((Array.isArray(qs.value) ? qs.value[0] : qs.value) || ''));
  const value = capitalize(rawValue);
  
  const city = capitalize((Array.isArray(qs.city) ? qs.city[0] : qs.city) || 'Canada');
  const stateRaw = (Array.isArray(qs.state) ? qs.state[0] : qs.state);
  const state = stateRaw ? capitalize(stateRaw) : 'Canada';

  let title = 'Search Trending Jobs | JobMaze';
  let description = 'Find the latest trending jobs and opportunities across Canada on JobMaze.';

  switch (field) {
    case 'job_title':
      title = `${value} in ${city} (LMIA Available) | JobMaze`;
      description = `Apply for ${value} in ${city}, ${state}. LMIA available for eligible candidates. Start your career in Canada with JobMaze. Apply today!`;
      break;
    case 'category':
      title = `${value} Jobs: Roles in ${city} (LMIA) | JobMaze`;
      description = `Looking for ${value} jobs? Explore the latest openings in ${city}. LMIA supported positions available. Secure your future with JobMaze.`;
      break;
    case 'noc_code':
      title = `Jobs for NOC ${value} in ${city} (LMIA) | JobMaze`;
      description = `Hiring: Jobs for NOC ${value} in ${city}. This position offers LMIA support for foreign workers. View requirements and apply on JobMaze now.`;
      break;
    case 'employer':
    case 'employer_norm':
      title = `Jobs at ${value} in ${state} (LMIA) | JobMaze`;
      description = `${value} is hiring in ${state}. LMIA available. Join a top employer and settle in Canada. Find more details on JobMaze.`;
      break;
    case 'city':
      title = `Jobs in ${value} | JobMaze`;
      description = `Explore the best Jobs in ${value}. Find roles with LMIA support and competitive pay. Start your job search in ${value} with JobMaze.`;
      break;
    case 'state':
    case 'territory':
    case 'province':
      title = `Jobs in ${value} | JobMaze`;
      description = `Discover high-demand Jobs in ${value}. Featured roles with LMIA available. Your gateway to working in ${value} starts at JobMaze.`;
      break;
    default:
      if (search === 'all') {
        title = 'Hot Leads – Most Applied Jobs in Canada';
        description = 'Explore the most popular and trending job opportunities in Canada. Discover high-demand roles with real-time application data.';
      } else {
        // Generic search fallback
        title = `${value} Jobs in ${city} (LMIA) | JobMaze`;
        description = `Explore ${value} jobs in ${city}. LMIA supported positions available. Secure your future with JobMaze.`;
      }
      break;
  }

  // Construct Canonical URL without query parameters to centralize SEO juice
  const canonicalUrl = `https://jobmaze.ca/search/hot-leads/${search !== 'all' ? search : ''}`;

  let keywords: string[] = [];

  if (search === 'all') {
    keywords = ['hot jobs canada', 'trending jobs canada', 'high demand jobs'];
  }

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default async function Engine({ params, searchParams }: PageProps) {
  const { search } = await params;
  const qs = await searchParams;

  const field = (Array.isArray(qs.field) ? qs.field[0] : qs.field) ?? '';

  return (
    <>
      <SearchResultsLayout
        searchKey={search as string}
        field={field as string}
        searchType="hot_leads" // or "lmia"
      />
    </>
  );
}
