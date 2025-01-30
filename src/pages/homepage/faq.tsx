"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Get answers to common questions about our platform
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-lg shadow-md"
              >
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
