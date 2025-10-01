import React, { useState } from 'react';

/**
 * CampaignSequenceList Component
 * 
 * Displays a list of campaign sequences with filtering, sorting, and management actions.
 * Fully modular component that can be used in the campaign management page.
 * 
 * Props:
 * - sequences: Array of sequence objects
 * - loading: Boolean loading state
 * - onEdit: Function called when editing a sequence
 * - onDelete: Function called when deleting a sequence
 * - onCreate: Function called when creating a new sequence
 * - onToggleStatus: Function called when toggling active/inactive status
 * - onSetAsDefault: Function called when setting a sequence as default
 */
const CampaignSequenceList = ({ 
  sequences, 
  loading, 
  onEdit, 
  onDelete, 
  onCreate, 
  onToggleStatus,
  onSetAsDefault 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort sequences
  const filteredSequences = sequences.filter(sequence => {
    const matchesSearch = !searchTerm || 
      sequence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sequence.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && sequence.isActive) ||
      (filterStatus === 'inactive' && !sequence.isActive) ||
      (filterStatus === 'default' && sequence.isDefault);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'steps':
        return (b.stepCount || 0) - (a.stepCount || 0);
      default:
        return 0;
    }
  });

  const handleToggleStatus = async (sequence) => {
    if (onToggleStatus) {
      await onToggleStatus(sequence.id, !sequence.isActive);
    }
  };

  const handleSetAsDefault = async (sequence) => {
    if (onSetAsDefault) {
      await onSetAsDefault(sequence.id);
    }
  };

  const handleDelete = async (sequence) => {
    if (sequence.isDefault) {
      alert('Cannot delete the default campaign sequence');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${sequence.name}"?`)) {
      if (onDelete) {
        await onDelete(sequence.id);
      }
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4 lg:mb-0">Campaign Sequences</h2>
          <button
            onClick={onCreate}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
          >
            Create Campaign
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="default">Default Only</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Created</option>
            <option value="steps">Sort by Steps</option>
          </select>
        </div>
      </div>

      {/* Sequence List */}
      <div className="p-6">
        {filteredSequences.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📧</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No matching campaigns' : 'No campaigns yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first campaign sequence to start collecting reviews automatically'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={onCreate}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Create Your First Campaign
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSequences.map(sequence => (
              <div 
                key={sequence.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{sequence.name}</h3>
                      <div className="flex gap-2">
                        {sequence.isDefault && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            Default
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          sequence.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sequence.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{sequence.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">{sequence.stepCount || 0}</span> steps
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Created {new Date(sequence.createdAt).toLocaleDateString()}
                      </span>
                      {sequence.lastUsed && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            Last used {new Date(sequence.lastUsed).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEdit(sequence)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                    
                    {!sequence.isDefault && (
                      <button
                        onClick={() => handleSetAsDefault(sequence)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium px-3 py-1 rounded hover:bg-purple-50 transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleToggleStatus(sequence)}
                      className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                        sequence.isActive
                          ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                    >
                      {sequence.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    {!sequence.isDefault && (
                      <button
                        onClick={() => handleDelete(sequence)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredSequences.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredSequences.length} of {sequences.length} campaigns
            </span>
            <div className="flex gap-4">
              <span>Active: {sequences.filter(s => s.isActive).length}</span>
              <span>Total Steps: {sequences.reduce((sum, s) => sum + (s.stepCount || 0), 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignSequenceList;