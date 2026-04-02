'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, UserCircle, Search as SearchIcon, Scale, Building2, FileText, Database, CreditCard, Settings, ChevronRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';

// Extracted from original HTML
const FAQ_DATA = {
  general: [
    { q: "What is JobMaze.ca?", a: "JobMaze.ca is a specialized LMIA (Labour Market Impact Assessment) job board built exclusively for immigration consultants (RCICs), staffing agencies, and recruiters in Canada. Unlike generic job boards, JobMaze aggregates and filters LMIA-approved and LMIA-eligible job listings so that immigration professionals can quickly find suitable positions for their clients." },
    { q: "Who is JobMaze designed for?", a: "JobMaze is designed for two primary user types: <strong>Regulated Canadian Immigration Consultants (RCICs)</strong> who need to find LMIA jobs for their clients seeking work permits or PR, and <strong>Recruiters and Staffing Agencies</strong> who source Temporary Foreign Worker (TFW) candidates for LMIA-approved employers." },
    { q: "Is JobMaze a job board for job seekers?", a: "No. JobMaze is a professional tool for immigration consultants and recruiters — not a job board for individual job seekers. If you are looking for a job personally, we recommend checking government resources such as Job Bank Canada or platforms like Indeed." },
    { q: "How is JobMaze different from general job boards like Indeed or LinkedIn?", a: "General job boards list all types of jobs regardless of immigration status. JobMaze specifically focuses on LMIA-related opportunities — meaning the jobs listed are relevant to employers who are open to hiring through the LMIA process. This saves immigration professionals hours of manual filtering every week." },
    { q: "How do I get started with JobMaze?", a: "Getting started is simple: (1) Visit JobMaze.ca, (2) Create a free account, (3) Start your free trial — no credit card required, (4) Browse LMIA jobs, filter by province, industry, employer, and more. Most new users find what they need within their first session." },
    { q: "Do I need to be a licensed RCIC to use JobMaze?", a: "No. While RCICs are a primary audience, JobMaze is also used by licensed recruiters, HR managers at staffing agencies, immigration paralegal firms, and anyone who works with employers on the LMIA process. You do not need an RCIC license to create an account." },
    { q: "Is there a free trial available?", a: "Yes. JobMaze offers a free trial so you can explore the platform before committing to a paid plan. During the trial, you get 500 free credits to access live job listings, search and filter features, and a preview of employer contact information." },
    { q: "What provinces and territories does JobMaze cover?", a: "JobMaze covers all Canadian provinces and territories including Ontario, British Columbia, Alberta, Saskatchewan, Manitoba, Quebec, Nova Scotia, New Brunswick, PEI, Newfoundland & Labrador, Yukon, Northwest Territories, and Nunavut." },
    { q: "Does JobMaze cover jobs in all industries?", a: "Yes. JobMaze covers all major LMIA-eligible industries including healthcare, trucking & transportation, construction, hospitality & food service, agriculture, manufacturing, information technology, retail, and more." },
    { q: "How often is the JobMaze database updated?", a: "The JobMaze database is updated daily. New LMIA-eligible job listings are added every 24 hours, and existing listings are reviewed regularly to ensure accuracy. You will always be working with current, live data." },
    { q: "Can I use JobMaze from outside Canada?", a: "Yes. JobMaze is a web-based platform accessible from anywhere in the world. Many immigration consultants who serve the Indian diaspora or international clients use JobMaze remotely to search for job opportunities in Canada on behalf of their clients." },
    { q: "Is JobMaze available in French?", a: "Currently, JobMaze is available in English. A French-language version is on our product roadmap. Quebec-based users and bilingual professionals are welcome and supported through our English interface in the meantime." },
    { q: "What is the LMIA process in simple terms?", a: "The LMIA (Labour Market Impact Assessment) is a document that a Canadian employer must obtain before hiring a foreign worker. It proves that no Canadian citizen or permanent resident was available for the job. JobMaze helps immigration professionals find employers who are on the path to — or have already obtained — LMIA approval." },
    { q: "Does JobMaze guarantee that listed employers have LMIA approval?", a: "JobMaze aggregates job listings from employers who are known to hire through the LMIA process or have a history of LMIA applications. We do not guarantee LMIA status for every listing, and we recommend that consultants verify directly with employers. Our data is sourced from ESDC public records and verified partner sources." },
    { q: "Is JobMaze affiliated with the Canadian government or IRCC?", a: "No. JobMaze is an independent private platform. We are not affiliated with Immigration, Refugees and Citizenship Canada (IRCC), Employment and Social Development Canada (ESDC), or any government agency. We use publicly available government data alongside proprietary aggregation to build our database." },
    { q: "What makes JobMaze reliable compared to doing my own research?", a: "Manual LMIA job research can take 3–5 hours per client. JobMaze consolidates data from multiple sources, applies LMIA-specific filters, and presents it in a searchable interface — reducing search time to under 5 minutes for most queries. Our subscribers report saving an average of 4–6 hours per week." },
    { q: "Can I use JobMaze on my mobile phone?", a: "Yes. JobMaze is fully responsive and works on smartphones, tablets, and desktops. You can search and browse listings from any device without needing to download an app." },
    { q: "What browser should I use for the best experience?", a: "JobMaze works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version for the best performance and security." },
    { q: "Is there an onboarding guide for new users?", a: "Yes. After signup, new users receive a welcome email with a quick-start guide and video walkthrough. We also schedule optional 15-minute onboarding calls for Pro and Agency plan users to help you get the most from the platform." },
    { q: "How do I contact JobMaze support?", a: "You can reach our support team at support@jobmaze.ca. We respond within a few hours on business days (Monday–Friday, 9am–6pm ET). Pro and Agency plan users receive priority support with faster response times." },
  ],
  account: [
    { q: "How do I create a JobMaze account?", a: "Go to JobMaze.ca and click 'Sign Up'. Enter your name, professional email, and create a password. You'll receive a verification email — click the link to activate your account. Your free trial begins immediately after verification." },
    { q: "Can I have multiple users under one account?", a: "The Pro plan is a single-user license. The <strong>Agency plan</strong> supports multiple team members under one account with a multi-seat setup. If you're a growing firm, the Agency plan is the right choice." },
    { q: "How do I upgrade from the free trial to a paid plan?", a: "Log in to your account, go to Settings > Billing, and select your preferred plan (Pro or Agency). Enter your payment details and confirm. Your plan upgrades instantly with no interruption to your access." },
    { q: "What payment methods does JobMaze accept?", a: "JobMaze accepts all major credit cards (Visa, Mastercard, Amex) as well as debit cards through our Stripe-powered payment system. We do not currently accept PayPal, bank transfers, or cryptocurrency." },
    { q: "Is my payment information secure?", a: "Yes. JobMaze uses Stripe for payment processing — one of the most trusted payment platforms in the world. We never store your full card details on our servers. All transactions are encrypted using industry-standard TLS." },
    { q: "Can I cancel my subscription at any time?", a: "Yes. You can cancel your subscription at any time from your account settings. You will retain access until the end of your current billing period. We do not charge cancellation fees." },
    { q: "Do you offer refunds?", a: "We offer a 7-day refund policy for new subscribers who are not satisfied with the platform. If you cancel within 7 days of your first payment and have not used the platform extensively, contact support@jobmaze.ca to request a refund." },
    { q: "What happens to my data when I cancel?", a: "Your account data including saved searches and notes is retained for 90 days after cancellation. After 90 days, it is permanently deleted. You can export your saved data before cancelling by going to Settings > Export Data." },
    { q: "Can I pause my subscription instead of cancelling?", a: "Yes. Pro and Agency subscribers can pause their subscription for up to 60 days. To pause, go to Settings > Billing > Pause Subscription. Your account remains active and data is preserved during the pause." },
    { q: "How does annual billing work?", a: "Annual billing charges you once per year at a discounted rate (equivalent to 10 months instead of 12). You save approximately 17% compared to monthly billing. Annual subscriptions are non-refundable after 14 days." },
    { q: "Can I switch between monthly and annual billing?", a: "Yes. You can switch from monthly to annual billing at any time. The change takes effect at your next billing cycle. To switch from annual to monthly, you'll need to wait until your annual subscription expires." },
    { q: "How do I update my billing information?", a: "Go to Settings > Billing > Payment Methods and update your card details. Changes apply immediately to future invoices." },
    { q: "Will I receive invoices for my subscription?", a: "Yes. Invoices are automatically emailed to your registered email address after each payment. You can also download all past invoices from Settings > Billing > Invoice History." },
    { q: "How do I change my account email address?", a: "Go to Settings > Profile > Email and enter your new email address. A verification link will be sent to your new email. Your account email updates once you confirm the change." },
    { q: "What if I forget my password?", a: "Click 'Forgot Password' on the login page and enter your registered email. You'll receive a reset link within a few minutes. If you don't see it, check your spam folder or contact support." },
    { q: "Can I transfer my account to a colleague?", a: "Single-user Pro accounts cannot be transferred. However, Agency plan accounts can have members added or removed by the account administrator. If you need to transfer ownership, contact support@jobmaze.ca with your request." },
    { q: "Is there a government or non-profit discount?", a: "Yes. We offer a 20% discount for accredited immigration organizations, government-affiliated bodies, and registered non-profits working with newcomers. Contact support@jobmaze.ca with proof of eligibility to apply the discount." },
    { q: "How do I delete my account permanently?", a: "Go to Settings > Account > Delete Account. You will be asked to confirm and optionally provide feedback. Account deletion is permanent and cannot be undone. All your data is removed within 30 days of the request." },
  ],
  search: [
    { q: "How do I search for LMIA jobs on JobMaze?", a: "After logging in, navigate to the Jobs tab. You can search by keyword (job title or NOC code), filter by province, city, industry, employer type, and date posted. Results update instantly as you adjust your filters." },
    { q: "Can I filter jobs by province?", a: "Yes. You can filter by any Canadian province or territory. Multiple provinces can be selected at once. For example, you can search for healthcare jobs in both Ontario and British Columbia simultaneously." },
    { q: "Can I search by NOC code?", a: "Yes. JobMaze supports NOC (National Occupational Classification) code search. Enter the NOC code directly in the search bar to find positions that match a specific occupation code — essential for TEER-based eligibility matching." },
    { q: "What is the TEER filter and how does it work?", a: "TEER (Training, Education, Experience, and Responsibilities) is Canada's occupational classification system replacing the old NOC skill levels. JobMaze allows you to filter jobs by TEER category (0, 1, 2, 3, 4, 5) to match your client's eligibility under specific immigration streams." },
    { q: "Can I search by employer name?", a: "Yes. Enter a specific employer name in the search bar to see all LMIA-related job postings associated with that employer, along with their posting history and contact information (available on Pro and Agency plans)." },
    { q: "How do I save a search for future use?", a: "After setting your filters, click the 'Save Search' button. Give it a name (e.g., 'Healthcare – Ontario – TEER 2') and it will appear in your Saved Searches panel. You can set up email alerts for saved searches to be notified of new listings." },
    { q: "Can I set up job alerts?", a: "Yes. For any saved search, you can enable email alerts — daily or weekly. When new listings matching your criteria are added to JobMaze, you receive a notification with a summary and direct links." },
    { q: "How do I filter by industry or sector?", a: "Use the Industry filter dropdown on the search page. Available categories include healthcare, trucking, construction, hospitality, agriculture, retail, technology, manufacturing, and more. Multiple sectors can be selected." },
    { q: "What does 'LMIA-approved employer' mean in search results?", a: "An 'LMIA-approved employer' label indicates that this employer has successfully obtained at least one positive LMIA from ESDC in the past. This is a strong signal that they are familiar with the process and open to hiring foreign workers." },
    { q: "Can I filter jobs by salary or wage range?", a: "Yes. The wage filter allows you to set a minimum and maximum wage range (hourly or annual). This is particularly useful for matching client expectations and ensuring LMIA wage requirements are met." },
    { q: "Can I search for part-time LMIA jobs?", a: "Yes. JobMaze allows you to filter by employment type — full-time, part-time, seasonal, or contract. Note that some immigration streams require full-time employment, so filter accordingly for your client's specific pathway." },
    { q: "What is the 'bulk export' feature?", a: "Bulk export (available on Agency plan) allows you to download multiple job listings as a CSV or Excel file. You can export a filtered set of results for offline review, client presentations, or internal database management." },
    { q: "How many search results does JobMaze show per page?", a: "By default, JobMaze shows 25 results per page. You can change this to 50 or 100 results per page in your account settings. Total result counts are shown at the top of each search." },
    { q: "Can I sort search results by date, relevance, or wage?", a: "Yes. Sort options include: Most Recent, Highest Wage, Lowest Wage, Employer Name (A–Z), and Most Relevant. The default sort is Most Recent to show the freshest listings first." },
    { q: "What does it mean when a listing is marked 'New'?", a: "A 'New' tag indicates the listing was added to JobMaze within the last 48 hours. Use the 'Date Posted' filter to narrow results to listings from the last 24 hours, 7 days, 30 days, or any custom range." },
    { q: "Can I view employer contact details through JobMaze?", a: "Yes. Pro and Agency plan subscribers can view employer contact information including company name, address, phone number, and HR contact email where available. Free trial users see partial contact details." },
    { q: "Is there an advanced search mode?", a: "Yes. Click 'Advanced Search' on the search page to access additional filters including: minimum years of experience, education requirement, language of work, remote/on-site status, and seasonal availability." },
    { q: "Can I search for jobs with specific language requirements?", a: "Yes. The language filter lets you find jobs where English, French, or bilingual proficiency is required. This is particularly useful for Quebec-based positions or bilingual federal roles." },
    { q: "What is the difference between 'LMIA eligible' and 'LMIA approved'?", a: "<strong>LMIA approved</strong> means the employer already has a positive LMIA for this specific position. <strong>LMIA eligible</strong> means the employer and job type qualify to apply for an LMIA but the application hasn't been filed yet. Both are visible in JobMaze results with clear labels." },
    { q: "Can I share a search result with a client?", a: "You can copy the direct URL of any search result page to share. The link preserves your applied filters. Note: recipients must have a JobMaze account to view employer contact details." },
    { q: "How do I clear all my filters and start a new search?", a: "Click the 'Clear All Filters' button at the top of the search panel to reset all filters to default. Your saved searches are not affected." },
    { q: "Does JobMaze show seasonal or agricultural LMIA jobs?", a: "Yes. JobMaze includes listings under the Seasonal Agricultural Worker Program (SAWP) and agricultural stream LMIA positions. Use the 'Agriculture' industry filter or 'Seasonal' employment type to find these." },
  ],
  rcic: [
    { q: "Why should RCICs use JobMaze instead of doing their own LMIA job research?", a: "RCICs can spend 3–5 hours per client manually researching LMIA jobs across multiple websites, ESDC databases, and job boards. JobMaze consolidates this into a single search that takes under 5 minutes — freeing you to take on more clients and grow your practice." },
    { q: "Can I manage multiple clients' job searches in one account?", a: "Yes. JobMaze Pro allows individual RCICs to run and save multiple searches simultaneously — one per client. Label each saved search with a client reference (initials or case number) to keep your searches organized." },
    { q: "How do I find LMIA jobs that match my client's NOC code and TEER level?", a: "Use the NOC code search field combined with the TEER filter. For example, entering NOC 31301 (registered nurses, TEER 1) will return all current LMIA-eligible nursing positions, filterable further by province." },
    { q: "Does JobMaze help with SINP (Saskatchewan Immigrant Nominee Program) job matches?", a: "Yes. JobMaze has a dedicated Saskatchewan province filter and supports NOC-to-SINP occupation matching. Filter by Saskatchewan and cross-reference results with the SINP in-demand occupation list for targeted client matches." },
    { q: "Can I find jobs for clients under the Express Entry system?", a: "While JobMaze focuses on LMIA jobs specifically, many of the employer-supported positions qualify as employer-specific work permits tied to Express Entry profiles (job offer component). Filter by 'LMIA-approved' listings for these cases." },
    { q: "Is there a way to track which jobs I've already reviewed for a client?", a: "Yes. You can mark listings as 'Reviewed', 'Shortlisted', or 'Contacted' within any saved search. These status tags are visible across your account and help you track progress across multiple client files." },
    { q: "Can I export a list of LMIA job matches to share with my client?", a: "Yes. From any saved search, click 'Export' to download a PDF or CSV report of your shortlisted jobs. You can customize which fields to include (employer, location, wage, NOC code, contact info) before exporting." },
    { q: "How do I verify that an LMIA-listed employer is legitimate?", a: "JobMaze pulls employer data from ESDC's public LMIA records and verified sources. However, we always recommend RCICs independently verify employers by cross-referencing the ESDC LMIA database and conducting a due diligence call before advising clients." },
    { q: "Does JobMaze include Intra-Company Transfer (ICT) or CUSMA-exempt positions?", a: "JobMaze focuses on LMIA-required positions. CUSMA/USMCA-exempt roles and Intra-Company Transfers do not require an LMIA and are generally not included in our listings. For those, Job Bank Canada is a better resource." },
    { q: "Are there resources on JobMaze to help me understand LMIA processing times?", a: "Yes. JobMaze includes a Resources section with updated data on ESDC LMIA processing times by stream and province, as well as links to official IRCC and ESDC guidance documents." },
    { q: "Can I use JobMaze to help clients applying under the Caregiver Program?", a: "Yes. JobMaze includes positions under the Home Child Care Provider and Home Support Worker pilots. Filter by 'Caregiver' or NOC codes 44100/44101 to find relevant LMIA-eligible positions." },
    { q: "How do I find employers with a history of positive LMIAs in a specific sector?", a: "Use the 'LMIA History' filter available on Pro and Agency plans. This lets you see employers ranked by the number of positive LMIAs they have received historically — a strong indicator of reliability." },
    { q: "Does JobMaze support spousal open work permit (SOWP) job searches?", a: "SOWP does not require an LMIA. However, if a client's spouse is seeking an employer-specific work permit to then apply for SOWP eligibility, JobMaze can help find suitable LMIA-eligible employers as a starting point." },
    { q: "Is there training or certification available for using JobMaze?", a: "JobMaze offers a free 30-minute onboarding webinar for all Pro users. We also publish regular tutorial videos and a knowledge base to help RCICs make the most of the platform. These are accessible from your account dashboard." },
    { q: "Can I use JobMaze to find LMIA jobs for clients applying through the TR to PR pathway?", a: "Yes. The TR to PR pathway requires eligible TEER 0–3 employment. JobMaze's TEER filter makes it easy to identify positions in eligible categories — a key step in advising clients on TR to PR readiness." },
    { q: "Does JobMaze offer any RCIC community or peer network features?", a: "We are building community features for our RCIC users. Currently, we host a monthly LinkedIn Live session covering LMIA job market trends and invite RCIC spotlights. Watch your email for invitations." },
    { q: "How does JobMaze help me serve clients faster during busy SINP draw periods?", a: "During active SINP draw periods, JobMaze allows you to instantly pull all current LMIA jobs in Saskatchewan matching your client's occupation. Combined with our saved search alerts, you can act within hours of a draw announcement." },
    { q: "Can multiple clients use one JobMaze Pro account?", a: "A Pro account is licensed for one professional user. You can manage multiple clients' searches within a single account, but simultaneous multi-user access requires upgrading to the Agency plan." },
    { q: "Does JobMaze keep a history of my past searches?", a: "Yes. Your last 90 days of search history is saved automatically in your account under the Search History tab. You can revisit, re-run, or re-save any past search." },
    { q: "Can I request a feature specific to RCIC workflows?", a: "Absolutely. We actively gather feedback from our RCIC users to shape our product roadmap. Use the 'Feature Request' link in your dashboard or email support@jobmaze.ca with your suggestion." },
  ],
  recruiter: [
    { q: "How is JobMaze useful for staffing agencies and corporate recruiters?", a: "Staffing agencies use JobMaze to source Temporary Foreign Worker (TFW) candidates by first identifying which employers in their target industries and regions have LMIA positions available — then matching those employers with their TFW candidate pool." },
    { q: "What is the Agency plan and who is it for?", a: "The Agency plan is designed for teams — staffing agencies, immigration firms, and corporate HR departments with 2 or more users. It includes multi-seat access, bulk export, advanced employer filtering, and dedicated account support." },
    { q: "How many users can I add on the Agency plan?", a: "The standard Agency plan supports up to 5 users. For teams larger than 5, contact sales@jobmaze.ca for an enterprise quote with custom pricing." },
    { q: "Can I use JobMaze to build a pipeline of LMIA-eligible employers?", a: "Yes. Agency plan users can create and manage an employer pipeline directly in JobMaze. Bookmark employers, tag them by status (Contacted, In Progress, Placed), and set follow-up reminders from your dashboard." },
    { q: "What does 'bulk export' include for Agency users?", a: "Bulk export allows Agency users to download full listings — including employer contact details, wage information, NOC codes, job descriptions, and LMIA history — in CSV or Excel format for up to 500 listings per export." },
    { q: "Can I filter results to find only employers actively seeking TFW workers right now?", a: "Yes. The 'Active LMIA Posting' filter shows only employers currently advertising positions through the LMIA stream — distinguishing them from historical records of past LMIA use." },
    { q: "Is there a way to see how many LMIAs a specific employer has obtained historically?", a: "Yes. Each employer profile on JobMaze (Pro and Agency plans) shows their LMIA history — number of applications, approvals, sectors, and provinces — sourced from ESDC public records." },
    { q: "Does JobMaze integrate with our existing ATS (Applicant Tracking System)?", a: "Direct ATS integrations are on our roadmap. Currently, Agency plan users can export employer data via CSV which can be imported into most ATS systems. Contact us if you need a specific integration prioritized." },
    { q: "Can we use JobMaze to identify employer clients for our agency?", a: "Yes. Many agencies use JobMaze as a business development tool — identifying companies that are actively hiring through the LMIA stream, then approaching them as potential clients for TFW candidate placement services." },
    { q: "How does the recruiter workflow work on JobMaze?", a: "A typical recruiter workflow: (1) Search JobMaze for LMIA positions matching your TFW candidate's profile, (2) Review employer details and contact info, (3) Tag employers in your pipeline, (4) Export and make outreach, (5) Track placements in your CRM." },
    { q: "Can multiple team members access the same saved employer pipeline?", a: "Yes. On the Agency plan, saved employer pipelines, searches, and tags are shared across all team members on your account. Administrators can control what each team member can view and edit." },
    { q: "Does JobMaze offer any partnership or referral programs for agencies?", a: "Yes. JobMaze has an affiliate program offering 20% commission per referral for the life of the subscription. There is also a formal partnership track for agencies that want co-branded landing pages and mutual referrals." },
    { q: "Can we white-label or embed JobMaze data in our own tools?", a: "White-labeling is not currently available. However, for enterprise agencies interested in API access to JobMaze data, contact sales@jobmaze.ca to discuss custom arrangements." },
    { q: "What support does JobMaze offer for Agency plan onboarding?", a: "All Agency plan customers receive a dedicated onboarding session (up to 60 minutes) with a JobMaze team member who will walk your team through the platform and configure it for your specific workflow." },
    { q: "How do I add or remove team members on our Agency account?", a: "Account administrators can manage team members from Settings > Team Management. Add members by email, assign roles (Admin or Member), and remove members with one click. Seat changes take effect immediately." },
    { q: "Is there a limit on how many employer profiles I can save on the Agency plan?", a: "Agency plan users can save up to 2,000 employer profiles in their pipeline. There is no limit on saved searches. If you need higher limits, contact us to discuss an enterprise arrangement." },
  ],
  lmia: [
    { q: "What is an LMIA?", a: "An LMIA (Labour Market Impact Assessment) is a document issued by Employment and Social Development Canada (ESDC) that confirms a Canadian employer was unable to fill a position with a qualified Canadian citizen or permanent resident, and therefore needs to hire a foreign worker." },
    { q: "Why do employers need an LMIA?", a: "Most Canadian employers must obtain a positive LMIA before they can hire a foreign worker on an employer-specific work permit. The LMIA process ensures that hiring a foreign worker does not negatively impact the Canadian labour market." },
    { q: "What is a 'positive LMIA'?", a: "A positive LMIA is an approval from ESDC confirming the employer's need to hire a foreign worker. This document is then used by the foreign worker to apply for a work permit. A negative LMIA means the application was rejected." },
    { q: "Which employers are exempt from needing an LMIA?", a: "Certain work permit categories are LMIA-exempt, including intra-company transferees, CUSMA/USMCA professionals, international agreements (like CETA), and significant benefit to Canada cases. These are handled under the International Mobility Program (IMP) rather than the Temporary Foreign Worker Program (TFWP)." },
    { q: "What are the main LMIA streams?", a: "The primary LMIA streams are: (1) High-Wage Stream (wages at or above provincial median), (2) Low-Wage Stream (wages below provincial median), (3) Agricultural Stream, (4) In-Home Caregiver Stream, (5) Global Talent Stream (technology sector, expedited processing), and (6) Seasonal Agricultural Worker Program (SAWP)." },
    { q: "How long does it take to get an LMIA approved?", a: "Processing times vary by stream. The Global Talent Stream offers a 2-week service standard. Standard high-wage and low-wage streams typically take 2–5 months. Agricultural streams vary seasonally. Processing times are published on the ESDC website and updated regularly." },
    { q: "What is the Global Talent Stream LMIA?", a: "The Global Talent Stream (GTS) is a fast-track LMIA pathway for technology and high-skilled positions, offering a 2-week service standard. It is part of Canada's effort to attract global tech talent and is commonly used for software engineers, data scientists, and similar roles." },
    { q: "What is the difference between a high-wage and low-wage LMIA?", a: "The distinction is based on the provincial or territorial median wage. Positions offering wages at or above the median qualify for the High-Wage stream. Positions below the median fall under the Low-Wage stream, which has additional restrictions including a cap on the proportion of temporary foreign workers an employer can hire." },
    { q: "Can a foreign worker apply for PR using an LMIA job?", a: "Yes. A positive LMIA job offer can add significant points (up to 200 or 50 Comprehensive Ranking System points depending on NOC level) to an Express Entry profile, significantly boosting the chance of receiving an Invitation to Apply for PR." },
    { q: "What is the Seasonal Agricultural Worker Program (SAWP)?", a: "The SAWP is a bilateral agreement between Canada and participating countries (Mexico, Caribbean nations) allowing employers in the primary agriculture sector to hire foreign workers for seasonal positions (up to 8 months). It has its own LMIA process under the Agricultural Stream." },
    { q: "What documents do employers need to apply for an LMIA?", a: "Key employer documents include: proof of business registration, job advertisement evidence (showing they tried to hire Canadians first), a copy of the employment contract, proof of wages and working conditions, and the LMIA application form (EMP5626 for high-wage, EMP5627 for low-wage)." },
    { q: "How much does an LMIA application cost for an employer?", a: "The current LMIA application fee is $1,000 CAD per position. Some exceptions apply — for example, positions under the Agricultural Stream, in-home caregiver positions, and positions offering a wage in the highest 10th percentile nationally may have different fee structures." },
    { q: "Can one LMIA cover multiple foreign workers?", a: "A single LMIA application can cover multiple positions for the same job at the same workplace. For example, an employer hiring 10 foreign farm workers can submit one LMIA application for all 10 positions." },
    { q: "How long is an LMIA valid?", a: "An LMIA is valid for 18 months from the date of issue. The foreign worker must use the LMIA to apply for their work permit within this period. After 18 months, the employer must apply for a new LMIA if the position is still open." },
    { q: "Can an LMIA be extended or renewed?", a: "LMIAs themselves cannot be renewed. If the employer still needs to hire a foreign worker after the LMIA expires, they must submit a new LMIA application and go through the process again." },
    { q: "What is a closed (employer-specific) work permit?", a: "A closed work permit, also called an employer-specific work permit, ties the foreign worker to a specific employer, location, and job title. It is issued based on a positive LMIA and the worker cannot change employers without getting a new work permit." },
    { q: "Can a foreign worker change employers while on an LMIA work permit?", a: "Not without first obtaining a new work permit. The worker must find a new employer willing to obtain a new LMIA for them, then apply for a new employer-specific work permit before starting with the new employer." },
    { q: "What happens if the LMIA employer closes or goes out of business?", a: "If an employer ceases operations, the foreign worker's work permit becomes invalid for that employer. The worker should contact IRCC immediately. In some cases, IRCC may grant a temporary authorization to find another employer or remain in Canada during the transition." },
    { q: "Does a positive LMIA guarantee a work permit will be issued?", a: "No. A positive LMIA is one part of the work permit application. IRCC makes the final decision on the work permit based on all factors including the applicant's admissibility, qualifications, and compliance with immigration laws." },
    { q: "What is the LMIA job offer requirement for Express Entry?", a: "Under Express Entry, a valid job offer supported by a positive LMIA (or an LMIA-exempt job offer) from a Canadian employer can add significant CRS points: 200 points for NOC TEER 0 Senior Manager positions, and 50 points for TEER 0, 1, 2, or 3 positions." },
    { q: "What is the difference between the TFWP and the IMP?", a: "The Temporary Foreign Worker Program (TFWP) requires an LMIA before hiring a foreign worker. The International Mobility Program (IMP) is LMIA-exempt and includes pathways like open work permits, intra-company transfers, and international agreements. JobMaze focuses primarily on TFWP/LMIA positions." },
    { q: "Are there restrictions on how many temporary foreign workers an employer can have?", a: "Yes. Under the Low-Wage stream, employers are generally capped at having 10–20% of their workforce as temporary foreign workers (depending on sector). High-wage stream employers have fewer restrictions but must still demonstrate labour market need." },
  ],
  data: [
    { q: "Where does JobMaze get its data from?", a: "JobMaze aggregates data from multiple sources including ESDC's public LMIA approval database, Job Bank Canada postings flagged for LMIA eligibility, verified employer partnerships, and proprietary web aggregation from Canadian job platforms." },
    { q: "How often are listings updated on JobMaze?", a: "The JobMaze database is updated daily — typically between 6am and 8am ET. New listings go live every morning. You will always be searching against the most current available data." },
    { q: "How many job listings does JobMaze have?", a: "JobMaze currently maintains a database of over 10,000 active LMIA-eligible job listings across Canada at any given time, covering all provinces and major industries. The total database including historical listings exceeds 80,000 records." },
    { q: "Can I see the LMIA history of a specific employer?", a: "Yes. On Pro and Agency plans, each employer profile includes their full LMIA history sourced from ESDC public records — including dates of applications, number of positions requested, positive/negative outcomes, and streams used." },
    { q: "Are listings verified for accuracy?", a: "JobMaze applies automated validation checks to all listings including employer registration verification, wage comparison against provincial standards, and duplicate detection. However, we recommend users independently verify employer details before advising clients or making outreach." },
    { q: "How long do listings stay on JobMaze?", a: "Active listings remain until they are removed by the employer, expire (90 days by default), or are marked as filled. Historical listings are archived and searchable through the LMIA history tool on Pro and Agency plans." },
    { q: "Does JobMaze show the date a listing was posted?", a: "Yes. Each listing shows its original date posted, last updated date, and days since posting. You can sort results by posting date and filter to show only listings from a specific time window." },
    { q: "Can I see how many applications an employer has received for a listing?", a: "This information is not available for most listings as employers do not share application counts through the ESDC data feed. However, listings that have been active for more than 30 days are flagged as 'Aged' — often indicating the position is still available." },
    { q: "What is the LMIA Employer Database?", a: "The LMIA Employer Database is a Pro/Agency feature showing all Canadian employers who have received at least one positive LMIA historically. It is a comprehensive, searchable list that can be filtered by province, industry, number of LMIAs, and most recent activity." },
    { q: "How accurate are the wage figures shown in listings?", a: "Wages shown are sourced from employer LMIA applications submitted to ESDC, which require employers to certify the wage offered. These are generally reliable. We also cross-reference wages against the Government of Canada's Job Bank wage data by occupation." },
    { q: "Can I download the full LMIA Employer Database?", a: "Partial exports are available on Agency plans (up to 500 records per export). A full database download is not available as standard. Contact sales@jobmaze.ca if you need a custom enterprise data arrangement." },
    { q: "Does JobMaze include the LMIA Employer Compliance Feed from ESDC?", a: "Yes. JobMaze incorporates the ESDC employer compliance data, which includes employers who have been found non-compliant with LMIA conditions. Non-compliant employers are flagged with a warning label in our system." },
    { q: "Are there listings for remote or work-from-home LMIA jobs?", a: "LMIA applications typically require a specific work location. True remote work LMIAs are uncommon. However, JobMaze includes hybrid and remote-eligible positions where they appear in ESDC data. These can be filtered using the Work Mode filter." },
    { q: "How does JobMaze handle duplicate listings?", a: "Our system applies deduplication logic to remove duplicate listings from the same employer for the same position. If you see a similar listing appearing twice, use the 'Report Duplicate' flag on the listing page and our team will review it within 24 hours." },
    { q: "Can I see what companies are the biggest LMIA employers in a given province?", a: "Yes. The Employer Rankings feature (Pro and Agency) shows the top LMIA employers by province, sector, and LMIA volume. This is a useful tool for identifying large-scale employers with consistent TFW hiring activity." },
    { q: "Does JobMaze publish any market reports on LMIA trends?", a: "Yes. JobMaze publishes quarterly LMIA market reports based on platform data and ESDC records. Reports include top sectors, provinces, year-over-year LMIA volume changes, and wage trends. These are free to download for all subscribers." },
    { q: "What happens to listings that are expired or filled?", a: "Expired or filled listings are moved to the JobMaze archive. They remain searchable through the LMIA History tool for research and trend analysis purposes but are clearly marked as inactive." },
    { q: "Can I access historical LMIA data for research purposes?", a: "Pro and Agency subscribers have access to up to 5 years of LMIA data through our historical search feature. This is useful for market analysis, predicting seasonal hiring patterns, and identifying long-term employer relationships." },
  ],
  plans: [
    { q: "What plans does JobMaze offer?", a: "JobMaze offers three plans: <strong>Free Trial</strong> (full access for a limited period), <strong>Pro</strong> (single-user full access, monthly or annual billing), and <strong>Agency</strong> (multi-user with advanced features, monthly or annual billing). All plans include access to the LMIA job database." },
    { q: "How much does the Pro plan cost?", a: "The Pro plan is priced at a competitive monthly or annual rate designed for individual immigration professionals. Visit jobmaze.ca/pricing for current pricing, as rates may be updated periodically. Annual billing saves approximately 17% versus monthly." },
    { q: "How much does the Agency plan cost?", a: "The Agency plan is priced per team size and includes multi-user access, bulk export, and advanced employer tools. Visit jobmaze.ca/pricing for current rates. Custom pricing is available for teams over 5 members." },
    { q: "What is the difference between the Pro and Agency plan features?", a: "Pro includes: full LMIA job search, saved searches, job alerts, employer contact details, LMIA history, and single-user access. Agency adds: multi-seat access (up to 5 users), bulk export, employer pipeline management, shared saved searches, and priority onboarding." },
    { q: "Is there a free plan?", a: "There is no permanent free plan, but JobMaze offers a free trial with access to core features. After the trial, you must subscribe to a paid plan to continue. We believe in providing enough trial access to demonstrate real value before asking for payment." },
    { q: "Can I try the Agency plan before buying?", a: "Yes. Contact sales@jobmaze.ca for an Agency plan demo or extended trial. We offer customized walkthroughs for team leads and HR managers considering the Agency plan." },
    { q: "Does the free trial require a credit card?", a: "No. You can start your free trial without entering any credit card information. You only provide payment details when you choose to upgrade to a paid plan." },
    { q: "What features are restricted in the free trial?", a: "The free trial provides access to search and filter, but limits employer contact details (partial info only), restricts bulk export, and limits saved searches to 3. Upgrading unlocks all features." },
    { q: "Are there any setup fees?", a: "No. There are no setup fees for any JobMaze plan. You pay only the subscription rate — monthly or annually — with no additional onboarding or activation charges." },
    { q: "Can I negotiate a custom plan for a large organization?", a: "Yes. For organizations with 10+ users, high-volume export needs, or custom integration requirements, contact sales@jobmaze.ca to discuss an enterprise arrangement with custom pricing and features." },
    { q: "Does JobMaze offer a student or new graduate discount?", a: "We offer a 25% discount for RCIC students enrolled in accredited immigration consulting programs and for individuals who have received their RCIC designation within the last 12 months. Contact support@jobmaze.ca with verification to apply." },
    { q: "Is there a discount for paying annually?", a: "Yes. Annual billing for both Pro and Agency plans offers savings equivalent to getting approximately 2 months free compared to monthly billing — roughly a 17% discount." },
    { q: "What is included in the LMIA Employer Database access?", a: "LMIA Employer Database access (included in Pro and Agency) gives you searchable access to all Canadian employers with LMIA history, including their application details, positive/negative outcomes, sectors, provinces, and most recent activity." },
    { q: "Can I switch plans mid-subscription?", a: "Yes. You can upgrade from Pro to Agency at any time — the difference is prorated. Downgrading from Agency to Pro takes effect at the next billing cycle." },
    { q: "Does JobMaze offer group or volume discounts?", a: "Yes. For organizations subscribing with 3 or more Agency plan licenses, or for RCIC associations referring members in bulk, contact us at sales@jobmaze.ca for volume pricing." },
    { q: "What is the early-bird plan?", a: "The early-bird plan was available to our first subscribers during beta. It locked in a permanently discounted rate for the lifetime of the subscription. This offer is now closed to new subscribers but existing early-bird members retain their rate." },
    { q: "What happens to my saved data if I downgrade my plan?", a: "If you downgrade from Agency to Pro, team member access is removed but the account owner retains all data. If you move from Pro to free (by cancelling), your data is preserved for 90 days before deletion." },
    { q: "Does JobMaze offer a referral discount?", a: "Yes. Our referral program gives you 1 free month of your current plan for every new subscriber you refer who completes their first paid month. There is no limit on how many referrals you can make." },
    { q: "Where can I see a full feature comparison between plans?", a: "Visit jobmaze.ca/pricing for a side-by-side feature comparison table covering all plans. If you have specific questions about what's included, email support@jobmaze.ca." },
    { q: "Does the Agency plan include a dedicated account manager?", a: "Agency plan subscribers receive priority support and a named customer success contact for onboarding. Ongoing dedicated account management is available for enterprise accounts — contact us to discuss." },
  ],
  tech: [
    { q: "What are the system requirements to use JobMaze?", a: "JobMaze is a web application that runs in any modern browser. No software installation is required. Supported browsers include Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. An internet connection is required." },
    { q: "Does JobMaze have a mobile app?", a: "Not currently. JobMaze is a fully responsive web app that works on mobile browsers. A dedicated iOS and Android app is on our product roadmap for 2027." },
    { q: "Is my data encrypted on JobMaze?", a: "Yes. All data transmitted between your browser and JobMaze servers is encrypted using TLS 1.3. Account passwords are hashed using industry-standard bcrypt encryption. We take security seriously." },
    { q: "Does JobMaze comply with Canadian privacy laws (PIPEDA)?", a: "Yes. JobMaze is designed to comply with the Personal Information Protection and Electronic Documents Act (PIPEDA). We only collect data necessary to operate the service and do not sell user data to third parties. See our Privacy Policy for full details." },
    { q: "Where is JobMaze data stored?", a: "JobMaze data is stored on servers located in Canada (primary) and the United States (backup/redundancy). All data transfers comply with applicable privacy regulations." },
    { q: "Can I export all my account data?", a: "Yes. Go to Settings > Privacy > Export My Data to download a full copy of your account information, saved searches, notes, and activity history in JSON format." },
    { q: "Does JobMaze integrate with CRM systems?", a: "Direct CRM integrations (Salesforce, HubSpot, etc.) are on our roadmap. Currently, you can export employer data as CSV and import into most CRMs manually. Contact us if you need a specific integration accelerated." },
    { q: "What is JobMaze's uptime guarantee?", a: "JobMaze targets 99.5% monthly uptime. Planned maintenance windows are scheduled during low-traffic hours (typically 2am–4am ET) and announced via email and the status page at status.jobmaze.ca at least 24 hours in advance." },
    { q: "Where can I report a bug or technical issue?", a: "Use the 'Report a Problem' link in your account dashboard, or email support@jobmaze.ca with a description of the issue and a screenshot if possible. Our team aims to acknowledge all bug reports within 4 business hours." },
    { q: "Does JobMaze have an API?", a: "A public API is not currently available. We are developing an API for enterprise clients. If you are interested in accessing JobMaze data programmatically, contact sales@jobmaze.ca to be added to the early access list." },
    { q: "Can I use JobMaze with a VPN?", a: "Yes. JobMaze is accessible via VPN. If you experience any access issues while connected to a VPN, try disabling it temporarily to diagnose whether the VPN is causing the issue. Our support team can help if problems persist." },
    { q: "What two-factor authentication options are available?", a: "JobMaze supports authenticator app (TOTP) based two-factor authentication. We recommend enabling 2FA from Settings > Security for added account protection." },
    { q: "How do I enable email notifications for new job listings?", a: "Go to your Saved Searches, click on the search you want alerts for, and toggle 'Email Alerts' on. Choose daily or weekly digest frequency. You can manage all alert preferences from Settings > Notifications." },
    { q: "Can I customize which columns appear in search results?", a: "Yes. Click the column settings icon on the search results page to show or hide fields including wage, province, industry, LMIA history, and posting date. Your column preferences are saved to your account." },
    { q: "Why am I seeing duplicate results in my search?", a: "Duplicates can occasionally appear when the same position is posted to multiple sources. Use the 'Deduplicate' toggle in advanced search settings to filter these out automatically. If duplicates persist, please report them using the flag icon on the listing." },
    { q: "How do I change my notification email address?", a: "Notification emails go to your registered account email. To change it, update your account email under Settings > Profile > Email and all future notifications will route to the new address." },
    { q: "Is there a keyboard shortcut guide for JobMaze?", a: "Yes. Press the '?' key anywhere in the app to open the keyboard shortcut panel. Common shortcuts include: '/' to jump to search, 'S' to save current search, 'E' to export results, and 'Escape' to close any open panel." },
    { q: "What should I do if the JobMaze site is down?", a: "Check status.jobmaze.ca for real-time system status. You can also follow @JobMazeCa on social media for maintenance announcements. If the outage is unplanned, our team aims to have issues resolved within 2 hours." },
    { q: "Does JobMaze work offline?", a: "No. JobMaze requires an active internet connection. However, any data you have exported (CSV, PDF) can be accessed offline. We are exploring offline mode features for a future app update." },
  ]
};

