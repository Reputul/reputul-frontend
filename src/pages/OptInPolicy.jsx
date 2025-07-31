import React from 'react';

const OptInPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2">
              <img 
                src="/assets/reputul-logo.png" 
                alt="Reputul Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Reputul</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Communication Opt-In Policy</h1>
            <p className="text-lg text-gray-600">Effective Date: January 31, 2025</p>
          </div>

          <div className="prose max-w-none">
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                At Reputul, we respect your privacy and are committed to providing transparent, valuable communication. 
                This policy explains how we handle your consent for email and SMS communications.
              </p>
            </div>

            {/* Email Communications */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                📧 Email Communications
              </h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">How You Opt-In</h3>
              <p className="text-gray-700 mb-4">
                By providing your email address through our website forms, early access signup, or onboarding process, 
                you consent to receive email communications from Reputul.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">What to Expect</h3>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-2">Email messages may include:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Product updates and feature announcements</li>
                  <li>Early access invitations and beta testing opportunities</li>
                  <li>Educational content about reputation management</li>
                  <li>Account notifications and important service updates</li>
                  <li>Occasional promotional offers and company news</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Frequency</h3>
              <p className="text-gray-700 mb-4">
                We respect your inbox. Expect 1-3 emails per week during active development phases, 
                and less frequent communication after launch.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Unsubscribe</h3>
              <p className="text-gray-700 mb-4">
                You can unsubscribe from our emails at any time by:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Clicking the "Unsubscribe" link in any email</li>
                <li>Emailing us at <a href="mailto:support@reputul.com" className="text-blue-600 hover:text-blue-800">support@reputul.com</a></li>
                <li>Managing your preferences in your account settings (when available)</li>
              </ul>
            </section>

            {/* SMS Communications */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                📱 SMS Text Message Communications
              </h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">How You Opt-In</h3>
              <p className="text-gray-700 mb-4">
                By providing your phone number through one of our authorized forms, onboarding flows, 
                or by texting a keyword (e.g., "JOIN") to our toll-free number, you consent to receive 
                SMS messages from Reputul or one of our business partners.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">What to Expect</h3>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-2">SMS messages may include:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Review request links for your customers</li>
                  <li>Customer feedback surveys and notifications</li>
                  <li>Appointment reminders and follow-ups</li>
                  <li>Support updates and service notifications</li>
                  <li>Important account alerts and security notifications</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Message Frequency</h3>
              <p className="text-gray-700 mb-4">
                Message frequency will vary based on your business activity and customer interactions. 
                <strong> Message and data rates may apply</strong> according to your mobile carrier plan.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Opt-Out</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-gray-700 font-medium mb-2">
                  You can unsubscribe from SMS messages at any time by:
                </p>
                <ul className="list-disc list-inside text-gray-700">
                  <li>Replying <strong>STOP</strong> to any text message</li>
                  <li>Contacting our support team at <a href="mailto:support@reputul.com" className="text-blue-600">support@reputul.com</a></li>
                </ul>
              </div>
            </section>

            {/* Privacy & Data Protection */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                🔒 Privacy & Data Protection
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Our Commitment to Your Privacy</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>No sharing:</strong> We do not sell, rent, or share your email address or phone number with third parties for their marketing purposes</li>
                  <li><strong>Secure storage:</strong> Your contact information is stored securely and used only for the purposes described in this policy</li>
                  <li><strong>Data retention:</strong> We retain your information only as long as necessary to provide our services or as required by law</li>
                  <li><strong>Your rights:</strong> You can request access, correction, or deletion of your personal information at any time</li>
                </ul>
                
                <p className="text-gray-700 mt-4">
                  For complete details about how we handle your data, please read our 
                  <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 font-medium"> Privacy Policy</a>.
                </p>
              </div>
            </section>

            {/* Compliance */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                ⚖️ Legal Compliance
              </h2>
              <p className="text-gray-700 mb-4">
                This opt-in policy complies with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>Telephone Consumer Protection Act (TCPA)</li>
                <li>CAN-SPAM Act</li>
                <li>Cellular Telecommunications Industry Association (CTIA) guidelines</li>
                <li>General Data Protection Regulation (GDPR) where applicable</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                📞 Questions or Concerns?
              </h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this opt-in policy or need assistance with your communication preferences, 
                  please don't hesitate to contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> <a href="mailto:support@reputul.com" className="text-blue-600 hover:text-blue-800">support@reputul.com</a></p>
                  <p><strong>Website:</strong> <a href="https://reputul.com" className="text-blue-600 hover:text-blue-800">reputul.com</a></p>
                  <p><strong>Address:</strong>Castle Rock, Colorado</p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                This policy was last updated on January 31, 2025. We may update this policy from time to time, 
                and we will notify you of any significant changes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 mr-2">
              <img 
                src="/assets/reputul-logo.png" 
                alt="Reputul Logo" 
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <span className="text-lg font-semibold font-poppins">Reputul</span>
          </div>
          <p className="text-gray-400">
            &copy; 2025 Reputul. All rights reserved. | 
            <a href="/privacy-policy" className="hover:text-white"> Privacy Policy</a> | 
            <a href="/terms" className="hover:text-white"> Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OptInPolicy;