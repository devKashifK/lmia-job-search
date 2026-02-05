'use client';
import CustomLink from '@/components/ui/CustomLink';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Zap,
  Search,
  ArrowRight,
  Users,
  CheckCircle2,
} from 'lucide-react';
import useMobile from '@/hooks/use-mobile';

export default function Hero() {
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) {
    return null;
  }

  return (
    <section className={isMobile ? "py-6 relative overflow-hidden" : "py-10 relative overflow-hidden"}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-brand-200 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-brand-300 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className={isMobile ? "relative z-10 max-w-full w-full mx-auto px-4" : "relative z-10 max-w-full w-full mx-auto px-16"}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={isMobile ? "bg-white/95 backdrop-blur-2xl rounded-2xl shadow-sm border border-gray-100 overflow-hidden" : "bg-white/95 backdrop-blur-2xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden"}
        >
          <div className={isMobile ? "flex flex-col items-center justify-between p-6 gap-6" : "flex flex-col md:flex-row items-center justify-between p-10 md:p-20 gap-10"}>
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={isMobile ? "w-full mb-6" : "md:w-1/2 mb-10 md:mb-0"}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={isMobile ? "inline-flex items-center gap-2 bg-gradient-to-r from-brand-100 to-brand-200 px-3 py-1.5 rounded-full mb-4" : "inline-flex items-center gap-2 bg-gradient-to-r from-brand-100 to-brand-200 px-4 py-2 rounded-full mb-6"}
              >
                <span className={isMobile ? "text-xs font-semibold text-brand-700" : "text-sm font-semibold text-brand-700"}>
                  JobMaze is a job intelligence platform. We do not sell jobs, LMIAs, or visas.
                </span>
              </motion.div>

              <h1 className={isMobile ? "text-2xl font-bold mb-3 leading-tight bg-gradient-to-r from-gray-900 via-brand-700 to-gray-900 bg-clip-text text-transparent" : "text-3xl md:text-4xl font-bold mb-4 leading-tight bg-gradient-to-r from-gray-900 via-brand-700 to-gray-900 bg-clip-text text-transparent"}>
                Find Canadian Jobs. Understand Employer Hiring Trends. Apply Smarter.
              </h1>

              <p className={isMobile ? "text-sm mb-6 text-gray-700" : "text-base md:text-lg mb-8 text-gray-700"}>
                Discover LMIA opportunities, globally open Canadian jobs, and 5-year employer hiring insights —
                <span className="font-semibold text-brand-600">
                  {" "}all in one intelligent platform.
                </span>
              </p>

              <div className={isMobile ? "flex flex-col gap-3" : "flex flex-col sm:flex-row gap-4"}>
                <CustomLink href="/search">
                  <motion.button
                    className={isMobile ? "relative px-6 py-3 rounded-xl font-bold text-white overflow-hidden group bg-gradient-to-r from-brand-600 to-brand-700 shadow-lg shadow-brand-500/30 w-full" : "relative px-8 py-4 rounded-2xl font-bold text-white overflow-hidden group bg-gradient-to-r from-brand-600 to-brand-700 shadow-xl shadow-brand-500/30"}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <span className={isMobile ? "relative z-10 flex items-center justify-center gap-2" : "relative z-10 flex items-center gap-2"}>
                      Search Jobs
                      <Search className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                    </span>
                  </motion.button>
                </CustomLink>

                <CustomLink href="/dashboard">
                  <motion.button
                    className={isMobile ? "px-6 py-3 rounded-xl font-bold text-brand-700 border-2 border-brand-300 bg-brand-50 hover:bg-brand-100 transition-all duration-300 w-full" : "px-8 py-4 rounded-2xl font-bold text-brand-700 border-2 border-brand-300 bg-brand-50 hover:bg-brand-100 transition-all duration-300"}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={isMobile ? "flex items-center justify-center gap-2" : "flex items-center gap-2"}>
                      <TrendingUp className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                      Explore Hiring Trends
                    </span>
                  </motion.button>
                </CustomLink>
              </div>
            </motion.div>

            {/* Visual/Animation Placeholder - Hide on mobile */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="md:w-1/2 flex justify-center relative"
              >
                <div className="relative w-full">
                  {/* Decorative elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-24 h-24 bg-brand-200 rounded-full blur-2xl opacity-60"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-4 -left-4 w-32 h-32 bg-brand-300 rounded-full blur-2xl opacity-60"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                  />

                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50">
                    <video
                      src="/demo.mp4"
                      autoPlay
                      loop
                      muted
                      controls
                      className="rounded-xl w-full"
                    />
                  </div>

                  {/* Floating Stats Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-brand-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-brand-100 to-brand-200 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-brand-700">10K+</p>
                        <p className="text-sm text-gray-600">Active Jobs</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-brand-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-brand-100 to-brand-200 rounded-xl">
                        <Users className="w-6 h-6 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-brand-700">50K+</p>
                        <p className="text-sm text-gray-600">Users</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={isMobile ? "grid grid-cols-1 gap-3 mt-6" : "grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"}
        >
          {[
            {
              icon: Search,
              value: '1M+',
              label: 'Searches Performed',
              color: 'from-brand-100 to-brand-200',
            },
            {
              icon: Zap,
              value: '99%',
              label: 'Success Rate',
              color: 'from-brand-200 to-brand-300',
            },
            {
              icon: CheckCircle2,
              value: '24/7',
              label: 'Support Available',
              color: 'from-brand-100 to-brand-200',
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={isMobile ? "bg-white/90 backdrop-blur-xl rounded-xl p-4 shadow-sm border border-brand-100" : "bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-brand-100 hover:shadow-2xl transition-all duration-300"}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className={isMobile ? `p-2 bg-gradient-to-r ${stat.color} rounded-lg` : `p-3 bg-gradient-to-r ${stat.color} rounded-xl`}
                    whileHover={isMobile ? {} : { rotate: 15, scale: 1.1 }}
                  >
                    <Icon className={isMobile ? "w-5 h-5 text-brand-600" : "w-6 h-6 text-brand-600"} />
                  </motion.div>
                  <div>
                    <h3 className={isMobile ? "text-2xl font-bold text-brand-700" : "text-3xl font-bold text-brand-700"}>
                      {stat.value}
                    </h3>
                    <p className={isMobile ? "text-xs text-gray-600 font-medium" : "text-gray-600 font-medium"}>{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
