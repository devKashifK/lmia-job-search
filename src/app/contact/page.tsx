"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import CustomLink from "../CustomLink";
import { useSession } from "@/hooks/use-session";
import UserDropdown from "@/components/ui/user-dropdown";
import Footer from "@/pages/homepage/footer";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamically import the Map component with SSR disabled
const DynamicMap = dynamic(() => import("./map"), { ssr: false });

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 flex items-center justify-between">
        <CustomLink href="/" className="flex items-center space-x-2">
          <span className="text-white text-xl font-semibold">SearchPro</span>
        </CustomLink>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="#"
            className="text-white hover:text-white/80 transition-colors"
          >
            What is SearchPro?
          </Link>
          <Link
            href="#"
            className="text-white hover:text-white/80 transition-colors"
          >
            Features
          </Link>
          {session ? (
            <UserDropdown className="bg-white" />
          ) : (
            <>
              <CustomLink
                href="/sign-in"
                className="text-white hover:underline"
              >
                Sign In
              </CustomLink>
              <CustomLink
                href="/sign-up"
                className="text-white hover:underline"
              >
                Sign Up
              </CustomLink>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        {/* Floating Avatars */}
        <div className="absolute top-20 left-[15%] animate-float-slow">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/50 shadow-lg">
            <Image
              src="/photo-2.jpg"
              alt="Team member"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
        </div>
        <div className="absolute top-40 right-[20%] animate-float-delayed">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/50 shadow-lg">
            <Image
              src="/photo-3.jpg"
              alt="Team member"
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
        </div>
        <div className="absolute bottom-20 left-[30%] animate-float">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/50 shadow-lg">
            <Image
              src="/photo-1.jpeg"
              alt="Team member"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-40 text-center relative z-10">
          <h1 className="text-5xl font-bold text-white mb-4">Contact</h1>
          <p className="text-white/90 text-xl max-w-2xl mx-auto">
            Let's start something great together. Get in touch with one of the
            team today!
          </p>
        </div>

        {/* Bottom SVG Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            viewBox="0 0 1440 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 200V80C240 0 480 160 720 160C960 160 1200 0 1440 80V200H0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Get in touch
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Phone
                  </h3>
                  <p className="text-gray-600">
                    Please email us or request a callback.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Email
                  </h3>
                  <div className="space-y-2">
                    <a
                      href="mailto:hello@searchpro.com"
                      className="block text-orange-600 hover:text-orange-700"
                    >
                      hello@searchpro.com
                    </a>
                    <a
                      href="mailto:business@searchpro.com"
                      className="block text-orange-600 hover:text-orange-700"
                    >
                      business@searchpro.com
                    </a>
                    <a
                      href="mailto:support@searchpro.com"
                      className="block text-orange-600 hover:text-orange-700"
                    >
                      support@searchpro.com
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    London Office
                  </h3>
                  <p className="text-gray-600">
                    123 Business Street
                    <br />
                    London, SW1A 1AA
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First name
                    </label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12"
                      placeholder="Mike"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                    placeholder="mike@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12"
                    placeholder="+44 20 1234 5678"
                  />
                </div>

                <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700">
                  Send message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 border-b">
              <CardTitle className="text-lg font-semibold text-white">
                Our Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Render the dynamic, client-only Map */}
              <DynamicMap />
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
