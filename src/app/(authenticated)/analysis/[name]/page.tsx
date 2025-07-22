import Navbar from '@/components/ui/nabvar';
import { PremiumDialogContent } from '@/components/ui/premium-dialog';
import Footer from '@/pages/homepage/footer';
import React from 'react';

export default async function DeepAnalysis({ params }) {
  const { name } = await params;
  return (
    <div>
      <Navbar className="relative border-b pb-2" />
      <div className="min-h-screen w-full flex space-x-8 mx-auto px-24 py-8">
        <PremiumDialogContent />
      </div>
      <Footer />
    </div>
  );
}
