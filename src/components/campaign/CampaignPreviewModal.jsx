import React, { useState } from 'react';
import ModalPortal from '../common/ModalPortal'; // ADDED

const CampaignPreviewModal = ({ 
  sequence, 
  sampleCustomer = null, 
  onClose, 
  onEdit,
  onStart 
}) => {
  const [selectedStep, setSelectedStep] = useState(0);
  const [customSample, setCustomSample] = useState({
    name: '',
    email: '',
    serviceType: '',
    businessName: ''
  });
  const [useCustomSample, setUseCustomSample] = useState(false);

  // Default sample data
  const defaultSample = {
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    businessName: 'ABC Home Services',
    serviceType: 'Roof Repair',
    businessPhone: '(555) 123-4567',
    businessWebsite: 'https://abchomeservices.com',
    serviceDate: new Date().toLocaleDateString(),
    reviewLink: 'https://review.reputul.com/abc-123',
    unsubscribeLink: 'https://unsubscribe.reputul.com/token-123'
  };

  const sampleData = useCustomSample && customSample.name ? {
    customerName: customSample.name || defaultSample.customerName,
    customerEmail: customSample.email || defaultSample.customerEmail,
    businessName: customSample.businessName || defaultSample.businessName,
    serviceType: customSample.serviceType || defaultSample.serviceType,
    ...defaultSample
  } : sampleCustomer || defaultSample;

  const replaceVariables = (template, data) => {
    if (!template) return '';
    
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      const variable = `{{${key}}}`;
      result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    return result;
  };

  const getStepIcon = (messageType) => {
    switch (messageType) {
      case 'SMS': return '📱';
      case 'EMAIL_PROFESSIONAL': return '✉️';
      case 'EMAIL_PLAIN': return '📧';
      default: return '📝';
    }
  };

  const getDelayDescription = (hours, isFirst = false) => {
    if (isFirst || hours === 0) return 'Immediately';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} later`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days} day${days > 1 ? 's' : ''} later`;
    return `${days}d ${remainingHours}h later`;
  };

  const calculateTotalDuration = () => {
    if (!sequence?.steps || sequence.steps.length === 0) return 'N/A';
    
    const totalHours = sequence.steps.reduce((sum, step, index) => {
      return sum + (index === 0 ? 0 : step.delayHours || 0);
    }, 0);
    
    if (totalHours === 0) return 'Immediate';
    if (totalHours < 24) return `${totalHours} hours`;
    
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return hours === 0 ? `${days} day${days > 1 ? 's' : ''}` : `${days}d ${hours}h`;
  };

  const renderTimeline = () => {
    if (!sequence?.steps || sequence.steps.length === 0) return null;

    return (
      <div className="space-y-4">
        {sequence.steps.map((step, index) => (
          <div 
            key={index}
            className={`flex items-start gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedStep === index ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedStep(index)}
          >
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                selectedStep === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < sequence.steps.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getStepIcon(step.messageType)}</span>
                <span className="font-medium text-gray-800">
                  {step.messageType?.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  {getDelayDescription(step.delayHours, index === 0)}
                </span>
              </div>
              
              {step.subjectTemplate && (
                <div className="text-sm text-gray-600 truncate">
                  Subject: {replaceVariables(step.subjectTemplate, sampleData)}
                </div>
              )}
              
              <div className="text-sm text-gray-600 truncate">
                {replaceVariables(step.bodyTemplate, sampleData).slice(0, 80)}...
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStepPreview = () => {
    if (!sequence?.steps || !sequence.steps[selectedStep]) return null;

    const step = sequence.steps[selectedStep];
    const isEmail = step.messageType?.includes('EMAIL');
    const subject = replaceVariables(step.subjectTemplate || '', sampleData);
    const body = replaceVariables(step.bodyTemplate || '', sampleData);

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Message Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getStepIcon(step.messageType)}</span>
              <span className="font-medium">{step.messageType?.replace('_', ' ')}</span>
            </div>
            <span className="text-sm text-gray-600">
              Step {selectedStep + 1} of {sequence.steps.length}
            </span>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-4">
          {isEmail ? (
            // Email Preview
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-16">To:</span>
                    <span className="text-gray-800">{sampleData.customerEmail}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-16">From:</span>
                    <span className="text-gray-800">{sampleData.businessName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-16">Subject:</span>
                    <span className="text-gray-800 font-medium">{subject || '[No subject]'}</span>
                  </div>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {body || '[No message content]'}
                </div>
              </div>
            </div>
          ) : (
            // SMS Preview
            <div className="max-w-sm mx-auto">
              <div className="bg-blue-500 text-white rounded-2xl rounded-bl-sm p-3 inline-block max-w-full">
                <div className="whitespace-pre-wrap text-sm">
                  {body || '[No message content]'}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {body?.length || 0}/160 characters
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!sequence) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{sequence.name}</h2>
                <p className="text-gray-600">{sequence.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
              >
                ×
              </button>
            </div>

            {/* Campaign Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xl font-bold text-blue-800">{sequence.steps?.length || 0}</div>
                <div className="text-sm text-blue-600">Steps</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xl font-bold text-green-800">{calculateTotalDuration()}</div>
                <div className="text-sm text-green-600">Duration</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xl font-bold text-purple-800">
                  {sequence.steps?.filter(s => s.messageType === 'SMS').length || 0}
                </div>
                <div className="text-sm text-purple-600">SMS Steps</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-xl font-bold text-orange-800">
                  {sequence.steps?.filter(s => s.messageType?.includes('EMAIL')).length || 0}
                </div>
                <div className="text-sm text-orange-600">Email Steps</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Timeline Sidebar */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Campaign Timeline</h3>
                
                {/* Sample Data Toggle */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useCustomSample}
                      onChange={(e) => setUseCustomSample(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Use custom sample data</span>
                  </label>
                  
                  {useCustomSample && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Customer name"
                        value={customSample.name}
                        onChange={(e) => setCustomSample(prev => ({...prev, name: e.target.value}))}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Customer email"
                        value={customSample.email}
                        onChange={(e) => setCustomSample(prev => ({...prev, email: e.target.value}))}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Service type"
                        value={customSample.serviceType}
                        onChange={(e) => setCustomSample(prev => ({...prev, serviceType: e.target.value}))}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {renderTimeline()}
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">
                  Step {selectedStep + 1}: {sequence.steps?.[selectedStep]?.messageType?.replace('_', ' ')}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedStep === 0 ? 'Sent immediately when campaign starts' : 
                   `Sent ${getDelayDescription(sequence.steps?.[selectedStep]?.delayHours || 0)}`}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {renderStepPreview()}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Preview with sample data • Variables will be replaced with real customer data
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(sequence);
                      onClose();
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Edit Campaign
                  </button>
                )}
                {onStart && (
                  <button
                    onClick={() => {
                      onStart(sequence);
                      onClose();
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Start Campaign
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default CampaignPreviewModal;