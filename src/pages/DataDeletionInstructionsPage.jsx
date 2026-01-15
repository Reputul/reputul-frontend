// src/pages/DataDeletionInstructionsPage.jsx
// Simple page explaining how users can delete their data

import React from 'react';
import { Mail, Trash2, Settings, ExternalLink } from 'lucide-react';

const DataDeletionInstructionsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Trash2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Data Deletion Instructions
          </h1>
          <p className="text-lg text-gray-600">
            How to delete your Reputul data connected to Facebook
          </p>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          
          {/* Option 1: Disconnect Facebook */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-0">
                  Disconnect Facebook (Recommended)
                </h2>
                <p className="text-gray-700 mb-4">
                  Remove just your Facebook connection while keeping your Reputul account:
                </p>
                <ol className="space-y-2 text-gray-700 mb-4">
                  <li>Log in to your Reputul account at <a href="https://app.reputul.com" className="text-blue-600 hover:text-blue-700 font-medium">app.reputul.com</a></li>
                  <li>Navigate to <strong>Settings → Review Platforms</strong></li>
                  <li>Find Facebook in your connected platforms</li>
                  <li>Click <strong>"Disconnect"</strong></li>
                  <li>Confirm the disconnection</li>
                </ol>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium mb-1">
                    ✓ What gets deleted immediately:
                  </p>
                  <ul className="text-sm text-green-700 space-y-1 mb-0">
                    <li>• Facebook access tokens</li>
                    <li>• Facebook page connection</li>
                    <li>• Facebook user ID</li>
                    <li>• Cached Facebook data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Delete Entire Account */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-0">
                  Delete Your Entire Reputul Account
                </h2>
                <p className="text-gray-700 mb-4">
                  Permanently delete all your data from Reputul:
                </p>
                <ol className="space-y-2 text-gray-700 mb-4">
                  <li>Log in to your Reputul account</li>
                  <li>Go to <strong>Settings → Account</strong></li>
                  <li>Scroll to the bottom and click <strong>"Delete Account"</strong></li>
                  <li>Confirm deletion by typing your email</li>
                  <li>Click <strong>"Permanently Delete"</strong></li>
                </ol>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-1">
                    ⚠️ Warning: This action cannot be undone
                  </p>
                  <p className="text-sm text-red-700 mb-0">
                    All your business data, reviews, customers, and platform connections will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Option 3: Contact Support */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-0">
                  Contact Support
                </h2>
                <p className="text-gray-700 mb-4">
                  If you need assistance or cannot access your account:
                </p>
                <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg p-4">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email us at:</p>
                    <a 
                      href="mailto:support@reputul.com" 
                      className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                    >
                      support@reputul.com
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 mb-0">
                  We will process your deletion request within <strong>30 days</strong> and send you confirmation once complete.
                </p>
              </div>
            </div>
          </div>

          {/* What Gets Deleted */}
          <div className="border-t-2 border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What Data Gets Deleted?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Deleted */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Deleted
                </h3>
                <ul className="space-y-2 text-sm text-red-800">
                  <li>✓ Facebook access tokens</li>
                  <li>✓ Facebook OAuth credentials</li>
                  <li>✓ Facebook page connections</li>
                  <li>✓ Facebook user ID references</li>
                  <li>✓ Cached Facebook review data</li>
                </ul>
              </div>

              {/* Retained (if only disconnecting Facebook) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Retained (if disconnecting Facebook only)
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Your Reputul account</li>
                  <li>• Business information</li>
                  <li>• Customer contact data</li>
                  <li>• Reviews from other platforms</li>
                  <li>• Email and SMS templates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              ⏱️ Deletion Timeline
            </h3>
            <ul className="space-y-2 text-sm text-purple-800 mb-0">
              <li><strong>Immediate:</strong> Facebook connection disconnected in-app</li>
              <li><strong>Within 24 hours:</strong> Facebook tokens cleared from database</li>
              <li><strong>Within 30 days:</strong> All Facebook-related data permanently removed from backups</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Questions about data deletion?
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://reputul.com/privacy"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="mailto:support@reputul.com"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Contact Support
              <Mail className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionInstructionsPage;