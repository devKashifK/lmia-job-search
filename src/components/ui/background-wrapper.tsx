"use client";

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export default function BackgroundWrapper({
  children,
}: BackgroundWrapperProps) {
  return (
    <div className="relative min-h-screen bg-orange-50/80 overflow-x-hidden">
      {/* Subtle background blobs */}
      <svg
        className="absolute -top-32 -left-40 w-[700px] h-[500px] opacity-10 pointer-events-none select-none"
        viewBox="0 0 700 500"
        fill="none"
      >
        <ellipse cx="350" cy="250" rx="350" ry="200" fill="#FDBA74" />
      </svg>
      <svg
        className="absolute bottom-0 right-0 w-[400px] h-[300px] opacity-10 pointer-events-none select-none"
        viewBox="0 0 400 300"
        fill="none"
      >
        <ellipse cx="200" cy="150" rx="200" ry="120" fill="#F87171" />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
