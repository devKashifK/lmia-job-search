"use client";

import { useEffect, useState } from "react";
import { initializeThemeColor } from "@/lib/colors";
import { useSession } from "@/hooks/use-session";
import { TrialTimer } from "@/components/ui/trial-timer";
import useMobile from "@/hooks/use-mobile";
import { BottomNav } from "@/components/mobile/bottom-nav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const session = useSession();
  const { isMobile } = useMobile();

  useEffect(() => {
    // Initialize theme color before rendering
    initializeThemeColor(session);
    setIsInitialized(true);
  }, [session]);

  if (!isInitialized) {
    return null; // Don't render anything until theme is initialized
  }

  return (
    <>
      <TrialTimer />
      {children}
      {isMobile && <BottomNav />}
    </>
  );
}
