// /context/trial-context.tsx
'use client';
import { createContext, useContext, useState } from 'react';

interface TrialContextType {
  isTrialActive: boolean;
  setIsTrialActive: (value: boolean) => void;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

export const TrialProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTrialActive, setIsTrialActive] = useState(false);
  return (
    <TrialContext.Provider value={{ isTrialActive, setIsTrialActive }}>
      {children}
    </TrialContext.Provider>
  );
};

export const useTrial = () => {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error('useTrial must be used within TrialProvider');
  return ctx;
};
