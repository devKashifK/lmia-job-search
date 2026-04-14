import Image from 'next/image';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

const Logo = ({ className, style }: LogoProps) => {
  return (
    <Image
      src="/ll.png"
      alt="JobMaze Logo"
      width={32}
      height={32}
      className={className || "w-5 h-5"}
      style={style}
    />
  );
};

export default Logo;
