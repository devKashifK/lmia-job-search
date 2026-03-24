'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomLink from '../../../components/ui/CustomLink';
import { Label } from '@/components/ui/label';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { motion } from 'framer-motion';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collison';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { useSession } from '@/hooks/use-session';

export default function ResetPasswordForm() {
  const { isMobile } = useMobile();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Redirect if no session is found after a reasonable delay (to allow hash parsing)
  useEffect(() => {
    if (sessionLoading || otpVerified) return;

    if (!session) {
      // Check if we have an access token in the hash (Supabase Implicit Flow)
      const hasHashToken = typeof window !== 'undefined' && window.location.hash.includes('access_token=');
      
      if (hasHashToken) {
        // Wait a bit more for Supabase to parse the hash
        const timer = setTimeout(() => {
          if (!session) {
            // We stay on the page but show the OTP fallback instead of immediate redirect
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [session, sessionLoading, otpVerified]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    try {
      const { error } = await db.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'recovery',
      });

      if (error) {
        toast({
          title: 'Verification Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setOtpVerified(true);
        toast({
          title: 'Code Verified!',
          description: 'You can now set your new password.',
          variant: 'success',
        });
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await db.auth.updateUser({ password });

      if (error) {
        toast({
          title: 'Update Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setIsReset(true);
        toast({
          title: 'Password Updated!',
          description: 'Your password has been reset successfully.',
          variant: 'success',
        });
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const showPasswordForm = session || otpVerified;

  return (
    <BackgroundWrapper className="flex-col flex">
      <BackgroundBeamsWithCollision className="flex-col flex">
        {isMobile && (
          <MobileHeader className="w-full" title={showPasswordForm ? "New Password" : "Verify Code"} showBack={true} />
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
                href="/forgot-password"
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
            className="w-full max-w-md relative z-10"
          >
            {/* Glass Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-2xl overflow-hidden p-8 md:p-10 relative">
              {/* Decorative Glow */}
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="mb-8 text-center">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="p-1.5 bg-brand-50 rounded-lg border border-brand-100 shadow-sm">
                    <Logo className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-bold text-gray-900 tracking-tight">Job Maze</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {isReset ? 'Password Reset!' : showPasswordForm ? 'Secure Your Account' : 'Verify Recovery Code'}
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {isReset 
                    ? 'Your password has been updated. Redirecting you to sign in...'
                    : showPasswordForm 
                      ? 'Please enter a new secure password for your JobMaze account.'
                      : 'The magic link didn\'t work? No problem. Enter your email and the 6-digit code from the email manually.'}
                </p>
              </div>

              {!isReset && !showPasswordForm && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="manual-email" className="text-xs font-semibold text-gray-700 ml-1">
                      Email Address
                    </Label>
                    <Input
                      id="manual-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-white/50 border-gray-200 focus:bg-white text-sm transition-all shadow-sm focus:ring-brand-500/20 rounded-xl"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="otp-code" className="text-xs font-semibold text-gray-700 ml-1">
                      6-Digit Recovery Code
                    </Label>
                    <Input
                      id="otp-code"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="h-11 bg-white/50 border-gray-200 focus:bg-white text-center text-lg font-bold tracking-[0.5em] transition-all shadow-sm focus:ring-brand-500/20 rounded-xl"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/25 transition-all mt-2 rounded-xl"
                    disabled={isVerifyingOtp}
                  >
                    {isVerifyingOtp ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Verify Code <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              )}

              {!isReset && showPasswordForm && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold text-gray-700 ml-1">
                      New Password
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 bg-white/50 border-gray-200 focus:bg-white pl-9 text-sm transition-all shadow-sm focus:ring-brand-500/20 rounded-xl"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700 ml-1">
                      Confirm New Password
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 bg-white/50 border-gray-200 focus:bg-white pl-9 text-sm transition-all shadow-sm focus:ring-brand-500/20 rounded-xl"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Update Password <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              )}

              {isReset && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center"
                  >
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-emerald-700 font-medium">Redirecting you to login...</p>
                  </div>
                </div>
              )}

              <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 rounded-lg shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                  Security Tip: Use at least 8 characters with a mix of letters, numbers, and symbols for a stronger password.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </BackgroundBeamsWithCollision>
    </BackgroundWrapper>
  );
}
