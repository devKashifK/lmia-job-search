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

export default function Hero() {
  return (
    <section className="py-10 relative overflow-hidden">
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

      <div className="relative z-10 max-w-7xl w-full mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center justify-between p-10 md:p-20 gap-10">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:w-1/2 mb-10 md:mb-0"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-100 to-brand-200 px-4 py-2 rounded-full mb-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4 text-brand-600" />
                </motion.div>
                <span className="text-sm font-semibold text-brand-700">
                  Next-Gen Job Search Platform
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-gray-900 via-brand-700 to-gray-900 bg-clip-text text-transparent">
                Empowering Your Search Experience
              </h1>
              
              <p className="text-xl md:text-2xl mb-10 text-gray-700">
                Advanced search, dynamic insights, and seamless monetization—
                <span className="font-semibold text-brand-600">all in one platform.</span>
              </p>

              {/* Features List */}
              <div className="space-y-3 mb-10">
                {[
                  'AI-Powered Job Matching',
                  'Real-Time LMIA Updates',
                  'Trending Opportunities',
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-1 rounded-full bg-brand-100">
                      <CheckCircle2 className="w-5 h-5 text-brand-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <CustomLink href="/search">
                  <motion.button
                    className="relative px-8 py-4 rounded-2xl font-bold text-white overflow-hidden group bg-gradient-to-r from-brand-600 to-brand-700 shadow-xl shadow-brand-500/30"
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
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </CustomLink>
                
                <motion.button
                  className="px-8 py-4 rounded-2xl font-bold text-brand-700 border-2 border-brand-300 bg-brand-50 hover:bg-brand-100 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Explore Features
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {/* Visual/Animation Placeholder */}
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
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          {[
            { icon: Search, value: '1M+', label: 'Searches Performed', color: 'from-brand-100 to-brand-200' },
            { icon: Zap, value: '99%', label: 'Success Rate', color: 'from-brand-200 to-brand-300' },
            { icon: CheckCircle2, value: '24/7', label: 'Support Available', color: 'from-brand-100 to-brand-200' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-brand-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl`}
                    whileHover={{ rotate: 15, scale: 1.1 }}
                  >
                    <Icon className="w-6 h-6 text-brand-600" />
                  </motion.div>
                  <div>
                    <h3 className="text-3xl font-bold text-brand-700">{stat.value}</h3>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
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
