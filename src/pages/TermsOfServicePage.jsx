import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Smartphone, AlertCircle, Ban, ArrowLeft } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#7d2ae8] selection:text-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/reputul-logo.png" alt="Reputul" className="h-8 w-auto" />
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
            Effective Date: January 13, 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            Please read these terms carefully before using the Reputul platform. 
            By accessing or using our service, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-12">
          
          <Section icon={<FileCheck className="text-[#7d2ae8]" />} title="1. Acceptance of Terms">
            <p>
              By accessing and using Reputul ("Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </Section>

          <Section icon={<Ban className="text-red-500" />} title="2. Use License & Restrictions">
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Reputul's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>Attempt to decompile or reverse engineer any software contained on Reputul's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
          </Section>

          {/* CRITICAL SMS SECTION FOR CARRIERS */}
          <Section icon={<Smartphone className="text-blue-500" />} title="3. SMS/MMS Mobile Messaging Program Terms">
            <p>
              Reputul offers a mobile messaging program (the "Program"), which you agree to use and participate in subject to these Mobile Messaging Terms and Conditions.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-2">3.1. User Opt In</h4>
                <p>The Program allows Users to receive SMS/MMS mobile messages by affirmatively opting into the Program, such as through online or application-based enrollment forms. Regardless of the opt-in method you utilized to join the Program, you agree that this Agreement applies to your participation in the Program.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-2">3.2. Cost and Frequency</h4>
                <p>Message and data rates may apply. The Program involves recurring mobile messages, and additional mobile messages may be sent periodically based on your interaction with Reputul.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-2">3.3. User Opt Out</h4>
                <p>If you do not wish to continue participating in the Program or no longer agree to this Agreement, you agree to reply <strong>STOP, END, CANCEL, UNSUBSCRIBE, or QUIT</strong> to any mobile message from Us in order to opt out of the Program. You understand and agree that the foregoing options are the only reasonable methods of opting out.</p>
              </div>

               <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-2">3.4. Support</h4>
                <p>For support regarding the Program, text "HELP" to the number you received messages from or email us at support@reputul.com.</p>
              </div>
            </div>
          </Section>

          <Section icon={<AlertCircle className="text-orange-500" />} title="4. Disclaimer">
            <p>
              The materials on Reputul's website are provided on an 'as is' basis. Reputul makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </Section>

          <div className="border-t border-slate-200 pt-8 mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Us</h3>
            <p className="text-slate-600 mb-4">If you have any questions about these Terms, please contact us:</p>
            <a href="mailto:support@reputul.com" className="text-[#7d2ae8] font-bold hover:underline">
              support@reputul.com
            </a>
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

export default TermsOfServicePage;