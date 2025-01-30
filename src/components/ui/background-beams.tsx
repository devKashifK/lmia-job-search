"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 opacity-50 mix-blend-soft-light",
        className
      )}
      style={{
        backgroundImage: `
          radial-gradient(circle at top left, rgba(255, 140, 50, 0.15), transparent 25%),
          radial-gradient(circle at top right, rgba(156, 39, 176, 0.15), transparent 25%),
          radial-gradient(at bottom left, rgba(255, 140, 50, 0.15), transparent 25%),
          radial-gradient(at bottom right, rgba(156, 39, 176, 0.15), transparent 25%)
        `,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[100px]" />
    </div>
  );
};
