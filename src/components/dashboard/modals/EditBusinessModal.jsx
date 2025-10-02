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