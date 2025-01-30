"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started",
    features: ["5 Free Credits", "Basic Search", "Standard Charts"],
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "Best for regular users",
    features: [
      "100 Credits/month",
      "Advanced Search",
      "Premium Charts",
      "Priority Support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For large organizations",
    features: ["Unlimited Credits", "Custom API Access", "Dedicated Support"],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? "scale-105 shadow-xl" : "hover:shadow-lg"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 rounded-bl-lg">
                  Popular
                </div>
              )}
              <CardHeader className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="w-5 h-5 text-orange-500 mr-3" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 rounded-full">
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
