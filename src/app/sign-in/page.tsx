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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await db.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      toast({
        title: "Error Signing In: ",
        description: error.message,
        // action: (
        //   <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
        // ),
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "Sign in Successfully",
        // action: (
        //   <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
        // ),
      });
      router.push(redirect);
    }
  };

  return (
    <BackgroundBeamsWithCollision className="!h-screen">
      <div className="    h-screen w-full flex z-10">
        {/* Left Section */}

        <div className="w-full h-full lg:w-[45%] p-8 md:p-14 flex flex-col justify-between">
          {/* <div className="mb-12">
            <svg
              className="w-10 h-10 text-orange-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div> */}

          <div className="space-y-4 flex h-full justify-center  flex-col">
            <div>
              <h1 className="text-4xl font-bold mb-3">Get Started Now</h1>
              <p className="text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 h-12 px-6">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Log in with Google
              </Button>
              <Button variant="outline" className="flex-1 h-12 px-6">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Log in with Twitter
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
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

          {/* <div className="text-center text-sm text-gray-500 mt-8">
          © 2024 SearchPro. All rights reserved.
        </div> */}
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

              {/* Dashboard Preview */}
              {/* <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Dashboard Preview"
                width={800}
                height={400}
                className="rounded-lg w-full"
              />
            </div> */}
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
