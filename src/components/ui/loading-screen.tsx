"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoadingScreen({ className }: { className?: string }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center",
        className
      )}
    >
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <svg
          className="w-24 h-24 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </motion.div>

      {/* Loading Bar */}
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Progress Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-white text-lg font-medium"
      >
        {isComplete ? "Welcome to SearchPro!" : `Loading... ${progress}%`}
      </motion.p>

      {/* Loading Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-white/80 text-center"
      >
        {getLoadingMessage(progress)}
      </motion.div>

      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Completion Animation */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 0] }}
          transition={{ duration: 0.5, times: [0, 0.8, 1] }}
          className="absolute inset-0 bg-white"
        />
      )}
    </div>
  );
}

function getLoadingMessage(progress: number): string {
  if (progress < 25) {
    return "Initializing search engines...";
  } else if (progress < 50) {
    return "Optimizing search algorithms...";
  } else if (progress < 75) {
    return "Preparing your personalized experience...";
  } else if (progress < 100) {
    return "Almost there...";
  } else {
    return "Ready to search!";
  }
}
