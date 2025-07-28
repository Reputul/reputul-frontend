import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BusinessPublicPage = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: "", comment: "" });
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bizRes = await axios.get(`http://localhost:8080/api/businesses/${id}`);
        const reviewRes = await axios.get(`http://localhost:8080/api/reviews/business/${id}`);
        setBusiness(bizRes.data);
        setReviews(reviewRes.data);
      } catch (err) {
        console.error("Error fetching business info:", err);
        setError("Business not found or error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, [e.target.name]: e.target.value });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!newReview.rating || !newReview.comment.trim()) {
        setError("Please provide both rating and comment");
        return;
      }

      await axios.post(`http://localhost:8080/api/reviews/public/${id}`, {
        rating: parseInt(newReview.rating),
        comment: newReview.comment.trim()
      });

      setNewReview({ rating: "", comment: "" });
      setSuccess("Thank you for your review! It has been submitted successfully.");

      // Refresh reviews and business data
      const reviewRes = await axios.get(`http://localhost:8080/api/reviews/business/${id}`);
      const bizRes = await axios.get(`http://localhost:8080/api/businesses/${id}`);
      setReviews(reviewRes.data);
      setBusiness(bizRes.data);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredAndSortedReviews = () => {
    let filtered = reviews;
    
    if (filterBy) {
      filtered = filtered.filter(review => review.rating >= parseInt(filterBy));
    }
    
    switch (sortBy) {
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return filtered;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const getBadgeColor = (badge) => {
    if (badge === 'Top Rated') return 'bg-green-100 text-green-800 border-green-200';
    if (badge === 'Rising Star') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Business Profile...</h2>
          <p className="text-gray-600">Please wait while we fetch the latest information</p>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{business.name}</h1>
            <div className="flex items-center justify-center space-x-6 text-lg">
              <span className="flex items-center">
                <span className="mr-2">🏷️</span>
                {business.industry}
              </span>
              {business.badge && (
                <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getBadgeColor(business.badge)}`}>
                  🏅 {business.badge}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-300">{getAverageRating()}</div>
              <div className="text-yellow-300 text-xl mb-2">
                {'★'.repeat(Math.round(getAverageRating()))}{'☆'.repeat(5 - Math.round(getAverageRating()))}
              </div>
              <div className="text-white/80">Average Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold">{reviews.length}</div>
              <div className="text-white/80">Customer Reviews</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-white/80">Recommended</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-blue-600">📞</span>
                <div>
                  <div className="font-semibold text-gray-900">Phone</div>
                  <div className="text-gray-600">{business.phone || 'Not provided'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-600">🌐</span>
                <div>
                  <div className="font-semibold text-gray-900">Website</div>
                  {business.website ? (
                    <a href={business.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      {business.website}
                    </a>
                  ) : (
                    <div className="text-gray-600">Not provided</div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-blue-600">📍</span>
                <div>
                  <div className="font-semibold text-gray-900">Address</div>
                  <div className="text-gray-600">{business.address || 'Not provided'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-600">⭐</span>
                <div>
                  <div className="font-semibold text-gray-900">Reputation Score</div>
                  <div className="text-gray-600">{business.reputationScore || '0.0'}/5.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rating Breakdown</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center space-x-4">
                  <span className="w-12 text-sm font-medium">{rating} ⭐</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                      style={{
                        width: `${reviews.length > 0 ? (ratingDistribution[rating] / reviews.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="w-8 text-sm text-gray-600">{ratingDistribution[rating]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Customer Reviews</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All ratings</option>
                <option value="5">5★ only</option>
                <option value="4">4★ and up</option>
                <option value="3">3★ and up</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to leave a review for this business!</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {getFilteredAndSortedReviews().map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="text-yellow-500 text-lg">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{review.rating}/5</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  {review.source && (
                    <div className="mt-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        review.source === 'manual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {review.source === 'manual' ? 'Verified Customer' : 'Public Review'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Leave a Review</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">❌</span>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span className="text-green-800">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                How would you rate your experience?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview({...newReview, rating: rating.toString()})}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      newReview.rating === rating.toString()
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-300 hover:border-yellow-400'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className={`text-2xl ${
                        newReview.rating === rating.toString() ? 'text-yellow-500' : 'text-gray-400'
                      }`}>
                        {'★'.repeat(rating)}
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Tell others about your experience:
              </label>
              <textarea
                name="comment"
                placeholder="Share your thoughts about the service, quality, and overall experience..."
                value={newReview.comment}
                onChange={handleReviewChange}
                required
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={submitting || !newReview.rating}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                submitting || !newReview.rating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting Review...</span>
                </div>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessPublicPage;