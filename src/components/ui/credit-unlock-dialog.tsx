'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CreditUnlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  creditAmount: number;
  userCredits?: number;
}

export function CreditUnlockDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  creditAmount,
  userCredits = 0,
}: CreditUnlockDialogProps) {
  const router = useRouter();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldAnimate(true);
    }
  }, [isOpen]);

  const handleUpgrade = () => {
    router.push('/pricing');
    onClose();
  };

  const hasEnoughCredits = (userCredits || 0) >= creditAmount;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md border-2 border-brand-200 overflow-hidden rounded-[2.5rem]">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-sky-50 opacity-60" />

        {/* Floating particles effect */}
        <AnimatePresence>
          {shouldAnimate && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-brand-400 rounded-full opacity-20"
                  initial={{ x: Math.random() * 400, y: Math.random() * 400 }}
                  animate={{
                    x: Math.random() * 400,
                    y: Math.random() * 400,
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <div className="relative z-10 p-2">
          {/* Icon Header */}
          <AlertDialogHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className="mx-auto w-fit"
            >
              <div className="relative">
                {/* Pulsing ring effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-brand-500"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.4, 0.1, 0.4],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Main icon container */}
                <div className="relative p-5 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-3xl shadow-xl transform rotate-3">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                {/* Smaller secondary icon */}
                <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-brand-100">
                  <CreditCard className="w-4 h-4 text-brand-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-1.5"
            >
              <AlertDialogTitle className="text-center text-2xl font-black bg-gradient-to-r from-brand-600 via-brand-700 to-brand-900 text-transparent bg-clip-text tracking-tight">
                {title}
              </AlertDialogTitle>
              <div className="flex items-center justify-center gap-1.5">
                <div className="px-2.5 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 font-black text-[10px] uppercase tracking-widest rounded-full">
                  Premium Feature
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AlertDialogDescription className="text-center text-gray-500 text-sm leading-relaxed px-2">
                {description}
              </AlertDialogDescription>
            </motion.div>
          </AlertDialogHeader>

          {/* Pricing Info Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between shadow-inner"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Zap className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Unlock Price</p>
                <p className="text-sm font-black text-gray-900">{creditAmount} Credits</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Your Balance</p>
              <p className={cn(
                "text-sm font-black",
                hasEnoughCredits ? "text-green-600" : "text-red-500"
              )}>
                {userCredits} Credits
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full"
              >
                <Button
                  variant="outline"
                  onClick={handleUpgrade}
                  className="w-full h-11 rounded-2xl border-brand-200 hover:bg-brand-50 hover:text-brand-700 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  <Zap className="w-3.5 h-3.5 mr-2 fill-current text-brand-500" />
                  Upgrade Now
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full"
              >
                <Button
                  disabled={!hasEnoughCredits}
                  onClick={onConfirm}
                  className="w-full h-11 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-2" />
                  Unlock
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-full text-gray-400 hover:text-gray-600 font-bold text-[10px] uppercase tracking-widest h-8"
              >
                Maybe Later
              </Button>
            </motion.div>
          </div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-1.5 mt-4 pb-2"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              Secure Credit Processing
            </p>
          </motion.div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook to easily use the credit unlock dialog
export function useCreditUnlock() {
  const [isOpen, setIsOpen] = useState(false);
  const [creditData, setCreditData] = useState({
    title: '',
    description: '',
    creditAmount: 100,
    userCredits: 0,
    onConfirm: () => {},
  });

  const showUnlockDialog = (data: {
    title: string;
    description: string;
    creditAmount: number;
    userCredits: number;
    onConfirm: () => void;
  }) => {
    setCreditData(data);
    setIsOpen(true);
  };

  const closeUnlockDialog = () => {
    setIsOpen(false);
  };

  const CreditUnlockComponent = () => (
    <CreditUnlockDialog
      isOpen={isOpen}
      onClose={closeUnlockDialog}
      onConfirm={() => {
        creditData.onConfirm();
        closeUnlockDialog();
      }}
      title={creditData.title}
      description={creditData.description}
      creditAmount={creditData.creditAmount}
      userCredits={creditData.userCredits || 0}
    />
  );

  return {
    showUnlockDialog,
    closeUnlockDialog,
    CreditUnlockComponent,
  };
}
