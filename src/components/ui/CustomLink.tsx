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
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    NProgress.start();

    if (onClick) {
      onClick();
    }

    router.push(href);

    // Add a small delay before completing the progress bar
    setTimeout(() => {
      NProgress.done();
    }, 500);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default CustomLink;
