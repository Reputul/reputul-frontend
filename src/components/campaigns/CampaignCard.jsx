import React from 'react';

const CampaignCard = ({ campaign, onToggle, onEdit, onDuplicate, onSetAsDefault, onDelete, onEditStep }) => {
  const getMessageTypeIcon = (messageType) => {
    if (messageType === 'SMS') return '📱';
    if (messageType && messageType.includes('EMAIL')) return '📧';
    return '💬';
  };

  const getMessageTypeLabel = (messageType) => {
    if (messageType === 'SMS') return 'SMS';
    if (messageType && messageType.includes('EMAIL')) return 'Email';
    return messageType || 'Message';
  };

  const getDelayText = (delayHours) => {
    if (delayHours === 0) return 'Immediately';
    if (delayHours < 24) return `${delayHours}h`;
    const days = Math.floor(delayHours / 24);
    return `${days}d`;
  };

  // Get template name from step
  const getTemplateName = (step) => {
    if (step.messageType === 'SMS') return null;
    
    // Map template types to friendly names
    const templateNames = {
      'INITIAL_REQUEST': 'Initial Review Request',
      'FOLLOW_UP_3_DAY': '3-Day Follow-up',
      'FOLLOW_UP_7_DAY': '7-Day Follow-up',
      'FOLLOW_UP_14_DAY': '14-Day Follow-up',
      'THANK_YOU': 'Thank You'
    };
    
    // Try to extract from bodyTemplate placeholder
    if (step.bodyTemplate?.startsWith('[Uses Email Template:')) {
      const match = step.bodyTemplate.match(/\[Uses Email Template: (.+)\]/);
      if (match) {
        return templateNames[match[1]] || match[1];
      }
    }
    
    return step.emailTemplateId ? 'Custom Template' : null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all">
      {/* Compact Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
          {campaign.isDefault && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
              Default
            </span>
          )}
          <span className="text-sm text-gray-500">• {campaign.stepCount || 0} steps</span>
        </div>
        
        {/* Toggle - Cleaner */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={campaign.isActive}
            onChange={() => onToggle(campaign.id, campaign.isActive)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-4 peer-focus:ring-green-200 transition-all">
            <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      {/* Steps - Clean Timeline Style */}
      <div className="p-6 space-y-3">
        {campaign.steps && campaign.steps.length > 0 ? (
          campaign.steps.map((step, index) => {
            const templateName = getTemplateName(step);
            const isLast = index === campaign.steps.length - 1;
            
            return (
              <div key={step.id || index} className="relative">
                {/* Timeline connector */}
                {!isLast && (
                  <div className="absolute left-[18px] top-[36px] w-0.5 h-8 bg-gray-200"></div>
                )}
                
                {/* Step Card */}
                <div
                  onClick={() => onEditStep && onEditStep(step)}
                  className="group relative bg-gray-50 hover:bg-blue-50 rounded-lg p-4 cursor-pointer transition-all border border-transparent hover:border-blue-200"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-9 h-9 bg-white rounded-full flex items-center justify-center text-lg border border-gray-200 group-hover:border-blue-300 transition-colors">
                      {getMessageTypeIcon(step.messageType)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {getMessageTypeLabel(step.messageType)}
                          </span>
                          {step.delayHours > 0 && (
                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                              {getDelayText(step.delayHours)}
                            </span>
                          )}
                        </div>
                        
                        {/* Edit icon */}
                        <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      
                      {/* Subject line or template name */}
                      {step.subjectTemplate && (
                        <p className="text-sm text-gray-700 mb-1 truncate">
                          {step.subjectTemplate.replace(/\{\{.*?\}\}/g, '[...]')}
                        </p>
                      )}
                      
                      {/* Template indicator for emails */}
                      {templateName && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>{templateName}</span>
                        </div>
                      )}
                      
                      {/* SMS preview */}
                      {step.messageType === 'SMS' && step.bodyTemplate && !step.bodyTemplate.startsWith('[Uses') && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                          {step.bodyTemplate.replace(/\{\{.*?\}\}/g, '[...]').substring(0, 60)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">No steps configured</p>
          </div>
        )}
      </div>

      {/* Compact Actions Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {campaign.totalExecutions || 0} active
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {campaign.completedExecutions || 0} completed
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {campaign.isActive && !campaign.isDefault && onSetAsDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetAsDefault(campaign.id);
              }}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Set as default"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(campaign);
            }}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit campaign"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(campaign);
            }}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          
          {!campaign.isDefault && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(campaign.id);
              }}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;