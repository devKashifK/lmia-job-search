"use client";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import React from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const router = useRouter();

  if (!session) {
    router.push("/sign-in");
    return;
  }

  return <>{children}</>;
}
