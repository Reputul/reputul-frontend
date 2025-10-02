import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = ({ setShowAddBusiness, setShowRequestReviews, setShowAnalytics }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button
          onClick={() => setShowAddBusiness(true)}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-primary-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
            Add New Business
          </span>
        </button>

        <Link
          to="/customers"
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-indigo-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
            Manage Customers
          </span>
        </Link>

        <Link
          to="/contacts"
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
            Contact Database
          </span>
        </Link>

        <button
          onClick={() => setShowRequestReviews(true)}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
            Request Reviews
          </span>
        </button>

        <button
          onClick={() => setShowAnalytics(true)}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
            View Analytics
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;