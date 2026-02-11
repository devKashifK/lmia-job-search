import Link from 'next/link';
import { ArrowUpRight, Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">

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
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><FooterLink href="/blog">Blog</FooterLink></li>
              <li><FooterLink href="/resources/documentation">Documentation</FooterLink></li>
              <li><FooterLink href="/resources/noc-codes">NOC Codes Guide</FooterLink></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><FooterLink href="/about">About Us</FooterLink></li>
              <li><FooterLink href="/careers">Careers</FooterLink></li>
              <li><FooterLink href="/contact">Contact</FooterLink></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="font-medium text-gray-700">Email:</span>
                <a href="mailto:info@jobmaze.ca" className="hover:text-brand-600 transition-colors">info@jobmaze.ca</a>
              </li>
              <li className="space-y-1">
                <div className="font-medium text-gray-700">Office Hours:</div>
                <div>Monday - Friday</div>
                <div>9:00AM - 6:00PM EST</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} JobMaze Inc. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/security" className="hover:text-gray-600 transition-colors">Security</Link>
            <Link href="/sitemap" className="hover:text-gray-600 transition-colors">Sitemap</Link>
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
