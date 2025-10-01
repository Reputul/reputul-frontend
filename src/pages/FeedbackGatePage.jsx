import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { buildUrl } from '../config/api';

const FeedbackGatePage = () => {
  const { customerId } = useParams();
  
  const [customer, setCustomer] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [error, setError] = useState("");
  const [showRouting, setShowRouting] = useState(false);
  const [routingDecision, setRoutingDecision] = useState(null);

  useEffect(() => {
    const fetchCustomerGateInfo = async () => {
      try {
        const response = await axios.get(buildUrl(`/api/v1/customers/${customerId}/gate-info`));
        setCustomer(response.data.customer);
        setBusiness(response.data.business);
      } catch (err) {
        console.error("Error fetching customer gate info:", err);
        setError("Customer not found or link has expired.");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerGateInfo();
    }
  }, [customerId]);

  const handleRatingSubmit = async () => {
    if (!selectedRating) return;
    
    setSubmitting(true);
    setError("");

    try {
      const response = await axios.post(buildUrl(`/api/v1/customers/${customerId}/rate`), {
        rating: selectedRating,
        source: "feedback_gate"
      });

      setRoutingDecision(response.data);
      setShowRouting(true);
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Failed to process your rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRate, interactive = false, size = "large" }) => {
    const sizeClasses = {
      small: "w-6 h-6",
      medium: "w-8 h-8", 
      large: "w-12 h-12"
    };

    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate(star)}
            className={`${sizeClasses[size]} transition-all duration-200 ${
              interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            }`}
          >
            <svg 
              className={`w-full h-full ${
                star <= rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`} 
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const getRatingDescription = (rating) => {
    const descriptions = {
      1: "Poor - We need to improve",
      2: "Fair - Below expectations", 
      3: "Good - Meets expectations",
      4: "Very Good - Exceeds expectations",
      5: "Excellent - Outstanding service"
    };
    return descriptions[rating] || "";
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

  if (showRouting && routingDecision) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thank you for rating us {selectedRating} star{selectedRating !== 1 ? 's' : ''}!
              </h1>
              <div className="flex justify-center mb-4">
                <StarRating rating={selectedRating} interactive={false} size="medium" />
              </div>
              <p className="text-gray-600">{getRatingDescription(selectedRating)}</p>
            </div>
          </div>

          {/* Routing Decision Display */}
          {routingDecision.routingDecision === 'public_reviews' ? (
            // High rating (4-5 stars) - Show all public platforms
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  🌟 Fantastic! Would you mind sharing your experience publicly?
                </h2>
                <p className="text-gray-600">
                  Your positive review helps other customers find us and supports our business. 
                  Choose whichever platform works best for you:
                </p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                {/* Google Review Button */}
                {routingDecision.reviewUrls?.google && (
                  <a
                    href={routingDecision.reviewUrls.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-semibold text-center transition-all duration-200 w-full text-lg border-2 border-blue-500 hover:border-blue-600 hover:shadow-lg transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>⭐ Review on Google</span>
                    </div>
                  </a>
                )}
                
                {/* Facebook Review Button */}
                {routingDecision.reviewUrls?.facebook && (
                  <a
                    href={routingDecision.reviewUrls.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-semibold text-center transition-all duration-200 w-full text-lg border-2 border-blue-600 hover:border-blue-700 hover:shadow-lg transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                        <path d="M16.671 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.632H7.078v3.47h3.047v8.385a12.118 12.118 0 003.75 0v-8.385h2.796z" fill="#fff"/>
                      </svg>
                      <span>👍 Review on Facebook</span>
                    </div>
                  </a>
                )}
                
                {/* Yelp Review Button */}
                {routingDecision.reviewUrls?.yelp && (
                  <a
                    href={routingDecision.reviewUrls.yelp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-semibold text-center transition-all duration-200 w-full text-lg border-2 border-red-500 hover:border-red-600 hover:shadow-lg transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-red-500 text-2xl">⭐</span>
                      <span>Review on Yelp</span>
                    </div>
                  </a>
                )}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  ✅ Google Compliant: All platforms are equally available to all customers
                </p>
                <a 
                  href={`/feedback/${customerId}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Or share private feedback instead →
                </a>
              </div>
            </div>
          ) : (
            // Low rating (1-3 stars) - Route to private feedback
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-blue-600 mb-4">
                  💬 We'd love to hear more about your experience
                </h2>
                <p className="text-gray-600">
                  Your feedback is important to us. Please share your thoughts privately 
                  so we can improve our service and make things right.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <a 
                  href={`/feedback/${customerId}`}
                  className="block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-center transition-all duration-200 w-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  💬 Share Your Feedback Privately
                </a>
                
                <p className="text-center text-sm text-gray-500 mt-6">
                  Your private feedback helps us improve our service
                </p>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-400 mb-2">
                  ✅ Google Compliant: All review options are available to all customers
                </p>
                <details className="text-left max-w-md mx-auto">
                  <summary className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer font-medium">
                    View public review options
                  </summary>
                  <div className="mt-4 space-y-2">
                    {routingDecision.reviewUrls?.google && (
                      <a href={routingDecision.reviewUrls.google} target="_blank" rel="noopener noreferrer" 
                         className="block text-sm text-blue-600 hover:text-blue-800">
                        • Google Reviews
                      </a>
                    )}
                    {routingDecision.reviewUrls?.facebook && (
                      <a href={routingDecision.reviewUrls.facebook} target="_blank" rel="noopener noreferrer" 
                         className="block text-sm text-blue-600 hover:text-blue-800">
                        • Facebook Reviews  
                      </a>
                    )}
                    {routingDecision.reviewUrls?.yelp && (
                      <a href={routingDecision.reviewUrls.yelp} target="_blank" rel="noopener noreferrer" 
                         className="block text-sm text-blue-600 hover:text-blue-800">
                        • Yelp Reviews
                      </a>
                    )}
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main rating selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank you for choosing {business?.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Hi {customer?.name}, we hope you were satisfied with your {customer?.serviceType} service.
            </p>
            <p className="text-gray-500">
              Service Date: {customer?.serviceDate ? new Date(customer.serviceDate).toLocaleDateString() : 'Recent'}
            </p>
          </div>
        </div>

        {/* Rating Selection */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How would you rate your overall experience?
            </h2>
            <p className="text-gray-600 text-lg">
              Your honest feedback helps us improve and serve you better
            </p>
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

          {/* Star Rating Selection */}
          <div className="flex flex-col items-center space-y-8">
            <div className="flex justify-center">
              <StarRating 
                rating={selectedRating} 
                onRate={setSelectedRating} 
                interactive={true}
                size="large"
              />
            </div>

            {selectedRating && (
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {getRatingDescription(selectedRating)}
                </p>
                <p className="text-sm text-gray-600">
                  You selected {selectedRating} star{selectedRating !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            <button
              onClick={handleRatingSubmit}
              disabled={!selectedRating || submitting}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                selectedRating && !submitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Continue"
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              ✅ Google Compliant: All customers see all review options
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackGatePage;