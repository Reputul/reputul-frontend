import React from 'react';

const PeriodSelector = ({ metricsPeriod, setMetricsPeriod }) => {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <span className="text-sm font-medium text-gray-700">Time Period:</span>
      <select
        value={metricsPeriod}
        onChange={(e) => setMetricsPeriod(parseInt(e.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value={7}>Last 7 days</option>
        <option value={30}>Last 30 days</option>
        <option value={90}>Last 90 days</option>
      </select>
    </div>
  );
};

export default PeriodSelector;