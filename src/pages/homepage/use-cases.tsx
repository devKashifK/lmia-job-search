"use client";

import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/section-title";

// Mock application interface examples
const useCases = [
  {
    title: "Interactive Search Interface",
    description:
      "Find exactly what you need with our powerful search filters. Filter by NOC codes, locations, employers, and more.",
    content: (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
        {/* Mock search interface */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 h-10 bg-gray-100 rounded-md" />
          <div className="w-20 h-10 bg-orange-500 rounded-md" />
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-50 rounded-md border border-gray-200 p-3">
            <div className="w-2/3 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-1/2 h-4 bg-gray-100 rounded" />
          </div>
          <div className="h-16 bg-gray-50 rounded-md border border-gray-200 p-3">
            <div className="w-3/4 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-1/3 h-4 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Data Visualization",
    description:
      "Transform your search results into beautiful, insightful charts and visualizations for better understanding.",
    content: (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
        {/* Mock chart interface */}
        <div className="flex items-end h-32 gap-3 mb-4 pt-8">
          <div
            className="flex-1 bg-orange-200 rounded-t"
            style={{ height: "60%" }}
          />
          <div
            className="flex-1 bg-orange-300 rounded-t"
            style={{ height: "80%" }}
          />
          <div
            className="flex-1 bg-orange-400 rounded-t"
            style={{ height: "40%" }}
          />
          <div
            className="flex-1 bg-orange-500 rounded-t"
            style={{ height: "90%" }}
          />
          <div
            className="flex-1 bg-orange-600 rounded-t"
            style={{ height: "70%" }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 px-2">
          <div>Jan</div>
          <div>Feb</div>
          <div>Mar</div>
          <div>Apr</div>
          <div>May</div>
        </div>
      </div>
    ),
  },
  {
    title: "Advanced Filtering",
    description:
      "Use our comprehensive filtering system to narrow down results and find the most relevant opportunities.",
    content: (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
        {/* Mock filter interface */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <div className="flex-1 h-8 bg-gray-100 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-400" />
            <div className="flex-1 h-8 bg-gray-100 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-300" />
            <div className="flex-1 h-8 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Export Options",
    description:
      "Download and share your findings in multiple formats. Export to PDF, Excel, or share directly with your team.",
    content: (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
        {/* Mock export interface */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-gray-50 rounded border border-gray-200 p-3 flex flex-col items-center justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded mb-2" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
          <div className="h-20 bg-gray-50 rounded border border-gray-200 p-3 flex flex-col items-center justify-center">
            <div className="w-8 h-8 bg-orange-400 rounded mb-2" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ),
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function UseCases() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title="Use Cases"
          subtitle="Discover how our platform can help you achieve your goals"
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {useCases.map((uc) => (
            <motion.div
              key={uc.title}
              variants={item}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-xl transform rotate-1 transition-transform duration-300 group-hover:rotate-0" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-xl transform -rotate-1 transition-transform duration-300 group-hover:rotate-0" />

              <div className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                {/* Visual Example */}
                <div className="aspect-[16/9]">{uc.content}</div>

                {/* Description */}
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                    {uc.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {uc.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
