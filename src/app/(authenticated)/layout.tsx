import AuthenticatedLayout from "@/components/ui/authenticated";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
