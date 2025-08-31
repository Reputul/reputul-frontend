// src/pages/AccountBillingPage.jsx - Updated to match your app's design system
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billingApi, handleBillingError } from '../api/billingApi';

const AccountBillingPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Check for checkout success
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      setSuccess('🎉 Subscription activated successfully! Welcome to Reputul.');
      // Clean URL
      navigate('/account/billing', { replace: true });
    }

    loadSubscriptionInfo();
  }, [token, searchParams, navigate]);

  const loadSubscriptionInfo = async () => {
    setError('');
    setLoading(true);

    try {
      const info = await billingApi.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (err) {
      setError(handleBillingError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setError('');
    setActionLoading('portal');

    try {
      const portalUrl = await billingApi.createBillingPortalSession();
      window.location.href = portalUrl;
    } catch (err) {
      setError(handleBillingError(err));
      setActionLoading(null);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'TRIALING': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'PAST_DUE': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'CANCELED': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getUsageColor = (current, limit) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'text-red-400 bg-red-500/20';
    if (percentage >= 75) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const renderSubscriptionCard = () => {
    const sub = subscriptionInfo.subscription;
    
    if (!sub.hasSubscription) {
      return (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-dashed border-white/30 text-center">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            No Active Subscription
          </h3>
          <p className="text-blue-200 mb-6 max-w-md mx-auto">
            Choose a plan to start managing your business reputation and unlock all features
          </p>
          <button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-primary-500 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View Plans
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Current Subscription
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                {sub.plan || 'Unknown'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border backdrop-blur-sm ${getStatusColor(sub.status)}`}>
                {sub.status}
              </span>
            </div>
          </div>
          <button
            onClick={handleBillingPortal}
            disabled={actionLoading === 'portal'}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 disabled:opacity-50 hover:scale-105"
          >
            {actionLoading === 'portal' ? 'Loading...' : 'Manage Billing'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-blue-200 text-sm mb-1">Next Billing Date</p>
            <p className="text-white font-bold text-lg">{formatDate(sub.currentPeriodEnd)}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <p className="text-blue-200 text-sm mb-1">Monthly Cost</p>
            <p className="text-white font-bold text-lg">${sub.amount || 0}</p>
          </div>
        </div>

        {sub.status === 'TRIALING' && (
          <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
                <span className="text-blue-400 text-lg">🎉</span>
              </div>
              <p className="text-blue-200">
                You're currently on a free trial until {formatDate(sub.currentPeriodEnd)}
              </p>
            </div>
          </div>
        )}

        {sub.status === 'PAST_DUE' && (
          <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500/30 rounded-full flex items-center justify-center">
                <span className="text-yellow-400 text-lg">⚠️</span>
              </div>
              <p className="text-yellow-200">
                Payment failed. Please update your payment method to continue service.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUsageCard = () => {
    const usage = subscriptionInfo.usage;
    
    if (!usage.hasBusiness) {
      return (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-dashed border-white/30 text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            No Business Profile
          </h3>
          <p className="text-blue-200 mb-6 max-w-md mx-auto">
            Create a business profile to start tracking usage and managing your reputation
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
          >
            Create Business →
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">
          Current Usage
        </h3>

        <div className="space-y-6">
          {/* Customers */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-semibold">Customers</span>
              <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getUsageColor(usage.customers, usage.maxCustomers)}`}>
                {usage.customers} / {usage.maxCustomers}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((usage.customers / usage.maxCustomers) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* SMS Messages */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-semibold">SMS Messages (This Month)</span>
              <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getUsageColor(usage.smsThisMonth || 0, usage.smsIncluded)}`}>
                {usage.smsThisMonth || 0} / {usage.smsIncluded} included
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((usage.smsThisMonth || 0) / usage.smsIncluded) * 100, 100)}%` }}
              ></div>
            </div>
            {usage.smsThisMonth > usage.smsIncluded && (
              <p className="text-blue-200 text-sm mt-2">
                Additional: {usage.smsThisMonth - usage.smsIncluded} messages at $0.02 each
              </p>
            )}
          </div>

          {/* Review Requests */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-semibold">Review Requests (This Month)</span>
              <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getUsageColor(usage.reviewRequestsThisMonth || 0, usage.maxReviewRequests)}`}>
                {usage.reviewRequestsThisMonth || 0} / {usage.maxReviewRequests}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((usage.reviewRequestsThisMonth || 0) / usage.maxReviewRequests) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-blue-200">Need more capacity?</span>
            <button
              onClick={handleUpgrade}
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              Upgrade Plan →
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-600/10 to-indigo-600/10"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-white/20 rounded-2xl w-1/3 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-80 bg-white/20 rounded-3xl"></div>
              <div className="h-80 bg-white/20 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-600/10 to-indigo-600/10"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-2 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Account & Billing
          </h1>
          <p className="text-blue-200 mt-2">
            Manage your subscription, usage, and billing preferences
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <p className="text-green-200">{success}</p>
              <button
                onClick={() => setSuccess('')}
                className="text-green-400 hover:text-green-300 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <p className="text-red-200">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Subscription Card */}
          {renderSubscriptionCard()}

          {/* Usage Card */}
          {subscriptionInfo && renderUsageCard()}
        </div>

        {/* Usage History */}
        {subscriptionInfo?.usageHistory && subscriptionInfo.usageHistory.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Usage History (Last 6 Months)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/10 backdrop-blur-sm rounded-2xl">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200 uppercase tracking-wider">
                      SMS Messages
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200 uppercase tracking-wider">
                      Review Requests
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {subscriptionInfo.usageHistory.map((record, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">
                        {record.month}
                      </td>
                      <td className="px-6 py-4 text-blue-200">
                        {record.smsMessages || 0}
                      </td>
                      <td className="px-6 py-4 text-blue-200">
                        {record.reviewRequests || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6">
            Need Help?
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-bold mb-3">Contact Support</h4>
              <p className="text-blue-200 text-sm mb-4">
                We're here to help with any billing questions or technical issues.
              </p>
              <a
                href="mailto:support@reputul.com"
                className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors"
              >
                support@reputul.com →
              </a>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-bold mb-3">Documentation</h4>
              <p className="text-blue-200 text-sm mb-4">
                Learn more about billing, plan features, and best practices.
              </p>
              <a
                href="#"
                className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors"
              >
                View Docs →
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
};

export default AccountBillingPage;