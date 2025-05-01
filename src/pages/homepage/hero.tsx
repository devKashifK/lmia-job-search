"use client";
import CustomLink from "@/app/CustomLink";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="py-24">
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4">
        <div className="bg-white/90 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between p-10 md:p-20 gap-10">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 text-gray-900 mb-10 md:mb-0"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Empowering Your Search Experience
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-orange-600">
              Advanced search, dynamic insights, and seamless monetization—all
              in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <CustomLink
                href="/search"
                className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Get Started
              </CustomLink>
              <button className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-orange-600 hover:text-white transition-all duration-300 hover:scale-105">
                Watch Demo
              </button>
            </div>
          </motion.div>
          {/* Visual/Animation Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="bg-orange-100/60 rounded-2xl shadow-xl p-8 flex items-center justify-center w-full max-w-xs aspect-square">
              <svg
                className="w-24 h-24 text-orange-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </motion.div>
        </div>
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12"
        >
          <div className="bg-orange-100/60 rounded-xl p-8 text-orange-700 text-center shadow hover:bg-orange-200/60 transition-all duration-300">
            <h3 className="text-4xl font-bold mb-3">10K+</h3>
            <p className="text-orange-600">Active Users</p>
          </div>
          <div className="bg-orange-100/60 rounded-xl p-8 text-orange-700 text-center shadow hover:bg-orange-200/60 transition-all duration-300">
            <h3 className="text-4xl font-bold mb-3">1M+</h3>
            <p className="text-orange-600">Searches Performed</p>
          </div>
          <div className="bg-orange-100/60 rounded-xl p-8 text-orange-700 text-center shadow hover:bg-orange-200/60 transition-all duration-300">
            <h3 className="text-4xl font-bold mb-3">99%</h3>
            <p className="text-orange-600">Customer Satisfaction</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
