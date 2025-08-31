// src/components/subscription/SubscriptionStatus.jsx - Updated to match your app's design system
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingApi, handleBillingError } from '../../api/billingApi';

/**
 * Mini subscription status widget for navbar/header - matches your navbar styling
 */
export const SubscriptionStatusWidget = () => {
  const navigate = useNavigate();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      const info = await billingApi.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (err) {
      console.warn('Could not load subscription info:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'TRIALING': return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      case 'PAST_DUE': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'CANCELED': return 'bg-red-400/20 text-red-400 border-red-400/30';
      default: return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-20 bg-white/20 rounded-xl backdrop-blur-sm"></div>
      </div>
    );
  }

  if (!subscriptionInfo?.subscription?.hasSubscription) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className="bg-gradient-to-r from-primary-500 via-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Upgrade
      </button>
    );
  }

  const sub = subscriptionInfo.subscription;

  return (
    <div
      onClick={() => navigate('/account/billing')}
      className="cursor-pointer flex items-center space-x-3 group"
    >
      <div className={`px-3 py-1 rounded-xl text-sm font-bold border backdrop-blur-sm transition-all duration-300 group-hover:scale-105 ${getStatusColor(sub.status)}`}>
        {sub.plan}
      </div>
      {sub.status === 'TRIALING' && (
        <span className="text-blue-400 text-sm font-semibold">Trial</span>
      )}
      {sub.status === 'PAST_DUE' && (
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

/**
 * Usage limit warning component - matches your app's design system
 */
export const UsageLimitWarning = ({ businessId, action, onUpgrade }) => {
  const [entitlement, setEntitlement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId && action) {
      checkEntitlement();
    }
  }, [businessId, action]);

  const checkEntitlement = async () => {
    try {
      const result = await billingApi.checkEntitlement(businessId, action);
      setEntitlement(result);
    } catch (err) {
      console.error('Failed to check entitlement:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !entitlement) return null;

  if (entitlement.allowed) return null;

  return (
    <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4 mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-yellow-500/30 rounded-2xl flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-yellow-300 font-bold mb-2">
            Plan Limit Reached
          </h3>
          <p className="text-yellow-200 text-sm mb-4">
            {entitlement.message}
          </p>
          {(entitlement.upgradeUrl || onUpgrade) && (
            <button
              onClick={() => onUpgrade ? onUpgrade() : window.location.href = entitlement.upgradeUrl}
              className="bg-yellow-400/20 backdrop-blur-sm text-yellow-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-400/30 transition-all duration-300 border border-yellow-400/30"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Full subscription status card for dashboard - matches your app's design system
 */
export const SubscriptionCard = () => {
  const navigate = useNavigate();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      const info = await billingApi.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (err) {
      setError(handleBillingError(err));
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 animate-pulse">
        <div className="h-6 bg-white/20 rounded-2xl mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-white/20 rounded-xl w-3/4"></div>
          <div className="h-4 bg-white/20 rounded-xl w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
        <div className="text-center text-red-400">
          <p className="text-sm">{error}</p>
          <button
            onClick={loadSubscriptionInfo}
            className="mt-3 text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sub = subscriptionInfo?.subscription;

  if (!sub?.hasSubscription) {
    return (
      <div className="bg-gradient-to-br from-primary-500/10 via-purple-600/10 to-indigo-600/10 backdrop-blur-xl rounded-3xl p-8 border border-primary-500/30 text-center">
        <div className="w-16 h-16 bg-primary-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          Ready to Upgrade?
        </h3>
        <p className="text-blue-200 mb-6 text-sm max-w-sm mx-auto">
          Get access to all features and start growing your business reputation with advanced tools and analytics.
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="bg-gradient-to-r from-primary-500 via-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          View Plans
        </button>
      </div>
    );
  }

  const usage = subscriptionInfo.usage;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            Current Plan
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              {sub.plan}
            </span>
            <span className={`px-3 py-1 rounded-xl text-sm font-bold border backdrop-blur-sm ${getStatusColor(sub.status)}`}>
              {sub.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/account/billing')}
          className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors flex items-center space-x-1 group"
        >
          <span>Manage</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* Usage indicators */}
      {usage?.hasBusiness && (
        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-200">Customers</span>
              <span className="text-white font-semibold">{usage.customers} / {usage.maxCustomers}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((usage.customers / usage.maxCustomers) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-200">SMS This Month</span>
              <span className="text-white font-semibold">{usage.smsThisMonth || 0} / {usage.smsIncluded}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((usage.smsThisMonth || 0) / usage.smsIncluded) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {sub.status === 'TRIALING' && (
        <div className="mt-4 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
              <span className="text-blue-400 text-lg">🎉</span>
            </div>
            <p className="text-blue-200 text-sm">
              Free trial active until {new Date(sub.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {sub.status === 'PAST_DUE' && (
        <div className="mt-4 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500/30 rounded-full flex items-center justify-center">
              <span className="text-yellow-400 text-lg">⚠️</span>
            </div>
            <p className="text-yellow-200 text-sm">
              Payment issue - please update your payment method
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Default export for convenience (components are already exported above as named exports)
export default {
  Widget: SubscriptionStatusWidget,
  LimitWarning: UsageLimitWarning,
  Card: SubscriptionCard
};