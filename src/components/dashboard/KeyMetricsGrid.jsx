import React from 'react';
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const KeyMetricsGrid = ({ metrics, loading }) => {
  const defaultMetrics = {
    totalReviews: 0,
    newReviews: 0,
    avgRating: 0.0,
    engagementRate: 0
  };

  const data = loading ? defaultMetrics : (metrics || defaultMetrics);

  // Helper for Metric Cards
  const MetricCard = ({ title, value, subValue, icon: Icon, trend, colorClass, bgClass }) => (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${bgClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'} bg-slate-50 px-2 py-1 rounded-full`}>
            {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 h-40">
            <div className="w-10 h-10 bg-slate-100 rounded-lg mb-4"></div>
            <div className="h-4 bg-slate-100 rounded w-24 mb-2"></div>
            <div className="h-8 bg-slate-100 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* 1. Total Reviews */}
      <MetricCard 
        title="Total Reviews" 
        value={data.totalReviews.toLocaleString()}
        subValue="Lifetime volume"
        icon={MessageSquare}
        colorClass="text-[#7d2ae8]"
        bgClass="bg-purple-50"
      />

      {/* 2. Average Rating */}
      <MetricCard 
        title="Average Rating" 
        value={data.avgRating.toFixed(1)}
        subValue="Based on all platforms"
        icon={Star}
        colorClass="text-yellow-500"
        bgClass="bg-yellow-50"
      />

      {/* 3. New Reviews (30d) */}
      <MetricCard 
        title="New Reviews" 
        value={`+${data.newReviews}`}
        subValue="Last 30 days"
        icon={TrendingUp}
        colorClass="text-green-600"
        bgClass="bg-green-50"
        trend={data.newReviews > 0 ? 12 : 0} // You can calculate real trend % if data available
      />

      {/* 4. Engagement / Sentiment */}
      <MetricCard 
        title="Engagement Rate" 
        value={`${data.engagementRate}%`}
        subValue="Response rate"
        icon={Users}
        colorClass="text-blue-600"
        bgClass="bg-blue-50"
      />
    </div>
  );
};

export default KeyMetricsGrid;