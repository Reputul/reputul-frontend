import React, { useState, useRef } from 'react';
import { X, Download, Loader2, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import PlatformIcon from './PlatformIcon';

/**
 * Social Share Modal - Generate beautiful images from reviews
 * Allows users to create social media graphics with customization
 */
const SocialShareModal = ({ review, isOpen, onClose, businessName }) => {
  const previewRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('gradient');
  const [selectedSize, setSelectedSize] = useState('instagram-square');
  const [showLogo, setShowLogo] = useState(true);
  const [showReviewer, setShowReviewer] = useState(true);
  const [showBadge, setShowBadge] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#7c3aed');
  const [fontSize, setFontSize] = useState(20);

  if (!isOpen || !review) return null;

  // Template configurations
  const templates = {
    gradient: {
      name: 'Modern Gradient',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: 'white',
    },
    minimal: {
      name: 'Professional Minimal',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      textColor: '#1a202c',
    },
    brand: {
      name: 'Bold Brand',
      background: backgroundColor,
      textColor: 'white',
    },
  };

  // Size configurations
  const sizes = {
    'instagram-square': { width: 1080, height: 1080, label: 'Instagram Post' },
    'instagram-story': { width: 1080, height: 1920, label: 'Instagram Story' },
    'facebook': { width: 1200, height: 630, label: 'Facebook/LinkedIn' },
  };

  const currentSize = sizes[selectedSize];
  const currentTemplate = templates[selectedTemplate];

  // Download image
  const handleDownload = async () => {
    if (!previewRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        width: currentSize.width,
        height: currentSize.height,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `review-${review.id}-${selectedSize}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download all sizes
  const handleDownloadAll = async () => {
    setIsGenerating(true);
    
    for (const [sizeKey, size] of Object.entries(sizes)) {
      try {
        // Temporarily change size
        const originalSize = selectedSize;
        setSelectedSize(sizeKey);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const dataUrl = await toPng(previewRef.current, {
          width: size.width,
          height: size.height,
          pixelRatio: 2,
        });

        const link = document.createElement('a');
        link.download = `review-${review.id}-${sizeKey}.png`;
        link.href = dataUrl;
        link.click();
        
        // Restore original size
        setSelectedSize(originalSize);
        
        // Wait between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed to generate ${sizeKey}:`, err);
      }
    }
    
    setIsGenerating(false);
  };

  // Color presets
  const colorPresets = [
    '#7c3aed', // Purple
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#1f2937', // Dark Gray
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Share Review</h2>
            <p className="text-sm text-gray-500 mt-1">Create a beautiful image for social media</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Customization Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Template Style
                </label>
                <div className="space-y-2">
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTemplate(key)}
                      className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                        selectedTemplate === key
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{template.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Platform Size
                </label>
                <div className="space-y-2">
                  {Object.entries(sizes).map(([key, size]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedSize(key)}
                      className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                        selectedSize === key
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{size.label}</div>
                      <div className="text-xs text-gray-500">{size.width} × {size.height}px</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color (for Brand template) */}
              {selectedTemplate === 'brand' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Background Color
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        onClick={() => setBackgroundColor(color)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          backgroundColor === color
                            ? 'border-gray-900 scale-110'
                            : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Font Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Type className="w-4 h-4 inline mr-2" />
                  Text Size
                </label>
                <input
                  type="range"
                  min="18"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {fontSize === 18 ? 'Small' : fontSize === 21 ? 'Medium' : 'Large'}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show business name</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showReviewer}
                    onChange={(e) => setShowReviewer(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show reviewer name</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showBadge}
                    onChange={(e) => setShowBadge(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show "Recommended" badge</span>
                </label>
              </div>
            </div>

            {/* Right - Live Preview */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Live Preview
              </label>
              <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center" style={{ minHeight: '600px' }}>
                <div
                  ref={previewRef}
                  style={{
                    width: `${currentSize.width}px`,
                    height: `${currentSize.height}px`,
                    background: currentTemplate.background,
                    transform: selectedSize === 'instagram-story' ? 'scale(0.5)' : 'scale(0.8)',
                    transformOrigin: 'center',
                    display: 'grid',
                    placeItems: 'center',
                    padding: '80px',
                    boxSizing: 'border-box',
                  }}
                  className="relative overflow-hidden rounded-2xl shadow-2xl"
                >
                  {/* Content Wrapper */}
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    {/* Business Name */}
                    {showLogo && (
                      <div
                        style={{ 
                          color: currentTemplate.textColor,
                          fontSize: '48px',
                          lineHeight: '1.2',
                          fontWeight: 'bold',
                          marginBottom: '48px',
                        }}
                      >
                        {businessName}
                      </div>
                    )}

                    {/* Stars */}
                    <div style={{ marginBottom: '48px' }}>
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          width="60"
                          height="60"
                          viewBox="0 0 24 24"
                          fill={i < review.rating ? '#fbbf24' : '#d1d5db'}
                          style={{ display: 'inline-block', margin: '0 4px' }}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>

                    {/* Review Text */}
                    <div
                      style={{
                        color: currentTemplate.textColor,
                        fontSize: `${Math.min(fontSize * 2.2, 48)}px`,
                        lineHeight: '1.6',
                        fontWeight: '500',
                        marginBottom: '48px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        maxWidth: '900px',
                        textShadow: currentTemplate.textColor === 'white' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      "{review.comment}"
                    </div>

                    {/* Reviewer Info */}
                    {showReviewer && (
                      <div
                        style={{ 
                          color: currentTemplate.textColor,
                          fontSize: '36px',
                          fontWeight: 'bold',
                        }}
                      >
                        - {review.customerName}
                      </div>
                    )}

                    {/* Badge */}
                    {showBadge && review.rating >= 4 && (review.source === 'GOOGLE' || review.source === 'GOOGLE_MY_BUSINESS' || review.source === 'FACEBOOK') && (
                      <div 
                        style={{
                          marginTop: '48px',
                          display: 'inline-block',
                          padding: '16px 32px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          border: '4px solid rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <div style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '16px', transform: 'scale(1.5)' }}>
                          <PlatformIcon platform={review.source} size="md" />
                        </div>
                        <span
                          style={{ 
                            color: currentTemplate.textColor,
                            fontSize: '32px',
                            fontWeight: 'bold',
                            verticalAlign: 'middle',
                          }}
                        >
                          Recommended
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download {currentSize.label}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadAll}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download All Sizes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;