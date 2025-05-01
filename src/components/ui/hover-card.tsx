"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCard({ children, className }: HoverCardProps) {
  return (
    <motion.div className={cn("group relative", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-xl transform rotate-1 transition-transform duration-300 group-hover:rotate-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-xl transform -rotate-1 transition-transform duration-300 group-hover:rotate-0" />
      <div className="relative transition-all duration-300 group-hover:-translate-y-1">
        {children}
      </div>
    </motion.div>
  );
}

export function HoverCardTrigger({ children, className }: HoverCardProps) {
  return <div className={cn("cursor-pointer", className)}>{children}</div>;
}

export function HoverCardContent({ children, className }: HoverCardProps) {
  return (
    <div
      className={cn(
        "absolute z-50 w-80 rounded-md border bg-white/90 backdrop-blur-sm p-4 shadow-lg",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
