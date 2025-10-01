import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { buildUrl } from '../../config/api';

const BusinessLogoUpload = ({ business, onLogoUpdated }) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(business?.logoUrl || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a valid image file (JPG, PNG, SVG, or WebP)', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadLogo(file);
  };

  const uploadLogo = async (file) => {
    if (!business?.id) {
      showToast('Please save the business first before uploading a logo', 'warning');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        buildUrl(`/api/v1/businesses/${business.id}/logo`),
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setPreview(response.data.logoUrl);
      showToast('Logo uploaded successfully!', 'success');
      
      if (onLogoUpdated) {
        onLogoUpdated(response.data);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      showToast(error.response?.data?.error || 'Failed to upload logo', 'error');
      setPreview(business?.logoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!business?.id) return;
    
    if (!window.confirm('Are you sure you want to delete this logo?')) {
      return;
    }

    try {
      await axios.delete(buildUrl(`/api/v1/businesses/${business.id}/logo`), {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPreview(null);
      showToast('Logo deleted successfully', 'success');
      
      if (onLogoUpdated) {
        onLogoUpdated({ ...business, logoUrl: null, logoFilename: null });
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      showToast('Failed to delete logo', 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Logo</h3>
      <p className="text-sm text-gray-600 mb-4">
        This logo will appear in all emails sent to your customers
      </p>

      {/* Preview */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 mb-4">
        {preview ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
              <img
                src={preview}
                alt="Logo preview"
                className="max-h-20 max-w-full object-contain"
              />
            </div>
            {business?.logoFilename && (
              <p className="text-xs text-gray-500">{business.logoFilename}</p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">No logo uploaded</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !business?.id}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : preview ? 'Change Logo' : 'Upload Logo'}
        </button>

        {preview && (
          <button
            onClick={handleDelete}
            disabled={uploading}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      {/* Guidelines */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800 font-medium mb-1">Logo Guidelines:</p>
        <ul className="text-xs text-blue-700 space-y-0.5">
          <li>• JPG, PNG, SVG, or WebP format</li>
          <li>• Maximum 5MB file size</li>
          <li>• Recommended: 200x50px or similar</li>
        </ul>
      </div>
    </div>
  );
};

export default BusinessLogoUpload;