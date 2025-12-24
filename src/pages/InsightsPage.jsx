import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, TrendingUp, TrendingDown, Users, Target, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { buildUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

// Import your existing components
import BusinessHeader from '../components/dashboard/BusinessHeader';
import ReviewTrendsChart from '../components/insights/ReviewTrendsChart';

const InsightsPage = () => {
  const { token } = useAuth();
  const { selectedBusiness } = useBusiness();
  const [activeTab, setActiveTab] = useState('reviews');
  const [period, setPeriod] = useState(90);
  const [insightsData, setInsightsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch insights data
  useEffect(() => {
    if (!token || !selectedBusiness) {
      setIsLoading(false);
      return;
    }

    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching insights for business ${selectedBusiness.id} with period ${period}d`);
        
        const response = await axios.get(
          buildUrl(`/api/v1/insights/business/${selectedBusiness.id}?period=${period}d`),
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 30000
          }
        );
        
        console.log("Insights API Response:", response.data);
        setInsightsData(response.data);
      } catch (error) {
        console.error('Error fetching insights:', error);
        // Set empty data structure on error
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
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [token, selectedBusiness, period]);

  const tabs = [
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'competitors', label: 'Competitors', icon: BarChart3 }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader businessId={selectedBusiness?.id} />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'reviews' && (
            <ReviewsTab data={insightsData} period={period} setPeriod={setPeriod} />
          )}
          {activeTab === 'campaigns' && <CampaignsTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'competitors' && <CompetitorsTab />}
        </main>
      </div>
    </div>
  );
};

// ============================================
// REVIEWS TAB
// ============================================
const ReviewsTab = ({ data, period, setPeriod }) => {
  const periods = [
    { label: 'Last Week', value: 7 },
    { label: 'Last Month', value: 30 },
    { label: 'Last Year', value: 365 },
    { label: 'All Time', value: 0 }
  ];

  // Extract data with safe fallbacks
  const healthScore = data?.reputationMetrics?.score || 0;
  const badge = data?.reputationMetrics?.badge || 'Unranked';
  const wilsonScore = data?.reputationMetrics?.wilsonScore || 0;
  const overallRating = data?.overallRating || 0;
  const totalReviews = data?.totalReviews || 0;
  const platformPerformance = data?.platformPerformance || [];
  const reviewDistribution = data?.reviewDistribution || [];
  const sentiment = data?.sentiment || { positive: { percentage: 0 }, negative: { percentage: 0 } };
  const ratingGoals = data?.ratingGoals || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Review Insights</h1>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Health Score & Badge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Score Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Health Score</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              healthScore >= 80 ? 'bg-green-100 text-green-800' :
              healthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {healthScore >= 80 ? 'Good' : healthScore >= 60 ? 'Fair' : 'Poor'}
            </span>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {/* Circular Progress */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${healthScore * 4.4} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                  {healthScore}
                </span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            Composite of Quality (60%), Velocity (25%), and Responsiveness (15%)
          </p>
        </div>

        {/* Current Badge Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Badge</h2>
          
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="text-xl font-bold">{badge}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 w-full mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Reputul Score</p>
                <p className="text-2xl font-bold text-gray-900">{healthScore}/100</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Wilson Score</p>
                <p className="text-2xl font-bold text-gray-900">{wilsonScore.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Rating & Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Overall Rating & Review Distribution</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">{overallRating.toFixed(1)}</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(overallRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-900">{totalReviews}</p>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
        </div>

        {/* Platform Distribution */}
        {platformPerformance.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Platform Distribution</h3>
            {platformPerformance.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                  <span className="text-sm text-gray-600">({platform.count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {platform.rating ? platform.rating.toFixed(1) : '0.0'}
                  </span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(platform.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Positive/Negative Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900 mb-1">Positive Reviews</p>
            <p className="text-2xl font-bold text-green-700">
              {sentiment.positive.percentage.toFixed(0)}%
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-900 mb-1">Negative Reviews</p>
            <p className="text-2xl font-bold text-red-700">
              {sentiment.negative.percentage.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Rating Goals */}
      {ratingGoals.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Goals</h2>
          <p className="text-sm text-gray-600 mb-4">5-star reviews needed to reach higher ratings</p>
          
          <div className="space-y-4">
            {ratingGoals.map((goal) => (
              <div key={goal.target} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-24">
                  <span className="text-lg font-bold text-gray-900">{goal.target.toFixed(1)}</span>
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-right w-32">
                  {goal.progress >= 100 ? (
                    <span className="text-sm font-medium text-green-600">✓ Done!</span>
                  ) : (
                    <span className="text-sm text-gray-600">+{goal.reviewsNeeded} needed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Trends Chart */}
      <ReviewTrendsChart 
        timeSeriesData={data?.timeSeries || []}
        averagePerMonth={data?.statistics?.averagePerMonth || 0}
        totalSinceJoining={data?.statistics?.totalSinceJoining || 0}
        memberSince={data?.statistics?.memberSince}
      />

      {/* Platform Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {/* TODO: Add chart component */}
          <p>Ratings across connected review platforms chart will go here</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CAMPAIGNS TAB (Placeholder)
// ============================================
const CampaignsTab = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Campaign Insights</h1>
      
      {/* Campaign Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Sent"
          value="0"
          icon={<Target className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Opened"
          value="0%"
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          title="Engagement"
          value="0%"
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Website Clicked"
          value="0%"
          icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Analytics Coming Soon</h2>
        <p className="text-gray-600">
          Track campaign performance, message engagement, and conversion rates.
        </p>
      </div>
    </div>
  );
};

// ============================================
// TEAM TAB (Placeholder)
// ============================================
const TeamTab = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team Insights</h1>
      
      {/* Team Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Requests Sent"
          value="0"
          icon={<Target className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Engagement Rate"
          value="0%"
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          title="Customer Experience"
          value="0%"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          subtitle="Positive"
        />
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Team Performance Coming Soon</h2>
        <p className="text-gray-600">
          View team member performance, review mentions, and engagement metrics.
        </p>
      </div>
    </div>
  );
};

// ============================================
// COMPETITORS TAB (Placeholder)
// ============================================
const CompetitorsTab = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Competitor Insights</h1>
      
      {/* Placeholder Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Competitor Analysis Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          Compare your performance against competitors in your market.
        </p>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Add Competitors
        </button>
      </div>
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ title, value, icon, subtitle }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default InsightsPage;