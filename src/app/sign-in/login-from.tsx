"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomLink from "../CustomLink";
import { Label } from "@/components/ui/label";
import db from "@/db";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Github,
  Mail,
  ChevronLeft,
  CheckCircle2,
  Shield,
  KeyRound,
  Lock,
  User,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import BackgroundWrapper from "@/components/ui/background-wrapper";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collison";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<
    "email" | "github" | "google" | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/dashboard";

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

  const steps = [
    { id: 1, title: "Welcome", description: "Choose your sign-in method" },
    { id: 2, title: "Credentials", description: "Enter your account details" },
  ];

  const handleMethodSelect = (method: "email" | "github" | "google") => {
    setSelectedMethod(method);
    if (method === "email") {
      setStep(2);
    } else {
      toast({
        title: "Coming Soon",
        description: "This feature will be available soon!",
        variant: "info",
      });
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
              {/* Left Section - Steps and Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
              >
                {/* Steps Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {steps.map((s, index) => (
                      <div key={s.id} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step >= s.id
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step > s.id ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            s.id
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`h-0.5 w-16 mx-2 ${
                              step > s.id ? "bg-orange-500" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {steps[step - 1].title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {steps[step - 1].description}
                    </p>
                  </div>
                </div>

                {step === 1 ? (
                  <div className="space-y-4">
                    <Button
                      variant={
                        selectedMethod === "github" ? "default" : "outline"
                      }
                      className={`w-full h-12 ${
                        selectedMethod === "github"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "text-gray-600 hover:text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleMethodSelect("github")}
                    >
                      <Github className="mr-2 h-5 w-5" />
                      Continue with Github
                    </Button>
                    <Button
                      variant={
                        selectedMethod === "google" ? "default" : "outline"
                      }
                      className={`w-full h-12 ${
                        selectedMethod === "google"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "text-gray-600 hover:text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleMethodSelect("google")}
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Continue with Google
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={
                        selectedMethod === "email" ? "default" : "outline"
                      }
                      className={`w-full h-12 ${
                        selectedMethod === "email"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "text-gray-600 hover:text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleMethodSelect("email")}
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Continue with Email
                    </Button>
                  </div>
                ) : (
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
                        className="h-12 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 pl-10"
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
                          className="text-xs font-medium text-orange-600 hover:text-orange-500"
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
                          className="h-12 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 pl-10 pr-10"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <Shield className="h-5 w-5" />
                          ) : (
                            <KeyRound className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(1)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="h-12 bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                <p className="text-center text-sm text-gray-600 mt-6">
                  Don&apos;t have an account?{" "}
                  <CustomLink
                    href="/sign-up"
                    className="font-medium text-orange-600 hover:text-orange-500"
                  >
                    Sign up
                  </CustomLink>
                </p>
              </motion.div>

              {/* Right Section - Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:block bg-gradient-to-br from-orange-500 to-red-600 p-8 text-white rounded-xl"
              >
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-6">
                      The simplest way to search and analyze data
                    </h2>
                    <p className="text-lg text-orange-50 mb-8">
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
                    <p className="text-orange-100 mb-6 text-sm font-medium">
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
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    </BackgroundWrapper>
  );
}
