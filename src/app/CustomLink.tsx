"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";
import { useEffect } from "react";
import "./CustomLink.css";

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  children,
  className,
  onClick,
}) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      NProgress.configure({
        showSpinner: false,
        trickleSpeed: 200,
        minimum: 0.08,
        template: `
          <div class="bar" role="bar">
            <div class="peg"></div>
          </div>
        `,
      });

      const handleRouteChangeStart = () => NProgress.start();
      const handleRouteChangeComplete = () => NProgress.done();

      // Listen to navigation start and complete using push or replace
      const originalPush = router.push;
      const originalReplace = router.replace;

      router.push = async (...args) => {
        handleRouteChangeStart();
        await originalPush(...args);
        handleRouteChangeComplete();
      };

      router.replace = async (...args) => {
        handleRouteChangeStart();
        await originalReplace(...args);
        handleRouteChangeComplete();
      };

      return () => {
        // Cleanup overrides
        router.push = originalPush;
        router.replace = originalReplace;
      };
    }
  }, [router]);

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
};

export default CustomLink;
