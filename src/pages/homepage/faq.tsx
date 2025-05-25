"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { HoverCard } from "@/components/ui/hover-card";

const faqs = [
  {
    question: "How does the credit system work?",
    answer:
      "You receive 5 free credits upon signup. Each premium data access costs 1 credit. You can purchase additional credits as needed through our secure payment system.",
  },
  {
    question: "What kind of data can I access?",
    answer:
      "Our platform provides access to NOC codes, employer information, city data, contact details, and comprehensive statistical analysis of search results.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes, all payments are processed through secure, encrypted channels. We use industry-standard security measures to protect your data.",
  },
  {
    question: "Can I export my search results?",
    answer:
      "Yes, premium users can export search results and statistical data in various formats including CSV and PDF.",
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

export default function FAQ() {
  return (
    <section className="py-16 relative">
      <div className="w-full max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-6">
            Frequently asked questions
          </h2>
          <div className="w-20 h-0.5 bg-gray-200 mx-auto" />
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <HoverCard>
            <div className="bg-white/80 border border-brand-100 rounded-2xl shadow-lg p-8">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div key={index} variants={item}>
                    <AccordionItem
                      value={`item-${index}`}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-brand-50 hover:-translate-y-0.5"
                    >
                      <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900 hover:no-underline group-hover:text-brand-600 transition-colors duration-300">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </HoverCard>
        </motion.div>
      </div>
    </section>
  );
}
