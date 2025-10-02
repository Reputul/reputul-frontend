import React from 'react';

const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  color = "primary",
  loading = false,
}) => {
  const colorClasses = {
    primary: "from-blue-500 to-blue-600",
    yellow: "from-yellow-500 to-yellow-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
  };

  const bgColorClasses = {
    primary: "bg-blue-50",
    yellow: "bg-yellow-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    red: "bg-red-50",
  };

  return (
    <div
      className={`${bgColorClasses[color]} rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold group-hover:scale-105 transition-transform text-gray-900">
                {value}
              </p>
              <p className="text-sm text-gray-500">{subtitle}</p>
              {trend && (
                <p
                  className={`text-xs font-medium mt-1 ${
                    trend.startsWith("+")
                      ? "text-green-600"
                      : trend.startsWith("-")
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {trend} from last period
                </p>
              )}
            </>
          )}
        </div>
        <div
          className={`p-3 bg-gradient-to-r ${colorClasses[color]} rounded-lg shadow-sm group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;