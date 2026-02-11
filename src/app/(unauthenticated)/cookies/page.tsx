import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import React from 'react';
import { Cookie, Settings, Info } from 'lucide-react';

export default function CookiesPolicy() {
    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-28 pb-12 text-sm leading-relaxed">
                <h1 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <Cookie className="w-6 h-6 text-brand-600" />
                    Cookie Policy
                </h1>

                <p className="mb-4">
                    This Cookie Policy explains how JobMaze uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
                </p>

                <h2 className="text-lg font-semibold mt-8 mb-3">1. What are cookies?</h2>
                <p className="mb-4">
                    Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                </p>

                <h2 className="text-lg font-semibold mt-8 mb-3">2. How we use cookies</h2>
                <p className="mb-4">
                    We use cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.
                </p>

                <div className="space-y-4 my-8">
                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                            Essential Cookies
                        </h3>
                        <p className="text-gray-600 text-xs">
                            Strictly necessary for the website to function. Without these, you cannot login or use secure features.
                        </p>
                    </div>
                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Performance & Analytics
                        </h3>
                        <p className="text-gray-600 text-xs">
                            Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                        </p>
                    </div>
                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            Functional Cookies
                        </h3>
                        <p className="text-gray-600 text-xs">
                            Allow the website to remember choices you make (such as your user name, language or the region you are in) and provide enhanced features.
                        </p>
                    </div>
                </div>

                <h2 className="text-lg font-semibold mt-8 mb-3">3. Controlling Cookies</h2>
                <p className="mb-4">
                    You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your browser controls to block or delete cookies.
                </p>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                    <Settings className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-gray-900 text-sm">Browser Settings</h4>
                        <p className="text-xs text-gray-600 mt-1">
                            Most web browsers allow you to control cookies through their settings preferences. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" target="_blank" className="text-brand-600 underline">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" target="_blank" className="text-brand-600 underline">www.allaboutcookies.org</a>.
                        </p>
                    </div>
                </div>

                <h2 className="text-lg font-semibold mt-8 mb-3">4. Updates to this policy</h2>
                <p className="mb-4">
                    We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                </p>

                <p className="mt-8 text-xs text-gray-400">
                    Last updated: {new Date().getFullYear()}
                </p>
            </div>
            <Footer />
        </>
    );
}
