"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomLink from "../CustomLink";
import { Label } from "@/components/ui/label";
import db from "@/db";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import BackgroundWrapper from "@/components/ui/background-wrapper";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collison";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/search";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await db.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error Signing In",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome Back!",
          description: "Sign in successful",
          variant: "success",
        });
        router.push(redirect);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      <BackgroundBeamsWithCollision>
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <div className="w-full max-w-5xl mx-auto">
            <Button
              variant="ghost"
              className="absolute top-6 left-6 h-9 px-4 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-800 transition-all duration-200 z-20"
              asChild
            >
              <CustomLink
                href="/"
                className="gap-2 flex items-center text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                Back
              </CustomLink>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Section - Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-gray-500">
                    Sign in to your account to continue
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 pl-10"
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm text-gray-700 flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <CustomLink
                        href="/forgot-password"
                        className="text-xs font-medium text-brand-600 hover:text-brand-500"
                      >
                        Forgot password?
                      </CustomLink>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 pl-10 pr-10"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-gray-200 hover:bg-gray-50"
                    asChild
                  >
                    <CustomLink href="/sign-up" className="gap-2">
                      Don&apos;t have an account? Sign up and get 10 free
                      credits
                    </CustomLink>
                  </Button>
                </form>
              </motion.div>

              {/* Right Section - Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl p-8 text-white"
              >
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold mb-6">
                    The simplest way to search and analyze data
                  </h2>
                  <p className="text-lg text-brand-50 mb-8">
                    Powerful, self-serve product and growth analytics to help
                    you convert, engage, and retain more users.
                  </p>

                  {/* Preview Box */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="space-y-4">
                      <div className="h-2 w-24 bg-white/20 rounded-full animate-pulse" />
                      <div className="h-12 bg-white/20 rounded-lg animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-2 bg-white/20 rounded-full animate-pulse" />
                        <div className="h-2 bg-white/20 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Logos */}
                <div className="mt-8">
                  <p className="text-brand-100 mb-6 text-sm font-medium">
                    Trusted by leading companies
                  </p>
                  <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10"
                      >
                        <div className="h-6 bg-white/20 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    </BackgroundWrapper>
  );
}
