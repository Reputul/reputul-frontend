import React from 'react';
import { Link } from 'react-router-dom';

const BusinessHeader = ({ 
  business, 
  onEdit,           // Called when user clicks Edit Business
  onRequestReviews, // Called when user clicks Request Reviews
  onAddBusiness     // Called when user clicks Add Business
}) => {
  if (!business) return null;

  // Industry badge colors
  const industryColors = {
    'Roofing': 'bg-orange-100 text-orange-800',
    'HVAC': 'bg-blue-100 text-blue-800',
    'Plumbing': 'bg-cyan-100 text-cyan-800',
    'Landscaping': 'bg-green-100 text-green-800',
    'Electrical': 'bg-yellow-100 text-yellow-800',
    'General Contractor': 'bg-purple-100 text-purple-800',
    'default': 'bg-gray-100 text-gray-800'
  };

  const badgeColor = industryColors[business.industry] || industryColors.default;

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Row: Business Info & View Insights */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Business Info */}
        <div className="flex items-center space-x-4">
          {/* Business Logo/Icon */}
          <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
            <span className="text-white text-3xl font-bold">
              {business.name?.charAt(0)?.toUpperCase() || 'B'}
            </span>
          </div>

          {/* Business Name & Details */}
          <div>
            {business.address && (
              <p className="text-sm text-gray-500 font-medium mb-1">
                {business.address.split(',')[1]?.trim() || 'Location'}
              </p>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {business.name}
            </h1>
            <div className="flex items-center space-x-2">
              {business.industry && (
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${badgeColor}`}>
                  {business.industry}
                </span>
              )}
              {business.badge && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                  🏆 {business.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: View Insights Button */}
        <Link
          to="/insights"
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <span>View Insights</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Bottom Row: Quick Action Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {/* Request Reviews Button */}
        {onRequestReviews && (
          <button
            onClick={onRequestReviews}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span>Request Reviews</span>
          </button>
        )}

        {/* Edit Business Button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Business</span>
          </button>
        )}

        {/* Add Business Button */}
        {onAddBusiness && (
          <button
            onClick={onAddBusiness}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Business</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BusinessHeader;