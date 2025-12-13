import React from 'react';

const CampaignCard = ({ campaign, onToggle, onEdit, onDuplicate }) => {
  const getMessageTypeIcon = (messageType) => {
    switch (messageType) {
      case 'SMS':
        return '📱';
      case 'EMAIL_PROFESSIONAL':
      case 'EMAIL_PLAIN':
        return '📧';
      default:
        return '💬';
    }
  };

  const getDelayText = (delayHours) => {
    if (delayHours === 0) return 'Immediate';
    if (delayHours < 24) return `after ${delayHours} hours`;
    const days = Math.floor(delayHours / 24);
    return `after ${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
            {campaign.isDefault && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/30">
                DEFAULT
              </span>
            )}
          </div>
          <p className="text-blue-200 text-sm">{campaign.description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-4">
          <input
            type="checkbox"
            checked={campaign.isActive}
            onChange={() => onToggle(campaign.id, campaign.isActive)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </label>
      </div>

      {/* Objective */}
      <div className="mb-4 pb-4 border-b border-white/10">
        <div className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">
          Objective
        </div>
        <div className="text-white text-sm">
          {campaign.description || 'Automated review collection sequence'}
        </div>
      </div>

      {/* Entry Rules */}
      <div className="mb-4 pb-4 border-b border-white/10">
        <div className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-2">
          Entry Rules
        </div>
        <div className="flex items-center space-x-2 text-sm text-blue-100">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>
            {campaign.isDefault 
              ? 'Automatically enrolled when review request is created'
              : 'Manually triggered or custom rule-based'}
          </span>
        </div>
      </div>

      {/* Do This (Steps) */}
      <div className="mb-4">
        <div className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-3">
          Do This
        </div>
        <div className="space-y-3">
          {campaign.steps && campaign.steps.length > 0 ? (
            campaign.steps.map((step, index) => (
              <div
                key={step.id || index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getMessageTypeIcon(step.messageType)}</span>
                    <span className="text-white font-semibold">
                      Send {step.messageType.replace('_', ' ')}
                    </span>
                  </div>
                  {step.delayHours > 0 && (
                    <span className="text-blue-300 text-sm">
                      {getDelayText(step.delayHours)}
                    </span>
                  )}
                </div>
                <div className="text-blue-200 text-sm line-clamp-2 pl-10">
                  {step.bodyTemplate?.replace(/\{\{.*?\}\}/g, '[customer]').substring(0, 100)}...
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Sent {step.sentCount || 0}
                  </span>
                  <span className="text-gray-400">
                    Clicks {step.clickCount || 0}
                  </span>
                  <span className="text-gray-400">
                    Conversion rate {step.conversionRate || 0}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-blue-200 text-sm text-center py-4">
              No steps configured
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-blue-200">
            <span className="text-white font-semibold">{campaign.totalExecutions || 0}</span> active
          </div>
          <div className="text-blue-200">
            <span className="text-white font-semibold">{campaign.completedExecutions || 0}</span> completed
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(campaign)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            Edit
          </button>
          <button
            onClick={() => onDuplicate(campaign)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            Duplicate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
