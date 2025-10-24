import React from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

const Logo = ({ className, style }: LogoProps) => {
  return <img src="/ll.png" className="w-4 h-4 -mt-0.5" />;
};

export default Logo;
