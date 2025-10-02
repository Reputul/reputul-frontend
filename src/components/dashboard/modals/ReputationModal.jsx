import React from 'react';
import ReputationBreakdown from '../../ReputationBreakdown';

const ReputationModal = ({ 
  showReputationModal, 
  setShowReputationModal, 
  selectedBusinessForReputation, 
  setSelectedBusinessForReputation,
  reputationBreakdownData,
  setReputationBreakdownData,
  handleRecalculateReputation 
}) => {
  if (!showReputationModal || !selectedBusinessForReputation) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedBusinessForReputation.name}
            </h3>
            <p className="text-gray-600">Wilson Score Analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleRecalculateReputation(selectedBusinessForReputation.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Recalculate
            </button>
            <button
              onClick={() => {
                setShowReputationModal(false);
                setSelectedBusinessForReputation(null);
                setReputationBreakdownData(null);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <ReputationBreakdown
            businessId={selectedBusinessForReputation.id}
            breakdown={reputationBreakdownData}
          />
        </div>
      </div>
    </div>
  );
};

export default ReputationModal;