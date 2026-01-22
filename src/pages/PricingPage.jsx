// src/pages/PricingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billingApi, handleBillingError } from '../api/billingApi';
import { Check, Zap, Building2, MessageSquare, Star } from 'lucide-react';

const PricingPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState(searchParams.get('promo') || '');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  // Updated Plan Data matching your backend
  const plans = [
    {
      id: 'SOLO',
      name: 'Solo',
      price: 59,
      description: 'Essential tools for independent pros.',
      highlight: false,
      limits: {
        locations: '1 Location',
        sms: '100 SMS / mo',
        requests: '100 Requests / mo'
      },
      features: [
        'Google & Facebook Integration',
        'Website Review Widget',
        'Basic Analytics',
        'Email Support'
      ]
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: 99,
      description: 'Power features for growing teams.',
      highlight: true,
      tag: 'Most Popular',
      limits: {
        locations: '3 Locations',
        sms: '300 SMS / mo',
        requests: '500 Requests / mo'
      },
      features: [
        'Everything in Solo, plus:',
        'AI-Powered Review Responses',
        'Team Collaboration (5 Users)',
        'Advanced Insights',
        'Priority Email Support'
      ]
    },
    {
      id: 'GROWTH',
      name: 'Growth',
      price: 149,
      description: 'Maximum scale for established brands.',
      highlight: false,
      limits: {
        locations: '10 Locations',
        sms: '1,000 SMS / mo',
        requests: '2,000 Requests / mo'
      },
      features: [
        'Everything in Pro, plus:',
        'Automated Review Campaigns',
        'Team Collaboration (20 Users)',
        'White-label Options',
        'Dedicated Account Manager',
        'API Access'
      ]
    }
  ];

  useEffect(() => {
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
      navigate(`/login?redirect=${encodeURIComponent(`/pricing?plan=${planId}${promoCode ? `&promo=${promoCode}` : ''}`)}`);
      return;
    }

    setError('');
    setLoading(true);
    setSelectedPlan(planId);

    try {
      const checkoutUrl = await billingApi.createCheckoutSession(planId, promoCode);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(handleBillingError(err));
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

  const isCurrentPlan = (planId) => {
    return subscriptionInfo?.subscription?.hasSubscription && 
           subscriptionInfo?.subscription?.plan === planId;
  };

  const getButtonText = (planId) => {
    if (loading && selectedPlan === planId) return 'Processing...';
    if (isCurrentPlan(planId)) return 'Current Plan';
    if (subscriptionInfo?.subscription?.hasSubscription) return 'Switch Plan';
    return 'Start 14-Day Free Trial';
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            Simple pricing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">serious growth</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Start collecting more reviews today. All plans include a 14-day free trial. 
            No hidden fees, cancel anytime.
          </p>

          {/* Promo Code & Beta Status */}
          <div className="flex flex-col items-center gap-4">
            {/* Beta Badge */}
            {subscriptionInfo?.subscription?.isBetaTester && (
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
                  <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
                  <span>Beta Tester Access Active</span>
               </div>
            )}

            {/* Existing Sub Management */}
            {subscriptionInfo?.subscription?.hasSubscription && !subscriptionInfo?.subscription?.isBetaTester && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2">
                 <span className="text-slate-300 text-sm">Current Plan: <span className="text-white font-semibold">{subscriptionInfo.subscription.plan}</span></span>
                 <div className="h-4 w-px bg-white/10"></div>
                 <button onClick={handleBillingPortal} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Manage Billing</button>
              </div>
            )}

            {/* Promo Input */}
            {!subscriptionInfo?.subscription?.hasSubscription && (
              <div className="relative group">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Have a promo code?"
                  className="bg-white/5 border border-white/10 text-white px-4 py-2 pr-10 rounded-full text-sm w-48 focus:w-64 transition-all duration-300 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 placeholder-slate-500 text-center focus:text-left"
                />
                {promoCode && <Check className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />}
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm inline-block">
              {error}
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`
                relative rounded-3xl p-8 transition-all duration-300
                ${plan.highlight 
                  ? 'bg-slate-800/80 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 z-10' 
                  : 'bg-slate-900/60 border border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                }
                backdrop-blur-xl flex flex-col h-full
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                    {plan.tag}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline">
                <span className="text-4xl font-bold text-white">$</span>
                <span className={`text-5xl font-extrabold tracking-tight ${plan.highlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200' : 'text-white'}`}>
                  {plan.price}
                </span>
                <span className="text-slate-400 ml-2 font-medium">/month</span>
              </div>

              {/* Key Limits - Highlighted */}
              <div className="bg-white/5 rounded-xl p-4 mb-8 space-y-3">
                <div className="flex items-center gap-3 text-slate-200">
                  <MessageSquare className={`w-5 h-5 ${plan.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="font-semibold">{plan.limits.sms}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <Zap className={`w-5 h-5 ${plan.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="font-medium">{plan.limits.requests}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <Building2 className={`w-5 h-5 ${plan.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="font-medium">{plan.limits.locations}</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <div className="mt-0.5 min-w-[18px]">
                      <Check className={`w-4.5 h-4.5 ${plan.highlight ? 'text-green-400' : 'text-slate-500'}`} />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleStartCheckout(plan.id)}
                disabled={loading || isCurrentPlan(plan.id)}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-200
                  ${isCurrentPlan(plan.id) 
                    ? 'bg-white/10 text-slate-400 cursor-default'
                    : plan.highlight
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                      : 'bg-white text-slate-900 hover:bg-slate-50'
                  }
                  ${loading && selectedPlan === plan.id ? 'opacity-70 cursor-wait' : ''}
                `}
              >
                {getButtonText(plan.id)}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">What happens if I go over my SMS limit?</h3>
              <p className="text-slate-400 leading-relaxed">
                We'll notify you when you reach 80% and 100% of your limit. You can upgrade to the next plan tier instantly to increase your allowance, or wait for your counter to reset next month.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Do unused SMS roll over?</h3>
              <p className="text-slate-400 leading-relaxed">
                No, SMS allowances reset at the start of each billing cycle. This helps us keep our monthly pricing simple and affordable.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Is email really unlimited?</h3>
              <p className="text-slate-400 leading-relaxed">
                Yes! You can send as many email review requests as you need on all plans. We believe in helping you grow without limits.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Can I cancel anytime?</h3>
              <p className="text-slate-400 leading-relaxed">
                Absolutely. There are no contracts. You can cancel your subscription from your dashboard at any time, effective at the end of your current billing period.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default PricingPage;