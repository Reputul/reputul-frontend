/**
 * Reputul Social Proof Widget Loader
 * 
 * This is the main entry point for all Reputul widgets.
 * It loads widget data from the API and renders the appropriate widget type.
 * 
 * Usage:
 * <div id="reputul-badge" data-widget-key="abc123"></div>
 * <script src="https://cdn.reputul.com/widgets/v1/badge.js" async></script>
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiBaseUrl: 'https://api.reputul.com',
    cdnBaseUrl: 'https://cdn.reputul.com/widgets/v1',
    version: '1.0.0'
  };

  // Widget types and their container IDs
  const WIDGET_TYPES = {
    badge: 'reputul-badge',
    popup: 'reputul-popup',
    carousel: 'reputul-carousel',
    grid: 'reputul-reviews'
  };

  // Utility functions
  const Utils = {
    // Create element with attributes
    createElement(tag, attrs = {}, children = []) {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
          Object.assign(el.style, value);
        } else if (key === 'className') {
          el.className = value;
        } else if (key.startsWith('data-')) {
          el.setAttribute(key, value);
        } else {
          el[key] = value;
        }
      });
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else if (child) {
          el.appendChild(child);
        }
      });
      return el;
    },

    // Fetch widget data from API
    async fetchWidgetData(widgetKey) {
      try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/api/public/widgets/${widgetKey}/data`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Widget not found');
        }
        
        return await response.json();
      } catch (error) {
        console.error('[Reputul] Error fetching widget data:', error);
        return null;
      }
    },

    // Track impression
    trackImpression(widgetKey) {
      fetch(`${CONFIG.apiBaseUrl}/api/public/widgets/${widgetKey}/impression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: Date.now() })
      }).catch(() => {});
    },

    // Track click
    trackClick(widgetKey) {
      fetch(`${CONFIG.apiBaseUrl}/api/public/widgets/${widgetKey}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: Date.now() })
      }).catch(() => {});
    },

    // Format relative time
    formatRelativeTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? 's' : ''} ago`;
      return `${Math.floor(diffDays / 365)} year${diffDays >= 730 ? 's' : ''} ago`;
    },

    // Generate star rating HTML
    generateStars(rating, size = 16) {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.round(rating);
        stars.push(`<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="${filled ? '#FBBF24' : '#E5E7EB'}">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>`);
      }
      return stars.join('');
    },

    // Get initials from name
    getInitials(name) {
      if (!name) return 'C';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },

    // Inject CSS styles
    injectStyles(css) {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
  };

  // Base CSS styles
  const BASE_STYLES = `
    .reputul-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      box-sizing: border-box;
    }
    .reputul-widget * {
      box-sizing: border-box;
    }
    .reputul-widget-hidden {
      display: none !important;
    }
  `;

  // Widget renderers
  const Renderers = {
    // Badge Widget
    badge(container, data) {
      const { style, rating, formattedRating, totalReviews, badge, businessName } = data;
      const isDark = style.theme === 'dark';
      
      const html = `
        <div class="reputul-badge reputul-widget" style="
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: ${style.badgeSize === 'small' ? '8px 12px' : style.badgeSize === 'large' ? '16px 24px' : '12px 16px'};
          background: ${isDark ? '#1F2937' : '#FFFFFF'};
          border-radius: ${style.borderRadius}px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          color: ${isDark ? '#FFFFFF' : '#1F2937'};
        ">
          ${style.showRating ? `
            <div style="
              width: ${style.badgeSize === 'small' ? '36px' : style.badgeSize === 'large' ? '56px' : '48px'};
              height: ${style.badgeSize === 'small' ? '36px' : style.badgeSize === 'large' ? '56px' : '48px'};
              border-radius: 50%;
              background: ${style.primaryColor};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: ${style.badgeSize === 'small' ? '14px' : style.badgeSize === 'large' ? '20px' : '16px'};
            ">${formattedRating}</div>
          ` : ''}
          <div>
            ${style.showBusinessName && businessName ? `<div style="font-weight: 600; font-size: ${style.badgeSize === 'small' ? '12px' : '14px'};">${businessName}</div>` : ''}
            ${style.showRating ? `<div style="display: flex; gap: 2px;">${Utils.generateStars(rating, style.badgeSize === 'small' ? 12 : style.badgeSize === 'large' ? 20 : 16)}</div>` : ''}
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              ${style.showReviewCount ? `<span style="font-size: ${style.badgeSize === 'small' ? '11px' : '12px'}; color: ${isDark ? '#9CA3AF' : '#6B7280'};">${totalReviews} reviews</span>` : ''}
              ${style.showBadge && badge ? `<span style="
                padding: 2px 8px;
                font-size: 10px;
                font-weight: 600;
                border-radius: 9999px;
                background: linear-gradient(135deg, ${style.primaryColor}, ${style.accentColor});
                color: white;
              ">${badge}</span>` : ''}
            </div>
          </div>
          ${style.showReputulBranding ? `
            <div style="border-left: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; padding-left: 12px; margin-left: 4px;">
              <div style="font-size: 10px; color: ${isDark ? '#9CA3AF' : '#6B7280'}; text-align: center;">
                Verified by<br><strong style="color: ${style.primaryColor};">Reputul</strong>
              </div>
            </div>
          ` : ''}
        </div>
      `;
      
      container.innerHTML = html;
    },

    // Popup Widget
    popup(data) {
      const { style, reviews, rating, businessName, widgetKey } = data;
      if (!reviews || reviews.length === 0) return;

      const isDark = style.theme === 'dark';
      let currentIndex = 0;
      let popupCount = 0;
      const maxPopups = style.popupMaxPerSession || 5;

      // Check mobile
      const isMobile = window.innerWidth < 768;
      if (isMobile && !style.popupEnabledMobile) return;

      // Create popup container
      const popup = document.createElement('div');
      popup.className = 'reputul-popup reputul-widget';
      popup.style.cssText = `
        position: fixed;
        ${style.position?.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
        ${style.position?.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        z-index: 99999;
        opacity: 0;
        transform: translateY(${style.position?.includes('bottom') ? '20px' : '-20px'});
        transition: all 0.3s ease;
        max-width: 320px;
      `;

      document.body.appendChild(popup);

      function showReview(review) {
        if (popupCount >= maxPopups) return;

        const html = `
          <div style="
            background: ${isDark ? '#1F2937' : '#FFFFFF'};
            border-radius: ${style.borderRadius}px;
            padding: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid ${isDark ? '#374151' : '#E5E7EB'};
          ">
            <div style="display: flex; gap: 12px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: ${style.primaryColor};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
                flex-shrink: 0;
              ">${Utils.getInitials(review.reviewerName)}</div>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  ${style.showReviewerName ? `<span style="font-weight: 600; color: ${isDark ? '#FFFFFF' : '#1F2937'}; font-size: 14px;">${review.reviewerName}</span>` : ''}
                  ${style.showPlatformSource ? `<span style="font-size: 12px;">✓</span>` : ''}
                </div>
                ${style.showRating ? `<div style="display: flex; gap: 1px; margin-bottom: 8px;">${Utils.generateStars(review.rating, 14)}</div>` : ''}
                <p style="
                  margin: 0;
                  font-size: 13px;
                  color: ${isDark ? '#D1D5DB' : '#4B5563'};
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                ">${review.comment}</p>
                ${style.showReviewDate ? `<p style="margin: 8px 0 0; font-size: 11px; color: ${isDark ? '#9CA3AF' : '#6B7280'};">${review.relativeTime || Utils.formatRelativeTime(review.createdAt)}</p>` : ''}
              </div>
              <button onclick="this.closest('.reputul-popup').style.opacity='0'" style="
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                color: ${isDark ? '#9CA3AF' : '#6B7280'};
              ">✕</button>
            </div>
            ${style.showReputulBranding ? `<div style="text-align: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid ${isDark ? '#374151' : '#E5E7EB'}; font-size: 10px; color: ${isDark ? '#9CA3AF' : '#6B7280'};">Verified by <strong style="color: ${style.primaryColor};">Reputul</strong></div>` : ''}
          </div>
        `;

        popup.innerHTML = html;
        popup.style.opacity = '1';
        popup.style.transform = 'translateY(0)';
        
        Utils.trackImpression(widgetKey);
        popupCount++;

        // Hide after duration
        setTimeout(() => {
          popup.style.opacity = '0';
          popup.style.transform = `translateY(${style.position?.includes('bottom') ? '20px' : '-20px'})`;
        }, (style.popupDisplayDuration || 8) * 1000);
      }

      // Initial delay then show first review
      setTimeout(() => {
        showReview(reviews[currentIndex]);
        
        // Set up interval for subsequent reviews
        const interval = setInterval(() => {
          currentIndex = (currentIndex + 1) % reviews.length;
          if (popupCount < maxPopups) {
            showReview(reviews[currentIndex]);
          } else {
            clearInterval(interval);
          }
        }, (style.popupIntervalSeconds || 15) * 1000);
      }, (style.popupDelaySeconds || 3) * 1000);
    },

    // Carousel Widget
    carousel(container, data) {
      const { style, reviews, rating, totalReviews, badge, businessName, widgetKey } = data;
      if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6B7280;">No reviews yet</p>';
        return;
      }

      const isDark = style.theme === 'dark';
      let currentIndex = 0;

      const html = `
        <div class="reputul-carousel reputul-widget" style="
          background: ${isDark ? '#1F2937' : '#FFFFFF'};
          border-radius: ${style.borderRadius}px;
          padding: 24px;
          ${style.cardShadow ? 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);' : ''}
        ">
          ${style.showBusinessName ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <h3 style="margin: 0 0 8px; font-size: 20px; font-weight: bold; color: ${isDark ? '#FFFFFF' : '#1F2937'};">${businessName || 'Customer Reviews'}</h3>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                ${style.showRating ? `<div style="display: flex;">${Utils.generateStars(rating)}</div>` : ''}
                ${style.showReviewCount ? `<span style="color: ${isDark ? '#9CA3AF' : '#6B7280'};">(${totalReviews} reviews)</span>` : ''}
              </div>
            </div>
          ` : ''}
          
          <div class="reputul-carousel-track" style="position: relative; overflow: hidden;">
            <div class="reputul-carousel-slides" style="display: flex; transition: transform 0.3s ease;">
              ${reviews.map((review, index) => `
                <div class="reputul-carousel-slide" style="flex: 0 0 100%; padding: 0 8px;">
                  <div style="
                    background: ${isDark ? '#374151' : '#F9FAFB'};
                    border-radius: 12px;
                    padding: 20px;
                    ${style.cardShadow ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : ''}
                  ">
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                      <div style="
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        background: ${style.primaryColor};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        flex-shrink: 0;
                      ">${Utils.getInitials(review.reviewerName)}</div>
                      <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          ${style.showReviewerName ? `<span style="font-weight: 600; color: ${isDark ? '#FFFFFF' : '#1F2937'};">${review.reviewerName}</span>` : ''}
                          ${style.showPlatformSource ? `<span style="font-size: 12px;">✓</span>` : ''}
                        </div>
                        ${style.showRating ? `<div style="display: flex; gap: 2px; margin: 4px 0;">${Utils.generateStars(review.rating)}</div>` : ''}
                      </div>
                    </div>
                    <p style="margin: 16px 0 0; color: ${isDark ? '#D1D5DB' : '#4B5563'}; font-size: 14px; line-height: 1.6;">${review.comment}</p>
                    ${style.showReviewDate ? `<p style="margin: 12px 0 0; font-size: 12px; color: ${isDark ? '#9CA3AF' : '#6B7280'};">${review.relativeTime || Utils.formatRelativeTime(review.createdAt)}</p>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            
            ${style.showNavigationArrows ? `
              <button class="reputul-carousel-prev" style="
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: white;
                border: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
              ">←</button>
              <button class="reputul-carousel-next" style="
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: white;
                border: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
              ">→</button>
            ` : ''}
          </div>
          
          ${style.showPaginationDots ? `
            <div class="reputul-carousel-dots" style="display: flex; justify-content: center; gap: 8px; margin-top: 16px;">
              ${reviews.map((_, i) => `
                <button class="reputul-carousel-dot" data-index="${i}" style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  border: none;
                  cursor: pointer;
                  background: ${i === 0 ? style.primaryColor : isDark ? '#4B5563' : '#D1D5DB'};
                "></button>
              `).join('')}
            </div>
          ` : ''}
          
          ${style.showReputulBranding ? `
            <div style="text-align: center; margin-top: 16px; font-size: 11px; color: ${isDark ? '#9CA3AF' : '#6B7280'};">
              Powered by <strong style="color: ${style.primaryColor};">Reputul</strong>
            </div>
          ` : ''}
        </div>
      `;

      container.innerHTML = html;

      // Add interactivity
      const slides = container.querySelector('.reputul-carousel-slides');
      const dots = container.querySelectorAll('.reputul-carousel-dot');
      const prevBtn = container.querySelector('.reputul-carousel-prev');
      const nextBtn = container.querySelector('.reputul-carousel-next');

      function goToSlide(index) {
        currentIndex = index;
        slides.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => {
          dot.style.background = i === index ? style.primaryColor : (isDark ? '#4B5563' : '#D1D5DB');
        });
      }

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => goToSlide(i));
      });

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          goToSlide(currentIndex === 0 ? reviews.length - 1 : currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          goToSlide(currentIndex === reviews.length - 1 ? 0 : currentIndex + 1);
        });
      }

      // Auto-scroll
      if (style.autoScroll) {
        setInterval(() => {
          goToSlide(currentIndex === reviews.length - 1 ? 0 : currentIndex + 1);
        }, (style.scrollSpeed || 5) * 1000);
      }

      Utils.trackImpression(widgetKey);
    },

    // Grid Widget
    grid(container, data) {
      const { style, reviews, rating, totalReviews, badge, businessName, widgetKey } = data;
      const isDark = style.theme === 'dark';
      const columns = style.columns || 3;

      const html = `
        <div class="reputul-grid reputul-widget" style="
          background: ${isDark ? '#1F2937' : '#FFFFFF'};
          border-radius: ${style.borderRadius}px;
          padding: 32px;
        ">
          ${style.showBusinessName ? `
            <div style="text-align: center; margin-bottom: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 28px; font-weight: bold; color: ${isDark ? '#FFFFFF' : '#1F2937'};">Customer Reviews</h2>
              <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                ${style.showRating ? `<div style="display: flex;">${Utils.generateStars(rating, 24)}</div>` : ''}
                ${style.showBadge && badge ? `<span style="
                  padding: 4px 12px;
                  font-size: 12px;
                  font-weight: 600;
                  border-radius: 9999px;
                  background: linear-gradient(135deg, ${style.primaryColor}, ${style.accentColor});
                  color: white;
                ">${badge}</span>` : ''}
              </div>
              ${style.showReviewCount ? `<p style="margin: 8px 0 0; color: ${isDark ? '#9CA3AF' : '#6B7280'};">Based on ${totalReviews} reviews</p>` : ''}
            </div>
          ` : ''}
          
          <div style="
            display: grid;
            grid-template-columns: repeat(${columns}, 1fr);
            gap: 20px;
          ">
            ${reviews.map(review => `
              <div style="
                background: ${isDark ? '#374151' : '#F9FAFB'};
                border-radius: 12px;
                padding: 20px;
                ${style.cardShadow ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : ''}
              ">
                <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
                  <div style="
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: ${style.primaryColor};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                  ">${Utils.getInitials(review.reviewerName)}</div>
                  <div style="flex: 1;">
                    ${style.showReviewerName ? `<p style="margin: 0; font-weight: 600; color: ${isDark ? '#FFFFFF' : '#1F2937'};">${review.reviewerName}</p>` : ''}
                    ${style.showRating ? `<div style="display: flex; gap: 2px;">${Utils.generateStars(review.rating, 14)}</div>` : ''}
                  </div>
                  ${style.showPlatformSource ? `<span style="font-size: 14px;">✓</span>` : ''}
                </div>
                <p style="margin: 0; color: ${isDark ? '#D1D5DB' : '#4B5563'}; font-size: 14px; line-height: 1.6;">${review.comment}</p>
                ${style.showReviewDate ? `<p style="margin: 12px 0 0; font-size: 12px; color: ${isDark ? '#9CA3AF' : '#6B7280'};">${review.relativeTime || Utils.formatRelativeTime(review.createdAt)}</p>` : ''}
              </div>
            `).join('')}
          </div>
          
          ${style.showReputulBranding ? `
            <div style="text-align: center; margin-top: 24px; font-size: 12px; color: ${isDark ? '#9CA3AF' : '#6B7280'};">
              Powered by <strong style="color: ${style.primaryColor};">Reputul</strong>
            </div>
          ` : ''}
        </div>
      `;

      container.innerHTML = html;
      Utils.trackImpression(widgetKey);
    }
  };

  // Initialize widget
  async function initWidget(type) {
    // Inject base styles
    Utils.injectStyles(BASE_STYLES);

    // Find container or config
    let widgetKey;
    let container;

    if (type === 'popup') {
      // Popup uses window config
      const config = window.reputulConfig || {};
      widgetKey = config.key;
    } else {
      // Other widgets use data attributes
      container = document.getElementById(WIDGET_TYPES[type]) || 
                  document.querySelector(`[data-widget-key]`);
      widgetKey = container?.getAttribute('data-widget-key');
    }

    if (!widgetKey) {
      console.error('[Reputul] Widget key not found');
      return;
    }

    // Fetch data
    const data = await Utils.fetchWidgetData(widgetKey);
    if (!data || data.error) {
      console.error('[Reputul] Failed to load widget data');
      return;
    }

    // Render
    if (type === 'popup') {
      Renderers.popup(data);
    } else if (container && Renderers[type]) {
      Renderers[type](container, data);
    }
  }

  // Expose to window for individual widget scripts
  window.ReputulWidget = {
    init: initWidget,
    Utils,
    Renderers
  };

  // Auto-detect and init if script has type attribute
  const currentScript = document.currentScript;
  if (currentScript) {
    const scriptSrc = currentScript.src;
    const type = Object.keys(WIDGET_TYPES).find(t => scriptSrc.includes(`${t}.js`));
    if (type) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initWidget(type));
      } else {
        initWidget(type);
      }
    }
  }
})();