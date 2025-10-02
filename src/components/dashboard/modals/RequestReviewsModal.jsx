import React from 'react';

const RequestReviewsModal = ({ 
  showRequestReviews, 
  setShowRequestReviews, 
  requestReviewsData, 
  handleRequestReviewsChange, 
  handleRequestReviews,
  businesses 
}) => {
  if (!showRequestReviews) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Reviews</h3>
        <form onSubmit={handleRequestReviews}>
          <div className="space-y-4">
            <select
              name="selectedBusiness"
              value={requestReviewsData.selectedBusiness}
              onChange={handleRequestReviewsChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            >
              <option value="">Select Business</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="customerName"
              value={requestReviewsData.customerName}
              onChange={handleRequestReviewsChange}
              placeholder="Customer Name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            />
            <input
              type="email"
              name="customerEmail"
              value={requestReviewsData.customerEmail}
              onChange={handleRequestReviewsChange}
              placeholder="Customer Email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            />
            <textarea
              name="message"
              value={requestReviewsData.message}
              onChange={handleRequestReviewsChange}
              placeholder="Personal message (optional)"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-200"
            />
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Send Request
            </button>
            <button
              type="button"
              onClick={() => setShowRequestReviews(false)}
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

export default RequestReviewsModal;