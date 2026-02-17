'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomLink from '../../../components/ui/CustomLink';
import { Label } from '@/components/ui/label';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Lock, User, ArrowRight, Mail, Briefcase } from 'lucide-react';
import Logo from '@/components/ui/logo';
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
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative">

          {/* Back Button (Desktop) */}
          {!isMobile && (
            <Button
              variant="ghost"
              className="absolute top-8 left-8 h-9 px-4 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/20 rounded-full text-gray-700 hover:text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md z-20 group"
              asChild
            >
              <CustomLink
                href="/"
                className="gap-2 flex items-center text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                Back
              </CustomLink>
            </Button>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-4xl relative z-10"
          >
            {/* Glass Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[520px]">

              {/* Left Side - Form */}
              <div className="p-8 md:p-10 flex flex-col justify-center relative">
                {/* Decorative Top Highlight (Mobile only/spanning) */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 opacity-80 md:hidden" />

                <div className="mb-8 text-center md:text-left">
                  {/* Logo */}
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                    <div className="p-1.5 bg-brand-50 rounded-lg border border-brand-100 shadow-sm">
                      <Logo className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-bold text-gray-900 tracking-tight">Job Maze</span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your details to access your dashboard.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-gray-700 ml-1">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 bg-white/50 border-gray-200 focus:bg-white pl-9 text-sm transition-all shadow-sm focus:ring-brand-500/20"
                        placeholder="name@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
                        Password
                      </Label>
                      <CustomLink
                        href="/forgot-password"
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline transition-all"
                      >
                        Forgot?
                      </CustomLink>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 bg-white/50 border-gray-200 focus:bg-white pl-9 pr-9 text-sm transition-all shadow-sm focus:ring-brand-500/20"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-medium shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200/60" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold text-gray-400">
                    <span className="bg-white/80 backdrop-blur-sm px-2">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 bg-white/50 hover:bg-white border-gray-200 hover:border-gray-300 text-gray-700 shadow-sm transition-all hover:shadow-md flex items-center justify-center gap-2"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const { error, data } = await db.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: `${window.location.origin}/sign-in?redirect=${encodeURIComponent(redirect)}`,
                        },
                      });
                      if (error) throw error;
                      if (data?.url) window.location.href = data.url;
                    } catch (err) {
                      toast({
                        title: 'Google Sign-In Error',
                        description: err instanceof Error ? err.message : 'Unknown error',
                        variant: 'destructive',
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  <span className="font-medium">Google</span>
                </Button>

                <p className="text-center text-xs text-gray-500 mt-6">
                  Don&apos;t have an account?{' '}
                  <CustomLink
                    href="/sign-up"
                    className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                  >
                    Sign up for free
                  </CustomLink>
                </p>
              </div>

              {/* Right Side - Visual Content */}
              <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-600 to-brand-500 text-white relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/20 rounded-full blur-3xl translate-y-10 -translate-x-10 pointer-events-none" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/20 mb-6 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live System Status
                  </div>
                  <h3 className="text-3xl font-bold leading-tight">
                    Your Career,<br />Fast-Tracked.
                  </h3>
                  <p className="text-brand-50 mt-4 text-sm leading-relaxed max-w-sm opacity-90">
                    "Job Maze helped me secure a verified LMIA job in just 2 weeks. The automated alerts are a game changer."
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-brand-200 border-2 border-white flex items-center justify-center text-brand-700 font-bold text-xs">A</div>
                    <div className="text-xs">
                      <p className="font-semibold">Alex M.</p>
                      <p className="text-brand-100 opacity-80">Software Engineer</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card Visual */}
                <div className="relative z-10 mt-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg transform translate-x-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-green-300">
                          <Briefcase className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium">New Match Found</span>
                      </div>
                      <span className="text-[10px] text-brand-100">Just now</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 w-3/4 bg-white/20 rounded animate-pulse" />
                      <div className="h-2 w-1/2 bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </BackgroundBeamsWithCollision>
    </BackgroundWrapper>
  );
}
