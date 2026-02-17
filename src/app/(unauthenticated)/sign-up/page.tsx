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
  ChevronLeft,
  User,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  KeyRound,
  Briefcase,
  Building2,
  GraduationCap
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
import { cn } from '@/lib/utils';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';

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
          emailRedirectTo: `${window.location.origin}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'We have send a confirmation email to your mail.',
        variant: 'default',
      });

      router.push('/');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundWrapper className="flex-col flex">
      <BackgroundBeamsWithCollision className="flex-col flex">
        {isMobile && (
          <MobileHeader className="w-full" title="Sign Up" showBack={true} />
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
            className="w-full max-w-5xl relative z-10"
          >
            {/* Glass Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">

              {/* Left Side - Form */}
              <div className="p-8 md:p-10 flex flex-col justify-center relative">
                {/* Decorative Top Highlight (Mobile only) */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 opacity-80 md:hidden" />

                <div className="text-center md:text-left mb-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-600 mb-4 shadow-sm border border-brand-100 md:hidden">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Create an Account
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Join Job Maze to unlock verified job opportunities.
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-gray-700 ml-1">Full Name</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 bg-white/50 border-gray-200 focus:bg-white pl-9 text-sm transition-all shadow-sm focus:ring-brand-500/20"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label htmlFor="email" className="text-xs font-semibold text-gray-700 ml-1">Email</Label>
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

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label htmlFor="userType" className="text-xs font-semibold text-gray-700 ml-1">Role</Label>
                      <Select value={userType} onValueChange={setUserType}>
                        <SelectTrigger className="h-10 bg-white/50 border-gray-200 focus:bg-white text-sm shadow-sm pl-3">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5" /> Student
                            </div>
                          </SelectItem>
                          <SelectItem value="employer">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5" /> Employer
                            </div>
                          </SelectItem>
                          <SelectItem value="business">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5" /> Business
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label htmlFor="password" className="text-xs font-semibold text-gray-700 ml-1">Password</Label>
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
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <Lock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700 ml-1">Confirm</Label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
                          <Lock className="h-4 w-4" />
                        </div>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-10 bg-white/50 border-gray-200 focus:bg-white pl-9 pr-9 text-sm transition-all shadow-sm focus:ring-brand-500/20"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <Shield className="h-3.5 w-3.5" /> : <KeyRound className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      className="mt-0.5 border-gray-300 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-xs text-gray-500 leading-tight font-normal"
                    >
                      I agree to the{' '}
                      <CustomLink href="/terms" className="text-brand-600 hover:text-brand-500 font-medium hover:underline">
                        Terms of Service
                      </CustomLink>{' '}
                      and{' '}
                      <CustomLink href="/privacy" className="text-brand-600 hover:text-brand-500 font-medium hover:underline">
                        Privacy Policy
                      </CustomLink>
                    </Label>
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
                        Create Account <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-6">
                  Already have an account?{' '}
                  <CustomLink
                    href="/sign-in"
                    className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                  >
                    Sign in
                  </CustomLink>
                </p>
              </div>

              {/* Right Side - Visual Content */}
              <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-600 to-brand-500 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10">
                  {/* Abstract Pattern/Logo */}
                  <svg width="250" height="250" viewBox="0 0 200 200" fill="currentColor">
                    <rect x="20" y="20" width="160" height="160" rx="20" />
                  </svg>
                </div>

                <div className="relative z-10 mt-4">
                  <h3 className="text-3xl font-bold leading-tight mb-4">
                    Why Join Job Maze?
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-white/20 p-1.5 rounded-lg mt-0.5">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Verified Listings</p>
                        <p className="text-xs text-brand-100 opacity-80">Access over 10,000+ verified LMIA jobs.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-white/20 p-1.5 rounded-lg mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Direct Employer Access</p>
                        <p className="text-xs text-brand-100 opacity-80">Connect directly with hiring managers.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-white/20 p-1.5 rounded-lg mt-0.5">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Smart Alerts</p>
                        <p className="text-xs text-brand-100 opacity-80">Get notified instantly for matching roles.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 mt-8">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-brand-500" />
                      ))}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold">Join 50,000+ users</p>
                      <p className="text-brand-100 opacity-80">Finding their dream jobs daily</p>
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
