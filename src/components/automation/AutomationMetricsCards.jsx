import React from 'react';

const AutomationMetricsCards = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Review Requests Sent',
      value: metrics.requestsSent,
      trend: '+12%',
      trendUp: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Response Rate',
      value: `${metrics.responseRate}%`,
      trend: '+5%',
      trendUp: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'Reviews Generated',
      value: metrics.reviewsGenerated,
      trend: '+18%',
      trendUp: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'yellow'
    },
    {
      title: 'Avg Response Time',
      value: metrics.avgResponseTime,
      trend: '-15%',
      trendUp: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-100',
      green: 'from-green-500 to-green-600 text-green-100',
      yellow: 'from-yellow-500 to-yellow-600 text-yellow-100',
      purple: 'from-purple-500 to-purple-600 text-purple-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((card, index) => (
        <div 
          key={index}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(card.color)}`}>
              {card.icon}
            </div>
            <div className={`text-sm font-semibold px-2 py-1 rounded-lg ${
              card.trendUp 
                ? 'text-green-400 bg-green-400/20' 
                : 'text-red-400 bg-red-400/20'
            }`}>
              {card.trend}
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-blue-200 text-sm">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AutomationMetricsCards;