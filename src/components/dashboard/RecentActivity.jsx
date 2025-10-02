import React from 'react';

const RecentActivity = ({ businesses, reviewsMap }) => {
  const allReviews = Object.values(reviewsMap)
    .flat()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const mockActivity = [
    {
      type: "review",
      user: "John D.",
      business: "Joe's Plumbing",
      rating: 5,
      time: "2 hours ago",
      comment: "Excellent service!",
    },
    {
      type: "response",
      user: "You",
      business: "Elite Auto Repair",
      time: "4 hours ago",
      action: "replied to review",
    },
    {
      type: "review",
      user: "Sarah M.",
      business: "Downtown Hair Salon",
      rating: 4,
      time: "1 day ago",
      comment: "Great experience",
    },
  ];

  const activityData =
    allReviews.length > 0
      ? allReviews.map((review) => {
          const business = businesses.find((b) => b.id === review.business?.id);
          return {
            type: "review",
            user: "Customer",
            business: business?.name || "Unknown Business",
            rating: review.rating,
            time: new Date(review.createdAt).toLocaleDateString(),
            comment: review.comment,
          };
        })
      : mockActivity;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-600">Latest updates from your businesses</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activityData.map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <div
                className={`p-2 rounded-lg ${
                  activity.type === "review" ? "bg-green-100" : "bg-primary-100"
                }`}
              >
                {activity.type === "review" ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.user}</span>
                  {activity.type === "review" ? (
                    <>
                      {" "}left a {activity.rating}-star review for{" "}
                      <span className="font-semibold">{activity.business}</span>
                      {activity.comment && (
                        <span className="block text-gray-600 italic mt-1">
                          "{activity.comment}"
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {" "}{activity.action} for{" "}
                      <span className="font-semibold">{activity.business}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
          View All Activity →
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;