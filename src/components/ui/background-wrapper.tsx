"use client";

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export default function BackgroundWrapper({
  children,
}: BackgroundWrapperProps) {
  return (
    <div className="relative min-h-screen  overflow-x-hidden">
      {/* Subtle background blobs */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
