"use client";

import { Search } from "lucide-react";
import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "Quick Link",
    links: ["About", "Contact", "Admin"],
  },
  {
    title: "Candidate",
    links: [
      "Browse Jobs",
      "Browse Employers",
      "Candidate Dashboard",
      "Saved Jobs",
    ],
  },
  {
    title: "Employers",
    links: [
      "Post a Job",
      "Browse Candidates",
      "Employers Dashboard",
      "Applications",
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#faf5ff] border-t border-purple-100 py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-bold">AlwaysApply</span>
          </div>
          <p className="text-gray-600 mb-4">Call now: XXXXXXXXX</p>
          <p className="text-gray-600 text-sm">
            2124 Broad St, Regina, SK S4P 1Y5, Canada
          </p>
        </div>

        {FOOTER_SECTIONS.map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold mb-4">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map((link, i) => (
                <li key={i}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-purple-600"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-purple-100">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2022 GTR - Job Portal. All rights Reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-gray-600 hover:text-purple-600">
              <span className="sr-only">Facebook</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
