import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const CustomerFeedbackPage = () => {
  const { customerId } = useParams();
  const [searchParams] = useSearchParams();
  const [customer, setCustomer] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ rating: "", comment: "", type: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // Fetch customer and associated business data
        const response = await axios.get(`http://localhost:8080/api/customers/${customerId}/feedback-info`);
        setCustomer(response.data.customer);
        setBusiness(response.data.business);
        
        // Auto-set to private feedback since they clicked the private feedback link
        setFeedback(prev => ({ ...prev, type: "private" }));
        
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Customer not found or link has expired.");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!feedback.rating || !feedback.comment.trim()) {
        setError("Please provide both rating and comment");
        return;
      }

      await axios.post(`http://localhost:8080/api/customers/${customerId}/feedback`, {
        rating: parseInt(feedback.rating),
        comment: feedback.comment.trim(),
        type: feedback.type || "private"
      });

      setSuccess("Thank you for your feedback! We truly appreciate your time and insights.");
      setFeedback({ rating: "", comment: "", type: "private" }); // Keep type as private
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getExternalReviewUrls = () => {
    if (!business) return {};
    
    const urls = {};
    
    // Google Review URL
    if (business.googlePlaceId) {
      urls.google = `https://search.google.com/local/writereview?placeid=${business.googlePlaceId}`;
    } else if (business.name && business.address) {
      const query = encodeURIComponent(`${business.name} ${business.address}`);
      urls.google = `https://www.google.com/maps/search/${query}`;
    } else if (business.name) {
      const query = encodeURIComponent(`${business.name} reviews`);
      urls.google = `https://www.google.com/search?q=${query}`;
    }
    
    // Facebook Review URL
    if (business.facebookPageUrl) {
      urls.facebook = business.facebookPageUrl.endsWith('/') 
        ? `${business.facebookPageUrl}reviews`
        : `${business.facebookPageUrl}/reviews`;
    }
    
    return urls;
  };

  const showPlatformChoice = () => {
    setFeedback({ rating: "", comment: "", type: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your feedback form...</p>
        </div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Link Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const externalUrls = getExternalReviewUrls();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thanks for choosing {business?.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Hi {customer?.name}, we hope you were satisfied with your {customer?.serviceType} service.
            </p>
            <p className="text-gray-500">
              Service Date: {customer?.serviceDate ? new Date(customer.serviceDate).toLocaleDateString() : 'Recent'}
            </p>
          </div>
        </div>

        {/* Show Platform Choice only if no type is selected */}
        {!feedback.type && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Share Your Experience
            </h2>
            <p className="text-gray-600 text-center mb-8">
              We'd love your feedback! You can leave a review on your preferred platform:
            </p>
            
            <div className="space-y-4 max-w-md mx-auto">
              {/* Google Review Button */}
              {externalUrls.google && (
                <a
                  href={externalUrls.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-semibold text-center transition-colors w-full text-lg border border-gray-300 hover:border-gray-400"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {/* Google Logo SVG */}
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Review on Google</span>
                  </div>
                </a>
              )}
              
              {/* Facebook Review Button */}
              {externalUrls.facebook && (
                <a
                  href={externalUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-semibold text-center transition-colors w-full text-lg border border-gray-300 hover:border-gray-400"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {/* Facebook Logo SVG */}
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                      <path d="M16.671 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.632H7.078v3.47h3.047v8.385a12.118 12.118 0 003.75 0v-8.385h2.796z" fill="#fff"/>
                    </svg>
                    <span>Review on Facebook</span>
                  </div>
                </a>
              )}
              
              {/* Private Feedback Button */}
              <button
                onClick={() => setFeedback({...feedback, type: "private"})}
                className="block bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-semibold text-center transition-colors w-full text-lg"
              >
                💬 Share Private Feedback
              </button>
            </div>
            
            <p className="text-sm text-gray-500 text-center mt-6">
              Choose the platform that works best for you
            </p>
          </div>
        )}

        {/* Private Feedback Form - Shows automatically when type is "private" */}
        {feedback.type === "private" && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Private Feedback for {business?.name}
              </h2>
              <button
                onClick={showPlatformChoice}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Other Review Options
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <span className="text-green-800 font-semibold text-lg">{success}</span>
                <div className="mt-4 space-y-2">
                  <button 
                    onClick={() => setFeedback({ rating: "", comment: "", type: "private" })}
                    className="text-blue-600 hover:text-blue-800 font-medium block mx-auto"
                  >
                    Leave another review →
                  </button>
                  <div className="text-sm text-gray-600">
                    or{" "}
                    <button 
                      onClick={showPlatformChoice}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      explore other review platforms
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!success && (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-4">
                    How would you rate your experience?
                  </label>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFeedback({...feedback, rating: rating.toString()})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          feedback.rating === rating.toString()
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-300 hover:border-yellow-400'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-6 h-6 ${
                                star <= rating && feedback.rating === rating.toString() 
                                  ? 'text-yellow-500' 
                                  : star <= rating 
                                    ? 'text-yellow-400' 
                                    : 'text-gray-300'
                              }`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-4">
                    Tell us about your experience:
                  </label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                    placeholder="Please share your thoughts about our service. Your feedback helps us improve and serve you better."
                    required
                    rows={5}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting || !feedback.rating}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                    submitting || !feedback.rating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerFeedbackPage;