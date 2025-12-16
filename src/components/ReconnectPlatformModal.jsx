import React from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import PlatformIcon from './PlatformIcon';

/**
 * Modal dialog for reconnecting expired platform integrations
 * 
 * Displayed when a platform's access token has expired and cannot be
 * automatically refreshed. Guides users through reconnection process.
 */
const ReconnectPlatformModal = ({ 
  isOpen, 
  onClose, 
  platformType, 
  platformName,
  onReconnect,
  isReconnecting = false 
}) => {
  if (!isOpen) return null;

  const handleReconnect = () => {
    onReconnect();
  };

  const getPlatformDisplayName = () => {
    switch (platformType) {
      case 'GOOGLE_MY_BUSINESS':
        return 'Google';
      case 'FACEBOOK':
        return 'Facebook';
      default:
        return platformName || platformType;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <PlatformIcon platform={platformType} size="xl" />
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                <AlertCircle size={16} className="text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {getPlatformDisplayName()} Connection Expired
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-6">
            Your {getPlatformDisplayName()} connection needs to be renewed. 
            This happens periodically for security reasons. Click below to 
            reconnect and continue syncing your reviews.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isReconnecting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Reconnect {getPlatformDisplayName()}
                </>
              )}
            </button>
          </div>

          {/* Info text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            You'll be redirected to {getPlatformDisplayName()} to re-authorize access
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReconnectPlatformModal;