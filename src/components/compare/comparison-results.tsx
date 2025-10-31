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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useComparisonData } from './use-compare-data';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

type ComparisonType = 'job_title' | 'state' | 'city' | 'employer';

interface ComparisonResultsProps {
  type: ComparisonType;
  entity1: string;
  entity2: string;
  entity3?: string;
  onReset: () => void;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-xl border-2 border-gray-100">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span> {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ComparisonResults({
  type,
  entity1,
  entity2,
  entity3,
  onReset,
}: ComparisonResultsProps) {
  const { data, isLoading } = useComparisonData(type, entity1, entity2, entity3);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [comparisonName, setComparisonName] = React.useState('');
  const [comparisonNotes, setComparisonNotes] = React.useState('');
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Export as PDF
  const handleExportPDF = async () => {
    if (!resultsRef.current) return;
    
    try {
      toast.loading('Generating PDF...');
      const canvas = await html2canvas(resultsRef.current, {
        logging: false,
        useCORS: true,
      } as any);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`comparison-${entity1}-vs-${entity2}.pdf`);
      
      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  };

  // Share link
  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    url.searchParams.set('entity1', entity1);
    url.searchParams.set('entity2', entity2);
    
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
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onReset}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          New Comparison
        </Button>

        {/* Export/Share Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopySummary}
            variant="outline"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Summary
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShareLink}>
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setSaveDialogOpen(true)}
            size="sm"
            className="bg-brand-500 hover:bg-brand-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Comparison
          </Button>
        </div>
      </div>

      {/* Results Container */}
      <div ref={resultsRef}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="relative overflow-hidden rounded-xl border-2 border-brand-200/50 bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full mb-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-blue-700">Entity 1</span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{entity1}</h2>
                {data1.growthRate !== undefined && (
                  data1.growthRate > 0 ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 text-[10px] px-1.5 py-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{data1.growthRate}%
                    </Badge>
                  ) : data1.growthRate < 0 ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1 text-[10px] px-1.5 py-0.5">
                      <TrendingDown className="w-3 h-3" />
                      {data1.growthRate}%
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1 text-[10px] px-1.5 py-0.5">
                      <Minus className="w-3 h-3" />
                      0%
                    </Badge>
                  )
                )}
              </div>
              <p className="text-xs text-gray-600 font-medium">
                {data1.totalJobs.toLocaleString()} jobs
              </p>
            </div>
            <div className="px-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-xl rotate-3 transition-transform hover:rotate-0">
                  <span className="text-white font-bold text-sm">VS</span>
                </div>
              </div>
            </div>
            <div className="flex-1 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-700">Entity 2</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <h2 className="text-xl font-bold text-gray-900">{entity2}</h2>
                {data2.growthRate !== undefined && (
                  data2.growthRate > 0 ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 text-[10px] px-1.5 py-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{data2.growthRate}%
                    </Badge>
                  ) : data2.growthRate < 0 ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1 text-[10px] px-1.5 py-0.5">
                      <TrendingDown className="w-3 h-3" />
                      {data2.growthRate}%
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1 text-[10px] px-1.5 py-0.5">
                      <Minus className="w-3 h-3" />
                      0%
                    </Badge>
                  )
                )}
              </div>
              <p className="text-xs text-gray-600 font-medium">
                {data2.totalJobs.toLocaleString()} jobs
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative overflow-hidden rounded-xl border border-purple-200/50 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-purple-50/50 p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="relative flex items-start gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">AI-Powered Insights</h3>
              <p className="text-xs text-gray-600">Key differences analyzed</p>
            </div>
          </div>
          <div className="relative space-y-2.5 text-xs text-gray-700 leading-relaxed">
            {/* Volume comparison */}
            <p>
              <strong>{entity1}</strong> has{' '}
              <strong className={cn(
                jobsDiff > 0 ? 'text-green-600' : jobsDiff < 0 ? 'text-red-600' : 'text-gray-600'
              )}>
                {Math.abs(jobsDiff).toLocaleString()} {jobsDiff > 0 ? 'more' : 'fewer'}
              </strong>{' '}
              job postings than <strong>{entity2}</strong> (
              {jobsDiff > 0 ? '+' : ''}{jobsDiffPercent}% difference).
            </p>
            
            {/* Growth trend insight */}
            {(data1.growthRate !== undefined && data2.growthRate !== undefined) && (
              <p>
                <strong>Growth Trend:</strong>{' '}
                {Math.abs(data1.growthRate) > Math.abs(data2.growthRate) ? (
                  <>
                    <strong>{entity1}</strong> is growing{' '}
                    <strong className="text-green-600">
                      {Math.abs(data1.growthRate - data2.growthRate).toFixed(1)}% faster
                    </strong>{' '}
                    {data1.growthRate > 0 ? '(expanding market)' : '(declining slower)'}
                  </>
                ) : Math.abs(data2.growthRate) > Math.abs(data1.growthRate) ? (
                  <>
                    <strong>{entity2}</strong> is growing{' '}
                    <strong className="text-green-600">
                      {Math.abs(data2.growthRate - data1.growthRate).toFixed(1)}% faster
                    </strong>{' '}
                    {data2.growthRate > 0 ? '(expanding market)' : '(declining slower)'}
                  </>
                ) : (
                  <>Both showing similar growth patterns</>
                )}
              </p>
            )}
            
            {/* Benchmark comparison */}
            {data.benchmark && (
              <p>
                <strong>Market Position:</strong>{' '}
                {data1.totalJobs > data.benchmark.avgJobsPerValue ? (
                  <>
                    <strong>{entity1}</strong> is{' '}
                    <strong className="text-blue-600">
                      {Math.round((data1.totalJobs / data.benchmark.avgJobsPerValue - 1) * 100)}% above
                    </strong>{' '}
                    national average
                  </>
                ) : (
                  <>
                    <strong>{entity1}</strong> is below national average
                  </>
                )}
                , while{' '}
                {data2.totalJobs > data.benchmark.avgJobsPerValue ? (
                  <>
                    <strong>{entity2}</strong> is{' '}
                    <strong className="text-blue-600">
                      {Math.round((data2.totalJobs / data.benchmark.avgJobsPerValue - 1) * 100)}% above
                    </strong>{' '}
                    average
                  </>
                ) : (
                  <>
                    <strong>{entity2}</strong> is below average
                  </>
                )}.
              </p>
            )}
            
            {/* Top location insight */}
            {data1.topCities[0] && data2.topCities[0] && (
              <p>
                <strong>Top Locations:</strong> Highest demand for <strong>{entity1}</strong> in{' '}
                <strong className="text-blue-600">{data1.topCities[0].name}</strong>{' '}
                ({data1.topCities[0].count} jobs), while <strong>{entity2}</strong> peaks in{' '}
                <strong className="text-green-600">{data2.topCities[0].name}</strong>{' '}
                ({data2.topCities[0].count} jobs).
              </p>
            )}
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
          className="mb-6"
        >
          <Card className="p-5 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-200 rounded-lg">
                <BarChart3 className="w-4 h-4 text-gray-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">National Benchmark</h3>
                <p className="text-xs text-gray-600">Comparison to market average</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* National Average */}
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-[10px] text-gray-600 mb-1">Market Average</p>
                <p className="text-2xl font-bold text-gray-900">{data.benchmark.avgJobsPerValue.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">jobs per {type.replace('_', ' ')}</p>
              </div>
              
              {/* Entity 1 vs Average */}
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-[10px] text-gray-600 mb-1">{entity1}</p>
                <p className="text-2xl font-bold text-blue-700">
                  {data1.totalJobs > data.benchmark.avgJobsPerValue ? '+' : ''}
                  {Math.round((data1.totalJobs / data.benchmark.avgJobsPerValue - 1) * 100)}%
                </p>
                <p className="text-[10px] text-gray-600">
                  {data1.totalJobs > data.benchmark.avgJobsPerValue ? 'above' : 'below'} average
                </p>
              </div>
              
              {/* Entity 2 vs Average */}
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-[10px] text-gray-600 mb-1">{entity2}</p>
                <p className="text-2xl font-bold text-green-700">
                  {data2.totalJobs > data.benchmark.avgJobsPerValue ? '+' : ''}
                  {Math.round((data2.totalJobs / data.benchmark.avgJobsPerValue - 1) * 100)}%
                </p>
                <p className="text-[10px] text-gray-600">
                  {data2.totalJobs > data.benchmark.avgJobsPerValue ? 'above' : 'below'} average
                </p>
              </div>
            </div>
            
            {/* Top 5 in market */}
            {data.benchmark.topValues && data.benchmark.topValues.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-[10px] text-gray-600 mb-2 font-medium">Top 5 in Market:</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.benchmark.topValues.map((val: any, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-[10px] bg-white">
                      {val.name} ({val.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Categories Comparison */}
        {topCategoriesChart.length > 0 && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <BarChart3 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Top Categories</h3>
                </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topCategoriesChart} barGap={8}>
                  <defs>
                    <linearGradient id="colorEntity1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorEntity2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    stroke="#e5e7eb"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#e5e7eb" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey={entity1}
                    fill="url(#colorEntity1)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey={entity2}
                    fill="url(#colorEntity2)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
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
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Top Cities</h3>
                </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topCitiesChart} barGap={8}>
                  <defs>
                    <linearGradient id="colorCity1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorCity2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    stroke="#e5e7eb"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#e5e7eb" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey={entity1}
                    fill="url(#colorCity1)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey={entity2}
                    fill="url(#colorCity2)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
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
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Monthly Trends</h3>
              </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyTrendsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  stroke="#e5e7eb"
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} stroke="#e5e7eb" axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey={entity1}
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ fill: '#6366f1', stroke: '#fff', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: '#6366f1' }}
                />
                <Line
                  type="monotone"
                  dataKey={entity2}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Side-by-Side Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-200/50">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                <h3 className="text-sm font-bold text-gray-900">{entity1}</h3>
              </div>
              <DataList title="Top Employers" data={data1.topEmployers.slice(0, 5)} icon={Building2} color="indigo" />
              <div className="my-3 border-t border-gray-100" />
              <DataList title="Top NOC Codes" data={data1.topNOC.slice(0, 5)} icon={Hash} color="purple" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50/50 via-white to-teal-50/30 p-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-200/50">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                <h3 className="text-sm font-bold text-gray-900">{entity2}</h3>
              </div>
              <DataList title="Top Employers" data={data2.topEmployers.slice(0, 5)} icon={Building2} color="green" />
              <div className="my-3 border-t border-gray-100" />
              <DataList title="Top NOC Codes" data={data2.topNOC.slice(0, 5)} icon={Hash} color="teal" />
            </div>
          </div>
        </motion.div>
      </div>
      </div>
      {/* Close Results Container */}

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
  const diffPercent = value2 > 0 ? ((diff / value2) * 100).toFixed(1) : '0';

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-brand-100 rounded-lg">
          <Icon className="w-5 h-5 text-brand-600" />
        </div>
        <h4 className="font-semibold text-gray-900">{label}</h4>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 truncate">{entity1}</span>
          <span className="font-bold text-gray-900">{value1.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 truncate">{entity2}</span>
          <span className="font-bold text-gray-900">{value2.toLocaleString()}</span>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Difference</span>
            <div className="flex items-center gap-1">
              {diff > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : diff < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : (
                <Minus className="w-4 h-4 text-gray-400" />
              )}
              <span
                className={cn(
                  'font-semibold',
                  diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600'
                )}
              >
                {diff > 0 ? '+' : ''}{diff.toLocaleString()} ({diff > 0 ? '+' : ''}{diffPercent}%)
              </span>
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
  const colorClasses = {
    indigo: 'text-indigo-600 bg-indigo-100',
    purple: 'text-purple-600 bg-purple-100',
    green: 'text-green-600 bg-green-100',
    teal: 'text-teal-600 bg-teal-100',
    gray: 'text-gray-600 bg-gray-100',
  };

  const badgeColorClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const iconColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;
  const badgeColorClass = badgeColorClasses[color as keyof typeof badgeColorClasses] || badgeColorClasses.gray;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className={cn('p-1 rounded-md', iconColorClass)}>
          <Icon className="w-3 h-3" />
        </div>
        <h4 className="text-xs font-bold text-gray-800">{title}</h4>
      </div>
      <div className="space-y-1.5 ml-1">
        {data.map((item, index) => (
          <div key={index} className="group flex items-center justify-between text-xs hover:bg-gray-50/50 rounded-md px-2 py-1.5 transition-colors">
            <span className="text-gray-700 truncate flex-1 font-medium">{item.name}</span>
            <Badge variant="outline" className={cn('text-[10px] ml-2 px-1.5 py-0 h-5', badgeColorClass)}>
              {item.count.toLocaleString()}
            </Badge>
          </div>
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
