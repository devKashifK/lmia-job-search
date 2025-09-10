'use client';
import React from 'react';
import PageTitle from '@/components/ui/page-title';
import Navbar from '@/components/ui/nabvar';

export default function DemoPage() {
  return (
    <div className="bg-gradient-to-b from-brand-50 to-white min-h-screen">
      <Navbar className="" />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Demo with Hot Leads Search */}
          <div className="mb-12">
            <PageTitle 
              title="Hot Leads Demo"
              showSearch={true}
              searchPlaceholder="Search hot leads..."
              defaultSearchType="hot_leads"
              className="mb-8"
            />
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">
                This demonstrates the PageTitle component with Hot Leads search enabled. 
                Click the search box to see it expand with search type selector and suggestions.
              </p>
            </div>
          </div>

          {/* Demo with LMIA Search */}
          <div className="mb-12">
            <PageTitle 
              title="LMIA Jobs Demo"
              showSearch={true}
              searchPlaceholder="Search LMIA jobs..."
              defaultSearchType="lmia"
              className="mb-8"
            />
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">
                This demonstrates the PageTitle component with LMIA search enabled. 
                The search is configured for LMIA job searches by default.
              </p>
            </div>
          </div>

          {/* Demo without Search */}
          <div>
            <PageTitle 
              title="Regular Title"
              showSearch={false}
              className="mb-8"
            />
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">
                This is the regular PageTitle component without search functionality.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
