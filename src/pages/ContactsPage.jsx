// frontend/src/pages/ContactsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { contactsApi, handleApiError, downloadCsvFile } from '../api/Contacts';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ImportModal from '../components/contacts/ImportModal';
import { ContactDetailsModal, ContactFormModal } from '../components/contacts/ContactModals';

const ContactsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lastJobDate: '',
    tags: [],
    smsConsent: null,
    emailConsent: null
  });
  
  // Available tags (collected from existing contacts)
  const [availableTags, setAvailableTags] = useState([]);
  
  // Stats state
  const [contactStats, setContactStats] = useState({
    total: 0,
    withPhone: 0,
    withEmail: 0,
    smsOptIn: 0,
    emailOptIn: 0,
    recentContacts: 0
  });
  
  // Load contacts
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 25,
        sort: 'createdAt,desc'
      };
      
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (tagFilter.trim()) params.tag = tagFilter.trim();
      
      const response = await contactsApi.getContacts(params);
      const data = response.data;
      
      setContacts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      
      // Extract unique tags
      const allTags = new Set();
      data.content.forEach(contact => {
        if (contact.tags) {
          contact.tags.forEach(tag => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags).sort());
      
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, tagFilter]);
  
  // Load contact stats
  const loadContactStats = useCallback(async () => {
    try {
      const response = await contactsApi.getContactStats();
      setContactStats(response.data);
    } catch (err) {
      console.error('Error loading contact stats:', err);
    }
  }, []);
  
  useEffect(() => {
    if (token) {
      loadContacts();
      loadContactStats();
    }
  }, [token, loadContacts, loadContactStats]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    loadContacts();
  };
  
  // Handle tag filter change
  const handleTagFilterChange = (tag) => {
    setTagFilter(tag);
    setCurrentPage(0);
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setTagFilter('');
    setCurrentPage(0);
  };
  
  // Handle bulk selection
  const handleSelectContact = (contactId, isSelected) => {
    const newSelected = new Set(selectedContacts);
    if (isSelected) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };
  
  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allIds = new Set(contacts.map(c => c.id));
      setSelectedContacts(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedContacts(new Set());
      setShowBulkActions(false);
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = async (action) => {
    const ids = Array.from(selectedContacts);
    
    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${ids.length} contacts?`)) {
            await contactsApi.bulkDelete(ids);
            setSuccess(`${ids.length} contacts deleted successfully!`);
            setSelectedContacts(new Set());
            setShowBulkActions(false);
            loadContacts();
          }
          break;
        case 'export':
          const response = await contactsApi.exportContacts({ ids });
          downloadCsvFile(response.data, `selected_contacts_${new Date().toISOString().split('T')[0]}.csv`);
          setSuccess(`${ids.length} contacts exported successfully!`);
          break;
        case 'tag':
          const tag = prompt('Enter tag to add:');
          if (tag && tag.trim()) {
            await contactsApi.bulkUpdate(ids, { addTags: [tag.trim().toLowerCase()] });
            setSuccess(`Tag "${tag}" added to ${ids.length} contacts!`);
            setSelectedContacts(new Set());
            setShowBulkActions(false);
            loadContacts();
          }
          break;
        default:
          break;
      }
    } catch (err) {
      setError(handleApiError(err));
    }
  };
  
  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'tags') {
        const tagSet = new Set(formData.tags);
        if (checked) {
          tagSet.add(value);
        } else {
          tagSet.delete(value);
        }
        setFormData(prev => ({ ...prev, tags: Array.from(tagSet) }));
      } else {
        // For consent checkboxes, use three-state logic (true/false/null)
        let newValue = null;
        if (checked) {
          newValue = true;
        } else if (formData[name] === true) {
          newValue = false;
        }
        setFormData(prev => ({ ...prev, [name]: newValue }));
      }
    } else if (type === 'custom') {
      // Handle custom form changes from modals
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value || null }));
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      lastJobDate: '',
      tags: [],
      smsConsent: null,
      emailConsent: null
    });
    setSelectedContact(null);
  };
  
  // Handle create contact
  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      await contactsApi.createContact(formData);
      setSuccess('Contact created successfully!');
      setShowAddModal(false);
      resetForm();
      loadContacts();
      loadContactStats();
    } catch (err) {
      setError(handleApiError(err));
    }
  };
  
  // Handle update contact
  const handleUpdateContact = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;
    
    try {
      await contactsApi.updateContact(selectedContact.id, formData);
      setSuccess('Contact updated successfully!');
      setShowEditModal(false);
      resetForm();
      loadContacts();
      loadContactStats();
    } catch (err) {
      setError(handleApiError(err));
    }
  };
  
  // Handle delete contact
  const handleDeleteContact = async (contact) => {
    if (!window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      return;
    }
    
    try {
      await contactsApi.deleteContact(contact.id);
      setSuccess('Contact deleted successfully!');
      setShowDetailsModal(false);
      loadContacts();
      loadContactStats();
    } catch (err) {
      setError(handleApiError(err));
    }
  };
  
  // Convert contact to customer
  const handleConvertToCustomer = async (contact) => {
    navigate('/customers', { 
      state: { 
        convertFromContact: {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          serviceDate: contact.lastJobDate,
          tags: [...(contact.tags || []), 'FROM_CONTACTS']
        }
      }
    });
  };
  
  // Open edit modal
  const openEditModal = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      lastJobDate: contact.lastJobDate || '',
      tags: contact.tags || [],
      smsConsent: contact.smsConsent,
      emailConsent: contact.emailConsent
    });
    setShowDetailsModal(false);
    setShowEditModal(true);
  };
  
  // Open details modal
  const openDetailsModal = (contact) => {
    setSelectedContact(contact);
    setShowDetailsModal(true);
  };
  
  // Open add modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };
  
  // Handle CSV export
  const handleExport = async () => {
    try {
      const response = await contactsApi.exportContacts(tagFilter || null);
      downloadCsvFile(response.data, `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
      setSuccess('Contacts exported successfully!');
    } catch (err) {
      setError(handleApiError(err));
    }
  };
  
  // Handle import success
  const handleImportSuccess = (result) => {
    setSuccess(`Import completed: ${result.insertedCount} added, ${result.updatedCount} updated, ${result.skippedCount} skipped`);
    setShowImportModal(false);
    loadContacts();
    loadContactStats();
  };
  
  // Close success/error messages
  const closeMessage = () => {
    setSuccess('');
    setError('');
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get consent display
  const getConsentDisplay = (consent) => {
    if (consent === true) return '✓';
    if (consent === false) return '✗';
    return '—';
  };
  
  // Get consent color
  const getConsentColor = (consent) => {
    if (consent === true) return 'text-green-600';
    if (consent === false) return 'text-red-600';
    return 'text-gray-400';
  };
  
  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{currentPage * 25 + 1}</span> to{' '}
              <span className="font-medium">{Math.min((currentPage + 1) * 25, totalElements)}</span> of{' '}
              <span className="font-medium">{totalElements}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === pageNum
                        ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contact Database</h1>
              <p className="text-gray-600 mt-1">
                Manage your contact database and run targeted campaigns
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/customers"
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>View Customers</span>
              </Link>
              <button
                onClick={handleExport}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Import CSV</span>
              </button>
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Contact</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">With Phone</p>
                <p className="text-2xl font-bold text-gray-900">{contactStats.withPhone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">With Email</p>
                <p className="text-2xl font-bold text-gray-900">{contactStats.withEmail}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">SMS Opt-In</p>
                <p className="text-2xl font-bold text-gray-900">{contactStats.smsOptIn}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email Opt-In</p>
                <p className="text-2xl font-bold text-gray-900">{contactStats.emailOptIn}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{contactStats.recentContacts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(success || error) && (
          <div className={`mb-6 p-4 rounded-xl ${success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex justify-between items-center">
              <p className={`${success ? 'text-green-800' : 'text-red-800'}`}>
                {success || error}
              </p>
              <button
                onClick={closeMessage}
                className={`${success ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">
                {selectedContacts.size} contacts selected
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleBulkAction('tag')} 
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  Add Tag
                </button>
                <button 
                  onClick={() => handleBulkAction('export')} 
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Export Selected
                </button>
                <button 
                  onClick={() => handleBulkAction('delete')} 
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Delete Selected
                </button>
                <button 
                  onClick={() => {
                    setSelectedContacts(new Set());
                    setShowBulkActions(false);
                  }} 
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Contacts
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Tag
                </label>
                <select
                  value={tagFilter}
                  onChange={(e) => handleTagFilterChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Tags</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-gray-600">Loading contacts...</span>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || tagFilter ? 'No contacts match your search criteria.' : 'Get started by adding your first contact or importing from CSV.'}
              </p>
              <div className="space-x-4">
                <button
                  onClick={openAddModal}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Add First Contact
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Import from CSV
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedContacts.size === contacts.length && contacts.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Job</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consent</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedContacts.has(contact.id)}
                            onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{contact.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {contact.email || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {contact.phone || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {formatDate(contact.lastJobDate)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags?.slice(0, 3).map((tag) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))}
                            {contact.tags?.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                +{contact.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <span title={`SMS: ${contact.smsConsent === null ? 'Unknown' : contact.smsConsent ? 'Yes' : 'No'}`} className={getConsentColor(contact.smsConsent)}>
                              📱{getConsentDisplay(contact.smsConsent)}
                            </span>
                            <span title={`Email: ${contact.emailConsent === null ? 'Unknown' : contact.emailConsent ? 'Yes' : 'No'}`} className={getConsentColor(contact.emailConsent)}>
                              📧{getConsentDisplay(contact.emailConsent)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openDetailsModal(contact)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditModal(contact)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleConvertToCustomer(contact)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Convert to Customer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination />
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />

      <ContactDetailsModal
        contact={selectedContact}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onEdit={openEditModal}
        onDelete={handleDeleteContact}
        onConvertToCustomer={handleConvertToCustomer}
      />

      <ContactFormModal
        contact={selectedContact}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateContact}
        formData={formData}
        onFormChange={handleFormChange}
        availableTags={availableTags}
        isEditing={false}
      />

      <ContactFormModal
        contact={selectedContact}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateContact}
        formData={formData}
        onFormChange={handleFormChange}
        availableTags={availableTags}
        isEditing={true}
      />
    </div>
  );
};

export default ContactsPage;