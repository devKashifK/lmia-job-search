"use client";

import { JobCard } from "./job-card";

const FEATURED_JOBS = [
  {
    title: "Technical Support Specialist",
    company: "Google Inc.",
    location: "New Delhi, India",
    type: "PART-TIME" as const,
    salary: "Salary: 20,000 INR - 25,000 INR",
    logo: "/google.svg",
    applicants: "10+",
  },
  {
    title: "Senior UI/UX Designer",
    company: "Apple",
    location: "Boston, USA",
    type: "FULL-TIME" as const,
    salary: "Salary: $30,000 - $55,000",
    logo: "/apple.svg",
    applicants: "9+",
  },
  {
    title: "Marketing Officer",
    company: "Intel Corp",
    location: "Bangalore, India",
    type: "PART-TIME" as const,
    salary: "Salary: 15,000 INR - 35,000 INR",
    logo: "/intel.svg",
    applicants: "30+",
  },
];

export function FeaturedJobs() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-4">Featured Jobs</h2>
      <p className="text-gray-600 text-center mb-12">
        Choose jobs from the top employers and apply for the same.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {FEATURED_JOBS.map((job, index) => (
          <JobCard key={index} {...job} />
        ))}
      </div>

      <div className="text-center mt-8">
        <button className="text-purple-600 font-semibold hover:text-purple-700">
          View all
        </button>
      </div>
    </section>
  );
}
