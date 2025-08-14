import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ErrorPage = ({ 
  errorType = '404', 
  title = "Page Not Found", 
  message = "The page you're looking for doesn't exist.",
  showHomeButton = true,
  showBackButton = true 
}) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  // Auto-redirect countdown
  useEffect(() => {
    if (!autoRedirect) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate(token ? '/dashboard' : '/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, navigate, token]);

  const getErrorConfig = () => {
    switch (errorType) {
      case '404':
        return {
          code: '404',
          title: 'Page Not Found',
          message: "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.",
          icon: (
            <svg className="w-24 h-24 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          suggestions: [
            'Check the URL for typos',
            'Go back to the previous page',
            'Visit our homepage',
            'Contact support if the problem persists'
          ]
        };
      case '500':
        return {
          code: '500',
          title: 'Server Error',
          message: "Something went wrong on our end. We're working hard to fix this issue. Please try again in a few moments.",
          icon: (
            <svg className="w-24 h-24 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          suggestions: [
            'Refresh the page',
            'Try again in a few minutes',
            'Check your internet connection',
            'Contact our support team'
          ]
        };
      case '403':
        return {
          code: '403',
          title: 'Access Denied',
          message: "You don't have permission to access this resource. Please check your credentials or contact an administrator.",
          icon: (
            <svg className="w-24 h-24 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          suggestions: [
            'Check your login credentials',
            'Contact your administrator',
            'Try logging out and back in',
            'Request access permissions'
          ]
        };
      case 'maintenance':
        return {
          code: '🔧',
          title: 'Under Maintenance',
          message: "We're currently performing scheduled maintenance to improve your experience. We'll be back online shortly.",
          icon: (
            <svg className="w-24 h-24 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          suggestions: [
            'Check back in a few minutes',
            'Follow us on social media for updates',
            'Contact support for urgent matters',
            'Subscribe to status updates'
          ]
        };
      default:
        return {
          code: errorType,
          title: title,
          message: message,
          icon: (
            <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          suggestions: [
            'Try refreshing the page',
            'Go back to the previous page',
            'Return to homepage',
            'Contact support for help'
          ]
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Enhanced Logo */}
          <div className="flex justify-center mb-12 animate-fade-in-up">
            <Link to={token ? "/dashboard" : "/"} className="group flex items-center space-x-4 transition-all duration-300 hover:scale-105">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-4 rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                  <span className="text-white font-black text-3xl">R</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl"></div>
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white tracking-tight">
                  Reputul
                </div>
                <div className="text-sm text-blue-200 -mt-1 font-medium">
                  Reputation Management
                </div>
              </div>
            </Link>
          </div>

          {/* Main Error Content */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 lg:p-16 text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            
            {/* Error Icon and Code */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-xl group-hover:scale-105 transition-all duration-300">
                  {config.icon}
                </div>
              </div>
            </div>

            {/* Error Code */}
            <div className="mb-6">
              <h1 className="text-8xl lg:text-9xl font-black text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text mb-4 tracking-tight">
                {config.code}
              </h1>
            </div>

            {/* Error Title and Message */}
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {config.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {config.message}
              </p>
            </div>

            {/* Auto-redirect Notice */}
            {autoRedirect && (
              <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-primary-200 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
                  <span className="text-blue-800 font-medium">
                    Redirecting to {token ? 'dashboard' : 'homepage'} in {countdown} seconds
                  </span>
                  <button
                    onClick={() => setAutoRedirect(false)}
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              {showHomeButton && (
                <Link
                  to={token ? "/dashboard" : "/"}
                  className="group bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center justify-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Go to {token ? 'Dashboard' : 'Homepage'}</span>
                </Link>
              )}
              
              {showBackButton && (
                <button
                  onClick={() => navigate(-1)}
                  className="group bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Go Back</span>
                </button>
              )}
            </div>

            {/* Helpful Suggestions */}
            <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <h3 className="text-xl font-bold text-gray-900 mb-6">What can you do?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {config.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors group">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2 group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 animate-fade-in-up" style={{animationDelay: '1s'}}>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="bg-green-100 rounded-xl p-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-green-900">Need Help?</h4>
              </div>
              <p className="text-green-800 mb-4">
                If you continue to experience issues, our support team is here to help you get back on track.
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Contact Support
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-8 animate-fade-in-up" style={{animationDelay: '1.2s'}}>
            <p className="text-blue-200 text-sm">
              Error occurred at {new Date().toLocaleString()} • 
              <button 
                onClick={() => window.location.reload()} 
                className="hover:text-white underline ml-1"
              >
                Refresh Page
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Specific Error Page Components
export const NotFoundPage = () => (
  <ErrorPage 
    errorType="404"
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
  />
);

export const ServerErrorPage = () => (
  <ErrorPage 
    errorType="500"
    title="Server Error" 
    message="Something went wrong on our end. We're working to fix this issue."
  />
);

export const ForbiddenPage = () => (
  <ErrorPage 
    errorType="403"
    title="Access Denied"
    message="You don't have permission to access this resource."
  />
);

export const MaintenancePage = () => (
  <ErrorPage 
    errorType="maintenance"
    title="Under Maintenance"
    message="We're currently performing scheduled maintenance. We'll be back online shortly."
    showBackButton={false}
  />
);

export default ErrorPage;