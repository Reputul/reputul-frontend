import React, { useState } from 'react';
import { X, Facebook, CheckCircle } from 'lucide-react';
import { Star } from 'lucide-react';

/**
 * Modal for sharing reviews to Facebook
 * Shows preview of Facebook post and handles sharing to business page
 */
const ShareReviewModal = ({ review, business, onClose }) => {
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  // Generate Facebook post preview text
  const generatePostText = () => {
    const stars = '⭐'.repeat(review.rating);
    return `${stars}\n\n"${review.comment}"\n\n- ${review.customerName || 'A happy customer'}\n\nThank you for your amazing review! 🙏`;
  };

  // Handle Facebook share
  const handleFacebookShare = async () => {
    setSharing(true);

    try {
      // TODO: Implement actual Facebook Graph API posting
      // This will require:
      // 1. Facebook page access token
      // 2. POST to /v18.0/{page-id}/feed
      // 3. Include message and optional link to review

      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock success
      setShared(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      alert('Failed to share to Facebook. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  // Render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Facebook size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Share to Facebook</h2>
                <p className="text-sm text-gray-600">Post this review to your business page</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {shared ? (
              // Success State
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Posted Successfully!
                </h3>
                <p className="text-gray-600">
                  Your review has been shared to Facebook
                </p>
              </div>
            ) : (
              <>
                {/* Facebook Post Preview */}
                <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
                  {/* Post Header */}
                  <div className="bg-white p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {business.name?.charAt(0)?.toUpperCase() || 'B'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{business.name}</p>
                        <p className="text-xs text-gray-500">Just now · 🌍</p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="bg-white p-4">
                    <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">
                      {generatePostText()}
                    </p>
                  </div>

                  {/* Review Card in Post */}
                  <div className="bg-gray-50 p-4 m-4 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">
                          {review.customerName?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {review.customerName || 'Anonymous'}
                        </p>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    
                    {review.comment && (
                      <p className="text-sm text-gray-700 italic">
                        "{review.comment}"
                      </p>
                    )}
                  </div>

                  {/* Engagement Buttons Preview */}
                  <div className="bg-white px-4 pb-4">
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>👍 Like</span>
                        <span>💬 Comment</span>
                        <span>↗️ Share</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> This will post directly to your Facebook business page. 
                    Make sure you're connected to the correct page in Review Platforms settings.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFacebookShare}
                    disabled={sharing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {sharing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Facebook size={20} />
                        Post to Facebook
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareReviewModal;