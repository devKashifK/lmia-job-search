import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AuthenticatedLayout from "@/components/ui/authenticated";
import React from "react";

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Initialize the server-side Supabase client to read the user's secure cookies
  const supabase = await createClient();

  // Verify the user's session securely before ANY HTML is sent to the client
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  // If we reach here, the server has cryptographically verified the user is logged in.
  // We can safely render the layout immediately without any client-side loading spinners.
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