const CATEGORIES = [
  { id: 'general', title: 'Getting Started', icon: Info, count: FAQ_DATA.general.length, color: 'bg-blue-50 text-blue-600' },
  { id: 'account', title: 'Account & Billing', icon: UserCircle, count: FAQ_DATA.account.length, color: 'bg-blue-50 text-blue-600' },
  { id: 'search', title: 'LMIA Job Search', icon: SearchIcon, count: FAQ_DATA.search.length, color: 'bg-[#1D6FBF]/10 text-[#1D6FBF]' },
  { id: 'rcic', title: 'For RCICs', icon: Scale, count: FAQ_DATA.rcic.length, color: 'bg-[#1D6FBF]/10 text-[#1D6FBF]' },
  { id: 'recruiter', title: 'For Recruiters & Agencies', icon: Building2, count: FAQ_DATA.recruiter.length, color: 'bg-[#0F7B5E]/10 text-[#0F7B5E]' },
  { id: 'lmia', title: 'About LMIA', icon: FileText, count: FAQ_DATA.lmia.length, color: 'bg-[#0F7B5E]/10 text-[#0F7B5E]' },
  { id: 'data', title: 'Data & Listings', icon: Database, count: FAQ_DATA.data.length, color: 'bg-blue-50 text-[#1D6FBF]' },
  { id: 'plans', title: 'Plans & Pricing', icon: CreditCard, count: FAQ_DATA.plans.length, color: 'bg-blue-50 text-blue-600' },
  { id: 'tech', title: 'Technical & Support', icon: Settings, count: FAQ_DATA.tech.length, color: 'bg-gray-100 text-gray-600' },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_DATA;
    
    const query = searchQuery.toLowerCase();
    const result: Record<string, typeof FAQ_DATA.general> = {};
    
    Object.entries(FAQ_DATA).forEach(([key, items]) => {
      const matched = items.filter(
        item => item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
      );
      if (matched.length > 0) {
        result[key] = matched;
      }
    });
    
    return result;
  }, [searchQuery]);

  const totalQuestions = Object.values(FAQ_DATA).reduce((acc, curr) => acc + curr.length, 0);

  const handleScroll = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
      <div className="bg-brand-900 pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_200%_100%_at_50%_120%,rgba(29,111,191,0.2),transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider mb-6"
          >
            ✦ Help Center
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6"
          >
            Frequently Asked <span className="text-brand-400 italic">Questions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-blue-100/70 max-w-2xl mx-auto mb-10 font-light"
          >
            Everything you need to know about JobMaze — from getting started to advanced LMIA search features.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto relative"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-400 transition-colors" />
              <Input
                type="text"
                placeholder={`Search ${totalQuestions} questions...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/10 border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-brand-400/50 backdrop-blur-md transition-all text-base"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-28">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Browse by Topic</h3>
            <nav className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleScroll(cat.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-white text-brand-600 shadow-sm border border-gray-100' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                      {cat.title}
                    </span>
                    <Badge variant="secondary" className={`${isActive ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'} font-bold`}>
                      {cat.count}
                    </Badge>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {Object.keys(filteredData).length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">Try a different keyword or browse by category.</p>
              </div>
            ) : (
              <div className="space-y-16">
                {CATEGORIES.map((cat) => {
                  const sectionData = filteredData[cat.id as keyof typeof FAQ_DATA];
                  if (!sectionData || sectionData.length === 0) return null;

                  const Icon = cat.icon;

                  return (
                    <section key={cat.id} id={cat.id} className="scroll-mt-32">
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200/60">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{cat.title}</h2>
                          <p className="text-sm text-gray-500 font-medium">{sectionData.length} questions</p>
                        </div>
                      </div>

                      <Accordion type="multiple" className="space-y-3">
                        {sectionData.map((faq, idx) => (
                          <AccordionItem
                            key={idx}
                            value={`item-${cat.id}-${idx}`}
                            className="bg-white border rounded-2xl px-6 data-[state=open]:border-brand-500 data-[state=open]:shadow-md transition-all duration-200"
                          >
                            <AccordionTrigger className="text-left font-semibold text-[15px] hover:no-underline py-5 text-gray-800 hover:text-brand-600">
                              <span className="flex gap-4 items-start">
                                <span className="text-brand-500/50 font-black text-sm pt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                                {faq.q}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 pl-9 text-gray-600 leading-relaxed text-[15px]">
                              <div dangerouslySetInnerHTML={{ __html: faq.a }} className="prose prose-sm max-w-none prose-strong:text-gray-900 prose-strong:font-bold" />
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </section>
                  );
                })}
              </div>
            )}

            <div className="mt-20 bg-[#0d1b3e] rounded-[32px] p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.1),transparent_50%)]" />
              <h3 className="text-2xl font-black text-white mb-3 relative z-10">Still have questions?</h3>
              <p className="text-blue-100/70 mb-8 max-w-md mx-auto relative z-10 font-light">
                Our support team is available Monday to Friday, 9am–6pm ET. We usually respond within a few hours.
              </p>
              <Link
                href="mailto:support@jobmaze.ca"
                className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0d1b3e] font-bold px-8 py-4 rounded-xl transition-all relative z-10 shadow-lg shadow-[#F5A623]/10"
              >
                Contact Support
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
