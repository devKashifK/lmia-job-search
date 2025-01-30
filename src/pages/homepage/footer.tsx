import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-orange-500">SearchPro</h3>
            <p className="text-gray-400">
              Empowering your search experience with advanced insights and
              analytics.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Add other social icons */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-500">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#demo"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Demo
                </Link>
              </li>
              <li>
                <Link
                  href="#testimonials"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-500">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  API Status
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-500">
              Contact Us
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@searchpro.com"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  support@searchpro.com
                </a>
              </li>
              <li className="text-gray-400">
                Monday - Friday
                <br />
                9:00AM - 6:00PM EST
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} SearchPro. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
