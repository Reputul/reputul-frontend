// src/pages/CheckoutPages.jsx - Updated to match your app's design system
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const CheckoutSuccessPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Redirect to billing page with session_id for success message
          const sessionId = searchParams.get('session_id');
          navigate(`/account/billing${sessionId ? `?session_id=${sessionId}` : ''}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token, navigate, searchParams]);

  const handleContinue = () => {
    const sessionId = searchParams.get('session_id');
    navigate(`/account/billing${sessionId ? `?session_id=${sessionId}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-600/10 to-teal-600/10"></div>
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-5"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <div className="w-2 h-2 bg-green-400/30 rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-lg w-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center shadow-2xl">
        {/* Success Icon with animation */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
          Welcome to Reputul! 
        </h1>
        <p className="text-green-200 mb-8 leading-relaxed">
          Your subscription has been activated successfully. You can now start managing your business reputation and collecting reviews.
        </p>

        {/* Benefits */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <h3 className="font-bold text-white mb-4">What's Next?</h3>
          <ul className="text-green-200 space-y-2 text-left">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Set up your business profile</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Import your customer list</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Send your first review requests</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Configure review platforms</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white py-4 px-6 rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View Billing Dashboard
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Auto-redirect notice */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <p className="text-green-300 text-sm">
            Automatically redirecting in {countdown} seconds...
          </p>
        </div>
      </div>

      <style>
        {`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        `}
      </style>
    </div>
  );
};

// src/pages/CheckoutErrorPage.jsx
export const CheckoutErrorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const error = searchParams.get('error') || 'payment_failed';
  const message = searchParams.get('message') || 'There was an issue processing your payment.';

  const getErrorDetails = (errorType) => {
    switch (errorType) {
      case 'payment_failed':
        return {
          title: 'Payment Failed',
          description: 'Your payment could not be processed. Please check your payment method and try again.',
          icon: (
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'canceled':
        return {
          title: 'Checkout Canceled',
          description: 'You canceled the checkout process. No charges were made to your account.',
          icon: (
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'invalid_session':
        return {
          title: 'Invalid Session',
          description: 'The checkout session has expired or is invalid. Please try again with a new session.',
          icon: (
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      default:
        return {
          title: 'Checkout Error',
          description: message,
          icon: (
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-rose-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-rose-600/10 to-pink-600/10"></div>
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-5"></div>

      <div className="relative z-10 max-w-lg w-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center shadow-2xl">
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-red-500/30">
          {errorDetails.icon}
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
          {errorDetails.title}
        </h1>
        <p className="text-red-200 mb-8 leading-relaxed">
          {errorDetails.description}
        </p>

        {/* Help Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <h3 className="font-bold text-white mb-4">What can you do?</h3>
          <ul className="text-red-200 space-y-2 text-left text-sm">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Check that your payment method is valid</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Ensure you have sufficient funds</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Try a different payment method</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Contact your bank if the issue persists</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-primary-500 via-purple-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Contact Support */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-blue-200 text-sm mb-3">Need help?</p>
          <a
            href="mailto:support@reputul.com?subject=Checkout Error"
            className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors group"
          >
            <span>Contact Support</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

// Combined export for easier importing
const CheckoutPages = {
  Success: CheckoutSuccessPage,
  Error: CheckoutErrorPage
};

export default CheckoutPages;