"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, Sparkles, Shield, Zap } from "lucide-react";

export default function LoadingScreen({ className }: { className?: string }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);

  const icons = [
    {
      icon: Search,
      text: "Initializing search engines...",
    },
    {
      icon: Sparkles,
      text: "Optimizing algorithms...",
    },
    {
      icon: Shield,
      text: "Securing your connection...",
    },
    {
      icon: Zap,
      text: "Powering up systems...",
    },
  ];

  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(iconInterval);
          setIsComplete(true);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => {
      clearInterval(progressInterval);
      clearInterval(iconInterval);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center",
        className
      )}
    >
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12"
        >
          <div className="relative flex items-center justify-center gap-4">
            <motion.div
              className="text-5xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Job Maze
            </motion.div>

            {/* Animated Icon */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIconIndex}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  {React.createElement(icons[currentIconIndex].icon, {
                    className: "w-6 h-6 text-white",
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-80 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Loading Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIconIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-6 text-center"
          >
            <p className="text-white/90 text-lg font-medium">
              {icons[currentIconIndex].text}
            </p>
            <p className="text-white/60 text-sm mt-1">{progress}% Complete</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Completion Animation */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 200,
              }}
              className="text-gradient text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text"
            >
              Welcome to Job Maze!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
