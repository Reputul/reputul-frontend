import React from 'react';
import BusinessLogoUpload from '../../business/BusinessLogoUpload';

const AddBusinessModal = ({ 
  showAddBusiness, 
  setShowAddBusiness, 
  newBusiness, 
  handleBusinessChange, 
  handleCreateBusiness,
  businesses,
  fetchBusinesses 
}) => {
  if (!showAddBusiness) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Business</h3>
        <form onSubmit={handleCreateBusiness}>
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                name="name"
                value={newBusiness.name}
                onChange={handleBusinessChange}
                placeholder="Business Name"
                required
                className="w-full p-4 pt-6 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 peer placeholder-transparent"
              />
              <label className="absolute left-4 top-2 text-xs text-primary-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600">
                Business Name
              </label>
            </div>

            <input
              type="text"
              name="industry"
              value={newBusiness.industry}
              onChange={handleBusinessChange}
              placeholder="Industry (e.g., Plumbing, Auto Repair)"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <input
              type="text"
              name="phone"
              value={newBusiness.phone}
              onChange={handleBusinessChange}
              placeholder="Phone Number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <input
              type="url"
              name="website"
              value={newBusiness.website}
              onChange={handleBusinessChange}
              placeholder="Website URL"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <input
              type="text"
              name="address"
              value={newBusiness.address}
              onChange={handleBusinessChange}
              placeholder="Business Address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
          </div>

          {newBusiness.id && (
            <div className="mb-6">
              <BusinessLogoUpload
                business={newBusiness}
                onLogoUpdated={fetchBusinesses}
              />
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Business
            </button>
            <button
              type="button"
              onClick={() => setShowAddBusiness(false)}
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

export default AddBusinessModal;