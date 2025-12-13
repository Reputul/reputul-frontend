import React, { useState, useEffect } from 'react';

const EditCampaignModal = ({ campaign, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description,
    steps: campaign.steps || []
  });

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    setFormData({ ...formData, steps: updatedSteps });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...campaign,
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Edit Campaign</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Campaign Details */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Campaign Steps */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-blue-200">
                  Campaign Steps
                </label>
              </div>

              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <div key={step.id || index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold">Step {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <select
                          value={step.messageType}
                          onChange={(e) => handleStepChange(index, 'messageType', e.target.value)}
                          className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="SMS">SMS</option>
                          <option value="EMAIL_PROFESSIONAL">Email (Professional)</option>
                          <option value="EMAIL_PLAIN">Email (Plain)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs text-blue-300 mb-1">Delay (hours)</label>
                        <input
                          type="number"
                          value={step.delayHours}
                          onChange={(e) => handleStepChange(index, 'delayHours', parseInt(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {step.messageType !== 'SMS' && (
                        <div>
                          <label className="block text-xs text-blue-300 mb-1">Subject</label>
                          <input
                            type="text"
                            value={step.subjectTemplate || ''}
                            onChange={(e) => handleStepChange(index, 'subjectTemplate', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-blue-300 mb-1">Message</label>
                      <textarea
                        value={step.bodyTemplate}
                        onChange={(e) => handleStepChange(index, 'bodyTemplate', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Use {{customer_name}}, {{business_name}}, {{review_link}}"
                      />
                    </div>

                    <div className="mt-2 text-xs text-blue-300">
                      Available variables: {{customer_name}}, {{business_name}}, {{business_owner}}, {{review_link}}, {{business_phone}}, {{business_website}}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">Editing Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Delay times are cumulative from the campaign start</li>
                    <li>Use template variables to personalize messages</li>
                    <li>SMS messages should be under 160 characters for best delivery</li>
                    <li>Test your changes before activating the campaign</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCampaignModal;
