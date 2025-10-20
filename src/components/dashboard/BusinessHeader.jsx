import React from 'react';
import { Link } from 'react-router-dom';

const BusinessHeader = ({ business }) => {
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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

      {/* Right: Action Button */}
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
  );
};

export default BusinessHeader;