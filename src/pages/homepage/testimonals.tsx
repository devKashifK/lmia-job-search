"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "John D.",
    role: "Data Analyst",
    initials: "JD",
    content:
      "This platform revolutionized how I access and analyze data. The search capabilities are simply outstanding!",
  },
  {
    name: "Sarah K.",
    role: "Research Manager",
    initials: "SK",
    content:
      "Perfect for professionals seeking actionable insights in seconds. The dynamic charts feature is a game-changer.",
  },
  {
    name: "Mike P.",
    role: "Business Analyst",
    initials: "MP",
    content:
      "The credits-based system is brilliant. It gives me the flexibility to access premium data when I need it most.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600">
            Trusted by professionals worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-gray-50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Avatar className="h-12 w-12 bg-orange-100">
                    <AvatarFallback className="text-orange-600">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex text-orange-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
