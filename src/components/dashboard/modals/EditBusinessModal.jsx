import React from 'react';
import BusinessLogoUpload from '../../business/BusinessLogoUpload';

const EditBusinessModal = ({ 
  editingBusiness, 
  setEditingBusiness, 
  editBusinessData, 
  handleEditBusinessChange, 
  handleUpdateBusiness,
  businesses,
  fetchBusinesses 
}) => {
  if (!editingBusiness) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Business</h3>
        <form onSubmit={handleUpdateBusiness}>
          <div className="space-y-4 mb-6">
            <input
              type="text"
              name="name"
              value={editBusinessData.name}
              onChange={handleEditBusinessChange}
              placeholder="Business Name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <input
              type="text"
              name="industry"
              value={editBusinessData.industry}
              onChange={handleEditBusinessChange}
              placeholder="Industry (e.g., Plumbing, Auto Repair)"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <input
              type="text"
              name="phone"
              value={editBusinessData.phone}
              onChange={handleEditBusinessChange}
              placeholder="Phone Number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <input
              type="url"
              name="website"
              value={editBusinessData.website}
              onChange={handleEditBusinessChange}
              placeholder="Website URL"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <input
              type="text"
              name="address"
              value={editBusinessData.address}
              onChange={handleEditBusinessChange}
              placeholder="Business Address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />

            {/* NEW: Google Places Info Display */}
            {editBusinessData.googleReviewUrl && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Google Review Configuration
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Review URL:</span>
                    <a 
                      href={editBusinessData.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline truncate mt-1"
                    >
                      {editBusinessData.googleReviewUrl}
                    </a>
                  </div>
                  
                  {editBusinessData.googlePlaceAutoDetected && (
                    <div className="flex items-center text-green-700 pt-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Auto-detected from Google Places</span>
                    </div>
                  )}
                  
                  {editBusinessData.googlePlaceName && (
                    <div className="pt-2">
                      <span className="font-medium text-gray-700">Google Name:</span>
                      <span className="ml-2 text-gray-600">{editBusinessData.googlePlaceName}</span>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => window.open('/review-platform-setup', '_blank')}
                  className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  Configure review platforms
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <BusinessLogoUpload
              business={businesses.find((b) => b.id === editingBusiness)}
              onLogoUpdated={fetchBusinesses}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Update Business
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingBusiness(null);
              }}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBusinessModal;