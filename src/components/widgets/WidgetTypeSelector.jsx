// src/components/widgets/WidgetTypeSelector.jsx
// Widget type selection step in creation flow

import React from "react";

const WidgetTypeSelector = ({ onSelect }) => {
  const widgetTypes = [
    {
      id: "POPUP",
      name: "Social Proof Popup",
      description:
        "Real-time notifications showing recent reviews as visitors browse your site",
      icon: "💬",
      preview: "/widget-previews/popup.png",
      features: [
        "Auto-rotating reviews",
        "Customizable position",
        "Mobile responsive",
        "Session-based frequency control",
      ],
      bestFor: "Converting visitors on all pages",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      id: "BADGE",
      name: "Trust Badge",
      description:
        "Compact rating display showing your score and review count at a glance",
      icon: "⭐",
      preview: "/widget-previews/badge.png",
      features: [
        "Multiple sizes",
        "Rating + review count",
        "Badge display",
        "Minimal footprint",
      ],
      bestFor: "Headers, footers, and sidebars",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      id: "CAROUSEL",
      name: "Review Carousel",
      description:
        "Auto-scrolling showcase of your best reviews with smooth animations",
      icon: "🎠",
      preview: "/widget-previews/carousel.png",
      features: [
        "Auto-scroll option",
        "Navigation arrows",
        "Pagination dots",
        "Touch-friendly",
      ],
      bestFor: "Homepage sections and landing pages",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: "GRID",
      name: "Review Wall",
      description:
        "Full testimonial grid displaying multiple reviews in a masonry-style layout",
      icon: "📋",
      preview: "/widget-previews/grid.png",
      features: [
        "Configurable columns",
        "Filtering options",
        "Expandable reviews",
        "Infinite scroll ready",
      ],
      bestFor: "Dedicated testimonials page",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What type of widget do you want to create?
        </h3>
        <p className="text-gray-600">
          Choose the widget style that best fits your website and conversion goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {widgetTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`${type.bgColor} ${type.borderColor} border-2 rounded-2xl p-6 text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group relative overflow-hidden`}
          >
            {/* Background gradient on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{type.icon}</span>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {type.name}
                    </h4>
                    <p className="text-sm text-gray-500">{type.bestFor}</p>
                  </div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 text-sm">{type.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {type.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-white/80 rounded-full text-xs text-gray-600 border border-gray-200"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick comparison */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
          💡 Quick Comparison
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-purple-600 font-medium">Popup</span>
            <p className="text-gray-500 text-xs">Best conversion rate</p>
          </div>
          <div>
            <span className="text-yellow-600 font-medium">Badge</span>
            <p className="text-gray-500 text-xs">Smallest footprint</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Carousel</span>
            <p className="text-gray-500 text-xs">Most engaging</p>
          </div>
          <div>
            <span className="text-green-600 font-medium">Grid</span>
            <p className="text-gray-500 text-xs">Most comprehensive</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetTypeSelector;