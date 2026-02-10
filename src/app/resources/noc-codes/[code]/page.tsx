import { getNocProfile, getTeerCategory } from '@/lib/noc-service';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Briefcase,
    MapPin,
    CheckCircle2,
    BookOpen,
    Info,
    ArrowLeft,
    Calendar,
    GraduationCap
} from 'lucide-react';
import Link from 'next/link';

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
        title: `NOC ${profile.code} - ${profile.title} | LMIA Job Matches`,
        description: `Detailed guide for NOC ${profile.code}: ${profile.title}. Learn about duties, requirements, and TEER category.`,
    };
}

import BackgroundWrapper from '@/components/ui/background-wrapper';

export default async function NocDetailPage({ params }: PageProps) {
    const { code } = await params;
    const profile = await getNocProfile(code);

    if (!profile) {
        notFound();
    }

    const teer = getTeerCategory(profile.code);

    // Helper to format duties from the object structure
    const allDuties = Object.values(profile.mainDuties).flat();

    return (
        <BackgroundWrapper>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12">

                {/* Breadcrumb / Back */}
                <div className="mb-6">
                    <Link
                        href="/resources/noc-codes"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-brand-600 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to NOC Guide
                    </Link>
                </div>

                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Briefcase className="w-64 h-64 text-brand-900" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-200 text-sm px-3 py-1">
                                NOC {profile.code}
                            </Badge>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 text-sm px-3 py-1">
                                {teer}
                            </Badge>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            {profile.title}
                        </h1>

                        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                            {profile.overview}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href={`/search/lmia/all?field=noc_code&q=${profile.code}&t=lmia`}>
                                <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 px-8">
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    View Active LMIA Jobs
                                </Button>
                            </Link>
                            <Link href={`/search/hot-leads/all?field=noc_code&q=${profile.code}&t=trending_job`}>
                                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    View Trending Jobs
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Duties & Requirements */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Main Duties */}
                        <Card className="border-none shadow-lg shadow-gray-200/40 ring-1 ring-gray-100">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-xl">Main Duties</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {allDuties.map((duty, idx) => (
                                        <li key={idx} className="flex items-start gap-3 group">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2.5 group-hover:bg-blue-600 transition-colors flex-shrink-0" />
                                            <span className="text-gray-700 leading-relaxed">{duty}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Employment Requirements */}
                        <Card className="border-none shadow-lg shadow-gray-200/40 ring-1 ring-gray-100">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <GraduationCap className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <CardTitle className="text-xl">Employment Requirements</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {profile.employmentRequirements.map((req, idx) => (
                                        <li key={idx} className="flex items-start gap-3 group">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2.5 group-hover:bg-purple-600 transition-colors flex-shrink-0" />
                                            <span className="text-gray-700 leading-relaxed">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Sidebar Info */}
                    <div className="space-y-6">

                        {/* Additional Info Card */}
                        {profile.additionalInfo.length > 0 && (
                            <Card className="border-none shadow-md ring-1 ring-gray-100 bg-gray-50/80 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-gray-500" />
                                        <h3 className="font-semibold text-gray-900">Additional Information</h3>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm text-gray-600">
                                        {profile.additionalInfo.map((info, idx) => (
                                            <li key={idx} className="flex gap-2">
                                                <span className="block w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                <span>{info}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Stats / Context - Future expansion */}
                        <Card className="border-none shadow-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white overflow-hidden relative">
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <Briefcase className="w-32 h-32" />
                            </div>
                            <CardContent className="p-6 relative z-10">
                                <h3 className="font-bold text-lg mb-2">Looking for work?</h3>
                                <p className="text-brand-100 text-sm mb-4">
                                    Browse active job listings for {profile.title} ({profile.code}) across Canada.
                                </p>
                                <div className="space-y-3">
                                    <Link href={`/search/lmia/all?field=noc_code&q=${profile.code}&t=lmia`}>
                                        <Button variant="secondary" className="w-full bg-white text-brand-700 hover:bg-brand-50 border border-transparent hover:border-brand-200">
                                            Search LMIA Jobs
                                        </Button>
                                    </Link>
                                    <Link href={`/search/hot-leads/all?field=noc_code&q=${profile.code}&t=trending_job`}>
                                        <Button variant="ghost" className="w-full text-white hover:bg-white/10 hover:text-white">
                                            Search Trending Jobs
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>

            </div>
        </BackgroundWrapper>
    );
}

