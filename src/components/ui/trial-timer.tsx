'use client';

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useControl } from '@/context/control';
import { useTrial } from '@/context/trail';
import { motion, AnimatePresence } from 'framer-motion';

export function TrialTimer() {
  const { remainingTime } = useControl();
  const { isTrialActive } = useTrial();

  if (!isTrialActive) return null;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const isUrgent = remainingTime <= 30; // Last 30 seconds

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg border-2 backdrop-blur-sm transition-colors duration-300 ${isUrgent
            ? 'bg-red-50/90 border-red-300 text-red-700'
            : 'bg-blue-50/90 border-blue-300 text-blue-700'
          }`}
      >
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <AlertCircle className="w-5 h-5" />
            </motion.div>
          ) : (
            <Clock className="w-5 h-5" />
          )}

          <div className="flex flex-col">
            <span className="text-xs font-medium opacity-80">
              {isUrgent ? 'Trial Ending Soon' : 'Free Trial'}
            </span>
            <span className="text-sm font-bold tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
