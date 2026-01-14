import React, { useState, useEffect } from 'react';
import { Zap, Plus, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function IntegrationsPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/v1/api-keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/api-keys`,
        { name: newKeyName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCreatedKey(response.data);
      setNewKeyName('');
      fetchApiKeys();
      setShowCreateModal(false);
      toast.success('API key created successfully!');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const deleteApiKey = async (keyId, keyName) => {
    if (!window.confirm(`Are you sure you want to revoke "${keyName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/v1/api-keys/${keyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchApiKeys();
      toast.success('API key revoked successfully');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">
          Connect Reputul with thousands of apps using Zapier and API keys
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your API keys for Zapier and custom integrations
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create API Key
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {apiKeys.length === 0 ? (
            <div className="p-12 text-center">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first API key to start using Zapier integrations
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create API Key
              </button>
            </div>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{key.name}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="px-3 py-1 bg-gray-100 rounded font-mono text-sm text-gray-700">
                        {key.key_prefix}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key_prefix)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Created {new Date(key.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteApiKey(key.id, key.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Revoke"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create API Key</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Zapier Integration"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}

      {createdKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">API Key Created!</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 font-medium">
                Save this API key now - you will not be able to see it again!
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your API Key
              </label>
              <div className="flex gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm break-all">
                  {createdKey.key}
                </code>
                <button
                  onClick={() => copyToClipboard(createdKey.key)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setCreatedKey(null)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}