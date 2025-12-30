import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, Loader2, MessageSquare } from 'lucide-react';
import PlatformIcon from './PlatformIcon';
import axios from 'axios';
import { buildUrl, API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const ReviewManageModal = ({ review, isOpen, onClose, businessName, business }) => {
  const { token } = useAuth();
  
  const [savedReplies, setSavedReplies] = useState({});
  const [aiReply, setAiReply] = useState('');
  const [editedReply, setEditedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [error, setError] = useState('');
  
  // ADDED: Manual reply state
  const [showManualReply, setShowManualReply] = useState(false);
  const [manualReply, setManualReply] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  useEffect(() => {
    if (isOpen && review?.id) {
      const savedReply = savedReplies[review.id];
      if (savedReply) {
        setAiReply(savedReply);
        setEditedReply(savedReply);
      } else {
        setAiReply('');
        setEditedReply('');
      }
      setIsPosted(false);
      setError('');
      // ADDED: Reset manual reply state
      setShowManualReply(false);
      setManualReply('');
    }
    
    if (!isOpen) {
      setIsGenerating(false);
      setIsCopied(false);
      setIsPosted(false);
      setError('');
      setShowManualReply(false);
      setManualReply('');
    }
  }, [isOpen, review?.id, savedReplies]);

  const generatePlatformUrl = (source) => {
    const businessData = business || review?.business;
    
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
      console.warn('⚠️ No business data available');
      return null;
    }
    
    const sourceUpper = source?.toUpperCase();
    
    if (sourceUpper === 'GOOGLE' || sourceUpper === 'GOOGLE_MY_BUSINESS') {
      if (review?.sourceReviewUrl) {
        console.log('✅ Using review.sourceReviewUrl:', review.sourceReviewUrl);
        return review.sourceReviewUrl;
      }
      
      if (businessData.googleReviewUrl) {
        console.log('✅ Using business.googleReviewUrl:', businessData.googleReviewUrl);
        return businessData.googleReviewUrl;
      }
      
      if (businessData.googleReviewShortUrl) {
        console.log('✅ Using business.googleReviewShortUrl:', businessData.googleReviewShortUrl);
        return businessData.googleReviewShortUrl;
      }
      
      if (businessData.googlePlaceId) {
        const url = `https://search.google.com/local/writereview?placeid=${businessData.googlePlaceId}`;
        console.log('✅ Generated from googlePlaceId:', url);
        return url;
      }
      
      if (businessData.googleSearchUrl) {
        console.log('✅ Using business.googleSearchUrl:', businessData.googleSearchUrl);
        return businessData.googleSearchUrl;
      }
      
      if (businessData.name) {
        const url = `https://www.google.com/search?q=${encodeURIComponent(businessData.name + ' reviews')}`;
        console.log('✅ Generated from business.name:', url);
        return url;
      }
      
      console.warn('⚠️ No Google URL available');
    }
    
    if (sourceUpper === 'FACEBOOK') {
      if (review?.sourceReviewUrl) {
        console.log('✅ Using review.sourceReviewUrl:', review.sourceReviewUrl);
        return review.sourceReviewUrl;
      }
      
      if (businessData.facebookPageUrl) {
        const baseUrl = businessData.facebookPageUrl.trim();
        
        if (baseUrl.endsWith('/reviews')) {
          console.log('✅ Using business.facebookPageUrl (already has /reviews):', baseUrl);
          return baseUrl;
        }
        
        const url = baseUrl.endsWith('/') ? `${baseUrl}reviews` : `${baseUrl}/reviews`;
        console.log('✅ Using business.facebookPageUrl:', url);
        return url;
      }
      
      if (businessData.name) {
        const url = `https://www.facebook.com/search/top?q=${encodeURIComponent(businessData.name)}`;
        console.log('✅ Generated from business.name:', url);
        return url;
      }
      
      console.warn('⚠️ No Facebook URL available');
    }
    
    return null;
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(editedReply);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePostReply = async () => {
    try {
      await navigator.clipboard.writeText(editedReply);
      
      const currentPlatformInfo = getPlatformInfo(review.source);
      
      if (currentPlatformInfo.url) {
        window.open(currentPlatformInfo.url, '_blank', 'noopener,noreferrer');
      } else {
        console.log('No platform URL available for this review');
      }
      
      setIsPosted(true);
      
      setTimeout(() => {
        setIsPosted(false);
      }, 3000);
      
    } catch (err) {
      console.error('Failed to post reply:', err);
      setError('Failed to copy reply. Please try again.');
    }
  };

  const handleRegenerateReply = () => {
    setAiReply('');
    setEditedReply('');
    setIsPosted(false);
    
    setSavedReplies(prev => {
      const updated = { ...prev };
      delete updated[review.id];
      return updated;
    });
    
    handleGenerateReply();
  };

  // ADDED: Handle manual reply submission
  const handleSubmitManualReply = async () => {
    if (!manualReply.trim()) return;
    
    setIsSubmittingManual(true);
    setError('');
    
    try {
      // Copy reply to clipboard
      await navigator.clipboard.writeText(manualReply);
      
      // Open platform URL
      const currentPlatformInfo = getPlatformInfo(review.source);
      if (currentPlatformInfo.url) {
        window.open(currentPlatformInfo.url, '_blank', 'noopener,noreferrer');
      }
      
      // Show success
      setIsPosted(true);
      setTimeout(() => {
        setIsPosted(false);
        setShowManualReply(false);
        setManualReply('');
      }, 2000);
      
    } catch (err) {
      console.error('Failed to submit manual reply:', err);
      setError('Failed to copy reply. Please try again.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

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
                <div className="relative">
                  <textarea
                    value={editedReply}
                    onChange={(e) => setEditedReply(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                    rows={6}
                    placeholder="Edit your reply here..."
                  />
                  
                  {isPosted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
                      <Check className="w-4 h-4" />
                      Reply copied!
                    </div>
                  )}
                </div>

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
          {/* ADDED: Manual Reply Section */}
          {showManualReply && (
            <div className="mb-6 animate-in slide-in-from-bottom-4 duration-200">
              <div className="bg-white rounded-xl border-2 border-purple-200 p-4 shadow-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Write your reply
                </label>
                <textarea
                  value={manualReply}
                  onChange={(e) => setManualReply(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                  rows={4}
                  autoFocus
                />
                <div className="flex items-center justify-end gap-3 mt-3">
                  <button
                    onClick={() => {
                      setShowManualReply(false);
                      setManualReply('');
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitManualReply}
                    disabled={!manualReply.trim() || isSubmittingManual}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingManual ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Submit Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* View on Platform */}
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

              {/* ADDED: Reply Button */}
              {!showManualReply && (
                <button
                  onClick={() => setShowManualReply(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Reply</span>
                </button>
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