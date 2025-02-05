"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import CustomLink from "../CustomLink";
import { Label } from "@/components/ui/label";
import db from "@/db";
import { useToast } from "@/hooks/use-toast";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collison";
import { Gift, ChevronLeft } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the Terms & Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    if (!name || !email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await db.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/search`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Please check your email to verify your account",
        variant: "default",
      });
      const userId = data.user?.id;

      const { error: profileError } = await db.from("credits").insert({
        id: userId,
        total_credit: 5,
        used_credit: 0,
      });

      if (profileError) throw profileError;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundBeamsWithCollision className="!h-screen">
      {/* Updated Back to Home Button */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 h-9 px-4 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-zinc-200/20 rounded-full text-zinc-800 transition-all duration-200 z-20"
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

      <div className="h-screen w-full flex z-10">
        {/* Left Section */}
        <div className="w-full h-full lg:w-[45%] p-8 md:p-14 flex flex-col justify-between">
          <div className="max-w-md w-full mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-zinc-500">
                Enter your details to get started with SearchPro
              </p>
            </div>

            {/* <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 text-zinc-600 hover:text-zinc-700"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "This feature will be available soon!",
                    variant: "info",
                  });
                }}
              >
                <Github className="mr-2 h-4 w-4" />
                Continue with Github
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 text-zinc-600 hover:text-zinc-700"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "This feature will be available soon!",
                    variant: "info",
                  });
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-500">
                  Or continue with
                </span>
              </div>
            </div> */}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-zinc-700">
                  Full name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-zinc-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-zinc-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 flex items-start gap-3">
                <Gift className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-800">
                    Free Credits on Signup
                  </p>
                  <p className="text-xs text-orange-700">
                    Get 5 free credits when you create your account to explore
                    our premium features
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-zinc-600">
                  By creating an account, you agree to our{" "}
                  <CustomLink
                    href="#"
                    className="font-medium text-orange-600 hover:text-orange-500"
                  >
                    Terms of Service
                  </CustomLink>{" "}
                  and{" "}
                  <CustomLink
                    href="#"
                    className="font-medium text-orange-600 hover:text-orange-500"
                  >
                    Privacy Policy
                  </CustomLink>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <CustomLink
                href="/sign-in"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Sign in
              </CustomLink>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden lg:block w-[55%] my-2 mr-2 bg-gradient-to-br from-orange-500 to-red-600 p-14 text-white rounded-xl">
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">
                The simplest way to search and analyze data
              </h2>
              <p className="text-lg text-orange-50 mb-8">
                Powerful, self-serve product and growth analytics to help you
                convert, engage, and retain more users.
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
            <div className="mt-auto">
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
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
