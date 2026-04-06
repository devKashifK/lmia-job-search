import { getNocProfile, getTeerCategory } from '@/lib/noc-service';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Briefcase,
    MapPin,
    CheckCircle2,
    BookOpen,
    Info,
    ArrowLeft,
    TrendingUp,
    GraduationCap,
    DollarSign,
    Target,
    Layers,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';

interface PageProps {
    params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { code } = await params;
    const profile = await getNocProfile(code);

    if (!profile) {
        return {
            title: 'NOC Not Found',
        };
    }

    return {
        title: `NOC ${profile.code} - ${profile.title} | JobMaze Canada`,
        description: `Detailed guide for NOC ${profile.code}: ${profile.title}. Salaries, duties, requirements, and job outlook for immigrated professionals.`,
    };
}

export default async function NocDetailPage({ params }: PageProps) {
    const { code } = await params;
    const profile = await getNocProfile(code);

    if (!profile) {
        notFound();
    }

    const teer = getTeerCategory(profile.code);
    const allDuties = Object.values(profile.mainDuties).flat();

    // Filter out generic header sentence if it exists
    const filteredDuties = allDuties.filter(duty =>
        !duty.toLowerCase().includes('perform some or all of the following') &&
        duty.length > 5 // Also filter out tiny strings that might be artifacts
    );

    return (
        <div className="min-h-screen  flex flex-col font-inter">
            <Navbar />

            <main className="flex-1 pt-32 pb-16">
                <BackgroundWrapper>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Breadcrumb */}
                        <div className="mb-8">
                            <Link
                                href="/resources/noc-codes"
                                className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-brand-100"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to NOC Guide
                            </Link>
                        </div>

                        {/* HERO HEADER */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 mb-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden lg:block">
                                <Briefcase className="w-80 h-80 text-brand-900" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <div className="bg-brand-900 text-amber-400 font-black px-4 py-1.5 rounded-xl text-sm tracking-tight border-2 border-brand-800">
                                        NOC {profile.code}
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-700 font-bold px-4 py-1.5 rounded-xl text-sm border border-emerald-100">
                                        {teer}
                                    </div>
                                    {profile.classification?.category && profile.classification.category !== 'N/A' && (
                                        <div className="bg-blue-50 text-blue-700 font-medium px-4 py-1.5 rounded-xl text-sm border border-blue-100 hidden md:block">
                                            {profile.classification.category.split(' – ')[1] || profile.classification.category}
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tight leading-[1.1]">
                                    {profile.title}
                                </h1>

                                <p className="text-xl text-gray-600 leading-relaxed max-w-4xl font-light">
                                    {profile.overview}
                                </p>

                                <div className="mt-10 flex flex-wrap gap-4">
                                    <Link href={`/search/lmia/all?field=noc_code&q=${profile.code}&t=lmia`}>
                                        <Button size="lg" className="bg-brand-900 hover:bg-brand-800 text-white font-bold px-10 py-7 rounded-full shadow-2xl shadow-brand-900/20 text-lg transition-all hover:-translate-y-1">
                                            <Briefcase className="w-5 h-5 mr-3" />
                                            Find LMIA Jobs for {profile.code}
                                        </Button>
                                    </Link>
                                    <Link href={`/search/hot-leads/all?field=noc_code&q=${profile.code}&t=trending_job`}>
                                        <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 font-bold px-10 py-7 rounded-full text-lg hover:bg-gray-50 transition-all hover:-translate-y-1">
                                            <Target className="w-5 h-5 mr-3" />
                                            Explore Hot Leads
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* DASHBOARD GRID */}
                        {(profile.classification || (profile.commonJobTitles && profile.commonJobTitles.length > 0)) && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

                                {/* Classification Details */}
                                {profile.classification && (
                                    <Card className="lg:col-span-1 rounded-[2rem] border-none shadow-lg ring-1 ring-gray-100 bg-white">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3 text-brand-600 mb-2">
                                                <Layers className="w-5 h-5" />
                                                <span className="text-xs font-black uppercase tracking-widest">Classification Hierarchy</span>
                                            </div>
                                            <CardTitle className="text-lg font-bold">Standard Occupational Structure</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {[
                                                { label: 'Major Group', val: profile.classification.major_group },
                                                { label: 'Sub-Major', val: profile.classification.sub_major_group },
                                                { label: 'Minor Group', val: profile.classification.minor_group },
                                            ].map((item, i) => item.val && item.val !== 'N/A' && (
                                                <div key={i} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</div>
                                                    <div className="text-sm font-medium text-gray-700 leading-snug">{item.val}</div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Common Titles */}
                                {profile.commonJobTitles && profile.commonJobTitles.length > 0 && (
                                    <Card className={`${profile.classification ? 'lg:col-span-2' : 'lg:col-span-3'} rounded-[2rem] border-none shadow-lg ring-1 ring-gray-100 bg-white`}>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3 text-emerald-600 mb-2">
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span className="text-xs font-black uppercase tracking-widest">Common Job Titles</span>
                                            </div>
                                            <CardTitle className="text-lg font-bold">This NOC code includes roles like...</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.commonJobTitles.map((title, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border-gray-200 hover:border-emerald-200 transition-all py-2 px-4 rounded-xl text-sm font-medium">
                                                        {title}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* CONTENT GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* LEFT COLUMN: Duties & Salary */}
                            <div className="lg:col-span-2 space-y-10">

                                {/* Main Duties */}
                                <Card className="rounded-[2rem] border-none shadow-xl ring-1 ring-gray-100 bg-white overflow-hidden">
                                    <div className="h-2 bg-brand-600 w-full" />
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                            <Briefcase className="w-6 h-6 text-brand-600" />
                                            Core Responsibilities
                                        </CardTitle>
                                        <CardDescription className="text-base">Key tasks performed by professionals in this role.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-4">
                                        {filteredDuties.length > 0 ? (
                                            <ul className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                                {filteredDuties.map((duty, idx) => (
                                                    <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-brand-50/30 transition-colors group">
                                                        <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 font-bold text-xs text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <span className="text-gray-700 leading-relaxed text-base">
                                                            {duty.replace(/^[-\s•*]+/, '').trim()}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center py-10 text-gray-400 italic">No specific duties documented for this classification.</div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Salary Prospects Table */}
                                {profile.salaryProspects && profile.salaryProspects.length > 0 && (
                                    <Card className="rounded-[2rem] border-none shadow-xl ring-1 ring-gray-100 bg-white overflow-hidden">
                                        <div className="h-2 bg-emerald-500 w-full" />
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                                <DollarSign className="w-6 h-6 text-emerald-600" />
                                                Salary Prospects (Hourly CAD)
                                            </CardTitle>
                                            <CardDescription className="text-base">Regional wage variations for this occupation across Canada.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0">
                                            <div className="rounded-2xl border border-gray-100 overflow-hidden mt-4">
                                                <Table>
                                                    <TableHeader className="bg-gray-50">
                                                        <TableRow className="hover:bg-transparent border-gray-100">
                                                            <TableHead className="font-bold text-gray-900 py-4">Region / Province</TableHead>
                                                            <TableHead className="font-bold text-gray-900 text-center">Low</TableHead>
                                                            <TableHead className="font-bold text-brand-600 text-center bg-brand-50/30 underline decoration-brand-200">Median</TableHead>
                                                            <TableHead className="font-bold text-gray-900 text-center">High</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {profile.salaryProspects.map((salary, i) => (
                                                            <TableRow key={i} className="hover:bg-gray-50/50 border-gray-50 transition-colors">
                                                                <TableCell className="font-semibold text-gray-700 py-4">{salary.region}</TableCell>
                                                                <TableCell className="text-center text-gray-500">${salary.low}</TableCell>
                                                                <TableCell className="text-center font-black text-brand-700 bg-brand-50/20">${salary.median || '—'}</TableCell>
                                                                <TableCell className="text-center text-gray-500">${salary.high}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest px-2">
                                                <Info className="w-3 h-3" />
                                                Data based on latest Canadian Labour Market Information (LMI)
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Requirements */}
                                {profile.employmentRequirements.length > 0 && (
                                    <Card className="rounded-[2rem] border-none shadow-xl ring-1 ring-gray-100 bg-white overflow-hidden">
                                        <div className="h-2 bg-amber-400 w-full" />
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                                <GraduationCap className="w-6 h-6 text-amber-500" />
                                                Employment Requirements
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-4">
                                            <div className="space-y-4">
                                                {profile.employmentRequirements.map((req, idx) => (
                                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-50 hover:border-amber-100 hover:bg-amber-50/10 transition-all">
                                                        <div className="mt-1 text-amber-500 flex-shrink-0">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </div>
                                                        <p className="text-gray-700 leading-relaxed font-bold">{req.replace(/^[-\s•*]+/, '').trim()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* RIGHT COLUMN: Sidebar (Market, Pathways) */}
                            <div className="space-y-8">

                                {/* Market Outlook */}
                                {(profile.jobOutlook && profile.jobOutlook.length > 0) && (
                                    <Card className="rounded-[2rem] border-none shadow-lg ring-1 ring-gray-100 bg-white overflow-hidden">
                                        <CardHeader className="pb-4">
                                            <div className="bg-brand-50 text-brand-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <CardTitle className="text-xl font-bold">2026-2031 Job Outlook</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600 text-sm leading-relaxed font-medium mb-4 italic p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                "{profile.jobOutlook[0]}"
                                            </p>
                                            {profile.labourMarketDemand && profile.labourMarketDemand.length > 0 && (
                                                <div className="space-y-3 mt-6">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Market Demand Factors</div>
                                                    {profile.labourMarketDemand.map((demand, i) => (
                                                        <div key={i} className="text-sm text-gray-600 flex gap-3 items-start">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                                            {demand}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Pathways */}
                                {profile.pathways && profile.pathways.length > 0 && (
                                    <Card className="rounded-[2rem] border-none shadow-lg ring-1 ring-emerald-100 bg-emerald-50/30 overflow-hidden border-l-4 border-l-emerald-500">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <Target className="w-5 h-5 text-emerald-600" />
                                                Immigration Pathways
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {profile.pathways.map((path, i) => (
                                                <div key={i} className="text-sm font-bold text-gray-700 bg-white p-4 rounded-2xl shadow-sm border border-emerald-100/50 flex items-center justify-between group cursor-default">
                                                    {path}
                                                    <ExternalLink className="w-3 h-3 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Additional Info */}
                                {profile.additionalInfo.length > 0 && (
                                    <div className="bg-brand-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                        <div className="absolute -right-4 -bottom-4 opacity-10">
                                            <Info className="w-40 h-40" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                            <Info className="w-5 h-5 text-amber-400" />
                                            Professional Context
                                        </h3>
                                        <ul className="space-y-4 relative z-10">
                                            {profile.additionalInfo.map((info, idx) => (
                                                <li key={idx} className="text-sm text-blue-100/80 leading-relaxed font-light pl-4 border-l-2 border-amber-400/30">
                                                    {info}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* CTA CARD */}
                                <Card className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-[2rem] p-8 shadow-xl border-none text-brand-900">
                                    <h4 className="text-xl font-black mb-4">Start your move to Canada</h4>
                                    <p className="text-sm font-medium mb-8 leading-relaxed opacity-90">
                                        JobMaze tracks 10,000+ LMIA opportunities specifically for professionals in NOC {profile.code}.
                                    </p>
                                    <Link href="/sign-up" className="block">
                                        <Button className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-6 rounded-2xl shadow-lg transition-all active:scale-95">
                                            Create Free  Account
                                        </Button>
                                    </Link>
                                    <p className="text-[10px] uppercase font-black text-center mt-4 tracking-widest opacity-60">
                                        TRUSTED BY 1,200+ CONSULTANTS
                                    </p>
                                </Card>

                            </div>
                        </div>

                    </div>
                </BackgroundWrapper>
            </main>

        </div>
    );
}
