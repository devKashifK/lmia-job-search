import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';
import React from 'react';

function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-12 text-sm leading-relaxed">
        <h1 className="text-2xl font-semibold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          This Privacy Policy explains how we collect, use, disclose, and
          protect your personal information when you use our recruitment / job
          discovery platform (the “Platform”). By accessing or using the
          Platform, you consent to the practices described in this Privacy
          Policy.
        </p>

        <p className="mb-6 text-xs italic">
          <strong>Disclaimer:</strong> This Privacy Policy is for informational
          purposes only. You should consult a qualified legal professional to
          review and customize this document based on your specific business
          practices and jurisdiction.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          1. Information We Collect
        </h2>
        <p className="mb-2">
          We may collect the following types of information:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>
            <strong>Personal Information:</strong> Name, email address, phone
            number, location, resume/CV data, profile details, and other
            information you voluntarily provide.
          </li>
          <li>
            <strong>Account Information:</strong> Login credentials,
            preferences, user settings.
          </li>
          <li>
            <strong>Usage Data:</strong> Pages visited, interactions, search
            history, device information, IP address, browser type.
          </li>
          <li>
            <strong>Job Application Data:</strong> Details related to
            applications you submit, messages sent to employers, and profile
            data shared with employers.
          </li>
          <li>
            <strong>Cookies & Tracking:</strong> Cookies, pixels, and similar
            technologies used to enhance user experience and collect analytics.
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>To provide, operate, and maintain the Platform.</li>
          <li>To create and manage your user account.</li>
          <li>To match you with relevant job opportunities.</li>
          <li>
            To allow employers to view your profile or application when
            applicable.
          </li>
          <li>
            To communicate with you regarding updates, notifications, and
            support.
          </li>
          <li>
            To improve Platform functionality, user experience, and security.
          </li>
          <li>
            To comply with legal obligations and enforce Platform policies.
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          3. How We Share Your Information
        </h2>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>
            <strong>With Employers:</strong> When you apply for a job or share
            your profile, we may provide employers with relevant information
            needed for recruitment.
          </li>
          <li>
            <strong>Service Providers:</strong> Third-party vendors assisting
            with hosting, analytics, communication tools, and data processing.
          </li>
          <li>
            <strong>Legal Reasons:</strong> If required by law, court order, or
            to protect our rights, users, or the public.
          </li>
          <li>
            <strong>Business Transfers:</strong> In case of a merger,
            acquisition, restructuring, or sale of assets.
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          4. Cookies & Tracking Technologies
        </h2>
        <p className="mb-4">
          We use cookies and similar technologies to enhance your experience,
          analyze usage patterns, and store preferences. You can control cookie
          settings through your browser, though disabling cookies may limit
          certain Platform features.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">5. Data Retention</h2>
        <p className="mb-4">
          We retain your personal information for as long as necessary to
          provide our services, comply with legal obligations, resolve disputes,
          and enforce our agreements. You may request deletion of your
          information as described in Section 8.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">6. Security</h2>
        <p className="mb-4">
          We implement industry-standard security measures to protect your data.
          However, no method of transmission or storage is completely secure. We
          cannot guarantee absolute security of your information.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          7. Third-Party Links & Services
        </h2>
        <p className="mb-4">
          The Platform may contain links to external websites or services. We do
          not control and are not responsible for the privacy practices of third
          parties. You should review the privacy policies of those sites before
          providing any personal information.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          8. Your Rights & Choices
        </h2>
        <p className="mb-2">
          Depending on your jurisdiction, you may have the right to:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Access or request a copy of your personal data.</li>
          <li>Correct inaccurate or incomplete information.</li>
          <li>Request deletion of your data (“right to be forgotten”).</li>
          <li>Restrict or object to certain forms of data processing.</li>
          <li>
            Withdraw your consent at any time where processing is based on
            consent.
          </li>
        </ul>

        <p className="mb-4">
          To exercise these rights, contact us using the details provided below.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          9. Children’s Privacy
        </h2>
        <p className="mb-4">
          The Platform is not intended for individuals under the age of 18. We
          do not knowingly collect data from minors. If we become aware of such
          collection, we will promptly delete the information.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          10. Changes to This Privacy Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. Any changes will
          be reflected with an updated “Last updated” date below. Your continued
          use of the Platform after such changes constitutes your acceptance of
          the revised policy.
        </p>

        <p className="mb-4 text-xs">
          <strong>Last updated:</strong> {new Date().getFullYear()}
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">11. Contact Us</h2>
        <p className="mb-1">
          If you have questions about this Privacy Policy, contact us at:
        </p>
        <p className="mb-4">
          <span className="block">GTR World Wide</span>
          <span className="block">
            Kankaria Estate, 6, Little Russel St, Maidan, Midleton Row, Park
            Street area, Kolkata, West Bengal 700071
          </span>
          <span className="block">Email: info@jobmaze.ca</span>
        </p>
      </div>
      <Footer />
    </>
  );
}

export default PrivacyPolicy;
