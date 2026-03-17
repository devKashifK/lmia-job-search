'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Building2,
  MapPin,
  Briefcase,
  Hash,
  Calendar,
  Sparkles,
  Download,
  Share2,
  Save,
  Copy,
  Link,
  Table
} from 'lucide-react';
import Footer from '@/sections/homepage/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useComparisonData, ComparisonType } from './use-compare-data';
import { toast } from 'sonner';
import useMobile from '@/hooks/use-mobile';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';

const CategoryBarChart = dynamic(() => import('./charts/category-bar-chart'), {
  loading: () => <div className="h-[280px] w-full bg-gray-50/50 animate-pulse rounded-lg" />,
  ssr: false,
});

const CitiesBarChart = dynamic(() => import('./charts/cities-bar-chart'), {
  loading: () => <div className="h-[280px] w-full bg-gray-50/50 animate-pulse rounded-lg" />,
  ssr: false,
});

const NocBarChart = dynamic(() => import('./charts/noc-bar-chart'), {
  loading: () => <div className="h-[300px] w-full bg-gray-50/50 animate-pulse rounded-lg" />,
  ssr: false,
});

const JobTitleBarChart = dynamic(() => import('./charts/job-title-bar-chart'), {
  loading: () => <div className="h-[320px] w-full bg-gray-50/50 animate-pulse rounded-lg" />,
  ssr: false,
});

const TrendLineChart = dynamic(() => import('./charts/trend-line-chart'), {
  loading: () => <div className="h-[280px] w-full bg-gray-50/50 animate-pulse rounded-lg" />,
  ssr: false,
});

const LocationDonutChart = dynamic(() => import('./charts/location-donut-chart'), {
  loading: () => <div className="h-[250px] w-full bg-gray-50/50 animate-pulse rounded-lg" />,
  ssr: false,
});

interface ComparisonResultsProps {
  type: ComparisonType;
  entity1: string;
  entity2: string;
  entity3?: string;
  dataSource?: 'trending_job' | 'lmia';
  onReset: () => void;
  onModify?: () => void;  // go back to setup without clearing selections
}

