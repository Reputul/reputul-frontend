import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import PlatformIcon from './PlatformIcon';
import axios from 'axios';
import { buildUrl, API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext'; // ADDED: Import useAuth

const ReviewManageModal = ({ review, isOpen, onClose, businessName, business }) => {
  const { token } = useAuth();
  
  // ADDED: Store replies per review ID (persists across modal open/close)
  const [savedReplies, setSavedReplies] = useState({});
  
  const [aiReply, setAiReply] = useState('');
  const [editedReply, setEditedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [error, setError] = useState('');

  // UPDATED: Load saved reply when review changes, reset other state when modal closes
  useEffect(() => {
    if (isOpen && review?.id) {
      // Load saved reply for this review if it exists
      const savedReply = savedReplies[review.id];
      if (savedReply) {
        setAiReply(savedReply);
        setEditedReply(savedReply);
      } else {
        setAiReply('');
        setEditedReply('');
      }
      // Reset UI state
      setIsPosted(false);
      setError('');
    }
    
    if (!isOpen) {
      // Only reset UI state when closing, keep savedReplies
      setIsGenerating(false);
      setIsCopied(false);
      setIsPosted(false);
      setError('');
    }
  }, [isOpen, review?.id, savedReplies]);

  // ADDED: Generate platform URL from business data if review doesn't have one
  const generatePlatformUrl = (source) => {
    // Use business prop instead of review.business
    const businessData = business || review?.business;
    
    // ADDED: Debug logging
    console.log('🔍 Generating platform URL:', {
      source,
      reviewId: review?.id,
      hasSourceReviewUrl: !!review?.sourceReviewUrl,
      sourceReviewUrl: review?.sourceReviewUrl,
      hasBusinessProp: !!business,
      hasReviewBusiness: !!review?.business,
      usingBusiness: !!businessData,
      businessKeys: businessData ? Object.keys(businessData) : [],
      businessName: businessData?.name
    });
    
    if (!businessData) {
      console.warn('⚠️ No business data available (neither prop nor review.business)');
      return null;
    }
    
    const sourceUpper = source?.toUpperCase();
    
    if (sourceUpper === 'GOOGLE' || sourceUpper === 'GOOGLE_MY_BUSINESS') {
      // Priority 1: Direct review URL from sourceReviewUrl
      if (review?.sourceReviewUrl) {
        console.log('✅ Using review.sourceReviewUrl:', review.sourceReviewUrl);
        return review.sourceReviewUrl;
      }
      
      // Priority 2: Business-level Google review URL
      if (businessData.googleReviewUrl) {
        console.log('✅ Using business.googleReviewUrl:', businessData.googleReviewUrl);
        return businessData.googleReviewUrl;
      }
      
      // Priority 3: Google short URL
      if (businessData.googleReviewShortUrl) {
        console.log('✅ Using business.googleReviewShortUrl:', businessData.googleReviewShortUrl);
        return businessData.googleReviewShortUrl;
      }
      
      // Priority 4: Generate from Place ID
      if (businessData.googlePlaceId) {
        const url = `https://search.google.com/local/writereview?placeid=${businessData.googlePlaceId}`;
        console.log('✅ Generated from googlePlaceId:', url);
        return url;
      }
      
      // Priority 5: Search URL
      if (businessData.googleSearchUrl) {
        console.log('✅ Using business.googleSearchUrl:', businessData.googleSearchUrl);
        return businessData.googleSearchUrl;
      }
      
      // Fallback: Search by business name
      if (businessData.name) {
        const url = `https://www.google.com/search?q=${encodeURIComponent(businessData.name + ' reviews')}`;
        console.log('✅ Generated from business.name:', url);
        return url;
      }
      
      console.warn('⚠️ No Google URL available - checked all sources');
    }
    
    if (sourceUpper === 'FACEBOOK') {
      // Priority 1: Direct review URL from sourceReviewUrl  
      if (review?.sourceReviewUrl) {
        console.log('✅ Using review.sourceReviewUrl:', review.sourceReviewUrl);
        return review.sourceReviewUrl;
      }
      
      // Priority 2: Business Facebook page
      if (businessData.facebookPageUrl) {
        const baseUrl = businessData.facebookPageUrl.trim();
        
        // FIXED: Check if URL already ends with /reviews
        if (baseUrl.endsWith('/reviews')) {
          console.log('✅ Using business.facebookPageUrl (already has /reviews):', baseUrl);
          return baseUrl;
        }
        
        const url = baseUrl.endsWith('/') ? `${baseUrl}reviews` : `${baseUrl}/reviews`;
        console.log('✅ Using business.facebookPageUrl:', url);
        return url;
      }
      
      // Fallback: Search by business name
      if (businessData.name) {
        const url = `https://www.facebook.com/search/top?q=${encodeURIComponent(businessData.name)}`;
        console.log('✅ Generated from business.name:', url);
        return url;
      }
      
      console.warn('⚠️ No Facebook URL available - checked all sources');
    }
    
    return null;
  };

  // Get platform info
  const getPlatformInfo = (source) => {
    const url = generatePlatformUrl(source);
    
    const platforms = {
      'GOOGLE': { 
        name: 'Google', 
        id: 'GOOGLE_MY_BUSINESS',
        color: 'text-blue-600', 
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
        url: url
      },
      'GOOGLE_MY_BUSINESS': { 
        name: 'Google', 
        id: 'GOOGLE_MY_BUSINESS',
        color: 'text-blue-600', 
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
        url: url
      },
      'FACEBOOK': { 
        name: 'Facebook', 
        id: 'FACEBOOK',
        color: 'text-blue-700', 
        bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
        url: url
      },
      'REPUTUL': { 
        name: 'Reputul', 
        id: 'REPUTUL',
        color: 'text-purple-600', 
        bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
        url: null
      },
    };
    return platforms[source?.toUpperCase()] || { 
      name: source || 'Direct',
      id: 'REPUTUL',
      color: 'text-gray-600', 
      bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
      url: null
    };
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Generate AI reply
  const handleGenerateReply = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await axios.post(
        buildUrl(API_ENDPOINTS.REVIEWS.GENERATE_REPLY),
        {
          reviewId: review.id,
          reviewText: review.comment,
          rating: review.rating,
          reviewerName: review.customerName,
          businessName: businessName
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const generatedReply = response.data.reply;
      setAiReply(generatedReply);
      setEditedReply(generatedReply);
      
      // ADDED: Save reply for this review ID
      setSavedReplies(prev => ({
        ...prev,
        [review.id]: generatedReply
      }));
      
    } catch (err) {
      console.error('Error generating reply:', err);
      setError('Failed to generate reply. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy reply to clipboard
  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(editedReply);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // ADDED: Post reply (copy to clipboard + open platform URL)
  const handlePostReply = async () => {
    try {
      // Copy reply to clipboard
      await navigator.clipboard.writeText(editedReply);
      
      // Get fresh platform info
      const currentPlatformInfo = getPlatformInfo(review.source);
      
      // Open platform URL if available
      if (currentPlatformInfo.url) {
        window.open(currentPlatformInfo.url, '_blank', 'noopener,noreferrer');
      } else {
        // If no URL, just show success message
        console.log('No platform URL available for this review');
      }
      
      setIsPosted(true);
      
      // Show success message
      setTimeout(() => {
        setIsPosted(false);
      }, 3000);
      
    } catch (err) {
      console.error('Failed to post reply:', err);
      setError('Failed to copy reply. Please try again.');
    }
  };

  // ADDED: Reset and regenerate reply
  const handleRegenerateReply = () => {
    setAiReply('');
    setEditedReply('');
    setIsPosted(false);
    
    // ADDED: Clear saved reply for this review
    setSavedReplies(prev => {
      const updated = { ...prev };
      delete updated[review.id];
      return updated;
    });
    
    handleGenerateReply();
  };

  // Share review
  const handleShare = async () => {
    const shareData = {
      title: `Review from ${review.customerName}`,
      text: `⭐ ${review.rating}/5 - "${review.comment || review.title}"`,
      url: platformInfo.url || window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('Review details copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  if (!isOpen || !review) return null;

  const platformInfo = getPlatformInfo(review.source);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review from {review.customerName}</h2>
            <p className="text-sm text-gray-500 mt-1">Manage and respond to this review</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Review Content */}
        <div className="px-8 py-6">
          {/* Reviewer Info */}
          <div className="flex items-start space-x-4 mb-6">
            <div className={`w-16 h-16 ${platformInfo.bg} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <span className="text-white font-bold text-2xl">
                {review.customerName?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">{review.customerName}</h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                  <PlatformIcon platform={platformInfo.id} size="sm" />
                  <span className="text-sm font-semibold text-gray-700">
                    {platformInfo.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {review.rating >= 4 && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Recommended
                </span>
              )}
            </div>
          </div>

          {/* Review Title */}
          {review.title && (
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{review.title}</h4>
            </div>
          )}

          {/* Review Comment */}
          {review.comment && (
            <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {review.comment}
              </p>
            </div>
          )}

          {/* AI Reply Section */}
          <div className="mb-6">
            {!aiReply ? (
              <button
                onClick={handleGenerateReply}
                disabled={isGenerating}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating reply...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Suggest a professional reply</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                {/* Editable Reply Text Area */}
                <div className="relative">
                  <textarea
                    value={editedReply}
                    onChange={(e) => setEditedReply(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                    rows={6}
                    placeholder="Edit your reply here..."
                  />
                  
                  {/* Success indicator */}
                  {isPosted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
                      <Check className="w-4 h-4" />
                      Reply copied!
                    </div>
                  )}
                </div>

                {/* Action Buttons - TrueReview Style */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRegenerateReply}
                    disabled={isGenerating}
                    className="inline-flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Suggest a new professional reply</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setAiReply('');
                        setEditedReply('');
                        setIsPosted(false);
                        // ADDED: Clear saved reply
                        setSavedReplies(prev => {
                          const updated = { ...prev };
                          delete updated[review.id];
                          return updated;
                        });
                      }}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handlePostReply}
                      disabled={!editedReply.trim()}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <span>Post reply</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* View on Platform (if available) */}
              {platformInfo.url && (
                <a
                  href={platformInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <PlatformIcon platform={platformInfo.id} size="sm" />
                  <span>View on {platformInfo.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewManageModal;