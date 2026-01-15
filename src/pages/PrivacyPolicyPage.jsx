import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#7d2ae8] selection:text-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/logos/reputul-logo.svg" alt="Reputul" className="h-8 w-auto" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Reputul</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-[#7d2ae8] flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7d2ae8]/20 text-[#cbb0f5] text-xs font-bold uppercase tracking-wider mb-6">
            Last Updated: January 13, 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            We value your trust and are committed to protecting your personal information. 
            This policy outlines how Reputul collects, uses, and safeguards your data.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-12">
          
          <Section icon={<Eye className="text-[#7d2ae8]" />} title="1. Information We Collect">
            <p>We collect information you provide directly to us, such as when you create an account, subscribe to our service, or request customer support. This may include:</p>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
              <li>Name, email address, and phone number.</li>
              <li>Business information and payment details (processed securely by our payment providers).</li>
              <li>Customer data you upload to the platform for the purpose of sending review requests.</li>
            </ul>
          </Section>

          <Section icon={<FileText className="text-blue-500" />} title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related information, including confirmations and invoices.</li>
              <li>Send you technical notices, updates, security alerts, and support messages.</li>
              <li>Respond to your comments, questions, and requests.</li>
            </ul>
          </Section>

          {/* CRITICAL SECTION FOR TWILIO - DO NOT REMOVE */}
          <Section icon={<Lock className="text-green-500" />} title="3. Information Sharing & Disclosure">
            <p className="font-bold text-slate-900 mb-2">Zero Tolerance for Spam</p>
            <p>We do not sell, trade, or rent your personal information to third parties.</p>
            
            <div className="bg-slate-50 border-l-4 border-[#7d2ae8] p-4 my-4 rounded-r-lg">
              <p className="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-1">Mobile Information Clause</p>
              <p className="italic text-slate-700">
                "No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties."
              </p>
            </div>
            
            <p>We may share information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.</p>
          </Section>

          <Section icon={<Shield className="text-orange-500" />} title="4. Data Security">
            <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>
          </Section>

          <div className="border-t border-slate-200 pt-8 mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Us</h3>
            <p className="text-slate-600 mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
            <a href="mailto:support@reputul.com" className="text-[#7d2ae8] font-bold hover:underline">
              support@reputul.com
            </a>
            <p className="text-slate-500 mt-2 text-sm">
              Reputul LLC<br />
              [Castle Rock, CO, USA]
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

const Section = ({ icon, title, children }) => (
  <section>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="text-slate-600 leading-relaxed pl-12">
      {children}
    </div>
  </section>
);

export default PrivacyPolicyPage;