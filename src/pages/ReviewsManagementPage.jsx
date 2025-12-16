import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import axios from 'axios';
import { buildUrl, API_ENDPOINTS } from '../config/api';
import PlatformIcon from '../components/PlatformIcon';
import { Search, Filter, Download, Star } from 'lucide-react';

const ReviewManagementPage = () => {
  const { token } = useAuth();
  const { selectedBusiness } = useBusiness();

  // State
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    timePeriod: 'all', // all, 7days, 30days, 90days, year
    sentiment: 'all', // all, positive, neutral, negative
    platform: 'all', // all, google_my_business, facebook, reputul
    rating: 'all', // all, 5, 4, 3, 2, 1
  });

  const [showFilters, setShowFilters] = useState(false);

  // Fetch reviews
  useEffect(() => {
    if (!selectedBusiness || !token) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          buildUrl(API_ENDPOINTS.REVIEWS.BY_BUSINESS(selectedBusiness.id)),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReviews(response.data || []);
        setFilteredReviews(response.data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
        setFilteredReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [selectedBusiness, token]);

  // Apply filters whenever filters or reviews change
  useEffect(() => {
    let filtered = [...reviews];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.customerName?.toLowerCase().includes(searchLower) ||
          review.comment?.toLowerCase().includes(searchLower)
      );
    }

    // Time period filter
    if (filters.timePeriod !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.timePeriod) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter(
        (review) => new Date(review.createdAt) >= cutoffDate
      );
    }

    // Sentiment filter (based on rating)
    if (filters.sentiment !== 'all') {
      switch (filters.sentiment) {
        case 'positive':
          filtered = filtered.filter((review) => review.rating >= 4);
          break;
        case 'neutral':
          filtered = filtered.filter((review) => review.rating === 3);
          break;
        case 'negative':
          filtered = filtered.filter((review) => review.rating <= 2);
          break;
        default:
          break;
      }
    }

    // Platform filter
    if (filters.platform !== 'all') {
      filtered = filtered.filter(
        (review) => review.source?.toLowerCase() === filters.platform.toLowerCase()
      );
    }

    // Rating filter
    if (filters.rating !== 'all') {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(filters.rating)
      );
    }

    setFilteredReviews(filtered);
  }, [filters, reviews]);

  // Platform info mapping
  const getPlatformInfo = (source) => {
    const platforms = {
      'GOOGLE': { 
        name: 'Google', 
        id: 'GOOGLE_MY_BUSINESS',
        color: 'text-blue-600', 
        bg: 'bg-blue-50' 
      },
      'GOOGLE_MY_BUSINESS': { 
        name: 'Google', 
        id: 'GOOGLE_MY_BUSINESS',
        color: 'text-blue-600', 
        bg: 'bg-blue-50' 
      },
      'FACEBOOK': { 
        name: 'Facebook', 
        id: 'FACEBOOK',
        color: 'text-blue-700', 
        bg: 'bg-blue-50' 
      },
      'REPUTUL': { 
        name: 'Reputul', 
        id: 'REPUTUL',
        color: 'text-purple-600', 
        bg: 'bg-purple-50' 
      },
      'DIRECT': { 
        name: 'Direct', 
        id: 'REPUTUL',
        color: 'text-green-600', 
        bg: 'bg-green-50' 
      },
    };
    return platforms[source?.toUpperCase()] || { 
      name: source || 'Unknown',
      id: 'REPUTUL',
      color: 'text-gray-600', 
      bg: 'bg-gray-50' 
    };
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

  // Get sentiment badge
  const getSentimentBadge = (rating) => {
    if (rating >= 4) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Positive
        </span>
      );
    } else if (rating === 3) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Neutral
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Negative
        </span>
      );
    }
  };

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ['Date', 'Customer', 'Rating', 'Platform', 'Comment'].join(','),
      ...filteredReviews.map((review) =>
        [
          formatDate(review.createdAt),
          review.customerName || 'Anonymous',
          review.rating,
          getPlatformInfo(review.source).name,
          `"${(review.comment || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews-${selectedBusiness?.name || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Stats
  const stats = {
    total: filteredReviews.length,
    avgRating: filteredReviews.length > 0
      ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
      : 0,
    positive: filteredReviews.filter((r) => r.rating >= 4).length,
    neutral: filteredReviews.filter((r) => r.rating === 3).length,
    negative: filteredReviews.filter((r) => r.rating <= 2).length,
  };

  if (!selectedBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please select a business to view reviews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
          <p className="text-gray-600">
            Manage and analyze reviews for {selectedBusiness.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Positive</p>
            <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Neutral</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.neutral}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Negative</p>
            <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter size={20} />
              Filters
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={filteredReviews.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
              {/* Time Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period
                </label>
                <select
                  value={filters.timePeriod}
                  onChange={(e) => setFilters({ ...filters, timePeriod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              {/* Sentiment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sentiment
                </label>
                <select
                  value={filters.sentiment}
                  onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive (4-5 ⭐)</option>
                  <option value="neutral">Neutral (3 ⭐)</option>
                  <option value="negative">Negative (1-2 ⭐)</option>
                </select>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={filters.platform}
                  onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Platforms</option>
                  <option value="google_my_business">Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="reputul">Reputul</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-600">
                {filters.search || filters.timePeriod !== 'all' || filters.sentiment !== 'all' || filters.platform !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start collecting reviews to see them here'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReviews.map((review) => {
                const platformInfo = getPlatformInfo(review.source);
                
                return (
                  <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 ${platformInfo.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className="text-lg font-bold text-gray-700">
                          {review.customerName?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
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
                          <div className="flex items-center gap-2">
                            {getSentimentBadge(review.rating)}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
                              <PlatformIcon platform={platformInfo.id} size="sm" />
                              <span className="text-xs font-semibold text-gray-700">
                                {platformInfo.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Comment */}
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        )}

                        {/* Platform Response */}
                        {review.platformResponse && (
                          <div className="mt-3 pl-4 border-l-2 border-blue-200 bg-blue-50 p-3 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              Business Response
                            </p>
                            <p className="text-sm text-blue-800">
                              {review.platformResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewManagementPage;