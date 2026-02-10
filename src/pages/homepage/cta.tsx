"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import useMobile from "@/hooks/use-mobile";
import CustomLink from "@/components/ui/CustomLink";

export default function CTA() {
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) {
    return null;
  }

  return (
    <section className="relative py-24 overflow-hidden bg-white">

      {/* Background - Subtle Light Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-50/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40 mix-blend-multiply" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium mb-8"
        >
          <Sparkles className="w-3 h-3 fill-brand-200" />
          <span>Gateway to the Hidden Job Market</span>
        </motion.div>

        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
          Stop Searching. <br />
          Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Winning</span>.
        </h2>

        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of smart job seekers who are skipping the line by accessing raw government hiring data.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <motion.button
            onClick={() => {
              const searchBox = document.getElementById('search-pill-container');
              if (searchBox) {
                searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.location.href = '/search/lmia/all';
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-brand-600 text-white font-bold rounded-xl shadow-xl shadow-brand-200 hover:shadow-2xl hover:bg-brand-700 transition-all flex items-center gap-2"
          >
            Start Free Analysis
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <CustomLink href="/pricing">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:border-brand-200 hover:bg-gray-50 transition-all"
            >
              View Plans
            </motion.button>
          </CustomLink>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Real-time government data</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Instant access</span>
          </div>
        </div>

      </div>
    </section>
  );
}
