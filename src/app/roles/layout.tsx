import React from "react";
import Footer from "@/pages/homepage/footer";
import Navbar from "../nabvar";
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar className="border-b pb-4" />
      <div className="mt-12">{children}</div>
      <Footer />
    </>
  );
}
