import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BusinessPublicPage = () => {
  const { id } = useParams();
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
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
        const bizRes = await axios.get(`${API_BASE}/api/businesses/${id}`);
        const reviewRes = await axios.get(`${API_BASE}/api/reviews/business/${id}`);
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

      await axios.post(`${API_BASE}/api/reviews/public/${id}`, {
        rating: parseInt(newReview.rating, 10),
        comment: newReview.comment.trim()
      });

      setNewReview({ rating: "", comment: "" });
      setSuccess("Thank you for your review! It has been submitted successfully.");

      // Refresh reviews and business data
      const reviewRes = await axios.get(`${API_BASE}/api/reviews/business/${id}`);
      const bizRes = await axios.get(`${API_BASE}/api/businesses/${id}`);
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
    let filtered = [...reviews];
    
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
      const r = Number(review.rating);
      if (r >= 1 && r <= 5) distribution[r] += 1;
    });
    return distribution;
  };

  const getBadgeColor = (badge) => {
    if (badge === 'Top Rated') return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg';
    if (badge === 'Rising Star') return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg';
    return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg';
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'C';
  };

  const getRandomColor = (index) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600', 
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Loading Business Profile</h2>
          <p className="text-gray-600">Fetching the latest reviews and information...</p>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const averageRating = getAverageRating();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              {business.badge && (
                <span className={`px-6 py-3 text-sm font-bold rounded-full ${getBadgeColor(business.badge)} animate-pulse`}>
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {business.badge}
                </span>
              )}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              {business.name}
            </h1>
            
            <div className="flex items-center justify-center space-x-8 text-xl text-blue-100 mb-8">
              <span className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {business.industry}
              </span>
            </div>
          </div>
          
          {/* Enhanced Stats Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              <div className="text-5xl font-black text-yellow-300 mb-4">{averageRating}</div>
              <div className="text-yellow-300 text-2xl mb-4 flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-6 h-6 ${i < Math.round(averageRating) ? 'text-yellow-300' : 'text-yellow-300/30'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <div className="text-white/90 font-semibold">Average Rating</div>
              <div className="text-blue-200 text-sm mt-1">Based on {reviews.length} reviews</div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              <div className="text-5xl font-black text-white mb-4">{reviews.length}</div>
              <div className="text-white/90 font-semibold">Customer Reviews</div>
              <div className="text-blue-200 text-sm mt-1">Verified feedback</div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              <div className="text-5xl font-black text-green-300 mb-4">
                {reviews.length > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100) : 100}%
              </div>
              <div className="text-white/90 font-semibold">Recommended</div>
              <div className="text-blue-200 text-sm mt-1">4+ star ratings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Enhanced Business Information */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 mb-12 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3 mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Business Information</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Phone</div>
                  <div className="text-gray-600 text-lg">{business.phone || 'Contact information not provided'}</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="bg-green-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Website</div>
                  {business.website ? (
                    <a href={business.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline text-lg transition-colors">
                      {business.website}
                    </a>
                  ) : (
                    <div className="text-gray-600 text-lg">Website not provided</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="bg-purple-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Address</div>
                  <div className="text-gray-600 text-lg">{business.address || 'Address not provided'}</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="bg-yellow-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Reputation Score</div>
                  <div className="text-gray-600 text-lg">{business.reputationScore || averageRating}/5.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Rating Distribution */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 mb-12 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Rating Breakdown</h2>
            </div>
            
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center space-x-6">
                  <span className="w-16 text-lg font-bold text-gray-700 flex items-center">
                    {rating}
                    <svg className="w-5 h-5 text-yellow-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-1000 ease-out shadow-sm"
                      style={{
                        width: `${reviews.length > 0 ? (ratingDistribution[rating] / reviews.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="w-12 text-lg font-semibold text-gray-600">{ratingDistribution[rating]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Reviews Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 mb-12 hover:shadow-3xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-10">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium"
              >
                <option value="">All ratings</option>
                <option value="5">5★ only</option>
                <option value="4">4★ and up</option>
                <option value="3">3★ and up</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Reviews Yet</h3>
              <p className="text-gray-600 text-lg">Be the first to share your experience with this business!</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              {getFilteredAndSortedReviews().map((review, index) => (
                <div key={review.id} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start space-x-6">
                    {/* Customer Avatar */}
                    <div className={`w-16 h-16 rounded-2xl ${getRandomColor(index)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {getInitials('Customer')}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex text-yellow-500 text-xl">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-6 h-6 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                            </div>
                            <span className="text-lg font-bold text-gray-900">{review.rating}/5</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-600">Verified Customer</div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-500">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '—'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed text-lg mb-4">{review.comment}</p>
                      
                      {review.source && (
                        <div className="flex justify-between items-center">
                          <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
                            review.source === 'manual' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            {review.source === 'manual' ? 'Verified Customer' : 'Public Review'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Review Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Share Your Experience</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 animate-shake">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800 font-semibold text-lg">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8 animate-bounce">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-green-800 font-semibold text-lg">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-8">
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-6">
                How would you rate your experience?
              </label>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview({...newReview, rating: rating.toString()})}
                    className={`p-6 rounded-2xl border-3 transition-all duration-200 transform hover:scale-105 ${
                      newReview.rating === rating.toString()
                        ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105'
                        : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-8 h-8 ${
                            star <= rating && newReview.rating === rating.toString() 
                              ? 'text-yellow-500' 
                              : star <= rating 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                          }`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-700">
                        {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-6">
                Tell others about your experience:
              </label>
              <textarea
                name="comment"
                placeholder="Share your thoughts about the service quality, professionalism, and overall experience. Your detailed feedback helps other customers make informed decisions..."
                value={newReview.comment}
                onChange={handleReviewChange}
                required
                rows={6}
                className="w-full p-6 border-3 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none text-lg"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={submitting || !newReview.rating}
              className={`w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
                submitting || !newReview.rating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-3xl hover:scale-105 text-white'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Submitting Your Review...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Submit Your Review</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessPublicPage;