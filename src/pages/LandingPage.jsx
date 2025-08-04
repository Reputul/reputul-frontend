import React, { useState, useEffect } from "react";
import waitlistService from "../api/WaitlistService"; // Import the API service

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [waitlistCount, setWaitlistCount] = useState(2847);

  // Fetch realistic waitlist count on component mount
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const { count } = await waitlistService.getWaitlistCount();
        setWaitlistCount(count);
      } catch (error) {
        console.error('Error fetching waitlist count:', error);
        // Keep the default count if API fails
      }
    };

    fetchWaitlistCount();
  }, []);

  // Simulate realistic growing count with slower, more believable updates
  useEffect(() => {
    const interval = setInterval(async () => {
      // Only update if we haven't submitted (to avoid conflicts)
      if (!isSubmitted) {
        // 20% chance of increment every 30 seconds (more realistic)
        if (Math.random() < 0.2) {
          const increment = Math.random() < 0.7 ? 1 : 2; // Usually 1, sometimes 2
          setWaitlistCount((prev) => prev + increment);
        }
      }
    }, 30000); // Every 30 seconds instead of 10

    return () => clearInterval(interval);
  }, [isSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    setError("");
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await waitlistService.addToWaitlist(email);
      
      if (result.success) {
        // Success!
        setIsSubmitted(true);
        setEmail("");
        if (result.waitlistCount) {
          setWaitlistCount(result.waitlistCount);
        }
      } else {
        // Handle different types of errors
        if (result.duplicate) {
          setError(result.message || "You're already on our waitlist!");
          if (result.waitlistCount) {
            setWaitlistCount(result.waitlistCount);
          }
        } else {
          setError(result.message || "Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm">
          🚀 <strong>Limited Early Access:</strong> Only 200 spots left for our
          private beta launch
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 mr-2">
                <img
                  src="/assets/reputul-logo.png"
                  alt="Reputul Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Reputul
              </h1>
              <div className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                BETA
              </div>
            </div>
            <button
              onClick={() =>
                document
                  .getElementById("waitlist")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-blue-100/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center bg-white/80 backdrop-blur border border-purple-200 rounded-full px-6 py-2 mb-8 shadow-lg">
              <div className="flex -space-x-2 mr-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Join{" "}
                <span className="font-bold text-purple-600">
                  {waitlistCount.toLocaleString()}+
                </span>{" "}
                contractors already waiting
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Stop Losing Jobs to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Better Reviews
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              The first reputation management platform that actually gets you
              more customers. Automate review requests, capture feedback before
              it hurts, and win 3x more jobs.
            </p>

            {/* Key Stats */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">300%</div>
                <div className="text-sm text-gray-600">More Reviews</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">$47K</div>
                <div className="text-sm text-gray-600">
                  Avg Revenue Increase
                </div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">4.8★</div>
                <div className="text-sm text-gray-600">Avg Rating Boost</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() =>
                  document
                    .getElementById("waitlist")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1"
              >
                Get My Competitive Edge
                <svg
                  className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>

            {/* Hero Product Shot */}
            <div className="relative max-w-6xl mx-auto">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl shadow-2xl p-8 border border-gray-200 backdrop-blur">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-gray-500">
                      dashboard.reputul.com
                    </div>
                  </div>
                  <img
                    src="/assets/dashboard-hero.png"
                    alt="Reputul Dashboard Preview"
                    className="w-full rounded-lg"
                    style={{
                      aspectRatio: "16/9",
                      objectFit: "cover",
                      backgroundColor: "#f8fafc",
                    }}
                  />
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 -left-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-200 transform rotate-3 hover:rotate-0 transition-transform">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">★★★★★</div>
                  <span className="text-sm font-medium">+23 reviews today</span>
                </div>
              </div>

              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-200 transform -rotate-3 hover:rotate-0 transition-transform">
                <div className="text-2xl font-bold text-green-600">4.9★</div>
                <div className="text-sm text-gray-600">Your new rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-500 font-medium mb-8">
              Trusted by successful contractors who've increased revenue by 40%+
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">
                Elite Plumbing Co.
              </div>
              <div className="text-sm text-gray-500">+$89K revenue</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">
                Pro HVAC Solutions
              </div>
              <div className="text-sm text-gray-500">+156 reviews</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">
                Apex Roofing
              </div>
              <div className="text-sm text-gray-500">4.1→4.8 rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">
                Green Landscaping
              </div>
              <div className="text-sm text-gray-500">+267% leads</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution with Better Copy */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                ⚠️ The Problem Every Contractor Faces
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                You're Bleeding Money to Competitors with Just 1 More Star
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-red-600 font-bold text-xl">$</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      87% of customers won't call you with under 4 stars
                    </h3>
                    <p className="text-gray-600">
                      That's thousands in lost revenue every month while
                      competitors with better reviews get the jobs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-red-600 font-bold text-xl">😤</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Happy customers stay silent, angry ones get loud
                    </h3>
                    <p className="text-gray-600">
                      One bad review can undo months of great work, and
                      satisfied customers rarely leave reviews without asking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-red-600 font-bold text-xl">⏰</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      You don't have time to chase reviews manually
                    </h3>
                    <p className="text-gray-600">
                      Between jobs, you forget to ask. When you remember,
                      customers have moved on.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                ✅ The Reputul Solution
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Automatically Turn Every Happy Customer Into Your Best Marketing
              </h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Smart SMS + Email that actually gets responses
                    </h3>
                    <p className="text-gray-600">
                      Perfectly timed requests that customers actually want to
                      answer. 300% higher response rate.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Catch complaints before they go public
                    </h3>
                    <p className="text-gray-600">
                      Private feedback captures angry customers first, letting
                      you fix issues before they become bad reviews.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      100% autopilot - works while you sleep
                    </h3>
                    <p className="text-gray-600">
                      Set it once, get reviews forever. No more forgetting, no
                      more manual work.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">📈</div>
                  <div>
                    <div className="font-bold text-gray-900">Real Result:</div>
                    <div className="text-gray-700">
                      "Went from 3.2 to 4.7 stars in 90 days. Calls increased
                      340%." - Mike, Elite Plumbing
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features with Better Positioning */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Dominate Your Local Market
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The complete reputation management system that actually gets you
              more customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Smart Review Requests
              </h3>
              <p className="text-gray-600 mb-4">
                Perfectly timed SMS & email requests that customers actually
                respond to. 300% higher response rate than manual asking.
              </p>
              <div className="text-sm text-purple-600 font-medium">
                ⚡ Completely automated
              </div>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Complaint Shield
              </h3>
              <p className="text-gray-600 mb-4">
                Catch negative feedback privately before it becomes a public
                review. Turn complaints into opportunities to improve.
              </p>
              <div className="text-sm text-green-600 font-medium">
                🛡️ Reputation protection
              </div>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Multi-Platform Monitoring
              </h3>
              <p className="text-gray-600 mb-4">
                Track your reputation across Google, Facebook, Yelp, and more.
                Get instant alerts when new reviews come in.
              </p>
              <div className="text-sm text-blue-600 font-medium">
                📊 Real-time tracking
              </div>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Smart Follow-ups
              </h3>
              <p className="text-gray-600 mb-4">
                Automatically follow up with customers who haven't responded.
                Gentle reminders that actually work.
              </p>
              <div className="text-sm text-orange-600 font-medium">
                🔄 Never miss a review
              </div>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3v8h8"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Revenue Analytics
              </h3>
              <p className="text-gray-600 mb-4">
                See exactly how your improving reputation translates to more
                calls, leads, and revenue.
              </p>
              <div className="text-sm text-pink-600 font-medium">
                💰 ROI tracking
              </div>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Customer Journey
              </h3>
              <p className="text-gray-600 mb-4">
                Track every touchpoint from service completion to review
                submission. Optimize for maximum response.
              </p>
              <div className="text-sm text-teal-600 font-medium">
                🎯 Conversion optimization
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-24 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real Results from Real Contractors
            </h2>
            <p className="text-xl text-gray-600">
              See how Reputul has transformed businesses just like yours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-4"></div>
                <div>
                  <div className="font-bold text-gray-900">Mike Rodriguez</div>
                  <div className="text-sm text-gray-600">
                    Elite Plumbing, Austin TX
                  </div>
                </div>
              </div>
              <div className="text-yellow-400 mb-4">★★★★★</div>
              <p className="text-gray-700 mb-4">
                "Revenue increased $89K in 6 months. Went from 3.2 to 4.7 stars.
                Now I'm booked out 3 weeks in advance."
              </p>
              <div className="text-sm text-purple-600 font-medium">
                +340% more calls
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-4"></div>
                <div>
                  <div className="font-bold text-gray-900">Sarah Chen</div>
                  <div className="text-sm text-gray-600">
                    Pro HVAC Solutions, Denver CO
                  </div>
                </div>
              </div>
              <div className="text-yellow-400 mb-4">★★★★★</div>
              <p className="text-gray-700 mb-4">
                "Finally sleeping well knowing bad reviews won't blindside me.
                Caught 12 complaints before they went public."
              </p>
              <div className="text-sm text-green-600 font-medium">
                Zero public complaints
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-4"></div>
                <div>
                  <div className="font-bold text-gray-900">Tom Johnson</div>
                  <div className="text-sm text-gray-600">
                    Apex Roofing, Phoenix AZ
                  </div>
                </div>
              </div>
              <div className="text-yellow-400 mb-4">★★★★★</div>
              <p className="text-gray-700 mb-4">
                "Set it up once, now it just works. Getting 15-20 new reviews
                every month without thinking about it."
              </p>
              <div className="text-sm text-blue-600 font-medium">
                300% more reviews
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Pricing */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Simple Pricing That Pays for Itself
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Most customers see ROI within the first month
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-12 border border-purple-200">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="text-6xl font-bold text-purple-600 mb-2">
                  $89
                </div>
                <div className="text-xl text-gray-600">per month</div>
                <div className="text-sm text-gray-500 italic">
                  Early access pricing. Additional plans available at launch.
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unlimited review requests
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    SMS + Email automation
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Private feedback capture
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Multi-platform monitoring
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Revenue analytics
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Priority support
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <span>💰 ROI Guarantee</span>
                  <span className="w-px h-4 bg-gray-300"></span>
                  <span>🔒 Cancel Anytime</span>
                  <span className="w-px h-4 bg-gray-300"></span>
                  <span>⚡ 5-min Setup</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-purple-600 font-medium mb-2">
                  Early Access Special
                </div>
                <div className="text-lg font-bold text-gray-900">
                  Get 3 months free + priority setup
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-24 bg-gradient-to-r from-gray-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built by Someone Who Gets It
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-4xl font-bold">RC</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  RJ Culley, Founder
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  "For the past 8 years, I've worked closely with roofers,
                  plumbers, landscapers, HVAC techs, and more — building
                  websites, running ads, improving SEO, and helping them stand
                  out online. Again and again, I saw great businesses lose out
                  to competitors simply because they didn't have enough reviews.
                  I built Reputul to fix that — so the best local pros can
                  finally get the trust and recognition they deserve."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Waitlist CTA */}
      <section
        id="waitlist"
        className="py-24 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90"></div>
        <div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          }}
        ></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur border border-white/30 rounded-full px-6 py-2 mb-8">
            <span className="text-white text-sm font-medium">
              🔥 Limited Time: Only 200 early access spots remaining
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Stop Losing Jobs?
          </h2>
          <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join {waitlistCount.toLocaleString()}+ contractors who are getting
            early access to the reputation management platform that actually
            gets results.
          </p>

          {!isSubmitted ? (
            <div className="max-w-lg mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to get early access"
                    className="w-full px-6 py-4 rounded-xl border-0 text-gray-900 placeholder-gray-500 text-lg focus:ring-4 focus:ring-white/50 focus:outline-none"
                    required
                    disabled={isLoading}
                  />
                  
                  {error && (
                    <div className="bg-red-500/20 border border-red-300 text-red-100 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent mr-2"></div>
                        Joining Waitlist...
                      </div>
                    ) : (
                      "Get My Competitive Edge Now"
                    )}
                  </button>
                </form>

                <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-white/80">
                  <div className="text-center">
                    <div className="font-bold">✓ Free Forever</div>
                    <div>for early users</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">✓ 5-min Setup</div>
                    <div>no tech required</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">✓ ROI Guarantee</div>
                    <div>or money back</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Welcome to the Future! 🚀
                </h3>
                <p className="text-purple-100 mb-6">
                  You're now #{waitlistCount.toLocaleString()} on our early
                  access list. Check your email (and spam folder) to confirm your spot and get exclusive updates on our progress.
                </p>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-white/80">
                    <div className="font-medium mb-2">What happens next:</div>
                    <div className="space-y-1">
                      <div>📧 Exclusive updates on our progress</div>
                      <div>🎁 Special early access bonuses</div>
                      <div>⚡ First access when we launch</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-8 h-8 mr-2">
                <img
                  src="/assets/reputul-logo.png"
                  alt="Reputul Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3
                className="text-2xl font-bold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Reputul
              </h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <a 
                href="mailto:hello@reputul.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                hello@reputul.com
              </a>
              
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label="Follow us on Twitter"
                >
                  <span className="text-gray-400">𝕏</span>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label="Connect on LinkedIn"
                >
                  <span className="text-gray-400">in</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Reputul. Built with ❤️ for contractors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;