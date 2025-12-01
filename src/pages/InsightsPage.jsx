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
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(30); // Default 30 days

  // Fetch insights data using the NEW SINGLE ENDPOINT
  const fetchInsightsData = useCallback(async () => {
    if (!token || !selectedBusiness) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching insights for business ${selectedBusiness.id} with period ${period}d`);

      // Use the NEW single insights endpoint
      const response = await axios.get(
        buildUrl(`/api/v1/insights/business/${selectedBusiness.id}?period=${period}d`),
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        }
      );

      console.log("Insights API Response:", response.data);
      setInsightsData(response.data);

    } catch (err) {
      console.error("Error fetching insights data:", err);
      
      if (err.response?.status === 404) {
        setError("Business not found or access denied");
      } else if (err.response?.status === 401) {
        setError("Authentication required");
      } else if (err.response?.status === 500) {
        setError("Server error - please check backend logs");
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timeout - please try again");
      } else {
        setError(`Failed to load insights data: ${err.message}`);
      }

      // Set empty data structure on error for graceful degradation
      setInsightsData({
        overallRating: 0,
        totalReviews: 0,
        reviewDistribution: [],
        reputationMetrics: { score: 0, badge: 'Unranked', wilsonScore: 0 },
        ratingGoals: [
          { target: 4.8, reviewsNeeded: 0, progress: 0 },
          { target: 4.9, reviewsNeeded: 0, progress: 0 },
          { target: 5.0, reviewsNeeded: 0, progress: 0 }
        ],
        platformPerformance: [],
        sentiment: { 
          positive: { count: 0, percentage: 0 }, 
          negative: { count: 0, percentage: 0 } 
        },
        timeSeries: [],
        statistics: { 
          averagePerMonth: 0, 
          totalSinceJoining: 0, 
          memberSince: null 
        }
      });
    } finally {
      setLoading(false);
    }
  }, [token, selectedBusiness, period]);

  // Get platform color (keep this helper function for consistency)
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Insights</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={fetchInsightsData}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded transition-colors mr-2"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
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

        {/* Debug Information (only in development) */}
        {process.env.NODE_ENV === 'development' && insightsData && (
          <div className="mt-8 bg-gray-100 p-4 rounded-lg">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Debug: Raw Insights Data
              </summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-96">
                {JSON.stringify(insightsData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;