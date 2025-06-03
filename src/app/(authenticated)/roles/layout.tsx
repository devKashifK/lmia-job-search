import React from "react";
import Footer from "@/pages/homepage/footer";
import Navbar from "@/components/ui/nabvar";
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar className="border-brand-200 border-b pb-4" />
      <div className="mt-16">{children}</div>
      <Footer />
    </>
  );
}
