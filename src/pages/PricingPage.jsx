// src/pages/PricingPage.jsx - Updated to match your app's design system
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billingApi, handleBillingError } from '../api/billingApi';

const PricingPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState(searchParams.get('promo') || '');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  // Plan data matching backend configuration
  const plans = [
    {
      id: 'SOLO',
      name: 'Solo',
      price: 39,
      description: 'Perfect for individual contractors',
      features: [
        'Up to 100 customers',
        '500 review requests/month',
        'Email + SMS automation',
        'Google Reviews integration',
        'Basic reputation score',
        'Public profile page',
        '50 SMS messages included'
      ],
      popular: false
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: 89,
      description: 'Most popular for growing businesses',
      features: [
        'Up to 500 customers',
        '2,000 review requests/month',
        'All Solo features',
        'Facebook & Yelp integration',
        'Advanced analytics',
        'Custom email templates',
        'Badge widgets',
        '200 SMS messages included',
        'Priority support'
      ],
      popular: true
    },
    {
      id: 'GROWTH',
      name: 'Growth',
      price: 149,
      description: 'For established businesses',
      features: [
        'Up to 2,000 customers',
        '10,000 review requests/month',
        'All Pro features',
        'API access',
        'White-label options',
        'Advanced reporting',
        'Multi-location support',
        '500 SMS messages included',
        'Dedicated support'
      ],
      popular: false
    }
  ];

  useEffect(() => {
    // Load current subscription info if user is logged in
    if (token) {
      loadSubscriptionInfo();
    }
  }, [token]);

  const loadSubscriptionInfo = async () => {
    try {
      const info = await billingApi.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (err) {
      console.warn('Could not load subscription info:', err.message);
    }
  };

  const handleStartCheckout = async (planId) => {
    if (!token) {
      // Redirect to login with return path
      navigate(`/login?redirect=${encodeURIComponent(`/pricing?plan=${planId}${promoCode ? `&promo=${promoCode}` : ''}`)}`);
      return;
    }

    setError('');
    setLoading(true);
    setSelectedPlan(planId);

    try {
      const checkoutUrl = await billingApi.createCheckoutSession(planId, promoCode);
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(handleBillingError(err));
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleBillingPortal = async () => {
    setError('');
    setLoading(true);

    try {
      const portalUrl = await billingApi.createBillingPortalSession();
      window.location.href = portalUrl;
    } catch (err) {
      setError(handleBillingError(err));
      setLoading(false);
    }
  };

  const getPlanButtonText = (planId) => {
    if (loading && selectedPlan === planId) {
      return 'Loading...';
    }
    
    if (subscriptionInfo?.subscription?.hasSubscription) {
      const currentPlan = subscriptionInfo.subscription.plan;
      if (currentPlan === planId) {
        return 'Current Plan';
      }
      // Determine if upgrade or downgrade
      const planOrder = ['SOLO', 'PRO', 'GROWTH'];
      const currentIndex = planOrder.indexOf(currentPlan);
      const targetIndex = planOrder.indexOf(planId);
      
      if (targetIndex > currentIndex) {
        return 'Upgrade';
      } else if (targetIndex < currentIndex) {
        return 'Downgrade';
      }
    }
    
    return 'Get Started';
  };

  const isPlanDisabled = (planId) => {
    if (loading) return loading && selectedPlan !== planId;
    
    // Current plan is disabled
    if (subscriptionInfo?.subscription?.hasSubscription) {
      return subscriptionInfo.subscription.plan === planId;
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-600/10 to-indigo-600/10"></div>
      
      {/* Header */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8">
                <img
                  src="/assets/logos/reputul-logo.svg"
                  alt="Reputul Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight font-poppins">
                Reputul
              </h1>
            </div>
            {token ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white/80 hover:text-white font-semibold transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-white/80 hover:text-white font-semibold transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-primary-500 via-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
          </p>

          {/* Current Subscription Status */}
          {subscriptionInfo?.subscription?.hasSubscription && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 max-w-md mx-auto mb-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="text-sm">
                  <span className="text-blue-200">
                    Current Plan: <strong className="text-white">{subscriptionInfo.subscription.plan}</strong>
                  </span>
                  {subscriptionInfo.subscription.status === 'TRIALING' && (
                    <span className="ml-2 text-green-400 font-medium">
                      (Free Trial)
                    </span>
                  )}
                </div>
                <button
                  onClick={handleBillingPortal}
                  disabled={loading}
                  className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                >
                  Manage
                </button>
              </div>
            </div>
          )}

          {/* Promo Code Input */}
          <div className="max-w-sm mx-auto mb-8">
            <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Promo code"
                className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/60 focus:outline-none"
              />
              <button
                onClick={() => setPromoCode('')}
                className="px-4 py-3 text-white/60 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            {promoCode && (
              <p className="text-sm text-green-400 mt-2">
                Promo code applied: {promoCode}
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white/10 backdrop-blur-xl rounded-3xl border-2 transition-all duration-300 hover:scale-105 group ${
                plan.popular
                  ? 'border-primary-500 scale-105 shadow-2xl shadow-primary-500/20'
                  : 'border-white/20 hover:border-white/30 hover:shadow-2xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-500 via-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-blue-200 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-blue-200 ml-2">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-400 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-blue-100">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleStartCheckout(plan.id)}
                  disabled={isPlanDisabled(plan.id)}
                  className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
                    isPlanDisabled(plan.id)
                      ? 'bg-white/20 text-white/50 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-primary-500 via-purple-600 to-indigo-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 shadow-lg hover:shadow-xl border border-white/30'
                  }`}
                >
                  {getPlanButtonText(plan.id)}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="font-bold text-white mb-3">
                  What's included in the free trial?
                </h4>
                <p className="text-blue-200 text-sm">
                  Every plan includes a full 14-day free trial with access to all features. No credit card required to start.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="font-bold text-white mb-3">
                  Can I change plans anytime?
                </h4>
                <p className="text-blue-200 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes are prorated automatically.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="font-bold text-white mb-3">
                  How does SMS pricing work?
                </h4>
                <p className="text-blue-200 text-sm">
                  Each plan includes SMS messages. Additional messages are $0.02 each, automatically added to your bill.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="font-bold text-white mb-3">
                  Do you offer refunds?
                </h4>
                <p className="text-blue-200 text-sm">
                  Yes, we offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your first month.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="font-bold text-white mb-3">
                  Is my data secure?
                </h4>
                <p className="text-blue-200 text-sm">
                  Absolutely. We use enterprise-grade security and never share your customer data with third parties.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="font-bold text-white mb-3">
                  Need help choosing?
                </h4>
                <p className="text-blue-200 text-sm">
                  Contact us at support@reputul.com and we'll help you find the perfect plan for your business.
                </p>
              </div>
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
        `}
      </style>
    </div>
  );
};

export default PricingPage;