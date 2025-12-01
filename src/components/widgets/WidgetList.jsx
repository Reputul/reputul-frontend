// src/components/widgets/WidgetList.jsx
// Displays list of existing widgets with actions

import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { buildUrl } from "../../config/api";

const WidgetList = ({ widgets, onEdit, onDelete, onToggle }) => {
  const { token } = useAuth();
  const [expandedWidget, setExpandedWidget] = useState(null);
  const [embedCodes, setEmbedCodes] = useState({});
  const [loadingEmbedCode, setLoadingEmbedCode] = useState(null);

  const getWidgetTypeInfo = (type) => {
    const types = {
      POPUP: { icon: "💬", color: "purple", label: "Social Proof Popup" },
      BADGE: { icon: "⭐", color: "yellow", label: "Trust Badge" },
      CAROUSEL: { icon: "🎠", color: "blue", label: "Review Carousel" },
      GRID: { icon: "📋", color: "green", label: "Review Wall" },
    };
    return types[type] || { icon: "📦", color: "gray", label: type };
  };

  const getColorClasses = (color) => {
    const colors = {
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[color] || colors.gray;
  };

  const fetchEmbedCode = async (widgetId) => {
    if (embedCodes[widgetId]) {
      setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
      return;
    }

    setLoadingEmbedCode(widgetId);
    try {
      const response = await axios.get(
        buildUrl(`/api/v1/widgets/${widgetId}/embed-code`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmbedCodes({ ...embedCodes, [widgetId]: response.data });
      setExpandedWidget(widgetId);
    } catch (error) {
      console.error("Error fetching embed code:", error);
      toast.error("Failed to load embed code");
    } finally {
      setLoadingEmbedCode(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  return (
    <div className="space-y-4">
      {widgets.map((widget) => {
        const typeInfo = getWidgetTypeInfo(widget.widgetType);
        const isExpanded = expandedWidget === widget.id;
        const code = embedCodes[widget.id];

        return (
          <div
            key={widget.id}
            className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${
              widget.isActive ? "border-gray-100" : "border-gray-200 bg-gray-50"
            }`}
          >
            {/* Main row */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Widget info */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      widget.isActive ? "bg-gray-100" : "bg-gray-200"
                    }`}
                  >
                    {typeInfo.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${widget.isActive ? "text-gray-900" : "text-gray-500"}`}>
                        {widget.name || `${typeInfo.label}`}
                      </h3>
                      {!widget.isActive && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getColorClasses(typeInfo.color)}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {widget.businessName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {formatNumber(widget.totalImpressions)}
                    </p>
                    <p className="text-xs text-gray-500">Impressions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {formatNumber(widget.totalClicks)}
                    </p>
                    <p className="text-xs text-gray-500">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {widget.clickThroughRate?.toFixed(2) || "0.00"}%
                    </p>
                    <p className="text-xs text-gray-500">CTR</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchEmbedCode(widget.id)}
                    disabled={loadingEmbedCode === widget.id}
                    className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {loadingEmbedCode === widget.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    )}
                    Code
                  </button>
                  
                  <button
                    onClick={() => onToggle(widget.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      widget.isActive
                        ? "text-yellow-600 hover:bg-yellow-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {widget.isActive ? "Pause" : "Activate"}
                  </button>
                  
                  <button
                    onClick={() => onEdit(widget)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onDelete(widget.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded embed code section */}
            {isExpanded && code && (
              <div className="border-t border-gray-100 p-4 sm:p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Embed Code</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Widget Key:</span>
                    <code className="bg-white px-2 py-1 rounded border border-gray-200 font-mono text-xs">
                      {code.widgetKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(code.widgetKey)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                    <code>{code.htmlCode}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(code.htmlCode)}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {code.wordPressShortcode && (
                    <button
                      onClick={() => copyToClipboard(code.wordPressShortcode)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                    >
                      <span>📝</span> WordPress Shortcode
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(code.scriptOnlyCode)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                  >
                    <span>📜</span> Script Only
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WidgetList;