import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useNavigate } from "react-router-dom";
import { buildUrl } from "../config/api";

// Import insights components
import OverallRatingSection from "../components/insights/OverallRatingSection";
import RatingGoalsSection from "../components/insights/RatingGoalsSection";
import PlatformPerformanceChart from "../components/insights/PlatformPerformanceChart";
import SentimentBreakdown from "../components/insights/SentimentBreakdown";
import ReviewTrendsChart from "../components/insights/ReviewTrendsChart";

const InsightsPage = () => {
  const { token } = useAuth();
  const { selectedBusiness } = useBusiness();
  const navigate = useNavigate();

  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30); // Default 30 days

  // Fetch insights data
  const fetchInsightsData = useCallback(async () => {
    if (!token || !selectedBusiness) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch multiple endpoints and combine data
      const [reputationRes, reviewsRes, summaryRes] = await Promise.all([
        axios.get(
          buildUrl(`/api/v1/reputation/business/${selectedBusiness.id}/breakdown`),
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          buildUrl(`/api/v1/reviews/business/${selectedBusiness.id}`),
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          buildUrl(`/api/v1/businesses/${selectedBusiness.id}/review-summary`),
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const reviews = reviewsRes.data || [];
      const reputation = reputationRes.data;
      const summary = summaryRes.data;

      // Process data for insights
      const processedData = processInsightsData(reviews, reputation, summary);
      setInsightsData(processedData);

    } catch (err) {
      console.error("Error fetching insights data:", err);
      // Set empty data on error
      setInsightsData({
        overallRating: 0,
        totalReviews: 0,
        reviewDistribution: [],
        reputationMetrics: { score: 0, badge: 'Unranked', wilsonScore: 0 },
        ratingGoals: [],
        platformPerformance: [],
        sentiment: { positive: 0, negative: 0 },
        timeSeries: [],
        statistics: { averagePerMonth: 0, totalSinceJoining: 0, memberSince: null }
      });
    } finally {
      setLoading(false);
    }
  }, [token, selectedBusiness, period]);

  // Process raw data into insights format
  const processInsightsData = (reviews, reputation, summary) => {
    // Calculate review distribution by platform
    const distributionMap = {};
    reviews.forEach(review => {
      const source = review.source || 'DIRECT';
      if (!distributionMap[source]) {
        distributionMap[source] = { count: 0, totalRating: 0 };
      }
      distributionMap[source].count++;
      distributionMap[source].totalRating += review.rating;
    });

    const reviewDistribution = Object.entries(distributionMap).map(([platform, data]) => ({
      platform: platform.charAt(0) + platform.slice(1).toLowerCase(),
      count: data.count,
      avgRating: (data.totalRating / data.count).toFixed(1)
    }));

    // Calculate rating goals (how many 5-star reviews needed)
    const currentSum = summary.averageRating * summary.totalReviews;
    const calculateReviewsNeeded = (targetRating) => {
      if (summary.averageRating >= targetRating) return 0;
      return Math.ceil((targetRating * summary.totalReviews - currentSum) / (5 - targetRating));
    };

    const ratingGoals = [
      { 
        target: 4.8, 
        reviewsNeeded: calculateReviewsNeeded(4.8),
        progress: Math.min(100, (summary.averageRating / 4.8) * 100)
      },
      { 
        target: 4.9, 
        reviewsNeeded: calculateReviewsNeeded(4.9),
        progress: Math.min(100, (summary.averageRating / 4.9) * 100)
      },
      { 
        target: 5.0, 
        reviewsNeeded: calculateReviewsNeeded(5.0),
        progress: Math.min(100, (summary.averageRating / 5.0) * 100)
      },
    ];

    // Platform performance
    const platformPerformance = reviewDistribution.map(item => ({
      name: item.platform,
      rating: parseFloat(item.avgRating),
      count: item.count,
      color: getPlatformColor(item.platform)
    }));

    // Sentiment breakdown
    const positiveReviews = reviews.filter(r => r.rating >= 4).length;
    const negativeReviews = reviews.filter(r => r.rating <= 3).length;
    const sentiment = {
      positive: { count: positiveReviews, percentage: Math.round((positiveReviews / reviews.length) * 100) || 0 },
      negative: { count: negativeReviews, percentage: Math.round((negativeReviews / reviews.length) * 100) || 0 }
    };

    // Time series data (group by month)
    const timeSeriesMap = {};
    reviews.forEach(review => {
      const date = new Date(review.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!timeSeriesMap[monthKey]) {
        timeSeriesMap[monthKey] = { count: 0, totalRating: 0 };
      }
      timeSeriesMap[monthKey].count++;
      timeSeriesMap[monthKey].totalRating += review.rating;
    });

    const timeSeries = Object.entries(timeSeriesMap)
      .map(([month, data]) => ({
        date: month,
        count: data.count,
        avgRating: (data.totalRating / data.count).toFixed(1)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12); // Last 12 months

    // Statistics
    const averagePerMonth = timeSeries.length > 0 
      ? (reviews.length / timeSeries.length).toFixed(1)
      : 0;

    return {
      overallRating: summary.averageRating || 0,
      totalReviews: summary.totalReviews || 0,
      reviewDistribution,
      reputationMetrics: {
        score: Math.round(reputation.reputulRating * 10) || 0,
        badge: selectedBusiness.badge || 'Unranked',
        wilsonScore: reputation.reputulRating || 0
      },
      ratingGoals,
      platformPerformance,
      sentiment,
      timeSeries,
      statistics: {
        averagePerMonth: parseFloat(averagePerMonth),
        totalSinceJoining: reviews.length,
        memberSince: selectedBusiness.createdAt
      }
    };
  };

  // Get platform color
  const getPlatformColor = (platform) => {
    const colors = {
      'Google': '#4285F4',
      'Facebook': '#1877F2',
      'Reputul': '#8B5CF6',
      'Direct': '#10B981'
    };
    return colors[platform] || '#6B7280';
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!insightsData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Overall Rating', insightsData.overallRating],
      ['Total Reviews', insightsData.totalReviews],
      ['Reputation Score', insightsData.reputationMetrics.score],
      ['Badge', insightsData.reputationMetrics.badge],
      ['Positive Reviews', `${insightsData.sentiment.positive.percentage}%`],
      ['Negative Reviews', `${insightsData.sentiment.negative.percentage}%`],
      ['Average Per Month', insightsData.statistics.averagePerMonth],
      [''],
      ['Platform Performance'],
      ['Platform', 'Rating', 'Count'],
      ...insightsData.platformPerformance.map(p => [p.name, p.rating, p.count])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedBusiness.name}-insights-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Export to PDF (placeholder)
  const handleExportPDF = () => {
    alert('PDF export coming soon! For now, use the browser print function (Ctrl/Cmd + P)');
  };

  useEffect(() => {
    if (selectedBusiness) {
      fetchInsightsData();
    }
  }, [selectedBusiness, fetchInsightsData]);

  // No business selected
  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select a business from the sidebar</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 mb-2 flex items-center space-x-1 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Insights for {selectedBusiness.name}
            </h1>
            <p className="text-gray-600 mt-1">Detailed analytics and performance metrics</p>
          </div>

          {/* Period Selector & Export */}
          <div className="flex items-center space-x-3">
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
              <option value={-1}>All time</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
            >
              Download CSV
            </button>

            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-sm"
            >
              Generate PDF
            </button>
          </div>
        </div>

        {/* Insights Sections */}
        {insightsData && (
          <div className="space-y-8">
            <OverallRatingSection 
              overallRating={insightsData.overallRating}
              totalReviews={insightsData.totalReviews}
              distribution={insightsData.reviewDistribution}
            />

            <RatingGoalsSection
              currentRating={insightsData.overallRating}
              reputationMetrics={insightsData.reputationMetrics}
              goals={insightsData.ratingGoals}
            />

            <PlatformPerformanceChart
              platforms={insightsData.platformPerformance}
            />

            <SentimentBreakdown
              positive={insightsData.sentiment.positive}
              negative={insightsData.sentiment.negative}
            />

            <ReviewTrendsChart
              timeSeriesData={insightsData.timeSeries}
              averagePerMonth={insightsData.statistics.averagePerMonth}
              totalSinceJoining={insightsData.statistics.totalSinceJoining}
              memberSince={insightsData.statistics.memberSince}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;