import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmailTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [templateTypes, setTemplateTypes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewData, setPreviewData] = useState({
    customerName: 'John Smith',
    businessName: 'ABC Roofing',
    serviceType: 'Roof Repair',
    serviceDate: '2025-07-25',
    businessPhone: '(555) 123-4567',
    businessWebsite: 'www.abcroofing.com'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    subject: '',
    body: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

  // Fetch templates and types on mount
  useEffect(() => {
    fetchTemplates();
    fetchTemplateTypes();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching templates with token:', !!token);
      
      const response = await axios.get(`${API_BASE}/api/email-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Templates response:', response.data);
      setTemplates(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(`Failed to fetch templates: ${err.response?.status} ${err.response?.statusText}`);
    }
  };

  const fetchTemplateTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/email-templates/types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Template types response:', response.data);
      console.log('First type item:', response.data[0], typeof response.data[0]);
      setTemplateTypes(response.data);
    } catch (err) {
      console.error('Error fetching template types:', err);
      // Fallback to hardcoded types if API fails
      setTemplateTypes([
        'INITIAL_REQUEST',
        'FOLLOW_UP_3_DAY', 
        'FOLLOW_UP_7_DAY',
        'FOLLOW_UP_14_DAY',
        'THANK_YOU',
        'CUSTOM'
      ]);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/email-templates`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowCreateModal(false);
      setFormData({ name: '', type: '', subject: '', body: '' });
      fetchTemplates();
      setError('');
    } catch (err) {
      setError('Failed to create template');
      console.error('Error creating template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/email-templates/${selectedTemplate.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowEditModal(false);
      setSelectedTemplate(null);
      setFormData({ name: '', type: '', subject: '', body: '' });
      fetchTemplates();
      setError('');
    } catch (err) {
      setError('Failed to update template');
      console.error('Error updating template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/email-templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTemplates();
    } catch (err) {
      setError('Failed to delete template');
      console.error('Error deleting template:', err);
    }
  };

  const handlePreviewTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/email-templates/${template.id}/preview`, previewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Preview response:', response.data);
      
      // Handle different response formats
      let content = '';
      if (typeof response.data === 'string') {
        content = response.data;
      } else if (response.data && typeof response.data.content === 'string') {
        content = response.data.content;
      } else if (response.data && typeof response.data.body === 'string') {
        content = response.data.body;
      } else {
        content = JSON.stringify(response.data);
      }
      
      setPreviewContent(content);
      setSelectedTemplate(template);
      setShowPreviewModal(true);
    } catch (err) {
      setError('Failed to generate preview');
      console.error('Error generating preview:', err);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', type: '', subject: '', body: '' });
    setShowCreateModal(true);
    setError('');
  };

  const openEditModal = (template) => {
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body
    });
    setSelectedTemplate(template);
    setShowEditModal(true);
    setError('');
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-body');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
    
    setFormData(prev => ({ ...prev, body: newText }));
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
    }, 0);
  };

  const getTypeDisplayName = (type) => {
    if (!type || typeof type !== 'string') {
      console.warn('getTypeDisplayName received non-string:', type);
      return String(type || '');
    }
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTypeColor = (type) => {
    const colors = {
      'INITIAL_REQUEST': 'bg-blue-100 text-blue-800',
      'FOLLOW_UP_3_DAY': 'bg-yellow-100 text-yellow-800',
      'FOLLOW_UP_7_DAY': 'bg-orange-100 text-orange-800',
      'FOLLOW_UP_14_DAY': 'bg-red-100 text-red-800',
      'THANK_YOU': 'bg-green-100 text-green-800',
      'CUSTOM': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-600">Manage your review request email templates</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Create New Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow border">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                  {template.typeDisplayName || getTypeDisplayName(template.type)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
              
              <div className="text-xs text-gray-500 mb-4">
                Created: {new Date(template.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePreviewTemplate(template)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm"
                >
                  Preview
                </button>
                <button
                  onClick={() => openEditModal(template)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Email Template</h2>
            
            <form onSubmit={handleCreateTemplate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="">Select Type</option>
                    {templateTypes.map((type, index) => {
                      // Handle both string and object formats
                      const typeValue = typeof type === 'string' ? type : type.type || type;
                      const typeDisplay = typeof type === 'string' ? getTypeDisplayName(type) : (type.displayName || getTypeDisplayName(type.type || type));
                      
                      return (
                        <option key={`${typeValue}-${index}`} value={typeValue}>
                          {typeDisplay}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                  <textarea
                    id="template-body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    rows="10"
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variables</label>
                  <div className="space-y-2">
                    {['customerName', 'businessName', 'serviceType', 'serviceDate', 'businessPhone', 'businessWebsite'].map(variable => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="w-full text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Email Template</h2>
            
            <form onSubmit={handleUpdateTemplate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="">Select Type</option>
                    {templateTypes.map((type, index) => {
                      // Handle both string and object formats
                      const typeValue = typeof type === 'string' ? type : type.type || type;
                      const typeDisplay = typeof type === 'string' ? getTypeDisplayName(type) : (type.displayName || getTypeDisplayName(type.type || type));
                      
                      return (
                        <option key={`edit-${typeValue}-${index}`} value={typeValue}>
                          {typeDisplay}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                  <textarea
                    id="template-body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    rows="10"
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variables</label>
                  <div className="space-y-2">
                    {['customerName', 'businessName', 'serviceType', 'serviceDate', 'businessPhone', 'businessWebsite'].map(variable => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="w-full text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Preview: {selectedTemplate?.name}</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <h3 className="font-medium text-gray-900 mb-3">Preview Data</h3>
                <div className="space-y-3">
                  {Object.entries(previewData).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setPreviewData(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => handlePreviewTemplate(selectedTemplate)}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Update Preview
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h3 className="font-medium text-gray-900 mb-3">Email Preview</h3>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="bg-white rounded p-4 shadow-sm">
                    <div 
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: (previewContent || '').toString().replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplatesPage;