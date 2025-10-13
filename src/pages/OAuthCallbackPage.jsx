import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { buildUrl } from '../config/api';

/**
 * OAuth Callback Handler for Multiple Platforms
 * Supports: Google My Business, Facebook, Yelp
 * 
 * Flow:
 * 1. Detect platform from URL path
 * 2. Extract code & state from query params
 * 3. Send to backend for token exchange
 * 4. Redirect back to review platforms page
 */
const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [platformName, setPlatformName] = useState('Platform');

  useEffect(() => {
    const handleCallback = async () => {
      // Extract OAuth response parameters
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Detect platform from URL path
      const path = window.location.pathname;
      let platform = 'google'; // default
      let displayName = 'Google My Business';

      if (path.includes('facebook')) {
        platform = 'facebook';
        displayName = 'Facebook';
      } else if (path.includes('yelp')) {
        platform = 'yelp';
        displayName = 'Yelp';
      }

      setPlatformName(displayName);

      console.log(`${displayName} OAuth Callback received:`, { 
        code: code ? 'present' : 'missing', 
        state, 
        error 
      });

      // Handle OAuth errors
      if (error) {
        setStatus('error');
        const errorMsg = errorDescription || error;
        setMessage(`${displayName} connection failed: ${errorMsg}`);
        
        console.error(`${displayName} OAuth error:`, error, errorDescription);
        
        // Redirect back after showing error
        setTimeout(() => navigate('/review-platforms'), 4000);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        setStatus('error');
        setMessage(`Invalid ${displayName} callback - missing required parameters`);
        setTimeout(() => navigate('/review-platforms'), 3000);
        return;
      }

      try {
        setMessage(`Connecting to ${displayName}...`);
        console.log(`Sending ${platform} code to backend...`);
        
        // Send to platform-specific callback endpoint
        const response = await axios.post(
          buildUrl(`/api/v1/platforms/callback/${platform}`),
          { code, state },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log(`${displayName} backend response:`, response.data);

        if (response.data.success) {
          setStatus('success');
          setMessage(`${displayName} connected successfully! Redirecting...`);
          
          // Redirect to review platforms page
          setTimeout(() => {
            navigate('/review-platforms', { 
              state: { 
                success: `${displayName} connected successfully`,
                platform: platform 
              } 
            });
          }, 2000);
        } else {
          throw new Error(response.data.error || 'Connection failed');
        }
        
      } catch (err) {
        console.error(`${displayName} OAuth callback error:`, err);
        
        setStatus('error');
        
        // Extract meaningful error message
        let errorMessage = 'Failed to connect platform';
        
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setMessage(`${displayName} connection failed: ${errorMessage}`);
        
        // Redirect back after showing error
        setTimeout(() => navigate('/review-platforms'), 4000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, token]); // Added proper dependencies

  // Platform-specific icons/colors
  const platformConfig = {
    google: {
      icon: '🔍',
      color: 'blue',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    facebook: {
      icon: '📘',
      color: 'indigo',
      bgGradient: 'from-indigo-50 to-blue-50'
    },
    yelp: {
      icon: '⭐',
      color: 'red',
      bgGradient: 'from-red-50 to-orange-50'
    }
  };

  const currentPlatform = platformName.toLowerCase().includes('facebook') ? 'facebook' 
    : platformName.toLowerCase().includes('yelp') ? 'yelp' 
    : 'google';
  
  const config = platformConfig[currentPlatform];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-6`}>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        
        {/* Processing State */}
        {status === 'processing' && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={`animate-spin rounded-full h-16 w-16 border-b-4 border-${config.color}-600`}></div>
            </div>
            <div className="text-4xl mb-4">{config.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting {platformName}...
            </h2>
            <p className="text-gray-600">
              {message || 'Please wait while we complete the connection'}
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className={`text-xl font-semibold text-${config.color}-900 mb-2`}>
              Connected Successfully!
            </h2>
            <p className="text-gray-600 mb-2">{message}</p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <p className="text-sm text-gray-500">Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            
            {/* Error details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                <strong>What to try:</strong>
              </p>
              <ul className="text-sm text-red-600 text-left mt-2 space-y-1">
                <li>• Ensure you granted all required permissions</li>
                <li>• Check that your {platformName} account is active</li>
                <li>• Try connecting again from the platforms page</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <p className="text-sm text-gray-500">Redirecting back...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;