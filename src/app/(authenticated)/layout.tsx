import AuthenticatedLayout from "@/components/ui/authenticated";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  // Auth is checked client-side by <AuthenticatedLayout> which reads from
  // the localStorage-based Supabase session (db.auth.getSession).
  // Do NOT use @supabase/ssr server check here — it reads cookies,
  // but the app's session is stored in localStorage via the JS SDK.
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
