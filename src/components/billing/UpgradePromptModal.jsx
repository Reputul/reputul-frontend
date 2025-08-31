// src/components/billing/UpgradePromptModal.jsx - Updated to match your app's design system
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingApi, handleBillingError } from '../../api/billingApi';

/**
 * Modal that shows when users hit plan limits - matches your app's sophisticated design
 * Can be triggered from anywhere in the app
 */
const UpgradePromptModal = ({ 
  isOpen, 
  onClose, 
  businessId, 
  action, 
  customMessage = null,
  showPlans = true 
}) => {
  const navigate = useNavigate();
  const [entitlement, setEntitlement] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (isOpen && businessId && action) {
      loadEntitlementInfo();
    }
  }, [isOpen, businessId, action]);

  const loadEntitlementInfo = async () => {
    try {
      setLoading(true);
      
      // Get entitlement check and subscription info in parallel
      const [entitlementResult, subscriptionInfo] = await Promise.all([
        billingApi.checkEntitlement(businessId, action),
        billingApi.getSubscriptionInfo()
      ]);

      setEntitlement(entitlementResult);
      setCurrentPlan(subscriptionInfo.subscription?.plan || 'FREE');
    } catch (error) {
      console.error('Failed to load entitlement info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setUpgrading(true);
    navigate('/pricing');
    onClose();
  };

  const handleViewBilling = () => {
    navigate('/account/billing');
    onClose();
  };

  const getActionDescription = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case 'create_customer': return 'add more customers';
      case 'send_sms': return 'send SMS messages';
      case 'send_email': return 'send email campaigns';
      case 'send_request': return 'send review requests';
      default: return 'perform this action';
    }
  };

  const getRecommendedPlans = (currentPlanType) => {
    const planOrder = ['SOLO', 'PRO', 'GROWTH'];
    const currentIndex = planOrder.indexOf(currentPlanType);
    
    return planOrder.slice(currentIndex + 1).map(planId => ({
      id: planId,
      name: planId.charAt(0) + planId.slice(1).toLowerCase(),
      price: planId === 'PRO' ? 89 : planId === 'GROWTH' ? 149 : 39,
      recommended: planId === 'PRO'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with backdrop blur */}
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white/10 backdrop-blur-xl rounded-3xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/20 animate-fade-in-up">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-400 border-t-transparent"></div>
              </div>
              <p className="text-blue-200">Loading...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-yellow-500/30">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Upgrade Required
                    </h3>
                    <p className="text-blue-200 text-sm">
                      Current plan: <strong className="text-primary-400">{currentPlan}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message */}
              <div className="mb-6">
                <p className="text-blue-100 leading-relaxed">
                  {customMessage || entitlement?.message || 
                   `You've reached the limit for your current plan. To ${getActionDescription(action)}, please upgrade your subscription.`}
                </p>
              </div>

              {/* Recommended Plans */}
              {showPlans && (
                <div className="mb-6">
                  <h4 className="text-white font-bold mb-4">Recommended Plans:</h4>
                  <div className="space-y-3">
                    {getRecommendedPlans(currentPlan).map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                          plan.recommended 
                            ? 'border-primary-500/50 bg-primary-500/10' 
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-white text-lg">
                              {plan.name}
                            </span>
                            {plan.recommended && (
                              <span className="px-3 py-1 text-xs font-bold text-primary-300 bg-primary-500/20 rounded-full border border-primary-500/30">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-xl font-bold text-white">
                            ${plan.price}<span className="text-sm font-normal text-blue-200">/mo</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature highlights based on action */}
              <div className="mb-8 bg-green-500/10 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30">
                <h4 className="text-green-300 font-bold mb-3 flex items-center space-x-2">
                  <span>✨</span>
                  <span>Upgrading gives you:</span>
                </h4>
                <ul className="text-green-200 space-y-2 text-sm">
                  {action?.toLowerCase().includes('customer') && (
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span>More customer capacity</span>
                    </li>
                  )}
                  {action?.toLowerCase().includes('sms') && (
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span>Additional SMS messages</span>
                    </li>
                  )}
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span>Advanced analytics & reporting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span>All platform integrations</span>
                  </li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white/80 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300"
                >
                  Not Now
                </button>
                
                <button
                  onClick={handleViewBilling}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-primary-300 bg-primary-500/20 border border-primary-500/30 rounded-2xl hover:bg-primary-500/30 transition-all duration-300 backdrop-blur-sm"
                >
                  View Current Plan
                </button>

                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-500 via-purple-600 to-indigo-600 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {upgrading ? 'Loading...' : 'Upgrade Now'}
                </button>
              </div>
            </>
          )}
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

export default UpgradePromptModal;