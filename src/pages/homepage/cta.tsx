"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Search } from "lucide-react";
import useMobile from "@/hooks/use-mobile";

export default function CTA() {
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) {
    return null;
  }

  return (
    <section className={isMobile ? "py-10 relative" : "py-16 relative"}>
      {/* Background with diagonal split */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br " />
        <div
          className="absolute inset-0 bg-gradient-to-br  opacity-90"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className={isMobile ? "relative max-w-7xl mx-auto px-4" : "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <div className={isMobile ? "flex flex-col gap-8" : "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"}>
          {/* Left Column */}
          <div className="text-gray-900">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="mb-8 inline-block">
                <div className="flex items-center gap-2 text-brand-700  rounded-full px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>No Credit Card Required</span>
                </div>
              </div>
              <h2 className={isMobile ? "text-3xl font-bold mb-4 leading-tight" : "text-5xl md:text-6xl font-bold mb-6 leading-tight"}>
                Start Your Search{" "}
                <span className="text-brand-600">Journey Today</span>
              </h2>
              <p className={isMobile ? "text-sm text-gray-700 mb-6 max-w-lg" : "text-xl text-gray-700 mb-12 max-w-lg"}>
                Get instant access to premium insights with 5 free credits. Join
                thousands of professionals making data-driven decisions.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className={isMobile ? "group relative inline-flex items-center justify-center bg-brand-600 text-white text-base font-semibold px-6 py-3 rounded-xl overflow-hidden transition-all duration-300" : "group relative inline-flex items-center justify-center bg-brand-600 text-white text-lg font-semibold px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-500/20"}>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className={isMobile ? "w-4 h-4" : "w-5 h-5 transform group-hover:translate-x-1 transition-transform"} />
                  </span>
                </button>
                <button className={isMobile ? "group inline-flex items-center justify-center bg-white text-brand-600 text-base font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:bg-brand-50" : "group inline-flex items-center justify-center bg-white text-brand-600 text-lg font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:bg-brand-50"}>
                  <span className="flex items-center gap-2">
                    Watch Demo
                    <Zap className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Hide on mobile */}
          {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Feature Cards */}
            <div className="relative space-y-6">
              {/* Search Card */}
              <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/10 p-6 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Smart Search
                    </h3>
                    <p className="text-sm text-gray-600">
                      Find exactly what you need
                    </p>
                  </div>
                </div>
                <div className="bg-brand-50 rounded-xl p-4">
                  <div className="h-2 w-2/3 bg-brand-200 rounded mb-2" />
                  <div className="h-2 w-1/2 bg-brand-100 rounded" />
                </div>
              </div>

              {/* Stats Card */}
              <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/10 p-6 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm font-medium text-gray-600">
                    Active Users
                  </div>
                  <div className="text-brand-600">↑ 42%</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  10,000+
                </div>
                <div className="flex items-end gap-1 h-24">
                  {[40, 70, 55, 80, 60, 90, 75].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-brand-500 to-brand-600 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Main Card */}
              <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/10 p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      5 Free Credits
                    </h3>
                    <p className="text-gray-600">Start exploring now</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-brand-600" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-full bg-brand-50 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
