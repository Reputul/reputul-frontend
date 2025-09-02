// SmsSignupPage.jsx - Customer-facing SMS opt-in page
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle, Phone, Shield, MessageSquare } from "lucide-react";

const SmsSignupPage = () => {
  const { businessId } = useParams();
  const [searchParams] = useSearchParams();

  const [business, setBusiness] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    agreedToTerms: false,
    agreedToSms: false,
    referralSource: searchParams.get("ref") || "",
  });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: form, 2: confirmation sent

  // Load business info
  useEffect(() => {
    if (businessId) {
      fetchBusinessInfo();
    } else {
      // Set a default business for demo/verification purposes
      setBusiness({
        name: "ABC Roofing", // Default for screenshots
        phone: "1-800-555-0199",
        email: "support@abcroofing.com",
      });
    }
  }, [businessId]);

  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch(`/api/public/sms/business/${businessId}`);
      if (response.ok) {
        const data = await response.json();
        setBusiness(data);
      }
    } catch (err) {
      console.error("Failed to load business info:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreedToTerms || !formData.agreedToSms) {
      setError("You must agree to the terms and SMS consent to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/sms-signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            businessName: business.name || "ABC Roofing",
            serviceType: "service",
            consent: formData.agreedToSms,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(2);
        setSuccess(true);
      } else {
        setError(data.error || "Failed to sign up for SMS updates");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("SMS signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {business.name}
            </h1>
            <p className="text-gray-600">SMS Updates Signup</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
              <Phone className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">
                Stay Connected with SMS
              </h2>
              <p className="text-blue-100">
                Get important updates about your service directly to your phone
              </p>
            </div>

            {/* Benefits */}
            <div className="p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">
                You'll receive:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Service reminders
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Review requests</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Important updates
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                {/* SMS Consent - REQUIRED FOR TCPA COMPLIANCE */}
                <div className="space-y-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agreedToSms"
                      name="agreedToSms"
                      checked={formData.agreedToSms}
                      onChange={handleInputChange}
                      required
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="agreedToSms"
                      className="text-sm text-gray-700"
                    >
                      <strong>SMS Consent:</strong> I agree to receive SMS text
                      messages from {business.name}
                      at the phone number provided. Message frequency varies.
                      Message and data rates may apply. I can reply STOP to opt
                      out at any time.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agreedToTerms"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleInputChange}
                      required
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="agreedToTerms"
                      className="text-sm text-gray-700"
                    >
                      I agree to the{" "}
                      <a
                        href="/opt-in-policy"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service and Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    loading || !formData.agreedToTerms || !formData.agreedToSms
                  }
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing Up...</span>
                    </div>
                  ) : (
                    "Sign Up for SMS Updates"
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 text-center">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Privacy Protected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Reply STOP anytime</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation Sent */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Phone!
            </h2>
            <p className="text-gray-600 mb-6">
              We sent a confirmation text to <strong>{formData.phone}</strong>.
              <br />
              <strong>Reply "YES" to confirm your subscription</strong> or
              "STOP" to cancel.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> You must reply "YES" to the
                confirmation text to start receiving SMS updates. If you don't
                see the text, check your spam folder or wait a few minutes.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              <p>Having trouble? Contact {business.name} at:</p>
              {business.phone && (
                <p className="font-medium">{business.phone}</p>
              )}
              {business.email && <p>{business.email}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SmsSignupPage;
