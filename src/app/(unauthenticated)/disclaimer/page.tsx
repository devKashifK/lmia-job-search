import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { Shield, AlertTriangle, Database, Scale, UserCheck, Info, Megaphone, FileText } from 'lucide-react';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Disclaimers | JobMaze',
  description: 'Legal disclaimers regarding the use of JobMaze, job market data, and connectivity with employers and immigration professionals.',
};

const DisclaimerPage = () => {
  const sections = [
    {
      title: "General Marketplace & Search",
      icon: <Info className="w-5 h-5 text-brand-600" />,
      items: [
        {
          id: 1,
          title: "General platform usage disclaimer",
          content: "JobMaze.ca is a data aggregation and job search platform. While we strive to provide accurate and up-to-date information, we do not guarantee the completeness, reliability, or accuracy of job listings, employer profiles, or LMIA status information. Users are responsible for verifying all information directly with employers or official government sources."
        },
        {
          id: 2,
          title: "Job listing accuracy disclaimer",
          content: "Job listings on JobMaze.ca are aggregated from various sources, including government portals and third-party sites. JobMaze is not responsible for errors in job descriptions, salary information, NOC classifications, or application requirements provided by these sources."
        },
        {
          id: 3,
          title: "Employer verification disclaimer",
          content: "The presence of an employer on JobMaze.ca does not constitute an endorsement. While we flag 'Verified' employers based on historical LMIA data, JobMaze does not guarantee the legitimacy, financial stability, or workplace safety of any employer listed on the platform."
        },
        {
          id: 4,
          title: "Premium search and filtering disclaimer",
          content: "JobMaze.ca offers premium features that provide enhanced data insights and advanced filtering. These features are designed to assist in more targeted searches but do not guarantee job placement or faster hiring outcomes."
        },
        {
          id: 5,
          title: "Search results and ranking disclaimer",
          content: "Job search rankings and 'Top Match' suggestions are based on automated algorithms that match user profiles with job requirements. These results are for informational purposes and do not guarantee suitability for a role or an invitation to interview."
        },
        {
          id: 8,
          title: "LMIA status disclaimer",
          content: "The LMIA status (Positive, Expired, Pending) shown on JobMaze.ca is derived from historical government hiring records. This status is subject to change at the discretion of Employment and Social Development Canada (ESDC) and does not guarantee that a future LMIA application by the same employer will be approved."
        }
      ]
    },
    {
      title: "Advertising & Promotions",
      icon: <Megaphone className="w-5 h-5 text-brand-600" />,
      items: [
        {
          id: 9,
          title: "General advertising disclaimer",
          content: "JobMaze.ca may display advertisements from third-party partners. Advertisements are labeled as such and do not constitute an endorsement by JobMaze. We are not responsible for the content or products of advertised services."
        },
        {
          id: 10,
          title: "Job board 'Boosted' and 'Featured' disclaimer",
          content: "Certain job listings may be 'Boosted' or 'Featured' by employers for increased visibility. This status is a paid promotion and does not reflect a higher quality of the job, employer, or a higher likelihood of sponsorship."
        },
        {
          id: 11,
          title: "Affiliate and third-party links disclaimer",
          content: "Some links on JobMaze.ca may be affiliate links. We may receive a commission if you click on these links or make a purchase through them. This comes at no additional cost to you."
        },
        {
          id: 12,
          title: "Endorsement and sponsorship disclaimer",
          content: "Mention of specific brands, products, or services does not imply endorsement or sponsorship by JobMaze unless explicitly stated. Any reviews or comparisons are based on objective data where available."
        }
      ]
    },
    {
      title: "Connectivity & Professional Services",
      icon: <UserCheck className="w-5 h-5 text-brand-600" />,
      items: [
        {
          id: 6,
          title: "Employer connectivity disclaimer",
          content: "JobMaze facilitates connections between job seekers and employers but is not a party to any resulting employment contracts, negotiations, or disputes. All hiring decisions are made solely by the employers."
        },
        {
          id: 7,
          title: "Agency connectivity disclaimer",
          content: "JobMaze provides a portal for recruitment agencies. JobMaze does not verify the internal business practices, fee structures, or success rates of individual agencies. Users are encouraged to conduct their own due diligence."
        },
        {
          id: 13,
          title: "Employer-Agency collaboration disclaimer",
          content: "JobMaze provides tools for employers and agencies to collaborate. JobMaze is not liable for the conduct, data handling, or contractual performance of agencies engaged by employers through the platform."
        },
        {
          id: 17,
          title: "RCIC Connect disclaimer",
          content: "The RCIC Connect feature allows users to request connections with Regulated Canadian Immigration Consultants. JobMaze is not an immigration firm and does not provide immigration advice. Your relationship with any RCIC is independent of JobMaze."
        },
        {
          id: 18,
          title: "Not a substitute for legal advice",
          content: "Nothing on JobMaze.ca constitutes legal advice. Immigration law and IRCC policies are subject to change. For advice about your specific immigration matter, consult a licensed immigration lawyer or a CICC-registered RCIC."
        }
      ]
    },
    {
      title: "Employers & Recruiters",
      icon: <FileText className="w-5 h-5 text-brand-600" />,
      items: [
        {
          id: 14,
          title: "Employer-posted content accuracy disclaimer",
          content: "Employers are solely responsible for the content of their job postings. JobMaze does not audit or verify individual job descriptions, requirements, or employer claims for accuracy."
        },
        {
          id: 15,
          title: "External application tracking disclaimer",
          content: "If an application redirect leads to an external site or ATS, JobMaze is not responsible for the tracking, status updates, or data privacy on that external platform."
        },
        {
          id: 16,
          title: "No guarantee of candidate quality",
          content: "JobMaze does not guarantee the qualifications, legal status, or workplace suitability of any candidate applying through the platform. Employers are responsible for conducting their own vetting and interviews."
        }
      ]
    },
    {
      title: "Data, Analytics & Reporting",
      icon: <Database className="w-5 h-5 text-brand-600" />,
      items: [
        {
          id: 19,
          title: "Analytics data disclaimer",
          content: "Job market analytics and 5-year hiring trends are derived from publicly available government data (ESDC, StatCan). This data is for informational purposes only and does not constitute economic forecasting or career guidance."
        },
        {
          id: 20,
          title: "Third-party data sources disclaimer",
          content: "JobMaze.ca incorporates data from third-party sources. While we validate and normalise this data, JobMaze does not accept responsibility for errors, omissions, or delays in third-party data or government datasets."
        }
      ]
    },
    {
      title: "Account, Privacy & Legal",
      icon: <Scale className="w-5 h-5 text-brand-600" />,
      items: [
        {
          id: 21,
          title: "Account registration disclaimer",
          content: "By creating an account, you confirm you are at least 18 years of age. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account."
        },
        {
          id: 22,
          title: "Email communications consent (CASL)",
          content: "By registering, you consent to receive transactional emails. Marketing communications are optional and you can unsubscribe at any time. All communications comply with Canada's Anti-Spam Legislation (CASL)."
        },
        {
          id: 23,
          title: "PIPEDA and privacy disclaimer",
          content: "JobMaze.ca collects, uses, and discloses personal information in accordance with PIPEDA. We retain personal data only for as long as necessary to fulfil its stated purpose or as required by law."
        },
        {
          id: 24,
          title: "Limitation of liability",
          content: "JobMaze.ca and its affiliates shall not be liable for any direct or indirect damages arising from your use of the platform, including failure to secure employment or decisions made based on platform analytics."
        },
        {
          id: 25,
          title: "Governing law and jurisdiction",
          content: "These Terms and all disputes shall be governed by the laws of the Province of Ontario and the federal laws of Canada. Legal proceedings shall be subject to the exclusive jurisdiction of the courts of Ontario."
        }
      ]
    },
    {
      title: "Rights, Safety & Content",
      icon: <Shield className="w-5 h-5 text-brand-600" />,
      items: [
        {
          id: 26,
          title: "Temporary foreign worker rights disclaimer",
          content: "The Know Your Rights section provides general informational purposes. If you believe your rights are being violated, contact the Service Canada Tip Line at 1-800-367-5693 or your provincial authorities."
        },
        {
          id: 27,
          title: "Editorial and user-generated content disclaimer",
          content: "Blog posts and forum comments represent the views of individual authors. JobMaze is not liable for the accuracy or consequences of user-generated content. Always verify with official government sources."
        }
      ]
    }
  ];

  return (
    <>
      <Navbar />
      <BackgroundWrapper className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Detailed Platform Disclaimers
            </h1>
            <p className="text-gray-500 text-lg max-w-3xl mx-auto leading-relaxed">
              To ensure full transparency, JobMaze provides the following 27 disclaimers regarding our data sources, 
              professional connectivity tools, and the legal limitations of our job search platform.
            </p>
          </div>

          {/* Table of Contents / Quick Nav */}
          <div className="bg-white/50 border border-gray-100 rounded-3xl p-6 mb-16 backdrop-blur-md">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      {section.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{section.title}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Disclaimer Sections */}
          <div className="space-y-16">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2 bg-brand-600 rounded-xl text-white">
                    {section.icon && React.cloneElement(section.icon as React.ReactElement, { className: "w-6 h-6 text-white" })}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-1 rounded-full">
                          Item #{item.id}
                        </span>
                        <div className="h-1 w-12 bg-brand-100 rounded-full group-hover:bg-brand-500 transition-colors" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-3 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Version Footer */}
          <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
              <p className="text-lg font-bold text-gray-900 mb-2">Have specific questions?</p>
              <p className="text-sm text-gray-500">Our support and legal teams are ready to help clarify any points above.</p>
            </div>
            <div className="flex gap-4">
               <a href="mailto:support@jobmaze.ca" className="px-8 py-3 bg-brand-600 text-white rounded-full font-bold shadow-lg shadow-brand-500/20 hover:scale-105 transition-transform">
                  Contact Support
               </a>
            </div>
          </div>
        </div>
      </BackgroundWrapper>
      <Footer />
    </>
  );
};

export default DisclaimerPage;
