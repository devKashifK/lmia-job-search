"use client";
import { createContext, useContext, useEffect, useState } from "react";
import db from "@/db"; // Supabase client

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

export const getSession = async (db) => {
  const {
    data: { session },
  } = await db.auth.getSession();
  return session;
};

const SessionContext = createContext(null);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current session
    const fetchSession = async () => {
      const { data, error } = await db.auth.getSession();
      setSession(data?.session || null);
      setLoading(false);
    };

    fetchSession();

    // Listen for auth state changes
    const { data: subscription } = db.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

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
