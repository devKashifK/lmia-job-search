'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomLink from '../../../components/ui/CustomLink';
import { Label } from '@/components/ui/label';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collison';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { cn } from '@/lib/utils';

export default function LoginForm() {
  const { isMobile } = useMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';

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
          title: 'Error Signing In',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome Back!',
          description: 'Sign in successful',
          variant: 'success',
        });
        router.push(redirect);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundWrapper className="flex-col flex">
      <BackgroundBeamsWithCollision className="flex-col flex">
        {isMobile && (
          <MobileHeader className="w-full" title="Sign In" showBack={true} />
        )}
        <div
          className={cn(
            'w-full flex items-center justify-center flex-col',
            isMobile ? 'min-h-screen p-4 pt-20' : 'min-h-screen p-4'
          )}
        >
          <div className="w-full max-w-5xl mx-auto">
            {!isMobile && (
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
            )}

            <div
              className={cn(
                'grid gap-8',
                isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
              )}
            >
              {/* Left Section - Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'bg-white rounded-xl shadow-sm border border-gray-200',
                  isMobile ? 'p-6' : 'p-8'
                )}
              >
                <div className={cn('text-center', isMobile ? 'mb-6' : 'mb-8')}>
                  <h2
                    className={cn(
                      'font-semibold text-gray-900 mb-2',
                      isMobile ? 'text-xl' : 'text-2xl'
                    )}
                  >
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
                        type={showPassword ? 'text' : 'password'}
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
                    {isLoading ? 'Signing in...' : 'Sign in'}
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
                    className="w-full h-12 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const { error, data } = await db.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: `${
                              window.location.origin
                            }/sign-in?redirect=${encodeURIComponent(redirect)}`,
                          },
                        });
                        if (error) {
                          toast({
                            title: 'Google Sign-In Error',
                            description: error.message,
                            variant: 'destructive',
                          });
                        } else if (data?.url) {
                          window.location.href = data.url;
                        }
                      } catch (err) {
                        toast({
                          title: 'Google Sign-In Error',
                          description:
                            err instanceof Error
                              ? err.message
                              : 'Unknown error',
                          variant: 'destructive',
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {/* Google SVG icon */}
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="w-5 h-5"
                    >
                      <path
                        fill="#fbc02d"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                      <path
                        fill="#e53935"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      />
                      <path
                        fill="#4caf50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      />
                      <path
                        fill="#1565c0"
                        d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                    </svg>
                    {isLoading ? 'Signing in...' : 'Sign in with Google'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-gray-200 hover:bg-gray-50"
                    asChild
                  >
                    <CustomLink href="/sign-up" className="gap-2 text-xs">
                      Don&apos;t have an account? Sign up and get 10 free
                      credits
                    </CustomLink>
                  </Button>
                </form>
              </motion.div>

              {/* Right Section - Preview (Desktop Only) */}
              {!isMobile && (
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
              )}
            </div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    </BackgroundWrapper>
  );
}