export default function ComparisonResults({
  type,
  entity1,
  entity2,
  entity3,
  dataSource = 'trending_job',
  onReset,
  onModify,
}: ComparisonResultsProps) {
  const { isMobile } = useMobile();
  const { data, isLoading } = useComparisonData(type, entity1, entity2, entity3);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [comparisonName, setComparisonName] = React.useState('');
  const [comparisonNotes, setComparisonNotes] = React.useState('');
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Export as PDF — uses a toast ID to prevent stuck loading spinner
  const handleExportPDF = async () => {
    if (!resultsRef.current) return;
    const toastId = 'pdf-export';
    try {
      toast.loading('Generating PDF...', { id: toastId });
      const canvas = await html2canvas(resultsRef.current, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        scale: 1.5,
      } as any);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = entity3
        ? `comparison-${entity1}-vs-${entity2}-vs-${entity3}.pdf`
        : `comparison-${entity1}-vs-${entity2}.pdf`;
      pdf.save(filename);

      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to generate PDF. Try a smaller section.', { id: toastId });
      console.error('[PDF Export]', error);
    }
  };

  // Share link — includes entity3 for 3-way comparisons
  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    url.searchParams.set('entity1', entity1);
    url.searchParams.set('entity2', entity2);
    if (entity3) url.searchParams.set('entity3', entity3);

    navigator.clipboard.writeText(url.toString());
    toast.success('Share link copied to clipboard!');
  };

  // Copy summary
  const handleCopySummary = () => {
    const summary = `Comparison: ${entity1} vs ${entity2}\nType: ${type}\nTotal Jobs: ${data?.entity1.totalJobs} vs ${data?.entity2.totalJobs}`;
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard!');
  };

  // Save comparison
  const handleSaveComparison = () => {
    const saved = {
      id: Date.now().toString(),
      name: comparisonName || `${entity1} vs ${entity2}`,
      notes: comparisonNotes,
      type,
      entity1,
      entity2,
      timestamp: Date.now(),
    };

    const existing = JSON.parse(localStorage.getItem('savedComparisons') || '[]');
    existing.unshift(saved);
    localStorage.setItem('savedComparisons', JSON.stringify(existing.slice(0, 20))); // Keep last 20

    toast.success('Comparison saved!');
    setSaveDialogOpen(false);
    setComparisonName('');
    setComparisonNotes('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Analyzing data...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { entity1: data1, entity2: data2 } = data;

  // Calculate differences
  const jobsDiff = data1.totalJobs - data2.totalJobs;
  const jobsDiffPercent = ((jobsDiff / data2.totalJobs) * 100).toFixed(1);
  const citiesDiff = data1.uniqueCities - data2.uniqueCities;
  const employersDiff = data1.uniqueEmployers - data2.uniqueEmployers;

  // Prepare chart data
  const topCategoriesChart = prepareComparisonChartData(
    data1.topCategories,
    data2.topCategories,
    entity1,
    entity2
  );

  const topCitiesChart = prepareComparisonChartData(
    data1.topCities,
    data2.topCities,
    entity1,
    entity2
  );

  const monthlyTrendsChart = prepareTimeSeriesData(
    data1.monthlyTrends,
    data2.monthlyTrends,
    entity1,
    entity2
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Premium Action Bar */}
      <div className={cn(
        "flex mb-8 items-center justify-between p-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-sm sticky top-4 z-50",
        isMobile && "flex-col gap-3"
      )}>
        <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
          <Button
            onClick={onReset}
            variant="ghost"
            size={isMobile ? "sm" : "sm"}
            className="hover:bg-brand-50 text-gray-600 hover:text-brand-600 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-semibold">{isMobile ? "Reset" : "Comparison"}</span>
          </Button>
          {onModify && (
            <Button
              onClick={onModify}
              variant="ghost"
              size="sm"
              className="text-brand-600 hover:bg-brand-50 hover:text-brand-700 rounded-xl px-4"
            >
              <BarChart3 className="w-4 h-4 mr-2 opacity-70" />
              <span className="font-semibold">Modify Selections</span>
            </Button>
          )}
        </div>

        <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
          <div className="flex bg-gray-100/50 p-1 rounded-xl">
            <Button
              onClick={handleCopySummary}
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-gray-600 hover:text-gray-900"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-gray-600 hover:text-gray-900">
                  <Share2 className="w-3.5 h-3.5 mr-2" />
                  <span className="text-xs font-bold">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-xl">
                <DropdownMenuItem onClick={handleShareLink} className="rounded-lg cursor-pointer">
                  <Link className="w-4 h-4 mr-2 text-blue-500" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="rounded-lg cursor-pointer">
                  <Download className="w-4 h-4 mr-2 text-purple-500" />
                  <span>Export Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            onClick={() => setSaveDialogOpen(true)}
            size="sm"
            className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 rounded-xl px-5 h-9 font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Results Container */}
      <div ref={resultsRef}>
        {/* Premium VS Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className={cn(
            "relative overflow-hidden rounded-[2rem] border-[3px] border-white bg-gradient-to-br from-blue-500/10 via-white to-green-500/10 shadow-2xl shadow-gray-200/50",
            isMobile ? "p-6" : "p-10"
          )}>
            {/* Watermark Section */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
              <span className="text-[15rem] font-black italic tracking-tighter">VS</span>
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            
            <div className="flex flex-col items-center">
              {/* Badge Centered */}
              <div className="mb-8 z-10">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-6 py-1.5 rounded-full border-2 text-[11px] font-black tracking-widest uppercase shadow-sm",
                    dataSource === 'lmia'
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-indigo-600 text-white border-indigo-400'
                  )}
                >
                  {dataSource === 'lmia' ? 'Verified LMIA Data' : 'Live Market Trending'}
                </Badge>
              </div>

              <div className={cn(
                "relative flex w-full items-center",
                isMobile ? "flex-col gap-10" : "justify-between"
              )}>
                {/* Entity 1 */}
                <div className={cn("flex-1", isMobile ? "text-center" : "text-left")}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl mb-4 shadow-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full ring-4 ring-blue-500/20" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600">Primary Focus</span>
                  </div>
                  <div className={cn("flex items-center gap-3 mb-2", isMobile && "justify-center")}>
                    <h2 className={cn(
                      "font-extrabold text-gray-900 tracking-tight leading-none",
                      isMobile ? "text-2xl" : "text-4xl"
                    )}>{entity1}</h2>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Total Jobs</p>
                      <p className="text-xl font-extrabold text-blue-600">{data1.totalJobs.toLocaleString()}</p>
                    </div>
                    {data1.growthRate !== undefined && (
                      <div className={cn(
                        "p-2 rounded-2xl border aspect-square flex flex-col items-center justify-center min-w-[60px]",
                        data1.growthRate >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                      )}>
                        {data1.growthRate >= 0 ? <TrendingUp className="w-4 h-4 text-green-600 mb-0.5" /> : <TrendingDown className="w-4 h-4 text-red-600 mb-0.5" />}
                        <span className={cn("text-xs font-bold", data1.growthRate >= 0 ? "text-green-700" : "text-red-700")}>
                          {data1.growthRate}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* VS Circle */}
                <div className="px-8 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 0 }}
                    className="relative w-20 h-20 rounded-[1.75rem] bg-gray-900 border-[6px] border-white flex items-center justify-center shadow-2xl rotate-[12deg] transition-all group cursor-default"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.25rem]" />
                    <span className="relative z-10 text-white font-black text-xl italic tracking-tighter">VS</span>
                    <div className="absolute -z-10 w-full h-full bg-brand-500/40 rounded-[1.75rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>

                {/* Entity 2 */}
                <div className={cn("flex-1", isMobile ? "text-center" : "text-right")}>
                  <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl mb-4 shadow-sm", isMobile && "justify-center")}>
                    <div className="w-2 h-2 bg-green-500 rounded-full ring-4 ring-green-500/20" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-green-600">Comparison Target</span>
                  </div>
                  <div className={cn("flex items-center gap-3 mb-2", isMobile ? "justify-center" : "justify-end")}>
                    <h2 className={cn(
                      "font-extrabold text-gray-900 tracking-tight leading-none",
                      isMobile ? "text-2xl" : "text-4xl"
                    )}>{entity2}</h2>
                  </div>
                  <div className={cn("flex items-center gap-3 mt-4", isMobile ? "justify-center" : "justify-end")}>
                    {data2.growthRate !== undefined && (
                      <div className={cn(
                        "p-2 rounded-2xl border aspect-square flex flex-col items-center justify-center min-w-[60px]",
                        data2.growthRate >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                      )}>
                        {data2.growthRate >= 0 ? <TrendingUp className="w-4 h-4 text-green-600 mb-0.5" /> : <TrendingDown className="w-4 h-4 text-red-600 mb-0.5" />}
                        <span className={cn("text-xs font-bold", data2.growthRate >= 0 ? "text-green-700" : "text-red-700")}>
                          {data2.growthRate}%
                        </span>
                      </div>
                    )}
                    <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm text-left">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Total Jobs</p>
                      <p className="text-xl font-extrabold text-green-600">{data2.totalJobs.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Premium Market Leader Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          {(() => {
            const winner = data1.totalJobs >= data2.totalJobs ? entity1 : entity2;
            const loser = data1.totalJobs >= data2.totalJobs ? entity2 : entity1;
            const winnerJobs = Math.max(data1.totalJobs, data2.totalJobs);
            const loserJobs = Math.min(data1.totalJobs, data2.totalJobs);
            
            const ratio = loserJobs > 0 ? winnerJobs / loserJobs : winnerJobs;
            let displayDelta = '';
            if (ratio >= 2) {
                displayDelta = `${ratio.toFixed(1)}x`;
            } else {
                const deltaPct = loserJobs > 0
                  ? Math.round(((winnerJobs - loserJobs) / loserJobs) * 100)
                  : 100;
                displayDelta = `${deltaPct}%`;
            }

            const winnerGrowth = data1.totalJobs >= data2.totalJobs ? data1.growthRate : data2.growthRate;
            const tied = data1.totalJobs === data2.totalJobs;
            return (
              <div className={cn(
                'group relative flex items-center gap-6 rounded-[1.5rem] border-2 px-8 py-5 transition-all duration-300',
                tied
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-yellow-200 bg-gradient-to-r from-amber-500/5 via-yellow-50 to-amber-500/5 shadow-lg shadow-amber-500/5'
              )}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Sparkles className="w-20 h-20 text-amber-500 rotate-12" />
                </div>

                <div className={cn(
                  'relative w-14 h-14 flex items-center justify-center rounded-2xl shadow-inner border',
                  tied ? 'bg-gray-100 border-gray-200' : 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300 ring-8 ring-amber-500/10'
                )}>
                   {tied ? (
                     <span className="text-3xl">🤝</span>
                   ) : (
                     <div className="relative">
                       <span className="text-3xl drop-shadow-md">🏆</span>
                       <motion.div 
                         animate={{ opacity: [0, 1, 0] }}
                         transition={{ duration: 2, repeat: Infinity }}
                         className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                       />
                     </div>
                   )}
                </div>

                <div className="flex-1 min-w-0 z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Executive Summary</span>
                    <div className="h-px flex-1 bg-amber-200/50" />
                  </div>
                  <h3 className={cn(
                    'font-extrabold text-gray-900 tracking-tight leading-none',
                    isMobile ? 'text-lg' : 'text-2xl'
                  )}>
                    {tied ? 'Market Parity Reached' : (
                      <>{winner} <span className="text-amber-600 font-bold">Leads & Dominates</span></>
                    )}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1">
                    <p className="text-sm font-semibold text-gray-600">
                       {tied ? 'Volume is identical across markets' : (
                         <><span className="text-amber-700 font-bold">{displayDelta}</span> more listings than {loser}</>
                       )}
                    </p>
                    {!tied && winnerGrowth !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                         <span className="font-semibold">{(winnerJobs - loserJobs).toLocaleString()} unit lead</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                         <span className="font-semibold">{winnerGrowth > 0 ? 'Expanding' : 'Consolidating'} Market</span>
                      </div>
                    )}
                  </div>
                </div>

                {!isMobile && !tied && (
                  <Badge className="shrink-0 bg-amber-500 text-white border-amber-400 px-4 py-1 rounded-full font-bold text-[10px] tracking-tighter uppercase shadow-md shadow-amber-500/20">
                    Market Leader
                  </Badge>
                )}
              </div>
            );
          })()}
        </motion.div>

        {/* Premium AI Intelligence Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 group/winner">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[100px] group-hover:bg-brand-500/10 transition-colors" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px]" />
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-brand-400 rounded-full blur-sm"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none mb-1.5 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-brand-800 to-gray-900">Intelligence Insights</h3>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest leading-none">Automated Market Synthesis</p>
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-brand-50 text-brand-600 border-brand-100 rounded-lg px-3 py-1 font-bold text-[10px] uppercase">NLP Driven</Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100 rounded-lg px-3 py-1 font-bold text-[10px] uppercase">Real-time</Badge>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                {/* Volume & Lead */}
                <div className="flex gap-4 p-5 rounded-[2rem] bg-gray-50/50 hover:bg-gray-50 transition-colors group/item">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover/item:border-brand-200 transition-colors">
                     <Hash className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Volume Variance</h4>
                    <p className="text-gray-700 leading-snug font-medium">
                      <strong>{entity1}</strong> holds 
                      <span className={cn(
                        "mx-1 px-1.5 py-0.5 rounded-md font-bold",
                        jobsDiff > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {Math.abs(jobsDiff).toLocaleString()} {jobsDiff > 0 ? 'jobs more' : 'jobs fewer'}
                      </span>
                      than <strong>{entity2}</strong>. This represents a 
                      <strong> {(() => {
                          const ratio = data2.totalJobs > 0 ? data1.totalJobs / data2.totalJobs : 1;
                          if (ratio >= 2) return `${ratio.toFixed(1)}x`;
                          const r2 = data1.totalJobs > 0 ? data2.totalJobs / data1.totalJobs : 1;
                          if (r2 >= 2) return `${r2.toFixed(1)}x`;
                          return `${Math.abs(parseInt(jobsDiffPercent))}%`;
                      })()}</strong> capacity difference.
                    </p>
                  </div>
                </div>

                {/* Growth Perspective */}
                {(data1.growthRate !== undefined && data2.growthRate !== undefined) && (
                  <div className="flex gap-4 p-5 rounded-[2rem] bg-gray-50/50 hover:bg-gray-50 transition-colors group/item">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover/item:border-green-200 transition-colors">
                       <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Momentum Analysis</h4>
                      <p className="text-gray-700 leading-snug font-medium">
                        {Math.abs(data1.growthRate) > Math.abs(data2.growthRate) ? (
                          <>
                            <strong>{entity1}</strong> exhibits <span className="text-green-600 font-bold">{Math.abs(data1.growthRate - data2.growthRate).toFixed(1)}%</span> stronger momentum, 
                            {data1.growthRate > 0 ? ' surging as an expanding choice.' : ' showing higher resilience.'}
                          </>
                        ) : (
                          <>
                            <strong>{entity2}</strong> leads growth by <span className="text-green-600 font-bold">{Math.abs(data2.growthRate - data1.growthRate).toFixed(1)}%</span>, 
                            suggesting an aggressive market uptake.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Benchmark Mapping */}
                {data.benchmark && (
                <div className="flex gap-4 p-5 rounded-[2rem] bg-gray-50/50 hover:bg-gray-50 transition-colors group/item">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover/item:border-blue-200 transition-colors">
                       <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Market Benchmark</h4>
                      <p className="text-gray-700 leading-snug font-medium">
                        <strong>{entity1}</strong> sits at 
                        <span className="mx-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">
                          {(() => { const r = data1.totalJobs / data.benchmark.avgJobsPerValue; return r >= 100 ? `${Math.round(r)}x` : `${Math.round((r-1)*100)}%`; })()}
                        </span> 
                        {data1.totalJobs >= data.benchmark.avgJobsPerValue ? 'above' : 'below'} average, while 
                        <strong> {entity2}</strong> is 
                        <span className="mx-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded-md font-bold">
                           {(() => { const r = data2.totalJobs / data.benchmark.avgJobsPerValue; return r >= 100 ? `${Math.round(r)}x` : `${Math.round((r-1)*100)}%`; })()}
                        </span>
                        the median.
                      </p>
                    </div>
                  </div>
                )}

                {/* Regional Strategy */}
                {data1.topCities[0] && data2.topCities[0] && (
                <div className="flex gap-4 p-5 rounded-[2rem] bg-gray-50/50 hover:bg-gray-50 transition-colors group/item">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover/item:border-orange-200 transition-colors">
                       <MapPin className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Strategic Hubs</h4>
                      <p className="text-gray-700 leading-snug font-medium">
                        The center of gravity for <strong>{entity1}</strong> lies in 
                        <strong className="text-brand-700 border-b border-brand-200 ml-1">{data1.topCities[0].name}</strong>, 
                        whereas <strong>{entity2}</strong> dominates in 
                        <strong className="text-brand-700 border-b border-brand-200 ml-1">{data2.topCities[0].name}</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Comparison */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
        >
          <MetricCard
            icon={Briefcase}
            label="Total Jobs"
            value1={data1.totalJobs}
            value2={data2.totalJobs}
            entity1={entity1}
            entity2={entity2}
          />
          <MetricCard
            icon={MapPin}
            label="Unique Cities"
            value1={data1.uniqueCities}
            value2={data2.uniqueCities}
            entity1={entity1}
            entity2={entity2}
          />
          <MetricCard
            icon={Building2}
            label="Unique Employers"
            value1={data1.uniqueEmployers}
            value2={data2.uniqueEmployers}
            entity1={entity1}
            entity2={entity2}
          />
        </motion.div>

        {/* Benchmark Card */}
        {data.benchmark && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-8"
          >
            <Card className={cn(
              "relative overflow-hidden border border-slate-700/50 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-[2.5rem]",
              isMobile ? "p-6" : "p-10"
            )}>
              {/* Decorative glows */}
              <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[100px] -z-10 animate-pulse" />
              <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px] -z-10 animate-pulse" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="text-brand-400 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">National Benchmark</h3>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">Global Market Context</p>
                  </div>
                </div>
                
                <div className="px-5 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Market Average</p>
                    <div className="flex items-baseline gap-1.5 leading-none">
                      <span className="text-2xl font-extrabold text-white">{data.benchmark.avgJobsPerValue.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Jobs</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">National mean per<br/>{type.replace('_', ' ')}</p>
                </div>
              </div>

              <div className={cn(
                "grid gap-6 items-stretch",
                isMobile ? "grid-cols-1" : "grid-cols-2"
              )}>
                {/* Entity 1 vs Average */}
                <div className="relative group overflow-hidden bg-blue-500/5 backdrop-blur-xl rounded-[2.5rem] border border-blue-500/20 p-6 transition-all hover:bg-blue-500/10 hover:border-blue-500/40">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                       <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">{entity1}</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] font-bold">Relative Delta</Badge>
                  </div>
                  
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-4xl font-extrabold text-white mb-1 group-hover:scale-105 transition-transform origin-left">
                        {(() => {
                            const ratio = data1.totalJobs / data.benchmark.avgJobsPerValue;
                            if (ratio >= 10) return `${Math.round(ratio).toLocaleString()}x`;
                            const pctStr = Math.round((ratio - 1) * 100);
                            return (pctStr >= 0 ? '+' : '') + pctStr + '%';
                        })()}
                      </div>
                      <p className="text-xs text-blue-300/60 font-semibold uppercase tracking-widest">
                        {data1.totalJobs > data.benchmark.avgJobsPerValue ? 'Above' : 'Below'} Average
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 flex items-center justify-center">
                       {data1.totalJobs > data.benchmark.avgJobsPerValue ? <TrendingUp className="w-6 h-6 text-blue-400" /> : <TrendingDown className="w-6 h-6 text-blue-400" />}
                    </div>
                  </div>
                </div>

                {/* Entity 2 vs Average */}
                <div className="relative group overflow-hidden bg-green-500/5 backdrop-blur-xl rounded-[2.5rem] border border-green-500/20 p-6 transition-all hover:bg-green-500/10 hover:border-green-400/40">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                       <span className="text-xs font-bold text-green-300 uppercase tracking-widest">{entity2}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-[10px] font-bold">Relative Delta</Badge>
                  </div>
                  
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-4xl font-extrabold text-white mb-1 group-hover:scale-105 transition-transform origin-left">
                        {(() => {
                            const ratio = data2.totalJobs / data.benchmark.avgJobsPerValue;
                            if (ratio >= 10) return `${Math.round(ratio).toLocaleString()}x`;
                            const pctStr = Math.round((ratio - 1) * 100);
                            return (pctStr >= 0 ? '+' : '') + pctStr + '%';
                        })()}
                      </div>
                      <p className="text-xs text-green-300/60 font-semibold uppercase tracking-widest">
                        {data2.totalJobs > data.benchmark.avgJobsPerValue ? 'Above' : 'Below'} Average
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-green-500/20 flex items-center justify-center">
                       {data2.totalJobs > data.benchmark.avgJobsPerValue ? <TrendingUp className="w-6 h-6 text-green-400" /> : <TrendingDown className="w-6 h-6 text-green-400" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Context */}
              {data.benchmark.topValues && data.benchmark.topValues.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Top Market Values:</span>
                    <div className="flex flex-wrap gap-2">
                      {data.benchmark.topValues.map((val: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl hover:bg-white/10 hover:border-brand-500/50 transition-all cursor-default group/val">
                          <span className="text-[10px] font-semibold text-slate-300 group-hover/val:text-white transition-colors">{val.name}</span>
                          <span className="text-[10px] font-extrabold text-brand-400">{val.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Categories Comparison */}
          {topCategoriesChart.length > 0 && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white/60 backdrop-blur-md p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group/chart">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover/chart:bg-blue-500/10 transition-all duration-700" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">Top Categories</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Category Variance</p>
                      </div>
                    </div>
                  </div>
                  <CategoryBarChart
                    data={topCategoriesChart}
                    entity1={entity1}
                    entity2={entity2}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Top Cities Comparison */}
          {topCitiesChart.length > 0 && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white/60 backdrop-blur-md p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group/chart">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover/chart:bg-purple-500/10 transition-all duration-700" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">Top Cities</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Regional Spread</p>
                      </div>
                    </div>
                  </div>
                  <CitiesBarChart
                    data={topCitiesChart}
                    entity1={entity1}
                    entity2={entity2}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Monthly Trends */}
        {monthlyTrendsChart.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white/60 backdrop-blur-md p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group/chart">
              <div className="absolute top-0 left-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl group-hover/chart:bg-green-500/10 transition-all duration-700" />
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/20">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">Monthly Trends</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Time-Series Analysis</p>
                    </div>
                  </div>
                </div>
                <TrendLineChart
                  data={monthlyTrendsChart}
                  entity1={entity1}
                  entity2={entity2}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Location Distribution - Side by Side Donut Charts */}
        {(data1.topStates || data2.topStates) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            className="mb-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LocationDonutChart
                data={data1.topStates}
                entityName={entity1}
                colorScheme="blue"
              />
              <LocationDonutChart
                data={data2.topStates}
                entityName={entity2}
                colorScheme="green"
              />
            </div>
          </motion.div>
        )}

        {/* NOC Code Distribution */}
        {(data1.topNOC || data2.topNOC) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.44 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white/60 backdrop-blur-md p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group/chart">
              <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover/chart:bg-indigo-500/10 transition-all duration-700" />
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">NOC Code Distribution</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Specialization Density</p>
                    </div>
                  </div>
                </div>
                <NocBarChart
                  data={prepareComparisonChartData(
                    data1.topNOC?.slice(0, 8) || [],
                    data2.topNOC?.slice(0, 8) || [],
                    entity1,
                    entity2
                  )}
                  entity1={entity1}
                  entity2={entity2}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Job Titles Comparison */}
        {(data1.topJobTitles || data2.topJobTitles) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white/60 backdrop-blur-md p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group/chart">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl group-hover/chart:bg-orange-500/10 transition-all duration-700" />
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">Top Job Titles</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Title Rankings</p>
                    </div>
                  </div>
                </div>
                <JobTitleBarChart
                  data={prepareComparisonChartData(
                    data1.topJobTitles?.slice(0, 8) || [],
                    data2.topJobTitles?.slice(0, 8) || [],
                    entity1,
                    entity2
                  )}
                  entity1={entity1}
                  entity2={entity2}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Side-by-Side Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-blue-50/40 via-white to-white p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group/list-container">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] group-hover/list-container:bg-blue-500/10 transition-all duration-700" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-blue-50/50">
                  <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)] animate-pulse" />
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">{entity1} <span className="text-blue-600 font-bold ml-1">Profile</span></h3>
                </div>
                <div className="space-y-8">
                  <DataList title="Top Employers" data={data1.topEmployers.slice(0, 5)} icon={Building2} color="blue" />
                  <DataList title="Core Specialties" data={data1.topNOC.slice(0, 5)} icon={Hash} color="indigo" />
                  {data1.topStates && data1.topStates.length > 0 && (
                    <DataList title="Geographic Focus" data={data1.topStates.slice(0, 5)} icon={MapPin} color="blue" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-green-100 bg-gradient-to-br from-green-50/40 via-white to-white p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group/list-container">
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-[80px] group-hover/list-container:bg-green-500/10 transition-all duration-700" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-green-50/50">
                  <div className="w-3 h-3 bg-green-600 rounded-full shadow-[0_0_10px_rgba(22,163,74,0.4)] animate-pulse" />
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">{entity2} <span className="text-green-600 font-bold ml-1">Profile</span></h3>
                </div>
                <div className="space-y-8">
                  <DataList title="Top Employers" data={data2.topEmployers.slice(0, 5)} icon={Building2} color="green" />
                  <DataList title="Core Specialties" data={data2.topNOC.slice(0, 5)} icon={Hash} color="teal" />
                  {data2.topStates && data2.topStates.length > 0 && (
                    <DataList title="Geographic Focus" data={data2.topStates.slice(0, 5)} icon={MapPin} color="emerald" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Takeaways Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mb-12"
        >
          <Card className="p-8 bg-gradient-to-br from-brand-900 via-brand-950 to-slate-950 border-brand-800 shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[100px] group-hover:bg-brand-500/20 transition-all duration-1000" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg ring-4 ring-orange-500/10">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight leading-none mb-1">Strategic Takeaways</h3>
                  <p className="text-[10px] text-brand-300 font-bold uppercase tracking-[0.2em]">High-Level Market Intelligence</p>
                </div>
              </div>
              <Badge className="bg-white/10 text-white backdrop-blur-md border-white/20 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase">Actionable</Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative group/insight p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all duration-300 cursor-default">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover/insight:scale-110 transition-transform">
                  <span className="text-blue-400 font-extrabold text-xs">01</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-2">Market Volume</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  <strong>{data1.totalJobs > data2.totalJobs ? entity1 : entity2}</strong> presents a 
                  <span className="text-blue-400 font-extrabold mx-1">{Math.abs(jobsDiff).toLocaleString()} unit lead</span>, 
                  offering higher absolute opportunity volume.
                </p>
              </div>

              {data1.uniqueCities && data2.uniqueCities && (
                <div className="relative group/insight p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all duration-300 cursor-default">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover/insight:scale-110 transition-transform">
                    <span className="text-purple-400 font-extrabold text-xs">02</span>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-2">Geographic Footprint</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {entity1} span <strong className="text-purple-400">{data1.uniqueCities} cities</strong> vs 
                    {' '}{entity2} in <strong className="text-purple-400">{data2.uniqueCities}</strong>, indicating a 
                    {data1.uniqueCities > data2.uniqueCities ? ' more widespread' : ' more targeted'} presence.
                  </p>
                </div>
              )}

              {data1.topCities[0] && data2.topCities[0] && (
                <div className="relative group/insight p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all duration-300 cursor-default">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4 group-hover/insight:scale-110 transition-transform">
                    <span className="text-orange-400 font-extrabold text-xs">03</span>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-2">Dominant Hubs</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Hot spots vary significantly: <strong className="text-orange-400">{data1.topCities[0].name}</strong> for {entity1} vs 
                    {' '}<strong className="text-orange-400">{data2.topCities[0].name}</strong> for {entity2}.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <Footer />

      {/* Save Comparison Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Comparison</DialogTitle>
            <DialogDescription>
              Save this comparison for quick access later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Comparison Name</Label>
              <Input
                id="name"
                placeholder={`${entity1} vs ${entity2}`}
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this comparison..."
                value={comparisonNotes}
                onChange={(e) => setComparisonNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveComparison}>
              Save Comparison
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value1,
  value2,
  entity1,
  entity2,
}: {
  icon: any;
  label: string;
  value1: number;
  value2: number;
  entity1: string;
  entity2: string;
}) {
  const diff = value1 - value2;
  const max = Math.max(value1, value2) || 1;
  const pct1 = Math.max((value1 / max) * 100, 2);
  const pct2 = Math.max((value2 / max) * 100, 2);

  return (
    <Card className="relative overflow-hidden group border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-md rounded-[2rem]">
      {/* Dynamic border glow */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-500/10 rounded-[2rem] transition-colors -z-10" />
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-all duration-700 -z-10" />
      
      <div className="p-6 relative">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-brand-50 border border-brand-100 rounded-2xl shadow-sm text-brand-600 transition-transform group-hover:scale-110 duration-300">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 tracking-tight leading-none mb-1">{label}</h4>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Market Metric</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Entity 1 Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[150px]">{entity1}</span>
              <span className="text-blue-700 bg-blue-50/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold shadow-sm border border-blue-100">{value1?.toLocaleString() ?? 0}</span>
            </div>
            <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${pct1}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              />
            </div>
          </div>

          {/* Entity 2 Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[150px]">{entity2}</span>
              <span className="text-green-700 bg-green-50/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-extrabold shadow-sm border border-green-100">{value2?.toLocaleString() ?? 0}</span>
            </div>
            <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${pct2}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              />
            </div>
          </div>

          {/* Difference Footer */}
          <div className="pt-6 border-t border-gray-100 mt-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Delta</span>
              <span className="text-xs font-semibold text-gray-500">Relative Lead</span>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm border transition-all duration-300",
              diff > 0 ? "bg-green-50 text-green-700 border-green-100" : diff < 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-gray-50 text-gray-600 border-gray-100"
            )}>
              {diff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : diff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {(() => {
                  const ratio = value2 > 0 ? value1 / value2 : value1;
                  const displayRatio = ratio >= 2 ? `${ratio.toFixed(1)}x` : ratio <= 0.5 && ratio > 0 ? `${(1/ratio).toFixed(1)}x` : null;
                  const diffPct = value2 > 0 ? Math.round(((value1 - value2) / value2) * 100) : 0;
                  
                  if (displayRatio) return displayRatio;
                  return `${Math.abs(diffPct)}%`;
              })()}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DataList({
  title,
  data,
  icon: Icon,
  color = 'gray',
}: {
  title: string;
  data: Array<{ name: string; count: number }>;
  icon: any;
  color?: string;
}) {
  const colorSchemes = {
    indigo: { icon: 'bg-indigo-50 text-indigo-600', badge: 'bg-indigo-50/50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-500' },
    purple: { icon: 'bg-purple-50 text-purple-600', badge: 'bg-purple-50/50 text-purple-700 border-purple-100', dot: 'bg-purple-500' },
    green: { icon: 'bg-green-50 text-green-600', badge: 'bg-green-50/50 text-green-700 border-green-100', dot: 'bg-green-500' },
    teal: { icon: 'bg-teal-50 text-teal-600', badge: 'bg-teal-50/50 text-teal-700 border-teal-100', dot: 'bg-teal-500' },
    blue: { icon: 'bg-blue-50 text-blue-600', badge: 'bg-blue-50/50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
    emerald: { icon: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-50/50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
    gray: { icon: 'bg-gray-50 text-gray-600', badge: 'bg-gray-50/50 text-gray-700 border-gray-100', dot: 'bg-gray-500' },
  };

  const scheme = colorSchemes[color as keyof typeof colorSchemes] || colorSchemes.gray;

  return (
    <div className="group/list">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn('p-2 rounded-xl shadow-sm border border-black/5', scheme.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-[10px] font-extrabold text-gray-900 uppercase tracking-widest leading-none mb-1">{title}</h4>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-tighter leading-none">Market Leaders</p>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <motion.div 
            key={index} 
            whileHover={{ x: 6, backgroundColor: 'rgba(0,0,0,0.02)' }}
            className="group/item flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-gray-100 transition-all duration-300"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 group-hover/item:scale-150 transition-transform duration-300", scheme.dot)} />
              <span className="text-xs text-gray-700 truncate font-semibold leading-none">{item.name}</span>
            </div>
            <Badge variant="outline" className={cn('text-[10px] font-extrabold border shadow-sm h-7 px-3 rounded-xl transition-all duration-300 group-hover/item:scale-105', scheme.badge)}>
              {item.count.toLocaleString()}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function prepareComparisonChartData(
  data1: Array<{ name: string; count: number }>,
  data2: Array<{ name: string; count: number }>,
  entity1: string,
  entity2: string
) {
  const allNames = new Set([...data1.map((d) => d.name), ...data2.map((d) => d.name)]);
  const result = Array.from(allNames).map((name) => ({
    name,
    [entity1]: data1.find((d) => d.name === name)?.count || 0,
    [entity2]: data2.find((d) => d.name === name)?.count || 0,
  }));
  return result.slice(0, 10);
}

function prepareTimeSeriesData(
  data1: Array<{ month: string; count: number }>,
  data2: Array<{ month: string; count: number }>,
  entity1: string,
  entity2: string
) {
  const allMonths = new Set([...data1.map((d) => d.month), ...data2.map((d) => d.month)]);
  const result = Array.from(allMonths)
    .sort()
    .map((month) => ({
      month,
      [entity1]: data1.find((d) => d.month === month)?.count || 0,
      [entity2]: data2.find((d) => d.month === month)?.count || 0,
    }));
  return result;
}
