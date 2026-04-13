import { getClientStrategy, getAgencyProfile, getAgencyClients, AgencyClient } from "@/lib/api/agency";
import db from "@/db";
import ReportClient from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Progress Report | JobMaze",
  description: "View your current job search progress and strategic immigration roadmap.",
  robots: { index: false, follow: false },
};

interface ReportPageProps {
  params: Promise<{ urn: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { urn } = await params;

  // 1. Fetch the strategy (source of truth for URN)
  const strategy = await getClientStrategy(urn);
  if (!strategy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
          <p className="text-xl font-bold text-gray-900 mb-2">Report Not Found</p>
          <p className="text-gray-500">The link may have expired or is incorrect.</p>
        </div>
      </div>
    );
  }

  // 2. Fetch Agency Profile for branding
  const agency = await getAgencyProfile(strategy.agency_id);
  
  // 3. Fetch Client Basic Info (to get name, etc)
  const { data: clients } = await (db.from('agency_clients') as any)
    .select('*')
    .eq('urn', urn)
    .eq('agency_id', strategy.agency_id);

  const client = clients?.[0] || null;

  // 4. Fetch Applications status
  const { data: applications } = await (db.from('job_applications') as any)
    .select('*')
    .eq('client_urn', urn);

  // 5. Fetch Calculator Results
  const { data: scores } = await (db.from('calculator_results') as any)
    .select('*')
    .eq('client_id', client?.id)
    .order('created_at', { ascending: false });

  return (
    <ReportClient 
      strategy={strategy} 
      agency={agency} 
      client={client}
      applications={applications || []}
      scores={scores || []}
    />
  );
}
