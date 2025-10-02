import React from 'react';

const CircularProgress = ({ rating, size = 64 }) => {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const progress = (rating / 5) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          className="text-primary-500 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-primary-600">{rating}</span>
      </div>
    </div>
  );
};

export default CircularProgress;