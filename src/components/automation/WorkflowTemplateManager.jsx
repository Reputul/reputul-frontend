import React, { useState } from 'react';
import axios from 'axios';
import { buildUrl } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const WorkflowTemplateManager = ({ 
  workflow, 
  isOpen, 
  onClose, 
  onSaveAsTemplate, 
  userToken 
}) => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('custom');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const categories = [
    { id: 'custom', label: 'Custom' },
    { id: 'home_services', label: 'Home Services' },
    { id: 'restaurant', label: 'Food & Beverage' },
    { id: 'automotive', label: 'Automotive' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'retail', label: 'Retail' },
    { id: 'professional', label: 'Professional Services' },
    { id: 'other', label: 'Other' }
  ];

  const handleSave = async () => {
    if (!templateName.trim()) {
      showToast('Please enter a template name', 'error');
      return;
    }

    if (!templateDescription.trim()) {
      showToast('Please enter a template description', 'error');
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        name: templateName.trim(),
        description: templateDescription.trim(),
        category: templateCategory,
        isPublic: isPublic,
        nodes: workflow.nodes,
        connections: workflow.connections,
        metadata: {
          nodeCount: workflow.nodes.length,
          complexity: getComplexityLevel(workflow.nodes.length),
          createdFrom: workflow.id || 'scratch'
        }
      };

      await axios.post(buildUrl('/api/automation/templates'), templateData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      showToast('Template saved successfully', 'success');
      onSaveAsTemplate?.(templateData);
      onClose();
      
      // Reset form
      setTemplateName('');
      setTemplateDescription('');
      setTemplateCategory('custom');
      setIsPublic(false);
      
    } catch (error) {
      console.error('Error saving template:', error);
      showToast('Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getComplexityLevel = (nodeCount) => {
    if (nodeCount <= 3) return 'simple';
    if (nodeCount <= 5) return 'medium';
    return 'advanced';
  };

  const getPreviewFlow = () => {
    if (!workflow?.nodes) return 'No workflow loaded';
    
    const nodeTypes = workflow.nodes
      .filter(node => !node.id.startsWith('trigger-'))
      .map(node => {
        const icons = {
          delay: '⏰',
          email: '📧',
          sms: '📱',
          condition: '❓',
          webhook: '🔗'
        };
        return icons[node.type] || '⚙️';
      })
      .slice(0, 5);

    return `🎯 → ${nodeTypes.join(' → ')}${workflow.nodes.length > 6 ? ' → ...' : ''}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Save as Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Workflow Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Workflow Preview</h3>
            <div className="text-sm text-gray-600 mb-2">{getPreviewFlow()}</div>
            <div className="text-xs text-gray-500">
              {workflow?.nodes?.length || 0} nodes, {getComplexityLevel(workflow?.nodes?.length || 0)} complexity
            </div>
          </div>

          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., My Custom Review Flow"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
            <div className="text-xs text-gray-500 mt-1">
              {templateName.length}/50 characters
            </div>
          </div>

          {/* Template Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe when and how to use this template..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {templateDescription.length}/200 characters
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Public Template Option */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-1 mr-3"
            />
            <div>
              <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700">
                Share with community
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Make this template available to other users (you can change this later)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !templateName.trim() || !templateDescription.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTemplateManager;