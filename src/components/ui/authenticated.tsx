"use client";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import React from "react";
import LoadingScreen from "./loading-screen";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useSession();
  const router = useRouter();

  // Show loading screen while session is loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Only redirect if we're sure there's no session
  if (!session && !loading) {
    router.push("/sign-in");
    return null;
  }

  return <>{children}</>;
}
