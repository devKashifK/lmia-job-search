import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import React from 'react';
import { Shield, Lock, Server, Eye, AlertTriangle } from 'lucide-react';

export default function Security() {
    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-28 pb-12 text-sm leading-relaxed">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Security at JobMaze</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        We take the security of your data seriously. Here is an overview of the measures we take to protect your information and ensure the integrity of our platform.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 mb-12">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Data Encryption</h3>
                        </div>
                        <p className="text-gray-600">
                            All data transmitted between your browser and our servers is encrypted using TLS 1.2 or higher. We use industry-standard encryption for sensitive data at rest in our databases.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <Server className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Secure Infrastructure</h3>
                        </div>
                        <p className="text-gray-600">
                            Our platform is hosted on world-class cloud infrastructure providers (Vercel, Supabase) that maintain rigorous security certifications (SOC 2, ISO 27001).
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                <Eye className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Access Control</h3>
                        </div>
                        <p className="text-gray-600">
                            We enforce strict access controls. Only authorized employees with a legitimate business need have access to user data, and all access is logged and audited.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Incident Response</h3>
                        </div>
                        <p className="text-gray-600">
                            We have a comprehensive incident response plan in place to handle any potential security breaches. In the event of a breach, we will notify affected users as required by law.
                        </p>
                    </div>
                </div>

                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-8 rounded-2xl border border-gray-100">
                    <h2 className="text-gray-900 font-semibold mb-4">Reporting Vulnerabilities</h2>
                    <p>
                        We welcome feedback from security researchers. If you believe you have found a vulnerability in JobMaze, please report it to us immediately.
                    </p>
                    <p className="mt-4">
                        <strong>Email:</strong> security@jobmaze.ca<br />
                        Please include a detailed description of the vulnerability and steps to reproduce it. We will acknowledge your report within 48 hours.
                    </p>
                </div>

                <p className="mt-8 text-xs text-center text-gray-400">
                    Last updated: {new Date().getFullYear()}
                </p>
            </div>
            <Footer />
        </>
    );
}
