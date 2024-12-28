"use client";

import Image from "next/image";

const COMPANIES = [
  "/google.svg",
  "/microsoft.svg",
  "/flipkart.svg",
  "/youtube.svg",
  "/ibm.svg",
];

export function CompanySection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h3 className="text-xl font-semibold text-center mb-8">
        Top companies hiring now
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
        {COMPANIES.map((logo, index) => (
          <div key={index} className="flex items-center justify-center">
            <Image
              src={logo}
              alt="Company logo"
              width={120}
              height={40}
              className="opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
