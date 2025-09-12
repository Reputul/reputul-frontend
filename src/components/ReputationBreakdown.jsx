import React, { useState } from 'react';
import WilsonRating from './WilsonRating';

/**
 * Reputation Breakdown Component
 * Shows detailed Wilson Score metrics and explanations
 */
const ReputationBreakdown = ({ businessId, breakdown, className = '' }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!breakdown) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 76) return 'text-green-600 bg-green-50';
    if (score >= 46) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 76) return 'bg-green-500';
    if (score >= 46) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressBarColor = (score) => {
    if (score >= 76) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (score >= 46) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-r from-red-400 to-red-600';
  };

  // Component sub-elements
  const ScoreBar = ({ label, score, description, icon }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">{icon}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(score)}`}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getProgressBarColor(score)} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(score, 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );

  const InfoTooltip = ({ children, content }) => (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-50 w-64 p-3 mt-1 text-xs bg-gray-900 text-white rounded-lg shadow-lg -left-32 transform transition-all duration-200">
        {content}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <span>Reputation Metrics</span>
              <InfoTooltip content="Our Wilson Score algorithm provides statistically reliable ratings by accounting for review volume and confidence levels, preventing businesses with few perfect reviews from outranking established businesses.">
                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </InfoTooltip>
            </h3>
            <p className="text-sm text-gray-600">Advanced reputation analysis powered by Wilson Score</p>
          </div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
          >
            {showExplanation ? 'Hide Details' : 'How It Works'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Public & Internal Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Public Wilson Rating */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-blue-900">Public Rating</h4>
              <InfoTooltip content="This is the star rating customers see on your public profiles and widgets. Based on Wilson Score confidence intervals for statistical reliability.">
                <svg className="w-4 h-4 text-blue-600 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </InfoTooltip>
            </div>
            <div className="flex items-center justify-between">
              <WilsonRating 
                rating={breakdown.reputulRating} 
                totalReviews={breakdown.totalReviews}
                size="lg"
                showNumber={true}
                showConfidence={true}
              />
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Wilson Score with {breakdown.totalReviews} reviews
            </p>
          </div>

          {/* Internal Composite Score */}
          <div className={`rounded-lg p-4 ${getScoreColor(breakdown.compositeScore)}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Internal Score</h4>
              <InfoTooltip content="Your comprehensive reputation score (0-100) combining quality, velocity, and responsiveness. Use this to track improvement opportunities.">
                <svg className="w-4 h-4 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </InfoTooltip>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold">
                {Math.round(breakdown.compositeScore)}
              </div>
              <div className="flex-1">
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreBadgeColor(breakdown.compositeScore)}`}
                    style={{ width: `${Math.min(breakdown.compositeScore, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 opacity-75">
                  {breakdown.compositeScore >= 76 ? 'Excellent' : 
                   breakdown.compositeScore >= 46 ? 'Good' : 'Needs Attention'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Component Breakdown</h4>
          
          <ScoreBar
            label="Quality Score"
            score={breakdown.qualityScore}
            description={`Wilson Score confidence from ${breakdown.positiveReviews}/${breakdown.totalReviews} positive reviews (60% weight)`}
            icon="💎"
          />
          
          <ScoreBar
            label="Velocity Score"
            score={breakdown.velocityScore}
            description={`Review gathering pace: ${breakdown.reviewsLast90d} reviews in last 90 days (25% weight)`}
            icon="🚀"
          />
          
          <ScoreBar
            label="Responsiveness Score"
            score={breakdown.responsivenessScore}
            description="Response rate and speed to customer reviews (15% weight)"
            icon="⚡"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{breakdown.totalReviews}</div>
            <div className="text-xs text-gray-500">Total Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{breakdown.positiveReviews}</div>
            <div className="text-xs text-gray-500">Positive (4-5★)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{breakdown.reviewsLast90d}</div>
            <div className="text-xs text-gray-500">Recent (90d)</div>
          </div>
        </div>

        {/* Algorithm Explanation (Collapsible) */}
        {showExplanation && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-4">
            <h5 className="font-semibold text-gray-900">How Wilson Score Works</h5>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Wilson Score Confidence:</strong> Unlike simple averages, Wilson Score accounts 
                for statistical uncertainty. A business with 2 perfect reviews won't outrank one with 
                50 reviews averaging 4.3 stars.
              </p>
              <p>
                <strong>Composite Formula:</strong> 60% Quality + 25% Velocity + 15% Responsiveness. 
                Quality uses Wilson Score lower bound with recency weighting.
              </p>
              <p>
                <strong>Competitive Advantage:</strong> This prevents manipulation and provides fairer 
                ratings than simple averages used by most review platforms.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReputationBreakdown;