'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import db from '@/db'; // Supabase client
import { useTrial } from '@/context/trail';

// export function useSession() {
//   const [session, setSession] = useState(null);
//   useEffect(() => {
//     async function fetchSession() {
//       const session = await getSession(db);
//       setSession(session);
//     }
//     fetchSession();
//   }, []);

//   return session;
// }

interface SessionContextType {
  session: any | null;
  loading: boolean;
  isTrialActive: boolean;
  setIsTrialActive: (value: boolean) => void;
}

export const getSession = async (db) => {
  const {
    data: { session },
  } = await db.auth.getSession();
  return session;
};

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { isTrialActive, setIsTrialActive } = useTrial();

  useEffect(() => {
    // Fetch the current session
    const fetchSession = async () => {
      const { data, error } = await db.auth.getSession();
      setSession(data?.session || null);
      setLoading(false);
    };

    fetchSession();

    // Listen for auth state changes
    const { data: authListener } = db.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{ session, loading, isTrialActive, setIsTrialActive }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  const { isTrialActive } = useTrial();
  const { session, loading } = context;

  // If trial is active and no Supabase session exists,
  // simulate a pseudo-session for access control.
  const effectiveSession = session || (isTrialActive ? { trial: true } : null);

  return { session: effectiveSession, loading };
};

export const useGetuser = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await db.auth.getUser();
      setUser(data);
    };
    fetchUser();
  }, []);

  return user;
};
