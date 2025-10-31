import Footer from '@/pages/homepage/footer';
import Navbar from './nabvar';

export function StandardPageLayout({
  children,
  className = 'pt-24',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <Navbar />
      <div className={className}>{children}</div>
      <Footer />
    </>
  );
}
