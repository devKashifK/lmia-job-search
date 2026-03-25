"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";
import { useEffect, forwardRef } from "react";
import "./CustomLink.css";

interface CustomLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ href, children, className, onClick, ...props }, ref) => {
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

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      NProgress.start();

      if (onClick) {
        onClick(e);
      }

      router.push(href);

      // Add a small delay before completing the progress bar
      setTimeout(() => {
        NProgress.done();
      }, 500);
    };

    return (
      <Link href={href} className={className} onClick={handleClick} ref={ref} {...props}>
        {children}
      </Link>
    );
  }
);

CustomLink.displayName = "CustomLink";

export default CustomLink;
