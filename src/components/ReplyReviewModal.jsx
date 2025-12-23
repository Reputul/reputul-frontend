import React, { useState } from 'react';
import { X, Send, Star, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { buildUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

/**
 * Modal for replying to customer reviews
 * - Google reviews: Post directly via API
 * - Facebook reviews: Direct user to Facebook (API doesn't support replies)
 * - Reputul reviews: Post directly to database
 */
const ReplyReviewModal = ({ review, business, onClose, onReplySuccess }) => {
  const { token } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // Check if this is Facebook (requires external reply)
  const isFacebookReview = review.source?.toLowerCase() === 'facebook';
  
  // Check if this is Google (can reply via API)
  const isGoogleReview = ['google_my_business', 'google'].includes(
    review.source?.toLowerCase()
  );

  // Get Facebook info for external redirect
  const getFacebookInfo = () => {
    return {
      name: 'Facebook',
      url: review.sourceReviewUrl || `https://facebook.com/${business.facebookPageId || ''}/reviews`,
      message: 'For Facebook reviews, reply directly on Facebook where your customers can see your response.',
    };
  };

  const facebookInfo = getFacebookInfo();

  // Quick reply templates
  const templates = [
    "Thank you so much for your wonderful review! We're thrilled to hear you had a great experience with us. 😊",
    "We really appreciate you taking the time to share your feedback. It means the world to our team!",
    "Thank you for choosing us! We look forward to serving you again soon. 🙏",
    "We're sorry to hear about your experience. Please contact us directly so we can make this right.",
  ];

  // Handle send reply (for Google and internal reviews)
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    setSending(true);

    try {
      const response = await axios.post(
        buildUrl(`/api/v1/reviews/${review.id}/reply`),
        { responseText: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check if it was posted to the platform
      if (response.data.postedToPlatform) {
        alert('✅ Reply posted to Google successfully!');
      } else {
        alert('✅ Reply saved locally!');
      }
      
      onReplySuccess();

    } catch (error) {
      console.error('Error posting reply:', error);
      
      // Show more specific error message
      const errorMsg = error.response?.data?.error || 'Failed to post reply. Please try again.';
      alert(errorMsg);
    } finally {
      setSending(false);
    }
  };

  // Handle go to Facebook
  const handleGoToFacebook = () => {
    window.open(facebookInfo.url, '_blank', 'noopener,noreferrer');
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reply to Review</h2>
              <p className="text-sm text-gray-600">
                Respond to {review.customerName || 'this customer'}
              </p>
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
            {/* Original Review */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-700">
                    {review.customerName?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {review.customerName || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>

            {/* Facebook Review - Go to Site */}
            {isFacebookReview ? (
              <div>
                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">
                        Reply directly on Facebook
                      </h3>
                      <p className="text-sm text-blue-800">
                        {facebookInfo.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Existing Reply (if any) */}
                {review.platformResponse && (
                  <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-6">
                    <p className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      You've already replied to this review:
                    </p>
                    <p className="text-sm text-green-800">
                      {review.platformResponse}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleGoToFacebook}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={20} />
                    Go to Facebook
                  </button>
                </div>
              </div>
            ) : (
              /* Google & Internal Reviews - Direct Reply */
              <div>
                {/* Existing Reply (if any) */}
                {review.platformResponse && (
                  <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Current Response:
                    </p>
                    <p className="text-sm text-blue-800">
                      {review.platformResponse}
                    </p>
                  </div>
                )}

                {/* Quick Reply Templates */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Reply Templates
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {templates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => setReplyText(template)}
                        className="text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Text Area */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      {replyText.length} characters
                    </p>
                    {replyText.length > 500 && (
                      <p className="text-sm text-orange-600">
                        Consider keeping replies concise
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Message - Different for Google vs Internal */}
                {isGoogleReview ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-900">
                      <strong>✓ This will post directly to Google:</strong> Your reply will appear 
                      on your Google Business Profile where customers can see it.
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-900">
                      <strong>Tip:</strong> Keep replies professional, friendly, and concise. 
                      Thank positive reviews and address concerns in negative reviews.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        {isGoogleReview ? 'Post to Google' : 'Post Reply'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyReviewModal;