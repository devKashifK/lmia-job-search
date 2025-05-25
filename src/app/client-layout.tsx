"use client";

import { useEffect, useState } from "react";
import { initializeThemeColor } from "@/lib/colors";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize theme color before rendering
    initializeThemeColor();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null; // Don't render anything until theme is initialized
  }

  return <>{children}</>;
}
