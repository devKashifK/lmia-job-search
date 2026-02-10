import { Metadata } from 'next';
import { DocSidebar } from '@/components/documentation/doc-sidebar';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { BookOpen, Search, CheckCircle2, AlertCircle, Info, ArrowUpRight, Users, Zap, Lock, Coins } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
    title: 'Documentation | Job Maze',
    description: 'Master your job search with our comprehensive guide to LMIA data, NOC codes, and platform features.',
};

export default function DocumentationPage() {
    return (
        <BackgroundWrapper>
            <div className="relative pt-12 pb-20 sm:pt-16 sm:pb-24">
                {/* Header */}
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-16">
                    <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-xl mb-6">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-6">
                        Documentation & <span className="text-brand-600">Guide</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600">
                        Learn how to leverage LMIA data and our advanced tools to accelerate your Canadian job search.
                    </p>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        {/* Sidebar */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-24">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="font-semibold text-gray-900 px-4 mb-4 text-sm uppercase tracking-wider">
                                        Contents
                                    </h3>
                                    <DocSidebar />
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <main className="lg:col-span-9 space-y-16">
                            {/* Getting Started */}
                            <section id="getting-started" className="scroll-mt-24">
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                                            <span className="text-2xl font-bold">1</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900">Getting Started</h2>
                                    </div>

                                    <div className="prose prose-lg text-gray-600 max-w-none">
                                        <p>
                                            Welcome to <strong>Job Maze</strong>, the most advanced platform for finding LMIA-approved jobs in Canada. Unlike traditional job boards like Indeed or LinkedIn, we don't just scrape random listings. We focus on connecting you with employers who have <strong>already secured or applied for Labour Market Impact Assessments (LMIAs)</strong>.
                                        </p>
                                        <p>
                                            This means the employers listed here have already proven to the government that they need foreign workers.
                                        </p>

                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 my-6 not-prose">
                                            <h4 className="font-semibold text-gray-900 mb-2">Example Scenario:</h4>
                                            <p className="text-sm text-gray-600">
                                                Imagine you are a <strong>Software Engineer</strong> looking to move to Canada. On a regular job board, you apply to 100 jobs, but 99 of them automatically reject you because you don't have a work permit.
                                                <br /><br />
                                                On <strong>Job Maze</strong>, you search for "Software Engineer" and find <em>TechCorp Inc.</em> listed. You see they have an <strong>Active Positive LMIA</strong> for 5 positions. This tells you <em>TechCorp Inc.</em> is <strong>actively looking and legally approved</strong> to hire foreign talent like you.
                                            </p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                                            <Card className="bg-gradient-to-br from-brand-50 to-white border-brand-100">
                                                <CardContent className="p-6">
                                                    <h3 className="font-bold text-brand-900 mb-2 flex items-center gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-brand-600" />
                                                        Verified Employers
                                                    </h3>
                                                    <p className="text-sm text-brand-700">
                                                        We aggregate data directly from government sources to identify employers with positive LMIAs.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                                                <CardContent className="p-6">
                                                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                        <Search className="w-5 h-5 text-blue-600" />
                                                        Smart Search
                                                    </h3>
                                                    <p className="text-sm text-blue-700">
                                                        Filter by specific NOC codes, provinces, and approval status to find your perfect match.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Search Mastery */}
                            <section id="search-mastery" className="scroll-mt-24">
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                            <span className="text-2xl font-bold">2</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900">Search Mastery</h2>
                                    </div>

                                    <div className="prose prose-lg text-gray-600 max-w-none">
                                        <h3>How to Find the Right Job</h3>
                                        <p>
                                            Finding a job with visa sponsorship is difficult. Our advanced filters help you narrow down the millions of jobs to the few that matter to you.
                                        </p>

                                        <h4 className="flex items-center gap-2 mt-6 mb-3 font-semibold text-gray-900">
                                            <Search className="w-4 h-4 text-purple-600" />
                                            Search Modes
                                        </h4>
                                        <p className="mb-4">Use the "Search By" dropdown to switch specific contexts:</p>

                                        <ul className="space-y-4 list-none pl-0 not-prose mt-2">
                                            <li className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="bg-white">Keywords</Badge>
                                                    <span className="font-semibold text-gray-900">Best for Exploration</span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Use broad terms like "Chef", "IT", or "Construction". This will search across job titles and descriptions.
                                                </p>
                                                <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded border border-gray-200 inline-block">
                                                    Example: Searching "Cook" will show "Line Cook", "Prep Cook", and "Head Chef".
                                                </div>
                                            </li>
                                            <li className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="bg-white">NOC Code</Badge>
                                                    <span className="font-semibold text-gray-900">Best for Precision</span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    If you know your 5-digit NOC code (e.g., for Express Entry), use this. It filters explicitly for that government classification.
                                                </p>
                                                <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded border border-gray-200 inline-block">
                                                    Example: "21231" will only show Software Engineers, ignoring other IT roles.
                                                </div>
                                            </li>
                                        </ul>

                                        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 my-8 flex gap-4 not-prose">
                                            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-amber-900 text-sm mb-1">Pro Tip: Location Filtering</h4>
                                                <p className="text-sm text-amber-800">
                                                    You can target specific provinces (like "Atlantic Canada" for AIP). Select multiple provinces to broaden your search.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Understanding Data */}
                            <section id="understanding-data" className="scroll-mt-24">
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <span className="text-2xl font-bold">3</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900">Understanding Data</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 not-prose">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">LMIA Status</h3>
                                            <p className="text-gray-600 mb-4 text-sm">
                                                We color-code employers based on their LMIA application status:
                                            </p>
                                            <ul className="space-y-4">
                                                <li className="bg-green-50 p-3 rounded-lg border border-green-100">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                                        <strong className="text-green-900">Positive (Green)</strong>
                                                    </div>
                                                    <p className="text-xs text-green-800">
                                                        The employer has received government approval to hire. They have a "Positive LMIA" decision on file.
                                                    </p>
                                                </li>
                                                <li className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                                        <strong className="text-yellow-900">Pending/Neutral (Yellow)</strong>
                                                    </div>
                                                    <p className="text-xs text-yellow-800">
                                                        Waitlist or unknown status. They may have applied but the decision is not public yet.
                                                    </p>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">NOC Codes & TEER</h3>
                                            <p className="text-gray-600 mb-4 text-sm">
                                                Canada uses the TEER system (0-5) to classify jobs by education level. This is crucial for PR applications.
                                            </p>
                                            <Link href="/resources/noc-codes" className="block">
                                                <Card className="hover:border-brand-300 transition-colors cursor-pointer group mb-4">
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                                                                <BookOpen className="w-5 h-5" />
                                                            </div>
                                                            <div className="font-medium text-gray-900">Explore NOC Guide</div>
                                                        </div>
                                                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500" />
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-xs text-gray-600">
                                                    <strong>Example:</strong> A "Retail Manager" is <strong>TEER 0</strong> (Management), while a "Cleaner" might be <strong>TEER 5</strong>. Express Entry often requires TEER 0, 1, 2, or 3.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Features Guide */}
                            <section id="features-guide" className="scroll-mt-24">
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <span className="text-2xl font-bold">4</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900">Features Guide</h2>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-2">Job Comparison</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Stuck between two options? Click the <span className="inline-block p-1 bg-gray-200 rounded text-xs mx-1">Compare</span> button on any job card.
                                            </p>
                                            <p className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                                <strong>Use Case:</strong> Compare a "Cook" role in Toronto vs. a "Chef" role in Halifax to see which offers better pay vs. cost of living.
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-2">Saved Jobs & Alerts</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Don't lose track of good leads. Bookmark jobs to your dashboard.
                                            </p>
                                            <p className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                                <strong>Use Case:</strong> You find 10 good jobs but don't have time to apply now. Save them, and apply to all 10 on the weekend.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Step-by-Step Guide */}
                            <section id="step-by-step" className="scroll-mt-24">
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                            <span className="text-2xl font-bold">5</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900">How to Apply: Step-by-Step</h2>
                                    </div>

                                    <div className="prose prose-lg text-gray-600 max-w-none">
                                        <p>Follow this proven workflow to maximize your chances of securing an interview.</p>

                                        <div className="space-y-8 mt-8 not-prose">
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">1</div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 mb-2">Identify Your NOC Code</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Don't guess. Use our <Link href="/resources/noc-codes" className="text-brand-600 hover:underline">NOC Guide</Link> to find the exact code that matches your experience. Canadian employers search by these codes.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">2</div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 mb-2">Filter for "Positive" LMIAs</h3>
                                                    <p className="text-sm text-gray-600">
                                                        In the search bar, look for the green "Positive" indicator. These employers have already done the hard paperwork. Prioritize them over "Pending" ones.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">3</div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 mb-2">Unlock & Contact</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Use 1 credit to reveal the <strong>Verified Email</strong>. sending your resume directly to this email is 10x more effective than a generic "Apply" button on other sites.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">4</div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 mb-2">Tailor Your Subject Line</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Use a subject line like: <em>"Application for [Job Title] - NOC [Code] - [Your Name] - Work Permit Ready"</em>. This shows you understand their needs immediately.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Credits & Pricing */}
                            <section id="credits-pricing" className="scroll-mt-24">
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                                            <span className="text-2xl font-bold">6</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900">Credits & Pricing</h2>
                                    </div>

                                    <div className="prose prose-lg text-gray-600 max-w-none">
                                        <h3>How the Credit System Works</h3>
                                        <p>
                                            We operate on a transparent <strong>"Pay-per-Unlock"</strong> credit system. You don't need a subscription to search jobs. You only use credits when you want to take action.
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                                    <Lock className="w-24 h-24" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-2">What you see for free</div>
                                                    <div className="space-y-2 mb-4">
                                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                                    </div>
                                                    <div className="pt-4 border-t border-gray-100">
                                                        <p className="text-gray-900 font-medium text-sm">
                                                            ✅ Company Name<br />
                                                            ✅ Job Title<br />
                                                            ✅ Location & Salary
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-brand-50 p-5 rounded-2xl border border-brand-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                                    <Coins className="w-24 h-24 text-brand-900" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="text-sm text-brand-600 uppercase tracking-widest font-semibold mb-2">What 1 Credit Unlocks</div>
                                                    <div className="space-y-1 mb-4">
                                                        <div className="text-lg font-bold text-gray-900">Contact Details</div>
                                                        <div className="text-xs text-brand-700">Instant access to apply</div>
                                                    </div>
                                                    <div className="pt-4 border-t border-brand-200">
                                                        <p className="text-gray-900 font-medium text-sm">
                                                            🔓 <strong>Verified Email Address</strong><br />
                                                            🔓 <strong>Phone Number</strong> (if available)<br />
                                                            🔓 <strong>Direct Application Link</strong>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-gray-900 mb-4">Why use credits?</h4>
                                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                            <li><strong>Fair Pricing:</strong> You only pay for the leads you actually want. If you only see 5 good jobs, you only use 5 credits.</li>
                                            <li><strong>Quality ControlButtons:</strong> We verified these contacts. A credit represents a high-value lead—a direct line to a hiring manager.</li>
                                            <li><strong>No Monthly Lock-in:</strong> If you stop searching for a month, you don't lose money on a wasted subscription.</li>
                                        </ul>

                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-8 not-prose">
                                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                <Coins className="w-5 h-5" />
                                                Example Usage
                                            </h4>
                                            <p className="text-sm text-blue-800 mb-4">
                                                You buy the <strong>Starter Pack</strong> (25 Credits).
                                            </p>
                                            <ul className="space-y-2 text-sm text-blue-700">
                                                <li className="flex gap-2">
                                                    <span className="font-mono bg-white px-1.5 rounded text-blue-900">-1</span>
                                                    Unlock verified email for "Construction Manager" at BuildCo.
                                                </li>
                                                <li className="flex gap-2">
                                                    <span className="font-mono bg-white px-1.5 rounded text-blue-900">-1</span>
                                                    Unlock phone number for "Line Cook" at TastyFood.
                                                </li>
                                                <li className="flex gap-2">
                                                    <span className="font-mono bg-white px-1.5 rounded text-blue-900">-1</span>
                                                    Unlock application portal for "Truck Driver" at HaulLogistics.
                                                </li>
                                            </ul>
                                            <p className="mt-4 text-sm font-semibold text-blue-900 border-t border-blue-200 pt-3">
                                                Remaining Balance: 22 Credits
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 mt-8 not-prose">
                                            <Link href="/pricing" className="flex-1">
                                                <Button size="lg" className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-200">
                                                    View Credit Packages
                                                </Button>
                                            </Link>
                                            <Link href="/dashboard" className="flex-1">
                                                <Button size="lg" variant="outline" className="w-full hover:bg-gray-50">
                                                    Check My Balance
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* FAQ */}
                            <section id="faq" className="scroll-mt-24">
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600">
                                            <span className="text-2xl font-bold">7</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                                    </div>

                                    <div className="space-y-6 not-prose">
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-2">Does an LMIA guarantee a job?</h3>
                                            <p className="text-gray-600 text-sm">
                                                No. An LMIA grants the employer <em>permission</em> to hire a foreign worker. You still need to interview and be selected. However, applying to LMIA-holders is infinitely better than applying to random companies that cannot legally hire you.
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-2">Can I search from outside Canada?</h3>
                                            <p className="text-gray-600 text-sm">
                                                Yes! Our platform is specifically designed for international applicants. Employers with LMIAs are often looking for global talent because they couldn't find locals.
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-2">What if the email bounces?</h3>
                                            <p className="text-gray-600 text-sm">
                                                We verify emails regularly. If you unlock a dead contact, simply report it via the dashboard within 24 hours, and we will refund your credit automatically.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>


                        </main>
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
}
