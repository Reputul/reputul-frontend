// src/components/widgets/WidgetCustomizer.jsx
// Widget configuration/customization panel

import React from "react";

const WidgetCustomizer = ({ widgetType, config, onChange }) => {
  const updateConfig = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  // Color presets
  const colorPresets = [
    { name: "Blue", primary: "#3B82F6", accent: "#10B981" },
    { name: "Purple", primary: "#8B5CF6", accent: "#EC4899" },
    { name: "Green", primary: "#10B981", accent: "#3B82F6" },
    { name: "Orange", primary: "#F97316", accent: "#EAB308" },
    { name: "Red", primary: "#EF4444", accent: "#F97316" },
    { name: "Dark", primary: "#1F2937", accent: "#4B5563" },
  ];

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 text-lg">Widget Settings</h3>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Widget Name (optional)
        </label>
        <input
          type="text"
          value={config.name || ""}
          onChange={(e) => updateConfig("name", e.target.value)}
          placeholder="e.g., Homepage Badge"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme
        </label>
        <div className="flex gap-3">
          {["light", "dark", "auto"].map((theme) => (
            <button
              key={theme}
              onClick={() => updateConfig("theme", theme)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                config.theme === theme
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {theme === "light" && (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
                {theme === "dark" && (
                  <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
                {theme === "auto" && (
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                <span className="capitalize text-sm font-medium">{theme}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Scheme
        </label>
        <div className="grid grid-cols-6 gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                updateConfig("primaryColor", preset.primary);
                updateConfig("accentColor", preset.accent);
              }}
              className={`aspect-square rounded-lg border-2 transition-all duration-200 ${
                config.primaryColor === preset.primary
                  ? "border-blue-500 scale-110"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})` }}
              title={preset.name}
            />
          ))}
        </div>
        
        {/* Custom colors */}
        <div className="mt-3 flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Primary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => updateConfig("primaryColor", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => updateConfig("primaryColor", e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Accent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => updateConfig("accentColor", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.accentColor}
                onChange={(e) => updateConfig("accentColor", e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Content Display</h4>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show Rating</span>
            <input
              type="checkbox"
              checked={config.showRating}
              onChange={(e) => updateConfig("showRating", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show Review Count</span>
            <input
              type="checkbox"
              checked={config.showReviewCount}
              onChange={(e) => updateConfig("showReviewCount", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show Badge</span>
            <input
              type="checkbox"
              checked={config.showBadge}
              onChange={(e) => updateConfig("showBadge", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show Business Name</span>
            <input
              type="checkbox"
              checked={config.showBusinessName}
              onChange={(e) => updateConfig("showBusinessName", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show Reviewer Name</span>
            <input
              type="checkbox"
              checked={config.showReviewerName}
              onChange={(e) => updateConfig("showReviewerName", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show Review Date</span>
            <input
              type="checkbox"
              checked={config.showReviewDate}
              onChange={(e) => updateConfig("showReviewDate", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show Platform Icon</span>
            <input
              type="checkbox"
              checked={config.showPlatformSource}
              onChange={(e) => updateConfig("showPlatformSource", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show "Powered by Reputul"</span>
            <input
              type="checkbox"
              checked={config.showReputulBranding}
              onChange={(e) => updateConfig("showReputulBranding", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Review Filtering */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Review Filtering</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Minimum Rating: {config.minRating}★
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={config.minRating}
              onChange={(e) => updateConfig("minRating", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1★</span>
              <span>5★</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Max Reviews: {config.maxReviews}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={config.maxReviews}
              onChange={(e) => updateConfig("maxReviews", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Type-specific settings */}
      {widgetType === "POPUP" && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Popup Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Position</label>
              <select
                value={config.position}
                onChange={(e) => updateConfig("position", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Initial Delay: {config.popupDelaySeconds}s
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={config.popupDelaySeconds}
                onChange={(e) => updateConfig("popupDelaySeconds", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Display Duration: {config.popupDisplayDuration}s
              </label>
              <input
                type="range"
                min="3"
                max="20"
                value={config.popupDisplayDuration}
                onChange={(e) => updateConfig("popupDisplayDuration", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">Animation</label>
              <select
                value={config.popupAnimation}
                onChange={(e) => updateConfig("popupAnimation", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="slide">Slide</option>
                <option value="fade">Fade</option>
                <option value="bounce">Bounce</option>
                <option value="none">None</option>
              </select>
            </div>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Show on Mobile</span>
              <input
                type="checkbox"
                checked={config.popupEnabledMobile}
                onChange={(e) => updateConfig("popupEnabledMobile", e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      )}

      {widgetType === "BADGE" && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Badge Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {["standard", "compact", "minimal", "full"].map((style) => (
                  <button
                    key={style}
                    onClick={() => updateConfig("badgeStyle", style)}
                    className={`px-3 py-2 rounded-lg border-2 capitalize text-sm ${
                      config.badgeStyle === style
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">Size</label>
              <div className="grid grid-cols-3 gap-2">
                {["small", "medium", "large"].map((size) => (
                  <button
                    key={size}
                    onClick={() => updateConfig("badgeSize", size)}
                    className={`px-3 py-2 rounded-lg border-2 capitalize text-sm ${
                      config.badgeSize === size
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(widgetType === "CAROUSEL" || widgetType === "GRID") && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">
            {widgetType === "CAROUSEL" ? "Carousel" : "Grid"} Settings
          </h4>
          
          <div className="space-y-4">
            {widgetType === "GRID" && (
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Columns: {config.columns}
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={config.columns}
                  onChange={(e) => updateConfig("columns", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
            
            {widgetType === "CAROUSEL" && (
              <>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Auto-scroll</span>
                  <input
                    type="checkbox"
                    checked={config.autoScroll}
                    onChange={(e) => updateConfig("autoScroll", e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                
                {config.autoScroll && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Scroll Speed: {config.scrollSpeed}s
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      value={config.scrollSpeed}
                      onChange={(e) => updateConfig("scrollSpeed", parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Show Navigation Arrows</span>
                  <input
                    type="checkbox"
                    checked={config.showNavigationArrows}
                    onChange={(e) => updateConfig("showNavigationArrows", e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Show Pagination Dots</span>
                  <input
                    type="checkbox"
                    checked={config.showPaginationDots}
                    onChange={(e) => updateConfig("showPaginationDots", e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </>
            )}
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Card Shadow</span>
              <input
                type="checkbox"
                checked={config.cardShadow}
                onChange={(e) => updateConfig("cardShadow", e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetCustomizer;