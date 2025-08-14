import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ReviewPlatformSetupPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const successRef = useRef(null);

  const [platformData, setPlatformData] = useState({
    googlePlaceId: '',
    facebookPageUrl: '',
    yelpPageUrl: ''
  });

  const [validation, setValidation] = useState({
    googleValid: null,
    facebookValid: null,
    yelpValid: null,
    googleReviewUrl: '',
    facebookReviewUrl: '',
    yelpReviewUrl: ''
  });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchPlatformData();
    }
  }, [selectedBusiness]);

  // Scroll to success notification when it appears
  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      successRef.current.focus();
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBusinesses(response.data);
      if (response.data.length === 1) {
        setSelectedBusiness(response.data[0].id.toString());
      }
    } catch (err) {
      setError('Failed to fetch businesses');
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/businesses/${selectedBusiness}/review-platforms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPlatformData({
        googlePlaceId: response.data.googlePlaceId || '',
        facebookPageUrl: response.data.facebookPageUrl || '',
        yelpPageUrl: response.data.yelpPageUrl || ''
      });
    } catch (err) {
      console.error('Error fetching platform data:', err);
      // If endpoint doesn't exist, just continue with empty data
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlatformData(prev => ({ ...prev, [name]: value }));
    // Clear validation when input changes
    setValidation(prev => ({ ...prev, [`${name.replace('PageUrl', '').replace('PlaceId', '')}Valid`]: null }));
  };

  const validatePlatforms = async () => {
    if (!selectedBusiness) return;

    setValidating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/businesses/${selectedBusiness}/review-platforms/validate`, platformData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setValidation(response.data);
    } catch (err) {
      setError('Failed to validate platform URLs');
      console.error('Error validating platforms:', err);
    } finally {
      setValidating(false);
    }
  };

  const savePlatforms = async () => {
    if (!selectedBusiness) {
      setError('Please select a business first');
      return;
    }

    console.log('Saving platform data:', platformData);
    console.log('Selected business:', selectedBusiness);

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_BASE}/api/businesses/${selectedBusiness}/review-platforms`, 
        platformData, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Save response:', response.data);
      setSuccess('✅ Review platforms updated successfully!');
      
      // Refresh businesses to update configuration status
      fetchBusinesses();
      
      // Trigger event for dashboard to refresh
      window.dispatchEvent(new CustomEvent('platformsUpdated'));
      
    } catch (err) {
      console.error('Error saving platforms:', err);
      
      if (err.response?.status === 404) {
        setError('API endpoint not found. The backend endpoint may not be implemented yet.');
      } else if (err.response?.status === 400) {
        setError(`Validation error: ${err.response?.data?.message || 'Invalid data'}`);
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(`Failed to save platform configuration: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const getValidationIcon = (isValid) => {
    if (isValid === null) return null;
    return isValid ? (
      <span className="text-green-600">✅</span>
    ) : (
      <span className="text-red-600">❌</span>
    );
  };

  // Helper function to generate fallback URL preview
  const generateFallbackUrl = (business) => {
    if (!business) return null;
    
    if (business.name && business.address) {
      const query = encodeURIComponent(`${business.name} ${business.address}`);
      return `https://www.google.com/maps/search/${query}`;
    } else if (business.name) {
      const query = encodeURIComponent(`${business.name} reviews`);
      return `https://www.google.com/search?q=${query}`;
    }
    return 'https://www.google.com/business/';
  };

  const selectedBusinessData = businesses.find(b => b.id.toString() === selectedBusiness);
  const fallbackUrl = generateFallbackUrl(selectedBusinessData);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Platform Setup</h1>
        <p className="text-gray-600">Configure where customers can leave reviews for your business</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div 
          ref={successRef}
          tabIndex={-1}
          className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {success}
        </div>
      )}

      {/* Business Selection */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Business</label>
        <select
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a business</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name} {business.reviewPlatformsConfigured && '✅'}
            </option>
          ))}
        </select>
      </div>

      {selectedBusiness && (
        <>
          {/* Platform Configuration */}
          <div className="bg-white rounded-lg shadow border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Configure Review Platforms</h2>
            
            {/* Google My Business - UPDATED with Google green color */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">G</span>
                </div>
                <h3 className="text-md font-semibold text-gray-900">Google Reviews</h3>
                {getValidationIcon(validation.googleValid)}
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Place ID (Optional - Recommended for best results)
              </label>
              <input
                type="text"
                name="googlePlaceId"
                value={platformData.googlePlaceId}
                onChange={handleInputChange}
                placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Show current fallback strategy */}
              {!platformData.googlePlaceId && selectedBusinessData && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-green-800 mb-1">
                        ✅ No Problem! Google Reviews Will Still Work
                      </h4>
                      <p className="text-sm text-green-700 mb-2">
                        Without a Place ID, we'll create a smart Google search using your business info:
                      </p>
                      <div className="bg-white p-2 rounded border text-xs font-mono text-gray-600 break-all">
                        {fallbackUrl}
                      </div>
                      <p className="text-sm text-green-700 mt-2">
                        This helps customers find your business and leave reviews. For even better results, add your Place ID below.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Help section */}
              <div className="mt-3">
                <details className="group">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 flex items-center">
                    <svg className="w-4 h-4 mr-1 transform group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    How to find my Google Place ID
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Place ID Finder</a></li>
                      <li>Search for your business name and location</li>
                      <li>Click on your business when it appears</li>
                      <li>Copy the Place ID that starts with "ChIJ"</li>
                    </ol>
                    <p className="mt-2 text-xs text-gray-600">
                      <strong>Don't have a Google listing?</strong> No worries! Your customers can still leave Google reviews using our smart fallback system.
                    </p>
                  </div>
                </details>
              </div>
              
              {validation.googleReviewUrl && (
                <div className="mt-2 p-2 bg-green-50 rounded">
                  <p className="text-sm text-green-800">Preview: <a href={validation.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="underline">Google Review Link</a></p>
                </div>
              )}
            </div>

            {/* Facebook */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">f</span>
                </div>
                <h3 className="text-md font-semibold text-gray-900">Facebook Page</h3>
                {getValidationIcon(validation.facebookValid)}
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Page URL
              </label>
              <input
                type="url"
                name="facebookPageUrl"
                value={platformData.facebookPageUrl}
                onChange={handleInputChange}
                placeholder="https://www.facebook.com/yourbusinesspage"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your Facebook business page URL
              </p>
              
              {validation.facebookReviewUrl && (
                <div className="mt-2 p-2 bg-green-50 rounded">
                  <p className="text-sm text-green-800">Preview: <a href={validation.facebookReviewUrl} target="_blank" rel="noopener noreferrer" className="underline">Facebook Review Link</a></p>
                </div>
              )}
            </div>

            {/* Yelp */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-red-600 font-bold">Y</span>
                </div>
                <h3 className="text-md font-semibold text-gray-900">Yelp (Optional)</h3>
                {getValidationIcon(validation.yelpValid)}
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yelp Business Page URL
              </label>
              <input
                type="url"
                name="yelpPageUrl"
                value={platformData.yelpPageUrl}
                onChange={handleInputChange}
                placeholder="https://www.yelp.com/biz/your-business-name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: Enter your Yelp business page URL
              </p>
              
              {validation.yelpReviewUrl && (
                <div className="mt-2 p-2 bg-green-50 rounded">
                  <p className="text-sm text-green-800">Preview: <a href={validation.yelpReviewUrl} target="_blank" rel="noopener noreferrer" className="underline">Yelp Review Link</a></p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={validatePlatforms}
                disabled={validating || (!platformData.googlePlaceId && !platformData.facebookPageUrl && !platformData.yelpPageUrl)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
              >
                {validating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Validating...
                  </>
                ) : (
                  <>
                    🔍 Validate URLs
                  </>
                )}
              </button>

              <button
                onClick={savePlatforms}
                disabled={saving}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    💾 Save Configuration
                  </>
                )}
              </button>
            </div>

            {/* Updated helpful info */}
            <div className="mt-4 p-4 bg-blue-50 border border-primary-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 How It Works:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Google Reviews:</strong> Works with or without Place ID (smart fallback included)</li>
                <li>• <strong>Facebook Reviews:</strong> Enter your page URL to enable Facebook review buttons</li>
                <li>• <strong>Yelp Reviews:</strong> Optional - add if you have a Yelp business page</li>
                <li>• <strong>Private Feedback:</strong> Always included for customers who prefer private feedback</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                You can save even without URLs - Google reviews will use smart search to help customers find your business!
              </p>
            </div>
          </div>

          {/* Preview Section - UPDATED with single column layout */}
          {selectedBusinessData && (
            <div className="bg-white rounded-lg shadow border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Preview</h2>
              <div className="bg-gray-50 p-4 rounded border">
                <div className="text-center">
                  <h3 className="font-medium mb-4">Thanks for working with {selectedBusinessData.name}!</h3>
                  <p className="mb-6">We'd love your feedback. You can leave a review on your preferred platform below:</p>
                  
                  <div className="space-y-3 max-w-xs mx-auto">
                    <a href="#" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-center block transition-colors w-full">
                      📍 Google Review
                    </a>
                    
                    {platformData.facebookPageUrl && (
                      <a href="#" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium text-center block transition-colors w-full">
                        👥 Facebook Review
                      </a>
                    )}
                    
                    {platformData.yelpPageUrl && (
                      <a href="#" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium text-center block transition-colors w-full">
                        ⭐ Yelp Review
                      </a>
                    )}
                    
                    <a href="#" className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium text-center block transition-colors w-full">
                      💬 Private Feedback
                    </a>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Choose the platform that works best for you
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewPlatformSetupPage;