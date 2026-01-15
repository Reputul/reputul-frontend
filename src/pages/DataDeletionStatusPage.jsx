// src/pages/DataDeletionStatusPage.jsx
// Public page showing status of Facebook data deletion requests

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { buildUrl } from '../config/api';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const DataDeletionStatusPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const confirmationCode = searchParams.get('code');

  useEffect(() => {
    if (!confirmationCode) {
      setStatus('error');
      setError('No confirmation code provided');
      return;
    }

    fetchDeletionStatus();
  }, [confirmationCode]);

  const fetchDeletionStatus = async () => {
    try {
      const response = await axios.get(
        buildUrl(`/api/v1/facebook/data-deletion-status?code=${confirmationCode}`)
      );

      setData(response.data);
      setStatus(response.data.status.toLowerCase());
    } catch (err) {
      console.error('Error fetching deletion status:', err);
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to check deletion status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Facebook Data Deletion Request
          </h1>
          <p className="text-gray-600">
            Status of your data deletion request
          </p>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking deletion status...</p>
          </div>
        )}

        {/* Success State */}
        {status === 'completed' && data && (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-green-900 mb-2">
                    Data Successfully Deleted
                  </h2>
                  <p className="text-green-800 mb-4">
                    {data.details || 'Your data has been removed from our systems.'}
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Confirmation Code:</span>
                      <span className="font-mono font-semibold text-gray-900">
                        {data.confirmationCode}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Requested At:</span>
                      <span className="text-gray-900">
                        {new Date(data.requestedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                What was deleted?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Facebook access tokens</li>
                <li>✓ Facebook page connection data</li>
                <li>✓ Facebook user ID references</li>
                <li>✓ Any cached Facebook data</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                What wasn't deleted?
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                The following data remains in our system as it's essential for
                business operations and not specific to your Facebook account:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your Reputul account (if you have one)</li>
                <li>• Business information you've entered</li>
                <li>• Reviews from other platforms (Google, Yelp)</li>
                <li>• Customer contact information</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                To delete your entire Reputul account, please log in and visit
                your account settings.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-red-900 mb-2">
                  Unable to Find Deletion Request
                </h2>
                <p className="text-red-800 mb-4">
                  {error || 'We could not find a deletion request with this confirmation code.'}
                </p>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Possible reasons:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Invalid confirmation code</li>
                    <li>• Data was already deleted</li>
                    <li>• No Facebook connection existed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not Found State */}
        {status === 'not_found' && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-yellow-900 mb-2">
                  No Data Found
                </h2>
                <p className="text-yellow-800">
                  We couldn't find any data associated with this deletion request.
                  This likely means no Facebook connection existed in our system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Questions about your data deletion?
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://reputul.com/privacy-policy"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Privacy Policy
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="mailto:support@reputul.com"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionStatusPage;