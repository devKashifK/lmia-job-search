import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/loading-screen";

const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();
  const router = useRouter();
  const [delayedLoading, setDelayedLoading] = useState(true);

  useEffect(() => {
    // Introduce a delay for the loading screen
    const delayTimer = setTimeout(() => setDelayedLoading(false), 2000); // 2-second delay

    return () => clearTimeout(delayTimer); // Cleanup timeout on component unmount
  }, []);

  useEffect(() => {
    if (!loading && !session && !delayedLoading) {
      const currentPath = window.location.pathname;
      router.push(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [session, loading, delayedLoading, router]);

  if (loading || delayedLoading) return <LoadingScreen />;

  if (!session) return null;

  return <>{children}</>;
};

export default AuthenticatedRoute;
