"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Find a job that aligns with your interests and skills
        </h1>
        <p className="text-gray-600 mb-8">
          Thousands of jobs in all the leading sector are waiting for you.
        </p>

        <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Job title, Keyword..."
                className="pl-10"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" />
              <Input type="text" placeholder="Location" className="pl-10" />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Find Job
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <span className="mr-2">Suggestion:</span>
          <span className="text-purple-600">
            UI/UX Designer, Programming, Digital Marketing, Video, Animation
          </span>
        </div>
      </div>

      <div className="relative h-[400px]">
        <Image
          src="/job-search.svg"
          alt="Job Search Illustration"
          fill
          className="object-contain"
        />
      </div>
    </section>
  );
}
