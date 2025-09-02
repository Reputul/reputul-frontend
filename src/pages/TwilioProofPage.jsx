// src/pages/TwilioProofPage.jsx
import React from 'react';
import { CheckCircle, Shield, MessageSquare, ExternalLink } from 'lucide-react';

// Screenshots will be served from public/assets/screenshots/
// No imports needed - we'll reference them directly

const TwilioProofPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">SMS Opt-In Compliance Documentation</h1>
            <p className="text-gray-600 mt-2">Proof of Consent for Twilio Toll-Free Verification</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Company</h3>
              <p className="text-gray-600">Reputul - Reputation Management Platform</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Industry</h3>
              <p className="text-gray-600">SaaS - Local Service Business Tools</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Use Case</h3>
              <p className="text-gray-600">Review request notifications for home service businesses</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Message Frequency</h3>
              <p className="text-gray-600">1-3 messages per customer per month</p>
            </div>
          </div>
        </div>

        {/* Opt-In Process Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">SMS Opt-In Process</h2>
          <p className="text-gray-600 mb-6">
            Our SMS opt-in process follows TCPA compliance requirements with explicit consent and double opt-in confirmation:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">Customer visits SMS signup form</h3>
                <p className="text-gray-600">Public web form accessible at /sms-signup with clear business identification</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">Explicit consent required</h3>
                <p className="text-gray-600">Required checkbox with full TCPA disclosure language</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">Double opt-in confirmation</h3>
                <p className="text-gray-600">Confirmation SMS sent requiring "YES" reply to activate</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <h3 className="font-semibold text-gray-900">Ongoing opt-out support</h3>
                <p className="text-gray-600">STOP/HELP keywords supported 24/7 with immediate processing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Proof of Consent Screenshots</h2>
          
          {/* Screenshot 1: SMS Signup Form */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">1. SMS Signup Form with Explicit Consent</h3>
            <p className="text-gray-600 mb-4">
              Public web form showing required consent checkboxes and TCPA compliance language:
            </p>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <img 
                src="/assets/screenshots/sms-signup-form.png" 
                alt="SMS Signup Form showing consent checkboxes and TCPA disclosure"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Compliance Elements Shown:</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Required SMS consent checkbox with TCPA language</li>
                <li>• "Message and data rates may apply" disclosure</li>
                <li>• Clear STOP opt-out instructions</li>
                <li>• Link to full opt-in policy</li>
                <li>• Business name clearly identified</li>
              </ul>
            </div>
          </div>

          {/* Screenshot 2: Success Page */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Double Opt-In Confirmation Page</h3>
            <p className="text-gray-600 mb-4">
              Success page explaining the double opt-in process and next steps:
            </p>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <img 
                src="/assets/screenshots/success-page.png" 
                alt="Success page showing double opt-in instructions"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Double Opt-In Process:</h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Clear instructions to reply "YES" to confirmation text</li>
                <li>• Explanation that subscription is not active until confirmed</li>
                <li>• Support contact information provided</li>
                <li>• Opt-out instructions included</li>
              </ul>
            </div>
          </div>

          {/* Screenshot 3: Opt-In Policy */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Published Opt-In Policy</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive opt-in policy published on website explaining SMS terms:
            </p>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <img 
                src="/assets/screenshots/opt-in-policy.png" 
                alt="Opt-in policy page with SMS terms and conditions"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Policy Components:</h4>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Detailed SMS communication terms</li>
                <li>• Message frequency and content explanation</li>
                <li>• Data handling and privacy practices</li>
                <li>• Multiple opt-out methods described</li>
                <li>• Contact information for support</li>
              </ul>
            </div>
          </div>

          {/* Screenshot 4: Admin Consent Management */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Administrative Consent Management</h3>
            <p className="text-gray-600 mb-4">
              Backend system for managing customer consent status and opt-out requests:
            </p>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <img 
                src="/assets/screenshots/admin-consent.png" 
                alt="Admin interface showing SMS consent management"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Administrative Features:</h4>
              <ul className="text-orange-800 text-sm space-y-1">
                <li>• Real-time consent status tracking</li>
                <li>• Opt-out request processing</li>
                <li>• Audit trail of consent changes</li>
                <li>• Manual consent management capability</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Implementation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Consent Tracking</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  Database records of all consent events
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  Timestamp and source tracking
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  Opt-out processing automation
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  Comprehensive audit logging
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Compliance</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  All messages include business identification
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  STOP/HELP keywords in every message
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  Rate disclosure included
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  Branded URLs only (no public shorteners)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sample Messages</h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-gray-900 mb-2">Review Request Message</h3>
              <p className="text-gray-700 font-mono text-sm">
                "ABC Roofing: We'd love your feedback—please review your roof repair: https://app.reputul.com/review/12345. Reply HELP for help, STOP to opt out. Msg & data rates may apply."
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
              <h3 className="font-semibold text-gray-900 mb-2">Double Opt-In Confirmation</h3>
              <p className="text-gray-700 font-mono text-sm">
                "ABC Roofing: Thanks for signing up! To complete your subscription and receive review notifications, reply YES. Reply STOP to opt out. Msg & data rates may apply. Support: support@reputul.com"
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-semibold text-gray-900 mb-2">Follow-Up Message</h3>
              <p className="text-gray-700 font-mono text-sm">
                "ABC Roofing: Hi John! Hope your roof repair went well. Quick review: https://app.reputul.com/review/12345. Reply HELP for help, STOP to opt out. Msg & data rates may apply."
              </p>
            </div>
          </div>
        </div>

        {/* Related Documentation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Documentation</h2>
          
          <div className="space-y-4">
            <a 
              href="/opt-in-policy" 
              target="_blank"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Complete Opt-In Policy</h3>
                <p className="text-gray-600 text-sm">Full terms of service and privacy policy for SMS communications</p>
              </div>
            </a>
            
            <a 
              href="/sms-signup" 
              target="_blank"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Live SMS Signup Form</h3>
                <p className="text-gray-600 text-sm">Functional opt-in form with consent checkboxes</p>
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>This documentation demonstrates compliance with TCPA regulations and Twilio messaging policies.</p>
          <p className="mt-2">For questions about this implementation, contact: support@reputul.com</p>
        </div>

      </main>
    </div>
  );
};

export default TwilioProofPage;