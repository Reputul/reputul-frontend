// src/components/widgets/WidgetCodeGenerator.jsx
// Generates and displays embed codes for widgets

import React, { useState } from "react";
import { toast } from "sonner";

const WidgetCodeGenerator = ({ widget }) => {
  const [activeTab, setActiveTab] = useState("html");

  const cdnBaseUrl = import.meta.env.VITE_WIDGET_CDN_URL || "https://cdn.reputul.com/widgets/v1";
  const widgetKey = widget?.widgetKey || "demo123";
  const widgetType = widget?.widgetType?.toLowerCase() || "badge";

  // Generate embed codes
  const embedCodes = {
    html: getHtmlCode(),
    script: getScriptOnlyCode(),
    wordpress: getWordPressCode(),
    react: getReactCode(),
  };

  function getHtmlCode() {
    switch (widgetType) {
      case "popup":
        return `<!-- Reputul Social Proof Popup -->
<script>
  window.reputulConfig = { key: '${widgetKey}' };
</script>
<script src="${cdnBaseUrl}/popup.js" async></script>`;

      case "badge":
        return `<!-- Reputul Trust Badge -->
<div id="reputul-badge" data-widget-key="${widgetKey}"></div>
<script src="${cdnBaseUrl}/badge.js" async></script>`;

      case "carousel":
        return `<!-- Reputul Review Carousel -->
<div id="reputul-carousel" data-widget-key="${widgetKey}"></div>
<script src="${cdnBaseUrl}/carousel.js" async></script>`;

      case "grid":
        return `<!-- Reputul Review Wall -->
<div id="reputul-reviews" data-widget-key="${widgetKey}"></div>
<script src="${cdnBaseUrl}/grid.js" async></script>`;

      default:
        return `<!-- Reputul Widget -->
<div id="reputul-widget" data-widget-key="${widgetKey}"></div>
<script src="${cdnBaseUrl}/widget.js" async></script>`;
    }
  }

  function getScriptOnlyCode() {
    return `<script src="${cdnBaseUrl}/${widgetType}.js?key=${widgetKey}" async></script>`;
  }

  function getWordPressCode() {
    return `[reputul_${widgetType} key="${widgetKey}"]`;
  }

  function getReactCode() {
    return `import { ReputulWidget } from '@reputul/react-widgets';

// In your component:
<ReputulWidget 
  type="${widgetType}" 
  widgetKey="${widgetKey}" 
/>`;
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error("Failed to copy. Please select and copy manually.");
    });
  };

  const tabs = [
    { id: "html", label: "HTML", icon: "🌐" },
    { id: "script", label: "Script Only", icon: "📜" },
    { id: "wordpress", label: "WordPress", icon: "📝" },
    { id: "react", label: "React", icon: "⚛️" },
  ];

  return (
    <div className="space-y-6">
      {/* Success message */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-900 mb-2">
          Widget Created Successfully! 🎉
        </h3>
        <p className="text-green-700">
          Your widget key is: <code className="bg-green-100 px-2 py-1 rounded font-mono">{widgetKey}</code>
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span>📋</span> Installation Instructions
        </h4>
        <ol className="text-sm text-blue-800 space-y-2">
          <li>1. Copy the embed code below</li>
          <li>2. Paste it into your website's HTML where you want the widget to appear</li>
          <li>3. Save and publish your changes</li>
          <li>4. The widget will automatically load and display your reviews</li>
        </ol>
      </div>

      {/* Code tabs */}
      <div>
        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code display */}
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm font-mono">
            <code>{embedCodes[activeTab]}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(embedCodes[activeTab], tabs.find(t => t.id === activeTab)?.label)}
            className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
        </div>
      </div>

      {/* Platform-specific tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>🌐</span> For any website
          </h5>
          <p className="text-sm text-gray-600">
            Use the HTML code. Paste it before the closing <code className="bg-gray-200 px-1 rounded">&lt;/body&gt;</code> tag,
            or in the specific location where you want the widget to appear.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>📝</span> For WordPress
          </h5>
          <p className="text-sm text-gray-600">
            Use the shortcode in any page, post, or widget area. Or install our WordPress plugin
            for easier management.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>🛍️</span> For Shopify/Wix/Squarespace
          </h5>
          <p className="text-sm text-gray-600">
            Use the HTML code in a custom HTML block or embed section. Each platform
            has different ways to add custom code.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>⚛️</span> For React/Next.js
          </h5>
          <p className="text-sm text-gray-600">
            Install our React package: <code className="bg-gray-200 px-1 rounded">npm install @reputul/react-widgets</code>
            and use the component.
          </p>
        </div>
      </div>

      {/* Support section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Need help?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Having trouble installing your widget? Our support team is here to help.
            </p>
            <div className="flex gap-3">
              <a
                href="https://docs.reputul.com/widgets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Documentation →
              </a>
              <a
                href="mailto:support@reputul.com"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetCodeGenerator;