import Link from 'next/link';
import { ArrowUpRight, Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
                JobMaze
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
              Empowering global talent with data intelligence. We aggregate, analyze, and visualize government hiring records to uncover hidden opportunities in the Canadian job market.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Twitter className="w-4 h-4" />} label="Twitter" />
              <SocialLink href="#" icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" />
              <SocialLink href="#" icon={<Github className="w-4 h-4" />} label="GitHub" />
              <SocialLink href="#" icon={<Facebook className="w-4 h-4" />} label="Facebook" />
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><FooterLink href="/search">Job Search</FooterLink></li>
              <li><FooterLink href="/dashboard">Data Dashboard</FooterLink></li>
              <li><FooterLink href="/pricing">Pricing Plans</FooterLink></li>
              <li><FooterLink href="/faq">FAQ</FooterLink></li>
            </ul>
          </div>

          {/* Professional Solutions */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Solutions</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><FooterLink href="/for-immigration-consultants">For RCICs</FooterLink></li>
              <li><FooterLink href="/for-recruiters">For Recruiters</FooterLink></li>
              <li><FooterLink href="/what-is-lmia">What is LMIA?</FooterLink></li>
              <li><FooterLink href="/lmia-employers-list">Employers List</FooterLink></li>
              <li><FooterLink href="/lmia-processing-time">Processing Times</FooterLink></li>
            </ul>
          </div>

          {/* Province Hubs */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Provinces</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><FooterLink href="/lmia-jobs-ontario">Ontario</FooterLink></li>
              <li><FooterLink href="/lmia-jobs-british-columbia">BC Jobs</FooterLink></li>
              <li><FooterLink href="/lmia-jobs-alberta">Alberta</FooterLink></li>
              <li><FooterLink href="/lmia-jobs-saskatchewan">Saskatchewan</FooterLink></li>
              <li><FooterLink href="/lmia-jobs/manitoba">Manitoba</FooterLink></li>
              <li><FooterLink href="/lmia-jobs/new-brunswick">New Brunswick</FooterLink></li>
              <li><FooterLink href="/lmia-jobs/nova-scotia">Nova Scotia</FooterLink></li>
            </ul>
          </div>

          {/* Industry Hubs */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Industries</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><FooterLink href="/blog">Immigration Blog</FooterLink></li>
              <li><FooterLink href="/lmia-jobs">Browse Jobs</FooterLink></li>
              <li><FooterLink href="/lmia-jobs/agriculture">Agriculture</FooterLink></li>
              <li><FooterLink href="/lmia-jobs/construction">Construction</FooterLink></li>
              <li><FooterLink href="/lmia-jobs/hospitality">Hospitality</FooterLink></li>
              <li><FooterLink href="/lmia-jobs-healthcare">Healthcare</FooterLink></li>
              <li><FooterLink href="/lmia-jobs-trucking">Trucking Hub</FooterLink></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><FooterLink href="/about">About Us</FooterLink></li>
              <li><FooterLink href="/resources/documentation">Documentation</FooterLink></li>
              <li><FooterLink href="/resources/noc-codes">NOC Guide</FooterLink></li>
              <li><FooterLink href="/contact">Contact Support</FooterLink></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} JobMaze Inc. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/security" className="hover:text-gray-600 transition-colors">Security</Link>
            <Link href="/sitemap.xml" className="hover:text-gray-600 transition-colors">Sitemap</Link>
            <Link href="/cookies" className="hover:text-gray-600 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition-all border border-gray-100"
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-brand-600 transition-colors block">
      {children}
    </Link>
  );
}
