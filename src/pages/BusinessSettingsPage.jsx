import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext'; // ADDED
import axios from 'axios';
import { toast } from 'sonner';
import { buildUrl } from '../config/api';

const BusinessSettingsPage = () => {
  const { token } = useAuth();
  const { selectedBusiness, refreshBusinesses } = useBusiness(); // ADDED - Use context
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    googlePlaceId: '',
  });

  // Update form when selectedBusiness changes
  useEffect(() => {
    if (selectedBusiness) {
      setFormData({
        name: selectedBusiness.name || '',
        industry: selectedBusiness.industry || '',
        phone: selectedBusiness.phone || '',
        website: selectedBusiness.website || '',
        address: selectedBusiness.address || '',
        city: selectedBusiness.city || '',
        state: selectedBusiness.state || '',
        zipCode: selectedBusiness.zipCode || '',
        googlePlaceId: selectedBusiness.googlePlaceId || '',
      });
    }
  }, [selectedBusiness]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!selectedBusiness) {
      toast.error('No business selected');
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}`),
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Business details updated successfully');
      refreshBusinesses(); // Refresh context
    } catch (error) {
      console.error('Error updating business:', error);
      toast.error('Failed to update business details');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      
      const formData = new FormData();
      formData.append('file', file); // Changed from 'logo' to 'file'

      await axios.post(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}/logo`), // Changed from business to selectedBusiness
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Logo uploaded successfully');
      refreshBusinesses(); // Changed from fetchBusiness() to refreshBusinesses()
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!selectedBusiness) {
      toast.error('No business selected');
      return;
    }

    const confirmed = window.confirm('Remove your business logo?');
    if (!confirmed) return;

    try {
      await axios.delete(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}/logo`),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Logo removed successfully');
      refreshBusinesses();
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Failed to remove logo');
    }
  };

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">No business selected</p>
          <p className="text-sm text-gray-500 mt-2">Please select a business from the dropdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your business profile and branding
          </p>
        </div>

        <div className="space-y-6">
          {/* Logo Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Logo</h2>
            
            <div className="flex items-start gap-6">
              {/* Logo Preview */}
              <div className="flex-shrink-0">
                {selectedBusiness?.logoUrl ? (
                  <div className="relative group">
                    <img
                      src={selectedBusiness.logoUrl}
                      alt="Business logo"
                      className="w-32 h-32 object-contain rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove logo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Instructions */}
              <div className="flex-1">
                <label className="block">
                  <span className="sr-only">Choose logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors ${
                      uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingLogo ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Logo
                      </>
                    )}
                  </label>
                </label>
                
                <p className="text-sm text-gray-600 mt-2">
                  Recommended: Square image, at least 200x200px
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPG, PNG, SVG • Max size: 5MB
                </p>
                
                {selectedBusiness?.logoUrl && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Logo uploaded and active
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC Home Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select industry</option>
                  <option value="ROOFING">Roofing</option>
                  <option value="HVAC">HVAC</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="LANDSCAPING">Landscaping</option>
                  <option value="GENERAL_CONTRACTOR">General Contractor</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Address</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Springfield"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="IL"
                  maxLength={2}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="62701"
                />
              </div>
            </div>
          </div>

          {/* Google Integration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Google Business Profile</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Place ID
              </label>
              <input
                type="text"
                name="googlePlaceId"
                value={formData.googlePlaceId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
              />
              <p className="text-xs text-gray-500 mt-1">
                Find your Place ID at{' '}
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Place ID Finder
                </a>
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                // Reset to current selectedBusiness values
                if (selectedBusiness) {
                  setFormData({
                    name: selectedBusiness.name || '',
                    industry: selectedBusiness.industry || '',
                    phone: selectedBusiness.phone || '',
                    website: selectedBusiness.website || '',
                    address: selectedBusiness.address || '',
                    city: selectedBusiness.city || '',
                    state: selectedBusiness.state || '',
                    zipCode: selectedBusiness.zipCode || '',
                    googlePlaceId: selectedBusiness.googlePlaceId || '',
                  });
                }
              }}
              disabled={saving}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettingsPage;