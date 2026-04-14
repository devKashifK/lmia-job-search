import { getAgencyProfile, getAgencyClientByUrn } from "@/lib/api/agency";
import PitchClient from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Pitch Deck | JobMaze",
  description: "Secure, anonymized professional profile for employer review.",
  robots: { index: false, follow: false },
};

interface PitchPageProps {
  params: Promise<{ urn: string }>;
}

export default async function PitchPage({ params }: PitchPageProps) {
  const { urn } = await params;

  // 1. Fetch the client
  const client = await getAgencyClientByUrn(urn);
  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
          <p className="text-xl font-bold text-gray-900 mb-2">Pitch Deck Not Found</p>
          <p className="text-gray-500">The link may have expired or is incorrect.</p>
        </div>
      </div>
    );
  }

  // 2. Fetch Agency Profile for branding
  const agency = await getAgencyProfile(client.agency_id);

  return (
    <PitchClient 
      agency={agency} 
      client={client}
    />
  );
}
