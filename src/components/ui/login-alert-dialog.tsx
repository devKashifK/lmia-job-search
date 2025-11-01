"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogIn, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function LoginAlertDialog({
  isOpen,
  onClose,
  message,
}: LoginAlertDialogProps) {
  const router = useRouter();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldAnimate(true);
    }
  }, [isOpen]);

  const handleLogin = () => {
    router.push("/sign-in");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md border-2 border-brand-200 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-purple-50 opacity-50" />
        
        {/* Floating particles effect */}
        <AnimatePresence>
          {shouldAnimate && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-brand-400 rounded-full opacity-20"
                  initial={{ x: Math.random() * 400, y: Math.random() * 400 }}
                  animate={{
                    x: Math.random() * 400,
                    y: Math.random() * 400,
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <div className="relative z-10">
          {/* Icon Header */}
          <AlertDialogHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
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
                    opacity: [0.5, 0.2, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Main icon container */}
                <div className="relative p-4 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-full shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                
                {/* Corner decoration */}
                <motion.div
                  className="absolute -top-1 -right-1 p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-md"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <LogIn className="w-3 h-3 text-white" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AlertDialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-brand-600 via-brand-700 to-purple-600 text-transparent bg-clip-text">
                Login Required
              </AlertDialogTitle>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AlertDialogDescription className="text-center text-gray-600 text-base">
                {message}
              </AlertDialogDescription>
            </motion.div>
          </AlertDialogHeader>

          {/* Action Buttons */}
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Maybe Later
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 hover:from-brand-600 hover:via-brand-700 hover:to-brand-800 text-white font-bold shadow-lg shadow-brand-500/40 hover:shadow-xl hover:shadow-brand-600/50 transition-all duration-300 hover:scale-105 group"
              >
                <LogIn className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Login Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </AlertDialogFooter>

          {/* Bottom hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-gray-500 mt-4"
          >
            Don&apos;t have an account?{" "}
            <button
              onClick={() => {
                router.push("/sign-up");
                onClose();
              }}
              className="text-brand-600 hover:text-brand-700 font-semibold hover:underline transition-colors"
            >
              Sign up here
            </button>
          </motion.p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook to easily use the login dialog
export function useLoginAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const showLoginAlert = (customMessage: string) => {
    setMessage(customMessage);
    setIsOpen(true);
  };

  const closeLoginAlert = () => {
    setIsOpen(false);
  };

  const LoginAlertComponent = () => (
    <LoginAlertDialog
      isOpen={isOpen}
      onClose={closeLoginAlert}
      message={message}
    />
  );

  return {
    showLoginAlert,
    closeLoginAlert,
    LoginAlertComponent,
  };
}
