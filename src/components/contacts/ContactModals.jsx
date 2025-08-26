// src/components/contacts/ContactModals.jsx
import React, { useState } from 'react';

// Contact Details Modal
export const ContactDetailsModal = ({ contact, isOpen, onClose, onEdit, onDelete, onConvertToCustomer }) => {
  if (!isOpen || !contact) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConsentDisplay = (consent) => {
    if (consent === true) return { text: 'Yes', color: 'text-green-600', bg: 'bg-green-100' };
    if (consent === false) return { text: 'No', color: 'text-red-600', bg: 'bg-red-100' };
    return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const smsConsent = getConsentDisplay(contact.smsConsent);
  const emailConsent = getConsentDisplay(contact.emailConsent);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Contact Details</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg font-medium text-gray-900">{contact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg text-gray-900">{contact.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-lg text-gray-900">{contact.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Last Job Date</label>
                  <p className="text-lg text-gray-900">{formatDate(contact.lastJobDate)}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Tags</h4>
              {contact.tags && contact.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tags assigned</p>
              )}
            </div>

            {/* Consent Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Communication Consent</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium text-gray-900">SMS Marketing</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${smsConsent.bg} ${smsConsent.color}`}>
                      {smsConsent.text}
                    </span>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-900">Email Marketing</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${emailConsent.bg} ${emailConsent.color}`}>
                      {emailConsent.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Created</label>
                  <p className="text-gray-900">{formatDate(contact.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-gray-900">{formatDate(contact.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => onConvertToCustomer(contact)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Convert to Customer
            </button>
            <button
              onClick={() => onEdit(contact)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Edit Contact
            </button>
            <button
              onClick={() => onDelete(contact)}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add/Edit Contact Modal
export const ContactFormModal = ({ 
  contact, 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  onFormChange, 
  availableTags,
  isEditing = false 
}) => {
  const [customTag, setCustomTag] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const addCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim().toLowerCase())) {
      const newTags = [...formData.tags, customTag.trim().toLowerCase()];
      onFormChange({
        target: {
          name: 'tags',
          type: 'custom',
          value: newTags
        }
      });
      setCustomTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    onFormChange({
      target: {
        name: 'tags',
        type: 'custom',
        value: newTags
      }
    });
  };

  const handleConsentChange = (consentType, value) => {
    // Three-state logic: null -> true -> false -> null
    let newValue = null;
    if (value) {
      newValue = formData[consentType] === true ? false : true;
    }
    
    onFormChange({
      target: {
        name: consentType,
        type: 'checkbox',
        checked: newValue === true,
        value: newValue
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onFormChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={onFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Job Date
                  </label>
                  <input
                    type="date"
                    name="lastJobDate"
                    value={formData.lastJobDate}
                    onChange={onFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Tags</h4>
              
              {/* Existing tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Available tags */}
              {availableTags.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => !formData.tags.includes(tag))
                      .slice(0, 10)
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => onFormChange({
                            target: {
                              name: 'tags',
                              type: 'custom',
                              value: [...formData.tags, tag]
                            }
                          })}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Add custom tag */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Consent */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Communication Consent</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-900">SMS Marketing</label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleConsentChange('smsConsent', true)}
                        className={`px-3 py-1 text-sm rounded ${
                          formData.smsConsent === true
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConsentChange('smsConsent', false)}
                        className={`px-3 py-1 text-sm rounded ${
                          formData.smsConsent === false
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => onFormChange({
                          target: { name: 'smsConsent', type: 'custom', value: null }
                        })}
                        className={`px-3 py-1 text-sm rounded ${
                          formData.smsConsent === null
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Unknown
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Permission to send SMS marketing messages
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-900">Email Marketing</label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleConsentChange('emailConsent', true)}
                        className={`px-3 py-1 text-sm rounded ${
                          formData.emailConsent === true
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConsentChange('emailConsent', false)}
                        className={`px-3 py-1 text-sm rounded ${
                          formData.emailConsent === false
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => onFormChange({
                          target: { name: 'emailConsent', type: 'custom', value: null }
                        })}
                        className={`px-3 py-1 text-sm rounded ${
                          formData.emailConsent === null
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Unknown
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Permission to send email marketing messages
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {isEditing ? 'Update Contact' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};