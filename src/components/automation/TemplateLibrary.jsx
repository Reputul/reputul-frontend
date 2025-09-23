import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildUrl } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const TemplateLibrary = ({ isOpen, onClose, onSelectTemplate, userToken }) => {
  const [templates, setTemplates] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const [systemTemplatesRes, userTemplatesRes] = await Promise.all([
        axios.get(buildUrl('/api/automation/templates'), {
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        axios.get(buildUrl('/api/automation/templates/user'), {
          headers: { Authorization: `Bearer ${userToken}` }
        })
      ]);

      setTemplates(systemTemplatesRes.data);
      setCustomTemplates(userTemplatesRes.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showToast('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Built-in system templates for demo/fallback
  const systemTemplates = [
    {
      id: 'home-services-standard',
      name: 'Home Services Standard',
      description: 'Perfect for HVAC, plumbing, electrical services',
      category: 'home_services',
      industry: 'Home Services',
      estimatedConversion: '35%',
      nodes: [
        { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 200 }, data: { triggerType: 'SERVICE_COMPLETED', label: 'Service Complete' }},
        { id: 'delay-1', type: 'delay', position: { x: 300, y: 200 }, data: { duration: 24, unit: 'hours', label: '24 Hour Delay' }},
        { id: 'email-1', type: 'email', position: { x: 500, y: 200 }, data: { templateId: '1', subject: 'How was our service?', label: 'Review Request Email' }},
        { id: 'condition-1', type: 'condition', position: { x: 700, y: 200 }, data: { type: 'no_response', duration: 3, unit: 'days', label: 'If No Response' }},
        { id: 'sms-1', type: 'sms', position: { x: 900, y: 200 }, data: { message: 'Hi! We hope you loved our service. Quick review?', label: 'SMS Follow-up' }}
      ],
      connections: [
        { id: 'trigger-delay', source: 'trigger-1', target: 'delay-1' },
        { id: 'delay-email', source: 'delay-1', target: 'email-1' },
        { id: 'email-condition', source: 'email-1', target: 'condition-1' },
        { id: 'condition-sms', source: 'condition-1', target: 'sms-1' }
      ]
    },
    {
      id: 'high-value-customer',
      name: 'High-Value Customer VIP',
      description: 'Premium experience for high-value customers',
      category: 'premium',
      industry: 'All Industries',
      estimatedConversion: '55%',
      nodes: [
        { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 200 }, data: { triggerType: 'SERVICE_COMPLETED', label: 'Service Complete' }},
        { id: 'delay-1', type: 'delay', position: { x: 300, y: 200 }, data: { duration: 2, unit: 'hours', label: '2 Hour Delay' }},
        { id: 'email-1', type: 'email', position: { x: 500, y: 200 }, data: { templateId: '2', subject: 'Thank you for choosing us - Your feedback matters', label: 'Personal Thank You' }},
        { id: 'delay-2', type: 'delay', position: { x: 700, y: 200 }, data: { duration: 1, unit: 'days', label: '1 Day Delay' }},
        { id: 'sms-1', type: 'sms', position: { x: 900, y: 200 }, data: { message: 'Hi {name}! Hope you\'re happy with our premium service. Quick review would mean the world to us!', label: 'Personal SMS' }}
      ],
      connections: [
        { id: 'trigger-delay', source: 'trigger-1', target: 'delay-1' },
        { id: 'delay-email', source: 'delay-1', target: 'email-1' },
        { id: 'email-delay2', source: 'email-1', target: 'delay-2' },
        { id: 'delay2-sms', source: 'delay-2', target: 'sms-1' }
      ]
    },
    {
      id: 'restaurant-experience',
      name: 'Restaurant Experience',
      description: 'Capture dining experience while fresh in memory',
      category: 'restaurant',
      industry: 'Food & Beverage',
      estimatedConversion: '42%',
      nodes: [
        { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 200 }, data: { triggerType: 'SERVICE_COMPLETED', label: 'Dining Complete' }},
        { id: 'delay-1', type: 'delay', position: { x: 300, y: 200 }, data: { duration: 1, unit: 'hours', label: '1 Hour Delay' }},
        { id: 'sms-1', type: 'sms', position: { x: 500, y: 200 }, data: { message: 'Thanks for dining with us! How was your experience? Leave a quick review:', label: 'Quick SMS Review' }},
        { id: 'condition-1', type: 'condition', position: { x: 700, y: 200 }, data: { type: 'no_response', duration: 2, unit: 'days', label: 'If No Response' }},
        { id: 'email-1', type: 'email', position: { x: 900, y: 200 }, data: { templateId: '3', subject: 'Share your dining experience with photos!', label: 'Email with Photos' }}
      ],
      connections: [
        { id: 'trigger-delay', source: 'trigger-1', target: 'delay-1' },
        { id: 'delay-sms', source: 'delay-1', target: 'sms-1' },
        { id: 'sms-condition', source: 'sms-1', target: 'condition-1' },
        { id: 'condition-email', source: 'condition-1', target: 'email-1' }
      ]
    },
    {
      id: 'auto-service-center',
      name: 'Auto Service Center',
      description: 'Build trust for automotive services',
      category: 'automotive',
      industry: 'Automotive',
      estimatedConversion: '38%',
      nodes: [
        { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 200 }, data: { triggerType: 'SERVICE_COMPLETED', label: 'Service Complete' }},
        { id: 'delay-1', type: 'delay', position: { x: 300, y: 200 }, data: { duration: 4, unit: 'hours', label: '4 Hour Delay' }},
        { id: 'email-1', type: 'email', position: { x: 500, y: 200 }, data: { templateId: '1', subject: 'How did we do with your vehicle?', label: 'Service Review Email' }},
        { id: 'delay-2', type: 'delay', position: { x: 700, y: 200 }, data: { duration: 5, unit: 'days', label: '5 Day Delay' }},
        { id: 'email-2', type: 'email', position: { x: 900, y: 200 }, data: { templateId: '4', subject: 'Maintenance reminder for your vehicle', label: 'Maintenance Reminder' }}
      ],
      connections: [
        { id: 'trigger-delay', source: 'trigger-1', target: 'delay-1' },
        { id: 'delay-email', source: 'delay-1', target: 'email-1' },
        { id: 'email-delay2', source: 'email-1', target: 'delay-2' },
        { id: 'delay2-email2', source: 'delay-2', target: 'email-2' }
      ]
    },
    {
      id: 'simple-followup',
      name: 'Simple Follow-up',
      description: 'Basic email follow-up for any business',
      category: 'basic',
      industry: 'All Industries',
      estimatedConversion: '28%',
      nodes: [
        { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 200 }, data: { triggerType: 'SERVICE_COMPLETED', label: 'Service Complete' }},
        { id: 'delay-1', type: 'delay', position: { x: 300, y: 200 }, data: { duration: 24, unit: 'hours', label: '24 Hour Delay' }},
        { id: 'email-1', type: 'email', position: { x: 500, y: 200 }, data: { templateId: '1', subject: 'We hope you loved our service!', label: 'Thank You Email' }}
      ],
      connections: [
        { id: 'trigger-delay', source: 'trigger-1', target: 'delay-1' },
        { id: 'delay-email', source: 'delay-1', target: 'email-1' }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: systemTemplates.length + customTemplates.length },
    { id: 'home_services', name: 'Home Services', count: systemTemplates.filter(t => t.category === 'home_services').length },
    { id: 'restaurant', name: 'Food & Beverage', count: systemTemplates.filter(t => t.category === 'restaurant').length },
    { id: 'automotive', name: 'Automotive', count: systemTemplates.filter(t => t.category === 'automotive').length },
    { id: 'premium', name: 'Premium/VIP', count: systemTemplates.filter(t => t.category === 'premium').length },
    { id: 'basic', name: 'Basic Templates', count: systemTemplates.filter(t => t.category === 'basic').length },
    { id: 'custom', name: 'My Templates', count: customTemplates.length }
  ];

  const getFilteredTemplates = () => {
    let allTemplates = selectedCategory === 'custom' ? customTemplates : systemTemplates;
    
    if (selectedCategory !== 'all' && selectedCategory !== 'custom') {
      allTemplates = allTemplates.filter(t => t.category === selectedCategory);
    }

    if (searchTerm) {
      allTemplates = allTemplates.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return allTemplates;
  };

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  const getNodeCount = (template) => {
    return template.nodes?.length || 0;
  };

  const getComplexityLevel = (template) => {
    const nodeCount = getNodeCount(template);
    if (nodeCount <= 3) return { level: 'Simple', color: 'text-green-600 bg-green-100' };
    if (nodeCount <= 5) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { level: 'Advanced', color: 'text-red-600 bg-red-100' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-6xl mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Workflow Templates</h2>
              <p className="text-gray-600 mt-1">Choose a proven template to get started quickly</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className={`text-xs ${
                        selectedCategory === category.id ? 'text-blue-500' : 'text-gray-400'
                      }`}>
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getFilteredTemplates().map(template => {
                  const complexity = getComplexityLevel(template);
                  
                  return (
                    <div
                      key={template.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${complexity.color}`}>
                            {complexity.level}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{getNodeCount(template)}</div>
                          <div className="text-xs text-gray-600">Nodes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{template.estimatedConversion}</div>
                          <div className="text-xs text-gray-600">Est. Conversion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{template.industry}</div>
                          <div className="text-xs text-gray-600">Industry</div>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span>🎯 Trigger</span>
                          <span>→</span>
                          <span>⏰ Wait</span>
                          <span>→</span>
                          <span>📧 Email</span>
                          {getNodeCount(template) > 3 && (
                            <>
                              <span>→</span>
                              <span>...</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                        Use This Template
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {getFilteredTemplates().length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;