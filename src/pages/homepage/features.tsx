"use client";

import {
  Search,
  BarChart2,
  CreditCard,
  Lock,
  Filter,
  Play,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Advanced Search",
    description:
      "Fuzzy search across multiple fields like NOC Code, Employer, and City.",
    icon: Search,
  },
  {
    title: "Dynamic Charts",
    description:
      "Visualize your search results with statistics—highest, lowest, and average values.",
    icon: BarChart2,
  },
  {
    title: "Credits-Based Model",
    description:
      "5 free credits on login, purchase more for advanced features.",
    icon: CreditCard,
  },
  {
    title: "Premium Information",
    description: "Access locked phone and email details with secure payments.",
    icon: Lock,
  },
  {
    title: "Real-Time Filtering",
    description:
      "Filter search results dynamically without altering original data.",
    icon: Filter,
  },
  {
    title: "Live Preview",
    description: "Preview search results instantly as you type.",
    icon: Play,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Enhanced Search
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to streamline your search experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <feature.icon className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
