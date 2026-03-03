"use client";
import React from "react";
import { ProfileCompletionCheck } from "./profile-completion-check";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication is now strictly handled and guaranteed by the Server Component
  // in `src/app/(authenticated)/layout.tsx` before this client component even mounts.
  // There is no longer any need to show a loading spinner or check sessions here!

  return (
    <>
      <ProfileCompletionCheck />
      {children}
    </>
  );
}
