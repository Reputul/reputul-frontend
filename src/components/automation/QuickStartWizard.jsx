import React, { useState } from 'react';
import TemplateLibrary from './TemplateLibrary';

const QuickStartWizard = ({ isOpen, onClose, onComplete, userToken }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const industries = [
    { id: 'home_services', name: 'Home Services', description: 'HVAC, Plumbing, Electrical, Cleaning' },
    { id: 'automotive', name: 'Automotive', description: 'Auto Repair, Car Wash, Dealerships' },
    { id: 'restaurant', name: 'Food & Beverage', description: 'Restaurants, Cafes, Catering' },
    { id: 'healthcare', name: 'Healthcare', description: 'Dental, Medical, Veterinary' },
    { id: 'retail', name: 'Retail', description: 'Stores, E-commerce, Services' },
    { id: 'professional', name: 'Professional Services', description: 'Legal, Accounting, Consulting' },
    { id: 'other', name: 'Other', description: 'Custom business type' }
  ];

  const steps = [
    {
      title: 'Welcome to Automation',
      subtitle: 'Let\'s set up your first workflow in 3 easy steps'
    },
    {
      title: 'Choose Your Industry',
      subtitle: 'This helps us recommend the best templates for you'
    },
    {
      title: 'Select Your Template',
      subtitle: 'Pick a proven workflow to get started'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    
    if (currentStep === 1 && selectedIndustry) {
      setShowTemplates(true);
    }
  };

  const handleTemplateSelect = (template) => {
    onComplete(template);
    onClose();
  };

  if (!isOpen) return null;

  if (showTemplates) {
    return (
      <TemplateLibrary
        isOpen={true}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
        userToken={userToken}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 mt-1">{steps[currentStep].subtitle}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-64">
          {currentStep === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-6">🚀</div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Automatically request reviews after service completion</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Send follow-ups if customers don't respond</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Increase your review response rates by 40%</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    selectedIndustry === industry.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{industry.name}</h3>
                  <p className="text-sm text-gray-600">{industry.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip Setup
          </button>
          
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={currentStep === 1 && !selectedIndustry}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Choose Template' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartWizard;