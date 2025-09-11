import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, BarChart3, TrendingUp } from 'lucide-react';

function Analysis() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="mx-auto h-16 w-16 text-blue-600 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Company Analysis Dashboard
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get detailed insights into company hiring patterns, job trends, and
            workforce data. Navigate to a company's analysis page by clicking
            "See All Jobs" from any job listing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="p-6">
              <Building2 className="h-8 w-8 text-blue-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Company Insights</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive analysis of hiring patterns and job distributions
                by company
              </p>
            </Card>

            <Card className="p-6">
              <TrendingUp className="h-8 w-8 text-green-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Growth Trends</h3>
              <p className="text-gray-600 text-sm">
                Track hiring growth rates and seasonal patterns across different
                time periods
              </p>
            </Card>

            <Card className="p-6">
              <BarChart3 className="h-8 w-8 text-purple-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Interactive Charts</h3>
              <p className="text-gray-600 text-sm">
                Visual dashboards with location breakdowns, job categories, and
                NOC code analysis
              </p>
            </Card>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            To access company analysis, click the "See All Jobs" button from any
            job listing in your search results.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Analysis;
