'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getVisitorInfo, VisitorInfo } from '@/lib/get-visitor-info';
import db from '@/db';
import { LoginAlertDialog } from '@/components/ui/login-alert-dialog';
import { useSession } from '@/hooks/use-session';
import { useTrial } from './trail';

interface ControlContextType {
  remainingTime: number; // in seconds
  visitorInfo: VisitorInfo | null;
}

const ControlContext = createContext<ControlContextType | undefined>(undefined);

const TRIAL_DURATION_MS = 2 * 60 * 1000; // 2 minutes in milliseconds

export const ControlContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { session, loading } = useSession();
  const { isTrialActive, setIsTrialActive } = useTrial();
  const [remainingTime, setRemainingTime] = useState(300); // 2 minutes in seconds
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const startCountdown = (initialSeconds: number) => {
    let seconds = initialSeconds;

    const interval = setInterval(() => {
      seconds -= 1;
      setRemainingTime(seconds);

      if (seconds <= 0) {
        clearInterval(interval);
        setIsTrialActive(false);
        setShowLoginAlert(true);
      }
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  };
  const checkVisitor = async () => {
    if (session && !loading) {
      // If user is logged in, disable trial
      setIsTrialActive(false);
      setRemainingTime(0);
      setIsChecking(false);
      setShowLoginAlert(false);
      return;
    }
    try {
      // Get visitor IP and location
      const info = await getVisitorInfo();

      if (!info) {
        console.error('Could not fetch visitor info');
        setIsChecking(false);
        return;
      }

      setVisitorInfo(info);

      // Check if visitor exists in database
      const { data: existingVisitor, error: fetchError } = await db
        .from('visitors')
        .select('*')
        .eq('ip_address', info.ip)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine for new visitors
        console.error('Error checking visitor:', fetchError);
        setIsChecking(false);
        return;
      }

      if (existingVisitor) {
        // Existing visitor - check if 2 minutes have passed
        const firstVisit = new Date(existingVisitor.first_visit).getTime();
        const now = Date.now();
        const timePassed = now - firstVisit;

        if (timePassed >= TRIAL_DURATION_MS) {
          // Trial expired
          setIsTrialActive(false);
          setRemainingTime(0);
          setShowLoginAlert(true);
        } else {
          // Trial still active
          const remainingSec = Math.ceil(
            (TRIAL_DURATION_MS - timePassed) / 1000
          );
          setRemainingTime(remainingSec);
          setIsTrialActive(true);

          // Start countdown timer
          startCountdown(remainingSec);
        }
      } else {
        // New visitor - insert into database
        const { error: insertError } = await db.from('visitors').insert({
          ip_address: info.ip,
          location: info.location,
        });

        if (insertError) {
          console.error('Error inserting visitor:', insertError);
        }

        // Start 2-minute trial
        setIsTrialActive(true);
        setRemainingTime(300);
        startCountdown(300);
      }

      setIsChecking(false);
    } catch (error) {
      console.error('Error in checkVisitor:', error);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkVisitor();
  }, []);

  const value: ControlContextType = {
    remainingTime,
    visitorInfo,
  };

  return (
    <ControlContext.Provider value={value}>
      {children}
      {showLoginAlert && !session?.user ? (
        <LoginAlertDialog
          isOpen={showLoginAlert}
          onClose={() => setShowLoginAlert(false)}
          message="Your 5-minute free trial has ended. Please login to continue using the platform and access all features."
        />
      ) : null}
    </ControlContext.Provider>
  );
};

export const useControl = () => {
  const context = useContext(ControlContext);
  if (context === undefined) {
    throw new Error('useControl must be used within a ControlContextProvider');
  }
  return context;
};
