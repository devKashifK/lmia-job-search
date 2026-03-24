'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomLink from '../../../components/ui/CustomLink';
import { Label } from '@/components/ui/label';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { motion } from 'framer-motion';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collison';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';

export default function ForgotPasswordForm() {
  const { isMobile } = useMobile();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setIsSent(true);
        toast({
          title: 'Link Sent!',
          description: 'Check your email for reset instructions.',
          variant: 'success',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundWrapper className="flex-col flex">
      <BackgroundBeamsWithCollision className="flex-col flex">
        {isMobile && (
          <MobileHeader className="w-full" title="Reset Password" showBack={true} />
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
                href="/sign-in"
                className="gap-2 flex items-center text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                Back to Sign In
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
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="mb-8 text-center">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="p-1.5 bg-brand-50 rounded-lg border border-brand-100 shadow-sm">
                    <Logo className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-bold text-gray-900 tracking-tight">Job Maze</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {isSent ? 'Check your Inbox' : 'Forgot Password?'}
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {isSent 
                    ? `We've sent a password reset link to ${email}. Please check your email and follow the instructions.`
                    : 'No worries! Enter your email and we\'ll send you instructions to reset your password.'}
                </p>
              </div>

              {!isSent ? (
                <form onSubmit={handleResetRequest} className="space-y-5">
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
                        className="h-11 bg-white/50 border-gray-200 focus:bg-white pl-9 text-sm transition-all shadow-sm focus:ring-brand-500/20 rounded-xl"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Reset Link <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100 flex items-start gap-3">
                    <div className="p-1.5 bg-brand-100 rounded-lg shrink-0">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                    </div>
                    <p className="text-xs text-brand-800 leading-relaxed">
                      If you don't see the email, please check your spam folder or try again in a few minutes.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-11 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm transition-all"
                    onClick={() => setIsSent(false)}
                  >
                    Try another email
                  </Button>
                </div>
              )}

              <p className="text-center text-xs text-gray-500 mt-8">
                Remember your password?{' '}
                <CustomLink
                  href="/sign-in"
                  className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                >
                  Sign In
                </CustomLink>
              </p>
            </div>
          </motion.div>
        </div>
      </BackgroundBeamsWithCollision>
    </BackgroundWrapper>
  );
}
