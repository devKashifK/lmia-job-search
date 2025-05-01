"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="w-full h-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-orange-50">
              <Construction className="w-12 h-12 text-orange-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard Coming Soon
            </h1>
            <p className="text-gray-500 max-w-md">
              We&apos;re working on building an amazing dashboard experience for
              you. In the meantime, you can use the sidebar to navigate to
              different sections.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
