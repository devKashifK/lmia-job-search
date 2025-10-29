import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomLink from '@/components/ui/CustomLink';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';
import BackgroundWrapper from '@/components/ui/background-wrapper';

function Analysis() {
  return (
    <>
      <BackgroundWrapper>
        <Navbar />
        <div className="min-h-screen pt-32 pb-20">
          <div className="container mx-auto px-6">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6">
                Company Analysis Dashboard
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Get detailed insights into company hiring patterns, job trends,
                and workforce data. Navigate to a company's analysis page by
                clicking "See All Jobs" from any job listing.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 hover:from-brand-600 hover:via-brand-700 hover:to-brand-800 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/40 hover:shadow-xl hover:shadow-brand-600/50 transition-all duration-300 hover:scale-105 border border-brand-400/20"
                  asChild
                >
                  <CustomLink href="/search">
                    <Search className="mr-2 h-5 w-5" />
                    Start Searching
                  </CustomLink>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-brand-200 text-brand-700 hover:bg-brand-50 hover:border-brand-300 font-semibold rounded-xl transition-all duration-300"
                  asChild
                >
                  <CustomLink href="/dashboard">
                    Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CustomLink>
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="group hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Company Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Comprehensive analysis of hiring patterns and job
                    distributions by company with detailed metrics and trends.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Growth Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Track hiring growth rates and seasonal patterns across
                    different time periods with interactive visualizations.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Interactive Charts
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Visual dashboards with location breakdowns, job categories,
                    and NOC code analysis for comprehensive insights.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Instructions Card */}
            <Card className="bg-gradient-to-br from-brand-50 via-white to-brand-50/30 border-brand-200/50 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 mb-4">
                  <Search className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How to Access Company Analysis
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Click the "See All Jobs" button from any job listing in your
                  search results to view detailed company analysis and insights.
                </p>
                <Button
                  className="mt-6 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/30 hover:shadow-lg hover:shadow-brand-600/40 transition-all duration-300"
                  asChild
                >
                  <CustomLink href="/search">
                    Start Exploring
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </CustomLink>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </BackgroundWrapper>
    </>
  );
}

export default Analysis;
