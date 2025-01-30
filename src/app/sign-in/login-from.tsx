"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomLink from "../CustomLink";
import { Label } from "@/components/ui/label";
import db from "@/db";
import { useToast } from "@/hooks/use-toast";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collison";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error Signing In:",
        description: error.message,
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "Sign in Successfully",
      });
      router.push(redirect);
    }
  };

  return (
    <BackgroundBeamsWithCollision className="!h-screen">
      <div className="h-screen w-full flex z-10">
        {/* Left Section */}
        <div className="w-full h-full lg:w-[45%] p-8 md:p-14 flex flex-col justify-between">
          <div className="space-y-4 flex h-full justify-center flex-col">
            <div>
              <h1 className="text-4xl font-bold mb-3">Get Started Now</h1>
              <p className="text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 h-12 px-6">
                {/* Google SVG icon */}
                Log in with Google
              </Button>
              <Button variant="outline" className="flex-1 h-12 px-6">
                {/* Twitter SVG icon */}
                Log in with Twitter
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  placeholder="Min 8 characters"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-orange-600 hover:bg-orange-700"
              >
                Sign In
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t Have an account?{" "}
              <CustomLink
                href="/sign-up"
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                Sign Up
              </CustomLink>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden lg:block w-[55%] my-2 mx-2 bg-gradient-to-br from-orange-500 to-red-600 p-14 text-white rounded-lg">
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">
                The simplest way to search and analyze data
              </h2>
              <p className="text-lg text-orange-50 mb-8">
                Enter your credentials to access your account
              </p>

              {/* Example Preview Box */}
              <div className="w-full">
                <div className="bg-white p-4 rounded-lg shadow-xl">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center p-8">
                      <svg
                        className="w-16 h-28 mx-auto text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 60"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <p className="mt-4 text-gray-600">
                        Interactive Search Demo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Logos */}
            <div className="mt-auto">
              <p className="text-orange-100 mb-6 text-sm">
                Trusted by leading companies
              </p>
              <div className="grid grid-cols-4 gap-8 items-center">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur p-4 rounded-lg"
                  >
                    <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
