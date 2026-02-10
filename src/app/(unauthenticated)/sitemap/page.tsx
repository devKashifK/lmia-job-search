import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';
import Link from 'next/link';
import React from 'react';
import { Network, FileText, Search, Shield, HelpCircle } from 'lucide-react';

export default function Sitemap() {
    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-28 pb-12 text-sm leading-relaxed">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b border-gray-100 pb-4">Sitemap</h1>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Main Pages */}
                    <section>
                        <h2 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                            <Network className="w-5 h-5 text-gray-400" />
                            Main Pages
                        </h2>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-brand-600 hover:underline">Home</Link></li>
                            <li><Link href="/about" className="text-brand-600 hover:underline">About Us</Link></li>
                            <li><Link href="/pricing" className="text-brand-600 hover:underline">Pricing</Link></li>
                            <li><Link href="/contact" className="text-brand-600 hover:underline">Contact</Link></li>
                            <li><Link href="/sign-in" className="text-brand-600 hover:underline">Sign In</Link></li>
                            <li><Link href="/sign-up" className="text-brand-600 hover:underline">Sign Up</Link></li>
                        </ul>
                    </section>

                    {/* Resources */}
                    <section>
                        <h2 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-gray-400" />
                            Resources & Search
                        </h2>
                        <ul className="space-y-3">
                            <li><Link href="/search" className="text-brand-600 hover:underline">Job Search</Link></li>
                            <li><Link href="/resources/documentation" className="text-brand-600 hover:underline">Documentation & Guide</Link></li>
                            <li><Link href="/resources/noc-codes" className="text-brand-600 hover:underline">NOC Codes Directory</Link></li>
                            <li><Link href="/blog" className="text-brand-600 hover:underline">Blog</Link></li>
                        </ul>
                    </section>

                    {/* Legal */}
                    <section>
                        <h2 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-400" />
                            Legal & Privacy
                        </h2>
                        <ul className="space-y-3">
                            <li><Link href="/terms" className="text-brand-600 hover:underline">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link></li>
                            <li><Link href="/security" className="text-brand-600 hover:underline">Security</Link></li>
                            <li><Link href="/cookies" className="text-brand-600 hover:underline">Cookie Policy</Link></li>
                            <li><Link href="/refund-policy" className="text-brand-600 hover:underline">Refund Policy</Link></li>
                        </ul>
                    </section>

                    {/* Support */}
                    <section>
                        <h2 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-gray-400" />
                            Support
                        </h2>
                        <ul className="space-y-3">
                            <li><Link href="/contact" className="text-brand-600 hover:underline">Customer Support</Link></li>
                            <li><Link href="/resources/documentation#faq" className="text-brand-600 hover:underline">FAQ</Link></li>
                        </ul>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}
