'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import CustomLink from '../../../components/ui/CustomLink';
import { Label } from '@/components/ui/label';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';
import {
  Gift,
  ChevronLeft,
  User,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  KeyRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collison';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { cn } from '@/lib/utils';

export default function SignUpPage() {
  const { isMobile } = useMobile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to the Terms & Privacy Policy',
        variant: 'destructive',
      });
      return;
    }

    if (!name || !email || !password || !userType || !confirmPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: 'Please make sure your passwords match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
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
            user_type: userType,
          },
          emailRedirectTo: `${window.location.origin}/search`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'We have send a confirmation email to your mail.',
        variant: 'default',
      });

      router.push('/search');
      return;
      //   const userId = data.user?.id;

      //   const { error: profileError } = await db.from("credits").insert({
      //     id: userId,
      //     total_credit: 5,
      //     used_credit: 0,
      //   });

      //   if (profileError) throw profileError;
      // } catch (error: unknown) {
      //   const errorMessage =
      //     error instanceof Error ? error.message : "Something went wrong";
      //   toast({
      //     title: "Error",
      //     description: errorMessage,
      //     variant: "destructive",
      // });
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
                <div className="space-y-2 mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Create an account
                  </h1>
                  <p className="text-sm text-gray-500">
                    Enter your details to get started with Job Maze
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Full name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 pl-10"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm text-gray-700 flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10"
                        placeholder="name@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="userType"
                        className="text-sm text-gray-700 flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        You are
                      </Label>
                      <Select value={userType} onValueChange={setUserType}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="employer">Employer</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-sm text-gray-700 flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 pl-10 pr-10"
                          placeholder="••••••••"
                          autoComplete="new-password"
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

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm text-gray-700 flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 pl-10 pr-10"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <Shield className="h-5 w-5" />
                          ) : (
                            <KeyRound className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreed}
                      onCheckedChange={(checked) =>
                        setAgreed(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{' '}
                      <CustomLink
                        href="/terms"
                        className="text-brand-600 hover:text-brand-500"
                      >
                        Terms of Service
                      </CustomLink>{' '}
                      and{' '}
                      <CustomLink
                        href="/privacy"
                        className="text-brand-600 hover:text-brand-500"
                      >
                        Privacy Policy
                      </CustomLink>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                  Already have an account?{' '}
                  <CustomLink
                    href="/sign-in"
                    className="font-medium text-brand-600 hover:text-brand-500"
                  >
                    Sign in
                  </CustomLink>
                </p>
              </motion.div>

              {/* Right Section - Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:block bg-gradient-to-br from-brand-500 to-brand-600 p-8 text-white rounded-xl"
              >
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-6">
                      Start Your Journey Today
                    </h2>
                    <p className="text-lg text-brand-50 mb-8">
                      Join thousands of users who are finding their perfect
                      opportunities with Job Maze.
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

                  {/* Benefits */}
                  <div className="mt-8">
                    <p className="text-brand-100 mb-6 text-sm font-medium">
                      What you'll get
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        '5 Free Credits',
                        'Advanced Search',
                        'Email Alerts',
                        'Saved Searches',
                      ].map((benefit) => (
                        <div
                          key={benefit}
                          className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-orange-200" />
                            <span className="text-sm text-orange-50">
                              {benefit}
                            </span>
                          </div>
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
