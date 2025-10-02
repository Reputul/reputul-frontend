import React from 'react';

const ProTip = () => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-900">Pro Tip</h3>
      </div>
      <p className="text-sm text-green-800 leading-relaxed mb-4">
        Businesses that respond to reviews within 24 hours see a 15% increase in customer
        satisfaction and rank higher in local search results.
      </p>
      <button className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors flex items-center space-x-1 group">
        <span>Learn More</span>
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default ProTip;