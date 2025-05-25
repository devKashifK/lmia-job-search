"use client";

import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="relative group h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-600 opacity-5 rounded-2xl blur-xl transition-opacity duration-300 group-hover:opacity-10" />
      <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-brand-100/20 transition-all duration-300 group-hover:shadow-brand-500/5">
        <div className="flex flex-col items-center text-center h-full">
          <span className="text-4xl transform transition-transform duration-300 group-hover:scale-110 mb-4">
            {icon}
          </span>
          <div className="flex flex-col flex-1 justify-between gap-3">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
