import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewPlatformSetupPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchPlatformData();
    }
  }, [selectedBusiness]);

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

  // ADD TESTING FUNCTIONS
  const testGoogleReviews = () => {
    if (!platformData.googlePlaceId?.trim()) {
      alert('Please enter a Google Place ID first');
      return;
    }
    
    // Validate format
    const placeId = platformData.googlePlaceId.trim();
    if (!placeId.startsWith('ChIJ') || placeId.length < 20) {
      alert('Invalid Place ID format. Should start with "ChIJ" and be 20-30 characters long.');
      return;
    }
    
    const testUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
    console.log('Testing Google URL:', testUrl);
    
    const confirmTest = window.confirm(
      `This will open Google Reviews for your business. Continue?\n\nURL: ${testUrl}`
    );
    
    if (confirmTest) {
      window.open(testUrl, '_blank');
    }
  };

  const testFacebookReviews = () => {
    if (!platformData.facebookPageUrl?.trim()) {
      alert('Please enter a Facebook page URL first');
      return;
    }
    
    const baseUrl = platformData.facebookPageUrl.trim();
    const testUrl = `${baseUrl}/reviews`;
    console.log('Testing Facebook URL:', testUrl);
    
    const confirmTest = window.confirm(
      `This will open Facebook Reviews for your business. Continue?\n\nURL: ${testUrl}`
    );
    
    if (confirmTest) {
      window.open(testUrl, '_blank');
    }
  };

  const testYelpReviews = () => {
    if (!platformData.yelpPageUrl?.trim()) {
      alert('Please enter a Yelp page URL first');
      return;
    }
    
    const testUrl = platformData.yelpPageUrl.trim();
    console.log('Testing Yelp URL:', testUrl);
    
    const confirmTest = window.confirm(
      `This will open Yelp Reviews for your business. Continue?\n\nURL: ${testUrl}`
    );
    
    if (confirmTest) {
      window.open(testUrl, '_blank');
    }
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

  // IMPROVED SAVE FUNCTION WITH BETTER ERROR HANDLING
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
      
      // Try the PUT request first
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

  const selectedBusinessData = businesses.find(b => b.id.toString() === selectedBusiness);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
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
            
            {/* Google My Business */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-red-600 font-bold">G</span>
                </div>
                <h3 className="text-md font-semibold text-gray-900">Google My Business</h3>
                {getValidationIcon(validation.googleValid)}
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Place ID
              </label>
              <input
                type="text"
                name="googlePlaceId"
                value={platformData.googlePlaceId}
                onChange={handleInputChange}
                placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Find your Google Place ID at: <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Place ID Finder</a>
              </p>
              
              {/* TEST BUTTON FOR GOOGLE */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={testGoogleReviews}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  🧪 Test Google Reviews
                </button>
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
              
              {/* TEST BUTTON FOR FACEBOOK */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={testFacebookReviews}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  🧪 Test Facebook Reviews
                </button>
              </div>
              
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
              
              {/* TEST BUTTON FOR YELP */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={testYelpReviews}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  🧪 Test Yelp Reviews
                </button>
              </div>
              
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
                disabled={saving || (!platformData.googlePlaceId && !platformData.facebookPageUrl && !platformData.yelpPageUrl)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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

            {/* DEBUG INFO */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h4>
              <p className="text-xs text-gray-600">Selected Business: {selectedBusiness}</p>
              <p className="text-xs text-gray-600">Google Place ID: {platformData.googlePlaceId || 'Not set'}</p>
              <p className="text-xs text-gray-600">Facebook URL: {platformData.facebookPageUrl || 'Not set'}</p>
              <p className="text-xs text-gray-600">Button Disabled: {(saving || (!platformData.googlePlaceId && !platformData.facebookPageUrl && !platformData.yelpPageUrl)).toString()}</p>
            </div>
          </div>

          {/* Preview Section */}
          {selectedBusinessData && (selectedBusinessData.reviewPlatformsConfigured) && (
            <div className="bg-white rounded-lg shadow border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Preview</h2>
              <div className="bg-gray-50 p-4 rounded border">
                <div className="text-center">
                  <h3 className="font-medium mb-4">Thanks for working with {selectedBusinessData.name}!</h3>
                  <p className="mb-4">We'd love your feedback. You can leave a review on your preferred platform below:</p>
                  
                  <div className="space-y-2">
                    {platformData.googlePlaceId && (
                      <div>
                        <a href="#" className="inline-block bg-red-500 text-white px-4 py-2 rounded mr-2">
                          📍 Google Review
                        </a>
                      </div>
                    )}
                    {platformData.facebookPageUrl && (
                      <div>
                        <a href="#" className="inline-block bg-blue-600 text-white px-4 py-2 rounded mr-2">
                          👥 Facebook Review
                        </a>
                      </div>
                    )}
                    {platformData.yelpPageUrl && (
                      <div>
                        <a href="#" className="inline-block bg-red-600 text-white px-4 py-2 rounded mr-2">
                          ⭐ Yelp Review
                        </a>
                      </div>
                    )}
                    <div>
                      <a href="#" className="inline-block bg-purple-600 text-white px-4 py-2 rounded">
                        💬 Private Feedback
                      </a>
                    </div>
                  </div>
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