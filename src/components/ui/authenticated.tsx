"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileCompletionCheck } from "./profile-completion-check";
import { useSession } from "@/hooks/use-session";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      <ProfileCompletionCheck />
      {children}
    </>
  );
}
